import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRules, readProjectId, buildPlan, migrate } from './update-invitation-flags.mjs';

const database = 'projects/demo-wedding/databases/(default)';
const rules = { sans_repas: ['UVWXYZ'], sans_couchage: ['GHIJKL'] };
const doc = (code, count = 2, flags = {}) => ({
  name: `${database}/documents/codes_invitation/${code}`,
  updateTime: '2026-10-05T10:00:00.000000Z',
  fields: { membres: { arrayValue: { values: Array.from({ length: count }, (_, i) => ({ stringValue: `Exemple ${i}` })) } }, ...flags },
});

test('repas et couchage sont calculés par groupe, sans repas implique sans couchage', () => {
  const plan = buildPlan(rules, [doc('ABCDEF', 3), doc('GHIJKL', 4), doc('UVWXYZ', 2)], database);
  assert.deepEqual(plan.totals, { membres: 9, repas: 7, couchage: 3 });
  assert.equal(plan.rows[2].couchage, false);
  assert.deepEqual(plan.writes[0].updateMask.fieldPaths, ['participation_repas', 'couchage_sur_place']);
  assert.deepEqual(Object.keys(plan.writes[0].update.fields), ['participation_repas', 'couchage_sur_place']);
  assert.deepEqual(plan.writes[0].currentDocument, { updateTime: '2026-10-05T10:00:00.000000Z' });
});

test('configuration ambiguë, code inconnu ou invitation vide bloquent les écritures', () => {
  assert.throws(() => validateRules({ sans_repas: ['UVWXYZ', 'UVWXYZ'], sans_couchage: [] }), /Doublon/);
  assert.throws(() => validateRules({ sans_repas: ['abc'], sans_couchage: [] }), /six caractères/);
  assert.throws(() => validateRules({ ...rules, faute: [] }), /uniquement/);
  assert.throws(() => buildPlan(rules, [doc('ABCDEF')], database), /absent/);
  assert.throws(() => buildPlan({ sans_repas: [], sans_couchage: [] }, [doc('ABCDEF', 0)], database), /invalide/);
});

test('seul le project id est extrait, sans évaluer le contenu de .env.local', () => {
  assert.equal(readProjectId('AUTRE=secret\nNEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-wedding" # exemple'), 'demo-wedding');
  assert.throws(() => readProjectId('NEXT_PUBLIC_FIREBASE_PROJECT_ID=$(commande)'), /invalide/);
  assert.throws(() => readProjectId('NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-wedding\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=autre-projet'), /unique/);
});

test('pagination en lecture, aperçu sans POST et commit unique avec --apply', async () => {
  for (const apply of [false, true]) {
    const calls = [];
    const request = async (url, options = {}) => {
      calls.push({ url: String(url), options });
      if (options.method === 'POST') return {};
      return String(url).includes('pageToken=suivant')
        ? { documents: [doc('GHIJKL'), doc('UVWXYZ')] }
        : { documents: [doc('ABCDEF')], nextPageToken: 'suivant' };
    };
    await migrate({ rules, database, request, apply });
    assert.equal(calls.filter(call => call.options.method === 'POST').length, apply ? 1 : 0);
    assert.ok(calls[0].url.includes('mask.fieldPaths=membres'));
    if (apply) assert.equal(JSON.parse(calls[2].options.body).writes.length, 3);
  }
});

test('erreur lors des vérifications empêche tout POST, les valeurs identiques sont ignorées', async () => {
  let writes = 0;
  await assert.rejects(migrate({ rules, database, apply: true, request: async (_url, options = {}) => {
    if (options.method === 'POST') writes++;
    return { documents: [doc('ABCDEF')] };
  } }), /absent/);
  assert.equal(writes, 0);
  const plan = buildPlan({ sans_repas: [], sans_couchage: [] }, [doc('ABCDEF', 2, {
    participation_repas: { booleanValue: true }, couchage_sur_place: { booleanValue: true },
  })], database);
  assert.equal(plan.writes.length, 0);
});
