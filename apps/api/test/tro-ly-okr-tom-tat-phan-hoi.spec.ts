import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { MINUTE_MS, NGAY_MS } from "@crm/db/okr-tro-ly-danh-muc";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR } from "../src/okr/okr-config";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	nguoi,
	tienDongHo,
} from "./tro-ly-okr-san";
import {
	cauLanh,
	cookieCua,
	type Duong,
	docTomTat,
	donTomTat,
	ghiBan,
	goiCua,
	goiQua,
	HAI_DUONG,
	KY,
	LUC,
	motNguonMoiKr,
	nguoiNgoai,
	pb,
	phongCoNguon,
	QUAN_TRI,
	SAU,
	TUAN,
	thanhVienCua,
	truongCua,
} from "./tro-ly-okr-tom-tat-san";

const KHONG_XEM = ["bat-can-xem", "an-hien", "phong-tat"] as const;
type KhongXem = (typeof KHONG_XEM)[number];

let app: NestExpressApplication;
let banB = "";
let phongB = "";
const banKhac = {} as Record<KhongXem, string>;
type NguoiXem = { tv: string; truong: string; ngoai: string; okr: string };
let nguoiXem: NguoiXem;

const phanHoi = async (
	ma: string,
	duong: Duong,
	tomTatId: string,
	huuIch: boolean,
) => goiQua(app, "phanHoi", duong, { tomTatId, huuIch }, await cookieCua(ma));

const hangCua = (tomTatId: string, ma?: string) =>
	db.okrTomTatPhanHoi.findMany({
		where: ma ? { tomTatId, userId: nguoi(ma) } : { tomTatId },
		select: { userId: true, huuIch: true },
	});

beforeAll(async () => {
	await batDauMau();
	await donTomTat();
	app = await dungUngDung();
	const coNguon = await phongCoNguon(1);
	const [b, c, a, d] = coNguon.map((p) => p.ma);
	if (!b || !c || !a || !d)
		throw new Error(`bo mau thieu phong co cap nhat: ${coNguon.length}`);
	phongB = b;
	nguoiXem = {
		tv: thanhVienCua(b)[0] ?? "",
		truong: truongCua(b),
		ngoai: nguoiNgoai([b, c, a, d], "member"),
		okr: nguoiNgoai([b, c, a, d], "okr"),
	};
	datDongHo(new Date(LUC.getTime() - 10 * MINUTE_MS));
	await ghiCauHinh(app, await cookieCua(QUAN_TRI), {
		aiOn: true,
		aiTomTatPhamVi: "danh-sach",
		aiTomTatDonVi: [pb(b), pb(c)],
		aiTomTatAnPhamVi: "danh-sach",
		aiTomTatAnDonVi: [pb(a)],
	});
	datDongHo(SAU(MINUTE_MS));
	const nguonDau = async (ma: string) => {
		const goi = await goiCua(pb(ma));
		const n = goi ? motNguonMoiKr(goi)[0] : undefined;
		if (!n) throw new Error(`phong ${ma} khong co nguon`);
		return n.id;
	};
	const ghi = {
		b: await ghiBan({
			ma: "ph-b",
			departmentId: pb(b),
			nac: "bat",
			cau: [cauLanh(0, await nguonDau(b))],
		}),
		c: await ghiBan({
			ma: "ph-c",
			departmentId: pb(c),
			nac: "bat",
			cau: [
				cauLanh(0, await nguonDau(c)),
				{
					vanBan: "Chỉ số của phòng đạt mức 987654.",
					nguon: [await nguonDau(c)],
				},
			],
		}),
		a: await ghiBan({
			ma: "ph-a",
			departmentId: pb(a),
			nac: "an",
			cau: [cauLanh(0, await nguonDau(a))],
		}),
		d: await ghiBan({
			ma: "ph-d",
			departmentId: pb(d),
			nac: "bat",
			cau: [cauLanh(0, await nguonDau(d))],
		}),
	};
	expect([ghi.b, ghi.c, ghi.a, ghi.d].map((g) => g.trangThai)).toEqual([
		"hien",
		"can-xem",
		"hien",
		"hien",
	]);
	banB = ghi.b.id;
	banKhac["bat-can-xem"] = ghi.c.id;
	banKhac["an-hien"] = ghi.a.id;
	banKhac["phong-tat"] = ghi.d.id;
	datDongHo(SAU(30 * MINUTE_MS));
}, CHO_DB);

afterAll(async () => {
	await donTomTat();
	await ketThucMau(app);
}, CHO_DB);

describe("phan-hoi", () => {
	test(
		"mot-nguoi: bấm hữu ích (tRPC) rồi không hữu ích (REST) → đúng một hàng mang false; bản đọc lại mang phản hồi cuối",
		async () => {
			const lan1 = await phanHoi(nguoiXem.tv, "trpc", banB, true);
			tienDongHo(MINUTE_MS);
			const lan2 = await phanHoi(nguoiXem.tv, "rest", banB, false);
			const hang = await hangCua(banB, nguoiXem.tv);
			expect(
				lan1.status === 200 && lan2.status === 200 && hang.length === 1
					? "mot hang"
					: `phan hoi trung: ${lan1.status} ${lan2.status} ${lan2.loi} / ${hang.length} hang`,
			).toBe("mot hang");
			expect({ lan1: lan1.data, lan2: lan2.data }).toEqual({
				lan1: { ok: true },
				lan2: { ok: true },
			});
			expect(hang.map((h) => h.huuIch)).toEqual([false]);
			const doc = await docTomTat(
				app,
				"trpc",
				await cookieCua(nguoiXem.tv),
				{ cycleId: KY, departmentId: pb(phongB) },
				"doc lai",
			);
			expect(doc.ban?.phanHoiCuaToi).toBe(false);
		},
		CHO_DB,
	);

	test(
		"hai-nguoi: người thứ hai bấm hai lần qua REST rồi tRPC → hai hàng cho bản, mỗi người một",
		async () => {
			const lan1 = await phanHoi(nguoiXem.truong, "rest", banB, true);
			const lan2 = await phanHoi(nguoiXem.truong, "trpc", banB, true);
			expect([lan1.status, lan2.status]).toEqual([200, 200]);
			const hang = await hangCua(banB);
			expect(hang.map((h) => `${h.userId} ${h.huuIch}`).sort()).toEqual(
				[
					`${nguoi(nguoiXem.tv)} false`,
					`${nguoi(nguoiXem.truong)} true`,
				].sort(),
			);
		},
		CHO_DB,
	);

	test(
		"khong-xem-duoc: bản cần xem, bản ẩn, phòng nấc tắt → NotFound có tên qua tRPC và REST, không hàng mới",
		async () => {
			const thuc: string[] = [];
			const muon: string[] = [];
			for (const loai of KHONG_XEM)
				for (const ma of [nguoiXem.tv, nguoiXem.ngoai, nguoiXem.okr])
					for (const duong of HAI_DUONG) {
						const id = banKhac[loai];
						const tra = await phanHoi(ma, duong, id, true);
						thuc.push(`${loai} ${ma} ${duong}: ${tra.status} ${tra.loi}`);
						muon.push(
							`${loai} ${ma} ${duong}: 404 ${OKR.thongDiep.troLy.khongCoTomTat(id)}`,
						);
					}
			expect(thuc).toEqual(muon);
			expect(
				await db.okrTomTatPhanHoi.count({
					where: { tomTatId: { in: Object.values(banKhac) } },
				}),
			).toBe(0);
		},
		CHO_DB,
	);

	const tuChoi = async (tomTatId: string) => {
		const thuc: string[] = [];
		const muon: string[] = [];
		for (const ma of [nguoiXem.tv, nguoiXem.truong])
			for (const duong of HAI_DUONG) {
				const tra = await phanHoi(ma, duong, tomTatId, true);
				thuc.push(`${ma} ${duong}: ${tra.status} ${tra.loi}`);
				muon.push(
					`${ma} ${duong}: 404 ${OKR.thongDiep.troLy.khongCoTomTat(tomTatId)}`,
				);
			}
		return { thuc, muon };
	};

	test(
		"phong-luu-tru: phòng của bản bị lưu trữ → NotFound có tên qua tRPC và REST, không hàng mới",
		async () => {
			const truoc = await hangCua(banB);
			await db.department.update({
				where: { id: pb(phongB) },
				data: { archivedAt: new Date() },
			});
			try {
				const { thuc, muon } = await tuChoi(banB);
				expect(thuc).toEqual(muon);
			} finally {
				await db.department.update({
					where: { id: pb(phongB) },
					data: { archivedAt: null },
				});
			}
			expect(await hangCua(banB)).toEqual(truoc);
		},
		CHO_DB,
	);

	test(
		"ban-bi-thay: phòng có bản của tuần mới hơn → phản hồi vào bản cũ NotFound có tên, không hàng mới; bản mới nhận phản hồi",
		async () => {
			const truoc = await hangCua(banB);
			const tuanMoi = new Date(
				new Date(`${TUAN}T00:00:00Z`).getTime() + 7 * NGAY_MS,
			)
				.toISOString()
				.slice(0, 10);
			const goi = await goiCua(pb(phongB));
			const n = goi ? motNguonMoiKr(goi)[0] : undefined;
			if (!n) throw new Error(`phong ${phongB} khong co nguon`);
			const moi = await ghiBan({
				ma: "ph-b-moi",
				departmentId: pb(phongB),
				nac: "bat",
				tuan: tuanMoi,
				cau: [cauLanh(1, n.id)],
			});
			expect(moi.trangThai).toBe("hien");
			tienDongHo(MINUTE_MS);
			const { thuc, muon } = await tuChoi(banB);
			expect(thuc).toEqual(muon);
			expect(await hangCua(banB)).toEqual(truoc);
			const dung = await phanHoi(nguoiXem.tv, "trpc", moi.id, true);
			expect(dung.status).toBe(200);
			expect(await hangCua(moi.id, nguoiXem.tv)).toEqual([
				{ userId: nguoi(nguoiXem.tv), huuIch: true },
			]);
		},
		CHO_DB,
	);
});
