import { IntentAnalysis, IntentType, ContextReferences } from './types.js';

export interface ClassifyOptions {
  prompt: string;
  contextHistory?: Array<{ role: string; content: string }>;
  existingArtifacts?: string[];
}

export class IntentClassifier {
  private readonly troubleshootKeywords = [
    'fix', 'debug', 'error', 'exception', 'failing', 'fail', 'broken',
    'crash', 'incident', 'bug', 'issue', 'timeouts', '500', 'null pointer',
  ];

  private readonly investigateKeywords = [
    'investigate', 'spike', 'benchmark', 'research', 'analyze', 'analysis',
    'evaluate', 'compare', 'throughput', 'bottleneck', 'profile', 'latency',
  ];

  private readonly modifyKeywords = [
    'modify', 'update', 'refactor', 'change', 'enhance', 'extend',
    'integrate', 'upgrade', 'adjust',
  ];

  private readonly createKeywords = [
    'build', 'create', 'implement new', 'scaffold', 'bootstrap', 'develop',
    'greenfield', 'new service', 'new microservice', 'new component', 'from scratch',
  ];

  public classify(options: ClassifyOptions): IntentAnalysis {
    const { prompt, contextHistory } = options;
    const lowerPrompt = prompt.toLowerCase().trim();

    // 1. Extract Entity References
    const contextReferences = this.extractReferences(prompt);

    // 2. Ambiguity Detection
    const words = lowerPrompt.split(/\s+/).filter(Boolean);
    const hasHistory = contextHistory && contextHistory.length > 0;

    // Check if prompt is excessively short / vague without context
    const isVagueShort = words.length <= 4 && !contextReferences.taskIds?.length && !contextReferences.artifactIds?.length;
    const isAmbiguous = isVagueShort && !hasHistory;

    const clarifyingQuestions: string[] = [];
    if (isAmbiguous) {
      clarifyingQuestions.push('Which specific service, component, or file should be modified or inspected?');
      clarifyingQuestions.push('What error message, unexpected behavior, or expected outcome are you targeting?');
      clarifyingQuestions.push('Are there existing test cases, error logs, or acceptance criteria available?');
    }

    // 3. Score Intents
    let textToAnalyze = lowerPrompt;
    if (hasHistory) {
      const historyContext = contextHistory.map((m) => m.content.toLowerCase()).join(' ');
      textToAnalyze = `${historyContext} ${lowerPrompt}`;
    }

    const scores: Record<IntentType, number> = {
      troubleshoot: this.calculateMatchScore(textToAnalyze, this.troubleshootKeywords),
      investigate: this.calculateMatchScore(textToAnalyze, this.investigateKeywords),
      modify: this.calculateMatchScore(textToAnalyze, this.modifyKeywords),
      create: this.calculateMatchScore(textToAnalyze, this.createKeywords),
    };

    // Primary action verb weighting
    const firstWord = words[0];
    if (['build', 'create', 'scaffold', 'bootstrap', 'develop'].includes(firstWord)) {
      scores.create += 3;
    } else if (['fix', 'debug', 'resolve', 'repair'].includes(firstWord)) {
      scores.troubleshoot += 3;
    } else if (['investigate', 'analyze', 'benchmark', 'profile', 'spike', 'explore'].includes(firstWord)) {
      scores.investigate += 3;
    } else if (['add', 'modify', 'update', 'refactor', 'change', 'enhance', 'extend'].includes(firstWord)) {
      scores.modify += 3;
    }

    // Determine highest scoring intent
    let bestIntent: IntentType = 'modify';
    let maxScore = -1;

    for (const [intent, score] of Object.entries(scores) as [IntentType, number][]) {
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    // If no strong signal, default heuristics
    if (maxScore <= 0) {
      if (lowerPrompt.includes('fix') || lowerPrompt.includes('error')) {
        bestIntent = 'troubleshoot';
      } else if (lowerPrompt.includes('why') || lowerPrompt.includes('analyze')) {
        bestIntent = 'investigate';
      } else if (lowerPrompt.includes('build') || lowerPrompt.includes('create')) {
        bestIntent = 'create';
      } else {
        bestIntent = 'modify';
      }
    }

    const confidence = isAmbiguous ? 0.35 : Math.min(0.98, Math.max(0.75, 0.7 + maxScore * 0.05));

    // 4. Determine Suggested Workflow and Roles
    const { suggestedWorkflow, suggestedRoles } = this.resolveWorkflowAndRoles(bestIntent);

    // 5. Goals & Acceptance Criteria Generation
    const extractedGoals = this.extractGoals(prompt, bestIntent);
    const acceptanceCriteria = this.generateAcceptanceCriteria(prompt, bestIntent);

    return {
      intentType: bestIntent,
      confidence,
      summary: `Identified intent ${bestIntent.toUpperCase()} from user prompt.`,
      isAmbiguous,
      clarifyingQuestions,
      extractedGoals,
      acceptanceCriteria,
      suggestedWorkflow,
      suggestedRoles,
      contextReferences: Object.keys(contextReferences).length > 0 ? contextReferences : undefined,
    };
  }

  private calculateMatchScore(text: string, keywords: string[]): number {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += 1;
      }
    }
    return score;
  }

  private extractReferences(prompt: string): ContextReferences {
    const refs: ContextReferences = {};

    const projMatches = prompt.match(/\bprj-[a-zA-Z0-9_-]+\b/g);
    if (projMatches) refs.projectIds = Array.from(new Set(projMatches));

    const taskMatches = prompt.match(/\btsk-[a-zA-Z0-9_-]+\b/g);
    if (taskMatches) refs.taskIds = Array.from(new Set(taskMatches));

    const artMatches = prompt.match(/\bart-[a-zA-Z0-9_-]+\b/g);
    if (artMatches) refs.artifactIds = Array.from(new Set(artMatches));

    const runMatches = prompt.match(/\brun-[a-zA-Z0-9_-]+\b/g);
    if (runMatches) refs.runIds = Array.from(new Set(runMatches));

    return refs;
  }

  private resolveWorkflowAndRoles(intent: IntentType): { suggestedWorkflow: string; suggestedRoles: string[] } {
    switch (intent) {
      case 'create':
        return {
          suggestedWorkflow: 'workflow-greenfield-engineering',
          suggestedRoles: ['solution-architect', 'software-engineer', 'qa-engineer', 'devops-engineer'],
        };
      case 'modify':
        return {
          suggestedWorkflow: 'workflow-feature-enhancement',
          suggestedRoles: ['product-manager', 'software-engineer', 'qa-engineer'],
        };
      case 'investigate':
        return {
          suggestedWorkflow: 'workflow-spike-investigation',
          suggestedRoles: ['solution-architect', 'qa-engineer'],
        };
      case 'troubleshoot':
        return {
          suggestedWorkflow: 'workflow-incident-repair',
          suggestedRoles: ['software-engineer', 'qa-engineer'],
        };
    }
  }

  private extractGoals(prompt: string, intent: IntentType): string[] {
    const trimmed = prompt.replace(/^(build|create|fix|add|update|investigate)\s+/i, '').trim();
    return [
      `Deliver ${intent} specification: ${trimmed.length > 80 ? trimmed.substring(0, 77) + '...' : trimmed}`,
    ];
  }

  private generateAcceptanceCriteria(prompt: string, intent: IntentType): string[] {
    const baseCriteria: Record<IntentType, string[]> = {
      create: [
        'Architecture specification and interface contracts documented.',
        'Production implementation passes all unit and integration test suites.',
        'Verification gates and policy compliance checks pass with zero violations.',
      ],
      modify: [
        'Target functionality is extended without breaking existing interface contracts.',
        'Regression tests verify existing behaviors remain intact.',
        'Code review and security gates pass before merge.',
      ],
      investigate: [
        'Root causes, bottlenecks, or alternative architectures documented with empirical data.',
        'Actionable remediation recommendation artifact produced.',
      ],
      troubleshoot: [
        'Failing scenario reproduced with automated regression test.',
        'Minimal corrective change applied and verified.',
        'No regression introduced across dependent modules.',
      ],
    };

    return baseCriteria[intent];
  }
}
