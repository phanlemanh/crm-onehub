import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	spyOn,
} from "bun:test";
import {
	decideSignIn,
	ensureWorkspaceMembership,
	NOT_A_MEMBER,
	type WorkspaceRole,
} from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { docTrangThai } from "@crm/validation/invitation-status";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import { normalizeDomain } from "../src/companies/domain";
import { createApp } from "../src/create-app";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { EnrichmentLogService } from "../src/crm/enrichment-log.service";
import { MailboxMatchService } from "../src/mailbox/mailbox-match.service";
import { TrackingCounterService } from "../src/tracking/tracking-counter.service";
import { TrackingFilingService } from "../src/tracking/tracking-filing.service";
import {
	APP_SETTING_ID,
	staffEmailDomains,
} from "../src/workspace/staff-domains";
import {
	ALREADY_A_MEMBER,
	WorkspaceService,
} from "../src/workspace/workspace.service";
import { dungKho, gieoThanhVien, mintPhien } from "./phien-thu";
import {
	COT_DA_LUU_AC1,
	TEN_MIEN_DA_LUU_AC1,
	TEN_MIEN_MANG_AC1,
} from "./thanh-vien-vao-dung.fixture";

const suffix = `tvvd-${process.env.TEST_RUN_ID ?? "local"}`;
const id = (phan: string) => `${suffix}-${phan}`;

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: async (_scope: string, viec: () => Promise<unknown>) => viec(),
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

const workspace = new WorkspaceService(db, agent);

const hopThu = new MailboxMatchService(
	db,
	new CompanyDirectoryService(agent),
	agent,
	new EnrichmentLogService(db, new ActivityStampService(db)),
);

const lapHoSo = new TrackingFilingService(
	db,
	new TrackingCounterService(db),
	new CompanyDirectoryService(agent),
	agent,
	new ActivityStampService(db),
);

let cotGoc: string | null = null;

async function docCot(): Promise<string | null> {
	const dong = await db.appSetting.findUnique({
		where: { id: APP_SETTING_ID },
		select: { staffEmailDomains: true },
	});
	return dong?.staffEmailDomains ?? null;
}

async function datCot(value: string | null): Promise<void> {
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: value },
		update: { staffEmailDomains: value },
	});
}

async function dungNguoi(phan: string, vai: WorkspaceRole): Promise<string> {
	const userId = id(phan);
	await gieoThanhVien(userId, vai);
	return userId;
}

async function don(): Promise<void> {
	await db.formSubmission.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.invitation.deleteMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: suffix } },
			],
		},
	});
	await db.session.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function nopForm(phan: string, email: string): Promise<string | null> {
	const ma = `${suffix}-${phan}-${Date.now().toString(36)}`;
	await db.formSubmission.create({
		data: {
			id: ma,
			host: "www.example.test",
			path: "/lien-he",
			email,
			fields: {},
			dedupeKey: ma,
		},
	});
	try {
		const ket = await lapHoSo.file({
			id: ma,
			email,
			host: "www.example.test",
			visitorId: null,
			name: "Ai Do",
		});
		return ket.filed ? null : ket.reason;
	} catch {
		return "di qua cong domain nha roi hong o buoc sau";
	}
}

async function loiCua(viec: () => Promise<unknown>): Promise<string | null> {
	try {
		await viec();
		return null;
	} catch (e) {
		return (e as Error).message;
	}
}

beforeAll(async () => {
	cotGoc = await docCot();
});

afterAll(async () => {
	await datCot(cotGoc);
	await don();
});

describe("ten-mien", () => {
	let quan = "";

	beforeEach(async () => {
		await don();
		await datCot(null);
		quan = await dungNguoi("quan", "admin");
	});

	it("ghi-chuan-hoa: viet thuong, bo @, bo trung, giu thu tu, bo muc rong", async () => {
		const truoc = await workspace.staffDomains(quan);
		const cotTruoc = await docCot();

		const ket = await workspace.setStaffDomains(quan, {
			domains: TEN_MIEN_MANG_AC1,
		});
		const cotSau = await docCot();
		const doc = await workspace.staffDomains(quan);

		const rong = await workspace.setStaffDomains(quan, {
			domains: ["onehub.vn", "", "  "],
		});

		expect([truoc.domains, cotTruoc, "doi chung: truoc khi ghi rong"]).toEqual([
			[],
			null,
			"doi chung: truoc khi ghi rong",
		]);
		expect([ket, cotSau, doc, "ghi-chuan-hoa"]).toEqual([
			TEN_MIEN_DA_LUU_AC1,
			COT_DA_LUU_AC1,
			TEN_MIEN_DA_LUU_AC1,
			"ghi-chuan-hoa",
		]);
		expect([rong.domains, "bo muc rong"]).toEqual([
			["onehub.vn"],
			"bo muc rong",
		]);
	});

	it("hai-duong-doc: tracking va hop thu doc ten mien vua ghi qua dich vu", async () => {
		const nguoiOneHubVn = await db.user.count({
			where: { email: { endsWith: "@onehub.vn" } },
		});
		const nopTruoc = await nopForm("truoc", `khach-${suffix}@onehub.vn`);

		await workspace.setStaffDomains(quan, {
			domains: ["onehub.center", "onehub.vn"],
		});

		const nopSau = await nopForm("sau", `khach-${suffix}@onehub.vn`);
		const nha = (await hopThu.internalIdentity()).domains.has("onehub.vn");

		expect([nguoiOneHubVn, "dieu kien: khong user nao @onehub.vn"]).toEqual([
			0,
			"dieu kien: khong user nao @onehub.vn",
		]);
		expect([
			nopTruoc === "One of our own addresses",
			nopSau,
			nha,
			"hai-duong-doc",
		]).toEqual([false, "One of our own addresses", true, "hai-duong-doc"]);
	});

	it("tu-choi: ba muc sai, moi muc goi ten, cot khong doi", async () => {
		const MA_TRAN = ["khong phai ten mien", "ai@onehub.vn", "gmail.com"];
		const ket: [string, boolean, string | null][] = [];

		for (const muc of MA_TRAN) {
			await datCot("onehub.center");
			const loi = await loiCua(() =>
				workspace.setStaffDomains(quan, { domains: ["onehub.vn", muc] }),
			);
			ket.push([muc, loi?.includes(muc) === true, await docCot()]);
		}

		await datCot("onehub.center");
		const duong = await loiCua(() =>
			workspace.setStaffDomains(quan, { domains: ["onehub.vn"] }),
		);

		expect([ket, "tu-choi"]).toEqual([
			MA_TRAN.map((muc) => [muc, true, "onehub.center"]),
			"tu-choi",
		]);
		expect([duong, "doi chung duong: mot ten mien dung thi qua"]).toEqual([
			null,
			"doi chung duong: mot ten mien dung thi qua",
		]);
	});

	it("xoa-trang: luu null, hai duong doc rong", async () => {
		await datCot("onehub.center");
		const nopTruoc = await nopForm(
			"xoa-truoc",
			`khach-${suffix}@onehub.center`,
		);

		const ket = await workspace.setStaffDomains(quan, { domains: [] });
		const nopSau = await nopForm("xoa-sau", `khach-${suffix}@onehub.center`);

		expect([nopTruoc, "doi chung: co ten mien thi bo qua"]).toEqual([
			"One of our own addresses",
			"doi chung: co ten mien thi bo qua",
		]);
		expect([
			ket.domains,
			await docCot(),
			[...(await staffEmailDomains(db))],
			nopSau === "One of our own addresses",
			"xoa-trang",
		]).toEqual([[], null, [], false, "xoa-trang"]);
	});

	it("tran-20: hai muoi mot ten mien bi tu choi, cot khong doi", async () => {
		await datCot("onehub.center");
		const nhieu = Array.from({ length: 21 }, (_, i) => `t${i}.vn`);

		const loi = await loiCua(() =>
			workspace.setStaffDomains(quan, { domains: nhieu }),
		);

		expect([loi?.includes("20") === true, await docCot(), "tran-20"]).toEqual([
			true,
			"onehub.center",
			"tran-20",
		]);
	});

	it("ten-mien-phu: ten mien con la mot muc rieng", async () => {
		const ket = await workspace.setStaffDomains(quan, {
			domains: ["onehub.vn", "mail.onehub.vn"],
		});

		expect([ket.domains, await docCot(), "ten-mien-phu"]).toEqual([
			["onehub.vn", "mail.onehub.vn"],
			"onehub.vn,mail.onehub.vn",
			"ten-mien-phu",
		]);
	});

	it("ten-mien-co-dau: luu dung dang normalizeDomain tra, khong nem 500", async () => {
		const mongDoi = normalizeDomain("công-ty.vn");

		const ket = await workspace.setStaffDomains(quan, {
			domains: ["công-ty.vn"],
		});

		expect([mongDoi === null, ket.domains, "ten-mien-co-dau"]).toEqual([
			false,
			[mongDoi ?? "(normalizeDomain tra null)"],
			"ten-mien-co-dau",
		]);
	});
});

describe("ten-mien ba-vai qua router that", () => {
	let app: INestApplication;
	const cookie = {
		admin: "",
		member: "",
		okr: "",
		ngoai: "",
	};

	beforeAll(async () => {
		await don();
		await datCot(null);
		app = await createApp();
		for (const vai of ["admin", "member", "okr"] as const) {
			cookie[vai] = (
				await mintPhien(await dungNguoi(`vai-${vai}`, vai))
			).cookie;
		}
		const ngoai = id("vai-ngoai");
		const now = new Date();
		await db.user.create({
			data: {
				id: ngoai,
				name: ngoai,
				email: `${ngoai}@thu.test`,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
		});
		cookie.ngoai = (await mintPhien(ngoai)).cookie;
	});

	afterAll(async () => {
		await app.close();
	});

	async function doc(ai: keyof typeof cookie) {
		const res = await request(app.getHttpServer())
			.get("/api/trpc/workspace.staffDomains")
			.set("cookie", cookie[ai]);
		return {
			status: res.status,
			canEdit: res.body?.result?.data?.canEdit ?? null,
			loi: String(res.body?.error?.message ?? ""),
		};
	}

	async function ghi(ai: keyof typeof cookie) {
		const res = await request(app.getHttpServer())
			.post("/api/trpc/workspace.setStaffDomains")
			.set("cookie", cookie[ai])
			.set("content-type", "application/json")
			.send(JSON.stringify({ domains: [`${ai}.vn`] }));
		return { status: res.status, loi: String(res.body?.error?.message ?? "") };
	}

	it("ba-vai: quan tri sua duoc, thanh vien chi doc, nguoi ngoai bi chan", async () => {
		async function vong(ai: keyof typeof cookie) {
			const d = await doc(ai);
			const g = await ghi(ai);
			return [d.status, d.canEdit, d.loi, g.status, g.loi] as const;
		}

		const admin = await vong("admin");
		await datCot("onehub.center");
		const member = [...(await vong("member")), await docCot()];
		const okr = [...(await vong("okr")), await docCot()];
		const ngoai = [...(await vong("ngoai")), await docCot()];

		expect([admin[0], admin[1], admin[3], "quan tri"]).toEqual([
			200,
			true,
			200,
			"quan tri",
		]);
		expect([
			member[0],
			member[1],
			member[3],
			member[5],
			"thanh vien thuong",
		]).toEqual([200, false, 403, "onehub.center", "thanh vien thuong"]);
		expect([okr[0], okr[1], okr[3], okr[5], "vai chi okr"]).toEqual([
			200,
			false,
			403,
			"onehub.center",
			"vai chi okr",
		]);
		expect([
			ngoai[0],
			ngoai[2],
			ngoai[3],
			ngoai[4],
			ngoai[5],
			"nguoi ngoai",
		]).toEqual([
			403,
			NOT_A_MEMBER,
			403,
			NOT_A_MEMBER,
			"onehub.center",
			"nguoi ngoai",
		]);
	});
});

async function demDong(email: string): Promise<number> {
	return db.invitation.count({
		where: { organizationId: WORKSPACE_ID, email },
	});
}

async function gieoNguoi(phan: string, email: string): Promise<string> {
	const userId = id(phan);
	const now = new Date();
	await db.user.create({
		data: {
			id: userId,
			name: phan,
			email,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
	});
	return userId;
}

async function ganThanhVien(
	userId: string,
	vai: WorkspaceRole,
): Promise<string> {
	const memberId = id(`member-${userId}`);
	await db.member.create({
		data: {
			id: memberId,
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: new Date(),
		},
	});
	return memberId;
}

describe("cho-phep", () => {
	let quan = "";

	beforeEach(async () => {
		await don();
		quan = await dungNguoi("quan", "admin");
	});

	it("da-la-thanh-vien: tu choi, khong tao dong, khac hoa van nhan ra", async () => {
		const email = `${suffix}-da-vao@lan-do.onehub.vn`;
		await ganThanhVien(await gieoNguoi("da-vao", email), "member");
		const truoc = await demDong(email);

		const loi = await loiCua(() =>
			workspace.allowEmail(quan, {
				email: `  ${email.toUpperCase()} `,
				role: "member",
			}),
		);
		const sau = await demDong(email);

		const moi = `${suffix}-chua-vao@lan-do.onehub.vn`;
		const duong = await workspace.allowEmail(quan, {
			email: moi,
			role: "member",
		});

		expect([loi, truoc, sau, "da-la-thanh-vien"]).toEqual([
			ALREADY_A_MEMBER,
			0,
			0,
			"da-la-thanh-vien",
		]);
		expect([
			duong.status,
			await demDong(moi),
			"doi chung duong: dia chi moi",
		]).toEqual(["pending", 1, "doi chung duong: dia chi moi"]);
	});

	it("treo-khi-doc: dong pending cua thanh vien doc thanh accepted, khong ghi", async () => {
		const treo = `${suffix}-treo@lan-do.onehub.vn`;
		const cho = `${suffix}-cho@lan-do.onehub.vn`;
		await ganThanhVien(await gieoNguoi("treo", treo), "member");
		for (const [phan, email] of [
			["dong-treo", treo],
			["dong-cho", cho],
		] as const) {
			await db.invitation.create({
				data: {
					id: id(phan),
					organizationId: WORKSPACE_ID,
					email,
					role: "member",
					status: "pending",
					expiresAt: new Date("9999-12-31T00:00:00.000Z"),
					inviterId: quan,
				},
			});
		}

		const { rows } = await workspace.allowances(quan);
		const theoDiaChi = Object.fromEntries(
			rows
				.filter((r) => r.email === treo || r.email === cho)
				.map((r) => [r.email, r.status]),
		);
		const trongDb = await db.invitation.findUnique({
			where: { id: id("dong-treo") },
			select: { status: true },
		});

		expect([theoDiaChi[treo], trongDb?.status, "treo-khi-doc"]).toEqual([
			"accepted",
			"pending",
			"treo-khi-doc",
		]);
		expect([
			theoDiaChi[cho],
			"doi chung: dia chi chua vao van pending",
		]).toEqual(["pending", "doi chung: dia chi chua vao van pending"]);
	});

	it("cho-phep-lai-sau-go: nguoi da bi go duoc cho phep lai va vao voi vai moi", async () => {
		const email = `${suffix}-go@lan-do.onehub.vn`;
		const userId = await gieoNguoi("go", email);
		const memberId = await ganThanhVien(userId, "member");

		await workspace.removeMember(quan, { memberId });
		const lai = await workspace.allowEmail(quan, { email, role: "admin" });
		await ensureWorkspaceMembership(userId, email);

		const member = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId },
			},
			select: { role: true },
		});
		const dong = await db.invitation.findUnique({
			where: { id: lai.id },
			select: { status: true },
		});

		expect([
			lai.status,
			member?.role,
			dong?.status,
			"cho-phep-lai-sau-go",
		]).toEqual(["pending", "admin", "accepted", "cho-phep-lai-sau-go"]);
	});
});

describe("cho-phep khong-quyen qua router that", () => {
	let app: INestApplication;
	let cookieThuong = "";
	let cookieQuan = "";

	beforeAll(async () => {
		await don();
		app = await createApp();
		cookieThuong = (await mintPhien(await dungNguoi("kq-thuong", "member")))
			.cookie;
		cookieQuan = (await mintPhien(await dungNguoi("kq-quan", "admin"))).cookie;
	});

	afterAll(async () => {
		await app.close();
	});

	async function choPhep(cookie: string, email: string) {
		const res = await request(app.getHttpServer())
			.post("/api/trpc/workspace.allowEmail")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ email, role: "member" }));
		return { status: res.status, loi: String(res.body?.error?.message ?? "") };
	}

	it("khong-quyen: thanh vien thuong bi 403, khong tao dong", async () => {
		const email = `${suffix}-kq@lan-do.onehub.vn`;
		const truoc = await demDong(email);
		const thuong = await choPhep(cookieThuong, email);
		const sau = await demDong(email);
		const quan = await choPhep(cookieQuan, email);

		expect([thuong.status, thuong.loi, truoc, sau, "khong-quyen"]).toEqual([
			403,
			"Only an owner or an admin can allow an address.",
			0,
			0,
			"khong-quyen",
		]);
		expect([
			quan.status,
			await demDong(email),
			"doi chung duong: quan tri tao 1 dong",
		]).toEqual([200, 1, "doi chung duong: quan tri tao 1 dong"]);
	});
});

describe("dung-lai", () => {
	type HangMember = Awaited<ReturnType<typeof db.member.findMany>>[number];
	let nguoiMoi = "";
	let giu: HangMember[] = [];
	let loiGhi: ReturnType<typeof spyOn> | null = null;

	beforeEach(async () => {
		await don();
		await dungKho();
		nguoiMoi = await gieoNguoi("moi", `${suffix}-moi@lan-do.onehub.vn`);
		giu = await db.member.findMany({ where: { organizationId: WORKSPACE_ID } });
		await db.member.deleteMany({ where: { organizationId: WORKSPACE_ID } });
	});

	afterEach(async () => {
		loiGhi?.mockRestore();
		loiGhi = null;
		await db.member.deleteMany({ where: { organizationId: WORKSPACE_ID } });
		await db.member.createMany({ data: giu, skipDuplicates: true });
		await don();
	});

	async function dong(phan: string, email: string, status: string) {
		await db.invitation.create({
			data: {
				id: id(phan),
				organizationId: WORKSPACE_ID,
				email,
				role: "member",
				status,
				expiresAt: new Date("9999-12-31T00:00:00.000Z"),
				inviterId: nguoiMoi,
			},
		});
	}

	it("A con dong hieu luc thi vao, B chi co dong ket thuc thi khong, D trang thai la thi khong va ghi loi", async () => {
		const diaChi = {
			A: `${suffix}-a@lan-do.onehub.vn`,
			B: `${suffix}-b@lan-do.onehub.vn`,
			C: `${suffix}-c@lan-do.onehub.vn`,
			D: `${suffix}-d@lan-do.onehub.vn`,
		};
		const nguoi = {
			A: await gieoNguoi("a", diaChi.A),
			B: await gieoNguoi("b", diaChi.B),
			C: await gieoNguoi("c", diaChi.C),
			D: await gieoNguoi("d", diaChi.D),
		};
		await dong("a-huy", diaChi.A, "canceled");
		await dong("a-cho", diaChi.A, "pending");
		await dong("b-huy", diaChi.B, "canceled");
		await dong("d-hong", diaChi.D, "bi-hong");
		loiGhi = spyOn(console, "error").mockImplementation(() => {});

		await ensureWorkspaceMembership(nguoi.C, diaChi.C);

		const vao = Object.fromEntries(
			await Promise.all(
				(Object.keys(nguoi) as (keyof typeof nguoi)[]).map(async (ai) => [
					ai,
					(await db.member.findUnique({
						where: {
							organizationId_userId: {
								organizationId: WORKSPACE_ID,
								userId: nguoi[ai],
							},
						},
						select: { id: true },
					})) !== null,
				]),
			),
		);
		const dangNhapD = decideSignIn({
			email: diaChi.D,
			allowances: [
				{
					email: diaChi.D,
					role: "member",
					status: docTrangThai("bi-hong").trangThai,
				},
			],
			seedList: "",
			anyUserExists: true,
		}).allowed;
		const dongLoi = loiGhi.mock.calls.filter((c: unknown[]) =>
			String(c[0]).includes("bi-hong"),
		);

		expect([vao, "A"]).toEqual([{ A: true, B: false, C: true, D: false }, "A"]);
		expect([dangNhapD, "D khop luat dang nhap"]).toEqual([
			false,
			"D khop luat dang nhap",
		]);
		expect([dongLoi.length, "mot dong loi goi ten bi-hong"]).toEqual([
			1,
			"mot dong loi goi ten bi-hong",
		]);
	});
});
