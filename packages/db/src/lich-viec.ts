import {
	congNgayLam,
	type LichLam,
	ngayLamKe,
	soNgayLam,
} from "./lich-lam-viec";

export type NutLich = {
	id: string;
	tieuDe: string;
	batDau: string | null;
	han: string | null;
	dong: boolean;
};

export type CanhPhuThuoc = { truocId: string; sauId: string };

export type LanDoi = { id: string; batDau: string; han: string; boi: string };

export class LoiLich extends Error {
	constructor(
		readonly ma: "vong",
		readonly chuoi: string[],
	) {
		super(`Phụ thuộc tạo vòng: ${chuoi.join(" → ")}`);
	}
}

function keTiep(canh: readonly CanhPhuThuoc[]): Map<string, string[]> {
	const ke = new Map<string, string[]>();
	for (const c of canh)
		ke.set(c.truocId, [...(ke.get(c.truocId) ?? []), c.sauId]);
	return ke;
}

function duong(
	ke: Map<string, string[]>,
	tu: string,
	den: string,
): string[] | null {
	const truoc = new Map<string, string>();
	const hang = [tu];
	const daTham = new Set([tu]);
	while (hang.length > 0) {
		const x = hang.shift() as string;
		if (x === den) {
			const ra = [x];
			let y = x;
			while (truoc.has(y)) {
				y = truoc.get(y) as string;
				ra.unshift(y);
			}
			return ra;
		}
		for (const s of ke.get(x) ?? []) {
			if (daTham.has(s)) continue;
			daTham.add(s);
			truoc.set(s, x);
			hang.push(s);
		}
	}
	return null;
}

export function timVong(
	canh: readonly CanhPhuThuoc[],
	moi: CanhPhuThuoc,
): string[] | null {
	if (moi.truocId === moi.sauId) return [moi.truocId, moi.sauId];
	const d = duong(keTiep(canh), moi.sauId, moi.truocId);
	return d ? [moi.truocId, ...d] : null;
}

function thuTuTopo(ke: Map<string, string[]>, goc: string): string[] {
	const ra: string[] = [];
	const trangThai = new Map<string, "dang" | "xong">();
	const tham = (x: string, ngan: string[]) => {
		const t = trangThai.get(x);
		if (t === "xong") return;
		if (t === "dang") {
			const tu = ngan.indexOf(x);
			throw new LoiLich("vong", [...ngan.slice(tu), x]);
		}
		trangThai.set(x, "dang");
		for (const s of ke.get(x) ?? []) tham(s, [...ngan, x]);
		trangThai.set(x, "xong");
		ra.unshift(x);
	};
	tham(goc, []);
	return ra;
}

export function tinhDoi(
	nut: readonly NutLich[],
	canh: readonly CanhPhuThuoc[],
	thayDoi: { id: string; batDau: string; han: string },
	lich: LichLam,
): LanDoi[] {
	const ngay = new Map(nut.map((n) => [n.id, { ...n }]));
	const goc = ngay.get(thayDoi.id);
	if (goc) {
		goc.batDau = thayDoi.batDau;
		goc.han = thayDoi.han;
	}
	const ke = keTiep(canh);
	const truocCua = new Map<string, string[]>();
	for (const c of canh)
		truocCua.set(c.sauId, [...(truocCua.get(c.sauId) ?? []), c.truocId]);
	const ra: LanDoi[] = [];
	for (const id of thuTuTopo(ke, thayDoi.id)) {
		if (id === thayDoi.id) continue;
		const v = ngay.get(id);
		if (!v || v.dong || !v.batDau || !v.han) continue;
		let canTu: string | null = null;
		let boi: string | null = null;
		for (const p of truocCua.get(id) ?? []) {
			const t = ngay.get(p);
			if (!t?.batDau || !t.han) continue;
			const ke_ = ngayLamKe(t.han, lich);
			if (canTu === null || ke_ > canTu) {
				canTu = ke_;
				boi = p;
			}
		}
		if (canTu === null || boi === null || v.batDau >= canTu) continue;
		const soNgay = Math.max(1, soNgayLam(v.batDau, v.han, lich));
		const han = congNgayLam(canTu, soNgay - 1, lich);
		v.batDau = canTu;
		v.han = han;
		ra.push({ id, batDau: canTu, han, boi });
	}
	return ra;
}
