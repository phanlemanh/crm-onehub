import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { compile } from "tailwindcss";
import { z } from "zod";

const GOC_CSS = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"packages",
	"ui",
	"src",
	"styles",
	"globals.css",
);
const REM_PX = 16;

const khaiGoi = z.object({
	style: z.string().optional(),
	exports: z
		.record(
			z.string(),
			z.union([
				z.string().transform((style) => ({ style })),
				z.object({ style: z.string().optional() }),
			]),
		)
		.optional(),
});

function thuMucGoi(ten: string, tu: string): string {
	for (let d = tu; ; d = dirname(d)) {
		const thu = join(d, "node_modules", ten);
		if (existsSync(join(thu, "package.json"))) return thu;
		if (dirname(d) === d) throw new Error(`khong tim thay goi css ${ten}`);
	}
}

function duongCss(id: string, base: string): string {
	if (id.startsWith(".")) return resolve(base, id);
	const phan = id.split("/");
	const ten = id.startsWith("@") ? phan.slice(0, 2).join("/") : (phan[0] ?? id);
	const con = id.slice(ten.length);
	const goi = thuMucGoi(ten, base);
	const khai = khaiGoi.parse(
		JSON.parse(readFileSync(join(goi, "package.json"), "utf8")),
	);
	const tep =
		khai.exports?.[`.${con}`]?.style ??
		(con ? `.${con}` : (khai.style ?? "index.css"));
	return join(goi, tep);
}

const trinhDich = compile(readFileSync(GOC_CSS, "utf8"), {
	base: dirname(GOC_CSS),
	loadStylesheet: async (id, base) => {
		const path = duongCss(id, base);
		return { path, base: dirname(path), content: readFileSync(path, "utf8") };
	},
});

async function bangLuat(lop: Iterable<string>): Promise<CSSRuleList> {
	const css = (await trinhDich).build([...lop]);
	const the = document.createElement("style");
	the.textContent = css;
	document.head.appendChild(the);
	const bang = the.sheet;
	the.remove();
	if (!bang) throw new Error("khong doc duoc css da dich");
	return bang.cssRules;
}

function khopMedia(dieuKien: string, rongPx: number): boolean {
	const rong = /^\(width\s*(>=|<)\s*([\d.]+)rem\)$/.exec(dieuKien.trim());
	if (!rong) return false;
	const nguong = Number(rong[2]) * REM_PX;
	return rong[1] === ">=" ? rongPx >= nguong : rongPx < nguong;
}

function khopChon(o: Element, chon: string): boolean {
	try {
		return o.matches(chon);
	} catch {
		return false;
	}
}

function gom(
	luat: CSSRuleList,
	o: Element,
	rongPx: number,
	ra: Map<string, string>,
): void {
	for (const l of luat) {
		if (l instanceof CSSMediaRule) {
			if (khopMedia(l.media.mediaText, rongPx)) gom(l.cssRules, o, rongPx, ra);
		} else if (l instanceof CSSStyleRule) {
			if (!khopChon(o, l.selectorText)) continue;
			for (const ten of l.style)
				ra.set(ten, l.style.getPropertyValue(ten).trim());
		} else if ("cssRules" in l && l.cssRules instanceof CSSRuleList) {
			gom(l.cssRules, o, rongPx, ra);
		}
	}
}

export type KieuThat = ReadonlyMap<string, string>;

export async function kieuThat(o: Element, rongPx: number): Promise<KieuThat> {
	const lop = new Set<string>();
	for (let c: Element | null = o; c; c = c.parentElement)
		for (const ten of c.classList) lop.add(ten);
	const ra = new Map<string, string>();
	gom(await bangLuat(lop), o, rongPx, ra);
	return ra;
}

export function chuoiToTien(o: Element, dung: string): Element[] {
	const chuoi: Element[] = [];
	for (let c = o.parentElement; c; c = c.parentElement) {
		chuoi.push(c);
		if (c.matches(dung)) return chuoi;
	}
	throw new Error(`khong toi duoc ${dung}`);
}

const RANH_CHAN = /^minmax\(\s*0(px)?\s*,/;

export function ranhCot(gia: string | undefined): string[] {
	if (!gia || gia === "none") return [];
	const ra: string[] = [];
	let sau = 0;
	let dau = 0;
	for (let i = 0; i < gia.length; i += 1) {
		const k = gia[i];
		if (k === "(") sau += 1;
		else if (k === ")") sau -= 1;
		else if (k === " " && sau === 0) {
			if (i > dau) ra.push(gia.slice(dau, i));
			dau = i + 1;
		}
	}
	if (dau < gia.length) ra.push(gia.slice(dau));
	return ra;
}

const RANH_CO_DINH = /^(var\(|calc\(|[\d.]+(px|rem)$)/;

function chanDay(r: string): boolean {
	const lap = /^repeat\(\s*\d+\s*,\s*(.+)\)$/.exec(r);
	if (lap?.[1]) return ranhCot(lap[1]).every(chanDay);
	return RANH_CHAN.test(r) || RANH_CO_DINH.test(r);
}

export function ranhChanDay(gia: string | undefined): boolean {
	const ranh = ranhCot(gia);
	return ranh.length > 0 && ranh.every(chanDay);
}
