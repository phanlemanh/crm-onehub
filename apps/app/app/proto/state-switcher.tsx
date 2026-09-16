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
				<Link
					aria-current={s.id === dangBat ? "page" : undefined}
					className={
						s.id === dangBat
							? "rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm"
							: "rounded-md border px-3 py-1.5 text-sm"
					}
					data-proto-state={s.id}
					href={`/proto/${slug}?state=${s.id}`}
					key={s.id}
				>
					{s.nhan}
				</Link>
			))}
		</nav>
	);
}
