#!/usr/bin/env bash
set -uo pipefail
set -m

CA="${1:?thieu ca: bat hoac tat}"
GOC="$(cd "$(dirname "$0")/../../.." && pwd)"
CONG_APP=3300
CONG_API=3301
APP="http://localhost:${CONG_APP}"
API="http://localhost:${CONG_API}"
KHOA="${GOC}/.acceptance-runs/quen-mat-khau/cong.khoa"
NHAT_KY="${GOC}/.acceptance-runs/quen-mat-khau/may-chu-${CA}.log"
CHO_KHOA_GIAY=900
CHO_MAY_GIAY=240
PID_API=""
PID_APP=""

mkdir -p "$(dirname "$KHOA")"

da_cho=0
until mkdir "$KHOA" 2>/dev/null; do
	if [ "$da_cho" -ge "$CHO_KHOA_GIAY" ]; then
		echo "KHONG DO DUOC: cho khoa cong qua ${CHO_KHOA_GIAY} giay (${KHOA})"
		exit 2
	fi
	sleep 5
	da_cho=$((da_cho + 5))
done

don() {
	for pid in "$PID_API" "$PID_APP"; do
		[ -n "$pid" ] && kill -TERM -- "-$pid" 2>/dev/null
	done
	sleep 2
	for pid in "$PID_API" "$PID_APP"; do
		[ -n "$pid" ] && kill -KILL -- "-$pid" 2>/dev/null
	done
	rmdir "$KHOA" 2>/dev/null
}
trap don EXIT

for cong in "$CONG_APP" "$CONG_API"; do
	giu="$(lsof -nP -iTCP:"$cong" -sTCP:LISTEN -t 2>/dev/null | head -1)"
	if [ -n "$giu" ]; then
		echo "KHONG DO DUOC: cong ${cong} dang bi tien trinh ${giu} giu — khong giet tien trinh cua phien khac"
		exit 2
	fi
done

if [ "$CA" = "bat" ]; then
	THU_KHOA="re_test_gia"
	THU_GUI="CRM <no-reply@example.test>"
else
	THU_KHOA=""
	THU_GUI=""
fi

: >"$NHAT_KY"
(cd "$GOC/apps/api" && PORT=$CONG_API APP_URL="${APP},http://127.0.0.1:${CONG_APP}" API_URL="$API" RESEND_API_KEY="$THU_KHOA" MAIL_FROM="$THU_GUI" exec bun run dev) >>"$NHAT_KY" 2>&1 &
PID_API=$!
(cd "$GOC/apps/app" && PORT=$CONG_APP NEXT_PUBLIC_API_URL="$API" API_URL="$API" APP_URL="$APP" exec bun run dev) >>"$NHAT_KY" 2>&1 &
PID_APP=$!

da_cho=0
until curl -s -m 20 "${API}/api/trpc/sso.signInOptions" | grep -q '"quenMatKhau"' && [ "$(curl -s -o /dev/null -w '%{http_code}' -m 120 "${APP}/sign-in")" = "200" ]; do
	if [ "$da_cho" -ge "$CHO_MAY_GIAY" ]; then
		echo "KHONG DO DUOC: may chu chua len sau ${CHO_MAY_GIAY} giay — xem ${NHAT_KY}"
		exit 2
	fi
	sleep 5
	da_cho=$((da_cho + 5))
done

cd "$GOC"
APP_URL="$APP" API_URL="$API" bun _acceptance/quen-mat-khau/rang/chup.mjs --ca "$CA"
