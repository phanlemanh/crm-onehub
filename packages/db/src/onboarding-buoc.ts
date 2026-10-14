import { ghiTuBuoc } from "./buoc-viec";
import type { Prisma } from "./generated/prisma/client";
import type { NguonViec } from "./viec";
import type { DbGhi } from "./zalo-lien-ket";

export type BuocVet = { stepId: string; nhan: string };

export type VetBuocXong<M extends Prisma.InputJsonValue> = {
	xong: (b: BuocVet & { giaoLucXong: string | null }) => M;
	boXong: (b: BuocVet) => M;
	coCongTy: (meta: M) => boolean;
};

export type HangBuocXong = {
	id: string;
	planId: string;
	label: string;
	assigneeId: string | null;
	completedAt: Date | null;
	companyName: string;
};

export type KetBuocXong =
	| { ket: "da-doi"; buoc: HangBuocXong }
	| { ket: "khong-doi"; buoc: HangBuocXong }
	| { ket: "khong-co-buoc" }
	| { ket: "ke-hoach-dong"; buoc: HangBuocXong };

export type DatBuocXongInput = {
	stepId: string;
	done: boolean;
	nguoiId: string;
	now: Date;
	// Kênh ghi vào vết của Việc khi bước mang Việc (bước tạo sau DA3); bước cũ không dùng.
	nguon?: NguonViec;
};

export async function datBuocXong<M extends Prisma.InputJsonValue>(
	tx: DbGhi,
	input: DatBuocXongInput,
	vet: VetBuocXong<M>,
): Promise<KetBuocXong> {
	const goc = await tx.onboardingStep.findUnique({
		where: { id: input.stepId },
		select: {
			id: true,
			planId: true,
			label: true,
			assigneeId: true,
			completedAt: true,
			viecId: true,
			plan: {
				select: {
					closedAt: true,
					companyId: true,
					company: { select: { name: true } },
				},
			},
		},
	});
	if (goc === null) return { ket: "khong-co-buoc" };
	const { plan, viecId, ...con } = goc;
	const buoc: HangBuocXong = { ...con, companyName: plan.company.name };
	if (plan.closedAt !== null) return { ket: "ke-hoach-dong", buoc };
	if ((buoc.completedAt !== null) === input.done) {
		return { ket: "khong-doi", buoc };
	}
	let completedAt = input.done ? input.now : null;
	if (viecId !== null) {
		await ghiTuBuoc(tx, {
			viecId,
			nguoiId: input.nguoiId,
			nguon: input.nguon ?? "web",
			now: input.now,
			lenh: { lenh: "xong", done: input.done },
		});
		const sau = await tx.onboardingStep.findUniqueOrThrow({
			where: { id: buoc.id },
			select: { completedAt: true },
		});
		completedAt = sau.completedAt;
	} else {
		await tx.onboardingStep.update({
			where: { id: buoc.id },
			data: { completedAt },
		});
	}
	const chung = { stepId: buoc.id, nhan: buoc.label };
	const meta = input.done
		? vet.xong({ ...chung, giaoLucXong: buoc.assigneeId })
		: vet.boXong(chung);
	await tx.activity.create({
		data: {
			type: "PLAN_CHANGE",
			occurredAt: input.now,
			planId: buoc.planId,
			companyId: vet.coCongTy(meta) ? plan.companyId : null,
			createdById: input.nguoiId,
			meta,
		},
	});
	return { ket: "da-doi", buoc: { ...buoc, completedAt } };
}
