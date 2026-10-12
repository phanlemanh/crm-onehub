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

const SO_CAP_KHAI = 9;
const TRAN_MS = 900_000;
const API = (t) =>
	`bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t ${t}"`;
const AGENT = (t) =>
	`bun run test -- "cd apps/agent && bun test test/nhac-vai-chi-okr.integration.spec.ts -t ${t}"`;
const THUOC =
	'bun run test -- "cd apps/api && bun test test/ro-vai-chi-okr.spec.ts"';
const GHI = "apps/api/src/onboarding/onboarding-ghi.ts";
const DICH_VU = "apps/api/src/onboarding/onboarding.service.ts";
const VAI = "apps/api/src/workspace/workspace.service.ts";
const GOM = "packages/db/src/onboarding-nhac.ts";
const DEM = "_acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs";
const LOC_GOM = "guiCua(k, tapDoiTac, chon.now)";

const CAP = [
	[
		"a bo kiem vai o duong ghi",
		API("vlr-ghi"),
		GHI,
		"if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {",
		"if (false) {",
		"vlr: giao buoc cho vai okr khong bi chan",
	],
	[
		"b bo kiem cam trich o tao tu khuon",
		API("vlr-khuon"),
		DICH_VU,
		"\t\t\tawait kiemNguoiNhanViec(tx, input.ownerId);\n",
		"",
		"vlr: tao tu khuon cho vai okr khong bi chan",
	],
	[
		"c bo chan doi vai khi con viec",
		API("vlr-doi-vai"),
		VAI,
		"if (viec.keHoach > 0 || viec.buoc > 0) {",
		"if (false) {",
		"vlr: doi vai khi con viec khong bi chan",
	],
	[
		"d bo xoa theo doi khi doi vai",
		API("vlr-doi-vai"),
		VAI,
		"theoDoiDaXoa = await xoaTheoDoiCua(tx, target.userId);",
		"theoDoiDaXoa = 0;",
		"vlr: con theo doi sau doi vai",
	],
	[
		"e bo loc vai o bo gom",
		AGENT("vlr-gom"),
		GOM,
		LOC_GOM,
		"guiCua(k, tap, chon.now)",
		"vlr: bo gom con viec ke hoach cho vai okr",
	],
	[
		"e2 bo loc vai o bo gom, do bang tin gui",
		AGENT("vlr-tin"),
		GOM,
		LOC_GOM,
		"guiCua(k, tap, chon.now)",
		"vlr: tin zalo mang ten doi tac",
	],
	[
		"f danh sach tra moi thanh vien",
		API("vlr-danh-sach"),
		DICH_VU,
		".filter((u) => u.members.some((m) => docDuocDoiTac(m.role)))",
		".filter(() => true)",
		"vlr: danh sach nguoi nhan viec sai",
	],
	[
		"g thuoc bo loc dang mo",
		THUOC,
		DEM,
		's."completedAt" IS NULL AND p."closedAt" IS NULL AND ',
		"",
		"vlr: thuoc dem sai",
	],
	[
		"h bo kiem khi vai khong doi",
		API("vlr-doi-vai"),
		VAI,
		"if (!docDuocDoiTac(input.role)) {",
		"if (!docDuocDoiTac(input.role) && target.role !== input.role) {",
		"vlr: luu lai vai okr khong don theo doi",
	],
];

function goiCuaBanSao(banSao, app) {
	const nm = join(banSao, "apps", app, "node_modules");
	if (!lstatSync(nm).isSymbolicLink()) return;
	rmSync(nm);
	mkdirSync(join(nm, "@crm"), { recursive: true });
	const goc = join(GOC, "apps", app, "node_modules");
	for (const ten of readdirSync(goc)) {
		if (ten !== "@crm") symlinkSync(join(goc, ten), join(nm, ten));
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
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

const banSao = dungBanSao("vlr");
goiCuaBanSao(banSao, "agent");
const xanh = new Map();
let daChay = 0;
const hong = [];
try {
	for (const [ten, cmd, tep, cu, moi, ghim] of CAP) {
		daChay += 1;
		if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		const truoc = xanh.get(cmd);
		const traLai = thayMotLan(banSao, tep, cu, moi);
		let sau;
		try {
			sau = lenh(banSao, cmd);
		} finally {
			traLai();
		}
		const dung = truoc.ma === 0 && sau.ma !== 0 && coGhim(sau.ra, ghim);
		console.log(
			`${ten} xanh=${truoc.ma} do=${sau.ma} ghim=${coGhim(sau.ra, ghim) ? "ok" : "thieu"}`,
		);
		if (!dung)
			hong.push({
				ten,
				truoc: truoc.ra.slice(-1200),
				sau: sau.ra.slice(-1200),
			});
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
for (const h of hong)
	console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`dot-bien: ${SO_CAP_KHAI - hong.length}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
