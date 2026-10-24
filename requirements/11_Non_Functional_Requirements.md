# 11 --- Non-Functional Requirements

Reliability: persist critical state; avoid unsafe duplicate side
effects; recover individual tasks where possible; explain unrecoverable
failures; backup/restore.

Performance: final targets depend on deployment/workload. Initial test
targets: p95 under 500 ms for lightweight APIs; p95 main page under 3
seconds in defined test environment; status updates without repeated
manual refresh; AI operations have timeouts/telemetry. Record test
conditions; targets are not universal guarantees.

Scalability: concurrent projects with limits; independently scale
workers if needed; keep parallel work within budget; evolve architecture
only for measured needs.

Maintainability: clear module boundaries; business logic independent of
one model SDK; schema migrations; validated/versioned config; documented
API/event contracts; tests for critical and security flows.

Privacy/security: restrict sensitive data; no secrets in source;
policy-governed model data sharing; audit; validate uploads/tool output;
minimize context; define retention/deletion.

Cost: workflow budgets; model routing; bounded tool costs/duration;
stop/request approval on limits; distinguish estimate/actual; prevent
unbounded retries.

Accessibility: keyboard navigation; status not color-only; clear labels;
responsive UI; actionable errors; advanced details available without
overwhelming main view.

Portability: provider/runtime adapters; exportable artifacts;
backup/migration for DB/object storage; documented dependencies. Define
RPO/RTO by deployment class. MVP needs tested restore, documented loss
scenarios, restart recovery, and interrupted-state reconciliation.
