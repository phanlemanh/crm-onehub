import { chuanBi, ghi, ket, khongDo, lenhCua, moPhien } from "./man-chung.mjs";

const PHAN = {
	duong: { tep: "./man-duong.mjs", ham: "phanDuong", doDo: ["push-link-cu"] },
	"trang-khac": { tep: "./man-duong.mjs", ham: "phanTrangKhac", doDo: ["host-chi-okr"] },
	"be-ngang": { tep: "./man-be-ngang.mjs", ham: "phanBeNgang", doDo: ["kara-co-gian", "kara-w96", "token-420", "khung-cuon"] },
	"khung-lien": { tep: "./man-khung-lien.mjs", ham: "phanKhungLien", doDo: ["khung-long", "dau-lech"] },
	hep: { tep: "./man-hep.mjs", ham: "phanHep", doDo: ["ngan-keo-88"] },
	dong: { tep: "./man-dong.mjs", ham: "phanDong", doDo: ["khong-giu"] },
	luot: { tep: "./man-luot.mjs", ham: "phanLuot", doDo: ["dung-khi-dong"] },
	"ma-tran": { tep: "./man-ma-tran.mjs", ham: "phanMaTran", doDo: ["tran-ngang"] },
	"dua-vao": { tep: "./man-dua-vao.mjs", ham: "phanDuaVao", doDo: ["khong-lam-moi"] },
};

const arg = (ten) => {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
};
const phan = arg("--phan");
const doDo = arg("--kiem-do-do");
const muc = PHAN[phan ?? ""];
if (!muc) {
	console.log(`KHONG DO DUOC: --phan phai la mot trong ${Object.keys(PHAN).join(", ")}`);
	process.exit(2);
}
if (doDo !== null && !muc.doDo.includes(doDo)) {
	console.log(`KHONG DO DUOC: --kiem-do-do cua ${phan} phai la mot trong ${muc.doDo.join(", ")}`);
	process.exit(2);
}

await moPhien(lenhCua(phan, doDo));
try {
	await chuanBi(phan);
	ghi(`PHAN ${phan}${doDo ? ` · chieu do ${doDo}` : ""}`);
	const mod = await import(muc.tep);
	await mod[muc.ham]({ doDo });
} catch (loi) {
	await khongDo(`phan ${phan}: ${loi?.stack ?? loi}`);
}
await ket();
