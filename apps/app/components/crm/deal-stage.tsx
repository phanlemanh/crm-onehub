"use client";

import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { useGiaiDoan } from "@/lib/giai-doan";

export function DealStageIndicator({
	stage,
	className,
}: {
	stage: string;
	className?: string;
}) {
	const giaiDoan = useGiaiDoan();
	return (
		<span translate="no">
			<StatusIndicator
				tone={giaiDoan.tone(stage)}
				label={giaiDoan.label(stage)}
				className={className}
			/>
		</span>
	);
}
