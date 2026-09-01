#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-config: dùng --chan doi|o-cam"; exit 2; }

FIX="$(mktemp -d)"
trap 'rm -rf "$FIX"' EXIT

detect_doi() {
  node -e '
const fs = require("node:fs");
const text = fs.readFileSync(process.argv[1], "utf8");
const bad = [];
let inExecutors = false;
for (const line of text.split("\n")) {
  const indent = line.length - line.trimStart().length;
  if (indent === 0) inExecutors = line.startsWith("executors:");
  if (!inExecutors || indent === 0) continue;
  const value = line.split(":").slice(1).join(":");
  if (/\/Users\/|\/home\//.test(value)) bad.push(line.trim());
  else if (/\/\d+\.\d+\.\d+\//.test(value)) bad.push(line.trim());
}
if (bad.length) {
  console.log("duong dan ghi cung trong executors: " + bad.length);
  for (const b of bad) console.log("    " + b);
  process.exit(1);
}
console.log("executors sach: khong duong dan tuyet doi, khong so hieu phien ban");
' "$1"
}

detect_o_cam() {
  node -e '
const fs = require("node:fs");
const path = require("node:path");
const { resolveConfigKey } = require(path.join(process.argv[2], "lib", "evidence-core.cjs"));
const text = fs.readFileSync(process.argv[1], "utf8");
const keys = [
  "feature_loop.ui_standards_skill",
  "design_pass.ds_skill",
];
const missing = keys.filter((k) => !resolveConfigKey(text, k));
if (missing.length) {
  console.log("o cam thiet ke trong: " + missing.join(", "));
  process.exit(1);
}
console.log("hai o cam thiet ke deu doc ra ten skill");
' "$1" "$2"
}

case "$CHAN" in
  doi)
    echo "-- chieu duong: config that"
    detect_doi "$ROOT/_acceptance/config.yaml" || exit 1
    echo "-- chieu do: fixture co duong dan ghi cung"
    sed 's#node \${CLAUDE_PLUGIN_ROOT}/scripts/product-map.mjs#node /Users/ai/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.5.0/scripts/product-map.mjs#' \
      "$ROOT/_acceptance/config.yaml" > "$FIX/config.yaml"
    if detect_doi "$FIX/config.yaml"; then
      echo "RANG CUN: fixture co duong dan ghi cung ma phep do van xanh"
      exit 1
    fi
    echo "rang-config doi: hai chieu dung"
    ;;
  o-cam)
    echo "-- chieu duong: config that"
    detect_o_cam "$ROOT/_acceptance/config.yaml" "$ROOT" || exit 1
    echo "-- chieu do: fixture bo mot o cam thiet ke"
    grep -v "ui_standards_skill" "$ROOT/_acceptance/config.yaml" > "$FIX/config.yaml"
    if detect_o_cam "$FIX/config.yaml" "$ROOT"; then
      echo "RANG CUN: fixture thieu o cam thiet ke ma phep do van xanh"
      exit 1
    fi
    echo "-- chieu trung tinh: fixture CO khai o cam khai thac"
    {
      printf 'discovery:\n  brainstorm_skill: mot-skill-nao-do\n'
      cat "$ROOT/_acceptance/config.yaml"
    } > "$FIX/config.yaml"
    if ! detect_o_cam "$FIX/config.yaml" "$ROOT"; then
      echo "RANG SAI: o cam khai thac la trung tinh, khai no khong duoc tinh la loi"
      exit 1
    fi
    echo "rang-config o-cam: ba chieu dung"
    ;;
  khai-thac)
    echo "-- chieu duong: config that phai doc ra RONG"
    V="$(node -e '
const path = require("node:path");
const { resolveConfigKey } = require(path.join(process.argv[2], "lib", "evidence-core.cjs"));
const text = require("node:fs").readFileSync(process.argv[1], "utf8");
const v = resolveConfigKey(text, "discovery.brainstorm_skill");
process.stdout.write(v == null ? "" : String(v));
' "$ROOT/_acceptance/config.yaml" "$ROOT")"
    if [ -n "$V" ]; then
      echo "o cam khai thac dang cam: $V — kit noi o nay trung tinh, de trong"
      exit 1
    fi
    echo "o cam khai thac dang trong, dung nhu kit mac dinh"
    echo "-- chieu do: fixture CO khai thi phai doc ra duoc"
    {
      printf 'discovery:\n  brainstorm_skill: mot-skill-nao-do\n'
      cat "$ROOT/_acceptance/config.yaml"
    } > "$FIX/config.yaml"
    V="$(node -e '
const path = require("node:path");
const { resolveConfigKey } = require(path.join(process.argv[2], "lib", "evidence-core.cjs"));
const text = require("node:fs").readFileSync(process.argv[1], "utf8");
const v = resolveConfigKey(text, "discovery.brainstorm_skill");
process.stdout.write(v == null ? "" : String(v));
' "$FIX/config.yaml" "$ROOT")"
    if [ "$V" != "mot-skill-nao-do" ]; then
      echo "RANG CUN: fixture co khai ma bo doc khong thay — phep do khong do gi"
      exit 1
    fi
    echo "rang-config khai-thac: hai chieu dung"
    ;;
  *)
    echo "rang-config: chan la $CHAN"
    exit 2
    ;;
esac
