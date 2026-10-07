"use client";

import { KaraLabel } from "@crm/ui/components/kara";
import { KaraProposal } from "@crm/ui/components/kara/proposal";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { ProposedChangeDecided } from "@crm/ui/components/proposed-change";
import { Provenance } from "@crm/ui/components/sourced-value";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { LocalDateTime } from "@/components/local-date-time";
import type { ContactFact, FactReceipt, FactTruoc } from "@/lib/contact-facts";
import {
	type KaraBanGhiMessages,
	karaBanGhiMessages,
} from "@/lib/messages/kara-ban-ghi";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function FactProvenance({ fact }: { fact: ContactFact }) {
	return (
		<Provenance
			claim={fact.value}
			reasons={fact.evidence.map((item) => item.detail)}
			observedAt={
				<LocalDateTime
					date={fact.observedAt}
					options={{ month: "short", day: "numeric", year: "numeric" }}
				/>
			}
			sourceUrl={fact.sourceUrl}
		/>
	);
}

function bienNhan(
	receipt: FactReceipt,
	t: KaraBanGhiMessages["deXuat"],
	onUndo: (() => void) | undefined,
): ProposedChangeDecided {
	return {
		decision: receipt.decision === "accept" ? "accepted" : "dismissed",
		text: receipt.loi
			? t.hoanTacLoi
			: receipt.decision === "accept"
				? t.daThem
				: t.daBo,
		onUndo: receipt.loi ? undefined : onUndo,
	};
}

export function FactSuggestion({
	fact,
	contactId,
	current,
	truoc,
	receipt,
	onReceipt,
}: {
	fact: ContactFact;
	contactId: string;
	current: string | null;
	truoc: FactTruoc;
	receipt: FactReceipt | undefined;
	onReceipt: (next: FactReceipt | undefined) => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const t = karaBanGhiMessages(useLocale()).deXuat;
	const khung = useRef<HTMLDivElement>(null);
	const lamMoi = () => cache.contact(contactId, { settle: "record" });

	const decide = useMutation(
		trpc.contacts.decideFact.mutationOptions({
			onSuccess: (_ketQua, vao) => {
				onReceipt({ fact, decision: vao.decision, truoc, loi: false });
				return lamMoi();
			},
			onError: () => toast.error(t.loiQuyet),
		}),
	);

	const undo = useMutation(
		trpc.contacts.undoFactDecision.mutationOptions({
			onSuccess: () => {
				flushSync(() => onReceipt(undefined));
				khung.current
					?.querySelector<HTMLButtonElement>('button[data-variant="default"]')
					?.focus();
				return lamMoi();
			},
			onError: () => {
				if (receipt) onReceipt({ ...receipt, loi: true });
			},
		}),
	);

	const hoanTac =
		receipt && !undo.isPending
			? () => undo.mutate({ factId: receipt.fact.id, truoc: receipt.truoc })
			: undefined;

	return (
		<div ref={khung}>
			<KaraProposal
				density="inline"
				kind="compact"
				value={<span translate="no">{fact.value}</span>}
				rationale={fact.evidence.map((item) => item.detail).join(" · ")}
				pending={decide.isPending}
				decided={receipt ? bienNhan(receipt, t, hoanTac) : undefined}
				actions={[
					{
						id: "nhan",
						label: current ? t.thay : t.them,
						tone: "primary",
						onClick: () =>
							decide.mutate({ factId: fact.id, decision: "accept" }),
					},
					{
						id: "bo-qua",
						label: t.boQua,
						tone: "quiet",
						onClick: () =>
							decide.mutate({ factId: fact.id, decision: "dismiss" }),
					},
				]}
			/>
		</div>
	);
}

function ngayDoc(facts: readonly ContactFact[], locale: Locale) {
	const moiNhat = facts
		.map((fact) => fact.observedAt)
		.sort()
		.at(-1);
	if (!moiNhat) return undefined;
	return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(moiNhat));
}

export function FactGroupLabel({ facts }: { facts: readonly ContactFact[] }) {
	const locale = useLocale();
	const t = karaBanGhiMessages(locale).deXuat;
	if (facts.length === 0) return null;
	return (
		<KaraLabel
			scope={t.nhan(facts.length)}
			reason={t.viSao}
			readAt={ngayDoc(facts, locale)}
		/>
	);
}
