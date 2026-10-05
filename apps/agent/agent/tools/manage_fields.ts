import { defineTool } from "eve/tools";
import { z } from "zod";
import { createField, updateFieldBrief } from "../lib/fields";
import { FIELDS_AGENT } from "../lib/fields-config";
import {
	ghiDoiTruong,
	type LyDoTuChoi,
	quyenDoiTruong,
} from "../lib/quyen-truong";
import { assertNotZaloQuestion } from "../lib/session-purpose";

export default defineTool({
	description:
		"Add a custom field to a record type, or change what a field's brief tells you to look for. Use it when a rep asks the CRM to start tracking something it has no field for. The brief is the whole instruction you will be working from later, so write it the way you would want to read it.",
	inputSchema: z.object({
		action: z.enum(["create", "update-brief"]),
		entity: z.enum(["COMPANY", "CONTACT", "DEAL"]),
		label: z
			.string()
			.optional()
			.describe("What a rep should see. Required when creating."),
		key: z
			.string()
			.optional()
			.describe("Which field to change. Required when updating a brief."),
		type: z
			.enum([
				"TEXT",
				"LONG_TEXT",
				"NUMBER",
				"DATE",
				"CHECKBOX",
				"SELECT",
				"URL",
				"EMAIL",
				"PHONE",
				"USER",
			])
			.optional()
			.describe("Required when creating."),
		options: z
			.array(z.string())
			.optional()
			.describe("The fixed list, when the type is SELECT."),
		agentBrief: z
			.string()
			.optional()
			.describe(
				"What would count as an answer, and where to look. Empty means you work from the label and type alone.",
			),
		agentFilled: z
			.boolean()
			.optional()
			.describe("False hands the field back to the rep entirely."),
	}),
	async execute(input, ctx) {
		assertNotZaloQuestion(ctx);
		const quyen = await quyenDoiTruong(ctx);
		const ghi = (lyDo?: LyDoTuChoi) =>
			ghiDoiTruong(ctx.session.id, {
				hanhDong: input.action,
				vai: quyen.vai,
				ketQua: lyDo ? "tu-choi" : "lam",
				lyDo,
				entity: input.entity,
				key: input.key,
			});

		if (!quyen.cho) {
			await ghi("quyen");
			return input.action === "create"
				? { created: false, reason: FIELDS_AGENT.tuChoi }
				: { updated: false, reason: FIELDS_AGENT.tuChoi };
		}

		if (input.action === "create") {
			if (!input.label || !input.type) {
				await ghi("khong-ghi-duoc");
				return {
					created: false,
					reason: "Creating a field needs both a label and a type.",
				};
			}

			const tao = await createField({
				entity: input.entity,
				label: input.label,
				type: input.type,
				options: input.options,
				agentBrief: input.agentBrief,
			});
			await ghi("created" in tao ? "khong-ghi-duoc" : undefined);
			return tao;
		}

		if (!input.key) {
			await ghi("khong-ghi-duoc");
			return {
				updated: false,
				reason: "Changing a brief needs the field key.",
			};
		}

		const doi = await updateFieldBrief({
			entity: input.entity,
			key: input.key,
			agentBrief: input.agentBrief ?? null,
			agentFilled: input.agentFilled,
		});
		await ghi("updated" in doi ? "khong-ghi-duoc" : undefined);
		return doi;
	},
});
