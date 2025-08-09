#!/usr/bin/env bash
set -euo pipefail

# Node & package managers assumed; Codex universal image has basics.
corepack enable || true

# Respect proxy cert if provided
if [ -n "${CODEX_PROXY_CERT:-}" ]; then
  export NODE_EXTRA_CA_CERTS="$CODEX_PROXY_CERT"
  export PIP_CERT="$CODEX_PROXY_CERT"
fi

# Install deps
pnpm install

# Optional: install CLIs you use in CI
# pnpm dlx prisma generate || true

# Print versions for debugging
node -v
pnpm -v

# Do not export secrets here; Codex passes env at runtime.