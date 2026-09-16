import { beforeEach, describe, expect, it } from "bun:test";
import { auth } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

const suffix = process.env.TEST_RUN_ID ?? "thanh-vien";

const agent = {
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

const workspace = new WorkspaceService(db, agent);

const id = (phan: string) => `${suffix}-${phan}`;

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

async function dungNguoi(phan: string, vai: string) {
	const now = new Date();
	const userId = id(phan);

	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: phan,
			email: `${userId}@onemount.com`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});

	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		create: {
			id: id(`member-${phan}`),
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
		update: { role: vai },
	});

	return userId;
}

async function don() {
	await db.invitation.deleteMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: `${suffix}` } },
			],
		},
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function demDong(email: string) {
	return db.invitation.count({
		where: { organizationId: WORKSPACE_ID, email },
	});
}

describe("chuan-hoa", () => {
	let quan = "";

	beforeEach(async () => {
		await don();
		await dungKho();
		quan = await dungNguoi("quan", "admin");
	});

	it("bang viet truoc, nam dong", async () => {
		const dia = `khue-${suffix}@gmail.com`;

		const dong2 = await workspace.allowEmail(quan, {
			email: `  KHUE-${suffix}@Gmail.com  `,
			role: "member",
		});
		expect([dong2.email, "dong 2 — ha chu thuong va cat khoang trang"]).toEqual(
			[dia, "dong 2 — ha chu thuong va cat khoang trang"],
		);

		let cau1 = "";
		try {
			await workspace.allowEmail(quan, {
				email: `  KHUE-${suffix}@Gmail.com  `,
				role: "member",
			});
		} catch (e) {
			cau1 = (e as Error).message;
		}
		expect([
			await demDong(dia),
			cau1.includes("already"),
			"dong 1 — khong de dong thu hai, va noi da co",
		]).toEqual([1, true, "dong 1 — khong de dong thu hai, va noi da co"]);

		for (const [n, xau] of [
			[3, "khue"],
			[4, "a@b@c.com"],
			[5, ""],
		] as const) {
			const truoc = await db.invitation.count();
			let daNem = false;
			try {
				await workspace.allowEmail(quan, { email: xau, role: "member" });
			} catch {
				daNem = true;
			}
			const sau = await db.invitation.count();

			expect([
				n,
				daNem,
				sau - truoc,
				"chan truoc khi cham co so du lieu",
			]).toEqual([n, true, 0, "chan truoc khi cham co so du lieu"]);
		}
	});
});

describe("cho-phep-lai", () => {
	let quan = "";

	beforeEach(async () => {
		await don();
		await dungKho();
		quan = await dungNguoi("quan", "admin");
	});

	it("ba ca, ba ket qua khac nhau", async () => {
		const dia = `lai-${suffix}@gmail.com`;

		const dau = await workspace.allowEmail(quan, {
			email: dia,
			role: "member",
		});

		let khiPending = true;
		try {
			await workspace.allowEmail(quan, { email: dia, role: "member" });
		} catch {
			khiPending = false;
		}

		await db.invitation.update({
			where: { id: dau.id },
			data: { status: "accepted" },
		});

		let khiAccepted = true;
		try {
			await workspace.allowEmail(quan, { email: dia, role: "member" });
		} catch {
			khiAccepted = false;
		}

		await workspace.revokeAllowance(quan, { allowanceId: dau.id });

		const truoc = await demDong(dia);
		let khiCancelled = true;
		try {
			await workspace.allowEmail(quan, { email: dia, role: "member" });
		} catch {
			khiCancelled = false;
		}
		const sau = await demDong(dia);

		if (khiPending === khiCancelled && khiAccepted === khiCancelled) {
			throw new Error(
				`ba ca cho cung mot ket qua (${khiCancelled}) — phep do khong phan biet duoc mo dung ca da rut voi mo tat hay dong tat`,
			);
		}

		expect([
			khiCancelled,
			khiPending,
			khiAccepted,
			"cancelled mo, pending va accepted dong",
		]).toEqual([true, false, false, "cancelled mo, pending va accepted dong"]);

		expect([
			truoc,
			sau,
			"dong cu giu nguyen, loi cho phep moi la dong MOI",
		]).toEqual([1, 2, "dong cu giu nguyen, loi cho phep moi la dong MOI"]);

		const cu = await db.invitation.findUnique({
			where: { id: dau.id },
			select: { status: true },
		});
		expect([cu?.status, "dong cancelled cu con nguyen"]).toEqual([
			"cancelled",
			"dong cancelled cu con nguyen",
		]);
	});
});

describe("chu-cuoi-cung", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("chu cuoi cung khong go duoc, hai chu thi go duoc", async () => {
		const chu = await dungNguoi("chu", "owner");
		const chuMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: chu },
			},
			select: { id: true },
		});

		const demTruoc = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});

		let cau = "";
		try {
			await workspace.removeMember(chu, { memberId: chuMember?.id ?? "" });
		} catch (e) {
			cau = (e as Error).message;
		}

		const demSau = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});

		expect([
			cau.length > 0,
			demSau,
			demTruoc,
			"tu choi, va khong dong nao doi",
		]).toEqual([true, demTruoc, demTruoc, "tu choi, va khong dong nao doi"]);

		const chuHai = await dungNguoi("chu-hai", "owner");
		const chuHaiMember = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: chuHai,
				},
			},
			select: { id: true },
		});

		await workspace.removeMember(chu, { memberId: chuHaiMember?.id ?? "" });

		const conLai = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: chuHai,
				},
			},
			select: { id: true },
		});

		expect([conLai, "doi chung duong: hai chu thi go duoc mot"]).toEqual([
			null,
			"doi chung duong: hai chu thi go duoc mot",
		]);
	});

	it("dia chi co CHU HOA o hang user van bi rut loi cho phep", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");

		const thuong = id("hoa-thuong");
		const now = new Date();
		const diaHoa = `HoaThuong-${suffix}@OneMount.com`;

		await db.user.upsert({
			where: { id: thuong },
			create: {
				id: thuong,
				name: "Hoa Thuong",
				email: diaHoa,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
			update: { email: diaHoa },
		});

		await db.member.upsert({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: thuong },
			},
			create: {
				id: id("member-hoa-thuong"),
				organizationId: WORKSPACE_ID,
				userId: thuong,
				role: "member",
				createdAt: now,
			},
			update: { role: "member" },
		});

		const loi = await workspace.allowEmail(quan, {
			email: diaHoa,
			role: "member",
		});
		await db.invitation.update({
			where: { id: loi.id },
			data: { status: "accepted" },
		});

		const thuongMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: thuong },
			},
			select: { id: true },
		});

		await workspace.removeMember(quan, { memberId: thuongMember?.id ?? "" });

		const sau = await db.invitation.findUnique({
			where: { id: loi.id },
			select: { status: true },
		});

		expect([
			sau?.status,
			"hang user luu chu hoa, loi cho phep luu chu thuong — van phai rut duoc",
		]).toEqual([
			"cancelled",
			"hang user luu chu hoa, loi cho phep luu chu thuong — van phai rut duoc",
		]);
	});

	it("go mot thanh vien cung rut loi cho phep cua ho", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");
		const bi = await dungNguoi("bi-go", "member");

		const loi = await workspace.allowEmail(quan, {
			email: `${bi}@onemount.com`,
			role: "member",
		});
		await db.invitation.update({
			where: { id: loi.id },
			data: { status: "accepted" },
		});

		const biMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		await workspace.removeMember(quan, { memberId: biMember?.id ?? "" });

		const hang = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		const sau = await db.invitation.findUnique({
			where: { id: loi.id },
			select: { status: true },
		});

		expect([
			hang,
			sau?.status,
			"hang thanh vien mat, loi cho phep thanh cancelled",
		]).toEqual([
			null,
			"cancelled",
			"hang thanh vien mat, loi cho phep thanh cancelled",
		]);
	});
});

describe("quyen-hai-ve", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("ve dich vu: vai member bi tu choi ca bon thu tuc, vai admin thi qua", async () => {
		await dungNguoi("chu", "owner");
		const thuong = await dungNguoi("thuong", "member");
		const quan = await dungNguoi("quan", "admin");

		const thuongMember = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: thuong,
				},
			},
			select: { id: true },
		});

		const goi = async (ai: string) => {
			const ket: boolean[] = [];

			for (const chay of [
				() => workspace.allowances(ai),
				() =>
					workspace.allowEmail(ai, {
						email: `x-${ai}@gmail.com`,
						role: "member",
					}),
				() => workspace.revokeAllowance(ai, { allowanceId: "khong-co" }),
				() => workspace.removeMember(ai, { memberId: thuongMember?.id ?? "" }),
			]) {
				try {
					await chay();
					ket.push(true);
				} catch (e) {
					ket.push(!(e as Error).message.includes("Only an owner or an admin"));
				}
			}

			return ket;
		};

		const cuaThuong = await goi(thuong);
		const cuaQuan = await goi(quan);

		expect([cuaThuong, "vai member: ca bon deu bi tu choi vi quyen"]).toEqual([
			[false, false, false, false],
			"vai member: ca bon deu bi tu choi vi quyen",
		]);

		expect([
			cuaQuan.every((qua) => qua),
			"doi chung duong: vai admin khong bi chan vi quyen o thu tuc nao",
		]).toEqual([
			true,
			"doi chung duong: vai admin khong bi chan vi quyen o thu tuc nao",
		]);
	});

	it("ve mat nguoi: co quyet dinh doc CUNG mot ham, va man Members khong nhap goi may chu", async () => {
		const chu = await dungNguoi("chu", "owner");
		const thuong = await dungNguoi("thuong", "member");

		const cuaChu = await workspace.get(chu);
		const cuaThuong = await workspace.get(thuong);

		expect([
			cuaChu.canManageMembers,
			cuaThuong.canManageMembers,
			"co bat cho chu, tat cho thanh vien thuong",
		]).toEqual([true, false, "co bat cho chu, tat cho thanh vien thuong"]);

		const transpiler = new Bun.Transpiler({ loader: "tsx" });
		const goc = `${import.meta.dir}/../../app/app/(app)/[slug]/settings/members`;
		const glob = new Bun.Glob("**/*.tsx");
		const pham: string[] = [];
		let daSoi = 0;

		for await (const ten of glob.scan({ cwd: goc })) {
			const ma = await Bun.file(`${goc}/${ten}`).text();
			if (!ma.includes('"use client"')) continue;

			daSoi += 1;
			const nhap = transpiler.scanImports(ma).map((m) => m.path);

			if (
				nhap.some(
					(path) => path === "@crm/auth" || path.startsWith("@crm/auth/"),
				)
			)
				pham.push(`${ten} nhap @crm/auth`);
			if (
				nhap.some((path) => path === "@crm/db" || path.startsWith("@crm/db/"))
			)
				pham.push(`${ten} nhap @crm/db`);
		}

		expect([
			daSoi > 0,
			pham,
			"co tep client de soi, va khong tep nao nhap goi may chu",
		]).toEqual([
			true,
			[],
			"co tep client de soi, va khong tep nao nhap goi may chu",
		]);
	});
});

type TruocTao = (user: {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}) => Promise<{ data: unknown }>;

function hookTruocTao(): TruocTao {
	const o = auth.options as {
		databaseHooks?: { user?: { create?: { before?: TruocTao } } };
	};
	const before = o.databaseHooks?.user?.create?.before;
	if (before instanceof Function === false)
		throw new Error(
			"khong tim thay databaseHooks.user.create.before — phep kiem khong con nam TRUOC khi ghi",
		);
	return before;
}

function nguoiMoi(email: string) {
	const now = new Date();
	return {
		id: `${suffix}-moi-${email.replace(/[^a-z0-9]/gi, "-")}`,
		name: "Nguoi Moi",
		email,
		emailVerified: true,
		createdAt: now,
		updatedAt: now,
	};
}

async function demBonBang() {
	const [user, account, session, verification] = await Promise.all([
		db.user.count(),
		db.account.count(),
		db.session.count(),
		db.verification.count(),
	]);
	return { user, account, session, verification };
}

async function quaCong(email: string): Promise<boolean> {
	try {
		await hookTruocTao()(nguoiMoi(email));
		return true;
	} catch {
		return false;
	}
}

describe("rut-chan-chua-vao", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("dia chi vua bi rut khong tao duoc hang nao, con dia chi con phep thi tao dung mot", async () => {
		const quan = await dungNguoi("quan", "admin");

		const biRut = `bi-rut-${suffix}@gmail.com`;
		const conPhep = `con-phep-${suffix}@gmail.com`;

		const loi = await workspace.allowEmail(quan, {
			email: biRut,
			role: "member",
		});
		await workspace.revokeAllowance(quan, { allowanceId: loi.id });
		await workspace.allowEmail(quan, { email: conPhep, role: "member" });

		const truoc = await demBonBang();
		const quaKhiRut = await quaCong(biRut);
		const sau = await demBonBang();

		expect([
			quaKhiRut,
			sau.user,
			sau.account,
			sau.session,
			sau.verification,
			"bi chan, va bon bang khong tang hang nao",
		]).toEqual([
			false,
			truoc.user,
			truoc.account,
			truoc.session,
			truoc.verification,
			"bi chan, va bon bang khong tang hang nao",
		]);

		const quaKhiConPhep = await quaCong(conPhep);
		await db.user.create({ data: nguoiMoi(conPhep) });
		const cuoi = await demBonBang();

		expect([
			quaKhiConPhep,
			cuoi.user - sau.user,
			"doi chung duong: dia chi con phep tao dung mot hang user",
		]).toEqual([
			true,
			1,
			"doi chung duong: dia chi con phep tao dung mot hang user",
		]);
	});
});

describe("go-tron-ven", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("go xong thi dang nhap lai KHONG tu thanh vien lan nua", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");
		const bi = await dungNguoi("bi-go-lai", "member");

		const loi = await workspace.allowEmail(quan, {
			email: `${bi}@onemount.com`,
			role: "member",
		});
		await db.invitation.update({
			where: { id: loi.id },
			data: { status: "accepted" },
		});

		const biMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		await workspace.removeMember(quan, { memberId: biMember?.id ?? "" });

		const { ensureWorkspaceMembership } = await import("@crm/auth");
		await ensureWorkspaceMembership(bi, `${bi}@onemount.com`);

		const lai = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		const dongLoi = await db.invitation.findUnique({
			where: { id: loi.id },
			select: { status: true },
		});

		expect([
			lai,
			dongLoi?.status,
			"dang nhap lai khong tu thanh vien, va loi cho phep van cancelled",
		]).toEqual([
			null,
			"cancelled",
			"dang nhap lai khong tu thanh vien, va loi cho phep van cancelled",
		]);
	});
});
