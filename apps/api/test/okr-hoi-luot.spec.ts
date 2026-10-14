import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import { OKR_HOI_TRAN } from "@crm/validation/okr-tra-loi";
import { ForbiddenException } from "@nestjs/common";
import { HoiService } from "../src/okr/hoi.service";

const T = `hluot${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;
const A = `${T}-a`;
const B = `${T}-b`;
const MOC = new Date("2026-10-14T09:00:00+07:00");
const hoi = new HoiService(db);

async function don() {
	await db.okrLuotHoi.deleteMany({ where: { userId: { startsWith: T } } });
	await db.okrCuocHoi.deleteMany({
		where: { nguoiHoiUserId: { startsWith: T } },
	});
	await db.aiChiPhi.deleteMany({ where: { tinhNang: OKR_HOI_TRAN.tinhNang } });
}

async function ghiBuoc(id: string, at: Date, usd: number) {
	await ghiChiPhi(db, {
		id: `${T}-${id}`,
		at,
		sessionId: `${T}-phien`,
		phienCha: null,
		kenh: "eve",
		tinhNang: OKR_HOI_TRAN.tinhNang,
		taskId: null,
		modelId: null,
		inputTokens: null,
		cacheReadTokens: null,
		outputTokens: null,
		costUsd: usd,
	});
}

beforeAll(async () => {
	setSystemTime(MOC);
	await don();
});

afterAll(async () => {
	await don();
	setSystemTime();
});

describe("hdo tran luot", () => {
	test("40 cau trong ngay qua, cau 41 het-luot-ngay, ngay moi qua lai", async () => {
		setSystemTime(MOC);
		const { cuocHoiId } = await hoi.mo(A);
		let qua = 0;
		for (let i = 0; i < OKR_HOI_TRAN.cauMoiNgay; i++) {
			const kq = await hoi.tangLuot(A, cuocHoiId);
			if (kq.ok) qua++;
		}
		expect(qua).toBe(OKR_HOI_TRAN.cauMoiNgay);
		expect(await hoi.tangLuot(A, cuocHoiId)).toEqual({
			ok: false,
			lyDo: "het-luot-ngay",
		});
		setSystemTime(new Date("2026-10-15T07:05:00+07:00"));
		expect(await hoi.tangLuot(A, cuocHoiId)).toEqual({ ok: true });
		setSystemTime(MOC);
	});

	test("cuoc hoi cua nguoi khac bi chan", async () => {
		const { cuocHoiId } = await hoi.mo(A);
		await expect(hoi.tangLuot(B, cuocHoiId)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});

	test("cham tran thang thi het-tran-thang; thang truoc khong tinh", async () => {
		setSystemTime(MOC);
		await db.aiChiPhi.deleteMany({
			where: { tinhNang: OKR_HOI_TRAN.tinhNang },
		});
		await ghiBuoc(
			"thang-truoc",
			new Date("2026-09-30T12:00:00+07:00"),
			OKR_HOI_TRAN.usdMoiThang * 3,
		);
		const { cuocHoiId } = await hoi.mo(B);
		expect(await hoi.tangLuot(B, cuocHoiId)).toEqual({ ok: true });
		await ghiBuoc("thang-nay", MOC, OKR_HOI_TRAN.usdMoiThang);
		expect(await hoi.tangLuot(B, cuocHoiId)).toEqual({
			ok: false,
			lyDo: "het-tran-thang",
		});
	});

	test("cuaToi tra cuoc gan nhat cua chinh nguoi hoi", async () => {
		const ds = await hoi.cuaToi(B);
		expect(ds.length).toBeGreaterThan(0);
		const chu = await db.okrCuocHoi.findMany({
			where: { id: { in: ds.map((d) => d.id) } },
			select: { nguoiHoiUserId: true },
		});
		expect(chu.every((c) => c.nguoiHoiUserId === B)).toBe(true);
	});

	test("phan-hoi: ghi mot hang moi cau tra loi, bam lai thi doi; cuoc nguoi khac bi chan", async () => {
		const { cuocHoiId } = await hoi.mo(A);
		await hoi.phanHoi(A, { cuocHoiId, maTraLoi: "tra-loi-1", huuIch: true });
		await hoi.phanHoi(A, { cuocHoiId, maTraLoi: "tra-loi-1", huuIch: false });
		const hang = await db.okrHoiPhanHoi.findMany({ where: { cuocHoiId } });
		expect(hang.map((h) => [h.maTraLoi, h.huuIch])).toEqual([
			["tra-loi-1", false],
		]);
		await expect(
			hoi.phanHoi(B, { cuocHoiId, maTraLoi: "tra-loi-1", huuIch: true }),
		).rejects.toBeInstanceOf(ForbiddenException);
	});
});
