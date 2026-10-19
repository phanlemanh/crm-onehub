"use client";

import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { useGiaiDoan } from "@/lib/giai-doan";

export function DealStageIndicator({
	stage,
	className,
	wrapLabel = false,
}: {
	stage: string;
	className?: string;
	wrapLabel?: boolean;
}) {
	const giaiDoan = useGiaiDoan();
	return (
		<StatusIndicator
			translate="no"
			tone={giaiDoan.tone(stage)}
			label={giaiDoan.label(stage)}
			wrapLabel={wrapLabel}
			className={className}
		/>
	);
}
