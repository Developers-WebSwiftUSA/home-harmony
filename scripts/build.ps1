# Monorepo production build (from repo root). Used on Windows / local.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
npm run build:production
