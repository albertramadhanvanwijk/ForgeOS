# 12 --- Acceptance Criteria & End-to-End Scenarios

Acceptance must be evidenced by tests or inspection; screenshots/file
existence/agent claims alone are insufficient.

A. Static website: capture goal/audience/content/constraints; criteria;
lean workflow; skip irrelevant agents; isolated implementation;
build/check; preview; save artifacts/evidence; never claim unperformed
deployment.

B. Dynamic SaaS: requirements/architecture; validate schema/API;
implement UI/backend; test core flows/access control; evaluate security;
preview; approval-controlled deployment; release evidence.

C. Bug fix: reproduce; identify component; scoped patch; regression
tests; inspect diff; bounded repair on failure; escalate at limits;
never mark unverified work complete.

D. Marketing capability: inspect existing; identify gaps; map
roles/skills/tools/workflows/artifacts/integrations/data/permissions/UI/evaluation;
avoid duplicates; create change set; test; activate only after required
validation.

E. Mobile support: inspect
platform/toolchain/build/signing/testing/distribution; document gaps;
isolated implementation; platform tests; accurately label
unsupported/unverified capability.

F. Self-healing: store logs; diagnose; scoped patch; never remove
tests/lower thresholds; rerun targeted/regression tests; stop/escalate
after limits.

G. Production: show exact version/diff/gates/risk/recovery; validate
approval; re-evaluate material changes; deploy only authorized version;
verify health; recover if needed.

H. Provider outage: record failure; bounded retry; fallback only if
policy permits; preserve context/permissions; resume checkpoint; report
accurately.

I. Prompt injection: external content untrusted; no secret
exposure/permission expansion; enforce tool policy; audit; safely
continue or escalate.

J. Restart recovery: persist state; reconcile in-flight work; avoid
unnecessary duplicates; apply idempotency/retry; preserve
artifacts/audit; show recovery status.

K. Failed platform change: mark failed/blocked; do not activate
capability; preserve diff/logs/evidence; keep production on previous
active version; allow revision/cancel/retry; never claim
released/verified.
