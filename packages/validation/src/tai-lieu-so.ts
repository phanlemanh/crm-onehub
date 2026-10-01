import type { JSONContent } from "@tiptap/core";
import { chuanNfc } from "./tai-lieu";
import { nap } from "./tai-lieu-markdown";
import { quoteKey, TRICH_DOAN, type TrichDoan } from "./tai-lieu-trich-doan";

const SO =
	/(?<!\d)(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{1,3}(?:\.\d{3})+(?:,\d+)?%?|\d+\.\d{1,2}%?|\d+(?:,\d+)?%?)(?!\d)/g;

function gomChu(nut: JSONContent, ra: string[]): void {
	if (nut.type === "text") {
		ra.push(nut.text ?? "");
		return;
	}
	if (nut.type === "hardBreak") {
		ra.push("\n");
		return;
	}
	for (const con of nut.content ?? []) gomChu(con, ra);
	ra.push("\n");
}

export function rutSo(markdown: string): string[] {
	const ra: string[] = [];
	gomChu(nap(chuanNfc(markdown)), ra);
	return [...ra.join("").matchAll(SO)].map((m) => m[0]);
}

export function rutSoChu(chu: string): string[] {
	return [...chuanNfc(chu).matchAll(SO)].map((m) => m[0]);
}

function noiSo(c: string | undefined, ke: string | undefined): boolean {
	if (c === undefined) return false;
	if (/\d/.test(c)) return true;
	return (c === "," || c === ".") && ke !== undefined && /\d/.test(ke);
}

function coPhanTramSau(chu: string, tu: number): boolean {
	return chu.slice(tu).trimStart().startsWith("%");
}

export function coSoTronVen(chu: string, so: string): boolean {
	const phanTram = so.endsWith("%");
	const loi = phanTram ? so.slice(0, -1) : so;
	for (let i = chu.indexOf(loi); i !== -1; i = chu.indexOf(loi, i + 1)) {
		const het = i + loi.length;
		if (noiSo(chu[i - 1], chu[i - 2])) continue;
		if (noiSo(chu[het], chu[het + 1])) continue;
		if (phanTram && !coPhanTramSau(chu, het)) continue;
		return true;
	}
	return false;
}

export function soMoi(noiDung: string, banGoc: string | null): string[] {
	const soCu = new Set(banGoc === null ? [] : rutSo(banGoc));
	return [...new Set(rutSo(noiDung))].filter((s) => !soCu.has(s));
}

export function demTuCoChu(chu: string): number {
	return chu.split(/\s+/).filter((tu) => /\p{L}/u.test(tu)).length;
}

export type KetQuaKiem =
	| { ok: true }
	| {
			ok: false;
			loi: {
				loai: "so-khong-trich" | "trich-khong-co" | "trich-ngan";
				chi: string;
			}[];
	  };

type Loi = Extract<KetQuaKiem, { ok: false }>["loi"][number];

export function kiemBanMay(input: {
	noiDung: string;
	trichDoan: TrichDoan[];
	chuNguon: string;
	banGoc: string | null;
}): KetQuaKiem {
	const nguon = quoteKey(input.chuNguon);
	const trichCo = input.trichDoan
		.map((t) => ({ goc: t.trich, khoa: quoteKey(t.trich) }))
		.map((t) => ({ ...t, co: t.khoa !== "" && nguon.includes(t.khoa) }));
	const moi = soMoi(input.noiDung, input.banGoc);
	const loi: Loi[] = [
		...trichCo
			.filter((t) => demTuCoChu(t.khoa) < TRICH_DOAN.tuCoChuToiThieu)
			.map((t) => ({ loai: "trich-ngan" as const, chi: t.goc })),
		...trichCo
			.filter((t) => !t.co)
			.map((t) => ({ loai: "trich-khong-co" as const, chi: t.goc })),
		...moi
			.filter((s) => !trichCo.some((t) => t.co && coSoTronVen(t.khoa, s)))
			.map((s) => ({ loai: "so-khong-trich" as const, chi: s })),
	];
	return loi.length === 0 ? { ok: true } : { ok: false, loi };
}
