export type CompositionValueType =
  | 'number'
  | 'boolean'
  | 'string'
  | 'vec2'
  | 'vec3'
  | 'vec4'
  | 'object'
  | 'asset'
  | 'workflow'
  | 'unknown';

export type PortDirection = 'input' | 'output';
export type PortMode = 'value' | 'event' | 'control';
export type RuntimeStateStatus = 'idle' | 'ready' | 'running' | 'success' | 'error' | 'missing' | 'disabled';
export type ContractKind = 'data' | 'event' | 'control' | 'resource' | 'runtime';
export type ModuleLifecycle = 'declared' | 'ready' | 'running' | 'completed' | 'failed' | 'disabled';

export interface AssetMetadata {
  id: string;
  version: string;
  title?: string;
  packageId?: string | null;
  provider?: string | null;
  documentation?: string | null;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface RuntimeState {
  status: RuntimeStateStatus;
  message?: string | null;
  outputs?: Record<string, unknown>;
}

export interface Contract {
  id: string;
  kind: ContractKind;
  valueType: CompositionValueType;
  mode: PortMode;
  semanticType?: string | null;
  required?: boolean;
  multiple?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface Port {
  id: string;
  moduleId: string;
  label: string;
  direction: PortDirection;
  contract: Contract;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface Module {
  id: string;
  kind: string;
  title: string;
  description?: string;
  lifecycle: ModuleLifecycle;
  asset: AssetMetadata;
  ports: Port[];
  runtimeState: RuntimeState;
  metadata?: Record<string, unknown>;
}

export interface ConnectionEndpoint {
  moduleId: string;
  portId: string;
}

export interface Connection {
  id: string;
  source: ConnectionEndpoint;
  target: ConnectionEndpoint;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface Domain {
  id: string;
  title: string;
  description?: string;
  moduleIds: string[];
  metadata?: Record<string, unknown>;
}

export interface Composition {
  id: string;
  version: 1;
  modules: Module[];
  connections: Connection[];
  domains: Domain[];
  contracts: Contract[];
  runtimeState: RuntimeState;
  metadata?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  version: 1;
  title: string;
  description?: string;
  asset: AssetMetadata;
  composition: Composition;
  metadata?: Record<string, unknown>;
}

export interface CompositionValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  code: string;
  message: string;
  moduleId?: string;
  portId?: string;
  connectionId?: string;
  domainId?: string;
}

export interface CompositionValidationResult {
  valid: boolean;
  issues: CompositionValidationIssue[];
}
