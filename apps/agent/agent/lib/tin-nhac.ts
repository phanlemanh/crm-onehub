import {
	LOAI_NHAC,
	type LoaiNhac,
	NHAC,
	type ViecNhac,
} from "@crm/db/onboarding-nhac";

const TIEU_DE = {
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

function dong(v: ViecNhac, lienKet: (planId: string) => string | null): string {
	const han = v.han ? `, hạn ${ngayThang(v.han)}` : "";
	const url = lienKet(v.planId);
	const mo = url ? ` — <${url}|mở kế hoạch>` : "";
	return `• ${thoat(v.companyName)} · ${phanDau(v)}${thoat(v.goiY)}${han}${mo}`;
}

export type TinNhac = { text: string; daGui: ViecNhac[] };

export function dungTin(
	ten: string,
	viec: ViecNhac[],
	lienKet: (planId: string) => string | null,
): TinNhac {
	const theoThuTu = LOAI_NHAC.flatMap((loai) =>
		viec.filter((v) => v.loai === loai),
	);
	const daGui = theoThuTu.slice(0, NHAC.tran);
	const nhom = LOAI_NHAC.flatMap((loai) => {
		const ds = daGui.filter((v) => v.loai === loai);
		if (ds.length === 0) return [];
		return ["", `*${TIEU_DE[loai]}*`, ...ds.map((v) => dong(v, lienKet))];
	});
	const conLai = theoThuTu.length - daGui.length;
	const cuoi = conLai > 0 ? ["", `và ${conLai} việc nữa — mở tổng quan`] : [];
	const chao = `Chào ${thoat(ten)}, sáng nay có ${theoThuTu.length} việc 30 ngày đầu cần bạn để ý.`;
	return { text: [chao, ...nhom, ...cuoi].join("\n"), daGui };
}
