"use client";

import type { TheDangDungDuLieu } from "@crm/ui/components/the-dang-dung";
import {
	daTroiTuLucGui,
	dongHoDaTroi,
	laLauHonThuongLe,
} from "@/lib/agent-builder-cho";
import type { TroChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";
import { useSeconds } from "@/lib/use-seconds";

const TIEN_TO_VAT = "agent/";

export function useTheDangDung({
	t,
	buocVat,
	daXong,
	dangGhi,
	batDauLuc,
}: {
	t: TroChuyenMessages;
	buocVat: readonly (string | null)[];
	daXong: number;
	dangGhi: string | null;
	batDauLuc: string | null;
}): TheDangDungDuLieu {
	const daTroiMs = daTroiTuLucGui(batDauLuc, useSeconds());
	const dongHo = dongHoDaTroi(daTroiMs);
	return {
		buoc: t.man.buoc.map((nhan: string, index: number) => ({
			nhan,
			vat: buocVat[index]?.replace(TIEN_TO_VAT, "") ?? null,
		})),
		daXong,
		chu: {
			tieuDe: t.dung.dangDung,
			nhanTienDo: t.dung.nhanTienDo,
			tienDo: t.dung.tienDo(String(daXong)),
			xong: t.dung.xong,
			dangLam: t.dung.dangLam,
			dangXep: t.dung.dangXep,
			roiTrang: t.dung.roiTrang,
			daTroi: dongHo ? t.dung.daTroi(dongHo) : null,
			lauHon: laLauHonThuongLe(daTroiMs) ? t.dung.lauHon : null,
			dangGhi: dangGhi ? t.dung.dangGhi(dangGhi) : null,
		},
	};
}
