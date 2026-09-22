import type { DealStage } from "@crm/db/enums";
import { ForeignText } from "@crm/ui/components/foreign-text";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { dealStagePresentation } from "@/lib/deal-stage";

export function DealStageIndicator({
	stage,
	className,
}: {
	stage: DealStage;
	className?: string;
}) {
	const { label, tone } = dealStagePresentation(stage);
	return (
		<ForeignText lang="en">
			<StatusIndicator tone={tone} label={label} className={className} />
		</ForeignText>
	);
}
