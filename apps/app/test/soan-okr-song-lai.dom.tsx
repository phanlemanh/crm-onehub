import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ClientError } from "eve/client";
import { CUA_OKR } from "@/lib/cua-okr-config";
import {
	CUOC,
	cho,
	chu,
	DanhSachCuoc,
	daGui,
	daTaiLuong,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	don,
	m,
	mo,
	moMan,
	q,
	qa,
	SOAN_UI,
	soLanMoAgent,
} from "./khung-soan-okr";

beforeEach(datLai);
afterEach(don);

describe("man-chua-cau-hinh", () => {
	test("man-chua-cau-hinh: cuoc dang 0 luot, chua cau hinh -> trang trong, khong mo phien", async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
		await moMan(false, false);
		expect(
			chu("[data-kara-state='unconfigured'] [data-slot='empty-description']"),
			"man mo phien khi chua cau hinh",
		).toBe(m.trang.chuaCauHinh);
		expect(q("textarea"), "man mo phien khi chua cau hinh").toBeNull();
		expect(soLanMoAgent, "man mo phien khi chua cau hinh").toBe(0);
		expect(daGui).toEqual([]);
		expect(daTaiLuong).toEqual([]);
	});

	test("man-chua-cau-hinh: doi chung duong — da cau hinh thi co o soan va gui luot mo dau", async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
		await moMan(false, true);
		expect(q("textarea")).not.toBeNull();
		expect(soLanMoAgent).toBeGreaterThan(0);
		expect(daGui).toEqual([SOAN_UI.luotMoDau]);
	});
});

async function loiCua(status: number, ma: string): Promise<ClientError> {
	const r = Response.json({ error: ma }, { status });
	return new ClientError(r.status, await r.text(), r.headers);
}

describe("loi-chua-cau-hinh", () => {
	test("loi-chua-cau-hinh: 503 chua-cau-hinh -> cau chua bat, khong Thu lai", async () => {
		await datAgent({
			status: "error",
			error: await loiCua(
				CUA_OKR.trangThaiChuaCauHinh,
				CUA_OKR.loi.chuaCauHinh,
			),
		});
		await moMan();
		expect(
			chu('[data-tu-choi="chua-cau-hinh"]'),
			"loi chua cau hinh hien chu chung",
		).toBe(m.nut.chuaCauHinh);
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).toBeNull();
		expect(q('[data-luot="loi"]')).toBeNull();
	});

	test("loi-chua-cau-hinh: 503 ma khac -> chu chung, co Thu lai", async () => {
		await datAgent({
			status: "error",
			error: await loiCua(CUA_OKR.trangThaiChuaCauHinh, "khac"),
		});
		await moMan();
		expect(q('[data-tu-choi="chua-cau-hinh"]')).toBeNull();
		expect(q('[data-luot="loi"]')).not.toBeNull();
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).not.toBeNull();
	});

	test("loi-chua-cau-hinh: loi mang khong status -> nhu hom nay", async () => {
		await datAgent({ status: "error", error: new Error("fetch failed") });
		await moMan();
		expect(q('[data-tu-choi="chua-cau-hinh"]')).toBeNull();
		expect(q('[data-luot="loi"]')).not.toBeNull();
	});

	test("loi-chua-cau-hinh: 401 chua-dang-nhap -> khong phai cau chua bat", async () => {
		await datAgent({
			status: "error",
			error: await loiCua(401, CUA_OKR.loi.chuaDangNhap),
		});
		await moMan();
		expect(q('[data-tu-choi="chua-cau-hinh"]')).toBeNull();
	});

	test("loi-chua-cau-hinh: cua tra dung hang", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../app/eve/agents/okr/eve/v1/[...path]/route.ts"),
			"utf8",
		);
		expect(nguon).toContain(
			"loi(CUA_OKR.trangThaiChuaCauHinh, CUA_OKR.loi.chuaCauHinh)",
		);
	});
});

describe("ds-cuoc-dem", () => {
	test("ds-cuoc-dem: tieu de danh sach dem cuoc co luot, khong dem cuoc rong", async () => {
		const rong = (i: number) => ({
			...CUOC,
			id: `c-rong-${i}`,
			trangThai: "bo" as const,
			soLuot: 0,
			moLuc: `2026-11-0${i}T03:00:00.000Z`,
		});
		dat("okr.soanDanhSachCuoc", () => ({
			cuoc: [
				{ ...CUOC, id: "c-co-luot", trangThai: "da-dua-vao", soLuot: 3 },
				rong(1),
				rong(2),
				rong(3),
			],
			soCuocDaDung: 1,
			tranCuoc: 3,
		}));
		await mo(
			<DanhSachCuoc
				donVi={{
					cycleId: "q1",
					level: "phong-ban",
					divisionId: null,
					departmentId: "pb-1",
				}}
				dong={() => {}}
				mo={() => {}}
			/>,
		);
		await cho(
			() => q('[data-cuoc="danh-sach"] [data-cuoc-id]') !== null,
			"danh sach cuoc",
		);
		expect(qa('[data-cuoc="danh-sach"] [role="listitem"]')).toHaveLength(4);
		expect(
			chu('[data-slot="sheet-description"]'),
			"danh sach dem ca cuoc rong",
		).toBe(m.cuoc.dem("1", "3"));
	});
});
