#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$RANG/../../man-cai-dat-noi-tieng-viet/rang"
export KHO_CHUOI="apps/app/lib/messages/settings-thanh-vien.ts"
export KHOA_MOC="vaiTro"
export GIA_TRI_MOC="Vai trò"
export CHAN_MAN="$RANG/man-that.mjs"
exec bash "$LIB/be-rong-do-lib.sh" "$@"
