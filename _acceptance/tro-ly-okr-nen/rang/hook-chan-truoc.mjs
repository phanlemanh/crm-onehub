import { chayMau, taoKho, xoaKho } from "./mau-chung.mjs";

const KHO = "tln-e8";
let ma = 1;

try {
	const url = taoKho(KHO);
	const okr = chayMau({
		ten: "e8-okr",
		kichBan: "ghi-dau",
		url,
		env: { MAU_PURPOSE: "okr" },
	});
	const research = chayMau({
		ten: "e8-research",
		kichBan: "ghi-dau",
		url,
		env: { MAU_PURPOSE: "research" },
	});
	const hookMotMinh = chayMau({
		ten: "e8-hook-mot-minh",
		kichBan: "ghi-dau",
		url,
		env: { MAU_PURPOSE: "okr", MAU_KHONG_CHAN: "1" },
	});
	const hongOkr = okr.loaiSuKien.includes("turn.failed");
	console.log(
		JSON.stringify({
			okr: { dem: okr.dem, turnFailed: hongOkr, suKien: okr.loaiSuKien },
			research: { dem: research.dem, suKien: research.loaiSuKien },
			doiChungHookMotMinh: {
				dem: hookMotMinh.dem,
				turnFailed: hookMotMinh.loaiSuKien.includes("turn.failed"),
			},
		}),
	);
	if (okr.suKien.length === 0 || research.suKien.length === 0) {
		console.log("khong dung duoc agent mau — xem eve.log");
		ma = 2;
	} else if (okr.dem === 0 && hongOkr && research.dem === 1) {
		console.log(
			`okr: dem ${okr.dem}, turn.failed · research: dem ${research.dem} · hook mot minh (khong ban thay): dem ${hookMotMinh.dem}`,
		);
		ma = 0;
	} else {
		console.log(
			`hook khong chan truoc: okr dem ${okr.dem}, research dem ${research.dem}`,
		);
	}
} finally {
	xoaKho(KHO);
}
process.exit(ma);
