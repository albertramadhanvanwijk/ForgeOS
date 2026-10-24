# 10 --- Runtime, Git, Deployment & Operations

Execution adapters provide workspace creation, runtime setup, permitted
file operations, command execution, stdout/stderr, cancellation,
build/test output, artifact collection, cleanup.

Cloud sandbox: isolated workspaces, resource/time limits, network
restriction, lifecycle, logs, artifacts, cancellation, cleanup. Local
runner: registered/authenticated identity, declared capabilities, scoped
project/path permissions, command/resource/network restrictions, audit,
heartbeat, revocation. Local runner must not bypass policy.

Git: connect repositories, inspect branches/commits, isolated
branch/worktree, patches/diffs, commit metadata, conflict/merge checks,
cleanup, release tags. No direct production-branch writes outside
policy.

Separate dev/test/staging/production with distinct configuration,
secrets, permissions, deployment targets. Build/test commands derive
from project config and policy; capture exit code/output, enforce
timeout, store reports, handle hangs, distinguish app and infrastructure
failure.

Deployment: prepare candidate; validate artifacts/version; run required
gates; inspect config/secrets; obtain approval; deploy through target
adapter; smoke/health check; record release; monitor; recover/rollback
if triggered.

Observe workflow/task state, logs, provider latency/errors, costs where
available, resource use, tests, deployment health, retries, approval
wait. Correlate conversation/workflow/task/agent/tool/artifact/release.

Support bounded safe retries, idempotency where possible, checkpoints,
cancellation, restart recovery, orphan cleanup, rollback/compensation
and plans for irreversible changes. Reverting code alone may not reverse
data/external side effects.
