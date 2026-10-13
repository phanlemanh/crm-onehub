import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { KhungKetNoi } from "../../khung-ket-noi";
import { SlackPeopleMatches } from "./slack-people-matches";

type SlackPeoplePageProps = {
	params: Promise<{ slug: string }>;
};

export default async function SlackPeoplePage(props: SlackPeoplePageProps) {
	const locale = await getLocale();
	const t = ketNoiMessages(locale);

	return (
		<KhungKetNoi
			params={props.params}
			kind="slackNguoi"
			locale={locale}
			tieuDe={t.nguoi.nhan}
			laTenRieng={false}
			moTa={t.nguoi.moTa}
		>
			<Suspense fallback={<KhungXuong hinh="danh-sach" />}>
				<SlackPeoplePageContent {...props} />
			</Suspense>
		</KhungKetNoi>
	);
}

async function SlackPeoplePageContent({ params }: SlackPeoplePageProps) {
	await requireSession();
	const { slug } = await params;
	const queryClient = getServerQueryClient();
	const trpc = getServerTrpc();
	const status = await queryClient.fetchQuery(trpc.slack.status.queryOptions());
	if (!status.connected) redirect(`/${slug}/settings/connections/slack`);
	const matches = await queryClient.fetchQuery(
		trpc.slack.matches.queryOptions(),
	);

	return <SlackPeopleMatches slug={slug} initialMatches={matches} />;
}
