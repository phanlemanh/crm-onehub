import { dinhUsd } from "@crm/db/ai-chi-phi-danh-muc";
import type { ViecAi } from "@crm/db/ai-nhac";
import type { ViecOkr } from "@crm/db/okr-nhac";
import {
	laBuoiSang,
	NHAC,
	THU_TU_NHAC,
	type ViecKeHoach,
	type ViecNhac,
} from "@crm/db/onboarding-nhac";

type LoaiTin = ViecNhac["loai"];

export const TIEU_DE = {
	"buoc-qua-han": "Quá hạn",
	"buoc-sap-han": "Sắp hạn",
	"ke-hoach-im": "Kế hoạch im",
	"moc-ngay": "Mốc ngày",
	"okr-cap-nhat": "Cập nhật tuần",
	"okr-kr-im": "KR im",
	"okr-duoc-giao": "Được giao",
	"okr-nhac-ten": "Nhắc tên",
	"okr-ghi-nhan": "Ghi nhận",
	"okr-theo-doi": "Đang theo dõi",
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
			? `Trợ lý OKR đã chạm trần tháng (${so}) — tạm nghỉ tới ${thangSauDau(v.thang)}`
			: `Trợ lý OKR đã dùng 80% trần tháng (${so})`;
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
	const nhan = v.loai === "okr-cap-nhat" ? "mở cập nhật tuần" : "mở mục tiêu";
	const mo = url ? ` — <${url}|${nhan}>` : "";
	return `• ${noiDungOkr(v, thoat)}${mo}`;
}

function dong(v: ViecNhac, so: number, lienKet: LienKet, khuon: KhuonTin) {
	const url = lienKet(v);
	if ("planId" in v) return dongKeHoach(v, so, url, khuon);
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
	const theoThuTu = THU_TU_NHAC.flatMap((loai) =>
		viec.filter((v) => v.loai === loai),
	);
	const tieuDe = (loai: LoaiTin) =>
		khuon === "tron" ? TIEU_DE[loai] : `*${TIEU_DE[loai]}*`;
	const tenHien = khuon === "tron" ? ten : thoat(ten);
	const coOkr = theoThuTu.some((v) => !("planId" in v));
	const buoi = laBuoiSang(luc) ? "sáng nay" : "hôm nay";
	const chao = coOkr
		? `Chào ${tenHien}, ${buoi} có ${theoThuTu.length} việc cần bạn để ý.`
		: `Chào ${tenHien}, ${buoi} có ${theoThuTu.length} việc 30 ngày đầu cần bạn để ý.`;
	const ve = (daGui: ViecNhac[]) => {
		const nhom = THU_TU_NHAC.flatMap((loai) => {
			const ds = daGui.filter((v) => v.loai === loai);
			if (ds.length === 0) return [];
			return [
				"",
				tieuDe(loai),
				...ds.map((v) => dong(v, daGui.indexOf(v) + 1, lienKet, khuon)),
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
	return { text: ve(daGui), daGui };
}
