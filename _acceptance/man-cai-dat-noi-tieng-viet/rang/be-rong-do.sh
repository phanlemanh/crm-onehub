#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export KHO_CHUOI="apps/app/lib/messages/settings.ts"
export KHOA_MOC="daCam"
export GIA_TRI_MOC="Đã cắm"
export CHAN_MAN="$RANG/man-that.mjs"
exec bash "$RANG/be-rong-do-lib.sh" "$@"
