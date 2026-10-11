import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 8;
const TRAN_MS = 600_000;
const LENH = (tep, t) =>
	`bun run test -- "cd apps/api && bun test test/${tep}.spec.ts -t ${t}"`;
const OMC = (t) => LENH("okr-mau-cau-hinh", t);
const NAP = "apps/api/scripts/okr-mau/nap.ts";
const LENH_TS = "apps/api/scripts/okr-mau/lenh.ts";
const XOA_CAU_HINH =
	"\tconst cauHinh = await tx.okrProgramConfig.deleteMany({\n\t\twhere: { id: { in: t.cauHinh } },\n\t});\n";
const BO_XOA = "\tconst cauHinh = { count: t.cauHinh.length };\n";
const GAT =
	"\tfor (const row of cauHinhGat)\n\t\tawait tx.okrProgramConfig.update({\n\t\t\twhere: { id: row.id },\n\t\t\tdata: Object.fromEntries(\n\t\t\t\tMANG_DON_VI.map((k) => [k, row[k].filter((ma) => !laMaMau(ma))]),\n\t\t\t),\n\t\t});\n";

const CAP = [
	[
		"a bo xoa cau hinh mau",
		OMC("omc-lui"),
		NAP,
		XOA_CAU_HINH,
		BO_XOA,
		"omc: cau hinh mau con",
	],
	["b bo go ma mau", OMC("omc-gat"), NAP, GAT, "", "omc: con ma don vi mau"],
	[
		"c go trang ca mang",
		OMC("omc-gat"),
		NAP,
		"row[k].filter((ma) => !laMaMau(ma))",
		"[]",
		"omc: cau hinh sau mau sai",
	],
	[
		"d chon theo nguoi dang co",
		OMC("omc-mo-coi"),
		NAP,
		"OR: [{ createdById: { in: ids(nguoi) } }, { createdById: tien }],",
		"createdById: { in: ids(nguoi) },",
		"omc: cau hinh mo coi con (co bo mau)",
	],
	[
		"e xoa moi phien ban",
		OMC("omc-lui"),
		NAP,
		"where: { id: { in: t.cauHinh } },",
		"where: {},",
		"omc: cau hinh truoc mau bi doi",
	],
	[
		"f bo dem dong in",
		OMC("omc-gat"),
		LENH_TS,
		", ${dem.cauHinh} phiên bản cấu hình chương trình OKR do người mẫu tạo, gỡ mã đơn vị mẫu khỏi ${dem.cauHinhGat} phiên bản khác",
		"",
		"omc: dong in thieu dem cau hinh",
	],
	[
		"g bo cau hinh khoi tong",
		OMC("omc-mo-coi"),
		NAP,
		"\tconst { taiLieu: soTaiLieu, cauHinhGat, ...danhSach } = t;\n\tconst tong =\n\t\tsoTaiLieu +\n\t\tcauHinhGat.length +\n",
		"\tconst { taiLieu: soTaiLieu, cauHinhGat, cauHinh: _boQua, ...danhSach } = t;\n\tconst tong =\n\t\tsoTaiLieu +\n",
		"omc: mo coi bao khong co bo mau",
	],
	[
		"h bo xoa cau hinh mau, do bang omx-xoa",
		LENH("okr-mau-cuoc-soan", "omx-xoa"),
		NAP,
		XOA_CAU_HINH,
		BO_XOA,
		"omx: con tham chieu mau",
	],
];

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

const banSao = dungBanSao("omc");
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
console.log(`DOT BIEN: ${SO_CAP_KHAI - hong.length}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
