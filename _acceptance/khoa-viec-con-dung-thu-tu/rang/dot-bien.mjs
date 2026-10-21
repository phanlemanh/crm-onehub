import { spawnSync } from "node:child_process";
import {
	lstatSync,
	mkdirSync,
	readdirSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 2;
const TRAN_MS = 900_000;
const BAI = (t) =>
	`bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/viec-con-khoa.spec.ts -t ${t}"`;
const VCK = {
	doiThu: BAI("vck-doi-thu"),
	dong: BAI("vck-dong"),
	chuyenCha: BAI("vck-chuyen-cha"),
};
const GHI = "packages/db/src/viec-ghi.ts";
const KHOA_DU_AN =
	'\tif (duAnLucDau) {\n\t\tawait tx.$queryRaw`SELECT id FROM "duAn" WHERE id = ${duAnLucDau} FOR UPDATE`;\n\t}\n';
const KHOA_CHA =
	"\tawait tx.$queryRaw`SELECT id FROM viec WHERE id = ${input.chaId} FOR UPDATE`;\n";

const CAP = [
	[
		"a khoa viec cha truoc khoa du an",
		[[GHI, `${KHOA_DU_AN}${KHOA_CHA}`, `${KHOA_CHA}${KHOA_DU_AN}`]],
		[
			[VCK.doiThu, "vck doi thu"],
			[VCK.dong, "vck dong"],
		],
	],
	[
		"b bo loi so du an cua viec cha",
		[
			[
				GHI,
				"\tif (cha.duAnId !== duAnLucDau) throw new LoiChaDoiDuAn();\n",
				"",
			],
		],
		[[VCK.chuyenCha, "vck chuyen cha: mot luot"]],
	],
];

function goiCuaBanSao(banSao, nhom, ten) {
	const nm = join(banSao, nhom, ten, "node_modules");
	if (!lstatSync(nm).isSymbolicLink()) return;
	rmSync(nm);
	mkdirSync(join(nm, "@crm"), { recursive: true });
	const goc = join(GOC, nhom, ten, "node_modules");
	for (const muc of readdirSync(goc)) {
		if (muc !== "@crm") symlinkSync(join(goc, muc), join(nm, muc));
	}
	for (const goi of readdirSync(join(goc, "@crm"))) {
		symlinkSync(join(banSao, "packages", goi), join(nm, "@crm", goi));
	}
}

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra.split("\n").some((d) => d.includes("error:") && d.includes(ghim));

let banSao = null;
const xanh = new Map();
let daChay = 0;
const song = [];
let banSaoDo = false;
try {
	banSao = dungBanSao("vck");
	goiCuaBanSao(banSao, "apps", "api");
	for (const [ten, sua, kiem] of CAP) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = [];
		const sau = [];
		try {
			for (const [tep, cu, moi] of sua)
				traLai.push(thayMotLan(banSao, tep, cu, moi));
			for (const [cmd, ghim] of kiem)
				sau.push({ cmd, ghim, ...lenh(banSao, cmd) });
		} finally {
			for (const tra of traLai.reverse()) tra();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			if (truoc.ma !== 0) {
				console.log(`vck dot bien: ban sao lanh do ${s.cmd}`);
				console.error(truoc.ra.slice(-1500));
				banSaoDo = true;
				continue;
			}
			const chet = s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(
				`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`,
			);
			if (!chet) {
				console.log(`${ten[0]} song`);
				console.error(s.ra.slice(-1500));
				song.push(ten);
			}
		}
	}
} catch (loi) {
	if (banSao !== null) goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
if (banSao !== null) goBanSao(banSao);
if (banSaoDo) process.exit(1);
if (daChay !== SO_CAP_KHAI) {
	console.log(`vck dot bien: chay ${daChay} cap`);
	process.exit(1);
}
console.log(
	`vck dot bien: ${daChay - new Set(song).size}/${daChay} dot bien chet`,
);
process.exit(song.length === 0 ? 0 : 1);
