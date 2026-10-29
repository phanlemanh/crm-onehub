"use client";

import Archive from "@carbon/icons-react/es/Archive";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";

export function NutDaBo({
	n,
	bat,
	doi,
}: {
	n: number;
	bat: boolean;
	doi: (bat: boolean) => void;
}) {
	const m = okrVoKhuMessages(useLocale()).boOkr;
	if (n === 0) return null;
	return (
		<Button
			aria-pressed={bat}
			data-nut-da-bo=""
			onClick={() => doi(!bat)}
			size="sm"
			variant={bat ? "contrast" : "outline"}
		>
			<Archive data-icon="inline-start" />
			{m.daBo(n)}
		</Button>
	);
}
