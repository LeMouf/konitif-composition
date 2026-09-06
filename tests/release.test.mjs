import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertReleaseContract, assertPublishingTools } from '../scripts/release-contract.mjs';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const valid = () => ({ manifest: JSON.parse(read('package.json')), lock: JSON.parse(read('package-lock.json')),
  repository: 'LeMouf/konitif-composition', event: 'push', ref: 'refs/tags/v0.284.1' });
test('release requires exact repository, tag, package and lock version', () => {
  assert.doesNotThrow(() => assertReleaseContract(valid()));
  for (const change of [{repository:'LeMouf/konitif-core'},{event:'pull_request'},{ref:'refs/heads/main'},{ref:'refs/tags/v0.284.2'}]) {
    assert.throws(() => assertReleaseContract({...valid(),...change}));
  }
  for (const change of [{version:'0.284.1-beta.1'},{private:true},{name:'@konitif/core'},{license:'MIT'}]) {
    const input=valid(); Object.assign(input.manifest,change);
    assert.throws(() => assertReleaseContract(input));
  }
  const input=valid(); input.lock.packages[''].version='0.0.0';
  assert.throws(() => assertReleaseContract(input));
});
test('publishing tools refuse obsolete and nonstable versions', () => {
  assert.doesNotThrow(() => assertPublishingTools('24.20.0','11.5.1'));
  for (const versions of [['22.13.0','11.5.1'],['24.20.0','10.9.4'],['24.20.0','11.5.1-beta']]) assert.throws(()=>assertPublishingTools(...versions));
});
test('publication is opt-in, protected and uses only the verified archive', () => {
  const workflow=read('.github/workflows/publish.yml');
  assert.match(workflow, /COMPOSITION_NPM_PUBLISH_ENABLED == 'true'/);
  assert.match(workflow, /environment: npm-release/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /git merge-base --is-ancestor HEAD origin\/main/);
  assert.match(workflow, /COMPOSITION_RELEASE_ARCHIVE: 'true'/);
  assert.match(workflow, /npm publish \.release\/composition.tgz --access public --provenance --ignore-scripts/);
  assert.doesNotMatch(workflow, /NODE_AUTH_TOKEN|NPM_TOKEN|npm install|workflow_dispatch/);
});
