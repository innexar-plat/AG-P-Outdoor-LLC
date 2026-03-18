#!/bin/sh
set -e
if [ ! -d /app/node_modules/.bin ] || [ ! -f /app/node_modules/.package-lock.json ]; then
  echo "[docker-dev] Installing dependencies..."
  npm install --legacy-peer-deps
fi
exec "$@"
