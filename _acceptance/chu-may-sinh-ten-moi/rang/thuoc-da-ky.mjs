import { chayRang, daiCuaVong, git } from "./dai.mjs";

const HO_SO = "_acceptance/chu-may-sinh-ten-moi/";
const THUOC = "_acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs";
const SO_THUOC = "_acceptance/gioi-han-duyet-cay-okr/decisions.jsonl";
const BAN_CHUP = "apps/agent/test/fixtures/tin-nhac-truoc-tb1.json";
const CAU_HINH = "_acceptance/config.yaml";
const GHIM = /^_acceptance\/[^/]+\/(run-log\.jsonl|evidence-report\.md)$/;
const BO_MO_KHUNG = [
	'	const t = await moTrang("truong", DO.rong, "/okr", {',
	"		boQua: LOI_MANG,",
	"	});",
	"	if (!(await moSheet(t, MT_CAN_CHINH, nhom))) {",
];
const THEM_MO_KHUNG = [
	"	const t = await moTrang(",
	'		"truong",',
	"		DO.rong,",
	"		`/okr?record=objective:${MT_CAN_CHINH}`,",
	"		{ boQua: LOI_MANG },",
	"	);",
	"	if (",
	"		!(await doi(",
	"			t,",
	"			`${nhom}: khung muc tieu ${MT_CAN_CHINH} tai xong`,",
	"			(s) => window.__tim(`${s}[data-dau-khung]`).length > 0,",
	"			SHEET(MT_CAN_CHINH),",
	"		))",
	"	) {",
];
const YEU_CAU_MO_KHUNG = "V2-10";

function boKhoi(ds, khoi) {
	for (let i = 0; i + khoi.length <= ds.length; i++)
		if (khoi.every((d, k) => ds[i + k] === d)) return [...ds.slice(0, i), ...ds.slice(i + khoi.length)];
	return null;
}

const VE_CU_THUOC = [
	["chỗ góp vào", "căn chỉnh"],
	["cho gop vao", "can chinh"],
];
const VE_CU_NHAC = [
	["Lấy ý kiến đã công bố", "Hỏi ý đã công bố"],
	["đang lấy ý kiến cho", "đang hỏi ý cho"],
	["mở Lấy ý kiến", "mở hỏi ý"],
	["Lấy ý kiến", "Hỏi ý mục tiêu"],
];

function capDoi(tu, den, tep) {
	const bo = [];
	const them = [];
	for (const d of git("diff", "-U0", tu, den, "--", tep).split("\n")) {
		if (d.startsWith("---") || d.startsWith("+++")) continue;
		if (d.startsWith("-")) bo.push(d.slice(1));
		else if (d.startsWith("+")) them.push(d.slice(1));
	}
	return { bo, them };
}

const veCu = (d, bang) => bang.reduce((s, [moi, cu]) => s.split(moi).join(cu), d);

function soCap(tep, tu, den, bang, loi, moKhung = false) {
	let { bo, them } = capDoi(tu, den, tep);
	if (moKhung) {
		const bo2 = boKhoi(bo, BO_MO_KHUNG);
		const them2 = boKhoi(them, THEM_MO_KHUNG);
		if (!bo2 || !them2) loi.push(`${tep}: khoi mo khung V2-10 khong dung nguyen van`);
		else [bo, them] = [bo2, them2];
	}
	if (bo.length !== them.length) loi.push(`${tep}: ${bo.length} dong bo, ${them.length} dong them`);
	for (const [i, d] of them.entries())
		if (veCu(d, bang) !== bo[i]) loi.push(`${tep}: dong doi khong chi thay chu: ${d.trim().slice(0, 100)}`);
	return them.length;
}

chayRang(() => {
	const dai = daiCuaVong();
	const loi = [];
	const doi = git("diff", "--name-only", dai.tu, dai.den, "--", "_acceptance/").split("\n").filter(Boolean);
	for (const t of doi) {
		if (t.startsWith(HO_SO) || t === THUOC || t === SO_THUOC || GHIM.test(t)) continue;
		if (t === CAU_HINH) {
			if (capDoi(dai.tu, dai.den, CAU_HINH).bo.length) loi.push(`${CAU_HINH}: sua dong co san, chi duoc them`);
			continue;
		}
		loi.push(`${t}: tep ho so khac bi doi`);
	}
	let soThuoc = 0;
	if (doi.includes(THUOC)) {
		const moi = capDoi(dai.tu, dai.den, SO_THUOC).them.map((d) => JSON.parse(d));
		const moKhung = moi.some((d) => d.type === "fix" && d.decided_by === "Phan Le Manh" && JSON.stringify(d).includes(YEU_CAU_MO_KHUNG));
		soThuoc = soCap(THUOC, dai.tu, dai.den, VE_CU_THUOC, loi, moKhung);
		if (!moi.some((d) => d.type === "fix" && d.decided_by === "Phan Le Manh" && JSON.stringify(d).includes("chu-may-sinh-ten-moi")))
			loi.push(`${SO_THUOC}: thieu dong fix decided_by chu kho neu chu-may-sinh-ten-moi`);
	}
	const soNhac = soCap(BAN_CHUP, dai.tu, dai.den, VE_CU_NHAC, loi);
	if (loi.length) {
		console.log(loi.join("\n"));
		return 1;
	}
	console.log(`thuoc-da-ky: ${doi.length} tep _acceptance doi; thuoc gioi-han ${soThuoc} dong, ban chup ${soNhac} dong chi thay chu (dai ${dai.kieu} ${dai.soCommit} commit)`);
	return 0;
});
