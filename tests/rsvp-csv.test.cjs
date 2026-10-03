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

test('multiline, quotes, commas, accents and empty fields survive a CSV round trip', () => {
  const rows = [
    ['Nom', 'Commentaires', 'Email'],
    ['Invité, Exemple', 'Végétarien\nSans noix, merci !\r\nIl a dit "oui"; à bientôt ❤️', ''],
    ['Deuxième', '\rRetour isolé\n\nDeux lignes vides', 'exemple@example.invalid'],
  ];
  const csv = serializeCsv(rows);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.deepEqual(parseCsv(csv), rows);
});

const guest = {
  codeInvitation: 'ABCDEF', nom: 'Invité Exemple', email: 'exemple@example.invalid',
  statut: 'accepte', vendredi_soir: true, samedi_soir: true, dimanche_brunch: false,
  commentaires: 'Allergie : "noix", gluten\nMerci !',
};

test('RSVP header and rows have nine aligned columns, including email and three events', () => {
  const rows = parseCsv(buildRsvpCsv([guest]));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 9);
  assert.equal(rows[1].length, 9);
  assert.deepEqual(Object.fromEntries(rows[0].map((name, i) => [name, rows[1][i]])), {
    Code: 'ABCDEF', Nom: guest.nom, Statut: 'accepte', Email: guest.email,
    'Vendredi soir': 'Oui', 'Samedi soir': 'Oui', 'Dimanche brunch': 'Non',
    Commentaires: guest.commentaires, 'Date modification': '',
  });
});

test('export contains exactly the supplied filtered results, including more than one page', () => {
  const guests = Array.from({ length: 43 }, (_, i) => ({ ...guest, nom: `Exemple ${i}` }));
  assert.equal(parseCsv(buildRsvpCsv(guests)).length, 44);
  assert.equal(parseCsv(buildRsvpCsv(guests.slice(0, 3))).length, 4);
  assert.equal(parseCsv(buildRsvpCsv([])).length, 1);
});
