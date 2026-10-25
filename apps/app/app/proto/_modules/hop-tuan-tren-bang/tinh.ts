import {
	BO_OKR,
	HOP,
	type KrHop,
	type LanCapNhat,
	MUC_TIEU,
	type MucDoi,
} from "./du-lieu";

const SO = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

export function soTran(giaTri: number): string {
	return SO.format(giaTri);
}

export function dinhDangSo(giaTri: number, donViDo: string): string {
	const so = soTran(giaTri);
	return donViDo === "%" ? `${so}%` : `${so} ${donViDo}`;
}

export function docSo(chu: string): number | null {
	const so = Number(chu.trim().replace(/\./g, "").replace(",", "."));
	return chu.trim() === "" || Number.isNaN(so) ? null : so;
}

export function tienDo(kr: KrHop, giaTri: number): number {
	const ti = (giaTri - kr.batDau) / (kr.dich - kr.batDau);
	return Math.round(Math.min(Math.max(ti, 0), 1) * HOP.phanTram);
}

export function tienDoMoiNhat(kr: KrHop): number {
	return tienDo(kr, kr.lan[0].giaTri);
}

export function soSanh(den: number, truoc: number, ngayTruoc: string): MucDoi {
	const diem = den - truoc;
	if (diem === 0) return { loai: "chua-doi", den, ngayTruoc };
	return {
		loai: diem > 0 ? "tang" : "giam",
		diem: Math.abs(diem),
		tu: truoc,
		den,
		ngayTruoc,
	};
}

export function mucDoi(kr: KrHop): MucDoi {
	const [moi, truoc] = kr.lan;
	const den = tienDo(kr, moi.giaTri);
	if (!truoc) return { loai: "lan-dau", den };
	return soSanh(den, tienDo(kr, truoc.giaTri), truoc.ngay);
}

export function ghiChuMoiNhat(kr: KrHop): LanCapNhat | null {
	return kr.lan.find((l) => l.ghiChu !== null) ?? null;
}

const NGAY_TRONG_THANG = 100;

function soNgay(ngay: string): number {
	const [d, m] = ngay.split("/").map(Number);
	return (m ?? 0) * NGAY_TRONG_THANG + (d ?? 0);
}

export function daCapNhatTuan(ds: KrHop[]): number {
	const moc = soNgay(BO_OKR.dauTuanTruoc);
	return ds.filter(
		(kr) => kr.lan[0].ngay === BO_OKR.vuaGui || soNgay(kr.lan[0].ngay) >= moc,
	).length;
}

export function tenMucTieu(kr: KrHop): string {
	return MUC_TIEU.find((m) => m.id === kr.mucTieuId)?.tieuDe ?? "";
}

export function themLan(ds: KrHop[], krId: string, lan: LanCapNhat): KrHop[] {
	return ds.map((kr) =>
		kr.id === krId ? { ...kr, lan: [lan, ...kr.lan] } : kr,
	);
}
