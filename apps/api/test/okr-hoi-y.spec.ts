import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	OKR_HOI_Y,
	parseSoLieuHoiY,
	type SoLieuHoiY,
	trangThaiHoiY,
} from "@crm/validation/okr-hoi-y";
import { OKR } from "../src/okr/okr-config";
import {
	type Bang,
	CAU_HOI_MAC_DINH,
	datDongHo,
	dem,
	doiVai,
	dongHo,
	dungSanHoiY,
	gieoCongBo,
	gieoHoiY,
	gieoY,
	nguoiCo,
	SO_LIEU_MAC_DINH,
	sauGio,
} from "./okr-hoi-y-san";
import { dangChay, goi, ok, type TraLoi, taoNam } from "./okr-san";

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
			expect(vet.map((v) => v.action)).toEqual(["mo-hoi-y", "doi-nguoi-chon"]);
			expect(vet[1]).toEqual({
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
