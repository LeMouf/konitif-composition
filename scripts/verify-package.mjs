import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'konitif-composition-package-'));
const run = (command, args, cwd = root) => execFileSync(command, args, {
  cwd, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  env: { ...process.env, npm_config_offline: 'true', npm_config_cache: join(temp, 'cache') }
});
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert.equal(manifest.name, '@konitif/composition');
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  assert.equal(Object.keys(manifest[field] ?? {}).length, 0);
}
const [packed] = JSON.parse(run('npm', ['pack', '--offline', '--ignore-scripts', '--json', '--pack-destination', temp]));
const files = packed.files.map(file => file.path);
for (const file of files) assert.match(file, /^(dist\/|src\/|reference\/|package\.json$|README\.md$|LICENSE\.md$)/);
for (const file of ['dist/index.js', 'dist/index.d.ts', 'src/index.ts', 'LICENSE.md', 'reference/catalog.json', 'reference/diagrams.json']) assert.ok(files.includes(file), file);
const consumer = join(temp, 'consumer');
const dependency = join(consumer, 'node_modules/@konitif/composition');
mkdirSync(dependency, { recursive: true });
run('tar', ['-xzf', join(temp, packed.filename), '-C', dependency, '--strip-components=1']);
for (const file of files.filter(file => file.endsWith('.map'))) {
  const mapPath = join(dependency, file);
  const map = JSON.parse(readFileSync(mapPath, 'utf8'));
  for (const source of map.sources) {
    const path = resolve(dirname(mapPath), map.sourceRoot ?? '', source);
    assert.ok(path.startsWith(dependency + '/') && existsSync(path), `Source map: ${file}`);
  }
}
cpSync(join(root, 'tests/consumer.mts'), join(consumer, 'consumer.mts'));
const compiler = process.env.COMPOSITION_TSC || join(root, 'node_modules/typescript/bin/tsc');
run(process.execPath, [compiler, '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'consumer.mts'], consumer);
console.log(run(process.execPath, ['--input-type=module', '-e', `
  import assert from 'node:assert/strict';
  import {createEmptyWorkflow, validateWorkflow, commitWorkflowComposition} from '@konitif/composition';
  const w = createEmptyWorkflow({id:'external',title:'External'});
  assert.equal(validateWorkflow(w).valid,true);
  assert.equal(commitWorkflowComposition(w,w).accepted,true);
  console.log('External archive consumer OK');
`], consumer));
console.log(JSON.stringify({ integrity: packed.integrity, bytes: packed.size, files: files.length, evidence: temp }));
if (process.env.COMPOSITION_RELEASE_ARCHIVE === 'true') {
  const release = join(root, '.release');
  mkdirSync(release, { recursive: true });
  cpSync(join(temp, packed.filename), join(release, 'composition.tgz'), { errorOnExist: true, force: false });
  console.log('Verified archive retained at .release/composition.tgz');
}
