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

const NGANH = "Software";
const CHUC_DANH = "IT Director";
const DAU = "Vat Thu ";

export async function dat() {
	const moc = `${process.pid}-${Date.now().toString(36)}`;

	const nguoi = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
	if (!nguoi) {
		throw new Error(
			"KHONG DUNG DUOC TIEN DE: khong nguoi dung nao trong co so du lieu",
		);
	}

	const congTy = await db.company.create({
		data: {
			name: `${DAU}${moc}`,
			description: GIOI_THIEU,
			industry: NGANH,
			city: "London",
			country: "United Kingdom",
			enrichmentStatus: "COMPLETE",
		},
	});

	const trong = await db.company.create({
		data: {
			name: `${DAU}Trong ${moc}`,
			description: null,
			industry: null,
			enrichmentStatus: "PENDING",
		},
	});

	const caNhan = await db.contact.create({
		data: {
			firstName: "Quinn",
			lastName: `Vatthu${moc.slice(-6)}`,
			title: CHUC_DANH,
			companyId: congTy.id,
			brief: { create: { narrative: TOM_TAT, sections: KHOI, score: 0.9 } },
		},
	});

	const thoaThuan = await db.deal.create({
		data: {
			name: `${DAU}Thoa Thuan ${moc}`,
			companyId: congTy.id,
			ownerId: nguoi.id,
			stage: "QUALIFIED_TO_BUY",
		},
	});

	const doiGiaiDoan = await db.activity.create({
		data: {
			type: "STAGE_CHANGE",
			subject: "Stage changed",
			createdById: nguoi.id,
			companyId: congTy.id,
			dealId: thoaThuan.id,
			meta: { from: "DEMO_BOOKED", to: "QUALIFIED_TO_BUY" },
		},
	});

	return {
		moc,
		congTy: {
			id: congTy.id,
			ten: congTy.name,
			gioiThieu: GIOI_THIEU,
			nganh: NGANH,
			diaDanh: "London, United Kingdom",
		},
		caNhan: { id: caNhan.id, tomTat: TOM_TAT, chucDanh: CHUC_DANH },
		trong: { id: trong.id, ten: trong.name },
		doiGiaiDoan: {
			id: doiGiaiDoan.id,
			dealId: thoaThuan.id,
			companyId: congTy.id,
			meta: { from: "DEMO_BOOKED", to: "QUALIFIED_TO_BUY" },
		},
		don: async () => {
			await db.activity.deleteMany({ where: { id: doiGiaiDoan.id } });
			await db.deal.deleteMany({ where: { id: thoaThuan.id } });
			await db.contactBrief.deleteMany({ where: { contactId: caNhan.id } });
			await db.contact.deleteMany({ where: { id: caNhan.id } });
			await db.company.deleteMany({
				where: { id: { in: [congTy.id, trong.id] } },
			});
		},
	};
}

export async function donRac() {
	const rac = await db.company.findMany({
		where: { name: { startsWith: DAU } },
		select: { id: true },
	});
	if (rac.length === 0) return 0;
	const ids = rac.map((r) => r.id);
	const thoaThuan = await db.deal.findMany({
		where: { companyId: { in: ids } },
		select: { id: true },
	});
	const caNhan = await db.contact.findMany({
		where: { companyId: { in: ids } },
		select: { id: true },
	});
	await db.activity.deleteMany({ where: { companyId: { in: ids } } });
	await db.deal.deleteMany({
		where: { id: { in: thoaThuan.map((d) => d.id) } },
	});
	await db.contactBrief.deleteMany({
		where: { contactId: { in: caNhan.map((c) => c.id) } },
	});
	await db.contact.deleteMany({
		where: { id: { in: caNhan.map((c) => c.id) } },
	});
	await db.company.deleteMany({ where: { id: { in: ids } } });
	return rac.length;
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
