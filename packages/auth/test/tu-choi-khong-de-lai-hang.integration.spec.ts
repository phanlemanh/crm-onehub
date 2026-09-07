import { beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { auth } from "../src/auth";

const DANH_SACH = "onemount.com,phanlemanh@gmail.com";
const suffix = process.env.TEST_RUN_ID ?? "tu-choi-spec";

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
			user?: { create?: { before?: TruocTao; after?: unknown } };
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

const don = async () => {
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
};

describe("mot luot bi tu choi khong de lai hang nao", () => {
	beforeEach(async () => {
		process.env.ALLOWED_SIGN_IN = DANH_SACH;
		await don();
	});

	it("doi chung duong: dia chi TRONG danh sach di duoc va tao dung mot hang", async () => {
		const before = hookTruocTao();
		const truoc = await dem();

		const ra = await before(nguoi(`ai-do@onemount.com`));
		expect(ra).toHaveProperty("data");

		await db.user.create({ data: nguoi(`ai-do@onemount.com`) });
		const sau = await dem();

		expect([sau.user - truoc.user, "hang user them"]).toEqual([
			1,
			"hang user them",
		]);
		await don();
	});

	it("dia chi NGOAI danh sach: bon bang khong tang hang nao", async () => {
		const before = hookTruocTao();
		const truoc = await dem();

		let daNem = false;
		try {
			await before(nguoi("nguoi-la@gmail.com"));
		} catch {
			daNem = true;
		}

		expect([daNem, "hook da nem"]).toEqual([true, "hook da nem"]);

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
});
