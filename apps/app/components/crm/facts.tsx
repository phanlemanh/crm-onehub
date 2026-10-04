"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { ProposedChange } from "@crm/ui/components/proposed-change";
import { Provenance } from "@crm/ui/components/sourced-value";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LocalDateTime } from "@/components/local-date-time";
import type { ContactFact } from "@/lib/contact-facts";
import { crmMessages } from "@/lib/messages/crm";
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

export function FactSuggestion({
	fact,
	contactId,
}: {
	fact: ContactFact;
	contactId: string;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const m = crmMessages(useLocale());

	const decide = useMutation(
		trpc.contacts.decideFact.mutationOptions({
			onSuccess: (result) => {
				toast.success(result.applied ? m.facts.added : m.facts.dismissed);
				return cache.contact(contactId, { settle: "record" });
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<ProposedChange
			density="card"
			kind="compact"
			value={fact.value}
			rationale={fact.evidence.map((item) => item.detail).join(" · ")}
			pending={decide.isPending}
			actions={[
				{
					id: "nhan",
					label: m.facts.accept,
					tone: "primary",
					onClick: () => decide.mutate({ factId: fact.id, decision: "accept" }),
				},
				{
					id: "bac",
					label: m.facts.dismiss,
					tone: "quiet",
					onClick: () =>
						decide.mutate({ factId: fact.id, decision: "dismiss" }),
				},
			]}
		/>
	);
}
