import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { db } from "@crm/db";
import { OKR_NHAC } from "@crm/db/okr-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	type KetLuan,
	type NoiBanTruoc,
	OKR_HOI_Y,
	parseSoLieuHoiY,
	type SoLieuHoiY,
	trangThaiHoiY,
} from "@crm/validation/okr-hoi-y";
import { z } from "zod";
import type { KetQuaChieu, MaThieu } from "../src/okr/hoi-y";
import { OKR } from "../src/okr/okr-config";
import {
	type HoiYNhanOutput,
	type HoiYOutput,
	hoiYDocOutput,
	hoiYDoPhuOutput,
	hoiYNhanOutput,
} from "../src/okr/okr-hoi-y.contracts";
import { OkrTraoDoiService } from "../src/okr/okr-trao-doi.service";
import {
	E11_BAY_GIO,
	E11_COT,
	E11_DON_VI,
	E11_GIO_MO,
	E11_GOP,
	E11_NGAY_1_CUOI,
	E11_NGAY_2_DAU,
	E11_NGUOI,
	E11_NGUOI_CHON,
	E11_NGUOI_ROI,
	e11KyVong,
	type NguoiLaE11,
} from "./okr-hoi-y-do-phu-mau";
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
	roiDi,
	SO_LIEU_MAC_DINH,
	sauGio,
	Y_MAC_DINH,
} from "./okr-hoi-y-san";
import { THU_TUC_HOI_Y } from "./okr-hoi-y-thu-tuc";
import {
	bpMoi,
	CHUONG_TRINH_RONG,
	cay,
	dangChay,
	datViTri,
	goi,
	goiQuery,
	type Json,
	ok,
	pbMoi,
	phien,
	type TraLoi,
	taoNam,
	ungDung,
} from "./okr-san";

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
const KHUNG_DONG_MS = 60_000;
const lechMs = (d: Date, ms: number) => new Date(d.getTime() + ms);

const KHOA_LO_DANH_SACH = "chuaGop";

const chuoiJson = z.string();
const doiTuongJson = z.record(z.string(), z.json());

function demKhoaLo(v: Json | undefined, khoa: string): number {
	if (Array.isArray(v))
		return v.reduce<number>((t, x) => t + demKhoaLo(x, khoa), 0);
	const doi = doiTuongJson.safeParse(v);
	if (!doi.success) return 0;
	return Object.entries(doi.data).reduce<number>(
		(t, [k, x]) => t + (k === khoa ? 1 : 0) + demKhoaLo(x, khoa),
		0,
	);
}

function demMaTrongMang(
	v: Json | undefined,
	ma: ReadonlySet<string>,
	trongMang = false,
): number {
	const chuoi = chuoiJson.safeParse(v);
	if (chuoi.success) return trongMang && ma.has(chuoi.data) ? 1 : 0;
	if (Array.isArray(v))
		return v.reduce<number>((t, x) => t + demMaTrongMang(x, ma, true), 0);
	const doi = doiTuongJson.safeParse(v);
	if (!doi.success) return 0;
	return Object.values(doi.data).reduce<number>(
		(t, x) => t + demMaTrongMang(x, ma, trongMang),
		0,
	);
}

type TapChuaGop = { ma: ReadonlySet<string>; ten: ReadonlySet<string> };
type KetQuaQuet = {
	khoaChuaGop: number;
	maChuaGop: number;
	tenChuaGop: number;
};
const KHONG_LO: KetQuaQuet = { khoaChuaGop: 0, maChuaGop: 0, tenChuaGop: 0 };

async function tapChuaGop(hoiYId: string): Promise<TapChuaGop> {
	const daGop = new Set(
		(
			await db.okrY.findMany({
				where: { hoiYId },
				select: { tacGiaUserId: true },
			})
		).map((y) => y.tacGiaUserId),
	);
	const chua = (
		await db.member.findMany({
			where: { organizationId: WORKSPACE_ID },
			select: { user: { select: { id: true, name: true } } },
		})
	)
		.map((m) => m.user)
		.filter((u) => !daGop.has(u.id));
	return {
		ma: new Set(chua.map((u) => u.id)),
		ten: new Set(chua.map((u) => u.name).filter((t) => t !== "")),
	};
}

function quetChuaGop(data: Json, tap: TapChuaGop): KetQuaQuet {
	return {
		khoaChuaGop: demKhoaLo(data, KHOA_LO_DANH_SACH),
		maChuaGop: demMaTrongMang(data, tap.ma),
		tenChuaGop: demMaTrongMang(data, tap.ten),
	};
}

type CayToChuc = Awaited<ReturnType<typeof cay>>;
type LaTrongCay = NguoiLaE11 & { donVi: ReadonlySet<string>; dau: string };

const LAN_DOC_CAY_DUNG_YEN = 5;

function laTrongCay(
	c: CayToChuc,
	nguoiCua: ReadonlySet<string>,
	donViCua: ReadonlySet<string>,
): LaTrongCay {
	const nguoiLa = c.people.filter((n) => !nguoiCua.has(n.id));
	const donVi = [
		...c.divisions.flatMap((b) => [b.id, ...b.departments.map((p) => p.id)]),
		...c.chuaXep.map((p) => p.id),
	];
	return {
		tong: nguoiLa.length,
		chuaXep: nguoiLa.filter((n) => n.primaryDepartmentId === null).length,
		donVi: new Set(donVi.filter((id) => !donViCua.has(id))),
		dau: JSON.stringify({
			nguoi: c.people.map((n) => `${n.id}:${n.primaryDepartmentId}`).sort(),
			donVi: [...donVi].sort(),
		}),
	};
}

async function docKhiCayDungYen<T>(
	doc: () => Promise<T>,
	la: (c: CayToChuc) => LaTrongCay,
): Promise<{ ketQua: T; la: LaTrongCay }> {
	for (let lan = 1; ; lan += 1) {
		const truoc = la(await cay());
		const ketQua = await doc();
		const sau = la(await cay());
		if (truoc.dau === sau.dau || lan === LAN_DOC_CAY_DUNG_YEN) {
			expect(sau.dau, `cay to chuc doi trong ca ${lan} lan doc`).toBe(
				truoc.dau,
			);
			return { ketQua, la: truoc };
		}
	}
}

describe("do-phu", () => {
	test(
		"do-phu: E11 — ba bộ phận, năm phòng ban, hai ngày giờ Việt Nam qua thủ tục thật bằng đồng hồ tiêm, biên 23:59:59.999 và 00:00 VN, người chọn và người đã rời ngoài mẫu số, gốc 12/21, mọi vai đọc cùng bảng với bài thuần, quản trị không nhận danh sách người chưa góp",
		async () => {
			const truoc = await cay();
			const nguoiPhien = [
				phien.quan.nguoi,
				phien.thuong.nguoi,
				phien.chu.nguoi,
				phien.okr.nguoi,
			];
			expect(
				{
					nguoiPhienDuDu: nguoiPhien.every((id) =>
						truoc.people.some((n) => n.id === id),
					),
					nguoiPhienDaXep: truoc.people.filter(
						(n) => nguoiPhien.includes(n.id) && n.primaryDepartmentId !== null,
					).length,
				},
				"nguoi phien thieu hay da xep truoc khi gieo do phu",
			).toEqual({ nguoiPhienDuDu: true, nguoiPhienDaXep: 0 });
			const donVi = new Map<string, string>([
				[OKR_HOI_Y.doPhu.idGoc, OKR_HOI_Y.doPhu.idGoc],
				[OKR_HOI_Y.doPhu.idChuaXep, OKR_HOI_Y.doPhu.idChuaXep],
			]);
			for (const d of E11_DON_VI) {
				if (d.loai === "bo-phan")
					donVi.set(d.khoa, await bpMoi(`dp-${d.khoa}`));
				if (d.loai === "phong-ban")
					donVi.set(
						d.khoa,
						await pbMoi(`dp-${d.khoa}`, donVi.get(d.cha ?? "")),
					);
			}
			const idDonVi = (khoa: string) => donVi.get(khoa) ?? `thieu-${khoa}`;
			const nguoi = new Map<string, string>([
				["quan", phien.quan.nguoi],
				["thuong", phien.thuong.nguoi],
				["chu", phien.chu.nguoi],
				["okr", phien.okr.nguoi],
			]);
			const xep = async (userId: string, pb: string | null) =>
				pb === null
					? undefined
					: ok(await datViTri(userId, idDonVi(pb)), "xep vi tri");
			for (const n of E11_NGUOI) {
				const co = nguoi.get(n.khoa);
				if (co) await xep(co, n.pb);
				else {
					const moi = await nguoiCo(`dp-${n.khoa}`, "member");
					nguoi.set(n.khoa, moi.id);
					await xep(moi.id, n.pb);
				}
			}
			const nguoiChon = await nguoiCo(`dp-${E11_NGUOI_CHON.khoa}`, "admin");
			await xep(nguoiChon.id, E11_NGUOI_CHON.pb);
			const roi = await nguoiCo(`dp-${E11_NGUOI_ROI.khoa}`, "member");
			await xep(roi.id, E11_NGUOI_ROI.pb);
			nguoi.set(E11_NGUOI_ROI.khoa, roi.id);
			const idNguoi = (khoa: string) => nguoi.get(khoa) ?? `thieu-${khoa}`;

			datDongHo(E11_GIO_MO);
			const ky = await taoNam("do-phu", NAM_KE);
			const { id: h } = ok<{ id: string }>(
				await goi("okr.moHoiY", {
					cycleId: ky,
					cauHoi: CAU_HOI_MAC_DINH,
					loiMo: "",
					soLieu: SO_LIEU_MAC_DINH,
					hanLuc: sauGio(E11_GIO_MO, HAN.hopLe).toISOString(),
					nguoiChonUserId: nguoiChon.id,
				}),
				"mo hoi y do phu",
			);
			for (const g of E11_GOP) {
				datDongHo(g.luc);
				await gieoY(h, idNguoi(g.nguoi));
			}
			await roiDi(roi.id);
			datDongHo(E11_BAY_GIO);

			const lucCuaY = async (khoa: string) =>
				(
					await db.okrY.findFirstOrThrow({
						where: { hoiYId: h, tacGiaUserId: idNguoi(khoa) },
						orderBy: { createdAt: "asc" },
					})
				).createdAt.toISOString();
			expect([await lucCuaY("c2"), await lucCuaY("e1")]).toEqual([
				E11_NGAY_1_CUOI.toISOString(),
				E11_NGAY_2_DAU.toISOString(),
			]);

			const nguoiCua = new Set([...nguoi.values(), nguoiChon.id]);
			const donViCua = new Set(donVi.values());
			const laCua = (c: CayToChuc) => laTrongCay(c, nguoiCua, donViCua);
			const docBang = async (ai: string) =>
				hoiYDoPhuOutput.parse(
					ok(await goiQuery("okr.hoiYDoPhu", ai, { hoiYId: h }), "do phu"),
				);
			const {
				ketQua: { bang, vaiKhac },
				la,
			} = await docKhiCayDungYen(async () => {
				const bang = await docBang("quan");
				const vaiKhac = [];
				for (const ai of ["thuong", "okr", "chu", nguoiChon.cookie])
					vaiKhac.push(await docBang(ai));
				return { bang, vaiKhac };
			}, laCua);
			console.log(
				`do-phu: cây có ${la.tong} thành viên lạ (${la.chuaXep} chưa xếp) và ${la.donVi.size} đơn vị lạ của tệp khác`,
			);
			console.log(
				`do-phu: ${bang.hang.length} hàng × ${bang.cot.length} cột, gốc ${JSON.stringify(bang.hang[0]?.giaTri)}`,
			);
			expect({
				cot: bang.cot,
				hang: bang.hang
					.filter((d) => !la.donVi.has(d.id))
					.map(({ nhan: _nhan, ...con }) => con),
				donViLaCoGop: bang.hang
					.filter(
						(d) =>
							la.donVi.has(d.id) && d.giaTri.some((v) => v !== 0 && v !== null),
					)
					.map((d) => d.id),
			}).toEqual({
				cot: E11_COT,
				hang: e11KyVong(idDonVi, la),
				donViLaCoGop: [],
			});
			expect(bang.hang[0]?.nhan).toBe(OKR.tenGoc);
			expect(bang.hang.at(-1)?.nhan).toBe(OKR_HOI_Y.doPhu.nhanChuaXep);
			for (const khac of vaiKhac)
				expect(khac, "moi vai doc cung mot bang").toEqual(bang);

			const chuaGop = await tapChuaGop(h);
			expect(chuaGop.ma.has(nguoiChon.id)).toBe(true);
			expect(chuaGop.ma.size).toBeGreaterThan(1);
			const DOC_QUA: [string, string][] = [
				["quan", "quan"],
				["thuong", "thuong"],
				["okr", "okr"],
				["chu", "chu"],
				["nguoi-chon", nguoiChon.cookie],
			];
			const quet: ({ ai: string; thuTuc: ThuTucDoc } & KetQuaQuet)[] = [];
			for (const [ai, cookie] of DOC_QUA)
				for (const thuTuc of THU_TUC_DOC) {
					const tra = await goiQuery(
						thuTuc,
						cookie,
						KHUON_DOC[thuTuc].vao({ cycleId: ky, hoiYId: h }),
					);
					quet.push({ ai, thuTuc, ...quetChuaGop(tra.data, chuaGop) });
				}
			console.log(
				`do-phu: quét ${quet.length} phản hồi (${DOC_QUA.length} vai × ${THU_TUC_DOC.length} thủ tục đọc), khoá chuaGop ${quet.reduce((t, q) => t + q.khoaChuaGop, 0)}, mã người chưa góp trong mảng ${quet.reduce((t, q) => t + q.maChuaGop, 0)}, tên người chưa góp trong mảng ${quet.reduce((t, q) => t + q.tenChuaGop, 0)}`,
			);
			expect(quet.length).toBe(DOC_QUA.length * THU_TUC_DOC.length);
			expect(quet).toEqual(quet.map((q) => ({ ...q, ...KHONG_LO })));

			const hanLuc = sauGio(E11_GIO_MO, HAN.hopLe);
			for (const muon of [
				new Date(hanLuc.getTime() + 2 * OKR.thoiGian.gioMs),
				new Date(hanLuc.getTime() + 24 * OKR.thoiGian.gioMs * 10),
			]) {
				datDongHo(muon);
				const { ketQua: sauHan, la: laSauHan } = await docKhiCayDungYen(
					() => docBang("quan"),
					laCua,
				);
				const [ngay1 = 0, ngay2 = 0] =
					e11KyVong(idDonVi, laSauHan)[0]?.giaTri ?? [];
				expect(
					{
						cot: sauHan.cot.map((c) => c.ngay),
						goc: sauHan.hang[0]?.giaTri,
					},
					`doc sau han luc ${muon.toISOString()}`,
				).toEqual({
					cot: ["2026-11-02", "2026-11-03", "2026-11-04"],
					goc: [ngay1, ngay2, ngay2],
				});
			}
		},
		CHO_MA_TRAN_MS,
	);

	test("do-phu: máy quét bắt được khoá chuaGop, mã và tên người chưa góp trong mảng, bỏ qua mã đứng riêng", () => {
		const tap: TapChuaGop = {
			ma: new Set(["u-chua-gop"]),
			ten: new Set(["Lê Chưa Góp"]),
		};
		expect(quetChuaGop({ a: { chuaGop: ["u-chua-gop"] } }, tap)).toEqual({
			khoaChuaGop: 1,
			maChuaGop: 1,
			tenChuaGop: 0,
		});
		expect(quetChuaGop({ a: { ds: [{ ten: "Lê Chưa Góp" }] } }, tap)).toEqual({
			khoaChuaGop: 0,
			maChuaGop: 0,
			tenChuaGop: 1,
		});
		expect(quetChuaGop({ ds: ["u-chua-gop", "u-chua-gop"] }, tap)).toEqual({
			khoaChuaGop: 0,
			maChuaGop: 2,
			tenChuaGop: 0,
		});
		expect(
			quetChuaGop(
				{ nguoiChon: { id: "u-chua-gop", name: "Lê Chưa Góp" } },
				tap,
			),
		).toEqual(KHONG_LO);
		expect(quetChuaGop({ a: [{ b: 1 }] }, tap)).toEqual(KHONG_LO);
	});
});

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
		"mo-hoi-y: đóng sớm — Q đặt hạn đúng bằng giờ máy chủ qua hanLuc, và qua dongNgay (máy chủ tự lấy giờ): hạn = giờ tiêm, dang-gom, mỗi lần một vết sua-hoi-y; dongNgay kèm hanLuc 400; dongNgay khi đã gom 400 chiKhiDangMo; thành viên 403",
		async () => {
			datDongHo(LUC);
			const bang = await gieoHoiY();
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: bang.h, hanLuc: LUC.toISOString() },
					bang.nguoi.Q.cookie,
				),
				"han bang gio may chu",
			);
			const hangBang = await db.okrHoiY.findUniqueOrThrow({
				where: { id: bang.h },
			});
			expect({
				hanLuc: hangBang.hanLuc.toISOString(),
				trangThai: trangThaiHoiY(hangBang, dongHo()),
			}).toEqual({ hanLuc: LUC.toISOString(), trangThai: "dang-gom" });

			const g = await gieoHoiY();
			const truocHan = (
				await db.okrHoiY.findUniqueOrThrow({ where: { id: g.h } })
			).hanLuc.toISOString();
			const tDong = lechMs(LUC, KHUNG_DONG_MS);
			datDongHo(tDong);
			const thanhVien = await goi(
				"okr.suaHoiY",
				{ hoiYId: g.h, dongNgay: true },
				g.nguoi.T.cookie,
			);
			const kem = await goi(
				"okr.suaHoiY",
				{ hoiYId: g.h, dongNgay: true, hanLuc: tDong.toISOString() },
				g.nguoi.Q.cookie,
			);
			expect([
				{ maHttp: thanhVien.status, cau: thanhVien.loi },
				{ maHttp: kem.status, cau: kem.loi },
			]).toEqual([
				{ maHttp: 403, cau: T.chiQuanTri },
				{ maHttp: 400, cau: OKR_HOI_Y.dongNgay.motTrongHai },
			]);
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: g.h, dongNgay: true },
					g.nguoi.Q.cookie,
				),
				"dong ngay",
			);
			const dong = await db.okrHoiY.findUniqueOrThrow({ where: { id: g.h } });
			expect({
				hanLuc: dong.hanLuc.toISOString(),
				trangThai: trangThaiHoiY(dong, dongHo()),
			}).toEqual({ hanLuc: tDong.toISOString(), trangThai: "dang-gom" });
			datDongHo(lechMs(tDong, KHUNG_DONG_MS));
			const lanHai = await goi(
				"okr.suaHoiY",
				{ hoiYId: g.h, dongNgay: true },
				g.nguoi.Q.cookie,
			);
			expect({ maHttp: lanHai.status, cau: lanHai.loi }).toEqual({
				maHttp: 400,
				cau: T.chiKhiDangMo,
			});
			const vet = await db.okrTrail.findMany({
				where: { cycleId: g.ky, action: "sua-hoi-y" },
				select: { before: true, after: true },
			});
			expect(vet).toEqual([
				{
					before: { hanLuc: truocHan },
					after: { hanLuc: tDong.toISOString() },
				},
			]);
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
			const congBo = await gieoHoiY({ yCua: ["T"] });
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
const taoChuDeCua = (hoiYId: string, ten: string, cookie: string) =>
	goi("okr.taoChuDe", { hoiYId, ten }, cookie);
const suaChuDeCua = (chuDeId: string, ten: string, cookie: string) =>
	goi("okr.suaChuDe", { chuDeId, ten }, cookie);
const goChuDeCua = (chuDeId: string, cookie: string) =>
	goi("okr.goChuDe", { chuDeId }, cookie);
const ganYCua = (
	yIds: string[],
	dich: { chuDeId: string } | { yLa: true },
	cookie: string,
) => goi("okr.ganY", { yIds, ...dich }, cookie);
type KetLuanVao = {
	ketLuan: KetLuan;
	lyDo: string;
	cauMucTieu: string;
	noiBanTruoc: NoiBanTruoc | null;
};
const ketLuanCua = (chuDeId: string, vao: KetLuanVao, cookie: string) =>
	goi("okr.ketLuanChuDe", { chuDeId, ...vao }, cookie);
const LY_DO_MAU = "Đúng hướng năm tới của công ty, có người làm ngay.";
const CAU_MUC_TIEU_MAU = "Giao lạnh có lãi ở ba tỉnh";
const KET_LUAN_CHON_MAU: KetLuanVao = {
	ketLuan: "chon",
	lyDo: LY_DO_MAU,
	cauMucTieu: CAU_MUC_TIEU_MAU,
	noiBanTruoc: "cau-1",
};
const TEN_CHU_DE_MAU = "Giao lạnh";
async function gomVaKetLuan(
	hoiYId: string,
	yId: string,
	nguoi: { Q: Nguoi; P: Nguoi },
	ketLuan: KetLuanVao,
	ten: string = TEN_CHU_DE_MAU,
): Promise<string> {
	const { id } = ok<{ id: string }>(
		await taoChuDeCua(hoiYId, ten, nguoi.Q.cookie),
		"Q tao chu de",
	);
	ok(await ganYCua([yId], { chuDeId: id }, nguoi.Q.cookie), "Q gan y");
	ok(await ketLuanCua(id, ketLuan, nguoi.P.cookie), "P ket luan");
	return id;
}
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
			const congBo = await gieoHoiY({ yCua: ["T"] });
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
const SO_O_TEN_VA_SO = 108;
const SO_O_VIET_TRUOC = 54;
const TRANG_THAI_MA_TRAN = ["dang-mo", "dang-gom", "da-cong-bo"] as const;
const VAI_MA_TRAN = ["T", "O", "Q", "P"] as const;
const DUONG_MA_TRAN = ["trpc", "rest", "khoa-api"] as const;
const THU_TUC_DOC = ["okr.hoiY", "okr.hoiYNhan", "okr.hoiYDoPhu"] as const;
type VaiMaTran = (typeof VAI_MA_TRAN)[number];
type DuongMaTran = (typeof DUONG_MA_TRAN)[number];
type ThuTucDoc = (typeof THU_TUC_DOC)[number];
type DoiTuongDoc = { cycleId: string; hoiYId: string };
type VaoDoc = { cycleId: string } | { hoiYId: string };
const KHUON_DOC = {
	"okr.hoiY": {
		rest: "/okr/hoi-y",
		vao: (d: DoiTuongDoc): VaoDoc => ({ cycleId: d.cycleId }),
	},
	"okr.hoiYNhan": {
		rest: "/okr/hoi-y/nhan",
		vao: (d: DoiTuongDoc): VaoDoc => ({ cycleId: d.cycleId }),
	},
	"okr.hoiYDoPhu": {
		rest: "/okr/hoi-y/do-phu",
		vao: (d: DoiTuongDoc): VaoDoc => ({ hoiYId: d.hoiYId }),
	},
} as const satisfies {
	[K in ThuTucDoc]: { rest: string; vao: (d: DoiTuongDoc) => VaoDoc };
};

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
const DAY_DU_GOM: DemO = { ...DAY_DU, ten: 2, maA: 2, soDongY: 4 };
const DAY_DU_CONG_BO: DemO = { ...DAY_DU_GOM, maB: 2, soDongY: 6 };
type KyVongO = { [K in ThuTucDoc]: { [V in VaiMaTran]: DemO } };
const KHONG_TEN_KHONG_SO = {
	T: NHAN_NHE,
	O: NHAN_NHE,
	Q: NHAN_NHE,
	P: NHAN_NHE,
} as const;
const KY_VONG_O = {
	"okr.hoiY": { T: AN_TEN, O: AN_TEN, Q: DAY_DU, P: DAY_DU },
	"okr.hoiYNhan": KHONG_TEN_KHONG_SO,
	"okr.hoiYDoPhu": KHONG_TEN_KHONG_SO,
} as const satisfies KyVongO;
const KY_VONG_O_GOM = {
	"okr.hoiY": { T: AN_TEN, O: AN_TEN, Q: DAY_DU_GOM, P: DAY_DU_GOM },
	"okr.hoiYNhan": KHONG_TEN_KHONG_SO,
	"okr.hoiYDoPhu": KHONG_TEN_KHONG_SO,
} as const satisfies KyVongO;
const KY_VONG_O_CONG_BO = {
	"okr.hoiY": { T: AN_TEN, O: AN_TEN, Q: DAY_DU_CONG_BO, P: DAY_DU_CONG_BO },
	"okr.hoiYNhan": KHONG_TEN_KHONG_SO,
	"okr.hoiYDoPhu": KHONG_TEN_KHONG_SO,
} as const satisfies KyVongO;
const kyVongO = (trangThai: (typeof TRANG_THAI_MA_TRAN)[number]) =>
	trangThai === "dang-mo"
		? KY_VONG_O
		: trangThai === "dang-gom"
			? KY_VONG_O_GOM
			: KY_VONG_O_CONG_BO;

const docQuaDuong = (
	doiTuong: DoiTuongDoc,
	dau: { cookie: string; khoa: string },
	duong: DuongMaTran,
	thuTuc: ThuTucDoc,
): Promise<TraLoi> => {
	const khuon = KHUON_DOC[thuTuc];
	const vao = khuon.vao(doiTuong);
	const rest = `${khuon.rest}?${new URLSearchParams(vao).toString()}`;
	switch (duong) {
		case "trpc":
			return goiQuery(thuTuc, dau.cookie, vao);
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
	test("ten-va-so: thủ tục đọc của lần hỏi ý = thủ tục query trong generated/server.ts giao với THU_TUC_HOI_Y của vai «chỉ OKR» — bằng THU_TUC_DOC, thủ tục đọc mới không lọt ma trận", async () => {
		const nguon = await Bun.file(
			join(import.meta.dir, "..", "src", "generated", "server.ts"),
		).text();
		const truyVan = new Set(
			nguon.split(/\n(?=\s{4}\w+: publicProcedure)/).flatMap((khoi) => {
				const ten = /^\s+(\w+): publicProcedure/.exec(khoi)?.[1];
				return ten && khoi.includes(".query(") ? [`okr.${ten}`] : [];
			}),
		);
		const doc = Object.keys(THU_TUC_HOI_Y)
			.filter((t) => truyVan.has(t))
			.sort();
		expect(doc).toEqual(["okr.hoiY", "okr.hoiYDoPhu", "okr.hoiYNhan"]);
		expect(doc).toEqual([...THU_TUC_DOC].sort());
	});

	test(
		"ten-va-so: ma trận viết trước 3 trạng thái × 4 vai × 3 đường × 3 thủ tục đọc = 108 ô — T, O không thấy tên, mã người góp, số đồng ý; Q, P thấy; độ phủ và nhãn không tên ở mọi ô; bài in số ô",
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
			const chuaGop = await tapChuaGop(h);
			expect(
				[A.id, B.id].some((id) => chuaGop.ma.has(id)),
				"A, B da gop nen khong o tap chua gop",
			).toBe(false);
			expect(chuaGop.ma.size).toBeGreaterThan(3);
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
							dem: kyVongO(trangThai)[thuTuc][vai],
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
					{ cycleId: ky, hoiYId: h },
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
				if (thuTuc === "okr.hoiYNhan" || thuTuc === "okr.hoiYDoPhu") {
					(thuTuc === "okr.hoiYNhan" ? hoiYNhanOutput : hoiYDoPhuOutput).parse(
						tra.data,
					);
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
			const loChuaGop: string[] = [];
			let soQuet = 0;
			for (const trangThai of TRANG_THAI_MA_TRAN) {
				if (trangThai === "dang-gom") {
					await donHanVeBayGio({ h, nguoi });
					await gomVaKetLuan(h, y1, nguoi, {
						...KET_LUAN_CHON_MAU,
						noiBanTruoc: "cau-1",
					});
				}
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
					const quet = quetChuaGop(tra.data, chuaGop);
					soQuet += 1;
					if (JSON.stringify(quet) !== JSON.stringify(KHONG_LO))
						loChuaGop.push(
							`${k.trangThai} ${k.vai} ${k.duong} ${k.thuTuc}: ${JSON.stringify(quet)}`,
						);
					nhan.push({
						...k,
						maHttp: tra.status,
						dem: tra.status === 200 ? demCua(tra, k.thuTuc) : NHAN_NHE,
					});
				}
			}
			console.log(`ten-va-so: đã chạy ${nhan.length}/${KHAI.length} ô`);
			console.log(
				`ten-va-so: quét người chưa góp ${soQuet}/${KHAI.length} ô, ô lộ ${loChuaGop.length}`,
			);
			expect(soQuet, "so o quet nguoi chua gop").toBe(SO_O_TEN_VA_SO);
			expect(loChuaGop, "khoa, ma, ten nguoi chua gop lo o cac o").toEqual([]);
			expect(lo, "chuoi lo toi T, O").toEqual([]);
			expect(nhan.length, "so o ma tran E4").toBe(SO_O_TEN_VA_SO);
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
			await gieoBanTruoc(h, nguoi.P.id);
			for (let i = 0; i < SO_CHU_DE; i += 1) {
				const { id } = ok<{ id: string }>(
					await taoChuDeCua(h, `Chủ đề ${i + 1}`, nguoi.Q.cookie),
					`Q tao chu de ${i + 1}`,
				);
				if (i < DA_KET_LUAN)
					ok(
						await ketLuanCua(
							id,
							{
								ketLuan: "de-sau",
								lyDo: "Để kỳ sau khi đủ người làm.",
								cauMucTieu: "",
								noiBanTruoc: null,
							},
							nguoi.P.cookie,
						),
						`P ket luan ${i + 1}`,
					);
			}
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

	test(
		"ten-va-so: người chọn niêm phong rồi bị hạ về member và về «chỉ OKR» — dang-mo và dang-gom: hoiY không tên, không mã người góp, không số đồng ý, không tacGia, không mã chủ đề, chuDe null, lyDoChuaCongBo rỗng, không cờ chọn, gom, niêm phong; hoiYNhan không số chủ đề; bài in số ô",
		async () => {
			const VAI_HA = ["member", "okr"] as const;
			const TT_HA = ["dang-mo", "dang-gom"] as const;
			type ODoc = {
				vai: (typeof VAI_HA)[number];
				trangThai: (typeof TT_HA)[number];
				ten: number;
				maNguoiGop: number;
				soDongY: number;
				tacGia: number;
				maChuDe: number;
				soY: number;
				khoa: boolean;
				chuDe: HoiYOutput["chuDe"];
				lyDoChuaCongBo: HoiYOutput["quyen"]["lyDoChuaCongBo"];
				chonDuoc: boolean;
				gomDuoc: boolean;
				congBoDuoc: boolean;
				niemPhongDuoc: boolean;
				soChuDeChuaKetLuan: number | null;
			};
			const KHAI = VAI_HA.flatMap((vai) =>
				TT_HA.map(
					(trangThai): ODoc => ({
						vai,
						trangThai,
						ten: 0,
						maNguoiGop: 0,
						soDongY: 0,
						tacGia: 0,
						maChuDe: 0,
						soY: 2,
						khoa: false,
						chuDe: null,
						lyDoChuaCongBo: [],
						chonDuoc: false,
						gomDuoc: false,
						congBoDuoc: false,
						niemPhongDuoc: false,
						soChuDeChuaKetLuan: null,
					}),
				),
			);
			const nhan: ODoc[] = [];
			for (const vai of VAI_HA) {
				datDongHo(LUC);
				const g = await gieoHoiY();
				const { A, B, T: tv, O, P, Q } = g.nguoi;
				await db.user.update({ where: { id: A.id }, data: { name: TEN_A } });
				await db.user.update({ where: { id: B.id }, data: { name: TEN_B } });
				const y1 = (await gieoY(g.h, A.id, "Mở tuyến giao lạnh cho khách dược"))
					.id;
				const y2 = (
					await gieoY(g.h, B.id, "Giảm thời gian giao chặng cuối nội thành")
				).id;
				ok(await dongYCua(y1, tv.cookie), "T dong y Y1");
				ok(await dongYCua(y1, O.cookie), "O dong y Y1");
				await gieoBanTruoc(g.h, P.id);
				await doiVai(P.id, vai);
				let maChuDe = "khong-co-chu-de";
				for (const trangThai of TT_HA) {
					if (trangThai === "dang-gom") {
						await donHanVeBayGio(g);
						maChuDe = await chuDeMoiId(g.h, TEN_CHU_DE_MAU, Q.cookie);
						ok(
							await ganYCua([y1, y2], { chuDeId: maChuDe }, Q.cookie),
							"Q gan",
						);
					}
					const doc = await docHoiY(g.ky, P.cookie);
					const nhanP = nhanCua(
						await goiQuery("okr.hoiYNhan", P.cookie, { cycleId: g.ky }),
						"P hoiYNhan",
					);
					const chu = JSON.stringify(doc);
					nhan.push({
						vai,
						trangThai,
						ten: demChuoi(chu, TEN_A) + demChuoi(chu, TEN_B),
						maNguoiGop: demChuoi(chu, A.id) + demChuoi(chu, B.id),
						soDongY: demChuoi(chu, '"soDongY":'),
						tacGia: demChuoi(chu, '"tacGia":'),
						maChuDe: demChuoi(chu, maChuDe),
						soY: doc?.y.ds.length ?? -1,
						khoa: doc?.y.khoa ?? true,
						chuDe: doc?.chuDe ?? null,
						lyDoChuaCongBo: doc?.quyen.lyDoChuaCongBo ?? [],
						chonDuoc: doc?.quyen.chonDuoc ?? true,
						gomDuoc: doc?.quyen.gomDuoc ?? true,
						congBoDuoc: doc?.quyen.congBoDuoc ?? true,
						niemPhongDuoc: doc?.quyen.niemPhongDuoc ?? true,
						soChuDeChuaKetLuan: nhanP.soChuDeChuaKetLuan,
					});
				}
			}
			console.log(
				`ten-va-so: người chọn bị hạ vai — đã chạy ${nhan.length}/${KHAI.length} ô`,
			);
			expect(nhan).toEqual(KHAI);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ten-va-so: người chọn chưa niêm phong — còn là quản trị: khoá lý do chua-niem-phong, niemPhongDuoc true; bị hạ về member: khoá lý do het-quyen-chon, niemPhongDuoc false; niêm phong rồi: niemPhongDuoc false",
		async () => {
			datDongHo(LUC);
			const conQuyen = await gieoHoiY({ yCua: ["A"] });
			const haVai = await gieoHoiY({ yCua: ["A"] });
			const daNiem = await gieoHoiY({ yCua: ["A"], niemPhong: true });
			await doiVai(haVai.nguoi.P.id, "member");
			const doc = async (g: Awaited<ReturnType<typeof gieoHoiY>>) => {
				const d = await docHoiY(g.ky, g.nguoi.P.cookie);
				return {
					khoa: d?.y.khoa,
					lyDoKhoa: d?.y.lyDoKhoa,
					soY: d?.y.ds.length,
					niemPhongDuoc: d?.quyen.niemPhongDuoc,
				};
			};
			expect({
				conQuyen: await doc(conQuyen),
				haVai: await doc(haVai),
				daNiem: await doc(daNiem),
			}).toEqual({
				conQuyen: {
					khoa: true,
					lyDoKhoa: "chua-niem-phong",
					soY: 0,
					niemPhongDuoc: true,
				},
				haVai: {
					khoa: true,
					lyDoKhoa: "het-quyen-chon",
					soY: 0,
					niemPhongDuoc: false,
				},
				daNiem: {
					khoa: false,
					lyDoKhoa: null,
					soY: 1,
					niemPhongDuoc: false,
				},
			});
			const Q = await docHoiY(conQuyen.ky, conQuyen.nguoi.Q.cookie);
			expect(Q?.quyen.niemPhongDuoc).toBe(false);
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
const TRANG_THAI_VIET_TRUOC = ["dang-mo", "dang-gom"] as const;
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
				lyDoKhoa: "chua-niem-phong",
				banTruoc: null,
			});
			const docQ = await docHoiY(ky, nguoi.Q.cookie);
			expect({
				soY: docQ?.y.ds.length,
				khoa: docQ?.y.khoa,
				lyDoKhoa: docQ?.y.lyDoKhoa,
			}).toEqual({ soY: 3, khoa: false, lyDoKhoa: null });
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
				lyDoKhoa: null,
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
				{ ca: "P-bi-ha-vai", maHttp: 403, cau: T.nguoiChonPhaiQuanTri },
				{ ca: "P-da-roi", maHttp: 401, cau: "UNAUTHORIZED" },
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
					cau: OKR_HOI_Y.banTruoc.motTrongHai,
				},
				{
					ca: "khong-cau-khong-bo-qua",
					maHttp: 400,
					cau: OKR_HOI_Y.banTruoc.motTrongHai,
				},
			] as const satisfies readonly Ca[];

			const mo = await gieoHoiY();
			const haVai = await gieoHoiY();
			await doiVai(haVai.nguoi.P.id, "member");
			const daRoi = await gieoHoiY();
			await roiDi(daRoi.nguoi.P.id);
			const congBo = await gieoHoiY({ yCua: ["T"] });
			await donHanVeBayGio(congBo);
			await gieoCongBo(congBo.h);
			const { Q, T: tv, O, P } = mo.nguoi;
			const cauNgan = lapChu(OKR_HOI_Y.banTruoc.cau.min - 1);
			const CHAY = {
				"Q-quan-tri-khong-phai-nguoi-chon": () => niemPhongCua(mo.h, Q.cookie),
				"T-thanh-vien": () => niemPhongCua(mo.h, tv.cookie),
				"O-vai-chi-okr": () => niemPhongCua(mo.h, O.cookie),
				"P-bi-ha-vai": () => niemPhongCua(haVai.h, haVai.nguoi.P.cookie),
				"P-da-roi": () => niemPhongCua(daRoi.h, daRoi.nguoi.P.cookie),
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
		"ban-truoc: qua hạn vẫn niêm phong được — P đọc khoá (0 ý người khác, khoa true, chua-niem-phong), niêm phong bốn câu → 200, hàng đúng, P đọc thấy 3 ý kèm tên; đã công bố thì 400 daCongBo",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { ky, h, nguoi } = g;
			const { ids, ten } = await gieoBaYCuaNguoiKhac(g);
			await donHanVeBayGio(g);
			const truoc = await docHoiY(ky, nguoi.P.cookie);
			expect({
				trangThai: truoc?.trangThai,
				soY: truoc?.y.ds.length,
				khoa: truoc?.y.khoa,
				lyDoKhoa: truoc?.y.lyDoKhoa,
			}).toEqual({
				trangThai: "dang-gom",
				soY: 0,
				khoa: true,
				lyDoKhoa: "chua-niem-phong",
			});
			const { id } = ok<{ id: string }>(
				await niemPhongCua(h, nguoi.P.cookie),
				"P niem phong qua han",
			);
			const hang = await db.okrHoiYBanTruoc.findUniqueOrThrow({
				where: { hoiYId: h },
			});
			expect({
				id: hang.id,
				cau: hang.cau,
				boQua: hang.boQua,
				vietBoiUserId: hang.vietBoiUserId,
				niemPhongLuc: hang.niemPhongLuc.toISOString(),
			}).toEqual({
				id,
				cau: [...BAN_TRUOC_MAC_DINH],
				boQua: false,
				vietBoiUserId: nguoi.P.id,
				niemPhongLuc: dongHo().toISOString(),
			});
			const sau = await docHoiY(ky, nguoi.P.cookie);
			const thay = (sau?.y.ds ?? []).flatMap((y) =>
				"tacGia" in y ? [{ id: y.id, ten: y.tacGia.ten }] : [],
			);
			expect({
				khoa: sau?.y.khoa,
				lyDoKhoa: sau?.y.lyDoKhoa,
				idTen: thay.map((y) => y.id).sort(),
				ten: thay.map((y) => y.ten).sort(),
			}).toEqual({
				khoa: false,
				lyDoKhoa: null,
				idTen: [...ids].sort(),
				ten: [...ten].sort(),
			});
			await gieoCongBo(h);
			const daCongBo = await niemPhongCua(h, nguoi.P.cookie);
			expect({ maHttp: daCongBo.status, cau: daCongBo.loi }).toEqual({
				maHttp: 400,
				cau: T.daCongBo,
			});
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
		"ban-truoc: ma trận quét lộ 54 ô — dang-mo sau niêm phong và dang-gom sau khi P kết luận nối cau-1, cau-3, 3 vai (Q, T, O) × 3 đường × 3 thủ tục đọc khai ở THU_TUC_DOC: 0 câu viết trước trong phản hồi ở mọi ô, banTruoc null; sau công bố Q, T, O đọc đủ bốn câu qua cả ba đường; bài in số ô",
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
					{ cycleId: ky, hoiYId: h },
					{ cookie: nguoi[k.vai].cookie, khoa: khoa[k.vai] },
					k.duong,
					k.thuTuc,
				);
			const nhan: OKhai[] = [];
			const lo: string[] = [];
			let daGom = false;
			for (const k of KHAI) {
				if (k.trangThai === "dang-gom" && !daGom) {
					await donHanVeBayGio(g);
					const yA = await yCua(h, nguoi.A.id);
					const yB = await yCua(h, nguoi.B.id);
					await gomVaKetLuan(h, yA, nguoi, {
						...KET_LUAN_CHON_MAU,
						cauMucTieu: BAN_TRUOC_MAC_DINH[0] ?? "",
						noiBanTruoc: "cau-1",
					});
					await gomVaKetLuan(
						h,
						yB,
						nguoi,
						{ ...KET_LUAN_CHON_MAU, noiBanTruoc: "cau-3" },
						"Giao nhanh chặng cuối",
					);
					daGom = true;
				}
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
			expect(nhan.length, "so o ma tran E5").toBe(SO_O_VIET_TRUOC);
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
					{ cycleId: ky, hoiYId: h },
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

const KHUNG_GOM_MS = 1_000;
const tGom = (buoc: number) => lechMs(LUC, KHUNG_GOM_MS * (buoc + 1));

async function gieoGom(
	opts: {
		yCua?: (keyof Awaited<ReturnType<typeof gieoHoiY>>["nguoi"])[];
		niemPhong?: boolean;
		noiDung?: string[];
	} = {},
) {
	datDongHo(LUC);
	const g = await gieoHoiY();
	const y: string[] = [];
	for (const [i, ai] of (opts.yCua ?? []).entries()) {
		datDongHo(lechMs(LUC, i * MOT_MS));
		y.push(
			(
				await gieoY(
					g.h,
					g.nguoi[ai].id,
					opts.noiDung?.[i] ?? `Ý số ${i + 1} cho mục tiêu năm tới`,
				)
			).id,
		);
	}
	datDongHo(tGom(0));
	if (opts.niemPhong !== false) await gieoBanTruoc(g.h, g.nguoi.P.id);
	await donHanVeBayGio(g);
	return { ...g, y };
}

const vanTayGom = async (hoiYIds: string[]) =>
	JSON.stringify({
		chuDe: await db.okrChuDe.findMany({
			where: { hoiYId: { in: hoiYIds } },
			orderBy: { id: "asc" },
		}),
		y: await db.okrY.findMany({
			where: { hoiYId: { in: hoiYIds } },
			orderBy: { id: "asc" },
			select: { id: true, chuDeId: true, ganLuc: true },
		}),
	});

const chuDeMoiId = async (
	hoiYId: string,
	ten: string,
	cookie: string,
): Promise<string> =>
	ok<{ id: string }>(await taoChuDeCua(hoiYId, ten, cookie), `tao ${ten}`).id;

const hangChuDe = (id: string) =>
	db.okrChuDe.findUniqueOrThrow({
		where: { id },
		select: {
			hoiYId: true,
			loai: true,
			ten: true,
			viTri: true,
			ketLuan: true,
			lyDo: true,
			cauMucTieu: true,
			noiBanTruoc: true,
			objectiveId: true,
			createdAt: true,
		},
	});

const hangY = async (id: string) => {
	const y = await db.okrY.findUniqueOrThrow({
		where: { id },
		select: { chuDeId: true, ganLuc: true },
	});
	return { chuDeId: y.chuDeId, ganLuc: y.ganLuc?.toISOString() ?? null };
};

describe("gom", () => {
	test(
		"gom: chuỗi E6 — Q tạo, đổi tên, gắn ba ý, ý lạ cắt vừa trần tên chủ đề, P chuyển ý sang chủ đề khác, gắn lại cùng chủ đề không đổi ganLuc, tạo rồi gỡ chủ đề rỗng; ganLuc là giờ tiêm; không vết",
		async () => {
			const dau = "b".repeat(OKR_HOI_Y.tenChuDe.max - 1);
			const g = await gieoGom({
				yCua: ["A", "B", "R", "T", "O", "Q"],
				noiDung: [
					"Ý số 1 cho mục tiêu năm tới",
					"Ý số 2 cho mục tiêu năm tới",
					"Ý số 3 cho mục tiêu năm tới",
					`${dau}😀 phần đuôi của ý lạ`,
				],
			});
			const { ky, h, nguoi, y } = g;
			const [y1, y2, y3, y4, y5, y6] = y;
			if (!y1 || !y2 || !y3 || !y4 || !y5 || !y6)
				throw new Error("thieu y gieo");
			const soVetTruoc = await db.okrTrail.count({ where: { cycleId: ky } });

			datDongHo(tGom(1));
			const c1 = await chuDeMoiId(h, "Giao lạnh", nguoi.Q.cookie);
			expect(await hangChuDe(c1)).toEqual({
				hoiYId: h,
				loai: "chu-de",
				ten: "Giao lạnh",
				viTri: 0,
				ketLuan: null,
				lyDo: "",
				cauMucTieu: "",
				noiBanTruoc: null,
				objectiveId: null,
				createdAt: tGom(1),
			});

			datDongHo(tGom(2));
			ok(
				await suaChuDeCua(c1, "Giao lạnh cho dược", nguoi.Q.cookie),
				"Q sua ten",
			);
			expect((await hangChuDe(c1)).ten).toBe("Giao lạnh cho dược");

			datDongHo(tGom(3));
			ok(
				await ganYCua([y1, y2, y3], { chuDeId: c1 }, nguoi.Q.cookie),
				"Q gan ba y",
			);
			expect(await Promise.all([y1, y2, y3, y4].map(hangY))).toEqual([
				{ chuDeId: c1, ganLuc: tGom(3).toISOString() },
				{ chuDeId: c1, ganLuc: tGom(3).toISOString() },
				{ chuDeId: c1, ganLuc: tGom(3).toISOString() },
				{ chuDeId: null, ganLuc: null },
			]);

			datDongHo(tGom(4));
			const c2 = ok<{ id: string }>(
				await ganYCua([y4], { yLa: true }, nguoi.Q.cookie),
				"Q danh dau y la",
			).id;
			const hangYLa = await hangChuDe(c2);
			expect({
				loai: hangYLa.loai,
				ten: hangYLa.ten,
				viTri: hangYLa.viTri,
				soY: await db.okrY.count({ where: { chuDeId: c2 } }),
			}).toEqual({
				loai: "y-la",
				ten: dau,
				viTri: 1,
				soY: 1,
			});
			expect(await hangY(y4)).toEqual({
				chuDeId: c2,
				ganLuc: tGom(4).toISOString(),
			});
			const lanHaiYLa = ok<{ id: string }>(
				await ganYCua([y4], { yLa: true }, nguoi.Q.cookie),
				"Q danh dau y la lan hai",
			).id;
			expect({
				id: lanHaiYLa,
				soChuDe: await db.okrChuDe.count({ where: { hoiYId: h } }),
			}).toEqual({ id: c2, soChuDe: 2 });

			datDongHo(tGom(5));
			const c3 = await chuDeMoiId(h, "Kho miền Trung", nguoi.Q.cookie);
			expect((await hangChuDe(c3)).viTri).toBe(2);
			datDongHo(tGom(6));
			ok(await ganYCua([y3], { chuDeId: c3 }, nguoi.P.cookie), "P chuyen y3");
			expect(await Promise.all([y1, y2, y3].map(hangY))).toEqual([
				{ chuDeId: c1, ganLuc: tGom(3).toISOString() },
				{ chuDeId: c1, ganLuc: tGom(3).toISOString() },
				{ chuDeId: c3, ganLuc: tGom(6).toISOString() },
			]);
			datDongHo(tGom(7));
			ok(await ganYCua([y1], { chuDeId: c1 }, nguoi.P.cookie), "P gan lai y1");
			expect((await hangY(y1)).ganLuc).toBe(tGom(3).toISOString());

			const tam = await chuDeMoiId(h, "Chủ đề tạm", nguoi.Q.cookie);
			expect(await db.okrChuDe.count({ where: { hoiYId: h } })).toBe(4);
			ok(await goChuDeCua(tam, nguoi.Q.cookie), "Q go chu de rong");
			expect(await db.okrChuDe.findUnique({ where: { id: tam } })).toBeNull();
			expect(await db.okrChuDe.count({ where: { hoiYId: h } })).toBe(3);

			expect(await db.okrTrail.count({ where: { cycleId: ky } })).toBe(
				soVetTruoc,
			);

			const docP = await docHoiY(ky, nguoi.P.cookie);
			expect(
				docP?.chuDe?.map((c) => ({
					id: c.id,
					loai: c.loai,
					y: c.y.map((x) => x.id).sort(),
					soNguoi: c.bangChung.soNguoi,
					soDongY: c.bangChung.soDongY,
				})),
			).toEqual([
				{
					id: c1,
					loai: "chu-de",
					y: [y1, y2].sort(),
					soNguoi: 2,
					soDongY: 0,
				},
				{ id: c2, loai: "y-la", y: [y4], soNguoi: 1, soDongY: 0 },
				{ id: c3, loai: "chu-de", y: [y3], soNguoi: 1, soDongY: 0 },
			]);
			expect(docP?.quyen).toMatchObject({ gomDuoc: true, chonDuoc: true });
		},
		CHO_MS,
	);

	test(
		"gom: 27 ca từ chối — mã HTTP và câu ghim khớp bảng khai; bảng chủ đề, chuDeId, ganLuc và vết không đổi ở mọi ca",
		async () => {
			const KHAI = [
				{ ca: "Q-tao-khi-con-mo", maHttp: 400, cau: T.chuaHetHan },
				{ ca: "Q-gan-y-la-khi-con-mo", maHttp: 400, cau: T.chuaHetHan },
				{ ca: "T-tao", maHttp: 403, cau: T.chiGom },
				{ ca: "O-tao", maHttp: 403, cau: T.chiGom },
				{ ca: "T-sua", maHttp: 403, cau: T.chiGom },
				{ ca: "O-go", maHttp: 403, cau: T.chiGom },
				{ ca: "T-gan", maHttp: 403, cau: T.chiGom },
				{ ca: "O-gan-y-la", maHttp: 403, cau: T.chiGom },
				{ ca: "go-chu-de-con-y", maHttp: 400, cau: T.chuDeConY },
				{ ca: "gan-vao-chu-de-y-la", maHttp: 400, cau: T.chuDeYLa },
				{ ca: "gan-y-cua-hoi-y-khac", maHttp: 400, cau: T.yKhacHoiY },
				{ ca: "gan-y-khong-co", maHttp: 404, cau: T.khongCoY("khong-co") },
				{
					ca: "gan-chu-de-khong-co",
					maHttp: 404,
					cau: T.khongCoChuDe("khong-co"),
				},
				{
					ca: "tao-hoi-y-khong-co",
					maHttp: 404,
					cau: T.khongCoHoiY("khong-co"),
				},
				{
					ca: "ten-mot-ky-tu",
					maHttp: 400,
					cau: `ten: Too small: expected string to have >=${OKR_HOI_Y.tenChuDe.min} characters`,
				},
				{ ca: "gan-hai-dich", maHttp: 400, cau: OKR_HOI_Y.gan.motTrongHai },
				{ ca: "gan-y-la-hai-y", maHttp: 400, cau: OKR_HOI_Y.gan.yLaMotY },
				{ ca: "sua-chu-de-y-la", maHttp: 400, cau: T.yLaKhongDoiTen },
				{
					ca: "P-chua-niem-phong-tao",
					maHttp: 400,
					cau: T.nguoiChonChuaNiemPhong,
				},
				{
					ca: "P-chua-niem-phong-sua",
					maHttp: 400,
					cau: T.nguoiChonChuaNiemPhong,
				},
				{
					ca: "P-chua-niem-phong-go",
					maHttp: 400,
					cau: T.nguoiChonChuaNiemPhong,
				},
				{
					ca: "P-chua-niem-phong-gan",
					maHttp: 400,
					cau: T.nguoiChonChuaNiemPhong,
				},
				{ ca: "P-ha-vai-tao", maHttp: 403, cau: T.nguoiChonPhaiQuanTri },
				{ ca: "sau-cong-bo-tao", maHttp: 400, cau: T.daCongBo },
				{ ca: "sau-cong-bo-sua", maHttp: 400, cau: T.daCongBo },
				{ ca: "sau-cong-bo-go", maHttp: 400, cau: T.daCongBo },
				{ ca: "sau-cong-bo-gan", maHttp: 400, cau: T.daCongBo },
			] as const satisfies readonly Ca[];

			datDongHo(LUC);
			const mo = await gieoHoiY({ yCua: ["A"], niemPhong: true });
			const yMo = await yCua(mo.h, mo.nguoi.A.id);
			const gom = await gieoGom({ yCua: ["A", "B", "R"] });
			const [yGom0, yGom1, yGom2] = gom.y;
			if (!yGom0 || !yGom1 || !yGom2) throw new Error("thieu y gom");
			const { Q } = gom.nguoi;
			const cCoY = await chuDeMoiId(gom.h, "Có ý", Q.cookie);
			ok(await ganYCua([yGom0], { chuDeId: cCoY }, Q.cookie), "gan y vao cCoY");
			const cRong = await chuDeMoiId(gom.h, "Rỗng", Q.cookie);
			const cYLa = ok<{ id: string }>(
				await ganYCua([yGom1], { yLa: true }, Q.cookie),
				"gan y la",
			).id;
			const chua = await gieoGom({ yCua: ["A"], niemPhong: false });
			const yChua = await yCua(chua.h, chua.nguoi.A.id);
			const cChua = await chuDeMoiId(
				chua.h,
				"Chưa niêm phong",
				chua.nguoi.Q.cookie,
			);
			const haVai = await gieoGom({ yCua: ["A"] });
			await doiVai(haVai.nguoi.P.id, "member");
			const congBo = await gieoGom({ yCua: ["A"] });
			const yCongBo = await yCua(congBo.h, congBo.nguoi.A.id);
			const cCongBo = await chuDeMoiId(
				congBo.h,
				"Đã công bố",
				congBo.nguoi.Q.cookie,
			);
			ok(
				await ganYCua([yCongBo], { chuDeId: cCongBo }, congBo.nguoi.Q.cookie),
				"gan y vao chu de truoc cong bo",
			);
			await gieoCongBo(congBo.h);
			const HOI_Y = [mo.h, gom.h, chua.h, haVai.h, congBo.h];
			const { T: tv, O } = gom.nguoi;

			const CHAY = {
				"Q-tao-khi-con-mo": () =>
					taoChuDeCua(mo.h, "Giao lạnh", mo.nguoi.Q.cookie),
				"Q-gan-y-la-khi-con-mo": () =>
					ganYCua([yMo], { yLa: true }, mo.nguoi.Q.cookie),
				"T-tao": () => taoChuDeCua(gom.h, "Giao lạnh", tv.cookie),
				"O-tao": () => taoChuDeCua(gom.h, "Giao lạnh", O.cookie),
				"T-sua": () => suaChuDeCua(cRong, "Đổi tên", tv.cookie),
				"O-go": () => goChuDeCua(cRong, O.cookie),
				"T-gan": () => ganYCua([yGom2], { chuDeId: cRong }, tv.cookie),
				"O-gan-y-la": () => ganYCua([yGom2], { yLa: true }, O.cookie),
				"go-chu-de-con-y": () => goChuDeCua(cCoY, Q.cookie),
				"gan-vao-chu-de-y-la": () =>
					ganYCua([yGom2], { chuDeId: cYLa }, Q.cookie),
				"gan-y-cua-hoi-y-khac": () =>
					ganYCua([yMo], { chuDeId: cRong }, Q.cookie),
				"gan-y-khong-co": () =>
					ganYCua(["khong-co"], { chuDeId: cRong }, Q.cookie),
				"gan-chu-de-khong-co": () =>
					ganYCua([yGom2], { chuDeId: "khong-co" }, Q.cookie),
				"tao-hoi-y-khong-co": () =>
					taoChuDeCua("khong-co", "Giao lạnh", Q.cookie),
				"ten-mot-ky-tu": () =>
					taoChuDeCua(gom.h, "x".repeat(OKR_HOI_Y.tenChuDe.min - 1), Q.cookie),
				"gan-hai-dich": () =>
					goi(
						"okr.ganY",
						{ yIds: [yGom2], chuDeId: cRong, yLa: true },
						Q.cookie,
					),
				"sua-chu-de-y-la": () => suaChuDeCua(cYLa, "Đổi tên ý lạ", Q.cookie),
				"gan-y-la-hai-y": () =>
					goi("okr.ganY", { yIds: [yGom2, yGom0], yLa: true }, Q.cookie),
				"P-chua-niem-phong-tao": () =>
					taoChuDeCua(chua.h, "Giao lạnh", chua.nguoi.P.cookie),
				"P-chua-niem-phong-sua": () =>
					suaChuDeCua(cChua, "Đổi tên", chua.nguoi.P.cookie),
				"P-chua-niem-phong-go": () => goChuDeCua(cChua, chua.nguoi.P.cookie),
				"P-chua-niem-phong-gan": () =>
					ganYCua([yChua], { chuDeId: cChua }, chua.nguoi.P.cookie),
				"P-ha-vai-tao": () =>
					taoChuDeCua(haVai.h, "Giao lạnh", haVai.nguoi.P.cookie),
				"sau-cong-bo-tao": () =>
					taoChuDeCua(congBo.h, "Giao lạnh", congBo.nguoi.Q.cookie),
				"sau-cong-bo-sua": () =>
					suaChuDeCua(cCongBo, "Đổi tên", congBo.nguoi.Q.cookie),
				"sau-cong-bo-go": () => goChuDeCua(cCongBo, congBo.nguoi.Q.cookie),
				"sau-cong-bo-gan": () =>
					ganYCua([yCongBo], { chuDeId: cCongBo }, congBo.nguoi.Q.cookie),
			} satisfies { [K in (typeof KHAI)[number]["ca"]]: () => Promise<TraLoi> };

			const BANG: Bang[] = ["okrChuDe", "okrTrail"];
			const nhan: (KetQua & { vanTayDoi: boolean })[] = [];
			for (const khai of KHAI) {
				const truoc = await Promise.all(BANG.map(dem));
				const vanTruoc = await vanTayGom(HOI_Y);
				const tra = await CHAY[khai.ca]();
				const sau = await Promise.all(BANG.map(dem));
				nhan.push({
					ca: khai.ca,
					maHttp: tra.status,
					cau: tra.loi.includes(khai.cau) ? khai.cau : tra.loi,
					doi: Object.fromEntries(
						BANG.map((b, i) => [b, (sau[i] ?? 0) - (truoc[i] ?? 0)]),
					),
					vanTayDoi: vanTruoc !== (await vanTayGom(HOI_Y)),
				});
			}
			expect(nhan).toEqual(
				KHAI.map((k) => ({
					...k,
					doi: { okrChuDe: 0, okrTrail: 0 },
					vanTayDoi: false,
				})),
			);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"gom: ý lạ duy nhất chuyển sang chủ đề thường thì chủ đề ý lạ rỗng bị xoá cùng giao dịch; chuyển giữa hai chủ đề thường không xoá chủ đề nào; đánh dấu ý lạ lần hai không tạo thêm",
		async () => {
			const g = await gieoGom({ yCua: ["A", "B"] });
			const { h, nguoi, y } = g;
			const [yA, yB] = y;
			if (!yA || !yB) throw new Error("thieu y");
			const { Q } = nguoi;
			const c1 = await chuDeMoiId(h, "Giao lạnh", Q.cookie);
			const c2 = await chuDeMoiId(h, "Kho miền Trung", Q.cookie);
			ok(await ganYCua([yB], { chuDeId: c1 }, Q.cookie), "gan yB vao c1");
			const yLa = ok<{ id: string }>(
				await ganYCua([yA], { yLa: true }, Q.cookie),
				"yA thanh y la",
			).id;
			const soChuDe = () => db.okrChuDe.count({ where: { hoiYId: h } });
			expect(await soChuDe()).toBe(3);
			ok(await ganYCua([yB], { chuDeId: c2 }, Q.cookie), "chuyen yB sang c2");
			expect({
				soChuDe: await soChuDe(),
				c1: (await db.okrChuDe.findUnique({ where: { id: c1 } }))?.id,
			}).toEqual({ soChuDe: 3, c1 });
			ok(await ganYCua([yA], { chuDeId: c1 }, Q.cookie), "yA sang c1");
			expect({
				soChuDe: await soChuDe(),
				yLaCon: await db.okrChuDe.findUnique({ where: { id: yLa } }),
				yA: (await hangY(yA)).chuDeId,
			}).toEqual({ soChuDe: 2, yLaCon: null, yA: c1 });
		},
		CHO_MS,
	);

	test(
		"gom: ca đua — hai Q tạo chủ đề song song → viTri khác nhau và liền nhau (khoá hàng hỏi ý)",
		async () => {
			const g = await gieoGom();
			const [mot, hai] = await Promise.all([
				taoChuDeCua(g.h, "Chủ đề một", g.nguoi.Q.cookie),
				taoChuDeCua(g.h, "Chủ đề hai", g.nguoi.Q.cookie),
			]);
			expect([mot.status, hai.status]).toEqual([200, 200]);
			expect(
				(
					await db.okrChuDe.findMany({
						where: { hoiYId: g.h },
						select: { viTri: true },
						orderBy: { viTri: "asc" },
					})
				).map((c) => c.viTri),
			).toEqual([0, 1]);
		},
		CHO_MS,
	);

	test(
		"gom: quản trị khác gom được cả khi P chưa niêm phong; cờ quyen của P chưa niêm phong: gomDuoc false, chonDuoc false; của Q: gomDuoc true, chonDuoc false",
		async () => {
			const g = await gieoGom({ yCua: ["A"], niemPhong: false });
			const { ky, h, nguoi, y } = g;
			const yA = y[0];
			if (!yA) throw new Error("thieu y");
			const c = await chuDeMoiId(
				h,
				"Q gom khi P chưa niêm phong",
				nguoi.Q.cookie,
			);
			ok(await ganYCua([yA], { chuDeId: c }, nguoi.Q.cookie), "Q gan y");
			expect(await hangY(yA)).toMatchObject({ chuDeId: c });
			const quyenCua = async (ai: Nguoi) =>
				(await docHoiY(ky, ai.cookie))?.quyen;
			expect(await quyenCua(nguoi.P)).toMatchObject({
				gomDuoc: false,
				chonDuoc: false,
			});
			expect(await quyenCua(nguoi.Q)).toMatchObject({
				gomDuoc: true,
				chonDuoc: false,
			});
			expect((await docHoiY(ky, nguoi.P.cookie))?.chuDe).toBeNull();
			await gieoBanTruoc(h, nguoi.P.id);
			expect(await quyenCua(nguoi.P)).toMatchObject({
				gomDuoc: true,
				chonDuoc: true,
			});
		},
		CHO_MS,
	);

	test(
		"gom: ma trận thành viên — T, O × 3 đường × okr.hoiY: dang-gom chuDe null và mọi chuDeId null (đếm ý đã kiểm > 0); da-cong-bo chuDe có, chuDeId thật; Q, P thấy chủ đề ở dang-gom; bài in số ô",
		async () => {
			const g = await gieoGom({ yCua: ["A", "B", "R"] });
			const { ky, h, nguoi, y } = g;
			const [yA, yB] = y;
			if (!yA || !yB) throw new Error("thieu y");
			const c = await gomVaKetLuan(h, yA, nguoi, KET_LUAN_CHON_MAU);
			ok(await ganYCua([yB], { chuDeId: c }, nguoi.Q.cookie), "gan them y");
			const khoa = { T: "", O: "" };
			khoa.T = await khoaApiCua(nguoi.T.id);
			khoa.O = await khoaApiCua(nguoi.O.id);
			const VAI = ["T", "O"] as const;
			const TRANG_THAI_THANH_VIEN = ["dang-gom", "da-cong-bo"] as const;
			const SO_O =
				TRANG_THAI_THANH_VIEN.length * VAI.length * DUONG_MA_TRAN.length;
			type Cell = {
				trangThai: string;
				vai: (typeof VAI)[number];
				duong: DuongMaTran;
				maHttp: number;
				chuDeNull: boolean;
				yDaKiem: number;
				chuDeIdKhacNull: number;
				chuoiLoChuDe: number;
			};
			const doc = async (
				trangThai: string,
				vai: (typeof VAI)[number],
				duong: DuongMaTran,
			): Promise<Cell> => {
				const tra = await docQuaDuong(
					{ cycleId: ky, hoiYId: h },
					{ cookie: nguoi[vai].cookie, khoa: khoa[vai] },
					duong,
					"okr.hoiY",
				);
				const d = hoiYDocOutput.parse(tra.data);
				const chu = JSON.stringify(tra.data);
				return {
					trangThai,
					vai,
					duong,
					maHttp: tra.status,
					chuDeNull: d?.chuDe === null,
					yDaKiem: d?.y.ds.length ?? 0,
					chuDeIdKhacNull: (d?.y.ds ?? []).filter((x) => x.chuDeId !== null)
						.length,
					chuoiLoChuDe: demChuoi(chu, c) + demChuoi(chu, TEN_CHU_DE_MAU),
				};
			};
			const cells: Cell[] = [];
			for (const vai of VAI)
				for (const duong of DUONG_MA_TRAN)
					cells.push(await doc("dang-gom", vai, duong));
			expect(cells).toEqual(
				VAI.flatMap((vai) =>
					DUONG_MA_TRAN.map((duong) => ({
						trangThai: "dang-gom",
						vai,
						duong,
						maHttp: 200,
						chuDeNull: true,
						yDaKiem: 3,
						chuDeIdKhacNull: 0,
						chuoiLoChuDe: 0,
					})),
				),
			);
			for (const vai of ["Q", "P"] as const) {
				const d = await docHoiY(ky, nguoi[vai].cookie);
				expect({
					chuDe: d?.chuDe?.map((x) => x.id),
					chuDeId: d?.y.ds.filter((x) => x.chuDeId === c).length,
				}).toEqual({ chuDe: [c], chuDeId: 2 });
			}

			await gieoCongBo(h);
			const sau: Cell[] = [];
			for (const vai of VAI)
				for (const duong of DUONG_MA_TRAN)
					sau.push(await doc("da-cong-bo", vai, duong));
			expect(
				sau.map((x) => ({
					vai: x.vai,
					duong: x.duong,
					maHttp: x.maHttp,
					chuDeNull: x.chuDeNull,
					chuDeIdKhacNull: x.chuDeIdKhacNull,
				})),
			).toEqual(
				VAI.flatMap((vai) =>
					DUONG_MA_TRAN.map((duong) => ({
						vai,
						duong,
						maHttp: 200,
						chuDeNull: false,
						chuDeIdKhacNull: 3,
					})),
				),
			);
			console.log(
				`gom: đã chạy ${cells.length + sau.length}/${SO_O} ô thành viên`,
			);
			expect(cells.length + sau.length).toBe(SO_O);
		},
		CHO_MA_TRAN_MS,
	);
});

describe("ket-luan", () => {
	test(
		"ket-luan: P kết luận K1 chọn cau-1, K5 chọn moi, K2 để sau, K3 đã có — DB và okr.hoiY đọc lại đúng; K4 chưa kết luận trả lyDo và cauMucTieu rỗng; chủ đề không chọn dọn câu mục tiêu và nối; kết luận lại ghi đè; không vết",
		async () => {
			const g = await gieoGom({ yCua: ["A"] });
			const { ky, h, nguoi } = g;
			const soVetTruoc = await db.okrTrail.count({ where: { cycleId: ky } });
			const ids: string[] = [];
			for (let i = 1; i <= 5; i += 1)
				ids.push(await chuDeMoiId(h, `Chủ đề K${i}`, nguoi.Q.cookie));
			const [k1, k2, k3, k4, k5] = ids;
			if (!k1 || !k2 || !k3 || !k4 || !k5) throw new Error("thieu chu de");
			const { P } = nguoi;
			const docKetLuan = async (id: string) => {
				const r = await db.okrChuDe.findUniqueOrThrow({ where: { id } });
				return {
					ketLuan: r.ketLuan,
					lyDo: r.lyDo,
					cauMucTieu: r.cauMucTieu,
					noiBanTruoc: r.noiBanTruoc,
				};
			};

			ok(await ketLuanCua(k1, KET_LUAN_CHON_MAU, P.cookie), "K1");
			ok(
				await ketLuanCua(
					k5,
					{ ...KET_LUAN_CHON_MAU, noiBanTruoc: "moi" },
					P.cookie,
				),
				"K5",
			);
			ok(
				await ketLuanCua(
					k2,
					{
						ketLuan: "de-sau",
						lyDo: LY_DO_MAU,
						cauMucTieu: "Gõ nhầm câu mục tiêu",
						noiBanTruoc: "cau-2",
					},
					P.cookie,
				),
				"K2",
			);
			ok(
				await ketLuanCua(
					k3,
					{
						ketLuan: "da-co",
						lyDo: "Đã có trong kế hoạch của phòng vận hành.",
						cauMucTieu: "",
						noiBanTruoc: null,
					},
					P.cookie,
				),
				"K3",
			);

			expect(await docKetLuan(k1)).toEqual({
				ketLuan: "chon",
				lyDo: LY_DO_MAU,
				cauMucTieu: CAU_MUC_TIEU_MAU,
				noiBanTruoc: "cau-1",
			});
			expect(await docKetLuan(k5)).toEqual({
				ketLuan: "chon",
				lyDo: LY_DO_MAU,
				cauMucTieu: CAU_MUC_TIEU_MAU,
				noiBanTruoc: "moi",
			});
			expect(await docKetLuan(k2)).toEqual({
				ketLuan: "de-sau",
				lyDo: LY_DO_MAU,
				cauMucTieu: "",
				noiBanTruoc: null,
			});
			expect(await docKetLuan(k3)).toEqual({
				ketLuan: "da-co",
				lyDo: "Đã có trong kế hoạch của phòng vận hành.",
				cauMucTieu: "",
				noiBanTruoc: null,
			});
			expect(await docKetLuan(k4)).toEqual({
				ketLuan: null,
				lyDo: "",
				cauMucTieu: "",
				noiBanTruoc: null,
			});

			const doc = await docHoiY(ky, P.cookie);
			const theoId = (id: string) => doc?.chuDe?.find((c) => c.id === id);
			expect(
				[k1, k2, k3, k4, k5].map((id) => {
					const c = theoId(id);
					return {
						ketLuan: c?.ketLuan,
						lyDo: c?.lyDo,
						cauMucTieu: c?.cauMucTieu,
						noiBanTruoc: c?.noiBanTruoc,
					};
				}),
			).toEqual([
				{
					ketLuan: "chon",
					lyDo: LY_DO_MAU,
					cauMucTieu: CAU_MUC_TIEU_MAU,
					noiBanTruoc: "cau-1",
				},
				{
					ketLuan: "de-sau",
					lyDo: LY_DO_MAU,
					cauMucTieu: "",
					noiBanTruoc: null,
				},
				{
					ketLuan: "da-co",
					lyDo: "Đã có trong kế hoạch của phòng vận hành.",
					cauMucTieu: "",
					noiBanTruoc: null,
				},
				{ ketLuan: null, lyDo: "", cauMucTieu: "", noiBanTruoc: null },
				{
					ketLuan: "chon",
					lyDo: LY_DO_MAU,
					cauMucTieu: CAU_MUC_TIEU_MAU,
					noiBanTruoc: "moi",
				},
			]);

			ok(
				await ketLuanCua(
					k1,
					{
						ketLuan: "khong-lam",
						lyDo: "Không đủ người làm trong năm nay.",
						cauMucTieu: CAU_MUC_TIEU_MAU,
						noiBanTruoc: "cau-1",
					},
					P.cookie,
				),
				"K1 ghi de",
			);
			expect(await docKetLuan(k1)).toEqual({
				ketLuan: "khong-lam",
				lyDo: "Không đủ người làm trong năm nay.",
				cauMucTieu: "",
				noiBanTruoc: null,
			});
			expect(await db.okrTrail.count({ where: { cycleId: ky } })).toBe(
				soVetTruoc,
			);
		},
		CHO_MS,
	);

	test(
		"ket-luan: 15 ca từ chối — mã HTTP và câu ghim khớp bảng khai; bảng chủ đề, chuDeId, ganLuc và vết không đổi ở mọi ca",
		async () => {
			const KHAI = [
				{ ca: "Q-khong-phai-nguoi-chon", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "T-thanh-vien", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "O-vai-chi-okr", maHttp: 403, cau: T.chiNguoiChon },
				{
					ca: "ly-do-9-ky-tu",
					maHttp: 400,
					cau: `lyDo: Too small: expected string to have >=${OKR_HOI_Y.lyDo.min} characters`,
				},
				{
					ca: "chon-thieu-cau-muc-tieu",
					maHttp: 400,
					cau: OKR_HOI_Y.ketLuan.canCauMucTieu,
				},
				{
					ca: "chon-ly-do-501-ky-tu",
					maHttp: 400,
					cau: OKR_HOI_Y.ketLuan.lyDoChonQuaDai,
				},
				{
					ca: "cau-5-khi-co-bon-cau",
					maHttp: 400,
					cau: T.noiBanTruocKhongCo(BAN_TRUOC_MAC_DINH.length),
				},
				{
					ca: "cau-1-khi-khai-khong-viet",
					maHttp: 400,
					cau: T.noiBanTruocBoQua,
				},
				{ ca: "ma-noi-la", maHttp: 400, cau: "noiBanTruoc: Invalid option" },
				{ ca: "ket-luan-la", maHttp: 400, cau: "ketLuan: Invalid option" },
				{ ca: "khi-con-mo", maHttp: 400, cau: T.chuaHetHan },
				{ ca: "P-chua-niem-phong", maHttp: 400, cau: T.nguoiChonChuaNiemPhong },
				{ ca: "P-ha-vai", maHttp: 403, cau: T.nguoiChonPhaiQuanTri },
				{ ca: "sau-cong-bo", maHttp: 400, cau: T.daCongBo },
				{ ca: "chu-de-khong-co", maHttp: 404, cau: T.khongCoChuDe("khong-co") },
			] as const satisfies readonly Ca[];

			const chinh = await gieoGom({ yCua: ["A"] });
			const kChinh = await chuDeMoiId(
				chinh.h,
				"Chủ đề chính",
				chinh.nguoi.Q.cookie,
			);
			const boQua = await gieoGom({ yCua: ["A"], niemPhong: false });
			ok(
				await niemPhongCua(boQua.h, boQua.nguoi.P.cookie, { boQua: true }),
				"P khai khong viet truoc",
			);
			const kBoQua = await chuDeMoiId(
				boQua.h,
				"Chủ đề bỏ qua",
				boQua.nguoi.Q.cookie,
			);
			const conMo = await gieoGom({ yCua: ["A"] });
			const kConMo = await chuDeMoiId(
				conMo.h,
				"Chủ đề còn mở",
				conMo.nguoi.Q.cookie,
			);
			const chua = await gieoGom({ yCua: ["A"], niemPhong: false });
			const kChua = await chuDeMoiId(
				chua.h,
				"Chủ đề chưa niêm phong",
				chua.nguoi.Q.cookie,
			);
			const haVai = await gieoGom({ yCua: ["A"] });
			const kHaVai = await chuDeMoiId(
				haVai.h,
				"Chủ đề hạ vai",
				haVai.nguoi.Q.cookie,
			);
			await doiVai(haVai.nguoi.P.id, "member");
			const congBo = await gieoGom({ yCua: ["A"] });
			const kCongBo = await chuDeMoiId(
				congBo.h,
				"Chủ đề đã công bố",
				congBo.nguoi.Q.cookie,
			);
			ok(
				await ganYCua(
					[await yCua(congBo.h, congBo.nguoi.A.id)],
					{ chuDeId: kCongBo },
					congBo.nguoi.Q.cookie,
				),
				"gan y vao chu de truoc cong bo",
			);
			await gieoCongBo(congBo.h);
			const HOI_Y = [chinh.h, boQua.h, conMo.h, chua.h, haVai.h, congBo.h];
			const { Q, T: tv, O, P } = chinh.nguoi;
			const bocCon = (): Promise<TraLoi> => {
				datDongHo(LUC);
				return ketLuanCua(
					kConMo,
					KET_LUAN_CHON_MAU,
					conMo.nguoi.P.cookie,
				).finally(() => datDongHo(tGom(0)));
			};

			const CHAY = {
				"Q-khong-phai-nguoi-chon": () =>
					ketLuanCua(kChinh, KET_LUAN_CHON_MAU, Q.cookie),
				"T-thanh-vien": () => ketLuanCua(kChinh, KET_LUAN_CHON_MAU, tv.cookie),
				"O-vai-chi-okr": () => ketLuanCua(kChinh, KET_LUAN_CHON_MAU, O.cookie),
				"ly-do-9-ky-tu": () =>
					ketLuanCua(
						kChinh,
						{ ...KET_LUAN_CHON_MAU, lyDo: "ý".repeat(OKR_HOI_Y.lyDo.min - 1) },
						P.cookie,
					),
				"chon-thieu-cau-muc-tieu": () =>
					ketLuanCua(
						kChinh,
						{ ...KET_LUAN_CHON_MAU, cauMucTieu: "" },
						P.cookie,
					),
				"chon-ly-do-501-ky-tu": () =>
					ketLuanCua(
						kChinh,
						{
							...KET_LUAN_CHON_MAU,
							lyDo: "ý".repeat(OKR_HOI_Y.ketLuan.lyDoChonMax + 1),
						},
						P.cookie,
					),
				"cau-5-khi-co-bon-cau": () =>
					ketLuanCua(
						kChinh,
						{ ...KET_LUAN_CHON_MAU, noiBanTruoc: "cau-5" },
						P.cookie,
					),
				"cau-1-khi-khai-khong-viet": () =>
					ketLuanCua(kBoQua, KET_LUAN_CHON_MAU, boQua.nguoi.P.cookie),
				"ma-noi-la": () =>
					goi(
						"okr.ketLuanChuDe",
						{ chuDeId: kChinh, ...KET_LUAN_CHON_MAU, noiBanTruoc: "cau-6" },
						P.cookie,
					),
				"ket-luan-la": () =>
					goi(
						"okr.ketLuanChuDe",
						{ chuDeId: kChinh, ...KET_LUAN_CHON_MAU, ketLuan: "khac" },
						P.cookie,
					),
				"khi-con-mo": bocCon,
				"P-chua-niem-phong": () =>
					ketLuanCua(kChua, KET_LUAN_CHON_MAU, chua.nguoi.P.cookie),
				"P-ha-vai": () =>
					ketLuanCua(kHaVai, KET_LUAN_CHON_MAU, haVai.nguoi.P.cookie),
				"sau-cong-bo": () =>
					ketLuanCua(kCongBo, KET_LUAN_CHON_MAU, congBo.nguoi.P.cookie),
				"chu-de-khong-co": () =>
					ketLuanCua("khong-co", KET_LUAN_CHON_MAU, P.cookie),
			} satisfies { [K in (typeof KHAI)[number]["ca"]]: () => Promise<TraLoi> };

			const BANG: Bang[] = ["okrChuDe", "okrTrail"];
			const nhan: (KetQua & { vanTayDoi: boolean })[] = [];
			for (const khai of KHAI) {
				const truoc = await Promise.all(BANG.map(dem));
				const vanTruoc = await vanTayGom(HOI_Y);
				const tra = await CHAY[khai.ca]();
				const sau = await Promise.all(BANG.map(dem));
				nhan.push({
					ca: khai.ca,
					maHttp: tra.status,
					cau: tra.loi.includes(khai.cau) ? khai.cau : tra.loi,
					doi: Object.fromEntries(
						BANG.map((b, i) => [b, (sau[i] ?? 0) - (truoc[i] ?? 0)]),
					),
					vanTayDoi: vanTruoc !== (await vanTayGom(HOI_Y)),
				});
			}
			expect(nhan).toEqual(
				KHAI.map((k) => ({
					...k,
					doi: { okrChuDe: 0, okrTrail: 0 },
					vanTayDoi: false,
				})),
			);
			const daiDeSau = "ý".repeat(OKR_HOI_Y.ketLuan.lyDoChonMax + 1);
			ok(
				await ketLuanCua(
					kChinh,
					{
						ketLuan: "de-sau",
						lyDo: daiDeSau,
						cauMucTieu: "",
						noiBanTruoc: null,
					},
					P.cookie,
				),
				"de sau voi ly do dai hon tran chon",
			);
			expect((await hangChuDe(kChinh)).lyDo).toBe(daiDeSau);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ket-luan: bằng chứng qua okr.hoiY — K1 có 5 ý của 4 người ở 3 đơn vị (2 phòng ban và chưa xếp), đồng ý [3, 0, 2, 1, 0] → {4, 3, 6, trích hai ý nhiều đồng ý nhất}; chủ đề một ý → một trích; thành viên sau công bố thấy bằng chứng không có soDongY",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { ky, h, nguoi } = g;
			const { A, B, R, T: tv, O, Q, P } = nguoi;
			const pbX = await pbMoi("hoi-y-pbX");
			const pbY = await pbMoi("hoi-y-pbY");
			for (const [ai, pb] of [
				[A, pbX],
				[R, pbX],
				[B, pbY],
			] as const)
				ok(await datViTri(ai.id, pb), "dat vi tri");
			const NOI_DUNG = {
				yA1: "Mở tuyến giao lạnh cho khách dược",
				yA2: "Giảm hao hụt hàng lạnh khi vận chuyển",
				yB1: "Giao hàng lạnh trong ngày ở nội thành",
				yR1: "Thuê thêm xe lạnh cho mùa cao điểm",
				yT1: "Đo nhiệt độ hàng lạnh bằng cảm biến",
				yQ1: "Tăng giá dịch vụ giao lạnh cho khách lớn",
			} as const;
			const gieoTheo = async (thuTu: number, ai: Nguoi, noiDung: string) => {
				datDongHo(lechMs(LUC, thuTu * MOT_MS));
				return (await gieoY(h, ai.id, noiDung)).id;
			};
			const ycua = {
				yA1: await gieoTheo(0, A, NOI_DUNG.yA1),
				yA2: await gieoTheo(1, A, NOI_DUNG.yA2),
				yB1: await gieoTheo(2, B, NOI_DUNG.yB1),
				yR1: await gieoTheo(3, R, NOI_DUNG.yR1),
				yT1: await gieoTheo(4, tv, NOI_DUNG.yT1),
				yQ1: await gieoTheo(5, Q, NOI_DUNG.yQ1),
			};
			datDongHo(LUC);
			for (const ai of [tv, O, Q])
				ok(await dongYCua(ycua.yA1, ai.cookie), "dong y yA1");
			for (const ai of [tv, O])
				ok(await dongYCua(ycua.yB1, ai.cookie), "dong y yB1");
			ok(await dongYCua(ycua.yR1, Q.cookie), "dong y yR1");

			datDongHo(tGom(0));
			await gieoBanTruoc(h, P.id);
			await donHanVeBayGio(g);
			const k1 = await chuDeMoiId(h, "Giao lạnh", Q.cookie);
			ok(
				await ganYCua(
					[ycua.yA1, ycua.yA2, ycua.yB1, ycua.yR1, ycua.yT1],
					{ chuDeId: k1 },
					Q.cookie,
				),
				"gan nam y",
			);
			const k2 = await chuDeMoiId(h, "Tăng giá", Q.cookie);
			ok(await ganYCua([ycua.yQ1], { chuDeId: k2 }, Q.cookie), "gan mot y");
			ok(await ketLuanCua(k1, KET_LUAN_CHON_MAU, P.cookie), "P chon K1");

			const bangChung = async (ai: Nguoi, id: string) =>
				(await docHoiY(ky, ai.cookie))?.chuDe?.find((c) => c.id === id)
					?.bangChung;
			const TRICH = [NOI_DUNG.yA1, NOI_DUNG.yB1];
			expect(await bangChung(Q, k1)).toEqual({
				soNguoi: 4,
				soDonVi: 3,
				soDongY: 6,
				trich: TRICH,
			});
			expect(await bangChung(P, k2)).toEqual({
				soNguoi: 1,
				soDonVi: 1,
				soDongY: 0,
				trich: [NOI_DUNG.yQ1],
			});

			await gieoCongBo(h);
			expect(await bangChung(tv, k1)).toEqual({
				soNguoi: 4,
				soDonVi: 3,
				trich: TRICH,
			});
			expect(await bangChung(O, k2)).toEqual({
				soNguoi: 1,
				soDonVi: 1,
				trich: [NOI_DUNG.yQ1],
			});
		},
		CHO_MS,
	);
});

type TenChuDe = "K1" | "K2" | "K3" | "K4";
const CAU_K1_GO = "  ĐƯA giao lạnh  thành dịch vụ có LÃI ";
const CAU_K1_LUU = "ĐƯA giao lạnh  thành dịch vụ có LÃI";
const KET_LUAN_DU = {
	K1: {
		ketLuan: "chon",
		lyDo: LY_DO_MAU,
		cauMucTieu: CAU_K1_GO,
		noiBanTruoc: "cau-1",
	},
	K2: {
		ketLuan: "chon",
		lyDo: "Khách phàn nàn giao chậm, làm ngay quý đầu.",
		cauMucTieu: "Giảm thời gian giao chặng cuối xuống một ngày",
		noiBanTruoc: "cau-3",
	},
	K3: {
		ketLuan: "chon",
		lyDo: "Khách dược cần tuyến riêng, đã có xe lạnh.",
		cauMucTieu: "Mở tuyến giao lạnh cho khách dược",
		noiBanTruoc: "moi",
	},
	K4: {
		ketLuan: "de-sau",
		lyDo: "Để sau khi có thêm kho lạnh ở miền Trung.",
		cauMucTieu: "",
		noiBanTruoc: null,
	},
} as const satisfies Record<TenChuDe, KetLuanVao>;
const TEN_CHU_DE_DU = {
	K1: "Giao lạnh có lãi",
	K2: "Giao chặng cuối nhanh hơn",
	K3: "Tuyến riêng cho khách dược",
	K4: "Kho miền Trung",
} as const satisfies Record<TenChuDe, string>;
const CHU_DE_DU: TenChuDe[] = ["K1", "K2", "K3", "K4"];
const CAU_MUC_TIEU_LUU = {
	K1: CAU_K1_LUU,
	K2: KET_LUAN_DU.K2.cauMucTieu,
	K3: KET_LUAN_DU.K3.cauMucTieu,
} as const;
const CHON_DU = ["K1", "K2", "K3"] as const;
const cauThu = (i: number) => lechMs(LUC, i * MOT_MS);
const tCongBo = () => tGom(5);
const tHieu = () => tGom(6);

async function gieoDu(
	opts: {
		chuaKetLuan?: readonly TenChuDe[];
		boQua?: boolean;
		yChuaGom?: boolean;
	} = {},
) {
	datDongHo(LUC);
	const g = await gieoHoiY();
	const { A, B, T: tv, R, P, Q } = g.nguoi;
	const y = { A1: "", R: "", A2: "", B: "", T: "" };
	const thuTu = [
		["A1", A],
		["R", R],
		["A2", A],
		["B", B],
		["T", tv],
	] as const;
	for (const [i, [ten, ai]] of thuTu.entries()) {
		datDongHo(cauThu(i));
		y[ten] = (await gieoY(g.h, ai.id, `Ý ${ten} cho mục tiêu năm tới`)).id;
	}
	if (opts.yChuaGom) {
		datDongHo(cauThu(thuTu.length));
		await gieoY(g.h, tv.id, "Ý thừa chưa vào chủ đề nào");
	}
	datDongHo(tGom(0));
	if (opts.boQua)
		ok(
			await goi("okr.niemPhong", { hoiYId: g.h, boQua: true }, P.cookie),
			"P khai khong viet truoc",
		);
	else await gieoBanTruoc(g.h, P.id);
	await donHanVeBayGio(g);
	const k = { K1: "", K2: "", K3: "", K4: "" };
	for (const ten of CHU_DE_DU)
		k[ten] = await chuDeMoiId(g.h, TEN_CHU_DE_DU[ten], Q.cookie);
	const gan = {
		K1: [y.A1, y.R],
		K2: [y.B],
		K3: [y.T],
		K4: [y.A2],
	} as const;
	for (const ten of CHU_DE_DU)
		ok(
			await ganYCua([...gan[ten]], { chuDeId: k[ten] }, Q.cookie),
			`Q gan ${ten}`,
		);
	for (const ten of CHU_DE_DU)
		if (!opts.chuaKetLuan?.includes(ten))
			ok(
				await ketLuanCua(
					k[ten],
					opts.boQua && ten !== "K4"
						? { ...KET_LUAN_DU[ten], noiBanTruoc: null }
						: KET_LUAN_DU[ten],
					P.cookie,
				),
				`P ${ten}`,
			);
	return { ...g, y, k };
}
type GieoDu = Awaited<ReturnType<typeof gieoDu>>;

const congBoCua = (hoiYId: string, cookie: string) =>
	goi("okr.congBo", { hoiYId }, cookie);
const hieuViSaoCua = (hoiYId: string, cookie: string) =>
	goi("okr.hieuViSao", { hoiYId }, cookie);
const datChuongTrinh = async (vao: {
	objectiveCap: number;
	capMode: "chan" | "canh-bao";
}) =>
	ok(
		await goi("okr.setProgram", { ...CHUONG_TRINH_RONG, ...vao }),
		"dat chuong trinh",
	);
const traChuongTrinh = () =>
	datChuongTrinh({
		objectiveCap: CHUONG_TRINH_RONG.objectiveCap,
		capMode: CHUONG_TRINH_RONG.capMode,
	});
const tenNguoi = async (id: string) =>
	(await db.user.findUniqueOrThrow({ where: { id }, select: { name: true } }))
		.name;
const soMucTieuMoi = async (ky: string) =>
	db.okrObjective.count({ where: { cycleId: ky } });
const soChuDeCoMucTieu = (hoiYId: string) =>
	db.okrChuDe.count({ where: { hoiYId, objectiveId: { not: null } } });

const CA_THIEU = [
	{
		ca: "chua-niem-phong-dung-tay",
		ma: "chua-niem-phong",
		maHttp: 400,
		cau: T.congBoThieu["chua-niem-phong"],
	},
	{
		ca: "y-chua-gom",
		ma: "y-chua-gom",
		maHttp: 400,
		cau: T.congBoThieu["y-chua-gom"],
		gieo: { yChuaGom: true },
	},
	{
		ca: "chu-de-rong",
		ma: "chu-de-rong",
		maHttp: 400,
		cau: T.congBoThieu["chu-de-rong"],
	},
	{
		ca: "thieu-ket-luan",
		ma: "thieu-ket-luan",
		maHttp: 400,
		cau: T.congBoThieu["thieu-ket-luan"],
		gieo: { chuaKetLuan: ["K4"] },
	},
	{
		ca: "thieu-ly-do-dung-tay",
		ma: "thieu-ly-do",
		maHttp: 400,
		cau: T.congBoThieu["thieu-ly-do"],
	},
	{
		ca: "thieu-cau-muc-tieu-dung-tay",
		ma: "thieu-cau-muc-tieu",
		maHttp: 400,
		cau: T.congBoThieu["thieu-cau-muc-tieu"],
	},
	{
		ca: "thieu-noi-ban-truoc",
		ma: "thieu-noi-ban-truoc",
		maHttp: 400,
		cau: T.congBoThieu["thieu-noi-ban-truoc"],
	},
	{
		ca: "khong-chon",
		ma: "khong-chon",
		maHttp: 400,
		cau: T.congBoThieu["khong-chon"],
	},
	{
		ca: "vuot-tran-che-do-chan",
		ma: "vuot-tran",
		maHttp: 400,
		cau: T.congBoVuotTran(2, CHON_DU.length),
	},
] as const satisfies readonly {
	ca: string;
	ma: MaThieu;
	maHttp: number;
	cau: string;
	gieo?: { yChuaGom?: boolean; chuaKetLuan?: readonly TenChuDe[] };
}[];

const PHA_THIEU = {
	"chua-niem-phong-dung-tay": async (g) => {
		await db.okrHoiYBanTruoc.delete({ where: { hoiYId: g.h } });
		return null;
	},
	"y-chua-gom": async () => null,
	"chu-de-rong": async (g) => {
		const id = await chuDeMoiId(g.h, "Chủ đề rỗng", g.nguoi.Q.cookie);
		ok(await ketLuanCua(id, KET_LUAN_DU.K4, g.nguoi.P.cookie), "P ket luan");
		return id;
	},
	"thieu-ket-luan": async (g) => g.k.K4,
	"thieu-ly-do-dung-tay": async (g) => {
		await db.okrChuDe.update({
			where: { id: g.k.K4 },
			data: { lyDo: "ngắn" },
		});
		return g.k.K4;
	},
	"thieu-cau-muc-tieu-dung-tay": async (g) => {
		await db.okrChuDe.update({
			where: { id: g.k.K3 },
			data: { cauMucTieu: "" },
		});
		return g.k.K3;
	},
	"thieu-noi-ban-truoc": async (g) => {
		ok(
			await ketLuanCua(
				g.k.K3,
				{ ...KET_LUAN_DU.K3, noiBanTruoc: null },
				g.nguoi.P.cookie,
			),
			"P bo noi ban truoc",
		);
		return g.k.K3;
	},
	"khong-chon": async (g) => {
		for (const ten of CHON_DU)
			ok(
				await ketLuanCua(
					g.k[ten],
					{ ...KET_LUAN_DU.K4, cauMucTieu: "", noiBanTruoc: null },
					g.nguoi.P.cookie,
				),
				`P de sau ${ten}`,
			);
		return null;
	},
	"vuot-tran-che-do-chan": async () => {
		await datChuongTrinh({ objectiveCap: 2, capMode: "chan" });
		return null;
	},
} satisfies Record<
	(typeof CA_THIEU)[number]["ca"],
	(g: GieoDu) => Promise<string | null>
>;

describe("cong-bo", () => {
	test(
		"cong-bo: bảng 9 ca thiếu — mỗi ca dựng từ lần hỏi ý đủ điều kiện rồi phá đúng một điều; quyen.lyDoChuaCongBo của người chọn đúng một mã của điều bị phá, congBo 400 với câu riêng, không mục tiêu, không vết, không chủ đề nào nối mục tiêu, congBoLuc null. Ba ca «-dung-tay» (chua-niem-phong, thieu-ly-do, thieu-cau-muc-tieu) sửa hàng bằng Prisma vì không thủ tục nào tạo được trạng thái đó — chỉ là chốt chặn phía máy chủ; sáu ca kia đi qua thủ tục thật",
		async () => {
			const ra: unknown[] = [];
			for (const c of CA_THIEU) {
				const g = await gieoDu("gieo" in c ? c.gieo : {});
				datDongHo(tCongBo());
				const chuDeId = await PHA_THIEU[c.ca](g);
				const truoc = {
					mucTieu: await dem("okrObjective"),
					vet: await dem("okrTrail"),
				};
				const doc = await docHoiY(g.ky, g.nguoi.P.cookie);
				const tra = await congBoCua(g.h, g.nguoi.P.cookie);
				const sau = {
					mucTieu: await dem("okrObjective"),
					vet: await dem("okrTrail"),
				};
				const hang = await db.okrHoiY.findUniqueOrThrow({
					where: { id: g.h },
				});
				const chuDeNoiMucTieu = await soChuDeCoMucTieu(g.h);
				await traChuongTrinh();
				ra.push({
					ca: c.ca,
					quyen: {
						congBoDuoc: doc?.quyen.congBoDuoc,
						lyDoChuaCongBo: doc?.quyen.lyDoChuaCongBo,
					},
					tra: { maHttp: tra.status, cau: tra.loi },
					doi: {
						mucTieu: sau.mucTieu - truoc.mucTieu,
						vet: sau.vet - truoc.vet,
						chuDeNoiMucTieu,
						congBoLuc: hang.congBoLuc,
					},
				});
				expect(ra.at(-1), `ca ${c.ca}`).toEqual({
					ca: c.ca,
					quyen: {
						congBoDuoc: false,
						lyDoChuaCongBo: [{ ma: c.ma, chuDeId }],
					},
					tra: { maHttp: c.maHttp, cau: c.cau },
					doi: { mucTieu: 0, vet: 0, chuDeNoiMucTieu: 0, congBoLuc: null },
				});
			}
			console.log(`cong-bo: đã chạy ${ra.length}/${CA_THIEU.length} ca thiếu`);
			expect(ra.length).toBe(CA_THIEU.length);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: lần hỏi ý đủ — P công bố, đúng ba mục tiêu nháp cấp OneHub {cam-ket, nhap, chủ P, tên là câu mục tiêu, whyNow là lý do} so tập, mỗi chủ đề chọn nối đúng mục tiêu, chủ đề để sau không nối, congBoLuc là giờ tiêm, vết 3 tao có tuHoiY và 1 cong-bo-hoi-y; lần hai 400 daCongBo, không thêm gì",
		async () => {
			const g = await gieoDu();
			const { P } = g.nguoi;
			datDongHo(tCongBo());
			const truocDoc = await docHoiY(g.ky, P.cookie);
			expect({
				trangThai: truocDoc?.trangThai,
				congBoDuoc: truocDoc?.quyen.congBoDuoc,
				lyDoChuaCongBo: truocDoc?.quyen.lyDoChuaCongBo,
			}).toEqual({
				trangThai: "dang-gom",
				congBoDuoc: true,
				lyDoChuaCongBo: [],
			});
			const tra = ok<{ mucTieuIds: string[]; canhBao: string | null }>(
				await congBoCua(g.h, P.cookie),
				"cong bo",
			);
			expect(tra.canhBao).toBeNull();
			expect(tra.mucTieuIds.length).toBe(CHON_DU.length);

			const mucTieu = await db.okrObjective.findMany({
				where: { cycleId: g.ky },
				orderBy: { position: "asc" },
			});
			const dang = (m: (typeof mucTieu)[number]) => ({
				level: m.level,
				divisionId: m.divisionId,
				departmentId: m.departmentId,
				personUserId: m.personUserId,
				status: m.status,
				ownerUserId: m.ownerUserId,
				kind: m.kind,
				title: m.title,
				whyNow: m.whyNow,
			});
			const kyVongMucTieu = CHON_DU.map((ten) => ({
				level: "onehub",
				divisionId: null,
				departmentId: null,
				personUserId: null,
				status: "nhap",
				ownerUserId: P.id,
				kind: "cam-ket",
				title: CAU_MUC_TIEU_LUU[ten],
				whyNow: KET_LUAN_DU[ten].lyDo,
			}));
			const theoTieuDe = <X extends { title: string }>(x: X[]) =>
				[...x].sort((a, b) => a.title.localeCompare(b.title));
			expect(theoTieuDe(mucTieu.map(dang))).toEqual(theoTieuDe(kyVongMucTieu));
			expect(mucTieu.map((m) => m.id)).toEqual(tra.mucTieuIds);
			expect(
				await db.okrParticipant.count({
					where: { objective: { cycleId: g.ky } },
				}),
			).toBe(0);

			const chuDe = await Promise.all(
				CHU_DE_DU.map((ten) => hangChuDe(g.k[ten])),
			);
			expect(chuDe.map((c) => c.objectiveId)).toEqual([
				...tra.mucTieuIds,
				null,
			]);
			const hang = await db.okrHoiY.findUniqueOrThrow({ where: { id: g.h } });
			expect(hang.congBoLuc?.toISOString()).toBe(tCongBo().toISOString());

			const vet = await db.okrTrail.findMany({
				where: { cycleId: g.ky, action: { in: ["tao", "cong-bo-hoi-y"] } },
				select: {
					action: true,
					objectiveId: true,
					actorUserId: true,
					after: true,
				},
			});
			const theoMucTieu = <X extends { objectiveId: string | null }>(x: X[]) =>
				[...x].sort((a, b) =>
					(a.objectiveId ?? "").localeCompare(b.objectiveId ?? ""),
				);
			expect(
				theoMucTieu(
					vet
						.filter((v) => v.action === "tao")
						.map((v) => ({
							objectiveId: v.objectiveId,
							actorUserId: v.actorUserId,
							after: v.after,
						})),
				),
			).toEqual(
				theoMucTieu(
					CHON_DU.map((ten, i) => ({
						objectiveId: tra.mucTieuIds[i] ?? null,
						actorUserId: P.id,
						after: {
							title: CAU_MUC_TIEU_LUU[ten],
							kind: "cam-ket",
							level: "onehub",
							status: "nhap",
							hienThi: "cong-khai",
							tuHoiY: g.h,
						},
					})),
				),
			);
			expect(vet.filter((v) => v.action === "cong-bo-hoi-y")).toEqual([
				{
					action: "cong-bo-hoi-y",
					objectiveId: null,
					actorUserId: P.id,
					after: { hoiYId: g.h, soMucTieu: CHON_DU.length },
				},
			]);

			const truoc = {
				mucTieu: await dem("okrObjective"),
				vet: await dem("okrTrail"),
			};
			const haiLan = await congBoCua(g.h, P.cookie);
			expect({ maHttp: haiLan.status, cau: haiLan.loi }).toEqual({
				maHttp: 400,
				cau: T.daCongBo,
			});
			expect({
				mucTieu: await dem("okrObjective"),
				vet: await dem("okrTrail"),
			}).toEqual(truoc);

			const sauDoc = await docHoiY(g.ky, P.cookie);
			expect({
				trangThai: sauDoc?.trangThai,
				congBoDuoc: sauDoc?.quyen.congBoDuoc,
				lyDoChuaCongBo: sauDoc?.quyen.lyDoChuaCongBo,
			}).toEqual({
				trangThai: "da-cong-bo",
				congBoDuoc: false,
				lyDoChuaCongBo: [],
			});
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: từ chối trước khi tính điều thiếu — quản trị không phải người chọn, thành viên, vai okr đều 403 chiNguoiChon; người chọn khi còn mở 400 chuaHetHan; chu kỳ đã sang đang chạy 400; người chọn bị hạ vai 403; không có mã 404; đếm mục tiêu và vết không đổi",
		async () => {
			type Ca = { ca: string; maHttp: number; cau: string };
			const CA = [
				{
					ca: "Q-quan-tri-khong-phai-nguoi-chon",
					maHttp: 403,
					cau: T.chiNguoiChon,
				},
				{ ca: "T-thanh-vien", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "O-vai-chi-okr", maHttp: 403, cau: T.chiNguoiChon },
				{ ca: "P-khi-con-mo", maHttp: 400, cau: T.congBoChuaHetHan },
				{
					ca: "P-khi-ky-khong-con-lap-ke-hoach",
					maHttp: 400,
					cau: T.congBoKyKhongLapKeHoach,
				},
				{ ca: "P-bi-ha-vai", maHttp: 403, cau: T.nguoiChonPhaiQuanTri },
				{
					ca: "P-chua-niem-phong-y-da-gom",
					maHttp: 400,
					cau: T.congBoThieu["chua-niem-phong"],
				},
				{ ca: "hoi-y-khong-co", maHttp: 404, cau: T.khongCoHoiY("khong-co") },
			] as const satisfies readonly Ca[];
			const du = await gieoDu();
			const mo = await gieoHoiY();
			const doiKy = await gieoDu();
			const haVai = await gieoDu();
			await db.okrCycle.update({
				where: { id: doiKy.ky },
				data: { phase: "dang-chay" },
			});
			await doiVai(haVai.nguoi.P.id, "member");
			const chuaNiem = await gieoHoiY({ yCua: ["A"] });
			await donHanVeBayGio(chuaNiem);
			ok(
				await ganYCua(
					[await yCua(chuaNiem.h, chuaNiem.nguoi.A.id)],
					{ yLa: true },
					chuaNiem.nguoi.Q.cookie,
				),
				"Q gom y cua P chua niem phong",
			);
			datDongHo(tCongBo());
			const CHAY = {
				"Q-quan-tri-khong-phai-nguoi-chon": () =>
					congBoCua(du.h, du.nguoi.Q.cookie),
				"T-thanh-vien": () => congBoCua(du.h, du.nguoi.T.cookie),
				"O-vai-chi-okr": () => congBoCua(du.h, du.nguoi.O.cookie),
				"P-khi-con-mo": () => congBoCua(mo.h, mo.nguoi.P.cookie),
				"P-khi-ky-khong-con-lap-ke-hoach": () =>
					congBoCua(doiKy.h, doiKy.nguoi.P.cookie),
				"P-bi-ha-vai": () => congBoCua(haVai.h, haVai.nguoi.P.cookie),
				"P-chua-niem-phong-y-da-gom": () =>
					congBoCua(chuaNiem.h, chuaNiem.nguoi.P.cookie),
				"hoi-y-khong-co": () => congBoCua("khong-co", du.nguoi.P.cookie),
			} satisfies Record<(typeof CA)[number]["ca"], () => Promise<TraLoi>>;
			const truoc = {
				mucTieu: await dem("okrObjective"),
				vet: await dem("okrTrail"),
			};
			const nhan: Ca[] = [];
			for (const c of CA) {
				const tra = await CHAY[c.ca]();
				nhan.push({ ca: c.ca, maHttp: tra.status, cau: tra.loi });
			}
			console.log(`cong-bo: đã chạy ${nhan.length}/${CA.length} ca từ chối`);
			expect(nhan).toEqual([...CA]);
			expect({
				mucTieu: await dem("okrObjective"),
				vet: await dem("okrTrail"),
				congBo: await db.okrHoiY.count({
					where: {
						id: { in: [du.h, mo.h, doiKy.h, haVai.h, chuaNiem.h] },
						congBoLuc: { not: null },
					},
				}),
			}).toEqual({ ...truoc, congBo: 0 });
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: hai lần bấm gần như cùng lúc — đúng một lần thành công, lần kia 400 daCongBo; ba mục tiêu (không phải sáu), một vết cong-bo-hoi-y",
		async () => {
			const g = await gieoDu();
			datDongHo(tCongBo());
			const [a, b] = await Promise.all([
				congBoCua(g.h, g.nguoi.P.cookie),
				congBoCua(g.h, g.nguoi.P.cookie),
			]);
			const theoMa = [a, b].sort((x, y) => x.status - y.status);
			expect(
				theoMa.map((t) => ({
					maHttp: t.status,
					cau: t.status === 200 ? "" : t.loi,
				})),
			).toEqual([
				{ maHttp: 200, cau: "" },
				{ maHttp: 400, cau: T.daCongBo },
			]);
			expect({
				mucTieu: await soMucTieuMoi(g.ky),
				chuDeNoiMucTieu: await soChuDeCoMucTieu(g.h),
				vetCongBo: await db.okrTrail.count({
					where: { cycleId: g.ky, action: "cong-bo-hoi-y" },
				}),
				vetTao: await db.okrTrail.count({
					where: { cycleId: g.ky, action: "tao" },
				}),
			}).toEqual({
				mucTieu: CHON_DU.length,
				chuDeNoiMucTieu: CHON_DU.length,
				vetCongBo: 1,
				vetTao: CHON_DU.length,
			});
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: chế độ cảnh báo vượt trần — công bố được, trả canhBao đúng câu vượt trần, đủ ba mục tiêu",
		async () => {
			const g = await gieoDu();
			datDongHo(tCongBo());
			await datChuongTrinh({ objectiveCap: 2, capMode: "canh-bao" });
			try {
				const tra = ok<{ mucTieuIds: string[]; canhBao: string | null }>(
					await congBoCua(g.h, g.nguoi.P.cookie),
					"cong bo canh bao",
				);
				expect({
					canhBao: tra.canhBao,
					soMucTieu: tra.mucTieuIds.length,
					congBoLuc: (
						await db.okrHoiY.findUniqueOrThrow({ where: { id: g.h } })
					).congBoLuc?.toISOString(),
				}).toEqual({
					canhBao: OKR.thongDiep.vuotTranMucTieu(2),
					soMucTieu: CHON_DU.length,
					congBoLuc: tCongBo().toISOString(),
				});
			} finally {
				await traChuongTrinh();
			}
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: setCyclePhase rời lập kế hoạch — khi lần hỏi ý chưa công bố 400 conHoiYChuaCongBo(tên chu kỳ), pha không đổi, không vết doi-pha; sau công bố đi được sang đang chạy",
		async () => {
			const g = await gieoDu();
			datDongHo(tCongBo());
			const ten = (await db.okrCycle.findUniqueOrThrow({ where: { id: g.ky } }))
				.name;
			const pha = async () =>
				(await db.okrCycle.findUniqueOrThrow({ where: { id: g.ky } })).phase;
			const doiPha = () =>
				goi("okr.setCyclePhase", { id: g.ky, phase: "dang-chay" });
			const truoc = await doiPha();
			expect({
				maHttp: truoc.status,
				cau: truoc.loi,
				pha: await pha(),
				vetDoiPha: await db.okrTrail.count({
					where: { cycleId: g.ky, action: "doi-pha" },
				}),
			}).toEqual({
				maHttp: 400,
				cau: T.conHoiYChuaCongBo(ten),
				pha: "lap-ke-hoach",
				vetDoiPha: 0,
			});
			ok(await congBoCua(g.h, g.nguoi.P.cookie), "cong bo");
			ok(await doiPha(), "doi pha sau cong bo");
			expect(await pha()).toBe("dang-chay");
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: lần hỏi ý không có ý nào — Q dời hạn về bây giờ qua suaHoiY; P chưa niêm phong: lyDoChuaCongBo đúng [chua-niem-phong], congBo 400; P khai không viết trước khi đang gom, lyDoChuaCongBo rỗng, congBo 200 với 0 mục tiêu, congBoLuc là giờ tiêm, vết cong-bo-hoi-y soMucTieu 0; chu kỳ sang đang chạy",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { P } = g.nguoi;
			await donHanVeBayGio(g);
			datDongHo(tCongBo());
			const truoc = await docHoiY(g.ky, P.cookie);
			const tuChoi = await congBoCua(g.h, P.cookie);
			expect({
				trangThai: truoc?.trangThai,
				congBoDuoc: truoc?.quyen.congBoDuoc,
				lyDoChuaCongBo: truoc?.quyen.lyDoChuaCongBo,
				tuChoi: { maHttp: tuChoi.status, cau: tuChoi.loi },
			}).toEqual({
				trangThai: "dang-gom",
				congBoDuoc: false,
				lyDoChuaCongBo: [{ ma: "chua-niem-phong", chuDeId: null }],
				tuChoi: { maHttp: 400, cau: T.congBoThieu["chua-niem-phong"] },
			});
			ok(
				await goi("okr.niemPhong", { hoiYId: g.h, boQua: true }, P.cookie),
				"P khai khong viet truoc khi dang gom",
			);
			const san = await docHoiY(g.ky, P.cookie);
			expect({
				congBoDuoc: san?.quyen.congBoDuoc,
				lyDoChuaCongBo: san?.quyen.lyDoChuaCongBo,
			}).toEqual({ congBoDuoc: true, lyDoChuaCongBo: [] });
			const tra = ok<{ mucTieuIds: string[]; canhBao: string | null }>(
				await congBoCua(g.h, P.cookie),
				"cong bo rong",
			);
			const hang = await db.okrHoiY.findUniqueOrThrow({ where: { id: g.h } });
			expect({
				tra,
				congBoLuc: hang.congBoLuc?.toISOString(),
				mucTieu: await soMucTieuMoi(g.ky),
				vet: await db.okrTrail.findMany({
					where: { cycleId: g.ky, action: "cong-bo-hoi-y" },
					select: { objectiveId: true, actorUserId: true, after: true },
				}),
			}).toEqual({
				tra: { mucTieuIds: [], canhBao: null },
				congBoLuc: tCongBo().toISOString(),
				mucTieu: 0,
				vet: [
					{
						objectiveId: null,
						actorUserId: P.id,
						after: { hoiYId: g.h, soMucTieu: 0 },
					},
				],
			});
			const tv = await docHoiY(g.ky, g.nguoi.T.cookie);
			expect({
				trangThai: tv?.trangThai,
				chuDe: tv?.chuDe,
				ketQua: tv?.ketQua,
			}).toEqual({
				trangThai: "da-cong-bo",
				chuDe: [],
				ketQua: {
					cau: [],
					doi: 0,
					them: 0,
					boQua: true,
					vietBoi: await tenNguoi(P.id),
					chon: [],
				},
			});
			ok(
				await goi("okr.setCyclePhase", { id: g.ky, phase: "dang-chay" }),
				"doi pha sau cong bo rong",
			);
			expect(
				(await db.okrCycle.findUniqueOrThrow({ where: { id: g.ky } })).phase,
			).toBe("dang-chay");
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: người chọn chưa niêm phong chỉ nhận mã chung trong lyDoChuaCongBo — không mã theo chủ đề, không mã chủ đề nào trong phản hồi; niêm phong xong thì nhận đủ mã theo chủ đề",
		async () => {
			const g = await gieoGom({ yCua: ["A", "B"], niemPhong: false });
			const { P, Q } = g.nguoi;
			const [yA] = g.y;
			if (!yA) throw new Error("thieu y A");
			const k = await chuDeMoiId(g.h, TEN_CHU_DE_MAU, Q.cookie);
			ok(await ganYCua([yA], { chuDeId: k }, Q.cookie), "Q gan y A");
			const truoc = await docHoiY(g.ky, P.cookie);
			expect({
				lyDoChuaCongBo: truoc?.quyen.lyDoChuaCongBo,
				maChuDe: demChuoi(JSON.stringify(truoc), k),
			}).toEqual({
				lyDoChuaCongBo: [
					{ ma: "chua-niem-phong", chuDeId: null },
					{ ma: "y-chua-gom", chuDeId: null },
					{ ma: "khong-chon", chuDeId: null },
				],
				maChuDe: 0,
			});
			await gieoBanTruoc(g.h, P.id);
			const sau = await docHoiY(g.ky, P.cookie);
			expect(sau?.quyen.lyDoChuaCongBo).toEqual([
				{ ma: "y-chua-gom", chuDeId: null },
				{ ma: "thieu-ket-luan", chuDeId: k },
				{ ma: "khong-chon", chuDeId: null },
			]);
		},
		CHO_MS,
	);

	test(
		"cong-bo: lối ra — P niêm phong rồi bị hạ về member: P công bố 403; Q đổi người chọn sang Q2; Q2 kết luận nốt và công bố được; mục tiêu nháp thuộc Q2; kết quả ghi P viết bản trước; chu kỳ sang đang chạy",
		async () => {
			const g = await gieoDu({ chuaKetLuan: ["K3", "K4"] });
			const { P, Q, T: tv } = g.nguoi;
			const Q2 = await nguoiCo("e8-Q2", "admin");
			await doiVai(P.id, "member");
			datDongHo(tCongBo());
			const cu = await congBoCua(g.h, P.cookie);
			expect({ maHttp: cu.status, cau: cu.loi }).toEqual({
				maHttp: 403,
				cau: T.nguoiChonPhaiQuanTri,
			});
			expect(await soMucTieuMoi(g.ky)).toBe(0);
			ok(
				await goi(
					"okr.suaHoiY",
					{ hoiYId: g.h, nguoiChonUserId: Q2.id },
					Q.cookie,
				),
				"Q doi nguoi chon",
			);
			const choKetLuan = await docHoiY(g.ky, Q2.cookie);
			expect({
				congBoDuoc: choKetLuan?.quyen.congBoDuoc,
				lyDoChuaCongBo: choKetLuan?.quyen.lyDoChuaCongBo.map((l) => l.ma),
			}).toEqual({
				congBoDuoc: false,
				lyDoChuaCongBo: ["thieu-ket-luan", "thieu-ket-luan"],
			});
			for (const ten of ["K3", "K4"] as const)
				ok(
					await ketLuanCua(g.k[ten], KET_LUAN_DU[ten], Q2.cookie),
					`Q2 ${ten}`,
				);
			const san = await docHoiY(g.ky, Q2.cookie);
			expect({
				congBoDuoc: san?.quyen.congBoDuoc,
				lyDoChuaCongBo: san?.quyen.lyDoChuaCongBo,
			}).toEqual({ congBoDuoc: true, lyDoChuaCongBo: [] });
			const tra = ok<{ mucTieuIds: string[] }>(
				await congBoCua(g.h, Q2.cookie),
				"Q2 cong bo",
			);
			expect(tra.mucTieuIds.length).toBe(CHON_DU.length);
			expect(
				(
					await db.okrObjective.findMany({
						where: { cycleId: g.ky },
						select: { ownerUserId: true },
					})
				).map((m) => m.ownerUserId),
			).toEqual(CHON_DU.map(() => Q2.id));
			const doc = await docHoiY(g.ky, tv.cookie);
			expect(doc?.ketQua?.vietBoi).toBe(await tenNguoi(P.id));
			expect(doc?.banTruoc?.vietBoi).toBe(await tenNguoi(P.id));
			ok(
				await goi("okr.setCyclePhase", { id: g.ky, phase: "dang-chay" }),
				"doi pha",
			);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"cong-bo: người góp đã rời trước công bố — ý của R vẫn ở chủ đề và vẫn đếm ở bằng chứng (số người, số đồng ý) với quản trị; công bố vẫn tạo đủ mục tiêu",
		async () => {
			const g = await gieoDu();
			const { Q, P, R, A } = g.nguoi;
			const bangChung = async () => {
				const doc = await docHoiY(g.ky, Q.cookie);
				const k1 = doc?.chuDe?.find((c) => c.id === g.k.K1);
				return {
					soNguoi: k1?.bangChung.soNguoi,
					soDongY: k1?.bangChung.soDongY,
					tacGia: (k1?.y ?? [])
						.flatMap((y) => ("tacGia" in y ? [y.tacGia.id] : []))
						.sort(),
				};
			};
			const truoc = await bangChung();
			expect(truoc).toEqual({
				soNguoi: 2,
				soDongY: 0,
				tacGia: [A.id, R.id].sort(),
			});
			await roiDi(R.id);
			expect(await bangChung()).toEqual(truoc);
			datDongHo(tCongBo());
			ok(await congBoCua(g.h, P.cookie), "cong bo");
			expect(await bangChung()).toEqual(truoc);
			expect(await soMucTieuMoi(g.ky)).toBe(CHON_DU.length);
			expect(
				await db.okrY.count({ where: { hoiYId: g.h, tacGiaUserId: R.id } }),
			).toBe(1);
		},
		CHO_MA_TRAN_MS,
	);
});

const TRA_HIEU_LOI = [
	{ ca: "O-chua-gop", maHttp: 400, cau: T.chuaGop },
	{ ca: "A-khi-chua-cong-bo", maHttp: 400, cau: T.chuaCongBo },
] as const;
type CaHieu = (typeof TRA_HIEU_LOI)[number]["ca"];

describe("ket-qua", () => {
	test(
		"ket-qua: E9 dịch vụ — A (hai ý: K1 chọn, K4 để sau) thấy hành trình từng ý; ketQua giữ-bỏ-đổi-bỏ với vietBoi và ba chủ đề chọn kèm objectiveId, giống nhau cho A và O; kho ý có K4 cho cả hai; A bấm hiểu một hàng, lần hai vẫn một; O chưa góp 400 chuaGop; H chưa công bố 400",
		async () => {
			const g = await gieoDu();
			const chua = await gieoDu();
			const { A, O, P } = g.nguoi;
			datDongHo(tCongBo());
			const tra = ok<{ mucTieuIds: string[] }>(
				await congBoCua(g.h, P.cookie),
				"cong bo",
			);
			const [m1 = null, m2 = null, m3 = null] = tra.mucTieuIds;
			const tenP = await tenNguoi(P.id);
			const ketQuaKyVong: KetQuaChieu = {
				cau: ["giu", "bo", "doi", "bo"],
				doi: 1,
				them: 1,
				boQua: false,
				vietBoi: tenP,
				chon: [
					{
						chuDeId: g.k.K1,
						ten: TEN_CHU_DE_DU.K1,
						cauMucTieu: CAU_K1_LUU,
						noiBanTruoc: "cau-1",
						objectiveId: m1,
					},
					{
						chuDeId: g.k.K2,
						ten: TEN_CHU_DE_DU.K2,
						cauMucTieu: KET_LUAN_DU.K2.cauMucTieu,
						noiBanTruoc: "cau-3",
						objectiveId: m2,
					},
					{
						chuDeId: g.k.K3,
						ten: TEN_CHU_DE_DU.K3,
						cauMucTieu: KET_LUAN_DU.K3.cauMucTieu,
						noiBanTruoc: "moi",
						objectiveId: m3,
					},
				],
			};
			const docA = await docHoiY(g.ky, A.cookie);
			const docO = await docHoiY(g.ky, O.cookie);
			const hanhTrinh = (gopLuc: string) => ({
				gopLuc,
				vaoChuDeLuc: tGom(0).toISOString(),
				ketLuanLuc: tCongBo().toISOString(),
			});
			expect(docA?.cuaToi.y).toEqual([
				{
					id: g.y.A1,
					noiDung: "Ý A1 cho mục tiêu năm tới",
					viSao: "",
					doBangGi: "",
					createdAt: cauThu(0).toISOString(),
					chuDe: { id: g.k.K1, ten: TEN_CHU_DE_DU.K1 },
					ketLuan: "chon",
					lyDo: KET_LUAN_DU.K1.lyDo,
					objectiveId: m1,
					hanhTrinh: hanhTrinh(cauThu(0).toISOString()),
				},
				{
					id: g.y.A2,
					noiDung: "Ý A2 cho mục tiêu năm tới",
					viSao: "",
					doBangGi: "",
					createdAt: cauThu(2).toISOString(),
					chuDe: { id: g.k.K4, ten: TEN_CHU_DE_DU.K4 },
					ketLuan: "de-sau",
					lyDo: KET_LUAN_DU.K4.lyDo,
					objectiveId: null,
					hanhTrinh: hanhTrinh(cauThu(2).toISOString()),
				},
			]);
			expect(docO?.cuaToi).toEqual({ y: [], daHieu: false });
			expect(docA?.ketQua).toEqual(ketQuaKyVong);
			expect(docO?.ketQua).toEqual(ketQuaKyVong);
			const khoY = (d: typeof docA) =>
				d?.chuDe
					?.filter((c) => c.ketLuan === "de-sau")
					.map((c) => ({ id: c.id, lyDo: c.lyDo }));
			const khoYKyVong = [{ id: g.k.K4, lyDo: KET_LUAN_DU.K4.lyDo }];
			expect(khoY(docA)).toEqual(khoYKyVong);
			expect(khoY(docO)).toEqual(khoYKyVong);

			datDongHo(tHieu());
			const hieu = () =>
				db.okrHoiYHieu.findMany({
					where: { hoiYId: g.h },
					select: { userId: true, luc: true },
				});
			expect(await hieu()).toEqual([]);
			expect(
				ok<{ ok: boolean }>(await hieuViSaoCua(g.h, A.cookie), "A hieu"),
			).toEqual({
				ok: true,
			});
			expect(await hieu()).toEqual([{ userId: A.id, luc: tHieu() }]);
			expect(
				ok<{ ok: boolean }>(
					await hieuViSaoCua(g.h, A.cookie),
					"A hieu lan hai",
				),
			).toEqual({
				ok: true,
			});
			expect(await hieu()).toEqual([{ userId: A.id, luc: tHieu() }]);
			expect((await docHoiY(g.ky, A.cookie))?.cuaToi.daHieu).toBe(true);
			expect((await docHoiY(g.ky, O.cookie))?.cuaToi.daHieu).toBe(false);

			const CHAY_HIEU = {
				"O-chua-gop": () => hieuViSaoCua(g.h, O.cookie),
				"A-khi-chua-cong-bo": () => hieuViSaoCua(chua.h, chua.nguoi.A.cookie),
			} satisfies Record<CaHieu, () => Promise<TraLoi>>;
			const truoc = await dem("okrHoiYHieu");
			const nhan: { ca: string; maHttp: number; cau: string }[] = [];
			for (const c of TRA_HIEU_LOI) {
				const t = await CHAY_HIEU[c.ca]();
				nhan.push({ ca: c.ca, maHttp: t.status, cau: t.loi });
			}
			expect(nhan).toEqual([...TRA_HIEU_LOI]);
			expect(await dem("okrHoiYHieu")).toBe(truoc);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ket-qua: khai không viết trước — công bố được dù chủ đề chọn chưa khai nối; ketQua {cau [], them 3, boQua true}, ba chủ đề chọn đều nối «mới», vietBoi là P; A vẫn thấy hành trình đủ",
		async () => {
			const g = await gieoDu({ boQua: true });
			datDongHo(tCongBo());
			const tra = ok<{ mucTieuIds: string[] }>(
				await congBoCua(g.h, g.nguoi.P.cookie),
				"cong bo",
			);
			const doc = await docHoiY(g.ky, g.nguoi.A.cookie);
			expect({
				cau: doc?.ketQua?.cau,
				doi: doc?.ketQua?.doi,
				them: doc?.ketQua?.them,
				boQua: doc?.ketQua?.boQua,
				vietBoi: doc?.ketQua?.vietBoi,
				noi: doc?.ketQua?.chon.map((c) => c.noiBanTruoc),
				objectiveId: doc?.ketQua?.chon.map((c) => c.objectiveId),
				y: doc?.cuaToi.y.map((y) => y.objectiveId),
			}).toEqual({
				cau: [],
				doi: 0,
				them: CHON_DU.length,
				boQua: true,
				vietBoi: await tenNguoi(g.nguoi.P.id),
				noi: CHON_DU.map(() => "moi"),
				objectiveId: tra.mucTieuIds,
				y: [tra.mucTieuIds[0] ?? null, null],
			});
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ket-qua: trước công bố cuaToi.y không lộ chủ đề, kết luận, lý do, mục tiêu, mốc vào chủ đề và mốc kết luận cho A, T, O, P, Q; ketQua null; chỉ người chọn thấy congBoDuoc và danh sách điều còn thiếu — quản trị khác, thành viên và vai okr luôn nhận danh sách rỗng, kể cả khi lần hỏi ý chưa đủ điều kiện",
		async () => {
			datDongHo(LUC);
			const mo = await gieoHoiY({ yCua: ["A", "T"] });
			const gom = await gieoDu();
			const thieu = await gieoDu({ chuaKetLuan: ["K4"] });
			ok(
				await ketLuanCua(
					thieu.k.K3,
					{ ...KET_LUAN_DU.K3, noiBanTruoc: null },
					thieu.nguoi.P.cookie,
				),
				"P bo noi ban truoc",
			);
			const XEM = [
				["dang-mo", "dang-mo", mo, []],
				["dang-gom", "dang-gom", gom, []],
				[
					"dang-gom-thieu",
					"dang-gom",
					thieu,
					[
						{ ma: "thieu-ket-luan", chuDeId: thieu.k.K4 },
						{ ma: "thieu-noi-ban-truoc", chuDeId: thieu.k.K3 },
					],
				],
			] as const;
			const VAI = ["A", "T", "O", "P", "Q"] as const;
			const SO_Y = {
				"dang-mo": { A: 1, T: 1, O: 0, P: 0, Q: 0 },
				"dang-gom": { A: 2, T: 1, O: 0, P: 0, Q: 0 },
			} as const;
			const ra: unknown[] = [];
			const kyVong: unknown[] = [];
			for (const [nhan, trangThai, g, dieuThieu] of XEM)
				for (const vai of VAI) {
					const doc = await docHoiY(g.ky, g.nguoi[vai].cookie);
					ra.push({
						nhan,
						vai,
						dung: doc?.trangThai === trangThai,
						y: doc?.cuaToi.y.map((y) => ({
							chuDe: y.chuDe,
							ketLuan: y.ketLuan,
							lyDo: y.lyDo,
							objectiveId: y.objectiveId,
							vaoChuDeLuc: y.hanhTrinh.vaoChuDeLuc,
							ketLuanLuc: y.hanhTrinh.ketLuanLuc,
							coGopLuc: y.hanhTrinh.gopLuc.length > 0,
						})),
						ketQua: doc?.ketQua,
						congBoDuoc: doc?.quyen.congBoDuoc,
						lyDoChuaCongBo: doc?.quyen.lyDoChuaCongBo,
					});
					kyVong.push({
						nhan,
						vai,
						dung: true,
						y: Array.from({ length: SO_Y[trangThai][vai] }, () => ({
							chuDe: null,
							ketLuan: null,
							lyDo: null,
							objectiveId: null,
							vaoChuDeLuc: null,
							ketLuanLuc: null,
							coGopLuc: true,
						})),
						ketQua: null,
						congBoDuoc: nhan === "dang-gom" && vai === "P",
						lyDoChuaCongBo: vai === "P" ? dieuThieu : [],
					});
				}
			console.log(`ket-qua: đã chạy ${ra.length}/${XEM.length * VAI.length} ô`);
			expect(ra).toEqual(kyVong);
		},
		CHO_MA_TRAN_MS,
	);
});

describe("nhac", () => {
	const GOP = "okr-hoi-y-gop";
	const CONG_BO = "okr-hoi-y-cong-bo";
	const SUKIEN_MS = OKR_NHAC.suKienGio * OKR.thoiGian.gioMs;

	async function bangNhac(
		nguoi: Record<string, Nguoi>,
		now: Date,
		hoiYIds: string[],
	): Promise<Record<string, string[]>> {
		const svc = ungDung().get(OkrTraoDoiService);
		const ra: Record<string, string[]> = {};
		for (const [ten, ai] of Object.entries(nguoi)) {
			const { viec } = await svc.viecCuaToi(ai.id, now);
			ra[ten] = viec
				.filter(
					(v) =>
						(v.loai === GOP || v.loai === CONG_BO) &&
						hoiYIds.includes(v.hoiYId),
				)
				.map((v) => v.loai)
				.sort();
		}
		return ra;
	}

	async function muc(ai: Nguoi, now: Date, hoiYId?: string) {
		const { viec } = await ungDung()
			.get(OkrTraoDoiService)
			.viecCuaToi(ai.id, now);
		return viec.filter(
			(v) =>
				(v.loai === GOP || v.loai === CONG_BO) &&
				(hoiYId === undefined || v.hoiYId === hoiYId),
		);
	}

	const coMuc = (bang: Record<string, string[]>, loai: string) =>
		Object.entries(bang)
			.filter(([, ds]) => ds.includes(loai))
			.map(([ten]) => ten)
			.sort();

	const RONG = { Q: [], P: [], T: [], O: [], A: [], B: [], R: [], L: [] };

	test(
		"nhac: lần hỏi ý đang mở — A, O và quản trị Q chưa góp mỗi người đúng một mục «đang chờ bạn góp» kèm tên chu kỳ và hạn; B, T đã góp, P người chọn, R và L đã rời không có; đúng hạn thì hết mục",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY({ yCua: ["T", "B", "R"] });
			const L = await nguoiCo("hoi-y-L", "member");
			await roiDi(g.nguoi.R.id);
			await roiDi(L.id);
			const nguoi = { ...g.nguoi, L };
			const hang = await db.okrHoiY.findUniqueOrThrow({
				where: { id: g.h },
				select: { hanLuc: true, cycle: { select: { name: true } } },
			});
			const mot = sauGio(LUC, 1);

			const luc1 = await bangNhac(nguoi, mot, [g.h]);
			expect(luc1).toEqual({ ...RONG, Q: [GOP], O: [GOP], A: [GOP] });
			const e10 = new Set(["A", "B", "O", "P", "R"]);
			expect(coMuc(luc1, GOP).filter((t) => e10.has(t))).toEqual(["A", "O"]);
			expect(await muc(g.nguoi.A, mot, g.h)).toEqual([
				{
					loai: GOP,
					hoiYId: g.h,
					cycleId: g.ky,
					nhan: hang.cycle.name,
					hanLuc: hang.hanLuc.toISOString(),
				},
			]);

			expect(
				await bangNhac(nguoi, lechMs(hang.hanLuc, -MOT_MS), [g.h]),
			).toEqual({ ...RONG, Q: [GOP], O: [GOP], A: [GOP] });
			expect(await bangNhac(nguoi, hang.hanLuc, [g.h])).toEqual(RONG);
			expect(await bangNhac(nguoi, sauGio(hang.hanLuc, 5), [g.h])).toEqual(
				RONG,
			);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"nhac: dời hạn về bây giờ thì không ai còn mục «đang chờ bạn góp»; công bố lúc t — trong cửa sổ 24 giờ chỉ B và T đã góp còn là thành viên có đúng một mục «đã công bố», ngoài cửa sổ hai đầu thì không",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY({ yCua: ["T", "B", "R"] });
			const L = await nguoiCo("hoi-y-L", "member");
			await roiDi(g.nguoi.R.id);
			await roiDi(L.id);
			const nguoi = { ...g.nguoi, L };
			const t = sauGio(LUC, 3);
			datDongHo(t);
			await donHanVeBayGio(g);

			expect(await bangNhac(nguoi, t, [g.h])).toEqual(RONG);

			const h = await gieoCongBo(g.h);
			expect(h.congBoLuc).toEqual(t);
			const trong = { ...RONG, B: [CONG_BO], T: [CONG_BO] };
			const sau = await bangNhac(nguoi, sauGio(t, 1), [g.h]);
			expect(sau).toEqual(trong);
			expect(
				coMuc(sau, CONG_BO).filter((x) =>
					["A", "B", "O", "P", "R"].includes(x),
				),
			).toEqual(["B"]);
			expect(await muc(g.nguoi.B, sauGio(t, 1), g.h)).toEqual([
				{
					loai: CONG_BO,
					hoiYId: g.h,
					cycleId: g.ky,
					nhan: (await db.okrCycle.findUniqueOrThrow({ where: { id: g.ky } }))
						.name,
				},
			]);
			expect(
				await bangNhac(nguoi, lechMs(t, SUKIEN_MS - MOT_MS), [g.h]),
			).toEqual(trong);
			expect(await bangNhac(nguoi, lechMs(t, SUKIEN_MS), [g.h])).toEqual(RONG);
			expect(await bangNhac(nguoi, lechMs(t, -MOT_MS), [g.h])).toEqual(RONG);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"nhac: hai lần hỏi ý cùng mở — mục tính theo từng lần: người đã góp lần này vẫn nhận mục của lần kia, người chọn lần này nhận mục của lần kia",
		async () => {
			datDongHo(LUC);
			const g1 = await gieoHoiY({ yCua: ["B"] });
			const g2 = await gieoHoiY({ yCua: ["A"] });
			const mot = sauGio(LUC, 1);
			const cua = async (ai: Nguoi) =>
				(await muc(ai, mot))
					.map((v) => (v.loai === GOP ? `${v.loai}:${v.hoiYId}` : v.loai))
					.filter((x) => x.endsWith(g1.h) || x.endsWith(g2.h))
					.sort();
			expect({
				B1: await cua(g1.nguoi.B),
				A2: await cua(g2.nguoi.A),
				P1: await cua(g1.nguoi.P),
				P2: await cua(g2.nguoi.P),
				T1: await cua(g1.nguoi.T),
			}).toEqual({
				B1: [`${GOP}:${g2.h}`],
				A2: [`${GOP}:${g1.h}`],
				P1: [`${GOP}:${g2.h}`],
				P2: [`${GOP}:${g1.h}`],
				T1: [`${GOP}:${g1.h}`, `${GOP}:${g2.h}`].sort(),
			});
		},
		CHO_MA_TRAN_MS,
	);
});

describe("tu-lai", () => {
	const quyenCua = async (ky: string, cookie: string) => {
		const doc = hoiYDocOutput.parse(
			ok(await goiQuery("okr.hoiY", cookie, { cycleId: ky }), "doc hoi y"),
		);
		if (!doc) throw new Error("khong co hoi y");
		return doc.quyen;
	};

	test(
		"tu-lai: người chọn không bấm «Tôi cũng nghĩ vậy» — dongY bật hay tắt đều 400 câu ghim, bảng không đổi; hoiY trả quyen.dongYDuoc: thành viên và quản trị khác true, người chọn false, sau hạn false",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY({ niemPhong: true });
			const { A, P, Q, T: tv } = g.nguoi;
			const y1 = (await gieoY(g.h, A.id)).id;
			ok(await dongYCua(y1, tv.cookie), "T dong y");
			const soHang = () => db.okrYDongY.count({ where: { yId: y1 } });
			const truoc = await soHang();
			const bat = await dongYCua(y1, P.cookie);
			const tat = await dongYCua(y1, P.cookie, false);
			const dongYDuoc = async (cookie: string) =>
				(await quyenCua(g.ky, cookie)).dongYDuoc;
			const dangMo = {
				T: await dongYDuoc(tv.cookie),
				Q: await dongYDuoc(Q.cookie),
				P: await dongYDuoc(P.cookie),
			};
			await donHanVeBayGio(g);
			expect({
				truoc,
				bat: { maHttp: bat.status, cau: bat.loi },
				tat: { maHttp: tat.status, cau: tat.loi },
				sau: await soHang(),
				dangMo,
				sauHan: { T: await dongYDuoc(tv.cookie) },
			}).toEqual({
				truoc: 1,
				bat: { maHttp: 400, cau: T.nguoiChonKhongDongY },
				tat: { maHttp: 400, cau: T.nguoiChonKhongDongY },
				sau: 1,
				dangMo: { T: true, Q: true, P: false },
				sauHan: { T: false },
			});
		},
		CHO_MS,
	);

	test(
		"tu-lai: sheet sửa hỏi cờ khoá của máy chủ — cauHoiKhoa từ ý đầu tiên (đổi câu hỏi 400 cauHoiDaKhoa); nguoiChonKhoa khi người chọn đã niêm phong và còn là quản trị (đổi người chọn 400 daNiemPhong), hết khi người chọn bị hạ vai",
		async () => {
			datDongHo(LUC);
			const g = await gieoHoiY();
			const { A, P, Q } = g.nguoi;
			const co = async (buoc: string) => {
				const q = await quyenCua(g.ky, Q.cookie);
				return { buoc, cauHoi: q.cauHoiKhoa, nguoiChon: q.nguoiChonKhoa };
			};
			const buoc = [await co("chua co y")];
			await gieoY(g.h, A.id);
			buoc.push(await co("co y"));
			const doiCau = await goi(
				"okr.suaHoiY",
				{ hoiYId: g.h, cauHoi: "Năm tới công ty nên dồn sức vào đâu trước?" },
				Q.cookie,
			);
			await gieoBanTruoc(g.h, P.id);
			buoc.push(await co("da niem phong"));
			const vaiKhac = {
				nguoiChon: (await quyenCua(g.ky, P.cookie)).nguoiChonKhoa,
				thanhVien: (await quyenCua(g.ky, g.nguoi.T.cookie)).nguoiChonKhoa,
			};
			const doiNguoi = await goi(
				"okr.suaHoiY",
				{ hoiYId: g.h, nguoiChonUserId: Q.id },
				Q.cookie,
			);
			await doiVai(P.id, "member");
			buoc.push(await co("nguoi chon ha vai"));
			expect({
				buoc,
				vaiKhac,
				doiCau: { maHttp: doiCau.status, cau: doiCau.loi },
				doiNguoi: { maHttp: doiNguoi.status, cau: doiNguoi.loi },
			}).toEqual({
				vaiKhac: { nguoiChon: true, thanhVien: false },
				buoc: [
					{ buoc: "chua co y", cauHoi: false, nguoiChon: false },
					{ buoc: "co y", cauHoi: true, nguoiChon: false },
					{ buoc: "da niem phong", cauHoi: true, nguoiChon: true },
					{ buoc: "nguoi chon ha vai", cauHoi: true, nguoiChon: false },
				],
				doiCau: { maHttp: 400, cau: T.cauHoiDaKhoa },
				doiNguoi: { maHttp: 400, cau: T.daNiemPhong },
			});
		},
		CHO_MS,
	);
});
