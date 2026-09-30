"use client";

import Locked from "@carbon/icons-react/es/Locked";
import { Badge } from "@crm/ui/components/badge";
import { Icon } from "@crm/ui/components/icon";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";

export function RestrictedBadge({
	label,
	hint,
	onOpen,
	focusable = true,
}: {
	label: string;
	hint: string;
	onOpen: (() => void) | null;
	focusable?: boolean;
}) {
	const ten = `${label}: ${hint}`;
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge asChild variant="outline">
					{onOpen ? (
						<button
							aria-haspopup="dialog"
							aria-label={ten}
							data-nhan-gioi-han
							onClick={onOpen}
							type="button"
						>
							<Icon icon={Locked} data-icon="inline-start" />
							{label}
						</button>
					) : (
						<span
							aria-label={ten}
							data-nhan-gioi-han
							role="note"
							tabIndex={focusable ? 0 : undefined}
						>
							<Icon icon={Locked} data-icon="inline-start" />
							{label}
						</span>
					)}
				</Badge>
			</TooltipTrigger>
			<TooltipContent side="bottom">{hint}</TooltipContent>
		</Tooltip>
	);
}
