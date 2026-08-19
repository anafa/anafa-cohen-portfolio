$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$PidFile = Join-Path $ScriptDir ".server.pid"

if (-not (Test-Path $PidFile)) {
    Write-Host "No PID file found; dev server may not be running."
    exit 0
}

$ServerPid = Get-Content $PidFile

$Process = Get-Process -Id $ServerPid -ErrorAction SilentlyContinue
if ($Process) {
    Stop-Process -Id $ServerPid -Force
    Write-Host "Stopped dev server (PID $ServerPid)."
} else {
    Write-Host "No process found with PID $ServerPid."
}

Remove-Item $PidFile -Force
