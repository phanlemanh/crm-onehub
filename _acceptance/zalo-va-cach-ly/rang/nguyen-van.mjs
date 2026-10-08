import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SLUG = "zalo-va-cach-ly";
const SHA_GHIM = "0426cc9d0bebd747b1e75eacb3bcd4069ef161e1";
const DUONG_AGENT = "apps/agent/test/zalo-va.integration.spec.ts";
const DUONG_APP = "apps/app/test/zalo-cau-chao-nhan.spec.ts";
const BAN_GHIM = join(
	GOC,
	"_acceptance",
	SLUG,
	"fixtures",
	"zalo-va-truoc.spec.ts.txt",
);

const IMPORT_APP_CU = [
	'import { khungUngDungMessages } from "../../app/lib/messages/khung-ung-dung";\n',
	'import { nhacQuaZaloMessages } from "../../app/lib/messages/nhac-qua-zalo";\n',
];
const IMPORT_APP_MOI = [
	'import { ZALO } from "../../agent/agent/lib/zalo-config";\n',
	'import { khungUngDungMessages } from "../lib/messages/khung-ung-dung";\n',
	'import { nhacQuaZaloMessages } from "../lib/messages/nhac-qua-zalo";\n',
];
const TEN_NHAP = ["ZALO", "khungUngDungMessages", "nhacQuaZaloMessages"];
const KHOI = {
	ham: ["function nhanDieuHuongKhac(): string[] {", "\n}\n"],
	"huong dan": ['\ttest("cau-chao: cau huong dan chi toi', "\n\t});\n"],
	"doi chung": ['\ttest("cau-chao: doi chung, nhan Cài đặt', "\n\t});\n"],
};

const DOT_BIEN = [
	{
		ten: "bo khang dinh doi chung",
		tep: "app",
		cu: "\t\texpect(bat).toBe(true);\n",
		moi: "",
		mongLech: "doi chung",
	},
	{
		ten: "bo khang dinh bai o lai cua agent",
		tep: "agent",
		cu: mau(
			"\t\t\t\t`cau-chao: con chu Thông báo của bạn: @{chu}`,\n\t\t\t).toBe(false);\n",
		),
		moi: mau(
			"\t\t\t\t`cau-chao: con chu Thông báo của bạn: @{chu}`,\n\t\t\t);\n",
		),
		mongLech: "spec agent",
	},
	{
		ten: "thay import bang hang tai cho",
		tep: "app",
		cu: IMPORT_APP_MOI[1],
		moi: 'const khungUngDungMessages = (_: string) => ({ rail: {}, header: { homepage: "", accountMenu: "", nhacBuoiSang: "Nhắc buổi sáng" } });\n',
		mongLech: "import",
	},
];

class KhongDo extends Error {}

function mau(chu) {
	return chu.replaceAll("@{", "${");
}

function dem(chu, con) {
	return chu.split(con).length - 1;
}

function khoi(chu, [dau, cuoi], ten) {
	const i = chu.indexOf(dau);
	if (i < 0 || dem(chu, dau) !== 1)
		throw new KhongDo(
			`khoi ${ten} xuat hien ${dem(chu, dau)} lan trong ban ghim`,
		);
	const j = chu.indexOf(cuoi, i);
	if (j < 0) throw new KhongDo(`khoi ${ten} khong co diem dong`);
	return chu.slice(i, j + cuoi.length);
}

function boMotLan(chu, con, ten) {
	if (dem(chu, con) !== 1)
		throw new KhongDo(`${ten} xuat hien ${dem(chu, con)} lan, can 1`);
	return chu.replace(con, "");
}

function agentMong(ghim) {
	let ra = ghim;
	for (const d of IMPORT_APP_CU) ra = boMotLan(ra, d, "import cu");
	for (const [ten, moc] of Object.entries(KHOI))
		ra = boMotLan(ra, `${khoi(ghim, moc, ten)}\n`, ten);
	return ra;
}

function importDung(app) {
	const dau = app.split("\n").filter((d) => d.startsWith("import "));
	const du = IMPORT_APP_MOI.every((d) => dem(app, d) === 1);
	const thua = dau.filter(
		(d) =>
			!d.startsWith('import { describe, expect, test } from "bun:test"') &&
			!IMPORT_APP_MOI.includes(`${d}\n`),
	);
	const tuKhai = TEN_NHAP.some((t) =>
		new RegExp(`\\b(const|let|var|function|class)\\s+${t}\\b`).test(app),
	);
	return du && thua.length === 0 && !tuKhai;
}

function soSanh(ghim, agent, app) {
	const ket = Object.entries(KHOI).map(([ten, moc]) => ({
		muc: ten,
		ok: dem(app, khoi(ghim, moc, ten)) === 1,
	}));
	ket.push({ muc: "spec agent", ok: agent === agentMong(ghim) });
	ket.push({ muc: "import", ok: importDung(app) });
	return ket;
}

function docThat() {
	const ghim = readFileSync(BAN_GHIM, "utf8");
	const git = spawnSync("git", ["show", `${SHA_GHIM}:${DUONG_AGENT}`], {
		cwd: GOC,
		encoding: "utf8",
	});
	if (git.status !== 0) throw new KhongDo(`git show ${SHA_GHIM} that bai`);
	if (git.stdout !== ghim)
		throw new KhongDo("ban ghim khong con la writer that (lech git show)");
	return {
		ghim,
		agent: readFileSync(join(GOC, DUONG_AGENT), "utf8"),
		app: readFileSync(join(GOC, DUONG_APP), "utf8"),
	};
}

function xanh(v) {
	const ket = soSanh(v.ghim, v.agent, v.app);
	for (const k of ket)
		console.log(
			`${k.muc}: ${k.ok ? (k.muc === "import" ? "dung nguon" : "nguyen van") : "lech"}`,
		);
	return ket.every((k) => k.ok) ? 0 : 1;
}

function doChieu(v) {
	let ma = 0;
	for (const d of DOT_BIEN) {
		const goc = d.tep === "app" ? v.app : v.agent;
		if (dem(goc, d.cu) !== 1)
			throw new KhongDo(`dot bien khong ap duoc: ${d.ten}`);
		const doi = goc.replace(d.cu, d.moi);
		const ket = soSanh(
			v.ghim,
			d.tep === "agent" ? doi : v.agent,
			d.tep === "app" ? doi : v.app,
		);
		const lech = ket.filter((k) => !k.ok).map((k) => k.muc);
		const bat = lech.length === 1 && lech[0] === d.mongLech;
		console.log(
			`${d.ten}: ${bat ? `bat dung (${d.mongLech}: lech)` : `LOT — lech: ${lech.join(", ") || "khong muc nao"}`}`,
		);
		if (!bat) ma = 1;
	}
	return ma;
}

function chinh() {
	const chieu = process.argv[2];
	if (chieu !== "xanh" && chieu !== "do") {
		console.log("KHONG DO DUOC: doi so phai la xanh hoac do");
		process.exit(2);
	}
	try {
		const v = docThat();
		const coSan = soSanh(v.ghim, v.agent, v.app);
		if (chieu === "do" && !coSan.every((k) => k.ok)) {
			console.log(
				"KHONG DO DUOC: cay that chua nguyen van — chay chieu xanh truoc",
			);
			process.exit(2);
		}
		process.exit(chieu === "xanh" ? xanh(v) : doChieu(v));
	} catch (e) {
		if (!(e instanceof KhongDo)) throw e;
		console.log(`KHONG DO DUOC: ${e.message}`);
		process.exit(2);
	}
}

if (import.meta.main) chinh();
