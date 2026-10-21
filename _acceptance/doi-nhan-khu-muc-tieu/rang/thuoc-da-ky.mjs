import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chayRang, daiCuaVong, GOC, git } from "./dai.mjs";
import { napChuKhu } from "./nap-chu.mjs";

const OKR = "apps/app/lib/messages/okr.ts";
const TOAN_CANH = "apps/app/lib/messages/okr-toan-canh.ts";
const THUOC = [
	{
		hoSo: "dat-okr-trong-crm",
		tep: "_acceptance/dat-okr-trong-crm/rang/man-okr.mjs",
		cap: [
			{ cu: "Cây căn chỉnh", khoa: `${OKR}#cayCanChinh#vi` },
			{ cu: "Căn chỉnh", khoa: `${OKR}#sheet.tabCanChinh#vi` },
		],
	},
	{
		hoSo: "toan-canh-okr",
		tep: "_acceptance/toan-canh-okr/rang/man-toan-canh.mjs",
		cap: [{ cu: "Cây căn chỉnh toàn công ty", khoa: `${TOAN_CANH}#cay.canChinh#vi` }],
	},
];

export function soDongDoi(tep, truLines, congLines, cap, hien) {
	const loi = [];
	if (truLines.length !== congLines.length) return [`${tep}: dong doi ngoai chuoi (so dong lech)`];
	for (const [i, tru] of truLines.entries()) {
		let ky = tru;
		for (const c of cap) ky = ky.replaceAll(`"${c.cu}"`, `"${hien.get(c.khoa)}"`);
		if (ky !== congLines[i]) loi.push(`${tep}: dong doi ngoai chuoi`);
	}
	return loi;
}

export function soHang(tep, nguonMoi, cap, hien, giaTriKhu) {
	const loi = [];
	for (const c of cap) {
		const moi = hien.get(c.khoa);
		if (!nguonMoi.includes(`"${moi}"`)) loi.push(`${tep}: hang ${moi} khac khoa ${c.khoa}`);
		if (nguonMoi.includes(`"${c.cu}"`)) loi.push(`${tep}: hang ${c.cu} con chu cu`);
		if (giaTriKhu.some((v) => v === c.cu)) loi.push(`${c.cu} con trong tep chu`);
	}
	return loi;
}

function tachDiff(tu, den, tep) {
	const d = git("diff", "-U0", tu, den, "--", tep).split("\n");
	return {
		tru: d.filter((l) => l.startsWith("-") && !l.startsWith("---")).map((l) => l.slice(1)),
		cong: d.filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)),
	};
}

function coDongSo(hoSo) {
	const so = readFileSync(join(GOC, "_acceptance", hoSo, "decisions.jsonl"), "utf8").trim().split("\n");
	return so.some((l) => {
		try {
			const d = JSON.parse(l);
			return d.type === "fix" && d.decided_by === "Phan Le Manh" && l.includes("doi-nhan-khu-muc-tieu");
		} catch {
			return false;
		}
	});
}

function tuThu(hien) {
	const c = THUOC[1].cap;
	const tru = ['\tcayCanChinh: "Cây căn chỉnh toàn công ty",'];
	const lanh = soDongDoi("thu", tru, [`\tcayCanChinh: "${hien.get(c[0].khoa)}",`], c, hien);
	const logic = soDongDoi("thu", tru, [`\tcayCanChinh: "${hien.get(c[0].khoa)}", x: 1,`], c, hien);
	const tra = soHang("thu", '\tcayCanChinh: "Cây căn chỉnh toàn công ty",', c, hien, []);
	return lanh.length === 0 && logic.length === 1 && tra.some((l) => l.includes("khac khoa"));
}

chayRang(() => {
	const hien = napChuKhu();
	if (!tuThu(hien)) {
		console.log("thuoc-da-ky: chieu do tu thu khong bat");
		return 1;
	}
	const giaTriKhu = [...hien.values()];
	const dai = daiCuaVong();
	const loi = [];
	for (const t of THUOC) {
		const { tru, cong } = tachDiff(dai.tu, dai.den, t.tep);
		if (tru.length === 0) loi.push(`${t.tep}: chua doi`);
		loi.push(...soDongDoi(t.tep, tru, cong, t.cap, hien));
		loi.push(...soHang(t.tep, git("show", `${dai.den}:${t.tep}`), t.cap, hien, giaTriKhu));
		if (!coDongSo(t.hoSo)) loi.push(`${t.hoSo}: thieu dong so fix`);
	}
	if (loi.length) {
		console.log(loi.join("\n"));
		return 1;
	}
	const soCap = THUOC.reduce((a, t) => a + t.cap.length, 0);
	console.log(`thuoc-da-ky: ${THUOC.length} ho so, ${soCap} cap, 0 lech (dai ${dai.kieu})`);
	return 0;
});
