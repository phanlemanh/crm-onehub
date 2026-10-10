import { Skeleton } from "@crm/ui/components/skeleton";

export function KhungCho() {
	return (
		<div className="flex flex-col gap-3" data-lo-trinh-trang="dang-tai">
			<div className="flex gap-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-32" />
			</div>
			<Skeleton className="h-96 w-full" />
		</div>
	);
}
