"use client";

import Add from "@carbon/icons-react/es/Add";
import Bot from "@carbon/icons-react/es/Bot";
import CheckmarkFilled from "@carbon/icons-react/es/CheckmarkFilled";
import CircleFilled from "@carbon/icons-react/es/CircleFilled";
import Renew from "@carbon/icons-react/es/Renew";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
	useAreaSidebarOrientation,
} from "@crm/ui/components/area-sidebar";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ChatDateGroup, chatDateGroup } from "@/lib/chat-date-group";
import { khungMessages } from "@/lib/messages/agent-builder-khung";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useHydrated } from "@/lib/use-hydrated";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DeleteChatAction } from "./delete-chat-action";

type Conversation = RouterOutputs["conversations"]["builderList"][number];
type TeamAgent = RouterOutputs["agents"]["list"][number];
type SidebarData = {
	conversations: Conversation[];
	agents: TeamAgent[];
	updatedAt: number;
};

export function AgentBuilderSidebar({
	placement,
	onNavigate,
	initialData,
}: {
	placement: "area" | "panel";
	onNavigate?: () => void;
	initialData?: SidebarData;
}) {
	const t = khungMessages(useLocale());
	const pathname = usePathname();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const hydrated = useHydrated();
	const conversations = useQuery({
		...trpc.conversations.builderList.queryOptions(),
		initialData: initialData?.conversations,
		initialDataUpdatedAt: initialData?.updatedAt,
		refetchInterval: (query) =>
			query.state.data?.some((conversation) => conversation.state === "working")
				? 2500
				: 30_000,
	});
	const agents = useQuery({
		...trpc.agents.list.queryOptions(),
		initialData: initialData?.agents,
		initialDataUpdatedAt: initialData?.updatedAt,
		refetchInterval: 60_000,
	});
	const markRead = useMutation(
		trpc.conversations.markRead.mutationOptions({
			onSuccess: () =>
				Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.conversations.builderList.pathKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.thongBao.chuong.pathKey(),
					}),
				]),
		}),
	);

	const showData = Boolean(initialData) || hydrated;
	const groupNow =
		initialData && !hydrated
			? initialData.updatedAt
			: conversations.dataUpdatedAt;
	const groups = groupConversations(
		showData ? (conversations.data ?? []) : [],
		showData ? groupNow : 0,
	);
	const teamAgents = showData ? (agents.data ?? []) : [];

	return (
		<AreaSidebar
			label={t.thanhBen.danhSachHoiThoai}
			placement={placement}
			header={<DauThanh onNavigate={onNavigate} />}
		>
			{groups.map((group) => (
				<AreaSidebarGroup
					key={group.label}
					label={t.thanhBen.nhom[group.label]}
				>
					{group.items.map((conversation) => (
						<MucHoiThoai
							key={conversation.id}
							conversation={conversation}
							pathname={pathname}
							onOpen={() => {
								if (conversation.unread) {
									markRead.mutate({ id: conversation.id });
								}
								onNavigate?.();
							}}
							onDeleted={onNavigate}
						/>
					))}
				</AreaSidebarGroup>
			))}

			{groups.length === 0 ? <CauRong /> : null}

			<TeamAgents
				agents={teamAgents}
				pathname={pathname}
				onNavigate={onNavigate}
			/>
		</AreaSidebar>
	);
}

function DauThanh({ onNavigate }: { onNavigate?: () => void }) {
	const t = khungMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();

	return (
		<div className="flex h-7 items-center justify-between pl-3">
			<span className="font-medium text-xs">{t.thanhBen.hoiThoai}</span>
			<Button asChild variant="ghost" size="icon-xs">
				<Link
					href={workspaceUrl("/chat")}
					aria-label={t.thanhBen.hoiThoaiMoi}
					onClick={onNavigate}
				>
					<Icon icon={Add} />
				</Link>
			</Button>
		</div>
	);
}

function CauRong() {
	const t = khungMessages(useLocale());
	if (useAreaSidebarOrientation() === "horizontal") return null;

	return (
		<p className="px-3 text-muted-foreground text-xs">
			{t.thanhBen.trongBayNgay}
		</p>
	);
}

function MucHoiThoai({
	conversation,
	pathname,
	onOpen,
	onDeleted,
}: {
	conversation: Conversation;
	pathname: string;
	onOpen: () => void;
	onDeleted?: () => void;
}) {
	const t = khungMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();
	const huong = useAreaSidebarOrientation();
	const href = workspaceUrl(`/chat/${conversation.id}`);
	const active = pathname === href;
	const title = conversation.title ?? t.thanhBen.chuaDatTen;
	const lienKet = (
		<AreaSidebarItem asChild active={active}>
			<Link href={href} onClick={onOpen}>
				<ConversationState state={conversation.state} />
				<span className="min-w-0 flex-1 truncate" translate="no">
					{title}
				</span>
			</Link>
		</AreaSidebarItem>
	);

	if (huong === "horizontal") return lienKet;

	return (
		<div className="group relative flex min-w-0 items-center">
			{lienKet}
			<DeleteChatAction
				conversationId={conversation.id}
				title={title}
				trigger="close"
				returnToChatList={active}
				onDeleted={active ? onDeleted : undefined}
				className="absolute right-1 opacity-100 transition-opacity duration-150 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:translate-x-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:pointer-events-auto [@media(hover:hover)]:group-focus-within:translate-x-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100 motion-safe:transition-[opacity,translate] motion-reduce:translate-x-0"
			/>
		</div>
	);
}

function TeamAgents({
	agents,
	pathname,
	onNavigate,
}: {
	agents: TeamAgent[];
	pathname: string;
	onNavigate?: () => void;
}) {
	const t = khungMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();

	return (
		<AreaSidebarGroup
			label={
				<Link
					href={workspaceUrl("/agents")}
					transitionTypes={["nav-lateral"]}
					onClick={onNavigate}
					className="flex gap-2 hover:text-foreground"
				>
					<span className="min-w-0 flex-1">{t.thanhBen.tacNhanCuaDoi}</span>
					<span className="shrink-0 tabular-nums">{agents.length}</span>
				</Link>
			}
		>
			{agents.map((agent) => {
				const href = workspaceUrl(`/agents/${agent.id}`);
				return (
					<AreaSidebarItem key={agent.id} asChild active={pathname === href}>
						<Link href={href} onClick={onNavigate}>
							<Icon icon={Bot} aria-hidden="true" />
							<span className="min-w-0 flex-1 truncate">{agent.name}</span>
						</Link>
					</AreaSidebarItem>
				);
			})}
		</AreaSidebarGroup>
	);
}

function ConversationState({ state }: { state: Conversation["state"] }) {
	if (state === "working") {
		return (
			<span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
				<Icon icon={Renew} className="size-3.5 animate-spin" motion="none" />
			</span>
		);
	}

	if (state === "unread") {
		return (
			<span className="flex size-5 shrink-0 items-center justify-center text-ring">
				<Icon icon={CircleFilled} className="size-3.5" motion="none" />
			</span>
		);
	}

	if (state === "deployed") {
		return (
			<span className="flex size-5 shrink-0 items-center justify-center text-ring">
				<Icon icon={CheckmarkFilled} className="size-3.5" motion="none" />
			</span>
		);
	}

	return null;
}

function groupConversations(conversations: Conversation[], now: number) {
	if (!now) return [];

	const labels: ChatDateGroup[] = ["Today", "Yesterday", "Last 7 days"];
	const items = new Map<ChatDateGroup, Conversation[]>(
		labels.map((label) => [label, []]),
	);

	for (const conversation of conversations) {
		const label = chatDateGroup(conversation.lastMessageAt, now);
		if (label) items.get(label)?.push(conversation);
	}

	return labels
		.map((label) => ({ label, items: items.get(label) ?? [] }))
		.filter((group) => group.items.length > 0);
}
