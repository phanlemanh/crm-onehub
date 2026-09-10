import { z } from "zod";

const optionalText = z.string().optional().catch(undefined);

const builderQuestionOption = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	description: optionalText,
	style: z.enum(["danger", "default", "primary"]).optional().catch(undefined),
});

export type BuilderQuestionOption = z.infer<typeof builderQuestionOption>;

const askedQuestion = z
	.object({
		kind: z.literal("question"),
		requestId: z.string().min(1),
		prompt: z.string().min(1),
		display: z
			.enum(["confirmation", "select", "text"])
			.optional()
			.catch(undefined),
		options: z
			.array(builderQuestionOption.nullable().catch(null))
			.catch([])
			.transform((entries) => entries.filter((entry) => entry !== null)),
		allowFreeform: z.boolean().optional().catch(undefined),
	})
	.transform((question) => ({
		kind: question.kind,
		requestId: question.requestId,
		prompt: question.prompt,
		display: question.display,
		options: question.options,
		allowFreeform:
			question.allowFreeform === true ||
			question.display === "text" ||
			question.options.length === 0,
	}));

export type BuilderQuestion = z.infer<typeof askedQuestion>;

export const builderQuestion = askedQuestion.nullable().catch(null);

export const BUILDER_AUTHORIZATION_KEY = "builderAuthorized";

const authorizationEnvelope = z.object({
	[BUILDER_AUTHORIZATION_KEY]: z.boolean(),
});

export type BuilderAuthorizationFlag = z.infer<typeof authorizationEnvelope>;

export function buildPendingInputRequest<T extends object>(
	question: T,
	authorized: boolean,
): T & BuilderAuthorizationFlag {
	if (!askedQuestion.safeParse(question).success) {
		throw new Error("Builder input request is not a usable question.");
	}
	return { ...question, [BUILDER_AUTHORIZATION_KEY]: authorized };
}

export function commandTypeFromAuthorization(
	value: unknown,
): "CHAT" | "CREATE_AGENT" {
	const parsed = authorizationEnvelope.safeParse(value);
	if (!parsed.success) return "CHAT";
	return parsed.data[BUILDER_AUTHORIZATION_KEY] ? "CREATE_AGENT" : "CHAT";
}
