# 09 --- Quality, Testing & Agent Evaluation

Each task has a quality profile: acceptance criteria, required/optional
checks, thresholds, evidence, retry/repair rules, escalation and
delivery conditions.

Testing layers: static validation; unit; integration; contract;
end-to-end; security; visual; performance; recovery; production
smoke/health. Select checks by task type: reports need
completeness/source validation; websites build/lint/behavior/responsive;
APIs contract/integration/error handling; migrations schema/recovery;
mobile platform build/tests; platform changes
regression/security/integration.

Each gate records ID/version, target, tests run/skipped and reasons,
result, evidence/log refs, time, environment, source/artifact version,
and status: passed, failed, blocked, not_applicable,
skipped_with_reason. A required gate cannot pass because it was not run.

Self-healing: collect evidence; diagnose; link to requirement/change;
assess safety; patch in isolation; run targeted tests and regressions;
compare baseline; save evidence; escalate after limits. Never disable
tests or lower thresholds to force a pass.

Configure retry count, repair budget/time, file/module scope, conflict
rules, approvals, and stop conditions. Code review checks correctness,
requirements, maintainability, error handling, security, performance,
coverage, architecture, regression risk. Evaluate agents by outcomes,
schema validity, tools, test pass, defects, cost per verified result,
duration, retries, escalation, and permission violations.

Acceptance: evidence-backed verification; failed mandatory gates block
delivery; bounded retries; regression tests after repair; skipped tests
justified; quality measured; command success != product success.
