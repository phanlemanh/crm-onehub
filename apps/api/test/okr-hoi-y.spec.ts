import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	CAU_NIEM_PHONG_MOT_TRONG_HAI,
	OKR_HOI_Y,
	parseSoLieuHoiY,
	type SoLieuHoiY,
	trangThaiHoiY,
} from "@crm/validation/okr-hoi-y";
import { OKR } from "../src/okr/okr-config";
import {
	type HoiYNhanOutput,
	type HoiYOutput,
	hoiYDocOutput,
	hoiYNhanOutput,
} from "../src/okr/okr-hoi-y.contracts";
import {
	BAN_TRUOC_MAC_DINH,
	type Bang,
	CAU_HOI_MAC_DINH,
	datDongHo,
	dem,
	doiVai,
	dongHo,
	dungSanHoiY,
	gieoBanTruoc,
	gieoCongBo,
	gieoHoiY,
	gieoY,
	goiRest,
	khoaApiCua,
	type Nguoi,
	nguoiCo,
	SO_LIEU_MAC_DINH,
	sauGio,
	Y_MAC_DINH,
} from "./okr-hoi-y-san";
import { dangChay, goi, goiQuery, ok, type TraLoi, taoNam } from "./okr-san";

dungSanHoiY();

const T = OKR.thongDiep.hoiY;
const CHO_MS = 30_000;
const LUC = new Date("2026-11-02T03:00:00.000Z");
const NAM_KE = LUC.getUTCFullYear() + 1;
const HAN = {
	hopLe: OKR_HOI_Y.hanGio.min * 2,
	thieuMotGio: OKR_HOI_Y.hanGio.min - 1,
	tamNgay: OKR_HOI_Y.hanGio.max + OKR_HOI_Y.hanGio.min,
} as const;
const BANG_KHONG_DOI: Bang[] = ["okrHoiY", "okrTrail"];

const SO_LIEU_BON: SoLieuHoiY = [
	{ nhan: "Doanh thu năm", giaTri: "190 tỷ", ghiChu: "sau điều chỉnh" },
	{ nhan: "Khách quay lại", giaTri: "66%", ghiChu: "" },
	{ nhan: "Khách mới", giaTri: "44", ghiChu: "" },
	{ nhan: "Kho đang chạy", giaTri: "7", ghiChu: "hai kho lạnh" },
];

const dongSo = (nhan: string) => ({ nhan, giaTri: "1", ghiChu: "" });
const MOT_MS = 1;
const lechMs = (d: Date, ms: number) => new Date(d.getTime() + ms);

describe("mo-hoi-y", () => {
	test(
		"mo-hoi-y: Q mở trên chu kỳ năm ở lập kế hoạch, sửa lời mở và bốn con số, dời hạn về bây giờ — DB đúng từng giá trị, dang-mo rồi dang-gom, vết [mo-hoi-y, sua-hoi-y, sua-hoi-y]",
		async () => {
			datDongHo(LUC);
			const Q = await nguoiCo("e1-Q", "admin");
			const P = await nguoiCo("e1-P", "admin");
			const cycleId = await taoNam("e1", NAM_KE);
			const hanLuc = sauGio(LUC, HAN.hopLe);
			const vao = {
				cycleId,
				cauHoi: CAU_HOI_MAC_DINH,
				loiMo: "Mỗi người góp tối đa ba ý, hạn thứ Tư.",
				soLieu: SO_LIEU_MAC_DINH,
				hanLuc: hanLuc.toISOString(),
				nguoiChonUserId: P.id,
			};
			const { id } = ok<{ id: string }>(
				await goi("okr.moHoiY", vao, Q.cookie),
				"mo hoi y",
			);
			const doc = () => db.okrHoiY.findUniqueOrThrow({ where: { id } });
			const moi = await doc();
			expect({
				cycleId: moi.cycleId,
				cauHoi: moi.cauHoi,
				loiMo: moi.loiMo,
				hanLuc: moi.hanLuc.toISOString(),
				nguoiChonUserId: moi.nguoiChonUserId,
				taoBoiUserId: moi.taoBoiUserId,
				congBoLuc: moi.congBoLuc,
				createdAt: moi.createdAt.toISOString(),
			}).toEqual({
				cycleId,
				cauHoi: vao.cauHoi,
				loiMo: vao.loiMo,
				hanLuc: hanLuc.toISOString(),
				nguoiChonUserId: P.id,
				taoBoiUserId: Q.id,
				congBoLuc: null,
				createdAt: LUC.toISOString(),
			});
			expect(parseSoLieuHoiY(moi.soLieu)).toEqual(SO_LIEU_MAC_DINH);
			expect(trangThaiHoiY(moi, dongHo())).toBe("dang-mo");

			const loiMoMoi = "Thêm: ưu tiên ý có số đo được trong quý đầu.";
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: id, loiMo: loiMoMoi, soLieu: SO_LIEU_BON },
					Q.cookie,
				),
				"sua loi mo va con so",
			);
			const sua = await doc();
			expect({
				cauHoi: sua.cauHoi,
				loiMo: sua.loiMo,
				hanLuc: sua.hanLuc.toISOString(),
				nguoiChonUserId: sua.nguoiChonUserId,
			}).toEqual({
				cauHoi: vao.cauHoi,
				loiMo: loiMoMoi,
				hanLuc: hanLuc.toISOString(),
				nguoiChonUserId: P.id,
			});
			expect(parseSoLieuHoiY(sua.soLieu)).toEqual(SO_LIEU_BON);
			expect(trangThaiHoiY(sua, dongHo())).toBe("dang-mo");

			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: id, hanLuc: LUC.toISOString() },
					Q.cookie,
				),
				"doi han ve bay gio",
			);
			const dong = await doc();
			expect(dong.hanLuc.toISOString()).toBe(LUC.toISOString());
			expect(trangThaiHoiY(dong, dongHo())).toBe("dang-gom");

			const vet = await db.okrTrail.findMany({
				where: { cycleId, action: { not: "tao-chu-ky" } },
				orderBy: [{ at: "asc" }, { id: "asc" }],
				select: { action: true, objectiveId: true, after: true },
			});
			expect(vet.map((v) => v.action)).toEqual([
				"mo-hoi-y",
				"sua-hoi-y",
				"sua-hoi-y",
			]);
			expect(vet.map((v) => v.objectiveId)).toEqual([null, null, null]);
			expect(vet[0]?.after).toEqual({
				hoiYId: id,
				hanLuc: hanLuc.toISOString(),
				nguoiChonUserId: P.id,
				soLieu: SO_LIEU_MAC_DINH.length,
			});
		},
		CHO_MS,
	);

	test(
		"mo-hoi-y: lối ra — P niêm phong rồi bị hạ về member qua workspace.setMemberRole, Q đổi người chọn sang Q2; bản viết trước giữ nguyên người viết P; một vết doi-nguoi-chon {tu: P, sang: Q2}",
		async () => {
			datDongHo(LUC);
			const { ky, h, nguoi } = await gieoHoiY({ niemPhong: true });
			const Q2 = await nguoiCo("e1-Q2", "admin");
			const banTruoc = await db.okrHoiYBanTruoc.findUniqueOrThrow({
				where: { hoiYId: h },
			});
			await doiVai(nguoi.P.id, "member");
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: h, nguoiChonUserId: Q2.id },
					nguoi.Q.cookie,
				),
				"doi nguoi chon",
			);
			const sau = await db.okrHoiY.findUniqueOrThrow({ where: { id: h } });
			expect(sau.nguoiChonUserId).toBe(Q2.id);
			const banSau = await db.okrHoiYBanTruoc.findUniqueOrThrow({
				where: { hoiYId: h },
			});
			expect(banSau).toEqual(banTruoc);
			expect(banSau.vietBoiUserId).toBe(nguoi.P.id);
			const vet = await db.okrTrail.findMany({
				where: { cycleId: ky, action: { not: "tao-chu-ky" } },
				orderBy: [{ at: "asc" }, { id: "asc" }],
				select: { action: true, objectiveId: true, after: true },
			});
			expect(vet.map((v) => v.action)).toEqual([
				"mo-hoi-y",
				"niem-phong",
				"doi-nguoi-chon",
			]);
			expect(vet[2]).toEqual({
				action: "doi-nguoi-chon",
				objectiveId: null,
				after: { tu: nguoi.P.id, sang: Q2.id },
			});
		},
		CHO_MS,
	);

	test(
		"mo-hoi-y: biên nhận — mở với hạn đúng 24 giờ và đúng 168 giờ; sửa hạn về đúng createdAt + 168 giờ",
		async () => {
			datDongHo(LUC);
			const Q = await nguoiCo("bien-Q", "admin");
			const P = await nguoiCo("bien-P", "admin");
			const moVoi = async (soGio: number) => {
				const cycleId = await taoNam(`bien-${soGio}`, NAM_KE);
				const hanLuc = sauGio(LUC, soGio);
				const { id } = ok<{ id: string }>(
					await goi(
						"okr.moHoiY",
						{
							cycleId,
							cauHoi: CAU_HOI_MAC_DINH,
							loiMo: "",
							soLieu: SO_LIEU_MAC_DINH,
							hanLuc: hanLuc.toISOString(),
							nguoiChonUserId: P.id,
						},
						Q.cookie,
					),
					`mo han ${soGio} gio`,
				);
				const row = await db.okrHoiY.findUniqueOrThrow({ where: { id } });
				expect(row.hanLuc.toISOString()).toBe(hanLuc.toISOString());
				return row;
			};
			await moVoi(OKR_HOI_Y.hanGio.min);
			await moVoi(OKR_HOI_Y.hanGio.max);
			const h = await moVoi(HAN.hopLe);
			const tran = sauGio(h.createdAt, OKR_HOI_Y.hanGio.max);
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: h.id, hanLuc: tran.toISOString() },
					Q.cookie,
				),
				"sua han dung createdAt + 168 gio",
			);
			const sau = await db.okrHoiY.findUniqueOrThrow({ where: { id: h.id } });
			expect(sau.hanLuc.toISOString()).toBe(tran.toISOString());
		},
		CHO_MS,
	);
});

type Ca = { ca: string; maHttp: number; cau: string };
type KetQua = Ca & { doi: { [bang: string]: number } };

describe("mo-tu-choi", () => {
	test(
		"mo-tu-choi: 17 ca viết trước — mã HTTP và câu ghim khớp bảng khai; okrHoiY và okrTrail không đổi ở mọi ca",
		async () => {
			datDongHo(LUC);
			const KHAI = [
				{ ca: "thanh-vien-mo", maHttp: 403, cau: T.chiQuanTri },
				{ ca: "vai-okr-mo", maHttp: 403, cau: T.chiQuanTri },
				{
					ca: "nguoi-chon-la-member",
					maHttp: 400,
					cau: T.nguoiChonPhaiQuanTri,
				},
				{ ca: "chu-ky-dang-chay", maHttp: 400, cau: T.kyKhongLapKeHoach },
				{ ca: "mo-lan-hai-cung-chu-ky", maHttp: 400, cau: T.daCoHoiY },
				{ ca: "han-23-gio", maHttp: 400, cau: T.hanNgoaiKhoang },
				{ ca: "han-8-ngay", maHttp: 400, cau: T.hanNgoaiKhoang },
				{
					ca: "0-con-so",
					maHttp: 400,
					cau: `soLieu: Too small: expected array to have >=${OKR_HOI_Y.soLieu.min} items`,
				},
				{
					ca: "6-con-so",
					maHttp: 400,
					cau: `soLieu: Too big: expected array to have <=${OKR_HOI_Y.soLieu.max} items`,
				},
				{ ca: "doi-cau-hoi-khi-da-co-y", maHttp: 400, cau: T.cauHoiDaKhoa },
				{
					ca: "doi-nguoi-chon-sau-niem-phong",
					maHttp: 400,
					cau: T.daNiemPhong,
				},
				{
					ca: "doi-nguoi-chon-sang-nguoi-da-gop",
					maHttp: 400,
					cau: T.nguoiChonDaGop,
				},
				{
					ca: "sua-han-qua-createdAt-168-gio",
					maHttp: 400,
					cau: T.hanSuaNgoaiKhoang,
				},
				{ ca: "sua-han-truoc-bay-gio", maHttp: 400, cau: T.hanSuaNgoaiKhoang },
				{ ca: "sua-loi-mo-khi-dang-gom", maHttp: 400, cau: T.chiKhiDangMo },
				{ ca: "sua-con-so-khi-dang-gom", maHttp: 400, cau: T.chiKhiDangMo },
				{ ca: "sua-sau-cong-bo", maHttp: 400, cau: T.daCongBo },
			] as const satisfies readonly Ca[];

			const coY = await gieoHoiY({ yCua: ["T"] });
			const niemPhong = await gieoHoiY({ niemPhong: true });
			const daGop = await gieoHoiY();
			const Q2 = await nguoiCo("e2-Q2", "admin");
			const Q3 = await nguoiCo("e2-Q3", "admin");
			await gieoY(daGop.h, Q3.id);
			const dangMo = await gieoHoiY();
			const dangGom = await gieoHoiY();
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: dangGom.h, hanLuc: dongHo().toISOString() },
					dangGom.nguoi.Q.cookie,
				),
				"doi han ve bay gio",
			);
			const congBo = await gieoHoiY();
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: congBo.h, hanLuc: dongHo().toISOString() },
					congBo.nguoi.Q.cookie,
				),
				"doi han ve bay gio truoc cong bo",
			);
			await gieoCongBo(congBo.h);
			const taoLuc = (
				await db.okrHoiY.findUniqueOrThrow({ where: { id: dangMo.h } })
			).createdAt;
			const suaVoi = (
				g: { h: string; nguoi: { Q: { cookie: string } } },
				vao: { hanLuc?: string; loiMo?: string; soLieu?: SoLieuHoiY },
			) => goi("okr.suaHoiY", { hoiYId: g.h, ...vao }, g.nguoi.Q.cookie);
			const { Q, T: thanhVien, O } = coY.nguoi;
			const kyTrong = await taoNam("e2-trong", NAM_KE);
			const kyMember = await taoNam("e2-member", NAM_KE);
			const kyChay = await taoNam("e2-chay", NAM_KE);
			await dangChay(kyChay);
			const moVao = (sua: {
				cycleId?: string;
				hanGio?: number;
				soLieu?: SoLieuHoiY;
				nguoiChonUserId?: string;
			}) => ({
				cycleId: sua.cycleId ?? kyTrong,
				cauHoi: CAU_HOI_MAC_DINH,
				loiMo: "",
				soLieu: sua.soLieu ?? SO_LIEU_MAC_DINH,
				hanLuc: sauGio(dongHo(), sua.hanGio ?? HAN.hopLe).toISOString(),
				nguoiChonUserId: sua.nguoiChonUserId ?? coY.nguoi.P.id,
			});
			const mo = (vao: ReturnType<typeof moVao>, cookie = Q.cookie) =>
				goi("okr.moHoiY", vao, cookie);
			const sauSoLieu = Array.from(
				{ length: OKR_HOI_Y.soLieu.max + 1 },
				(_, i) => dongSo(`Con số ${i + 1}`),
			);

			const CHAY = {
				"thanh-vien-mo": () => mo(moVao({}), thanhVien.cookie),
				"vai-okr-mo": () => mo(moVao({}), O.cookie),
				"nguoi-chon-la-member": () =>
					mo(moVao({ cycleId: kyMember, nguoiChonUserId: thanhVien.id })),
				"chu-ky-dang-chay": () => mo(moVao({ cycleId: kyChay })),
				"mo-lan-hai-cung-chu-ky": () => mo(moVao({ cycleId: coY.ky })),
				"han-23-gio": () => mo(moVao({ hanGio: HAN.thieuMotGio })),
				"han-8-ngay": () => mo(moVao({ hanGio: HAN.tamNgay })),
				"0-con-so": () => mo(moVao({ soLieu: [] })),
				"6-con-so": () => mo(moVao({ soLieu: sauSoLieu })),
				"doi-cau-hoi-khi-da-co-y": () =>
					goi(
						"okr.suaHoiY",
						{
							hoiYId: coY.h,
							cauHoi: "Câu hỏi khác sau khi đã có người góp ý",
						},
						Q.cookie,
					),
				"doi-nguoi-chon-sau-niem-phong": () =>
					goi(
						"okr.suaHoiY",
						{ hoiYId: niemPhong.h, nguoiChonUserId: Q2.id },
						niemPhong.nguoi.Q.cookie,
					),
				"doi-nguoi-chon-sang-nguoi-da-gop": () =>
					goi(
						"okr.suaHoiY",
						{ hoiYId: daGop.h, nguoiChonUserId: Q3.id },
						daGop.nguoi.Q.cookie,
					),
				"sua-han-qua-createdAt-168-gio": () =>
					suaVoi(dangMo, {
						hanLuc: lechMs(
							sauGio(taoLuc, OKR_HOI_Y.hanGio.max),
							MOT_MS,
						).toISOString(),
					}),
				"sua-han-truoc-bay-gio": () =>
					suaVoi(dangMo, {
						hanLuc: lechMs(dongHo(), -MOT_MS).toISOString(),
					}),
				"sua-loi-mo-khi-dang-gom": () =>
					suaVoi(dangGom, { loiMo: "Lời mở sửa sau khi đã qua hạn" }),
				"sua-con-so-khi-dang-gom": () =>
					suaVoi(dangGom, { soLieu: SO_LIEU_BON }),
				"sua-sau-cong-bo": () =>
					suaVoi(congBo, { loiMo: "Lời mở sửa sau khi đã công bố" }),
			} satisfies {
				[K in (typeof KHAI)[number]["ca"]]: () => Promise<TraLoi>;
			};

			const nhan: KetQua[] = [];
			for (const khai of KHAI) {
				const chay = CHAY[khai.ca];
				const truoc = await Promise.all(BANG_KHONG_DOI.map(dem));
				const tra = await chay();
				const sau = await Promise.all(BANG_KHONG_DOI.map(dem));
				nhan.push({
					ca: khai.ca,
					maHttp: tra.status,
					cau: tra.loi.includes(khai.cau) ? khai.cau : tra.loi,
					doi: Object.fromEntries(
						BANG_KHONG_DOI.map((b, i) => [b, (sau[i] ?? 0) - (truoc[i] ?? 0)]),
					),
				});
			}
			expect(nhan).toEqual(
				KHAI.map((k) => ({
					...k,
					doi: Object.fromEntries(BANG_KHONG_DOI.map((b) => [b, 0])),
				})),
			);
		},
		CHO_MS,
	);
});

const CHO_MA_TRAN_MS = 120_000;
const Y_DAY = {
	noiDung: Y_MAC_DINH,
	viSao: "Khách dược cần giao lạnh ổn định quanh năm.",
	doBangGi: "Số đơn giao lạnh mỗi tháng",
} as const;
type YVao = { noiDung: string; viSao: string; doBangGi: string };
const gop = (hoiYId: string, cookie: string, vao: YVao = Y_DAY) =>
	goi("okr.gopY", { hoiYId, ...vao }, cookie);
const dongYCua = (yId: string, cookie: string, bat = true) =>
	goi("okr.dongY", { yId, bat }, cookie);
const donHanVeBayGio = async (g: { h: string; nguoi: { Q: Nguoi } }) =>
	ok(
		await goi(
			"okr.suaHoiY",
			{ hoiYId: g.h, hanLuc: dongHo().toISOString() },
			g.nguoi.Q.cookie,
		),
		"doi han ve bay gio",
	);
const yCua = async (hoiYId: string, tacGiaUserId: string) =>
	(
		await db.okrY.findFirstOrThrow({
			where: { hoiYId, tacGiaUserId },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		})
	).id;
const vanTayY = async () =>
	JSON.stringify(
		await db.okrY.findMany({
			orderBy: { id: "asc" },
			select: {
				id: true,
				tacGiaUserId: true,
				noiDung: true,
				viSao: true,
				doBangGi: true,
			},
		}),
	);
const lapChu = (n: number) => "ý".repeat(n);

describe("gop-y", () => {
	test(
		"gop-y: T góp, sửa rồi gỡ; O (vai okr) góp — DB đúng từng bước, người góp là người gọi, createdAt là giờ tiêm, không vết",
		async () => {
			datDongHo(LUC);
			const { ky, h, nguoi } = await gieoHoiY();
			const { T: tv, O } = nguoi;
			const docY = (id: string) =>
				db.okrY.findUnique({
					where: { id },
					select: {
						hoiYId: true,
						tacGiaUserId: true,
						noiDung: true,
						viSao: true,
						doBangGi: true,
						chuDeId: true,
						createdAt: true,
					},
				});
			const { id } = ok<{ id: string }>(await gop(h, tv.cookie), "T gop");
			expect(await docY(id)).toEqual({
				hoiYId: h,
				tacGiaUserId: tv.id,
				...Y_DAY,
				chuDeId: null,
				createdAt: LUC,
			});
			const suaVao = {
				noiDung: "Mở tuyến giao lạnh cho khách dược ở miền Trung",
				viSao: "Hai kho miền Trung đang trống nửa công suất.",
				doBangGi: "Tỉ lệ lấp đầy kho lạnh miền Trung",
			};
			ok(await goi("okr.suaY", { yId: id, ...suaVao }, tv.cookie), "T sua");
			expect(await docY(id)).toEqual({
				hoiYId: h,
				tacGiaUserId: tv.id,
				...suaVao,
				chuDeId: null,
				createdAt: LUC,
			});
			ok(await goi("okr.goY", { yId: id }, tv.cookie), "T go");
			expect(await docY(id)).toBeNull();
			const cuaO = ok<{ id: string }>(await gop(h, O.cookie), "O gop");
			expect(await docY(cuaO.id)).toEqual({
				hoiYId: h,
				tacGiaUserId: O.id,
				...Y_DAY,
				chuDeId: null,
				createdAt: LUC,
			});
			const vet = await db.okrTrail.findMany({
				where: { cycleId: ky, action: { not: "tao-chu-ky" } },
				select: { action: true },
			});
			expect(vet.map((v) => v.action)).toEqual(["mo-hoi-y"]);
		},
		CHO_MS,
	);

	test(
		"gop-y: 11 ca từ chối viết trước — mã HTTP và câu ghim khớp bảng khai; okrY, okrTrail và nội dung mọi ý không đổi ở mọi ca",
		async () => {
			datDongHo(LUC);
			const KHAI = [
				{ ca: "y-thu-tu-cua-T", maHttp: 400, cau: T.quaBaY },
				{ ca: "O-sua-y-cua-T", maHttp: 403, cau: T.chiYCuaMinh },
				{ ca: "O-go-y-cua-T", maHttp: 403, cau: T.chiYCuaMinh },
				{ ca: "nguoi-chon-gop", maHttp: 400, cau: T.nguoiChonKhongGop },
				{
					ca: "noi-dung-9-ky-tu",
					maHttp: 400,
					cau: `noiDung: Too small: expected string to have >=${OKR_HOI_Y.noiDung.min} characters`,
				},
				{
					ca: "noi-dung-301-ky-tu",
					maHttp: 400,
					cau: `noiDung: Too big: expected string to have <=${OKR_HOI_Y.noiDung.max} characters`,
				},
				{ ca: "gop-sau-doi-han-ve-bay-gio", maHttp: 400, cau: T.hetHan },
				{ ca: "sua-sau-doi-han-ve-bay-gio", maHttp: 400, cau: T.hetHan },
				{ ca: "go-sau-doi-han-ve-bay-gio", maHttp: 400, cau: T.hetHan },
				{ ca: "gop-sau-cong-bo", maHttp: 400, cau: T.daCongBo },
				{ ca: "sua-y-khong-co", maHttp: 404, cau: T.khongCoY("khong-co") },
			] as const satisfies readonly Ca[];

			const mo = await gieoHoiY({ yCua: ["T", "T", "T"] });
			const yT = await yCua(mo.h, mo.nguoi.T.id);
			const gom = await gieoHoiY({ yCua: ["T"] });
			const yTGom = await yCua(gom.h, gom.nguoi.T.id);
			await donHanVeBayGio(gom);
			const congBo = await gieoHoiY();
			await donHanVeBayGio(congBo);
			await gieoCongBo(congBo.h);
			const { T: tv, O, P, A } = mo.nguoi;

			const CHAY = {
				"y-thu-tu-cua-T": () => gop(mo.h, tv.cookie),
				"O-sua-y-cua-T": () => goi("okr.suaY", { yId: yT, ...Y_DAY }, O.cookie),
				"O-go-y-cua-T": () => goi("okr.goY", { yId: yT }, O.cookie),
				"nguoi-chon-gop": () => gop(mo.h, P.cookie),
				"noi-dung-9-ky-tu": () =>
					gop(mo.h, A.cookie, {
						...Y_DAY,
						noiDung: lapChu(OKR_HOI_Y.noiDung.min - 1),
					}),
				"noi-dung-301-ky-tu": () =>
					gop(mo.h, A.cookie, {
						...Y_DAY,
						noiDung: lapChu(OKR_HOI_Y.noiDung.max + 1),
					}),
				"gop-sau-doi-han-ve-bay-gio": () => gop(gom.h, gom.nguoi.A.cookie),
				"sua-sau-doi-han-ve-bay-gio": () =>
					goi(
						"okr.suaY",
						{ yId: yTGom, ...Y_DAY, noiDung: "Sửa sau khi đã qua hạn góp" },
						gom.nguoi.T.cookie,
					),
				"go-sau-doi-han-ve-bay-gio": () =>
					goi("okr.goY", { yId: yTGom }, gom.nguoi.T.cookie),
				"gop-sau-cong-bo": () => gop(congBo.h, congBo.nguoi.A.cookie),
				"sua-y-khong-co": () =>
					goi("okr.suaY", { yId: "khong-co", ...Y_DAY }, tv.cookie),
			} satisfies {
				[K in (typeof KHAI)[number]["ca"]]: () => Promise<TraLoi>;
			};

			const BANG: Bang[] = ["okrY", "okrTrail"];
			const nhan: KetQua[] = [];
			for (const khai of KHAI) {
				const truoc = await Promise.all(BANG.map(dem));
				const vanTayTruoc = await vanTayY();
				const tra = await CHAY[khai.ca]();
				const sau = await Promise.all(BANG.map(dem));
				nhan.push({
					ca: khai.ca,
					maHttp: tra.status,
					cau: tra.loi.includes(khai.cau) ? khai.cau : tra.loi,
					doi: {
						...Object.fromEntries(
							BANG.map((b, i) => [b, (sau[i] ?? 0) - (truoc[i] ?? 0)]),
						),
						noiDungY: (await vanTayY()) === vanTayTruoc ? 0 : 1,
					},
				});
			}
			expect(nhan).toEqual(
				KHAI.map((k) => ({
					...k,
					doi: { okrY: 0, okrTrail: 0, noiDungY: 0 },
				})),
			);
		},
		CHO_MS,
	);

	test(
		"gop-y: biên hạn nửa mở — lúc hanLuc − 1 ms góp được, createdAt đúng giờ tiêm; lúc đúng hanLuc bị từ chối hetHan, không thêm ý",
		async () => {
			datDongHo(LUC);
			const { h, nguoi } = await gieoHoiY();
			const han = (await db.okrHoiY.findUniqueOrThrow({ where: { id: h } }))
				.hanLuc;
			const truocHan = lechMs(han, -MOT_MS);
			datDongHo(truocHan);
			const { id } = ok<{ id: string }>(
				await gop(h, nguoi.A.cookie),
				"gop luc hanLuc - 1 ms",
			);
			const y = await db.okrY.findUniqueOrThrow({ where: { id } });
			expect(y.createdAt.toISOString()).toBe(truocHan.toISOString());
			datDongHo(han);
			const dungHan = await gop(h, nguoi.B.cookie);
			expect({
				maHttp: dungHan.status,
				cau: dungHan.loi.includes(T.hetHan) ? T.hetHan : dungHan.loi,
				soYCuaB: await db.okrY.count({
					where: { hoiYId: h, tacGiaUserId: nguoi.B.id },
				}),
			}).toEqual({ maHttp: 400, cau: T.hetHan, soYCuaB: 0 });
		},
		CHO_MS,
	);

	test(
		"gop-y: ca đua — T đã có 2 ý, hai lời gopY song song → đúng một thành công, một quaBaY, DB đúng 3 ý của T",
		async () => {
			datDongHo(LUC);
			const { h, nguoi } = await gieoHoiY({ yCua: ["T", "T"] });
			const [mot, hai] = await Promise.all([
				gop(h, nguoi.T.cookie, {
					...Y_DAY,
					noiDung: "Ý thứ ba gửi từ tab thứ nhất",
				}),
				gop(h, nguoi.T.cookie, {
					...Y_DAY,
					noiDung: "Ý thứ ba gửi từ tab thứ hai",
				}),
			]);
			expect({
				soYCuaT: await db.okrY.count({
					where: { hoiYId: h, tacGiaUserId: nguoi.T.id },
				}),
				maHttp: [mot.status, hai.status].sort(),
				cau: [mot.loi, hai.loi].filter((l) => l !== ""),
			}).toEqual({
				soYCuaT: OKR_HOI_Y.yMoiNguoi,
				maHttp: [200, 400],
				cau: [T.quaBaY],
			});
		},
		CHO_MS,
	);
});

const TEN_A = "Ngô Minh Châu";
const TEN_B = "Lê Thu Hà";
const TRANG_THAI_MA_TRAN = ["dang-mo", "dang-gom", "da-cong-bo"] as const;
const VAI_MA_TRAN = ["T", "O", "Q", "P"] as const;
const DUONG_MA_TRAN = ["trpc", "rest", "khoa-api"] as const;
const THU_TUC_DOC = ["okr.hoiY", "okr.hoiYNhan"] as const;
type VaiMaTran = (typeof VAI_MA_TRAN)[number];
type DuongMaTran = (typeof DUONG_MA_TRAN)[number];
type ThuTucDoc = (typeof THU_TUC_DOC)[number];
const REST_DOC = {
	"okr.hoiY": "/okr/hoi-y",
	"okr.hoiYNhan": "/okr/hoi-y/nhan",
} as const satisfies { [K in ThuTucDoc]: string };

type DemO = {
	ten: number;
	maA: number;
	maB: number;
	soDongY: number;
	daDongY: (boolean | null)[] | null;
	soDongYCuaY1: number | null;
};
const AN_TEN: DemO = {
	ten: 0,
	maA: 0,
	maB: 0,
	soDongY: 0,
	daDongY: [true, false],
	soDongYCuaY1: null,
};
const DAY_DU: DemO = {
	ten: 1,
	maA: 1,
	maB: 1,
	soDongY: 2,
	daDongY: [false, false],
	soDongYCuaY1: 2,
};
const NHAN_NHE: DemO = {
	ten: 0,
	maA: 0,
	maB: 0,
	soDongY: 0,
	daDongY: null,
	soDongYCuaY1: null,
};
const KY_VONG_O = {
	"okr.hoiY": { T: AN_TEN, O: AN_TEN, Q: DAY_DU, P: DAY_DU },
	"okr.hoiYNhan": { T: NHAN_NHE, O: NHAN_NHE, Q: NHAN_NHE, P: NHAN_NHE },
} as const satisfies { [K in ThuTucDoc]: { [V in VaiMaTran]: DemO } };

const docQuaDuong = (
	cycleId: string,
	dau: { cookie: string; khoa: string },
	duong: DuongMaTran,
	thuTuc: ThuTucDoc,
): Promise<TraLoi> => {
	const rest = `${REST_DOC[thuTuc]}?cycleId=${encodeURIComponent(cycleId)}`;
	switch (duong) {
		case "trpc":
			return goiQuery(thuTuc, dau.cookie, { cycleId });
		case "rest":
			return goiRest(rest, { cookie: dau.cookie });
		case "khoa-api":
			return goiRest(rest, { khoa: dau.khoa });
	}
};
const demChuoi = (chu: string, tim: string) => chu.split(tim).length - 1;
const nhanCua = (tra: TraLoi, nhan: string): HoiYNhanOutput =>
	hoiYNhanOutput.parse(ok(tra, nhan));

describe("ten-va-so", () => {
	test(
		"ten-va-so: ma trận viết trước 3 trạng thái × 4 vai × 3 đường × 2 thủ tục đọc — T, O không thấy tên, mã người góp, số đồng ý; Q, P thấy; bài in số ô",
		async () => {
			datDongHo(LUC);
			const { ky, h, nguoi } = await gieoHoiY();
			const { A, B, T: tv, O } = nguoi;
			await db.user.update({ where: { id: A.id }, data: { name: TEN_A } });
			await db.user.update({ where: { id: B.id }, data: { name: TEN_B } });
			const y1 = (await gieoY(h, A.id, "Mở tuyến giao lạnh cho khách dược")).id;
			const y2 = (
				await gieoY(h, B.id, "Giảm thời gian giao chặng cuối nội thành")
			).id;
			ok(await dongYCua(y1, tv.cookie), "T dong y Y1");
			ok(await dongYCua(y1, O.cookie), "O dong y Y1");
			await gieoBanTruoc(h, nguoi.P.id);
			const khoa = { T: "", O: "", Q: "", P: "" } satisfies {
				[V in VaiMaTran]: string;
			};
			for (const vai of VAI_MA_TRAN)
				khoa[vai] = await khoaApiCua(nguoi[vai].id);

			const KHAI = TRANG_THAI_MA_TRAN.flatMap((trangThai) =>
				VAI_MA_TRAN.flatMap((vai) =>
					DUONG_MA_TRAN.flatMap((duong) =>
						THU_TUC_DOC.map((thuTuc) => ({
							trangThai,
							vai,
							duong,
							thuTuc,
							maHttp: 200,
							dem: KY_VONG_O[thuTuc][vai],
						})),
					),
				),
			);
			expect(KHAI.length).toBe(
				TRANG_THAI_MA_TRAN.length *
					VAI_MA_TRAN.length *
					DUONG_MA_TRAN.length *
					THU_TUC_DOC.length,
			);

			const goiO = (
				vai: VaiMaTran,
				duong: DuongMaTran,
				thuTuc: ThuTucDoc,
			): Promise<TraLoi> =>
				docQuaDuong(
					ky,
					{ cookie: nguoi[vai].cookie, khoa: khoa[vai] },
					duong,
					thuTuc,
				);
			const demCua = (tra: TraLoi, thuTuc: ThuTucDoc): DemO => {
				const chu = JSON.stringify(tra.data);
				const coBan = {
					ten: demChuoi(chu, TEN_A),
					maA: demChuoi(chu, A.id),
					maB: demChuoi(chu, B.id),
					soDongY: demChuoi(chu, '"soDongY":'),
				};
				if (thuTuc === "okr.hoiYNhan") {
					hoiYNhanOutput.parse(tra.data);
					return { ...coBan, daDongY: null, soDongYCuaY1: null };
				}
				const ds = hoiYDocOutput.parse(tra.data)?.y.ds ?? [];
				const tim = (id: string) => ds.find((y) => y.id === id);
				const motY = tim(y1);
				return {
					...coBan,
					daDongY: [tim(y1)?.daDongY ?? null, tim(y2)?.daDongY ?? null],
					soDongYCuaY1: motY && "soDongY" in motY ? motY.soDongY : null,
				};
			};
			const CAM = {
				tenA: TEN_A,
				tenB: TEN_B,
				maA: A.id,
				maB: B.id,
				soDongY: '"soDongY":',
			};

			const nhan: (typeof KHAI)[number][] = [];
			const lo: string[] = [];
			for (const trangThai of TRANG_THAI_MA_TRAN) {
				if (trangThai === "dang-gom") await donHanVeBayGio({ h, nguoi });
				if (trangThai === "da-cong-bo") await gieoCongBo(h);
				for (const k of KHAI.filter((x) => x.trangThai === trangThai)) {
					const tra = await goiO(k.vai, k.duong, k.thuTuc);
					const chu = JSON.stringify(tra.data);
					if (k.vai === "T" || k.vai === "O")
						for (const [ten, s] of Object.entries(CAM)) {
							const o = chu.indexOf(s);
							if (o >= 0)
								lo.push(
									`${k.trangThai} ${k.vai} ${k.duong} ${k.thuTuc} lo ${ten}: ${chu.slice(Math.max(0, o - 80), o + 80)}`,
								);
						}
					nhan.push({
						...k,
						maHttp: tra.status,
						dem: tra.status === 200 ? demCua(tra, k.thuTuc) : NHAN_NHE,
					});
				}
			}
			console.log(`ten-va-so: đã chạy ${nhan.length}/${KHAI.length} ô`);
			expect(lo, "chuoi lo toi T, O").toEqual([]);
			expect(nhan.length).toBe(KHAI.length);
			expect(nhan).toEqual(KHAI);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ten-va-so: thứ tự xáo — 12 ý của 6 người; T lần 1 = lần 2, O lần 1 = lần 2, T ≠ O, T ≠ thứ tự tạo; T bấm đồng ý ý cuối không đổi thứ tự",
		async () => {
			datDongHo(LUC);
			const { h, ky, nguoi } = await gieoHoiY();
			const X = await nguoiCo("xao-X", "member");
			const Y = await nguoiCo("xao-Y", "member");
			const nguoiGop = [nguoi.A, nguoi.B, nguoi.R, nguoi.Q, X, Y];
			const SO_Y_MOI_NGUOI = 2;
			for (let i = 0; i < nguoiGop.length * SO_Y_MOI_NGUOI; i += 1) {
				datDongHo(lechMs(LUC, i * MOT_MS));
				const ai = nguoiGop[i % nguoiGop.length];
				if (!ai) throw new Error("thieu nguoi gop");
				await gieoY(h, ai.id, `Ý số ${i + 1} cho mục tiêu năm tới`);
			}
			const theoTao = (
				await db.okrY.findMany({
					where: { hoiYId: h },
					orderBy: [{ createdAt: "asc" }, { id: "asc" }],
					select: { id: true },
				})
			).map((y) => y.id);
			const thuTu = async (ai: Nguoi) =>
				(
					hoiYDocOutput.parse(
						ok(await goiQuery("okr.hoiY", ai.cookie, { cycleId: ky }), "doc"),
					)?.y.ds ?? []
				).map((y) => y.id);
			const t1 = await thuTu(nguoi.T);
			const t2 = await thuTu(nguoi.T);
			const o1 = await thuTu(nguoi.O);
			const o2 = await thuTu(nguoi.O);
			expect([...t1].sort()).toEqual([...theoTao].sort());
			expect(t2, "T lan 2 khac lan 1").toEqual(t1);
			expect(o2, "O lan 2 khac lan 1").toEqual(o1);
			expect(o1, `T khac O — T: ${t1.join(",")}`).not.toEqual(t1);
			expect(t1, "T khac thu tu tao").not.toEqual(theoTao);
			const cuoi = t1.at(-1);
			if (!cuoi) throw new Error("T khong thay y nao");
			ok(await dongYCua(cuoi, nguoi.T.cookie), "T dong y y cuoi");
			expect(await thuTu(nguoi.T), "bam dong y doi thu tu").toEqual(t1);
		},
		CHO_MS,
	);

	test(
		"ten-va-so: dongY — bấm lần hai không thêm hàng, bỏ bấm xoá hàng, bấm ý của mình 400 yCuaMinh, sau hạn 400 hetHan",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { A, B, O, T: tv } = g.nguoi;
			const y1 = (await gieoY(g.h, A.id)).id;
			const soHang = () => db.okrYDongY.count({ where: { yId: y1 } });
			const buoc: {
				buoc: string;
				maHttp: number;
				cau: string;
				soHang: number;
			}[] = [];
			const ghi = async (ten: string, tra: TraLoi, cau = "") =>
				buoc.push({
					buoc: ten,
					maHttp: tra.status,
					cau: cau && tra.loi.includes(cau) ? cau : tra.loi,
					soHang: await soHang(),
				});
			await ghi("T bat", await dongYCua(y1, tv.cookie));
			await ghi("O bat", await dongYCua(y1, O.cookie));
			await ghi("T bat lan hai", await dongYCua(y1, tv.cookie));
			await ghi("T tat", await dongYCua(y1, tv.cookie, false));
			await ghi("A bat y cua minh", await dongYCua(y1, A.cookie), T.yCuaMinh);
			await donHanVeBayGio(g);
			await ghi("B bat sau han", await dongYCua(y1, B.cookie), T.hetHan);
			expect(buoc).toEqual([
				{ buoc: "T bat", maHttp: 200, cau: "", soHang: 1 },
				{ buoc: "O bat", maHttp: 200, cau: "", soHang: 2 },
				{ buoc: "T bat lan hai", maHttp: 200, cau: "", soHang: 2 },
				{ buoc: "T tat", maHttp: 200, cau: "", soHang: 1 },
				{ buoc: "A bat y cua minh", maHttp: 400, cau: T.yCuaMinh, soHang: 1 },
				{ buoc: "B bat sau han", maHttp: 400, cau: T.hetHan, soHang: 1 },
			]);
			const hang = await db.okrYDongY.findUniqueOrThrow({
				where: { yId_userId: { yId: y1, userId: O.id } },
			});
			expect(hang.createdAt.toISOString()).toBe(LUC.toISOString());
		},
		CHO_MS,
	);

	test(
		"ten-va-so: hoiYNhan — T chưa góp canGop true; góp rồi false; P đang gom 6 chủ đề 2 đã kết luận → 4, Q → null; qua hạn canGop false cho mọi người; chu kỳ không có hỏi ý → coHoiY false, hoiY null",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { ky, h, nguoi } = g;
			const nhan = async (ai: Nguoi) =>
				nhanCua(
					await goiQuery("okr.hoiYNhan", ai.cookie, { cycleId: ky }),
					"hoiYNhan",
				);
			expect(await nhan(nguoi.T)).toEqual({
				coHoiY: true,
				trangThai: "dang-mo",
				canGop: true,
				soChuDeChuaKetLuan: null,
			});
			expect((await nhan(nguoi.P)).canGop).toBe(false);
			await gieoY(h, nguoi.T.id);
			expect(await nhan(nguoi.T)).toEqual({
				coHoiY: true,
				trangThai: "dang-mo",
				canGop: false,
				soChuDeChuaKetLuan: null,
			});
			await donHanVeBayGio(g);
			const SO_CHU_DE = 6;
			const DA_KET_LUAN = 2;
			await db.okrChuDe.createMany({
				data: Array.from({ length: SO_CHU_DE }, (_, i) => ({
					hoiYId: h,
					loai: "chu-de",
					ten: `Chủ đề ${i + 1}`,
					viTri: i,
					ketLuan: i < DA_KET_LUAN ? "de-sau" : null,
					lyDo: i < DA_KET_LUAN ? "Để kỳ sau khi đủ người làm." : "",
				})),
			});
			const VAI_NHAN = ["T", "O", "A", "Q", "P"] as const;
			const sauHan: { [V in (typeof VAI_NHAN)[number]]?: HoiYNhanOutput } = {};
			for (const v of VAI_NHAN) sauHan[v] = await nhan(nguoi[v]);
			const gom = (so: number | null): HoiYNhanOutput => ({
				coHoiY: true,
				trangThai: "dang-gom",
				canGop: false,
				soChuDeChuaKetLuan: so,
			});
			expect(sauHan).toEqual({
				T: gom(null),
				O: gom(null),
				A: gom(null),
				Q: gom(null),
				P: gom(SO_CHU_DE - DA_KET_LUAN),
			});
			const kyTrong = await taoNam("nhan-trong", NAM_KE);
			expect(
				nhanCua(
					await goiQuery("okr.hoiYNhan", nguoi.T.cookie, {
						cycleId: kyTrong,
					}),
					"hoiYNhan ky trong",
				),
			).toEqual({
				coHoiY: false,
				trangThai: null,
				canGop: false,
				soChuDeChuaKetLuan: null,
			});
			expect(
				ok(
					await goiQuery("okr.hoiY", nguoi.T.cookie, { cycleId: kyTrong }),
					"hoiY ky trong",
				),
			).toBeNull();
		},
		CHO_MS,
	);
});

const TEN_R = "Phạm Quốc Bảo";
const Y_NGUOI_KHAC = [
	"Mở kho lạnh cho khách dược miền Trung",
	"Giao đơn trong hai giờ ở nội thành",
	"Tặng gói bảo hiểm hàng hoá cho khách quay lại",
] as const;
const BAN_KHAC = [
	"Bán thêm dịch vụ kho bãi cho khách cũ",
	"Mở tuyến giao xuyên biên giới ở phía Bắc",
	"Tự làm phần mềm điều xe cho đội giao hàng",
	"Giữ chi phí giao chặng cuối dưới mười phần trăm",
] as const;
const VAI_VIET_TRUOC = ["Q", "T", "O"] as const;
const TRANG_THAI_VIET_TRUOC = ["dang-mo"] as const;
const niemPhongCua = (
	hoiYId: string,
	cookie: string,
	vao: { cau: readonly string[] } | { boQua: true } = {
		cau: BAN_TRUOC_MAC_DINH,
	},
) => goi("okr.niemPhong", { hoiYId, ...vao }, cookie);
const chuLo = (chu: string, cau: readonly string[]) =>
	cau.filter((c) => chu.includes(c));

async function gieoBaYCuaNguoiKhac(g: Awaited<ReturnType<typeof gieoHoiY>>) {
	const { A, B, R } = g.nguoi;
	await db.user.update({ where: { id: A.id }, data: { name: TEN_A } });
	await db.user.update({ where: { id: B.id }, data: { name: TEN_B } });
	await db.user.update({ where: { id: R.id }, data: { name: TEN_R } });
	const [yA, yB, yR] = Y_NGUOI_KHAC;
	const ids = [
		(await gieoY(g.h, A.id, yA)).id,
		(await gieoY(g.h, B.id, yB)).id,
		(await gieoY(g.h, R.id, yR)).id,
	];
	return { ids, ten: [TEN_A, TEN_B, TEN_R] };
}

const docHoiY = async (ky: string, cookie: string) =>
	hoiYDocOutput.parse(
		ok(await goiQuery("okr.hoiY", cookie, { cycleId: ky }), "doc hoi y"),
	);

describe("ban-truoc", () => {
	test(
		"ban-truoc: trước niêm phong P đọc lần hỏi ý có 3 ý của người khác — 0 ý (so id), khoa true, câu ghim, không chữ ý nào trong phản hồi; Q vẫn thấy 3 ý",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { ky, nguoi } = g;
			const { ids, ten } = await gieoBaYCuaNguoiKhac(g);
			const docP = await docHoiY(ky, nguoi.P.cookie);
			const chu = JSON.stringify(docP);
			expect({
				soY: docP?.y.ds.length,
				idLo: ids.filter((id) => chu.includes(id)),
				chuLo: chuLo(chu, [...Y_NGUOI_KHAC, ...ten]),
				khoa: docP?.y.khoa,
				lyDoKhoa: docP?.y.lyDoKhoa,
				banTruoc: docP?.banTruoc,
			}).toEqual({
				soY: 0,
				idLo: [],
				chuLo: [],
				khoa: true,
				lyDoKhoa: T.yBiKhoa,
				banTruoc: null,
			});
			const docQ = await docHoiY(ky, nguoi.Q.cookie);
			expect({
				soY: docQ?.y.ds.length,
				khoa: docQ?.y.khoa,
				lyDoKhoa: docQ?.y.lyDoKhoa,
			}).toEqual({ soY: 3, khoa: false, lyDoKhoa: "" });
		},
		CHO_MS,
	);

	test(
		"ban-truoc: P niêm phong bốn câu — DB đúng một hàng {cau, boQua false, người viết P, giờ tiêm}, P đọc được 3 ý kèm tên; lần hai 400 daCoBanTruoc, hàng không đổi; vết niem-phong {soCau 4, boQua false} và chuỗi vết không chứa câu nào",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { ky, h, nguoi } = g;
			const { ids, ten } = await gieoBaYCuaNguoiKhac(g);
			const { id } = ok<{ id: string }>(
				await niemPhongCua(h, nguoi.P.cookie),
				"P niem phong",
			);
			const hang = await db.okrHoiYBanTruoc.findMany({ where: { hoiYId: h } });
			expect(hang.length).toBe(1);
			expect({
				id: hang[0]?.id,
				cau: hang[0]?.cau,
				boQua: hang[0]?.boQua,
				vietBoiUserId: hang[0]?.vietBoiUserId,
				niemPhongLuc: hang[0]?.niemPhongLuc.toISOString(),
			}).toEqual({
				id,
				cau: [...BAN_TRUOC_MAC_DINH],
				boQua: false,
				vietBoiUserId: nguoi.P.id,
				niemPhongLuc: LUC.toISOString(),
			});

			const docP = await docHoiY(ky, nguoi.P.cookie);
			const tenP = (
				await db.user.findUniqueOrThrow({ where: { id: nguoi.P.id } })
			).name;
			const thay = (docP?.y.ds ?? []).flatMap((y) =>
				"tacGia" in y ? [{ id: y.id, ten: y.tacGia.ten }] : [],
			);
			expect({
				khoa: docP?.y.khoa,
				lyDoKhoa: docP?.y.lyDoKhoa,
				soY: docP?.y.ds.length,
				idTen: thay.map((y) => y.id).sort(),
				ten: thay.map((y) => y.ten).sort(),
				banTruoc: docP?.banTruoc,
			}).toEqual({
				khoa: false,
				lyDoKhoa: "",
				soY: 3,
				idTen: [...ids].sort(),
				ten: [...ten].sort(),
				banTruoc: { cau: [...BAN_TRUOC_MAC_DINH], boQua: false, vietBoi: tenP },
			});

			const truoc = JSON.stringify(hang);
			const lanHai = [
				{
					ca: "cau-khac",
					tra: await niemPhongCua(h, nguoi.P.cookie, { cau: BAN_KHAC }),
				},
				{ ca: "cau-cu", tra: await niemPhongCua(h, nguoi.P.cookie) },
				{
					ca: "khai-khong-viet",
					tra: await niemPhongCua(h, nguoi.P.cookie, { boQua: true }),
				},
			].map((x) => ({
				ca: x.ca,
				maHttp: x.tra.status,
				cau: x.tra.loi.includes(T.daCoBanTruoc) ? T.daCoBanTruoc : x.tra.loi,
			}));
			expect(lanHai).toEqual(
				["cau-khac", "cau-cu", "khai-khong-viet"].map((ca) => ({
					ca,
					maHttp: 400,
					cau: T.daCoBanTruoc,
				})),
			);
			expect(
				JSON.stringify(
					await db.okrHoiYBanTruoc.findMany({ where: { hoiYId: h } }),
				),
			).toBe(truoc);

			const vet = await db.okrTrail.findMany({
				where: { cycleId: ky, action: "niem-phong" },
			});
			expect(
				vet.map((v) => ({
					actorUserId: v.actorUserId,
					objectiveId: v.objectiveId,
					before: v.before,
					after: v.after,
				})),
			).toEqual([
				{
					actorUserId: nguoi.P.id,
					objectiveId: null,
					before: null,
					after: { soCau: 4, boQua: false },
				},
			]);
			expect(
				chuLo(JSON.stringify(vet), [...BAN_TRUOC_MAC_DINH, ...BAN_KHAC]),
				"vet chua chu cau",
			).toEqual([]);
		},
		CHO_MS,
	);

	test(
		"ban-truoc: 12 ca từ chối viết trước — mã HTTP và câu ghim khớp bảng khai; hàng bản viết trước và vết không đổi ở mọi ca",
		async () => {
			datDongHo(LUC);
			const KHAI = [
				{
					ca: "Q-quan-tri-khong-phai-nguoi-chon",
					maHttp: 403,
					cau: T.chiNguoiChon,
				},
				{ ca: "T-thanh-vien", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "O-vai-chi-okr", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "P-bi-ha-vai", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "sau-han", maHttp: 400, cau: T.chiNiemPhongKhiDangMo },
				{ ca: "sau-cong-bo", maHttp: 400, cau: T.daCongBo },
				{ ca: "hoi-y-khong-co", maHttp: 404, cau: T.khongCoHoiY("khong-co") },
				{
					ca: "hai-cau",
					maHttp: 400,
					cau: `cau: Too small: expected array to have >=${OKR_HOI_Y.banTruoc.min} items`,
				},
				{
					ca: "sau-cau",
					maHttp: 400,
					cau: `cau: Too big: expected array to have <=${OKR_HOI_Y.banTruoc.max} items`,
				},
				{
					ca: "cau-9-ky-tu",
					maHttp: 400,
					cau: `cau: Too small: expected string to have >=${OKR_HOI_Y.banTruoc.cau.min} characters`,
				},
				{
					ca: "vua-cau-vua-bo-qua",
					maHttp: 400,
					cau: CAU_NIEM_PHONG_MOT_TRONG_HAI,
				},
				{
					ca: "khong-cau-khong-bo-qua",
					maHttp: 400,
					cau: CAU_NIEM_PHONG_MOT_TRONG_HAI,
				},
			] as const satisfies readonly Ca[];

			const mo = await gieoHoiY();
			const haVai = await gieoHoiY();
			await doiVai(haVai.nguoi.P.id, "member");
			const gom = await gieoHoiY();
			await donHanVeBayGio(gom);
			const congBo = await gieoHoiY();
			await donHanVeBayGio(congBo);
			await gieoCongBo(congBo.h);
			const { Q, T: tv, O, P } = mo.nguoi;
			const cauNgan = lapChu(OKR_HOI_Y.banTruoc.cau.min - 1);
			const CHAY = {
				"Q-quan-tri-khong-phai-nguoi-chon": () => niemPhongCua(mo.h, Q.cookie),
				"T-thanh-vien": () => niemPhongCua(mo.h, tv.cookie),
				"O-vai-chi-okr": () => niemPhongCua(mo.h, O.cookie),
				"P-bi-ha-vai": () => niemPhongCua(haVai.h, haVai.nguoi.P.cookie),
				"sau-han": () => niemPhongCua(gom.h, gom.nguoi.P.cookie),
				"sau-cong-bo": () => niemPhongCua(congBo.h, congBo.nguoi.P.cookie),
				"hoi-y-khong-co": () => niemPhongCua("khong-co", P.cookie),
				"hai-cau": () =>
					niemPhongCua(mo.h, P.cookie, {
						cau: BAN_TRUOC_MAC_DINH.slice(0, OKR_HOI_Y.banTruoc.min - 1),
					}),
				"sau-cau": () =>
					niemPhongCua(mo.h, P.cookie, {
						cau: [...BAN_TRUOC_MAC_DINH, ...BAN_KHAC].slice(
							0,
							OKR_HOI_Y.banTruoc.max + 1,
						),
					}),
				"cau-9-ky-tu": () =>
					niemPhongCua(mo.h, P.cookie, {
						cau: [
							...BAN_TRUOC_MAC_DINH.slice(0, OKR_HOI_Y.banTruoc.min - 1),
							cauNgan,
						],
					}),
				"vua-cau-vua-bo-qua": () =>
					goi(
						"okr.niemPhong",
						{ hoiYId: mo.h, cau: BAN_TRUOC_MAC_DINH, boQua: true },
						P.cookie,
					),
				"khong-cau-khong-bo-qua": () =>
					goi("okr.niemPhong", { hoiYId: mo.h }, P.cookie),
			} satisfies { [K in (typeof KHAI)[number]["ca"]]: () => Promise<TraLoi> };

			const BANG: Bang[] = ["okrHoiYBanTruoc", "okrTrail"];
			const nhan: KetQua[] = [];
			for (const khai of KHAI) {
				const truoc = await Promise.all(BANG.map(dem));
				const tra = await CHAY[khai.ca]();
				const sau = await Promise.all(BANG.map(dem));
				nhan.push({
					ca: khai.ca,
					maHttp: tra.status,
					cau: tra.loi.includes(khai.cau) ? khai.cau : tra.loi,
					doi: Object.fromEntries(
						BANG.map((b, i) => [b, (sau[i] ?? 0) - (truoc[i] ?? 0)]),
					),
				});
			}
			expect(nhan).toEqual(
				KHAI.map((k) => ({
					...k,
					doi: { okrHoiYBanTruoc: 0, okrTrail: 0 },
				})),
			);
		},
		CHO_MS,
	);

	test(
		"ban-truoc: ca đua — P niêm phong hai lần song song → đúng một hàng, một thành công, một 400 daCoBanTruoc, đúng một vết",
		async () => {
			datDongHo(LUC);
			const { ky, h, nguoi } = await gieoHoiY();
			const [mot, hai] = await Promise.all([
				niemPhongCua(h, nguoi.P.cookie),
				niemPhongCua(h, nguoi.P.cookie, { cau: BAN_KHAC }),
			]);
			expect({
				soHang: await db.okrHoiYBanTruoc.count({ where: { hoiYId: h } }),
				soVet: await db.okrTrail.count({
					where: { cycleId: ky, action: "niem-phong" },
				}),
				maHttp: [mot.status, hai.status].sort(),
				cau: [mot.loi, hai.loi].filter((l) => l !== ""),
			}).toEqual({
				soHang: 1,
				soVet: 1,
				maHttp: [200, 400],
				cau: [T.daCoBanTruoc],
			});
		},
		CHO_MS,
	);

	test(
		"ban-truoc: ca đua — P niêm phong song song với Q đổi người chọn sang P2 → hoặc có hàng do P viết và P vẫn là người chọn, hoặc không hàng và P2 là người chọn; không bao giờ hàng của người không còn là người chọn",
		async () => {
			datDongHo(LUC);
			const { h, nguoi } = await gieoHoiY();
			const P2 = await nguoiCo("hoi-y-P2", "admin");
			const [seal, doi] = await Promise.all([
				niemPhongCua(h, nguoi.P.cookie),
				goi(
					"okr.suaHoiY",
					{ hoiYId: h, nguoiChonUserId: P2.id },
					nguoi.Q.cookie,
				),
			]);
			const hang = await db.okrHoiYBanTruoc.findMany({ where: { hoiYId: h } });
			const nguoiChon = (
				await db.okrHoiY.findUniqueOrThrow({ where: { id: h } })
			).nguoiChonUserId;
			const truocKhi = seal.status === 200;
			expect({
				hang: hang.map((r) => r.vietBoiUserId),
				nguoiChon,
				maHttp: { seal: seal.status, doi: doi.status },
			}).toEqual(
				truocKhi
					? {
							hang: [nguoi.P.id],
							nguoiChon: nguoi.P.id,
							maHttp: { seal: 200, doi: 400 },
						}
					: {
							hang: [],
							nguoiChon: P2.id,
							maHttp: { seal: 403, doi: 200 },
						},
			);
		},
		CHO_MS,
	);

	test(
		"ban-truoc: khai không viết trước — P đọc được 3 ý kèm tên, hàng {cau [], boQua true}, vết {soCau 0, boQua true}; sau công bố Q, T, O đọc banTruoc {cau [], boQua true}",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { ky, h, nguoi } = g;
			await gieoBaYCuaNguoiKhac(g);
			expect((await docHoiY(ky, nguoi.P.cookie))?.y).toMatchObject({
				khoa: true,
				ds: [],
			});
			const { id } = ok<{ id: string }>(
				await niemPhongCua(h, nguoi.P.cookie, { boQua: true }),
				"P khai khong viet truoc",
			);
			const hang = await db.okrHoiYBanTruoc.findUniqueOrThrow({
				where: { hoiYId: h },
			});
			expect({
				id: hang.id,
				cau: hang.cau,
				boQua: hang.boQua,
				vietBoiUserId: hang.vietBoiUserId,
			}).toEqual({ id, cau: [], boQua: true, vietBoiUserId: nguoi.P.id });
			const docP = await docHoiY(ky, nguoi.P.cookie);
			expect({
				khoa: docP?.y.khoa,
				soY: docP?.y.ds.length,
				coTen: docP?.y.ds.every((y) => "tacGia" in y),
			}).toEqual({ khoa: false, soY: 3, coTen: true });
			const vet = await db.okrTrail.findMany({
				where: { cycleId: ky, action: "niem-phong" },
				select: { after: true },
			});
			expect(vet).toEqual([{ after: { soCau: 0, boQua: true } }]);
			const daNiem = await niemPhongCua(h, nguoi.P.cookie);
			expect({ maHttp: daNiem.status, cau: daNiem.loi }).toEqual({
				maHttp: 400,
				cau: T.daCoBanTruoc,
			});
			await gieoCongBo(h);
			const sauCongBo = await Promise.all(
				VAI_VIET_TRUOC.map(async (v) => [
					v,
					(await docHoiY(ky, nguoi[v].cookie))?.banTruoc,
				]),
			);
			const vietBoi = (
				await db.user.findUniqueOrThrow({ where: { id: nguoi.P.id } })
			).name;
			expect(Object.fromEntries(sauCongBo)).toEqual({
				Q: { cau: [], boQua: true, vietBoi },
				T: { cau: [], boQua: true, vietBoi },
				O: { cau: [], boQua: true, vietBoi },
			});
		},
		CHO_MS,
	);

	test(
		"ban-truoc: nửa ma trận quét lộ — dang-mo sau niêm phong, 3 vai (Q, T, O) × 3 đường × các thủ tục đọc khai ở THU_TUC_DOC: 0 câu viết trước trong phản hồi ở mọi ô, banTruoc null; sau công bố Q, T, O đọc đủ bốn câu qua cả ba đường; bài in số ô",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY({ yCua: ["A", "B"] });
			const { ky, h, nguoi } = g;
			await gieoBanTruoc(h, nguoi.P.id);
			const khoa = { Q: "", T: "", O: "" } satisfies {
				[V in (typeof VAI_VIET_TRUOC)[number]]: string;
			};
			for (const vai of VAI_VIET_TRUOC)
				khoa[vai] = await khoaApiCua(nguoi[vai].id);

			type OKhai = {
				trangThai: (typeof TRANG_THAI_VIET_TRUOC)[number];
				vai: (typeof VAI_VIET_TRUOC)[number];
				duong: DuongMaTran;
				thuTuc: ThuTucDoc;
				maHttp: number;
				cauLo: string[];
				banTruoc: HoiYOutput["banTruoc"];
			};
			const KHAI: OKhai[] = TRANG_THAI_VIET_TRUOC.flatMap((trangThai) =>
				VAI_VIET_TRUOC.flatMap((vai) =>
					DUONG_MA_TRAN.flatMap((duong) =>
						THU_TUC_DOC.map((thuTuc) => ({
							trangThai,
							vai,
							duong,
							thuTuc,
							maHttp: 200,
							cauLo: [],
							banTruoc: null,
						})),
					),
				),
			);
			expect(KHAI.length).toBe(
				TRANG_THAI_VIET_TRUOC.length *
					VAI_VIET_TRUOC.length *
					DUONG_MA_TRAN.length *
					THU_TUC_DOC.length,
			);

			const goiO = (k: OKhai) =>
				docQuaDuong(
					ky,
					{ cookie: nguoi[k.vai].cookie, khoa: khoa[k.vai] },
					k.duong,
					k.thuTuc,
				);
			const nhan: OKhai[] = [];
			const lo: string[] = [];
			for (const k of KHAI) {
				const tra = await goiO(k);
				const chu = JSON.stringify(tra.data);
				const cauLo = chuLo(chu, BAN_TRUOC_MAC_DINH);
				if (cauLo.length > 0)
					lo.push(
						`${k.trangThai} ${k.vai} ${k.duong} ${k.thuTuc} lo: ${cauLo.join(" | ")}`,
					);
				nhan.push({
					...k,
					maHttp: tra.status,
					cauLo,
					banTruoc:
						k.thuTuc === "okr.hoiY"
							? (hoiYDocOutput.parse(tra.data)?.banTruoc ?? null)
							: null,
				});
			}
			console.log(`ban-truoc: đã chạy ${nhan.length}/${KHAI.length} ô`);
			expect(lo, "cau viet truoc lo toi Q, T, O").toEqual([]);
			expect(nhan.length).toBe(KHAI.length);
			expect(nhan).toEqual(KHAI);

			await gieoCongBo(h);
			const SAU = VAI_VIET_TRUOC.flatMap((vai) =>
				DUONG_MA_TRAN.map((duong) => ({
					vai,
					duong,
					maHttp: 200,
					cauLo: [...BAN_TRUOC_MAC_DINH],
				})),
			);
			const sau: typeof SAU = [];
			for (const k of SAU) {
				const tra = await docQuaDuong(
					ky,
					{ cookie: nguoi[k.vai].cookie, khoa: khoa[k.vai] },
					k.duong,
					"okr.hoiY",
				);
				sau.push({
					...k,
					maHttp: tra.status,
					cauLo: chuLo(JSON.stringify(tra.data), BAN_TRUOC_MAC_DINH),
				});
			}
			console.log(
				`ban-truoc: sau công bố đã chạy ${sau.length}/${SAU.length} ô`,
			);
			expect(sau).toEqual(SAU);
		},
		CHO_MA_TRAN_MS,
	);
});
