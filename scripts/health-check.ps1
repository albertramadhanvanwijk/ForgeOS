# ForgeOS Operational Health Check (Phase 6)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ForgeOS System Operational Health Check " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$orchestratorUrl = "http://127.0.0.1:3001/health"
$webUrl = "http://127.0.0.1:3000"

# 1. Orchestrator Backend Health
try {
    $res = Invoke-RestMethod -Uri $orchestratorUrl -Method Get -TimeoutSec 3
    if ($res.status -eq "ok") {
        Write-Host "[OK] Orchestrator Control Plane is HEALTHY (v$($res.version))" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Orchestrator returned non-ok status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] Orchestrator is UNREACHABLE at $orchestratorUrl" -ForegroundColor Red
}

# 2. Web Frontend Health
try {
    $webRes = Invoke-WebRequest -Uri $webUrl -Method Get -TimeoutSec 3
    if ($webRes.StatusCode -eq 200) {
        Write-Host "[OK] Next.js Web Frontend is HEALTHY (Status 200)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Web returned status $($webRes.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] Web Frontend is UNREACHABLE at $webUrl" -ForegroundColor Red
}

# 3. Git Working Tree Status
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "[WARN] Working tree has uncommitted modifications" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Git Working Tree is CLEAN" -ForegroundColor Green
}

Write-Host "==========================================" -ForegroundColor Cyan
