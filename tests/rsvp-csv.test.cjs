const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync(require.resolve('../lib/rsvp-csv.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const csvModule = { exports: {} };
new Function('exports', 'module', source)(csvModule.exports, csvModule);
const { serializeCsv, buildRsvpCsv } = csvModule.exports;

// Independent CSV reader: delimiters and record breaks only apply outside quotes.
function parseCsv(csv) {
  const records = [];
  let record = [], cell = '', quoted = false;
  const text = csv.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === ',') { record.push(cell); cell = ''; }
    else if (!quoted && (char === '\r' || char === '\n')) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      record.push(cell); records.push(record); record = []; cell = '';
    } else cell += char;
  }
  assert.equal(quoted, false, 'Unclosed quoted cell');
  record.push(cell); records.push(record);
  return records;
}

test('line breaks become spaces while quotes, commas, accents and empty fields stay intact', () => {
  const rows = [
    ['Nom', 'Commentaires', 'Email'],
    ['Invité, Exemple', 'Végétarien\nSans noix, merci !\r\nIl a dit "oui"; à bientôt ❤️', ''],
    ['Deuxième', '\rRetour isolé\n\nDeux lignes vides', 'exemple@example.invalid'],
  ];
  const csv = serializeCsv(rows);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.deepEqual(parseCsv(csv), [
    ['Nom', 'Commentaires', 'Email'],
    ['Invité, Exemple', 'Végétarien Sans noix, merci ! Il a dit "oui"; à bientôt ❤️', ''],
    ['Deuxième', ' Retour isolé Deux lignes vides', 'exemple@example.invalid'],
  ]);
  assert.equal(csv.split('\r\n').length, rows.length);
  assert.equal(/[\r\n]/.test(csv.replace(/\r\n/g, '')), false);
});

const guest = {
  codeInvitation: 'ABCDEF', nom: 'Invité Exemple', email: 'exemple@example.invalid',
  statut: 'accepte', vendredi_soir: true, samedi_soir: true, dimanche_brunch: false,
  commentaires: 'Allergie : "noix", gluten\nMerci !',
};

test('CSV matches the eleven dashboard columns in order', () => {
  const rows = parseCsv(buildRsvpCsv([guest]));
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], ['Code', 'Invité', 'Réponse', 'Email', 'Vendredi', 'Samedi', 'Dimanche', 'Repas', 'Couchage sur place', 'Commentaires', 'Mise à jour']);
  assert.equal(rows[1].length, 11);
  assert.deepEqual(Object.fromEntries(rows[0].map((name, i) => [name, rows[1][i]])), {
    Code: 'ABCDEF', 'Invité': guest.nom, 'Réponse': 'Confirmé', Email: guest.email,
    Vendredi: 'Oui', Samedi: 'Oui', Dimanche: '—',
    Repas: 'Non renseigné', 'Couchage sur place': 'Non renseigné',
    Commentaires: 'Allergie : "noix", gluten Merci !', 'Mise à jour': '',
  });
});

test('export contains exactly the supplied filtered results, including more than one page', () => {
  const guests = Array.from({ length: 43 }, (_, i) => ({ ...guest, nom: `Exemple ${i}` }));
  assert.equal(parseCsv(buildRsvpCsv(guests)).length, 44);
  assert.deepEqual(parseCsv(buildRsvpCsv(guests)).slice(1).map(row => row[1]), guests.map(person => person.nom));
  assert.equal(parseCsv(buildRsvpCsv(guests.slice(0, 3))).length, 4);
  assert.equal(parseCsv(buildRsvpCsv([])).length, 1);
});

test('CR, LF, CRLF and blank lines in comments never create extra guest rows or alter source data', () => {
  const comments = [
    'Première ligne\rDeuxième ligne',
    'Première ligne\nDeuxième ligne',
    'Première ligne\r\nDeuxième ligne',
    'Première ligne\r\n\r\nDeuxième ligne',
    'Première ligne\n\rDeuxième ligne',
  ];
  const guests = comments.map((commentaires, i) => ({ ...guest, nom: `Exemple ${i}`, commentaires }));
  const csv = buildRsvpCsv(guests);
  const physicalLines = csv.split('\r\n');
  assert.equal(physicalLines.length, guests.length + 1);
  for (const line of physicalLines) {
    assert.equal(/[\r\n]/.test(line), false);
    assert.equal(parseCsv(line)[0].length, 11);
  }
  const records = parseCsv(csv);
  assert.deepEqual(records.slice(1).map(row => row[9]), Array(guests.length).fill('Première ligne Deuxième ligne'));
  assert.deepEqual(guests.map(person => person.commentaires), comments);
});

test('invitation flags stay independent of RSVP and stale event choices do not imply presence', () => {
  const dateModification = new Date('2026-10-05T10:00:00Z');
  const guests = [
    { ...guest, participation_repas: true, couchage_sur_place: false, dateModification },
    { ...guest, statut: 'refuse', participation_repas: true, couchage_sur_place: true },
    { ...guest, statut: 'en_attente', participation_repas: false },
  ];
  const before = JSON.stringify(guests);
  const rows = parseCsv(buildRsvpCsv(guests)).slice(1);
  assert.deepEqual(rows.map(row => row.slice(2, 3)), [['Confirmé'], ['Refusé'], ['En attente']]);
  assert.deepEqual(rows.map(row => row.slice(4, 9)), [
    ['Oui', 'Oui', '—', 'Oui', 'Non'],
    ['—', '—', '—', 'Oui', 'Oui'],
    ['—', '—', '—', 'Non', 'Non renseigné'],
  ]);
  assert.equal(rows[0][10], dateModification.toLocaleString('fr-FR'));
  assert.equal(JSON.stringify(guests), before);
});
