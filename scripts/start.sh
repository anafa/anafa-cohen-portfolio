#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$ROOT_DIR/frontend"
PID_FILE="$SCRIPT_DIR/.server.pid"
LOG_FILE="$SCRIPT_DIR/.server.log"
PORT=8000

if [ -f "$PID_FILE" ]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  if tasklist //FI "PID eq $EXISTING_PID" //NH 2>/dev/null | grep -q "$EXISTING_PID"; then
    echo "Dev server already running (PID $EXISTING_PID) at http://localhost:$PORT/"
    exit 0
  fi
fi

# Mirrors what Netlify's build step does: copy content/cv.json into
# frontend/content/cv.json so frontend/ is a fully self-contained site
# root (matches the Netlify publish directory). frontend/content/ is
# gitignored — this copy is a build/dev artifact, content/cv.json at the
# project root stays the single source of truth.
mkdir -p "$FRONTEND_DIR/content"
cp "$ROOT_DIR/content/cv.json" "$FRONTEND_DIR/content/cv.json"

# We track the real Windows PID (not bash's $!) because Git Bash's MSYS
# runtime assigns its own virtual PID numbers that are only valid within
# that one bash session — a PID recorded by one start.sh invocation can
# refer to a totally different (or no) process by the time a later
# stop.sh invocation (a fresh bash session) tries to use it, silently
# leaking the server. The real Windows PID (ps's WINPID column) is stable
# and can be killed reliably with taskkill from any shell.
python -m http.server "$PORT" --directory "$FRONTEND_DIR" > "$LOG_FILE" 2>&1 &
MSYS_PID=$!
sleep 0.3
WIN_PID="$(ps -p "$MSYS_PID" | tail -1 | awk '{print $4}')"
echo "$WIN_PID" > "$PID_FILE"

echo "Dev server started at http://localhost:$PORT/ (PID $WIN_PID)"
