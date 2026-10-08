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
import { createContext, type ReactNode, useContext, useId } from "react";

const TrongNhom = createContext(false);

function KhoaKhiBan({
	ban,
	noi = false,
	children,
}: {
	ban: boolean;
	noi?: boolean;
	children: ReactNode;
}) {
	return (
		<fieldset
			disabled={ban}
			data-slot="kara-khoa"
			data-noi={noi ? "" : undefined}
			className="m-0 min-w-0 rounded-md border-0 p-0 transition-colors duration-700 data-[noi]:bg-accent motion-reduce:transition-none"
		>
			{children}
		</fieldset>
	);
}

export type KaraProposalProps = ProposedChangeProps & { highlighted?: boolean };

export function KaraProposal({
	actions,
	lockedReason,
	decided,
	highlighted = false,
	media,
	...props
}: KaraProposalProps) {
	const msg = useMessages();
	const busy = useKaraBusy();
	const trongNhom = useContext(TrongNhom);
	const ban = busy !== null;
	const choKhoa = ban && !decided;
	return (
		<KhoaKhiBan ban={ban} noi={highlighted}>
			<ProposedChange
				{...props}
				media={media ?? !trongNhom}
				decided={decided}
				actions={choKhoa ? actions.map((a) => ({ ...a, disabled: true })) : actions}
				lockedReason={choKhoa ? msg.karaKhung.dangSoanKhoa : lockedReason}
				lockedReasonHidden={choKhoa && busy?.reasonShown === true}
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
	const idLyDo = useId();
	return (
		<section data-slot="kara-proposal-group" className="flex flex-col gap-2">
			<div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<KaraLabel
					scope={scope}
					text={
						cho.length === 0
							? msg.karaKhung.daQuyetHet
							: msg.karaKhung.nhomDeXuat(String(cho.length))
					}
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
						aria-describedby={ban ? idLyDo : undefined}
						onClick={() => batch.onAccept(ids)}
					>
						{batch.label}
					</Button>
				) : null}
			</div>
			{ban && batch ? (
				<span id={idLyDo} className="sr-only">
					{msg.karaKhung.dangSoanKhoa}
				</span>
			) : null}
			{batchDecided ? (
				<KhoaKhiBan ban={ban}>
					<ProposedChangeReceipt
						decision="accepted"
						text={batchDecided.text}
						onUndo={batchDecided.onUndo}
					/>
				</KhoaKhiBan>
			) : null}
			<TrongNhom.Provider value>
				<div className="flex flex-col gap-1">{children}</div>
			</TrongNhom.Provider>
		</section>
	);
}
