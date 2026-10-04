"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { KARA } from "@crm/ui/lib/kara";
import type { ReactNode, SyntheticEvent } from "react";

export type KaraMarkProps = {
	scope?: ReactNode;
};

export function KaraMark({ scope }: KaraMarkProps) {
	return (
		<span
			data-slot="kara-mark"
			className="inline-flex items-center gap-1 text-muted-foreground text-xs"
		>
			<Icon icon={AiGenerate} />
			<span translate="no">{KARA.ten}</span>
			{scope ? <span> · {scope}</span> : null}
		</span>
	);
}

export type KaraLabelProps = {
	scope?: ReactNode;
	text?: ReactNode;
	reason: ReactNode;
	readAt?: string;
};

function chanNoiBot(su: SyntheticEvent) {
	su.stopPropagation();
}

export function KaraLabel({ scope, text, reason, readAt }: KaraLabelProps) {
	const msg = useMessages();
	return (
		<div data-slot="kara-label" className="flex items-center gap-2">
			<KaraMark scope={scope} />
			{text ? (
				<span className="text-muted-foreground text-xs">{text}</span>
			) : null}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						size="xs"
						variant="ghost"
						type="button"
						onClick={chanNoiBot}
						onKeyDown={chanNoiBot}
					>
						{msg.kara.why}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					onClick={chanNoiBot}
					onKeyDown={chanNoiBot}
				>
					<PopoverHeader>
						<PopoverTitle>{msg.kara.whyTitle}</PopoverTitle>
						<PopoverDescription>{reason}</PopoverDescription>
					</PopoverHeader>
					{readAt ? (
						<p className="text-muted-foreground text-xs">
							{msg.kara.readAt(readAt)}
						</p>
					) : null}
				</PopoverContent>
			</Popover>
		</div>
	);
}

export type KaraTraceProps = {
	label?: ReactNode;
};

export function KaraTrace({ label }: KaraTraceProps) {
	const msg = useMessages();
	return (
		<span
			data-slot="kara-trace"
			className="inline-flex items-center gap-1 text-muted-foreground text-xs"
		>
			<Icon icon={AiGenerate} />
			<span aria-hidden="true">{label ?? msg.kara.trace}</span>
			<span className="sr-only">{msg.kara.traceDescription}</span>
		</span>
	);
}
