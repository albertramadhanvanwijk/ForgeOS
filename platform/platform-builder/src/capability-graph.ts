import type {
  CapabilityNode,
  CapabilityEdge,
  CapabilityGraphData,
} from './types.js';

export const INITIAL_FORGEOS_CAPABILITIES: CapabilityNode[] = [
  // Core Engines
  {
    id: 'engine.orchestrator',
    name: 'Control Plane Orchestrator',
    type: 'engine',
    version: '2.2.0',
    description: 'Fastify-based control plane, intent classifier, and adaptive planner',
    dependencies: [],
  },
  {
    id: 'engine.workflow',
    name: 'Durable Workflow Engine',
    type: 'engine',
    version: '2.2.0',
    description: 'DAG task orchestrator with checkpoints, retries, and compensation',
    dependencies: ['engine.orchestrator'],
  },
  {
    id: 'engine.policy',
    name: 'Policy Engine & Approvals',
    type: 'engine',
    version: '2.2.0',
    description: 'Default-deny RBAC policy evaluation and audit log ledger',
    dependencies: [],
  },
  {
    id: 'engine.artifact',
    name: 'Artifact Registry',
    type: 'engine',
    version: '2.2.0',
    description: 'SHA-256 provenance storage for PRDs, code, designs, and reports',
    dependencies: ['engine.orchestrator'],
  },
  {
    id: 'engine.quality',
    name: 'Quality Engine',
    type: 'engine',
    version: '2.2.0',
    description: 'Empirical verification gates blocking release on mandatory failure',
    dependencies: ['engine.artifact'],
  },
  {
    id: 'engine.memory',
    name: 'Persistent Memory Subsystem',
    type: 'engine',
    version: '2.2.0',
    description: 'Project-isolated memory with secret scrubbing and bounded context packaging',
    dependencies: ['engine.orchestrator', 'engine.policy'],
  },
  {
    id: 'engine.design-studio',
    name: 'Design Studio & Token Engine',
    type: 'engine',
    version: '2.2.0',
    description: 'Deterministic SHA-256 tokens, component contracts, and visual validation',
    dependencies: ['engine.quality'],
  },
  {
    id: 'engine.platform-builder',
    name: 'Platform Builder',
    type: 'engine',
    version: '2.2.0',
    description: 'Introspection, ChangeSet management, and self-modification governance',
    dependencies: ['engine.policy', 'engine.workflow'],
  },

  // Autonomous Roles
  {
    id: 'role.architect',
    name: 'Architect Agent',
    type: 'agent_role',
    version: '1.0.0',
    description: 'Extracts canonical PRDs, domain entities, and structured user flows',
    dependencies: ['engine.orchestrator', 'engine.memory'],
  },
  {
    id: 'role.designer',
    name: 'Designer Agent',
    type: 'agent_role',
    version: '1.0.0',
    description: 'Generates design tokens, wireframes, and sitemap specifications',
    dependencies: ['engine.design-studio'],
  },
  {
    id: 'role.engineer',
    name: 'Engineering Agent',
    type: 'agent_role',
    version: '1.0.0',
    description: 'Scaffolds clean TSX, components, and services in isolated git worktrees',
    dependencies: ['engine.design-studio', 'engine.orchestrator'],
  },
  {
    id: 'role.qa',
    name: 'QA & Verifier Agent',
    type: 'agent_role',
    version: '1.0.0',
    description: 'Executes automated unit/integration tests and visual compliance checks',
    dependencies: ['engine.quality'],
  },
];

export class CapabilityGraph {
  private nodes = new Map<string, CapabilityNode>();
  private edges: CapabilityEdge[] = [];

  constructor(initialNodes = INITIAL_FORGEOS_CAPABILITIES) {
    for (const node of initialNodes) {
      this.nodes.set(node.id, { ...node });
      for (const dep of node.dependencies) {
        this.edges.push({
          from: node.id,
          to: dep,
          relationship: 'depends_on',
        });
      }
    }
  }

  /**
   * FR-071: Inspect existing capabilities
   */
  public getNode(id: string): CapabilityNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): CapabilityNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(): CapabilityEdge[] {
    return [...this.edges];
  }

  public exportGraph(): CapabilityGraphData {
    return {
      nodes: this.getAllNodes(),
      edges: this.getEdges(),
    };
  }

  /**
   * Find all downstream nodes that depend directly or transitively on a capability
   */
  public getDownstreamDependents(capabilityId: string): string[] {
    const dependents = new Set<string>();

    const traverse = (currentId: string) => {
      for (const edge of this.edges) {
        if (edge.to === currentId && edge.relationship === 'depends_on') {
          if (!dependents.has(edge.from)) {
            dependents.add(edge.from);
            traverse(edge.from);
          }
        }
      }
    };

    traverse(capabilityId);
    return Array.from(dependents);
  }

  /**
   * FR-072: Find reuse and gaps
   */
  public analyzeGapsAndReuse(intent: string): {
    reusableCapabilities: CapabilityNode[];
    detectedGaps: string[];
  } {
    const lower = intent.toLowerCase();
    const reusable: CapabilityNode[] = [];
    const gaps: string[] = [];

    // Analyze intent keywords against registered capabilities
    for (const node of this.nodes.values()) {
      const match =
        lower.includes(node.name.toLowerCase()) ||
        lower.includes(node.id.split('.')[1]) ||
        lower.includes(node.type);

      if (match) {
        reusable.push(node);
      }
    }

    if (lower.includes('deploy') || lower.includes('kubernetes') || lower.includes('helm')) {
      if (!this.nodes.has('engine.deployment')) {
        gaps.push('engine.deployment (Missing automated production deployment pipeline)');
      }
    }

    if (lower.includes('billing') || lower.includes('stripe') || lower.includes('subscription')) {
      if (!this.nodes.has('engine.billing')) {
        gaps.push('engine.billing (Missing centralized payment & subscription engine)');
      }
    }

    if (lower.includes('notification') || lower.includes('email') || lower.includes('sms')) {
      if (!this.nodes.has('engine.notification')) {
        gaps.push('engine.notification (Missing multi-channel notification dispatcher)');
      }
    }

    return {
      reusableCapabilities: reusable,
      detectedGaps: gaps,
    };
  }

  /**
   * FR-078: Update capability graph after verified release
   */
  public registerCapability(node: CapabilityNode): void {
    this.nodes.set(node.id, { ...node });
    for (const dep of node.dependencies) {
      if (!this.edges.some((e) => e.from === node.id && e.to === dep)) {
        this.edges.push({
          from: node.id,
          to: dep,
          relationship: 'depends_on',
        });
      }
    }
  }

  public deprecateCapability(id: string): void {
    const node = this.nodes.get(id);
    if (node) {
      node.metadata = { ...node.metadata, deprecated: true };
    }
  }
}
