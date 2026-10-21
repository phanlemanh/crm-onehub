import { Field } from "@crm/ui/components/field";
import { cn } from "@crm/ui/lib/utils";
import type * as React from "react";

function HangHanhDongBamDay({
	className,
	...props
}: Omit<React.ComponentProps<typeof Field>, "orientation">) {
	return (
		<Field
			className={cn(
				"max-md:sticky max-md:bottom-0 max-md:z-10 max-md:border-t max-md:bg-background max-md:py-3",
				className,
			)}
			data-slot="hang-hanh-dong-bam-day"
			orientation="horizontal"
			{...props}
		/>
	);
}

export { HangHanhDongBamDay };
