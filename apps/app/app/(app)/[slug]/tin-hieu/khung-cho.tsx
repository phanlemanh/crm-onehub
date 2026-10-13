import { Skeleton } from "@crm/ui/components/skeleton";

export function KhungChoTinHieu() {
	return (
		<div className="flex flex-col gap-2" data-tin-hieu-dang-tai="">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
