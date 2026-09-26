import {
	afterEach,
	beforeEach,
	describe,
	expect,
	setDefaultTimeout,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { auth, xuLyXacThuc } from "../src/auth";
import { PASSWORD } from "../src/chia-mat-khau";
import { DIA_CHI, kyDiaChi } from "../src/dia-chi";
import { env } from "../src/env";
import { SANG_MAT_KHAU } from "../src/sang-mat-khau";
import { THU } from "../src/thu";

const suffix = process.env.TEST_RUN_ID ?? "quen-mat-khau-spec";
const DO_TRE_THU_MS = 1500;
const NUA_DO_TRE_MS = DO_TRE_THU_MS / 2;
const CHENH_TRUNG_VI_MS = 250;
const CHO_NEN_MS = 3000;
const SO_LUOT = 5;
const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const MAT_KHAU_MOI = "mot-cau-rat-dai-va-sach-2026";
const KHOA_VERCEL = Symbol.for("@vercel/request-context");
const HAN_XA = new Date("2099-01-01");
const HAN_CA_MS = 60_000;
const DIA_CHI_DU_PHONG = "127.0.0.1";
const CUA_SO_MS = PASSWORD.requestWindowSeconds * SECOND_MS;
const TRONG_CUA_SO_MS = CUA_SO_MS / 2;
const QUA_CUA_SO_MS = CUA_SO_MS + 10 * SECOND_MS;
const XA_QUA_CUA_SO_MS = 20 * SECONDS_PER_MINUTE * SECOND_MS;

setDefaultTimeout(HAN_CA_MS);

type ThuDaGui = { to: string[]; subject: string; text: string };
type CheDoThu = "tot" | "cham" | "loi-422" | "mang-chet" | "than-la";

const daGui: ThuDaGui[] = [];
let cheDoThu: CheDoThu = "tot";
let ipKe = 0;
const thatFetch = globalThis.fetch;
type NguCanhVercel = {
	get: () => { waitUntil: (p: Promise<unknown>) => void };
};
const nenDangChay: Promise<unknown>[] = [];

function datContextVercel(them?: (p: Promise<unknown>) => void): void {
	const nguCanh: NguCanhVercel = {
		get: () => ({
			waitUntil: (p: Promise<unknown>) => {
				nenDangChay.push(p);
				them?.(p);
			},
		}),
	};
	Reflect.set(globalThis, KHOA_VERCEL, nguCanh);
}

function dinhDanh(nhan: string): string {
	return `${suffix}-${nhan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ipMoi(): string {
	ipKe += 1;
	return `10.${(ipKe >> 16) & 255}.${(ipKe >> 8) & 255}.${ipKe & 255}`;
}

function duongCua(dau: RequestInfo | URL): string {
	return String(dau instanceof Request ? dau.url : dau);
}

beforeEach(() => {
	process.env.RESEND_API_KEY = "re_test_gia";
	process.env.MAIL_FROM = "CRM <no-reply@example.test>";
	daGui.length = 0;
	cheDoThu = "tot";
	datContextVercel();
	globalThis.fetch = (async (dau: RequestInfo | URL, them?: RequestInit) => {
		const duong = duongCua(dau);
		if (duong.startsWith(SANG_MAT_KHAU.goc)) {
			return new Response("", { status: 200 });
		}
		if (!duong.startsWith(THU.goc)) {
			return thatFetch(dau as RequestInfo, them);
		}
		if (cheDoThu === "mang-chet") throw new TypeError("fetch failed");
		if (cheDoThu === "cham") await Bun.sleep(DO_TRE_THU_MS);
		const than = JSON.parse(String(them?.body)) as ThuDaGui;
		if (cheDoThu === "loi-422") {
			return new Response(
				JSON.stringify({ message: `invalid to ${than.to[0]}` }),
				{ status: 422 },
			);
		}
		daGui.push(than);
		if (cheDoThu === "than-la") return new Response("ok", { status: 200 });
		return Response.json({ id: dinhDanh("thu") });
	}) as typeof fetch;
});

afterEach(async () => {
	await Promise.allSettled(nenDangChay.splice(0));
	globalThis.fetch = thatFetch;
	Reflect.deleteProperty(globalThis, KHOA_VERCEL);
});

async function dungKho(): Promise<void> {
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

async function gieoNguoi(
	loai: "con-quyen" | "thu-quyen" | "chi-google",
): Promise<{ id: string; email: string }> {
	await dungKho();
	const id = dinhDanh("u");
	const email = `${dinhDanh(loai)}@onehub.center`;
	await db.user.create({
		data: { id, name: "Nguoi thu", email, emailVerified: true },
	});
	await db.invitation.create({
		data: {
			id: dinhDanh("inv"),
			organizationId: WORKSPACE_ID,
			email,
			role: "member",
			status: loai === "thu-quyen" ? "cancelled" : "accepted",
			expiresAt: HAN_XA,
			inviterId: id,
		},
	});
	if (loai === "chi-google") {
		await db.account.create({
			data: {
				id: dinhDanh("acc"),
				userId: id,
				providerId: "google",
				accountId: dinhDanh("g"),
			},
		});
	}
	return { id, email };
}

function diaChiLa(): string {
	return `${dinhDanh("la")}@onehub.center`;
}

type KetQua = { ma: number; than: string; ms: number };

function khoaBiMat(): string {
	if (!env.authSecret) throw new Error("thieu BETTER_AUTH_SECRET cho phep do");
	return env.authSecret;
}

function headerDiaChi(ip: string) {
	return {
		"content-type": "application/json",
		[DIA_CHI.goc]: ip,
		[DIA_CHI.ky]: kyDiaChi(ip, khoaBiMat()),
	};
}

type ThanGoi = { email: string } | { token: string; newPassword: string };

async function goi(duong: string, than: ThanGoi, ip: string): Promise<KetQua> {
	const batDau = performance.now();
	const tra = await xuLyXacThuc(
		new Request(`${env.apiUrl}/api/auth${duong}`, {
			method: "POST",
			headers: headerDiaChi(ip),
			body: JSON.stringify(than),
		}),
	);
	const chu = await tra.text();
	return { ma: tra.status, than: chu, ms: performance.now() - batDau };
}

function xin(email: string, ip = ipMoi()): Promise<KetQua> {
	return goi("/request-password-reset", { email }, ip);
}

function datMatKhau(token: string, ip = ipMoi()): Promise<KetQua> {
	return goi("/reset-password", { token, newPassword: MAT_KHAU_MOI }, ip);
}

function chiaTuThu(thu: ThuDaGui | undefined): string {
	const khop = thu?.text.match(/\/dat-mat-khau\/([A-Za-z0-9_-]+)/);
	if (!khop?.[1]) throw new Error("thu khong co lien ket dat mat khau");
	return khop[1];
}

async function choNen(): Promise<void> {
	await Promise.race([
		Promise.allSettled(nenDangChay.splice(0)),
		Bun.sleep(CHO_NEN_MS),
	]);
}

function trungVi(so: number[]): number {
	const sapXep = [...so].sort((a, b) => a - b);
	return sapXep[Math.floor(sapXep.length / 2)] ?? 0;
}

async function dangNhapDuoc(email: string, matKhau: string): Promise<boolean> {
	try {
		await auth.api.signInEmail({ body: { email, password: matKhau } });
		return true;
	} catch {
		return false;
	}
}

function demChiaCon(userId: string): Promise<number> {
	return db.verification.count({
		where: {
			value: userId,
			identifier: { startsWith: PASSWORD.verificationPrefix },
		},
	});
}

async function lui(ip: string, ms: number): Promise<void> {
	await db.rateLimit.updateMany({
		where: { key: { startsWith: `${ip}|` } },
		data: { lastRequest: BigInt(Date.now() - ms) },
	});
}

function gaiContextVercel(): Promise<unknown>[] {
	const daGiao: Promise<unknown>[] = [];
	datContextVercel((p) => {
		daGiao.push(p);
	});
	return daGiao;
}

describe("cung-cau-tra-loi", () => {
	test("bon loai dia chi nhan cung ma va cung than tung byte", async () => {
		const conQuyen = await gieoNguoi("con-quyen");
		const thuQuyen = await gieoNguoi("thu-quyen");
		const chiGoogle = await gieoNguoi("chi-google");
		const ra = [
			await xin(conQuyen.email),
			await xin(diaChiLa()),
			await xin(thuQuyen.email),
			await xin(chiGoogle.email),
		];
		for (const [i, r] of ra.entries()) {
			expect({ i, ma: r.ma, than: r.than }).toEqual({
				i,
				ma: ra[0]?.ma ?? -1,
				than: ra[0]?.than ?? "",
			});
		}
		expect(ra[0]?.ma).toBe(200);
	});

	test("chu-hoa: dia chi go hoa van cung cau va thu toi dia chi dang luu", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		const la = await xin(diaChiLa());
		const hoa = await xin(nguoi.email.toUpperCase());
		expect(hoa.than).toBe(la.than);
		await choNen();
		expect(daGui.map((t) => t.to[0])).toEqual([nguoi.email]);
	});

	test("sai-khuon: chuoi khong phai email cung ma va than du giong tai khoan hay khong", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		const a = await xin(nguoi.email.replace("@", "#"));
		const b = await xin("khong-phai-email");
		expect({ ma: a.ma, than: a.than }).toEqual({ ma: b.ma, than: b.than });
	});
});

describe("khong-cho-thu", () => {
	test("tra loi khong cho thu cham, trung vi hai phia sat nhau, thu van di", async () => {
		cheDoThu = "cham";
		const co: number[] = [];
		const khong: number[] = [];
		for (let i = 0; i < SO_LUOT; i += 1) {
			const nguoi = await gieoNguoi("con-quyen");
			const r = await xin(nguoi.email);
			if (r.ms >= NUA_DO_TRE_MS) {
				throw new Error(`tra loi cho thu gui xong: ${Math.round(r.ms)} ms`);
			}
			co.push(r.ms);
			khong.push((await xin(diaChiLa())).ms);
		}
		expect(Math.abs(trungVi(co) - trungVi(khong))).toBeLessThan(
			CHENH_TRUNG_VI_MS,
		);
		await choNen();
		expect(daGui.length).toBe(SO_LUOT);
	});

	test("noi-nen: thu di trong waitUntil cua Vercel", async () => {
		cheDoThu = "cham";
		const daGiao = gaiContextVercel();
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		if (daGiao.length !== 1) {
			throw new Error(`thu khong nam trong waitUntil: ${daGiao.length} lan`);
		}
		expect(daGui.length).toBe(0);
		await daGiao[0];
		expect(daGui.length).toBe(1);
	});
});

describe("thu-dung-nguoi", () => {
	for (const loai of ["con-quyen", "chi-google"] as const) {
		test(`${loai}: dung mot thu, lien ket co chia trong kho, so phut tu hang so`, async () => {
			const nguoi = await gieoNguoi(loai);
			await xin(nguoi.email);
			await choNen();
			expect(daGui.length).toBe(1);
			expect(daGui[0]?.to).toEqual([nguoi.email]);
			expect(daGui[0]?.text).toContain(
				`${env.appUrl.replace(/\/$/, "")}/dat-mat-khau/`,
			);
			const hang = await db.verification.findFirst({
				where: {
					identifier: `${PASSWORD.verificationPrefix}${chiaTuThu(daGui[0])}`,
				},
			});
			expect(hang?.value).toBe(nguoi.id);
			expect(daGui[0]?.text).toContain(
				`${PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE} phút`,
			);
		});
	}

	test("dia chi la va dia chi da thu quyen khong nhan thu nao", async () => {
		const thuQuyen = await gieoNguoi("thu-quyen");
		await xin(thuQuyen.email);
		await xin(diaChiLa());
		await choNen();
		expect(daGui.length).toBe(0);
	});
});

describe("mot-lan", () => {
	test("dat xong bang chia 1 thi chia 1 va chia 2 deu chet, mat khau giu nguyen", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await xin(nguoi.email);
		await choNen();
		const [c1, c2] = daGui.map(chiaTuThu);
		expect((await datMatKhau(c1 ?? "")).ma).toBe(200);
		expect((await datMatKhau(c1 ?? "")).than).toContain("INVALID_TOKEN");
		const lan2 = await datMatKhau(c2 ?? "");
		if (!lan2.than.includes("INVALID_TOKEN")) {
			throw new Error("chia con treo van dung duoc");
		}
		expect(await dangNhapDuoc(nguoi.email, MAT_KHAU_MOI)).toBe(true);
		expect(await demChiaCon(nguoi.id)).toBe(0);
	});

	for (const che of ["cham", "mang-chet"] as const) {
		test(`resend-chet ${che}: don chia khong doi thu`, async () => {
			const nguoi = await gieoNguoi("con-quyen");
			await xin(nguoi.email);
			await xin(nguoi.email);
			await choNen();
			const [c1, c2] = daGui.map(chiaTuThu);
			cheDoThu = che;
			await datMatKhau(c1 ?? "");
			const lan2 = await datMatKhau(c2 ?? "");
			if (!lan2.than.includes("INVALID_TOKEN")) {
				throw new Error("don chia phu thuoc thu");
			}
			expect(await demChiaCon(nguoi.id)).toBe(0);
		});
	}
});

describe("het-han", () => {
	test("moc het han bang luc xin cong TTL; qua han thi tu choi, con han thi dat duoc", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		const t0 = Date.now();
		await xin(nguoi.email);
		await xin(nguoi.email);
		const t1 = Date.now();
		await choNen();
		const [c1, c2] = daGui.map(chiaTuThu);
		const hang = await db.verification.findFirst({
			where: { identifier: `${PASSWORD.verificationPrefix}${c1}` },
		});
		if (!hang) throw new Error("khong thay hang chia 1");
		const ttl = PASSWORD.tokenTtlSeconds * SECOND_MS;
		expect(hang.expiresAt.getTime()).toBeGreaterThanOrEqual(
			t0 + ttl - SECOND_MS,
		);
		expect(hang.expiresAt.getTime()).toBeLessThanOrEqual(t1 + ttl + SECOND_MS);
		await db.verification.update({
			where: { id: hang.id },
			data: { expiresAt: new Date(Date.now() - SECOND_MS) },
		});
		expect((await datMatKhau(c1 ?? "")).than).toContain("INVALID_TOKEN");
		expect(await dangNhapDuoc(nguoi.email, MAT_KHAU_MOI)).toBe(false);
		expect((await datMatKhau(c2 ?? "")).ma).toBe(200);
	});
});

describe("qua-luot", () => {
	test("bo dem bat va dung chung qua co so du lieu", () => {
		const gioiHan = auth.options.rateLimit;
		if (gioiHan?.storage !== "database") {
			throw new Error("bo dem khong chung giua cac instance");
		}
		expect(gioiHan.enabled).toBe(true);
	});

	test("lan thu tu trong cua so bi 429 va khong co thu, qua cua so thi xin lai duoc", async () => {
		const ip = ipMoi();
		const a = await gieoNguoi("con-quyen");
		const b = await gieoNguoi("con-quyen");
		const ma = [
			(await xin(a.email, ip)).ma,
			(await xin(diaChiLa(), ip)).ma,
			(await xin(diaChiLa(), ip)).ma,
		];
		await lui(ip, TRONG_CUA_SO_MS);
		ma.push((await xin(b.email, ip)).ma);
		if (ma[3] !== 429) throw new Error(`lan thu tu phai 429, duoc ${ma[3]}`);
		expect(ma.slice(0, 3)).toEqual([200, 200, 200]);
		await choNen();
		expect(daGui.map((t) => t.to[0])).toEqual([a.email]);
		await lui(ip, QUA_CUA_SO_MS);
		const sau = (await xin(b.email, ip)).ma;
		if (sau !== 200) {
			throw new Error(
				`qua cua so PASSWORD.requestWindowSeconds van bi chan: ${sau}`,
			);
		}
	});

	test("sau-don: bo don hang dem khong xoa cua so dang chan", async () => {
		const ip = ipMoi();
		for (let i = 0; i < PASSWORD.requestMax; i += 1) await xin(diaChiLa(), ip);
		await lui(ip, TRONG_CUA_SO_MS);
		const ipKhac = ipMoi();
		await xin(diaChiLa(), ipKhac);
		await lui(ipKhac, XA_QUA_CUA_SO_MS);
		await xin(diaChiLa(), ipKhac);
		await choNen();
		const ma = (await xin(diaChiLa(), ip)).ma;
		if (ma !== 429) {
			throw new Error(`bo don hang dem xoa cua so dang chan: lan thu tu ${ma}`);
		}
	});
});

describe("bao-da-doi", () => {
	test("dat mat khau khong cho thu bao, thu bao van di dung mot la", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		const chia = chiaTuThu(daGui[0]);
		daGui.length = 0;
		cheDoThu = "cham";
		const r = await datMatKhau(chia);
		if (r.ms >= NUA_DO_TRE_MS) {
			throw new Error(`dat mat khau cho thu bao: ${Math.round(r.ms)} ms`);
		}
		await choNen();
		expect(daGui.map((t) => t.to[0])).toEqual([nguoi.email]);
		expect(daGui[0]?.subject).toBe("Mật khẩu CRM OneHub vừa được đổi");
	});

	test("duoi-nguong: dat bi tu choi thi khong co thu bao", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		const chia = chiaTuThu(daGui[0]);
		await datMatKhau(chia);
		await choNen();
		const truoc = daGui.length;
		expect((await datMatKhau("chia-khong-ton-tai")).than).toContain(
			"INVALID_TOKEN",
		);
		expect((await datMatKhau(chia)).than).toContain("INVALID_TOKEN");
		await choNen();
		expect(daGui.length).toBe(truoc);
	});

	test("resend chet thi van dat duoc mat khau", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		cheDoThu = "mang-chet";
		expect((await datMatKhau(chiaTuThu(daGui[0]))).ma).toBe(200);
		expect(await dangNhapDuoc(nguoi.email, MAT_KHAU_MOI)).toBe(true);
	});

	test("noi-nen: thu bao nam trong waitUntil", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		const chia = chiaTuThu(daGui[0]);
		daGui.length = 0;
		cheDoThu = "cham";
		const daGiao = gaiContextVercel();
		await datMatKhau(chia);
		if (daGiao.length !== 1) {
			throw new Error(`thu khong nam trong waitUntil: ${daGiao.length} lan`);
		}
		await daGiao[0];
		expect(daGui.length).toBe(1);
	});
});

describe("thu-hong", () => {
	for (const che of ["loi-422", "mang-chet", "than-la"] as const) {
		test(`${che}: cau tra loi y nhu dia chi la, log khong mang dia chi hay than`, async () => {
			const dong: string[] = [];
			const ghi = (...doi: unknown[]) => {
				dong.push(doi.map(String).join(" "));
			};
			const warn = spyOn(console, "warn").mockImplementation(ghi);
			const error = spyOn(console, "error").mockImplementation(ghi);
			try {
				cheDoThu = che;
				const nguoi = await gieoNguoi("con-quyen");
				const la = await xin(diaChiLa());
				const co = await xin(nguoi.email);
				expect({ ma: co.ma, than: co.than }).toEqual({
					ma: la.ma,
					than: la.than,
				});
				await choNen();
				expect(dong.some((d) => d.includes("[auth]"))).toBe(true);
				if (che === "loi-422") {
					expect(dong.some((d) => d.includes("422"))).toBe(true);
				}
				const lo = dong.filter(
					(d) => d.includes(nguoi.email) || d.includes("invalid to"),
				);
				if (lo.length > 0)
					throw new Error(`log mang dia chi: ${lo.length} dong`);
			} finally {
				warn.mockRestore();
				error.mockRestore();
			}
		});
	}
});

describe("dia-chi-rieng", () => {
	test("hai dia chi ky khac nhau khong chan nhau", async () => {
		const a = ipMoi();
		const b = ipMoi();
		for (let i = 0; i < PASSWORD.requestMax; i += 1) await xin(diaChiLa(), a);
		expect((await xin(diaChiLa(), a)).ma).toBe(429);
		const maB = (await xin(diaChiLa(), b)).ma;
		if (maB !== 200)
			throw new Error(`hai dia chi chung mot khoa dem: B ${maB}`);
	});

	test("gia x-forwarded-for va chu ky sai khong ne duoc gioi han", async () => {
		await db.rateLimit.deleteMany({
			where: { key: { startsWith: `${DIA_CHI_DU_PHONG}|` } },
		});
		const ma: number[] = [];
		for (let i = 0; i <= PASSWORD.requestMax; i += 1) {
			const gia = ipMoi();
			const tra = await xuLyXacThuc(
				new Request(`${env.apiUrl}/api/auth/request-password-reset`, {
					method: "POST",
					headers: {
						"content-type": "application/json",
						"x-forwarded-for": gia,
						[DIA_CHI.goc]: gia,
						[DIA_CHI.ky]: "chu-ky-gia",
						[DIA_CHI.tin]: gia,
					},
					body: JSON.stringify({ email: diaChiLa() }),
				}),
			);
			ma.push(tra.status);
		}
		if (ma[PASSWORD.requestMax] !== 429) {
			throw new Error(`gia x-forwarded-for ne duoc gioi han: ${ma.join(",")}`);
		}
		expect(ma.slice(0, PASSWORD.requestMax)).toEqual(
			Array(PASSWORD.requestMax).fill(200),
		);
	});
});
