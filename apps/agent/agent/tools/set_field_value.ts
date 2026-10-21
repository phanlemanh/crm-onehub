import { defineTool } from "eve/tools";
import { z } from "zod";
import { isAutomated } from "../lib/approval";
import { writeField } from "../lib/fields";
import { focusOn } from "../lib/focus";
import { assertNotZaloQuestion } from "../lib/session-purpose";

export default defineTool({
	description:
		"Set one custom field on one record, when you have read the answer from a source rather than guessed it. The field's brief says what would count — follow it. Call list_fields first if you do not know the key. A field the rep marked manual will refuse. A field that already has a value on the record is not written: it is the rep's, and a background run never replaces it.",
	inputSchema: z.object({
		entity: z.enum(["COMPANY", "CONTACT", "DEAL"]),
		recordId: z.string().describe("The id of the company, contact or deal."),
		key: z
			.string()
			.describe("The field's key, exactly as list_fields reports it."),
		value: z
			.union([z.string(), z.number(), z.boolean(), z.null()])
			.describe(
				"The value. A select takes the option's label, a date takes YYYY-MM-DD, and null clears it.",
			),
		replace: z
			.boolean()
			.optional()
			.describe(
				"Set true only if the rep asked you to in this conversation to change or clear the value already in this field. Never set it on your own finding.",
			),
	}),
	async execute({ entity, recordId, key, value, replace }, ctx) {
		assertNotZaloQuestion(ctx);
		if (entity === "COMPANY") focusOn({ companyId: recordId });
		if (entity === "CONTACT") focusOn({ contactId: recordId });

		return writeField({
			entity,
			recordId,
			key,
			value,
			replace,
			unattended: isAutomated(ctx.session),
		});
	},
});
