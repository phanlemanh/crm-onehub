import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import {
	doiVai,
	donDep,
	gieoBoPhan,
	gieoKeHoach,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";

const THUOC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"va-lo-ro-vai-chi-okr",
	"rang",
	"ro-vai-chi-okr.mjs",
);

const KHOA = ["buocMo", "keHoachMo", "theoDoiMo", "nhacDaMangKeHoach"] as const;

beforeAll(moXuong);
afterAll(async () => {
	await db.agentTask.deleteMany({
		where: { kind: "nhac-ke-hoach", subject: { contains: "mpkh" } },
	});
	await donDep();
});

const ghi = () => new OnboardingGhi(db);

function chay(co: string[]) {
	const ket = spawnSync("node", [THUOC, ...co], {
		env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
		encoding: "utf8",
	});
	return { status: ket.status, stdout: ket.stdout, stderr: ket.stderr };
}

async function vanTay(userId: string): Promise<string> {
	const hang = await db.$queryRaw<{ v: string | null }[]>`
		SELECT md5(
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM "member" t WHERE t."userId" = ${userId}), '') ||
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM "onboardingStep" t WHERE t."assigneeId" = ${userId}), '') ||
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM "onboardingPlan" t WHERE t."ownerId" = ${userId}), '') ||
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM "onboardingWatch" t WHERE t."userId" = ${userId}), '') ||
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM "agentTask" t WHERE t.subject LIKE ${`user:${userId}:%`}), '')
		) AS v`;
	return hang[0]?.v ?? "";
}

describe("vlr-thuoc", () => {
	test("vlr-thuoc: đếm đúng việc mở và tin đã lộ, bỏ qua vật đã khép, không ghi; --trong về 0 khi sạch; thiếu biến thì 2", async () => {
		const qt = await gieoThanhVien("QT Thuoc VLR", "admin");
		const thuong = await gieoThanhVien("Thường Thuoc VLR", "member");
		const nguoi = await gieoThanhVien("vlr-thuoc-okr", "member");
		const id = nguoi.id;
		const bp = await gieoBoPhan();
		const { plan: moCuaKhac } = await gieoKeHoach({
			camTrich: thuong.id,
			buoc: [
				{ nhan: "Mo", boPhanId: bp.id },
				{ nhan: "Da xong", boPhanId: bp.id, xong: true },
			],
		});
		const buocMo = await db.onboardingStep.findFirstOrThrow({
			where: { planId: moCuaKhac.id, completedAt: null },
		});
		const buocXong = await db.onboardingStep.findFirstOrThrow({
			where: { planId: moCuaKhac.id, completedAt: { not: null } },
		});
		await ghi().assignStep({ stepId: buocMo.id, assigneeId: id }, qt.id);
		await db.onboardingStep.update({
			where: { id: buocXong.id },
			data: { assigneeId: id },
		});
		await gieoKeHoach({ camTrich: id, buoc: [] });
		await gieoKeHoach({
			camTrich: id,
			buoc: [{ nhan: "Dong", boPhanId: bp.id, giao: id }],
			dong: true,
		});
		const { plan: theoMo } = await gieoKeHoach({
			camTrich: thuong.id,
			buoc: [],
		});
		const { plan: theoDong } = await gieoKeHoach({
			camTrich: thuong.id,
			buoc: [],
			dong: true,
		});
		await db.onboardingWatch.createMany({
			data: [
				{ planId: theoMo.id, userId: id },
				{ planId: theoDong.id, userId: id },
			],
		});
		const payload = parseNhacPayload({
			muc: [{ loai: "buoc-sap-han", planId: moCuaKhac.id, stepId: buocMo.id }],
			daGui: [
				{ loai: "buoc-sap-han", planId: moCuaKhac.id, stepId: buocMo.id },
			],
			kenh: "zalo",
			lechKenh: false,
		});
		await db.agentTask.create({
			data: {
				kind: "nhac-ke-hoach",
				reason: "nhắc buổi sáng",
				subject: `user:${id}:${ngayVN(new Date())}`,
				dueAt: new Date(),
				payload,
				finishedAt: new Date(),
				outcome: "da-gui:1",
			},
		});
		const khac = await gieoThanhVien("vlr-thuoc-khac", "member");
		await gieoKeHoach({
			camTrich: thuong.id,
			buoc: [{ nhan: "Cua khac", boPhanId: bp.id, giao: khac.id }],
		});
		await doiVai(khac.id, "okr");
		await doiVai(id, "okr");
		const truoc = await vanTay(id);

		const ket = chay([]);
		if (ket.status !== 1) {
			throw new Error(`vlr: thuoc khong do ${ket.status} ${ket.stderr}`);
		}
		const j = JSON.parse(ket.stdout) as Record<
			(typeof KHOA)[number],
			{ theoNguoi: Record<string, number> }
		>;
		for (const khoa of KHOA) {
			const so = j[khoa].theoNguoi[id];
			if (so !== 1) throw new Error(`vlr: thuoc dem sai ${khoa} ${so}`);
		}
		if ((await vanTay(id)) !== truoc) throw new Error("vlr: thuoc ghi vao kho");
		if (chay(["--trong", id]).status !== 1) {
			throw new Error("vlr: co --trong khong do");
		}

		await ghi().transferWork({ fromUserId: id, toUserId: thuong.id }, qt.id);
		await db.onboardingWatch.deleteMany({
			where: { userId: id, plan: { closedAt: null } },
		});
		const sach = chay(["--trong", id]);
		if (sach.status !== 0) {
			throw new Error(`vlr: thuoc khong ve 0 khi sach ${sach.status}`);
		}
		if (chay([]).status !== 1) {
			throw new Error("vlr: doi chung nguoi khac khong con mo");
		}

		const {
			DATABASE_URL: _boDb,
			TEST_DATABASE_URL: _boThu,
			...khongBien
		} = process.env;
		const thieu = spawnSync("node", [THUOC], {
			env: khongBien,
			encoding: "utf8",
		});
		if (thieu.status !== 2) {
			throw new Error("vlr: thuoc khong tu choi khi thieu bien");
		}
		expect(thieu.stderr).toContain("DATABASE_URL");
	});
});
