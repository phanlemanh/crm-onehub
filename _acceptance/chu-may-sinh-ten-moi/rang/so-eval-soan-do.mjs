import { soSanh } from "./so-eval-soan.mjs";

const BAM_NEN = "a".repeat(64);
const BAM_SAU = "b".repeat(64);
const lanh = () => ({
	nen: { sha: "1".repeat(40), bam: { loiDan: BAM_NEN, thuoc: "t" }, moHinh: "m", judge: "j", dat: 20, chotMaHong: 3, tieuChiTrungBinh: [0.8, 0.7], chuCu: [{ cum: "căn chỉnh" }] },
	sau: { sha: "2".repeat(40), bam: { loiDan: BAM_SAU, thuoc: "t" }, moHinh: "m", judge: "j", dat: 20, chotMaHong: 3, tieuChiTrungBinh: [0.8, 0.7], chuCu: [] },
	bamNen: BAM_NEN,
	bamHead: BAM_SAU,
	toTien: true,
});
const chay = (c) => soSanh(c.nen, c.sau, c.bamNen, c.bamHead, c.toTien);
const doi = (sua) => {
	const c = lanh();
	sua(c);
	return c;
};
const CA = [
	["lanh", lanh(), 0],
	["bien dat tut 2", doi((c) => { c.sau.dat = 18; }), 0],
	["bien tieu chi tut 0.1", doi((c) => { c.sau.tieuChiTrungBinh = [0.7, 0.7]; }), 0],
	["thuoc lech", doi((c) => { c.sau.bam.thuoc = "u"; }), 1, "thuoc lech"],
	["model lech", doi((c) => { c.sau.moHinh = "n"; }), 1, "mo hinh lech"],
	["nen sai bam", doi((c) => { c.bamNen = "c".repeat(64); }), 1, "nen khong chay"],
	["sau sai bam", doi((c) => { c.bamHead = "c".repeat(64); }), 1, "sau khong chay"],
	["hai bam bang", doi((c) => { c.sau.bam.loiDan = BAM_NEN; c.bamHead = BAM_NEN; }), 1, "cung mot loi dan"],
	["khong to tien", doi((c) => { c.toTien = false; }), 1, "khong nam truoc"],
	["sau con chu cu", doi((c) => { c.sau.chuCu = [{ cum: "hỏi ý" }]; }), 1, "Kara con viet"],
	["dat tut 3", doi((c) => { c.sau.dat = 17; }), 1, "so ca dat tut"],
	["chot ma tang 2", doi((c) => { c.sau.chotMaHong = 5; }), 1, "chot ma hong tang"],
	["tc2 tut 0.11", doi((c) => { c.sau.tieuChiTrungBinh = [0.8, 0.59]; }), 1, "tc2 tut"],
];
const lech = [];
for (const [ten, ca, so, chu] of CA) {
	const loi = chay(ca);
	if (loi.length !== so || (chu && !loi[0].includes(chu))) lech.push(`${ten}: ${JSON.stringify(loi)}`);
}
if (lech.length) {
	console.log(lech.join("\n"));
	process.exit(1);
}
console.log(`so-eval-soan-do: ${CA.length} ca dung`);
