import { beforeEach, describe, expect, it } from "bun:test";
import { ALLOWANCE_WITHOUT_EXPIRY, auth } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	TRANG_THAI_HUY,
	TRANG_THAI_NHAN,
} from "@crm/validation/invitation-status";
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

async function loiChoPhepDaNhan(
	nguoiChoPhep: string,
	email: string,
	role: string,
): Promise<{ id: string }> {
	return db.invitation.create({
		data: {
			id: id(`loi-da-nhan-${crypto.randomUUID()}`),
			organizationId: WORKSPACE_ID,
			email: email.trim().toLowerCase(),
			role,
			status: "accepted",
			expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
			inviterId: nguoiChoPhep,
		},
		select: { id: true },
	});
}

async function haChuLa(chu: string): Promise<string[]> {
	const chuLa = await db.member.findMany({
		where: {
			organizationId: WORKSPACE_ID,
			role: "owner",
			userId: { not: chu },
		},
		select: { id: true },
	});
	const ids = chuLa.map((m) => m.id);
	await db.member.updateMany({
		where: { id: { in: ids } },
		data: { role: "member" },
	});
	return ids;
}

async function traVai(ids: string[]): Promise<void> {
	await db.member.updateMany({
		where: { id: { in: ids } },
		data: { role: "owner" },
	});
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
			"canceled mo, pending va accepted dong",
		]).toEqual([true, false, false, "canceled mo, pending va accepted dong"]);

		expect([
			truoc,
			sau,
			"dong cu giu nguyen, loi cho phep moi la dong MOI",
		]).toEqual([1, 2, "dong cu giu nguyen, loi cho phep moi la dong MOI"]);

		const cu = await db.invitation.findUnique({
			where: { id: dau.id },
			select: { status: true },
		});
		expect([cu?.status, "dong canceled cu con nguyen"]).toEqual([
			"canceled",
			"dong canceled cu con nguyen",
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
		const daHa = await haChuLa(chu);
		try {
			const chuMember = await db.member.findUnique({
				where: {
					organizationId_userId: { organizationId: WORKSPACE_ID, userId: chu },
				},
				select: { id: true },
			});

			const demTruoc = await db.member.count({
				where: { organizationId: WORKSPACE_ID },
			});
			const loiTruoc = await db.invitation.count({
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
			const loiSau = await db.invitation.count({
				where: { organizationId: WORKSPACE_ID },
			});

			expect([
				cau,
				demSau,
				loiSau,
				"cau tu choi GHIM nguyen van, va ca hai bang khong doi",
			]).toEqual([
				"The workspace needs an owner. Make someone else an owner first.",
				demTruoc,
				loiTruoc,
				"cau tu choi GHIM nguyen van, va ca hai bang khong doi",
			]);

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
		} finally {
			await traVai(daHa);
		}
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

		const loi = await loiChoPhepDaNhan(quan, diaHoa, "member");
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
			"canceled",
			"hang user luu chu hoa, loi cho phep luu chu thuong — van phai rut duoc",
		]);
	});

	it("go mot thanh vien cung rut loi cho phep cua ho", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");
		const bi = await dungNguoi("bi-go", "member");

		const loi = await loiChoPhepDaNhan(quan, `${bi}@onemount.com`, "member");
		await db.invitation.update({
			where: { id: loi.id },
			data: { status: "accepted" },
		});

		await db.session.create({
			data: {
				id: id("phien-bi-go"),
				token: id("token-bi-go"),
				userId: bi,
				expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
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

		const phienConLai = await db.session.count({ where: { userId: bi } });

		expect([
			hang,
			sau?.status,
			phienConLai,
			"hang thanh vien mat, loi cho phep thanh canceled, phien bi thu hoi",
		]).toEqual([
			null,
			"canceled",
			0,
			"hang thanh vien mat, loi cho phep thanh canceled, phien bi thu hoi",
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

		const { ensureWorkspaceMembership } = await import("@crm/auth");

		const quaKhiConPhep = await quaCong(conPhep);
		const hangConPhep = await db.user.create({
			data: nguoiMoi(conPhep),
		});
		await ensureWorkspaceMembership(hangConPhep.id, conPhep);

		const thanhVienConPhep = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: hangConPhep.id,
				},
			},
			select: { id: true },
		});

		const hangBiRut = await db.user.create({ data: nguoiMoi(biRut) });
		await ensureWorkspaceMembership(hangBiRut.id, biRut);

		const thanhVienBiRut = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: hangBiRut.id,
				},
			},
			select: { id: true },
		});

		expect([
			quaKhiConPhep,
			thanhVienConPhep !== null,
			thanhVienBiRut,
			"doi chung duong: con phep thi duong dang nhap CAP tu cach thanh vien, bi rut thi khong",
		]).toEqual([
			true,
			true,
			null,
			"doi chung duong: con phep thi duong dang nhap CAP tu cach thanh vien, bi rut thi khong",
		]);
	});
});

type PhienGieo = {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
};

type TruocPhien = (phien: PhienGieo) => Promise<{ data: unknown }>;

const PHIEN_MS = 7 * 24 * 60 * 60 * 1000;

function hookTruocPhien(): TruocPhien {
	const o = auth.options as {
		databaseHooks?: { session?: { create?: { before?: TruocPhien } } };
	};
	const before = o.databaseHooks?.session?.create?.before;
	if (before instanceof Function === false)
		throw new Error(
			"khong tim thay databaseHooks.session.create.before — khong do duoc duong tao phien that",
		);
	return before;
}

async function phienMoi(userId: string): Promise<string | null> {
	const now = new Date();
	const ra = await hookTruocPhien()({
		id: id(`phien-${userId}`),
		token: id(`token-${userId}`),
		userId,
		expiresAt: new Date(now.getTime() + PHIEN_MS),
		createdAt: now,
		updatedAt: now,
	});

	await db.session.create({ data: ra.data as PhienGieo });

	const daGhi = await db.session.findFirst({
		where: { userId },
		select: { activeOrganizationId: true },
	});

	return daGhi?.activeOrganizationId ?? null;
}

async function thanhVienCua(userId: string) {
	return db.member.findUnique({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		select: { id: true },
	});
}

describe("rut-khong-dung-da-vao", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("rut loi cho phep cua nguoi DA vao khong doi tu cach thanh vien lan duong tao phien", async () => {
		const quan = await dungNguoi("quan", "admin");

		const daVao = `da-vao-${suffix}@gmail.com`;
		const doiChung = `con-phep-${suffix}@gmail.com`;

		const loiDaVao = await workspace.allowEmail(quan, {
			email: daVao,
			role: "member",
		});
		await workspace.allowEmail(quan, { email: doiChung, role: "member" });

		const { ensureWorkspaceMembership } = await import("@crm/auth");

		const hangDaVao = await db.user.create({ data: nguoiMoi(daVao) });
		await ensureWorkspaceMembership(hangDaVao.id, daVao);

		const hangDoiChung = await db.user.create({ data: nguoiMoi(doiChung) });
		await ensureWorkspaceMembership(hangDoiChung.id, doiChung);

		const truocRut = await db.invitation.findFirst({
			where: { organizationId: WORKSPACE_ID, email: daVao },
			select: { status: true },
		});

		if (truocRut?.status !== TRANG_THAI_NHAN) {
			throw new Error(
				`tien de AC-4 chua dung: loi cho phep cua nguoi da vao phai o "${TRANG_THAI_NHAN}", doc lai thay "${truocRut?.status}"`,
			);
		}

		const demTruoc = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});

		await workspace.revokeAllowance(quan, { allowanceId: loiDaVao.id });

		const sauRut = await db.invitation.findFirst({
			where: { organizationId: WORKSPACE_ID, email: daVao },
			select: { status: true },
		});

		const demSau = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});

		const khoDaVao = await phienMoi(hangDaVao.id);
		const khoDoiChung = await phienMoi(hangDoiChung.id);

		const conThanhVien = await thanhVienCua(hangDaVao.id);
		const doiChungConThanhVien = await thanhVienCua(hangDoiChung.id);

		const nhan =
			"rut di qua thu tuc that: dong chuyen sang huy, so hang thanh vien khong doi, va nguoi bi rut tao phien y nhu nguoi con phep";

		expect([
			sauRut?.status ?? null,
			demSau === demTruoc,
			conThanhVien !== null,
			doiChungConThanhVien !== null,
			khoDaVao === khoDoiChung,
			khoDaVao,
			nhan,
		]).toEqual([TRANG_THAI_HUY, true, true, true, true, WORKSPACE_ID, nhan]);
	});
});

describe("go-tron-ven", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("NGUYEN TU: lenh ghi thu hai hong thi ca hai cung khong xay ra", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");
		const bi = await dungNguoi("nguyen-tu", "member");

		const loi = await loiChoPhepDaNhan(quan, `${bi}@onemount.com`, "member");
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

		const hong = new WorkspaceService(
			new Proxy(db, {
				get(muc, khoa, nhan) {
					if (khoa === "$transaction") {
						type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

						return (viec: (tx: Tx) => Promise<unknown>) =>
							db.$transaction(async (tx: Tx) => {
								const chan = new Proxy(tx as object, {
									get(t, k, n) {
										if (k === "invitation") {
											return {
												updateMany: () => {
													throw new Error("ep lenh ghi thu hai hong");
												},
											};
										}
										return Reflect.get(t, k, n);
									},
								});
								return viec(chan as Tx);
							});
					}
					return Reflect.get(muc, khoa, nhan);
				},
			}) as typeof db,
			agent,
		);

		let daNem = false;
		try {
			await hong.removeMember(quan, { memberId: biMember?.id ?? "" });
		} catch {
			daNem = true;
		}

		const conThanhVien = await db.member.findUnique({
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
			daNem,
			conThanhVien !== null,
			dongLoi?.status,
			"lenh ghi thu hai hong -> CA HAI deu khong xay ra",
		]).toEqual([
			true,
			true,
			"accepted",
			"lenh ghi thu hai hong -> CA HAI deu khong xay ra",
		]);
	});

	it("go xong thi dang nhap lai KHONG tu thanh vien lan nua", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");
		const bi = await dungNguoi("bi-go-lai", "member");

		const loi = await loiChoPhepDaNhan(quan, `${bi}@onemount.com`, "member");
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
			"dang nhap lai khong tu thanh vien, va loi cho phep van canceled",
		]).toEqual([
			null,
			"canceled",
			"dang nhap lai khong tu thanh vien, va loi cho phep van canceled",
		]);
	});
});

describe("trang-thai-that", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("bon o viet truoc: thu tuc danh sach tra ve dung trang thai da luu", async () => {
		const quan = await dungNguoi("quan-tt", "owner");

		const BANG = [
			["pending", "pending"],
			["accepted", "accepted"],
			["canceled", "canceled"],
			["rejected", "rejected"],
		] as const;

		expect(BANG.length).toBe(4);

		for (const [luu] of BANG) {
			await db.invitation.create({
				data: {
					id: id(`inv-${luu}`),
					organizationId: WORKSPACE_ID,
					email: `${suffix}-${luu}@onemount.com`,
					role: "member",
					status: luu,
					expiresAt: new Date("9999-12-31T00:00:00.000Z"),
					inviterId: quan,
				},
			});
		}

		const { rows } = await workspace.allowances(quan);

		for (const [luu, ra] of BANG) {
			const dong = rows.find(
				(r) => r.email === `${suffix}-${luu}@onemount.com`,
			);
			expect(
				dong?.status,
				`o "${luu}": luu "${luu}" thi thu tuc phai tra "${ra}", nhan "${dong?.status}"`,
			).toBe(ra);
		}
	});

	it("gia tri la ra unknown, khong hoa pending", async () => {
		const quan = await dungNguoi("quan-la", "owner");

		await db.invitation.create({
			data: {
				id: id("inv-la"),
				organizationId: WORKSPACE_ID,
				email: `${suffix}-la@onemount.com`,
				role: "member",
				status: "mot-chuoi-la",
				expiresAt: new Date("9999-12-31T00:00:00.000Z"),
				inviterId: quan,
			},
		});

		const { rows } = await workspace.allowances(quan);
		const dong = rows.find((r) => r.email === `${suffix}-la@onemount.com`);

		expect(
			dong?.status,
			`gia tri la phai ra "unknown", khong duoc hoa "pending", nhan "${dong?.status}"`,
		).toBe("unknown");
	});
});

describe("ghi-hang-co-ten", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("nut thu hoi ghi dung chuoi canceled vao co so du lieu", async () => {
		const quan = await dungNguoi("quan-ghi", "owner");
		const dia = `${suffix}-ghi@onemount.com`;

		const loi = await workspace.allowEmail(quan, {
			email: dia,
			role: "member",
		});

		await workspace.revokeAllowance(quan, { allowanceId: loi.id });

		const dong = await db.invitation.findUnique({
			where: { id: loi.id },
			select: { status: true },
		});

		expect(
			dong?.status,
			`nut thu hoi phai ghi chuoi "canceled" vao cot status, nhan "${dong?.status}"`,
		).toBe("canceled");

		expect(
			TRANG_THAI_HUY,
			`hang TRANG_THAI_HUY phai mang chuoi "canceled", nhan "${TRANG_THAI_HUY}"`,
		).toBe("canceled");
	});
});
