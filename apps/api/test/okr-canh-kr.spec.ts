import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, type OkrTrailModel, type OkrViecKrModel } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { OKR_CANH_KR } from "@crm/validation/okr-canh-kr";
import {
	type MauKr,
	type MauNoiDung,
	OKR_MAU,
	parseMauNoiDung,
} from "@crm/validation/okr-mau";
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
import type {
	CommentsOutput,
	MauOutput,
	ViecCuaToiOutput,
} from "../src/okr/okr.contracts";
import type { CanhKrOutput, LienKet } from "../src/okr/okr-canh-kr.contracts";
import {
	chienDichMoi,
	congTyMoi,
	dem,
	donSanCanhKr,
	gieoCanhKr,
	gieoKhoa,
	gieoSangKien,
	gieoTuMau,
	keHoachMoi,
	luuMau,
	mauMoi,
	mucTieuNhap,
	nguoiDaRoi,
	roiKhoi,
	type SanCanhKr,
	type SanKhoa,
	type SanSangKien,
	type SanTuMau,
	TEN_C,
	TEN_C_MOI,
	type TenNguoiCanh,
	type TinhHuongKhoa,
	vaoLai,
} from "./okr-canh-kr-san";
import { donSanKhep, gieoMucTieuCongBo } from "./okr-khep-san";
import {
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ma,
	ok,
	pbMoi,
	phien,
	TIEN_TO,
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
	chiMocXongDinhDuoc:
		"Chỉ đính được bằng chứng cho KR kiểu «mốc» đã đánh dấu xong.",
	tuGhiNhan: "Không tự ghi nhận chính mình — chọn người khác.",
	nguoiNhanRoi: "Người nhận phải là thành viên còn trong không gian làm việc.",
	nguoiNhanNhieu: `nguoiNhan: Too big: expected array to have <=${OKR_CANH_KR.nguoiNhan.max} items`,
	krKhacMucTieu: "KR này không thuộc mục tiêu đang bình luận.",
	ghiNhanChiCongBo: "Chỉ ghi nhận được trên mục tiêu đã công bố.",
	loiTrong: `loiNhan: Too small: expected string to have >=${OKR_CANH_KR.loiNhan.min} characters`,
	loiDai: `loiNhan: Too big: expected string to have <=${OKR_CANH_KR.loiNhan.max} characters`,
	khongGoDuocGhiNhan: "Chỉ người gửi hoặc quản trị mới gỡ được ghi nhận này.",
	kyDaKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
	mucTieuDaBo: "Mục tiêu này đã bỏ — việc cạnh KR chỉ đọc.",
	krCoBangChung: "KR đã có bằng chứng — gỡ bằng chứng trước rồi mới xoá được.",
	krCoGhiNhan: "KR đã có ghi nhận gắn vào — không xoá được.",
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

async function themBangChung(
	ai: string,
	keyResultId: string,
	vao: { url?: string; ghiChu?: string } = {},
): Promise<TraLoi> {
	return goi(
		"okr.themBangChung",
		{
			keyResultId,
			url: vao.url ?? "https://drive.google.com/thu",
			ghiChu: vao.ghiChu ?? "Bảng số quý 4",
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
			expect(cuaB.choDuyet).toBe(false);
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
		"sang-kien-gan: T (truong phong, khong phu trach KR) gan C va P — hang chi luu ma, tieuDe rong; canhKr doc ten song; vet chi mang loai va ma",
		async () => {
			const { T } = san.nguoi;
			const idC = idCua(
				await ganSangKien(san, T.cookie, "chien-dich", sk.C),
				"gan C",
			);
			const idP = idCua(
				await ganSangKien(san, T.cookie, "ke-hoach", sk.P),
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
					taoBoiUserId: T.id,
				},
				{
					id: idP,
					loai: "ke-hoach",
					campaignId: null,
					planId: sk.P,
					tieuDe: "",
					nguoiLamUserId: null,
					taoBoiUserId: T.id,
				},
			]);
			expect(await sangKienCua(san, T.cookie)).toEqual([
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
				(await sangKienCua(san, T.cookie)).map((d) =>
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
					actorUserId: T.id,
					before: null,
					after: { loai: "chien-dich", campaignId: sk.C },
				},
				{
					objectiveId: san.mt,
					actorUserId: T.id,
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
			const P2 = await keHoachMoi(san, x.congTy, A.id);
			ok(await ganSangKien(san, A.cookie, "ke-hoach", P2), "gan P2 lan dau");
			const C3 = await chienDichMoi("Chiến dịch gắn hai lần", A);
			ok(await ganSangKien(san, A.cookie, "chien-dich", C3), "gan C3 lan dau");
			const maLa = `khong-co-${sk.C}`;
			await db.okrKeyResult.update({
				where: { id: san.krMoc },
				data: { ownerUserId: O.id },
			});
			const ca: [string, () => Promise<TraLoi>, number, string][] = [
				[
					"gan C3 lan hai",
					() => ganSangKien(san, A.cookie, "chien-dich", C3),
					400,
					CAU.daGan,
				],
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
			const P3 = await keHoachMoi(san, x.congTy, A.id);
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
			const PY = await keHoachMoi(san, y.congTy, A.id);
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
			ok(
				await goi("onboarding.closePlan", { id: PY }, A.cookie),
				"dong ke hoach PY",
			);
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

async function demBC(): Promise<{ bc: number; vet: number }> {
	return { bc: await dem("okrBangChung"), vet: await dem("okrTrail") };
}

describe("bang-chung", () => {
	let san: SanCanhKr;
	beforeAll(async () => {
		san = await gieoCanhKr();
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"bang-chung-vong-doi: dinh vao KR moc dang xong — DB dung hang, canhKr doc lai, go — 0 hang, vet dung thu tu",
		async () => {
			const { A } = san.nguoi;
			await db.okrKeyResult.update({
				where: { id: san.krMoc },
				data: { currentValue: 1 },
			});
			const id = idCua(
				await themBangChung(A.cookie, san.krMoc, {
					url: "https://drive.google.com/x",
					ghiChu: "Báo cáo tháng 11",
				}),
				"dinh bang chung",
			);
			const hang = await db.okrBangChung.findUniqueOrThrow({ where: { id } });
			expect({
				keyResultId: hang.keyResultId,
				url: hang.url,
				ghiChu: hang.ghiChu,
				tacGiaUserId: hang.tacGiaUserId,
			}).toEqual({
				keyResultId: san.krMoc,
				url: "https://drive.google.com/x",
				ghiChu: "Báo cáo tháng 11",
				tacGiaUserId: A.id,
			});
			expect(hang.createdAt).toBeInstanceOf(Date);

			const canh = await doc<CanhKrOutput>("okr.canhKr", A.cookie, {
				keyResultId: san.krMoc,
			});
			expect(canh.bangChung[0]).toEqual({
				id,
				url: "https://drive.google.com/x",
				ghiChu: "Báo cáo tháng 11",
				nguoiDinh: { id: A.id, name: A.id },
				dinhLuc: hang.createdAt.toISOString(),
			});

			ok(await goi("okr.goBangChung", { id }, A.cookie), "go bang chung");
			expect(await db.okrBangChung.count({ where: { id } })).toBe(0);

			const vet = await db.okrTrail.findMany({
				where: {
					keyResultId: san.krMoc,
					action: { in: ["dinh-bang-chung", "go-bang-chung"] },
				},
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
				"dinh-bang-chung",
				"go-bang-chung",
			]);
			expect(
				vet.every((v) => v.objectiveId === san.mt && v.actorUserId === A.id),
			).toBe(true);
			expect(parseOkrVet(vet[0]?.after)).toEqual({
				bangChungId: id,
				url: "https://drive.google.com/x",
			});
			expect(parseOkrVet(vet[1]?.before)).toEqual({
				bangChungId: id,
				url: "https://drive.google.com/x",
				ghiChu: "Báo cáo tháng 11",
			});
			expect(parseOkrVet(vet[1]?.after)).toBeNull();
		},
		CHO_MS,
	);

	test(
		"bang-chung-canh-kr: canhKr tra bangChung moi nhat truoc",
		async () => {
			const { A } = san.nguoi;
			await db.okrKeyResult.update({
				where: { id: san.krMoc },
				data: { currentValue: 1 },
			});
			const id1 = idCua(
				await themBangChung(A.cookie, san.krMoc, {
					url: "https://drive.google.com/1",
				}),
				"dinh 1",
			);
			const id2 = idCua(
				await themBangChung(A.cookie, san.krMoc, {
					url: "https://drive.google.com/2",
				}),
				"dinh 2",
			);
			const canh = await doc<CanhKrOutput>("okr.canhKr", A.cookie, {
				keyResultId: san.krMoc,
			});
			expect(canh.bangChung.map((b) => b.id)).toEqual([id2, id1]);
			ok(await goi("okr.goBangChung", { id: id1 }, A.cookie), "go 1");
			ok(await goi("okr.goBangChung", { id: id2 }, A.cookie), "go 2");
		},
		CHO_MS,
	);

	test(
		"bang-chung-tu-choi: KR tang-toi, KR moc chua xong, nguoi khong sua duoc — 400/403 cau ghim, bang khong doi",
		async () => {
			const { A, B } = san.nguoi;
			await db.okrKeyResult.update({
				where: { id: san.krMoc },
				data: { currentValue: 0 },
			});
			const ca: [string, () => Promise<TraLoi>, number, string][] = [
				[
					"KR tang toi",
					() => themBangChung(A.cookie, san.kr),
					400,
					CAU.chiMocXongDinhDuoc,
				],
				[
					"KR moc chua xong",
					() => themBangChung(A.cookie, san.krMoc),
					400,
					CAU.chiMocXongDinhDuoc,
				],
				[
					"nguoi khong sua duoc",
					() => themBangChung(B.cookie, san.krMoc),
					403,
					CAU.khongSuaDuoc,
				],
			];
			const nhan: string[] = [];
			for (const [ten, lam, ma, cau] of ca) {
				const truoc = await demBC();
				const tra = await lam();
				const sau = await demBC();
				nhan.push(
					`${ten}: ${tra.status === ma ? ma : `${tra.status}!=${ma}`} ${tra.loi === cau ? "cau-ghim" : tra.loi} ${JSON.stringify(sau) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sau })}`,
				);
			}
			expect(nhan).toEqual(
				ca.map(([ten, , ma]) => `${ten}: ${ma} cau-ghim khong-doi`),
			);
		},
		CHO_MS,
	);

	test(
		"bang-chung-go-tu-choi: ma khong ton tai — 404; nguoi khong sua duoc — 403, bang khong doi",
		async () => {
			const { A, B } = san.nguoi;
			await db.okrKeyResult.update({
				where: { id: san.krMoc },
				data: { currentValue: 1 },
			});
			const id = idCua(await themBangChung(A.cookie, san.krMoc), "dinh de go");
			const truoc = await demBC();
			const traB = await goi("okr.goBangChung", { id }, B.cookie);
			const sauB = await demBC();
			const maLa = "khong-co-bang-chung";
			const tra404 = await goi("okr.goBangChung", { id: maLa }, A.cookie);
			const sau404 = await demBC();
			expect({
				khongSuaDuoc: `${traB.status} ${traB.loi} ${JSON.stringify(sauB) === JSON.stringify(truoc)}`,
				khongTonTai: `${tra404.status} ${JSON.stringify(sau404) === JSON.stringify(sauB)}`,
			}).toEqual({
				khongSuaDuoc: `403 ${CAU.khongSuaDuoc} true`,
				khongTonTai: "404 true",
			});
			ok(await goi("okr.goBangChung", { id }, A.cookie), "don bang chung");
		},
		CHO_MS,
	);
});

const LOI_CAM_ON = "Cảm ơn đã chốt kho mới";

async function guiGhiNhan(
	ai: string,
	vao: {
		objectiveId: string;
		keyResultId?: string | null;
		nguoiNhan: string[];
		loiNhan?: string;
	},
): Promise<TraLoi> {
	return goi(
		"okr.guiGhiNhan",
		{
			objectiveId: vao.objectiveId,
			keyResultId: vao.keyResultId ?? null,
			nguoiNhan: vao.nguoiNhan,
			loiNhan: vao.loiNhan ?? LOI_CAM_ON,
		},
		ai,
	);
}

async function demGhiNhan(): Promise<{
	ghiNhan: number;
	nhan: number;
	vet: number;
}> {
	return {
		ghiNhan: await dem("okrGhiNhan"),
		nhan: await dem("okrGhiNhanNhan"),
		vet: await dem("okrTrail"),
	};
}

describe("ghi-nhan-gui", () => {
	let san: SanCanhKr;
	let nhap: { mt: string; kr: string };
	let roi: string;
	beforeAll(async () => {
		san = await gieoCanhKr();
		nhap = await mucTieuNhap(san);
		roi = await nguoiDaRoi("canh-R");
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"ghi-nhan-gui: O (vai okr) gui cho A, B kem KR — DB mot ghi nhan hai nguoi nhan, mot vet; Trao doi xen binh luan t1 < ghi nhan t2 < binh luan t3",
		async () => {
			const { A, B, O } = san.nguoi;
			const c1 = idCua(
				await goi(
					"okr.addComment",
					{ objectiveId: san.mt, body: "t1", mentionUserIds: [] },
					A.cookie,
				),
				"binh luan t1",
			);
			const g = idCua(
				await guiGhiNhan(O.cookie, {
					objectiveId: san.mt,
					keyResultId: san.kr,
					nguoiNhan: [A.id, B.id],
				}),
				"gui ghi nhan",
			);
			const c3 = idCua(
				await goi(
					"okr.addComment",
					{ objectiveId: san.mt, body: "t3", mentionUserIds: [] },
					B.cookie,
				),
				"binh luan t3",
			);

			const hang = await db.okrGhiNhan.findUniqueOrThrow({
				where: { id: g },
				select: {
					objectiveId: true,
					keyResultId: true,
					loiNhan: true,
					tacGiaUserId: true,
					nhan: { select: { userId: true }, orderBy: { userId: "asc" } },
				},
			});
			expect({ ...hang, nhan: hang.nhan.map((n) => n.userId) }).toEqual({
				objectiveId: san.mt,
				keyResultId: san.kr,
				loiNhan: LOI_CAM_ON,
				tacGiaUserId: O.id,
				nhan: [A.id, B.id].sort(),
			});

			const vet = await db.okrTrail.findMany({
				where: { objectiveId: san.mt, action: "ghi-nhan" },
				select: { actorUserId: true, keyResultId: true, after: true },
			});
			expect(vet.map((v) => ({ ...v, after: parseOkrVet(v.after) }))).toEqual([
				{
					actorUserId: O.id,
					keyResultId: san.kr,
					after: { ghiNhanId: g, nguoiNhan: [A.id, B.id] },
				},
			]);

			const doc1 = await doc<CommentsOutput>("okr.comments", O.cookie, {
				objectiveId: san.mt,
			});
			expect(doc1.dong.map((d) => d.loai)).toEqual([
				"binh-luan",
				"ghi-nhan",
				"binh-luan",
			]);
			expect(doc1.dong.map((d) => d.id)).toEqual([c1, g, c3]);
			const dongG = doc1.dong[1];
			expect(dongG?.loai === "ghi-nhan" ? dongG : null).toEqual({
				loai: "ghi-nhan",
				id: g,
				createdAt: expect.any(String),
				nguoiGui: { id: O.id, name: O.id, email: expect.any(String) },
				nguoiNhan: [A.id, B.id].sort().map((id) => ({
					id,
					name: id,
					email: expect.any(String),
				})),
				keyResultId: san.kr,
				keyResultTitle: expect.any(String),
				loiNhan: LOI_CAM_ON,
				goDuoc: true,
			});
			const goDuocTheoNguoi = async (ai: string) => {
				const d = await doc<CommentsOutput>("okr.comments", ai, {
					objectiveId: san.mt,
				});
				return d.dong.flatMap((x) => (x.loai === "ghi-nhan" ? [x.goDuoc] : []));
			};
			expect({
				A: await goDuocTheoNguoi(A.cookie),
				quan: await goDuocTheoNguoi("quan"),
			}).toEqual({ A: [false], quan: [true] });
		},
		CHO_MS,
	);

	test(
		"ghi-nhan-gui: bay ca tu choi viet truoc — moi ca cau ghim, dem hang khong doi",
		async () => {
			const { A, B, T, M, O } = san.nguoi;
			const ca: [string, () => Promise<TraLoi>, string][] = [
				[
					"tu minh",
					() =>
						guiGhiNhan(O.cookie, { objectiveId: san.mt, nguoiNhan: [O.id] }),
					CAU.tuGhiNhan,
				],
				[
					"nguoi da roi",
					() =>
						guiGhiNhan(O.cookie, {
							objectiveId: san.mt,
							nguoiNhan: [A.id, roi],
						}),
					CAU.nguoiNhanRoi,
				],
				[
					"sau nguoi nhan",
					() =>
						guiGhiNhan(O.cookie, {
							objectiveId: san.mt,
							nguoiNhan: [A.id, B.id, T.id, M.id, roi, `${roi}-6`],
						}),
					CAU.nguoiNhanNhieu,
				],
				[
					"KR cua muc tieu khac",
					() =>
						guiGhiNhan(O.cookie, {
							objectiveId: san.mt,
							keyResultId: nhap.kr,
							nguoiNhan: [A.id],
						}),
					CAU.krKhacMucTieu,
				],
				[
					"muc tieu nhap",
					() =>
						guiGhiNhan(O.cookie, { objectiveId: nhap.mt, nguoiNhan: [A.id] }),
					CAU.ghiNhanChiCongBo,
				],
				[
					"loi trong",
					() =>
						guiGhiNhan(O.cookie, {
							objectiveId: san.mt,
							nguoiNhan: [A.id],
							loiNhan: "   ",
						}),
					CAU.loiTrong,
				],
				[
					"loi 501 ky tu",
					() =>
						guiGhiNhan(O.cookie, {
							objectiveId: san.mt,
							nguoiNhan: [A.id],
							loiNhan: "x".repeat(OKR_CANH_KR.loiNhan.max + 1),
						}),
					CAU.loiDai,
				],
			];
			const nhan: string[] = [];
			for (const [ten, lam, cau] of ca) {
				const truoc = await demGhiNhan();
				const tra = await lam();
				const sau = await demGhiNhan();
				nhan.push(
					`${ten}: ${tra.status} ${tra.loi === cau ? "cau-ghim" : tra.loi} ${JSON.stringify(sau) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sau })}`,
				);
			}
			expect(nhan).toEqual(ca.map(([ten]) => `${ten}: 400 cau-ghim khong-doi`));
		},
		CHO_MS,
	);

	test(
		"ghi-nhan-gui: goGhiNhan — A (nguoi nhan) 403; O go cua minh 0 hang, vet go-ghi-nhan; quan tri go ghi nhan cua B",
		async () => {
			const { A, B, O } = san.nguoi;
			const g1 = idCua(
				await guiGhiNhan(O.cookie, { objectiveId: san.mt, nguoiNhan: [A.id] }),
				"O gui g1",
			);
			const g2 = idCua(
				await guiGhiNhan(B.cookie, { objectiveId: san.mt, nguoiNhan: [A.id] }),
				"B gui g2",
			);
			const truoc = await demGhiNhan();
			const traA = await goi("okr.goGhiNhan", { id: g1 }, A.cookie);
			const sauA = await demGhiNhan();
			expect(
				`${traA.status} ${traA.loi} ${JSON.stringify(sauA) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sauA })}`,
			).toBe(`403 ${CAU.khongGoDuocGhiNhan} khong-doi`);

			ok(await goi("okr.goGhiNhan", { id: g1 }, O.cookie), "O go g1");
			ok(await goi("okr.goGhiNhan", { id: g2 }, "quan"), "quan tri go g2");
			const conLai = async (id: string) => ({
				ghiNhan: await db.okrGhiNhan.count({ where: { id } }),
				nhan: await db.okrGhiNhanNhan.count({ where: { ghiNhanId: id } }),
			});
			expect({ g1: await conLai(g1), g2: await conLai(g2) }).toEqual({
				g1: { ghiNhan: 0, nhan: 0 },
				g2: { ghiNhan: 0, nhan: 0 },
			});
			const vet = await db.okrTrail.findMany({
				where: { objectiveId: san.mt, action: "go-ghi-nhan" },
				orderBy: [{ at: "asc" }, { id: "asc" }],
				select: { actorUserId: true, before: true, after: true },
			});
			expect(
				vet.map((v) => ({
					actorUserId: v.actorUserId,
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
			).toEqual([
				{
					actorUserId: O.id,
					before: { ghiNhanId: g1, nguoiNhan: [A.id] },
					after: null,
				},
				{
					actorUserId: phien.quan.nguoi,
					before: { ghiNhanId: g2, nguoiNhan: [A.id] },
					after: null,
				},
			]);
		},
		CHO_MS,
	);
});

describe("ghi-nhan-bao", () => {
	let san: SanCanhKr;
	beforeAll(async () => {
		san = await gieoCanhKr();
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"ghi-nhan-bao: O gui cho A, B — viecCuaToi cua A va B moi nguoi dung mot muc okr-ghi-nhan, cua O khong muc nao, khong okr-nhac-ten tu ghi nhan",
		async () => {
			const { A, B, O } = san.nguoi;
			const g = idCua(
				await guiGhiNhan(O.cookie, {
					objectiveId: san.mt,
					nguoiNhan: [A.id, B.id],
				}),
				"gui ghi nhan",
			);
			const mt = await db.okrObjective.findUniqueOrThrow({
				where: { id: san.mt },
				select: { title: true },
			});
			const theoNguoi = async (ai: string) => {
				const viec = (await doc<ViecCuaToiOutput>("okr.viecCuaToi", ai)).viec;
				return {
					ghiNhan: viec.filter((v) => v.loai === "okr-ghi-nhan"),
					nhacTen: viec.filter((v) => v.loai === "okr-nhac-ten").length,
				};
			};
			const mong = {
				ghiNhan: [
					{
						loai: "okr-ghi-nhan" as const,
						ghiNhanId: g,
						objectiveId: san.mt,
						nhan: mt.title,
						nguoiGui: O.id,
					},
				],
				nhacTen: 0,
			};
			expect({
				A: await theoNguoi(A.cookie),
				B: await theoNguoi(B.cookie),
				O: await theoNguoi(O.cookie),
			}).toEqual({
				A: mong,
				B: mong,
				O: { ghiNhan: [], nhacTen: 0 },
			});
		},
		CHO_MS,
	);
});

const CAU_MAU = {
	canQuanTri:
		"Cần quyền quản trị chương trình OKR để soạn, lưu trữ hay khôi phục mẫu.",
	khongCoDonVi: (id: string) => `Không có đơn vị nào mang mã ${id}.`,
	donViDaLuuTru: (ten: string) =>
		`Đơn vị «${ten}» đã lưu trữ — bỏ khỏi mẫu trước khi lưu.`,
	krMauDichNho: "KR mẫu thứ 2: Kiểu «tăng tới» cần đích lớn hơn khởi điểm.",
	soKrMau: `Mẫu cần từ 1 tới ${OKR_MAU.krToiDa} KR.`,
	thieuDich: (thu: number, ten: string) =>
		`KR thứ ${thu} «${ten}»: thiếu đích.`,
	dichNho: (thu: number, ten: string) =>
		`KR thứ ${thu} «${ten}»: Kiểu «tăng tới» cần đích lớn hơn khởi điểm.`,
	vuotTranKr: (n: number) =>
		`Mục tiêu này đã có ${n} KR — vượt trần chương trình.`,
	khongSuaDuocDonVi:
		"Bạn không sửa được OKR của đơn vị này — chỉ trưởng đơn vị (hoặc trưởng bộ phận chứa nó) sửa được.",
	mauDaLuuTru: "Mẫu này đã lưu trữ — quản trị khôi phục thì mới dùng được.",
	mauKhacCap: "Mẫu này dành cho cấp đơn vị khác.",
	mauKhongApDung: "Mẫu này không áp dụng cho đơn vị này.",
} as const;

const krMau = (over: Partial<MauKr> = {}): MauKr => ({
	title: "Doanh thu mới",
	kind: "tang-toi",
	unit: "triệu",
	startValue: null,
	targetValue: null,
	...over,
});

const noiDungMau = (
	krs: MauKr[],
	cauMucTieu = "Tăng doanh thu phòng",
): MauNoiDung => ({ cauMucTieu, loai: "cam-ket", krs });

const NOI_DUNG_M1: MauNoiDung = {
	cauMucTieu: "Chốt quy trình mới",
	loai: "tham-vong",
	krs: [
		krMau({ title: "Khách quay lại", unit: "khách" }),
		krMau({ title: "Ra mắt quy trình", kind: "moc", unit: "" }),
	],
};
const KR_M2_DAU = krMau();
const KR_M2_SAU = krMau({
	title: "Chi phí mỗi khách",
	kind: "giam-xuong",
	unit: "nghìn",
});
const NOI_DUNG_M2 = noiDungMau([KR_M2_DAU, KR_M2_SAU]);

const hangMau = async (id: string) => {
	const r = await db.okrMau.findUniqueOrThrow({
		where: { id },
		select: {
			ten: true,
			cap: true,
			donViIds: true,
			noiDung: true,
			archivedAt: true,
		},
	});
	return {
		ten: r.ten,
		cap: r.cap,
		donViIds: r.donViIds,
		noiDung: parseMauNoiDung(r.noiDung),
		luuTru: r.archivedAt !== null,
	};
};

async function vetMau(mauId: string) {
	const rows = await db.okrTrail.findMany({
		where: { action: "sua-mau", actorUserId: phien.quan.nguoi },
		orderBy: { at: "asc" },
		select: { objectiveId: true, after: true },
	});
	return rows
		.map((r) => ({ objectiveId: r.objectiveId, after: parseOkrVet(r.after) }))
		.filter((r) => r.after?.mauId === mauId);
}

describe("mau-quan-tri", () => {
	let san: SanTuMau;
	beforeAll(async () => {
		san = await gieoTuMau();
	}, CHO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"mau-quan-tri: luuMau moi, sua ten bo mot KR, luuTruMau, khoiPhucMau — doc DB qua khuon dung tung buoc, bon vet sua-mau co after.mauId",
		async () => {
			const noiDung = noiDungMau([
				krMau(),
				krMau({ title: "Khách mới", startValue: 0, targetValue: 40 }),
			]);
			const ten = ma("mau doanh thu");
			const id = idCua(
				await luuMau({
					id: null,
					ten,
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung,
				}),
				"luu mau moi",
			);
			const buoc1 = await hangMau(id);

			const tenMoi = ma("mau doanh thu gon");
			const noiDungGon = noiDungMau([krMau()]);
			ok(
				await luuMau({
					id,
					ten: tenMoi,
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung: noiDungGon,
				}),
				"sua mau",
			);
			const buoc2 = await hangMau(id);
			ok(await goi("okr.luuTruMau", { id }), "luu tru mau");
			const buoc3 = await hangMau(id);
			ok(await goi("okr.khoiPhucMau", { id }), "khoi phuc mau");
			const buoc4 = await hangMau(id);

			expect([buoc1, buoc2, buoc3, buoc4]).toEqual([
				{
					ten,
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung,
					luuTru: false,
				},
				{
					ten: tenMoi,
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung: noiDungGon,
					luuTru: false,
				},
				{
					ten: tenMoi,
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung: noiDungGon,
					luuTru: true,
				},
				{
					ten: tenMoi,
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung: noiDungGon,
					luuTru: false,
				},
			]);
			expect(await vetMau(id)).toEqual([
				{ objectiveId: null, after: { mauId: id, ten } },
				{ objectiveId: null, after: { mauId: id, ten: tenMoi } },
				{ objectiveId: null, after: { mauId: id, ten: tenMoi, luuTru: true } },
				{
					objectiveId: null,
					after: { mauId: id, ten: tenMoi, luuTru: false },
				},
			]);
		},
		CHO_MS,
	);

	test(
		"mau-quan-tri: tu choi viet truoc — KR trai kieu, qua tran KR, 0 KR, don vi khong co, don vi da luu tru, ba vai khong phai quan tri; moi ca cau ghim, okrMau va vet khong doi",
		async () => {
			const luuTru = await pbMoi("mau-pb-luu-tru");
			ok(
				await goi("org.archiveDepartment", { id: luuTru }),
				"luu tru phong ban",
			);
			const tenLuuTru = (
				await db.department.findUniqueOrThrow({
					where: { id: luuTru },
					select: { name: true },
				})
			).name;
			const khongCo = ma("pb-khong-co");
			const vao = (over: { [khoa: string]: Json }) => ({
				id: null,
				ten: ma("mau tu choi"),
				cap: "phong-ban",
				donViIds: [san.p1],
				noiDung: NOI_DUNG_M2,
				...over,
			});
			const ca: [string, () => Promise<TraLoi>, number, string][] = [
				[
					"KR thu hai tang toi dich nho hon khoi diem",
					() =>
						luuMau(
							vao({
								noiDung: noiDungMau([
									krMau(),
									krMau({ startValue: 40, targetValue: 10 }),
								]),
							}),
						),
					400,
					CAU_MAU.krMauDichNho,
				],
				[
					"qua tran KR mau",
					() =>
						luuMau(
							vao({
								noiDung: noiDungMau(
									Array.from({ length: OKR_MAU.krToiDa + 1 }, () => krMau()),
								),
							}),
						),
					400,
					CAU_MAU.soKrMau,
				],
				[
					"0 KR",
					() => luuMau(vao({ noiDung: noiDungMau([]) })),
					400,
					CAU_MAU.soKrMau,
				],
				[
					"phong ban khong ton tai",
					() => luuMau(vao({ donViIds: [san.p1, khongCo] })),
					400,
					CAU_MAU.khongCoDonVi(khongCo),
				],
				[
					"phong ban da luu tru",
					() => luuMau(vao({ donViIds: [luuTru] })),
					400,
					CAU_MAU.donViDaLuuTru(tenLuuTru),
				],
				[
					"thanh vien thuong",
					() => luuMau(vao({}), "thuong"),
					403,
					CAU_MAU.canQuanTri,
				],
				[
					"truong phong",
					() => luuMau(vao({}), san.T1.cookie),
					403,
					CAU_MAU.canQuanTri,
				],
				[
					"vai okr",
					() => luuMau(vao({}), san.O.cookie),
					403,
					CAU_MAU.canQuanTri,
				],
			];
			const demMau = async () => ({
				okrMau: await dem("okrMau"),
				okrTrail: await dem("okrTrail"),
			});
			const hangMauCuaLuot = () =>
				db.okrMau.findMany({
					where: { taoBoiUserId: { startsWith: TIEN_TO } },
					select: { id: true, ten: true, noiDung: true },
				});
			const nhan: string[] = [];
			for (const [ten, lam, , cau] of ca) {
				const truoc = await demMau();
				const daCo = new Set((await hangMauCuaLuot()).map((h) => h.id));
				const tra = await lam();
				const sau = await demMau();
				const hangMoi = (await hangMauCuaLuot()).filter((h) => !daCo.has(h.id));
				const khongDoi =
					JSON.stringify(sau) === JSON.stringify(truoc) && hangMoi.length === 0;
				nhan.push(
					`${ten}: ${tra.status} ${tra.loi === cau ? "cau-ghim" : tra.loi} ${khongDoi ? "khong-doi" : JSON.stringify({ truoc, sau, hangMoi })}`,
				);
			}
			expect(nhan).toEqual(
				ca.map(([ten, , ma]) => `${ten}: ${ma} cau-ghim khong-doi`),
			);
		},
		CHO_MS,
	);
});

type BonMau = Record<"M1" | "M2" | "M3" | "M4", string>;

describe("tu-mau", () => {
	let san: SanTuMau;
	let m: BonMau;
	const datChuongTrinh = async (vao: { [khoa: string]: Json }) =>
		ok(await goi("okr.setProgram", vao), "dat chuong trinh");
	beforeAll(async () => {
		san = await gieoTuMau();
		await datChuongTrinh({ ...CHUONG_TRINH_RONG });
		const M1 = await mauMoi({
			ten: "mau M1",
			cap: "phong-ban",
			donViIds: [],
			noiDung: NOI_DUNG_M1,
		});
		const M2 = await mauMoi({
			ten: "mau M2",
			cap: "phong-ban",
			donViIds: [san.p1],
			noiDung: NOI_DUNG_M2,
		});
		const M3 = await mauMoi({
			ten: "mau M3",
			cap: "phong-ban",
			donViIds: [san.p1],
			noiDung: NOI_DUNG_M2,
		});
		ok(await goi("okr.luuTruMau", { id: M3 }), "luu tru M3");
		const M4 = await mauMoi({
			ten: "mau M4",
			cap: "bo-phan",
			donViIds: [],
			noiDung: NOI_DUNG_M2,
		});
		m = { M1, M2, M3, M4 };
	}, CHO_MS);
	afterAll(async () => {
		await datChuongTrinh({ ...CHUONG_TRINH_RONG });
		await donSanCanhKr();
	}, CHO_MS);

	const cuaTa = (mau: MauOutput["mau"]) => {
		const ta = new Set(Object.values(m));
		return mau.filter((x) => ta.has(x.id));
	};

	const taoTuMau = (
		mauId: string,
		ai: string,
		krs: { startValue: number | null; targetValue: number | null }[],
		donVi: string = san.p1,
	) =>
		goi(
			"okr.taoTuMau",
			{
				mauId,
				cycleId: san.ky,
				unit: { level: "phong-ban", departmentId: donVi },
				ownerUserId: san.T1.id,
				krs: krs.map((k) => ({ ...k, ownerUserId: san.A.id })),
			},
			ai,
		);

	const docMucTieu = async (id: string) => {
		const mt = await db.okrObjective.findUniqueOrThrow({
			where: { id },
			select: {
				title: true,
				kind: true,
				level: true,
				departmentId: true,
				status: true,
				ownerUserId: true,
				cycleId: true,
			},
		});
		const krs = await db.okrKeyResult.findMany({
			where: { objectiveId: id },
			orderBy: { position: "asc" },
			select: {
				title: true,
				kind: true,
				unit: true,
				startValue: true,
				targetValue: true,
				currentValue: true,
				ownerUserId: true,
			},
		});
		return {
			mt,
			krs: krs.map((k) => ({
				...k,
				startValue: Number(k.startValue),
				targetValue: Number(k.targetValue),
				currentValue: Number(k.currentValue),
			})),
		};
	};

	test(
		"tu-mau: okr.mau loc theo cap va don vi — truong P1 o P1 {M1, M2}, truong P2 o P2 {M1}; quan tri co loc nhan dung tap con song hop cap va don vi (khong M3); quan tri khong loc thay ca bon kem M3 luu tru",
		async () => {
			const idsCua = async (ai: string, donViId: string) =>
				cuaTa(
					(
						await doc<MauOutput>("okr.mau", ai, {
							cap: "phong-ban",
							donViId,
						})
					).mau,
				)
					.map((x) => x.id)
					.sort();
			const quan = await doc<MauOutput>("okr.mau", "quan", {});
			const T1 = await doc<MauOutput>("okr.mau", san.T1.cookie, {});
			expect({
				P1: await idsCua(san.T1.cookie, san.p1),
				P2: await idsCua(san.T2.cookie, san.p2),
				quanLocP1: await idsCua("quan", san.p1),
				quanLocP2: await idsCua("quan", san.p2),
				quan: cuaTa(quan.mau)
					.map((x) => ({ id: x.id, luuTru: x.luuTru, soKr: x.soKr }))
					.sort((a, b) => a.id.localeCompare(b.id)),
				quanTri: { quan: quan.quanTri, T1: T1.quanTri },
				T1KhongLoc: cuaTa(T1.mau)
					.map((x) => x.id)
					.sort(),
			}).toEqual({
				P1: [m.M1, m.M2].sort(),
				P2: [m.M1],
				quanLocP1: [m.M1, m.M2].sort(),
				quanLocP2: [m.M1],
				quan: [
					{ id: m.M1, luuTru: false, soKr: NOI_DUNG_M1.krs.length },
					{ id: m.M2, luuTru: false, soKr: NOI_DUNG_M2.krs.length },
					{ id: m.M3, luuTru: true, soKr: NOI_DUNG_M2.krs.length },
					{ id: m.M4, luuTru: false, soKr: NOI_DUNG_M2.krs.length },
				].sort((a, b) => a.id.localeCompare(b.id)),
				quanTri: { quan: true, T1: false },
				T1KhongLoc: [m.M1, m.M2, m.M4].sort(),
			});
		},
		CHO_MS,
	);

	test(
		"tu-mau: taoTuMau(M2, P1, hai KR du so) — mot muc tieu nhap, hai KR dung so, mot okrMucTieuTuMau, vet tao co tuMau; sua M2 sau do khong doi muc tieu da tao",
		async () => {
			const truoc = {
				okrObjective: await dem("okrObjective"),
				okrKeyResult: await dem("okrKeyResult"),
				okrMucTieuTuMau: await dem("okrMucTieuTuMau"),
			};
			const tra = ok<{ id: string; canhBao: string | null }>(
				await taoTuMau(m.M2, san.T1.cookie, [
					{ startValue: 0, targetValue: 40 },
					{ startValue: 120, targetValue: 90 },
				]),
				"tao tu mau M2",
			);
			const daTao = await docMucTieu(tra.id);
			expect({
				canhBao: tra.canhBao,
				dem: {
					okrObjective: await dem("okrObjective"),
					okrKeyResult: await dem("okrKeyResult"),
					okrMucTieuTuMau: await dem("okrMucTieuTuMau"),
				},
				daTao,
				nguon: await db.okrMucTieuTuMau.findMany({
					where: { objectiveId: tra.id },
					select: { objectiveId: true, mauId: true },
				}),
				vet: (
					await db.okrTrail.findMany({
						where: { objectiveId: tra.id },
						select: { action: true, actorUserId: true, after: true },
					})
				)
					.map((v) => ({ ...v, after: parseOkrVet(v.after) }))
					.sort((x, y) => {
						const kx = `${x.action}|${x.after?.title ?? ""}`;
						const ky = `${y.action}|${y.after?.title ?? ""}`;
						return kx < ky ? -1 : kx > ky ? 1 : 0;
					}),
			}).toEqual({
				canhBao: null,
				dem: {
					okrObjective: truoc.okrObjective + 1,
					okrKeyResult: truoc.okrKeyResult + 2,
					okrMucTieuTuMau: truoc.okrMucTieuTuMau + 1,
				},
				daTao: {
					mt: {
						title: NOI_DUNG_M2.cauMucTieu,
						kind: NOI_DUNG_M2.loai,
						level: "phong-ban",
						departmentId: san.p1,
						status: "nhap",
						ownerUserId: san.T1.id,
						cycleId: san.ky,
					},
					krs: [
						{
							title: KR_M2_DAU.title,
							kind: KR_M2_DAU.kind,
							unit: KR_M2_DAU.unit,
							startValue: 0,
							targetValue: 40,
							currentValue: 0,
							ownerUserId: san.A.id,
						},
						{
							title: KR_M2_SAU.title,
							kind: KR_M2_SAU.kind,
							unit: KR_M2_SAU.unit,
							startValue: 120,
							targetValue: 90,
							currentValue: 120,
							ownerUserId: san.A.id,
						},
					],
				},
				nguon: [{ objectiveId: tra.id, mauId: m.M2 }],
				vet: [
					{
						action: "tao-kr",
						actorUserId: san.T1.id,
						after: {
							title: KR_M2_SAU.title,
							kind: KR_M2_SAU.kind,
							startValue: 120,
							targetValue: 90,
						},
					},
					{
						action: "tao-kr",
						actorUserId: san.T1.id,
						after: {
							title: KR_M2_DAU.title,
							kind: KR_M2_DAU.kind,
							startValue: 0,
							targetValue: 40,
						},
					},
					{
						action: "tao",
						actorUserId: san.T1.id,
						after: {
							title: NOI_DUNG_M2.cauMucTieu,
							kind: NOI_DUNG_M2.loai,
							level: "phong-ban",
							status: "nhap",
							tuMau: m.M2,
						},
					},
				],
			});

			ok(
				await luuMau({
					id: m.M2,
					ten: ma("mau M2 sua"),
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung: noiDungMau(
						[
							krMau({
								title: "Doanh thu kênh mới",
								startValue: 0,
								targetValue: 99,
							}),
							krMau({ title: "Khách mới", unit: "khách" }),
							krMau({ title: "Ra mắt gói", kind: "moc", unit: "" }),
						],
						"Câu mục tiêu đã đổi",
					),
				}),
				"sua M2 sau khi tao",
			);
			const daDung = cuaTa(
				(await doc<MauOutput>("okr.mau", "quan", {})).mau,
			).find((x) => x.id === m.M2)?.daDung;
			expect({ sauKhiSua: await docMucTieu(tra.id), daDung }).toEqual({
				sauKhiSua: daTao,
				daDung: 1,
			});
			ok(
				await luuMau({
					id: m.M2,
					ten: ma("mau M2"),
					cap: "phong-ban",
					donViIds: [san.p1],
					noiDung: NOI_DUNG_M2,
				}),
				"tra M2 ve noi dung goc",
			);
		},
		CHO_MS,
	);

	test(
		"tu-mau: mau co KR moc — tao KR 0 -> 1 khong can so",
		async () => {
			const tra = ok<{ id: string }>(
				await taoTuMau(m.M1, san.T1.cookie, [
					{ startValue: 0, targetValue: 30 },
					{ startValue: null, targetValue: null },
				]),
				"tao tu mau M1",
			);
			expect(
				(await docMucTieu(tra.id)).krs.map((k) => ({
					kind: k.kind,
					startValue: k.startValue,
					targetValue: k.targetValue,
				})),
			).toEqual([
				{ kind: "tang-toi", startValue: 0, targetValue: 30 },
				{ kind: "moc", startValue: 0, targetValue: 1 },
			]);
		},
		CHO_MS,
	);

	test(
		"tu-mau: nguyen khoi — bon ca viet truoc (KR thu hai thieu dich, tang toi dich nho hon khoi diem, vuot tran KR o che do chan, truong P2 tao o P1), moi ca dem okrObjective, okrKeyResult, okrMucTieuTuMau khong doi",
		async () => {
			const tranNho = NOI_DUNG_M2.krs.length - 1;
			const ca: {
				ten: string;
				truoc?: () => Promise<unknown>;
				lam: () => Promise<TraLoi>;
				ma: number;
				cau: string;
			}[] = [
				{
					ten: "KR thu hai thieu dich",
					lam: () =>
						taoTuMau(m.M2, san.T1.cookie, [
							{ startValue: 0, targetValue: 40 },
							{ startValue: 120, targetValue: null },
						]),
					ma: 400,
					cau: CAU_MAU.thieuDich(2, KR_M2_SAU.title),
				},
				{
					ten: "tang toi dich nho hon khoi diem",
					lam: () =>
						taoTuMau(m.M2, san.T1.cookie, [
							{ startValue: 40, targetValue: 10 },
							{ startValue: 120, targetValue: 90 },
						]),
					ma: 400,
					cau: CAU_MAU.dichNho(1, KR_M2_DAU.title),
				},
				{
					ten: "vuot tran KR che do chan",
					truoc: () => datChuongTrinh({ capMode: "chan", krCap: tranNho }),
					lam: () =>
						taoTuMau(m.M2, san.T1.cookie, [
							{ startValue: 0, targetValue: 40 },
							{ startValue: 120, targetValue: 90 },
						]),
					ma: 400,
					cau: CAU_MAU.vuotTranKr(tranNho),
				},
				{
					ten: "truong P2 tao o P1",
					truoc: () => datChuongTrinh({ ...CHUONG_TRINH_RONG }),
					lam: () =>
						taoTuMau(m.M2, san.T2.cookie, [
							{ startValue: 0, targetValue: 40 },
							{ startValue: 120, targetValue: 90 },
						]),
					ma: 403,
					cau: CAU_MAU.khongSuaDuocDonVi,
				},
			];
			const demBa = async () => ({
				okrObjective: await dem("okrObjective"),
				okrKeyResult: await dem("okrKeyResult"),
				okrMucTieuTuMau: await dem("okrMucTieuTuMau"),
			});
			const nhan: string[] = [];
			try {
				for (const c of ca) {
					await c.truoc?.();
					const truoc = await demBa();
					const tra = await c.lam();
					const sau = await demBa();
					nhan.push(
						`${c.ten}: ${tra.status} ${tra.loi === c.cau ? "cau-ghim" : tra.loi} ${JSON.stringify(sau) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sau })}`,
					);
				}
			} finally {
				await datChuongTrinh({ ...CHUONG_TRINH_RONG });
			}
			expect(nhan).toEqual(
				ca.map((c) => `${c.ten}: ${c.ma} cau-ghim khong-doi`),
			);
		},
		CHO_MS,
	);

	test(
		"tu-mau: mau khong dung duoc — truong P2 o P2 voi mau chi P1, mau da luu tru, mau cap bo phan o phong ban: 400 cau ghim, okrObjective, okrKeyResult, okrMucTieuTuMau khong doi",
		async () => {
			await datChuongTrinh({ ...CHUONG_TRINH_RONG });
			const chiP1 = await mauMoi({
				ten: "mau chi P1",
				cap: "phong-ban",
				donViIds: [san.p1],
				noiDung: NOI_DUNG_M2,
			});
			const daLuuTru = await mauMoi({
				ten: "mau da luu tru",
				cap: "phong-ban",
				donViIds: [san.p1],
				noiDung: NOI_DUNG_M2,
			});
			ok(
				await goi("okr.luuTruMau", { id: daLuuTru }),
				"luu tru mau da luu tru",
			);
			const boPhan = await mauMoi({
				ten: "mau bo phan",
				cap: "bo-phan",
				donViIds: [],
				noiDung: NOI_DUNG_M2,
			});
			const soDu = [
				{ startValue: 0, targetValue: 40 },
				{ startValue: 120, targetValue: 90 },
			];
			const ca: { ten: string; lam: () => Promise<TraLoi>; cau: string }[] = [
				{
					ten: "truong P2 o P2 voi mau chi P1",
					lam: () => taoTuMau(chiP1, san.T2.cookie, soDu, san.p2),
					cau: CAU_MAU.mauKhongApDung,
				},
				{
					ten: "truong P1 o P1 voi mau da luu tru",
					lam: () => taoTuMau(daLuuTru, san.T1.cookie, soDu),
					cau: CAU_MAU.mauDaLuuTru,
				},
				{
					ten: "truong P1 o P1 voi mau cap bo phan",
					lam: () => taoTuMau(boPhan, san.T1.cookie, soDu),
					cau: CAU_MAU.mauKhacCap,
				},
			];
			const demBa = async () => ({
				okrObjective: await dem("okrObjective"),
				okrKeyResult: await dem("okrKeyResult"),
				okrMucTieuTuMau: await dem("okrMucTieuTuMau"),
			});
			const nhan: string[] = [];
			for (const c of ca) {
				const truoc = await demBa();
				const tra = await c.lam();
				const sau = await demBa();
				nhan.push(
					`${c.ten}: ${tra.status} ${tra.loi === c.cau ? "cau-ghim" : tra.loi} ${JSON.stringify(sau) === JSON.stringify(truoc) ? "khong-doi" : JSON.stringify({ truoc, sau })}`,
				);
			}
			const doiChung = ok<{ id: string }>(
				await taoTuMau(chiP1, san.T1.cookie, soDu),
				"doi chung: truong P1 o P1 voi mau chi P1",
			);
			expect({
				nhan,
				doiChung: await db.okrMucTieuTuMau.count({
					where: { objectiveId: doiChung.id, mauId: chiP1 },
				}),
			}).toEqual({
				nhan: ca.map((c) => `${c.ten}: 400 cau-ghim khong-doi`),
				doiChung: 1,
			});
		},
		CHO_MS,
	);

	test(
		"tu-mau: che do canh bao — vuot tran KR van tao du KR va tra canh bao nhu tao tay",
		async () => {
			const tranNho = NOI_DUNG_M2.krs.length - 1;
			await datChuongTrinh({ capMode: "canh-bao", krCap: tranNho });
			try {
				const tay = idCua(
					await goi(
						"okr.createObjective",
						{
							cycleId: san.ky,
							unit: { level: "phong-ban", departmentId: san.p1 },
							title: ma("muc tieu tay"),
							kind: "cam-ket",
							ownerUserId: san.T1.id,
							participantIds: [],
							whyNow: "",
						},
						san.T1.cookie,
					),
					"tao muc tieu tay",
				);
				const canhBaoTay: (string | null)[] = [];
				for (const _ of NOI_DUNG_M2.krs) {
					canhBaoTay.push(
						ok<{ canhBao: string | null }>(
							await goi(
								"okr.createKeyResult",
								{
									objectiveId: tay,
									title: ma("kr tay"),
									kind: "tang-toi",
									ownerUserId: san.A.id,
									startValue: 0,
									targetValue: 10,
									currentValue: 0,
									unit: "",
									dueOn: null,
									weight: 1,
								},
								san.T1.cookie,
							),
							"tao kr tay",
						).canhBao,
					);
				}
				const tra = ok<{ id: string; canhBao: string | null }>(
					await taoTuMau(m.M2, san.T1.cookie, [
						{ startValue: 0, targetValue: 40 },
						{ startValue: 120, targetValue: 90 },
					]),
					"tao tu mau vuot tran",
				);
				expect({
					canhBao: tra.canhBao,
					soKr: (await docMucTieu(tra.id)).krs.length,
					canhBaoTayCuoi: canhBaoTay.at(-1),
				}).toEqual({
					canhBao: CAU_MAU.vuotTranKr(tranNho),
					soKr: NOI_DUNG_M2.krs.length,
					canhBaoTayCuoi: CAU_MAU.vuotTranKr(tranNho),
				});
			} finally {
				await datChuongTrinh({ ...CHUONG_TRINH_RONG });
			}
		},
		CHO_MS,
	);
});

type ThaoTacKhoa =
	| "themViec"
	| "suaViec"
	| "danhDauViec"
	| "goViec"
	| "ganSangKien"
	| "themBangChung"
	| "goBangChung";
type OKhoa = `400 ${string}`;

const TINH_HUONG_KHOA: TinhHuongKhoa[] = ["cham-diem", "da-dong", "da-bo"];
const THAO_TAC_KHOA: ThaoTacKhoa[] = [
	"themViec",
	"suaViec",
	"danhDauViec",
	"goViec",
	"ganSangKien",
	"themBangChung",
	"goBangChung",
];
const KHOA_PHA: OKhoa = `400 ${CAU.kyDaKhoa}`;
const KHOA_BO: OKhoa = `400 ${CAU.mucTieuDaBo}`;
const MA_TRAN_KHOA = {
	"cham-diem": {
		themViec: KHOA_PHA,
		suaViec: KHOA_PHA,
		danhDauViec: KHOA_PHA,
		goViec: KHOA_PHA,
		ganSangKien: KHOA_PHA,
		themBangChung: KHOA_PHA,
		goBangChung: KHOA_PHA,
	},
	"da-dong": {
		themViec: KHOA_PHA,
		suaViec: KHOA_PHA,
		danhDauViec: KHOA_PHA,
		goViec: KHOA_PHA,
		ganSangKien: KHOA_PHA,
		themBangChung: KHOA_PHA,
		goBangChung: KHOA_PHA,
	},
	"da-bo": {
		themViec: KHOA_BO,
		suaViec: KHOA_BO,
		danhDauViec: KHOA_BO,
		goViec: KHOA_BO,
		ganSangKien: KHOA_BO,
		themBangChung: KHOA_BO,
		goBangChung: KHOA_BO,
	},
} satisfies Record<TinhHuongKhoa, Record<ThaoTacKhoa, OKhoa>>;

const oCua = (tra: TraLoi) => `${tra.status} ${tra.loi}`;

function goiKhoa(
	thaoTac: ThaoTacKhoa,
	k: SanKhoa,
	san: SanCanhKr,
	chienDich: string,
): Promise<TraLoi> {
	const { A, B } = san.nguoi;
	switch (thaoTac) {
		case "themViec":
			return goi(
				"okr.themViec",
				{
					keyResultId: k.kr,
					tieuDe: "Việc sau khi khoá",
					nguoiLamUserId: B.id,
					hanNgay: null,
				},
				A.cookie,
			);
		case "suaViec":
			return goi(
				"okr.suaViec",
				{ id: k.viec, tieuDe: "Sửa sau khi khoá" },
				A.cookie,
			);
		case "danhDauViec":
			return goi("okr.danhDauViec", { id: k.viec, xong: true }, A.cookie);
		case "goViec":
			return goi("okr.goViec", { id: k.viec }, A.cookie);
		case "ganSangKien":
			return goi(
				"okr.ganSangKien",
				{ keyResultId: k.kr, loai: "chien-dich", banGhiId: chienDich },
				A.cookie,
			);
		case "themBangChung":
			return goi(
				"okr.themBangChung",
				{
					keyResultId: k.krMoc,
					url: "https://drive.google.com/sau-khoa",
					ghiChu: "",
				},
				A.cookie,
			);
		case "goBangChung":
			return goi("okr.goBangChung", { id: k.bangChung }, A.cookie);
	}
}

async function anhKhoa(krIds: string[]) {
	const [viec, bangChung, sangKien] = await Promise.all([
		db.okrViecKr.findMany({
			where: { keyResultId: { in: krIds } },
			orderBy: { id: "asc" },
		}),
		db.okrBangChung.findMany({
			where: { keyResultId: { in: krIds } },
			orderBy: { id: "asc" },
		}),
		db.okrViecKr.count({
			where: { keyResultId: { in: krIds }, loai: { not: "viec" } },
		}),
	]);
	return {
		viec,
		bangChung,
		sangKien,
		demViec: await dem("okrViecKr"),
		demBangChung: await dem("okrBangChung"),
		demVet: await dem("okrTrail"),
	};
}

async function vetCuaKr(keyResultId: string) {
	return db.okrTrail.findMany({
		where: { keyResultId },
		orderBy: [{ at: "asc" }, { id: "asc" }],
		select: { action: true, objectiveId: true, before: true, after: true },
	});
}

describe("khoa-pha", () => {
	let san: SanCanhKr;
	let chienDich: string;
	const khoa = {} as Record<TinhHuongKhoa, SanKhoa>;

	beforeAll(async () => {
		san = await gieoCanhKr();
		chienDich = await chienDichMoi(ma("khoa-C"), san.nguoi.A);
		for (const t of TINH_HUONG_KHOA) khoa[t] = await gieoKhoa(san, t);
	}, CHO_MA_TRAN_MS);
	afterAll(async () => {
		await donSanCanhKr();
		await donSanKhep();
	}, CHO_MS);

	test(
		"khoa-pha: ma tran 3 tinh huong x 7 thao tac ghi — moi o 400 cau khoa, bang khong doi",
		async () => {
			const krIds = TINH_HUONG_KHOA.flatMap((t) => [khoa[t].kr, khoa[t].krMoc]);
			const truoc = await anhKhoa(krIds);
			const nhan = {} as Record<TinhHuongKhoa, Record<ThaoTacKhoa, string>>;
			for (const t of TINH_HUONG_KHOA) {
				const hang = {} as Record<ThaoTacKhoa, string>;
				for (const tt of THAO_TAC_KHOA)
					hang[tt] = oCua(await goiKhoa(tt, khoa[t], san, chienDich));
				nhan[t] = hang;
			}
			const lech = TINH_HUONG_KHOA.flatMap((t) =>
				THAO_TAC_KHOA.filter((tt) => nhan[t][tt] !== MA_TRAN_KHOA[t][tt]).map(
					(tt) => `${t} × ${tt}: ${nhan[t][tt]}`,
				),
			);
			expect(lech, "o lech khoi ma tran khoa").toEqual([]);
			expect(nhan).toEqual(MA_TRAN_KHOA);
			expect(await anhKhoa(krIds)).toEqual(truoc);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"khoa-pha: ghi nhan tren muc tieu cong bo van gui duoc o cham-diem va da-dong",
		async () => {
			const { A, T } = san.nguoi;
			const nhan: Record<string, string> = {};
			for (const t of ["cham-diem", "da-dong"] as const) {
				const tra = await guiGhiNhan(A.cookie, {
					objectiveId: khoa[t].mt,
					keyResultId: khoa[t].kr,
					nguoiNhan: [T.id],
				});
				nhan[t] = oCua(tra);
				if (tra.status === 200) {
					const id = idCua(tra, `ghi nhan ${t}`);
					const hang = await db.okrGhiNhan.findUniqueOrThrow({
						where: { id },
						select: {
							objectiveId: true,
							keyResultId: true,
							nhan: { select: { userId: true } },
						},
					});
					expect(hang).toEqual({
						objectiveId: khoa[t].mt,
						keyResultId: khoa[t].kr,
						nhan: [{ userId: T.id }],
					});
				}
			}
			expect(nhan).toEqual({ "cham-diem": "200 ", "da-dong": "200 " });
		},
		CHO_MS,
	);

	test(
		"khoa-pha: xoa KR nhap co hai viec — KR va hai viec mat, hai vet go-viec truoc xoa-kr; sang kien cung di",
		async () => {
			const { A, T } = san.nguoi;
			const nhap = await mucTieuNhap(san);
			const viec: string[] = [];
			for (const tieuDe of ["Việc nháp một", "Việc nháp hai"])
				viec.push(
					idCua(
						await goi(
							"okr.themViec",
							{
								keyResultId: nhap.kr,
								tieuDe,
								nguoiLamUserId: A.id,
								hanNgay: null,
							},
							T.cookie,
						),
						`them ${tieuDe}`,
					),
				);
			const { title } = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: nhap.kr },
				select: { title: true },
			});
			ok(
				await goi("okr.removeKeyResult", { id: nhap.kr }, T.cookie),
				"xoa kr nhap",
			);
			const vet = (await vetCuaKr(nhap.kr)).filter(
				(v) => v.action !== "tao-kr",
			);
			expect({
				kr: await db.okrKeyResult.count({ where: { id: nhap.kr } }),
				viec: await db.okrViecKr.count({ where: { id: { in: viec } } }),
				vet: vet.map((v) => ({
					action: v.action,
					objectiveId: v.objectiveId,
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
			}).toEqual({
				kr: 0,
				viec: 0,
				vet: [
					{
						action: "them-viec",
						objectiveId: nhap.mt,
						before: null,
						after: {
							viecId: viec[0] ?? "",
							tieuDe: "Việc nháp một",
							nguoiLamUserId: A.id,
							hanNgay: null,
						},
					},
					{
						action: "them-viec",
						objectiveId: nhap.mt,
						before: null,
						after: {
							viecId: viec[1] ?? "",
							tieuDe: "Việc nháp hai",
							nguoiLamUserId: A.id,
							hanNgay: null,
						},
					},
					{
						action: "go-viec",
						objectiveId: nhap.mt,
						before: {
							viecId: viec[0] ?? "",
							tieuDe: "Việc nháp một",
							nguoiLamUserId: A.id,
							hanNgay: null,
						},
						after: null,
					},
					{
						action: "go-viec",
						objectiveId: nhap.mt,
						before: {
							viecId: viec[1] ?? "",
							tieuDe: "Việc nháp hai",
							nguoiLamUserId: A.id,
							hanNgay: null,
						},
						after: null,
					},
					{
						action: "xoa-kr",
						objectiveId: nhap.mt,
						before: { title },
						after: null,
					},
				],
			});

			const nhap2 = await mucTieuNhap(san);
			const sk = idCua(
				await goi(
					"okr.ganSangKien",
					{ keyResultId: nhap2.kr, loai: "chien-dich", banGhiId: chienDich },
					T.cookie,
				),
				"gan sang kien vao kr nhap",
			);
			const { title: tenKr2 } = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: nhap2.kr },
				select: { title: true },
			});
			ok(
				await goi("okr.removeKeyResult", { id: nhap2.kr }, T.cookie),
				"xoa kr nhap co sang kien",
			);
			const vet2 = await vetCuaKr(nhap2.kr);
			expect({
				sangKien: await db.okrViecKr.count({ where: { id: sk } }),
				vet: vet2
					.filter((v) => v.action === "go-viec" || v.action === "xoa-kr")
					.map((v) => ({
						action: v.action,
						before: parseOkrVet(v.before),
					})),
			}).toEqual({
				sangKien: 0,
				vet: [
					{
						action: "go-viec",
						before: { loai: "chien-dich", campaignId: chienDich },
					},
					{ action: "xoa-kr", before: { title: tenKr2 } },
				],
			});
		},
		CHO_MS,
	);

	test(
		"khoa-pha: xoa KR co bang chung hay ghi nhan — 400 cau ghim, KR, viec, bang chung va vet dung nguyen",
		async () => {
			const { A, T } = san.nguoi;
			const { objectiveId, krIds } = await gieoMucTieuCongBo(
				san.ky,
				[
					{
						kind: "moc",
						startValue: 0,
						targetValue: 1,
						currentValue: 1,
						ownerUserId: A.id,
					},
					{ ownerUserId: A.id },
				],
				{
					unit: { level: "phong-ban", departmentId: san.p1 },
					ownerUserId: T.id,
					ai: T.cookie,
				},
			);
			const [krBC, krGN] = krIds;
			if (krBC === undefined || krGN === undefined) throw new Error("thieu KR");
			for (const kr of [krBC, krGN])
				ok(
					await goi(
						"okr.themViec",
						{
							keyResultId: kr,
							tieuDe: "Việc giữ lại",
							nguoiLamUserId: A.id,
							hanNgay: null,
						},
						A.cookie,
					),
					"them viec giu lai",
				);
			ok(await themBangChung(A.cookie, krBC), "dinh bang chung");
			ok(
				await guiGhiNhan(A.cookie, {
					objectiveId,
					keyResultId: krGN,
					nguoiNhan: [T.id],
				}),
				"ghi nhan gan KR",
			);
			const anh = async () => ({
				kr: await db.okrKeyResult.count({ where: { id: { in: krIds } } }),
				...(await anhKhoa(krIds)),
				ghiNhan: await db.okrGhiNhan.count({ where: { keyResultId: krGN } }),
			});
			const truoc = await anh();
			const nhan = {
				bangChung: oCua(
					await goi("okr.removeKeyResult", { id: krBC }, T.cookie),
				),
				ghiNhan: oCua(await goi("okr.removeKeyResult", { id: krGN }, T.cookie)),
			};
			expect({ nhan, anh: await anh() }).toEqual({
				nhan: {
					bangChung: `400 ${CAU.krCoBangChung}`,
					ghiNhan: `400 ${CAU.krCoGhiNhan}`,
				},
				anh: truoc,
			});
		},
		CHO_MS,
	);

	test(
		"khoa-pha: nguoi lam roi — daRoi bat; vao lai — daRoi tat, viec van tro B; roi lan hai — transferPreview dem viec, transferWork chuyen viec chua xong sang A, vet chuyen-viec",
		async () => {
			const { A, B } = san.nguoi;
			const them = async (tieuDe: string) =>
				idCua(
					await goi(
						"okr.themViec",
						{
							keyResultId: san.kr,
							tieuDe,
							nguoiLamUserId: B.id,
							hanNgay: null,
						},
						A.cookie,
					),
					`them ${tieuDe}`,
				);
			const chua = await them("Việc B chưa xong");
			const xong = await them("Việc B đã xong");
			ok(
				await goi("okr.danhDauViec", { id: xong, xong: true }, A.cookie),
				"danh dau xong",
			);
			const nguoiLam = async () => {
				const canh = await doc<CanhKrOutput>("okr.canhKr", A.cookie, {
					keyResultId: san.kr,
				});
				const hang = await db.okrViecKr.findMany({
					where: { id: { in: [chua, xong] } },
					select: { id: true, nguoiLamUserId: true },
				});
				return Object.fromEntries(
					[chua, xong].map((id) => {
						const d = canh.dong.find((x) => x.id === id);
						return [
							id === chua ? "chua" : "xong",
							{
								daRoi: d?.loai === "viec" ? (d.nguoiLam?.daRoi ?? null) : null,
								canh: d?.loai === "viec" ? (d.nguoiLam?.id ?? null) : null,
								db: hang.find((h) => h.id === id)?.nguoiLamUserId ?? null,
							},
						];
					}),
				);
			};
			const cua = (daRoi: boolean, nguoi: string) => ({
				daRoi,
				canh: nguoi,
				db: nguoi,
			});

			await roiKhoi(B.id);
			expect(await nguoiLam(), "B roi").toEqual({
				chua: cua(true, B.id),
				xong: cua(true, B.id),
			});

			await vaoLai(B.id);
			expect(await nguoiLam(), "B vao lai").toEqual({
				chua: cua(false, B.id),
				xong: cua(false, B.id),
			});

			await roiKhoi(B.id);
			const khoaTruoc = await db.okrViecKr.findMany({
				where: { id: { in: TINH_HUONG_KHOA.map((t) => khoa[t].viec) } },
				select: { id: true, nguoiLamUserId: true },
				orderBy: { id: "asc" },
			});
			const xemTruoc = await doc("okr.transferPreview", "quan", {
				fromUserId: B.id,
			});
			const chuyen = ok(
				await goi("okr.transferWork", { fromUserId: B.id, toUserId: A.id }),
				"chuyen viec cua B",
			);
			const vet = await db.okrTrail.findMany({
				where: { action: "chuyen-viec", keyResultId: san.kr },
				select: { objectiveId: true, before: true, after: true },
			});
			expect({
				xemTruoc,
				chuyen,
				nguoiLam: await nguoiLam(),
				khoa: await db.okrViecKr.findMany({
					where: { id: { in: TINH_HUONG_KHOA.map((t) => khoa[t].viec) } },
					select: { id: true, nguoiLamUserId: true },
					orderBy: { id: "asc" },
				}),
				vet: vet.map((v) => ({
					objectiveId: v.objectiveId,
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
				xemTruocSau: await doc("okr.transferPreview", "quan", {
					fromUserId: B.id,
				}),
			}).toEqual({
				xemTruoc: { kr: 0, mucTieu: 0, viec: 1 },
				chuyen: { kr: 0, mucTieu: 0, viec: 1 },
				nguoiLam: { chua: cua(false, A.id), xong: cua(true, B.id) },
				khoa: khoaTruoc,
				vet: [
					{
						objectiveId: san.mt,
						before: { viecId: chua, nguoiLamUserId: B.id },
						after: { viecId: chua, nguoiLamUserId: A.id },
					},
				],
				xemTruocSau: { kr: 0, mucTieu: 0, viec: 0 },
			});
		},
		CHO_MS,
	);
});
