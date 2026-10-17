import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { duAnLichOutput } from "../src/du-an/du-an.contracts";
import { lichLamViecOutput } from "../src/lich-lam-viec/lich-lam-viec.contracts";
import {
	boLe,
	donDuAn,
	duAnThu,
	lichCua,
	viecCoLich,
} from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import { batApp, donViec, goi, nguoi } from "./support/viec-gieo";

const MA_TEST_MS = 120_000;
const NGAY_LE = "2026-10-26";

let app: NestExpressApplication;
let tuanCu: number[] | null = null;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
	const cai = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { ngayNghiTuan: true },
	});
	tuanCu = cai?.ngayNghiTuan ?? null;
	if (cai) {
		await db.appSetting.update({
			where: { id: SETTINGS_ID },
			data: { ngayNghiTuan: [] },
		});
	}
});

afterAll(async () => {
	await app.close();
	await boLe(NGAY_LE);
	if (tuanCu !== null) {
		await db.appSetting.update({
			where: { id: SETTINGS_ID },
			data: { ngayNghiTuan: tuanCu },
		});
	}
	await donDuAn();
	await donViec();
	await donDep();
});

function json<T>(x: T): string {
	return JSON.stringify(x);
}

async function lichCuaNguoi(userId: string) {
	const r = await goi(app, "lichLamViec.get", "query", undefined, userId);
	if (r.status !== 200) throw new Error(`llv: get loi ${json(r)}`);
	return lichLamViecOutput.parse(r.data);
}

describe("dg-lich", () => {
	test(
		"dg-lich: mặc định T7+CN, hoàn tác, ngày lễ, quyền, thêm lễ không đổi việc",
		async () => {
			const q = await nguoi("dg-q", "owner");
			const m = await nguoi("dg-m", "member");

			const dau = await lichCuaNguoi(q.id);
			if (json(dau.ngayNghiTuan) !== json([6, 7])) {
				throw new Error(`llv: mac dinh sai ${json(dau.ngayNghiTuan)}`);
			}

			for (const ds of [
				[3, 6, 7],
				[6, 7],
			]) {
				const r = await goi(
					app,
					"lichLamViec.datNgayNghiTuan",
					"mutation",
					{ ngayNghiTuan: ds },
					q.id,
				);
				if (r.status !== 200) throw new Error(`llv: dat tuan loi ${json(r)}`);
			}
			if (json((await lichCuaNguoi(q.id)).ngayNghiTuan) !== json([6, 7])) {
				throw new Error("llv: hoan tac sai");
			}

			const them = await goi(
				app,
				"lichLamViec.themNgayLe",
				"mutation",
				{ ngay: NGAY_LE, ten: "Nghỉ bù" },
				q.id,
			);
			if (them.status !== 200)
				throw new Error(`llv: them le loi ${json(them)}`);
			const trung = await goi(
				app,
				"lichLamViec.themNgayLe",
				"mutation",
				{ ngay: NGAY_LE, ten: "Nghỉ bù hai" },
				q.id,
			);
			if (
				trung.code !== "BAD_REQUEST" ||
				trung.message !== "Ngày này đã là ngày lễ."
			) {
				throw new Error(`llv: le trung ${json(trung)}`);
			}
			const le = (await lichCuaNguoi(q.id)).ngayLe.find(
				(h) => h.ngay === NGAY_LE,
			);
			if (!le) throw new Error("llv: them le khong ghi");
			await goi(app, "lichLamViec.xoaNgayLe", "mutation", { id: le.id }, q.id);
			if ((await db.ngayNghi.count({ where: { id: le.id } })) > 0) {
				throw new Error("llv: xoa le sai");
			}

			const soLe = await db.ngayNghi.count();
			for (const [thuTuc, input] of [
				["lichLamViec.themNgayLe", { ngay: NGAY_LE, ten: "Lễ của M" }],
				["lichLamViec.datNgayNghiTuan", { ngayNghiTuan: [7] }],
			] as const) {
				const r = await goi(app, thuTuc, "mutation", input, m.id);
				if (r.code !== "FORBIDDEN") {
					throw new Error(`llv: member ghi duoc ${thuTuc}`);
				}
			}
			if ((await db.ngayNghi.count()) !== soLe) {
				throw new Error("llv: member van ghi");
			}
			const docM = await goi(app, "lichLamViec.get", "query", undefined, m.id);
			if (docM.status !== 200) throw new Error("llv: member khong doc duoc");

			const P = await duAnThu(q.id);
			const V = await viecCoLich({
				duAnId: P.id,
				giaoId: q.id,
				tieuDe: "V",
				batDau: "2026-10-23",
				han: "2026-10-27",
			});
			await goi(
				app,
				"lichLamViec.themNgayLe",
				"mutation",
				{ ngay: NGAY_LE, ten: "Nghỉ bù" },
				q.id,
			);
			const lv = await lichCua(V.id);
			if (lv.batDau !== "2026-10-23" || lv.han !== "2026-10-27") {
				throw new Error("llv: them le doi viec");
			}
			const l = await goi(app, "duAn.lich", "query", { id: P.id }, q.id);
			if (!duAnLichOutput.parse(l.data).lich.ngayLe.includes(NGAY_LE)) {
				throw new Error("llv: lich khong co le moi");
			}
			expect(lv.han).toBe("2026-10-27");
		},
		MA_TEST_MS,
	);
});
