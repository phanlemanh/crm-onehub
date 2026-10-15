#!/usr/bin/env bash
set -euo pipefail
GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$GOC"
SLUG=lo-trinh-dong-bo-ho-so
NHANH="${NHANH:-origin/onehub}"
if [ -n "${NEN:-}" ]; then
	echo "$NEN"
	exit 0
fi
if ! git rev-parse --verify -q "$NHANH" >/dev/null; then
	echo "KHONG DO DUOC: khong co ref $NHANH — chay git fetch origin onehub"
	exit 2
fi
dau=$(git log --diff-filter=A --format=%H -- "_acceptance/$SLUG/contract.md" | tail -1)
if [ -z "$dau" ]; then
	echo "KHONG DO DUOC: khong tim thay commit dau them _acceptance/$SLUG/contract.md"
	exit 2
fi
if ! git merge-base --is-ancestor "$dau" "$NHANH"; then
	git merge-base HEAD "$NHANH"
	exit 0
fi
m=$(git rev-list --first-parent "$dau..$NHANH" | grep -Fxf <(git rev-list --ancestry-path "$dau..$NHANH") | tail -1 || true)
if [ -z "$m" ]; then
	echo "KHONG DO DUOC: khong tim thay merge dua ho so len $NHANH"
	exit 2
fi
read -r _ cha1 cha2 <<<"$(git rev-list --parents -n 1 "$m")"
if [ -z "${cha2:-}" ]; then
	echo "KHONG DO DUOC: ${m:0:9} khong phai merge — ho so len $NHANH khong qua PR"
	exit 2
fi
echo "$(git merge-base "$cha1" "$cha2") $cha2"
