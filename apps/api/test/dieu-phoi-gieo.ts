import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID, workspaceSlug } from "@crm/db/workspace";

let dem = 0;

const daGieo = {
	nguoi: [] as string[],
	congTy: [] as string[],
	caNhan: [] as string[],
	boPhan: [] as string[],
};

function duy(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

export async function gieoNguoi() {
	const id = duy("u");
	daGieo.nguoi.push(id);
	const nguoi = await db.user.create({
		data: { id, name: "Nguoi thu nghiem", email: `${id}@thu.test` },
	});
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: DEFAULT_WORKSPACE_NAME,
			slug: workspaceSlug(DEFAULT_WORKSPACE_NAME),
			createdAt: new Date(),
		},
	});
	await db.member.create({
		data: {
			id: `m-${id}`,
			organizationId: WORKSPACE_ID,
			userId: id,
			role: "member",
			createdAt: new Date(),
		},
	});
	return nguoi;
}

export async function gieoCongTy() {
	const congTy = await db.company.create({ data: { name: duy("Cong ty") } });
	daGieo.congTy.push(congTy.id);
	return congTy;
}

export async function gieoCaNhan() {
	const caNhan = await db.contact.create({
		data: { firstName: duy("Ca nhan") },
	});
	daGieo.caNhan.push(caNhan.id);
	return caNhan;
}

export async function gieoBoPhan(viTri = 0) {
	const boPhan = await db.department.create({
		data: { name: duy("Bo phan"), position: viTri },
	});
	daGieo.boPhan.push(boPhan.id);
	return boPhan;
}

export async function donGieo(): Promise<void> {
	const { nguoi, congTy, caNhan, boPhan } = daGieo;
	await db.onboardingPlan.deleteMany({
		where: { OR: [{ companyId: { in: congTy } }, { ownerId: { in: nguoi } }] },
	});
	await db.company.deleteMany({ where: { id: { in: congTy } } });
	await db.contact.deleteMany({ where: { id: { in: caNhan } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
	await db.department.deleteMany({ where: { id: { in: boPhan } } });
	for (const so of Object.values(daGieo)) so.length = 0;
}

export async function gieoKeHoach(input?: { closedAt?: Date | null }) {
	const [congTy, nguoi] = await Promise.all([gieoCongTy(), gieoNguoi()]);
	return db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId: nguoi.id,
			startedAt: new Date(),
			targetDays: 30,
			closedAt: input?.closedAt ?? null,
		},
	});
}

export async function gieoKeHoachVaCaNhan() {
	const [plan, contact] = await Promise.all([gieoKeHoach(), gieoCaNhan()]);
	return { planId: plan.id, contactId: contact.id };
}

export async function batLoi(chay: () => Promise<unknown>): Promise<string> {
	try {
		await chay();
	} catch (loi) {
		return loi instanceof Error ? `${loi.name}: ${loi.message}` : String(loi);
	}
	throw new Error("mong doi mot loi, nhung lenh chay tron ven");
}

export async function gieoBaBuoc(planId: string, departmentId: string) {
	await db.onboardingStep.createMany({
		data: [0, 1, 2].map((i) => ({
			planId,
			departmentId,
			label: `Buoc ${i}`,
			dueAt: new Date(Date.now() + i * 86_400_000),
			position: i,
		})),
	});
}
