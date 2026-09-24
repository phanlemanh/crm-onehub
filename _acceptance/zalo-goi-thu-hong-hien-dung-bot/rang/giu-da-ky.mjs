import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VONG } from "./cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KHONG_DOI = [
	"apps/agent/test/nhac-qua-zalo.integration.spec.ts",
	"apps/agent/test/zalo-qua-webhook.integration.spec.ts",
];
const SPEC_VONG_2 = "apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts";
const CA_DUOC_SUA = ['test("goi-nguoc: b', 'test("goi-nguoc: c'];
const VE_DUOC_SUA = ["outcome", "webhook"];
const LUOT_TEST = [
	"cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts test/zalo-qua-webhook.integration.spec.ts test/noi-zalo-cho-nguoi-moi.integration.spec.ts",
	"cd apps/api && bun test test/noi-zalo-cho-nguoi-moi.spec.ts test/noi-zalo-cau-noi.spec.ts",
];

const git = (...args) =>
	execFileSync("git", ["-C", GOC, ...args], { encoding: "utf8" });

function daiCuaCa(goc) {
	const dong = goc.split("\n");
	return CA_DUOC_SUA.map((mo) => {
		const dau = dong.findIndex((d) => d.includes(mo));
		if (dau < 0) throw new Error(`khong thay ca ${mo} o ${VONG.truoc}`);
		const ke = dong.findIndex((d, i) => i > dau && /^\s*test\(/.test(d));
		return { tu: dau + 1, den: ke < 0 ? dong.length : ke };
	});
}

export function viPhamDiff(diff, dai) {
	const viPham = [];
	let trongDai = false;
	for (const dong of diff.split("\n")) {
		const dau = /^@@ -(\d+)(?:,(\d+))? /.exec(dong);
		if (dau) {
			const tu = Number(dau[1]);
			const so = dau[2] === undefined ? 1 : Number(dau[2]);
			const den = tu + Math.max(so, 1) - 1;
			trongDai = dai.some((d) => tu >= d.tu && den <= d.den);
			if (!trongDai) viPham.push(`sua ngoai goi-nguoc b/c: ${dong}`);
			continue;
		}
		if (dong.startsWith("+++") || dong.startsWith("---")) continue;
		if (!dong.startsWith("+") && !dong.startsWith("-")) continue;
		if (!VE_DUOC_SUA.some((ve) => dong.includes(ve))) {
			viPham.push(`sua ngoai goi-nguoc b/c: ${dong}`);
		}
	}
	return viPham;
}

let loi = 0;
const bao = (dong) => {
	console.error(dong);
	loi += 1;
};

for (const tep of KHONG_DOI) {
	if (git("diff", VONG.truoc, VONG.sau, "--", tep).trim() !== "")
		bao(`spec da ky bi sua: ${tep}`);
}

const dai = daiCuaCa(git("show", `${VONG.truoc}:${SPEC_VONG_2}`));
const diffThat = git("diff", "-U0", VONG.truoc, VONG.sau, "--", SPEC_VONG_2);
for (const v of viPhamDiff(diffThat, dai)) bao(v);

const diffPha = `${diffThat}\n@@ -1 +1 @@\n-import a\n+import b\n`;
if (viPhamDiff(diffPha, dai).length === 0) {
	bao("tu kiem hong: chen mot dong doi o ngoai hai ca ma thuoc van xanh");
}

if (loi > 0) process.exit(1);

for (const lenh of LUOT_TEST) {
	execFileSync("bun", ["run", "test", "--", lenh], {
		cwd: GOC,
		stdio: "inherit",
	});
}
console.log("giu-da-ky: hai spec da ky nguyen, spec vong 2 chi doi goi-nguoc b/c, 5 tep xanh");
