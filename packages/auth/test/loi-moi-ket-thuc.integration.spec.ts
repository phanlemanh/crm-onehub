import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { TRANG_THAI_LOI_MOI } from "@crm/validation/invitation-status";
import { beforeEach, describe, expect, it } from "bun:test";
import { ALLOWANCE_WITHOUT_EXPIRY } from "../src/allow-list";
import { ensureWorkspaceMembership } from "../src/organization";

const suffix = process.env.TEST_RUN_ID ?? "loi-moi-ket-thuc-spec";

function nguoi(email: string) {
	const now = new Date();
	return {
		id: `${suffix}-${email.replace(/[^a-z0-9]/gi, "-")}`,
		name: "Ai Do",
		email,
		emailVerified: true,
		createdAt: now,
		updatedAt: now,
	};
}

async function dungKho() {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
		update: {},
	});
}

async function don() {
	await dungKho();
	await db.invitation.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function coSanMotThanhVien() {
	const cu = await db.user.upsert({
		where: { id: `${suffix}-cu` },
		create: { ...nguoi("cu@onemount.com"), id: `${suffix}-cu` },
		update: {},
		select: { id: true },
	});

	await db.member.upsert({
		where: {
			organizationId_userId: {
				organizationId: WORKSPACE_ID,
				userId: cu.id,
			},
		},
		create: {
			id: `${suffix}-mem-cu`,
			organizationId: WORKSPACE_ID,
			userId: cu.id,
			role: "owner",
			createdAt: new Date(),
		},
		update: {},
	});
}

async function demThanhVien() {
	return db.member.count({ where: { organizationId: WORKSPACE_ID } });
}

async function chayMotLuot(status: string, email: string) {
	const u = nguoi(email);

	await db.user.upsert({ where: { id: u.id }, create: u, update: {} });

	const chu = await db.user.upsert({
		where: { id: `${suffix}-chu` },
		create: { ...nguoi("chu@onemount.com"), id: `${suffix}-chu` },
		update: {},
		select: { id: true },
	});

	await db.invitation.create({
		data: {
			id: `${suffix}-inv-${email.replace(/[^a-z0-9]/gi, "-")}`,
			organizationId: WORKSPACE_ID,
			email,
			role: "admin",
			status,
			expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
			inviterId: chu.id,
		},
	});

	const truoc = await demThanhVien();
	await ensureWorkspaceMembership(u.id, email);
	const sau = await demThanhVien();

	return sau - truoc;
}

describe("khong-sinh-thanh-vien", () => {
	beforeEach(async () => {
		await don();
		await coSanMotThanhVien();
	});

	it("canceled khong sinh dong nao, pending sinh dung mot dong", async () => {
		const hieuCanceled = await chayMotLuot(
			TRANG_THAI_LOI_MOI[3],
			`huy-${suffix}@onemount.com`,
		);

		expect(
			hieuCanceled,
			`loi moi "${TRANG_THAI_LOI_MOI[3]}" sinh ${hieuCanceled} dong thanh vien, mong 0`,
		).toBe(0);

		await don();
		await coSanMotThanhVien();

		const hieuPending = await chayMotLuot(
			TRANG_THAI_LOI_MOI[0],
			`cho-${suffix}@onemount.com`,
		);

		expect(
			hieuPending,
			`loi moi "${TRANG_THAI_LOI_MOI[0]}" sinh ${hieuPending} dong thanh vien, mong 1`,
		).toBe(1);
	});
});
