"use client";

import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { cn } from "@crm/ui/lib/utils";
import type * as React from "react";
import { useMessages } from "@crm/ui/components/locale-provider";

export type Attendee = {
	id: string;
	email: string;
	name: string | null;
	responseStatus: string | null;
	isOrganizer: boolean;
	imageUrl?: string | null;
};

export const NGHIA_PHAN_HOI = {
	accepted: "xong",
	declined: "hong",
	tentative: "cho",
	needsAction: "nhap",
} as const satisfies Record<string, NghiaTrangThai>;

function nghiaPhanHoi(trangThai: string | null): NghiaTrangThai {
	const khoa = trangThai ?? "needsAction";
	return khoa in NGHIA_PHAN_HOI
		? NGHIA_PHAN_HOI[khoa as keyof typeof NGHIA_PHAN_HOI]
		: "nhap";
}


function AttendeeList({
	attendees,
	max = 5,
	className,
	...props
}: Omit<React.ComponentProps<"div">, "children"> & {
	attendees: readonly Attendee[];
	max?: number;
}) {
	const msg = useMessages();
	if (attendees.length === 0) return null;

	const shown = attendees.slice(0, max);
	const overflow = attendees.length - shown.length;

	return (
		<div
			data-slot="attendee-list"
			className={cn("flex items-center gap-2", className)}
			{...props}
		>
			<div className="flex items-center gap-1">
				{shown.map((attendee) => (
					<Tooltip key={attendee.id}>
						<TooltipTrigger asChild>
							<PersonAvatar
								src={attendee.imageUrl}
								name={
									attendee.name?.trim() && !attendee.name.includes("@")
										? attendee.name
										: null
								}
								email={attendee.email}
								size="sm"
							/>
						</TooltipTrigger>
						<TooltipContent>
							<span className="flex items-center gap-2">
								{attendee.name ?? attendee.email}
								<StatusIndicator
									tone={toneTheoNghia(nghiaPhanHoi(attendee.responseStatus))}
									label={
										msg.attendee[
											(attendee.responseStatus ??
												"needsAction") as keyof typeof msg.attendee
										] ?? msg.attendee.needsAction
									}
								/>
							</span>
						</TooltipContent>
					</Tooltip>
				))}
			</div>

			{overflow > 0 ? (
				<span className="text-muted-foreground text-xs">+{overflow}</span>
			) : null}
		</div>
	);
}

export { AttendeeList };
