import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { chonChuKyHienTai } from "../src/okr/tien-do";
import {
	doc,
	dungSan,
	goi,
	ma,
	ok,
	phien,
	tao,
	taoNam,
	taoQuy,
} from "./okr-san";

dungSan();

type ChuKyDoc = {
	id: string;
	kind: string;
	phase: string;
	startsOn: string;
	endsOn: string;
	breakStartsOn: string | null;
	breakEndsOn: string | null;
};

type ChuongTrinh = {
	objectiveCap: number;
	krCap: number;
	capMode: string;
	scoreScale: string;
	weightsOn: boolean;
	personalOn: boolean;
	version: number;
};

describe("chu-ky", () => {
	test("chu-ky: nam va quy doc lai dung 16 o, tu choi 5 ca, hien tai theo ngay VN", async () => {
		const nam = await taoNam("nam", 2026);
		const quy = await tao(
			"okr.createCycle",
			{
				kind: "quy",
				name: ma("q4"),
				parentId: nam,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
				breakStartsOn: "2026-11-01",
				breakEndsOn: "2026-11-03",
				updateWeekday: 1,
			},
			"q4",
		);
		ok(await goi("okr.setCyclePhase", { id: quy, phase: "dang-chay" }), "pha");
		const rows = await db.okrCycle.findMany({
			where: { id: { in: [nam, quy] } },
			orderBy: { kind: "asc" },
		});
		const ngay = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
		const mong = [
			["nam", null, "2026-01-01", "2026-12-31", null, null, 1, "lap-ke-hoach"],
			[
				"quy",
				nam,
				"2026-10-01",
				"2026-12-31",
				"2026-11-01",
				"2026-11-03",
				1,
				"dang-chay",
			],
		];
		expect(
			rows.map((r) => [
				r.kind,
				r.parentId,
				ngay(r.startsOn),
				ngay(r.endsOn),
				ngay(r.breakStartsOn),
				ngay(r.breakEndsOn),
				r.updateWeekday,
				r.phase,
			]),
		).toEqual(mong);

		const truoc = await db.okrCycle.count();
		const tuChoi = [
			{
				vao: {
					kind: "quy",
					name: ma("x"),
					parentId: nam,
					startsOn: "2026-12-01",
					endsOn: "2027-01-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "quan",
				loi: "Quý phải nằm trọn trong năm cha.",
			},
			{
				vao: {
					kind: "quy",
					name: ma("y"),
					parentId: nam,
					startsOn: "2026-11-15",
					endsOn: "2026-12-15",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "quan",
				loi: "Chồng ngày",
			},
			{
				vao: {
					kind: "nam",
					name: ma("z"),
					parentId: null,
					startsOn: "2027-01-01",
					endsOn: "2027-12-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "thuong",
				loi: "Cần quyền quản trị",
			},
			{
				vao: {
					kind: "nam",
					name: ma("w"),
					parentId: null,
					startsOn: "2027-01-01",
					endsOn: "2027-12-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "okr",
				loi: "Cần quyền quản trị",
			},
		] as const;
		for (const c of tuChoi) {
			const r = await goi("okr.createCycle", c.vao, c.ai);
			expect(`${c.ai}: ${r.loi}`).toStartWith(`${c.ai}: ${c.loi}`);
			expect(r.status).not.toBe(200);
		}
		const lui = await goi("okr.setCyclePhase", {
			id: quy,
			phase: "lap-ke-hoach",
		});
		expect(lui.loi).toBe("Pha chu kỳ chỉ đi tới, không lùi.");
		expect(await db.okrCycle.count()).toBe(truoc);

		const cs = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
		const raNgay = (id: string) => {
			const c = cs.find((x) => x.id === id);
			return c ? [c.startsOn, c.endsOn, c.breakStartsOn, c.breakEndsOn] : null;
		};
		expect(raNgay(nam)).toEqual(["2026-01-01", "2026-12-31", null, null]);
		expect(raNgay(quy)).toEqual([
			"2026-10-01",
			"2026-12-31",
			"2026-11-01",
			"2026-11-03",
		]);
		expect(chonChuKyHienTai(cs, "2026-11-15")?.id).toBe(quy);

		const nam27 = await taoNam("nam27", 2027);
		const q1 = await taoQuy("q1-27", nam27, "2027-01-01", "2027-03-31");
		const cs2 = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
		expect(chonChuKyHienTai(cs2, "2026-11-15")?.id).toBe(quy);
		expect(chonChuKyHienTai(cs2, "2027-01-15")?.id).not.toBe(quy);
		expect(chonChuKyHienTai(cs2, "2027-01-15")?.id).toBe(q1);

		const namB = await taoNam("nam-b", 2026);
		const q4KeHoach = await taoQuy("q4-b", namB, "2026-10-01", "2026-12-31");
		const cs3 = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
		const keHoach = cs3.filter((c) => c.id === q4KeHoach || c.id === q1);
		expect(keHoach.map((c) => c.phase)).toEqual([
			"lap-ke-hoach",
			"lap-ke-hoach",
		]);
		expect(chonChuKyHienTai(keHoach, "2026-11-20")?.id).toBe(q4KeHoach);
		expect(chonChuKyHienTai(cs3, "2026-11-20")?.id).toBe(quy);
	});
});

describe("chuong-trinh", () => {
	test("chuong-trinh: ghi cau hinh tang version, dong cu giu nguyen, thanh vien bi 403", async () => {
		const dau = {
			objectiveCap: 5,
			krCap: 5,
			capMode: "chan",
			scoreScale: "0-100",
			weightsOn: false,
			personalOn: true,
		} as const;
		const v1 = ok<{ version: number }>(
			await goi("okr.setProgram", dau),
			"cau hinh dau",
		);
		const chupCu = await db.okrProgramConfig.findUniqueOrThrow({
			where: { version: v1.version },
		});

		const moi = {
			objectiveCap: 2,
			krCap: 2,
			capMode: "canh-bao",
			scoreScale: "0-1",
			weightsOn: true,
			personalOn: false,
		} as const;
		const v2 = ok<{ version: number }>(
			await goi("okr.setProgram", moi),
			"cau hinh moi",
		);
		expect(v2).toEqual({ ...moi, version: v1.version + 1 });

		const hai = await db.okrProgramConfig.findMany({
			orderBy: { version: "desc" },
			take: 2,
		});
		expect(hai.map((r) => r.version)).toEqual([v1.version + 1, v1.version]);
		expect(hai[1]).toEqual(chupCu);
		expect(hai[0]?.createdById).toBe(phien.quan.nguoi);

		expect(await doc<ChuongTrinh>("okr.program")).toEqual({
			...moi,
			version: v1.version + 1,
		});
		expect(await doc<ChuongTrinh>("okr.program", "thuong")).toEqual({
			...moi,
			version: v1.version + 1,
		});

		const soDong = await db.okrProgramConfig.count();
		const cam = await goi("okr.setProgram", dau, "thuong");
		expect(`${cam.status} ${cam.loi}`).toBe(
			"403 Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
		);
		expect(await db.okrProgramConfig.count()).toBe(soDong);

		const vet = await db.okrTrail.findMany({
			where: { actorUserId: phien.quan.nguoi, action: "cau-hinh" },
			orderBy: { at: "asc" },
		});
		expect(vet.map((v) => parseOkrVet(v.after)?.version)).toEqual([
			v1.version,
			v1.version + 1,
		]);
	});
});
