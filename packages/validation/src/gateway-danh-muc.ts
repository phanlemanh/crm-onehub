import { z } from "zod";

const gatewayRate = z
	.union([z.number(), z.string()])
	.transform((value) => Number(value))
	.refine((value) => Number.isFinite(value))
	.nullable()
	.catch(null);

const gatewayModel = z.object({
	id: z.string(),
	name: z.string().catch(""),
	owned_by: z.string().catch(""),
	type: z.string().catch(""),
	tags: z.array(z.json()).catch([]),
	context_window: z.number(),
	pricing: z
		.object({ input: gatewayRate, output: gatewayRate })
		.nullable()
		.catch(null),
});

export type DongDanhMuc = z.infer<typeof gatewayModel>;

const gatewayCatalog = z.object({ data: z.array(z.json()) });

function usable(model: DongDanhMuc): boolean {
	return model.type === "language" && model.tags.includes("tool-use");
}

export function docDanhMucGateway(json: unknown): DongDanhMuc[] | null {
	const than = gatewayCatalog.safeParse(json);
	if (!than.success) return null;
	const dong = than.data.data.flatMap((entry) => {
		const parsed = gatewayModel.safeParse(entry);
		return parsed.success && usable(parsed.data) ? [parsed.data] : [];
	});
	return dong.length === 0 ? null : dong;
}
