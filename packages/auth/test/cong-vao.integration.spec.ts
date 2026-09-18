import { beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	TRANG_THAI_CHO,
	TRANG_THAI_HUY,
	TRANG_THAI_NHAN,
} from "@crm/validation/invitation-status";
import { ALLOWANCE_WITHOUT_EXPIRY } from "../src/allow-list";
import { auth } from "../src/auth";
import { ensureWorkspaceMembership } from "../src/organization";

const suffix = process.env.TEST_RUN_ID ?? "cong-vao-spec";

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
		databaseHooks?: {
			user?: { create?: { before?: TruocTao } };
		};
	};
	const before = o.databaseHooks?.user?.create?.before;
	if (before instanceof Function === false)
		throw new Error(
			"khong tim thay databaseHooks.user.create.before — phep kiem khong con nam TRUOC khi ghi",
		);
	return before;
}

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
		databaseHooks?: {
			session?: { create?: { before?: TruocPhien } };
		};
	};
	const before = o.databaseHooks?.session?.create?.before;
	if (before instanceof Function === false)
		throw new Error(
			"khong tim thay databaseHooks.session.create.before — khong do duoc duong tao phien that",
		);
	return before;
}

function phienCua(userId: string): PhienGieo {
	const now = new Date();
	return {
		id: `${suffix}-s-${userId}`,
		token: `${suffix}-t-${userId}`,
		userId,
		expiresAt: new Date(now.getTime() + PHIEN_MS),
		createdAt: now,
		updatedAt: now,
	};
}

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

async function dem() {
	const [user, account, session, verification] = await Promise.all([
		db.user.count(),
		db.account.count(),
		db.session.count(),
		db.verification.count(),
	]);
	return { user, account, session, verification };
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
	await db.session.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function choPhep(
	email: string,
	role = "member",
	trangThai: string = TRANG_THAI_CHO,
) {
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
			role,
			status: trangThai,
			expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
			inviterId: chu.id,
		},
	});
}

async function thu(email: string): Promise<boolean> {
	try {
		await hookTruocTao()(nguoi(email));
		return true;
	} catch {
		return false;
	}
}

describe("duong-moi", () => {
	beforeEach(async () => {
		await don();
	});

	it("bang rong va chua ai dang nhap thi moi co tieng noi", async () => {
		const conAi = await db.user.count();
		if (conAi > 0) {
			expect(["bo qua — co so du lieu con nguoi that", conAi]).toEqual([
				"bo qua — co so du lieu con nguoi that",
				conAi,
			]);
			return;
		}

		process.env.ALLOWED_SIGN_IN = "onemount.com";
		const truoc = await dem();
		const qua = await thu("ai-do@onemount.com");

		expect([qua, "moi cho qua khi chua ai dang nhap"]).toEqual([
			true,
			"moi cho qua khi chua ai dang nhap",
		]);

		await db.user.create({ data: nguoi("ai-do@onemount.com") });
		const sau = await dem();

		expect([sau.user - truoc.user, "hang user them"]).toEqual([
			1,
			"hang user them",
		]);
		await don();
	});

	it("bang rong nhung DA co nguoi thi moi cam", async () => {
		process.env.ALLOWED_SIGN_IN = "onemount.com";
		await db.user.create({ data: nguoi("nguoi-cu@onemount.com") });

		const truoc = await dem();
		const qua = await thu("nguoi-moi@onemount.com");

		expect([qua, "moi phai cam khi da co nguoi"]).toEqual([
			false,
			"moi phai cam khi da co nguoi",
		]);

		const sau = await dem();
		expect([
			sau.user,
			sau.account,
			sau.session,
			sau.verification,
			"bon bang sau khi bi tu choi",
		]).toEqual([
			truoc.user,
			truoc.account,
			truoc.session,
			truoc.verification,
			"bon bang sau khi bi tu choi",
		]);
	});

	it("bang co dong thi dong ay quyet, khong phai moi", async () => {
		process.env.ALLOWED_SIGN_IN = "onemount.com";
		await db.user.create({ data: nguoi("nguoi-cu@onemount.com") });
		await choPhep("khach@gmail.com");

		const trongBang = await thu("khach@gmail.com");
		const theoMoi = await thu("nguoi-la@onemount.com");

		expect([trongBang, theoMoi, "trong bang qua, theo moi khong"]).toEqual([
			true,
			false,
			"trong bang qua, theo moi khong",
		]);
	});

	it("hai trang thai khong duoc cho cung ket qua", async () => {
		process.env.ALLOWED_SIGN_IN = "onemount.com";

		await don();
		const conAi = await db.user.count();
		if (conAi > 0) return;

		const khiChuaAi = await thu("ai-do@onemount.com");
		await db.user.create({ data: nguoi("nguoi-cu@onemount.com") });
		const khiDaCo = await thu("nguoi-khac@onemount.com");

		if (khiChuaAi === khiDaCo) {
			throw new Error(
				`hai trang thai cho cung ket qua (${khiChuaAi}) — phep do khong phan biet duoc duong moi mo voi duong moi dong`,
			);
		}

		expect([khiChuaAi, khiDaCo]).toEqual([true, false]);
	});

	it("phep kiem nam o hook TRUOC khi ghi", () => {
		expect(hookTruocTao()).toBeInstanceOf(Function);
	});
});

async function daLaThanhVien(userId: string, vai = "member") {
	await db.member.create({
		data: {
			id: `${suffix}-m-${userId}`,
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: new Date(),
		},
	});
}

describe("vai-dinh-truoc", () => {
	beforeEach(async () => {
		await don();
		const chu = await db.user.upsert({
			where: { id: `${suffix}-chu` },
			create: { ...nguoi("chu@onemount.com"), id: `${suffix}-chu` },
			update: {},
			select: { id: true },
		});
		await db.member.upsert({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: chu.id,
				},
			},
			create: {
				id: `${suffix}-m-chu`,
				organizationId: WORKSPACE_ID,
				userId: chu.id,
				role: "owner",
				createdAt: new Date(),
			},
			update: { role: "owner" },
		});
	});

	it("vai khai truoc di vao tu cach thanh vien, va loi cho phep thanh accepted", async () => {
		const ket: Record<string, string | null> = {};

		for (const [phan, vai] of [
			["quan-vien", "admin"],
			["thuong-dan", "member"],
		] as const) {
			const dia = `${phan}-${suffix}@gmail.com`;
			await choPhep(dia, vai);

			const nguoiMoi = await db.user.create({ data: nguoi(dia) });
			await ensureWorkspaceMembership(nguoiMoi.id, dia);

			const hang = await db.member.findUnique({
				where: {
					organizationId_userId: {
						organizationId: WORKSPACE_ID,
						userId: nguoiMoi.id,
					},
				},
				select: { role: true },
			});

			const loi = await db.invitation.findFirst({
				where: { organizationId: WORKSPACE_ID, email: dia },
				select: { status: true },
			});

			ket[phan] = hang?.role ?? null;
			ket[`${phan}-loi`] = loi?.status ?? null;
		}

		if (ket["quan-vien"] === ket["thuong-dan"]) {
			throw new Error(
				`hai vai cho cung mot ket qua (${ket["quan-vien"]}) — phep do khong phan biet duoc vai dinh truoc co hieu luc voi moi nguoi deu ra mot vai`,
			);
		}

		expect([
			ket["quan-vien"],
			ket["thuong-dan"],
			ket["quan-vien-loi"],
			ket["thuong-dan-loi"],
			"vai doc lai tu DB, va loi cho phep da thanh accepted",
		]).toEqual([
			"admin",
			"member",
			"accepted",
			"accepted",
			"vai doc lai tu DB, va loi cho phep da thanh accepted",
		]);
	});
});

describe("rut-khong-dung-da-vao", () => {
	beforeEach(async () => {
		await don();
	});

	it("rut loi cho phep cua nguoi DA vao thi tu cach thanh vien con nguyen", async () => {
		const dia = `da-vao-${suffix}@gmail.com`;
		await choPhep(dia, "member", TRANG_THAI_NHAN);

		const nguoiCu = await db.user.create({ data: nguoi(dia) });
		await daLaThanhVien(nguoiCu.id);

		const daRut = await db.invitation.updateMany({
			where: { organizationId: WORKSPACE_ID, email: dia },
			data: { status: TRANG_THAI_HUY },
		});

		if (daRut.count !== 1) {
			throw new Error(
				`gieo cu lieu hong: rut duoc ${daRut.count} loi cho phep, phai dung 1 — phep do khong con do nhanh rut that`,
			);
		}

		const truocKhiDo = await db.invitation.findFirst({
			where: { organizationId: WORKSPACE_ID, email: dia },
			select: { status: true },
		});

		const phienTruoc = await db.session.count({
			where: { userId: nguoiCu.id },
		});

		const ra = await hookTruocPhien()(phienCua(nguoiCu.id));
		await db.session.create({ data: ra.data as PhienGieo });

		const phienDaGhi = await db.session.findFirst({
			where: { userId: nguoiCu.id },
			select: { activeOrganizationId: true },
		});

		const phienSau = await db.session.count({
			where: { userId: nguoiCu.id },
		});

		const hang = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: nguoiCu.id,
				},
			},
			select: { id: true },
		});

		expect([
			truocKhiDo?.status ?? null,
			phienTruoc,
			phienSau,
			phienDaGhi?.activeOrganizationId ?? null,
			hang !== null,
			"rut roi: phien moi ghi duoc, tu cach thanh vien con nguyen",
		]).toEqual([
			TRANG_THAI_HUY,
			0,
			1,
			WORKSPACE_ID,
			true,
			"rut roi: phien moi ghi duoc, tu cach thanh vien con nguyen",
		]);
	});
});

describe("doc-hong", () => {
	beforeEach(async () => {
		await don();
	});

	it("lop doc hong thi hook khong nem, va thanh vien san co con nguyen", async () => {
		const dia = `hong-${suffix}@gmail.com`;
		const nguoiMoi = await db.user.create({ data: nguoi(dia) });

		const nguoiCu = await db.user.create({
			data: nguoi(`cu-hong-${suffix}@gmail.com`),
		});
		await daLaThanhVien(nguoiCu.id);

		let daNem = false;

		try {
			await ensureWorkspaceMembership(nguoiMoi.id, dia, () => {
				throw new Error("lop doc loi cho phep hong");
			});
		} catch {
			daNem = true;
		}

		const hangCu = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: nguoiCu.id,
				},
			},
			select: { id: true },
		});

		const moi = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: nguoiMoi.id,
				},
			},
			select: { id: true },
		});

		expect([
			daNem,
			hangCu !== null,
			moi === null,
			"khong nem, thanh vien san co con nguyen, nguoi moi khong duoc them",
		]).toEqual([
			false,
			true,
			true,
			"khong nem, thanh vien san co con nguyen, nguoi moi khong duoc them",
		]);
	});
});
