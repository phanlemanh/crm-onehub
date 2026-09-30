import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { capNhatPhien } from "@crm/db/okr-cuoc-soan";
import type { DaCat } from "@crm/validation/okr-cuoc-soan";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { z } from "zod";
import type {
	SoanAnOutput,
	SoanDuaVaoOutput,
	SoanSoDoOutput,
	SoDoSoanNac,
} from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import {
	CHU_KY_Q4,
	DON_VI,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	gieoDongNhap,
	goiSoan,
	NAC_SOAN,
	REST_SOAN,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	goi,
	goiRest,
	ketThucMau,
	MOC_MAU,
	ok,
	phienMau,
	TIEN_TO_TLO,
} from "./tro-ly-okr-san";

const RANG = join(
	import.meta.dir,
	"../../../_acceptance/soan-okr-cung-tro-ly/rang",
);
const SQL = [
	"cuoc-hoan-tat.sql",
	"ty-le-nhan.sql",
	"nhap-cong-bo.sql",
	"chi-phi-moi-cuoc.sql",
	"do-tre-luot.sql",
];
const NGAY = 24 * 3600 * 1000;
const GIO = 3600 * 1000;
const TIEN_TO_SU_KIEN = `${TIEN_TO_TLO}su-kien-`;
const luc = (ngay: number, ms = 0) =>
	new Date(MOC_MAU.getTime() + GIO + ngay * NGAY + ms);

const bangSo = z.record(z.string(), z.number());
const hangSql = z.record(
	z.string(),
	z.union([z.number(), z.string(), z.null(), bangSo]),
);
type Hang = z.infer<typeof hangSql>;
type Nac = "bat" | "an";

let app: NestExpressApplication;
let cTruong = "";
let cNam = "";
let cQuanTri = "";
const cuoc = { b1: "", b2: "", b3: "", a1: "", a2: "" };
const dongB2 = { bac: "", loai: "" };
let krSua = "";
const DA_CAT_B2: DaCat = {
	buoc: ["3-tom-gon", "3-kr"],
	truocToken: 18_400,
	sauToken: 16_900,
	chienLuocCatKyTu: 1_250,
};

async function chaySql(ten: string): Promise<Hang[]> {
	const sql = readFileSync(join(RANG, ten), "utf8");
	return db.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT set_config('okr.chu_ky', ${CHU_KY_Q4}, true)`;
		return z.array(hangSql).parse(await tx.$queryRawUnsafe(sql));
	});
}

async function soDoSql(): Promise<Record<Nac, Hang>> {
	const tatCa: Hang[] = [];
	for (const ten of SQL) {
		const hang = await chaySql(ten);
		expect(
			hang.map((h) => h.nac),
			`${ten}: hai hang bat, an`,
		).toEqual(["bat", "an"]);
		tatCa.push(...hang);
	}
	const gop = (nac: Nac) =>
		hangSql.parse(
			Object.fromEntries(
				tatCa.filter((h) => h.nac === nac).flatMap((h) => Object.entries(h)),
			),
		);
	return { bat: gop("bat"), an: gop("an") };
}

const TRUONG_SQL: [keyof SoDoSoanNac, string][] = [
	["cuocMo", "cuoc_mo"],
	["cuocDuaVao", "cuoc_dua_vao"],
	["donViCoCuoc", "don_vi_co_cuoc"],
	["donViHoanTat", "don_vi_hoan_tat"],
	["tyLeDonViHoanTat", "ty_le_don_vi_hoan_tat"],
	["daHien", "da_hien"],
	["dongNhan", "nhan"],
	["dongSua", "sua"],
	["dongBac", "bac"],
	["tyLeDuocNhan", "ty_le_duoc_nhan"],
	["dongBiLoai", "bi_loai"],
	["mucTieuNhap", "muc_tieu_nhap"],
	["mucTieuCongBo14Ngay", "cong_bo_14_ngay"],
	["tyLeCongBo14Ngay", "ty_le_cong_bo_14_ngay"],
	["tienUsd", "tien_usd"],
	["chiPhiMoiCuocUsd", "chi_phi_moi_cuoc_usd"],
	["p50Ms", "p50_ms"],
	["p90Ms", "p90_ms"],
];

const xepKhoa = (o: Record<string, number>) =>
	JSON.stringify(Object.fromEntries(Object.entries(o).sort()));

function lechApiSql(api: SoanSoDoOutput, sql: Record<Nac, Hang>): string[] {
	const lech: string[] = [];
	for (const nac of ["bat", "an"] as const) {
		for (const [k, cot] of TRUONG_SQL)
			if (api[nac][k] !== sql[nac][cot])
				lech.push(
					`lech cot: ${cot} (${nac}: api ${JSON.stringify(api[nac][k])}, sql ${JSON.stringify(sql[nac][cot])})`,
				);
		const theoMa = Object.fromEntries(
			api[nac].theoMa.map((m) => [m.maLoai, m.so]),
		);
		const theoMaSql = bangSo.parse(sql[nac].theo_ma);
		if (xepKhoa(theoMa) !== xepKhoa(theoMaSql))
			lech.push(
				`lech cot: theo_ma (${nac}: api ${xepKhoa(theoMa)}, sql ${xepKhoa(theoMaSql)})`,
			);
	}
	return lech;
}

async function duaVaoThat(
	id: string,
	cookie: string,
	kr: { deXuatId: string; khoiDiem: number; dich: number }[],
): Promise<string[]> {
	const kq = ok<SoanDuaVaoOutput>(
		await goiSoan(
			app,
			"soanDuaVao",
			"trpc",
			{ cuocSoanId: id, kr } as never,
			cookie,
		),
		"dua vao",
	);
	if (!kq.ok) throw new Error(`dua vao: ${kq.lyDo} ${kq.chiTiet ?? ""}`);
	return kq.mucTieuIds;
}

async function gieoLuot(
	sessionId: string,
	suKien: [loai: string, lucPhat: Date][],
): Promise<void> {
	await db.agentEvent.createMany({
		data: suKien.map(([type, emittedAt], i) => ({
			id: `${TIEN_TO_SU_KIEN}${sessionId}-${i}`,
			sessionId,
			type,
			data: {},
			emittedAt,
		})),
	});
}

async function dungCanh(): Promise<void> {
	datDongHo(luc(0));
	const b1 = await gieoCuoc({
		donVi: DON_VI.kdBac,
		nguoiMo: "nguyen-thi-lan",
	});
	cuoc.b1 = b1.id;
	const phienThuLai = `${b1.sessionId}-thu-lai`;
	expect(await capNhatPhien(db, b1.id, phienThuLai)).toEqual({ doi: true });
	const [m1, m2] = await gieoDongNhap(
		b1,
		[
			{
				loai: "muc-tieu-moi",
				khoa: "m1",
				ten: "Bán lẻ miền Bắc ký đều mỗi tháng",
			},
			{ loai: "muc-tieu-moi", khoa: "m2", ten: "Đối tác cũ quay lại đặt hàng" },
		],
		"nhan",
	);
	const [k1] = await gieoDongNhap(
		b1,
		[
			{
				loai: "kr-moi",
				khoa: "k1",
				chaKhoa: "m1",
				ten: "Hợp đồng bán lẻ ký mới",
				kieu: "tang-toi",
			},
		],
		"sua",
		{ giaTriCuoi: "Hợp đồng bán lẻ ký mới trong tháng" },
	);
	const [k2] = await gieoDongNhap(
		b1,
		[
			{
				loai: "kr-moi",
				khoa: "k2",
				chaKhoa: "m2",
				ten: "Đối tác cũ đặt lại",
				kieu: "tang-toi",
			},
		],
		"sua",
		{ giaTriCuoi: "Đối tác cũ đặt lại trong quý" },
	);
	await gieoDongNhap(
		b1,
		[{ loai: "muc-tieu-moi", khoa: "m3", ten: "Mục tiêu bị bác" }],
		"bac",
	);
	await gieoDongNhap(
		b1,
		[{ loai: "muc-tieu-moi", khoa: "m4", ten: "Kho miền Bắc giao trong ngày" }],
		"nhan",
	);
	const [k4] = await gieoDongNhap(
		b1,
		[
			{
				loai: "kr-moi",
				khoa: "k4",
				chaKhoa: "m4",
				ten: "Đơn giao trong ngày",
				kieu: "tang-toi",
			},
		],
		"nhan",
	);
	await db.okrDeXuat.updateMany({
		where: { cuocSoanId: b1.id },
		data: { hienLuc: luc(0) },
	});
	expect(m1 && m2).toBeTruthy();
	const [mtA, mtB, mtC] = await duaVaoThat(b1.id, cTruong, [
		{ deXuatId: k1 ?? "", khoiDiem: 0, dich: 10 },
		{ deXuatId: k2 ?? "", khoiDiem: 0, dich: 8 },
		{ deXuatId: k4 ?? "", khoiDiem: 20, dich: 60 },
	]);
	krSua =
		(await db.okrDeXuat.findUniqueOrThrow({ where: { id: k1 ?? "" } }))
			.taoRaId ?? "";
	datDongHo(luc(3));
	ok(
		await goi(
			app,
			"okr.publishObjective",
			"mutation",
			{ id: mtA ?? "" },
			cTruong,
		),
		"cong bo 3 ngay",
	);
	datDongHo(luc(5));
	await ghiCauHinh(app, cQuanTri, { duyetCongBo: true });
	ok(
		await goi(app, "okr.guiDuyet", "mutation", { id: mtC ?? "" }, cTruong),
		"gui duyet 5 ngay",
	);
	await ghiCauHinh(app, cQuanTri, { duyetCongBo: false });
	expect(
		await db.okrObjective.findUniqueOrThrow({
			where: { id: mtC ?? "" },
			select: { status: true, publishedAt: true },
		}),
	).toEqual({ status: "cho-duyet", publishedAt: null });
	datDongHo(luc(20));
	ok(
		await goi(
			app,
			"okr.publishObjective",
			"mutation",
			{ id: mtB ?? "" },
			cTruong,
		),
		"cong bo 20 ngay",
	);
	await gieoChiPhi({
		id: "b1-phien-1",
		taskId: b1.id,
		usd: "0.02",
		tinhNang: "okr.soan",
		sessionId: b1.sessionId,
	});
	await gieoChiPhi({
		id: "b1-phien-2",
		taskId: b1.id,
		usd: "0.03",
		tinhNang: "okr.soan",
		sessionId: phienThuLai,
	});
	await gieoChiPhi({
		id: "b1-khac",
		taskId: null,
		usd: "0.5",
		tinhNang: "okr.de-xuat",
		sessionId: b1.sessionId,
	});
	await gieoLuot(b1.sessionId, [
		["message.received", luc(0, 0)],
		["tool.completed", luc(0, 100)],
		["step.completed", luc(0, 1_200)],
		["step.completed", luc(0, 3_000)],
		["message.received", luc(0, 10_000)],
		["step.completed", luc(0, 14_000)],
	]);
	await gieoLuot(phienThuLai, [
		["message.received", luc(0, 60_000)],
		["step.completed", luc(0, 62_500)],
		["message.received", luc(0, 65_000)],
	]);

	datDongHo(luc(21));
	const b2 = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: "ly-thanh-tam" });
	cuoc.b2 = b2.id;
	const [cho, bac] = await gieoDongNhap(b2, [
		{ loai: "muc-tieu-moi", khoa: "m1", ten: "Miền Nam mở thêm tuyến" },
		{ loai: "muc-tieu-moi", khoa: "m2", ten: "Mục tiêu bị bác ở B2" },
	]);
	await db.okrDeXuat.update({
		where: { id: bac ?? "" },
		data: {
			trangThai: "bac",
			nguoiQuyet: b2.nguoiMoUserId,
			quyetLuc: luc(21),
		},
	});
	await db.okrDeXuat.updateMany({
		where: { id: { in: [cho ?? "", bac ?? ""] } },
		data: { hienLuc: luc(21) },
	});
	const [loai1] = await gieoDongNhap(
		b2,
		[{ loai: "kr-moi", khoa: "x1", chaKhoa: "m1", ten: "KR đạt 100 % ngay" }],
		"bi-loai",
		{ maLoai: "so-moi" },
	);
	await gieoDongNhap(
		b2,
		[{ loai: "kr-moi", khoa: "x2", chaKhoa: "m1", ten: "KR về thưởng quý" }],
		"bi-loai",
		{ maLoai: "tu-cam" },
	);
	await gieoDongNhap(
		b2,
		[{ loai: "kr-moi", khoa: "x3", chaKhoa: "m1", ten: "KR chép cấp trên" }],
		"bi-loai",
		{ maLoai: "so-moi" },
	);
	dongB2.bac = bac ?? "";
	dongB2.loai = loai1 ?? "";
	await db.okrCuocSoan.update({
		where: { id: b2.id },
		data: { daCat: DA_CAT_B2 },
	});
	await gieoChiPhi({
		id: "b2",
		taskId: b2.id,
		usd: "0.01",
		tinhNang: "okr.soan",
		sessionId: b2.sessionId,
	});
	await gieoLuot(b2.sessionId, [
		["step.completed", luc(21, 0)],
		["message.received", luc(21, 500)],
		["step.completed", luc(21, 1_300)],
		["message.received", luc(21, 5_000)],
		["message.received", luc(21, 5_000)],
		["step.completed", luc(21, 6_000)],
	]);
	await gieoLuot(`${TIEN_TO_TLO}phien-ngoai`, [
		["message.received", luc(21, 0)],
		["step.completed", luc(21, 50)],
	]);

	const b3 = await gieoCuoc({
		donVi: DON_VI.kdBac,
		nguoiMo: "nguyen-thi-lan",
	});
	cuoc.b3 = b3.id;
	await db.okrCuocSoan.update({
		where: { id: b3.id },
		data: { trangThai: "bo" },
	});

	datDongHo(luc(22));
	const a1 = await gieoCuoc({
		donVi: DON_VI.taiChinh,
		nguoiMo: "le-hai-dang",
		nac: "an",
	});
	cuoc.a1 = a1.id;
	await gieoDongNhap(
		a1,
		[{ loai: "muc-tieu-moi", khoa: "m1", ten: "Đóng sổ nhanh hơn" }],
		"nhan",
	);
	const [ak] = await gieoDongNhap(
		a1,
		[
			{
				loai: "kr-moi",
				khoa: "k1",
				chaKhoa: "m1",
				ten: "Số ngày đóng sổ",
				kieu: "giam-xuong",
				donVi: "ngày",
			},
		],
		"nhan",
	);
	await db.okrDeXuat.updateMany({
		where: { cuocSoanId: a1.id },
		data: { hienLuc: luc(22) },
	});
	await duaVaoThat(a1.id, cQuanTri, [
		{ deXuatId: ak ?? "", khoiDiem: 9, dich: 5 },
	]);
	await gieoChiPhi({
		id: "a1",
		taskId: a1.id,
		usd: "0.015",
		tinhNang: "okr.soan",
		sessionId: a1.sessionId,
	});
	await gieoLuot(a1.sessionId, [
		["message.received", luc(22, 0)],
		["step.completed", luc(22, 6_000)],
	]);
	const a2 = await gieoCuoc({
		donVi: DON_VI.hoTro,
		nguoiMo: "le-hai-dang",
		nac: "an",
	});
	cuoc.a2 = a2.id;
	await gieoDongNhap(a2, [
		{ loai: "muc-tieu-moi", khoa: "m1", ten: "Chờ quyết" },
	]);
}

const TAY_BAT: SoDoSoanNac = {
	cuocMo: 3,
	cuocDuaVao: 1,
	donViCoCuoc: 2,
	donViHoanTat: 1,
	tyLeDonViHoanTat: 0.5,
	daHien: 9,
	dongNhan: 4,
	dongSua: 2,
	dongBac: 2,
	tyLeDuocNhan: 0.6667,
	dongBiLoai: 3,
	theoMa: [
		{ maLoai: "so-moi", so: 2 },
		{ maLoai: "tu-cam", so: 1 },
	],
	mucTieuNhap: 3,
	mucTieuCongBo14Ngay: 1,
	tyLeCongBo14Ngay: 0.3333,
	tienUsd: 0.06,
	chiPhiMoiCuocUsd: 0.02,
	p50Ms: 1_200,
	p90Ms: 3_400,
};
const TAY_AN: SoDoSoanNac = {
	cuocMo: 2,
	cuocDuaVao: 1,
	donViCoCuoc: 2,
	donViHoanTat: 1,
	tyLeDonViHoanTat: 0.5,
	daHien: 2,
	dongNhan: 2,
	dongSua: 0,
	dongBac: 0,
	tyLeDuocNhan: 1,
	dongBiLoai: 0,
	theoMa: [],
	mucTieuNhap: 1,
	mucTieuCongBo14Ngay: 0,
	tyLeCongBo14Ngay: 0,
	tienUsd: 0.015,
	chiPhiMoiCuocUsd: 0.0075,
	p50Ms: 6_000,
	p90Ms: 6_000,
};

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cTruong = await phienMau("nguyen-thi-lan");
	cNam = await phienMau("ly-thanh-tam");
	cQuanTri = await phienMau("le-hai-dang");
	await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
	await dungCanh();
	datDongHo(luc(25));
}, CHO_DB);

afterAll(async () => {
	await db.agentEvent.deleteMany({
		where: { id: { startsWith: TIEN_TO_SU_KIEN } },
	});
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("so-do-soan", () => {
	test(
		"okr.soanSoDo bằng năm câu SQL từng số, tách bat/an, bằng số viết tay; chi phí cuộc hai phiên là tổng cả hai; độ trễ đọc từ sự kiện phiên",
		async () => {
			const api = ok<SoanSoDoOutput>(
				await goi(
					app,
					"okr.soanSoDo",
					"query",
					{ cycleId: CHU_KY_Q4 },
					cQuanTri,
				),
				"so do",
			);
			const sql = await soDoSql();
			console.log(
				"so-do-soan api:",
				JSON.stringify({ bat: api.bat, an: api.an }),
			);
			console.log("so-do-soan sql:", JSON.stringify(sql));
			const theoCuoc = bangSo.parse(sql.bat.theo_cuoc);
			expect(theoCuoc[cuoc.b1], `thieu phien: ${cuoc.b1}`).toBe(0.05);
			expect(lechApiSql(api, sql)).toEqual([]);
			expect({ bat: api.bat, an: api.an }).toEqual({
				bat: TAY_BAT,
				an: TAY_AN,
			});
			const ganDay = new Map(api.cuocGanDay.map((c) => [c.id, c]));
			expect([...ganDay.keys()].sort()).toEqual(Object.values(cuoc).sort());
			expect(ganDay.get(cuoc.b1)?.chiPhiUsd).toBe(0.05);
			expect(ganDay.get(cuoc.a1)).toMatchObject({
				nac: "an",
				chiPhiUsd: 0.015,
			});
			expect(api.cuocGanDay[0]?.id, "moi nhat truoc").toBe(cuoc.a2);
			expect(
				(
					await goiRest(
						app,
						"GET",
						REST_SOAN.soanSoDo[1],
						{ cycleId: CHU_KY_Q4 },
						cQuanTri,
					)
				).data,
			).toEqual(api);
		},
		CHO_DB,
	);

	test(
		"ngăn một cuộc (soanAn) trả mọi dòng nháp kể cả bi-loai kèm maLoai, chi phí, nấc, bảng đã cắt; chỉ quản trị; mã không có → 404 cùng câu",
		async () => {
			const an = ok<SoanAnOutput>(
				await goi(
					app,
					"okr.soanAn",
					"query",
					{ cuocSoanId: cuoc.b2 },
					cQuanTri,
				),
				"an b2",
			);
			expect(an.cuoc).toMatchObject({
				id: cuoc.b2,
				nac: "bat",
				trangThai: "dang",
				chiPhiUsd: 0.01,
				tenDonVi: "Kinh doanh miền Nam",
			});
			expect(an.daCat).toEqual(DA_CAT_B2);
			expect(an.dong.find((d) => d.id === dongB2.loai)).toMatchObject({
				trangThai: "bi-loai",
				maLoai: "so-moi",
				loai: "kr-moi",
			});
			expect(an.dong.find((d) => d.id === dongB2.bac)?.trangThai).toBe("bac");
			expect(an.dong.filter((d) => d.trangThai === "bi-loai")).toHaveLength(3);
			expect(an.dong).toHaveLength(5);
			expect(new Set(an.dong.map((d) => d.khoaDong)).size).toBe(5);
			const anB1 = ok<SoanAnOutput>(
				await goi(
					app,
					"okr.soanAn",
					"query",
					{ cuocSoanId: cuoc.b1 },
					cQuanTri,
				),
				"an b1",
			);
			expect(anB1.cuoc.chiPhiUsd, "chi phi hai phien, bo okr.de-xuat").toBe(
				0.05,
			);
			expect(anB1.daCat).toBeNull();
			expect(
				(await db.okrCuocSoan.findUniqueOrThrow({ where: { id: cuoc.b1 } }))
					.cacPhien,
			).toHaveLength(2);
			expect(
				(
					await goiRest(
						app,
						"GET",
						REST_SOAN.soanAn[1],
						{ cuocSoanId: cuoc.b2 },
						cQuanTri,
					)
				).data,
			).toEqual(an);
			const khongCo = await goi(
				app,
				"okr.soanAn",
				"query",
				{ cuocSoanId: "khong-co-cuoc-nay" },
				cQuanTri,
			);
			expect([khongCo.status, khongCo.loi]).toEqual([
				404,
				OKR.thongDiep.soan.khongCoCuoc,
			]);
			for (const c of [cTruong, cNam]) {
				for (const tra of [
					await goi(app, "okr.soanAn", "query", { cuocSoanId: cuoc.b2 }, c),
					await goiRest(
						app,
						"GET",
						REST_SOAN.soanAn[1],
						{ cuocSoanId: cuoc.b2 },
						c,
					),
					await goi(app, "okr.soanSoDo", "query", { cycleId: CHU_KY_Q4 }, c),
					await goiRest(
						app,
						"GET",
						REST_SOAN.soanSoDo[1],
						{ cycleId: CHU_KY_Q4 },
						c,
					),
				])
					expect([tra.status, tra.loi]).toEqual([
						403,
						OKR.thongDiep.canQuyenQuanTri,
					]);
			}
		},
		CHO_DB,
	);

	test(
		"so-dich-may-ghi.mjs xanh trên kho này và đỏ với --doi-chung (đối chứng dương), đối chứng không để lại hàng",
		async () => {
			const truoc = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: krSua },
			});
			expect(truoc.targetValue.toNumber()).toBe(10);
			ok(
				await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{ id: krSua, targetValue: 12 },
					cTruong,
				),
				"nguoi sua dich",
			);
			expect(
				(
					await db.okrKeyResult.findUniqueOrThrow({ where: { id: krSua } })
				).targetValue.toNumber(),
			).toBe(12);
			const tep = join(RANG, "so-dich-may-ghi.mjs");
			const xanh = spawnSync("bun", [tep], {
				env: process.env,
				encoding: "utf8",
			});
			console.log(xanh.stdout);
			expect(xanh.stdout).toContain("KR mang vet soan-okr = 4");
			expect(xanh.stdout).toContain("0 so dich do may ghi");
			expect(xanh.status).toBe(0);
			const doiChung = spawnSync("bun", [tep, "--doi-chung"], {
				env: process.env,
				encoding: "utf8",
			});
			console.log(doiChung.stdout);
			expect(doiChung.stdout).toContain("doi chung duong");
			expect(doiChung.status).toBe(0);
			expect(
				await Promise.all([
					db.okrKeyResult.count({
						where: { id: { startsWith: "doi-chung-" } },
					}),
					db.okrTrail.count({ where: { id: { startsWith: "doi-chung-" } } }),
					db.okrCuocSoan.count({ where: { id: { startsWith: "doi-chung-" } } }),
					db.okrDeXuat.count({ where: { id: { startsWith: "doi-chung-" } } }),
				]),
			).toEqual([0, 0, 0, 0]);
		},
		CHO_DB,
	);
});
