#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/../../../apps/app" || exit 2
export TZ=Asia/Ho_Chi_Minh
NAP=../../packages/ui/test/setup-dom.ts
bun test --preload "$NAP" ./test/nen-kara-man-cu.dom.tsx -t tom-tat || exit $?
bun test --preload "$NAP" ./test/tro-ly-okr-tom-tat.dom.tsx
