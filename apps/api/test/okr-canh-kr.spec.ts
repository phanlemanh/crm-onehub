import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, type OkrTrailModel, type OkrViecKrModel } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { OKR_CANH_KR } from "@crm/validation/okr-canh-kr";
import {
	type HanhDongVet,
	type OkrVetSnapshot,
	parseOkrVet,
} from "@crm/validation/okr-vet";
import { WORKSPACE_ROLES } from "@crm/validation/vai-workspace";
import {
	type BoiCanhDong,
	dongViecTu,
	type HangSangKien,
	type HangViec,
	lienKetChoVai,
	vetSangKienChoVai,
} from "../src/okr/canh-kr";
import type { CanhKrOutput, LienKet } from "../src/okr/okr-canh-kr.contracts";
import {
	chienDichMoi,
	congTyMoi,
	dem,
	donSanCanhKr,
	gieoCanhKr,
	gieoSangKien,
	keHoachMoi,
	type SanCanhKr,
	type SanSangKien,
	TEN_C,
	TEN_C_MOI,
	type TenNguoiCanh,
} from "./okr-canh-kr-san";
import {
	doc,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ok,
	type TraLoi,
} from "./okr-san";

dungSan();

const CAU = {
	khongGanDuoc:
		"Gắn sáng kiến cần quyền đọc dữ liệu đối tác — vai «chỉ OKR» không gắn được.",
	daGan: "Sáng kiến này đã gắn vào KR rồi.",
	khongCoChienDich: (id: string) => `Không có chiến dịch nào mang mã ${id}.`,
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

type DongSangKienDoc = Extract<
	CanhKrOutput["dong"][number],
	{ loai: "chien-dich" | "ke-hoach" }
>;

async function ganSangKien(
	san: SanCanhKr,
	ai: string,
	loai: "chien-dich" | "ke-hoach",
	banGhiId: string,
	keyResultId = san.kr,
): Promise<TraLoi> {
	return goi("okr.ganSangKien", { keyResultId, loai, banGhiId }, ai);
}

async function sangKienCua(
	san: SanCanhKr,
	ai: string,
): Promise<DongSangKienDoc[]> {
	const canh = await doc<CanhKrOutput>("okr.canhKr", ai, {
		keyResultId: san.kr,
	});
	return canh.dong.flatMap((d) => (d.loai === "viec" ? [] : [d]));
}

function chuaChuoi(
	ten: string,
	hang: OkrViecKrModel | OkrTrailModel,
	chuoi: readonly string[],
): string[] {
	return Object.entries(hang).flatMap(([cot, v]) => {
		const chu = JSON.stringify(v) ?? "";
		return chuoi
			.filter((c) => chu.includes(c))
			.map((c) => `${ten}.${cot} chua «${c}»`);
	});
}

describe("sang-kien", () => {
	let san: SanCanhKr;
	let sk: SanSangKien;
	beforeAll(async () => {
		san = await gieoCanhKr();
		sk = await gieoSangKien(san);
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"sang-kien-gan: hang chi luu ma, tieuDe rong; canhKr doc ten song; vet chi mang loai va ma",
		async () => {
			const { A } = san.nguoi;
			const idC = idCua(
				await ganSangKien(san, A.cookie, "chien-dich", sk.C),
				"gan C",
			);
			const idP = idCua(
				await ganSangKien(san, A.cookie, "ke-hoach", sk.P),
				"gan P",
			);
			const hang = await db.okrViecKr.findMany({
				where: { id: { in: [idC, idP] } },
				orderBy: { position: "asc" },
			});
			const tenCam = [TEN_C, sk.tenX, sk.tenPhuTrachC];
			expect(
				hang.flatMap((h) => chuaChuoi(`okrViecKr ${h.loai}`, h, tenCam)),
			).toEqual([]);
			expect(
				hang.map((h) => ({
					id: h.id,
					loai: h.loai,
					campaignId: h.campaignId,
					planId: h.planId,
					tieuDe: h.tieuDe,
					nguoiLamUserId: h.nguoiLamUserId,
					taoBoiUserId: h.taoBoiUserId,
				})),
			).toEqual([
				{
					id: idC,
					loai: "chien-dich",
					campaignId: sk.C,
					planId: null,
					tieuDe: "",
					nguoiLamUserId: null,
					taoBoiUserId: A.id,
				},
				{
					id: idP,
					loai: "ke-hoach",
					campaignId: null,
					planId: sk.P,
					tieuDe: "",
					nguoiLamUserId: null,
					taoBoiUserId: A.id,
				},
			]);
			expect(await sangKienCua(san, A.cookie)).toEqual([
				{
					id: idC,
					loai: "chien-dich",
					lienKet: {
						loai: "chien-dich",
						coQuyen: true,
						id: sk.C,
						ten: TEN_C,
						trangThai: "dang-chay",
					},
				},
				{
					id: idP,
					loai: "ke-hoach",
					lienKet: {
						loai: "ke-hoach",
						coQuyen: true,
						id: sk.P,
						ten: sk.tenX,
						trangThai: "dang-chay",
					},
				},
			]);

			await db.campaign.update({
				where: { id: sk.C },
				data: { name: TEN_C_MOI },
			});
			expect(
				(await sangKienCua(san, A.cookie)).map((d) =>
					d.lienKet.coQuyen ? d.lienKet.ten : null,
				),
			).toEqual([TEN_C_MOI, sk.tenX]);

			const vetK = await db.okrTrail.findMany({
				where: { keyResultId: san.kr },
			});
			expect(vetK.length).toBeGreaterThanOrEqual(2);
			expect(
				vetK.flatMap((v) =>
					chuaChuoi(`okrTrail ${v.action} ${v.id}`, v, [...tenCam, TEN_C_MOI]),
				),
			).toEqual([]);
			const vet = await db.okrTrail.findMany({
				where: { keyResultId: san.kr, action: "gan-sang-kien" },
				orderBy: [{ at: "asc" }, { id: "asc" }],
				select: {
					objectiveId: true,
					actorUserId: true,
					before: true,
					after: true,
				},
			});
			expect(
				vet.map((v) => ({
					objectiveId: v.objectiveId,
					actorUserId: v.actorUserId,
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
			).toEqual([
				{
					objectiveId: san.mt,
					actorUserId: A.id,
					before: null,
					after: { loai: "chien-dich", campaignId: sk.C },
				},
				{
					objectiveId: san.mt,
					actorUserId: A.id,
					before: null,
					after: { loai: "ke-hoach", planId: sk.P },
				},
			]);
		},
		CHO_MS,
	);

	test(
		"sang-kien-tu-choi: gan lan hai, ma khong ton tai, vai okr (ca khi phu trach KR), nguoi khong sua duoc — cau ghim, bang khong doi",
		async () => {
			const { A, B, O } = san.nguoi;
			const x = await congTyMoi("cong-ty-tu-choi", A);
			const P2 = await keHoachMoi(x.congTy, A.id);
			ok(await ganSangKien(san, A.cookie, "ke-hoach", P2), "gan P2 lan dau");
			const maLa = `khong-co-${sk.C}`;
			await db.okrKeyResult.update({
				where: { id: san.krMoc },
				data: { ownerUserId: O.id },
			});
			const ca: [string, () => Promise<TraLoi>, number, string][] = [
				[
					"gan P2 lan hai",
					() => ganSangKien(san, A.cookie, "ke-hoach", P2),
					400,
					CAU.daGan,
				],
				[
					"ma chien dich khong ton tai",
					() => ganSangKien(san, A.cookie, "chien-dich", maLa),
					404,
					CAU.khongCoChienDich(maLa),
				],
				[
					"O vai okr gan P",
					() => ganSangKien(san, O.cookie, "ke-hoach", sk.P),
					403,
					CAU.khongGanDuoc,
				],
				[
					"O vai okr phu trach krMoc gan C",
					() => ganSangKien(san, O.cookie, "chien-dich", sk.C, san.krMoc),
					403,
					CAU.khongGanDuoc,
				],
				[
					"B khong sua duoc KR",
					() => ganSangKien(san, B.cookie, "ke-hoach", P2, san.krMoc),
					403,
					CAU.khongSuaDuoc,
				],
			];
			const nhan: string[] = [];
			try {
				for (const [ten, lam, ma, cau] of ca) {
					const truoc = await demHai();
					const tra = await lam();
					const sau = await demHai();
					nhan.push(
						`${ten}: ${tra.status === ma ? ma : `${tra.status}!=${ma}`} ${tra.loi === cau ? "cau-ghim" : tra.loi} ${JSON.stringify(sau) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sau })}`,
					);
				}
			} finally {
				await db.okrKeyResult.update({
					where: { id: san.krMoc },
					data: { ownerUserId: A.id },
				});
			}
			console.log(nhan.join("\n"));
			expect(nhan).toEqual(
				ca.map(([ten, , ma]) => `${ten}: ${ma} cau-ghim khong-doi`),
			);
		},
		CHO_MS,
	);

	test(
		"sang-kien-song-song: hai loi goi gan cung ke hoach cung luc — mot hang, mot 400 cau ghim",
		async () => {
			const { A } = san.nguoi;
			const x = await congTyMoi("cong-ty-song-song", A);
			const P3 = await keHoachMoi(x.congTy, A.id);
			const truoc = await demHai();
			const tra = await Promise.all([
				ganSangKien(san, A.cookie, "ke-hoach", P3),
				ganSangKien(san, A.cookie, "ke-hoach", P3),
			]);
			const sau = await demHai();
			expect(
				tra
					.map((t) => `${t.status} ${t.status === 200 ? "" : t.loi}`.trim())
					.sort(),
			).toEqual(["200", `400 ${CAU.daGan}`]);
			expect(
				await db.okrViecKr.count({
					where: { keyResultId: san.kr, planId: P3 },
				}),
			).toBe(1);
			expect({ viec: sau.viec - truoc.viec, vet: sau.vet - truoc.vet }).toEqual(
				{
					viec: 1,
					vet: 1,
				},
			);
		},
		CHO_MS,
	);

	test(
		"sang-kien-trang-thai: chien dich DRAFT, RUNNING, FINISHED, xoa; ke hoach mo, dong, cong ty luu tru van mo duoc, xoa han cong ty",
		async () => {
			const { A } = san.nguoi;
			const C2 = await chienDichMoi("Chiến dịch trạng thái", A);
			const y = await congTyMoi("cong-ty-Y", A);
			const PY = await keHoachMoi(y.congTy, A.id);
			const idC2 = idCua(
				await ganSangKien(san, A.cookie, "chien-dich", C2),
				"gan C2",
			);
			const idPY = idCua(
				await ganSangKien(san, A.cookie, "ke-hoach", PY),
				"gan PY",
			);
			const trangThai = async (id: string) => {
				const d = (await sangKienCua(san, A.cookie)).find((x) => x.id === id);
				return d?.lienKet.coQuyen
					? [d.lienKet.trangThai, d.lienKet.id, d.lienKet.ten]
					: d?.lienKet;
			};
			const buoc: [string, unknown][] = [];
			buoc.push(["C2 DRAFT", await trangThai(idC2)]);
			ok(await goi("campaigns.start", { id: C2 }, A.cookie), "chay C2");
			buoc.push(["C2 RUNNING", await trangThai(idC2)]);
			ok(await goi("campaigns.finish", { id: C2 }, A.cookie), "xong C2");
			buoc.push(["C2 FINISHED", await trangThai(idC2)]);
			await db.campaign.delete({ where: { id: C2 } });
			buoc.push(["C2 xoa", await trangThai(idC2)]);

			buoc.push(["PY mo", await trangThai(idPY)]);
			await db.onboardingPlan.update({
				where: { id: PY },
				data: { closedAt: new Date() },
			});
			buoc.push(["PY dong", await trangThai(idPY)]);
			ok(await goi("companies.archive", { id: y.congTy }), "luu tru Y");
			buoc.push(["Y luu tru", await trangThai(idPY)]);
			const mo = await goiQuery("onboarding.planById", A.cookie, { id: PY });
			buoc.push(["Y luu tru, mo PY", mo.status]);
			ok(await goi("companies.purge", { id: y.congTy }), "xoa han Y");
			buoc.push(["Y xoa han", await trangThai(idPY)]);
			buoc.push([
				"PY con",
				await db.onboardingPlan.count({ where: { id: PY } }),
			]);
			const hangPY = await db.okrViecKr.findUnique({
				where: { id: idPY },
				select: { loai: true, planId: true },
			});
			buoc.push(["hang PY", hangPY]);

			expect(buoc).toEqual([
				["C2 DRAFT", ["chua-chay", C2, "Chiến dịch trạng thái"]],
				["C2 RUNNING", ["dang-chay", C2, "Chiến dịch trạng thái"]],
				["C2 FINISHED", ["da-dong", C2, "Chiến dịch trạng thái"]],
				["C2 xoa", ["da-xoa", null, null]],
				["PY mo", ["dang-chay", PY, y.ten]],
				["PY dong", ["da-dong", PY, y.ten]],
				["Y luu tru", ["da-luu-tru", PY, y.ten]],
				["Y luu tru, mo PY", 200],
				["Y xoa han", ["da-xoa", null, null]],
				["PY con", 0],
				["hang PY", { loai: "ke-hoach", planId: null }],
			]);
		},
		CHO_MS,
	);

	test("sang-kien-vai: lienKetChoVai — vai okr chi loai va coQuyen false, ba vai con lai thay ten; vet sang kien theo vai", () => {
		const hangC: HangSangKien = {
			loai: "chien-dich",
			campaign: { id: "c1", name: TEN_C, status: "RUNNING" },
			plan: null,
		};
		const hangP: HangSangKien = {
			loai: "ke-hoach",
			campaign: null,
			plan: {
				id: "p1",
				closedAt: null,
				company: { name: "Cong ty X", archivedAt: new Date() },
			},
		};
		const thay: LienKet[] = [
			{
				loai: "chien-dich",
				coQuyen: true,
				id: "c1",
				ten: TEN_C,
				trangThai: "dang-chay",
			},
			{
				loai: "ke-hoach",
				coQuyen: true,
				id: "p1",
				ten: "Cong ty X",
				trangThai: "da-luu-tru",
			},
		];
		const an: LienKet[] = [
			{ loai: "chien-dich", coQuyen: false },
			{ loai: "ke-hoach", coQuyen: false },
		];
		expect(
			WORKSPACE_ROLES.map((vai) => [
				lienKetChoVai(vai, hangC),
				lienKetChoVai(vai, hangP),
			]),
		).toEqual(WORKSPACE_ROLES.map((vai) => (vai === "okr" ? an : thay)));

		const anhKeHoach: OkrVetSnapshot = { loai: "ke-hoach", planId: "p1" };
		const anhViec: OkrVetSnapshot = {
			viecId: "v1",
			tieuDe: "Gọi lại",
			nguoiLamUserId: null,
			hanNgay: null,
		};
		const dong = (
			action: HanhDongVet,
			before: OkrVetSnapshot | null,
			after: OkrVetSnapshot | null,
		) => ({ id: "v", action, before, after });
		expect([
			vetSangKienChoVai("member", dong("go-viec", anhKeHoach, null)),
			vetSangKienChoVai("okr", dong("go-viec", anhKeHoach, null)),
			vetSangKienChoVai("okr", dong("gan-sang-kien", null, anhKeHoach)),
			vetSangKienChoVai("okr", dong("go-viec", anhViec, null)),
		]).toEqual([
			dong("go-viec", anhKeHoach, null),
			dong("go-viec", { loai: "ke-hoach", coQuyen: false }, null),
			dong("gan-sang-kien", null, { loai: "ke-hoach", coQuyen: false }),
			dong("go-viec", anhViec, null),
		]);
	});
});
