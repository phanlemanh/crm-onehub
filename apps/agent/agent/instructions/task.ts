import { defineDynamic, defineInstructions } from "eve/instructions";
import { z } from "zod";
import { focusOn, setBudget } from "../lib/focus";
import { TRO_LY_OKR } from "../lib/okr/config";
import { sessionPreamble } from "../lib/preamble";
import { RESEARCH_INSTRUCTIONS } from "../lib/research-instructions";
import { KHONG_GOI_TRO_LY_KHO } from "../lib/tai-lieu-config";
import { attribute, purposeOf } from "../lib/session-purpose";
import { CHI_DAN_ZALO } from "../lib/zalo-chi-dan";
import { ZALO } from "../lib/zalo-config";

const attributeText = z.string().trim().min(1).nullable().catch(null);

const attributeNumber = z
	.union([z.string(), z.number()])
	.transform(Number)
	.refine(Number.isFinite)
	.nullable()
	.catch(null);

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			const purpose = purposeOf(ctx);
			if (purpose === "builder") {
				return builderInstructions(ctx);
			}

			if (purpose === "okr") {
				return defineInstructions({
					markdown: `${TRO_LY_OKR.chiDanGoc}\n\n${KHONG_GOI_TRO_LY_KHO}`,
				});
			}

			if (purpose === ZALO.hoi.purpose) {
				return defineInstructions({ markdown: CHI_DAN_ZALO });
			}

			if (purpose === "may-soan") {
				return defineInstructions({
					markdown:
						`This is one background drafting job for the document library. Call may_soan exactly once and pass the user message unchanged. Do not read, research or write anything yourself. Relay the specialist's one-line summary.\n\n${KHONG_GOI_TRO_LY_KHO}`,
				});
			}

			if (purpose === "kho") {
				return defineInstructions({
					markdown:
						"This is one question to the company document library. Call tro_ly_kho exactly once and pass the user message unchanged. Do not answer it yourself and do not call any other tool. Reply only: đã chuyển.",
				});
			}

			if (purpose === "team-agent") {
				return defineInstructions({
					markdown: `This is one background run of a deployed team agent. Call agent_runner exactly once and pass the run id from your user message. Do not call research tools or perform work yourself. Relay the specialist's structured factual completion summary. Never claim an external action that the specialist did not log.\n\n${KHONG_GOI_TRO_LY_KHO}`,
				});
			}

			const attributes = ctx.session.auth.current?.attributes ?? {};
			const budget = attributeNumber.parse(attributes.budget);
			const kind = attributeText.parse(attributes.taskKind);

			if (budget) setBudget(budget);

			const fieldKeys = attributeText.parse(attributes.fieldKeys);

			const { markdown, focus } = await sessionPreamble(
				{
					contactId: attributeText.parse(attributes.contactId),
					companyId: attributeText.parse(attributes.companyId),
					dealId: attributeText.parse(attributes.dealId),
				},
				{
					dispatched: Boolean(kind),
					kind,
					reason: attributeText.parse(attributes.reason),
					budget,
					fieldKeys: fieldKeys ? fieldKeys.split(",") : null,
				},
			);

			focusOn({ ...focus, sessionId: ctx.session.id, taskKind: kind });

			return defineInstructions({
				markdown: `${RESEARCH_INSTRUCTIONS}\n\n${markdown}\n\n${KHONG_GOI_TRO_LY_KHO}`,
			});
		},
		"turn.started": (_event, ctx) => {
			const purpose = purposeOf(ctx);
			if (purpose === ZALO.hoi.purpose) {
				return defineInstructions({ markdown: CHI_DAN_ZALO });
			}
			return purpose === "builder" ? builderInstructions(ctx) : null;
		},
	},
});

function builderInstructions(ctx: Parameters<typeof purposeOf>[0]) {
	return defineInstructions({
		markdown: `${builderTaskMarkdown(
			attribute(ctx, "commandType"),
			attribute(ctx, "needsTitle") === "true",
		)}\n\n${KHONG_GOI_TRO_LY_KHO}`,
	});
}

export function builderTaskMarkdown(
	commandType: string | null,
	needsTitle = false,
): string {
	const task =
		commandType === "CREATE_AGENT"
			? `This private CRM chat turn is authorized to create or revise an agent. Call agent_builder exactly once and call it immediately; do not ask the user a clarification yourself. Pass the complete request, the conversation's relevant decisions, every tagged resource, and your understanding of any attachment in message only; never pass outputSchema to agent_builder, because it returns its own result. Do not call research tools or mutate CRM records yourself. The specialist inspects authoritative context, asks any essential clarification directly through ask_question, and returns only when the draft is ready. Never retry agent_builder in the same turn. If the specialist fails, explain that the build could not finish and ask the user to try again instead of delegating again. If the specialist returns not_authorized, do not retry it. Tell the user in plain words that building an agent starts from the Create agent action, then answer the question they actually asked. Never show them the reason string, and never mention commandType, subagent, schema or outputSchema. If the specialist returns draft_ready, relay its concise summary and explain that the draft is ready for human review and is not deployed yet. Say that an agent was created only when the specialist returned draft_ready with a versionId.`
			: `This is a private CRM assistant chat. Answer the user's question directly. Use tagged records as scope and use available read-only CRM and research tools when evidence is needed. Use list_deals for pipeline-wide, open-deal, or inactivity questions and follow its pagination until the requested scope is complete. The chat renders list_deals output as a structured deal list. Do not restate or enumerate individual deal rows in prose, bullets, or tables; the structured list is the sole row-level presentation. Give only a concise synthesis, caveats, and useful next actions after the tool results. If one materially necessary decision is missing, call ask_question with one focused follow-up instead of guessing; do not interrupt for optional detail. Do not call agent_builder, create an agent draft, or mutate CRM records on this turn, and never pass outputSchema to agent_builder. Never say that an agent was created on this turn. Agent creation begins only from an explicit request to create or build one. If the specialist returns not_authorized, do not retry it. Tell the user in plain words that building an agent starts from the Create agent action, then answer the question they actually asked. Never show them the reason string, and never mention commandType, subagent, schema or outputSchema. Be concise, distinguish CRM evidence from inference, and say when the CRM does not contain the answer.`;

	return needsTitle
		? `Before any other work, call set_chat_title once. Summarize the user's first message as a polished title of three to seven words in sentence case. Capture the intent, remove slash-command syntax and filler, and do not use quotation marks or ending punctuation.\n\n${task}`
		: task;
}
