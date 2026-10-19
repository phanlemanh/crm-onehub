"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	DanhSachTinHieu,
	type DongTinHieu,
} from "@/components/tin-hieu/danh-sach-tin-hieu";
import { NutGuiTao } from "@/components/tin-hieu/hop-gui-tin-hieu";
import { NutGuiTinHieu } from "@/components/tin-hieu/nut-gui-tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import type { TrangThaiTinHieu } from "@/lib/tin-hieu/trang-thai";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { KhungChoTinHieu } from "./khung-cho";

const MA_DA_LAY_VE = 409;

function phanTuHien(chon: string): HTMLElement | null {
	const ds = [...document.querySelectorAll<HTMLElement>(chon)];
	return ds.find((e) => e.getClientRects().length > 0) ?? ds[0] ?? null;
}

function dieuTieuDiem(ke: DongTinHieu | null) {
	const dich = !ke
		? phanTuHien("[data-tin-hieu-rong] [data-slot=nut-gui-tin-hieu-tao]")
		: ke.coTheXoa
			? phanTuHien(`[data-thao-tac-tin-hieu='${ke.ma}']`)
			: phanTuHien(`[data-tin-hieu='${ke.ma}']`);
	dich?.focus();
}

export function DanhSachTinHieuTrang({
	trangThai,
	banVeDocDuoc,
}: {
	trangThai: Record<string, TrangThaiTinHieu>;
	banVeDocDuoc: boolean;
}) {
	const m = tinHieuMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const cuaToi = useQuery(trpc.tinHieu.cuaToi.queryOptions());
	const [dangXoa, setDangXoa] = useState<string | null>(null);
	const [daXoa, setDaXoa] = useState<string | null>(null);
	const [xoaHong, setXoaHong] = useState<string | null>(null);
	const xoa = useMutation(
		trpc.tinHieu.xoa.mutationOptions({
			onSettled: () => setDangXoa(null),
		}),
	);

	if (cuaToi.isPending) return <KhungChoTinHieu />;
	if (cuaToi.isError)
		return (
			<VungTaiLoi
				dangTai={cuaToi.isFetching}
				moTa={m.trang.taiLoiMoTa}
				onThuLai={() => void cuaToi.refetch()}
				tieuDe={m.trang.taiLoiTieuDe}
			/>
		);

	const dong: DongTinHieu[] = cuaToi.data.rows.map((r) => ({
		id: r.id,
		ma: r.ma,
		tieuDe: r.tieuDe,
		muonLam: r.muonLam,
		man: r.man,
		guiLuc: new Date(r.guiLuc).toISOString(),
		coTheXoa: !r.daKeoVe,
		trangThai:
			trangThai[r.ma] ??
			(r.daKeoVe
				? { nhan: m.nhan.choGom, cau: m.trangThai.choGom, nghia: "nhap" }
				: { nhan: m.nhan.choLayVe, cau: m.trangThai.choKeoVe, nghia: "nhap" }),
	}));

	return (
		<DanhSachTinHieu
			banVeDocDuoc={banVeDocDuoc}
			dangXoa={dangXoa}
			dong={dong}
			nutGui={<NutGuiTinHieu nut={<NutGuiTao variant="outline" />} />}
			daXoa={daXoa}
			onXoa={(id) => {
				const viTri = dong.findIndex((d) => d.id === id);
				const muc = dong[viTri];
				if (!muc) return;
				const ke = dong[viTri + 1] ?? dong[viTri - 1] ?? null;
				setDangXoa(id);
				setXoaHong(null);
				xoa.mutate(
					{ id },
					{
						onSuccess: async () => {
							setDaXoa(muc.ma);
							await cache.tinHieu();
							requestAnimationFrame(() => dieuTieuDiem(ke));
						},
						onError: (loi) => {
							setXoaHong(
								dien(
									loi.data?.httpStatus === MA_DA_LAY_VE
										? m.trang.xoaHongDaLayVe
										: m.trang.xoaHong,
									{ ma: muc.ma },
								),
							);
							void cache.tinHieu();
						},
					},
				);
			}}
			xoaHong={xoaHong}
		/>
	);
}
