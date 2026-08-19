#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.server.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No PID file found; dev server may not be running."
  exit 0
fi

# PID_FILE holds a real Windows PID (see start.sh) — use taskkill, not
# bash's kill, since MSYS PID numbers aren't valid across bash sessions.
WIN_PID="$(cat "$PID_FILE")"
if tasklist //FI "PID eq $WIN_PID" //NH 2>/dev/null | grep -q "$WIN_PID"; then
  taskkill //F //PID "$WIN_PID" > /dev/null
  echo "Stopped dev server (PID $WIN_PID)."
else
  echo "No process found with PID $WIN_PID."
fi
rm -f "$PID_FILE"
