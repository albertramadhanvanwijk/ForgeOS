# Spin up local infrastructure services for ForgeOS
Write-Host "[ForgeOS] Starting local infrastructure services (Postgres, Redis, MinIO)..." -ForegroundColor Cyan
docker compose -f infrastructure/docker-compose.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "[ForgeOS] All infrastructure services are running!" -ForegroundColor Green
    Write-Host "  - PostgreSQL: localhost:5432 (db: forgeos, user: forgeos)" -ForegroundColor Gray
    Write-Host "  - Redis:      localhost:6379" -ForegroundColor Gray
    Write-Host "  - MinIO S3:   localhost:9000 (Console: http://localhost:9001)" -ForegroundColor Gray
} else {
    Write-Host "[ForgeOS] Docker compose failed or Docker is not currently running." -ForegroundColor Yellow
    Write-Host "ForgeOS will seamlessly fall back to built-in in-memory stores." -ForegroundColor Gray
}
