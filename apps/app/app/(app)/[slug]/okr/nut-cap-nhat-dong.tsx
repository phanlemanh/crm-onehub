"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { useTRPC } from "@/lib/trpc/client";
import { type CapNhatKr, coNutCapNhat } from "./cap-nhat-kr";

export function NutCapNhatDong({
	objectiveId,
	keyResultId,
	ten,
	mo,
}: {
	objectiveId: string;
	keyResultId: string;
	ten: string;
	mo: CapNhatKr["mo"];
}): ReactNode {
	const m = okrCanhKrMessages(useLocale()).khung;
	const trpc = useTRPC();
	const q = useQuery(trpc.okr.objective.queryOptions({ id: objectiveId }));
	const mt = q.data;
	const krMt = mt?.keyResults.find((k) => k.id === keyResultId);
	if (!mt || !krMt || !coNutCapNhat(mt, krMt)) return null;
	return (
		<Button
			aria-label={dien(m.capNhatDong, { ten })}
			data-nut="cap-nhat-dong-kr"
			onClick={(e) => {
				e.stopPropagation();
				mo(mt, krMt);
			}}
			size="sm"
			variant="outline"
		>
			{m.capNhat}
		</Button>
	);
}
