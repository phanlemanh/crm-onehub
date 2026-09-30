"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { createParser, parseAsBoolean, useQueryState } from "nuqs";
import { useEffect } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { HopThoaiMucTieu } from "./hop-thoai-muc-tieu";
import type { DonChonOkr } from "./okr-search-params";

export type HopOkr =
	| { loai: "muc-tieu" }
	| { loai: "kr-moi" }
	| { loai: "kr"; id: string };

const TIEN_TO_KR = "kr:";

export const khoaHopOkr = (h: HopOkr): string =>
	h.loai === "kr" ? `${TIEN_TO_KR}${h.id}` : h.loai;

export const parseAsHopOkr = createParser<HopOkr>({
	parse: (v) => {
		if (v === "muc-tieu" || v === "kr-moi") return { loai: v };
		if (v.startsWith(TIEN_TO_KR) && v.length > TIEN_TO_KR.length)
			return { loai: "kr", id: v.slice(TIEN_TO_KR.length) };
		return null;
	},
	serialize: khoaHopOkr,
	eq: (a, b) => khoaHopOkr(a) === khoaHopOkr(b),
});

export function useHopOkr() {
	return useQueryState(SEARCH_PARAM.okr.hop, parseAsHopOkr);
}

function useMoTaoMucTieu() {
	return useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
}

export function NutThemMucTieu({ suaDuoc }: { suaDuoc: boolean | undefined }) {
	const m = okrMessages(useLocale());
	const [, datMo] = useMoTaoMucTieu();
	if (!suaDuoc) return null;
	return (
		<Button
			size="sm"
			aria-haspopup="dialog"
			data-nut="them-muc-tieu"
			onClick={() => void datMo(true)}
		>
			<Icon icon={Add} data-icon="inline-start" />
			{m.themMucTieu}
		</Button>
	);
}

export function NganTaoMucTieu({
	suaDuoc,
	cycleId,
	don,
	tenDon,
}: {
	suaDuoc: boolean | undefined;
	cycleId: string;
	don: DonChonOkr;
	tenDon: string;
}) {
	const [mo, datMo] = useMoTaoMucTieu();
	useEffect(() => {
		if (mo && suaDuoc === false) void datMo(null);
	}, [mo, suaDuoc, datMo]);
	if (!mo || !suaDuoc) return null;
	return (
		<HopThoaiMucTieu
			yeuCau={{ loai: "tao", cycleId, don, tenDon }}
			dong={() => void datMo(null)}
		/>
	);
}
