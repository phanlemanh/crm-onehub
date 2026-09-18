import { db } from "../../../packages/db/src/client.ts";

const GIOI_THIEU =
	"One Mount is a Vietnamese technology and innovation group that builds comprehensive digital ecosystems for retail, banking and property services.";

const TOM_TAT =
	"Seasoned partnerships lead with a decade of experience building distribution networks across Southeast Asia, currently focused on retail technology adoption.";

const KHOI = {
	currentRole: "Head of Partnerships",
	tenure: "3 years",
	seniority: "Director",
	function: "Business Development",
};

const TEN_CONG_TY_TRONG = "Rang Khai Tieng — cong ty chua giau du lieu";

export async function dat() {
	const congTy = await db.company.findFirst({
		where: { industry: { not: null }, archivedAt: null },
		orderBy: { name: "asc" },
	});
	if (!congTy) {
		throw new Error(
			"KHONG DUNG DUOC TIEN DE: khong cong ty nao co truong nganh trong co so du lieu",
		);
	}

	const moTaCu = congTy.description;
	await db.company.update({
		where: { id: congTy.id },
		data: { description: GIOI_THIEU },
	});

	const caNhan = await db.contact.findFirst({
		where: { archivedAt: null },
		orderBy: { createdAt: "asc" },
	});
	if (!caNhan) {
		throw new Error(
			"KHONG DUNG DUOC TIEN DE: khong ca nhan nao trong co so du lieu",
		);
	}

	const tomTatCu = await db.contactBrief.findUnique({
		where: { contactId: caNhan.id },
	});
	await db.contactBrief.upsert({
		where: { contactId: caNhan.id },
		create: {
			contactId: caNhan.id,
			narrative: TOM_TAT,
			sections: KHOI,
			score: 0.9,
		},
		update: { narrative: TOM_TAT, sections: KHOI },
	});

	const trong = await db.company.create({
		data: {
			name: TEN_CONG_TY_TRONG,
			description: null,
			industry: null,
			enrichmentStatus: "PENDING",
		},
	});

	const doiGiaiDoan = await db.activity.findFirst({
		where: { type: "STAGE_CHANGE" },
		orderBy: { createdAt: "desc" },
		include: { deal: true, company: true },
	});

	return {
		congTy: { id: congTy.id, ten: congTy.name, gioiThieu: GIOI_THIEU },
		caNhan: { id: caNhan.id, tomTat: TOM_TAT },
		trong: { id: trong.id, ten: trong.name },
		doiGiaiDoan: doiGiaiDoan
			? {
					id: doiGiaiDoan.id,
					companyId: doiGiaiDoan.companyId,
					dealId: doiGiaiDoan.dealId,
					meta: doiGiaiDoan.meta,
				}
			: null,
		don: async () => {
			await db.company.delete({ where: { id: trong.id } });
			await db.company.update({
				where: { id: congTy.id },
				data: { description: moTaCu },
			});
			if (tomTatCu) {
				await db.contactBrief.update({
					where: { contactId: caNhan.id },
					data: { narrative: tomTatCu.narrative },
				});
			} else {
				await db.contactBrief.delete({ where: { contactId: caNhan.id } });
			}
		},
	};
}

export async function datDuGiaiDoan() {
	const { DealStage } = await import(
		"../../../packages/db/src/generated/prisma/enums.ts"
	);
	const duEnum = Object.values(DealStage);
	const dangCo = new Set(
		(await db.deal.findMany({ select: { stage: true } })).map((d) => d.stage),
	);
	const thieu = duEnum.filter((m) => !dangCo.has(m));
	const daDoi = [];

	for (const ma of thieu) {
		const muon = await db.deal.findFirst({
			where: { stage: { notIn: thieu } },
			orderBy: { createdAt: "desc" },
			skip: daDoi.length,
		});
		if (!muon) break;
		daDoi.push({ id: muon.id, giaiDoanCu: muon.stage });
		await db.deal.update({ where: { id: muon.id }, data: { stage: ma } });
	}

	return {
		thieu,
		daDoi,
		don: async () => {
			for (const d of daDoi) {
				await db.deal.update({
					where: { id: d.id },
					data: { stage: d.giaiDoanCu },
				});
			}
		},
	};
}
