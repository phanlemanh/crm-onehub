import { Button } from "@crm/ui/components/button";
import Link from "next/link";
import type { ProtoState } from "./catalog";

export function StateSwitcher({
	slug,
	states,
	dangBat,
}: {
	slug: string;
	states: ProtoState[];
	dangBat: string;
}) {
	return (
		<nav aria-label="Trạng thái" className="flex flex-wrap gap-2">
			{states.map((s) => (
				<Button
					asChild
					key={s.id}
					variant={s.id === dangBat ? "default" : "outline"}
				>
					<Link
						aria-current={s.id === dangBat ? "page" : undefined}
						data-proto-state={s.id}
						href={`/proto/${slug}?state=${s.id}`}
					>
						{s.nhan}
					</Link>
				</Button>
			))}
		</nav>
	);
}
