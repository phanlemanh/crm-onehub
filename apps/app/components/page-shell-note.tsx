import { cn } from "@crm/ui/lib/utils";
import type * as React from "react";

export function PageShellNote({
	className,
	id,
	...props
}: React.ComponentProps<"p"> & { id: string }) {
	return (
		<p
			id={id}
			data-slot="page-shell-note"
			className={cn(
				"order-1 basis-full text-balance text-muted-foreground text-sm md:order-last",
				className,
			)}
			{...props}
		/>
	);
}
