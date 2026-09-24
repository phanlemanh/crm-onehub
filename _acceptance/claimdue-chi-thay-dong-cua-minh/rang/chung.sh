HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../../.." && pwd)
AGENT="$ROOT/apps/agent"
KHOI="claimDue,retireExhausted,completeTask"

dung_guong() {
	g=$(mktemp -d "${TMPDIR:-/tmp}/claimdue-guong.XXXXXX")
	mkdir -p "$g/test"
	ln -s "$AGENT/node_modules" "$g/node_modules"
	ln -s "$AGENT/agent" "$g/agent"
	cp "$HERE/hang-xom.preload.ts" "$HERE/gieo.ts" "$g/"
	echo "$g"
}

dem_bai() {
	grep -cE '^[[:space:]]*it\(' "$1"
}

chay_junit() {
	thu_muc=$1
	ra=$2
	shift 2
	(cd "$thu_muc" && NODE_ENV=test CRM_TELEMETRY_DISABLED=1 bun test "$@" --reporter=junit --reporter-outfile="$ra" >"$ra.log" 2>&1)
}
