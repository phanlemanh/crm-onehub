"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import {
	createParser,
	parseAsBoolean,
	useQueryState,
	useQueryStates,
} from "nuqs";
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

export function BoKhoaUrl({ bo }: { bo: () => void }) {
	useMountEffect(bo);
	return null;
}

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
	const [thamSo, dat] = useQueryStates({
		[SEARCH_PARAM.dialog.create]: parseAsBoolean.withDefault(false),
		[SEARCH_PARAM.okr.tuMau]: parseAsBoolean.withDefault(false),
	});
	const mo = thamSo[SEARCH_PARAM.dialog.create];
	const dong = () =>
		void dat({
			[SEARCH_PARAM.dialog.create]: null,
			[SEARCH_PARAM.okr.tuMau]: null,
		});
	if (mo && suaDuoc === false) return <BoKhoaUrl bo={dong} />;
	if (!mo || !suaDuoc) return null;
	return (
		<HopThoaiMucTieu
			yeuCau={{
				loai: "tao",
				cycleId,
				don,
				tenDon,
				batDau: thamSo[SEARCH_PARAM.okr.tuMau] ? "mau" : "tay",
			}}
			dong={dong}
		/>
	);
}
