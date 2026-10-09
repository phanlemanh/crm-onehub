import fs from "node:fs";
import path from "node:path";
import { bam, chayVo, ghiRa, lenhCauHinh, ROOT, SOAN } from "./chung.mjs";

const CHAN = ["k2c_vi", "k2c_ngoai", "k2c_mot_nguon", "k2c_gia_tri"];
const VALIDATION = "packages/validation/src/okr-cuoc-soan.ts";
const TSC_APP = "cd apps/app && bunx tsc --noEmit";

const thay = (a, b) => (s) => {
	if (s.split(a).length !== 2) throw new Error(`vet khong cam duoc: chuoi xuat hien ${s.split(a).length - 1} lan`);
	return s.replace(a, b);
};

const KHOI_CU = `\ttuChoi: {
\t\tcuocKhongThuocPhien: "cuoc khong thuoc phien",
\t\tcuocKhongDang: "cuoc khong con dang",
\t\tdonViChuaBat: "don-vi-chua-bat",
\t\tsaiMucDich: "phien khong phai okr-soan",
\t\tchuKyKhongLapKeHoach: "chu ky khong o pha lap ke hoach",
\t\tdongTrungKhoa: "dong trung khoa",
\t\tphienKhongSong: "phien khong con song",
\t},
`;

const VET = [
	{
		ten: "(a) man hoi thoai ghep lai ly do tho",
		tep: `${SOAN}/hoi-thoai-soan.tsx`,
		cam: thay("hong.lyDo ? m.moc.lyDoTuChoi[hong.lyDo] : null,", "hong.lyDo,"),
		doi: [["k2c_vi", "lo ma may:"]],
	},
	{
		ten: "(b) docKetQuaNop tra chuoi ly do tho",
		tep: VALIDATION,
		cam: thay(
			".transform((v): LyDoTuChoiNop | null => MA_THEO_GIA_TRI.get(v) ?? null),",
			".transform((v): LyDoTuChoiNop | null => (v || null) as LyDoTuChoiNop | null),",
		),
		doi: [["k2c_ngoai", "lo chuoi la: ma-moi-cua-agent"]],
	},
	{
		ten: "(c) config.ts cua agent khai lai tap ma rieng",
		tep: "apps/agent-okr/agent/lib/config.ts",
		cam: thay("\ttuChoi: LY_DO_TU_CHOI_NOP,\n", KHOI_CU),
		doi: [["k2c_mot_nguon", "khong cung doi tuong"]],
	},
	{
		ten: "(d) ban do cau tieng Viet bo mot ma",
		tep: "apps/app/lib/messages/okr-soan.ts",
		cam: thay('\t\t\tphienKhongSong: "cuộc trò chuyện đã hết hạn — mở lại trang soạn",\n', ""),
		doi: [[TSC_APP, "phienKhongSong"]],
	},
	{
		ten: "(e) gia tri ma doi trong LY_DO_TU_CHOI_NOP",
		tep: VALIDATION,
		cam: thay('chuKyKhongLapKeHoach: "chu ky khong o pha lap ke hoach",', 'chuKyKhongLapKeHoach: "chu ky khong o pha lap-ke-hoach",'),
		doi: [["k2c_gia_tri", "gia tri doi: chuKyKhongLapKeHoach"]],
	},
];

const chay = (khoaHayLenh) => {
	const lenh = khoaHayLenh.startsWith("k2c_") ? lenhCauHinh(khoaHayLenh) : khoaHayLenh;
	const r = chayVo(lenh);
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};

const nen = CHAN.map((k) => ({ k, ...chay(k) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
console.log(`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren cay lanh`);

let bat = 0;
for (const [i, v] of VET.entries()) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, thongDiep] of v.doi) {
			const r = chay(k);
			ghiRa(`dot-bien-${i}-${k.startsWith("k2c_") ? k : "tsc"}.txt`, r.ra);
			ket.push({ k, do: r.ma !== 0, ghim: r.ra.includes(thongDiep), thongDiep });
		}
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const duBat = ket.every((x) => x.do && x.ghim);
	if (duBat) bat++;
	console.log(
		`${duBat ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k.startsWith("k2c_") ? x.k : "tsc"} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`,
	);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
