import { beforeAll, describe, expect, setSystemTime, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { traLoiTu } from "../src/okr/cap-nhat-gan-day";
import {
	CHUONG_TRINH_RONG,
	dangChay,
	dungSan,
	goi,
	ok,
	phien,
	taoNam,
	taoQuy,
} from "./okr-san";

dungSan();

const THU_MUC = join(import.meta.dir, "../../../packages/db/prisma/migrations");
const NGAY = "2026-10-20";
const luc = (gio: string) => new Date(`${NGAY}T${gio}:00.000Z`);

type MaBinhLuan = "c0900" | "c1100" | "c1200" | "c1300" | "cKhongKr" | "cK2";

const MA_TRAN: { ma: MaBinhLuan; mong: "t1" | "t2" | null }[] = [
	{ ma: "c0900", mong: null },
	{ ma: "c1100", mong: "t1" },
	{ ma: "c1200", mong: "t2" },
	{ ma: "c1300", mong: "t2" },
	{ ma: "cKhongKr", mong: null },
	{ ma: "cK2", mong: null },
];

const san = {
	mucTieu: "",
	k1: "",
	k2: "",
	t1: "",
	t2: "",
	binhLuan: new Map<MaBinhLuan, string>(),
};

function thuMucCamXuc(): string[] {
	return readdirSync(THU_MUC).filter((t) => t.includes("cam_xuc"));
}

function cauLap(): string {
	const thu = thuMucCamXuc();
	const sql = readFileSync(
		join(THU_MUC, thu[0] ?? "", "migration.sql"),
		"utf8",
	);
	const cau = sql.match(/UPDATE "okrComment" c SET "checkInId"[\s\S]*?;/);
	if (!cau) throw new Error("migration khong co cau lap checkInId");
	return cau[0];
}

function chiCaNay(cau: string, ids: string[]): string {
	const ds = ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(", ");
	return cau.replace(/;\s*$/, ` AND c."id" IN (${ds});`);
}

async function guiLan(keyResultId: string, gio: string): Promise<string> {
	setSystemTime(luc(gio));
	const sessionId = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }),
		`mo ${gio}`,
	).sessionId;
	ok(
		await goi("okr.guiCapNhat", {
			sessionId,
			items: [{ keyResultId, value: 10, confidence: "vua", note: gio }],
		}),
		`gui ${gio}`,
	);
	const dong = await db.okrCheckIn.findFirst({
		where: { sessionId },
		select: { id: true },
	});
	return dong?.id ?? "";
}

async function binhLuan(
	ma: MaBinhLuan,
	gio: string,
	keyResultId: string | undefined,
): Promise<void> {
	setSystemTime(luc(gio));
	const c = ok<{ id: string }>(
		await goi("okr.addComment", {
			objectiveId: san.mucTieu,
			...(keyResultId ? { keyResultId } : {}),
			body: `Bình luận ${ma}`,
			mentionUserIds: [],
		}),
		`binh luan ${ma}`,
	);
	san.binhLuan.set(ma, c.id);
}

async function taoKr(ten: string): Promise<string> {
	return ok<{ id: string }>(
		await goi("okr.createKeyResult", {
			objectiveId: san.mucTieu,
			title: ten,
			kind: "tang-toi",
			ownerUserId: phien.quan.nguoi,
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
			unit: "",
			dueOn: null,
			weight: 1,
		}),
		`kr ${ten}`,
	).id;
}

beforeAll(async () => {
	setSystemTime(luc("08:00"));
	ok(await goi("okr.setProgram", CHUONG_TRINH_RONG), "cau hinh");
	const ky = await taoQuy(
		"cx-migration",
		await taoNam("cx-migration-nam", 2026),
		"2026-10-01",
		"2026-12-31",
	);
	await dangChay(ky);
	san.mucTieu = ok<{ id: string }>(
		await goi("okr.createObjective", {
			cycleId: ky,
			unit: { level: "onehub" },
			title: "Lấp khoá lần cập nhật",
			kind: "cam-ket",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
			hienThi: "cong-khai",
		}),
		"muc tieu",
	).id;
	san.k1 = await taoKr("KR có hai lần");
	san.k2 = await taoKr("KR chưa có lần nào");
	ok(await goi("okr.publishObjective", { id: san.mucTieu }), "cong bo");
	await binhLuan("c0900", "09:00", san.k1);
	san.t1 = await guiLan(san.k1, "10:00");
	await db.okrCheckIn.update({
		where: { id: san.t1 },
		data: { createdAt: luc("11:30") },
	});
	await binhLuan("c1100", "11:00", san.k1);
	await binhLuan("cK2", "11:00", san.k2);
	await binhLuan("cKhongKr", "11:30", undefined);
	san.t2 = await guiLan(san.k1, "12:00");
	await binhLuan("c1200", "12:00", san.k1);
	await binhLuan("c1300", "13:00", san.k1);
	setSystemTime();
});

describe("cx-migration", () => {
	test("dung mot migration mang ca bang moi lan cot moi", () => {
		const thu = thuMucCamXuc();
		expect(thu.length, "khong dung mot migration").toBe(1);
		const sql = readFileSync(
			join(THU_MUC, thu[0] ?? "", "migration.sql"),
			"utf8",
		);
		expect(sql).toContain('CREATE TABLE "okrCamXuc"');
		expect(sql).toMatch(/ALTER TABLE "okrComment" ADD COLUMN\s+"checkInId"/);
	});

	test("tien de: lan t1 gui luc 10:00 nhung dong tao luc 11:30", async () => {
		const dong = await db.okrCheckIn.findUnique({
			where: { id: san.t1 },
			select: { createdAt: true, session: { select: { submittedAt: true } } },
		});
		expect(dong?.session.submittedAt?.toISOString()).toBe(
			luc("10:00").toISOString(),
		);
		expect(dong?.createdAt.toISOString()).toBe(luc("11:30").toISOString());
	});

	test("lap checkInId theo ma tran viet truoc", async () => {
		const ids = [...san.binhLuan.values()];
		await db.okrComment.updateMany({
			where: { id: { in: ids } },
			data: { checkInId: null },
		});
		await db.$executeRawUnsafe(chiCaNay(cauLap(), ids));
		const hang = await db.okrComment.findMany({
			where: { id: { in: ids } },
			select: { id: true, checkInId: true },
		});
		const lan = { t1: san.t1, t2: san.t2 };
		for (const { ma, mong } of MA_TRAN) {
			const thuc = hang.find((h) => h.id === san.binhLuan.get(ma))?.checkInId;
			expect(thuc ?? null, `binh luan ${ma}`).toBe(mong ? lan[mong] : null);
		}
	});

	test("tra loi VK12 dang hien duoi lan moi nhat van hien sau khi lap", async () => {
		const cuaK1 = await db.okrComment.findMany({
			where: { keyResultId: san.k1 },
			select: { id: true, createdAt: true, checkInId: true },
		});
		const cu = traLoiTu(cuaK1, luc("12:00")).map((b) => b.id);
		const moi = cuaK1
			.filter((b) => b.checkInId === san.t2)
			.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
			.map((b) => b.id);
		expect(moi).toEqual(cu);
		expect(cu).toEqual([
			san.binhLuan.get("c1200") ?? "",
			san.binhLuan.get("c1300") ?? "",
		]);
	});
});
