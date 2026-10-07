import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	type LyDoLichSu,
	lichSuMucTieu,
	QUAN_HE_DI_THEO_KR,
	QUAN_HE_DI_THEO_MUC_TIEU,
	QUAN_HE_LICH_SU_KR,
	QUAN_HE_LICH_SU_MUC_TIEU,
} from "@crm/db/okr-muc-tieu-lich-su";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { z } from "zod";
import { OKR } from "../src/okr/okr-config";
import { donSanCanhKr, mauMoi } from "./okr-canh-kr-san";
import {
	donSanKhep,
	gieoKyQuy,
	gieoMucTieuCongBo,
	sangPha,
} from "./okr-khep-san";
import {
	CHUONG_TRINH_RONG,
	dungSan,
	goi,
	goiQuery,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	type TraLoi,
	truongMoi,
} from "./okr-san";

const CHO_MS = 300_000;
const KY = { tu: "2026-10-01", den: "2026-12-31" } as const;
const KY_KE = { tu: "2027-01-01", den: "2027-03-31" } as const;

const CAU = {
	dangChoDuyet: "Mục tiêu đang chờ duyệt — rút về Nháp rồi mới xoá được.",
	coLichSu: (lyDo: string) =>
		`Mục tiêu ${lyDo} — không xoá được. Hãy bỏ mục tiêu.`,
	chuaBo: "Chỉ dùng lại được mục tiêu đã bỏ.",
	khongSua:
		"Bạn không sửa được OKR của đơn vị này — chỉ trưởng đơn vị (hoặc trưởng bộ phận chứa nó) sửa được.",
	kyDaKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
	kyDaAn: "Chu kỳ này đã ẩn — không ghi được nữa. Hiện lại để ghi tiếp.",
	vuotTran: (n: number) =>
		`Đơn vị này đã có ${n} mục tiêu — vượt trần chương trình.`,
} as const;

type Nguoi = { id: string; cookie: string };
type Don = { pb: string; t: Nguoi };

async function donVi(ten: string): Promise<Don> {
	const pb = await pbMoi(ten);
	const tr = await truongMoi("department", pb, `${ten}-T`);
	return { pb, t: { id: tr.nguoi, cookie: tr.cookie } };
}

async function nguoiCo(ten: string): Promise<Nguoi> {
	const id = await nguoiMoi(ten);
	return { id, cookie: await phienCua(id) };
}

async function nhap(
	ky: string,
	don: Don,
	tuy: { soKr?: number; participantIds?: string[] } = {},
): Promise<{ mt: string; krs: string[] }> {
	const mt = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId: ky,
				unit: { level: "phong-ban", departmentId: don.pb },
				title: ma("xoa muc tieu"),
				kind: "cam-ket",
				ownerUserId: don.t.id,
				participantIds: tuy.participantIds ?? [],
				whyNow: "",
			},
			don.t.cookie,
		),
		"tao nhap",
	).id;
	const krs: string[] = [];
	for (let i = 0; i < (tuy.soKr ?? 1); i++)
		krs.push(
			ok<{ id: string }>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: mt,
						title: ma(`xoa kr ${i}`),
						kind: "tang-toi",
						ownerUserId: don.t.id,
						startValue: 0,
						targetValue: 100,
						currentValue: 0,
						unit: "",
						dueOn: null,
						weight: 1,
					},
					don.t.cookie,
				),
				"tao kr",
			).id,
		);
	return { mt, krs };
}

const xoa = (id: string, ai: string) => goi("okr.xoaMucTieu", { id }, ai);
const dungLai = (id: string, ai: string) =>
	goi("okr.dungLaiMucTieu", { id }, ai);
const bo = (id: string, ai: string) => goi("okr.dropObjective", { id }, ai);
const congBo = (id: string, ai: string) =>
	goi("okr.publishObjective", { id }, ai);
const tra = (r: TraLoi) => (r.status === 200 ? "200" : `${r.status} ${r.loi}`);
const chuongTrinh = (vao: Record<string, string | number | boolean>) =>
	goi("okr.setProgram", vao);

async function anhMucTieu(id: string) {
	return db.okrObjective.findUnique({
		where: { id },
		select: {
			status: true,
			droppedAt: true,
			publishedAt: true,
			keyResults: { select: { id: true }, orderBy: { id: "asc" } },
		},
	});
}

const demVet = (objectiveId: string) =>
	db.okrTrail.count({ where: { objectiveId } });

afterAll(async () => {
	await chuongTrinh({ ...CHUONG_TRINH_RONG });
	await donSanCanhKr();
	await donSanKhep();
}, CHO_MS);

dungSan();

beforeAll(async () => {
	ok(await chuongTrinh({ ...CHUONG_TRINH_RONG }), "chuong trinh rong");
}, CHO_MS);

const truongMoHinh = z.object({
	name: z.string(),
	kind: z.string(),
	type: z.string(),
});
const moHinhDuLieu = z.object({
	models: z.record(z.string(), z.object({ fields: z.array(truongMoHinh) })),
});

const QUAN_HE_CHA: Record<string, readonly string[]> = {
	OkrObjective: ["cycle", "division", "department", "person", "owner"],
	OkrKeyResult: ["objective", "owner"],
};

function quanHeCua(model: string): string[] {
	const { models } = moHinhDuLieu.parse(Reflect.get(db, "_runtimeDataModel"));
	const cha = QUAN_HE_CHA[model] ?? [];
	return (models[model]?.fields ?? [])
		.filter((f) => f.kind === "object" && !cha.includes(f.name))
		.map((f) => f.name)
		.sort();
}

describe("quan-he-du", () => {
	test("quan-he-du: moi quan he cua OkrObjective va OkrKeyResult nam dung mot danh sach lich su hoac di theo", () => {
		const ca: {
			model: string;
			thuc: string[];
			lichSu: string[];
			diTheo: string[];
		}[] = [
			{
				model: "OkrObjective",
				thuc: quanHeCua("OkrObjective"),
				lichSu: [...QUAN_HE_LICH_SU_MUC_TIEU],
				diTheo: [...QUAN_HE_DI_THEO_MUC_TIEU],
			},
			{
				model: "OkrKeyResult",
				thuc: quanHeCua("OkrKeyResult"),
				lichSu: [...QUAN_HE_LICH_SU_KR],
				diTheo: [...QUAN_HE_DI_THEO_KR],
			},
		];
		for (const c of ca)
			console.log(
				`quan-he-du ${c.model}: mo hinh ${c.thuc.join(", ")}; lich su ${c.lichSu.join(", ")}; di theo ${c.diTheo.join(", ")}`,
			);
		expect(
			ca.map((c) => ({
				model: c.model,
				thieu: c.thuc
					.filter((q) => !c.lichSu.includes(q) && !c.diTheo.includes(q))
					.map((q) => `${c.model}.${q}`),
				thua: [...c.lichSu, ...c.diTheo]
					.filter((q) => !c.thuc.includes(q))
					.map((q) => `${c.model}.${q}`),
				haiNoi: c.lichSu.filter((q) => c.diTheo.includes(q)),
			})),
			"quan he chua xep loai, thua, hoac nam o ca hai danh sach",
		).toEqual(
			ca.map((c) => ({ model: c.model, thieu: [], thua: [], haiNoi: [] })),
		);
	});
});

describe("xoa-sach", () => {
	test(
		"xoa-sach: nhap sach mat cung moi dong di theo, mot dong vet xoa-muc-tieu, vet cu va de xuat Kara con",
		async () => {
			const don = await donVi("xoa-sach");
			const P = await nguoiCo("xoa-sach-P");
			const F = await nguoiCo("xoa-sach-F");
			const V = await nguoiCo("xoa-sach-V");
			const ky = await gieoKyQuy(KY);
			const dich = await gieoMucTieuCongBo(ky, [{}]);
			const mauId = await mauMoi({
				ten: "xoa sach",
				cap: "phong-ban",
				donViIds: [don.pb],
				noiDung: {
					cauMucTieu: "Giữ khách doanh nghiệp",
					loai: "cam-ket",
					krs: [
						{
							title: "Khách quay lại",
							kind: "tang-toi",
							unit: "khách",
							startValue: null,
							targetValue: null,
						},
						{
							title: "Doanh thu mới",
							kind: "tang-toi",
							unit: "triệu",
							startValue: null,
							targetValue: null,
						},
					],
				},
			});
			const tuMau = ok<{ id: string }>(
				await goi(
					"okr.taoTuMau",
					{
						mauId,
						cycleId: ky,
						unit: { level: "phong-ban", departmentId: don.pb },
						ownerUserId: don.t.id,
						krs: [
							{ startValue: 0, targetValue: 10, ownerUserId: don.t.id },
							{ startValue: 0, targetValue: 50, ownerUserId: don.t.id },
						],
					},
					don.t.cookie,
				),
				"tao tu mau",
			).id;
			ok(
				await goi(
					"okr.updateObjective",
					{ id: tuMau, participantIds: [P.id] },
					don.t.cookie,
				),
				"them nguoi tham gia",
			);
			const krs = (
				await db.okrKeyResult.findMany({
					where: { objectiveId: tuMau },
					select: { id: true },
					orderBy: { id: "asc" },
				})
			).map((k) => k.id);
			for (const kr of krs) {
				ok(
					await goi(
						"okr.themViec",
						{
							keyResultId: kr,
							tieuDe: "Gọi khách cũ",
							nguoiLamUserId: P.id,
							hanNgay: null,
						},
						don.t.cookie,
					),
					"them viec",
				);
				ok(
					await goi(
						"okr.datNguonKr",
						{ keyResultId: kr, loai: "api" },
						don.t.cookie,
					),
					"dat nguon",
				);
			}
			ok(
				await goi("okr.follow", { objectiveId: tuMau, on: true }, F.cookie),
				"theo doi",
			);
			ok(
				await goi(
					"okr.addAlignment",
					{
						objectiveId: tuMau,
						targetObjectiveId: dich.objectiveId,
						targetKeyResultId: null,
					},
					don.t.cookie,
				),
				"can chinh di ra",
			);
			await db.okrDeXuat.create({
				data: {
					taskId: ma("task"),
					objectiveId: tuMau,
					loai: "viet-lai",
					lyDo: "thử",
					inputHash: "h",
					nguoiYeuCau: don.t.id,
				},
			});
			const gioiHan = await nhap(ky, don);
			ok(
				await goi(
					"okr.datHienThi",
					{ objectiveId: gioiHan.mt, hienThi: "gioi-han", nguoiXem: [V.id] },
					don.t.cookie,
				),
				"dat gioi han",
			);
			const ben = await nhap(ky, don);
			const benTruoc = await anhMucTieu(ben.mt);
			const vetTruoc = await db.okrTrail.count({
				where: { objectiveId: tuMau, action: { not: "xoa-muc-tieu" } },
			});
			const deXuatTruoc = await db.okrDeXuat.count({
				where: { objectiveId: tuMau },
			});

			ok(await xoa(tuMau, don.t.cookie), "xoa tu mau");
			ok(await xoa(gioiHan.mt, don.t.cookie), "xoa gioi han");

			const dem = {
				muc: await db.okrObjective.count({ where: { id: tuMau } }),
				kr: await db.okrKeyResult.count({ where: { objectiveId: tuMau } }),
				viec: await db.okrViecKr.count({ where: { keyResultId: { in: krs } } }),
				nguon: await db.okrNguonKr.count({
					where: { keyResultId: { in: krs } },
				}),
				thamGia: await db.okrParticipant.count({
					where: { objectiveId: tuMau },
				}),
				theoDoi: await db.okrFollow.count({ where: { objectiveId: tuMau } }),
				canChinh: await db.okrAlignment.count({
					where: { objectiveId: tuMau },
				}),
				tuMau: await db.okrMucTieuTuMau.count({
					where: { objectiveId: tuMau },
				}),
				nguoiXem: await db.okrNguoiXem.count({
					where: { objectiveId: gioiHan.mt },
				}),
				gioiHan: await db.okrObjective.count({ where: { id: gioiHan.mt } }),
			};
			const vetXoa = await db.okrTrail.findMany({
				where: { objectiveId: tuMau, action: "xoa-muc-tieu" },
			});
			const before = parseOkrVet(vetXoa[0]?.before);
			console.log(
				`xoa-sach: dem ${JSON.stringify(dem)}; vet xoa ${vetXoa.length}; before ${JSON.stringify(before)}`,
			);
			expect({
				dem,
				soVetXoa: vetXoa.length,
				before: {
					title: typeof before?.title,
					level: before?.level,
					departmentId: before?.departmentId,
					status: before?.status,
					soKr: before?.soKr,
				},
				vetCu: await db.okrTrail.count({
					where: { objectiveId: tuMau, action: { not: "xoa-muc-tieu" } },
				}),
				deXuat: await db.okrDeXuat.count({ where: { objectiveId: tuMau } }),
				ben: await anhMucTieu(ben.mt),
			}).toEqual({
				dem: {
					muc: 0,
					kr: 0,
					viec: 0,
					nguon: 0,
					thamGia: 0,
					theoDoi: 0,
					canChinh: 0,
					tuMau: 0,
					nguoiXem: 0,
					gioiHan: 0,
				},
				soVetXoa: 1,
				before: {
					title: "string",
					level: "phong-ban",
					departmentId: don.pb,
					status: "nhap",
					soKr: 2,
				},
				vetCu: vetTruoc,
				deXuat: deXuatTruoc,
				ben: benTruoc,
			});
			await db.okrDeXuat.deleteMany({ where: { objectiveId: tuMau } });
		},
		CHO_MS,
	);
});

type DongGia = {
	id: string;
	publishedAt: Date | null;
	_count: {
		alignedBy: number;
		comments: number;
		mangSangDi: number;
		ghiNhan: number;
	};
	nhinLai: { id: string } | null;
	mangSangTu: { id: string } | null;
	chuDeHoiY: { id: string } | null;
	keyResults: {
		_count: {
			alignedBy: number;
			checkIns: number;
			comments: number;
			soChup: number;
			doiDich: number;
			bangChung: number;
			ghiNhan: number;
		};
		diemKr: { id: string } | null;
	}[];
};

const KR_SACH: DongGia["keyResults"][number] = {
	_count: {
		alignedBy: 0,
		checkIns: 0,
		comments: 0,
		soChup: 0,
		doiDich: 0,
		bangChung: 0,
		ghiNhan: 0,
	},
	diemKr: null,
};

const SACH: DongGia = {
	id: "m",
	publishedAt: null,
	_count: { alignedBy: 0, comments: 0, mangSangDi: 0, ghiNhan: 0 },
	nhinLai: null,
	mangSangTu: null,
	chuDeHoiY: null,
	keyResults: [KR_SACH, KR_SACH],
};

const coDem = (q: keyof DongGia["_count"]): DongGia => ({
	...SACH,
	_count: { ...SACH._count, [q]: 1 },
});
const krDem = (q: keyof (typeof KR_SACH)["_count"]): DongGia => ({
	...SACH,
	keyResults: [KR_SACH, { ...KR_SACH, _count: { ...KR_SACH._count, [q]: 1 } }],
});

const BANG_ANH_XA: Record<string, { hang: DongGia; mong: LyDoLichSu | null }> =
	{
		sach: { hang: SACH, mong: null },
		"da-cong-bo": {
			hang: { ...SACH, publishedAt: new Date("2026-10-02T00:00:00Z") },
			mong: "da-cong-bo",
		},
		"muc-tieu.alignedBy": {
			hang: coDem("alignedBy"),
			mong: "muc-tieu.alignedBy",
		},
		"muc-tieu.comments": { hang: coDem("comments"), mong: "muc-tieu.comments" },
		"muc-tieu.nhinLai": {
			hang: { ...SACH, nhinLai: { id: "n" } },
			mong: "muc-tieu.nhinLai",
		},
		"muc-tieu.mangSangDi": {
			hang: coDem("mangSangDi"),
			mong: "muc-tieu.mangSangDi",
		},
		"muc-tieu.mangSangTu": {
			hang: { ...SACH, mangSangTu: { id: "s" } },
			mong: "muc-tieu.mangSangTu",
		},
		"muc-tieu.ghiNhan": { hang: coDem("ghiNhan"), mong: "muc-tieu.ghiNhan" },
		"muc-tieu.chuDeHoiY": {
			hang: { ...SACH, chuDeHoiY: { id: "c" } },
			mong: "muc-tieu.chuDeHoiY",
		},
		"kr.alignedBy": { hang: krDem("alignedBy"), mong: "kr.alignedBy" },
		"kr.checkIns": { hang: krDem("checkIns"), mong: "kr.checkIns" },
		"kr.comments": { hang: krDem("comments"), mong: "kr.comments" },
		"kr.soChup": { hang: krDem("soChup"), mong: "kr.soChup" },
		"kr.doiDich": { hang: krDem("doiDich"), mong: "kr.doiDich" },
		"kr.diemKr": {
			hang: {
				...SACH,
				keyResults: [KR_SACH, { ...KR_SACH, diemKr: { id: "d" } }],
			},
			mong: "kr.diemKr",
		},
		"kr.bangChung": { hang: krDem("bangChung"), mong: "kr.bangChung" },
		"kr.ghiNhan": { hang: krDem("ghiNhan"), mong: "kr.ghiNhan" },
	};

const clientGia = (hang: DongGia) =>
	({
		okrObjective: { findMany: async () => [hang] },
	}) as unknown as Parameters<typeof lichSuMucTieu>[0];

describe("tu-choi-lich-su", () => {
	test(
		"tu-choi-lich-su: nam ca that qua API — da cong bo, binh luan, mang sang, cho duyet — 400 cau ghim, khong doi gi",
		async () => {
			const don = await donVi("tu-choi");
			const ky = await gieoKyQuy(KY);
			const ca: {
				ten: string;
				mt: string;
				cau: string;
				dem: () => Promise<number>;
			}[] = [];

			const cb = await nhap(ky, don);
			ok(await congBo(cb.mt, don.t.cookie), "cong bo");
			ca.push({
				ten: "da-cong-bo-dang-chay",
				mt: cb.mt,
				cau: CAU.coLichSu("đã từng công bố"),
				dem: async () => 0,
			});

			const cbBo = await nhap(ky, don);
			ok(await congBo(cbBo.mt, don.t.cookie), "cong bo roi bo");
			ok(await bo(cbBo.mt, don.t.cookie), "bo");
			ca.push({
				ten: "da-cong-bo-da-bo",
				mt: cbBo.mt,
				cau: CAU.coLichSu("đã từng công bố"),
				dem: async () => 0,
			});

			const bl = await nhap(ky, don);
			ok(
				await goi(
					"okr.addComment",
					{ objectiveId: bl.mt, body: "Xem lại câu mục tiêu", mentionUserIds: [] },
					don.t.cookie,
				),
				"binh luan",
			);
			ca.push({
				ten: "muc-tieu.comments",
				mt: bl.mt,
				cau: CAU.coLichSu("đã có bình luận"),
				dem: () => db.okrComment.count({ where: { objectiveId: bl.mt } }),
			});

			const kyGoc = await gieoKyQuy(KY);
			const goc = await nhap(kyGoc, don);
			ok(await congBo(goc.mt, don.t.cookie), "cong bo goc");
			ok(await sangPha(kyGoc, "cham-diem"), "cham diem goc");
			await gieoKyQuy({ ...KY_KE, pha: "lap-ke-hoach" });
			const sang = ok<{ id: string }>(
				await goi("okr.mangSang", { objectiveId: goc.mt }, don.t.cookie),
				"mang sang",
			).id;
			ca.push({
				ten: "muc-tieu.mangSangTu",
				mt: sang,
				cau: CAU.coLichSu("được mang sang từ kỳ trước"),
				dem: () => db.okrMangSang.count({ where: { sangObjectiveId: sang } }),
			});

			ok(await chuongTrinh({ duyetCongBo: true }), "bat duyet");
			const cho = await nhap(ky, don);
			ok(await goi("okr.guiDuyet", { id: cho.mt }, don.t.cookie), "gui duyet");
			ok(await chuongTrinh({ duyetCongBo: false }), "tat duyet");
			ca.push({
				ten: "cho-duyet",
				mt: cho.mt,
				cau: CAU.dangChoDuyet,
				dem: async () => 0,
			});

			expect(ca.map((c) => c.ten).sort()).toEqual(
				[
					"cho-duyet",
					"da-cong-bo-da-bo",
					"da-cong-bo-dang-chay",
					"muc-tieu.comments",
					"muc-tieu.mangSangTu",
				].sort(),
			);
			const thuc = [];
			const mong = [];
			for (const c of ca) {
				const truoc = {
					mt: await anhMucTieu(c.mt),
					dem: await c.dem(),
					vet: await demVet(c.mt),
				};
				const r = await xoa(c.mt, don.t.cookie);
				thuc.push({
					ca: c.ten,
					tra: tra(r),
					sau: {
						mt: await anhMucTieu(c.mt),
						dem: await c.dem(),
						vet: await demVet(c.mt),
					},
				});
				mong.push({ ca: c.ten, tra: `400 ${c.cau}`, sau: truoc });
			}
			console.log(
				`tu-choi-lich-su: ${thuc.map((t) => `${t.ca} → ${t.tra}`).join(" | ")}`,
			);
			expect(thuc).toEqual(mong);
		},
		CHO_MS,
	);

	test("tu-choi-lich-su: anh xa du moi loai lich su o muc module, moi ly do co cau", async () => {
		const mongKhoa = [
			"sach",
			"da-cong-bo",
			...QUAN_HE_LICH_SU_MUC_TIEU.map((q) => `muc-tieu.${q}`),
			...QUAN_HE_LICH_SU_KR.map((q) => `kr.${q}`),
		].sort();
		expect(Object.keys(BANG_ANH_XA).sort(), "bang anh xa thieu ca").toEqual(
			mongKhoa,
		);
		const thuc: Record<string, LyDoLichSu | null> = {};
		const mong: Record<string, LyDoLichSu | null> = {};
		for (const [ten, ca] of Object.entries(BANG_ANH_XA)) {
			thuc[ten] =
				(await lichSuMucTieu(clientGia(ca.hang), ["m"])).get("m") ?? null;
			mong[ten] = ca.mong;
		}
		console.log(`tu-choi-lich-su anh xa: ${JSON.stringify(thuc)}`);
		expect(thuc).toEqual(mong);
		const lyDo = Object.values(mong).filter(
			(l): l is LyDoLichSu => l !== null,
		);
		expect(
			lyDo.filter((l) => !(l in OKR.thongDiep.xoa.lyDo)),
			"ly do chua co cau",
		).toEqual([]);
	});
});

describe("dong-thoi", () => {
	test(
		"dong-thoi: cap nhat tuan dang giu khoa KR thi xoa cho, roi tra 400 co lich su, khong mat gi",
		async () => {
			const don = await donVi("dong-thoi");
			const ky = await gieoKyQuy(KY);
			const m = await nhap(ky, don);
			const doiChung = await nhap(ky, don);
			const kr = m.krs[0];
			if (kr === undefined) throw new Error("dong-thoi: thieu KR");
			let tha: () => void = () => {};
			const choTha = new Promise<void>((r) => {
				tha = r;
			});
			let daKhoa: () => void = () => {};
			const khoaXong = new Promise<void>((r) => {
				daKhoa = r;
			});
			const t1 = db.$transaction(
				async (tx) => {
					await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${kr} FOR UPDATE`;
					const phienCn = await tx.okrCheckInSession.create({
						data: { userId: don.t.id, entry: "tab" },
					});
					await tx.okrCheckIn.create({
						data: {
							keyResultId: kr,
							sessionId: phienCn.id,
							weekStart: new Date("2026-10-05T00:00:00Z"),
							value: 10,
							confidence: "cao",
							authorUserId: don.t.id,
							ownerUserId: don.t.id,
						},
					});
					daKhoa();
					await choTha;
				},
				{ timeout: 30_000, maxWait: 10_000 },
			);
			await khoaXong;
			const loiXoa = xoa(m.mt, don.t.cookie);
			let thayCho = false;
			for (let i = 0; i < 50 && !thayCho; i++) {
				const cho = await db.$queryRaw<{ n: bigint }[]>`
					SELECT count(*)::bigint AS n FROM pg_stat_activity
					WHERE wait_event_type = 'Lock' AND datname = current_database()`;
				thayCho = (cho[0]?.n ?? 0n) > 0n;
				if (!thayCho) await new Promise((r) => setTimeout(r, 100));
			}
			tha();
			await t1;
			const r = await loiXoa;
			const con = {
				mt: await db.okrObjective.count({ where: { id: m.mt } }),
				kr: await db.okrKeyResult.count({ where: { id: kr } }),
				checkIn: await db.okrCheckIn.count({ where: { keyResultId: kr } }),
			};
			console.log(
				`dong-thoi: thay cho khoa ${thayCho}; xoa ${tra(r)}; con ${JSON.stringify(con)}`,
			);
			expect(thayCho, "xoa khong cho khoa").toBe(true);
			expect({ tra: tra(r), con }).toEqual({
				tra: `400 ${CAU.coLichSu("có KR đã có cập nhật tuần")}`,
				con: { mt: 1, kr: 1, checkIn: 1 },
			});
			ok(await xoa(doiChung.mt, don.t.cookie), "doi chung xoa duoc");
			await db.okrCheckIn.deleteMany({ where: { keyResultId: kr } });
		},
		CHO_MS,
	);
});

type TrangThaiCa =
	| "nhap-sach"
	| "nhap-co-lich-su"
	| "cho-duyet"
	| "cong-bo"
	| "da-bo-sach"
	| "da-bo-tung-cong-bo";

async function gieoTrangThai(
	ky: string,
	don: Don,
	tt: TrangThaiCa,
): Promise<string> {
	const { mt } = await nhap(ky, don);
	switch (tt) {
		case "nhap-sach":
			return mt;
		case "nhap-co-lich-su":
			ok(
				await goi(
					"okr.addComment",
					{ objectiveId: mt, body: "Ghi chú", mentionUserIds: [] },
					don.t.cookie,
				),
				"binh luan",
			);
			return mt;
		case "cho-duyet":
			ok(await chuongTrinh({ duyetCongBo: true }), "bat duyet");
			ok(await goi("okr.guiDuyet", { id: mt }, don.t.cookie), "gui duyet");
			ok(await chuongTrinh({ duyetCongBo: false }), "tat duyet");
			return mt;
		case "cong-bo":
			ok(await congBo(mt, don.t.cookie), "cong bo");
			return mt;
		case "da-bo-sach":
			ok(await bo(mt, don.t.cookie), "bo");
			return mt;
		case "da-bo-tung-cong-bo":
			ok(await congBo(mt, don.t.cookie), "cong bo");
			ok(await bo(mt, don.t.cookie), "bo");
			return mt;
	}
}

const MA_TRAN: {
	tt: TrangThaiCa;
	ai: "truong" | "khac";
	pha: "dang-chay" | "cham-diem";
	co: { xoa: boolean; dungLai: boolean };
}[] = [
	{ tt: "nhap-sach", ai: "truong", pha: "dang-chay", co: { xoa: true, dungLai: false } },
	{ tt: "nhap-co-lich-su", ai: "truong", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "cho-duyet", ai: "truong", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "cong-bo", ai: "truong", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-sach", ai: "truong", pha: "dang-chay", co: { xoa: true, dungLai: true } },
	{ tt: "da-bo-tung-cong-bo", ai: "truong", pha: "dang-chay", co: { xoa: false, dungLai: true } },
	{ tt: "nhap-sach", ai: "khac", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "nhap-co-lich-su", ai: "khac", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "cho-duyet", ai: "khac", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "cong-bo", ai: "khac", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-sach", ai: "khac", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-tung-cong-bo", ai: "khac", pha: "dang-chay", co: { xoa: false, dungLai: false } },
	{ tt: "nhap-sach", ai: "truong", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "nhap-co-lich-su", ai: "truong", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "cho-duyet", ai: "truong", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "cong-bo", ai: "truong", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-sach", ai: "truong", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-tung-cong-bo", ai: "truong", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "nhap-sach", ai: "khac", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "nhap-co-lich-su", ai: "khac", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "cho-duyet", ai: "khac", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "cong-bo", ai: "khac", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-sach", ai: "khac", pha: "cham-diem", co: { xoa: false, dungLai: false } },
	{ tt: "da-bo-tung-cong-bo", ai: "khac", pha: "cham-diem", co: { xoa: false, dungLai: false } },
];

const quyenSchema = z.object({
	quyen: z.object({ xoa: z.boolean(), dungLai: z.boolean() }),
});

describe("mot-nguon", () => {
	test(
		"mot-nguon: 24 o — quyen.xoa va quyen.dungLai dung khi va chi khi thu tuc thanh cong",
		async () => {
			expect(MA_TRAN.length).toBe(24);
			expect(
				new Set(MA_TRAN.map((o) => `${o.tt}|${o.ai}|${o.pha}`)).size,
			).toBe(24);
			const don = await donVi("mot-nguon");
			const khac = await nguoiCo("mot-nguon-khac");
			const ky = {
				"dang-chay": await gieoKyQuy(KY),
				"cham-diem": await gieoKyQuy(KY),
			};
			const ban = new Map<string, { xoa: string; dungLai: string }>();
			for (const o of MA_TRAN)
				ban.set(`${o.tt}|${o.ai}|${o.pha}`, {
					xoa: await gieoTrangThai(ky[o.pha], don, o.tt),
					dungLai: await gieoTrangThai(ky[o.pha], don, o.tt),
				});
			ok(await sangPha(ky["cham-diem"], "cham-diem"), "cham diem");
			const thuc = [];
			const mong = [];
			for (const o of MA_TRAN) {
				const khoa = `${o.tt}|${o.ai}|${o.pha}`;
				const b = ban.get(khoa);
				if (!b) throw new Error(`mot-nguon: thieu ban ${khoa}`);
				const cookie = o.ai === "truong" ? don.t.cookie : khac.cookie;
				const docCo = async (id: string) =>
					quyenSchema.parse(
						(await goiQuery("okr.objective", cookie, { id })).data,
					).quyen;
				const coXoa = (await docCo(b.xoa)).xoa;
				const coDungLai = (await docCo(b.dungLai)).dungLai;
				const duocXoa = (await xoa(b.xoa, cookie)).status === 200;
				const duocDungLai = (await dungLai(b.dungLai, cookie)).status === 200;
				thuc.push({
					o: khoa,
					quyen: { xoa: coXoa, dungLai: coDungLai },
					thuTuc: { xoa: duocXoa, dungLai: duocDungLai },
				});
				mong.push({ o: khoa, quyen: o.co, thuTuc: o.co });
			}
			console.log(
				`mot-nguon: ${thuc.map((t) => `${t.o} ${JSON.stringify(t.quyen)}`).join(" | ")}`,
			);
			expect(thuc).toEqual(mong);
		},
		CHO_MS,
	);
});

describe("quyen-pha", () => {
	test(
		"quyen-pha: nguoi khong sua duoc, chu ky da dong, chu ky da an — hai thu tuc moi tra dung loi cua dropObjective, khong ghi gi",
		async () => {
			const don = await donVi("quyen-pha");
			const khac = await nguoiCo("quyen-pha-khac");
			const kyChay = await gieoKyQuy(KY);
			const kyDong = await gieoKyQuy(KY);
			const kyAn = await gieoKyQuy(KY);
			const gieo = async (ky: string) => ({
				nhapXoa: (await nhap(ky, don)).mt,
				nhapBo: (await nhap(ky, don)).mt,
				daBo: await gieoTrangThai(ky, don, "da-bo-sach"),
			});
			const ca = {
				"khong-sua": { ...(await gieo(kyChay)), cookie: khac.cookie },
				"da-dong": { ...(await gieo(kyDong)), cookie: don.t.cookie },
				"da-an": { ...(await gieo(kyAn)), cookie: don.t.cookie },
			};
			ok(await sangPha(kyDong, "cham-diem"), "cham diem");
			ok(await sangPha(kyDong, "da-dong"), "da dong");
			ok(
				await goi("okr.anChuKy", {
					id: kyAn,
					lyDo: "Tạo nhầm, giữ lại để tra vết cũ",
				}),
				"an ky",
			);
			const thuc = [];
			const mong = [];
			for (const [ten, c] of Object.entries(ca)) {
				const loiBo = tra(await bo(c.nhapBo, c.cookie));
				const truocXoa = await anhMucTieu(c.nhapXoa);
				const truocDl = await anhMucTieu(c.daBo);
				thuc.push({
					ca: `${ten}|xoa`,
					tra: tra(await xoa(c.nhapXoa, c.cookie)),
					sau: await anhMucTieu(c.nhapXoa),
				});
				mong.push({ ca: `${ten}|xoa`, tra: loiBo, sau: truocXoa });
				thuc.push({
					ca: `${ten}|dung-lai`,
					tra: tra(await dungLai(c.daBo, c.cookie)),
					sau: await anhMucTieu(c.daBo),
				});
				mong.push({ ca: `${ten}|dung-lai`, tra: loiBo, sau: truocDl });
			}
			console.log(
				`quyen-pha: ${thuc.map((t) => `${t.ca} → ${t.tra}`).join(" | ")}`,
			);
			expect(thuc.length).toBe(6);
			expect(thuc).toEqual(mong);
			expect(mong.map((m) => m.tra)).toEqual([
				`403 ${CAU.khongSua}`,
				`403 ${CAU.khongSua}`,
				`400 ${CAU.kyDaKhoa}`,
				`400 ${CAU.kyDaKhoa}`,
				`400 ${CAU.kyDaAn}`,
				`400 ${CAU.kyDaAn}`,
			]);
		},
		CHO_MS,
	);
});

describe("dung-lai", () => {
	test(
		"dung-lai: da bo ve nhap, publishedAt giu nguyen, mot dong vet; chua bo 400; vuot tran chan va canh bao",
		async () => {
			const don = await donVi("dung-lai");
			const ky = await gieoKyQuy(KY);
			const a = await gieoTrangThai(ky, don, "da-bo-sach");
			const b = await gieoTrangThai(ky, don, "da-bo-tung-cong-bo");
			const c = (await nhap(ky, don)).mt;
			const bTruoc = await anhMucTieu(b);
			const kq = {
				a: tra(await dungLai(a, don.t.cookie)),
				b: tra(await dungLai(b, don.t.cookie)),
				c: tra(await dungLai(c, don.t.cookie)),
			};
			const vetDungLai = async (id: string) =>
				(
					await db.okrTrail.findMany({
						where: { objectiveId: id, action: "dung-lai" },
					})
				).map((v) => ({
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				}));
			const docA = await anhMucTieu(a);
			const docB = await anhMucTieu(b);
			expect({
				kq,
				a: { status: docA?.status, droppedAt: docA?.droppedAt, publishedAt: docA?.publishedAt },
				b: { status: docB?.status, droppedAt: docB?.droppedAt, publishedAt: docB?.publishedAt },
				vetA: await vetDungLai(a),
				vetB: await vetDungLai(b),
				vetC: (await vetDungLai(c)).length,
				c: (await anhMucTieu(c))?.status,
			}).toEqual({
				kq: { a: "200", b: "200", c: `400 ${CAU.chuaBo}` },
				a: { status: "nhap", droppedAt: null, publishedAt: null },
				b: { status: "nhap", droppedAt: null, publishedAt: bTruoc?.publishedAt },
				vetA: [{ before: { status: "da-bo" }, after: { status: "nhap" } }],
				vetB: [{ before: { status: "da-bo" }, after: { status: "nhap" } }],
				vetC: 0,
				c: "nhap",
			});

			const donTran = await donVi("dung-lai-tran");
			const kyTran = await gieoKyQuy(KY);
			const d = await gieoTrangThai(kyTran, donTran, "da-bo-sach");
			await nhap(kyTran, donTran);
			ok(
				await chuongTrinh({ objectiveCap: 1, capMode: "chan" }),
				"tran chan",
			);
			const chan = tra(await dungLai(d, donTran.t.cookie));
			const sauChan = (await anhMucTieu(d))?.status;
			const vetSauChan = await db.okrTrail.count({
				where: { objectiveId: d, action: "dung-lai" },
			});
			ok(await chuongTrinh({ capMode: "canh-bao" }), "tran canh bao");
			const canhBao = ok<{ canhBao: string | null; canGuiDuyet: boolean }>(
				await dungLai(d, donTran.t.cookie),
				"dung lai canh bao",
			);
			ok(await chuongTrinh({ ...CHUONG_TRINH_RONG }), "tra chuong trinh");
			console.log(
				`dung-lai: ${JSON.stringify(kq)}; chan ${chan}; canh bao ${canhBao.canhBao}`,
			);
			expect({
				chan,
				sauChan,
				vetSauChan,
				canhBao: canhBao.canhBao,
				canGuiDuyet: canhBao.canGuiDuyet,
				sauCanhBao: (await anhMucTieu(d))?.status,
			}).toEqual({
				chan: `400 ${CAU.vuotTran(1)}`,
				sauChan: "da-bo",
				vetSauChan: 0,
				canhBao: CAU.vuotTran(1),
				canGuiDuyet: false,
				sauCanhBao: "nhap",
			});
		},
		CHO_MS,
	);
});

const danhSachDoc = z.object({
	rows: z.array(z.object({ id: z.string() })),
	daBo: z.array(z.object({ id: z.string() })),
	facetCounts: z.object({
		trangThai: z.array(z.object({ value: z.string(), count: z.number() })),
	}),
});
const mineDoc = z.object({
	objectives: z.array(z.object({ id: z.string() })),
	daBo: z.array(z.object({ id: z.string() })),
});
const ids = (ds: { id: string }[]) => ds.map((d) => d.id).sort();

describe("danh-sach-da-bo", () => {
	test(
		"danh-sach-da-bo: khong loc trang thai thi da bo tach ra daBo, khop loc con lai va luat xem; loc trang thai thi khong tach",
		async () => {
			const don = await donVi("danh-sach");
			const U1 = await nguoiCo("danh-sach-U1");
			const U2 = await nguoiCo("danh-sach-U2");
			const M = await nguoiCo("danh-sach-M");
			const V = await nguoiCo("danh-sach-V");
			const ky = await gieoKyQuy(KY);
			const cua = async (
				chu: string,
				kind: "cam-ket" | "tham-vong",
			): Promise<string> =>
				ok<{ id: string }>(
					await goi(
						"okr.createObjective",
						{
							cycleId: ky,
							unit: { level: "phong-ban", departmentId: don.pb },
							title: ma("danh sach"),
							kind,
							ownerUserId: chu,
							participantIds: [],
							whyNow: "",
						},
						don.t.cookie,
					),
					"tao",
				).id;
			const A1 = await cua(U1.id, "cam-ket");
			const A2 = await cua(U2.id, "tham-vong");
			const D1 = await cua(U1.id, "cam-ket");
			const D2 = await cua(U2.id, "tham-vong");
			const R = await cua(don.t.id, "cam-ket");
			ok(
				await goi(
					"okr.datHienThi",
					{ objectiveId: R, hienThi: "gioi-han", nguoiXem: [V.id] },
					don.t.cookie,
				),
				"gioi han R",
			);
			for (const id of [D1, D2, R]) ok(await bo(id, don.t.cookie), "bo");
			const loc = (doi: Record<string, string[]> = {}) => ({
				phuTrach: [],
				loai: [],
				trangThai: [],
				tuTin: [],
				gopY: [],
				...doi,
			});
			const docDs = async (doi: Record<string, string[]> = {}) =>
				danhSachDoc.parse(
					(
						await goiQuery("okr.danhSach", M.cookie, {
							cycleId: ky,
							unit: { loai: "pb", id: don.pb },
							loc: loc(doi),
						})
					).data,
				);
			const khong = await docDs();
			const phuTrach = await docDs({ phuTrach: [U1.id] });
			const chiBo = await docDs({ trangThai: ["da-bo"] });
			const haiLoai = await docDs({ trangThai: ["nhap", "da-bo"] });
			const mine = mineDoc.parse(
				(await goiQuery("okr.mine", U1.cookie, { cycleId: ky })).data,
			);
			const thuc = {
				khong: {
					rows: ids(khong.rows),
					daBo: ids(khong.daBo),
					demDaBo: khong.facetCounts.trangThai.find((t) => t.value === "da-bo")
						?.count,
				},
				phuTrach: { rows: ids(phuTrach.rows), daBo: ids(phuTrach.daBo) },
				chiBo: { rows: ids(chiBo.rows), daBo: ids(chiBo.daBo) },
				haiLoai: { rows: ids(haiLoai.rows), daBo: ids(haiLoai.daBo) },
				mine: { objectives: ids(mine.objectives), daBo: ids(mine.daBo) },
			};
			console.log(`danh-sach-da-bo: ${JSON.stringify(thuc)}`);
			expect(thuc).toEqual({
				khong: { rows: [A1, A2].sort(), daBo: [D1, D2].sort(), demDaBo: 2 },
				phuTrach: { rows: [A1], daBo: [D1] },
				chiBo: { rows: [D1, D2].sort(), daBo: [] },
				haiLoai: { rows: [A1, A2, D1, D2].sort(), daBo: [] },
				mine: { objectives: [A1], daBo: [D1] },
			});
		},
		CHO_MS,
	);
});
