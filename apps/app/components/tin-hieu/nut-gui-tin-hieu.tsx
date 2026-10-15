"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { homNayVN } from "@crm/validation/ngay-vn";
import { lamSachMan, TIN_HIEU } from "@crm/validation/tin-hieu";
import { useMutation } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { tenMan } from "@/lib/tin-hieu/ten-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceSlug, useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type GiaiDoanGui, HopGuiTinHieu } from "./hop-gui-tin-hieu";

const MA_QUA_TRAN = 429;

export function NutGuiTinHieu({ nut }: { nut: ReactNode }) {
	const locale = useLocale();
	const m = tinHieuMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const slug = useWorkspaceSlug();
	const url = useWorkspaceUrl();
	const duong = usePathname() ?? "/";
	const [mo, setMo] = useState(false);
	const [muonLam, setMuonLam] = useState("");
	const [daXayRa, setDaXayRa] = useState("");
	const [ma, setMa] = useState<string | null>(null);
	const [khoaNgay, setKhoaNgay] = useState<string | null>(null);
	const gui = useMutation(
		trpc.tinHieu.gui.mutationOptions({
			onError: (loi) => {
				if (loi.data?.httpStatus === MA_QUA_TRAN)
					setKhoaNgay(homNayVN(new Date()));
			},
			onSuccess: (kq) => {
				setMa(kq.ma);
				setMuonLam("");
				setDaXayRa("");
				void cache.tinHieu();
			},
		}),
	);
	const man = lamSachMan(
		duong.startsWith(`/${slug}`) ? duong.slice(slug.length + 1) || "/" : duong,
	);
	const giaiDoan: GiaiDoanGui = gui.isPending
		? "dang-gui"
		: ma
			? "da-gui"
			: "soan";
	const quaTran = khoaNgay !== null && khoaNgay === homNayVN(new Date());
	const loi = quaTran
		? dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) })
		: gui.error
			? m.hop.chuaGui
			: null;

	return (
		<HopGuiTinHieu
			daXayRa={daXayRa}
			giaiDoan={giaiDoan}
			hrefDaGui={url("/tin-hieu")}
			loi={loi}
			ma={ma}
			man={tenMan(man, locale)}
			muonLam={muonLam}
			nut={nut}
			onDaXayRaChange={setDaXayRa}
			onGui={() => {
				if (gui.isPending || quaTran) return;
				gui.mutate({ muonLam, daXayRa, man });
			}}
			onMuonLamChange={setMuonLam}
			onOpenChange={(o) => {
				setMo(o);
				if (!o) {
					setMa(null);
					gui.reset();
				}
			}}
			open={mo}
			quaTran={quaTran}
		/>
	);
}
