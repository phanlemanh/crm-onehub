#!/usr/bin/env bash
set -u
GOC_SUA_TRUOC=91fe8d69f
TEP=apps/agent/test/zalo-qua-webhook.integration.spec.ts
MOC_GOC='const GOC = new Date("2026-10-10T02:00:00Z");'
NGUON="$TEP"
if [ "${1:-}" = "--tu-thu" ]; then
	NGUON=$(mktemp)
	git show "$GOC_SUA_TRUOC:$TEP" >"$NGUON" || { echo "KHONG DO DUOC: khong doc duoc ban truoc sua"; exit 2; }
fi
grep -qF "$MOC_GOC" "$NGUON" || { echo "KHONG DO DUOC: khong thay dong GOC goc trong $NGUON"; exit 2; }
sai=0
for MOC in 2020-01-01T02:00:00Z 2030-01-01T02:00:00Z; do
	BAN="apps/agent/test/zalo-moc-$$-${MOC%%-*}.integration.spec.ts"
	sed "s|$MOC_GOC|const GOC = new Date(\"$MOC\");|" "$NGUON" >"$BAN"
	trap 'rm -f apps/agent/test/zalo-moc-$$-*.integration.spec.ts' EXIT
	ra=$(cd apps/agent && bun test "./test/$(basename "$BAN")" 2>&1)
	ma=$?
	rm -f "$BAN"
	pass=$(printf '%s\n' "$ra" | grep -Eo '^ *[0-9]+ pass$' | tr -dc '0-9')
	fail=$(printf '%s\n' "$ra" | grep -Eo '^ *[0-9]+ fail$' | tr -dc '0-9')
	printf '%s\n' "$ra" | grep -E '^\(fail\)' | sed "s/^/  /"
	echo "GOC $MOC: ${pass:-?} pass ${fail:-?} fail (ma $ma)"
	[ "$ma" -eq 0 ] && [ "${fail:-1}" = "0" ] && [ "${pass:-0}" = "32" ] || sai=1
done
[ "$NGUON" != "$TEP" ] && rm -f "$NGUON"
if [ "$sai" -ne 0 ]; then
	echo "hai-moc: phu thuoc gio that"
	exit 1
fi
echo "hai-moc: DUNG — 32/32 o ca hai moc"
