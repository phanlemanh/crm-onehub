import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const RANG = join(GOC, "_acceptance/tro-ly-okr-de-xuat/rang");
const TEP = "_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs";
const SHA_TRUOC_VONG = "1be143a82d5332f8b63fbc78d38af9d179f3f342";
const THU_MUC = join(GOC, ".acceptance-runs", "e24-qua-han-khong-phai-ha-tang", "x");
const LAN = 2;
const ENV_KHOA_SAI = {
	AI_GATEWAY_API_KEY: "sk-khoa-sai-de-do",
	OKR_AI_GATEWAY_API_KEY: "",
};
const VA = [
	["choMoiLuotMs: 3 * PHUT_MS,", "choMoiLuotMs: 1,"],
	['from "./phien-tro-ly.mjs"', `from ${JSON.stringify(join(RANG, "phien-tro-ly.mjs"))}`],
	[
		'from "../../../packages/db/src/okr-tro-ly-danh-muc.ts"',
		`from ${JSON.stringify(join(GOC, "packages/db/src/okr-tro-ly-danh-muc.ts"))}`,
	],
];
const DONG_QUA_HAN = new RegExp(`${LAN}/${LAN} luot qua .* s chua dong — tinh la do tre`);
const MONG = {
	sua: {
		ma: 1,
		dung: (ra) =>
			ra.includes("KHONG DAT") && DONG_QUA_HAN.test(ra) && !ra.includes("khong phai do tre"),
	},
	"truoc-vong": { ma: 2, dung: (ra) => ra.includes("khong phai do tre") },
};

function vaBanSao(ten, nguon) {
	let ra = nguon;
	for (const [cu, moi] of VA) {
		if (!ra.includes(cu)) return { loi: `SAI khong va duoc ${ten}: thieu «${cu}»` };
		ra = ra.replace(cu, moi);
	}
	const tep = join(THU_MUC, `do-tre-${ten}.mjs`);
	const lenhCu = 'lenh: "bun _acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs"';
	if (!ra.includes(lenhCu)) return { loi: `SAI khong va duoc ${ten}: thieu «${lenhCu}»` };
	ra = ra.replace(lenhCu, `lenh: ${JSON.stringify(`bun ${tep}`)}`);
	writeFileSync(tep, ra);
	return { tep };
}

function nguonTruocVong() {
	const r = spawnSync("git", ["show", `${SHA_TRUOC_VONG}:${TEP}`], {
		cwd: GOC,
		encoding: "utf8",
	});
	if (r.status !== 0) throw new Error(`git show ${SHA_TRUOC_VONG}: ${r.stderr}`);
	return r.stdout;
}

function chay(tep) {
	const r = spawnSync("bun", [tep, "--lan", String(LAN)], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, ...ENV_KHOA_SAI },
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

mkdirSync(THU_MUC, { recursive: true });
const loi = [];
try {
	for (const [ban, nguon] of [
		["sua", readFileSync(join(GOC, TEP), "utf8")],
		["truoc-vong", nguonTruocVong()],
	]) {
		const sao = vaBanSao(ban, nguon);
		if (sao.loi) {
			loi.push(sao.loi);
			continue;
		}
		const r = chay(sao.tep);
		const mong = MONG[ban];
		const ketLuan =
			r.ra.split("\n").find((d) => d.startsWith("KHONG")) ?? "(khong co dong ket luan)";
		const quaHan = r.ra.split("\n").find((d) => DONG_QUA_HAN.test(d)) ?? "(khong co dong qua han)";
		console.log(`${ban}: ma ${r.ma} (mong ${mong.ma}) · ${ketLuan} · ${quaHan}`);
		if (r.ma !== mong.ma || !mong.dung(r.ra)) loi.push(`SAI ${ban} ma ${r.ma}`);
	}
} finally {
	rmSync(THU_MUC, { recursive: true, force: true });
}
for (const l of loi) console.log(l);
console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
process.exit(loi.length === 0 ? 0 : 1);
