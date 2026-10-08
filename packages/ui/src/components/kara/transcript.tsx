"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@crm/ui/components/ai-elements/conversation";
import {
	Message,
	MessageActions,
	MessageContent,
	MessageResponse,
} from "@crm/ui/components/ai-elements/message";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { KaraMark } from "@crm/ui/components/kara";
import { useMessages } from "@crm/ui/components/locale-provider";
import { Marker, MarkerContent } from "@crm/ui/components/marker";
import { MessageAvatar } from "@crm/ui/components/message";
import { KARA } from "@crm/ui/lib/kara";
import { Children, type ReactNode } from "react";

export type KaraTranscriptProps = {
	children?: ReactNode;
	empty?: { title?: string; description?: string };
};

export function KaraTranscript({ children, empty }: KaraTranscriptProps) {
	const msg = useMessages();
	const rong = Children.toArray(children).length === 0;
	return (
		<Conversation data-slot="kara-transcript" className="min-h-0 flex-1">
			{rong ? (
				<ConversationEmptyState
					data-slot="conversation-empty-state"
					icon={<KaraMark />}
					title={empty?.title ?? msg.karaKhung.hoiThoaiRongTieuDe}
					description={empty?.description ?? msg.karaKhung.hoiThoaiRongMoTa}
				/>
			) : (
				<ConversationContent>{children}</ConversationContent>
			)}
			<ConversationScrollButton />
		</Conversation>
	);
}

export function KaraAvatar() {
	return (
		<MessageAvatar>
			<span className="text-muted-foreground">
				<Icon icon={AiGenerate} />
			</span>
			<span className="sr-only" translate="no">
				{KARA.ten}
			</span>
		</MessageAvatar>
	);
}

export type KaraTurnProps = {
	from: "user" | "kara";
	children: ReactNode;
	actions?: ReactNode;
};

export function KaraTurn({ from, children, actions }: KaraTurnProps) {
	if (from === "user") {
		return (
			<Message from="user" data-kara-turn="user">
				<MessageContent translate="no">
					<p className="whitespace-pre-wrap">{children}</p>
				</MessageContent>
			</Message>
		);
	}
	const noiDung = (
		<MessageContent>
			{typeof children === "string" ? (
				<MessageResponse>{children}</MessageResponse>
			) : (
				children
			)}
		</MessageContent>
	);
	return (
		<div data-kara-turn="kara" className="flex items-start gap-2">
			<KaraAvatar />
			<Message from="assistant" className="min-w-0">
				{noiDung}
				{actions ? <MessageActions>{actions}</MessageActions> : null}
			</Message>
		</div>
	);
}

export function KaraSystemLine({ children }: { children: ReactNode }) {
	return (
		<p
			data-kara-turn="system"
			className="text-center text-muted-foreground text-xs"
		>
			{children}
		</p>
	);
}

export type KaraCheckpointProps = {
	summary: string;
	label?: string;
	onSelect: () => void;
};

export function KaraCheckpoint({
	summary,
	label,
	onSelect,
}: KaraCheckpointProps) {
	const msg = useMessages();
	return (
		<Marker variant="separator" data-kara-turn="checkpoint">
			<MarkerContent>
				<Button variant="ghost" size="xs" type="button" onClick={onSelect}>
					{label ?? msg.karaKhung.moc(summary)}
				</Button>
			</MarkerContent>
		</Marker>
	);
}
