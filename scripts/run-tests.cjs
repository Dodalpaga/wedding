const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const root = path.resolve(__dirname, '..');
  // Run in one process: node:test's default file isolation cannot spawn in
  // some Windows sandboxes. These tests use fixtures and never write Firebase.
  for (const directory of ['tests', 'migration']) {
    for (const file of fs.readdirSync(path.join(root, directory)).sort()) {
      if (!/\.test\.(cjs|mjs)$/.test(file)) continue;
      const target = path.join(root, directory, file);
      if (file.endsWith('.cjs')) require(target);
      else await import(pathToFileURL(target).href);
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
