import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { handleOAuthUserInfo } from "better-auth/oauth2";
import { auth } from "../src/auth";
import { ducChia, PASSWORD } from "../src/chia-mat-khau";
import { isGoogleConfigured } from "../src/env";
import { GOOGLE_PROVIDER_ID } from "../src/scopes";

const suffix = process.env.TEST_RUN_ID ?? "chia-mat-khau-spec";

const KHONG_TOI_MANG_HIBP = "Failed to check password. Please try again later.";

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

function dinhDanh(nhan: string): string {
	return `${suffix}-${nhan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function gieoNguoiVaChia() {
	await dungKho();

	const userId = dinhDanh("u");
	const email = `${dinhDanh("chia")}@onehub.center`;

	await db.user.create({
		data: { id: userId, name: "Nguoi thu", email, emailVerified: true },
	});

	const chia = await ducChia({ userId, appUrl: "http://localhost:3000" });
	const token = chia.url.split("/").at(-1) ?? "";

	return { email, userId, token, url: chia.url, expiresAt: chia.expiresAt };
}

async function thuDatMatKhau(token: string, newPassword: string) {
	try {
		await auth.api.resetPassword({ body: { token, newPassword } });
		return { ok: true as const, message: "" };
	} catch (loi) {
		return {
			ok: false as const,
			message: String((loi as Error)?.message ?? loi),
		};
	}
}

async function thuDangNhap(email: string, password: string) {
	try {
		const ket = await auth.api.signInEmail({ body: { email, password } });
		return { ok: true as const, userId: ket?.user?.id ?? null };
	} catch {
		return { ok: false as const, userId: null };
	}
}

function thongDiepMatKhauDaLo(): string {
	const plugins =
		(
			auth.options as {
				plugins?: {
					id: string;
					options?: { customPasswordCompromisedMessage?: string };
				}[];
			}
		).plugins ?? [];
	const daLo = plugins.find((plugin) => plugin.id === "have-i-been-pwned");

	return daLo?.options?.customPasswordCompromisedMessage ?? "";
}

async function donSauKhiXong() {
	await db.session.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.account.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.verification.deleteMany({
		where: { value: { startsWith: `${suffix}-` } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.invitation.deleteMany({
		where: { organizationId: WORKSPACE_ID, inviterId: `${suffix}-chu` },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

afterAll(donSauKhiXong);

describe("vong-tron", () => {
	test("duc, tieu thu, mat khau luu that, dang nhap duoc", async () => {
		const ket = await gieoNguoiVaChia();
		const matKhau = `Vong-tron-${Date.now()}`;

		const hang = await db.verification.findFirst({
			where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` },
		});
		expect(hang).not.toBeNull();
		expect(hang?.value).toBe(ket.userId);

		const dat = await thuDatMatKhau(ket.token, matKhau);
		expect(dat.ok).toBe(true);

		const taiKhoan = await db.account.findFirst({
			where: { userId: ket.userId, providerId: "credential" },
			select: { password: true },
		});
		expect(taiKhoan?.password).toBeTruthy();

		const vao = await thuDangNhap(ket.email, matKhau);
		expect(vao.ok).toBe(true);
		expect(vao.userId).toBe(ket.userId);
	});
});

describe("dung-lan-hai", () => {
	test("chia da dung thi lan hai bi tu choi, mat khau lan mot van song", async () => {
		const ket = await gieoNguoiVaChia();
		const mot = `Lan-mot-${Date.now()}`;
		const hai = `Lan-hai-${Date.now()}`;

		expect((await thuDatMatKhau(ket.token, mot)).ok).toBe(true);
		expect((await thuDatMatKhau(ket.token, hai)).ok).toBe(false);

		expect((await thuDangNhap(ket.email, mot)).ok).toBe(true);
		expect((await thuDangNhap(ket.email, hai)).ok).toBe(false);
	});
});

describe("het-han", () => {
	test("con han thi dat duoc, qua han thi khong", async () => {
		const con = await gieoNguoiVaChia();
		expect((await thuDatMatKhau(con.token, `Con-han-${Date.now()}`)).ok).toBe(
			true,
		);

		const qua = await gieoNguoiVaChia();
		await db.verification.updateMany({
			where: { identifier: `${PASSWORD.verificationPrefix}${qua.token}` },
			data: { expiresAt: new Date(Date.now() - 60_000) },
		});

		const matKhau = `Qua-han-${Date.now()}`;
		expect((await thuDatMatKhau(qua.token, matKhau)).ok).toBe(false);
		expect((await thuDangNhap(qua.email, matKhau)).ok).toBe(false);
	});
});

describe("phat-lai", () => {
	test("chia thu hai song thi chia thu nhat chet, khong con token treo", async () => {
		const ket = await gieoNguoiVaChia();

		const chia2 = await ducChia({
			userId: ket.userId,
			appUrl: "http://localhost:3000",
		});
		const token2 = chia2.url.split("/").at(-1) ?? "";
		const m2 = `Mat-khau-hai-${Date.now()}`;
		expect((await thuDatMatKhau(token2, m2)).ok).toBe(true);

		expect((await thuDangNhap(ket.email, m2)).ok).toBe(true);

		const treo = await db.verification.count({
			where: {
				value: ket.userId,
				identifier: { startsWith: PASSWORD.verificationPrefix },
			},
		});
		expect(treo).toBe(0);

		expect(
			(await thuDatMatKhau(ket.token, `Chia-mot-lai-${Date.now()}`)).ok,
		).toBe(false);
	});
});

describe("mat-khau-yeu", () => {
	test("ngan hon do dai toi thieu thi tu choi voi thong diep do dai", async () => {
		const ket = await gieoNguoiVaChia();
		const matKhauNgan = "N".repeat(PASSWORD.minLength - 1);

		const dat = await thuDatMatKhau(ket.token, matKhauNgan);

		expect(dat.ok).toBe(false);
		expect(dat.message).toBe("Password too short");
	});

	test("du dai nhung da lo thi tu choi voi thong diep khac ca do dai", async () => {
		const ket = await gieoNguoiVaChia();
		const daLo = "123456789012";

		const dat = await thuDatMatKhau(ket.token, daLo);

		if (dat.ok) {
			throw new Error(
				"mat khau da tung lo van duoc chap nhan — bo sang haveIBeenPwned khong con chan",
			);
		}

		if (dat.message === KHONG_TOI_MANG_HIBP) {
			expect([
				"bo-qua-co-ten: khong voi toi duoc mang cua haveIBeenPwned luc chay bai kiem",
				dat.message,
			]).toEqual([
				"bo-qua-co-ten: khong voi toi duoc mang cua haveIBeenPwned luc chay bai kiem",
				dat.message,
			]);
			return;
		}

		expect(dat.message).not.toBe("Password too short");
		expect(dat.message).toBe(thongDiepMatKhauDaLo());
	});

	test("du dai va sach thi duoc chap nhan", async () => {
		const ket = await gieoNguoiVaChia();
		const sach = `Sach-Kh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		const dat = await thuDatMatKhau(ket.token, sach);

		expect(dat.ok).toBe(true);
	});
});

describe("cua-google-con-song", () => {
	test("cau hinh van khai nha cung cap google khi co khoa trong moi truong", () => {
		if (!isGoogleConfigured()) {
			expect([
				"bo-qua-co-ten: khong co GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET trong moi truong bai kiem",
				isGoogleConfigured(),
			]).toEqual([
				"bo-qua-co-ten: khong co GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET trong moi truong bai kiem",
				false,
			]);
			return;
		}

		const socialProviders = (
			auth.options as {
				socialProviders?: Record<string, { clientId?: string } | undefined>;
			}
		).socialProviders;

		expect(socialProviders?.google?.clientId).toBeTruthy();
	});

	test("dia chi da co hang nguoi dung thi lien ket qua google, khong sinh hang thu hai", async () => {
		const ket = await gieoNguoiVaChia();
		const context = await auth.$context;
		const nguonGoogle: Parameters<typeof handleOAuthUserInfo>[0] = {
			context,
		} as unknown as Parameters<typeof handleOAuthUserInfo>[0];

		const ketQua = await handleOAuthUserInfo(nguonGoogle, {
			userInfo: {
				id: `google-ext-${ket.userId}`,
				email: ket.email,
				emailVerified: true,
				name: "Nguoi thu qua Google",
			},
			account: {
				providerId: GOOGLE_PROVIDER_ID,
				accountId: `google-ext-${ket.userId}`,
			},
			callbackURL: "/",
			disableSignUp: false,
		});

		expect(ketQua.error).toBeNull();
		expect(ketQua.isRegister).toBe(false);
		expect(ketQua.data?.user.id).toBe(ket.userId);

		const soHang = await db.user.count({ where: { email: ket.email } });
		expect(soHang).toBe(1);

		const taiKhoanGoogle = await db.account.findFirst({
			where: { userId: ket.userId, providerId: GOOGLE_PROVIDER_ID },
			select: { id: true },
		});
		expect(taiKhoanGoogle).not.toBeNull();

		await db.session.deleteMany({ where: { userId: ket.userId } });
	});
});

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
