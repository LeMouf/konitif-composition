import assert from 'node:assert/strict';

export function assertReleaseContract({ manifest, lock, repository, ref, event }) {
  assert.equal(repository, 'LeMouf/konitif-composition');
  assert.equal(event, 'push', 'Only tag pushes may publish');
  assert.match(manifest.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  assert.equal(ref, `refs/tags/v${manifest.version}`, 'Tag and version must agree');
  assert.equal(manifest.name, '@konitif/composition');
  assert.equal(manifest.private, false);
  assert.equal(manifest.license, 'PolyForm-Noncommercial-1.0.0');
  assert.equal(manifest.publishConfig?.access, 'public');
  assert.equal(manifest.repository?.url, 'git+https://github.com/LeMouf/konitif-composition.git');
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].name, manifest.name);
  assert.equal(lock.packages[''].version, manifest.version);
}

export function assertPublishingTools(nodeVersion, npmVersion) {
  const meets = (value, minimum) => {
    if (!/^\d+\.\d+\.\d+$/.test(value)) return false;
    const parts = value.split('.').map(Number);
    for (let i = 0; i < 3; i++) if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
    return true;
  };
  assert.ok(meets(nodeVersion, [22, 14, 0]), 'Preinstalled Node >=22.14.0 required');
  assert.ok(meets(npmVersion, [11, 5, 1]), 'Preinstalled npm >=11.5.1 required; no automatic upgrade');
}
