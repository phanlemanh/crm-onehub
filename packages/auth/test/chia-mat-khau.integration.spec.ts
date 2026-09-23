import { afterAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { auth } from "../src/auth";
import { CHIA, ducChia, PASSWORD } from "../src/chia-mat-khau";
import { isGoogleConfigured } from "../src/env";
import { CAU_MAT_KHAU, SANG_MAT_KHAU } from "../src/sang-mat-khau";
import { GOOGLE_PROVIDER_ID, SYNC_SCOPES } from "../src/scopes";

const suffix = process.env.TEST_RUN_ID ?? "chia-mat-khau-spec";

const GOC_TOKEN_GOOGLE = "https://oauth2.googleapis.com/token";

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

async function dangNhapLayBanh(
	email: string,
	password: string,
): Promise<string> {
	const ket = await auth.api.signInEmail({
		body: { email, password },
		returnHeaders: true,
	});

	return ket.headers
		.getSetCookie()
		.map((mieng) => mieng.split(";")[0])
		.join("; ");
}

async function thuDoiMatKhau(
	banh: string,
	currentPassword: string,
	newPassword: string,
) {
	try {
		await auth.api.changePassword({
			body: { currentPassword, newPassword },
			headers: new Headers({ cookie: banh }),
		});
		return { ok: true as const, message: "" };
	} catch (loi) {
		return {
			ok: false as const,
			message: String((loi as Error)?.message ?? loi),
		};
	}
}

function duoiBamSha1(matKhau: string): string {
	return createHash("sha1")
		.update(matKhau)
		.digest("hex")
		.toUpperCase()
		.slice(SANG_MAT_KHAU.doDaiTienTo);
}

async function voiDanhSachDaLoGia<T>(
	traLoi: () => Response,
	viec: () => Promise<T>,
): Promise<T> {
	const that = globalThis.fetch;

	globalThis.fetch = (async (dau: RequestInfo | URL, them?: RequestInit) => {
		const duong = String(dau instanceof Request ? dau.url : dau);
		if (duong.startsWith(SANG_MAT_KHAU.goc)) return traLoi();
		return that(dau as RequestInfo, them);
	}) as typeof fetch;

	try {
		return await viec();
	} finally {
		globalThis.fetch = that;
	}
}

function traLoiDaLo(matKhau: string): Response {
	return new Response(`${duoiBamSha1(matKhau)}:42\n`, { status: 200 });
}

function traLoiSach(): Response {
	return new Response(`${duoiBamSha1("khong-bao-gio-trung-mat-khau")}:1\n`, {
		status: 200,
	});
}

function matKhauSach(nhan: string): string {
	return `${nhan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const BO_QUA_GOOGLE =
	"bo-qua-co-ten: khong co GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET trong moi truong bai kiem";

const BO_QUA_HD_LECH =
	"bo-qua-co-ten: auth khong khoa hd — thieu khoa Google hoac danh sach cho phep khong phai dung mot mien";

async function gieoHangDuocVao(): Promise<{ email: string }> {
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

	const email = `${dinhDanh("duoc-vao")}@onehub.center`;

	await db.invitation.create({
		data: {
			id: dinhDanh("inv"),
			organizationId: WORKSPACE_ID,
			email,
			role: "member",
			status: "pending",
			expiresAt: new Date("9999-12-31T00:00:00.000Z"),
			inviterId: chu.id,
		},
	});

	return { email };
}

type ManhJwt = Record<string, string | number | boolean>;

function phanJwt(noiDung: ManhJwt): string {
	return Buffer.from(JSON.stringify(noiDung)).toString("base64url");
}

type NguoiGoogle = {
	email: string;
	accountId: string;
	ten: string;
	hd?: string;
};

function idTokenGia(nguoi: NguoiGoogle): string {
	const mienGiuNha = nguoi.hd ?? auth.options.socialProviders?.google?.hd;
	const nen: ManhJwt = {
		iss: "https://accounts.google.com",
		sub: nguoi.accountId,
		email: nguoi.email,
		email_verified: true,
		name: nguoi.ten,
	};

	return [
		phanJwt({ alg: "RS256", typ: "JWT", kid: "khoa-thu" }),
		phanJwt(mienGiuNha ? { ...nen, hd: mienGiuNha } : nen),
		Buffer.from("chua-ky").toString("base64url"),
	].join(".");
}

async function dangNhapQuaGoogle(
	nguoi: NguoiGoogle,
): Promise<{ diaChiVe: string | null }> {
	const batDau = await auth.api.signInSocial({
		body: { provider: GOOGLE_PROVIDER_ID, callbackURL: "/" },
		returnHeaders: true,
	});

	const duong = batDau.response?.url;
	if (!duong) throw new Error("signInSocial khong tra ve duong cua google");

	const state = new URL(duong).searchParams.get("state");
	if (!state) throw new Error("duong cua google khong mang state");

	const cookie = batDau.headers
		.getSetCookie()
		.map((mieng) => mieng.split(";")[0])
		.join("; ");

	const that = globalThis.fetch;

	globalThis.fetch = (async (dau: RequestInfo | URL, them?: RequestInit) => {
		const duongGoi = String(dau instanceof Request ? dau.url : dau);
		if (duongGoi.startsWith(GOC_TOKEN_GOOGLE)) {
			return Response.json({
				access_token: `at-${nguoi.accountId}`,
				refresh_token: `rt-${nguoi.accountId}`,
				token_type: "Bearer",
				expires_in: 3600,
				scope: SYNC_SCOPES.join(" "),
				id_token: idTokenGia(nguoi),
			});
		}
		return that(dau as RequestInfo, them);
	}) as typeof fetch;

	try {
		const ket = await auth.api.callbackOAuth({
			method: "GET",
			params: { id: GOOGLE_PROVIDER_ID },
			query: { state, code: `ma-${nguoi.accountId}` },
			headers: new Headers({ cookie }),
			asResponse: true,
		});

		return { diaChiVe: ket.headers.get("location") };
	} catch (loi) {
		const dau = (loi as { headers?: Headers })?.headers;
		return { diaChiVe: dau instanceof Headers ? dau.get("location") : null };
	} finally {
		globalThis.fetch = that;
	}
}

async function donSauKhiXong() {
	const nguoiCuaLuot = await db.user.findMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: suffix } },
			],
		},
		select: { id: true },
	});
	const id = nguoiCuaLuot.map((row) => row.id);

	await db.session.deleteMany({ where: { userId: { in: id } } });
	await db.account.deleteMany({ where: { userId: { in: id } } });
	await db.verification.deleteMany({ where: { value: { in: id } } });
	await db.member.deleteMany({ where: { userId: { in: id } } });
	await db.invitation.deleteMany({
		where: {
			organizationId: WORKSPACE_ID,
			OR: [{ inviterId: `${suffix}-chu` }, { email: { contains: suffix } }],
		},
	});
	await db.user.deleteMany({ where: { id: { in: id } } });
}

afterAll(donSauKhiXong);

describe("vong-tron", () => {
	test("duc, tieu thu, mat khau luu that, dang nhap duoc", async () => {
		const ket = await gieoNguoiVaChia();
		const matKhau = `Vong-tron-${Date.now()}`;

		expect(ket.url).toBe(`http://localhost:3000/dat-mat-khau/${ket.token}`);
		const conLai = ket.expiresAt.getTime() - Date.now();
		expect(conLai).toBeGreaterThan(0);
		expect(conLai).toBeLessThanOrEqual(CHIA.ttlMs);

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

	test("phien mo truoc khi dat lai mat khau khong con dung duoc sau do", async () => {
		const ket = await gieoNguoiVaChia();
		const mot = matKhauSach("Phien-cu");

		expect((await thuDatMatKhau(ket.token, mot)).ok).toBe(true);
		expect((await thuDangNhap(ket.email, mot)).ok).toBe(true);

		const phienCu = await db.session.findMany({
			where: { userId: ket.userId },
			select: { id: true },
		});
		expect(phienCu.length).toBeGreaterThan(0);

		const chiaHai = await ducChia({
			userId: ket.userId,
			appUrl: "http://localhost:3000",
		});
		const tokenHai = chiaHai.url.split("/").at(-1) ?? "";
		expect((await thuDatMatKhau(tokenHai, matKhauSach("Phien-moi"))).ok).toBe(
			true,
		);

		const conSong = await db.session.findMany({
			where: { id: { in: phienCu.map((phien) => phien.id) } },
			select: { id: true },
		});
		expect(conSong).toEqual([]);
		expect(await db.session.count({ where: { userId: ket.userId } })).toBe(0);
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
		const matKhauCu = `Mat-khau-cu-${Date.now()}`;
		expect((await thuDatMatKhau(qua.token, matKhauCu)).ok).toBe(true);

		const chiaHetHan = await ducChia({
			userId: qua.userId,
			appUrl: "http://localhost:3000",
		});
		const tokenHetHan = chiaHetHan.url.split("/").at(-1) ?? "";
		await db.verification.updateMany({
			where: { identifier: `${PASSWORD.verificationPrefix}${tokenHetHan}` },
			data: { expiresAt: new Date(Date.now() - 60_000) },
		});

		const matKhauMoi = `Qua-han-${Date.now()}`;
		expect((await thuDatMatKhau(tokenHetHan, matKhauMoi)).ok).toBe(false);

		expect((await thuDangNhap(qua.email, matKhauCu)).ok).toBe(true);
		expect((await thuDangNhap(qua.email, matKhauMoi)).ok).toBe(false);
	});
});

describe("phat-lai", () => {
	test("chia thu hai song thi mat khau cu het dung duoc va chia giua chet", async () => {
		const ket0 = await gieoNguoiVaChia();
		const m0 = `Mat-khau-0-${Date.now()}`;
		expect((await thuDatMatKhau(ket0.token, m0)).ok).toBe(true);

		const chia1 = await ducChia({
			userId: ket0.userId,
			appUrl: "http://localhost:3000",
		});
		const token1 = chia1.url.split("/").at(-1) ?? "";

		const chia2 = await ducChia({
			userId: ket0.userId,
			appUrl: "http://localhost:3000",
		});
		const token2 = chia2.url.split("/").at(-1) ?? "";
		const m2 = `Mat-khau-2-${Date.now()}`;
		expect((await thuDatMatKhau(token2, m2)).ok).toBe(true);

		expect((await thuDangNhap(ket0.email, m2)).ok).toBe(true);
		expect((await thuDangNhap(ket0.email, m0)).ok).toBe(false);
		expect((await thuDatMatKhau(token1, `Chia-giua-${Date.now()}`)).ok).toBe(
			false,
		);

		const treo = await db.verification.count({
			where: {
				value: ket0.userId,
				identifier: { startsWith: PASSWORD.verificationPrefix },
			},
		});
		expect(treo).toBe(0);
	});
});

describe("mat-khau-yeu", () => {
	test("ngan hon do dai toi thieu thi tu choi voi thong diep do dai bang tieng Viet", async () => {
		const ket = await gieoNguoiVaChia();
		const matKhauNgan = "N".repeat(PASSWORD.minLength - 1);

		const dat = await thuDatMatKhau(ket.token, matKhauNgan);

		expect(dat.ok).toBe(false);
		expect(dat.message).toBe(CAU_MAT_KHAU.quaNgan(PASSWORD.minLength));
	});

	test("du dai nhung da lo thi tu choi voi thong diep khac ca do dai", async () => {
		const ket = await gieoNguoiVaChia();
		const daLo = "123456789012";

		const dat = await thuDatMatKhau(ket.token, daLo);

		if (dat.ok) {
			expect([
				"bo-qua-co-ten: khong voi toi duoc danh sach mat khau da lo luc chay bai kiem, nen bo sang cho qua theo dung luat fail-open",
				dat.ok,
			]).toEqual([
				"bo-qua-co-ten: khong voi toi duoc danh sach mat khau da lo luc chay bai kiem, nen bo sang cho qua theo dung luat fail-open",
				true,
			]);
			return;
		}

		expect(dat.message).not.toBe(CAU_MAT_KHAU.quaNgan(PASSWORD.minLength));
		expect(dat.message).toBe(CAU_MAT_KHAU.daLo);
	});

	test("du dai va sach thi duoc chap nhan", async () => {
		const ket = await gieoNguoiVaChia();
		const sach = matKhauSach("Sach-Kh");

		const dat = await thuDatMatKhau(ket.token, sach);

		expect(dat.ok).toBe(true);
	});

	test("chia song sot sau khi mat khau da lo bi tu choi, dat lai tren CHINH chia do", async () => {
		const ket = await gieoNguoiVaChia();
		const daLo = matKhauSach("Da-lo");
		const sach = matKhauSach("Sau-khi-bi-tu-choi");

		const mot = await voiDanhSachDaLoGia(
			() => traLoiDaLo(daLo),
			() => thuDatMatKhau(ket.token, daLo),
		);
		expect(mot.ok).toBe(false);
		expect(mot.message).toBe(CAU_MAT_KHAU.daLo);

		const hangChia = await db.verification.findFirst({
			where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` },
		});
		expect(hangChia).not.toBeNull();

		const hai = await voiDanhSachDaLoGia(traLoiSach, () =>
			thuDatMatKhau(ket.token, sach),
		);
		expect(hai.ok).toBe(true);
		expect((await thuDangNhap(ket.email, sach)).ok).toBe(true);
	});

	test("chia song sot sau khi mat khau qua ngan bi tu choi, dat lai tren CHINH chia do", async () => {
		const ket = await gieoNguoiVaChia();
		const ngan = "N".repeat(PASSWORD.minLength - 1);
		const sach = matKhauSach("Sau-khi-qua-ngan");

		const mot = await thuDatMatKhau(ket.token, ngan);
		expect(mot.ok).toBe(false);

		const hangChia = await db.verification.findFirst({
			where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` },
		});
		expect(hangChia).not.toBeNull();

		const hai = await voiDanhSachDaLoGia(traLoiSach, () =>
			thuDatMatKhau(ket.token, sach),
		);
		expect(hai.ok).toBe(true);
		expect((await thuDangNhap(ket.email, sach)).ok).toBe(true);
	});

	test("doi mat khau cung di qua sang: da lo bi tu choi, sach thi doi duoc", async () => {
		const ket = await gieoNguoiVaChia();
		const dau = matKhauSach("Mk-dau");

		const datLanDau = await voiDanhSachDaLoGia(traLoiSach, () =>
			thuDatMatKhau(ket.token, dau),
		);
		expect(datLanDau.ok).toBe(true);

		const banh = await dangNhapLayBanh(ket.email, dau);
		expect(banh).not.toBe("");

		const daLo = matKhauSach("Doi-sang-da-lo");
		const tuChoi = await voiDanhSachDaLoGia(
			() => traLoiDaLo(daLo),
			() => thuDoiMatKhau(banh, dau, daLo),
		);
		expect(tuChoi.ok).toBe(false);
		expect(tuChoi.message).toBe(CAU_MAT_KHAU.daLo);
		expect((await thuDangNhap(ket.email, dau)).ok).toBe(true);
		expect((await thuDangNhap(ket.email, daLo)).ok).toBe(false);

		const sach = matKhauSach("Doi-sang-sach");
		const duoc = await voiDanhSachDaLoGia(traLoiSach, () =>
			thuDoiMatKhau(banh, dau, sach),
		);
		expect(duoc.ok).toBe(true);
		expect((await thuDangNhap(ket.email, sach)).ok).toBe(true);
	});

	test("khong voi toi duoc danh sach da lo thi van dat duoc mat khau", async () => {
		const ket = await gieoNguoiVaChia();
		const sach = matKhauSach("Mang-chan-host-ngoai");

		const dat = await voiDanhSachDaLoGia(
			() => {
				throw new TypeError("fetch failed: mang doanh nghiep chan host ngoai");
			},
			() => thuDatMatKhau(ket.token, sach),
		);

		expect(dat.ok).toBe(true);
		expect((await thuDangNhap(ket.email, sach)).ok).toBe(true);
	});

	test("danh sach da lo tra loi khong-2xx thi van dat duoc mat khau", async () => {
		const ket = await gieoNguoiVaChia();
		const sach = matKhauSach("Sang-tra-503");

		const dat = await voiDanhSachDaLoGia(
			() => new Response("khong san sang", { status: 503 }),
			() => thuDatMatKhau(ket.token, sach),
		);

		expect(dat.ok).toBe(true);
		expect((await thuDangNhap(ket.email, sach)).ok).toBe(true);
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

	test("cau hinh cap nhat thong tin nguoi khi noi tai khoan", () => {
		const account = (
			auth.options as {
				account?: { accountLinking?: { updateUserInfoOnLink?: boolean } };
			}
		).account;

		expect(account?.accountLinking?.updateUserInfoOnLink).toBe(true);
	});

	test("nguoi trong danh sach duoc vao dang nhap that bang google thi tao duoc phien", async () => {
		if (!isGoogleConfigured()) {
			expect([BO_QUA_GOOGLE, isGoogleConfigured()]).toEqual([
				BO_QUA_GOOGLE,
				false,
			]);
			return;
		}

		const { email } = await gieoHangDuocVao();
		expect(await db.user.count({ where: { email } })).toBe(0);

		const vao = await dangNhapQuaGoogle({
			email,
			accountId: dinhDanh("google-id"),
			ten: "Nguoi vao bang google",
		});
		expect(vao.diaChiVe).not.toBeNull();
		expect(vao.diaChiVe ?? "").not.toContain("error=");

		const nguoi = await db.user.findMany({ where: { email } });
		expect(nguoi.length).toBe(1);

		const phien = await db.session.count({
			where: { userId: nguoi[0]?.id ?? "" },
		});
		expect(phien).toBeGreaterThan(0);

		const thanhVien = await db.member.count({
			where: { organizationId: WORKSPACE_ID, userId: nguoi[0]?.id ?? "" },
		});
		expect(thanhVien).toBe(1);
	});

	test("cua google tu choi token co hd lech voi hd da khoa, du nguoi trong danh sach", async () => {
		const hdDaKhoa = auth.options.socialProviders?.google?.hd;
		if (!isGoogleConfigured() || !hdDaKhoa) {
			expect([
				BO_QUA_HD_LECH,
				isGoogleConfigured() && Boolean(hdDaKhoa),
			]).toEqual([BO_QUA_HD_LECH, false]);
			return;
		}

		const { email } = await gieoHangDuocVao();

		const vao = await dangNhapQuaGoogle({
			email,
			accountId: dinhDanh("google-id"),
			ten: "Token lech mien",
			hd: `lech-${hdDaKhoa}`,
		});

		expect(vao.diaChiVe ?? "").toContain("error=unable_to_get_user_info");
		expect(await db.user.count({ where: { email } })).toBe(0);
	});

	test("nguoi ngoai danh sach duoc vao khong dang nhap duoc bang google", async () => {
		if (!isGoogleConfigured()) {
			expect([BO_QUA_GOOGLE, isGoogleConfigured()]).toEqual([
				BO_QUA_GOOGLE,
				false,
			]);
			return;
		}

		await dungKho();
		const email = `${dinhDanh("ngoai-ds")}@example.com`;

		await dangNhapQuaGoogle({
			email,
			accountId: dinhDanh("google-id"),
			ten: "Ke la",
		});

		expect(await db.user.count({ where: { email } })).toBe(0);
	});

	test("co ca hai cua thi van la mot hang nguoi dung, va phien vao duoc", async () => {
		if (!isGoogleConfigured()) {
			expect([BO_QUA_GOOGLE, isGoogleConfigured()]).toEqual([
				BO_QUA_GOOGLE,
				false,
			]);
			return;
		}

		const ket = await gieoNguoiVaChia();
		expect((await thuDatMatKhau(ket.token, matKhauSach("Hai-cua"))).ok).toBe(
			true,
		);

		await dangNhapQuaGoogle({
			email: ket.email,
			accountId: dinhDanh("google-id"),
			ten: "Nguoi thu qua Google",
		});

		expect(await db.user.count({ where: { email: ket.email } })).toBe(1);

		const taiKhoanGoogle = await db.account.findFirst({
			where: { userId: ket.userId, providerId: GOOGLE_PROVIDER_ID },
			select: { id: true },
		});
		expect(taiKhoanGoogle).not.toBeNull();

		expect(
			await db.session.count({ where: { userId: ket.userId } }),
		).toBeGreaterThan(0);
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

		const nguoiDuocPhat = await db.user.create({
			data: {
				id: dinhDanh("qua-chia"),
				email,
				name: "Duoc phat chia",
				emailVerified: true,
			},
		});
		const chia = await ducChia({
			userId: nguoiDuocPhat.id,
			appUrl: "http://localhost:3000",
		});
		const tokenChia = chia.url.split("/").at(-1) ?? "";
		const matKhauQuaChia = matKhauSach("Qua-chia-dia-chi-bi-chan-tu-dang-ky");
		const dat = await thuDatMatKhau(tokenChia, matKhauQuaChia);
		expect(dat.ok).toBe(true);
		expect((await thuDangNhap(email, matKhauQuaChia)).ok).toBe(true);
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
