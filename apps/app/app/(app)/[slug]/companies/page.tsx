import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { companyMessages } from "@/lib/messages/companies";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { companiesSearchParams } from "./companies-search-params";
import { CompaniesTable } from "./companies-table";
import { CreateCompanySheet } from "./create-company-sheet";

export async function generateMetadata(): Promise<Metadata> {
	return { title: companyMessages(await getLocale()).title };
}

export default async function CompaniesPage({
	searchParams,
}: PageProps<"/[slug]/companies">) {
	const m = companyMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
					<PageShellDescription>{m.description}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<CreateCompanySheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<KhungXuong hinh="bang" />}>
					<Companies searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Companies({
	searchParams,
}: Pick<PageProps<"/[slug]/companies">, "searchParams">) {
	const [, values] = await Promise.all([
		requireSession(),
		companiesSearchParams.load(searchParams),
	]);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.companies.list.queryOptions(companiesSearchParams.toInput(values)),
		),
		queryClient.prefetchQuery(trpc.users.list.queryOptions()),
	]);

	return (
		<HydrateClient>
			<CompaniesTable />
		</HydrateClient>
	);
}
