import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, TrangThaiViec } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { type DoThiViec, hanhDong, VIEC } from "@crm/db/viec";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { viecCuaBanGhiOutput, viecVetOutput } from "../src/viec/viec.contracts";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	demVet,
	doiThu,
	donViec,
	goi,
	keHoachCua,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const NGAY_MS = 24 * 60 * 60 * 1000;
const MA_TEST_MS = 120_000;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

function ngayMaiVN(): string {
	return ngayVN(new Date(Date.now() + NGAY_MS));
}

async function khoi(
	userId: string,
	banGhi: Record<string, string>,
): Promise<string[]> {
	const r = await goi(app, "viec.cuaBanGhi", "query", banGhi, userId);
	const ra = viecCuaBanGhiOutput.parse(r.data);
	return ra.mo.map((v) => v.id);
}

describe("vc-tao", () => {
	test(
		"vc-tao: A giao cho B, hạn mai, W theo dõi, gắn D — một hàng, một vết tạo web, khối D và C có việc",
		async () => {
			const a = await nguoi("vc-a", "member");
			const b = await nguoi("vc-b", "member");
			const w = await nguoi("vc-w", "member");
			const { congTyId, dealId } = await thoaThuan(app, a.id);
			const khac = await thoaThuan(app, a.id, "VC Cty khac");
			const tieuDe = `vc-tao ${Date.now()}`;
			const r = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe,
					dealId,
					nguoiThucHienId: b.id,
					hanNgay: ngayMaiVN(),
					nguoiTheoDoiIds: [w.id],
				},
				a.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const hang = await db.viec.findMany({ where: { tieuDe } });
			if (hang.length !== 1) {
				throw new Error(`vc: tao viec khong ra dung mot hang ${hang.length}`);
			}
			const v = hang[0];
			if (!v) throw new Error("vc: tao viec khong ra dung mot hang 0");
			if (v.trangThai !== "CHUA_LAM") {
				throw new Error("vc: tao viec sai truong trangThai");
			}
			if (v.nguoiGiaoId !== a.id) {
				throw new Error("vc: tao viec sai truong nguoiGiaoId");
			}
			if (v.nguoiThucHienId !== b.id) {
				throw new Error("vc: tao viec sai truong nguoiThucHienId");
			}
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: v.id } });
			if (!theo.some((t) => t.userId === w.id)) {
				throw new Error("vc: thieu nguoi theo doi");
			}
			const gan = await db.viecGan.findMany({ where: { viecId: v.id } });
			if (gan.length !== 1 || gan[0]?.dealId !== dealId) {
				throw new Error("vc: gan sai");
			}
			const vet = await db.viecVet.findMany({ where: { viecId: v.id } });
			if (
				vet.length !== 1 ||
				vet[0]?.loai !== "tao" ||
				vet[0]?.nguoiId !== a.id ||
				vet[0]?.nguon !== "web"
			) {
				throw new Error("vc: vet tao sai");
			}
			for (const [ten, banGhi] of [
				["deal", { dealId }],
				["company", { companyId: congTyId }],
			] as const) {
				if (!(await khoi(a.id, banGhi)).includes(v.id)) {
					throw new Error(`vc: khoi viec ${ten} thieu viec`);
				}
			}
			if ((await khoi(a.id, { dealId: khac.dealId })).includes(v.id)) {
				throw new Error("vc: viec lot sang ban ghi khac");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-tao: không chọn người thực hiện thì người thực hiện là người giao",
		async () => {
			const a = await nguoi("vc-a2", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tieuDe = `vc-tao-mac-dinh ${Date.now()}`;
			await goi(app, "viec.create", "mutation", { tieuDe, dealId }, a.id);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			if (v.nguoiThucHienId !== a.id) {
				throw new Error("vc: nguoi thuc hien mac dinh sai");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-tao: theo doi trung — nguoiTheoDoiIds lặp và chứa người thực hiện chỉ ra mỗi người một hàng",
		async () => {
			const a = await nguoi("vc-a3", "member");
			const b = await nguoi("vc-b3", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tieuDe = `vc-tao-trung ${Date.now()}`;
			const r = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe,
					dealId,
					nguoiThucHienId: b.id,
					nguoiTheoDoiIds: [b.id, a.id, a.id],
				},
				a.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: v.id } });
			expect(theo.map((t) => t.userId).sort()).toEqual([a.id, b.id].sort());
		},
		MA_TEST_MS,
	);
});

describe("vc-gan", () => {
	test(
		"vc-gan: gắn thêm kế hoạch cùng công ty — vẫn một việc, công ty hiện một lần; gỡ D thì công ty vẫn còn qua kế hoạch",
		async () => {
			const a = await nguoi("vc-gan-a", "member");
			const b = await nguoi("vc-gan-b", "member");
			const { congTyId, dealId } = await thoaThuan(app, a.id);
			const plan = await keHoachCua(congTyId, a.id);
			const tieuDe = `vc-gan ${Date.now()}`;
			await goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe, dealId, nguoiThucHienId: b.id },
				a.id,
			);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			const g = await goi(
				app,
				"viec.gan",
				"mutation",
				{ id: v.id, planId: plan.id },
				a.id,
			);
			expect(g.status, JSON.stringify(g)).toBe(200);
			const so = await db.viec.count({ where: { tieuDe } });
			if (so !== 1) throw new Error(`vc: gan them nhan ban viec ${so}`);
			if (!(await khoi(a.id, { planId: plan.id })).includes(v.id)) {
				throw new Error("vc: ke hoach khong thay viec");
			}
			const lan = (await khoi(a.id, { companyId: congTyId })).filter(
				(id) => id === v.id,
			).length;
			if (lan !== 1) throw new Error(`vc: cong ty hien viec ${lan} lan`);
			if ((await demVet(v.id, "gan")) !== 1) {
				throw new Error("vc: thieu vet gan");
			}
			await goi(app, "viec.go", "mutation", { id: v.id, dealId }, a.id);
			if ((await khoi(a.id, { dealId })).includes(v.id)) {
				throw new Error("vc: go xong van hien");
			}
			if (!(await khoi(a.id, { companyId: congTyId })).includes(v.id)) {
				throw new Error("vc: cong ty mat viec khi con gan ke hoach");
			}
			if ((await demVet(v.id, "go")) !== 1) {
				throw new Error("vc: thieu vet go");
			}
		},
		MA_TEST_MS,
	);
});

const TT = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
	TrangThaiViec.HUY,
] as const;

const BANG_THIET_KE: DoThiViec = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
};

type Vai = "giao" | "thucHien" | "theoDoi" | "khac" | "quanTri";

const VAI: readonly Vai[] = ["giao", "thucHien", "theoDoi", "khac", "quanTri"];

type CaoO = {
	vai: Vai;
	nguon: TrangThaiViec;
	dich: TrangThaiViec;
	viecId: string;
	nguoiId: string;
};

async function vetDoiMoiNhat(viecId: string) {
	return db.viecVet.findFirst({
		where: { viecId, loai: "doi-trang-thai" },
		orderBy: [{ luc: "desc" }, { id: "desc" }],
	});
}

async function kiemO(o: CaoO): Promise<void> {
	const vetTruoc = await demVet(o.viecId);
	const r = await goi(
		app,
		"viec.doiTrangThai",
		"mutation",
		{ id: o.viecId, den: o.dich },
		o.nguoiId,
	);
	const sau = await db.viec.findUniqueOrThrow({ where: { id: o.viecId } });
	const vetSau = await demVet(o.viecId);
	const quyen = BANG_THIET_KE[o.nguon]?.[o.dich];
	const ca = `${o.vai} ${o.nguon}-${o.dich}`;
	if (quyen === undefined) {
		const dung =
			r.code === "BAD_REQUEST" &&
			r.message === VIEC.thongDiep.khongChuyenDuoc(o.nguon, o.dich) &&
			sau.trangThai === o.nguon &&
			vetSau === vetTruoc;
		if (!dung) throw new Error(`vc: cap khong hop le lot ${ca}`);
		return;
	}
	const giaoHayLam = o.vai === "giao" || o.vai === "thucHien";
	const duoc = quyen === "GT" ? giaoHayLam : o.vai === "giao";
	if (duoc) {
		const vet = await vetDoiMoiNhat(o.viecId);
		const dungVet =
			JSON.stringify(vet?.truoc) === JSON.stringify({ trangThai: o.nguon }) &&
			JSON.stringify(vet?.sau) === JSON.stringify({ trangThai: o.dich });
		const dung =
			r.status === 200 &&
			sau.trangThai === o.dich &&
			vetSau === vetTruoc + 1 &&
			dungVet;
		if (!dung) throw new Error(`vc: o duoc hong ${ca}`);
		return;
	}
	if (r.status === 200 || sau.trangThai !== o.nguon) {
		throw new Error(`vc: o khong lot ${ca}`);
	}
	const lam = hanhDong(o.nguon, o.dich);
	const loiMong =
		quyen === "G"
			? VIEC.thongDiep.chiNguoiGiao(lam)
			: VIEC.thongDiep.chiGiaoVaThucHien(lam);
	if (r.code !== "FORBIDDEN" || r.message !== loiMong || vetSau !== vetTruoc) {
		throw new Error(`vc: loi tu choi sai o ${ca}`);
	}
}

describe("vc-trang-thai", () => {
	test("vc-trang-thai: 5 người × 20 cặp = 100 ô đúng bảng thiết kế", async () => {
		const a = await nguoi("vc-tt-a", "member");
		const b = await nguoi("vc-tt-b", "member");
		const w = await nguoi("vc-tt-w", "member");
		const x = await nguoi("vc-tt-x", "member");
		const q = await nguoi("vc-tt-q", "admin");
		const id = {
			giao: a.id,
			thucHien: b.id,
			theoDoi: w.id,
			khac: x.id,
			quanTri: q.id,
		};
		const { dealId } = await thoaThuan(app, a.id);
		let daChay = 0;
		for (const vai of VAI) {
			for (const nguon of TT) {
				for (const dich of TT) {
					if (nguon === dich) continue;
					daChay += 1;
					const v = await taoThu({
						nguoiId: a.id,
						tieuDe: `vc-tt ${vai} ${nguon}-${dich}`,
						nguoiThucHienId: b.id,
						nguoiTheoDoiIds: [w.id],
						gan: [{ loai: "deal", id: dealId }],
					});
					if (nguon !== TrangThaiViec.CHUA_LAM) {
						await doiThu(v.id, a.id, nguon);
					}
					await kiemO({ vai, nguon, dich, viecId: v.id, nguoiId: id[vai] });
				}
			}
		}
		if (daChay !== 100) {
			throw new Error(`vc: ma tran trang thai thieu o ${daChay}`);
		}
	}, 600_000);

	test(
		"vc-trang-thai: roiChuaLamLuc chỉ ghi một lần, khi chính người thực hiện rời Chưa làm",
		async () => {
			const a = await nguoi("vc-roi-a", "member");
			const b = await nguoi("vc-roi-b", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const moi = (tieuDe: string) =>
				taoThu({
					nguoiId: a.id,
					tieuDe,
					nguoiThucHienId: b.id,
					gan: [{ loai: "deal", id: dealId }],
				});
			const roi = async (viecId: string) =>
				(await db.viec.findUniqueOrThrow({ where: { id: viecId } }))
					.roiChuaLamLuc;
			const doi = (viecId: string, den: string, userId: string) =>
				goi(app, "viec.doiTrangThai", "mutation", { id: viecId, den }, userId);
			const v1 = await moi("vc-roi 1");
			await doi(v1.id, "DANG_LAM", b.id);
			if ((await roi(v1.id)) === null) {
				throw new Error("vc: roiChuaLamLuc khong ghi");
			}
			const v2 = await moi("vc-roi 2");
			await doi(v2.id, "DANG_LAM", a.id);
			const v3 = await moi("vc-roi 3");
			await doi(v3.id, "HUY", a.id);
			if ((await roi(v2.id)) !== null || (await roi(v3.id)) !== null) {
				throw new Error("vc: roiChuaLamLuc ghi boi nguoi giao");
			}
			const v4 = await moi("vc-roi 4");
			await doi(v4.id, "DANG_LAM", b.id);
			const dau = await roi(v4.id);
			await doi(v4.id, "CHUA_LAM", b.id);
			await new Promise((r) => setTimeout(r, 20));
			await doi(v4.id, "DANG_LAM", b.id);
			if ((await roi(v4.id))?.getTime() !== dau?.getTime()) {
				throw new Error("vc: roiChuaLamLuc ghi lai");
			}
		},
		MA_TEST_MS,
	);
});

describe("vc-sua", () => {
	test(
		"vc-sua: chuỗi được để đúng một vết mỗi bước; chuỗi không được 403 không đổi; lịch sử mới nhất trước",
		async () => {
			const a = await nguoi("vc-sua-a", "member");
			const b = await nguoi("vc-sua-b", "member");
			const w = await nguoi("vc-sua-w", "member");
			const c = await nguoi("vc-sua-c", "member");
			const x = await nguoi("vc-sua-x", "member");
			const y = await nguoi("vc-sua-y", "member");
			const q = await nguoi("vc-sua-q", "admin");
			const { dealId } = await thoaThuan(app, a.id);
			const v = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-sua goc",
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [w.id, y.id],
				gan: [{ loai: "deal", id: dealId }],
			});
			const duoc: [
				string,
				string,
				string,
				Record<string, string | null>,
				string,
			][] = [
				[
					"doiNguoi",
					a.id,
					"viec.doiNguoiThucHien",
					{ nguoiThucHienId: c.id },
					"doi-nguoi-thuc-hien",
				],
				["tieuDe", a.id, "viec.sua", { tieuDe: "vc-sua moi" }, "doi-noi-dung"],
				["han A", a.id, "viec.sua", { hanNgay: "2026-11-01" }, "doi-han"],
				["theo X", a.id, "viec.theoDoi", { userId: x.id }, "theo-doi"],
				["han C", c.id, "viec.sua", { hanNgay: "2026-11-02" }, "doi-han"],
				["bo W", w.id, "viec.boTheoDoi", {}, "bo-theo-doi"],
				["Q tu theo", q.id, "viec.theoDoi", {}, "theo-doi"],
			];
			for (const [buoc, ai, ten, input, loai] of duoc) {
				const truoc = await demVet(v.id);
				const r = await goi(app, ten, "mutation", { id: v.id, ...input }, ai);
				const vet = await db.viecVet.findFirst({
					where: { viecId: v.id },
					orderBy: [{ luc: "desc" }, { id: "desc" }],
				});
				if (
					r.status !== 200 ||
					(await demVet(v.id)) !== truoc + 1 ||
					vet?.loai !== loai ||
					(vet.truoc === null && vet.sau === null)
				) {
					throw new Error(`vc: sua ${buoc} vet sai`);
				}
			}
			const khongDuoc: [string, string, string, Record<string, string>][] = [
				["B", b.id, "viec.sua", { hanNgay: "2026-11-03" }],
				["C", c.id, "viec.doiNguoiThucHien", { nguoiThucHienId: b.id }],
				["X", x.id, "viec.sua", { tieuDe: "X sua" }],
				["W", w.id, "viec.theoDoi", { userId: b.id }],
				["Y", y.id, "viec.theoDoi", { userId: b.id }],
			];
			for (const [ai, id, ten, input] of khongDuoc) {
				const truoc = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
				const vetTruoc = await demVet(v.id);
				const r = await goi(app, ten, "mutation", { id: v.id, ...input }, id);
				const sau = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
				if (
					r.code !== "FORBIDDEN" ||
					JSON.stringify(sau) !== JSON.stringify(truoc) ||
					(await demVet(v.id)) !== vetTruoc
				) {
					throw new Error(`vc: sua lot ${ai} ${ten}`);
				}
			}
			const ls = await goi(app, "viec.lichSu", "query", { id: v.id }, a.id);
			const dong = viecVetOutput.parse(ls.data);
			const lucs = dong.map((d) => Date.parse(d.luc));
			const giam = lucs.every((l, i) => i === 0 || l <= (lucs[i - 1] ?? l));
			if (
				dong.length !== 8 ||
				!giam ||
				dong.at(-1)?.loai !== "tao" ||
				dong.some((d) => !d.nguoi?.name || !d.nguon)
			) {
				throw new Error("vc: lich su sai thu tu");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-sua: vet hong — một dòng vết sai khuôn làm lichSu báo lỗi có lời, không trả rỗng",
		async () => {
			const a = await nguoi("vc-hong-a", "member");
			const v = await taoThu({ nguoiId: a.id, tieuDe: "vc-hong", gan: [] });
			const hong = await db.viecVet.create({
				data: {
					viecId: v.id,
					loai: "doi-han",
					truoc: 3,
					sau: "x",
					nguon: "web",
				},
			});
			const r = await goi(app, "viec.lichSu", "query", { id: v.id }, a.id);
			expect(r.status).toBe(500);
			expect(r.message).toContain(`Vết việc ${hong.id} không đọc được`);
		},
		MA_TEST_MS,
	);
});
