import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const RANG = "_acceptance/tro-ly-okr-de-xuat/rang";
const TEP = { doTre: "do-tre.mjs", phien: "phien-tro-ly.mjs" };
const SHA_TRUOC_VONG = "1be143a82d5332f8b63fbc78d38af9d179f3f342";
const BAN = {
	sua: join(GOC, ".acceptance-runs", "eqh-sua", "x"),
	"truoc-vong": join(GOC, ".acceptance-runs", "eqh-truoc", "x"),
};
const LAN = 2;
const ENV_KHOA_SAI = {
	AI_GATEWAY_API_KEY: "sk-khoa-sai-de-do",
	OKR_AI_GATEWAY_API_KEY: "",
};
const VA_HAN_CHO = ["choMoiLuotMs: 3 * PHUT_MS,", "choMoiLuotMs: 1,"];
const LENH_CU = `lenh: "bun ${RANG}/${TEP.doTre}"`;
const DONG_QUA_HAN = new RegExp(
	`${LAN}/${LAN} luot qua .* s chua dong — tinh la do tre`,
);
const HONG_MS = 30000;
const LOI_MODEL = "AI Gateway rejected the provided API key";

function dong(ra) {
	return ra.split("\n");
}

const MONG = {
	sua: {
		ma: 1,
		dung: (ra) =>
			ra.includes("KHONG DAT") &&
			DONG_QUA_HAN.test(ra) &&
			ra.includes(`p50 ${HONG_MS} ms`) &&
			ra.includes(`p90 ${HONG_MS} ms`) &&
			dong(ra)
				.filter((d) => d.startsWith("SAI "))
				.every((d) => d.includes("p50") || d.includes("p90")) &&
			!ra.includes("khong phai do tre"),
	},
	"truoc-vong": { ma: 2, dung: (ra) => ra.includes("khong phai do tre") },
	"khong-qua-han": {
		ma: 2,
		dung: (ra) =>
			ra.includes(`KHONG DO DUOC: ${LAN}/${LAN} luot hong`) &&
			ra.includes("khong phai do tre") &&
			ra.includes(LOI_MODEL) &&
			!/luot qua .* s chua dong — tinh la do tre/.test(ra),
	},
};

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

function bamGit(tep) {
	return git("hash-object", tep).trim();
}

function dungBanSao(ban) {
	const thuMuc = BAN[ban];
	mkdirSync(thuMuc, { recursive: true });
	const doc = (ten) =>
		ban === "sua"
			? readFileSync(join(GOC, RANG, ten), "utf8")
			: git("show", `${SHA_TRUOC_VONG}:${RANG}/${ten}`);
	const tepPhien = join(thuMuc, TEP.phien);
	writeFileSync(tepPhien, doc(TEP.phien));
	let doTre = doc(TEP.doTre);
	for (const cu of [VA_HAN_CHO[0], LENH_CU])
		if (!doTre.includes(cu))
			return { loi: `SAI khong va duoc ${ban}: thieu «${cu}»` };
	const tepDoTre = join(thuMuc, TEP.doTre);
	doTre = doTre
		.replace(VA_HAN_CHO[0], VA_HAN_CHO[1])
		.replace(LENH_CU, `lenh: ${JSON.stringify(`bun ${tepDoTre}`)}`);
	writeFileSync(tepDoTre, doTre);
	console.log(
		`${ban}: ${TEP.phien} ${bamGit(tepPhien)} · ${TEP.doTre} (da va) ${bamGit(tepDoTre)}`,
	);
	return { tep: tepDoTre };
}

function chay(tep) {
	const r = spawnSync("bun", [tep, "--lan", String(LAN)], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, ...ENV_KHOA_SAI },
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

function kiem(ban, r, loi) {
	const mong = MONG[ban];
	const ketLuan =
		dong(r.ra).find((d) => d.startsWith("KHONG")) ?? "(khong co dong ket luan)";
	console.log(`${ban}: ma ${r.ma} (mong ${mong.ma}) · ${ketLuan}`);
	if (r.ma !== mong.ma || !mong.dung(r.ra)) loi.push(`SAI ${ban} ma ${r.ma}`);
}

const loi = [];
if (process.argv.includes("--khong-qua-han")) {
	kiem("khong-qua-han", chay(join(GOC, RANG, TEP.doTre)), loi);
} else {
	try {
		for (const ban of Object.keys(BAN)) {
			const sao = dungBanSao(ban);
			if (sao.loi) {
				loi.push(sao.loi);
				continue;
			}
			kiem(ban, chay(sao.tep), loi);
		}
	} finally {
		for (const thuMuc of Object.values(BAN))
			rmSync(join(thuMuc, ".."), { recursive: true, force: true });
	}
}
for (const l of loi) console.log(l);
console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
process.exit(loi.length === 0 ? 0 : 1);
