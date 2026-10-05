import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FLAG_NAMES = ['participation_repas', 'couchage_sur_place'];
const CODE_PATTERN = /^[A-Z0-9]{6}$/;
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const MIGRATION_DIR = fileURLToPath(new URL('./', import.meta.url));

export function validateRules(rules) {
  const keys = ['sans_repas', 'sans_couchage'];
  if (!rules || Array.isArray(rules) || typeof rules !== 'object' ||
      Object.keys(rules).length !== 2 || Object.keys(rules).some(key => !keys.includes(key))) {
    throw new Error('Le JSON doit contenir uniquement sans_repas et sans_couchage.');
  }
  for (const key of keys) {
    if (!Array.isArray(rules[key]) || rules[key].some(code => typeof code !== 'string' || !CODE_PATTERN.test(code))) {
      throw new Error(`${key} doit être une liste de codes de six caractères en majuscules.`);
    }
    if (new Set(rules[key]).size !== rules[key].length) throw new Error(`Doublon dans ${key}.`);
  }
  return rules;
}

export function readProjectId(envText) {
  const lines = envText.replace(/^\uFEFF/, '').split(/\r?\n/);
  const matches = lines.filter(line => /^\s*(?:export\s+)?NEXT_PUBLIC_FIREBASE_PROJECT_ID\s*=/.test(line));
  if (matches.length !== 1) throw new Error('Un identifiant Firebase unique est requis dans .env.local.');
  let value = matches[0].slice(matches[0].indexOf('=') + 1).trim();
  if (value.startsWith('"') || value.startsWith("'")) {
    const quote = value[0];
    const closing = value.indexOf(quote, 1);
    if (closing < 0 || !/^\s*(?:#.*)?$/.test(value.slice(closing + 1))) throw new Error('Identifiant Firebase invalide.');
    value = value.slice(1, closing);
  } else {
    value = value.replace(/\s+#.*$/, '').trim();
  }
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)) throw new Error('Identifiant Firebase invalide.');
  return value;
}

export function buildPlan(rules, documents, database) {
  validateRules(rules);
  const prefix = `${database}/documents/codes_invitation/`;
  const invitations = documents.filter(document => document.name?.startsWith(prefix) &&
    CODE_PATTERN.test(document.name.slice(prefix.length)));
  if (!invitations.length) throw new Error('Aucune invitation valide trouvée.');
  const codes = new Set(invitations.map(document => document.name.slice(prefix.length)));
  if (codes.size !== invitations.length) throw new Error('Invitation reçue plusieurs fois.');
  for (const code of new Set([...rules.sans_repas, ...rules.sans_couchage])) {
    if (!codes.has(code)) throw new Error(`Code absent de Firestore : ${code}. Aucune écriture effectuée.`);
  }
  const rows = [];
  const writes = [];
  for (const document of invitations) {
    const code = document.name.slice(prefix.length);
    const members = document.fields?.membres?.arrayValue?.values ?? [];
    if (!document.fields?.membres?.arrayValue || !members.length ||
        members.some(member => typeof member.stringValue !== 'string' || !member.stringValue.trim()) ||
        new Set(members.map(member => member.stringValue)).size !== members.length || !document.updateTime) {
      throw new Error(`Invitation ${code} invalide (membres ou horodatage). Aucune écriture effectuée.`);
    }
    const repas = !rules.sans_repas.includes(code);
    // Un groupe sans repas est également exclu du couchage sur place.
    const couchage = repas && !rules.sans_couchage.includes(code);
    const values = { participation_repas: repas, couchage_sur_place: couchage };
    const changed = FLAG_NAMES.some(key => document.fields[key]?.booleanValue !== values[key]);
    rows.push({ code, membres: members.length, repas, couchage, modification: changed });
    if (changed) {
      writes.push({
        update: {
          name: document.name,
          fields: Object.fromEntries(FLAG_NAMES.map(key => [key, { booleanValue: values[key] }])),
        },
        updateMask: { fieldPaths: FLAG_NAMES },
        currentDocument: { updateTime: document.updateTime },
      });
    }
  }
  if (writes.length > 500) throw new Error('Plus de 500 invitations à modifier : traitement par lot à revoir.');
  const totals = rows.reduce((sum, row) => ({
    membres: sum.membres + row.membres,
    repas: sum.repas + (row.repas ? row.membres : 0),
    couchage: sum.couchage + (row.couchage ? row.membres : 0),
  }), { membres: 0, repas: 0, couchage: 0 });
  return { rows: rows.sort((a, b) => a.code.localeCompare(b.code)), writes, totals };
}

export async function migrate({ rules, database, request, apply = false, report = () => {} }) {
  const documents = [];
  let pageToken;
  const seenTokens = new Set();
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/${database}/documents/codes_invitation`);
    url.searchParams.set('pageSize', '100');
    for (const key of ['membres', ...FLAG_NAMES]) url.searchParams.append('mask.fieldPaths', key);
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const page = await request(url);
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken;
    if (pageToken && seenTokens.has(pageToken)) throw new Error('Pagination Firestore incohérente.');
    if (pageToken) seenTokens.add(pageToken);
  } while (pageToken);
  const plan = buildPlan(rules, documents, database);
  report(plan);
  if (apply && plan.writes.length) {
    await request(`https://firestore.googleapis.com/v1/${database}/documents:commit`, {
      method: 'POST', body: JSON.stringify({ writes: plan.writes }),
    });
  }
  return plan;
}

function gcloudValue(command) {
  // Arguments fixes définis par le script, sans interpolation de données utilisateur.
  return (process.platform === 'win32'
    ? execFileSync('cmd.exe', ['/d', '/c', `gcloud ${command.join(' ')}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    : execFileSync('gcloud', command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })).trim();
}

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(['--apply', '--validate-only', '--cloud-shell', '--help']);
  if (args.some(arg => !allowed.has(arg)) || new Set(args).size !== args.length ||
      (args.includes('--apply') && args.includes('--validate-only'))) throw new Error('Options invalides. Utiliser --help.');
  if (args.includes('--help')) {
    console.log('node migration/update-invitation-flags.mjs [--cloud-shell] [--validate-only | --apply]\nSans --apply : aucune écriture. --cloud-shell : JSON dans le dossier courant et projet gcloud actif, sans .env.local.');
    return;
  }
  const cloudShell = args.includes('--cloud-shell');
  const rules = validateRules(JSON.parse((await readFile(resolve(cloudShell ? process.cwd() : MIGRATION_DIR, 'firebase-invitation-flags.local.json'), 'utf8')).replace(/^\uFEFF/, '')));
  let projectId;
  if (cloudShell) {
    try {
      projectId = gcloudValue(['config', 'get-value', 'project']);
    } catch {
      throw new Error('Impossible de lire le projet gcloud actif. Vérifier la connexion Cloud Shell.');
    }
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) throw new Error('Sélectionner le projet Firebase avec gcloud config set project avant de continuer.');
  } else {
    projectId = readProjectId(await readFile(resolve(ROOT, '.env.local'), 'utf8'));
  }
  if (args.includes('--validate-only')) {
    console.log('Configuration locale valide. Aucun appel Firebase.');
    return;
  }
  let token;
  try {
    token = gcloudValue(['auth', 'print-access-token']);
    if (!token || /\s/.test(token)) throw new Error('Jeton invalide.');
  } catch {
    throw new Error('Installer Google Cloud CLI puis exécuter gcloud auth login avec un compte autorisé au projet.');
  }
  const request = async (url, options = {}) => {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Goog-User-Project': projectId },
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      throw new Error('Connexion Firebase interrompue. Si une écriture était en cours, relancer l’aperçu pour vérifier son résultat.');
    }
    // Ne pas journaliser les corps de réponse, jetons, noms ou valeurs d’environnement.
    if (!response.ok) throw new Error(`Firebase HTTP ${response.status} : vérifier les droits du compte et la configuration. Aucun nouvel essai automatique.`);
    return response.json();
  };
  const plan = await migrate({
    rules, database: `projects/${projectId}/databases/(default)`, request,
    apply: args.includes('--apply'),
    report: ({ rows, totals, writes }) => {
      console.table(rows);
      console.log(`Effectifs prévus : ${totals.membres} membres, ${totals.repas} au repas, ${totals.couchage} au couchage sur place.`);
      console.log(`${writes.length} invitation(s) à modifier. Les documents hors codes de six caractères sont ignorés.`);
    },
  });
  console.log(args.includes('--apply')
    ? `${plan.writes.length} invitation(s) mise(s) à jour. La collection statuts est conservée.`
    : 'Aperçu uniquement : aucune écriture. Pour appliquer : relancer avec --apply.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.code ? `Erreur locale : ${error.code}. Vérifier les fichiers de configuration.` : error.message); process.exitCode = 1; });
}
