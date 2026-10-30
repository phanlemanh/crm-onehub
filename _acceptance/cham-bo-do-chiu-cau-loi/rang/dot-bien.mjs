import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 7;
const TRAN_MS = 300_000;
const QD = "_acceptance/tro-ly-doc-kho/rang/quyet-do.ts";
const SPEC = (t) =>
	`bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t ${t}`;
const CHAM_LAI_MAU =
	"bun _acceptance/cham-bo-do-chiu-cau-loi/rang/cham-lai-mau.mjs";
const VUOT_TRAN = "\tif (loi.length > tran)\n";
const DONG_LOI = "\tdong.push(dongCauLoi(loi, soCau, tran, loiCua));\n";

const CAP = [
	{
		ten: "t1 tran",
		lenh: SPEC("tran-loi"),
		pha: [
			QD,
			"return Math.max(toiThieu, Math.floor((soCau * phanTram) / 100));",
			"return 0;",
		],
		ghim: "tran 96 cau phai la 4",
	},
	{
		ten: "t2 vuot-tran",
		lenh: SPEC("tran-loi"),
		pha: [QD, VUOT_TRAN, "\tif (loi.length > Number.POSITIVE_INFINITY)\n"],
		ghim: "loi vuot tran van do",
	},
	{
		ten: "t3 trung-ma",
		lenh: SPEC("du-ma"),
		pha: [
			QD,
			"\t\tif (thay.has(khoa)) return `KHONG DO DUOC: trung ma ${khoa}`;\n",
			"",
		],
		ghim: "trung ma khong bi bat",
	},
	{
		ten: "t4 dong-loi",
		lenh: SPEC("tran-loi"),
		pha: [QD, DONG_LOI, ""],
		ghim: "thieu dong cau loi model",
	},
	{
		ten: "t4b dong-loi cham-lai",
		lenh: CHAM_LAI_MAU,
		pha: [QD, DONG_LOI, ""],
		ghim: "nguyen-van ma 0 sai — thieu dong cau loi model",
	},
	{
		ten: "t5 thieu-ma",
		lenh: SPEC("du-ma"),
		pha: [
			QD,
			"return chamTungCau(ds, nguong, cauDaHoi);",
			"return chamTungCau(ds, nguong);",
		],
		ghim: "thieu ma khong bi bat",
	},
	{
		ten: "t6 hoi-lai (cap e F12)",
		lenh: SPEC("vung-xam"),
		pha: [QD, VUOT_TRAN, "\tif (loi.length < 0)\n"],
		ghim: "hoi lai khi luot 1 loi vuot tran",
	},
];

function chay(goc, lenh) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd: goc,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, log: `${r.stdout}\n${r.stderr}` };
}

function main() {
	const goc = dungBanSao("cbd-dot-bien");
	let dat = 0;
	let daChay = 0;
	try {
		for (const cap of CAP) {
			daChay++;
			const xanh = chay(goc, cap.lenh);
			const hoan = thayMotLan(goc, ...cap.pha);
			const pha = chay(goc, cap.lenh);
			hoan();
			const ghim = pha.log.includes(cap.ghim);
			const ok = xanh.ma === 0 && pha.ma !== 0 && ghim;
			console.log(
				`${cap.ten} xanh=${xanh.ma} do=${pha.ma} ghim=${ghim ? "ok" : "thieu"}`,
			);
			if (ok) dat++;
			else
				console.error(
					`${cap.ten}:\n--- xanh\n${xanh.log.slice(-1200)}\n--- do\n${pha.log.slice(-1200)}`,
				);
		}
	} finally {
		goBanSao(goc);
	}
	if (daChay !== SO_CAP_KHAI) {
		console.error(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
		return 1;
	}
	return dat === SO_CAP_KHAI ? 0 : 1;
}

try {
	process.exit(main());
} catch (loi) {
	console.error(loi.message);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
