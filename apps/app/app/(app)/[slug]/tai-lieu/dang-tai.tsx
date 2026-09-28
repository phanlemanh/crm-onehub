import { Skeleton } from "@crm/ui/components/skeleton";
import { TAI_LIEU_MAN } from "@/lib/tai-lieu-man";

const DONG = Array.from(
	{ length: TAI_LIEU_MAN.dangTai.soDong },
	(_, i) => `dong-${i}`,
);

export function DangTaiDanhSach() {
	return (
		<div aria-busy="true" className="flex flex-col gap-3" data-dang-tai="">
			<Skeleton className="h-8 w-full max-w-md" />
			{DONG.map((k) => (
				<Skeleton className="h-9 w-full" key={k} />
			))}
		</div>
	);
}
