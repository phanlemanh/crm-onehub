"use client";

import Close from "@carbon/icons-react/es/Close";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputHeader,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@crm/ui/components/ai-elements/prompt-input";
import {
	Suggestion,
	Suggestions,
} from "@crm/ui/components/ai-elements/suggestion";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useKaraBusy } from "@crm/ui/components/kara/busy";
import { useMessages } from "@crm/ui/components/locale-provider";
import { type ReactNode, useId, useRef, useState } from "react";

export type KaraComposerProps = {
	onSubmit: (text: string) => void;
	onStop?: () => void;
	status?: "ready" | "busy" | "error";
	placeholder?: string;
	label?: string;
	context?: { label: string; onRemove: () => void };
	suggestions?: readonly string[];
	suggestionsLabel?: string;
	onSuggestion?: (text: string) => void;
	lockedReason?: ReactNode;
};

export function KaraComposer({
	onSubmit,
	onStop,
	status = "ready",
	placeholder,
	label,
	context,
	suggestions,
	suggestionsLabel,
	onSuggestion,
	lockedReason,
}: KaraComposerProps) {
	const msg = useMessages();
	const banChung = useKaraBusy();
	const ban = status === "busy" || banChung !== null;
	const khoa = lockedReason !== undefined && lockedReason !== null;
	const idLyDo = useId();
	const o = useRef<HTMLTextAreaElement>(null);
	const [chu, doiChu] = useState("");
	return (
		<div data-slot="kara-composer" className="flex flex-col gap-2">
			{suggestions && suggestions.length > 0 ? (
				<Suggestions aria-label={suggestionsLabel}>
					{suggestions.map((g) => (
						<Suggestion
							key={g}
							suggestion={g}
							disabled={khoa || ban}
							onClick={onSuggestion}
						/>
					))}
				</Suggestions>
			) : null}
			<PromptInput
				onSubmit={() => {
					if (ban) return;
					const gon = chu.trim();
					if (gon === "") return;
					onSubmit(gon);
					doiChu("");
				}}
			>
				{context ? (
					<PromptInputHeader>
						<Badge variant="secondary" data-slot="kara-context">
							{context.label}
							<Button
								variant="ghost"
								size="icon-xs"
								type="button"
								aria-label={msg.karaKhung.boNguCanh(context.label)}
								onClick={() => {
									context.onRemove();
									o.current?.focus();
								}}
							>
								<Icon icon={Close} />
							</Button>
						</Badge>
					</PromptInputHeader>
				) : null}
				<PromptInputBody>
					<PromptInputTextarea
						ref={o}
						aria-label={label}
						placeholder={placeholder}
						value={chu}
						onChange={(e) => doiChu(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (ban && e.key === "Enter") e.preventDefault();
						}}
						disabled={khoa}
						aria-describedby={khoa ? idLyDo : undefined}
					/>
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools />
					<PromptInputSubmit
						status={ban ? "streaming" : status === "error" ? "error" : undefined}
						onStop={onStop}
						type={ban ? "button" : "submit"}
						disabled={khoa || (ban && !onStop)}
					/>
				</PromptInputFooter>
			</PromptInput>
			{khoa ? (
				<FieldDescription id={idLyDo}>{lockedReason}</FieldDescription>
			) : null}
		</div>
	);
}
