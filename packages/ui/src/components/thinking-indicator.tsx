import { DotMatrix } from "@crm/ui/components/dot-matrix";
import { Shimmer } from "@crm/ui/components/shimmer";
import { cn } from "@crm/ui/lib/utils";
import { useMessages } from "@crm/ui/components/locale-provider";

export function ThinkingIndicator({
	label,
	className,
}: {
	label?: string;
	className?: string;
}) {
	const msg = useMessages();
	return (
		<div className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
			<DotMatrix decorative />
			<Shimmer className="text-muted-foreground">
				{label ?? msg.macDinh.dangNghi}
			</Shimmer>
		</div>
	);
}
