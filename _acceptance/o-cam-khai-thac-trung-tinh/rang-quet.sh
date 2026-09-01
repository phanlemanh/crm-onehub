#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AGX="$(node "$ROOT/scripts/resolve-plugin.mjs" --plugin acceptance-gate --require scripts/start-scan.mjs)" || {
  echo "khong giai duoc plugin acceptance-gate"
  exit 2
}

OUT="$(node "$AGX/scripts/start-scan.mjs" --root "$ROOT")" || { echo "bo quet chet"; exit 1; }

node -e '
const d = JSON.parse(process.argv[1]);
const bad = [];
if (d.config !== true) bad.push("bo quet khong doc duoc config");
if (!Array.isArray(d.broken)) bad.push("thieu danh sach ho so hong");
else if (d.broken.length) bad.push("ho so hong: " + d.broken.map((b) => b.slug).join(", "));
if (d.map.fresh !== true) bad.push("ban do lech voi ho so, map.fresh=" + String(d.map.fresh));
if (d.discovery.brainstormSkill !== null) bad.push("o cam khai thac dang cam: " + d.discovery.brainstormSkill);
if (bad.length) {
  for (const b of bad) console.log("  " + b);
  process.exit(1);
}
console.log("bo quet sach: config doc duoc, khong ho so hong, ban do khop, o cam khai thac trong");
' "$OUT"
CODE=$?

[ "$CODE" -ne 0 ] && exit 1

echo "-- chieu do: ban do lech thi phep do phai do"
MUT="$(printf '%s' "$OUT" | sed 's/"fresh":true/"fresh":false/')"
if [ "$MUT" = "$OUT" ]; then
  echo "RANG CUN: khong dung duoc ca lech — bo quet doi hinh dang dau ra"
  exit 1
fi
node -e '
const d = JSON.parse(process.argv[1]);
process.exit(d.map.fresh === true ? 0 : 1);
' "$MUT" && { echo "RANG CUN: ban do lech ma phep do van xanh"; exit 1; }

echo "rang-quet: hai chieu dung"
