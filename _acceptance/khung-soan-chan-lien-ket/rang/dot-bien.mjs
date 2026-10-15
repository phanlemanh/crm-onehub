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

const SO_CAP_KHAI = 4;
const TRAN_LENH_MS = 300_000;
const MA_KHONG_DO = 2;
const KHOA_LANH = [
	"kcl_soan",
	"kcl_go_do",
	"kcl_roi",
	"kcl_khong_do",
	"kcl_khong_chan",
];
const APP =
	"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx";
const UI =
	"cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx";
const TRANG_SOAN = "apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx";
const GIU = "packages/ui/src/components/giu-thay-doi.tsx";

const CAP = [
	{
		ten: "a",
		mo: "bỏ lời gọi chặn liên kết trong khung soạn",
		pha: (d) => thayMotLan(d, TRANG_SOAN, "\t\t\t<ChanLienKetKhung />\n", ""),
		lenh: `${APP} -t kcl-soan`,
		ghim: "kcl-soan o-lai-nut: co hop hoi",
	},
	{
		ten: "b",
		mo: "nút rời đóng hộp thay vì đi tiếp",
		pha: (d) =>
			thayMotLan(d, GIU, "if (tiep) tiep();\n\t\t\t\telse dongThat();", "dongThat();"),
		lenh: `${UI} -t '^kcl-hop '`,
		ghim: "kcl-hop h4: dieu huong 1 lan",
	},
	{
		ten: "c",
		mo: "hrefNoiBo bỏ kiểm metaKey",
		pha: (d) =>
			thayMotLan(d, GIU, "if (e.metaKey || e.ctrlKey", "if (e.ctrlKey"),
		lenh: `${UI} -t kcl-khong-chan`,
		ghim: "kcl-khong-chan n1: khong chan",
	},
	{
		ten: "d",
		mo: "bật chặn không xét có thay đổi",
		pha: (d) =>
			thayMotLan(
				d,
				GIU,
				"useChanLienKet(g?.coThayDoi === true, chan);",
				"useChanLienKet(g !== null, chan);",
			),
		lenh: `${UI} -t kcl-hop-sach`,
		ghim: "kcl-hop-sach d1: khong hop",
	},
];

function lenhCuaConfig() {
	const chu = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	return KHOA_LANH.map((khoa) => {
		const tim = new RegExp(`^ {4}${khoa}: "(.*)"$`, "m").exec(chu);
		if (!tim) throw new KhongDo(`config.yaml thieu ${khoa}`);
		return { khoa, lenh: tim[1] };
	});
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
	return spawnSync("git", ["status", "--porcelain"], {
		cwd: GOC,
		encoding: "utf8",
	}).stdout;
}

if (CAP.length !== SO_CAP_KHAI) {
	process.stderr.write(`kcl dot-bien: ${CAP.length} cap khac ${SO_CAP_KHAI}\n`);
	process.exit(MA_KHONG_DO);
}

const truoc = trangThaiCay();
let dich = null;
let can = 0;
let ma = 0;
try {
	const lanh = lenhCuaConfig();
	dich = dungBanSao("kcl");
	for (const { khoa, lenh } of lanh) {
		const kq = chay(dich, lenh);
		if (kq.ma !== 0) {
			process.stderr.write(`${kq.ra.slice(-3000)}\n`);
			throw new KhongDo(`ban sao do san: ${khoa} thoat ${kq.ma}`);
		}
		process.stdout.write(`kcl dot-bien: doi chung ${khoa} xanh\n`);
	}
	for (const cap of CAP) {
		const hoan = cap.pha(dich);
		try {
			const kq = chay(dich, cap.lenh);
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
	process.stderr.write(`kcl dot-bien: ${e.message}\n`);
	ma = MA_KHONG_DO;
} finally {
	if (dich) goBanSao(dich);
}
if (trangThaiCay() !== truoc) {
	process.stderr.write("kcl dot-bien: cay that bi doi\n");
	process.exit(MA_KHONG_DO);
}
if (ma !== MA_KHONG_DO)
	process.stdout.write(`kcl dot-bien: ${can}/${SO_CAP_KHAI} cắn\n`);
process.exit(ma);
