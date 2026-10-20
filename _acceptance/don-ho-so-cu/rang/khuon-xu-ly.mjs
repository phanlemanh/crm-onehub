import { z } from "../../../packages/validation/node_modules/zod/index.js";

const chung = {
	slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
	eval: z.string().regex(/^E\d+[a-z]?$/),
	run_id: z.string().regex(/^repin-\d{8}T\d{6}Z-\d+$/),
	ly_do: z.string().trim().min(1),
};

const pr = z.object({ number: z.number().int().positive(), headRefName: z.string().optional() });

export const dongXuLy = z.discriminatedUnion("cach", [
	z.object({
		...chung,
		cach: z.literal("sua-thuoc"),
		commit_sua: z.string().regex(/^[0-9a-f]{40}$/),
		tep_thuoc: z.array(z.string().min(1)).min(1),
		duong_tinh: z.object({ log: z.string().min(1), ma: z.literal(0) }),
		tiem_do: z.object({ log: z.string().min(1), ma: z.number().int().refine((n) => n !== 0), thong_diep: z.string().min(1) }),
		vong_ky_cho_gop: z.array(pr),
		hoi_375: z.object({ url: z.string().regex(/\/issues\/375#issuecomment-\d+$/), tra_loi: z.string().trim().min(1) }).optional(),
	}),
	z.object({ ...chung, cach: z.literal("loi-kit"), viec: z.string().regex(/^https:\/\/github\.com\/[^/]+\/acceptance-gate-kit\/issues\/\d+$/) }),
	z.object({ ...chung, cach: z.literal("ngoai-pham-vi"), lan_chu: z.string().min(1), viec_phu: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/) }),
	z.object({ ...chung, cach: z.literal("cho-lan-chu"), pr: z.array(pr) }),
]);

export const soXuLy = z.object({ base: z.string().regex(/^[0-9a-f]{40}$/), dong: z.array(dongXuLy) });

export function docSoXuLy(value) {
	const r = soXuLy.safeParse(value);
	if (!r.success) {
		const loi = r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
		throw new Error(`so xu ly sai khuon: ${loi}`);
	}
	return r.data;
}
