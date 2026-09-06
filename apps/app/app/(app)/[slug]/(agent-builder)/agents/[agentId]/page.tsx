import type { Metadata } from "next";
import { khungMessages } from "@/lib/messages/agent-builder-khung";
import { getLocale } from "@/lib/locale/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TeamAgentDetail } from "@/components/agent-builder/team-agent-detail";
import { PageShellFallback } from "@/components/page-shell";
import { getServerTrpcClient } from "@/lib/trpc/server";
import { nullIfMissing } from "../../missing-record";

export async function generateMetadata(): Promise<Metadata> {
	return { title: khungMessages(await getLocale()).trang.tieuDeMotTacNhan };
}

export default function TeamAgentPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	return (
		<Suspense fallback={<PageShellFallback />}>
			<PrefetchedTeamAgent params={params} />
		</Suspense>
	);
}

async function PrefetchedTeamAgent({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;
	if (agentId === "team") notFound();

	const client = getServerTrpcClient();

	const [agent, runs, activity] = await Promise.all([
		nullIfMissing(client.agents.byId.query({ id: agentId })),
		nullIfMissing(client.agents.history.query({ id: agentId, limit: 50 })),
		nullIfMissing(client.agents.activity.query({ id: agentId, limit: 100 })),
	]);

	if (!agent || !runs || !activity) notFound();

	return (
		<TeamAgentDetail
			agentId={agentId}
			initialAgent={agent}
			initialRuns={runs}
			initialActivity={activity}
		/>
	);
}
