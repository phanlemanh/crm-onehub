import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { auth } from "@crm/auth";
import { db } from "@crm/db";
import { hashPassword } from "better-auth/crypto";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { gieoThanhVien } from "./phien-thu";

const TIEN_TO = `qkdn-${process.env.TEST_RUN_ID ?? "local"}`;
const MAT_KHAU = "mat-khau-thu-du-dai-1";
const HAN_CHO_MS = 10_000;
const NHIP_MS = 100;
const KHOANG_YEN_MS = 750;
const HAN_BAI_MS = 3 * HAN_CHO_MS + 5_000;

const nguoi = `${TIEN_TO}-nguoi`;
const email = `${nguoi}@thu.test`;

async function ngu(ms: number): Promise<void> {
	await new Promise((xong) => setTimeout(xong, ms));
}

async function cho(dieuKien: () => Promise<boolean>): Promise<boolean> {
	const het = Date.now() + HAN_CHO_MS;
	while (Date.now() < het) {
		if (await dieuKien()) return true;
		await ngu(NHIP_MS);
	}
	return dieuKien();
}

async function viecTu(moc: Date): Promise<number> {
	return db.agentTask.count({ where: { createdAt: { gte: moc } } });
}

async function choYen(moc: Date): Promise<void> {
	const het = Date.now() + HAN_CHO_MS;
	let truoc = await viecTu(moc);
	while (Date.now() < het) {
		await ngu(KHOANG_YEN_MS);
		const sau = await viecTu(moc);
		if (sau === truoc) return;
		truoc = sau;
	}
}

async function dangNhap(): Promise<void> {
	await auth.api.signInEmail({ body: { email, password: MAT_KHAU } });
}

async function don(): Promise<void> {
	const cua = { startsWith: TIEN_TO };
	await db.session.deleteMany({ where: { userId: cua } });
	await db.account.deleteMany({ where: { userId: cua } });
	await db.member.deleteMany({ where: { userId: cua } });
	await db.user.deleteMany({ where: { id: cua } });
	await db.contact.deleteMany({ where: { firstName: cua } });
}

beforeAll(async () => {
	await don();
	await gieoThanhVien(nguoi, "member");
	const now = new Date();
	await db.account.create({
		data: {
			id: `acc-${nguoi}`,
			accountId: nguoi,
			providerId: "credential",
			userId: nguoi,
			password: await hashPassword(MAT_KHAU),
			createdAt: now,
			updatedAt: now,
		},
	});
});

afterAll(don);

describe("quet-khi-dang-nhap", () => {
	test(
		"ung-dung-da-dong: ung dung da dong khong quet khi co nguoi dang nhap, ung dung dang chay van nhan",
		async () => {
			const a = await createApp();
			await a.listen(0, "127.0.0.1");
			const quetA = spyOn(a.get(BackfillService), "auto").mockResolvedValue({
				started: false,
			});
			await a.close();

			const b = await createApp();
			await b.listen(0, "127.0.0.1");
			const quetB = spyOn(b.get(BackfillService), "auto").mockResolvedValue({
				started: false,
			});
			try {
				await dangNhap();
				const bNhan = await cho(async () => quetB.mock.calls.length > 0);
				expect(bNhan, "ung dung dang chay khong nhan dang nhap").toBe(true);
				expect(quetB.mock.calls.length).toBe(1);
				expect(
					quetA.mock.calls.length,
					"ung dung da dong van quet khi co nguoi dang nhap",
				).toBe(0);
			} finally {
				await b.close();
			}
		},
		HAN_BAI_MS,
	);

	test(
		"van-quet-that: dang nhap tren ung dung dang chay van xep identify, bai don dung dong luot quet sinh ra",
		async () => {
			const app = await createApp();
			await app.listen(0, "127.0.0.1");
			const moc = new Date();
			const le = await db.contact.create({
				data: { firstName: `${TIEN_TO}-le` },
			});
			try {
				await dangNhap();
				const thay = await cho(
					async () =>
						(await db.agentTask.count({
							where: { contactId: le.id, kind: "identify", finishedAt: null },
						})) > 0,
				);
				expect(thay, "duong quet that khong con xep identify").toBe(true);
			} finally {
				await app.close();
			}

			await choYen(moc);
			await db.agentTask.deleteMany({ where: { createdAt: { gte: moc } } });
			await db.contact.delete({ where: { id: le.id } });
			await choYen(moc);
			expect(await viecTu(moc), "bai de lai dong viec cua luot quet").toBe(0);
		},
		HAN_BAI_MS,
	);
});
