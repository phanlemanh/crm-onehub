import { afterAll, describe, expect, test } from "bun:test";
import { PASSWORD } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { memberListInput } from "../src/workspace/workspace.contracts";
import { WorkspaceService } from "../src/workspace/workspace.service";

const suffix = `mkl-${process.env.TEST_RUN_ID ?? "local"}`;

const DANH_SACH_THANH_VIEN = memberListInput.parse({});

function demChiaCua(userId: string) {
	return db.verification.count({
		where: {
			value: userId,
			identifier: { startsWith: PASSWORD.verificationPrefix },
		},
	});
}

function demChiaCuaLuot() {
	return db.verification.count({
		where: {
			value: { startsWith: `${suffix}-` },
			identifier: { startsWith: PASSWORD.verificationPrefix },
		},
	});
}

const agent = {
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

function dinhDanh(nhan: string): string {
	return `${suffix}-${nhan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

async function dungService() {
	await dungKho();
	return { service: new WorkspaceService(db, agent), db };
}

async function gieoNguoi(vai: string, tuyChon?: { coLoiMoi?: boolean }) {
	await dungKho();

	const now = new Date();
	const userId = dinhDanh("u");
	const email = `${dinhDanh("mail")}@onehub.center`.toLowerCase();
	const name = dinhDanh("ten");

	await db.user.create({
		data: {
			id: userId,
			name,
			email,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
	});

	await db.member.create({
		data: {
			id: dinhDanh("member"),
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
	});

	if (tuyChon?.coLoiMoi ?? true) {
		await db.invitation.create({
			data: {
				id: dinhDanh("inv"),
				organizationId: WORKSPACE_ID,
				email,
				role: vai,
				status: "accepted",
				expiresAt: new Date("9999-12-31T00:00:00.000Z"),
				inviterId: userId,
			},
		});
	}

	return { id: userId, email, name };
}

async function gieoHangDuocVao(email: string, vai: string) {
	const nguoiMoi = await gieoNguoi("admin");

	return db.invitation.create({
		data: {
			id: dinhDanh("inv"),
			organizationId: WORKSPACE_ID,
			email,
			role: vai,
			status: "pending",
			expiresAt: new Date("9999-12-31T00:00:00.000Z"),
			inviterId: nguoiMoi.id,
		},
	});
}

async function donSauKhiXong() {
	const tuTaoTrongThuTuc = await db.user.findMany({
		where: {
			email: { contains: suffix },
			id: { not: { startsWith: `${suffix}-` } },
		},
		select: { id: true },
	});
	const idTuTao = tuTaoTrongThuTuc.map((row) => row.id);

	await db.passwordLinkIssue.deleteMany({
		where: {
			OR: [
				{ email: { contains: suffix } },
				{ issuedById: { startsWith: `${suffix}-` } },
			],
		},
	});
	await db.verification.deleteMany({
		where: {
			OR: [{ value: { startsWith: `${suffix}-` } }, { value: { in: idTuTao } }],
		},
	});
	await db.invitation.deleteMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: suffix } },
			],
		},
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: suffix } },
			],
		},
	});
}

afterAll(donSauKhiXong);

describe("quyen-hai-ve", () => {
	test("member bi tu choi, admin va owner duoc, va ket qua di qua vi tu", async () => {
		const { service, db } = await dungService();
		const member = await gieoNguoi("member");
		const admin = await gieoNguoi("admin");
		const owner = await gieoNguoi("owner");
		const nhan = await gieoNguoi("member");

		const truoc = await demChiaCua(nhan.id);
		await expect(
			service.issuePasswordLink(member.id, { email: nhan.email }),
		).rejects.toThrow();
		expect(await demChiaCua(nhan.id)).toBe(truoc);

		expect(
			(await service.issuePasswordLink(admin.id, { email: nhan.email })).url,
		).toContain("/dat-mat-khau/");
		expect(
			(await service.issuePasswordLink(owner.id, { email: nhan.email })).url,
		).toContain("/dat-mat-khau/");

		await expect(
			service.issuePasswordLink(owner.id, { email: nhan.email }, () => false),
		).rejects.toThrow();

		expect(
			(
				await service.issuePasswordLink(
					member.id,
					{ email: nhan.email },
					() => true,
				)
			).url,
		).toContain("/dat-mat-khau/");
	});
});

describe("phat-chia", () => {
	test("nguoi da co tai khoan duoc phat mot chia hop le; id nguoi phat khong ton tai thi bi tu choi va khong ghi gi", async () => {
		const { service, db } = await dungService();
		const admin = await gieoNguoi("admin");
		const nguoi = await gieoNguoi("member");

		const truocChia = await demChiaCua(nguoi.id);
		expect(truocChia).toBe(0);

		const ket = await service.issuePasswordLink(admin.id, {
			email: nguoi.email,
		});
		expect(ket.url).toContain("/dat-mat-khau/");
		expect(ket.expiresAt).toBeTruthy();

		const sauChia = await demChiaCua(nguoi.id);
		expect(
			sauChia,
			`bang verification phai co dung ${truocChia + 1} hang tro id ${nguoi.id}, dang co ${sauChia}`,
		).toBe(truocChia + 1);

		const hang = await db.verification.findFirst({
			where: {
				value: nguoi.id,
				identifier: { startsWith: PASSWORD.verificationPrefix },
			},
		});
		expect(hang).not.toBeNull();
		expect(hang?.value).toBe(nguoi.id);

		const conLai = (hang?.expiresAt.getTime() ?? 0) - Date.now();
		expect(conLai).toBeGreaterThan(0);
		expect(conLai).toBeLessThanOrEqual(PASSWORD.tokenTtlSeconds * 1000);

		const truocAm = await demChiaCuaLuot();
		await expect(
			service.issuePasswordLink(dinhDanh("khong-ton-tai"), {
				email: nguoi.email,
			}),
		).rejects.toThrow();

		expect(await demChiaCua(nguoi.id)).toBe(sauChia);
		expect(await demChiaCuaLuot()).toBe(truocAm);
	});
});

describe("tao-nguoi-truoc", () => {
	test("dia chi trong danh sach chua co tai khoan thi tao truoc roi duc chia", async () => {
		const { service, db } = await dungService();
		const admin = await gieoNguoi("admin");
		const email = `chua-co-${dinhDanh("dia")}@onehub.center`.toLowerCase();
		await gieoHangDuocVao(email, "member");

		expect(await db.user.count({ where: { email } })).toBe(0);

		const ket = await service.issuePasswordLink(admin.id, { email });
		expect(ket.url).toContain("/dat-mat-khau/");
		expect(await db.user.count({ where: { email } })).toBe(1);

		const nguoi = await db.user.findFirstOrThrow({ where: { email } });
		expect(nguoi.emailVerified).toBe(true);

		const hang = await db.verification.findFirst({
			where: { value: nguoi.id },
		});
		expect(hang).not.toBeNull();
	});

	test("dia chi NGOAI danh sach thi khong tao duoc nguoi, khong duc duoc chia", async () => {
		const { service, db } = await dungService();
		const admin = await gieoNguoi("admin");
		const email = `ngoai-${dinhDanh("dia")}@example.com`.toLowerCase();

		const truocChia = await demChiaCuaLuot();
		await expect(
			service.issuePasswordLink(admin.id, { email }),
		).rejects.toThrow("Địa chỉ này không nằm trong danh sách được vào.");

		expect(await db.user.count({ where: { email } })).toBe(0);
		expect(await demChiaCuaLuot()).toBe(truocChia);
	});
});

describe("thanh-vien-khong-co-loi-moi", () => {
	test("da la thanh vien nhung khong co hang loi moi van duoc phat chia", async () => {
		const { service } = await dungService();
		const admin = await gieoNguoi("admin");
		const chuKho = await gieoNguoi("owner", { coLoiMoi: false });

		const ket = await service.issuePasswordLink(admin.id, {
			email: chuKho.email,
		});
		expect(ket.url).toContain("/dat-mat-khau/");
	});
});

describe("ghi-vet", () => {
	test("hai lan phat khac nguoi khong de len nhau, doc qua truy van cua man", async () => {
		const { service } = await dungService();
		const a = await gieoNguoi("admin");
		const b = await gieoNguoi("owner");
		const x = await gieoNguoi("member");
		const y = await gieoNguoi("member");

		const batDau = new Date();
		await service.issuePasswordLink(a.id, { email: x.email });
		await service.issuePasswordLink(b.id, { email: y.email });

		const rows = (await service.allowances(a.id)).rows;
		const cuaX = rows.find((r) => r.email === x.email);
		const cuaY = rows.find((r) => r.email === y.email);

		expect(cuaX?.passwordLinkIssuedByName).toBe(a.name);
		expect(cuaY?.passwordLinkIssuedByName).toBe(b.name);
		expect(
			new Date(cuaX?.passwordLinkIssuedAt ?? 0).getTime(),
		).toBeGreaterThanOrEqual(batDau.getTime());
	});
});

describe("vet-chi-quan-tri", () => {
	test("man Thanh vien: quan tri doc duoc hai truong vet, thanh vien thuong thi khong", async () => {
		const { service } = await dungService();
		const admin = await gieoNguoi("admin");
		const rep = await gieoNguoi("member");
		const nhan = await gieoNguoi("member");

		await service.issuePasswordLink(admin.id, { email: nhan.email });

		const cuaQuanTri = (
			await service.members(admin.id, DANH_SACH_THANH_VIEN)
		).rows.find((row) => row.email === nhan.email);
		expect(cuaQuanTri?.passwordLinkIssuedByName).toBe(admin.name);
		expect(cuaQuanTri?.passwordLinkIssuedAt).not.toBeNull();

		const cuaRep = (
			await service.members(rep.id, DANH_SACH_THANH_VIEN)
		).rows.find((row) => row.email === nhan.email);
		expect(cuaRep).not.toBeUndefined();
		expect(cuaRep?.passwordLinkIssuedByName).toBeNull();
		expect(cuaRep?.passwordLinkIssuedAt).toBeNull();
	});
});
