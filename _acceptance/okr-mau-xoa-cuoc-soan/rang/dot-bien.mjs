import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 9;
const TRAN_MS = 600_000;
const LENH = (t) =>
	`bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t ${t}"`;
const NAP = "apps/api/scripts/okr-mau/nap.ts";
const LENH_TS = "apps/api/scripts/okr-mau/lenh.ts";
const XOA_CUOC =
	"\tconst cuocSoan = await tx.okrCuocSoan.deleteMany({ where: { id: CS } });\n";

const CAP = [
	[
		"a bo xoa cuoc",
		LENH("omx-xoa"),
		NAP,
		XOA_CUOC,
		"\tconst cuocSoan = { count: t.cuocSoan.length };\n",
		"omx: con cuoc soan mau",
	],
	[
		"b bo xoa de xuat",
		LENH("omx-xoa"),
		NAP,
		"\tconst deXuatSoan = await tx.okrDeXuat.deleteMany({\n\t\twhere: { cuocSoanId: CS },\n\t});\n",
		"\tconst deXuatSoan = { count: 0 };\n",
		"omx: con de xuat soan",
	],
	[
		"c chon theo chu ky dang co",
		LENH("omx-mo-coi"),
		NAP,
		"\t\t\tOR: [\n\t\t\t\t{ cycleId: tien },\n\t\t\t\t{ divisionId: tien },\n\t\t\t\t{ departmentId: tien },\n\t\t\t\t{ nguoiMoUserId: { in: ids(nguoi) } },\n\t\t\t],\n",
		"\t\t\tcycleId: { in: ids(chuKy) },\n",
		"omx: cuoc mo coi con",
	],
	[
		"d xoa chi phi",
		LENH("omx-xoa"),
		NAP,
		XOA_CUOC,
		`${XOA_CUOC}\tawait tx.aiChiPhi.deleteMany({ where: { taskId: CS } });\n`,
		"omx: chi phi soan bi doi",
	],
	[
		"e bo dem dong in",
		LENH("omx-xoa"),
		LENH_TS,
		", ${dem.cuocSoan} cuộc soạn OKR với ${dem.deXuatSoan} đề xuất soạn",
		"",
		"omx: dong in thieu dem cuoc soan",
	],
	[
		"f bo ve phong ban",
		LENH("omx-xoa"),
		NAP,
		"\t\t\t\t{ departmentId: tien },\n",
		"",
		"omx: con cuoc ve-pb",
	],
	[
		"g bo ve nguoi mo",
		LENH("omx-xoa"),
		NAP,
		"\t\t\t\t{ nguoiMoUserId: { in: ids(nguoi) } },\n",
		"",
		"omx: con cuoc ve-nguoi",
	],
	[
		"h bo ve chu ky",
		LENH("omx-xoa"),
		NAP,
		"\t\t\t\t{ cycleId: tien },\n",
		"",
		"omx: con cuoc ve-chu-ky",
	],
	[
		"i bo ve bo phan",
		LENH("omx-xoa"),
		NAP,
		"\t\t\t\t{ divisionId: tien },\n",
		"",
		"omx: con cuoc ve-bp",
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

const banSao = dungBanSao("omx");
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
