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
import { contactMessages } from "@/lib/messages/contacts";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { contactsSearchParams } from "./contacts-search-params";
import { ContactsTable } from "./contacts-table";
import { CreateContactSheet } from "./create-contact-sheet";

export async function generateMetadata(): Promise<Metadata> {
	return { title: contactMessages(await getLocale()).title };
}

export default async function ContactsPage({
	searchParams,
}: PageProps<"/[slug]/contacts">) {
	const m = contactMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
					<PageShellDescription>{m.description}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<CreateContactSheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<KhungXuong hinh="bang" />}>
					<Contacts searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Contacts({
	searchParams,
}: Pick<PageProps<"/[slug]/contacts">, "searchParams">) {
	const [, values] = await Promise.all([
		requireSession(),
		contactsSearchParams.load(searchParams),
	]);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.contacts.list.queryOptions(contactsSearchParams.toInput(values)),
		),
		queryClient.prefetchQuery(trpc.users.list.queryOptions()),
		queryClient.prefetchQuery(trpc.companies.options.queryOptions({ q: "" })),
	]);

	return (
		<HydrateClient>
			<ContactsTable />
		</HydrateClient>
	);
}
