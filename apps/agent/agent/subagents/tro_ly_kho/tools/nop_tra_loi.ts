import { TAI_LIEU_HOI } from "@crm/validation/tai-lieu-hoi";
import { defineTool } from "eve/tools";
import { z } from "zod";
import { hoiCuaPhien, nopTraLoi } from "../../../lib/tai-lieu-hoi";

const trich = z.object({
	slug: z.string().min(1).max(160),
	phienBan: z.number().int().positive(),
	doan: z.string().min(1).max(1_000),
});

export default defineTool({
	description:
		"Submit the answer once, always with cauHoi set to the question as you received it. loai tra-loi: each sentence with excerpts copied verbatim from read_page. loai khong-biet: no approved page answers the question. A rejection names the exact excerpt, number or version to fix.",
	inputSchema: z.object({
		loai: z.enum(["tra-loi", "khong-biet"]),
		cauHoi: z.string().trim().min(TAI_LIEU_HOI.cauHoi.toiThieu).max(1_500),
		cau: z
			.array(
				z.object({ chu: z.string().min(1).max(600), trich: z.array(trich) }),
			)
			.max(8)
			.optional(),
	}),
	async execute(input, ctx) {
		const hoiId = await hoiCuaPhien(ctx);
		const kq = await nopTraLoi(
			hoiId,
			input.loai === "khong-biet"
				? { loai: "khong-biet", cauHoi: input.cauHoi }
				: { loai: "tra-loi", cauHoi: input.cauHoi, cau: input.cau ?? [] },
			new Date(),
		);
		if (!kq.ok) throw new Error(kq.loi);
		return { hoiId, ketQua: kq.ketQua };
	},
});
