"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { baoDaLuuTru } from "@crm/ui/lib/bao-luu-tru";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { BaSoTinHieu } from "@/components/tin-hieu/ba-so-tin-hieu";
import { BangTatCa } from "@/components/tin-hieu/bang-tat-ca";
import { tatCaListParams } from "@/components/tin-hieu/tham-so-tat-ca";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import {
	type DongTatCa,
	dongTuHang,
	type TrangThaiDong,
} from "@/lib/tin-hieu/loc-tat-ca";
import { demBaSo } from "@/lib/tin-hieu/tat-ca";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { KhungChoTatCa } from "./khung-cho";

const MA_VUA_LAY_VE = 409;

export function TatCaTrang({
	trangThai,
	coCho,
	banVeDocDuoc,
	luc,
}: {
	trangThai: Record<string, TrangThaiDong>;
	coCho: string[];
	banVeDocDuoc: boolean;
	luc: string;
}) {
	const m = tinHieuMessages(useLocale());
	const t = m.tatCa.luuTru;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { input } = useTableQuery(tatCaListParams);
	const dangDung = useQuery(trpc.tinHieu.tatCa.queryOptions());
	const daLuuTru = useQuery({
		...trpc.tinHieu.daLuuTru.queryOptions(),
		enabled: input.archived,
	});
	const [soDangCho, setSoDangCho] = useState(0);
	const hangDoi = useRef<Promise<void>>(Promise.resolve());
	const luuTru = useMutation(trpc.tinHieu.luuTru.mutationOptions());
	const khoiPhuc = useMutation(trpc.tinHieu.khoiPhuc.mutationOptions());

	const xepHang = (viec: () => Promise<void>) => {
		setSoDangCho((n) => n + 1);
		hangDoi.current = hangDoi.current
			.then(viec)
			.finally(() => setSoDangCho((n) => n - 1));
	};

	const goKhoiPhuc = (d: DongTatCa) =>
		xepHang(async () => {
			try {
				await khoiPhuc.mutateAsync({ id: d.id });
				void cache.tinHieu();
				toast.success(dien(t.daKhoiPhuc, { ma: d.ma }));
			} catch {
				toast.error(dien(t.khoiPhucHong, { ma: d.ma }));
			}
		});

	const goLuuTru = (d: DongTatCa) =>
		xepHang(async () => {
			try {
				await luuTru.mutateAsync({ id: d.id });
				void cache.tinHieu();
				baoDaLuuTru({
					thongDiep: dien(t.daLuuTru, { ma: d.ma }),
					nhanHoanTac: t.hoanTac,
					onHoanTac: () => goKhoiPhuc(d),
				});
			} catch (loi) {
				if (
					loi instanceof TRPCClientError &&
					loi.data?.httpStatus === MA_VUA_LAY_VE
				) {
					toast.error(dien(t.vuaLayVe, { ma: d.ma }));
					void cache.tinHieu();
					return;
				}
				toast.error(dien(t.luuTruHong, { ma: d.ma }));
			}
		});

	const xem = input.archived ? daLuuTru : dangDung;
	if (dangDung.isPending || xem.isPending) return <KhungChoTatCa />;
	if (dangDung.isError || xem.isError)
		return (
			<VungTaiLoi
				dangTai={xem.isFetching || dangDung.isFetching}
				moTa={m.tatCa.taiLoiMoTa}
				onThuLai={() => {
					void xem.refetch();
					if (xem !== dangDung) void dangDung.refetch();
				}}
				tieuDe={m.tatCa.taiLoiTieuDe}
			/>
		);

	return (
		<div className="flex flex-col gap-6">
			<BaSoTinHieu
				so={demBaSo({
					rows: dangDung.data.rows,
					coCho,
					banVeDocDuoc,
					now: new Date(luc),
				})}
			/>
			<BangTatCa
				banVeDocDuoc={banVeDocDuoc}
				dong={dongTuHang(xem.data.rows, trangThai, m)}
				thaoTac={{
					dangCho: soDangCho > 0,
					onKhoiPhuc: goKhoiPhuc,
					onLuuTru: goLuuTru,
				}}
			/>
		</div>
	);
}
