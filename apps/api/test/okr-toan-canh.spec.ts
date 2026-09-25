import { describe, expect, test } from "bun:test";
import type { DanhSachOutput } from "../src/okr/okr-xem.contracts";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
} from "./okr-san";

dungSan();

type Tra = { id: string; canhBao: string | null };

const caiChuongTrinh = async () =>
	ok<{ version: number }>(
		await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }),
		"cau hinh",
	);

const taoMucTieu = async (
	cycleId: string,
	unit: Json,
	ownerUserId: string,
	ai: AiHoacCookie,
	them: Record<string, Json> = {},
) =>
	ok<Tra>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ma("muc tieu"),
				kind: "cam-ket",
				ownerUserId,
				participantIds: [],
				whyNow: "",
				...them,
			},
			ai,
		),
		"tao muc tieu",
	).id;

const taoKr = async (
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie,
) =>
	ok<Tra>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 10,
				targetValue: 50,
				currentValue: 20,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		"tao kr",
	).id;

const congBo = async (id: string, ai: AiHoacCookie) =>
	ok(await goi("okr.publishObjective", { id }, ai), "cong bo");

const LOC_RONG = { phuTrach: [], loai: [], trangThai: [] };

const theoGiaTri = (ds: { value: string; count: number }[]) =>
	Object.fromEntries(ds.map((d) => [d.value, d.count]));

describe("danh-sach", () => {
	test("danh-sach: bo phan gom phong ban con, loc o may chu, dem mat loc tru mat cua chinh no", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-ds");
		const B = await bpMoi("tco-B");
		const P1 = await pbMoi("tco-P1", B);
		const P2 = await pbMoi("tco-P2", B);
		const C = await bpMoi("tco-C");
		const P3 = await pbMoi("tco-P3", C);
		const Crong = await bpMoi("tco-C-rong");
		const b = await truongMoi("division", B, "tco-b");
		const p1 = await truongMoi("department", P1, "tco-p1");
		const p2 = await truongMoi("department", P2, "tco-p2");
		const p3 = await truongMoi("department", P3, "tco-p3");
		const k = await nguoiMoi("tco-k");
		await phienCua(k);

		const B1 = await taoMucTieu(
			quy,
			{ level: "bo-phan", divisionId: B },
			b.nguoi,
			b.cookie,
		);
		await taoKr(B1, b.nguoi, b.cookie);
		await congBo(B1, b.cookie);

		const P1a = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
			{ kind: "tham-vong" },
		);
		const krK = await taoKr(P1a, k, p1.cookie);
		await congBo(P1a, p1.cookie);

		const P1b = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
		);

		const P2a = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P2 },
			p2.nguoi,
			p2.cookie,
		);
		await taoKr(P2a, p2.nguoi, p2.cookie);
		await congBo(P2a, p2.cookie);
		ok(await goi("okr.dropObjective", { id: P2a }, p2.cookie), "bo");

		const P3a = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P3 },
			p3.nguoi,
			p3.cookie,
		);
		await taoKr(P3a, k, p3.cookie);
		await congBo(P3a, p3.cookie);

		const hoi = (unit: Json, loc: Record<string, Json> = {}) =>
			doc<DanhSachOutput>("okr.danhSach", "okr", {
				cycleId: quy,
				unit,
				loc: { ...LOC_RONG, ...loc },
			});
		const bp = { loai: "bp", id: B };
		const tap = (r: DanhSachOutput) => new Set(r.rows.map((m) => m.id));

		const tatCa = await hoi(bp);
		const loc1 = await hoi(bp, { phuTrach: [k] });
		const ketQua = [
			["bp gồm con", tap(tatCa)],
			["người phụ trách k", tap(loc1)],
			["loại tham vọng", tap(await hoi(bp, { loai: ["tham-vong"] }))],
			["đã công bố", tap(await hoi(bp, { trangThai: ["cong-bo"] }))],
			["phòng ban P3", tap(await hoi({ loai: "pb", id: P3 }))],
			["trang một người k", tap(await hoi({ loai: "nguoi", id: k }))],
			[
				"k và cam kết",
				tap(await hoi(bp, { phuTrach: [k], loai: ["cam-ket"] })),
			],
			["bộ phận không có phòng ban", tap(await hoi({ loai: "bp", id: Crong }))],
		];
		expect(ketQua).toEqual([
			["bp gồm con", new Set([B1, P1a, P1b, P2a])],
			["người phụ trách k", new Set([P1a])],
			["loại tham vọng", new Set([P1a])],
			["đã công bố", new Set([B1, P1a])],
			["phòng ban P3", new Set([P3a])],
			["trang một người k", new Set([P1a, P3a])],
			["k và cam kết", new Set()],
			["bộ phận không có phòng ban", new Set()],
		]);
		expect(tatCa.rows.some((m) => m.id === P3a)).toBe(false);
		expect(tatCa.total).toBe(4);
		expect(loc1.rows.find((m) => m.id === P1a)?.krKhop).toEqual([krK]);

		const nguoiDem = (r: DanhSachOutput) =>
			Object.fromEntries(r.facetCounts.phuTrach.map((d) => [d.value, d.count]));
		const mat = (r: DanhSachOutput) => ({
			phuTrach: nguoiDem(r),
			loai: theoGiaTri(r.facetCounts.loai),
			trangThai: theoGiaTri(r.facetCounts.trangThai),
		});
		expect(mat(tatCa)).toEqual({
			phuTrach: { [b.nguoi]: 1, [p1.nguoi]: 2, [p2.nguoi]: 1, [k]: 1 },
			loai: { "cam-ket": 3, "tham-vong": 1 },
			trangThai: { "cong-bo": 2, nhap: 1, "da-bo": 1 },
		});
		expect({ "facet phuTrach phải trừ mặt của chính nó": mat(loc1) }).toEqual({
			"facet phuTrach phải trừ mặt của chính nó": {
				phuTrach: { [b.nguoi]: 1, [p1.nguoi]: 2, [p2.nguoi]: 1, [k]: 1 },
				loai: { "tham-vong": 1 },
				trangThai: { "cong-bo": 1 },
			},
		});
	});
});
