import { db } from "@crm/db";

let dem = 0;

function duy(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

export async function gieoNguoi() {
	const id = duy("u");
	return db.user.create({
		data: { id, name: "Nguoi thu nghiem", email: `${id}@thu.test` },
	});
}

export async function gieoCongTy() {
	return db.company.create({ data: { name: duy("Cong ty") } });
}

export async function gieoCaNhan() {
	return db.contact.create({ data: { firstName: duy("Ca nhan") } });
}

export async function gieoBoPhan(viTri = 0) {
	return db.department.create({ data: { name: duy("Bo phan"), position: viTri } });
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
