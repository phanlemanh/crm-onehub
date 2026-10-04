"use client";

import { Badge } from "@crm/ui/components/badge";
import { KaraMark } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQueryState } from "nuqs";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import type { DiemCam } from "./diem-cam";
import type { MucTieu } from "./kieu";
import { parseAsNeoGopY } from "./okr-search-params";

export function ChipGopY({ mt }: { mt: MucTieu }) {
	const m = okrGopYMessages(useLocale());
	const openRecord = useOpenRecord();
	const [, setNeo] = useQueryState(SEARCH_PARAM.okr.neoGopY, parseAsNeoGopY);
	const so = String(mt.soGopYCho);
	return (
		<Badge asChild tuongTac variant="outline">
			<button
				aria-label={m.chipAria(so, mt.title)}
				data-chip-gop-y={mt.id}
				onClick={(e) => {
					e.stopPropagation();
					void setNeo(true);
					openRecord({ kind: "objective", id: mt.id });
				}}
				onKeyDown={(e) => e.stopPropagation()}
				type="button"
			>
				<KaraMark scope={m.chip(so)} />
			</button>
		</Badge>
	);
}

export const DIEM_CAM_GOP_Y: DiemCam = {
	nhanMucTieu: (mt) => (mt.soGopYCho > 0 ? <ChipGopY mt={mt} /> : null),
};
