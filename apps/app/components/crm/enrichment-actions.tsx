"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { NutKara } from "@crm/ui/components/kara/ban-ghi";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { crmMessages } from "@/lib/messages/crm";
import { karaBanGhiMessages } from "@/lib/messages/kara-ban-ghi";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function EnrichmentActions({
	companyId,
	hasDomain,
}: {
	companyId: string;
	hasDomain: boolean;
}) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const t = karaBanGhiMessages(locale).traCuu;
	const trpc = useTRPC();
	const cache = useCrmCache();

	const enrich = useMutation(
		trpc.companies.enrich.mutationOptions({
			onSuccess: async (result) => {
				await cache.company(companyId);
				toast.success(
					result.queued ? m.enrichment.lookingUp : m.enrichment.againRunning,
				);
			},
			onError: () => toast.error(t.loi),
		}),
	);

	const research = useMutation(
		trpc.companies.research.mutationOptions({
			onSuccess: async (result) => {
				await cache.activity();
				toast.success(
					result.queued ? m.enrichment.brief : m.enrichment.already,
				);
			},
			onError: () => toast.error(t.loi),
		}),
	);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				aria-busy={enrich.isPending || undefined}
				disabled={!hasDomain || enrich.isPending}
				onClick={() => enrich.mutate({ id: companyId })}
			>
				{enrich.isPending ? (
					t.dangChay
				) : (
					<>
						<Icon icon={Renew} data-icon="inline-start" />
						<span className="hidden sm:inline">{m.enrichment.reEnrich}</span>
					</>
				)}
			</Button>

			<NutKara
				nhan={t.nhoKara}
				dangChay={research.isPending ? t.dangChay : null}
				gonTrenDienThoai
				disabled={!hasDomain}
				onClick={() => research.mutate({ id: companyId })}
			/>
		</>
	);
}

export function ContactEnrichmentAction({ contactId }: { contactId: string }) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const t = karaBanGhiMessages(locale).traCuu;
	const trpc = useTRPC();
	const cache = useCrmCache();

	const enrich = useMutation(
		trpc.contacts.enrich.mutationOptions({
			onSuccess: async (result) => {
				await cache.contact(contactId);
				toast.success(
					result.queued ? m.enrichment.again : m.enrichment.againRunning,
				);
			},
			onError: () => toast.error(t.loi),
		}),
	);

	return (
		<NutKara
			nhan={t.lai}
			dangChay={enrich.isPending ? t.dangChay : null}
			gonTrenDienThoai
			onClick={() => enrich.mutate({ id: contactId })}
		/>
	);
}
