import { defineTool } from "eve/tools";
import { z } from "zod";
import { sensitiveWrite } from "../lib/approval";
import { archiveField } from "../lib/fields";
import { FIELDS_AGENT } from "../lib/fields-config";
import { ghiDoiTruong, quyenDoiTruong } from "../lib/quyen-truong";
import { assertNotZaloQuestion } from "../lib/session-purpose";

export default defineTool({
	description:
		"Archive a custom field. It leaves every sheet and table and stops being filled; the values already recorded are kept. A schema change every rep will see, so it needs a person.",
	inputSchema: z.object({
		entity: z.enum(["COMPANY", "CONTACT", "DEAL"]),
		key: z.string().describe("The field's key, as list_fields reports it."),
	}),
	approval: sensitiveWrite(
		"Say which field you would archive and let a rep do it from the Fields sheet.",
	),
	async execute(input, ctx) {
		assertNotZaloQuestion(ctx);
		const quyen = await quyenDoiTruong(ctx);
		const ghi = (ketQua: "lam" | "tu-choi") =>
			ghiDoiTruong(ctx.session.id, {
				hanhDong: "archive",
				vai: quyen.vai,
				ketQua,
				entity: input.entity,
				key: input.key,
			});

		if (!quyen.cho) {
			await ghi("tu-choi");
			return { archived: false, reason: FIELDS_AGENT.tuChoi };
		}

		const ket = await archiveField(input);
		await ghi("lam");
		return ket;
	},
});
