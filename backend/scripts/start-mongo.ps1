# Start MongoDB locally using project data (no admin/service required)
$mongod = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$dbPath = Join-Path $root "mongo-data\db"
$logPath = Join-Path $root "mongo-data\log"

New-Item -ItemType Directory -Force -Path $dbPath, $logPath | Out-Null

if (-not (Test-Path $mongod)) {
  Write-Error "mongod.exe not found at $mongod. Install MongoDB or set MONGODB_URI to Atlas in backend/.env"
  exit 1
}

Write-Host "Starting MongoDB on 127.0.0.1:27017 ..."
Write-Host "Data: $dbPath"
& $mongod --dbpath $dbPath --logpath (Join-Path $logPath "mongod.log") --bind_ip 127.0.0.1 --port 27017
