import {
	LOAI_NHAC,
	type LoaiNhac,
	NHAC,
	type ViecNhac,
} from "@crm/db/onboarding-nhac";

export const TIEU_DE = {
	"buoc-qua-han": "Quá hạn",
	"buoc-sap-han": "Sắp hạn",
	"ke-hoach-im": "Kế hoạch im",
	"moc-ngay": "Mốc ngày",
} as const satisfies { [K in LoaiNhac]: string };

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

function phanDau(v: ViecNhac): string {
	if (v.loai === "ke-hoach-im") return `im ${v.soNgay} ngày · `;
	if (v.loai === "moc-ngay") return `ngày thứ ${v.soNgay} · `;
	return "";
}

export type KhuonTin = "slack" | "tron";

function dong(
	v: ViecNhac,
	so: number,
	lienKet: (planId: string) => string | null,
	khuon: KhuonTin,
): string {
	const han = v.han ? `, hạn ${ngayThang(v.han)}` : "";
	const url = lienKet(v.planId);
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `${so}. ${v.companyName} · ${phanDau(v)}${v.goiY}${han}${mo}`;
	}
	const mo = url ? ` — <${url}|mở kế hoạch>` : "";
	return `• ${thoat(v.companyName)} · ${phanDau(v)}${thoat(v.goiY)}${han}${mo}`;
}

export type TinNhac = { text: string; daGui: ViecNhac[] };

export function dungTin(
	ten: string,
	viec: ViecNhac[],
	lienKet: (planId: string) => string | null,
	khuon: KhuonTin = "slack",
	tranKyTu: number = Number.POSITIVE_INFINITY,
	dongCuoi: string | null = null,
): TinNhac {
	const theoThuTu = LOAI_NHAC.flatMap((loai) =>
		viec.filter((v) => v.loai === loai),
	);
	const tieuDe = (loai: LoaiNhac) =>
		khuon === "tron" ? TIEU_DE[loai] : `*${TIEU_DE[loai]}*`;
	const tenHien = khuon === "tron" ? ten : thoat(ten);
	const chao = `Chào ${tenHien}, sáng nay có ${theoThuTu.length} việc 30 ngày đầu cần bạn để ý.`;
	const ve = (daGui: ViecNhac[]) => {
		const nhom = LOAI_NHAC.flatMap((loai) => {
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
		const goiY = dongCuoi ? ["", dongCuoi] : [];
		return [chao, ...nhom, ...cuoi, ...goiY].join("\n");
	};
	let daGui = theoThuTu.slice(0, NHAC.tran);
	while (daGui.length > 0 && ve(daGui).length > tranKyTu) {
		daGui = daGui.slice(0, -1);
	}
	return { text: ve(daGui), daGui };
}
