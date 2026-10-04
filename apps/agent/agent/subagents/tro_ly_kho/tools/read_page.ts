import { defineTool } from "eve/tools";
import { z } from "zod";
import { hoiCuaPhien } from "../../../lib/tai-lieu-hoi";
import { docTrangKho } from "../../../lib/tai-lieu-kho-doc";

export default defineTool({
	description:
		"Read the approved version in use of one document page by slug. Returns its version number, approval date, check-by date and its text between page markers.",
	inputSchema: z.object({ slug: z.string().min(1).max(160) }),
	async execute({ slug }, ctx) {
		await hoiCuaPhien(ctx);
		return docTrangKho(slug, new Date());
	},
});
