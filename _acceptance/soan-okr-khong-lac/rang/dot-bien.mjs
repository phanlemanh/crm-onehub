import fs from "node:fs";
import path from "node:path";
import { ROOT, SOAN, bam, chayVo, ghiRa, lenhCauHinh } from "./chung.mjs";

const CHAN = ["k2b_tab", "k2b_khoa", "k2b_nhom_loi", "k2b_nhom_ui", "k2b_moc", "k2b_moc_hong"];

const thay = (a, b) => (s) => {
	if (s.split(a).length !== 2) throw new Error(`vet khong cam duoc: chuoi xuat hien ${s.split(a).length - 1} lan`);
	return s.replace(a, b);
};

const VET = [
	{
		ten: "(a) khoa tab cua trang soan ve 'tab'",
		tep: "apps/app/lib/search-param-keys.ts",
		cam: thay('tabSoan: "tabSoan"', 'tabSoan: "tab"'),
		doi: [
			["k2b_tab", "tab soan doi sang tro-chuyen o buoc 2"],
			["k2b_khoa", "gives every feature its own url key"],
		],
	},
	{
		ten: "(b) NhomMucTieu bo truyen loi cho bien nhan nhom",
		tep: `${SOAN}/the-nhap.tsx`,
		cam: thay("\t\t\t\t\t\t\terror: n.loi[mt.id],\n", ""),
		doi: [["k2b_nhom_loi", "khong thay loi duoi bien nhan nhom"]],
	},
	{
		ten: "(c) mocTuTranscript bo xet ket qua nop",
		tep: `${SOAN}/moc-nop.ts`,
		cam: thay("\t\tconst loi = khongThanh(item);\n", "\t\tconst loi = null;\n"),
		doi: [
			["k2b_moc", "so moc 3, mong 2"],
			["k2b_moc_hong", "lan khong doc thanh moc"],
		],
	},
	{
		ten: "(d) KaraProposalGroup bo ve batchDecided.error",
		tep: "packages/ui/src/components/kara/proposal.tsx",
		cam: thay(
			'\t\t\t\t\t{batchDecided.error ? (\n\t\t\t\t\t\t<FieldError data-loi="nhom">{batchDecided.error}</FieldError>\n\t\t\t\t\t) : null}\n',
			"",
		),
		doi: [["k2b_nhom_ui", "thieu field-error trong nhom"]],
	},
	{
		ten: "(e) goc so sanh lay tu lan nop lien truoc bat ke ket qua",
		tep: `${SOAN}/moc-nop.ts`,
		cam: thay("\t\t\thong.push(loi);\n", "\t\t\thong.push(loi);\n\t\t\ttruoc = docBanNhap(item.input) ?? truoc;\n"),
		doi: [["k2b_moc", "goc so sanh sai"]],
	},
];

const chay = (khoa) => {
	const r = chayVo(lenhCauHinh(khoa));
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
for (const v of VET) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, thongDiep] of v.doi) {
			const r = chay(k);
			ghiRa(`dot-bien-${v.ten.slice(1, 2)}-${k}.txt`, r.ra);
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
	console.log(`${duBat ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
