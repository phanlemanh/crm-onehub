import { afterAll, describe, expect, test } from "bun:test";
import { db, FactBand, FactStatus } from "@crm/db";
import { dungSan, goi, ma, TIEN_TO } from "./okr-san";

dungSan();

const COT = [
	"firstName",
	"lastName",
	"title",
	"seniority",
	"function",
	"linkedinUrl",
	"twitterUrl",
	"githubUrl",
] as const;

type Cot = (typeof COT)[number];

async function gieoNguoi(): Promise<string> {
	const cty = await db.company.create({
		data: { name: `${TIEN_TO} Cty`, domain: `${ma("cty")}.test` },
		select: { id: true },
	});
	const nguoi = await db.contact.create({
		data: {
			firstName: "Hà",
			lastName: "Nguyễn",
			title: "Trưởng phòng",
			companyId: cty.id,
		},
		select: { id: true },
	});
	return nguoi.id;
}

async function don(contactId: string): Promise<void> {
	await db.contact.deleteMany({ where: { id: contactId } });
}

async function gieoFact(
	contactId: string,
	field: string,
	value: string,
	status: FactStatus = FactStatus.PROPOSED,
	supersededAt: Date | null = null,
): Promise<string> {
	const f = await db.contactFact.create({
		data: {
			contactId,
			field,
			value,
			score: 0.9,
			band: FactBand.VERIFIED,
			evidence: [{ detail: "LinkedIn" }],
			method: "thu",
			status,
			supersededAt,
		},
		select: { id: true },
	});
	return f.id;
}

async function cot(contactId: string): Promise<Record<Cot, string | null>> {
	const c = await db.contact.findUniqueOrThrow({
		where: { id: contactId },
		select: Object.fromEntries(COT.map((k) => [k, true])) as Record<Cot, true>,
	});
	return c;
}

async function anh(contactId: string) {
	return {
		contact: await cot(contactId),
		facts: await db.contactFact.findMany({
			where: { contactId },
			orderBy: { id: "asc" },
			select: {
				id: true,
				value: true,
				status: true,
				decidedById: true,
				decidedAt: true,
				supersededAt: true,
			},
		}),
	};
}

async function fact(id: string) {
	return db.contactFact.findUniqueOrThrow({
		where: { id },
		select: {
			status: true,
			decidedById: true,
			decidedAt: true,
			supersededAt: true,
		},
	});
}

afterAll(async () => {
	await db.contact.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
});

describe("hoan-tac-thong-tin", () => {
	test("nhan: nhận rồi hoàn tác trả trường về đúng giá trị cũ", async () => {
		const ca = [
			{
				field: "title",
				value: "Giám đốc kinh doanh",
				truoc: { value: "Trưởng phòng" },
				doc: (c: Record<Cot, string | null>) => c.title,
				cu: "Trưởng phòng",
			},
			{
				field: "githubUrl",
				value: "https://github.com/ha",
				truoc: { value: null },
				doc: (c: Record<Cot, string | null>) => c.githubUrl,
				cu: null,
			},
			{
				field: "name",
				value: "Thu Hà Nguyễn",
				truoc: { firstName: "Hà", lastName: "Nguyễn" },
				doc: (c: Record<Cot, string | null>) => `${c.firstName}|${c.lastName}`,
				cu: "Hà|Nguyễn",
			},
		];
		expect(ca.length).toBe(3);

		for (const o of ca) {
			const contactId = await gieoNguoi();
			const factId = await gieoFact(contactId, o.field, o.value);

			const nhan = await goi(
				"contacts.decideFact",
				{ factId, decision: "accept" },
				"quan",
			);
			expect(nhan.status).toBe(200);
			expect((await fact(factId)).status).toBe(FactStatus.APPLIED);
			const sauNhan = await cot(contactId);
			expect(o.doc(sauNhan)).not.toBe(o.cu);

			const hoan = await goi(
				"contacts.undoFactDecision",
				{ factId, truoc: o.truoc },
				"quan",
			);
			expect(hoan.status).toBe(200);
			const sauHoan = await cot(contactId);
			if (o.doc(sauHoan) !== o.cu)
				throw new Error(`nhan: ${o.field} khong ve gia tri cu`);
			expect(o.doc(sauHoan)).toBe(o.cu);
			expect(await fact(factId)).toMatchObject({
				status: FactStatus.PROPOSED,
				decidedById: null,
				decidedAt: null,
			});

			const lanHai = await goi(
				"contacts.undoFactDecision",
				{ factId, truoc: o.truoc },
				"quan",
			);
			expect(lanHai.status).toBe(409);
			await don(contactId);
		}
	});

	test("bo-qua: bỏ qua rồi hoàn tác không đổi trường nào", async () => {
		const contactId = await gieoNguoi();
		const factId = await gieoFact(contactId, "title", "Giám đốc kinh doanh");
		const truoc = await cot(contactId);

		const bo = await goi(
			"contacts.decideFact",
			{ factId, decision: "dismiss" },
			"quan",
		);
		expect(bo.status).toBe(200);
		expect((await fact(factId)).status).toBe(FactStatus.DISMISSED);
		expect(await cot(contactId)).toEqual(truoc);

		const hoan = await goi(
			"contacts.undoFactDecision",
			{ factId, truoc: { value: "Trưởng phòng" } },
			"quan",
		);
		expect(hoan.status).toBe(200);
		const sau = await cot(contactId);
		if (JSON.stringify(sau) !== JSON.stringify(truoc))
			throw new Error("bo-qua: cot doi");
		expect(sau).toEqual(truoc);
		expect(await fact(factId)).toMatchObject({
			status: FactStatus.PROPOSED,
			decidedById: null,
			decidedAt: null,
		});
		await don(contactId);
	});

	test("chan: ba ca tu choi khong doi hang nao", async () => {
		const ca = [
			{ ten: "truong-da-doi", ma: 409 },
			{ ten: "nguoi-khac", ma: 403 },
			{ ten: "chua-quyet", ma: 409 },
		] as const;
		expect(ca.length).toBe(3);

		for (const o of ca) {
			const contactId = await gieoNguoi();
			const factId = await gieoFact(contactId, "title", "Giám đốc kinh doanh");
			if (o.ten !== "chua-quyet") {
				await goi(
					"contacts.decideFact",
					{ factId, decision: "accept" },
					"quan",
				);
			}
			if (o.ten === "truong-da-doi") {
				await db.contact.update({
					where: { id: contactId },
					data: { title: "Phó giám đốc" },
				});
			}
			const truoc = await anh(contactId);
			const res = await goi(
				"contacts.undoFactDecision",
				{ factId, truoc: { value: "Trưởng phòng" } },
				o.ten === "nguoi-khac" ? "thuong" : "quan",
			);
			if (o.ten === "nguoi-khac" && res.status === 200)
				throw new Error("chan: nguoi khac hoan tac duoc");
			expect({ ten: o.ten, ma: res.status }).toEqual({
				ten: o.ten,
				ma: o.ma,
			});
			expect(await anh(contactId)).toEqual(truoc);
			await don(contactId);
		}
	});

	test("chan: khoi phuc dung moc cua lan quyet", async () => {
		const contactId = await gieoNguoi();
		const t0 = new Date("2026-09-01T00:00:00Z");
		const w = await gieoFact(
			contactId,
			"title",
			"Chuyên viên",
			FactStatus.SUPERSEDED,
			t0,
		);
		const x = await gieoFact(
			contactId,
			"title",
			"Trưởng phòng",
			FactStatus.APPLIED,
		);
		const y = await gieoFact(contactId, "title", "Trưởng ban");
		const z = await gieoFact(contactId, "title", "Giám đốc kinh doanh");

		await goi("contacts.decideFact", { factId: z, decision: "accept" }, "quan");
		const fz = await fact(z);
		expect((await fact(x)).supersededAt).toEqual(fz.decidedAt);
		expect((await fact(y)).supersededAt).toEqual(fz.decidedAt);

		const hoan = await goi(
			"contacts.undoFactDecision",
			{ factId: z, truoc: { value: "Trưởng phòng" } },
			"quan",
		);
		expect(hoan.status).toBe(200);
		expect(await fact(x)).toMatchObject({
			status: FactStatus.APPLIED,
			supersededAt: null,
		});
		expect(await fact(y)).toMatchObject({
			status: FactStatus.PROPOSED,
			supersededAt: null,
		});
		const fw = await fact(w);
		if (
			fw.status !== FactStatus.SUPERSEDED ||
			fw.supersededAt?.getTime() !== t0.getTime()
		)
			throw new Error("chan: phuc hoi fact cua lan nhan khac");
		expect((await cot(contactId)).title).toBe("Trưởng phòng");
		await don(contactId);
	});
});
