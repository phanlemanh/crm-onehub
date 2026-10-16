import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import {
	doiGiaiDoan,
	donGiaiDoan,
	type GiaiDoanGieo,
	gieoGiaiDoan,
	goiYCua,
	khuonMotBuoc,
	type LoaiO,
	ok,
	taoCongTy,
	taoDeal,
} from "./support/goi-y-gieo";
import { dichVu, donDep, moXuong } from "./support/ke-hoach-gieo";
import { batApp, cookieCua, donViec, goi, nguoi } from "./support/viec-gieo";

const MA_TEST_MS = 180_000;
const DA_XU_LY = "Gợi ý này đã được xử lý.";

let app: NestExpressApplication;
let gd: GiaiDoanGieo;
let P: { id: string };
let QT: { id: string };
let X: { id: string };
let OKR: { id: string };

beforeAll(async () => {
	await moXuong();
	app = await batApp();
	gd = await gieoGiaiDoan();
	P = await nguoi("GY Phụ trách");
	QT = await nguoi("GY Quản trị", "admin");
	X = await nguoi("GY Người khác");
	OKR = await nguoi("GY Chỉ OKR", "okr");
});

afterAll(async () => {
	await app.close();
	await donGiaiDoan();
	await donViec();
	await donDep();
});

function nem(thongDiep: string): never {
	throw new Error(thongDiep);
}

async function boQua(goiYId: string, nguoiId: string) {
	return goi(app, "onboarding.boQuaGoiY", "mutation", { id: goiYId }, nguoiId);
}

async function denThang(dealId: string): Promise<void> {
	ok(await doiGiaiDoan(app, P.id, dealId, gd.W), "gy: dung o hong");
}

async function goiYCho(dealId: string) {
	const ds = await goiYCua(dealId);
	return ds.filter((g) => g.trangThai === "CHO");
}

const DICH: Record<
	Exclude<LoaiO, "tao">,
	Record<"mo" | "thang" | "thua", string>
> = {
	mo: { mo: "M2", thang: "W", thua: "L" },
	thang: { mo: "M1", thang: "W2", thua: "L" },
	thua: { mo: "M1", thang: "W", thua: "L2" },
};

const MA_TRAN: { tu: LoaiO; den: "mo" | "thang" | "thua"; sinh: boolean }[] = [
	{ tu: "tao", den: "mo", sinh: false },
	{ tu: "tao", den: "thang", sinh: true },
	{ tu: "tao", den: "thua", sinh: false },
	{ tu: "mo", den: "mo", sinh: false },
	{ tu: "mo", den: "thang", sinh: true },
	{ tu: "mo", den: "thua", sinh: false },
	{ tu: "thang", den: "mo", sinh: false },
	{ tu: "thang", den: "thang", sinh: false },
	{ tu: "thang", den: "thua", sinh: false },
	{ tu: "thua", den: "mo", sinh: false },
	{ tu: "thua", den: "thang", sinh: true },
	{ tu: "thua", den: "thua", sinh: false },
];

function giaiDoanCua(ten: string): string {
	return gd[ten as keyof GiaiDoanGieo];
}

async function chayO(o: (typeof MA_TRAN)[number]) {
	const ten = `${o.tu}→${o.den}`;
	if (o.tu === "tao") {
		const stage = { mo: gd.M1, thang: gd.W, thua: gd.L }[o.den];
		const { dealId, congTyId } = await taoDeal(app, {
			nguoiId: P.id,
			stage,
		});
		const deal = await db.deal.findUniqueOrThrow({ where: { id: dealId } });
		return { ten, dealId, congTyId, truoc: 0, moc: deal.createdAt };
	}
	const { dealId, congTyId } = await taoDeal(app, {
		nguoiId: P.id,
		stage: gd.M1,
	});
	if (o.tu === "thang") {
		await denThang(dealId);
		const [dung] = await goiYCho(dealId);
		if (!dung) nem(`gy: o sinh sai dung ${ten} 0`);
		ok(await boQua(dung.id, P.id), "gy: bo qua luc dung hong");
	}
	if (o.tu === "thua") {
		ok(await doiGiaiDoan(app, P.id, dealId, gd.L, true), "gy: dung o hong");
	}
	const truoc = (await goiYCua(dealId)).length;
	const den = giaiDoanCua(DICH[o.tu][o.den]);
	ok(
		await doiGiaiDoan(app, P.id, dealId, den, o.den === "thua"),
		`gy: chuyen hong ${ten}`,
	);
	const hd = await db.activity.findFirstOrThrow({
		where: { dealId, type: "STAGE_CHANGE" },
		orderBy: { occurredAt: "desc" },
	});
	return { ten, dealId, congTyId, truoc, moc: hd.occurredAt };
}

describe("gy-sinh", () => {
	test(
		"ma trận 12 ô đi → đến sinh đúng ba ô",
		async () => {
			let daChay = 0;
			for (const o of MA_TRAN) {
				const kq = await chayO(o);
				daChay += 1;
				const ds = await goiYCua(kq.dealId);
				const moi = ds.length - kq.truoc;
				if (!o.sinh) {
					if (moi !== 0) nem(`gy: o khong sinh lai sinh ${kq.ten}`);
					continue;
				}
				if (moi !== 1) nem(`gy: o sinh sai ${kq.ten} ${moi}`);
				const g = ds[ds.length - 1];
				if (!g) nem(`gy: o sinh sai ${kq.ten} 0`);
				if (g.trangThai !== "CHO")
					nem(`gy: goi y sai truong ${kq.ten} trangThai`);
				if (g.nguoiNhanId !== P.id)
					nem(`gy: goi y sai truong ${kq.ten} nguoiNhanId`);
				if (g.companyId !== kq.congTyId)
					nem(`gy: goi y sai truong ${kq.ten} companyId`);
				if (g.chuyenLuc.getTime() !== kq.moc.getTime())
					nem(`gy: chuyenLuc lech ${kq.ten}`);
			}
			if (daChay !== 12) nem(`gy: ma tran thieu o ${daChay}`);
			expect(daChay).toBe(12);
		},
		MA_TEST_MS,
	);

	test(
		"bulkSetStage mở → thắng sinh cho từng deal",
		async () => {
			const a = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			const b = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			ok(
				await goi(
					app,
					"deals.bulkSetStage",
					"mutation",
					{ ids: [a.dealId, b.dealId], stage: gd.W },
					P.id,
				),
				"gy: bulk khong sinh",
			);
			for (const d of [a, b]) {
				if ((await goiYCua(d.dealId)).length !== 1) nem("gy: bulk khong sinh");
			}
			expect((await goiYCua(a.dealId)).length).toBe(1);
		},
		MA_TEST_MS,
	);

	test(
		"người phụ trách vai chỉ OKR vẫn nhận gợi ý",
		async () => {
			const d = await taoDeal(app, {
				nguoiId: P.id,
				chuId: OKR.id,
				stage: gd.M1,
			});
			await denThang(d.dealId);
			const [g] = await goiYCho(d.dealId);
			if (g?.nguoiNhanId !== OKR.id) nem("gy: nguoi phu trach okr mat goi y");
			expect(g?.nguoiNhanId).toBe(OKR.id);
		},
		MA_TEST_MS,
	);

	test(
		"lưu trữ cột thắng dời deal sang cột thắng khác không sinh",
		async () => {
			const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			ok(await doiGiaiDoan(app, P.id, d.dealId, gd.W3), "gy: dung o hong");
			const [g] = await goiYCho(d.dealId);
			if (!g) nem("gy: luu tru giai doan dung hong");
			ok(await boQua(g.id, P.id), "gy: bo qua luc dung hong");
			const truoc = await db.goiYKeHoach.count();
			ok(
				await goi(
					app,
					"giaiDoan.archive",
					"mutation",
					{ id: gd.W3, moveTo: gd.W4 },
					QT.id,
				),
				"gy: luu tru giai doan hong",
			);
			const deal = await db.deal.findUniqueOrThrow({ where: { id: d.dealId } });
			if (deal.stage !== gd.W4) nem("gy: luu tru giai doan khong doi deal");
			if ((await db.goiYKeHoach.count()) !== truoc)
				nem("gy: luu tru giai doan sinh");
			expect(await db.goiYKeHoach.count()).toBe(truoc);
		},
		MA_TEST_MS,
	);
});

describe("gy-chan", () => {
	test(
		"gợi ý chờ chặn sinh thêm",
		async () => {
			const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(d.dealId);
			for (const stage of [gd.M1, gd.W]) {
				const ket = await doiGiaiDoan(app, P.id, d.dealId, stage);
				if (ket.status >= 300) nem("gy: chan cho khong chan");
			}
			if ((await goiYCua(d.dealId)).length !== 1)
				nem("gy: chan cho khong chan");
			expect((await goiYCua(d.dealId)).length).toBe(1);
		},
		MA_TEST_MS,
	);

	test(
		"đã bỏ qua thì thắng lại sinh gợi ý mới",
		async () => {
			const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(d.dealId);
			const [g] = await goiYCho(d.dealId);
			if (!g) nem("gy: sinh lai sau bo qua sai");
			ok(await boQua(g.id, P.id), "gy: sinh lai sau bo qua sai");
			ok(
				await doiGiaiDoan(app, P.id, d.dealId, gd.M1),
				"gy: sinh lai sau bo qua sai",
			);
			await denThang(d.dealId);
			const ds = await goiYCua(d.dealId);
			const cho = ds.filter((x) => x.trangThai === "CHO").length;
			if (cho !== 1 || ds.length !== 2) nem("gy: sinh lai sau bo qua sai");
			expect(ds.length).toBe(2);
		},
		MA_TEST_MS,
	);

	test(
		"công ty có kế hoạch mở thì không sinh; đóng rồi thì sinh",
		async () => {
			const congTyId = await taoCongTy(app, P.id);
			const khuonId = await khuonMotBuoc();
			const plan = await dichVu().createFromTemplate({
				companyId: congTyId,
				templateId: khuonId,
				startedAt: new Date("2026-10-15T00:00:00.000Z"),
				ownerId: P.id,
			});
			const e = await taoDeal(app, { nguoiId: P.id, congTyId, stage: gd.M1 });
			await denThang(e.dealId);
			if ((await goiYCua(e.dealId)).length !== 0)
				nem("gy: chan ke hoach mo khong chan");
			ok(
				await goi(
					app,
					"onboarding.closePlan",
					"mutation",
					{ id: plan.id },
					P.id,
				),
				"gy: dong ke hoach hong",
			);
			ok(
				await doiGiaiDoan(app, P.id, e.dealId, gd.M1),
				"gy: ke hoach dong van chan",
			);
			await denThang(e.dealId);
			if ((await goiYCua(e.dealId)).length !== 1)
				nem("gy: ke hoach dong van chan");
			expect((await goiYCua(e.dealId)).length).toBe(1);
		},
		MA_TEST_MS,
	);

	test(
		"hai lần chuyển đồng thời chỉ một gợi ý chờ",
		async () => {
			const f = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			const ket = await Promise.all([
				doiGiaiDoan(app, P.id, f.dealId, gd.W),
				doiGiaiDoan(app, QT.id, f.dealId, gd.W),
			]);
			if (ket.some((k) => k.status >= 300)) nem("gy: chan cho khong chan");
			const cho = (await goiYCho(f.dealId)).length;
			if (cho !== 1) nem(`gy: dong thoi sinh ${cho}`);
			const chiMuc = await db.$queryRaw<{ indexdef: string }[]>`
				SELECT indexdef FROM pg_indexes
				WHERE tablename = 'goiYKeHoach' AND indexname = 'goiYKeHoach_dealId_cho_key'
			`;
			const def = chiMuc[0]?.indexdef ?? "";
			if (!def.includes("UNIQUE") || !def.includes("'CHO'"))
				nem("gy: thieu chi muc cho");
			expect(cho).toBe(1);
		},
		MA_TEST_MS,
	);
});

describe("gy-xu-ly", () => {
	test(
		"bảng người × thủ tục",
		async () => {
			const dungGoiY = async () => {
				const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
				await denThang(d.dealId);
				const [g] = await goiYCho(d.dealId);
				if (!g) nem("gy: dung goi y hong");
				return { dealId: d.dealId, goiYId: g.id };
			};
			const docCua = async (dealId: string, ai: { id: string }) =>
				goi(app, "onboarding.goiYCuaDeal", "query", { dealId }, ai.id);
			const BANG = [
				{ ai: "P", thu: "doc", mong: "co" },
				{ ai: "QT", thu: "doc", mong: "co" },
				{ ai: "X", thu: "doc", mong: "rong" },
				{ ai: "OKR", thu: "doc", mong: "rong" },
				{ ai: "P", thu: "bo-qua", mong: "duoc" },
				{ ai: "QT", thu: "bo-qua", mong: "duoc" },
				{ ai: "X", thu: "bo-qua", mong: "cam" },
				{ ai: "OKR", thu: "bo-qua", mong: "cam" },
			] as const;
			const NGUOI = { P, QT, X, OKR };
			let daChay = 0;
			for (const o of BANG) {
				const ai = NGUOI[o.ai];
				const { dealId, goiYId } = await dungGoiY();
				daChay += 1;
				if (o.thu === "doc") {
					const ket = await docCua(dealId, ai);
					const ra =
						ket.status < 300 ? (ket.data as { id: string } | null) : null;
					if (o.mong === "co" && ra?.id !== goiYId) {
						nem(
							o.ai === "P"
								? "gy: nguoi nhan khong doc duoc"
								: "gy: quan tri khong doc duoc",
						);
					}
					if (o.mong === "rong" && ra !== null) nem("gy: nguoi khac doc duoc");
					continue;
				}
				const truoc = await db.goiYKeHoach.findUniqueOrThrow({
					where: { id: goiYId },
				});
				const ket = await boQua(goiYId, ai.id);
				const sau = await db.goiYKeHoach.findUniqueOrThrow({
					where: { id: goiYId },
				});
				if (o.mong === "cam") {
					if (
						ket.code !== "FORBIDDEN" ||
						JSON.stringify(truoc) !== JSON.stringify(sau)
					) {
						nem(`gy: nguoi khac bo qua duoc ${o.ai}`);
					}
					continue;
				}
				if (
					sau.trangThai !== "BO_QUA" ||
					sau.xuLyBoiId !== ai.id ||
					!sau.xuLyLuc
				) {
					nem(
						o.ai === "P"
							? "gy: bo qua nguoi nhan sai"
							: "gy: bo qua quan tri sai",
					);
				}
			}
			if (daChay !== BANG.length) nem("gy: bang quyen thieu o");
			expect(daChay).toBe(BANG.length);
		},
		MA_TEST_MS,
	);

	test(
		"deal rời thắng hay lưu trữ thì không đọc ra gợi ý",
		async () => {
			const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(d.dealId);
			ok(await doiGiaiDoan(app, P.id, d.dealId, gd.M1), "gy: roi thang hong");
			const roi = await goi(
				app,
				"onboarding.goiYCuaDeal",
				"query",
				{ dealId: d.dealId },
				P.id,
			);
			if (roi.data !== null) nem("gy: goi y hien khi deal roi thang");
			const e = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(e.dealId);
			ok(
				await goi(app, "deals.archive", "mutation", { id: e.dealId }, P.id),
				"gy: luu tru deal hong",
			);
			const luu = await goi(
				app,
				"onboarding.goiYCuaDeal",
				"query",
				{ dealId: e.dealId },
				P.id,
			);
			if (luu.data !== null) nem("gy: goi y hien tren deal luu tru");
			expect(luu.data).toBeNull();
		},
		MA_TEST_MS,
	);

	test(
		"bỏ qua lại gợi ý đã xử lý bị chặn",
		async () => {
			const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(d.dealId);
			const [g] = await goiYCho(d.dealId);
			if (!g) nem("gy: dung goi y hong");
			ok(await boQua(g.id, P.id), "gy: bo qua nguoi nhan sai");
			const truoc = await db.goiYKeHoach.findUniqueOrThrow({
				where: { id: g.id },
			});
			const ket = await boQua(g.id, P.id);
			const sau = await db.goiYKeHoach.findUniqueOrThrow({
				where: { id: g.id },
			});
			if (
				ket.code !== "BAD_REQUEST" ||
				!ket.message.includes(DA_XU_LY) ||
				JSON.stringify(truoc) !== JSON.stringify(sau)
			) {
				nem("gy: xu ly lai khong bi chan");
			}
			expect(ket.code).toBe("BAD_REQUEST");
		},
		MA_TEST_MS,
	);

	test(
		"tạo kế hoạch và bỏ qua cùng lúc chỉ một bên thắng",
		async () => {
			const d = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(d.dealId);
			const [g] = await goiYCho(d.dealId);
			if (!g) nem("gy: dung goi y hong");
			const khuonId = await khuonMotBuoc();
			const [tao, bo] = await Promise.all([
				goi(
					app,
					"onboarding.createFromTemplate",
					"mutation",
					{
						companyId: d.congTyId,
						templateId: khuonId,
						startedAt: "2026-10-16",
						ownerId: P.id,
					},
					P.id,
				),
				boQua(g.id, P.id),
			]);
			const sau = await db.goiYKeHoach.findUniqueOrThrow({
				where: { id: g.id },
			});
			const hopLe =
				tao.status < 300 &&
				((sau.trangThai === "BO_QUA" && bo.status < 300) ||
					(sau.trangThai === "DA_MO" && bo.code === "BAD_REQUEST"));
			if (!hopLe) nem(`gy: dua tao va bo qua ${sau.trangThai} ${bo.status}`);
			expect(hopLe).toBe(true);
		},
		MA_TEST_MS,
	);
});

describe("gy-dong", () => {
	async function dungCongTy() {
		const congTyId = await taoCongTy(app, P.id);
		const a = await taoDeal(app, { nguoiId: P.id, congTyId, stage: gd.M1 });
		const b = await taoDeal(app, { nguoiId: P.id, congTyId, stage: gd.M1 });
		const c = await taoDeal(app, { nguoiId: P.id, congTyId, stage: gd.M1 });
		await denThang(c.dealId);
		const [cu] = await goiYCho(c.dealId);
		if (!cu) nem("gy: dung goi y hong");
		ok(await boQua(cu.id, P.id), "gy: dung goi y hong");
		await denThang(a.dealId);
		await denThang(b.dealId);
		const cho = await db.goiYKeHoach.findMany({
			where: { companyId: congTyId, trangThai: "CHO" },
		});
		if (cho.length !== 2) nem("gy: dung goi y hong");
		const boQuaCu = await db.goiYKeHoach.findUniqueOrThrow({
			where: { id: cu.id },
		});
		return { congTyId, cho, boQuaCu };
	}

	async function kiemDong(
		khung: Awaited<ReturnType<typeof dungCongTy>>,
		planId: string,
		thongDiep: string,
	) {
		for (const g of khung.cho) {
			const sau = await db.goiYKeHoach.findUniqueOrThrow({
				where: { id: g.id },
			});
			if (
				sau.trangThai !== "DA_MO" ||
				sau.planId !== planId ||
				sau.xuLyBoiId !== X.id ||
				!sau.xuLyLuc
			) {
				nem(`${thongDiep} ${g.id}`);
			}
		}
		const cu = await db.goiYKeHoach.findUniqueOrThrow({
			where: { id: khung.boQuaCu.id },
		});
		if (JSON.stringify(cu) !== JSON.stringify(khung.boQuaCu))
			nem("gy: dong ca goi y da bo qua");
	}

	test(
		"tạo kế hoạch qua tRPC và REST đóng gợi ý chờ của công ty",
		async () => {
			const C = await dungCongTy();
			const K = await taoDeal(app, { nguoiId: P.id, stage: gd.M1 });
			await denThang(K.dealId);
			const [gK] = await goiYCho(K.dealId);
			if (!gK) nem("gy: dung goi y hong");
			const khuonId = await khuonMotBuoc();
			const tao = await goi(
				app,
				"onboarding.createFromTemplate",
				"mutation",
				{
					companyId: C.congTyId,
					templateId: khuonId,
					startedAt: "2026-10-16",
					ownerId: X.id,
				},
				X.id,
			);
			const plan = ok(tao, "gy: tao ke hoach khong dong goi y") as {
				id: string;
			};
			await kiemDong(C, plan.id, "gy: tao ke hoach khong dong goi y");
			const kSau = await db.goiYKeHoach.findUniqueOrThrow({
				where: { id: gK.id },
			});
			if (kSau.trangThai !== "CHO") nem("gy: dong goi y cong ty khac");

			const C2 = await dungCongTy();
			const res = await request(app.getHttpServer())
				.post(`${REST_BRIDGE_PATH}/onboarding/plans`)
				.set("cookie", await cookieCua(X.id))
				.send({
					companyId: C2.congTyId,
					templateId: khuonId,
					startedAt: "2026-10-16",
					ownerId: X.id,
				});
			if (res.status >= 300) nem("gy: rest khong dong goi y");
			await kiemDong(C2, res.body.id, "gy: rest khong dong goi y");
			expect(res.status).toBeLessThan(300);
		},
		MA_TEST_MS,
	);

	test(
		"tạo kế hoạch hỏng thì gợi ý không đổi",
		async () => {
			const C3 = await dungCongTy();
			const khuonId = await khuonMotBuoc();
			await dichVu().archiveTemplate({ id: khuonId });
			const tao = await goi(
				app,
				"onboarding.createFromTemplate",
				"mutation",
				{
					companyId: C3.congTyId,
					templateId: khuonId,
					startedAt: "2026-10-16",
					ownerId: X.id,
				},
				X.id,
			);
			if (tao.status < 300) nem("gy: tao hong van dong goi y");
			for (const g of C3.cho) {
				const sau = await db.goiYKeHoach.findUniqueOrThrow({
					where: { id: g.id },
				});
				if (sau.trangThai !== "CHO") nem("gy: tao hong van dong goi y");
			}
			expect(tao.status).toBeGreaterThanOrEqual(300);
		},
		MA_TEST_MS,
	);
});
