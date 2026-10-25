"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { ghiDuocOPha } from "@crm/validation/okr-chu-ky";
import { parseAsString, useQueryState } from "nuqs";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import type { QuyenKhu } from "../hanh-dong-khu";
import { donViSoanCua } from "../soan/nut-soan";
import { taoKhoaBo } from "./khoa-bo";

type QuyenKhuXong = Extract<QuyenKhu, { kieu: "xong" }>;

export function soanBoDuoc(q: QuyenKhuXong): boolean {
	return (
		(q.canEdit || q.quanTri) &&
		q.phaKy !== null &&
		ghiDuocOPha(q.phaKy) &&
		donViSoanCua(q.dich.don, q.cycleId) !== null
	);
}

export type MoSoanBo = {
	duoc: boolean;
	lyDo: string | null;
	mo: (mucTieuId?: string) => void;
};

export function useMoSoanBo(q: QuyenKhuXong): MoSoanBo {
	const m = okrSoanBoMessages(useLocale());
	const moBanGhi = useOpenRecord();
	const [, datMucTieu] = useQueryState(SEARCH_PARAM.okr.soanMt, parseAsString);
	const duoc = soanBoDuoc(q);
	return {
		duoc,
		lyDo: duoc ? null : m.loiVao.khoa,
		mo: (mucTieuId) => {
			if (!duoc) return;
			void datMucTieu(mucTieuId ?? null);
			moBanGhi({ kind: "soan-bo", id: taoKhoaBo(q.cycleId, q.dich.don) });
		},
	};
}
