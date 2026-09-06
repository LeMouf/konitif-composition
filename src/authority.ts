import { validateWorkflow } from './helpers.js';
import type { CompositionValidationResult, Workflow } from './model.js';

export interface WorkflowCompositionCommitResult {
  accepted: boolean;
  workflow: Workflow;
  validation: CompositionValidationResult;
}

export interface WorkflowCompositionReadModel {
  authority: 'workflow-composition';
  workflowId: string;
  compositionId: string;
  title: string;
  moduleCount: number;
  connectionCount: number;
  domainCount: number;
  runtimeStatus: Workflow['composition']['runtimeState']['status'];
  valid: boolean;
  issueCount: number;
}

export function commitWorkflowComposition(
  previousWorkflow: Workflow,
  candidateWorkflow: Workflow
): WorkflowCompositionCommitResult {
  const validation = validateWorkflow(candidateWorkflow);

  return validation.valid
    ? {
        accepted: true,
        workflow: cloneWorkflow(candidateWorkflow),
        validation
      }
    : {
        accepted: false,
        workflow: cloneWorkflow(previousWorkflow),
        validation
      };
}

export function projectWorkflowCompositionReadModel(workflow: Workflow): WorkflowCompositionReadModel {
  const validation = validateWorkflow(workflow);

  return {
    authority: 'workflow-composition',
    workflowId: workflow.id,
    compositionId: workflow.composition.id,
    title: workflow.title,
    moduleCount: workflow.composition.modules.length,
    connectionCount: workflow.composition.connections.length,
    domainCount: workflow.composition.domains.length,
    runtimeStatus: workflow.composition.runtimeState.status,
    valid: validation.valid,
    issueCount: validation.issues.length
  };
}

export function cloneWorkflow(workflow: Workflow): Workflow {
  return structuredClone(workflow);
}
