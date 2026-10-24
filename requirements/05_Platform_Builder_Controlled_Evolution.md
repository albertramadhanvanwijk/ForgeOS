# 05 --- Conversational Platform Builder & Controlled Evolution

Platform Builder evolves ForgeOS through conversation; it is not merely
an extension marketplace or manual agent editor. Requests may add
marketing capabilities, mobile support, test-failure repair,
research/reporting, or improve workspaces.

Required components: Platform Capability Graph; introspection; Change
Impact Analysis; Conversational Change Planner; versioned
PlatformChangeSet; isolated implementation; validation pipeline;
adaptive UI/workspace generation; approval/release control; version
history/recovery; post-release reconciliation; evaluation.

Graph nodes include capabilities, roles, agents, skills, tools,
workflows, modules, APIs, data entities, UI workspaces, policies, gates,
integrations, runtimes, tests, releases. Edges include implements,
depends_on, uses, exposes, requires_permission, validated_by,
displayed_in, replaces, conflicts_with, supersedes. States: planned,
implemented, validated, available, degraded, deprecated, disabled.
Implemented does not imply available.

Introspection inspects actual registry, workflow, modules, API,
schemas/migrations, routes/components, policies, integrations, tests,
dependencies, repository, and accessible deployment configuration. Label
findings verified fact, inference, assumption, proposal, or unknown.

Workflow: classify request; inspect platform; identify reuse/gaps/risks;
clarify material decisions; propose
scope/dependencies/tests/cost/approvals; create PlatformChangeSet;
implement in isolated branch/worktree/sandbox; validate; show
diff/evidence/preview; obtain approvals; release; verify; reconcile
graph.

Impact analysis covers roles, skills, workflows, APIs, data migrations,
permissions, UI/navigation, design system, tests, docs, provider
compatibility, cost, deployment, and recovery. Show direct/possible
indirect impacts and uncertainty.

Adaptive UI reuses existing design system/workspaces; add pages only for
meaningful new interactions. Never create a page per agent. Generated UI
needs real backend behavior and relevant tests.

Never allow agents to grant themselves permissions, disable required
approvals, alter audit records, fabricate validation, or silently change
production. Validate schemas, types, lint,
unit/integration/workflow/contract tests, security, migration, UI,
regression, compatibility, and recovery as relevant. Record skipped
tests and reasons.

After release, verify version and health, update capability graph,
record release evidence, monitor failures, and rollback or use
compensation/forward migration when necessary.
