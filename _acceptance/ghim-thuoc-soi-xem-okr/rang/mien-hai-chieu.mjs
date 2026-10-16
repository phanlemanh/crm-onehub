import {
	boDong,
	boGuong,
	chayThuoc,
	chayTrong,
	chuThuocCay,
	dungGuong,
	GOC,
	ghiThuoc,
	THUOC,
	themDong,
	xoaLyDo,
} from "./guong.mjs";

const OKR = "apps/api/src/okr/okr.service.ts";
const BAY_DONG = [
	{ tep: OKR, ham: "xoaMucTieu", bang: "tho:okrKeyResult" },
	{ tep: OKR, ham: "xoaMucTieu", bang: "okrObjective" },
	{ tep: "packages/db/src/okr-muc-tieu-lich-su.ts", ham: "lichSuMucTieu", bang: "okrObjective" },
	{ tep: OKR, ham: "mine", bang: "okrObjective" },
	{ tep: "apps/api/src/okr/tro-ly.service.ts", ham: "coKrSuaDuoc", bang: "okrKeyResult" },
	{ tep: OKR, ham: "congSuaCanChinh", bang: "okrAlignment" },
	{ tep: OKR, ham: "suaLyDoCanChinh", bang: "okrAlignment" },
];
const DONG_THUA = { tep: OKR, ham: "removeAlignment", bang: "okrAlignment" };
const TRONG_LY_DO = BAY_DONG[4];
const SO_DONG = "MIEN_XEM 114 dong";
const khoa = (m) => `${m.tep}#${m.ham}#${m.bang}`;
const dongHong = (ra) => ra.split("\n").filter((d) => d.startsWith("HONG "));

const CA = [
	{
		ten: "guong-nguyen",
		sua: (c) => c,
		kiem: (r) =>
			r.ma === 0 && r.ra.includes("\nXANH") && r.ra.includes(SO_DONG) && dongHong(r.ra).length === 0,
	},
	...BAY_DONG.map((m) => ({
		ten: `bo-${m.ham}-${m.bang}`,
		sua: (c) => boDong(c, m),
		kiem: (r) => {
			const h = dongHong(r.ra);
			return (
				r.ma === 1 &&
				h.length === 1 &&
				h[0].startsWith(`HONG thieu dieu kien xem: ${m.tep}:`) &&
				h[0].includes(` ${m.ham} ${m.bang}.`)
			);
		},
	})),
	{
		ten: "them-removeAlignment",
		sua: (c) => themDong(c, DONG_THUA, "dong thua"),
		kiem: (r) =>
			r.ma === 1 &&
			r.ra.includes(`MIEN_XEM thua (khong khop loi goi nao): ${khoa(DONG_THUA)}`),
	},
	{
		ten: "xoa-ly-do-coKrSuaDuoc",
		sua: (c) => xoaLyDo(c, TRONG_LY_DO),
		kiem: (r) =>
			r.ma === 1 && r.ra.includes(`MIEN_XEM thieu ly do: ${khoa(TRONG_LY_DO)}`),
	},
];

function chay() {
	const goc0 = chuThuocCay();
	let goc;
	try {
		goc = dungGuong("mien");
	} catch (e) {
		console.log(`KHONG DO DUOC: ${e.message}`);
		return 2;
	}
	let lot = 0;
	try {
		for (const ca of CA) {
			let chu;
			try {
				chu = ca.sua(goc0);
			} catch (e) {
				console.log(`SAI khong sua duoc ${ca.ten}: ${e.message}`);
				lot++;
				continue;
			}
			if (ca.ten !== "guong-nguyen" && chu === goc0) {
				console.log(`SAI khong sua duoc ${ca.ten}: chu khong doi`);
				lot++;
				continue;
			}
			ghiThuoc(goc, chu);
			const r = chayThuoc(goc);
			if (ca.kiem(r)) console.log(`bat ${ca.ten}`);
			else {
				lot++;
				const lech = dongHong(r.ra).slice(0, 3).join(" | ") || r.ra.trim().split("\n").at(-1);
				console.log(`LOT ${ca.ten}: ma ${r.ma} ${lech}`);
			}
		}
	} finally {
		boGuong(goc);
	}
	const cd = chayTrong(GOC, `bun ${THUOC} --ca xem --chieu-do`);
	if (cd.ma === 1 && cd.ra.includes("3/3 vi pham bi bat")) console.log("bat chieu-do-san-co");
	else {
		lot++;
		console.log(`LOT chieu-do-san-co: ma ${cd.ma} ${cd.ra.trim().split("\n").at(-1)}`);
	}
	console.log(lot === 0 ? `XANH ${CA.length + 1}/${CA.length + 1} ca bat` : `DO: ${lot} ca lot`);
	return lot === 0 ? 0 : 1;
}

process.exit(chay());
