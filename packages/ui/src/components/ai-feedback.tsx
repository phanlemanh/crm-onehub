"use client";

import ThumbsDown from "@carbon/icons-react/es/ThumbsDown";
import ThumbsUp from "@carbon/icons-react/es/ThumbsUp";
import { Icon } from "@crm/ui/components/icon";
import { useMessages } from "@crm/ui/components/locale-provider";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { ReactNode } from "react";

const GIA_TRI = { useful: "huu-ich", notUseful: "khong-huu-ich" } as const;

export type AiFeedbackProps = {
	value: boolean | null;
	onChange: (value: boolean) => void;
	pending?: boolean;
	label: string;
	thanks: ReactNode;
};

export function AiFeedback({
	value,
	onChange,
	pending = false,
	label,
	thanks,
}: AiFeedbackProps) {
	const msg = useMessages();
	const chon =
		value === null ? "" : value ? GIA_TRI.useful : GIA_TRI.notUseful;
	const doi = (v: string) => {
		if (v !== GIA_TRI.useful && v !== GIA_TRI.notUseful) return;
		const moi = v === GIA_TRI.useful;
		if (moi === value) return;
		onChange(moi);
	};
	return (
		<div
			data-slot="ai-feedback"
			className="flex flex-wrap items-center gap-3"
		>
			<ToggleGroup
				aria-label={label}
				onValueChange={doi}
				size="sm"
				type="single"
				value={chon}
				variant="outline"
			>
				<ToggleGroupItem value={GIA_TRI.useful}>
					<Icon icon={ThumbsUp} data-icon="inline-start" />
					{msg.aiFeedback.useful}
				</ToggleGroupItem>
				<ToggleGroupItem value={GIA_TRI.notUseful}>
					<Icon icon={ThumbsDown} data-icon="inline-start" />
					{msg.aiFeedback.notUseful}
				</ToggleGroupItem>
			</ToggleGroup>
			<p className="text-muted-foreground text-xs" role="status">
				{value !== null && !pending ? thanks : ""}
			</p>
		</div>
	);
}
