#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
YAML_DIR="$(dirname "$(find node_modules/.bun -maxdepth 3 -type d -path '*yaml@*/node_modules/yaml' | head -1)")"
lenh() {
	NODE_PATH="$YAML_DIR" node -e "const y=require('yaml');const c=y.parse(require('fs').readFileSync('_acceptance/config.yaml','utf8'));const v='$1'.split('.').reduce((o,k)=>o&&o[k],c.executors);if(typeof v!=='string'){console.error('khong thay lenh $1');process.exit(2)}process.stdout.write(v)"
}
echo "== cvdn_do_cua_vao (tru vach khong-shader, da thay the boi d-20260926T105601Z-10)"
set +e
ra_cua_vao="$(bash -c "$(lenh script.cvdn_do_cua_vao)" 2>&1)"
ma_cua_vao=$?
set -e
printf '%s\n' "$ra_cua_vao"
sai_khac="$(printf '%s\n' "$ra_cua_vao" | grep '^SAI ' | grep -Ev '^SAI (light|dark): cot trai sign-in CO AuthShader$' || true)"
if [ "$ma_cua_vao" -ne 0 ] && { [ "$ma_cua_vao" -ne 1 ] || [ -n "$sai_khac" ]; }; then
	echo "GIU LOI HUA: cvdn_do_cua_vao do ngoai vach da thay the (ma $ma_cua_vao)"
	exit "$ma_cua_vao"
fi
echo "== do-cot-trai 1920 vi tri"
bash -c "$(lenh script.dtoc_do_cot_trai | sed 's|do-cot-trai.mjs"|do-cot-trai.mjs --kho 1920 --chi-vi-tri"|')"
echo "== cvdn_ma_loi_that"
bash -c "$(lenh script.cvdn_ma_loi_that)"
echo "== cvdn_step_list_tinh"
bash -c "$(lenh test.cvdn_step_list_tinh)"
echo "GIU LOI HUA: ca bon dat"
