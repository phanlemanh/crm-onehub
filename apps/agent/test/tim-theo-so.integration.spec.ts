import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { searchCrm } from "../agent/lib/lookup";

const HAU_TO = process.env.TEST_RUN_ID ?? "tim-theo-so";
const TEN = `Kara So ${HAU_TO}`;

let pId: string;

async function don(): Promise<void> {
	await db.contact.deleteMany({ where: { firstName: { startsWith: TEN } } });
}

beforeAll(async () => {
	await don();
	pId = (
		await db.contact.create({
			data: { firstName: `${TEN} Lan`, phone: "+84901234666" },
			select: { id: true },
		})
	).id;
});

afterAll(don);

describe("kara-tim", () => {
	test("kara-tim: tim bang so ra P", async () => {
		const { contacts } = await searchCrm("0901234666", { kinds: ["contact"] });
		expect(contacts.some((hit) => hit.id === pId)).toBe(true);
	});

	test("kara-tim: lo so dien thoai", async () => {
		const { contacts } = await searchCrm("0901234666", { kinds: ["contact"] });
		const coKhoa = contacts.some((hit) => "phone" in hit);
		const coChuoi = contacts.some((hit) =>
			JSON.stringify(hit).includes("901234666"),
		);
		expect(`${contacts.length > 0} ${coKhoa} ${coChuoi}`).toBe(
			"true false false",
		);
	});

	test("kara-tim: tim theo ten van ra P", async () => {
		const { contacts } = await searchCrm(`${TEN} Lan`, { kinds: ["contact"] });
		expect(contacts.some((hit) => hit.id === pId)).toBe(true);
	});
});
