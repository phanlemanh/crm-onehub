#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$RANG/../../man-cai-dat-noi-tieng-viet/rang"
export NGUOI="${NGUOI:-dev@localhost}"
export KHO_CHUOI="apps/app/lib/messages/tong-quan.ts"
export KHOA_MOC="deal"
export GIA_TRI_MOC="Thoả thuận"
export THUT=$'\t\t\t'
export CHAN_MAN="$RANG/man-that.mjs"
exec bash "$LIB/be-rong-do-lib.sh" "$@"
