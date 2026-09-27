import type { Prisma } from "@crm/db";
import type { SendFn } from "eve/channels";
import { z } from "zod";

type BuilderMessageParts = Extract<Parameters<SendFn>[0], readonly unknown[]>;

const trimmedText = z.string().trim().catch("");

const builderInputResponse = z
	.object({
		requestId: trimmedText,
		optionId: trimmedText,
		text: trimmedText,
	})
	.catch({ requestId: "", optionId: "", text: "" });

const builderSubmissionMessage = z
	.object({
		text: z.string().catch(""),
		resources: z
			.array(z.object({ label: z.string().catch("") }).catch({ label: "" }))
			.catch([]),
		inputResponse: builderInputResponse,
	})
	.catch({
		text: "",
		resources: [],
		inputResponse: { requestId: "", optionId: "", text: "" },
	});

export type BuilderDeliveryAttachment = {
	name: string;
	mediaType: string;
	content: Uint8Array;
};

export function builderDeliveryMessage(
	submissionId: string,
	value: Prisma.JsonValue,
	attachments: readonly BuilderDeliveryAttachment[] = [],
): Parameters<SendFn>[0] {
	const message = builderSubmissionMessage.parse(value);
	const { requestId, optionId, text: responseText } = message.inputResponse;
	if (requestId && (optionId || responseText)) {
		return {
			inputResponses: [
				{
					requestId,
					...(optionId ? { optionId } : { text: responseText }),
				},
			],
		};
	}

	const labels = message.resources
		.map((resource) => resource.label)
		.filter(Boolean);
	const context = [
		`Submission id: ${submissionId}`,
		message.resources.length > 0
			? `Tagged resources: ${labels.join(", ")}`
			: null,
	]
		.filter(Boolean)
		.join("\n");
	const parts: BuilderMessageParts = [
		{ type: "text", text: `${context}\n\n${message.text}` },
	];

	for (const attachment of attachments) {
		parts.push({
			type: "file",
			data: attachment.content,
			mediaType: attachment.mediaType,
			filename: attachment.name,
		});
	}

	return parts;
}
