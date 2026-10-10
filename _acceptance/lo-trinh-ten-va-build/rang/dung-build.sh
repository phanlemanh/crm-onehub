#!/usr/bin/env bash
set -u
TRAN_TEP=2000
GOC=$(git rev-parse --show-toplevel)
cd "$GOC" || exit 2
LK=apps/agent/test/fixtures/eve-mau/node_modules/@mau/agent
TAO=0
if [ ! -L "$LK" ]; then
	mkdir -p "$(dirname "$LK")" && ln -s "$GOC/apps/agent" "$LK" || { echo "KHONG DO DUOC: khong tao duoc symlink vong"; exit 2; }
	TAO=1
fi
don() { [ "$TAO" = 1 ] && rm -f "$LK" && rmdir -p "$(dirname "$LK")" 2>/dev/null; true; }
trap don EXIT
echo "symlink vong: $LK -> $(readlink "$LK")"
LOG=$(mktemp)
bunx turbo run build --force --filter=app >"$LOG" 2>&1
MA=$?
grep -iE "infinite loop|Failed to write app endpoint" "$LOG" | head -3
echo "build app ma $MA"
NFT=$(find apps/app/.next/server/app -path "*lo-trinh*page.js.nft.json" | head -1)
[ -n "$NFT" ] || { [ "$MA" -ne 0 ] && echo "dung-build: build do khi co symlink vong" && exit 1; echo "KHONG DO DUOC: khong thay nft cua trang lo trinh"; exit 2; }
SO=$(node -e 'const f=require(process.argv[1]).files;console.log(f.length)' "$PWD/$NFT")
MANG=$(node -e 'const f=require(process.argv[1]).files;console.log(f.filter(x=>x.endsWith("/LO-TRINH.html")).length)' "$PWD/$NFT")
AGENT=$(node -e 'const f=require(process.argv[1]).files;console.log(f.filter(x=>x.includes("apps/agent/")).length)' "$PWD/$NFT")
echo "nft trang lo trinh: $SO tep, mang LO-TRINH.html $MANG, tep apps/agent $AGENT (tran $TRAN_TEP)"
if [ "$MA" -ne 0 ]; then echo "dung-build: build do khi co symlink vong"; exit 1; fi
if [ "$MANG" -lt 1 ]; then echo "dung-build: ban dung khong mang LO-TRINH.html"; exit 1; fi
if [ "$SO" -gt "$TRAN_TEP" ] || [ "$AGENT" -gt 0 ]; then echo "dung-build: ban dung keo theo ca kho"; exit 1; fi
echo "dung-build: DUNG — build xanh khi co symlink vong, ban dung gon va mang LO-TRINH.html"
