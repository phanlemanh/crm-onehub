"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@crm/ui/components/accordion";
import { Shimmer } from "@crm/ui/components/shimmer";
import { cn } from "@crm/ui/lib/utils";
import type { ReactNode } from "react";
import { useMessages } from "@crm/ui/components/locale-provider";

export function Reasoning({
	children,
	className,
	isStreaming = false,
	label,
}: {
	children: ReactNode;
	className?: string;
	isStreaming?: boolean;
	label?: string;
}) {
	const msg = useMessages();
	return (
		<Accordion
			key={isStreaming ? "streaming" : "settled"}
			type="single"
			collapsible
			defaultValue={isStreaming ? "reasoning" : undefined}
			className={cn(className)}
		>
			<AccordionItem value="reasoning">
				<AccordionTrigger variant="subtle">
					{isStreaming ? <Shimmer>{msg.reasoning.thinking}</Shimmer> : label}
				</AccordionTrigger>
				<AccordionContent className="text-muted-foreground">
					{children}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
