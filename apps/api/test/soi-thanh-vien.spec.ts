import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	inKetQua,
	type SoThanhVien,
	soiThanhVien,
} from "../scripts/soi-thanh-vien";
import { APP_SETTING_ID } from "../src/workspace/staff-domains";
import { dungKho } from "./phien-thu";

const suffix = `soi-${process.env.TEST_RUN_ID ?? "local"}`;
const id = (phan: string) => `${suffix}-${phan}`;
const diaChi = (phan: string) => `${suffix}-${phan}@lan-do.onehub.vn`;
const PHUT_MS = 60_000;

let cotGoc: string | null = null;

async function nguoi(phan: string, laThanhVien: boolean): Promise<string> {
	const userId = id(phan);
	const now = new Date();
	await db.user.create({
		data: {
			id: userId,
			name: phan,
			email: diaChi(phan),
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
	});
	if (laThanhVien) {
		await db.member.create({
			data: {
				id: id(`member-${phan}`),
				organizationId: WORKSPACE_ID,
				userId,
				role: "member",
				createdAt: now,
			},
		});
	}
	return userId;
}

async function dong(
	phan: string,
	email: string,
	status: string,
	luc: Date,
	inviterId: string,
): Promise<void> {
	await db.invitation.create({
		data: {
			id: id(phan),
			organizationId: WORKSPACE_ID,
			email,
			role: "member",
			status,
			expiresAt: new Date("9999-12-31T00:00:00.000Z"),
			inviterId,
			createdAt: luc,
		},
	});
}

async function phien(userId: string, luc: Date): Promise<void> {
	await db.session.create({
		data: {
			id: id(`phien-${userId}`),
			token: id(`phien-${userId}`),
			userId,
			expiresAt: new Date(luc.getTime() + 7 * 24 * 60 * PHUT_MS),
			createdAt: luc,
			updatedAt: luc,
		},
	});
}

async function don(): Promise<void> {
	await db.invitation.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.session.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function datCot(value: string | null): Promise<void> {
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: value },
		update: { staffEmailDomains: value },
	});
}

function hieu(sau: SoThanhVien, truoc: SoThanhVien): SoThanhVien {
	return {
		"ten-mien": sau["ten-mien"],
		treo: sau.treo - truoc.treo,
		"bo-sot": sau["bo-sot"] - truoc["bo-sot"],
		"khong-doc-duoc": sau["khong-doc-duoc"] - truoc["khong-doc-duoc"],
	};
}

describe("soi-thanh-vien", () => {
	beforeAll(async () => {
		await don();
		await dungKho();
		const dongCot = await db.appSetting.findUnique({
			where: { id: APP_SETTING_ID },
			select: { staffEmailDomains: true },
		});
		cotGoc = dongCot?.staffEmailDomains ?? null;
	});

	afterAll(async () => {
		await datCot(cotGoc);
		await don();
	});

	it("dem-bon-so: treo, bo sot (co phien sau dong hieu luc), khong doc duoc, ten mien", async () => {
		await datCot(null);
		const truoc = await soiThanhVien(db);

		const moc = new Date(Date.now() - 60 * PHUT_MS);
		const sau = (phut: number) => new Date(moc.getTime() + phut * PHUT_MS);
		const quan = await nguoi("quan", true);

		await nguoi("treo", true);
		await dong("treo", diaChi("treo"), "pending", sau(1), quan);

		const boSot = await nguoi("bo-sot", false);
		await dong("bo-sot-huy", diaChi("bo-sot"), "canceled", sau(0), quan);
		await dong("bo-sot-cho", diaChi("bo-sot"), "pending", sau(2), quan);
		await phien(boSot, sau(5));

		await nguoi("chua-vao", false);
		await dong("chua-vao-huy", diaChi("chua-vao"), "canceled", sau(0), quan);
		await dong("chua-vao-cho", diaChi("chua-vao"), "pending", sau(2), quan);

		await nguoi("hong", false);
		await dong("hong", diaChi("hong"), "bi-hong", sau(1), quan);

		await datCot("onehub.vn");

		const ket = hieu(await soiThanhVien(db), truoc);

		expect([ket, "dem-bon-so"]).toEqual([
			{ "ten-mien": 1, treo: 1, "bo-sot": 1, "khong-doc-duoc": 1 },
			"dem-bon-so",
		]);
	});

	it("in-ket-qua: ten may chu, giao dich chi doc, bon dong so, khong dia chi thu", async () => {
		const so = await soiThanhVien(db);
		const chu = inKetQua(so, "db.example.neon.tech");

		expect([
			chu.includes("may-chu db.example.neon.tech"),
			chu.includes("giao-dich READ ONLY"),
			/^ten-mien \d+$/m.test(chu),
			/^treo \d+$/m.test(chu),
			/^bo-sot \d+$/m.test(chu),
			/^khong-doc-duoc \d+$/m.test(chu),
			/@/.test(chu),
			"in-ket-qua",
		]).toEqual([true, true, true, true, true, true, false, "in-ket-qua"]);
	});

	it("chi-doc: mot cau ghi chen vao giua giao dich soi bi Postgres tu choi", async () => {
		let loi = "";
		try {
			await soiThanhVien(
				db,
				(tx) =>
					tx.$executeRaw`UPDATE "appSetting" SET "staffEmailDomains" = 'soi-thu' WHERE id = ${APP_SETTING_ID}`,
			);
		} catch (e) {
			loi = (e as Error).message;
		}

		expect([loi.includes("read-only transaction"), "chi-doc"]).toEqual([
			true,
			"chi-doc",
		]);
	});
});
