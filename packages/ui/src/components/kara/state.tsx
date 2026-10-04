"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { FieldDescription } from "@crm/ui/components/field";
import { useMessages } from "@crm/ui/components/locale-provider";
import { ThinkingIndicator } from "@crm/ui/components/thinking-indicator";
import { type ReactNode, useEffect, useState } from "react";

export const KARA_TRE_MS = 1000;

export type KaraRetryProps = {
	onClick: () => void;
	disabled?: boolean;
};

export function KaraRetry({ onClick, disabled }: KaraRetryProps) {
	const msg = useMessages();
	return (
		<Button
			variant="outline"
			size="sm"
			type="button"
			data-slot="kara-retry"
			disabled={disabled}
			onClick={onClick}
		>
			{msg.karaKhung.thuLai}
		</Button>
	);
}

export type KaraStateProps =
	| { kind: "working"; label: string; delayMs?: number }
	| { kind: "empty"; title: ReactNode; description: ReactNode }
	| {
			kind: "error";
			what: string;
			description?: ReactNode;
			onRetry: () => void;
	  }
	| { kind: "off"; reason: ReactNode; action?: ReactNode }
	| { kind: "unconfigured"; description: ReactNode };

function DangLam({ label, delayMs }: { label: string; delayMs: number }) {
	const [hien, datHien] = useState(delayMs <= 0);
	useEffect(() => {
		if (delayMs <= 0) return;
		const hen = setTimeout(() => datHien(true), delayMs);
		return () => clearTimeout(hen);
	}, [delayMs]);
	if (!hien) return null;
	return (
		<div role="status" data-kara-state="working">
			<ThinkingIndicator label={label} />
		</div>
	);
}

function KhungTrong({
	kind,
	title,
	description,
	children,
}: {
	kind: "empty" | "error" | "unconfigured";
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<Empty
			border="solid"
			size="compact"
			data-kara-state={kind}
		>
			<EmptyHeader>
				<EmptyTitle>{title}</EmptyTitle>
				{description ? (
					<EmptyDescription>{description}</EmptyDescription>
				) : null}
			</EmptyHeader>
			{children ? <EmptyContent>{children}</EmptyContent> : null}
		</Empty>
	);
}

export function KaraState(props: KaraStateProps) {
	const msg = useMessages();
	switch (props.kind) {
		case "working":
			return (
				<DangLam label={props.label} delayMs={props.delayMs ?? KARA_TRE_MS} />
			);
		case "empty":
			return (
				<KhungTrong
					kind="empty"
					title={props.title}
					description={props.description}
				/>
			);
		case "error":
			return (
				<KhungTrong
					kind="error"
					title={msg.karaKhung.chuaDuoc(props.what)}
					description={props.description}
				>
					<KaraRetry onClick={props.onRetry} />
				</KhungTrong>
			);
		case "unconfigured":
			return (
				<KhungTrong
					kind="unconfigured"
					title={msg.karaKhung.chuaBatTieuDe}
					description={props.description}
				/>
			);
		case "off":
			return (
				<div data-kara-state="off" className="grid gap-2">
					{props.action}
					<FieldDescription>{props.reason}</FieldDescription>
				</div>
			);
	}
}
