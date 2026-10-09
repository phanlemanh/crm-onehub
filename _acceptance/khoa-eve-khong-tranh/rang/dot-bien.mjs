import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 8;
const TRAN_MS = 300_000;
const KD = "apps/agent-okr/test/support/khoi-dong.ts";
const BAI = (t) =>
	`cd apps/agent-okr && bun test test/khoa-eve-khong-tranh.spec.ts -t ${t}`;

const GHI_DE_TAI_CHO = `	const tep = join(khoa, KHOI_DONG.khoa.tep);
	const fs = require("node:fs");
	const fd = fs.openSync(tep, "w");
	giuaGhi?.();
	fs.writeSync(fd, JSON.stringify(chu));
	fs.closeSync(fd);
}`;

const BANG = {
	a: {
		bai: BAI("ghi-tron"),
		cu: "\tconst tam = join(\n\t\tkhoa,\n\t\t`${KHOI_DONG.khoa.tep}${KHOI_DONG.khoa.duoiTam}${randomUUID()}`,\n\t);\n\twriteFileSync(tam, JSON.stringify(chu));\n\tgiuaGhi?.();\n\trenameSync(tam, join(khoa, KHOI_DONG.khoa.tep));\n}",
		moi: GHI_DE_TAI_CHO,
		ghim: "khoa song bi phan cu giua luc ghi",
	},
	b: {
		bai: BAI("hai-luot"),
		cu: "\t\t\t\tawait gianhKhoaCu(khoa, dau);",
		moi: "\t\t\t\tawait dungMoCoi(khoa);\n\t\t\t\trmSync(khoa, { recursive: true, force: true });",
		ghim: "eve cua luot B bi dung",
	},
	c: {
		bai: BAI("hai-luot"),
		cu: "\tif (!cungDau(dau, dauKhoaEve(daGianh))) {",
		moi: "\tif (dau === null) {",
		ghim: "eve cua luot B bi dung",
	},
	d: {
		bai: BAI("mot-luot"),
		cu: "\trmSync(daGianh, { recursive: true, force: true });",
		moi: "",
		ghim: "con thu muc .cu- sau khi don",
	},
	e: {
		bai: BAI("doi-chu"),
		cu: "\tif (chu.ma !== giu.ma) throw new Error(`khoa cua ${goc} da doi chu`);",
		moi: "",
		ghim: "ghi vao khoa nguoi khac",
	},
	f: {
		bai: BAI("doi-chu"),
		cu: "\tfor (const that of new Set(cacGoc.map(thatCua))) goNeuCuaMinh(that);",
		moi: "\tfor (const that of new Set(cacGoc.map(thatCua))) {\n\t\tconst g = khoaDangGiu.get(that);\n\t\tkhoaDangGiu.delete(that);\n\t\tif (g) rmSync(g.khoa, { recursive: true, force: true });\n\t}",
		ghim: "tra khoa go khoa nguoi khac",
	},
	g: {
		bai: BAI("doi-chu"),
		cu: "\tfor (const that of [...khoaDangGiu.keys()]) goNeuCuaMinh(that);",
		moi: "\tfor (const g of khoaDangGiu.values()) rmSync(g.khoa, { recursive: true, force: true });",
		ghim: "don luc thoat go khoa nguoi khac",
	},
	h: {
		bai: BAI("so-dau"),
		cu: "\treturn a.ino === b.ino && a.mtimeMs === b.mtimeMs && a.ma === b.ma;",
		moi: "\treturn a.ino === b.ino && a.ma === b.ma;",
		ghim: "ino trung coi la cung khoa",
	},
};

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i > 0 ? process.argv[i + 1] : undefined;
};
const lap = Number(doiSo("--lap") ?? 1);
const cacCap = (doiSo("--cap") ?? Object.keys(BANG).join(",")).split(",");

function chay(cwd, lenh) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const trungGhim = (ra, ghim) =>
	ra
		.split("\n")
		.some((d) => /^(error|[A-Za-z]*Error):/.test(d) && d.includes(ghim));

const banSao = dungBanSao("kekt-dot-bien");
const ketQua = [];
try {
	for (const ten of cacCap) {
		const cap = BANG[ten];
		if (!cap) throw new KhongDo(`khong co cap ${ten}`);
		const dem = { xanh: 0, do: 0, ghim: 0 };
		for (let n = 0; n < lap; n++) if (chay(banSao, cap.bai).ma === 0) dem.xanh++;
		const traLai = thayMotLan(banSao, KD, cap.cu, cap.moi);
		try {
			for (let n = 0; n < lap; n++) {
				const sau = chay(banSao, cap.bai);
				if (sau.ma !== 0) dem.do++;
				if (trungGhim(sau.ra, cap.ghim)) dem.ghim++;
			}
		} finally {
			traLai();
		}
		ketQua.push({ ten, ...dem });
		console.log(
			lap === 1
				? `${ten} xanh=${dem.xanh === 1 ? 0 : 1} do=${dem.do === 1 ? 1 : 0} ghim=${dem.ghim === 1 ? "ok" : "thieu"}`
				: `${ten} xanh ${dem.xanh}/${lap} do ${dem.do}/${lap} ghim ${dem.ghim}/${lap}`,
		);
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
const hong = ketQua.filter((k) => k.xanh < lap || k.do < lap || k.ghim < lap);
if (lap === 1 && ketQua.length !== SO_CAP_KHAI) {
	console.log(`da chay ${ketQua.length} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`DOT BIEN: ${ketQua.length - hong.length}/${ketQua.length} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
