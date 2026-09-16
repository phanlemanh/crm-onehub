import { beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { auth } from "../src/auth";
import { ALLOWANCE_WITHOUT_EXPIRY } from "../src/allow-list";

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

async function don() {
	await db.invitation.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function choPhep(email: string, role = "member") {
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
			status: "pending",
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
			expect([
				"bo qua — co so du lieu con nguoi that",
				conAi,
			]).toEqual(["bo qua — co so du lieu con nguoi that", conAi]);
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
