const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync(require.resolve('../lib/admin-stats.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const statsModule = { exports: {} };
new Function('exports', 'module', source)(statsModule.exports, statsModule);
const { getInvitationAttendance } = statsModule.exports;

test('compte les personnes confirmées, pas les groupes ni tous les invités acceptés', () => {
  const guests = [
    { codeInvitation: 'ABCDEF', statut: 'accepte', participation_repas: true, couchage_sur_place: true },
    { codeInvitation: 'ABCDEF', statut: 'en_attente', participation_repas: true, couchage_sur_place: true },
    { codeInvitation: 'GHIJKL', statut: 'refuse', participation_repas: true, couchage_sur_place: false },
    { codeInvitation: 'GHIJKL', statut: 'accepte', participation_repas: true, couchage_sur_place: false, samedi_soir: false },
    { codeInvitation: 'MNOPQR', statut: 'accepte', participation_repas: false, couchage_sur_place: false },
  ];
  assert.deepEqual(getInvitationAttendance(guests), {
    repas: { invited: 4, confirmed: 2, unknown: 0 },
    couchage: { invited: 2, confirmed: 1, unknown: 0 },
  });
  guests[1].statut = 'accepte';
  assert.equal(getInvitationAttendance(guests).couchage.confirmed, 2);
});

test('les champs absents ou invalides sont non renseignés et exclus des ratios', () => {
  assert.deepEqual(getInvitationAttendance([
    { statut: 'accepte' },
    { statut: 'accepte', participation_repas: 'true', couchage_sur_place: null },
    { statut: 'accepte', participation_repas: false, couchage_sur_place: true },
  ]), {
    repas: { invited: 0, confirmed: 0, unknown: 2 },
    couchage: { invited: 1, confirmed: 1, unknown: 2 },
  });
  assert.deepEqual(getInvitationAttendance([]), {
    repas: { invited: 0, confirmed: 0, unknown: 0 },
    couchage: { invited: 0, confirmed: 0, unknown: 0 },
  });
});
