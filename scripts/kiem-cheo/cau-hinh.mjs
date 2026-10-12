const GIAY_MS = 1_000;
const PHUT_MS = 60 * GIAY_MS;
const GIO_MS = 60 * PHUT_MS;

export const KIEM_CHEO = {
	donVi: { giayMs: GIAY_MS, phutMs: PHUT_MS, gioMs: GIO_MS },
	lich: { gio: 1, phut: 0 },
	muiGio: "Asia/Ho_Chi_Minh",
	nhanhChinh: "onehub",
	remote: "origin",
	thuMuc: ".acceptance-runs/kiem-cheo",
	tep: { moc: "moc.json", cay: "cay", log: "launchd.log", tienDo: "tien-do.json" },
	goiDieuPhoi: {
		plugin: "dieu-phoi",
		can: ["scripts/dot.mjs", "scripts/hook-nhip.mjs", "scripts/hinh-dang.mjs"],
		bien: "KIEM_CHEO_GOI_DIEU_PHOI",
		giaiBang: "resolve-plugin.mjs",
		lenhCai:
			"claude plugin install dieu-phoi@acceptance-gate-kit --scope project",
	},
	khoa: {
		phien: "kiem-cheo",
		slug: "kiem-cheo-sau-gop",
		loai: "s4",
		choToiDaMs: 6 * GIO_MS,
		nghiMs: 30 * GIAY_MS,
		uocPhut: 90,
		thuMucDot: ".acceptance-runs",
		tepPid: "phat-lich.pid",
	},
	luot: { tranPhut: 90, lanPhut: 60, dungMemMs: 10 * GIAY_MS },
	lan: {
		plugin: "feature-loop",
		tep: "scripts/repin-lane.mjs",
		giaiBang: "scripts/resolve-plugin.mjs",
		maHopLe: [0, 1],
		maTran: 4,
	},
	daKy: ["signed-off", "machine-cleared"],
	boQuaTien: ["_acceptance/"],
	tepHoSo: ["_acceptance/*/contract.md", "_acceptance/*/evals.yaml"],
	ketQua: {
		xanh: "xanh",
		do: "do",
		khongGopMoi: "khong-gop-moi",
		khoaBan: "bo-luot-khoa-ban",
		khongChayDuoc: "khong-chay-duoc",
		loi: "loi",
		chuaXong: "chua-xong",
	},
	loaiDo: { chapChon: "chap-chon", doSan: "do-san", doMoi: "do-moi" },
	baoNguoi: ["do", "khong-chay-duoc", "loi"],
	launchd: {
		nhan: "vn.onehub.crm.kiem-cheo",
		thuMuc: "Library/LaunchAgents",
		pathHeThong: "/usr/bin:/bin:/usr/sbin:/sbin",
	},
	ma: { xong: 0, loi: 1, mocVang: 2 },
};
