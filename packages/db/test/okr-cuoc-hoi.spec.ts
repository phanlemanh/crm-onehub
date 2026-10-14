import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ghiChiPhi } from "../src/ai-chi-phi";
import { tinhNangCua } from "../src/ai-chi-phi-danh-muc";
import { db } from "../src/client";
import {
	chiPhiThangHoiDap,
	cuocHoiCua,
	demLuotNgay,
	ghiLuot,
	ghiPhienEve,
	taoCuocHoi,
} from "../src/okr-cuoc-hoi";

const T = `hoi${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;
const nguoi = `${T}-nguoi`;

async function don() {
	await db.okrLuotHoi.deleteMany({ where: { userId: { startsWith: T } } });
	await db.okrCuocHoi.deleteMany({
		where: { nguoiHoiUserId: { startsWith: T } },
	});
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: T } } });
}

const dongChiPhi = (id: string, at: Date, tinhNang: string, usd: number) =>
	ghiChiPhi(db, {
		id: `${T}-${id}`,
		at,
		sessionId: `${T}-phien`,
		phienCha: null,
		kenh: "eve",
		tinhNang,
		taskId: null,
		modelId: null,
		inputTokens: null,
		cacheReadTokens: null,
		outputTokens: null,
		costUsd: usd,
	});

beforeAll(don);
afterAll(don);

describe("okr-cuoc-hoi", () => {
	test("tao-cuoc: sessionId la placeholder cho-eve", async () => {
		const c = await taoCuocHoi(db, nguoi);
		expect(c.sessionId.startsWith("cho-eve:")).toBe(true);
		expect((await cuocHoiCua(db, c.id))?.nguoiHoiUserId).toBe(nguoi);
	});

	test("ghi-phien: lan dau thay placeholder, lan sau noi cacPhien", async () => {
		const c = await taoCuocHoi(db, nguoi);
		await ghiPhienEve(db, c.id, `${T}-eve-1`);
		await ghiPhienEve(db, c.id, `${T}-eve-2`);
		const sau = await cuocHoiCua(db, c.id);
		expect(sau?.sessionId).toBe(`${T}-eve-1`);
		expect(sau?.cacPhien).toEqual([`${T}-eve-2`]);
	});

	test("luot: dem theo nguoi va ngay", async () => {
		const c = await taoCuocHoi(db, nguoi);
		for (let i = 0; i < 3; i++)
			await ghiLuot(db, { cuocHoiId: c.id, userId: nguoi, ngay: "2026-10-14" });
		expect(await demLuotNgay(db, nguoi, "2026-10-14")).toBe(3);
		expect(await demLuotNgay(db, nguoi, "2026-10-15")).toBe(0);
	});

	test("chi-phi-thang: chi okr.hoi-dap cua thang nay", async () => {
		const nay = new Date("2026-10-14T05:00:00Z");
		await dongChiPhi("a", nay, "okr.hoi-dap", 1.25);
		await dongChiPhi("b", new Date("2026-10-01T00:30:00+07:00"), "okr.hoi-dap", 0.5);
		await dongChiPhi("c", new Date("2026-09-30T12:00:00+07:00"), "okr.hoi-dap", 7);
		await dongChiPhi("d", nay, "okr.soan", 3);
		expect(await chiPhiThangHoiDap(db, nay)).toBeCloseTo(1.75, 6);
	});

	test("tinh-nang: purpose okr-hoi la okr.hoi-dap", () => {
		expect(
			tinhNangCua({ kenh: "eve", purpose: "okr-hoi", subagent: null, okrViec: null }),
		).toBe("okr.hoi-dap");
	});
});
