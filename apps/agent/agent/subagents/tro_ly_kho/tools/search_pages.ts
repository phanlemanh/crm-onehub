import { defineTool } from "eve/tools";
import { z } from "zod";
import { ghiGanNhat, hoiCuaPhien } from "../../../lib/tai-lieu-hoi";
import { timTrangKho } from "../../../lib/tai-lieu-kho-doc";

export default defineTool({
	description:
		"Search approved document pages in use by words, with or without Vietnamese diacritics. Returns slug, title, version and a short excerpt for each matching page.",
	inputSchema: z.object({ query: z.string().min(1).max(200) }),
	async execute({ query }, ctx) {
		const hoiId = await hoiCuaPhien(ctx);
		const rows = await timTrangKho(query);
		await ghiGanNhat(hoiId, rows);
		return { rows };
	},
});
