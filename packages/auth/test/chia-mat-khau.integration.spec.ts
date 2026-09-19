import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { auth } from "../src/auth";

const suffix = process.env.TEST_RUN_ID ?? "chia-mat-khau-spec";

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

describe("chan-tu-dang-ky", () => {
	test("dia chi TRONG danh sach duoc vao van khong tu dang ky duoc", async () => {
		await dungKho();

		const chu = await db.user.upsert({
			where: { id: `${suffix}-chu` },
			create: {
				id: `${suffix}-chu`,
				name: "Chu Workspace",
				email: "chu@onehub.center",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			update: {},
			select: { id: true },
		});

		const email = `trong-ds-${Date.now()}@onehub.center`;
		await db.invitation.create({
			data: {
				id: `inv-${Date.now()}`,
				organizationId: WORKSPACE_ID,
				email,
				role: "member",
				status: "pending",
				expiresAt: new Date("9999-12-31T00:00:00.000Z"),
				inviterId: chu.id,
			},
		});

		const truoc = await db.user.count({ where: { email } });
		expect(truoc).toBe(0);

		await expect(
			auth.api.signUpEmail({
				body: { email, password: "mot-mat-khau-du-dai-12", name: "Ke la" },
			}),
		).rejects.toThrow();

		const sau = await db.user.count({ where: { email } });
		expect(sau).toBe(0);
	});

	test("dia chi NGOAI danh sach cung khong tu dang ky duoc", async () => {
		const email = `ngoai-ds-${Date.now()}@example.com`;

		await expect(
			auth.api.signUpEmail({
				body: { email, password: "mot-mat-khau-du-dai-12", name: "Ke la" },
			}),
		).rejects.toThrow();

		expect(await db.user.count({ where: { email } })).toBe(0);
	});
});
