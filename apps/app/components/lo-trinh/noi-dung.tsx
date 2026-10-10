"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { DauVaoLoTrinh } from "@/lib/lo-trinh/doc-trang";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { KhungTrong } from "./khung-trong";
import { TrangLoTrinh } from "./trang-lo-trinh";

export function NoiDungLoTrinh({ dauVao }: { dauVao: DauVaoLoTrinh }) {
	const m = loTrinhMessages(useLocale());
	if (dauVao.kieu === "tep-vang")
		return (
			<KhungTrong
				ca="tep-vang"
				moTa={m.trong.tepVangMoTa}
				tieuDe={m.trong.tepVangTieuDe}
			/>
		);
	if (dauVao.kieu === "chua-co-khoi")
		return (
			<KhungTrong
				ca="chua-co-khoi"
				cauMay={dauVao.cauMay}
				moTa={m.trong.chuaCoKhoiMoTa}
				tieuDe={m.trong.chuaCoKhoiTieuDe}
			/>
		);
	if (dauVao.kieu === "khoi-hong")
		return (
			<KhungTrong
				ca="khoi-hong"
				cauMay={dauVao.cauMay}
				moTa={m.trong.khoiHongMoTa}
				tieuDe={m.trong.khoiHongTieuDe}
			/>
		);
	return <TrangLoTrinh canhBao={dauVao.canhBao} duLieu={dauVao.duLieu} />;
}
