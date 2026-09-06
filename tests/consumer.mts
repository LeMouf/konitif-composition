import { createEmptyWorkflow, commitWorkflowComposition, type Workflow } from '@konitif/composition';
const workflow: Workflow = createEmptyWorkflow({ id: 'typed', title: 'Typed consumer' });
const accepted: boolean = commitWorkflowComposition(workflow, workflow).accepted;
void accepted;
