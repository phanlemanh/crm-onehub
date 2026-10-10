import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { eveToolOutcome } from "@crm/validation/eve-tool";
import { runPortrait, storePortrait } from "../agent/lib/portrait";

process.env.BLOB_READ_WRITE_TOKEN ??= "kiem-thu-bo-qua";

const HAU_TO = process.env.TEST_RUN_ID ?? "portrait-bo-qua";
const TEN = `Bo Qua ${HAU_TO}`;
const ANH = `https://bo-qua-${HAU_TO}.public.blob.vercel-storage.com/contacts/anh.jpg`;
const KHONG_CO = `khong-co-${HAU_TO}`;
const chi = () => ({ ok: true });

let coAnhId: string;

async function don(): Promise<void> {
	await db.contact.deleteMany({ where: { firstName: { startsWith: TEN } } });
}

beforeAll(async () => {
	await don();
	coAnhId = (
		await db.contact.create({
			data: { firstName: `${TEN} Co Anh`, imageUrl: ANH },
			select: { id: true },
		})
	).id;
});

afterAll(don);

describe("portrait-bo-qua", () => {
	test("portrait-bo-qua: da co anh — storePortrait", async () => {
		const kq = await storePortrait({
			contactId: coAnhId,
			sourceUrl: "https://example.test/anh-moi.jpg",
			verified: true,
		});
		const sau = await db.contact.findUniqueOrThrow({
			where: { id: coAnhId },
			select: { imageUrl: true },
		});
		expect(
			`${kq.skipped} ${kq.stored} ${kq.reason} ${sau.imageUrl === ANH}`,
		).toBe("true false They already have a photo. true");
	});

	test("portrait-bo-qua: da co anh — runPortrait", async () => {
		const kq = await runPortrait({ contactId: coAnhId, spend: chi });
		expect(`${kq.skipped} ${kq.stored} ${kq.reason}`).toBe(
			"true false They already have a photo.",
		);
	});

	test("portrait-bo-qua: anh khong doi", async () => {
		const kq = await storePortrait({
			contactId: coAnhId,
			sourceUrl: ANH,
			verified: true,
			force: true,
		});
		expect(`${kq.skipped} ${kq.stored} ${kq.reason}`).toBe(
			"true false Unchanged.",
		);
	});

	test("portrait-bo-qua: doi chung — tai anh hong khong co skipped", async () => {
		const kq = await storePortrait({
			contactId: coAnhId,
			sourceUrl: "http://127.0.0.1:9/anh.jpg",
			verified: true,
			force: true,
		});
		expect(`${kq.stored} ${"skipped" in kq}`).toBe("false false");
	});

	test("portrait-bo-qua: doi chung — ca nhan khong ton tai khong co skipped", async () => {
		const kq = await runPortrait({ contactId: KHONG_CO, spend: chi });
		expect(`${kq.reason} ${"skipped" in kq}`).toBe("No such contact. false");
	});

	test("portrait-bo-qua: khuon luoc skipped", async () => {
		const kq = await runPortrait({ contactId: coAnhId, spend: chi });
		expect(eveToolOutcome.parse(kq)?.skipped).toBe(true);
	});
});
