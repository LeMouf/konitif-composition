import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('manifest and lock restrict the toolchain to the reviewed compiler', () => {
  const manifest = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(manifest.name, '@konitif/composition');
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].version, manifest.version);
  assert.deepEqual(manifest.devDependencies, { typescript: '5.9.3' });
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
  assert.deepEqual(Object.keys(lock.packages).sort(), ['', 'node_modules/typescript']);
  const compiler = lock.packages['node_modules/typescript'];
  assert.equal(compiler.version, '5.9.3');
  assert.equal(compiler.resolved, 'https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz');
  assert.equal(compiler.integrity, 'sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==');
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    assert.equal(Object.keys(manifest[field] ?? {}).length, 0);
  }
});

test('compiler configuration is standalone and enforces Node ESM resolution', () => {
  const config = JSON.parse(read('tsconfig.json'));
  assert.equal(config.extends, undefined);
  assert.equal(config.compilerOptions.module, 'NodeNext');
  assert.equal(config.compilerOptions.moduleResolution, 'NodeNext');
  assert.deepEqual(config.compilerOptions.paths, {});
});

test('CI is validation-only with pinned checkout and locked install', () => {
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /contents: read/);
  assert.match(ci, /persist-credentials: false/);
  assert.match(ci, /actions\/checkout@11d5960a326750d5838078e36cf38b85af677262/);
  assert.match(ci, /npm ci --ignore-scripts/);
  assert.match(ci, /npm run verify:package/);
  assert.doesNotMatch(ci, /npm publish|id-token: write|curl |wget /);
});
