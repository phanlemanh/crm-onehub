"use client";

import { Button } from "@crm/ui/components/button";
import { KaraLabel } from "@crm/ui/components/kara";
import { useKaraBusy } from "@crm/ui/components/kara/busy";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	ProposedChange,
	type ProposedChangeProps,
	ProposedChangeReceipt,
} from "@crm/ui/components/proposed-change";
import type { ReactNode } from "react";

function KhoaKhiBan({ ban, children }: { ban: boolean; children: ReactNode }) {
	return (
		<fieldset
			disabled={ban}
			data-slot="kara-khoa"
			className="m-0 min-w-0 border-0 p-0"
		>
			{children}
		</fieldset>
	);
}

export type KaraProposalProps = ProposedChangeProps;

export function KaraProposal({
	actions,
	lockedReason,
	decided,
	...props
}: KaraProposalProps) {
	const msg = useMessages();
	const ban = useKaraBusy() !== null;
	const choKhoa = ban && !decided;
	return (
		<KhoaKhiBan ban={ban && decided !== undefined}>
			<ProposedChange
				{...props}
				decided={decided}
				actions={choKhoa ? actions.map((a) => ({ ...a, disabled: true })) : actions}
				lockedReason={choKhoa ? msg.karaKhung.dangSoanKhoa : lockedReason}
			/>
		</KhoaKhiBan>
	);
}

export type KaraProposalEntry = {
	id: string;
	status: "pending" | "decided";
	batchable: boolean;
};

export type KaraProposalGroupProps = {
	entries: readonly KaraProposalEntry[];
	reason: ReactNode;
	readAt?: string;
	scope?: ReactNode;
	batch?: { label: ReactNode; onAccept: (ids: string[]) => void };
	batchDecided?: { text: ReactNode; onUndo?: () => void };
	children: ReactNode;
};

export function KaraProposalGroup({
	entries,
	reason,
	readAt,
	scope,
	batch,
	batchDecided,
	children,
}: KaraProposalGroupProps) {
	const msg = useMessages();
	const ban = useKaraBusy() !== null;
	const cho = entries.filter((e) => e.status === "pending");
	const ids = cho.filter((e) => e.batchable).map((e) => e.id);
	return (
		<section data-slot="kara-proposal-group" className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<KaraLabel
					scope={scope}
					text={msg.karaKhung.nhomDeXuat(String(cho.length))}
					reason={reason}
					readAt={readAt}
				/>
				{batch ? (
					<Button
						variant="outline"
						size="sm"
						type="button"
						data-slot="kara-batch"
						disabled={ids.length === 0 || ban}
						onClick={() => batch.onAccept(ids)}
					>
						{batch.label}
					</Button>
				) : null}
			</div>
			{batchDecided ? (
				<KhoaKhiBan ban={ban}>
					<ProposedChangeReceipt
						decision="accepted"
						text={batchDecided.text}
						onUndo={batchDecided.onUndo}
					/>
				</KhoaKhiBan>
			) : null}
			<div className="flex flex-col gap-1">{children}</div>
		</section>
	);
}
