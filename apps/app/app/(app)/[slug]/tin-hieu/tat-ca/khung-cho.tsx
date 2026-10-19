import { Skeleton } from "@crm/ui/components/skeleton";

export function KhungChoTatCa() {
	return (
		<div className="flex flex-col gap-3" data-tin-hieu-tat-ca-dang-tai="">
			<div className="grid grid-cols-3 gap-2">
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
			</div>
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);
}
