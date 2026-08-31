#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-t1-escape: dùng --chan chan|im"; exit 2; }

WT="$(mktemp -d)/wt"
cleanup() { git -C "$ROOT" worktree remove --force "$WT" >/dev/null 2>&1; rm -rf "$(dirname "$WT")"; }
trap cleanup EXIT

git -C "$ROOT" worktree add -q --detach "$WT" HEAD || { echo "khong dung duoc worktree"; exit 2; }

case "$CHAN" in
  chan)
    NONCE="apps/api/src/rang-t1-escape-$$.ts"
    printf 'export const nonce = %s;\n' "$$" > "$WT/$NONCE"
    ;;
  im)
    NONCE="docs/rang-t1-escape-$$.md"
    printf '# nonce %s\n' "$$" > "$WT/$NONCE"
    ;;
  *)
    echo "rang-t1-escape: chan la $CHAN"
    exit 2
    ;;
esac

git -C "$WT" add "$NONCE" >/dev/null
git -C "$WT" -c user.email=rang@local -c user.name=rang commit -q -m "rang: $NONCE" || { echo "khong commit duoc"; exit 2; }

OUT="$(bash "$WT/scripts/pre-merge-check.sh" "$WT" --base HEAD^ 2>&1)"
CODE=$?

echo "$OUT" | tail -4

if [ "$CHAN" = "chan" ]; then
  if [ "$CODE" -eq 0 ]; then
    echo "RANG CUN: file khong phai T1 khong kem ho so ma cong van cho qua"
    exit 1
  fi
  if ! printf '%s' "$OUT" | grep -q 'VIOLATION \[PR\]'; then
    echo "RANG CUN: cong chan nhung khong in VIOLATION [PR]"
    exit 1
  fi
  echo "rang-t1-escape chan: cong chan dung, exit $CODE"
  exit 0
fi

if [ "$CODE" -ne 0 ]; then
  echo "RANG CUN: diff chi cham file T1 ma cong van chan, exit $CODE"
  exit 1
fi
if printf '%s' "$OUT" | grep -q 'VIOLATION \[PR\]'; then
  echo "RANG CUN: diff chi cham file T1 ma van co VIOLATION [PR]"
  exit 1
fi
echo "rang-t1-escape im: cong im dung, exit 0"
