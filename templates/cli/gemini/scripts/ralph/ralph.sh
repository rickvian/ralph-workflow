#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname \
  "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Ralph"
echo "⚠️ Ralph can be very token intensive, ensure you have credit limiter!"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "═══ Iteration $i ═══"

  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | gemini --yolo 2>&1 \
    | tee /dev/stderr) || true

  if echo "$OUTPUT" | \
    grep -q "<promise>COMPLETE</promise>"
  then
    echo "✅ Done!"
    exit 0
  fi

  sleep 2
done

echo "⚠️ Max iterations reached"
exit 1
