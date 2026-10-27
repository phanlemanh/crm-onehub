import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chayRang, daiCuaVong, GOC, git, KIEM_KE } from "./dai.mjs";

const MOC = "1fce5d49c";
const KHAI = {
	tong: 84,
	khaiNiem: { "gop-vao": 55, "lay-y-kien": 21, goc: 8 },
	vi: 80,
	en: 62,
};
const KHO_KHU = /^apps\/app\/lib\/messages\/(okr[a-z-]*|tro-ly-okr|to-chuc)\.ts$/;
const TEP_UI = "packages/ui/src/lib/messages.ts";
const KHOA_UI = new Set([`${TEP_UI}#soDo.day`, `${TEP_UI}#soDo.moTaDay`]);
const VI = ["căn chỉnh", "đường lý do", "chưa nối lên", "gắn thêm", "hỏi ý", "toàn công ty", "toàn onehub"];
const EN = [/\balign/i, /\ball of onehub\b/i, /\bpath of reasons\b/i];

const trungVi = (v) => VI.some((c) => v.toLowerCase().includes(c));
const trungEn = (v) => EN.some((r) => r.test(v)) || v.trim() === "Whole company";

function quetGoc() {
	const tep = git("ls-tree", "--name-only", MOC, "apps/app/lib/messages/")
		.split("\n")
		.filter((t) => KHO_KHU.test(t));
	const dong = [];
	for (const t of [...tep, TEP_UI]) {
		const nguon = git("show", `${MOC}:${t}`);
		for (const [i, d] of nguon.split("\n").entries()) {
			const chu = [...d.matchAll(/["`]([^"`]*)["`]/g)].map((m) => m[1]).join(" ");
			if (chu && (trungVi(chu) || trungEn(chu))) dong.push({ tep: t, dong: i + 1, chu });
		}
	}
	return dong;
}

const NGHI_SO_DO = new Set([
	"apps/app/lib/messages/okr-toan-canh.ts#cay.canChinh",
	"apps/app/lib/messages/okr-toan-canh.ts#cay.chuaCanChinh",
	"apps/app/lib/messages/okr.ts#cayCanChinh",
]);
const laNghi = (m) => NGHI_SO_DO.has(`${m.tep}#${m.khoa}`);

chayRang(() => {
	const dai = daiCuaVong();
	const loi = [];
	const hienHanh = JSON.parse(readFileSync(join(GOC, KIEM_KE), "utf8"));
	for (const m of hienHanh.filter(laNghi)) loi.push(`kiem-ke con khoa da nghi ${m.tep}#${m.khoa}`);
	const nghi = JSON.parse(git("show", `${dai.den}:${KIEM_KE}`)).filter(laNghi);
	if (nghi.length !== NGHI_SO_DO.size)
		loi.push(`kiem-ke luot thieu khoa da nghi: ${nghi.length} khac ${NGHI_SO_DO.size}`);
	const kk = [...hienHanh, ...nghi];
	const dem = (f) => kk.filter(f).length;
	if (kk.length !== KHAI.tong) loi.push(`tong ${kk.length} khac ${KHAI.tong}`);
	for (const [k, n] of Object.entries(KHAI.khaiNiem)) {
		const co = dem((m) => m.khai_niem === k);
		if (co !== n) loi.push(`${k} ${co} khac ${n}`);
	}
	for (const nn of ["vi", "en"]) {
		const co = dem((m) => m.doi.includes(nn));
		if (co !== KHAI[nn]) loi.push(`doi-${nn} ${co} khac ${KHAI[nn]}`);
	}
	for (const m of kk.filter((x) => x.khai_niem === "goc" && !x.vai))
		loi.push(`goc thieu vai ${m.tep}#${m.khoa}`);

	const nguonGoc = new Map();
	for (const m of kk) {
		if (!nguonGoc.has(m.tep)) nguonGoc.set(m.tep, git("show", `${MOC}:${m.tep}`));
		const nguon = nguonGoc.get(m.tep);
		for (const nn of ["vi", "en"]) {
			const phan = m.cu[nn].split("X")[0];
			if (phan && !nguon.includes(phan)) loi.push(`kiem-ke ${m.tep}#${m.khoa} khong khop goc (${nn})`);
		}
	}

	const daKe = kk.map((m) => ({ tep: m.tep, vi: m.cu.vi, en: m.cu.en }));
	for (const d of quetGoc()) {
		const co = daKe.some(
			(m) => m.tep === d.tep && [m.vi, m.en].some((v) => v && (d.chu.includes(v.split("X")[0]) || v.includes(d.chu))),
		);
		if (!co) loi.push(`kiem-ke sot ${d.tep}:${d.dong} ${d.chu.slice(0, 60)}`);
	}

	const commit = git("rev-list", "--reverse", `${dai.tu}..${dai.den}`).split("\n").filter(Boolean);
	const viTriKiemKe = commit.indexOf(dai.commitKiemKe);
	if (viTriKiemKe < 0) loi.push("kiem-ke viet sau khi sua: commit them kiem-ke khong o trong dai");
	for (const [i, c] of commit.entries()) {
		const tep = git("diff", "--name-only", `${c}^1`, c).split("\n");
		if (i < viTriKiemKe && tep.some((t) => /^(apps|packages)\//.test(t)))
			loi.push(`kiem-ke viet sau khi sua: ${c.slice(0, 9)} cham apps/packages truoc kiem-ke`);
		if (i > viTriKiemKe && tep.includes(KIEM_KE)) loi.push(`kiem-ke viet sau khi sua: ${c.slice(0, 9)} doi kiem-ke.json`);
	}

	if (loi.length) {
		console.log(loi.join("\n"));
		return 1;
	}
	console.log(`kiem-ke: ${kk.length} muc, goc khop (dai ${dai.kieu} ${dai.soCommit} commit)`);
	return 0;
});
