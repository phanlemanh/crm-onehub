import { defineTool } from "eve/tools";
import { z } from "zod";
import { nopBanDeXuat } from "../../../lib/tai-lieu-nop";
import { nguonCuaPhien } from "../../../lib/tai-lieu-phien";

export default defineTool({
	description:
		"Submit the drafted page. Every number, percentage and date that is new in noiDung must appear verbatim inside one of the trichDoan excerpts, and every excerpt must be copied verbatim from the source text. A rejection names the exact number or excerpt to fix.",
	inputSchema: z.object({
		ten: z.string(),
		noiDung: z.string(),
		trichDoan: z.array(z.object({ menhDe: z.string(), trich: z.string() })),
	}),
	async execute(input, ctx) {
		const kq = await nopBanDeXuat(nguonCuaPhien(ctx), ctx.session.id, input);
		if (!kq.ok) throw new Error(kq.loi);
		return { daNop: true, deXuatId: kq.deXuatId };
	},
});
