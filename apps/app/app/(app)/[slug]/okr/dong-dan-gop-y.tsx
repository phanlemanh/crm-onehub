"use client";

import { Button } from "@crm/ui/components/button";
import { useGiuNoiDung } from "@crm/ui/components/giu-thay-doi";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
} from "@crm/ui/components/item";
import { KaraMark } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SheetClose } from "@crm/ui/components/sheet";
import { parseAsString, useQueryState } from "nuqs";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { parseAsNeoGopY } from "./okr-search-params";

export function DongDanGopY({
	so,
	moTa,
	objectiveId,
	keyResultId,
}: {
	so: number;
	moTa: string;
	objectiveId: string;
	keyResultId?: string;
}) {
	const m = okrGopYMessages(useLocale());
	const openRecord = useOpenRecord();
	const giu = useGiuNoiDung();
	const [, setNeo] = useQueryState(SEARCH_PARAM.okr.neoGopY, parseAsNeoGopY);
	const [, setNeoKr] = useQueryState(SEARCH_PARAM.okr.neoGopYKr, parseAsString);
	if (so <= 0) return null;
	return (
		<Item data-dan-sang size="sm" variant="outline">
			<ItemContent>
				<KaraMark scope={m.vung.soCho(String(so))} />
				<ItemDescription>{moTa}</ItemDescription>
			</ItemContent>
			<ItemActions>
				<SheetClose asChild>
					<Button
						onClick={() => {
							if (giu?.coThayDoi) return;
							void setNeo(true);
							void setNeoKr(keyResultId ?? null);
							openRecord({ kind: "objective", id: objectiveId });
						}}
						size="sm"
						type="button"
						variant="outline"
					>
						{m.danSang.xem}
					</Button>
				</SheetClose>
			</ItemActions>
		</Item>
	);
}
