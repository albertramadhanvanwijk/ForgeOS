# 06 --- UI/UX & Workspaces

Baseline navigation: Overview, Projects, Agent Fleet, Workflow & Runs,
Design Studio, Quality Center, Platform Builder, Integrations,
Operations, Settings & Policies. Visibility may adapt to context.

Project workspace: Overview, Conversation, Plan & Tasks, Artifacts,
Design, Engineering, Quality, Runs & Logs, Settings. Only relevant tabs
need be prominent.

Agent Fleet is the global catalog. Project views distinguish available,
selected, running, waiting, failed, and completed instances. A registry
entry alone must not appear active.

Workflow view shows task graph/dependencies/status/agent/time/cost when
available/retries/errors/artifacts/approvals/quality results. Design
Studio manages requirement, flows, wireframes, mockups, tokens,
components, interaction states, accessibility, visual validation;
approvals bind to exact versions. Quality Center displays test evidence,
skipped tests/reasons, logs, reviews, findings, gates, and fixes.

Platform Builder combines conversation with proposal, impacted
capabilities, reuse opportunities, dependencies, risks, assumptions,
implementation plan, validation, diffs, preview, approvals, and release
history.

Required states: loading, empty, running, waiting approval, partial
success, success, failure, timeout, cancelled, permission denied,
degraded, stale data, retrying. UI must reflect backend state. Reuse
design system; do not generate arbitrary pages; include
responsive/accessibility behavior and test real interactions.
