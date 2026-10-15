import { dinhUsd } from "@crm/db/ai-chi-phi-danh-muc";
import { LOAI_NHAC_AI, type ViecAi } from "@crm/db/ai-nhac";
import type { ViecOkr } from "@crm/db/okr-nhac";
import type { ViecTomTat } from "@crm/db/okr-tom-tat";
import { OKR_TOM_TAT } from "@crm/db/okr-tro-ly-danh-muc";
import {
	gioVN,
	laBuoiSang,
	laNhacViec,
	NHAC,
	type NhacViec,
	ngayVN,
	THU_TU_NHAC,
	type ViecKeHoach,
	type ViecNhac,
} from "@crm/db/onboarding-nhac";
import type { ViecTaiLieu } from "@crm/db/tai-lieu-nhac";

type LoaiTin = ViecNhac["loai"];

export const TIEU_DE = {
	"buoc-qua-han": "Quá hạn",
	"buoc-sap-han": "Sắp hạn",
	"ke-hoach-im": "Kế hoạch im",
	"moc-ngay": "Mốc ngày",
	"viec-qua-han": "Việc quá hạn",
	"viec-sap-han": "Việc sắp hạn",
	"viec-cho-danh-gia": "Việc chờ bạn đánh giá",
	"okr-cap-nhat": "Cập nhật tuần",
	"okr-cho-duyet": "Chờ bạn duyệt",
	"okr-tra-lai": "Bị trả lại",
	"okr-kr-im": "KR im",
	"okr-duoc-giao": "Được giao",
	"okr-nhac-ten": "Nhắc tên",
	"okr-ghi-nhan": "Ghi nhận",
	"okr-theo-doi": "Đang theo dõi",
	"okr-hoi-y-gop": "Hỏi ý mục tiêu",
	"okr-hoi-y-cong-bo": "Hỏi ý đã công bố",
	"okr-tom-tat": "Kara · OKR",
	"tai-lieu-cho-duyet": "Kho tài liệu",
	"ai-tran": "Ngân sách AI",
	"ai-doi-soat-lech": "Đối soát AI",
} as const satisfies { [K in LoaiTin]: string };

function thoat(chu: string): string {
	return chu
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function ngayThang(han: string): string {
	const [, thang, ngay] = han.split("-");
	return `${ngay}/${thang}`;
}

function gioHan(hanLuc: string): string {
	const han = new Date(hanLuc);
	return `${gioVN(han)} ${ngayThang(ngayVN(han))}`;
}

function phanDau(v: ViecKeHoach): string {
	if (v.loai === "ke-hoach-im") return `im ${v.soNgay} ngày · `;
	if (v.loai === "moc-ngay") return `ngày thứ ${v.soNgay} · `;
	return "";
}

export type KhuonTin = "slack" | "tron";

export type LienKet = (v: ViecNhac) => string | null;

function dongKeHoach(
	v: ViecKeHoach,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	const han = v.han ? `, hạn ${ngayThang(v.han)}` : "";
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `${so}. ${v.companyName} · ${phanDau(v)}${v.goiY}${han}${mo}`;
	}
	const mo = url ? ` — <${url}|mở kế hoạch>` : "";
	return `• ${thoat(v.companyName)} · ${phanDau(v)}${thoat(v.goiY)}${han}${mo}`;
}

function dongViec(
	v: NhacViec,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	const han = v.han ? ` · hạn ${ngayThang(v.han)}` : "";
	if (khuon === "tron") {
		const banGhi = v.banGhi ? ` · ${v.banGhi}` : "";
		return `${so}. ${v.tieuDe}${han}${banGhi}${url ? ` — ${url}` : ""}`;
	}
	const banGhi = v.banGhi ? ` · ${thoat(v.banGhi)}` : "";
	return `• ${thoat(v.tieuDe)}${han}${banGhi}${url ? ` — <${url}|mở việc>` : ""}`;
}

function noiDungOkr(v: ViecOkr, chu: (s: string) => string): string {
	switch (v.loai) {
		case "okr-cap-nhat":
			return `${v.soKr} KR chờ cập nhật tuần này`;
		case "okr-kr-im":
			return v.chuTen === null
				? `KR «${chu(v.nhan)}» im ${v.soNgay} ngày`
				: `KR «${chu(v.nhan)}» của ${chu(v.chuTen)} im ${v.soNgay} ngày`;
		case "okr-duoc-giao":
			return v.keyResultId
				? `Bạn phụ trách KR «${chu(v.nhan)}»`
				: `Bạn phụ trách mục tiêu «${chu(v.nhan)}»`;
		case "okr-nhac-ten":
			return `${chu(v.nguoiTen)} nhắc tên bạn ở «${chu(v.nhan)}»`;
		case "okr-ghi-nhan":
			return `${chu(v.nguoiGui)} ghi nhận bạn ở «${chu(v.nhan)}»`;
		case "okr-theo-doi":
			return `«${chu(v.nhan)}» có ${v.capNhat} cập nhật, ${v.binhLuan} bình luận mới`;
		case "okr-cho-duyet":
			return v.nguoiGui === null
				? `Mục tiêu «${chu(v.nhan)}» chờ bạn duyệt`
				: `${chu(v.nguoiGui)} gửi duyệt mục tiêu «${chu(v.nhan)}»`;
		case "okr-tra-lai":
			return `${chu(v.nguoiTraLai)} trả lại mục tiêu «${chu(v.nhan)}»: ${chu(v.lyDo)}`;
		case "okr-hoi-y-gop":
			return `Công ty đang hỏi ý cho mục tiêu ${chu(v.nhan)} — hạn ${gioHan(v.hanLuc)}`;
		case "okr-hoi-y-cong-bo":
			return `Mục tiêu ${chu(v.nhan)} đã công bố — xem ý của bạn đi đâu`;
	}
}

function thangNam(thang: string): string {
	const [nam, so] = thang.split("-");
	return `${so}/${nam}`;
}

function thangSauDau(thang: string): string {
	const [, so] = thang.split("-").map(Number) as [number, number];
	return so === 12 ? "01/01" : `01/${String(so + 1).padStart(2, "0")}`;
}

export function noiDungAi(v: ViecAi): string {
	if (v.loai === "ai-tran") {
		const so = `${dinhUsd(v.chiUsd)} / ${dinhUsd(v.tranUsd)}`;
		return v.muc === 100
			? `Kara đã chạm trần tháng (${so}) — tạm nghỉ tới ${thangSauDau(v.thang)}`
			: `Kara đã dùng 80% trần tháng (${so})`;
	}
	return `Đối soát tháng ${thangNam(v.thang)} với AI Gateway lệch ${String(v.lechPhanTram).replace(".", ",")}% (sổ ${dinhUsd(v.soSoUsd)}, Gateway ${dinhUsd(v.soGatewayUsd)})`;
}

function dongAi(
	v: ViecAi,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `${so}. ${noiDungAi(v)}${mo}`;
	}
	const mo = url ? ` — <${url}|mở cài đặt OKR>` : "";
	return `• ${thoat(noiDungAi(v))}${mo}`;
}

const NHAN_LIEN_KET_OKR = {
	"okr-cap-nhat": "mở cập nhật tuần",
	"okr-kr-im": "mở mục tiêu",
	"okr-duoc-giao": "mở mục tiêu",
	"okr-nhac-ten": "mở mục tiêu",
	"okr-ghi-nhan": "mở mục tiêu",
	"okr-theo-doi": "mở mục tiêu",
	"okr-cho-duyet": "mở mục tiêu",
	"okr-tra-lai": "mở mục tiêu",
	"okr-hoi-y-gop": "mở hỏi ý",
	"okr-hoi-y-cong-bo": "mở hỏi ý",
} as const satisfies { [K in ViecOkr["loai"]]: string };

function dongOkr(
	v: ViecOkr,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `${so}. ${noiDungOkr(v, (s) => s)}${mo}`;
	}
	const nhan = NHAN_LIEN_KET_OKR[v.loai];
	const mo = url ? ` — <${url}|${nhan}>` : "";
	return `• ${noiDungOkr(v, thoat)}${mo}`;
}

function dongTaiLieu(
	v: ViecTaiLieu,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	const chu = `${v.so} bản đề xuất chờ bạn duyệt`;
	if (khuon === "tron") return `${so}. ${chu}${url ? ` — ${url}` : ""}`;
	return `• ${chu}${url ? ` — <${url}|mở tab Chờ duyệt>` : ""}`;
}

const DONG_TOM_TAT = "Tóm tắt tuần";

function dongTomTat(
	v: ViecTomTat,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	const chu = (ten: string) =>
		`${DONG_TOM_TAT} Phòng ${ten} · ${v.soKrDangBan} KR đáng bàn`;
	if (khuon === "tron")
		return `${so}. ${chu(v.phongTen)}${url ? ` — ${url}` : ""}`;
	return `• ${chu(thoat(v.phongTen))}${url ? ` — <${url}|mở>` : ""}`;
}

const LOAI_DONG_MAY: readonly LoaiTin[] = [...LOAI_NHAC_AI, "okr-tom-tat"];

function laDongMay(v: ViecNhac): boolean {
	return LOAI_DONG_MAY.includes(v.loai);
}

export function truKrIm(ds: ViecNhac[]): ViecNhac[] {
	const im = new Set(
		ds.flatMap((v) => (v.loai === "okr-kr-im" ? [v.keyResultId] : [])),
	);
	return ds.map((v) =>
		v.loai === "okr-tom-tat"
			? {
					...v,
					soKrDangBan: v.krDangBan.filter((id) => !im.has(id)).length,
				}
			: v,
	);
}

function dong(v: ViecNhac, so: number, lienKet: LienKet, khuon: KhuonTin) {
	const url = lienKet(v);
	if (laNhacViec(v)) return dongViec(v, so, url, khuon);
	if ("planId" in v) return dongKeHoach(v, so, url, khuon);
	if (v.loai === "tai-lieu-cho-duyet") return dongTaiLieu(v, so, url, khuon);
	if (v.loai === "okr-tom-tat") return dongTomTat(v, so, url, khuon);
	if (v.loai === "ai-tran" || v.loai === "ai-doi-soat-lech") {
		return dongAi(v, so, url, khuon);
	}
	return dongOkr(v, so, url, khuon);
}

export type TinNhac = { text: string; daGui: ViecNhac[] };

export function dungTin(
	ten: string,
	luc: Date,
	viec: ViecNhac[],
	lienKet: LienKet,
	khuon: KhuonTin = "slack",
	tranKyTu: number = Number.POSITIVE_INFINITY,
	dongCuoi: string | null = null,
): TinNhac {
	const thuTu: readonly string[] = THU_TU_NHAC;
	const la = viec.find((v) => !thuTu.includes(v.loai));
	if (la) {
		throw new Error(`loại nhắc không có thứ tự trong tin: ${la.loai}`);
	}
	const theoLoai = THU_TU_NHAC.flatMap((loai) =>
		viec.filter((v) => v.loai === loai),
	);
	const theoThuTu = [
		...theoLoai.filter((v) => !laDongMay(v)),
		...theoLoai.filter(laDongMay).slice(0, OKR_TOM_TAT.dongBaoAiToiDa),
	];
	const tieuDe = (loai: LoaiTin) =>
		khuon === "tron" ? TIEU_DE[loai] : `*${TIEU_DE[loai]}*`;
	const tenHien = khuon === "tron" ? ten : thoat(ten);
	const coOkr = theoThuTu.some((v) => !("planId" in v));
	const buoi = laBuoiSang(luc) ? "sáng nay" : "hôm nay";
	const chao = coOkr
		? `Chào ${tenHien}, ${buoi} có ${theoThuTu.length} việc cần bạn để ý.`
		: `Chào ${tenHien}, ${buoi} có ${theoThuTu.length} việc 30 ngày đầu cần bạn để ý.`;
	const ve = (ds: ViecNhac[]) => {
		const daGui = truKrIm(ds);
		const nhom = [...new Set(daGui.map((v) => v.loai))].flatMap((loai) => {
			const cungLoai = daGui.filter((v) => v.loai === loai);
			return [
				"",
				tieuDe(loai),
				...cungLoai.map((v) => dong(v, daGui.indexOf(v) + 1, lienKet, khuon)),
			];
		});
		const conLai = theoThuTu.length - daGui.length;
		const cuoi = conLai > 0 ? ["", `và ${conLai} việc nữa — mở tổng quan`] : [];
		const goiY = khuon === "tron" && dongCuoi ? ["", dongCuoi] : [];
		return [chao, ...nhom, ...cuoi, ...goiY].join("\n");
	};
	let daGui = theoThuTu.slice(0, NHAC.tran);
	while (daGui.length > 0 && ve(daGui).length > tranKyTu) {
		daGui = daGui.slice(0, -1);
	}
	return { text: ve(daGui), daGui: truKrIm(daGui) };
}
