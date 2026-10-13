import Close from "@carbon/icons-react/es/Close";
import Warning from "@carbon/icons-react/es/Warning";
import {
	describeSlackScopes,
	SLACK_REQUESTED_SCOPES,
	SLACK_SCOPE_GROUPS,
	SLACK_USER_GRANT,
	type SlackScope,
	slackScopeDrift,
} from "@crm/auth";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { Locale } from "@crm/ui/lib/locale";
import Link from "next/link";
import { Suspense } from "react";
import { NewAgentDialog } from "@/components/agent-builder/new-agent-dialog";

import { getLocale } from "@/lib/locale/server";
import {
	type KetNoiMessages,
	ketNoiMessages,
} from "@/lib/messages/settings-ket-noi";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { KhungKetNoi } from "../khung-ket-noi";
import { type ConnectionQuery, connectErrorOf } from "../oauth-connection-page";
import { SlackChannels } from "./slack-channels";
import {
	SlackConnectButton,
	SlackReconnectButton,
} from "./slack-connect-button";
import { SlackDisconnectButton } from "./slack-disconnect-button";
import { SlackScopeGroups } from "./slack-scope-groups";

const PRIVATE_CHANNEL_SCOPES = [
	"groups:read",
	"groups:history",
	SLACK_USER_GRANT.scope,
];

type SlackConnectionPageProps = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<ConnectionQuery>;
};

export default async function SlackConnectionPage(
	props: SlackConnectionPageProps,
) {
	const locale = await getLocale();

	return (
		<Suspense
			fallback={
				<KhungKetNoi
					params={props.params}
					kind="slack"
					locale={locale}
					tieuDe={ketNoiMessages(locale).ten.slack}
					laTenRieng
				>
					<KhungXuong hinh="the" />
				</KhungKetNoi>
			}
		>
			<SlackConnectionPageContent {...props} locale={locale} />
		</Suspense>
	);
}

async function SlackConnectionPageContent({
	params,
	searchParams,
	locale,
}: SlackConnectionPageProps & { locale: Locale }) {
	await requireSession();
	const t = ketNoiMessages(locale);
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const queryClient = getServerQueryClient();
	const status = await queryClient.fetchQuery(
		getServerTrpc().slack.status.queryOptions(),
	);
	return status.connected ? (
		<ConnectedSlack
			slug={slug}
			status={status}
			t={t}
			params={params}
			locale={locale}
		/>
	) : (
		<KhungKetNoi
			params={params}
			kind="slack"
			locale={locale}
			tieuDe={t.ten.slack}
			laTenRieng
			moTa={t.slack.gioiThieu}
		>
			<div className="px-(--spacing-block-inline)">
				<StatusIndicator size="sm" label={t.chung.chuaCam} />
			</div>
			<SlackScopeGroups
				groups={groupScopes([...SLACK_REQUESTED_SCOPES])}
				title={t.slack.banGiao}
				withheld={[]}
			/>
			<PlainList
				title={t.slack.khongBaoGio}
				items={t.slack.khongBaoGioMuc}
				icon={Close}
				tone="text-muted-foreground"
			/>
			<div className="flex flex-wrap items-center gap-4 border-y px-(--spacing-block-inline) py-5">
				<SlackConnectButton
					slug={slug}
					configured={status.configured}
					connectError={connectErrorOf(query, "slack")}
				/>
				<p className="text-muted-foreground text-xs">{t.slack.duyetOSlack}</p>
			</div>
			<section className="flex flex-col gap-3 px-(--spacing-block-inline)">
				<div>
					<h2 className="font-medium text-sm">{t.slack.goiYTieuDe}</h2>
					<p className="text-muted-foreground text-xs">{t.slack.goiYMoTa}</p>
				</div>
				<div className="grid gap-3 md:grid-cols-3">
					{t.slack.goiY.map((goiY) => (
						<div className="rounded-lg border p-4" key={goiY.ten}>
							<h3 className="font-medium text-sm">{goiY.ten}</h3>
							<p className="mt-2 text-muted-foreground text-xs leading-relaxed">
								{goiY.moTa}
							</p>
						</div>
					))}
				</div>
			</section>
		</KhungKetNoi>
	);
}

function toLine(entry: SlackScope) {
	return {
		scope: entry.scope,
		grant: entry.grant,
		sensitive: entry.sensitive,
	};
}

function groupScopes(scopes: string[]) {
	const held = describeSlackScopes(scopes);

	return SLACK_SCOPE_GROUPS.map((group) => ({
		id: group.id,
		label: group.label,
		summary: group.summary,
		scopes: held.filter((entry) => entry.group === group.id).map(toLine),
	})).filter((group) => group.scopes.length > 0);
}

function ConnectedSlack({
	slug,
	status,
	t,
	params,
	locale,
}: {
	slug: string;
	params: Promise<{ slug: string }>;
	locale: Locale;
	status: {
		workspace: string | null;
		agents: Array<{
			id: string;
			name: string;
			description: string | null;
			status: string;
		}>;
		scopes: string[];
		canInviteItself: boolean;
		canManage: boolean;
		people: { matched: number; reviewed: number };
	};
	t: KetNoiMessages;
}) {
	const agents = status.agents;
	const drift = slackScopeDrift(status.scopes);
	const missing = status.canInviteItself
		? drift.missing
		: [...drift.missing, SLACK_USER_GRANT];
	return (
		<KhungKetNoi
			params={params}
			kind="slack"
			locale={locale}
			tieuDe={t.ten.slack}
			laTenRieng
			moTa={status.canManage ? t.slack.moTaQuanTri : t.slack.moTaThuong}
			hanhDong={
				<SlackDisconnectButton
					canManage={status.canManage}
					workspace={status.workspace}
				/>
			}
		>
			<div className="px-(--spacing-block-inline)">
				<StatusIndicator
					size="sm"
					tone="success"
					label={
						<span translate={status.workspace ? "no" : undefined}>
							{status.workspace ?? t.chung.daCam}
						</span>
					}
				/>
			</div>
			<MissingGrant missing={missing} slug={slug} t={t} />
			<SlackScopeGroups
				groups={groupScopes(status.scopes)}
				title={t.slack.daCap}
				withheld={missing.map(toLine)}
			/>
			<SlackChannels />
			<section className="flex flex-col gap-3 border-y px-(--spacing-block-inline) py-5">
				<div className="flex items-end justify-between gap-4">
					<div>
						<h2 className="font-medium text-sm">{t.slack.tacNhanTieuDe}</h2>
						<p className="text-muted-foreground text-xs">
							{t.slack.tacNhanMoTa}
						</p>
					</div>
					<NewAgentDialog>
						<Button size="sm">{t.slack.tacNhanMoi}</Button>
					</NewAgentDialog>
				</div>
				<div className="flex flex-col divide-y rounded-lg border">
					{agents.length === 0 ? (
						<p className="px-(--spacing-block-inline) py-4 text-muted-foreground text-sm">
							{t.slack.tacNhanTrong}
						</p>
					) : null}
					{agents.map(
						(agent: {
							id: string;
							name: string;
							description: string | null;
							status: string;
						}) => (
							<Link
								className="flex items-center gap-3 px-(--spacing-block-inline) py-4 hover:bg-muted/50"
								href={`/${slug}/agents/${agent.id}`}
								key={agent.id}
							>
								<div className="min-w-0 flex-1">
									<h3 className="font-medium text-sm" translate="no">
										{agent.name}
									</h3>
									<p className="truncate text-muted-foreground text-xs">
										{agent.description}
									</p>
								</div>
								<span className="flex w-19 shrink-0 items-center gap-2 text-xs">
									<span
										className={`size-2 rounded-full ${agent.status === "LIVE" ? "bg-success" : "bg-muted-foreground"}`}
									/>
									{agent.status === "LIVE" ? t.slack.dangChay : t.slack.tamDung}
								</span>
							</Link>
						),
					)}
					<Link
						className="px-(--spacing-block-inline) py-4 font-medium text-sm hover:bg-muted/50"
						href={`/${slug}/chat`}
					>
						{t.slack.taChatTiep}
					</Link>
				</div>
			</section>
			<div className="flex items-center justify-between gap-4 px-(--spacing-block-inline)">
				<p className="text-sm">
					{status.people.reviewed === 0
						? t.slack.chuaSoatAi
						: t.slack.daKhopNguoi(
								String(status.people.matched),
								String(status.people.reviewed),
							)}
				</p>
				<Button asChild variant="outline" size="sm">
					<Link href={`/${slug}/settings/connections/slack/people`}>
						{t.slack.soat}
					</Link>
				</Button>
			</div>
		</KhungKetNoi>
	);
}

function MissingGrant({
	slug,
	missing,
	t,
}: {
	slug: string;
	missing: SlackScope[];
	t: KetNoiMessages;
}) {
	if (missing.length === 0) return null;

	const privateChannels = missing.some((entry) =>
		PRIVATE_CHANNEL_SCOPES.includes(entry.scope),
	);

	return (
		<div className="px-(--spacing-block-inline)">
			<Alert variant="warning">
				<Icon icon={Warning} />
				<AlertTitle>
					{privateChannels
						? t.slack.thieuRiengTu
						: t.slack.thieuQuyen(String(missing.length))}
				</AlertTitle>
				<AlertDescription>
					<span>{t.slack.camLaiMoTa}</span>
					<ul className="mt-2 flex flex-col gap-1.5">
						{missing.map((entry) => (
							<li className="flex items-start gap-2" key={entry.scope}>
								<Icon
									icon={Close}
									motion="none"
									className="mt-0.5 size-3.5 shrink-0"
								/>
								<span>{entry.grant}</span>
							</li>
						))}
					</ul>
				</AlertDescription>
				<AlertAction>
					<SlackReconnectButton slug={slug} />
				</AlertAction>
			</Alert>
		</div>
	);
}

function PlainList({
	title,
	items,
	icon,
	tone,
}: {
	title: string;
	items: readonly string[];
	icon: React.ComponentType;
	tone: string;
}) {
	return (
		<section className="flex flex-col gap-3 px-(--spacing-block-inline)">
			<h2 className="font-medium text-sm">{title}</h2>
			<div className="flex flex-col gap-2">
				{items.map((item) => (
					<div className="flex items-start gap-3 text-sm" key={item}>
						<Icon
							icon={icon}
							motion="none"
							className={`mt-0.5 size-4 shrink-0 ${tone}`}
						/>
						<span>{item}</span>
					</div>
				))}
			</div>
		</section>
	);
}
