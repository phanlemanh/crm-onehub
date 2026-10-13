import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../src/client";
import { loiKhoXa } from "../src/kho-cuc-bo";
import { ngayVN } from "../src/onboarding-nhac";
import { gieoViecMau, TIEU_DE_MAU } from "../src/viec-gieo";
import { WORKSPACE_ID } from "../src/workspace";

const MA = `vgieo${Date.now().toString(36)}`;
const URL_PROD =
	"postgresql://u:p@ep-prod-123.ap-southeast-1.aws.neon.tech/crm";
const nguoi = [`${MA}-a`, `${MA}-b`];

beforeAll(async () => {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
	});
	for (const id of nguoi) {
		await db.user.create({ data: { id, name: id, email: `${id}@thu.test` } });
		await db.member.create({
			data: {
				id: `m-${id}`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role: "member",
				createdAt: new Date(0),
			},
		});
	}
	const congTy = await db.company.create({ data: { name: `${MA} cty` } });
	await db.deal.create({
		data: { name: `${MA} deal`, companyId: congTy.id, ownerId: nguoi[0] ?? "" },
	});
});

afterAll(async () => {
	await db.viec.deleteMany({ where: { taoBoiId: { in: nguoi } } });
	await db.company.deleteMany({ where: { name: { startsWith: MA } } });
	await db.member.deleteMany({ where: { userId: { in: nguoi } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
});

describe("vc-gieo", () => {
	test("vc-gieo: DATABASE_URL production thì ném lời của require-local-db, không ghi hàng nào", async () => {
		const truoc = await db.viec.count();
		let loi = "";
		try {
			await gieoViecMau(db, {
				databaseUrl: URL_PROD,
				nguon: "DATABASE_URL",
				now: new Date(),
			});
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (
			loi !== loiKhoXa("db:seed", URL_PROD, "DATABASE_URL") ||
			(await db.viec.count()) !== truoc
		) {
			throw new Error("vc: gieo chay tren production");
		}
	});

	test("vc-gieo: mọi việc mẫu có vết tạo, đủ năm trạng thái và một việc quá hạn", async () => {
		const now = new Date();
		await gieoViecMau(db, {
			databaseUrl: process.env.TEST_DATABASE_URL ?? "",
			nguon: "TEST_DATABASE_URL",
			now,
		});
		const ds = await db.viec.findMany({
			where: { tieuDe: { in: [...TIEU_DE_MAU] } },
			include: { vet: true },
		});
		if (
			ds.length === 0 ||
			ds.some((v) => !v.vet.some((e) => e.loai === "tao"))
		) {
			throw new Error("vc: gieo khong qua duong ghi");
		}
		for (const tt of ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"]) {
			if (!ds.some((v) => v.trangThai === tt))
				throw new Error(`vc: gieo thieu ca ${tt}`);
		}
		const dauHomNay = new Date(`${ngayVN(now)}T00:00:00.000Z`);
		const quaHan = ds.some(
			(v) =>
				v.hanNgay !== null &&
				v.hanNgay < dauHomNay &&
				["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA"].includes(v.trangThai),
		);
		if (!quaHan) throw new Error("vc: gieo thieu ca qua-han");
	});
	test("vc-gieo: hạn việc mẫu tính theo ngày Việt Nam, không theo ngày UTC", async () => {
		await db.viec.deleteMany({ where: { tieuDe: { in: [...TIEU_DE_MAU] } } });
		const now = new Date("2026-10-14T20:00:00.000Z");
		await gieoViecMau(db, {
			databaseUrl: process.env.TEST_DATABASE_URL ?? "",
			nguon: "TEST_DATABASE_URL",
			now,
		});
		const han = async (tieuDe: string) =>
			(await db.viec.findFirstOrThrow({ where: { tieuDe } })).hanNgay;
		expect(await han("Gọi xác nhận lịch đào tạo tuần đầu")).toEqual(
			new Date("2026-10-15T00:00:00.000Z"),
		);
		expect(await han("Gửi bảng phí mới cho đại lý")).toEqual(
			new Date("2026-10-14T00:00:00.000Z"),
		);
		expect(await han("Soạn thư chào đối tác mới")).toEqual(
			new Date("2026-10-20T00:00:00.000Z"),
		);
	});
});
