#!/usr/bin/env bun
/**
 * E13 (AC-10) — mỗi ô của hồ sơ đã ký mà vòng này thay đã khai `status: not-run` +
 * `superseded_by: cua-toi-chi-liet-kr#AC-<n>`, và bảng của design doc khớp đúng tập ô đó.
 *
 *   bun _acceptance/cua-toi-chi-liet-kr/rang/thay-the.mjs
 *
 * Đọc bảng «Hồ sơ đã ký mà vòng này thay» của design doc (cột 1 `<hồ sơ>/<ô>`, cột 3
 * `cua-toi-chi-liet-kr#AC-<n>`). Với mỗi dòng: evals.yaml của hồ sơ đó có ô, ô mang
 * `status: not-run` và `superseded_by` đúng chuỗi cột 3; AC-<n> có trong contract.md của hồ sơ này.
 * Chiều ngược: mọi ô trong kho trỏ `superseded_by: cua-toi-chi-liet-kr#…` đều có dòng trong bảng.
 * Rồi một đối chứng trong bộ nhớ: bỏ `status: not-run` khỏi cua-toi-ba-phan/E1 → phải ra vi phạm ghim.
 * Mã thoát: 0 «DUNG AC-10: k/k o» · 1 có vi phạm hay đối chứng sai · 2 không đo được.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "cua-toi-chi-liet-kr";
const AG = join(GOC, "_acceptance");
const THIET_KE = join(
	GOC,
	"docs/superpowers/specs/2026-10-28-cua-toi-chi-liet-kr-design.md",
);
const TIEU_DE = "## Hồ sơ đã ký mà vòng này thay";

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
}

function docBang() {
	const chu = readFileSync(THIET_KE, "utf8");
	const dau = chu.indexOf(TIEU_DE);
	if (dau < 0) khongDo(`design doc thieu muc «${TIEU_DE}»`);
	const sau = chu.slice(dau + TIEU_DE.length);
	const het = sau.search(/\n## /);
	const dong = (het < 0 ? sau : sau.slice(0, het))
		.split("\n")
		.filter((l) => /^\|\s*[a-z0-9-]+\/E\d+\s*\|/.test(l));
	if (dong.length === 0) khongDo("bang trong design doc khong co dong nao");
	return dong.map((l) => {
		const o = l.split("|").map((x) => x.trim());
		const [hoSo, eval_] = o[1].split("/");
		return { hoSo, eval: eval_, thay: o[3] };
	});
}

const go = (s) => s.trim().replace(/^["']|["']$/g, "");

function oCua(noi, id) {
	const dong = noi.split("\n");
	const dau = dong.findIndex((l) =>
		new RegExp(`^\\s*- id: ${id}\\s*$`).test(l),
	);
	if (dau < 0) return null;
	const khoi = [];
	for (let i = dau + 1; i < dong.length; i += 1) {
		if (/^\s*- id: /.test(dong[i])) break;
		khoi.push(dong[i]);
	}
	const lay = (khoa) => {
		const l = khoi.find((x) => new RegExp(`^\\s+${khoa}:`).test(x));
		return l === undefined ? null : go(l.slice(l.indexOf(":") + 1));
	};
	return { status: lay("status"), supersededBy: lay("superseded_by") };
}

function moiOTroVe(docEvals) {
	const ra = [];
	for (const hoSo of readdirSync(AG)) {
		const noi = docEvals(hoSo);
		if (noi === null) continue;
		let id = null;
		for (const l of noi.split("\n")) {
			const m = /^\s*- id: (\S+)/.exec(l);
			if (m) id = m[1];
			const s = /^\s+superseded_by:\s*(.+)$/.exec(l);
			if (s && id && go(s[1]).startsWith(`${SLUG}#`)) ra.push(`${hoSo}/${id}`);
		}
	}
	return ra;
}

function kiem(docEvals) {
	const bang = docBang();
	const hopDong = readFileSync(join(AG, SLUG, "contract.md"), "utf8");
	const viPham = [];
	for (const d of bang) {
		const ten = `${d.hoSo}/${d.eval}`;
		const ac = /#(AC-\d+)$/.exec(d.thay)?.[1];
		if (!d.thay.startsWith(`${SLUG}#`) || !ac)
			viPham.push(`SAI AC-10: ${ten} cot thay «${d.thay}» khong dung khuon`);
		else if (!new RegExp(`^- ${ac}:`, "m").test(hopDong))
			viPham.push(`SAI AC-10: ${ten} tro ${ac} khong co trong contract.md`);
		const noi = docEvals(d.hoSo);
		if (noi === null) {
			viPham.push(`SAI AC-10: ${ten} ho so khong co evals.yaml`);
			continue;
		}
		const o = oCua(noi, d.eval);
		if (o === null) {
			viPham.push(`SAI AC-10: ${ten} khong co trong evals.yaml`);
			continue;
		}
		if (o.status !== "not-run")
			viPham.push(`SAI AC-10: ${ten} thieu status: not-run`);
		if (o.supersededBy !== d.thay)
			viPham.push(
				`SAI AC-10: ${ten} superseded_by «${o.supersededBy ?? ""}», mong «${d.thay}»`,
			);
	}
	const trongBang = new Set(bang.map((d) => `${d.hoSo}/${d.eval}`));
	for (const o of moiOTroVe(docEvals))
		if (!trongBang.has(o))
			viPham.push(`SAI AC-10: ${o} tro ${SLUG} nhung khong co dong trong bang`);
	return { viPham, soO: bang.length };
}

const docThat = (hoSo) => {
	const t = join(AG, hoSo, "evals.yaml");
	return existsSync(t) ? readFileSync(t, "utf8") : null;
};

const that = kiem(docThat);
let ma = 0;
if (that.viPham.length > 0) {
	for (const v of that.viPham) console.log(v);
	console.log(
		`KET LUAN AC-10: ${that.viPham.length} vi pham tren ${that.soO} o`,
	);
	ma = 1;
} else console.log(`DUNG AC-10: ${that.soO}/${that.soO} o`);

const GHIM = "SAI AC-10: cua-toi-ba-phan/E1 thieu status: not-run";
const docPha = (hoSo) => {
	const noi = docThat(hoSo);
	if (hoSo !== "cua-toi-ba-phan" || noi === null) return noi;
	const dong = noi.split("\n");
	const dau = dong.findIndex((l) => /^\s*- id: E1\s*$/.test(l));
	let het = dong.findIndex((l, i) => i > dau && /^\s*- id: /.test(l));
	if (het < 0) het = dong.length;
	return [
		...dong.slice(0, dau + 1),
		...dong.slice(dau + 1, het).filter((l) => !/^\s+status:/.test(l)),
		...dong.slice(het),
	].join("\n");
};
const pha = kiem(docPha);
if (pha.viPham.includes(GHIM))
	console.log(`DUNG doi chung: ban pha cho «${GHIM}»`);
else {
	console.log(`SAI doi chung: ban pha khong cho «${GHIM}»`);
	ma = 1;
}
process.exit(ma);
