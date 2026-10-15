import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 1;
const TRAN_LENH_MS = 300_000;
const MA_KHONG_DO = 2;
const KHUNG_CHO = "apps/app/app/(app)/[slug]/okr/dau-trang-okr-cho.tsx";

const CAP = [
	{
		ten: "a",
		mo: "bỏ nút Hỏi Kara khỏi khung chờ",
		pha: (d) => thayMotLan(d, KHUNG_CHO, "\t\t\t\t\t<NutHoiKara />\n", ""),
		ghim: "dto-cho vi: co nut hoi kara",
	},
];

function lenhDtoCho() {
	const chu = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const tim = /^ {4}dto_cho: "(.*)"$/m.exec(chu);
	if (!tim) throw new KhongDo("config.yaml thieu dto_cho");
	return tim[1];
}

function chay(dich, lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: dich,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

function trangThaiCay() {
	return spawnSync("git", ["status", "--porcelain", "--", KHUNG_CHO], {
		cwd: GOC,
		encoding: "utf8",
	}).stdout;
}

if (CAP.length !== SO_CAP_KHAI) {
	process.stderr.write(`dto dot-bien: ${CAP.length} cap khac ${SO_CAP_KHAI}\n`);
	process.exit(MA_KHONG_DO);
}

const truoc = trangThaiCay();
let dich = null;
let can = 0;
let ma = 0;
try {
	const lenh = lenhDtoCho();
	dich = dungBanSao("dto");
	const lanh = chay(dich, lenh);
	if (lanh.ma !== 0) {
		process.stderr.write(`${lanh.ra.slice(-3000)}\n`);
		throw new KhongDo(`ban sao do san: dto_cho thoat ${lanh.ma}`);
	}
	process.stdout.write("dto dot-bien: doi chung dto_cho xanh\n");
	for (const cap of CAP) {
		const hoan = cap.pha(dich);
		try {
			const kq = chay(dich, lenh);
			const daCan = kq.ma !== 0 && kq.ra.includes(cap.ghim);
			if (daCan) {
				can += 1;
				process.stdout.write(`cặp ${cap.ten}: cắn (${cap.mo})\n`);
			} else {
				process.stdout.write(
					`cặp ${cap.ten}: KHÔNG cắn — ma ${kq.ma}, thieu "${cap.ghim}" (${cap.mo})\n`,
				);
				process.stderr.write(`${kq.ra.slice(-3000)}\n`);
			}
		} finally {
			hoan();
		}
	}
	ma = can === SO_CAP_KHAI ? 0 : 1;
} catch (e) {
	if (!(e instanceof KhongDo)) throw e;
	process.stderr.write(`dto dot-bien: ${e.message}\n`);
	ma = MA_KHONG_DO;
} finally {
	if (dich) goBanSao(dich);
}
if (trangThaiCay() !== truoc) {
	process.stderr.write("dto dot-bien: cay that bi doi\n");
	process.exit(MA_KHONG_DO);
}
if (ma !== MA_KHONG_DO)
	process.stdout.write(`dto dot-bien: ${can}/${SO_CAP_KHAI} cắn\n`);
process.exit(ma);
