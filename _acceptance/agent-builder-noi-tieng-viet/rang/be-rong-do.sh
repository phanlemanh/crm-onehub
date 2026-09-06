#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$RANG/../../man-cai-dat-noi-tieng-viet/rang"
export KHO_CHUOI="apps/app/lib/messages/agent-builder-khung.ts"
export KHOA_MOC="tacNhanCuaDoi"
export GIA_TRI_MOC="Tác nhân của đội"
export CHAN_MAN="$RANG/man-that.mjs"
exec bash "$LIB/be-rong-do-lib.sh" "$@"

# GHI CHU 06/09: chan nay CHUA CHUNG DUOC tren lat nay. Hai route dung duoc
# (/chat va /agents) chi co 10 nhan dich duoc, va ca 10 deu nam trong hop cho
# XUONG DONG — cam mot nhan dai vao thi chu wrap chu khong tran, nen "vi tran ma
# en vua" van bang 0. Day dung la gioi han ke thua da khai cua chan be-rong (mu
# voi vung cho xuong dong). Man co nhan trong hop hep la /agents/[agentId], ma
# route do lai dang cho quyet dinh ve cach gieo mot tac nhan that.
