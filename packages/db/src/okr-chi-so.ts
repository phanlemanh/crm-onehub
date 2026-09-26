import type { Db } from "./client";
import type { OkrNguonKr, Prisma } from "./generated/prisma/client";
import {
	type BacGhiDanh,
	CHI_SO_OKR,
	type DinhNghiaDem,
	type NguonDem,
	type PhamViDem,
} from "./okr-chi-so-danh-muc";
import { OKR_SO } from "./okr-so-config";
import { dauNgayVN, ngayVN } from "./onboarding-nhac";
import { WORKSPACE_ID } from "./workspace";

type Tx = Prisma.TransactionClient;
type Doc = Db | Tx;

export type KhoangKy = { tu: Date; den: Date };

export type BanGhiDong = {
	loai: "deal" | "contact" | "plan" | "email";
	id: string;
	ten: string;
	ngay: string;
	moRef: { kind: "deal" | "contact" | "plan"; id: string } | null;
};

export type DocNguon = (row: OkrNguonKr) => NguonDem;

type CotBac = "accountAt" | "courseAt" | "activeAt" | "dealAt";

export type DieuKien =
	| {
			bang: "deal";
			cot: "closedAt" | "createdAt";
			where: Prisma.DealWhereInput;
			orderBy: Prisma.DealOrderByWithRelationInput;
	  }
	| { bang: "campaignTouch"; where: Prisma.CampaignTouchWhereInput }
	| { bang: "onboardingStep"; where: Prisma.OnboardingStepWhereInput }
	| {
			bang: "onboardingEnrollment";
			cot: CotBac;
			where: Prisma.OnboardingEnrollmentWhereInput;
			orderBy: Prisma.OnboardingEnrollmentOrderByWithRelationInput;
	  }
	| { bang: "formSubmission"; where: Prisma.FormSubmissionWhereInput }
	| { bang: "emailMessage"; where: Prisma.EmailMessageWhereInput };

const ngayCua = (d: Date) => d.toISOString().slice(0, 10);
const dauNgay = (ngay: string) => dauNgayVN(new Date(`${ngay}T05:00:00Z`));
const ngaySau = (ngay: string) => {
	const d = new Date(`${ngay}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 1);
	return ngayCua(d);
};

export function khoangKy(startsOn: Date, endsOn: Date, ngay: string): KhoangKy {
	const cuoi = ngay < ngayCua(endsOn) ? ngay : ngayCua(endsOn);
	return { tu: dauNgay(ngayCua(startsOn)), den: dauNgay(ngaySau(cuoi)) };
}

async function nguoiCua(
	db: Doc,
	where: Prisma.OrgPlacementWhereInput,
): Promise<string[]> {
	const rows = await db.orgPlacement.findMany({
		where,
		select: { userId: true },
	});
	return rows.map((r) => r.userId);
}

async function nguoiTrong(db: Doc, pv: PhamViDem): Promise<string[] | null> {
	switch (pv.kieu) {
		case "toan-cong-ty":
			return null;
		case "nguoi":
			return [pv.id];
		case "phong-ban":
			return nguoiCua(db, { primaryDepartmentId: pv.id });
		case "bo-phan":
			return nguoiCua(db, { primaryDepartment: { divisionId: pv.id } });
	}
}

function phamViBuoc(pv: PhamViDem): Prisma.OnboardingStepWhereInput {
	switch (pv.kieu) {
		case "toan-cong-ty":
			return {};
		case "phong-ban":
			return { departmentId: pv.id };
		case "bo-phan":
			return { department: { divisionId: pv.id } };
		case "nguoi":
			return { assigneeId: pv.id };
	}
}

type DieuKienBac = {
	cot: CotBac;
	where: Prisma.OnboardingEnrollmentWhereInput;
	orderBy: Prisma.OnboardingEnrollmentOrderByWithRelationInput;
};

function theoBac(
	bac: BacGhiDanh,
	trongKy: Prisma.DateTimeNullableFilter,
): DieuKienBac {
	switch (bac) {
		case "tai-khoan":
			return {
				cot: "accountAt",
				where: { accountAt: trongKy },
				orderBy: { accountAt: "desc" },
			};
		case "khoa-hoc":
			return {
				cot: "courseAt",
				where: { courseAt: trongKy },
				orderBy: { courseAt: "desc" },
			};
		case "hoat-dong":
			return {
				cot: "activeAt",
				where: { activeAt: trongKy },
				orderBy: { activeAt: "desc" },
			};
		case "giao-dich-dau":
			return {
				cot: "dealAt",
				where: { dealAt: trongKy },
				orderBy: { dealAt: "desc" },
			};
	}
}

async function emailThanhVien(db: Doc, ng: string[] | null): Promise<string[]> {
	const rows = await db.member.findMany({
		where: {
			organizationId: WORKSPACE_ID,
			userId: ng ? { in: ng } : undefined,
		},
		select: { user: { select: { email: true } } },
	});
	return [...new Set(rows.map((r) => r.user.email.toLowerCase()))];
}

export async function dieuKienChiSo(
	db: Doc,
	dn: DinhNghiaDem,
	k: KhoangKy,
): Promise<DieuKien> {
	const trongKy = { gte: k.tu, lt: k.den };
	if (dn.chiSo === "buoc-xong-dung-han") {
		return {
			bang: "onboardingStep",
			where: {
				completedAt: { ...trongKy, lte: db.onboardingStep.fields.dueAt },
				...phamViBuoc(dn.phamVi),
			},
		};
	}
	const ng = await nguoiTrong(db, dn.phamVi);
	switch (dn.chiSo) {
		case "thoa-thuan-chot-duoc":
			return {
				bang: "deal",
				cot: "closedAt",
				where: {
					archivedAt: null,
					stage: "CLOSED_WON",
					closedAt: trongKy,
					ownerId: ng ? { in: ng } : undefined,
				},
				orderBy: { closedAt: "desc" },
			};
		case "thoa-thuan-moi":
			return {
				bang: "deal",
				cot: "createdAt",
				where: {
					archivedAt: null,
					createdAt: trongKy,
					ownerId: ng ? { in: ng } : undefined,
				},
				orderBy: { createdAt: "desc" },
			};
		case "goi-hen-duoc":
			return {
				bang: "campaignTouch",
				where: {
					outcome: "MEETING",
					createdAt: trongKy,
					createdById: ng ? { in: ng } : undefined,
				},
			};
		case "ghi-danh-dat-bac": {
			if (!dn.bac) throw new Error("Chỉ số ghi danh cần bậc");
			const b = theoBac(dn.bac, trongKy);
			return {
				bang: "onboardingEnrollment",
				cot: b.cot,
				where: {
					...b.where,
					contact: { archivedAt: null },
					plan: ng ? { ownerId: { in: ng } } : undefined,
				},
				orderBy: b.orderBy,
			};
		}
		case "form-thanh-ca-nhan":
			return {
				bang: "formSubmission",
				where: {
					contactId: { not: null },
					filedAt: trongKy,
					contact: {
						archivedAt: null,
						ownerId: ng ? { in: ng } : undefined,
					},
				},
			};
		case "email-gui-ra": {
			const emails = await emailThanhVien(db, ng);
			if (emails.length === 0) {
				return { bang: "emailMessage", where: { id: { in: [] } } };
			}
			const tu: Prisma.EmailMessageWhereInput[] = emails.map((e) => ({
				fromEmail: { equals: e, mode: "insensitive" },
			}));
			return { bang: "emailMessage", where: { sentAt: trongKy, OR: tu } };
		}
	}
}

export async function demChiSo(
	db: Doc,
	dn: DinhNghiaDem,
	k: KhoangKy,
): Promise<number> {
	const dk = await dieuKienChiSo(db, dn, k);
	switch (dk.bang) {
		case "deal":
			return db.deal.count({ where: dk.where });
		case "campaignTouch":
			return db.campaignTouch.count({ where: dk.where });
		case "onboardingStep":
			return db.onboardingStep.count({ where: dk.where });
		case "onboardingEnrollment":
			return db.onboardingEnrollment.count({ where: dk.where });
		case "formSubmission":
			return db.formSubmission.count({ where: dk.where });
		case "emailMessage":
			return db.emailMessage.count({ where: dk.where });
	}
}

const tenCaNhan = (c: { firstName: string; lastName: string | null }) =>
	[c.firstName, c.lastName].filter(Boolean).join(" ");

const ngayCuaDong = (d: Date | null) => (d ? ngayVN(d) : "");

export async function banGhiChiSo(
	db: Doc,
	dn: DinhNghiaDem,
	k: KhoangKy,
	trang: { bo: number; lay: number },
): Promise<{ tong: number; dong: BanGhiDong[] }> {
	const dk = await dieuKienChiSo(db, dn, k);
	const loai = CHI_SO_OKR[dn.chiSo].banGhi;
	const cua = {
		skip: trang.bo,
		take: Math.min(trang.lay, OKR_SO.banGhi.toiDaTrang),
	};
	const caNhan = { select: { id: true, firstName: true, lastName: true } };
	switch (dk.bang) {
		case "deal": {
			const tong = await db.deal.count({ where: dk.where });
			const rows = await db.deal.findMany({
				where: dk.where,
				orderBy: [dk.orderBy, { id: "asc" }],
				select: { id: true, name: true, closedAt: true, createdAt: true },
				...cua,
			});
			return {
				tong,
				dong: rows.map((r) => ({
					loai,
					id: r.id,
					ten: r.name,
					ngay: ngayCuaDong(r[dk.cot]),
					moRef: { kind: "deal", id: r.id },
				})),
			};
		}
		case "campaignTouch": {
			const tong = await db.campaignTouch.count({ where: dk.where });
			const rows = await db.campaignTouch.findMany({
				where: dk.where,
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
				select: {
					id: true,
					createdAt: true,
					contact: caNhan,
					campaign: { select: { name: true } },
				},
				...cua,
			});
			return {
				tong,
				dong: rows.map((r) => ({
					loai,
					id: r.id,
					ten: `${tenCaNhan(r.contact)} · ${r.campaign.name}`,
					ngay: ngayVN(r.createdAt),
					moRef: { kind: "contact", id: r.contact.id },
				})),
			};
		}
		case "onboardingStep": {
			const tong = await db.onboardingStep.count({ where: dk.where });
			const rows = await db.onboardingStep.findMany({
				where: dk.where,
				orderBy: [{ completedAt: "desc" }, { id: "asc" }],
				select: {
					id: true,
					label: true,
					completedAt: true,
					plan: { select: { id: true, company: { select: { name: true } } } },
				},
				...cua,
			});
			return {
				tong,
				dong: rows.map((r) => ({
					loai,
					id: r.id,
					ten: `${r.plan.company.name} · ${r.label}`,
					ngay: ngayCuaDong(r.completedAt),
					moRef: { kind: "plan", id: r.plan.id },
				})),
			};
		}
		case "onboardingEnrollment": {
			const tong = await db.onboardingEnrollment.count({ where: dk.where });
			const rows = await db.onboardingEnrollment.findMany({
				where: dk.where,
				orderBy: [dk.orderBy, { id: "asc" }],
				select: {
					id: true,
					accountAt: true,
					courseAt: true,
					activeAt: true,
					dealAt: true,
					contact: caNhan,
				},
				...cua,
			});
			return {
				tong,
				dong: rows.map((r) => ({
					loai,
					id: r.id,
					ten: tenCaNhan(r.contact),
					ngay: ngayCuaDong(r[dk.cot]),
					moRef: { kind: "contact", id: r.contact.id },
				})),
			};
		}
		case "formSubmission": {
			const tong = await db.formSubmission.count({ where: dk.where });
			const rows = await db.formSubmission.findMany({
				where: dk.where,
				orderBy: [{ filedAt: "desc" }, { id: "asc" }],
				select: { id: true, filedAt: true, contact: caNhan },
				...cua,
			});
			return {
				tong,
				dong: rows.map((r) => ({
					loai,
					id: r.id,
					ten: r.contact ? tenCaNhan(r.contact) : "",
					ngay: ngayCuaDong(r.filedAt),
					moRef: r.contact ? { kind: "contact", id: r.contact.id } : null,
				})),
			};
		}
		case "emailMessage": {
			const tong = await db.emailMessage.count({ where: dk.where });
			const rows = await db.emailMessage.findMany({
				where: dk.where,
				orderBy: [{ sentAt: "desc" }, { id: "asc" }],
				select: {
					id: true,
					subject: true,
					sentAt: true,
					thread: { select: { contactId: true } },
				},
				...cua,
			});
			return {
				tong,
				dong: rows.map((r) => ({
					loai,
					id: r.id,
					ten: r.subject ?? "",
					ngay: ngayVN(r.sentAt),
					moRef: r.thread.contactId
						? { kind: "contact", id: r.thread.contactId }
						: null,
				})),
			};
		}
	}
}

export async function chupKrCrm(
	db: Db,
	keyResultId: string,
	ngay: string,
	docNguon: DocNguon,
): Promise<{ ghi: number; giaTri: number | null }> {
	const kr = await db.okrKeyResult.findUnique({
		where: { id: keyResultId },
		select: {
			source: true,
			nguonMay: true,
			objective: {
				select: { cycle: { select: { startsOn: true, endsOn: true } } },
			},
		},
	});
	if (!kr?.nguonMay) return { ghi: 0, giaTri: null };
	const nguon = docNguon(kr.nguonMay);
	if (!nguon.chiSo || !nguon.phamVi) return { ghi: 0, giaTri: null };
	const dn: DinhNghiaDem = {
		chiSo: nguon.chiSo,
		phamVi: nguon.phamVi,
		bac: nguon.bac ?? undefined,
	};
	const { startsOn, endsOn } = kr.objective.cycle;
	const giaTri = await demChiSo(db, dn, khoangKy(startsOn, endsOn, ngay));
	const ngayDb = new Date(`${ngay}T00:00:00Z`);
	const ghi = await db.$transaction(async (tx) => {
		const moi = await tx.okrSoChup.createMany({
			data: [
				{
					keyResultId,
					ngay: ngayDb,
					giaTri,
					nguon: "crm",
					chiSo: dn.chiSo,
					phamVi: dn.phamVi,
					bac: dn.bac ?? null,
				},
			],
			skipDuplicates: true,
		});
		if (moi.count > 0 && kr.source === "crm") {
			const sauHon = await tx.okrSoChup.count({
				where: { keyResultId, nguon: "crm", ngay: { gt: ngayDb } },
			});
			if (sauHon === 0) {
				await tx.okrKeyResult.update({
					where: { id: keyResultId },
					data: { currentValue: giaTri },
				});
			}
		}
		return moi.count;
	});
	return { ghi, giaTri };
}
