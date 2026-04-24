#!/usr/bin/env bash
# Cloudflare Pages — use repo root as project root, or keep "frontend" as root and use npm run build there.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
# Reproducible frontend install + Vite build → frontend/dist
npm run build:ci