import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const GOC = join(ROOT, "apps/agent/agent");
const args = process.argv.slice(2);
const them = args.includes("--them") ? [args[args.indexOf("--them") + 1]] : [];

const DA_XEP = {
	"lib/custom-agent-dispatch.ts#dispatchAgentRun": "AC-8, AC-9",
	"lib/custom-agent-dispatch.ts#builderSessionAuthFromRow": "AC-10",
	"lib/app-auth.ts#APP_AUTH": "AC-10",
	"lib/zalo-config.ts#ZALO": "AC-10",
	"lib/zalo-hoi.ts#hoiTacTu": "AC-10",
	"channels/eve.ts#repFromCrm": "AC-10",
	"lib/run-runtime.ts#postRunSlackMessage": "AC-1..AC-7",
	"lib/run-runtime.ts#sendSlackMessage": "AC-1..AC-7",
	"lib/nhac-ke-hoach.ts#guiSlackRieng":
		"ngoài phạm vi: tin nhắc gửi riêng cho chính người nhận",
};

function tep(dir) {
	return readdirSync(dir).flatMap((ten) => {
		const duong = join(dir, ten);
		if (statSync(duong).isDirectory()) return tep(duong);
		return duong.endsWith(".ts") ? [duong] : [];
	});
}

const KHAI_BAO =
	/^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+))/;
const CHO = [
	/authenticator:\s*(?!string\b)[^\s;]/,
	/(?<!function\s)thanhVienPrincipal\(/,
	/(?<!function\s)sendSlackMessage\(/,
	/"chat\.postMessage"/,
];

const tim = new Set();
for (const duong of [...tep(GOC), ...them]) {
	let bao = "(top)";
	for (const dong of readFileSync(duong, "utf8").split("\n")) {
		const khai = dong.match(KHAI_BAO);
		if (khai) bao = khai[1] ?? khai[2];
		if (CHO.some((re) => re.test(dong))) {
			const ten = them.includes(duong) ? duong : relative(GOC, duong);
			tim.add(`${ten}#${bao}`);
		}
	}
}

const loi = [
	...[...tim].filter((k) => !(k in DA_XEP)).map((k) => `CHUA XEP: ${k}`),
	...Object.keys(DA_XEP)
		.filter((k) => !tim.has(k))
		.map((k) => `KHONG CON: ${k}`),
];
console.log(JSON.stringify([...tim].sort()));
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log(`kiem-ke: ${tim.size}/${Object.keys(DA_XEP).length} chỗ đã xếp`);
