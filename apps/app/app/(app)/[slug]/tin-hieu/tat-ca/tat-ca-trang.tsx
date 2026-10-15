"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useQuery } from "@tanstack/react-query";
import { BaSoTinHieu } from "@/components/tin-hieu/ba-so-tin-hieu";
import { BangTatCa } from "@/components/tin-hieu/bang-tat-ca";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import {
	type BaSo,
	dongTuHang,
	type TrangThaiDong,
} from "@/lib/tin-hieu/loc-tat-ca";
import { useTRPC } from "@/lib/trpc/client";
import { KhungChoTatCa } from "./khung-cho";

export function TatCaTrang({
	trangThai,
	baSo,
	banVeDocDuoc,
}: {
	trangThai: Record<string, TrangThaiDong>;
	baSo: BaSo;
	banVeDocDuoc: boolean;
}) {
	const m = tinHieuMessages(useLocale());
	const trpc = useTRPC();
	const tatCa = useQuery(trpc.tinHieu.tatCa.queryOptions());

	if (tatCa.isPending) return <KhungChoTatCa />;
	if (tatCa.isError)
		return (
			<VungTaiLoi
				dangTai={tatCa.isFetching}
				moTa={m.tatCa.taiLoiMoTa}
				onThuLai={() => void tatCa.refetch()}
				tieuDe={m.tatCa.taiLoiTieuDe}
			/>
		);

	return (
		<div className="flex flex-col gap-6">
			<BaSoTinHieu so={baSo} />
			<BangTatCa
				banVeDocDuoc={banVeDocDuoc}
				dong={dongTuHang(tatCa.data.rows, trangThai, m)}
			/>
		</div>
	);
}
