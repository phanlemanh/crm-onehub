import { Skeleton } from "@crm/ui/components/skeleton";

export function KhungChoThongBao() {
	return (
		<div className="flex flex-col gap-2" data-thong-bao-dang-tai="">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
