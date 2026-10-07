import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { z } from "zod";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import { OKR_XEM } from "../src/okr/okr-xem.config";
import type {
	DanhSachOutput,
	HopTuanOutput,
} from "../src/okr/okr-xem.contracts";
import { OkrXemService } from "../src/okr/okr-xem.service";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	dangChay,
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
	taoNam,
	taoQuy,
	truongMoi,
	ungDung,
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

const LOC_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [] };

const NGAY_MS = 24 * 60 * 60 * 1000;

const truocNgay = (soNgay: number, goc = new Date()) =>
	new Date(goc.getTime() - soNgay * NGAY_MS);

async function capNhat(
	userId: string,
	keyResultId: string,
	now: Date,
	confidence: MucTuTin,
	value = 30,
	note = "",
) {
	const svc = ungDung().get(OkrCapNhatService);
	const { sessionId } = await svc.moCapNhat(userId, { entry: "tab" }, now);
	await svc.guiCapNhat(
		userId,
		{ sessionId, items: [{ keyResultId, value, confidence, note }] },
		now,
	);
}

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
			["bp gồm con", new Set([B1, P1a, P1b])],
			["người phụ trách k", new Set([P1a])],
			["loại tham vọng", new Set([P1a])],
			["đã công bố", new Set([B1, P1a])],
			["phòng ban P3", new Set([P3a])],
			["trang một người k", new Set([P1a, P3a])],
			["k và cam kết", new Set()],
			["bộ phận không có phòng ban", new Set()],
		]);
		expect(tatCa.rows.some((m) => m.id === P3a)).toBe(false);
		expect(tatCa.daBo.map((m) => m.id)).toEqual([P2a]);
		expect(tatCa.total).toBe(3);
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

		await capNhat(k, krK, truocNgay(7), "cao");
		await capNhat(k, krK, new Date(), "thap");
		const thap = await hoi(bp, { tuTin: ["thap"] });
		const tuTinTheoMuc = [
			["tự tin thấp", tap(thap)],
			["tự tin cao", tap(await hoi(bp, { tuTin: ["cao"] }))],
		];
		expect(tuTinTheoMuc).toEqual([
			["tự tin thấp", new Set([P1a])],
			["tự tin cao", new Set()],
		]);
		expect(thap.rows.find((m) => m.id === P1a)?.krKhop).toEqual([krK]);
		expect(theoGiaTri((await hoi(bp)).facetCounts.tuTin)).toEqual({ thap: 1 });
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
		dungTuan: number;
		krIm: number;
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
		const krCb: string[] = [];
		for (const h of [20, 30, 40])
			krCb.push(await taoKrSo(cb, p1.nguoi, p1.cookie, h));
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
		const [k1, k2, k3] = krCb;
		if (!k1 || !k2 || !k3) throw new Error("thieu KR gieo");
		await capNhat(p1.nguoi, k1, truocNgay(7), "cao");
		await capNhat(p1.nguoi, k2, truocNgay(7), "vua");
		await capNhat(p1.nguoi, k3, truocNgay(16), "vua");
		const r2 = await doc<SucKhoeDoc>("okr.sucKhoe", "quan", { cycleId: quy });
		expect(
			r2.hang
				.filter((h) => khoa.includes(h.key))
				.map((h) => [h.key, h.dungTuan, h.krIm]),
		).toEqual([
			[`bp:${B}`, 2, 1],
			[`pb:${P1}`, 2, 1],
			[`pb:${P2}`, 0, 0],
		]);
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
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-pv");
		const G = await taoMucTieu(
			quy,
			{ level: "onehub" },
			phien.quan.nguoi,
			"quan",
		);
		const krG = await taoKr(G, phien.quan.nguoi, "quan");
		await congBo(G, "quan");
		const vao = {
			"okr.danhSach": { cycleId: quy, unit: { loai: "goc" }, loc: LOC_RONG },
			"okr.toanCanh": { cycleId: quy },
			"okr.hopTuan": { cycleId: quy, unit: { loai: "goc" } },
			"okr.dienBien": { keyResultId: krG },
			"okr.khoiCuaToi": { cycleId: quy, userId: null },
			"okr.sucKhoe": { cycleId: quy },
		} as const;
		const ketQua: string[] = [];
		for (const ai of ["chu", "quan", "thuong", "okr"] as const) {
			for (const [thuTuc, v] of Object.entries(vao))
				ketQua.push(
					`${ai} ${thuTuc} ${(await goiQuery(thuTuc, ai, v)).status}`,
				);
			ketQua.push(
				`${ai} okr.moHopTuan ${(await goi("okr.moHopTuan", { cycleId: quy, unit: { loai: "goc" } }, ai)).status}`,
			);
		}
		const cho = (ai: string, sucKhoe: number) => [
			`${ai} okr.danhSach 200`,
			`${ai} okr.toanCanh 200`,
			`${ai} okr.hopTuan 200`,
			`${ai} okr.dienBien 200`,
			`${ai} okr.khoiCuaToi 200`,
			`${ai} okr.sucKhoe ${sucKhoe}`,
			`${ai} okr.moHopTuan 200`,
		];
		expect(ketQua).toEqual([
			...cho("chu", 200),
			...cho("quan", 200),
			...cho("thuong", 403),
			...cho("okr", 403),
		]);
	});
});

type NutDoc = {
	id: string;
	loai: string;
	objectiveId: string;
	expected?: number | null;
	children: NutDoc[];
};

type CayNut = { roots: NutDoc[]; chuaCanChinh: NutDoc[] };

const boKyVong = (n: NutDoc): Omit<NutDoc, "expected"> => ({
	id: n.id,
	loai: n.loai,
	objectiveId: n.objectiveId,
	children: n.children.map(boKyVong),
});

describe("cay-day-du", () => {
	test("cay-day-du: cung cau truc cay cu, them ky vong cua muc tieu, KR moc khong vach", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-cay");
		const G = await taoMucTieu(
			quy,
			{ level: "onehub" },
			phien.quan.nguoi,
			"quan",
		);
		const krG = await taoKr(G, phien.quan.nguoi, "quan");
		const moc = ok<Tra>(
			await goi("okr.createKeyResult", {
				objectiveId: G,
				title: ma("moc"),
				kind: "moc",
				ownerUserId: phien.quan.nguoi,
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
				unit: "",
				dueOn: null,
				weight: 1,
			}),
			"kr moc",
		).id;
		await congBo(G, "quan");
		const cu = await doc<CayNut>("okr.alignmentTree", "okr", { cycleId: quy });
		const moi = await doc<CayNut>("okr.cayCanChinh", "okr", { cycleId: quy });
		expect({
			roots: moi.roots.map(boKyVong),
			chuaCanChinh: moi.chuaCanChinh.map(boKyVong),
		}).toEqual({
			roots: cu.roots.map(boKyVong),
			chuaCanChinh: cu.chuaCanChinh.map(boKyVong),
		});
		const kv = (
			await doc<{ expected: number | null }>("okr.objective", "quan", { id: G })
		).expected;
		const goc = moi.roots.find((n) => n.id === G);
		expect(goc?.expected).toBe(kv);
		expect(
			goc?.children.map((c) => [c.id, c.expected ?? "khong vach"]),
		).toEqual([
			[krG, kv ?? "khong vach"],
			[moc, "khong vach"],
		]);
	});
});

const xem = () => ungDung().get(OkrXemService);

const vn = (s: string) => new Date(`${s}+07:00`);

const HOM_NAY = vn("2026-11-18T10:00:00");

async function kyMuoiTuan(ten: string): Promise<string> {
	const nam = await taoNam(`${ten}-nam`, 2026);
	const quy = await taoQuy(ten, nam, "2026-10-05", "2026-12-13");
	await dangChay(quy);
	return quy;
}

const lui = async (objectiveId: string, publishedAt: Date) => {
	await db.okrObjective.update({
		where: { id: objectiveId },
		data: { publishedAt },
	});
	await db.okrKeyResult.updateMany({
		where: { objectiveId },
		data: { startLockedAt: publishedAt },
	});
};

describe("toan-canh-tu-tin", () => {
	test("toan-canh-tu-tin: phan bo tu tin, da cap nhat, dang ban, heatmap theo tuan tren KR co cap nhat", async () => {
		await caiChuongTrinh();
		const quy = await kyMuoiTuan("tco-tt");
		const B = await bpMoi("tco-tt-B");
		const P1 = await pbMoi("tco-tt-P1", B);
		const P2 = await pbMoi("tco-tt-P2", B);
		const b = await truongMoi("division", B, "tco-tt-b");
		const p1 = await truongMoi("department", P1, "tco-tt-p1");
		const p2 = await truongMoi("department", P2, "tco-tt-p2");
		const moi = async (unit: Json, owner: string, ai: string, soKr: number) => {
			const id = await taoMucTieu(quy, unit, owner, ai);
			const kr: string[] = [];
			for (let i = 0; i < soKr; i++) kr.push(await taoKrSo(id, owner, ai, 20));
			await congBo(id, ai);
			return kr;
		};
		const [f] = await moi(
			{ level: "bo-phan", divisionId: B },
			b.nguoi,
			b.cookie,
			1,
		);
		const [a, bb, c] = await moi(
			{ level: "phong-ban", departmentId: P1 },
			p1.nguoi,
			p1.cookie,
			3,
		);
		const [d, e] = await moi(
			{ level: "phong-ban", departmentId: P2 },
			p2.nguoi,
			p2.cookie,
			2,
		);
		if (!f || !a || !bb || !c || !d || !e) throw new Error("thieu KR gieo");
		const gieo: [string, string, string, MucTuTin, string][] = [
			[b.nguoi, f, "2026-10-27T09:00:00", "vua", ""],
			[p1.nguoi, a, "2026-10-27T09:00:00", "cao", ""],
			[p2.nguoi, d, "2026-10-27T09:00:00", "cao", ""],
			[p1.nguoi, a, "2026-11-03T09:00:00", "cao", ""],
			[p1.nguoi, bb, "2026-11-03T09:00:00", "vua", ""],
			[p1.nguoi, a, "2026-11-10T09:00:00", "vua", ""],
			[p2.nguoi, d, "2026-11-10T09:00:00", "cao", ""],
			[p2.nguoi, e, "2026-11-10T09:00:00", "thap", "Thiếu người"],
			[b.nguoi, f, "2026-11-17T09:00:00", "cao", ""],
			[p1.nguoi, a, "2026-11-17T09:00:00", "thap", ""],
			[p1.nguoi, bb, "2026-11-17T09:00:00", "vua", ""],
			[p2.nguoi, d, "2026-11-17T09:00:00", "cao", ""],
		];
		for (const [ai, kr, luc, tuTin, ghi] of gieo)
			await capNhat(ai, kr, vn(luc), tuTin, 30, ghi);

		const r = await xem().toanCanh(phien.quan.nguoi, quy, HOM_NAY);
		expect(r.tuan.length).toBe(10);
		expect(r.tuanNay).toBe("2026-11-16");
		const khoa = [`bp:${B}`, `pb:${P1}`, `pb:${P2}`];
		expect(
			r.hang
				.filter((h) => khoa.includes(h.key))
				.map((h) => [
					h.key,
					h.tuTin.cao,
					h.tuTin.vua,
					h.tuTin.thap,
					h.daCapNhat,
					h.dangBan?.loai ?? null,
				]),
		).toEqual([
			[`bp:${B}`, 2, 1, 2, 4, "tut"],
			[`pb:${P1}`, 0, 1, 1, 2, "tut"],
			[`pb:${P2}`, 1, 0, 1, 1, "ghi-chu"],
		]);
		expect(
			r.hang.filter((h) => khoa.includes(h.key)).map((h) => h.theoTuan),
		).toEqual([
			[null, null, null, 67, 50, 33, 50, null, null, null],
			[null, null, null, 100, 50, 0, 0, null, null, null],
			[null, null, null, 100, null, 50, 100, null, null, null],
		]);
		expect({
			tongKr: r.tongQuan.tongKr,
			daCapNhat: r.tongQuan.daCapNhat,
			daCapNhatTruoc: r.tongQuan.daCapNhatTruoc,
			tuTinThap: r.tongQuan.tuTinThap,
			tuTinThapTruoc: r.tongQuan.tuTinThapTruoc,
		}).toEqual({
			tongKr: 6,
			daCapNhat: 4,
			daCapNhatTruoc: 3,
			tuTinThap: 2,
			tuTinThapTruoc: 1,
		});
		const quaApi = await doc<{ hang: { key: string }[]; tuan: string[] }>(
			"okr.toanCanh",
			"okr",
			{ cycleId: quy },
		);
		expect(quaApi.tuan).toEqual(r.tuan);
	});
});

const KHOA_NGUOI = /"(nguoi|chuaCapNhat)":/g;

const coKhoaNguoi = (v: Json | HopTuanOutput): string[] =>
	[...JSON.stringify(v).matchAll(KHOA_NGUOI)].flatMap((m) =>
		m[1] ? [m[1]] : [],
	);

describe("hop-tuan-xep", () => {
	test("hop-tuan-xep: truong phong ban doc bang hop — tut hai bac, tut, im, ghi chu moi; khong danh sach nguoi", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-ht");
		const P = await pbMoi("tco-ht-P");
		const p = await truongMoi("department", P, "tco-ht-p");
		const id = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P },
			p.nguoi,
			p.cookie,
		);
		const kr: string[] = [];
		for (let i = 0; i < 6; i++)
			kr.push(await taoKrSo(id, p.nguoi, p.cookie, 20));
		await congBo(id, p.cookie);
		const [Ka, Kb, Kc, Kd, Ke, Kf] = kr;
		if (!Ka || !Kb || !Kc || !Kd || !Ke || !Kf) throw new Error("thieu KR");
		const gieo: [string, string, MucTuTin, string][] = [
			[Ka, "2026-11-10T09:00:00", "vua", ""],
			[Kb, "2026-11-10T09:00:00", "cao", ""],
			[Kc, "2026-11-10T09:00:00", "cao", ""],
			[Kd, "2026-11-03T09:00:00", "cao", ""],
			[Ke, "2026-11-15T09:00:00", "vua", "Chờ duyệt"],
			[Kb, "2026-11-16T15:00:00", "thap", ""],
			[Ka, "2026-11-17T09:00:00", "thap", ""],
			[Kc, "2026-11-17T11:00:00", "vua", "Đối tác lùi lịch"],
			[Kf, "2026-11-17T09:00:00", "cao", ""],
		];
		for (const [k, luc, tuTin, ghi] of gieo)
			await capNhat(p.nguoi, k, vn(luc), tuTin, 30, ghi);

		const r = await xem().hopTuan(
			p.nguoi,
			{ cycleId: quy, unit: { loai: "pb", id: P } },
			HOM_NAY,
		);
		expect(r.dangBan.map((d) => [d.keyResultId, d.lyDo])).toEqual([
			[Kb, [{ loai: "tut", tu: "cao", den: "thap", bac: 2 }]],
			[Ka, [{ loai: "tut", tu: "vua", den: "thap", bac: 1 }]],
			[
				Kc,
				[
					{ loai: "tut", tu: "cao", den: "vua", bac: 1 },
					{ loai: "ghi-chu", ngay: "2026-11-17" },
				],
			],
			[Kd, [{ loai: "im", soNgay: 15 }]],
			[Ke, [{ loai: "ghi-chu", ngay: "2026-11-15" }]],
		]);
		expect(r.conLai.map((d) => d.keyResultId)).toEqual([Kf]);
		expect({
			tuan: r.tuan,
			tuanDau: r.tuanDau,
			daCapNhat: r.daCapNhat,
			tongKr: r.tongKr,
		}).toEqual({ tuan: "2026-11-16", tuanDau: false, daCapNhat: 4, tongKr: 6 });
		expect(r.dangBan.find((d) => d.keyResultId === Kc)?.ghiChu).toBe(
			"Đối tác lùi lịch",
		);
		const quaApi = await doc<Json>("okr.hopTuan", p.cookie, {
			cycleId: quy,
			unit: { loai: "pb", id: P },
		});
		expect(coKhoaNguoi(quaApi)).toEqual([]);
		expect(coKhoaNguoi(r)).toEqual([]);
	});
});

type VetDoc = {
	actorUserId: string;
	objectiveId: string | null;
	keyResultId: string | null;
	after: unknown;
};

const vetMo = (cycleId: string) =>
	db.okrTrail.findMany({
		where: { cycleId, action: "mo-hop-tuan" },
		orderBy: { at: "asc" },
		select: {
			actorUserId: true,
			objectiveId: true,
			keyResultId: true,
			after: true,
		},
	});

describe("mo-hop-tuan", () => {
	test("mo-hop-tuan: mot dong moi luot mo cua truong, gop trong 30 phut, khong muc tieu hay KR, tuan la chuoi", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-mo");
		const P = await pbMoi("tco-mo-P");
		const p = await truongMoi("department", P, "tco-mo-p");
		const tv = await nguoiMoi("tco-mo-tv");
		ok(await datViTri(tv, P), "xep tv");
		const vao = { cycleId: quy, unit: { loai: "pb", id: P } } as const;
		const T0 = vn("2026-11-17T10:00:00");
		const phut = (n: number) => new Date(T0.getTime() + n * 60_000);
		const truocDoc = (await vetMo(quy)).length;
		const ghi: boolean[] = [];
		ghi.push((await xem().moHopTuan(p.nguoi, vao, T0)).ghi);
		for (let i = 0; i < 5; i++) await xem().hopTuan(p.nguoi, vao, phut(i + 1));
		expect((await vetMo(quy)).length).toBe(truocDoc + 1);
		ghi.push((await xem().moHopTuan(p.nguoi, vao, phut(10))).ghi);
		ghi.push((await xem().moHopTuan(p.nguoi, vao, phut(120))).ghi);
		ghi.push((await xem().moHopTuan(p.nguoi, vao, phut(7 * 24 * 60))).ghi);
		const thanhVien = (await xem().moHopTuan(tv, vao, phut(30))).ghi;
		expect({ ghi, thanhVien }).toEqual({
			ghi: [true, false, true, true],
			thanhVien: false,
		});
		const dong: VetDoc[] = await vetMo(quy);
		expect(
			dong.map((v) => {
				const a = parseOkrVet(v.after);
				return [
					v.actorUserId === p.nguoi,
					v.objectiveId,
					v.keyResultId,
					a?.donVi,
					a?.tuan,
				];
			}),
		).toEqual([
			[true, null, null, `pb:${P}`, "2026-11-16"],
			[true, null, null, `pb:${P}`, "2026-11-16"],
			[true, null, null, `pb:${P}`, "2026-11-23"],
		]);
		expect(
			dong.map(
				(v) =>
					z.string().length(10).safeParse(parseOkrVet(v.after)?.tuan).success,
			),
		).toEqual([true, true, true]);
	});

	test("mo-hop-tuan: cau dem ty-le-mo-hop-tuan.sql tren dong sinh boi loi goi mo bang", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-tl");
		const donVi: { P: string; truong: string }[] = [];
		for (let i = 0; i < 5; i++) {
			const P = await pbMoi(`tco-tl-P${i}`);
			const t = await truongMoi("department", P, `tco-tl-t${i}`);
			donVi.push({ P, truong: t.nguoi });
		}
		const tv = await nguoiMoi("tco-tl-tv");
		const [d0, d1, d2, d3, d4] = donVi;
		if (!d0 || !d1 || !d2 || !d3 || !d4) throw new Error("thieu don vi");
		ok(await datViTri(tv, d4.P), "xep tv");
		const mo = (ai: string, P: string, luc: string) =>
			xem().moHopTuan(
				ai,
				{ cycleId: quy, unit: { loai: "pb", id: P } },
				vn(luc),
			);
		await mo(d0.truong, d0.P, "2026-11-16T09:00:00");
		await mo(d1.truong, d1.P, "2026-11-18T14:00:00");
		await mo(d2.truong, d2.P, "2026-11-22T20:00:00");
		await mo(d3.truong, d3.P, "2026-11-12T09:00:00");
		await mo(tv, d4.P, "2026-11-17T09:00:00");
		const sql = readFileSync(
			join(
				import.meta.dir,
				"../../../_acceptance/toan-canh-okr/rang/ty-le-mo-hop-tuan.sql",
			),
			"utf8",
		);
		const giu = donVi.map((d) => d.P);
		const giu2: GiuTyLe = { ket: null };
		await expect(
			db.$transaction(async (tx) => {
				await tx.$executeRaw`UPDATE department SET "archivedAt" = now() WHERE "archivedAt" IS NULL AND NOT (id = ANY(${giu}))`;
				await tx.$executeRaw`UPDATE division SET "archivedAt" = now() WHERE "archivedAt" IS NULL`;
				await tx.$executeRaw`SELECT set_config('okr.tuan', '2026-11-16', true)`;
				const r = await tx.$queryRawUnsafe<TyLe[]>(sql);
				giu2.ket = r[0] ?? null;
				throw new HoanTac();
			}),
		).rejects.toBeInstanceOf(HoanTac);
		expect({ "ty-le-mo-hop-tuan": giu2.ket }).toEqual({
			"ty-le-mo-hop-tuan": { mo: 3, tong: 5, ty_le: 0.6 },
		});
	});
});

type TyLe = { mo: number; tong: number; ty_le: number };

type GiuTyLe = { ket: TyLe | null };

class HoanTac extends Error {
	constructor() {
		super("hoan tac");
	}
}

describe("vet-an", () => {
	test("vet-an: mo bang hop khong them dong nao vao tab Vet cua muc tieu trong don vi", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-va");
		const P = await pbMoi("tco-va-P");
		const p = await truongMoi("department", P, "tco-va-p");
		const M = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P },
			p.nguoi,
			p.cookie,
		);
		await taoKr(M, p.nguoi, p.cookie);
		await congBo(M, p.cookie);
		const vet = async () =>
			(
				await doc<{ trail: { action: string }[] }>("okr.objective", p.cookie, {
					id: M,
				})
			).trail;
		const n = (await vet()).length;
		const mo = ok<{ ghi: boolean }>(
			await goi(
				"okr.moHopTuan",
				{ cycleId: quy, unit: { loai: "pb", id: P } },
				p.cookie,
			),
			"mo bang",
		);
		expect(mo.ghi).toBe(true);
		const sau = await vet();
		expect({
			"dòng mo-hop-tuan lọt vào tab Vết": sau.filter(
				(v) => v.action === "mo-hop-tuan",
			).length,
			soDong: sau.length,
		}).toEqual({ "dòng mo-hop-tuan lọt vào tab Vết": 0, soDong: n });
		ok(
			await goi(
				"okr.updateObjective",
				{ id: M, title: ma("doi ten") },
				p.cookie,
			),
			"doi ten",
		);
		expect((await vet()).length).toBe(n + 1);
	});
});

describe("dien-bien", () => {
	test("dien-bien: okr.dienBien tra mot diem moi tuan cua ky, lan cuoi trong tuan, le ra noi suy", async () => {
		await caiChuongTrinh();
		const quy = await kyMuoiTuan("tco-db");
		const P = await pbMoi("tco-db-P");
		const p = await truongMoi("department", P, "tco-db-p");
		const id = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P },
			p.nguoi,
			p.cookie,
		);
		const kr = ok<Tra>(
			await goi(
				"okr.createKeyResult",
				{
					objectiveId: id,
					title: ma("kr"),
					kind: "tang-toi",
					ownerUserId: p.nguoi,
					startValue: 60,
					targetValue: 85,
					currentValue: 60,
					unit: "%",
					dueOn: null,
					weight: 1,
				},
				p.cookie,
			),
			"kr",
		).id;
		await congBo(id, p.cookie);
		await lui(id, vn("2026-10-05T08:00:00"));
		const gieo: [string, MucTuTin, number, string][] = [
			["2026-10-06T09:00:00", "vua", 62, ""],
			["2026-10-13T09:00:00", "cao", 65, ""],
			["2026-10-20T09:00:00", "thap", 66, ""],
			["2026-10-22T09:00:00", "vua", 68, ""],
			["2026-10-27T09:00:00", "cao", 70, "Ký thêm hai đối tác"],
		];
		for (const [luc, tuTin, gia, ghi] of gieo)
			await capNhat(p.nguoi, kr, vn(luc), tuTin, gia, ghi);
		const r = await xem().dienBien(p.nguoi, kr, vn("2026-10-28T10:00:00"));
		expect(r.diem.map((d) => [d.tuan, d.giaTri, d.kyVong, d.tuTin])).toEqual([
			["2026-10-05", 62, 60, "vua"],
			["2026-10-12", 65, 62.5, "cao"],
			["2026-10-19", 68, 65, "vua"],
			["2026-10-26", 70, 67.5, "cao"],
			["2026-11-02", null, 70.25, null],
			["2026-11-09", null, 72.75, null],
			["2026-11-16", null, 75.25, null],
			["2026-11-23", null, 77.75, null],
			["2026-11-30", null, 80.25, null],
			["2026-12-07", null, 82.75, null],
		]);
		expect([r.kieu, r.khoi, r.dich, r.coCapNhat]).toEqual([
			"tang-toi",
			60,
			85,
			true,
		]);
		const quaApi = await doc<{ diem: unknown[] }>("okr.dienBien", "okr", {
			keyResultId: kr,
		});
		expect(quaApi.diem.length).toBe(10);
	});
});

type KhoiDoc = { kr: { keyResultId: string; nhip: string }[]; tong: number };

describe("khoi-cua-toi", () => {
	test("khoi-cua-toi: nam KR dang lo nhat — truot, cham nhip, moc chua xong, tu tin thap, con lai", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tco-kh");
		const P = await pbMoi("tco-kh-P");
		const p = await truongMoi("department", P, "tco-kh-p");
		const k = await nguoiMoi("tco-kh-k");
		ok(await datViTri(k, P), "xep k");
		await phienCua(k);
		const id = await taoMucTieu(
			quy,
			{ level: "phong-ban", departmentId: P },
			p.nguoi,
			p.cookie,
		);
		const krMoi = async (kind: string, hien: number) =>
			ok<Tra>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: id,
						title: ma(`kr ${kind} ${hien}`),
						kind,
						ownerUserId: k,
						startValue: 0,
						targetValue: kind === "moc" ? 1 : 100,
						currentValue: hien,
						unit: kind === "moc" ? "" : "%",
						dueOn: null,
						weight: 1,
					},
					p.cookie,
				),
				`kr ${kind}`,
			).id;
		const cao = await krMoi("tang-toi", 100);
		await congBo(id, p.cookie);
		await lui(id, truocNgay(100));
		const kv = (
			await doc<{ expected: number | null }>("okr.objective", "quan", { id })
		).expected;
		if (kv === null || kv <= 0)
			throw new Error(`ky vong phai duong, thay ${kv}`);
		const chua = await krMoi("tang-toi", 100);
		const thap = await krMoi("tang-toi", 100);
		const moc = await krMoi("moc", 0);
		const cham = await krMoi("tang-toi", Math.round(kv * 0.7));
		const truot = await krMoi("tang-toi", 0);
		await capNhat(k, thap, new Date(), "thap", 100);
		await capNhat(k, cao, new Date(), "cao", 100);

		const cuaK = await doc<KhoiDoc>("okr.khoiCuaToi", await phienCua(k), {
			cycleId: quy,
			userId: null,
		});
		expect({
			thuTu: cuaK.kr.map((d) => d.keyResultId),
			tong: cuaK.tong,
		}).toEqual({ thuTu: [truot, cham, moc, thap, cao], tong: 6 });
		expect(cuaK.kr.map((d) => d.nhip)).toEqual([
			"truot",
			"cham-nhip",
			"moc-chua",
			"dung-nhip",
			"dung-nhip",
		]);
		expect(
			await doc<KhoiDoc>("okr.khoiCuaToi", "okr", { cycleId: quy, userId: k }),
		).toEqual(cuaK);
		expect(
			await doc<KhoiDoc>("okr.khoiCuaToi", "okr", {
				cycleId: quy,
				userId: null,
			}),
		).toEqual({ kr: [], tong: 0 });
		expect(chua).not.toBe(cao);
	});
});
