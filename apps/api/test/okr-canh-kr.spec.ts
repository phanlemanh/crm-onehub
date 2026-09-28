import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { OKR_CANH_KR } from "@crm/validation/okr-canh-kr";
import { parseOkrVet } from "@crm/validation/okr-vet";
import {
	type BoiCanhDong,
	dongViecTu,
	type HangViec,
} from "../src/okr/canh-kr";
import type { CanhKrOutput } from "../src/okr/okr-canh-kr.contracts";
import {
	dem,
	donSanCanhKr,
	gieoCanhKr,
	type SanCanhKr,
	type TenNguoiCanh,
} from "./okr-canh-kr-san";
import { doc, dungSan, goi, type Json, ok, type TraLoi } from "./okr-san";

dungSan();

const CAU = {
	khongSuaDuoc:
		"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới đổi việc của KR này.",
	nguoiLam: "Người làm phải là thành viên còn trong không gian làm việc.",
	tieuDeNgan: `tieuDe: Too small: expected string to have >=${OKR_CANH_KR.tieuDe.min} characters`,
	tieuDeDai: `tieuDe: Too big: expected string to have <=${OKR_CANH_KR.tieuDe.max} characters`,
} as const;

const HANH_DONG_VIEC = ["them-viec", "sua-viec", "xong-viec", "go-viec"];
const CHO_MS = 30_000;
const CHO_MA_TRAN_MS = 120_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const ngayCach = (soNgay: number) =>
	ngayVN(new Date(Date.now() + soNgay * NGAY_MS));

type ThaoTac = "them" | "sua" | "danh-dau" | "go";
const THAO_TAC: ThaoTac[] = ["them", "sua", "danh-dau", "go"];
const NGUOI: TenNguoiCanh[] = ["A", "T", "B", "M", "O"];

const KY_VONG = {
	A: { them: 200, sua: 200, "danh-dau": 200, go: 200 },
	T: { them: 200, sua: 200, "danh-dau": 200, go: 200 },
	B: { them: 403, sua: 403, "danh-dau": 200, go: 403 },
	M: { them: 403, sua: 403, "danh-dau": 403, go: 403 },
	O: { them: 403, sua: 403, "danh-dau": 403, go: 403 },
} satisfies Record<TenNguoiCanh, Record<ThaoTac, 200 | 403>>;

const idCua = (tra: TraLoi, nhan: string) => ok<{ id: string }>(tra, nhan).id;

async function demHai(): Promise<{ viec: number; vet: number }> {
	return { viec: await dem("okrViecKr"), vet: await dem("okrTrail") };
}

async function themViec(
	san: SanCanhKr,
	ai: string,
	vao: { tieuDe?: string; nguoiLamUserId?: string; hanNgay?: string | null },
): Promise<TraLoi> {
	return goi(
		"okr.themViec",
		{
			keyResultId: san.kr,
			tieuDe: vao.tieuDe ?? "Gọi lại 20 đối tác cũ",
			nguoiLamUserId: vao.nguoiLamUserId ?? san.nguoi.B.id,
			hanNgay: vao.hanNgay === undefined ? "2026-11-20" : vao.hanNgay,
		},
		ai,
	);
}

const hangViec = (id: string) =>
	db.okrViecKr.findUnique({
		where: { id },
		select: {
			loai: true,
			tieuDe: true,
			nguoiLamUserId: true,
			hanNgay: true,
			xongLuc: true,
		},
	});

const ngayCua = (d: Date | null | undefined) =>
	d ? d.toISOString().slice(0, 10) : null;

describe("viec-vong-doi", () => {
	let san: SanCanhKr;
	beforeAll(async () => {
		san = await gieoCanhKr();
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"viec-vong-doi: them, sua, xong, chua xong, go — doc DB sau tung buoc, vet dung thu tu",
		async () => {
			const { A, B } = san.nguoi;
			const id = idCua(await themViec(san, A.cookie, {}), "them viec");
			const moi = await hangViec(id);
			expect({ ...moi, hanNgay: ngayCua(moi?.hanNgay) }).toEqual({
				loai: "viec",
				tieuDe: "Gọi lại 20 đối tác cũ",
				nguoiLamUserId: B.id,
				hanNgay: "2026-11-20",
				xongLuc: null,
			});

			ok(
				await goi(
					"okr.suaViec",
					{ id, tieuDe: "Gọi lại 25 đối tác cũ", hanNgay: null },
					A.cookie,
				),
				"sua viec",
			);
			const sua = await hangViec(id);
			expect({
				tieuDe: sua?.tieuDe,
				hanNgay: sua?.hanNgay,
				nguoiLamUserId: sua?.nguoiLamUserId,
			}).toEqual({
				tieuDe: "Gọi lại 25 đối tác cũ",
				hanNgay: null,
				nguoiLamUserId: B.id,
			});

			ok(
				await goi("okr.danhDauViec", { id, xong: true }, A.cookie),
				"danh dau xong",
			);
			expect((await hangViec(id))?.xongLuc).toBeInstanceOf(Date);

			ok(
				await goi("okr.danhDauViec", { id, xong: false }, A.cookie),
				"danh dau chua xong",
			);
			expect((await hangViec(id))?.xongLuc).toBeNull();

			ok(await goi("okr.goViec", { id }, A.cookie), "go viec");
			expect(await db.okrViecKr.count({ where: { id } })).toBe(0);

			const vet = await db.okrTrail.findMany({
				where: { keyResultId: san.kr, action: { in: HANH_DONG_VIEC } },
				orderBy: [{ at: "asc" }, { id: "asc" }],
				select: {
					action: true,
					objectiveId: true,
					actorUserId: true,
					before: true,
					after: true,
				},
			});
			expect(vet.map((v) => v.action)).toEqual([
				"them-viec",
				"sua-viec",
				"xong-viec",
				"xong-viec",
				"go-viec",
			]);
			expect(
				vet.every((v) => v.objectiveId === san.mt && v.actorUserId === A.id),
			).toBe(true);
			expect(parseOkrVet(vet[0]?.after)).toEqual({
				viecId: id,
				tieuDe: "Gọi lại 20 đối tác cũ",
				nguoiLamUserId: B.id,
				hanNgay: "2026-11-20",
			});
			expect(
				vet
					.slice(2, 4)
					.map((v) => [parseOkrVet(v.before), parseOkrVet(v.after)]),
			).toEqual([
				[
					{ viecId: id, xong: false },
					{ viecId: id, xong: true },
				],
				[
					{ viecId: id, xong: true },
					{ viecId: id, xong: false },
				],
			]);
			expect(parseOkrVet(vet[4]?.after)).toBeNull();
		},
		CHO_MS,
	);

	test(
		"viec-tu-choi: tieu de 1 va 201 ky tu, nguoi lam khong phai thanh vien — 400 cau ghim, bang khong doi",
		async () => {
			const { A } = san.nguoi;
			const ca: [string, Parameters<typeof themViec>[2], string][] = [
				[
					"1 ky tu",
					{ tieuDe: "x".repeat(OKR_CANH_KR.tieuDe.min - 1) },
					CAU.tieuDeNgan,
				],
				[
					"201 ky tu",
					{ tieuDe: "x".repeat(OKR_CANH_KR.tieuDe.max + 1) },
					CAU.tieuDeDai,
				],
				[
					"nguoi lam ngoai",
					{ nguoiLamUserId: "khong-phai-thanh-vien" },
					CAU.nguoiLam,
				],
			];
			const nhan: string[] = [];
			for (const [ten, vao, cau] of ca) {
				const truoc = await demHai();
				const tra = await themViec(san, A.cookie, vao);
				const sau = await demHai();
				nhan.push(
					`${ten}: ${tra.status} ${tra.loi === cau ? "cau-ghim" : tra.loi} ${JSON.stringify(sau) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sau })}`,
				);
			}
			expect(nhan).toEqual(ca.map(([ten]) => `${ten}: 400 cau-ghim khong-doi`));
		},
		CHO_MS,
	);

	test(
		"viec-nguyen-van: tieu de tieng Anh, emoji, 200 ky tu lien — luu va doc lai nguyen van",
		async () => {
			const { A } = san.nguoi;
			const tieuDe = [
				"Call back 20 old partners 🚀",
				"x".repeat(OKR_CANH_KR.tieuDe.max),
			];
			const ids: string[] = [];
			for (const t of tieuDe)
				ids.push(
					idCua(
						await themViec(san, A.cookie, { tieuDe: t, hanNgay: null }),
						`them ${t.slice(0, 10)}`,
					),
				);
			const hang = await db.okrViecKr.findMany({
				where: { id: { in: ids } },
				select: { id: true, tieuDe: true },
			});
			expect(ids.map((id) => hang.find((h) => h.id === id)?.tieuDe)).toEqual(
				tieuDe,
			);
			const canh = await doc<CanhKrOutput>("okr.canhKr", A.cookie, {
				keyResultId: san.kr,
			});
			const tieuDeDoc = new Map(
				canh.dong.flatMap((d) =>
					d.loai === "viec" ? [[d.id, d.tieuDe] as const] : [],
				),
			);
			expect(ids.map((id) => tieuDeDoc.get(id))).toEqual(tieuDe);
			for (const id of ids)
				ok(await goi("okr.goViec", { id }, A.cookie), "don viec");
		},
		CHO_MS,
	);

	test(
		"viec-doc-canh: canhKr tra dong viec, qua han theo ngay VN, quyen theo nguoi, co khoa",
		async () => {
			const { A, B, O, T } = san.nguoi;
			const hanToi = ngayCach(30);
			const hanQua = ngayCach(-1);
			const id = idCua(
				await themViec(san, T.cookie, { hanNgay: hanToi }),
				"them viec doc",
			);
			const idQua = idCua(
				await themViec(san, T.cookie, { hanNgay: hanQua }),
				"them viec qua han",
			);
			const cuaB = await doc<CanhKrOutput>("okr.canhKr", B.cookie, {
				keyResultId: san.kr,
			});
			expect(cuaB.kr.id).toBe(san.kr);
			expect(cuaB.kr.objectiveId).toBe(san.mt);
			expect(cuaB.khoa).toBe(false);
			expect(cuaB.dong.find((d) => d.id === id)).toEqual({
				id,
				loai: "viec",
				tieuDe: "Gọi lại 20 đối tác cũ",
				nguoiLam: { id: B.id, name: B.id, daRoi: false },
				hanNgay: hanToi,
				quaHan: false,
				xong: false,
				laNguoiLam: true,
			});
			expect(
				cuaB.dong.flatMap((d) =>
					d.id === idQua && d.loai === "viec" ? [[d.hanNgay, d.quaHan]] : [],
				),
			).toEqual([[hanQua, true]]);
			ok(await goi("okr.goViec", { id: idQua }, T.cookie), "don viec qua han");
			const quyen: Record<string, Json> = {};
			for (const [ten, n] of [
				["A", A],
				["T", T],
				["B", B],
				["O", O],
			] as const)
				quyen[ten] = (
					await doc<CanhKrOutput>("okr.canhKr", n.cookie, {
						keyResultId: san.kr,
					})
				).quyen;
			expect(quyen).toEqual({
				A: { suaDuoc: true, ganDuoc: true },
				T: { suaDuoc: true, ganDuoc: true },
				B: { suaDuoc: false, ganDuoc: false },
				O: { suaDuoc: false, ganDuoc: false },
			});
			ok(await goi("okr.goViec", { id }, T.cookie), "don viec doc");
		},
		CHO_MS,
	);
});

describe("viec-quyen", () => {
	let san: SanCanhKr;
	beforeAll(async () => {
		san = await gieoCanhKr();
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	const viecMoi = async (nguoiLamUserId: string) =>
		idCua(
			await themViec(san, san.nguoi.T.cookie, { nguoiLamUserId }),
			"gieo viec",
		);

	test(
		"viec-quyen: ma tran 5 nguoi x 4 thao tac khai truoc, o 403 khong doi bang",
		async () => {
			const nhan = {} as Record<TenNguoiCanh, Record<ThaoTac, number>>;
			const lech: string[] = [];
			for (const ten of NGUOI) {
				const n = san.nguoi[ten];
				const hang = {} as Record<ThaoTac, number>;
				for (const tt of THAO_TAC) {
					const viec = tt === "them" ? "" : await viecMoi(san.nguoi.B.id);
					const truoc = await demHai();
					const tra =
						tt === "them"
							? await themViec(san, n.cookie, {})
							: tt === "sua"
								? await goi(
										"okr.suaViec",
										{ id: viec, tieuDe: "Tiêu đề khác" },
										n.cookie,
									)
								: tt === "danh-dau"
									? await goi(
											"okr.danhDauViec",
											{ id: viec, xong: true },
											n.cookie,
										)
									: await goi("okr.goViec", { id: viec }, n.cookie);
					const sau = await demHai();
					hang[tt] = tra.status;
					if (tra.status === 403) {
						if (tra.loi !== CAU.khongSuaDuoc)
							lech.push(`${ten} ${tt}: cau ${tra.loi}`);
						if (JSON.stringify(truoc) !== JSON.stringify(sau))
							lech.push(
								`${ten} ${tt}: bang doi ${JSON.stringify({ truoc, sau })}`,
							);
					}
				}
				nhan[ten] = hang;
			}
			expect(nhan).toEqual(KY_VONG);
			expect(lech).toEqual([]);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"viec-quyen: B danh dau viec cua nguoi khac — 403, bang khong doi",
		async () => {
			const viec = await viecMoi(san.nguoi.M.id);
			const truoc = await demHai();
			const tra = await goi(
				"okr.danhDauViec",
				{ id: viec, xong: true },
				san.nguoi.B.cookie,
			);
			expect(`${tra.status} ${tra.loi}`).toBe(`403 ${CAU.khongSuaDuoc}`);
			expect(await demHai()).toEqual(truoc);
			expect((await hangViec(viec))?.xongLuc).toBeNull();
		},
		CHO_MS,
	);
});

describe("viec-qua-han", () => {
	const HOM_NAY = "2026-11-20";
	const boiCanh: BoiCanhDong = {
		userId: "u-b",
		homNay: HOM_NAY,
		tenNguoi: new Map([["u-b", "B"]]),
		conThanhVien: new Set(["u-b"]),
	};
	const hang = (hanNgay: string | null, xong: boolean): HangViec => ({
		id: "v",
		loai: "viec",
		tieuDe: "Gọi lại",
		nguoiLamUserId: "u-b",
		hanNgay: hanNgay === null ? null : new Date(`${hanNgay}T00:00:00.000Z`),
		xongLuc: xong ? new Date("2026-11-01T03:00:00.000Z") : null,
		campaignId: null,
		planId: null,
	});

	test("viec-qua-han: han truoc hom nay VN va chua xong moi qua han; xong khong bao gio qua han", () => {
		const CA: [string | null, boolean, boolean][] = [
			["2026-11-19", false, true],
			["2026-11-20", false, false],
			["2026-11-21", false, false],
			[null, false, false],
			["2026-11-19", true, false],
			["2026-01-01", true, false],
		];
		expect(
			CA.map(([han, xong]) => dongViecTu(hang(han, xong), boiCanh).quaHan),
		).toEqual(CA.map(([, , k]) => k));
	});

	test("viec-qua-han: nguoi lam roi thi daRoi, laNguoiLam theo nguoi goi", () => {
		const roi = dongViecTu(hang(null, false), {
			...boiCanh,
			userId: "u-a",
			conThanhVien: new Set(),
		});
		expect([roi.nguoiLam, roi.laNguoiLam]).toEqual([
			{ id: "u-b", name: "B", daRoi: true },
			false,
		]);
	});
});
