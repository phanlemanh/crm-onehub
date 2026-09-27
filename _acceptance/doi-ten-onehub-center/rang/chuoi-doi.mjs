import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docChuoi } from "./quet-ten.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = join(GOC, "_acceptance", "doi-ten-onehub-center", "evidence", "chuoi-doi.md");
const TEN_CU = /\bCRM\b/;
const NGUONG_GIONG = 0.4;
const TEN = /\b(?:the |your |this |The |This |Your )?(?:OneHub )?CRM(?: OneHub)?\b|\bOneHub Center\b/g;

function giong(a, b) {
	const x = a.replace(TEN, "\u0000");
	const y = b.replace(TEN, "\u0000");
	let dau = 0;
	while (dau < x.length && dau < y.length && x[dau] === y[dau]) dau++;
	let cuoi = 0;
	while (cuoi < x.length - dau && cuoi < y.length - dau && x[x.length - 1 - cuoi] === y[y.length - 1 - cuoi]) cuoi++;
	return (dau + cuoi) / Math.max(x.length, y.length, 1);
}

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function chuoiTrong(ref, tep) {
	try {
		return docChuoi(tep, git("show", `${ref}:${tep}`)).map((c) => c.chu);
	} catch {
		return [];
	}
}

function ngonNgu(chu) {
	return /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(chu) ? "vi" : "en";
}

function o(chu) {
	return chu.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function main() {
	const base = git("merge-base", "HEAD", "origin/onehub").trim();
	const tep = readFileSync(join(HERE, "tep-mang-ten-cu.txt"), "utf8").split("\n").filter(Boolean);
	const dong = [];
	for (const t of tep) {
		const cu = new Set(chuoiTrong(base, t));
		const moi = new Set(chuoiTrong("HEAD", t));
		const bo = [...cu].filter((c) => !moi.has(c) && TEN_CU.test(c));
		const them = [...moi].filter((c) => !cu.has(c));
		const conLai = [...them];
		for (const c of bo) {
			let tot = -1;
			let diem = 0;
			conLai.forEach((m, i) => {
				const d = giong(c, m);
				if (d > diem) {
					diem = d;
					tot = i;
				}
			});
			const m = tot >= 0 && diem >= NGUONG_GIONG ? conLai.splice(tot, 1)[0] : "";
			dong.push(`| \`${t}\` | ${o(c)} | ${o(m)} | ${ngonNgu(m || c)} |`);
		}
		for (const m of conLai) dong.push(`| \`${t}\` |  | ${o(m)} | ${ngonNgu(m)} |`);
	}
	mkdirSync(dirname(RA), { recursive: true });
	writeFileSync(
		RA,
		[
			"# Chuỗi đổi — doi-ten-onehub-center",
			"",
			`So \`${base.slice(0, 8)}\` (merge-base) với HEAD, trên 35 tệp của \`rang/tep-mang-ten-cu.txt\`. Mỗi dòng: chuỗi cũ mang «CRM» và chuỗi mới mang «OneHub Center» trong cùng tệp, ghép theo thứ tự xuất hiện.`,
			"",
			"| Tệp | Cũ | Mới | Ngôn ngữ |",
			"|---|---|---|---|",
			...dong,
			"",
		].join("\n"),
	);
	console.log(`GHI ${dong.length} dong -> ${RA}`);
}

main();
