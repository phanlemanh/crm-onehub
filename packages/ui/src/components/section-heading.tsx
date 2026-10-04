import { cn } from "@crm/ui/lib/utils";
import type * as React from "react";

const CAP = { 3: "h3", 4: "h4" } as const;

function SectionHeading({
	level = 3,
	actions,
	className,
	children,
	...props
}: React.ComponentProps<"div"> & {
	level?: 3 | 4;
	actions?: React.ReactNode;
}) {
	const The = CAP[level];
	return (
		<div
			data-slot="section-heading"
			className={cn(
				"flex min-w-0 items-center justify-between gap-2",
				className,
			)}
			{...props}
		>
			<The
				data-slot="section-heading-title"
				className="font-heading text-sm font-medium"
			>
				{children}
			</The>
			{actions ? <SectionHeadingActions>{actions}</SectionHeadingActions> : null}
		</div>
	);
}

function SectionHeadingActions({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="section-heading-actions"
			className={cn("flex shrink-0 items-center gap-2", className)}
			{...props}
		/>
	);
}

export { SectionHeading, SectionHeadingActions };
