import { chay, giuKhoa, thoat } from "./chung.mjs";

const nhaKhoa = await giuKhoa("khai-sinh-dung-ghim");
process.on("exit", nhaKhoa);

const PHA_THU = "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs";
const CHAN = "E1";
const GHIM_VO_HIEU = "gioi-thieu";

console.log(
	"-- AC-1 hoi: chuoi ghim co vang o luot lanh khong.\n" +
		"-- AC-2 hoi mot cau KHAC: bo khai sinh co DUNG cau tra loi do khong,\n" +
		"   hay tinh ra roi vut di. Hai cau tach lam hai vi mot bo khai sinh co the\n" +
		'   in ra "vang: khong" roi van cham DAT.\n' +
		`-- Phep do: dat lai chuoi ghim cua ${CHAN} ve ${JSON.stringify(GHIM_VO_HIEU)}\n` +
		"   (ten chan, in o moi luot), roi doi bo khai sinh phai bao KHONG DAT.",
);

const r = chay("bun", [PHA_THU], {
	env: { PHA_THU_DAT_LAI_GHIM: `${CHAN}=${GHIM_VO_HIEU}` },
});

const moCua = r.ra.includes("CUA DO: dat lai chuoi ghim");
if (!moCua) {
	thoat(
		2,
		"KHONG DO DUOC: cua PHA_THU_DAT_LAI_GHIM khong con trong pha-thu.mjs,",
		"   nen luot chay nay chua he dat lai ghim nao — ket qua duoi day vo nghia.",
		r.ra
			.split("\n")
			.slice(-10)
			.map((d) => `     ${d}`)
			.join("\n"),
	);
}

const nhan = r.ra.includes("[dem-roi-vut]");
const khongDat = r.ra.includes(`KHONG DAT ${CHAN}`);
const vangKhong = /ghim vang o luot lanh: KHONG/.test(r.ra);

console.log(
	`   (1) bo khai sinh in nhan [dem-roi-vut]:            ${nhan ? "co" : "KHONG"}\n` +
		`   (2) no bao "ghim vang o luot lanh: KHONG":         ${vangKhong ? "co" : "KHONG"}\n` +
		`   (3) no cham ${CHAN} la KHONG DAT:                     ${khongDat ? "co" : "KHONG"}`,
);

const dat = nhan && vangKhong && khongDat;
if (!dat) {
	console.log(
		"   [bo-khai-sinh-dem-roi-vut] No da BIET chuoi ghim vo hieu ma van cham dat —\n" +
			"   dung nghia la dem roi vut: dieu kien thu ba khong noi vao ket luan.",
	);
}
console.log(`ket qua: ${dat ? "dat" : "KHONG DAT"}`);
process.exit(dat ? 0 : 1);
