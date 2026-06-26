#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname \
  "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Ralph"
echo "⚠️ Ralph can be very token intensive, ensure you have credit limiter!"

COMPLETION_TAG="<promise>COMPLETE</promise>"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "═══ Iteration $i ═══"

  CODEX_STATUS=0
  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | codex exec --dangerously-bypass-approvals-and-sandbox - 2>&1) || CODEX_STATUS=$?

  printf '%s\n' "$OUTPUT"

  if printf '%s\n' "$OUTPUT" | grep -Eiq "usage limit|purchase more credits"; then
    echo "❌ Codex usage limit reached; stopping Ralph"
    exit 2
  fi

  LAST_LINE=$(printf '%s\n' "$OUTPUT" \
    | tr -d '\r' \
    | sed '/^[[:space:]]*$/d' \
    | tail -n 1 \
    | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')

  if [ "$LAST_LINE" = "$COMPLETION_TAG" ]; then
    echo "✅ Done!"
    exit 0
  fi

  if [ "$CODEX_STATUS" -ne 0 ]; then
    echo "❌ Codex exited with status $CODEX_STATUS; stopping Ralph"
    exit "$CODEX_STATUS"
  fi

  sleep 2
done

echo "⚠️ Max iterations reached"
exit 1
