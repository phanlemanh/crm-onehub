"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { lamSachMan } from "@crm/validation/tin-hieu";
import { useMutation } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceSlug, useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type GiaiDoanGui, HopGuiTinHieu } from "./hop-gui-tin-hieu";

const MA_LOI_MAY_CHU = 500;

export function NutGuiTinHieu({ nut }: { nut: ReactNode }) {
	const m = tinHieuMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const slug = useWorkspaceSlug();
	const url = useWorkspaceUrl();
	const duong = usePathname() ?? "/";
	const [mo, setMo] = useState(false);
	const [muonLam, setMuonLam] = useState("");
	const [daXayRa, setDaXayRa] = useState("");
	const [ma, setMa] = useState<string | null>(null);
	const gui = useMutation(
		trpc.tinHieu.gui.mutationOptions({
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
	const maLoi = gui.error?.data?.httpStatus;
	const loi = gui.error
		? maLoi !== undefined && maLoi < MA_LOI_MAY_CHU
			? gui.error.message
			: m.hop.chuaGui
		: null;

	return (
		<HopGuiTinHieu
			daXayRa={daXayRa}
			giaiDoan={giaiDoan}
			hrefDaGui={url("/tin-hieu")}
			loi={loi}
			ma={ma}
			man={man}
			muonLam={muonLam}
			nut={nut}
			onDaXayRaChange={setDaXayRa}
			onGui={() => {
				if (gui.isPending) return;
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
		/>
	);
}
