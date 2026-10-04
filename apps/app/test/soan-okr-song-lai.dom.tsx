import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ClientError } from "eve/client";
import { CUA_OKR } from "@/lib/cua-okr-config";
import {
	bam,
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
	goiCua,
	m,
	mo,
	moKhung,
	moMan,
	nut,
	q,
	qa,
	SAN_SANG_BAT,
	type SanSangGia,
	SOAN_UI,
	soLanMoAgent,
} from "./khung-soan-okr";

const { HINH_NUT_TAT } = await import("@/app/(app)/[slug]/okr/soan/nut-soan");

beforeEach(datLai);
afterEach(don);

const DON_PB1 = "pb:pb-1";
const SAN_TOI_THIEU = 22;
const TRAN = "3";

const BAT: readonly (readonly [string, SanSangGia])[] = [
	["bat-thuong", SAN_SANG_BAT],
	[
		"bat-co-cuoc-dang",
		{ ...SAN_SANG_BAT, cuocDang: { ...CUOC, soLuot: 0 }, soCuocDaDung: 1 },
	],
	["nac-an", { ...SAN_SANG_BAT, nac: "an", soCuocDaDung: 1 }],
];
const MA = Object.keys(HINH_NUT_TAT);
const O = [
	...MA.map((lyDo) => [lyDo, { bat: false, lyDo }] as const),
	...BAT,
].flatMap(([ten, sanSang]) =>
	[false, true].map((quanTri) => ({ ten, sanSang, quanTri })),
);

describe("nut-chua-cau-hinh", () => {
	test("nut-chua-cau-hinh: bang nut bang tap ma ly do", () => {
		expect([...MA].sort(), `bang nut lech union: ${MA.join(",")}`).toEqual(
			Object.keys(m.lyDo).sort(),
		);
	});

	test("nut-chua-cau-hinh: ma tran du o", () => {
		if (O.length < SAN_TOI_THIEU) throw new Error("ma tran rong");
		expect(O.length).toBe(SAN_TOI_THIEU);
	});

	for (const { ten, sanSang, quanTri } of O) {
		test(`nut-chua-cau-hinh: ${ten} ${quanTri ? "quan-tri" : "nguoi-sua"}`, async () => {
			await moKhung(DON_PB1, { sanSang, quanTri, cauNoi: true });
			const homNayCo = q("[data-nut-soan]") !== null;
			if (sanSang.bat && sanSang.soCuocDaDung > 0 && homNayCo)
				expect(
					q('[data-nut="ds-cuoc"]'),
					`doi chung ds-cuoc: ${ten}`,
				).not.toBeNull();
			await don();
			datLai();
			await moKhung(DON_PB1, { sanSang, quanTri, cauNoi: false });
			const co = qa("[data-nut-soan]").map((o) =>
				o.getAttribute("data-nut-soan"),
			);
			if (!homNayCo) {
				expect(co, `nut mo khi chua cau hinh: ${ten}`).toEqual([]);
				return;
			}
			expect(co, `nut mo khi chua cau hinh: ${ten}`).toEqual([
				"nut-chua-cau-hinh",
			]);
			const n = q('[data-nut-soan="nut-chua-cau-hinh"] button');
			expect(n?.hasAttribute("disabled")).toBe(true);
			const moTa = document.getElementById(
				n?.getAttribute("aria-describedby") ?? "",
			);
			expect(moTa?.textContent).toBe(m.nut.chuaCauHinh);
			expect(document.body.textContent).not.toContain(m.nut.tiep);
			expect(
				q('[data-nut="ds-cuoc"]'),
				`nut ds-cuoc khi chua cau hinh: ${ten}`,
			).toBeNull();
			expect(goiCua("okr.soanMo").length).toBe(0);
		});
	}

	test("nut-chua-cau-hinh: doi chung duong — da cau hinh, bam nut goi soanMo dung 1 lan", async () => {
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT, cauNoi: true });
		await bam(nut(m.nut.soan));
		expect(goiCua("okr.soanMo").length).toBe(1);
	});

	for (const k of [0, 1, 2, 3]) {
		test(`nut-chua-cau-hinh — so cuoc: k=${k}`, async () => {
			await moKhung(DON_PB1, {
				sanSang: { ...SAN_SANG_BAT, soCuocDaDung: k },
				cauNoi: true,
			});
			if (k === 0) {
				expect(
					q('[data-nut="ds-cuoc"]'),
					`so cuoc tren nut lech: ${k}`,
				).toBeNull();
				return;
			}
			expect(chu('[data-nut="ds-cuoc"]'), `so cuoc tren nut lech: ${k}`).toBe(
				m.nut.dsCuoc(String(k), TRAN),
			);
		});
	}
});

describe("man-chua-cau-hinh", () => {
	test("man-chua-cau-hinh: cuoc dang 0 luot, chua cau hinh -> trang trong, khong mo phien", async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
		await moMan(false, false);
		expect(
			chu("[data-man-chua-cau-hinh] [data-slot='empty-title']"),
			"man mo phien khi chua cau hinh",
		).toBe(m.nut.chuaCauHinh);
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
		expect(q('[data-nut="thu-lai"]')).toBeNull();
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
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
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
