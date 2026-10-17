import { readFileSync } from "node:fs";
import path from "node:path";

export const GOC = path.join(import.meta.dir, "..", "..", "..");
export const HTML_THAT = readFileSync(path.join(GOC, "LO-TRINH.html"), "utf8");

const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;

export type GioMayTho = {
	thap: number | null;
	cao: number | null;
	nguon: "khai" | "luat" | "do" | null;
	chu: string | null;
	co: string | null;
	phan_tram_tuan: number | null;
	phan_tram_chu: string | null;
};
export type HangTho = {
	ma: string;
	nhom_trang_thai: string;
	gio_may?: GioMayTho | null;
};
export type DuKienTho = {
	ngay_tinh: string | null;
	hoan_tat: string | null;
	chu: string | null;
};
export type MocTho = {
	ten: string;
	ngay: string;
	hang: string[];
	con_viec: boolean;
	gio_may?: unknown;
	du_kien?: DuKienTho | null;
	qua_tai?: string | null;
};
export type LoTho = {
	tep: string;
	ten: string | null;
	hang: HangTho[];
	moc: MocTho[];
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

export const khoaViecTho = (lo: LoTho, h: HangTho) => `${lo.tep}#${h.ma}`;

export function viecCuaMoc(lo: LoTho, moc: MocTho): HangTho[] {
	const dau = new Map<string, MocTho>();
	for (const m of lo.moc)
		for (const ma of m.hang) if (!dau.has(ma)) dau.set(ma, m);
	return lo.hang.filter((h) => dau.get(h.ma) === moc);
}

export function chuaGiao(lo: LoTho, moc: MocTho): HangTho[] {
	return viecCuaMoc(lo, moc).filter((h) => h.nhom_trang_thai !== "da-giao");
}

export function mocDangChay(o: KhoiTho): { lo: LoTho; moc: MocTho }[] {
	return o.lo_trinh.flatMap((lo) =>
		lo.moc
			.filter((moc) => moc.con_viec && chuaGiao(lo, moc).length > 0)
			.map((moc) => ({ lo, moc })),
	);
}

export type MocTim = { lo: LoTho; moc: MocTho };

export function timMoc(o: KhoiTho, khoa: string): MocTim {
	for (const lo of o.lo_trinh)
		for (const moc of lo.moc)
			if (khoaMocTho(lo, moc) === khoa) return { lo, moc };
	throw new Error(`khong co moc ${khoa}`);
}

export function gioMay(nguon: "khai" | "luat" | "do"): GioMayTho {
	return {
		thap: 4,
		cao: 6.5,
		nguon,
		chu: "4–6,5 giờ máy",
		co: nguon === "luat" ? "máy ước" : null,
		phan_tram_tuan: null,
		phan_tram_chu: "chưa ước (0/5 vòng đo)",
	};
}

export function datDuKien(
	moc: MocTho,
	hoanTat: string,
	ngayTinh: string,
	quaTai: string | null,
): void {
	moc.du_kien = {
		ngay_tinh: ngayTinh,
		hoan_tat: hoanTat,
		chu: `dự báo lúc bắt đầu: hoàn tất ${hoanTat}`,
	};
	moc.qua_tai = quaTai;
}

export function boGioMay(o: KhoiTho): void {
	for (const lo of o.lo_trinh) {
		for (const h of lo.hang) delete h.gio_may;
		for (const m of lo.moc) {
			delete m.gio_may;
			delete m.du_kien;
			delete m.qua_tai;
		}
	}
}

export function mocNhieuViec(o: KhoiTho, toiThieu: number) {
	const ra = mocDangChay(o).find(
		(x) => chuaGiao(x.lo, x.moc).length >= toiThieu,
	);
	if (!ra) throw new Error(`khoi that khong co moc >= ${toiThieu} viec mo`);
	return ra;
}
