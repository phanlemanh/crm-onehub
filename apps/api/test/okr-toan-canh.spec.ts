import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { OKR_XEM } from "../src/okr/okr-xem.config";
import type { DanhSachOutput } from "../src/okr/okr-xem.contracts";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	doc,
	dungSan,
	goi,
	goiQuery,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
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

type ToanCanhDoc = {
	tongQuan: { donViChuaDat: string[] };
	hang: {
		key: string;
		cap: string;
		tienDo: number | null;
		kyVong: number | null;
		soMucTieu: number;
		soKr: number;
	}[];
};

type CayDoc = {
	divisions: {
		id: string;
		name: string;
		departments: { id: string; name: string }[];
	}[];
	chuaXep: { id: string; name: string }[];
};

const taoKrSo = async (
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie,
	currentValue: number,
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
				currentValue,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		"tao kr so",
	).id;

const tenDonVi = (cay: CayDoc, id: string) =>
	[...cay.divisions.flatMap((d) => [d, ...d.departments]), ...cay.chuaXep].find(
		(u) => u.id === id,
	)?.name ?? `?${id}`;

describe("toan-canh-tien-do", () => {
	test("toan-canh-tien-do: moi vai doc duoc, hang theo cay, bo phan gop con, nhap va da bo khong vao", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-tc");
		const B = await bpMoi("tco-tc-B");
		const P1 = await pbMoi("tco-tc-P1", B);
		const P2 = await pbMoi("tco-tc-P2", B);
		const C = await bpMoi("tco-tc-C");
		const P3 = await pbMoi("tco-tc-P3", C);
		const P4 = await pbMoi("tco-tc-P4");
		const b = await truongMoi("division", B, "tco-tc-b");
		const p1 = await truongMoi("department", P1, "tco-tc-p1");
		const p3 = await truongMoi("department", P3, "tco-tc-p3");

		const moi = async (
			unit: Json,
			owner: string,
			ai: AiHoacCookie,
			hien: number[],
		) => {
			const id = await taoMucTieu(quy, unit, owner, ai);
			for (const h of hien) await taoKrSo(id, owner, ai, h);
			await congBo(id, ai);
			return id;
		};
		await moi({ level: "onehub" }, phien.quan.nguoi, "quan", [20]);
		await moi({ level: "bo-phan", divisionId: B }, b.nguoi, b.cookie, [30]);
		const P1a = await moi(
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
			[20],
		);
		await moi(
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
			[50, 20],
		);
		const nhap = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
		);
		await taoKrSo(nhap, p1.nguoi, p1.cookie, 50);
		const bo = await moi(
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
			[50],
		);
		ok(await goi("okr.dropObjective", { id: bo }, p1.cookie), "bo");
		await moi(
			{ level: "phong-ban", departmentId: P3 },
			p3.nguoi,
			p3.cookie,
			[30],
		);

		const kv = (
			await doc<{ expected: number | null }>("okr.objective", "quan", {
				id: P1a,
			})
		).expected;
		const q = await doc<ToanCanhDoc>("okr.toanCanh", "quan", { cycleId: quy });
		expect(
			await doc<ToanCanhDoc>("okr.toanCanh", "thuong", { cycleId: quy }),
		).toEqual(q);
		expect(
			await doc<ToanCanhDoc>("okr.toanCanh", "okr", { cycleId: quy }),
		).toEqual(q);

		const khoa = [
			`bp:${B}`,
			`pb:${P1}`,
			`pb:${P2}`,
			`bp:${C}`,
			`pb:${P3}`,
			`pb:${P4}`,
		];
		expect(
			q.hang
				.filter((h) => khoa.includes(h.key))
				.map((h) => [h.key, h.cap, h.tienDo, h.kyVong, h.soMucTieu, h.soKr]),
		).toEqual([
			[`bp:${B}`, "bo-phan", 46, kv, 3, 4],
			[`pb:${P1}`, "phong-ban", 44, kv, 2, 3],
			[`pb:${P2}`, "phong-ban", null, null, 0, 0],
			[`bp:${C}`, "bo-phan", 50, kv, 1, 1],
			[`pb:${P3}`, "phong-ban", 50, kv, 1, 1],
			[`pb:${P4}`, "phong-ban", null, null, 0, 0],
		]);
		expect(q.hang[0]?.key).toBe("goc");
		const viTri = (k: string) => q.hang.findIndex((h) => h.key === k);
		expect([viTri(`pb:${P1}`), viTri(`pb:${P2}`)]).toEqual([
			viTri(`bp:${B}`) + 1,
			viTri(`bp:${B}`) + 2,
		]);
		const cay = await doc<CayDoc>("org.tree");
		const chuaDat = new Set(q.tongQuan.donViChuaDat);
		expect(
			[P2, P4, C, B, P1, P3].map((id) => chuaDat.has(tenDonVi(cay, id))),
		).toEqual([true, true, true, false, false, false]);
	});
});

type SucKhoeDoc = {
	hang: {
		key: string;
		truong: { id: string } | null;
		tongKr: number;
		chuaKhoiDiem: number;
		chuaNoiKenh: number;
	}[];
};

describe("suc-khoe", () => {
	test("suc-khoe: chi quan tri, KR cua muc tieu chua cong bo, nguoi chua noi kenh theo phong ban chinh", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-sk");
		const B = await bpMoi("tco-sk-B");
		const P1 = await pbMoi("tco-sk-P1", B);
		const P2 = await pbMoi("tco-sk-P2", B);
		const b = await truongMoi("division", B, "tco-sk-b");
		const p1 = await truongMoi("department", P1, "tco-sk-p1");
		const nguoi = async (ten: string, pb: string) => {
			const id = await nguoiMoi(ten);
			ok(await datViTri(id, pb), `xep ${ten}`);
			return id;
		};
		const z1 = await nguoi("tco-sk-z1", P1);
		const z2 = await nguoi("tco-sk-z2", P1);
		const s1 = await nguoi("tco-sk-s1", P1);
		const s0 = await nguoi("tco-sk-s0", P1);
		await nguoi("tco-sk-x", P1);
		await nguoi("tco-sk-y1", P2);
		await nguoi("tco-sk-y2", P2);
		for (const id of [z1, z2])
			await db.zaloLink.create({
				data: {
					crmUserId: id,
					zaloUserId: ma("zalo"),
					zaloDisplayName: "Zalo",
				},
			});
		await db.slackMemberMatch.create({
			data: { crmUserId: s1, slackUserId: ma("slack") },
		});
		await db.slackMemberMatch.create({
			data: { crmUserId: s0, slackUserId: null },
		});

		const cb = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
		);
		for (const h of [20, 30, 40]) await taoKrSo(cb, p1.nguoi, p1.cookie, h);
		await congBo(cb, p1.cookie);
		const nh = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
		);
		for (const h of [20, 30]) await taoKrSo(nh, p1.nguoi, p1.cookie, h);

		const tuChoi = [];
		for (const ai of ["thuong", "okr", p1.cookie] as const) {
			const r = await goiQuery("okr.sucKhoe", ai, { cycleId: quy });
			tuChoi.push(`${r.status} ${r.loi}`);
		}
		expect(tuChoi).toEqual(
			Array(3).fill(`403 ${OKR_XEM.thongDiep.chiQuanTri}`),
		);
		const chu = await doc<SucKhoeDoc>("okr.sucKhoe", "chu", { cycleId: quy });
		const r = await doc<SucKhoeDoc>("okr.sucKhoe", "quan", { cycleId: quy });
		expect(chu).toEqual(r);
		const khoa = [`bp:${B}`, `pb:${P1}`, `pb:${P2}`];
		expect(
			r.hang
				.filter((h) => khoa.includes(h.key))
				.map((h) => [
					h.key,
					h.tongKr,
					h.chuaKhoiDiem,
					h.chuaNoiKenh,
					h.truong?.id ?? null,
				]),
		).toEqual([
			[`bp:${B}`, 3, 2, 5, b.nguoi],
			[`pb:${P1}`, 3, 2, 3, p1.nguoi],
			[`pb:${P2}`, 0, 0, 2, null],
		]);
	});
});

describe("pham-vi", () => {
	test("pham-vi: ma tran bon vai × thu tuc xem moi", async () => {
		const quy = await kyDangChay("tco-pv");
		const vao = {
			"okr.danhSach": { cycleId: quy, unit: { loai: "goc" }, loc: LOC_RONG },
			"okr.toanCanh": { cycleId: quy },
			"okr.sucKhoe": { cycleId: quy },
		} as const;
		const ketQua: string[] = [];
		for (const ai of ["chu", "quan", "thuong", "okr"] as const)
			for (const [thuTuc, v] of Object.entries(vao))
				ketQua.push(
					`${ai} ${thuTuc} ${(await goiQuery(thuTuc, ai, v)).status}`,
				);
		expect(ketQua).toEqual([
			"chu okr.danhSach 200",
			"chu okr.toanCanh 200",
			"chu okr.sucKhoe 200",
			"quan okr.danhSach 200",
			"quan okr.toanCanh 200",
			"quan okr.sucKhoe 200",
			"thuong okr.danhSach 200",
			"thuong okr.toanCanh 200",
			"thuong okr.sucKhoe 403",
			"okr okr.danhSach 200",
			"okr okr.toanCanh 200",
			"okr okr.sucKhoe 403",
		]);
	});
});
