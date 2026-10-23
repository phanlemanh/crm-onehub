"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { dauThangSau, homNayVn } from "@/lib/okr-chu-ky-nhan";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { type QuyenKhu, useTenDon } from "../hanh-dong-khu";
import type { DonChonOkr } from "../okr-search-params";
import type { DonViSoan } from "./kieu";
import { donViSoanCua } from "./nut-soan";

const PHA_SOAN = "lap-ke-hoach" satisfies PhaChuKy;
const TRAN_CUOC_KY = String(TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy);

export type SoanSanSang = RouterOutputs["okr"]["soanSanSang"];

export type DuongSoan =
	| { loai: "dang-tai" }
	| { loai: "khoa"; lyDo: string }
	| { loai: "mo"; donVi: DonViSoan; cheDoAn: boolean }
	| { loai: "tiep"; cuocId: string };

export type DauVaoDuongSoan = {
	don: DonChonOkr;
	cycleId: string;
	phaKy: PhaChuKy | null;
	quanTri: boolean;
	canEdit: boolean;
	cauNoi: boolean;
	tenDon: string;
	sanSang: SoanSanSang | undefined;
	m: OkrSoanMessages;
	mo: ReturnType<typeof okrMessages>;
	ngayMoLai: string;
};

function lyDoTat(
	s: Extract<SoanSanSang, { bat: false }>,
	m: OkrSoanMessages,
	ngayMoLai: string,
): string {
	if (s.lyDo === "het-cuoc-ky") return m.nut.hetCuoc(TRAN_CUOC_KY);
	if (s.lyDo === "het-tran-thang") return m.nut.tamNghi(ngayMoLai);
	return m.lyDo[s.lyDo];
}

export function duongSoan(v: DauVaoDuongSoan): DuongSoan {
	const donVi = donViSoanCua(v.don, v.cycleId);
	if (donVi === null) return { loai: "khoa", lyDo: v.mo.chonDuong.khoa.caNhan };
	if (v.phaKy !== PHA_SOAN)
		return { loai: "khoa", lyDo: v.mo.chonDuong.khoa.ngoaiPha };
	if (!v.canEdit && !v.quanTri)
		return {
			loai: "khoa",
			lyDo: v.mo.khoaTao.khongSua.replace("{ten}", v.tenDon),
		};
	if (!v.cauNoi) return { loai: "khoa", lyDo: v.m.nut.chuaCauHinh };
	const s = v.sanSang;
	if (!s) return { loai: "dang-tai" };
	if (!s.bat) return { loai: "khoa", lyDo: lyDoTat(s, v.m, v.ngayMoLai) };
	if (s.nac === "an" && !v.quanTri)
		return { loai: "khoa", lyDo: v.m.lyDo["don-vi-che-do-an"] };
	if (s.cuocDang) return { loai: "tiep", cuocId: s.cuocDang.id };
	return { loai: "mo", donVi, cheDoAn: s.nac === "an" };
}

export function useDuongSoan({
	q,
	cauNoi,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	cauNoi: boolean;
}) {
	const locale = useLocale();
	const m = okrSoanMessages(locale);
	const trpc = useTRPC();
	const moBanGhi = useOpenRecord();
	const tenDon = useTenDon(q.dich.don);
	const dangGui = useRef(false);
	const moCuoc = (id: string) => moBanGhi({ kind: "soan", id });
	const donVi = donViSoanCua(q.dich.don, q.cycleId);
	const hoiDuoc =
		cauNoi &&
		donVi !== null &&
		q.phaKy === PHA_SOAN &&
		(q.canEdit || q.quanTri);
	const sanSang = useQuery({
		...trpc.okr.soanSanSang.queryOptions(hoiDuoc && donVi ? donVi : skipToken),
		retry: false,
	});
	const mo = useMutation(
		trpc.okr.soanMo.mutationOptions({
			onSuccess: (kq) => {
				if (kq.ok) moCuoc(kq.cuoc.id);
				else if (kq.cuocDang) moCuoc(kq.cuocDang.id);
				else void sanSang.refetch();
			},
			onError: (loi) => toast.error(loi.message || m.nut.loiMo),
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);
	const duong = duongSoan({
		don: q.dich.don,
		cycleId: q.cycleId,
		phaKy: q.phaKy,
		quanTri: q.quanTri,
		canEdit: q.canEdit,
		cauNoi,
		tenDon,
		sanSang: sanSang.data,
		m,
		mo: okrMessages(locale),
		ngayMoLai: dauThangSau(homNayVn(new Date())),
	});
	const s = sanSang.data;
	return {
		duong,
		dangMo: mo.isPending,
		soCuocDaDung: s?.bat ? s.soCuocDaDung : 0,
		tranCuoc: s?.bat ? s.tranCuoc : TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy,
		donVi,
		chon: () => {
			if (dangGui.current || mo.isPending) return;
			if (duong.loai === "tiep") moCuoc(duong.cuocId);
			else if (duong.loai === "mo") {
				dangGui.current = true;
				mo.mutate(duong.donVi);
			}
		},
	};
}
