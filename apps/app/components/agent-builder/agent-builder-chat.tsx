"use client";

import Add from "@carbon/icons-react/es/Add";
import Application from "@carbon/icons-react/es/Application";
import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Building from "@carbon/icons-react/es/Building";
import Checkmark from "@carbon/icons-react/es/Checkmark";
import Copy from "@carbon/icons-react/es/Copy";
import Partnership from "@carbon/icons-react/es/Partnership";
import Play from "@carbon/icons-react/es/Play";
import Renew from "@carbon/icons-react/es/Renew";
import Reply from "@carbon/icons-react/es/Reply";
import ThumbsDown from "@carbon/icons-react/es/ThumbsDown";
import ThumbsUp from "@carbon/icons-react/es/ThumbsUp";
import User from "@carbon/icons-react/es/User";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { MessageResponse } from "@crm/ui/components/ai-elements/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@crm/ui/components/ai-elements/reasoning";
import {
	AsyncButtonContent,
	useAsyncAction,
} from "@crm/ui/components/async-action";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { DotMatrix } from "@crm/ui/components/dot-matrix";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@crm/ui/components/message-scroller";
import { ThinkingIndicator } from "@crm/ui/components/thinking-indicator";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { cn } from "@crm/ui/lib/utils";
import type { AgentManifestSummary } from "@crm/validation/agent-manifest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Client, type MessageStreamEvent } from "eve/client";
import type { EveMessage, EveMessageInputRequest } from "eve/react";
import Link from "next/link";
import { Fragment, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { LocalDateTime } from "@/components/local-date-time";
import {
	consumeBuilderCommand,
	hasCreateAgentCommand,
} from "@/lib/agent-builder";
import {
	agentBuilderCallIsActive,
	builderConversationIsWorking,
	builderSessionStreamKey,
	completedBuilderSteps,
	displayedArtifactVersionId,
	latestCompletedArtifactVersionId,
	reviewVersionId,
} from "@/lib/agent-builder-state";
import {
	conversationTimeline,
	eventStreamSettled,
	latestTurnFailure,
	messagesFromEvents,
	splitMarkdownTable,
	type TranscriptItem,
	toTranscript,
} from "@/lib/agent-transcript";
import { isSharedChatToken } from "@/lib/chat-route";
import { oSoanMessages } from "@/lib/messages/agent-builder-o-soan";
import {
	type TroChuyenMessages,
	troChuyenMessages,
} from "@/lib/messages/agent-builder-tro-chuyen";
import { karaBanGhiMessages } from "@/lib/messages/kara-ban-ghi";
import { builderStepLabel } from "@/lib/nhan-buoc";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { AgentCodeWorkspace } from "./agent-code-workspace";
import { AgentComposer, type BuilderPrompt } from "./agent-composer";
import {
	agentResultSkeleton,
	agentResultsByItem,
	hasAgentResult,
} from "./agent-result";
import { AgentScopeBadges } from "./agent-scope-badges";
import { BuilderFailureCard } from "./builder-failure-card";
import {
	BuilderQuestionComposer,
	sessionLimitAnswerLabel,
	withoutSessionLimitSteps,
} from "./builder-question-composer";
import {
	ChatAttachmentChip,
	ChatCommandChip,
	ChatReferenceChip,
} from "./chat-chips";
import { DeleteChatAction } from "./delete-chat-action";
import { ShareChatDialog } from "./share-chat-dialog";
import { TheDangDung } from "./the-dang-dung";

type Conversation = RouterOutputs["conversations"]["builderById"];
type SharedConversation = RouterOutputs["conversations"]["shared"];

const BUILDER_STEP_ARTIFACTS = [
	null,
	"agent/instructions.md",
	"agent/manifest.json",
	"agent/README.md",
] as const;
const submissionResource = z.object({
	kind: z.enum(["integration", "company", "contact", "deal"]),
	id: z.string().min(1),
	label: z.string().min(1),
	detail: z.string().nullable().optional().catch(null),
	imageUrl: z.string().nullable().optional().catch(null),
});

const storedAttachment = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	type: z.string().min(1),
	size: z.number(),
	previewUrl: z.string().nullable().optional().catch(null),
});

const uploadAttachment = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	size: z.number(),
	contentBase64: z.string().min(1),
	previewUrl: z.string().nullable().optional().catch(null),
});

const builderMessage = z
	.object({
		text: z.string().nullable().catch(null),
		resources: z.array(submissionResource).catch([]),
		attachments: z
			.array(z.union([storedAttachment, uploadAttachment]))
			.catch([]),
		inputResponse: z
			.object({
				requestId: z.string().min(1),
				optionId: z.string().optional().catch(undefined),
				kind: z.string().optional().catch(undefined),
			})
			.nullable()
			.catch(null),
	})
	.catch({
		text: null,
		resources: [],
		attachments: [],
		inputResponse: null,
	});

type BuilderMessage = z.infer<typeof builderMessage>;

export const builderSubmissions = z.array(
	z.object({
		id: z.string(),
		createdAt: z.string(),
		clientRequestId: z.string().nullable().catch(null),
		commandType: z.enum(["CHAT", "CREATE_AGENT"]),
		message: builderMessage,
		status: z.string(),
		errorCode: z.string().nullable().catch(null),
		errorMessage: z.string().nullable().catch(null),
	}),
);

type BuilderSubmission = z.infer<typeof builderSubmissions>[number];

const streamEventShape = z.object({
	type: z.string().min(1),
	meta: z.object({ id: z.string().min(1), at: z.string().min(1) }),
});

const streamEvents = z
	.array(
		z
			.custom<MessageStreamEvent>(
				(value) => streamEventShape.safeParse(value).success,
			)
			.nullable()
			.catch(null),
	)
	.catch([])
	.transform((events) => events.filter((event) => event !== null));

type PendingSubmission = {
	clientRequestId: string;
	createdAt: string;
	commandType: "CHAT" | "CREATE_AGENT";
	message: BuilderMessage;
};

export function AgentBuilderChat({
	conversationId,
	initialData,
}: {
	conversationId: string;
	initialData: Conversation | SharedConversation | null;
}) {
	const t = troChuyenMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const sharedChat = isSharedChatToken(conversationId);
	const [liveStream, setLiveStream] = useState<{
		key: string;
		events: readonly MessageStreamEvent[];
	} | null>(null);
	const [sending, setSending] = useState<PendingSubmission[]>([]);
	const conversation = useQuery({
		...trpc.conversations.builderById.queryOptions({ id: conversationId }),
		enabled: !sharedChat,
		initialData: sharedChat ? undefined : (initialData as Conversation),
		refetchInterval: (query) => {
			const data = query.state.data;
			return data && builderConversationNeedsPolling(data) ? 2500 : false;
		},
	});
	const shared = useQuery({
		...trpc.conversations.shared.queryOptions({ token: conversationId }),
		enabled: sharedChat,
		initialData:
			sharedChat && initialData
				? (initialData as SharedConversation)
				: undefined,
		refetchInterval: (query) =>
			sharedConversationNeedsPolling(query.state.data) ? 5000 : false,
	});
	const events = useQuery({
		...trpc.conversations.events.queryOptions({
			id: conversationId,
			limit: 5000,
		}),
		enabled: !sharedChat && Boolean(conversation.data?.sessionId),
		refetchInterval: (query) =>
			conversation.data &&
			(builderConversationNeedsPolling(conversation.data) ||
				!eventStreamSettled(query.state.data ?? []))
				? 2500
				: false,
	});
	const submit = useMutation(
		trpc.conversations.submitBuilder.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.conversations.builderById.pathKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.conversations.builderList.pathKey(),
					}),
				]);
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const answerQuestion = useMutation(
		trpc.conversations.answerBuilderQuestion.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.conversations.builderById.pathKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.conversations.builderList.pathKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.conversations.events.pathKey(),
					}),
				]);
			},
			onError: (error) => toast.error(error.message),
		}),
	);
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

	if (sharedChat) {
		if (shared.isPending) {
			return (
				<main
					className="flex flex-1 items-center justify-center p-8"
					aria-busy="true"
				>
					<span className="text-muted-foreground text-sm">{t.man.dangMo}</span>
				</main>
			);
		}
		if (shared.isError || !shared.data) return <ChatUnavailable />;
		return <SharedAgentChat conversation={shared.data} />;
	}

	if (conversation.isError && !conversation.data) {
		return <ChatUnavailable />;
	}

	const data = conversation.data ?? (initialData as Conversation);
	const submissions = builderSubmissions.parse(data.submissions);
	const confirmedRequestIds = new Set(
		submissions
			.map((submission) => submission.clientRequestId)
			.filter((id): id is string => Boolean(id)),
	);
	const pendingSubmissions = sending.filter(
		(item) => !confirmedRequestIds.has(item.clientRequestId),
	);
	const persistedEvents = streamEvents.parse(events.data ?? []);
	const streamKey = builderSessionStreamKey(
		data.sessionId,
		submissions.at(-1)?.id ?? null,
	);
	const transcriptEvents =
		streamKey && liveStream?.key === streamKey
			? liveStream.events
			: persistedEvents;
	const agentMessages = messagesFromEvents(transcriptEvents);
	const timeline = conversationTimeline(
		submissions,
		transcriptEvents,
		agentMessages,
	);
	const answeredQuestionIds = questionResponseIds(submissions);
	const waitingQuestion = data.pendingQuestion;
	const question =
		waitingQuestion &&
		!hasQueuedQuestionResponse(submissions, waitingQuestion.requestId)
			? waitingQuestion
			: null;
	const failure = latestTurnFailure(transcriptEvents);
	const creatingAgent = hasCreateAgentCommand(submissions);
	const working = builderConversationIsWorking(data) && !failure;
	const builderCallActive = agentBuilderCallIsActive(transcriptEvents);
	const currentSubmissionCreatesAgent =
		submissions.at(-1)?.commandType === "CREATE_AGENT";
	const reviewVersion = reviewVersionId(data);
	const artifactVersion = displayedArtifactVersionId(data, working);
	const retryPrompt = retryPromptOf(submissions.at(-1));
	const send = async (
		prompt: BuilderPrompt,
		clientRequestId = crypto.randomUUID(),
	) => {
		setSending((current) => [
			...current,
			{
				clientRequestId,
				createdAt: new Date().toISOString(),
				commandType: prompt.commandType ?? "CHAT",
				message: {
					text: prompt.message,
					resources: prompt.resources,
					attachments: prompt.attachments,
					inputResponse: null,
				},
			},
		]);

		try {
			await submit.mutateAsync({
				id: conversationId,
				clientRequestId,
				...prompt,
			});
		} finally {
			setSending((current) =>
				current.filter((item) => item.clientRequestId !== clientRequestId),
			);
		}
	};

	return (
		<main
			className="flex min-h-0 flex-1 flex-col"
			onPointerEnter={() => {
				if (
					data.lastAssistantAt &&
					(!data.lastReadAt ||
						new Date(data.lastAssistantAt) > new Date(data.lastReadAt)) &&
					!markRead.isPending
				) {
					markRead.mutate({ id: conversationId });
				}
			}}
		>
			{streamKey && data.sessionId ? (
				<BuilderEventFollower
					key={streamKey}
					conversationId={conversationId}
					sessionId={data.sessionId}
					onSnapshot={(snapshot) =>
						setLiveStream({ key: streamKey, events: snapshot })
					}
					onEvent={(event) =>
						setLiveStream((current) => ({
							key: streamKey,
							events:
								current?.key === streamKey
									? appendEvent(current.events, event)
									: [event],
						}))
					}
					onEnded={() =>
						setLiveStream((current) =>
							current?.key === streamKey ? null : current,
						)
					}
				/>
			) : null}
			<ChatHeader
				conversation={data}
				working={working}
				creatingAgent={creatingAgent}
			/>

			<MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
				<MessageScroller className="flex-1">
					<MessageScrollerViewport aria-label={t.man.vungTin}>
						<MessageScrollerContent
							aria-busy={working}
							className="mx-auto w-full max-w-3xl gap-4 px-4 py-6 sm:gap-5 sm:px-5 sm:py-9"
						>
							{timeline.map((item) => (
								<MessageScrollerItem
									key={item.id}
									messageId={item.id}
									scrollAnchor={item.kind === "submission"}
									userContent
								>
									{item.kind === "submission" ? (
										<UserSubmission
											submission={item.submission}
											failed={item.submission.status === "FAILED"}
											errorCode={item.submission.errorCode}
										/>
									) : (
										<AssistantMessage
											conversation={data}
											message={item.message}
											answeredQuestionIds={answeredQuestionIds}
										/>
									)}
								</MessageScrollerItem>
							))}

							{pendingSubmissions.map((item) => (
								<MessageScrollerItem
									key={item.clientRequestId}
									messageId={`sending:${item.clientRequestId}`}
									scrollAnchor
									userContent
								>
									<UserSubmission
										submission={{
											id: item.clientRequestId,
											createdAt: item.createdAt,
											clientRequestId: item.clientRequestId,
											commandType: item.commandType,
											message: item.message,
											status: "PENDING",
											errorCode: null,
											errorMessage: null,
										}}
										failed={false}
										errorCode={null}
										sending
									/>
								</MessageScrollerItem>
							))}

							{pendingSubmissions.length > 0 ||
							(working && !builderCallActive) ? (
								<MessageScrollerItem messageId={`thinking:${conversationId}`}>
									<ThinkingIndicator />
								</MessageScrollerItem>
							) : null}

							{working && builderCallActive ? (
								<MessageScrollerItem
									messageId={`building-agent:${conversationId}`}
								>
									<BuildingAgentCard
										conversationId={conversationId}
										sessionId={data.sessionId}
										artifacts={data.builderArtifacts}
										submissions={submissions}
									/>
								</MessageScrollerItem>
							) : null}

							{creatingAgent && data.builderArtifacts.length > 0 ? (
								<MessageScrollerItem
									messageId={`agent-workspace:${conversationId}`}
								>
									<AgentCodeWorkspace
										artifacts={data.builderArtifacts}
										working={working}
										versionId={artifactVersion}
									/>
								</MessageScrollerItem>
							) : null}

							{!working && failure ? (
								<MessageScrollerItem
									messageId={`builder-failure:${conversationId}`}
								>
									<BuilderFailureCard
										failure={failure}
										creatingAgent={currentSubmissionCreatesAgent}
										retrying={submit.isPending}
										onRetry={retryPrompt ? () => send(retryPrompt) : null}
									/>
								</MessageScrollerItem>
							) : null}

							{creatingAgent && !working && reviewVersion ? (
								<MessageScrollerItem
									messageId={`review-agent:${conversationId}`}
								>
									<ReviewAgentCard
										conversation={data}
										versionId={reviewVersion}
									/>
								</MessageScrollerItem>
							) : null}

							{creatingAgent &&
							data.agent?.status === "LIVE" &&
							!reviewVersion ? (
								<MessageScrollerItem
									messageId={`deployed-agent:${conversationId}`}
								>
									<DeployedAgentCard
										conversation={data}
										onFollowUp={(message) =>
											send({
												commandType: "CREATE_AGENT",
												message,
												resources: [],
												attachments: [],
											})
										}
									/>
								</MessageScrollerItem>
							) : null}
						</MessageScrollerContent>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</MessageScroller>
			</MessageScrollerProvider>

			<div className="min-h-0 shrink overflow-y-auto overscroll-contain border-t px-4 py-3 sm:px-5">
				<div className="mx-auto w-full max-w-3xl">
					{question ? (
						<BuilderQuestionComposer
							key={question.requestId}
							question={question}
							pending={answerQuestion.isPending}
							onAnswer={async (response) => {
								await answerQuestion.mutateAsync({
									id: conversationId,
									clientRequestId: crypto.randomUUID(),
									...response,
								});
							}}
						/>
					) : (
						<AgentComposer mode="chat" disabled={working} onSubmit={send} />
					)}
				</div>
			</div>
		</main>
	);
}

function BuilderEventFollower({
	conversationId,
	sessionId,
	onSnapshot,
	onEvent,
	onEnded,
}: {
	conversationId: string;
	sessionId: string;
	onSnapshot: (events: readonly MessageStreamEvent[]) => void;
	onEvent: (event: MessageStreamEvent) => void;
	onEnded: () => void;
}) {
	useMountEffect(() => {
		const controller = new AbortController();
		const client = new Client({
			headers: { "x-crm-builder-conversation": conversationId },
			host: "",
		});

		const follow = async () => {
			const session = client.session({ sessionId, streamIndex: 0 });
			const snapshot = await session.snapshot({ signal: controller.signal });
			if (controller.signal.aborted) return;
			onSnapshot(snapshot.events);

			for await (const event of session.stream({
				startIndex: snapshot.session.streamIndex,
				signal: controller.signal,
			})) {
				if (controller.signal.aborted) return;
				onEvent(event);
			}
		};

		void (async () => {
			try {
				await follow();
			} catch (error) {
				if (!controller.signal.aborted) console.error(error);
			} finally {
				if (!controller.signal.aborted) onEnded();
			}
		})();

		return () => controller.abort();
	});

	return null;
}

function withoutTable(text: string): string {
	const { before, after } = splitMarkdownTable(text);
	return [before, after].filter(Boolean).join("\n\n").trim();
}

export function AgentToolStep({
	item,
}: {
	item: Extract<TranscriptItem, { kind: "did" }>;
}) {
	const locale = useLocale();
	const kara = karaBanGhiMessages(locale);
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<div className="flex min-w-0 items-start gap-2 text-sm">
				{item.pending ? (
					<DotMatrix decorative className="mt-0.5" />
				) : item.tone === "warning" ? (
					<Icon icon={WarningAlt} className="size-3.5 text-warning" />
				) : (
					<Icon icon={Checkmark} className="size-3.5 text-ring" />
				)}
				<span className="min-w-0 wrap-break-word">
					{builderStepLabel(item, kara, locale)}
				</span>
			</div>
			{item.errorText ? (
				<p className="pl-[22px] wrap-break-word text-destructive text-xs leading-5">
					{item.errorText}
				</p>
			) : null}
			{hasAgentResult(item.tool) && item.pending
				? agentResultSkeleton(item.tool)
				: null}
		</div>
	);
}

function appendEvent(
	events: readonly MessageStreamEvent[],
	event: MessageStreamEvent,
): readonly MessageStreamEvent[] {
	return events.some((candidate) => candidate.meta.id === event.meta.id)
		? events
		: [...events, event];
}

function SharedAgentChat({
	conversation,
}: {
	conversation: SharedConversation;
}) {
	const t = troChuyenMessages(useLocale());
	const submissions = builderSubmissions.parse(conversation.submissions);
	const events = streamEvents.parse(conversation.events);
	const messages = messagesFromEvents(events);
	const timeline = conversationTimeline(submissions, events, messages);
	const answeredQuestionIds = questionResponseIds(submissions);
	const working = events.length > 0 && !eventStreamSettled(events);
	const artifactVersion = working
		? null
		: latestCompletedArtifactVersionId(conversation.builderArtifacts);

	return (
		<main className="flex min-h-0 flex-1 flex-col">
			<header className="flex h-12 shrink-0 items-center gap-3 border-b px-5">
				<h1
					className="min-w-0 flex-1 truncate font-medium text-sm"
					translate="no"
				>
					{conversation.agent?.name ?? conversation.title ?? t.man.boDung}
				</h1>
				<span className="text-muted-foreground text-xs">{t.man.chiDoc}</span>
			</header>

			<MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
				<MessageScroller className="flex-1">
					<MessageScrollerViewport aria-label={t.man.vungTin}>
						<MessageScrollerContent
							aria-busy={working}
							className="mx-auto w-full max-w-3xl gap-4 px-4 py-6 sm:gap-5 sm:px-5 sm:py-9"
						>
							<MessageScrollerItem messageId="shared-chat-notice">
								<div className="rounded-lg border bg-card px-4 py-3 text-sm">
									<p className="font-medium">
										{t.man.chiaSeBoi(conversation.ownerName)}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{t.man.chiaSeMoTa}
									</p>
								</div>
							</MessageScrollerItem>

							{timeline.map((item) => (
								<MessageScrollerItem
									key={item.id}
									messageId={item.id}
									scrollAnchor={item.kind === "submission"}
									userContent
								>
									{item.kind === "submission" ? (
										<UserSubmission
											submission={item.submission}
											failed={item.submission.status === "FAILED"}
											errorCode={item.submission.errorCode}
										/>
									) : (
										<AssistantMessage
											conversation={null}
											message={item.message}
											answeredQuestionIds={answeredQuestionIds}
										/>
									)}
								</MessageScrollerItem>
							))}

							{conversation.builderArtifacts.length > 0 ? (
								<MessageScrollerItem
									messageId={`agent-workspace:${conversation.id}`}
								>
									<AgentCodeWorkspace
										artifacts={conversation.builderArtifacts}
										working={working}
										versionId={artifactVersion}
									/>
								</MessageScrollerItem>
							) : null}
						</MessageScrollerContent>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</MessageScroller>
			</MessageScrollerProvider>
		</main>
	);
}

function ChatHeader({
	conversation,
	working,
	creatingAgent,
}: {
	conversation: Conversation;
	working: boolean;
	creatingAgent: boolean;
}) {
	const t = troChuyenMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();
	// Tiêu đề đến từ HAI nguồn khác hẳn nhau: tên tác nhân / tiêu đề hội thoại là
	// DỮ LIỆU người nhập hoặc máy sinh (không được dịch), còn nhãn dự phòng là CHỮ
	// GIAO DIỆN (phải dịch). Trước đây cả hai dùng chung một `translate="no"`, nên
	// khi rơi về nhãn dự phòng thì một phần tử tự xưng «đừng dịch» lại vẽ ra hai
	// chuỗi khác nhau ở hai thứ tiếng.
	const duLieu =
		(creatingAgent ? conversation.agent?.name : null) ??
		conversation.title ??
		null;
	const title = duLieu ?? t.man.hoiThoai;

	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 sm:gap-2.5 sm:pr-4 sm:pl-5">
			<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
				<h1 className="truncate font-medium text-sm">
					{duLieu === null ? (
						t.man.hoiThoai
					) : (
						<span translate="no">{duLieu}</span>
					)}
				</h1>
				<span className="hidden shrink-0 text-muted-foreground text-xs sm:inline">
					{t.man.rieng}
				</span>
				{working ? (
					<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
						<Icon
							icon={Renew}
							className="size-3.5 animate-spin text-ring"
							motion="none"
						/>
						<span className="sr-only">{t.man.chayNen}</span>
						<span aria-hidden="true" className="hidden sm:inline">
							{t.man.chayNen}
						</span>
					</span>
				) : null}
			</div>
			<Button asChild variant="ghost" size="icon-sm">
				<Link href={workspaceUrl("/chat")} aria-label={t.man.moMoi}>
					<Icon icon={Add} />
				</Link>
			</Button>
			<ShareChatDialog conversationId={conversation.id} title={title} />
			<DeleteChatAction
				conversationId={conversation.id}
				title={title}
				trigger="menu"
				returnToChatList
			/>
		</header>
	);
}

export function UserSubmission({
	submission,
	failed,
	errorCode,
	sending = false,
}: {
	submission: BuilderSubmission;
	failed: boolean;
	errorCode: string | null;
	sending?: boolean;
}) {
	const locale = useLocale();
	const t = troChuyenMessages(locale);
	const message = submission.message;
	const messageText = message.text ?? t.man.tinKhongMo;
	const command =
		submission.commandType === "CREATE_AGENT"
			? consumeBuilderCommand(messageText)
			: null;
	const response = message.inputResponse;
	const text =
		sessionLimitAnswerLabel(response, oSoanMessages(locale)) ??
		command?.body ??
		messageText;

	return (
		<div
			className={cn(
				"flex min-w-0 w-full justify-end transition-opacity",
				sending && "opacity-60",
			)}
		>
			<div
				className={cn(
					"flex w-fit min-w-0 max-w-full flex-col gap-2 rounded-md bg-muted px-3 py-2.5 text-sm leading-5 sm:max-w-[620px] sm:px-3.5 sm:py-3",
					response &&
						"max-w-sm gap-1.5 border-ring border-r-2 bg-muted/70 py-2 sm:max-w-sm sm:py-2.5",
				)}
			>
				{response ? (
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Icon icon={Reply} className="size-3.5" />
						<span>{t.traLoi.traLoiHoiThem}</span>
					</div>
				) : null}
				{submission.commandType === "CREATE_AGENT" ? (
					<div className="flex flex-wrap gap-1">
						<ChatCommandChip label={t.traLoi.taoTacNhan} icon={Application} />
					</div>
				) : null}
				<p className="wrap-break-word">{text}</p>
				{message.resources.length > 0 || message.attachments.length > 0 ? (
					<div className="flex flex-wrap gap-1 pt-1">
						{message.resources.map((resource) => (
							<ChatReferenceChip
								key={`${resource.kind}:${resource.id}`}
								resource={resource}
								icon={RESOURCE_ICONS[resource.kind]}
							/>
						))}
						{message.attachments.map((attachment) => (
							<ChatAttachmentChip
								key={`${attachment.name}:${attachment.size}`}
								attachment={attachment}
							/>
						))}
					</div>
				) : null}
				{failed ? (
					<p className="mt-2 text-destructive text-xs">
						{loiGuiCua(t, errorCode)}
					</p>
				) : null}
			</div>
		</div>
	);
}

function AssistantMessage({
	conversation,
	message,
	answeredQuestionIds,
}: {
	conversation: Conversation | null;
	message: EveMessage;
	answeredQuestionIds: ReadonlySet<string>;
}) {
	const [raw] = toTranscript([message]);
	if (!raw || raw.mine) return null;
	const transcript = withoutSessionLimitSteps(raw);

	const textParts: string[] = [];
	for (const item of transcript.items) {
		if (item.kind === "said") textParts.push(item.text);
	}
	const markdown = textParts.join("\n\n");
	const results = agentResultsByItem(transcript.items);

	return (
		<div className="flex w-full min-w-0 max-w-[640px] flex-col gap-2">
			{transcript.items.map((item) => {
				if (item.kind === "reasoned") {
					return (
						<Reasoning
							defaultOpen={item.streaming}
							isStreaming={item.streaming}
							key={item.id}
						>
							<ReasoningTrigger />
							<ReasoningContent>{item.text}</ReasoningContent>
						</Reasoning>
					);
				}

				if (item.kind === "did") {
					return (
						<Fragment key={item.id}>
							<AgentToolStep item={item} />
							{results.get(item.id)}
						</Fragment>
					);
				}

				if (item.kind === "said") {
					const text = results.size > 0 ? withoutTable(item.text) : item.text;
					if (!text) return null;

					return (
						<MessageResponse key={item.id} className="text-sm leading-5">
							{text}
						</MessageResponse>
					);
				}

				return conversation === null ||
					answeredQuestionIds.has(item.question.requestId) ? (
					<FollowUpTranscriptItem
						key={item.id}
						question={item.question}
						answered={answeredQuestionIds.has(item.question.requestId)}
					/>
				) : null;
			})}
			{markdown ? (
				conversation ? (
					<ResponseActions
						conversation={conversation}
						messageId={transcript.id}
						markdown={markdown}
					/>
				) : (
					<CopyResponseAction markdown={markdown} />
				)
			) : null}
		</div>
	);
}

function FollowUpTranscriptItem({
	question,
	answered,
}: {
	question: EveMessageInputRequest;
	answered: boolean;
}) {
	const t = troChuyenMessages(useLocale());
	return (
		<div className="w-full max-w-sm border-ring/50 border-l-2 bg-muted/40 px-3 py-2.5">
			<div className="flex items-center justify-between gap-3 text-xs">
				<span className="font-medium">{t.traLoi.hoiThem}</span>
				<span className="text-muted-foreground">
					{answered ? t.traLoi.daTraLoi : t.traLoi.choTraLoi}
				</span>
			</div>
			<MessageResponse className="mt-1.5 text-sm leading-5">
				{question.prompt}
			</MessageResponse>
		</div>
	);
}

function CopyResponseAction({ markdown }: { markdown: string }) {
	const t = troChuyenMessages(useLocale());
	return (
		<div className="flex h-7 items-center">
			<Button
				variant="ghost"
				size="icon-xs"
				aria-label={t.traLoi.chepMarkdown}
				onClick={() => {
					void navigator.clipboard.writeText(markdown);
					toast.success(t.traLoi.daChepMarkdown);
				}}
			>
				<Icon icon={Copy} />
			</Button>
		</div>
	);
}

function ResponseActions({
	conversation,
	messageId,
	markdown,
}: {
	conversation: Conversation;
	messageId: string;
	markdown: string;
}) {
	const t = troChuyenMessages(useLocale());
	const trpc = useTRPC();
	const initial = conversation.feedback.find(
		(item) => item.messageId === messageId,
	)?.rating;
	const [rating, setRating] = useState<"UP" | "DOWN" | null>(initial ?? null);
	const rate = useMutation(
		trpc.conversations.rateBuilderResponse.mutationOptions({
			onError: (error) => toast.error(error.message),
		}),
	);

	const choose = (next: "UP" | "DOWN") => {
		const value = rating === next ? null : next;
		setRating(value);
		rate.mutate({ id: conversation.id, messageId, rating: value });
	};

	return (
		<div className="flex h-7 items-center gap-0.5">
			<Button
				variant="ghost"
				size="icon-xs"
				aria-label={t.traLoi.chepMarkdown}
				onClick={() => {
					void navigator.clipboard.writeText(markdown);
					toast.success(t.traLoi.daChepMarkdown);
				}}
			>
				<Icon icon={Copy} />
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				aria-label={t.traLoi.hopIch}
				aria-pressed={rating === "UP"}
				className={cn(rating === "UP" && "bg-muted text-foreground")}
				onClick={() => choose("UP")}
			>
				<Icon icon={ThumbsUp} />
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				aria-label={t.traLoi.khongHopIch}
				aria-pressed={rating === "DOWN"}
				className={cn(rating === "DOWN" && "bg-muted text-foreground")}
				onClick={() => choose("DOWN")}
			>
				<Icon icon={ThumbsDown} />
			</Button>
		</div>
	);
}

export function BuildingAgentCard({
	conversationId,
	sessionId,
	artifacts,
	submissions,
}: {
	conversationId: string;
	sessionId: string | null;
	artifacts: Conversation["builderArtifacts"];
	submissions: readonly BuilderSubmission[];
}) {
	const t = troChuyenMessages(useLocale());
	const startedAt = submissions.at(-1)?.createdAt ?? null;
	const completed = completedBuilderSteps(artifacts, startedAt, sessionId);
	const stop = useAsyncAction({
		action: async () => {
			if (!sessionId) return;
			const response = await fetch(`/eve/v1/session/${sessionId}/cancel`, {
				method: "POST",
				headers: { "x-crm-builder-conversation": conversationId },
			});
			if (!response.ok) throw new Error(await response.text());
		},
		onSuccess: () => toast.success(t.dung.daXinDung),
		onError: () => toast.error(t.dung.dungHong),
	});

	const writingPath =
		artifacts.find((artifact) => artifact.status === "WRITING")?.path ?? null;

	return (
		<TheDangDung
			buoc={t.man.buoc.map((nhan: string, index: number) => ({
				nhan,
				vat: BUILDER_STEP_ARTIFACTS[index] ?? null,
			}))}
			daXong={completed}
			dangGhi={writingPath}
			batDauLuc={startedAt}
			t={t}
			nutDung={
				<Button
					variant="outline"
					size="sm"
					disabled={!sessionId || stop.pending}
					aria-busy={stop.pending}
					onClick={() => stop.run()}
				>
					<AsyncButtonContent
						status={stop.status}
						pendingLabel={t.dung.dangDungLai}
						successLabel={t.dung.dangDungLai}
						errorLabel={t.dung.thuLai}
					>
						{t.dung.dungLai}
					</AsyncButtonContent>
				</Button>
			}
		/>
	);
}

function ReviewAgentCard({
	conversation,
	versionId,
}: {
	conversation: Conversation;
	versionId: string;
}) {
	const t = troChuyenMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();
	const version = conversation.createdVersions.find(
		(candidate) => candidate.id === versionId,
	);
	const agent = conversation.agent;

	if (!version || !agent) return null;
	const manifest = manifestOf(t, version.manifest);

	return (
		<div className="flex flex-col gap-5">
			<p className="max-w-[640px] text-pretty text-sm leading-5">
				{t.banNhap.sanSang}
			</p>
			<AgentCardShell
				name={manifest.name ?? agent.name}
				status={t.banNhap.rieng}
			>
				<div className="flex flex-col gap-2 p-4">
					<ReviewRow label={t.banNhap.khiNao} value={manifest.trigger} />
					<ReviewRow label={t.banNhap.tim} value={manifest.looksAt} />
					<ReviewRow label={t.banNhap.roi} value={manifest.action} />
					<ReviewRow label={t.banNhap.pham}>
						<AgentScopeBadges
							scopes={manifest.access}
							fallback={t.banNhap.phamMacDinh}
						/>
					</ReviewRow>
				</div>
				<AgentCardFooter note={t.banNhap.hopKin}>
					<Button asChild size="sm">
						<Link
							href={workspaceUrl(`/agents/${agent.id}`)}
							transitionTypes={["nav-forward"]}
						>
							{t.banNhap.xemChiTiet}
							<Icon icon={ArrowRight} data-icon="inline-end" />
						</Link>
					</Button>
				</AgentCardFooter>
			</AgentCardShell>
		</div>
	);
}

function AgentCardShell({
	name,
	status,
	children,
}: {
	name: string;
	status: string;
	children: ReactNode;
}) {
	return (
		<div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg border bg-card">
			<div className="flex items-center gap-2 px-4 pt-4">
				<h2 className="min-w-0 flex-1 wrap-break-word font-medium text-sm">
					{name}
				</h2>
				<Badge variant="token">{status}</Badge>
			</div>
			{children}
		</div>
	);
}

function AgentCardFooter({
	note,
	children,
}: {
	note: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col items-stretch gap-3 border-t bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<p className="text-pretty text-muted-foreground text-xs">{note}</p>
			<div className="sm:shrink-0">{children}</div>
		</div>
	);
}

function ReviewRow({
	label,
	value,
	children,
}: {
	label: string;
	value?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
			<span className="text-muted-foreground text-sm leading-5 sm:w-16 sm:shrink-0">
				{label}
			</span>
			<div className="min-w-0 flex-1 wrap-break-word font-medium text-sm leading-5">
				{children ?? value}
			</div>
		</div>
	);
}

function DeployedAgentCard({
	conversation,
	onFollowUp,
}: {
	conversation: Conversation;
	onFollowUp: (message: string) => Promise<void>;
}) {
	const t = troChuyenMessages(useLocale());
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const queryClient = useQueryClient();
	const agent = conversation.agent;
	const run = useMutation(
		trpc.agents.runNow.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.agents.history.pathKey(),
				});
				toast.success(t.tacNhanSong.daXep);
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const runAction = useAsyncAction({
		action: () =>
			run.mutateAsync({
				id: agent?.id ?? "",
				clientRequestId: crypto.randomUUID(),
			}),
	});

	if (!agent) return null;
	const enabledTriggers = agent.triggers.filter((trigger) => trigger.enabled);
	const nextRun =
		enabledTriggers.length === 1 ? enabledTriggers[0]?.nextRunAt : null;
	const triggerSummary =
		enabledTriggers.map((trigger) => trigger.name).join(" · ") ||
		t.tacNhanSong.chayTay;

	return (
		<div className="flex flex-col gap-[18px]">
			<div className="flex flex-col gap-1">
				<p className="text-sm leading-5">{t.tacNhanSong.daSong(agent.name)}</p>
				<p className="text-muted-foreground text-sm leading-5">
					{t.tacNhanSong.daSongMoTa}
				</p>
			</div>
			<AgentCardShell name={agent.name} status={t.tacNhanSong.nhanSong}>
				<div className="flex flex-col gap-2 p-4">
					<ReviewRow
						label={t.tacNhanSong.moc}
						value={
							nextRun ? (
								<LocalDateTime
									date={nextRun}
									options={{
										weekday: "short",
										hour: "numeric",
										minute: "2-digit",
										timeZoneName: "short",
									}}
								/>
							) : (
								triggerSummary
							)
						}
					/>
					<ReviewRow
						label={t.tacNhanSong.chayO}
						value={t.tacNhanSong.chayOEve}
					/>
					<ReviewRow
						label={t.tacNhanSong.chu}
						value={t.tacNhanSong.chuLaDoi(agent.createdBy.name)}
					/>
				</div>
				<AgentCardFooter note={t.tacNhanSong.ghiChuRieng}>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={runAction.pending}
							aria-busy={runAction.pending}
							onClick={() => runAction.run()}
						>
							<AsyncButtonContent
								status={runAction.status}
								pendingLabel={t.tacNhanSong.dangXep}
								successLabel={t.tacNhanSong.daXepNhan}
								errorLabel={t.tacNhanSong.thuLai}
							>
								<Icon icon={Play} data-icon="inline-start" />
								{t.tacNhanSong.chayNgay}
							</AsyncButtonContent>
						</Button>
						<Button asChild size="sm">
							<Link href={workspaceUrl(`/agents/${agent.id}`)}>
								{t.tacNhanSong.moTacNhan}
								<Icon icon={ArrowRight} data-icon="inline-end" />
							</Link>
						</Button>
					</div>
				</AgentCardFooter>
			</AgentCardShell>

			<div>
				<p className="flex h-7 items-center text-muted-foreground text-sm">
					{t.traLoi.goiYHoiThem}
				</p>
				{[t.traLoi.themNguoiVaoTin].map((suggestion) => (
					<button
						key={suggestion}
						type="button"
						onClick={() => void onFollowUp(suggestion)}
						className="flex w-full items-center gap-3 border-t py-2.5 text-left outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
					>
						<span className="min-w-0 flex-1 wrap-break-word text-sm">
							{suggestion}
						</span>
						<Icon icon={ArrowRight} className="size-4 text-muted-foreground" />
					</button>
				))}
			</div>
		</div>
	);
}

function ChatUnavailable() {
	const t = troChuyenMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();

	return (
		<main className="flex flex-1 items-center justify-center p-8">
			<div className="max-w-md text-center">
				<h1 className="font-medium text-lg">{t.man.khongMo}</h1>
				<p className="mt-2 text-muted-foreground text-sm">
					{t.man.khongMoMoTa}
				</p>
				<Button asChild variant="outline" className="mt-5">
					<Link href={workspaceUrl("/chat")}>{t.man.moMoi}</Link>
				</Button>
			</div>
		</main>
	);
}

const RESOURCE_ICONS = {
	integration: Application,
	company: Building,
	contact: User,
	deal: Partnership,
} as const;

function hasQueuedQuestionResponse(
	submissions: BuilderSubmission[],
	requestId: string,
): boolean {
	return submissions.some((submission) => {
		if (submission.status === "FAILED" || submission.status === "CANCELLED") {
			return false;
		}

		return submission.message.inputResponse?.requestId === requestId;
	});
}

function questionResponseIds(
	submissions: readonly BuilderSubmission[],
): ReadonlySet<string> {
	return new Set(
		submissions.flatMap((submission) => {
			if (submission.status === "FAILED" || submission.status === "CANCELLED") {
				return [];
			}

			const response = submission.message.inputResponse;
			return response ? [response.requestId] : [];
		}),
	);
}

function retryPromptOf(
	submission: BuilderSubmission | undefined,
): BuilderPrompt | null {
	if (!submission) return null;
	const { message } = submission;
	if (message.inputResponse) return null;
	if (!message.text?.trim()) return null;

	return {
		commandType: submission.commandType,
		message: message.text,
		resources: message.resources,
		attachments: message.attachments,
	};
}

function builderConversationNeedsPolling(conversation: Conversation): boolean {
	return builderConversationIsWorking(conversation);
}

function sharedConversationNeedsPolling(
	conversation: SharedConversation | undefined,
): boolean {
	if (!conversation?.events.length) return false;

	return !eventStreamSettled(conversation.events);
}

function manifestOf(t: TroChuyenMessages, manifest: AgentManifestSummary) {
	return {
		name: manifest.name?.trim() || null,
		trigger:
			manifest.triggers
				.map((trigger) =>
					trigger.type === "MANUAL"
						? t.tacNhanSong.theoYeuCau
						: compactSummary(
								trigger.summary,
								trigger.type === "EVENT"
									? t.tacNhanSong.theoSuKien
									: t.tacNhanSong.theoLich,
							),
				)
				.join(" · ") || t.tacNhanSong.theoYeuCau,
		looksAt: textOf(manifest.dataScope.summary, t.tacNhanSong.phamDocDuoc),
		action: compactSummary(manifest.actions[0]?.summary, t.tacNhanSong.viecLam),
		access: manifest.access,
	};
}

function compactSummary(value: string | undefined, fallback: string): string {
	return textOf(value, fallback).replace(/\s+\([^()]+\)\s*\.?$/, "");
}

function textOf(value: string | undefined, fallback: string): string {
	return value?.trim() ? value : fallback;
}

function loiGuiCua(t: TroChuyenMessages, errorCode: string | null): string {
	const bang = t.man.loiGui;
	const ma = (errorCode ?? "") as keyof typeof bang;
	return Object.hasOwn(bang, ma) ? bang[ma] : t.man.guiHong;
}
