import Dashboard from "@carbon/icons-react/es/Dashboard";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent, PageShellLoading } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrMessages(await getLocale()).tieuDe["toan-canh"] };
}

export default function ToanCanhPage() {
	return (
		<PageShellContent>
			<Suspense fallback={<PageShellLoading />}>
				<ToanCanh />
			</Suspense>
		</PageShellContent>
	);
}

async function ToanCanh() {
	const m = okrMessages(await getLocale());
	return (
		<Empty data-trang-thai="ST-toancanh">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={Dashboard} />
				</EmptyMedia>
				<EmptyTitle>{m.toanCanh.title}</EmptyTitle>
				<EmptyDescription>{m.toanCanh.body}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
