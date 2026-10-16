"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { DauVaoLoTrinh } from "@/lib/lo-trinh/doc-trang";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { DongGioLay } from "./dong-gio-lay";
import { KhungTrong } from "./khung-trong";
import { TrangLoTrinh } from "./trang-lo-trinh";

export function NoiDungLoTrinh({
	dauVao,
	homNayCoDinh,
}: {
	dauVao: DauVaoLoTrinh;
	homNayCoDinh?: string;
}) {
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
	const trang = (
		<TrangLoTrinh
			canhBao={dauVao.canhBao}
			duLieu={dauVao.duLieu}
			homNayCoDinh={homNayCoDinh}
		/>
	);
	if (!dauVao.nguon) return trang;
	return (
		<div className="flex flex-col gap-3">
			<DongGioLay nguon={dauVao.nguon} />
			{trang}
		</div>
	);
}
