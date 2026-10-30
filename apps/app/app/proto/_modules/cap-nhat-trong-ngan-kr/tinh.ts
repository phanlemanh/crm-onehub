import type { MucTuTin } from "@crm/ui/components/okr-status";
import { formatDayShort } from "@crm/ui/lib/format";
import { docSoOkr } from "@crm/validation/okr-kr";
import { KY } from "../lich-su-moi-lan-cap-nhat/du-lieu";
import {
	dinhDangSo,
	moiNhat,
	ngayVn,
	tuanCua,
} from "../lich-su-moi-lan-cap-nhat/tinh";
import type { KrNgan, LanKr } from "./du-lieu";

export const CAU_HINH = {
	ghiChuToiDa: 200,
	viDuSo: "3,5",
	phutGiuaHaiLan: 7,
	phutMs: 60_000,
	toastId: "da-cap-nhat-kr",
} as const;

export const MOC = { chuaXong: "0", xong: "1" } as const;

export const MUC_TU_TIN: readonly MucTuTin[] = ["cao", "vua", "thap"];

export type Nhap = {
	giaTri: string;
	tuTin: MucTuTin | null;
	ghiChu: string;
	bangChung: string;
};

const SO = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

export const soVn = (so: number): string => SO.format(so);

export function nhapBanDau(kr: KrNgan): Nhap {
	const moi = moiNhat(kr);
	const giaTri =
		kr.kieu === "moc"
			? (moi?.giaTri ?? 0) >= 1
				? MOC.xong
				: MOC.chuaXong
			: soVn(moi?.giaTri ?? kr.batDau);
	return { giaTri, tuTin: null, ghiChu: "", bangChung: "" };
}

export function docGiaTri(kr: KrNgan, chu: string): number | null {
	if (kr.kieu === "moc") return chu === MOC.xong ? 1 : 0;
	return docSoOkr(chu);
}

export function laNhap(kr: KrNgan, nhap: Nhap): boolean {
	const dau = nhapBanDau(kr);
	return (
		nhap.giaTri !== dau.giaTri ||
		nhap.tuTin !== null ||
		nhap.ghiChu.trim() !== "" ||
		nhap.bangChung.trim() !== ""
	);
}

export const laDuongDan = (chu: string): boolean =>
	/^https?:\/\/\S+$/.test(chu.trim());

export function hienBangChung(kr: KrNgan, nhap: Nhap): boolean {
	return kr.kieu === "moc" && nhap.giaTri === MOC.xong;
}

export function saiBangChung(kr: KrNgan, nhap: Nhap): boolean {
	return (
		hienBangChung(kr, nhap) &&
		nhap.bangChung.trim() !== "" &&
		!laDuongDan(nhap.bangChung)
	);
}

export function sanSang(kr: KrNgan, nhap: Nhap): boolean {
	return (
		docGiaTri(kr, nhap.giaTri) !== null &&
		nhap.tuTin !== null &&
		!saiBangChung(kr, nhap)
	);
}

export function giaTriMoiNhat(kr: KrNgan): number {
	return moiNhat(kr)?.giaTri ?? kr.batDau;
}

export function chuGiaTri(kr: KrNgan, so: number): string {
	if (kr.kieu === "moc") return so >= 1 ? "Xong" : "Chưa xong";
	return soVn(so);
}

export function soDoi(kr: KrNgan, nhap: Nhap): number | null {
	const so = docGiaTri(kr, nhap.giaTri);
	if (so === null || so === giaTriMoiNhat(kr)) return null;
	return so;
}

export function soXemTruoc(kr: KrNgan, nhap: Nhap): number | null {
	return kr.kieu === "moc" ? null : soDoi(kr, nhap);
}

export function kemDonVi(kr: KrNgan, chu: string): string {
	if (kr.donVi === "%") return `${chu}%`;
	return `${chu} ${kr.donVi}`;
}

export function mucDoi(kr: KrNgan, moi: number): string {
	const cu = giaTriMoiNhat(kr);
	if (kr.kieu === "moc") return `${chuGiaTri(kr, cu)} → ${chuGiaTri(kr, moi)}`;
	const doi = moi - cu;
	const dau = doi > 0 ? "+" : "−";
	return `${soVn(cu)} → ${soVn(moi)} (${kemDonVi(kr, `${dau}${soVn(Math.abs(doi))}`)})`;
}

export function moTaMoiNhat(kr: KrNgan): string {
	const moi = moiNhat(kr);
	if (!moi) return "Chưa có lần cập nhật nào";
	const ngay = formatDayShort(ngayVn(moi.luc), "vi");
	const so =
		moi.giaTri === null
			? kr.kieu === "moc"
				? "Chưa xong"
				: "—"
			: dinhDangSo(kr, moi.giaTri);
	return `${so} · ${ngay}`;
}

const tuanNay = (): string => tuanCua(KY.homNay);

export function lanTuanNay(kr: KrNgan): LanKr | undefined {
	return kr.lan.filter((l) => tuanCua(ngayVn(l.luc)) === tuanNay()).at(-1);
}

export const denHanChuaCapNhat = (kr: KrNgan): boolean =>
	lanTuanNay(kr) === undefined;

export function xXemTruoc(kr: KrNgan): string {
	const lan = lanTuanNay(kr);
	return formatDayShort(lan ? ngayVn(lan.luc) : tuanNay(), "vi");
}

export function lanMoi(
	kr: KrNgan,
	nhap: Nhap,
	thu: number,
	ghiHo: string | null,
): LanKr {
	const so = docGiaTri(kr, nhap.giaTri);
	const luc = new Date(
		Date.parse(KY.lucGuiThu) + thu * CAU_HINH.phutGiuaHaiLan * CAU_HINH.phutMs,
	);
	const ghiChu = [
		nhap.ghiChu.trim(),
		hienBangChung(kr, nhap) && nhap.bangChung.trim() !== ""
			? `Bằng chứng: ${nhap.bangChung.trim()}`
			: "",
	]
		.filter((c) => c !== "")
		.join(" · ");
	const goc: LanKr = {
		checkInId: `ci-gui-${kr.id}-${thu}`,
		luc: luc.toISOString(),
		giaTri: so,
		tuTin: nhap.tuTin ?? "vua",
		ghiChu: ghiChu === "" ? null : ghiChu,
		camXuc: {},
	};
	return ghiHo === null ? goc : { ...goc, ghiHo };
}
