import { readFileSync } from "node:fs";
import path from "node:path";

export const GOC = path.join(import.meta.dir, "..", "..", "..");
export const HTML_THAT = readFileSync(path.join(GOC, "LO-TRINH.html"), "utf8");

const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;

export type HangTho = {
	ma: string;
	cau_giao: string;
	nhom: string;
	nhom_trang_thai: string;
	ten_hien_thi?: string | null;
};
export type MocTho = {
	ten: string;
	ngay: string;
	hang: string[];
	hien?: boolean | null;
	viec_hien?: string[];
	con_lai?: number | null;
};
export type LoTho = {
	tep: string;
	ten: string | null;
	loi: string | null;
	hang: HangTho[];
	moc: MocTho[];
	chua_hen_moc?: string[];
};
export type KhoiTho = { khuon: string; phien_ban: number; lo_trinh: LoTho[] };

export function khoiTho(html = HTML_THAT): KhoiTho {
	const tho = KHOI.exec(html)?.[1];
	if (!tho) throw new Error("LO-TRINH.html khong mang khoi");
	return JSON.parse(tho);
}

export function htmlTuKhoi(o: KhoiTho, html = HTML_THAT): string {
	const moi = JSON.stringify(o).replace(/</g, "\\u003c");
	return html.replace(
		KHOI,
		`<script type="application/json" id="lo-trinh-du-lieu">${moi}</script>`,
	);
}

export function suaKhoi(sua: (o: KhoiTho) => void): string {
	const o = khoiTho();
	sua(o);
	return htmlTuKhoi(o);
}

export const khoaMocTho = (lo: LoTho, moc: MocTho) =>
	`${lo.tep}@${moc.ngay}@${moc.ten}`;

export const khoaViecTho = (lo: LoTho, ma: string) => `${lo.tep}#${ma}`;

export function mocDauLuatCu(lo: LoTho, ma: string): MocTho | null {
	const theoNgay = [...lo.moc].sort((a, b) => a.ngay.localeCompare(b.ngay));
	return theoNgay.find((m) => m.hang.includes(ma)) ?? null;
}

export function boMoHinh(o: KhoiTho): void {
	for (const lo of o.lo_trinh) {
		delete lo.chua_hen_moc;
		for (const h of lo.hang) delete h.ten_hien_thi;
		for (const m of lo.moc) {
			delete m.hien;
			delete m.viec_hien;
			delete m.con_lai;
		}
	}
}

export const HTML_KHOI_CU = suaKhoi(boMoHinh);

const conViec = (lo: LoTho, ma: string) =>
	lo.hang.find((h) => h.ma === ma)?.nhom_trang_thai !== "da-giao";

export type Lech = {
	tep: string;
	a: MocTho;
	b: MocTho;
	x: string;
	y: string;
};

export function datLech(o: KhoiTho): Lech {
	for (const lo of o.lo_trinh) {
		const hien = lo.moc.filter((m) => m.hien);
		for (const a of hien) {
			const b = hien.find((m) => m.ngay > a.ngay);
			const ds = (a.viec_hien ?? []).filter((ma) => conViec(lo, ma));
			if (!b || ds.length < 2) continue;
			const [x, y] = ds as [string, string];
			a.viec_hien = (a.viec_hien ?? []).filter((ma) => ma !== x && ma !== y);
			a.con_lai = (a.viec_hien ?? []).filter((ma) => conViec(lo, ma)).length;
			a.hien = a.viec_hien.length > 0;
			b.hang = [...b.hang, x];
			b.viec_hien = [...(b.viec_hien ?? []), x];
			b.con_lai = (b.con_lai ?? 0) + 1;
			lo.chua_hen_moc = [...(lo.chua_hen_moc ?? []), y];
			return { tep: lo.tep, a, b, x, y };
		}
	}
	throw new Error("khoi that khong co hai moc hien voi hai viec mo");
}

export type BaMoc = { tep: string; c: MocTho; d: MocTho; e: MocTho };

export function datBaMoc(o: KhoiTho): BaMoc {
	for (const lo of o.lo_trinh) {
		const hien = lo.moc.filter((m) => m.hien);
		const d = hien.find(
			(m) => (m.viec_hien ?? []).filter((ma) => conViec(lo, ma)).length >= 2,
		);
		const khac = hien.filter((m) => m !== d);
		if (!d || khac.length < 2) continue;
		const [c, e] = khac as [MocTho, MocTho];
		lo.chua_hen_moc = [...(lo.chua_hen_moc ?? []), ...(c.viec_hien ?? [])];
		c.hien = false;
		c.viec_hien = [];
		c.con_lai = 0;
		d.con_lai = 1;
		e.con_lai = 0;
		return { tep: lo.tep, c, d, e };
	}
	throw new Error("khoi that khong du ba moc hien");
}

export type TenDat = { tep: string; ma: string; ten: string };

export function datTen(o: KhoiTho): TenDat {
	for (const lo of o.lo_trinh)
		for (const m of lo.moc) {
			if (!m.hien) continue;
			const ma = (m.viec_hien ?? []).find((x) => conViec(lo, x));
			const h = lo.hang.find((x) => x.ma === ma);
			if (!ma || !h) continue;
			const ten = `Ten ngan LT1f ${ma}`;
			h.cau_giao = "";
			h.ten_hien_thi = ten;
			return { tep: lo.tep, ma, ten };
		}
	throw new Error("khoi that khong co viec mo thuoc moc hien");
}

export function dongSoHtml(html: string, lo: number): Map<string, string> {
	const doc = new DOMParser().parseFromString(html, "text/html");
	const ra = new Map<string, string>();
	for (const li of doc.querySelectorAll(
		`ol[data-the="lt${lo + 1}-moc-ke"] > li`,
	)) {
		const dong = li.querySelector("div.mu.nho")?.cloneNode(true);
		if (!(dong instanceof Element)) continue;
		for (const x of dong.querySelectorAll("span.mu.nho, .co-o")) x.remove();
		ra.set(
			`${li.getAttribute("data-ngay")}@${li.getAttribute("data-ten")}`,
			(dong.textContent ?? "").trim(),
		);
	}
	return ra;
}
