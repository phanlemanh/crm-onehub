import type { JSONContent } from "@tiptap/core";
import { type ChangeObject, diffArrays, diffWordsWithSpace } from "diff";
import { TAI_LIEU } from "./tai-lieu";
import { chuanHoa, nap } from "./tai-lieu-markdown";

export type LoaiDoan = "giu" | "them" | "bo";
export type DoanDoi = { loai: LoaiDoan; chu: string };
export type KieuKhoi =
	| "doan"
	| "tieu-de-2"
	| "tieu-de-3"
	| "muc-so"
	| "muc-cham"
	| "hang-bang";
export type KhoiDoi = { kieu: KieuKhoi; doan: DoanDoi[] };
export type SoDoi = { truoc: string; sau: string };

type Khoi = { kieu: KieuKhoi; chu: string };

const SO = /\d+(?:[.,/]\d+)*%?/g;
const DON_VI = /^\s+\p{L}+/u;
const NGAN_O_BANG = " | ";

function chuTrong(nut: JSONContent): string {
	if (nut.type === "text") return nut.text ?? "";
	if (nut.type === "hardBreak") return "\n";
	return (nut.content ?? []).map(chuTrong).join("");
}

function kieuTieuDe(nut: JSONContent): KieuKhoi {
	return nut.attrs?.level === 3 ? "tieu-de-3" : "tieu-de-2";
}

function tachKhoi(nut: JSONContent, kieuDoan: KieuKhoi, ra: Khoi[]): void {
	for (const con of nut.content ?? []) {
		switch (con.type) {
			case "paragraph":
				ra.push({ kieu: kieuDoan, chu: chuTrong(con) });
				break;
			case "heading":
				ra.push({ kieu: kieuTieuDe(con), chu: chuTrong(con) });
				break;
			case "bulletList":
				tachKhoi(con, "muc-cham", ra);
				break;
			case "orderedList":
				tachKhoi(con, "muc-so", ra);
				break;
			case "tableRow":
				ra.push({
					kieu: "hang-bang",
					chu: (con.content ?? []).map(chuTrong).join(NGAN_O_BANG),
				});
				break;
			default:
				tachKhoi(con, kieuDoan, ra);
		}
	}
}

function khoiCua(md: string): Khoi[] {
	const ra: Khoi[] = [];
	tachKhoi(nap(chuanHoa(md)), "doan", ra);
	return ra.filter((k) => k.chu.trim() !== "");
}

function giong(a: Khoi, b: Khoi): boolean {
	return a.kieu === b.kieu && a.chu === b.chu;
}

function canDuoiSua(truoc: Khoi[], sau: Khoi[]): number {
	const con = new Map<string, number>();
	for (const k of truoc) {
		const khoa = JSON.stringify([k.kieu, k.chu]);
		con.set(khoa, (con.get(khoa) ?? 0) + 1);
	}
	let chung = 0;
	for (const k of sau) {
		const khoa = JSON.stringify([k.kieu, k.chu]);
		const n = con.get(khoa) ?? 0;
		if (n === 0) continue;
		con.set(khoa, n - 1);
		chung += 1;
	}
	return truoc.length + sau.length - 2 * chung;
}

function mot(kieu: KieuKhoi, loai: LoaiDoan, chu: string): KhoiDoi {
	return { kieu, doan: [{ loai, chu }] };
}

function doanTu(thay: ChangeObject<string>[]): DoanDoi[] {
	return thay
		.filter((t) => t.value !== "")
		.map((t) => ({
			loai: t.added ? "them" : t.removed ? "bo" : "giu",
			chu: t.value,
		}));
}

function cungSoO(truoc: Khoi, sau: Khoi): boolean {
	return (
		truoc.chu.split(NGAN_O_BANG).length === sau.chu.split(NGAN_O_BANG).length
	);
}

function soHangBang(truoc: Khoi, sau: Khoi): KhoiDoi {
	const oTruoc = truoc.chu.split(NGAN_O_BANG);
	const oSau = sau.chu.split(NGAN_O_BANG);
	const doan: DoanDoi[] = [];
	oSau.forEach((o, i) => {
		if (i > 0) doan.push({ loai: "giu", chu: NGAN_O_BANG });
		const cu = oTruoc[i] ?? "";
		if (cu === o) {
			if (o !== "") doan.push({ loai: "giu", chu: o });
			return;
		}
		const thay = diffWordsWithSpace(cu, o, {
			maxEditLength: TAI_LIEU.diff.tranSuaTu,
		});
		if (thay) doan.push(...doanTu(thay));
		else {
			if (cu !== "") doan.push({ loai: "bo", chu: cu });
			if (o !== "") doan.push({ loai: "them", chu: o });
		}
	});
	return { kieu: sau.kieu, doan };
}

function soTheoTu(truoc: Khoi, sau: Khoi): KhoiDoi {
	if (sau.kieu === "hang-bang") return soHangBang(truoc, sau);
	const thay = diffWordsWithSpace(truoc.chu, sau.chu, {
		maxEditLength: TAI_LIEU.diff.tranSuaTu,
	});
	if (!thay)
		return {
			kieu: sau.kieu,
			doan: [
				{ loai: "bo", chu: truoc.chu },
				{ loai: "them", chu: sau.chu },
			],
		};
	return { kieu: sau.kieu, doan: doanTu(thay) };
}

const laHangHoacHet = (k: Khoi | undefined) =>
	k === undefined || k.kieu === "hang-bang";

function ghepCum(bo: Khoi[], them: Khoi[]): KhoiDoi[] {
	const ra: KhoiDoi[] = [];
	let boCot: Khoi[] = [];
	let themCot: Khoi[] = [];
	const xaCot = () => {
		ra.push(
			...boCot.map((k) => mot(k.kieu, "bo", k.chu)),
			...themCot.map((k) => mot(k.kieu, "them", k.chu)),
		);
		boCot = [];
		themCot = [];
	};
	for (let i = 0; i < Math.max(bo.length, them.length); i += 1) {
		const b = bo[i];
		const t = them[i];
		const khacCot =
			b?.kieu === "hang-bang" && t?.kieu === "hang-bang" && !cungSoO(b, t);
		const trongCot = boCot.length > 0 || themCot.length > 0;
		if ((khacCot || trongCot) && laHangHoacHet(b) && laHangHoacHet(t)) {
			if (b) boCot.push(b);
			if (t) themCot.push(t);
			continue;
		}
		xaCot();
		if (b && t && b.kieu === t.kieu) {
			ra.push(soTheoTu(b, t));
			continue;
		}
		if (b) ra.push(mot(b.kieu, "bo", b.chu));
		if (t) ra.push(mot(t.kieu, "them", t.chu));
	}
	xaCot();
	return ra;
}

function theoKhoi(truoc: Khoi[], sau: Khoi[]): KhoiDoi[] {
	let dau = 0;
	while (
		dau < truoc.length &&
		dau < sau.length &&
		giong(truoc[dau] as Khoi, sau[dau] as Khoi)
	)
		dau += 1;
	let cuoi = 0;
	while (
		cuoi < truoc.length - dau &&
		cuoi < sau.length - dau &&
		giong(
			truoc[truoc.length - 1 - cuoi] as Khoi,
			sau[sau.length - 1 - cuoi] as Khoi,
		)
	)
		cuoi += 1;
	return [
		...truoc.slice(0, dau).map((k) => mot(k.kieu, "giu", k.chu)),
		...truoc
			.slice(dau, truoc.length - cuoi)
			.map((k) => mot(k.kieu, "bo", k.chu)),
		...sau.slice(dau, sau.length - cuoi).map((k) => mot(k.kieu, "them", k.chu)),
		...sau.slice(sau.length - cuoi).map((k) => mot(k.kieu, "giu", k.chu)),
	];
}

export function soSanh(truoc: string, sau: string): KhoiDoi[] {
	const a = khoiCua(truoc);
	const b = khoiCua(sau);
	const tran = TAI_LIEU.diff.tranSuaKhoi;
	const thay =
		canDuoiSua(a, b) > tran
			? undefined
			: diffArrays(a, b, { comparator: giong, maxEditLength: tran });
	if (!thay) return theoKhoi(a, b);
	const ra: KhoiDoi[] = [];
	let bo: Khoi[] = [];
	let them: Khoi[] = [];
	const xa = () => {
		ra.push(...ghepCum(bo, them));
		bo = [];
		them = [];
	};
	for (const t of thay) {
		if (t.removed) bo.push(...t.value);
		else if (t.added) them.push(...t.value);
		else {
			xa();
			ra.push(...t.value.map((k) => mot(k.kieu, "giu", k.chu)));
		}
	}
	xa();
	return ra;
}

export async function diffHash(khoi: KhoiDoi[]): Promise<string> {
	const chuan = JSON.stringify(
		khoi.map((k) => [k.kieu, k.doan.map((d) => [d.loai, d.chu])]),
	);
	const bam = await globalThis.crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(chuan),
	);
	return Array.from(new Uint8Array(bam), (x) =>
		x.toString(16).padStart(2, "0"),
	).join("");
}

function soDoiMotPhia(doan: DoanDoi[], loai: "them" | "bo"): string[] {
	let chu = "";
	const doi: [number, number][] = [];
	for (const d of doan) {
		if (d.loai !== "giu" && d.loai !== loai) continue;
		if (d.loai === loai) doi.push([chu.length, chu.length + d.chu.length]);
		chu += d.chu;
	}
	const ra: string[] = [];
	for (const m of chu.matchAll(SO)) {
		const dau = m.index;
		const cuoi = dau + m[0].length;
		if (!doi.some(([d, c]) => d < cuoi && c > dau)) continue;
		const tran = /[%/]/.test(m[0]);
		const donVi = tran ? null : chu.slice(cuoi).match(DON_VI);
		ra.push(`${m[0]}${donVi ? donVi[0].replace(/^\s+/, " ") : ""}`);
	}
	return ra;
}

export function suKienDoi(khoi: KhoiDoi[]): SoDoi[] {
	const ra: SoDoi[] = [];
	for (const k of khoi) {
		const truoc = soDoiMotPhia(k.doan, "bo");
		const sau = soDoiMotPhia(k.doan, "them");
		for (let i = 0; i < Math.max(truoc.length, sau.length); i += 1)
			ra.push({ truoc: truoc[i] ?? "", sau: sau[i] ?? "" });
	}
	return ra;
}
