import type {
  AssetMetadata,
  Composition,
  CompositionValidationIssue,
  CompositionValidationResult,
  Connection,
  Contract,
  Module,
  Port,
  RuntimeState,
  Workflow
} from './model.js';

export interface CreateEmptyWorkflowInput {
  id: string;
  title: string;
  description?: string;
  asset?: Partial<AssetMetadata>;
  metadata?: Record<string, unknown>;
}

export interface CreateMinimalModuleInput {
  id: string;
  kind: string;
  title: string;
  description?: string;
  ports?: Array<Omit<Port, 'moduleId'>>;
  asset?: Partial<AssetMetadata>;
  metadata?: Record<string, unknown>;
}

function createDefaultRuntimeState(): RuntimeState {
  return { status: 'idle', message: null, outputs: {} };
}

export function createEmptyWorkflow(input: CreateEmptyWorkflowInput): Workflow {
  const workflowId = normalizeRequiredIdentifier(input.id, 'workflow id');
  const title = normalizeRequiredText(input.title, 'workflow title');
  const asset = createAssetMetadata({ id: workflowId, title, ...input.asset });

  return {
    id: workflowId,
    version: 1,
    title,
    description: input.description,
    asset,
    composition: {
      id: `${workflowId}.composition`,
      version: 1,
      modules: [],
      connections: [],
      domains: [],
      contracts: [],
      runtimeState: createDefaultRuntimeState(),
      metadata: {}
    },
    metadata: input.metadata ? { ...input.metadata } : undefined
  };
}

export function createMinimalModule(input: CreateMinimalModuleInput): Module {
  const moduleId = normalizeRequiredIdentifier(input.id, 'module id');
  const title = normalizeRequiredText(input.title, 'module title');

  return {
    id: moduleId,
    kind: normalizeRequiredIdentifier(input.kind, 'module kind'),
    title,
    description: input.description,
    lifecycle: 'declared',
    asset: createAssetMetadata({ id: moduleId, title, ...input.asset }),
    ports: (input.ports ?? []).map((port) => ({ ...port, moduleId })),
    runtimeState: createDefaultRuntimeState(),
    metadata: input.metadata ? { ...input.metadata } : undefined
  };
}

export function findCompositionModule(composition: Composition, moduleId: string): Module | null {
  return composition.modules.find((module) => module.id === moduleId) ?? null;
}

export function findCompositionPort(
  composition: Composition,
  endpoint: { moduleId: string; portId: string }
): Port | null {
  return findCompositionModule(composition, endpoint.moduleId)?.ports.find(
    (port) => port.id === endpoint.portId
  ) ?? null;
}

export function validatePorts(source: Port, target: Port): CompositionValidationResult {
  const issues: CompositionValidationIssue[] = [];

  if (source.direction !== 'output') {
    issues.push(createIssue({
      code: 'port.source-direction',
      message: `Source port "${source.id}" must be an output port.`,
      moduleId: source.moduleId,
      portId: source.id
    }));
  }

  if (target.direction !== 'input') {
    issues.push(createIssue({
      code: 'port.target-direction',
      message: `Target port "${target.id}" must be an input port.`,
      moduleId: target.moduleId,
      portId: target.id
    }));
  }

  if (source.contract.mode !== target.contract.mode) {
    issues.push(createIssue({
      code: 'port.mode-mismatch',
      message: `Port modes are incompatible: ${source.contract.mode} -> ${target.contract.mode}.`,
      moduleId: target.moduleId,
      portId: target.id
    }));
  }

  if (
    source.contract.valueType !== 'unknown' &&
    target.contract.valueType !== 'unknown' &&
    source.contract.valueType !== target.contract.valueType
  ) {
    issues.push(createIssue({
      code: 'port.value-type-mismatch',
      message: `Port value types are incompatible: ${source.contract.valueType} -> ${target.contract.valueType}.`,
      moduleId: target.moduleId,
      portId: target.id
    }));
  }

  if (
    source.contract.semanticType &&
    target.contract.semanticType &&
    source.contract.semanticType !== target.contract.semanticType
  ) {
    issues.push(createIssue({
      code: 'port.semantic-type-mismatch',
      message: `Port semantic types are incompatible: ${source.contract.semanticType} -> ${target.contract.semanticType}.`,
      moduleId: target.moduleId,
      portId: target.id
    }));
  }

  return createValidationResult(issues);
}

export function validateConnection(composition: Composition, connection: Connection): CompositionValidationResult {
  const issues: CompositionValidationIssue[] = [];
  const sourceModule = findCompositionModule(composition, connection.source.moduleId);
  const targetModule = findCompositionModule(composition, connection.target.moduleId);
  const sourcePort = sourceModule?.ports.find((port) => port.id === connection.source.portId) ?? null;
  const targetPort = targetModule?.ports.find((port) => port.id === connection.target.portId) ?? null;

  if (!sourceModule) {
    issues.push(createIssue({
      code: 'connection.missing-source-module',
      message: `Connection "${connection.id}" references missing source module "${connection.source.moduleId}".`,
      connectionId: connection.id,
      moduleId: connection.source.moduleId
    }));
  }

  if (!targetModule) {
    issues.push(createIssue({
      code: 'connection.missing-target-module',
      message: `Connection "${connection.id}" references missing target module "${connection.target.moduleId}".`,
      connectionId: connection.id,
      moduleId: connection.target.moduleId
    }));
  }

  if (!sourcePort) {
    issues.push(createIssue({
      code: 'connection.missing-source-port',
      message: `Connection "${connection.id}" references missing source port "${connection.source.portId}".`,
      connectionId: connection.id,
      moduleId: connection.source.moduleId,
      portId: connection.source.portId
    }));
  }

  if (!targetPort) {
    issues.push(createIssue({
      code: 'connection.missing-target-port',
      message: `Connection "${connection.id}" references missing target port "${connection.target.portId}".`,
      connectionId: connection.id,
      moduleId: connection.target.moduleId,
      portId: connection.target.portId
    }));
  }

  if (sourceModule && targetModule && sourceModule.id === targetModule.id) {
    issues.push(createIssue({
      code: 'connection.self-loop',
      message: `Connection "${connection.id}" cannot connect a module to itself.`,
      connectionId: connection.id,
      moduleId: sourceModule.id
    }));
  }

  if (sourcePort && targetPort) {
    issues.push(...validatePorts(sourcePort, targetPort).issues.map((issue) => ({
      ...issue,
      connectionId: connection.id
    })));
  }

  const competingConnections = composition.connections.filter(
    (candidate) =>
      candidate.id !== connection.id &&
      candidate.target.moduleId === connection.target.moduleId &&
      candidate.target.portId === connection.target.portId
  );

  if (targetPort && !targetPort.contract.multiple && competingConnections.length > 0) {
    issues.push(createIssue({
      code: 'connection.input-occupied',
      message: `Target port "${connection.target.portId}" already has an incoming connection.`,
      connectionId: connection.id,
      moduleId: connection.target.moduleId,
      portId: connection.target.portId
    }));
  }

  return createValidationResult(issues);
}

export function validateComposition(composition: Composition): CompositionValidationResult {
  const issues: CompositionValidationIssue[] = [];
  const moduleIds = new Set<string>();
  const contractIds = new Set<string>();

  for (const contract of composition.contracts) {
    if (contractIds.has(contract.id)) {
      issues.push(createIssue({
        code: 'contract.duplicate-id',
        message: `Contract id "${contract.id}" is declared more than once.`
      }));
    }
    contractIds.add(contract.id);
  }

  for (const module of composition.modules) {
    if (moduleIds.has(module.id)) {
      issues.push(createIssue({
        code: 'module.duplicate-id',
        message: `Module id "${module.id}" is declared more than once.`,
        moduleId: module.id
      }));
    }
    moduleIds.add(module.id);

    for (const port of module.ports) {
      if (port.moduleId !== module.id) {
        issues.push(createIssue({
          code: 'port.module-owner-mismatch',
          message: `Port "${port.id}" must belong to module "${module.id}".`,
          moduleId: module.id,
          portId: port.id
        }));
      }
    }
  }

  for (const domain of composition.domains) {
    for (const moduleId of domain.moduleIds) {
      if (!moduleIds.has(moduleId)) {
        issues.push(createIssue({
          code: 'domain.missing-module',
          message: `Domain "${domain.id}" references missing module "${moduleId}".`,
          domainId: domain.id,
          moduleId
        }));
      }
    }
  }

  for (const connection of composition.connections) {
    issues.push(...validateConnection(composition, connection).issues);
  }

  return createValidationResult(issues);
}

export function validateWorkflow(workflow: Workflow): CompositionValidationResult {
  return validateComposition(workflow.composition);
}

export function createContract(input: Contract): Contract {
  return { ...input, id: normalizeRequiredIdentifier(input.id, 'contract id') };
}

function createAssetMetadata(input: Partial<AssetMetadata> & Pick<AssetMetadata, 'id'>): AssetMetadata {
  return {
    id: normalizeRequiredIdentifier(input.id, 'asset id'),
    version: input.version ?? '0.1.0',
    title: input.title,
    packageId: input.packageId ?? null,
    provider: input.provider ?? null,
    documentation: input.documentation ?? null,
    dependencies: input.dependencies ? [...input.dependencies] : [],
    tags: input.tags ? [...input.tags] : [],
    metadata: input.metadata ? { ...input.metadata } : undefined
  };
}

function createIssue(
  input: Omit<CompositionValidationIssue, 'id' | 'severity'> & { severity?: 'error' | 'warning' }
): CompositionValidationIssue {
  return {
    id: `${input.code}:${input.connectionId ?? input.moduleId ?? input.portId ?? input.domainId ?? input.message}`,
    severity: input.severity ?? 'error',
    ...input
  };
}

function createValidationResult(issues: CompositionValidationIssue[]): CompositionValidationResult {
  return { valid: issues.every((issue) => issue.severity !== 'error'), issues };
}

function normalizeRequiredIdentifier(value: string, fieldName: string): string {
  const normalized = normalizeRequiredText(value, fieldName);

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(normalized)) {
    throw new Error(`Invalid composition ${fieldName}: "${value}".`);
  }

  return normalized;
}

function normalizeRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`Missing composition ${fieldName}.`);
  }

  return normalized;
}
