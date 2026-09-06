import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyWorkflow, createMinimalModule, commitWorkflowComposition,
  projectWorkflowCompositionReadModel, validateWorkflow } from '../dist/index.js';

test('compiled ESM creates and reads a workflow without a visual projection', () => {
  const workflow = createEmptyWorkflow({ id: 'example', title: 'Example' });
  assert.deepEqual(validateWorkflow(workflow), { valid: true, issues: [] });
  assert.equal(projectWorkflowCompositionReadModel(workflow).moduleCount, 0);
});

test('accepted composition is isolated from subsequent candidate edits', () => {
  const previous = createEmptyWorkflow({ id: 'example', title: 'Example' });
  const candidate = structuredClone(previous);
  candidate.composition.modules.push(createMinimalModule({ id: 'one', kind: 'example', title: 'One' }));
  const result = commitWorkflowComposition(previous, candidate);
  assert.equal(result.accepted, true);
  candidate.composition.modules[0].title = 'Changed';
  assert.equal(result.workflow.composition.modules[0].title, 'One');
  assert.equal(previous.composition.modules.length, 0);
});

test('invalid candidate is refused and previous state is preserved by value', () => {
  const previous = createEmptyWorkflow({ id: 'example', title: 'Example' });
  const candidate = structuredClone(previous);
  const module = createMinimalModule({ id: 'duplicate', kind: 'example', title: 'One' });
  candidate.composition.modules.push(module, structuredClone(module));
  const result = commitWorkflowComposition(previous, candidate);
  assert.equal(result.accepted, false);
  assert.ok(result.validation.issues.some(issue => issue.code === 'module.duplicate-id'));
  assert.deepEqual(result.workflow, previous);
  assert.notEqual(result.workflow, previous);
});
