#!/usr/bin/env bash
# Monorepo production build (from repo root). Used by CI / Linux / macOS.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
npm run build:production
