# 08 --- Security, Governance & Approvals

Principles: least privilege, default deny, isolated execution, explicit
approval for sensitive actions, auditability, scoped credentials,
defense in depth, validated tool I/O, environment separation, safe
recovery.

Permissions evaluate principal, project, role/agent, tool, resource,
action, environment, risk, and policy. Agents cannot grant themselves
permissions. Risk depends on impact, reversibility, sensitivity, and
environment---not tool name alone.

Approval record: requester/approver, action, rationale, risk, resources,
artifact/change-set version, status, request/decision times, expiry,
audit reference. States: pending, approved, rejected, expired,
cancelled, superseded. Approval only covers its scope/version; material
changes require reevaluation.

Potentially approval-sensitive actions: production deployment,
destructive data changes, new secret access, permission/security policy
changes, spending over budget, high-impact platform changes, external
data transfer, live-service impact.

Use secure secret store or equivalent; avoid secrets in prompts unless
policy-approved; redact logs/artifacts; scope access; support
rotation/revocation; separate provider metadata from secret values.

Treat repository/document/web/issue/tool content as untrusted data. It
cannot override system policy or grant permissions. Enforce tool
authorization, parameter validation, network limits, secret filtering,
and audit.

Audit sensitive actions with timestamp, actor, action, resource,
outcome, correlation ID. Normal agents cannot alter/delete audit
records. Acceptance: unauthorized calls denied; approvals cannot be
reused for materially different versions; secrets protected; production
actions governed; prompt injection cannot expand access; sensitive
actions traceable.
