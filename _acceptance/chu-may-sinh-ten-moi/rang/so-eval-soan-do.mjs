import { soSanh } from "./so-eval-soan.mjs";

const BAM_NEN = "a".repeat(64);
const BAM_SAU = "b".repeat(64);
const lanh = () => ({
	nen: { sha: "1".repeat(40), bam: { loiDan: BAM_NEN, thuoc: "t" }, moHinh: "m", judge: "j", dat: 20, chotMaHong: 3, tieuChiTrungBinh: [0.8, 0.7], chuCu: [{ cum: "căn chỉnh" }] },
	sau: { sha: "2".repeat(40), bam: { loiDan: BAM_SAU, thuoc: "t" }, moHinh: "m", judge: "j", dat: 20, chotMaHong: 3, tieuChiTrungBinh: [0.8, 0.7], chuCu: [] },
	bamNen: BAM_NEN,
	bamHead: BAM_SAU,
	toTien: true,
	doiNgoai: [],
});
const chay = (c) => soSanh(c.nen, c.sau, c.bamNen, c.bamHead, c.toTien, c.doiNgoai, c.lap ?? null);
const doi = (sua) => {
	const c = lanh();
	sua(c);
	return c;
};
const CA = [
	["lanh", lanh(), 0],
	["bien dat tut 2", doi((c) => { c.sau.dat = 18; }), 0],
	["bien tieu chi tut 0.2", doi((c) => { c.sau.tieuChiTrungBinh = [0.6, 0.7]; }), 0],
	["thuoc lech", doi((c) => { c.sau.bam.thuoc = "u"; }), 1, "thuoc lech"],
	["model lech", doi((c) => { c.sau.moHinh = "n"; }), 1, "mo hinh lech"],
	["nen sai bam", doi((c) => { c.bamNen = "c".repeat(64); }), 1, "nen khong chay"],
	["sau sai bam", doi((c) => { c.bamHead = "c".repeat(64); }), 1, "sau khong chay"],
	["hai bam bang", doi((c) => { c.sau.bam.loiDan = BAM_NEN; c.bamHead = BAM_NEN; }), 1, "cung mot loi dan"],
	["khong to tien", doi((c) => { c.toTien = false; }), 1, "khong nam truoc"],
	["doi tep ngoai loi dan", doi((c) => { c.doiNgoai = ["apps/agent-okr/agent/lib/config.ts"]; }), 1, "doi tep ngoai loi dan"],
	["lap noi dai chot ma", doi((c) => { c.lap = { ...c.nen, chotMaHong: 1 }; c.sau.chotMaHong = 5; }), 0],
	["lap noi dai tieu chi", doi((c) => { c.lap = { ...c.nen, tieuChiTrungBinh: [0.8, 0.3] }; c.sau.tieuChiTrungBinh = [0.8, 0.3]; }), 0],
	["lap noi dai van chan qua dai", doi((c) => { c.lap = { ...c.nen, dat: 17 }; c.sau.dat = 16; }), 1, "so ca dat tut"],
	["sau con chu cu", doi((c) => { c.sau.chuCu = [{ cum: "hỏi ý" }]; }), 1, "Kara con viet"],
	["dat tut 3", doi((c) => { c.sau.dat = 17; }), 1, "so ca dat tut"],
	["chot ma tang 2", doi((c) => { c.sau.chotMaHong = 5; }), 1, "chot ma hong tang"],
	["tc2 tut 0.3", doi((c) => { c.sau.tieuChiTrungBinh = [0.8, 0.4]; }), 1, "tc2 tut"],
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
