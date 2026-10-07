"use client";

import Document from "@carbon/icons-react/es/Document";
import LogoGithub from "@carbon/icons-react/es/LogoGithub";
import LogoLinkedin from "@carbon/icons-react/es/LogoLinkedin";
import {
	Attachment,
	AttachmentContent,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
	AttachmentTrigger,
} from "@crm/ui/components/attachment";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { type CarbonIcon, Icon } from "@crm/ui/components/icon";
import { KaraMark } from "@crm/ui/components/kara";
import { KaraComposer } from "@crm/ui/components/kara/composer";
import { KaraState } from "@crm/ui/components/kara/state";
import { type KaraStep, KaraSteps } from "@crm/ui/components/kara/steps";
import { KaraTurn } from "@crm/ui/components/kara/transcript";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@crm/ui/components/message-scroller";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEveAgent } from "eve/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AgentClarificationComposer } from "@/components/agent-clarification-composer";
import {
	type Conversation,
	ConversationPicker,
	useConversations,
} from "@/components/crm/agent-conversations";
import {
	type AgentRecord,
	recordCopy,
	recordFilter,
	recordHeader,
} from "@/lib/agent-record";
import {
	composerState,
	eventsOf,
	loadThread,
	offlineThread,
	type Thread as ThreadState,
} from "@/lib/agent-session";
import {
	NEW_THREAD,
	pendingQuestion,
	resolveThread,
	type Source,
	type TranscriptItem,
	type TranscriptMessage,
	toTranscript,
} from "@/lib/agent-transcript";
import {
	type KaraBanGhiMessages,
	karaBanGhiMessages,
} from "@/lib/messages/kara-ban-ghi";
import { useTRPC } from "@/lib/trpc/client";
import { useRecordSheetView } from "./record-sheet/record-stack";

export function AgentPanel({ record }: { record: AgentRecord }) {
	const conversations = useConversations(recordFilter(record));
	const { thread, setThread } = useRecordSheetView("overview");

	const history = conversations.data ?? [];

	if (conversations.isPending) return <Loading />;

	return (
		<LoadedAgentPanel
			record={record}
			history={history}
			thread={thread}
			setThread={setThread}
		/>
	);
}

function LoadedAgentPanel({
	record,
	history,
	thread,
	setThread,
}: {
	record: AgentRecord;
	history: Conversation[];
	thread: string | null;
	setThread: (thread: string) => void;
}) {
	const [landedOn] = useState(() => history[0]?.id ?? NEW_THREAD);
	const { openId, current } = resolveThread({
		conversations: history,
		fromUrl: thread,
		landedOn,
	});

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<ConversationPicker
				conversations={history}
				current={current}
				onSelect={(conversation) => setThread(conversation.id)}
				onNew={() => setThread(NEW_THREAD)}
				busy={false}
			/>

			<ThreadWithHistory
				key={openId ?? NEW_THREAD}
				record={record}
				conversation={current}
				onNewThread={() => setThread(NEW_THREAD)}
			/>
		</div>
	);
}

const WORKING_POLL_MS = 3000;
const SETTLED_TTL_MS = 60_000;

function ThreadWithHistory({
	record,
	conversation,
	onNewThread,
}: {
	record: AgentRecord;
	conversation: Conversation | null;
	onNewThread: () => void;
}) {
	const trpc = useTRPC();

	const thread = useQuery<ThreadState>({
		queryKey: ["agent-thread", conversation?.sessionId],
		enabled: conversation !== null,
		staleTime: SETTLED_TTL_MS,
		refetchOnWindowFocus: false,
		refetchInterval: (query) =>
			query.state.data?.status === "working" ? WORKING_POLL_MS : false,
		queryFn: ({ signal }) =>
			loadThread(conversation?.sessionId ?? "", recordHeader(record), signal),
	});

	const offline = thread.data?.status === "offline";

	const archive = useQuery({
		...trpc.conversations.events.queryOptions({ id: conversation?.id ?? "" }),
		enabled: conversation !== null && offline,
		staleTime: SETTLED_TTL_MS,
	});

	if (conversation && (thread.isPending || (offline && archive.isPending)))
		return <Loading />;

	return (
		<Thread
			key={thread.data?.status === "working" ? "working" : "settled"}
			record={record}
			conversation={conversation}
			thread={
				offline ? offlineThread((archive.data ?? []) as never) : thread.data
			}
			onNewThread={onNewThread}
		/>
	);
}

function Loading() {
	const t = karaBanGhiMessages(useLocale());
	return (
		<div className="flex flex-1 items-center justify-center p-5">
			<KaraState kind="working" label={t.tab.dangMo} />
		</div>
	);
}

function Thread({
	record,
	conversation,
	thread,
	onNewThread,
}: {
	record: AgentRecord;
	conversation: Conversation | null;
	thread: ThreadState | undefined;
	onNewThread: () => void;
}) {
	const locale = useLocale();
	const t = karaBanGhiMessages(locale);
	const copy = recordCopy(record.kind, locale);
	const agent = useEveAgent({
		headers: recordHeader(record),
		...(thread && "session" in thread
			? { initialSession: thread.session, initialEvents: eventsOf(thread) }
			: { initialEvents: eventsOf(thread) }),
	});

	const opening = useRef<string | null>(conversation?.title ?? null);

	useSavedConversation({
		record: recordFilter(record),
		conversation,
		opening,
		session: agent.session ?? null,
		messages: agent.data.messages.length,
	});

	const busy = agent.status === "submitted" || agent.status === "streaming";
	const messages = toTranscript(agent.data.messages);
	const question = pendingQuestion(agent.data.messages);
	const empty = messages.length === 0 && !busy;

	const { locked, ended } = composerState(thread, busy);

	const ask = (message: string) => {
		if (!message.trim() || locked) return;
		opening.current ||= message.trim();
		void agent.send({ message: message.trim() });
	};

	const lockedReason = ended
		? t.tab.ketThuc
		: thread?.status === "working" && !busy
			? t.tab.ban
			: undefined;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<MessageScrollerProvider autoScroll defaultScrollPosition="end">
				<MessageScroller className="flex-1">
					<MessageScrollerViewport>
						<MessageScrollerContent className="gap-3 px-4 py-4 sm:px-5">
							{empty ? <Idle copy={copy} /> : null}

							{messages.map((message) => (
								<MessageScrollerItem key={message.id} messageId={message.id}>
									<Turns
										message={message}
										skip={question?.requestId ?? null}
										t={t}
										locale={locale}
									/>
								</MessageScrollerItem>
							))}
						</MessageScrollerContent>
					</MessageScrollerViewport>

					<MessageScrollerButton />
				</MessageScroller>
			</MessageScrollerProvider>

			{agent.error ? (
				<div className="border-t px-4 py-3 sm:px-5">
					<Failure
						message={agent.error.message}
						t={t}
						onRetry={() => ask(lastQuestion(messages) ?? opening.current ?? "")}
					/>
				</div>
			) : null}

			<div className="flex flex-col gap-2 border-t px-4 py-3 sm:px-5">
				{ended ? (
					<div>
						<Button variant="outline" size="sm" onClick={onNewThread}>
							{t.tab.batDauMoi}
						</Button>
					</div>
				) : null}

				{question ? (
					<AgentClarificationComposer
						key={question.requestId}
						question={question}
						pending={busy}
						onSubmit={(response) => agent.send({ inputResponses: [response] })}
					/>
				) : (
					<KaraComposer
						onSubmit={ask}
						status={busy ? "busy" : "ready"}
						placeholder={copy.choNhap}
						label={t.tab.nhanO}
						suggestions={empty ? copy.goiY : undefined}
						suggestionsLabel={t.tab.nhanGoiY}
						onSuggestion={ask}
						lockedReason={lockedReason}
					/>
				)}
			</div>
		</div>
	);
}

function Idle({ copy }: { copy: ReturnType<typeof recordCopy> }) {
	return (
		<Empty width="wide">
			<EmptyHeader>
				<EmptyMedia>
					<KaraMark />
				</EmptyMedia>
				<EmptyTitle>{copy.tieuDe}</EmptyTitle>
				<EmptyDescription>{copy.moTa}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function Failure({
	message,
	t,
	onRetry,
}: {
	message: string;
	t: KaraBanGhiMessages;
	onRetry: () => void;
}) {
	if (message.includes("not configured")) {
		return <KaraState kind="unconfigured" description={t.tab.chuaBat} />;
	}

	return (
		<KaraState
			kind="error"
			what={t.tab.chuaTraLoi}
			description={
				message.includes("not reachable") ? t.tab.loiVang : t.tab.loiKhac
			}
			onRetry={onRetry}
		/>
	);
}

type DidItem = Extract<TranscriptItem, { kind: "did" }>;

type Block =
	| { kind: "turn"; item: Exclude<TranscriptItem, DidItem> }
	| { kind: "steps"; id: string; items: DidItem[] };

function blocksOf(items: readonly TranscriptItem[]): Block[] {
	const blocks: Block[] = [];
	for (const item of items) {
		const last = blocks.at(-1);
		if (item.kind !== "did") {
			blocks.push({ kind: "turn", item });
		} else if (last?.kind === "steps") {
			blocks[blocks.length - 1] = { ...last, items: [...last.items, item] };
		} else {
			blocks.push({ kind: "steps", id: item.id, items: [item] });
		}
	}
	return blocks;
}

function lastQuestion(messages: readonly TranscriptMessage[]): string | null {
	const said = messages
		.flatMap((message) => message.items)
		.filter((item) => item.kind === "said" && item.mine);
	const last = said.at(-1);
	return last?.kind === "said" ? last.text : null;
}

function stepLabel(item: DidItem, t: KaraBanGhiMessages, locale: Locale) {
	const viec = new Map(Object.entries(t.tab.buoc)).get(item.tool);
	if (!viec) return locale === "vi" ? t.tab.buocKhac : item.label;
	const tach = item.label.indexOf(" — ");
	return tach === -1 ? viec : `${viec}${item.label.slice(tach)}`;
}

function Turns({
	message,
	skip,
	t,
	locale,
}: {
	message: TranscriptMessage;
	skip: string | null;
	t: KaraBanGhiMessages;
	locale: Locale;
}) {
	return (
		<div className="space-y-3">
			{blocksOf(message.items).map((block) => {
				if (block.kind === "steps") {
					const steps: KaraStep[] = block.items.map((item) => ({
						id: item.id,
						label: stepLabel(item, t, locale),
						state: item.pending ? "running" : item.failed ? "error" : "done",
					}));
					const sources = block.items.flatMap((item) => item.sources);
					return (
						<div key={block.id} className="space-y-1.5">
							<KaraSteps steps={steps} />
							{sources.length > 0 ? <Sources sources={sources} /> : null}
						</div>
					);
				}
				const { item } = block;
				if (item.kind === "said") {
					return (
						<KaraTurn key={item.id} from={item.mine ? "user" : "kara"}>
							{item.text}
						</KaraTurn>
					);
				}
				if (item.kind === "asked") {
					return item.question.requestId === skip ? null : (
						<KaraTurn key={item.id} from="kara">
							{item.question.prompt}
						</KaraTurn>
					);
				}
				return null;
			})}
		</div>
	);
}

const SOURCE_ICONS = {
	linkedin: LogoLinkedin,
	github: LogoGithub,
	web: Document,
} satisfies Record<Source["network"], CarbonIcon>;

function Sources({ sources }: { sources: Source[] }) {
	return (
		<AttachmentGroup>
			{sources.map((source) => (
				<Attachment key={source.url} size="xs" state="done">
					<AttachmentMedia variant="icon">
						<Icon icon={SOURCE_ICONS[source.network]} />
					</AttachmentMedia>
					<AttachmentContent>
						<AttachmentTitle translate="no">{source.title}</AttachmentTitle>
					</AttachmentContent>

					<AttachmentTrigger asChild>
						<a href={source.url} target="_blank" rel="noreferrer noopener">
							<span className="sr-only">{source.title}</span>
						</a>
					</AttachmentTrigger>
				</Attachment>
			))}
		</AttachmentGroup>
	);
}

function useSavedConversation({
	record,
	conversation,
	opening,
	session,
	messages,
}: {
	record: { contactId?: string; companyId?: string; dealId?: string };
	conversation: Conversation | null;
	opening: React.RefObject<string | null>;
	session: {
		sessionId?: string;
		continuationToken?: string;
		streamIndex: number;
	} | null;
	messages: number;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const save = useMutation(trpc.conversations.save.mutationOptions({}));

	const sessionId = session?.sessionId ?? null;
	const token = session?.continuationToken ?? null;
	const streamIndex = session?.streamIndex ?? 0;
	const { contactId, companyId, dealId } = record;

	const isNew = conversation === null || conversation.sessionId !== sessionId;

	const written = useRef<string | null>(null);
	const persist = useEffectEvent(() => {
		save.mutate(
			{
				contactId: contactId || undefined,
				companyId: companyId || undefined,
				dealId: dealId || undefined,
				sessionId: sessionId ?? "",
				continuationToken: token,
				streamIndex,
				messageCount: messages,
				title: isNew ? (opening.current ?? undefined) : undefined,
			},
			{
				onSuccess: () => {
					if (!isNew) return;
					void queryClient.invalidateQueries({
						queryKey: trpc.conversations.list.pathKey(),
					});
				},
			},
		);
	});

	useEffect(() => {
		if (!sessionId) return;

		const cursor = `${sessionId}:${token ?? ""}:${messages}`;
		if (written.current === cursor) return;
		written.current = cursor;
		persist();
	}, [sessionId, token, messages]);
}
