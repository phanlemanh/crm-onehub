import { z } from "zod";

const ma = z.string().trim().min(1).max(120);
const nhan = z.string().trim().min(1).max(200);
const ten = z.string().trim().min(1).max(200);
const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const buoc = { stepId: ma, nhan };

export const onboardingActivityMeta = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("buoc.giao"),
		...buoc,
		tu: ma.nullable(),
		tuTen: ten.nullable(),
		den: ma.nullable(),
		denTen: ten.nullable(),
	}),
	z.object({ kind: z.literal("buoc.xong"), ...buoc }),
	z.object({ kind: z.literal("buoc.boXong"), ...buoc }),
	z.object({ kind: z.literal("buoc.doiHan"), ...buoc, tu: ngay, den: ngay }),
	z.object({ kind: z.literal("buoc.them"), ...buoc }),
	z.object({ kind: z.literal("buoc.bo"), ...buoc }),
	z.object({
		kind: z.literal("keHoach.doiCamTrich"),
		tu: ma,
		tuTen: ten,
		den: ma,
		denTen: ten,
	}),
	z.object({ kind: z.literal("keHoach.dong") }),
	z.object({ kind: z.literal("keHoach.moLai") }),
]);

export type OnboardingActivityMeta = z.infer<typeof onboardingActivityMeta>;

export type OnboardingActivityKind = OnboardingActivityMeta["kind"];

export const ONBOARDING_ACTIVITY_KINDS = [
	"buoc.giao",
	"buoc.xong",
	"buoc.boXong",
	"buoc.doiHan",
	"buoc.them",
	"buoc.bo",
	"keHoach.doiCamTrich",
	"keHoach.dong",
	"keHoach.moLai",
] as const satisfies readonly OnboardingActivityKind[];

type Cua<K extends OnboardingActivityKind> = Omit<
	Extract<OnboardingActivityMeta, { kind: K }>,
	"kind"
>;

export const vet = {
	buocGiao: (v: Cua<"buoc.giao">) => ({ kind: "buoc.giao", ...v }) as const,
	buocXong: (v: Cua<"buoc.xong">) => ({ kind: "buoc.xong", ...v }) as const,
	buocBoXong: (v: Cua<"buoc.boXong">) =>
		({ kind: "buoc.boXong", ...v }) as const,
	buocDoiHan: (v: Cua<"buoc.doiHan">) =>
		({ kind: "buoc.doiHan", ...v }) as const,
	buocThem: (v: Cua<"buoc.them">) => ({ kind: "buoc.them", ...v }) as const,
	buocBo: (v: Cua<"buoc.bo">) => ({ kind: "buoc.bo", ...v }) as const,
	keHoachDoiCamTrich: (v: Cua<"keHoach.doiCamTrich">) =>
		({ kind: "keHoach.doiCamTrich", ...v }) as const,
	keHoachDong: () => ({ kind: "keHoach.dong" }) as const,
	keHoachMoLai: () => ({ kind: "keHoach.moLai" }) as const,
};

export function parseOnboardingActivityMeta(
	value: unknown,
): OnboardingActivityMeta {
	const ket = onboardingActivityMeta.safeParse(value);
	if (!ket.success) {
		throw new Error(
			`vết kế hoạch: ${ket.error.issues
				.map((loi) =>
					loi.path.length > 0
						? `${loi.path.join(".")} ${loi.message}`
						: loi.message,
				)
				.join("; ")}`,
		);
	}
	return ket.data;
}

export function vetCoCongTy(meta: OnboardingActivityMeta): boolean {
	return meta.kind.startsWith("keHoach.");
}
