"use client";

import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import type { TaiLieuMessages } from "@/lib/messages/tai-lieu";

export function LoiTai({
	m,
	thuLai,
}: {
	m: TaiLieuMessages;
	thuLai: () => void;
}) {
	return (
		<VungTaiLoi
			data-trang-thai="ST-tailieu-loi"
			moTa={m.loiTai.moTa}
			onThuLai={thuLai}
			tieuDe={m.loiTai.tieuDe}
		/>
	);
}
