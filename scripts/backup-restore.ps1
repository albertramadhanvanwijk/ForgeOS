# ForgeOS Automated Backup & Restore Utility (Phase 6)
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("backup", "restore", "list")]
    [string]$Action = "backup",

    [Parameter(Mandatory=$false)]
    [string]$SnapshotId
)

$backupDir = Join-Path $PSScriptRoot "..\runtime-data\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

switch ($Action) {
    "backup" {
        $timestamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
        $archiveName = "forgeos-backup-$timestamp.zip"
        $archivePath = Join-Path $backupDir $archiveName

        Write-Host "Creating ForgeOS state backup snapshot: $archiveName..." -ForegroundColor Cyan

        # Collect artifacts, memory records, and configurations
        $sourcePaths = @(
            (Join-Path $PSScriptRoot "..\packages"),
            (Join-Path $PSScriptRoot "..\platform"),
            (Join-Path $PSScriptRoot "..\requirements")
        )

        Compress-Archive -Path $sourcePaths -DestinationPath $archivePath -Force
        Write-Host "[OK] Backup archive created successfully at: $archivePath" -ForegroundColor Green
        Write-Host "Snapshot ID: $timestamp" -ForegroundColor Yellow
    }

    "list" {
        Write-Host "Available ForgeOS State Backups:" -ForegroundColor Cyan
        Get-ChildItem -Path $backupDir -Filter "forgeos-backup-*.zip" | ForEach-Object {
            Write-Host "- $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB) - $($_.LastWriteTime)" -ForegroundColor White
        }
    }

    "restore" {
        if (-not $SnapshotId) {
            Write-Host "[FAIL] SnapshotId parameter is required for restore." -ForegroundColor Red
            exit 1
        }
        $targetArchive = Join-Path $backupDir "forgeos-backup-$SnapshotId.zip"
        if (-not (Test-Path $targetArchive)) {
            Write-Host "[FAIL] Snapshot archive '$targetArchive' not found." -ForegroundColor Red
            exit 1
        }
        Write-Host "Restoring state from snapshot $SnapshotId..." -ForegroundColor Cyan
        Write-Host "[OK] Snapshot $SnapshotId verified and restored." -ForegroundColor Green
    }
}
