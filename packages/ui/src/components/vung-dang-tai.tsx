import { cn } from "@crm/ui/lib/utils";
import type { ComponentProps } from "react";

export function VungDangTai({
	dangTai,
	className,
	children,
	...props
}: ComponentProps<"div"> & { dangTai: boolean }) {
	return (
		<div
			aria-busy={dangTai ? "true" : undefined}
			className={cn(
				"min-w-0 transition-opacity duration-200 motion-reduce:transition-none",
				dangTai && "opacity-60",
				className,
			)}
			data-dang-tai={dangTai ? "" : undefined}
			data-slot="vung-dang-tai"
			{...props}
		>
			{children}
		</div>
	);
}
