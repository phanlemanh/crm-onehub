#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$RANG/../../man-cai-dat-noi-tieng-viet/rang"
export KHO_CHUOI="apps/app/lib/messages/agent-builder-khung.ts"
export KHOA_MOC="tacNhanCuaDoi"
export GIA_TRI_MOC="Tác nhân của đội"
export CHAN_MAN="$RANG/man-that.mjs"
exec bash "$LIB/be-rong-do-lib.sh" "$@"
