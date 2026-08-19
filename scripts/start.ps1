$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$RootDir = Split-Path -Parent $ScriptDir
$FrontendDir = Join-Path $RootDir "frontend"
$PidFile = Join-Path $ScriptDir ".server.pid"
$Port = 8000

if (Test-Path $PidFile) {
    $ExistingPid = Get-Content $PidFile
    if (Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue) {
        Write-Host "Dev server already running (PID $ExistingPid) at http://localhost:$Port/"
        exit 0
    }
}

# Mirrors what Netlify's build step does: copy content/cv.json into
# frontend/content/cv.json so frontend/ is a fully self-contained site
# root (matches the Netlify publish directory). frontend/content/ is
# gitignored — this copy is a build/dev artifact, content/cv.json at the
# project root stays the single source of truth.
$FrontendContentDir = Join-Path $FrontendDir "content"
New-Item -ItemType Directory -Force -Path $FrontendContentDir | Out-Null
Copy-Item -Path (Join-Path $RootDir "content\cv.json") -Destination (Join-Path $FrontendContentDir "cv.json") -Force

$Process = Start-Process -FilePath "python" `
    -ArgumentList "-m", "http.server", $Port, "--directory", $FrontendDir `
    -WindowStyle Hidden -PassThru

Set-Content -Path $PidFile -Value $Process.Id

Write-Host "Dev server started at http://localhost:$Port/ (PID $($Process.Id))"
