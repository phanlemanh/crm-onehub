"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMoCapNhatKr } from "@/components/crm/record-sheet/khoi-cap-nhat-kr";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { useTRPC } from "@/lib/trpc/client";
import { coNutCapNhat } from "./cap-nhat-kr";

export function NutCapNhatDong({
	objectiveId,
	keyResultId,
	ten,
	loiVao,
	thuTu = null,
}: {
	objectiveId: string;
	keyResultId: string;
	ten: string;
	loiVao: "hop-tuan" | "bang-don-vi";
	thuTu?: string | null;
}): ReactNode {
	const mo = useMoCapNhatKr();
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
				mo(krMt.id, loiVao, thuTu);
			}}
			size="sm"
			variant="outline"
		>
			{m.capNhat}
		</Button>
	);
}
