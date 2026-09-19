"use client";

import { LocalRelativeTime } from "@/components/local-date-time";
import type { ThanhVienMessages } from "@/lib/messages/settings-thanh-vien";

const MOC = "\u0000";

export function VetLine({
	t,
	ten,
	luc,
}: {
	t: ThanhVienMessages;
	ten: string;
	luc: string;
}) {
	const [truoc, sau] = t.phatChia.vet(ten, MOC).split(MOC);

	return (
		<span className="text-muted-foreground text-xs">
			{truoc}
			<LocalRelativeTime date={luc} />
			{sau}
		</span>
	);
}
