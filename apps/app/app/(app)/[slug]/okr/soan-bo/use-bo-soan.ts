"use client";

import {
	ghiDuocOPha,
	type LoaiChuKy,
	type PhaChuKy,
} from "@crm/validation/okr-chu-ky";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import { skipToken, useQueries, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { giaiDon } from "../don-dich";
import { useTenGoc } from "../ten-goc";
import { type DongDs, nguoiPhuTrachMacDinh } from "./du-lieu-bo";
import { docKhoaBo } from "./khoa-bo";
import { usePhuThuocSoan } from "./phu-thuoc";

type QuyenObjective = RouterOutputs["okr"]["objective"]["quyen"];

export type QuyenSoan =
	| { loai: "soan" }
	| { loai: "chi-xem"; lyDo: "khong-sua" | "ky-dong" | "bo-ca-nhan" };

export type MucTieuSoan = DongDs & {
	quyen: Pick<QuyenObjective, "congBo" | "guiDuyet" | "xoa"> | null;
};

export type BoSoan =
	| { trang: "dang-tai"; ten: string | null }
	| { trang: "loi"; thuLai: () => void; ten: string | null }
	| {
			trang: "xong";
			ten: string;
			khoa: { cycleId: string; don: DonChonOkr };
			pha: PhaChuKy;
			loaiKy: LoaiChuKy;
			quyen: QuyenSoan;
			mucTieu: MucTieuSoan[];
			nguoiMacDinh: string;
			thuLai: () => void;
	  };

const LOC_TRONG = {
	phuTrach: [],
	loai: [],
	trangThai: [],
	tuTin: [],
	gopY: [],
};

function quyenCua(
	don: DonChonOkr,
	suaDuoc: boolean,
	ghiDuoc: boolean,
): QuyenSoan {
	if (don.loai === "nguoi") return { loai: "chi-xem", lyDo: "bo-ca-nhan" };
	if (!ghiDuoc) return { loai: "chi-xem", lyDo: "ky-dong" };
	if (!suaDuoc) return { loai: "chi-xem", lyDo: "khong-sua" };
	return { loai: "soan" };
}

export function useQuyenSoanBo(
	cycleId: string,
	don: DonChonOkr | null,
): QuyenSoan | null {
	const trpc = useTRPC();
	const phuThuoc = usePhuThuocSoan();
	const caBo = don !== null && don.loai !== "nguoi" ? don : null;
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const danhSach = useQuery(
		trpc.okr.danhSach.queryOptions(
			caBo ? { cycleId, unit: caBo, loc: LOC_TRONG } : skipToken,
		),
	);
	if (don === null) return null;
	if (!phuThuoc.chiXemTheoQuyen) return { loai: "soan" };
	if (caBo === null) return quyenCua(don, false, false);
	const ky = cycles.data?.cycles.find((c) => c.id === cycleId);
	if (!danhSach.data || !ky) return null;
	return quyenCua(don, danhSach.data.canEdit, ghiDuocOPha(ky.phase));
}

export function useBoSoan(khoaBo: string): BoSoan {
	const trpc = useTRPC();
	const phuThuoc = usePhuThuocSoan();
	const khoa = docKhoaBo(khoaBo);
	const tenGoc = useTenGoc();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const danhSach = useQuery(
		trpc.okr.danhSach.queryOptions(
			khoa
				? { cycleId: khoa.cycleId, unit: khoa.don, loc: LOC_TRONG }
				: skipToken,
		),
	);
	const cuaBo =
		khoa && danhSach.data ? phuThuoc.chonMucTieu(danhSach.data, khoa.don) : [];
	const chiTiet = useQueries({
		queries: cuaBo
			.filter((mt) => mt.status === "nhap")
			.map((mt) => trpc.okr.objective.queryOptions({ id: mt.id })),
	});
	const quyenTheoId = new Map(
		chiTiet.flatMap((q) =>
			q.data
				? [
						[
							q.data.id,
							{
								congBo: q.data.quyen.congBo,
								guiDuyet: q.data.quyen.guiDuyet,
								xoa: q.data.quyen.xoa,
							},
						] as const,
					]
				: [],
		),
	);

	const ky = khoa
		? cycles.data?.cycles.find((c) => c.id === khoa.cycleId)
		: undefined;
	const dv = khoa && cay.data ? giaiDon(khoa.don, cay.data, tenGoc) : null;
	const ten = dv && ky ? `${dv.ten} · ${ky.name}` : null;

	const thuLai = () => {
		if (cay.isError) void cay.refetch();
		if (cycles.isError) void cycles.refetch();
		if (toi.isError) void toi.refetch();
		void danhSach.refetch();
	};

	const docs = [cay, cycles, toi, danhSach];
	const khongThayBo =
		cay.data !== undefined && cycles.data !== undefined && ten === null;
	if (khoa === null || khongThayBo || docs.some((d) => d.isError))
		return { trang: "loi", thuLai, ten };
	if (!toi.data || !danhSach.data || !cay.data || !ky || ten === null)
		return { trang: "dang-tai", ten };

	const quyen = phuThuoc.chiXemTheoQuyen
		? quyenCua(khoa.don, danhSach.data.canEdit, ghiDuocOPha(ky.phase))
		: ({ loai: "soan" } as const);

	return {
		trang: "xong",
		ten,
		khoa,
		pha: ky.phase,
		loaiKy: ky.kind,
		quyen,
		mucTieu: cuaBo.map((mt) => ({
			...mt,
			quyen: mt.status === "nhap" ? (quyenTheoId.get(mt.id) ?? null) : null,
		})),
		nguoiMacDinh: nguoiPhuTrachMacDinh(khoa.don, cay.data, toi.data.id),
		thuLai,
	};
}
