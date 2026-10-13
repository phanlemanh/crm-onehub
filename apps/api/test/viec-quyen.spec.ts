import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { KHONG_TRONG_PHAM_VI } from "@crm/auth";
import { db } from "@crm/db";
import { VIEC } from "@crm/db/viec";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { dashboardSummaryOutput } from "../src/dashboard/dashboard.contracts";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import {
	viecCuaBanGhiOutput,
	viecCuaToiNhomOutput,
} from "../src/viec/viec.contracts";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { WORKSPACE_CONFIG } from "../src/workspace/workspace-config";
import { doiVai, donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	cookieCua,
	doiThu,
	donViec,
	goi,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const MA_TEST_MS = 300_000;

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

const workspace = () =>
	new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);

async function maMember(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).id;
}

async function soDem() {
	return Promise.all([
		db.viec.count(),
		db.viecTheoDoi.count(),
		db.viecVet.count(),
	]);
}

describe("vc-vai-okr", () => {
	test(
		"vc-vai-okr: bảy đường đặt hay mở lại về người vai okr đều 400 có tên và «chỉ OKR», không ghi gì",
		async () => {
			const okr = await nguoi("Người OKR VC", "okr");
			const a = await nguoi("vc-okr-a", "member");
			const b = await nguoi("vc-okr-b", "member");
			const q = await nguoi("vc-okr-q", "admin");
			const { dealId } = await thoaThuan(app, a.id);
			const gan = [{ loai: "deal" as const, id: dealId }];
			const v = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-okr goc",
				nguoiThucHienId: b.id,
				gan,
			});
			await taoThu({ nguoiId: a.id, tieuDe: "vc-okr cua a", gan });
			const tenOkrCua = new Map<string, string>([
				["(1)", okr.name],
				["(2)", okr.name],
				["(3)", okr.name],
				["(4)", okr.name],
			]);
			const duong: [
				string,
				() => Promise<{ code: string | null; message: string; status: number }>,
			][] = [
				[
					"(1)",
					() =>
						goi(
							app,
							"viec.create",
							"mutation",
							{ tieuDe: "x", dealId, nguoiThucHienId: okr.id },
							a.id,
						),
				],
				[
					"(2)",
					() =>
						goi(
							app,
							"viec.doiNguoiThucHien",
							"mutation",
							{ id: v.id, nguoiThucHienId: okr.id },
							a.id,
						),
				],
				[
					"(3)",
					() =>
						goi(
							app,
							"viec.theoDoi",
							"mutation",
							{ id: v.id, userId: okr.id },
							a.id,
						),
				],
				[
					"(4)",
					() =>
						goi(
							app,
							"onboarding.transferWork",
							"mutation",
							{ fromUserId: a.id, toUserId: okr.id },
							q.id,
						),
				],
			];
			for (const [den, nguon] of [
				["(5)", "XONG"],
				["(6)", "CHO_DANH_GIA"],
				["(7)", "HUY"],
			] as const) {
				const m = await nguoi(`vc-okr-m ${den}`, "member");
				tenOkrCua.set(den, m.name);
				const mv = await taoThu({
					nguoiId: a.id,
					tieuDe: `vc-okr mo lai ${den}`,
					nguoiThucHienId: m.id,
					gan,
				});
				await doiThu(mv.id, a.id, nguon);
				await doiVai(m.id, "okr");
				const dich = nguon === "HUY" ? "CHUA_LAM" : "DANG_LAM";
				duong.push([
					den,
					() =>
						goi(
							app,
							"viec.doiTrangThai",
							"mutation",
							{ id: mv.id, den: dich },
							a.id,
						),
				]);
			}
			for (const [ten, chay] of duong) {
				const truoc = await soDem();
				const r = await chay();
				const sau = await soDem();
				const tenNguoi = tenOkrCua.get(ten) ?? "";
				const tenKhac = [
					a.name,
					b.name,
					q.name,
					...[...tenOkrCua.values()].filter((t) => t !== tenNguoi),
				];
				if (
					r.status !== 400 ||
					!r.message.includes(tenNguoi) ||
					tenKhac.some((t) => r.message.includes(t)) ||
					!r.message.includes("chỉ OKR") ||
					JSON.stringify(truoc) !== JSON.stringify(sau)
				) {
					throw new Error(`vc: giao cho vai okr khong bi chan ${ten}`);
				}
			}
			const m5 = await nguoi("vc-okr-m5 duong", "member");
			const v5 = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-okr doi chung",
				nguoiThucHienId: m5.id,
				gan,
			});
			await doiThu(v5.id, a.id, "XONG");
			const lam = await goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: v5.id, den: "DANG_LAM" },
				a.id,
			);
			expect(lam.status, "doi chung lam lai").toBe(200);
		},
		MA_TEST_MS,
	);

	test(
		"vc-vai-okr: việc riêng mở lại về người đã sang vai okr bị 400; gắn bản ghi đối tác vào việc có người vai okr (thực hiện hay theo dõi) bị 400, không ghi gì; đối chứng gắn được khi mọi người đều đọc được dữ liệu đối tác",
		async () => {
			const a = await nguoi("vc-okr2-a", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tenM: string[] = [];
			for (const [den, nguon] of [
				["(a1)", "XONG"],
				["(a2)", "CHO_DANH_GIA"],
				["(a3)", "HUY"],
			] as const) {
				const m = await nguoi(`vc-okr2-m ${den}`, "member");
				tenM.push(m.name);
				const rieng = await taoThu({
					nguoiId: a.id,
					tieuDe: `vc-okr2 rieng ${den}`,
					nguoiThucHienId: m.id,
					gan: [],
				});
				await doiThu(rieng.id, a.id, nguon);
				await doiVai(m.id, "okr");
				const truoc = await soDem();
				const r = await goi(
					app,
					"viec.doiTrangThai",
					"mutation",
					{ id: rieng.id, den: nguon === "HUY" ? "CHUA_LAM" : "DANG_LAM" },
					a.id,
				);
				if (
					r.status !== 400 ||
					!r.message.includes(m.name) ||
					[a.name, ...tenM.filter((t) => t !== m.name)].some((t) =>
						r.message.includes(t),
					) ||
					!r.message.includes("chỉ OKR") ||
					JSON.stringify(truoc) !== JSON.stringify(await soDem())
				) {
					throw new Error(
						`vc: giao cho vai okr khong bi chan viec rieng ${den}`,
					);
				}
			}
			const lam = await nguoi("vc-okr2-lam", "member");
			const theo = await nguoi("vc-okr2-theo", "member");
			for (const [den, doiAi] of [
				["thuc hien", "lam"],
				["theo doi", "theo"],
			] as const) {
				const v = await taoThu({
					nguoiId: a.id,
					tieuDe: `vc-okr2 gan ${den}`,
					nguoiThucHienId: lam.id,
					nguoiTheoDoiIds: [theo.id],
					gan: [],
				});
				const ten = doiAi === "lam" ? lam : theo;
				await doiVai(ten.id, "okr");
				const truoc = await soDem();
				const r = await goi(
					app,
					"viec.gan",
					"mutation",
					{ id: v.id, dealId },
					a.id,
				);
				if (
					r.status !== 400 ||
					!r.message.includes(ten.name) ||
					[a.name, lam.name, theo.name]
						.filter((t) => t !== ten.name)
						.some((t) => r.message.includes(t)) ||
					!r.message.includes("chỉ OKR") ||
					(await db.viecGan.count({ where: { viecId: v.id } })) !== 0 ||
					JSON.stringify(truoc) !== JSON.stringify(await soDem())
				) {
					throw new Error(`vc: gan doi tac cho vai okr khong bi chan ${den}`);
				}
				await doiVai(ten.id, "member");
			}
			const ok = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-okr2 doi chung",
				nguoiThucHienId: lam.id,
				nguoiTheoDoiIds: [theo.id],
				gan: [],
			});
			const gan = await goi(
				app,
				"viec.gan",
				"mutation",
				{ id: ok.id, dealId },
				a.id,
			);
			expect(gan.status, "doi chung gan").toBe(200);
			expect(await db.viecGan.count({ where: { viecId: ok.id } })).toBe(1);
		},
		MA_TEST_MS,
	);

	test("vc-vai-okr: lời 409 khi còn việc bỏ phần bằng 0 và giữ nguyên lời DA0a khi không có việc", () => {
		const { conViec, conViecKeHoach } = WORKSPACE_CONFIG.messages;
		const chi = conViec(0, 0, 2);
		expect(chi).toContain("giữ 2 việc đang mở");
		expect(chi).not.toContain("0 kế hoạch");
		expect(chi).not.toContain("0 bước");
		expect(chi).toContain("Chuyển việc");
		const haiPhan = conViec(0, 3, 2);
		expect(haiPhan).toContain("làm 3 bước và giữ 2 việc đang mở");
		expect(haiPhan).not.toContain("0 kế hoạch");
		expect(conViec(1, 3, 2)).toContain(
			"cầm trịch 1 kế hoạch, làm 3 bước và giữ 2 việc đang mở",
		);
		for (const [k, b] of [
			[1, 0],
			[0, 1],
			[2, 3],
		] as const) {
			expect(conViec(k, b, 0)).toBe(conViecKeHoach(k, b));
		}
	});

	test(
		"vc-vai-okr: router viec đóng cho vai okr, ô chọn không có họ, đổi vai bị 409 khi còn việc, chỉ theo dõi thì gỡ hết",
		async () => {
			const okr = await nguoi("vc-okr-cua", "okr");
			const a = await nguoi("vc-okr-a2", "member");
			const b = await nguoi("vc-okr-b2", "member");
			const c = await nguoi("vc-okr-c2", "member");
			const giaoThoi = await nguoi("vc-okr-g2", "member");
			const q = await nguoi("vc-okr-q2", "admin");
			const { dealId } = await thoaThuan(app, a.id);
			const gan = [{ loai: "deal" as const, id: dealId }];
			for (const [ten, loai, input] of [
				["viec.cuaToi", "query", { nhom: "giao-cho-toi" }],
				["viec.get", "query", { id: "khong-co" }],
				["viec.create", "mutation", { tieuDe: "x" }],
			] as const) {
				const r = await goi(app, ten, loai, input, okr.id);
				if (r.code !== "FORBIDDEN" || r.message !== KHONG_TRONG_PHAM_VI) {
					throw new Error(`vc: router viec mo cho vai okr ${ten}`);
				}
			}
			const ds = await goi(
				app,
				"onboarding.nguoiNhanViec",
				"query",
				undefined,
				a.id,
			);
			if ((ds.data as { id: string }[]).some((u) => u.id === okr.id)) {
				throw new Error("vc: o chon co vai okr");
			}
			const tao = await goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe: "vc dc", dealId, nguoiThucHienId: b.id },
				a.id,
			);
			expect(tao.status, "doi chung create").toBe(200);
			for (const [bien, userId] of [
				["thuc hien", b.id],
				["chi giao", giaoThoi.id],
			] as const) {
				if (bien === "chi giao") {
					await taoThu({
						nguoiId: giaoThoi.id,
						tieuDe: "vc giao thoi",
						nguoiThucHienId: b.id,
						gan,
					});
				}
				let loi = "";
				try {
					await workspace().setMemberRole(q.id, {
						memberId: await maMember(userId),
						role: "okr",
					});
				} catch (e) {
					loi = e instanceof Error ? e.message : String(e);
				}
				const vai = (await db.member.findFirstOrThrow({ where: { userId } }))
					.role;
				if (
					loi !== WORKSPACE_CONFIG.messages.conViec(0, 0, 1) ||
					!loi.includes("Chuyển việc") ||
					vai !== "member"
				) {
					throw new Error(
						`vc: doi vai khi con viec khong bi chan ${bien} ${loi}`,
					);
				}
			}
			await taoThu({
				nguoiId: a.id,
				tieuDe: "vc theo mo",
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [c.id],
				gan,
			});
			const theoXong = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc theo xong",
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [c.id],
				gan,
			});
			await doiThu(theoXong.id, a.id, "XONG");
			await workspace().setMemberRole(q.id, {
				memberId: await maMember(c.id),
				role: "okr",
			});
			if ((await db.viecTheoDoi.count({ where: { userId: c.id } })) !== 0) {
				throw new Error("vc: con theo doi viec sau doi vai");
			}
			expect(
				(await db.member.findFirstOrThrow({ where: { userId: c.id } })).role,
			).toBe("okr");
		},
		MA_TEST_MS,
	);
});

type Duong =
	| "get"
	| "lichSu"
	| "cuaToi"
	| "cuaBanGhi"
	| "tongQuan"
	| "rest"
	| "theoDoi";

const DUONG: readonly Duong[] = [
	"get",
	"lichSu",
	"cuaToi",
	"cuaBanGhi",
	"tongQuan",
	"rest",
	"theoDoi",
];

const NHOM_CUA = {
	giao: "toi-giao",
	thucHien: "giao-cho-toi",
	theoDoi: "dang-theo-doi",
	khac: "dang-theo-doi",
	quanTri: "dang-theo-doi",
} as const;

type Vai = keyof typeof NHOM_CUA;

type KetDoc = { status: number; message: string };

async function goiDoc(
	duong: "get" | "lichSu" | "rest" | "theoDoi",
	viecId: string,
	userId: string,
): Promise<KetDoc> {
	if (duong === "rest") {
		const res = await request(app.getHttpServer())
			.get(`${REST_BRIDGE_PATH}/viec/${viecId}`)
			.set("cookie", await cookieCua(userId));
		return { status: res.status, message: String(res.body?.message ?? "") };
	}
	const r = await goi(
		app,
		duong === "theoDoi" ? "viec.theoDoi" : `viec.${duong}`,
		duong === "theoDoi" ? "mutation" : "query",
		{ id: viecId },
		userId,
	);
	return {
		status: r.code === "NOT_FOUND" ? 404 : r.status,
		message: r.message,
	};
}

async function kiemODoc(
	duong: "get" | "lichSu" | "rest" | "theoDoi",
	ca: { tenViec: string; vai: Vai; viecId: string; userId: string },
	thay: boolean,
): Promise<void> {
	const truocTheo = await db.viecTheoDoi.count({
		where: { viecId: ca.viecId },
	});
	const { status, message } = await goiDoc(duong, ca.viecId, ca.userId);
	if (thay) {
		if (status !== 200) {
			throw new Error(
				`vc: viec rieng lo ${ca.vai} ${duong} doi chung ${status}`,
			);
		}
		return;
	}
	if (status === 200) throw new Error(`vc: viec rieng lo ${ca.vai} ${duong}`);
	if (status !== 404 || message !== VIEC.thongDiep.khongCoViec(ca.viecId)) {
		throw new Error(
			`vc: loi khong thay khac ma la ${duong} ${ca.tenViec} ${ca.vai} ${duong}`,
		);
	}
	if (
		(await db.viecTheoDoi.count({ where: { viecId: ca.viecId } })) !== truocTheo
	) {
		throw new Error(`vc: viec rieng lo ${ca.vai} ${duong}`);
	}
}

async function maDanhSach(
	duong: "cuaToi" | "cuaBanGhi" | "tongQuan",
	vai: Vai,
	userId: string,
	dealId: string,
): Promise<string[]> {
	if (duong === "cuaToi") {
		const r = await goi(
			app,
			"viec.cuaToi",
			"query",
			{ nhom: NHOM_CUA[vai] },
			userId,
		);
		return viecCuaToiNhomOutput.parse(r.data).mo.map((v) => v.id);
	}
	if (duong === "cuaBanGhi") {
		const r = await goi(app, "viec.cuaBanGhi", "query", { dealId }, userId);
		return viecCuaBanGhiOutput.parse(r.data).mo.map((v) => v.id);
	}
	const r = await goi(
		app,
		"dashboard.summary",
		"query",
		{ scope: "everyone" },
		userId,
	);
	return dashboardSummaryOutput.parse(r.data).viecQuaHan.map((v) => v.id);
}

async function kiemODanhSach(
	duong: "cuaToi" | "cuaBanGhi" | "tongQuan",
	ca: { tenViec: string; vai: Vai; viecId: string; userId: string },
	dealId: string,
	thay: boolean,
	trongCuoc: boolean,
): Promise<void> {
	const ids = await maDanhSach(duong, ca.vai, ca.userId, dealId);
	const co = ids.includes(ca.viecId);
	const mong =
		duong === "cuaBanGhi"
			? ca.tenViec === "G"
			: duong === "tongQuan"
				? thay
				: trongCuoc;
	if (co && !mong) throw new Error(`vc: viec rieng lo ${ca.vai} ${duong}`);
	if (!co && mong) {
		throw new Error(`vc: viec rieng lo ${ca.vai} ${duong} doi chung thieu`);
	}
}

describe("vc-xem", () => {
	test(
		"vc-xem: 2 việc × 5 người × 7 đường = 70 ô; việc riêng chỉ ba người trong cuộc thấy, lời như mã lạ",
		async () => {
			const p = {
				giao: await nguoi("vc-xem-a", "member"),
				thucHien: await nguoi("vc-xem-b", "member"),
				theoDoi: await nguoi("vc-xem-w", "member"),
				khac: await nguoi("vc-xem-x", "member"),
				quanTri: await nguoi("vc-xem-q", "admin"),
			};
			const { dealId } = await thoaThuan(app, p.giao.id);
			const homKia = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
			const chung = {
				nguoiId: p.giao.id,
				nguoiThucHienId: p.thucHien.id,
				nguoiTheoDoiIds: [p.theoDoi.id],
				hanNgay: new Date(`${homKia.toISOString().slice(0, 10)}T00:00:00.000Z`),
			};
			const G = await taoThu({
				...chung,
				tieuDe: "vc-xem G",
				gan: [{ loai: "deal", id: dealId }],
			});
			const R = await taoThu({ ...chung, tieuDe: "vc-xem R", gan: [] });
			const maLa = `khong-co-${Date.now()}`;
			const laLa = await goi(app, "viec.get", "query", { id: maLa }, p.khac.id);
			expect(laLa.message).toBe(VIEC.thongDiep.khongCoViec(maLa));
			let daChay = 0;
			for (const [tenViec, viec] of [
				["G", G],
				["R", R],
			] as const) {
				for (const vai of [
					"giao",
					"thucHien",
					"theoDoi",
					"khac",
					"quanTri",
				] as const) {
					const ca = { tenViec, vai, viecId: viec.id, userId: p[vai].id };
					const trongCuoc =
						vai === "giao" || vai === "thucHien" || vai === "theoDoi";
					const thay = tenViec === "G" || trongCuoc;
					for (const duong of DUONG) {
						daChay += 1;
						if (
							duong === "get" ||
							duong === "lichSu" ||
							duong === "rest" ||
							duong === "theoDoi"
						) {
							await kiemODoc(duong, ca, thay);
						} else {
							await kiemODanhSach(duong, ca, dealId, thay, trongCuoc);
						}
					}
				}
			}
			if (daChay !== 70) throw new Error(`vc: ma tran xem thieu o ${daChay}`);
		},
		MA_TEST_MS,
	);

	test(
		"vc-xem: quyen của viec.get theo vai — đích trạng thái và Xoá khớp bảng viết trước",
		async () => {
			const p = {
				giao: await nguoi("vc-xem-quyen-a", "member"),
				thucHien: await nguoi("vc-xem-quyen-b", "member"),
				theoDoi: await nguoi("vc-xem-quyen-w", "member"),
				khac: await nguoi("vc-xem-quyen-x", "member"),
				quanTri: await nguoi("vc-xem-quyen-q", "admin"),
			};
			const { dealId } = await thoaThuan(app, p.giao.id);
			const BANG = {
				CHUA_LAM: {
					giao: ["DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"],
					thucHien: ["DANG_LAM", "CHO_DANH_GIA", "XONG"],
				},
				DANG_LAM: {
					giao: ["CHUA_LAM", "CHO_DANH_GIA", "XONG", "HUY"],
					thucHien: ["CHUA_LAM", "CHO_DANH_GIA", "XONG"],
				},
				CHO_DANH_GIA: {
					giao: ["DANG_LAM", "XONG", "HUY"],
					thucHien: [],
				},
			} as const;
			const v = await taoThu({
				nguoiId: p.giao.id,
				tieuDe: "vc-xem quyen",
				nguoiThucHienId: p.thucHien.id,
				nguoiTheoDoiIds: [p.theoDoi.id],
				gan: [{ loai: "deal", id: dealId }],
			});
			for (const trangThai of [
				"CHUA_LAM",
				"DANG_LAM",
				"CHO_DANH_GIA",
			] as const) {
				if (trangThai !== "CHUA_LAM") {
					await doiThu(v.id, p.giao.id, trangThai);
				}
				for (const vai of [
					"giao",
					"thucHien",
					"theoDoi",
					"khac",
					"quanTri",
				] as const) {
					const r = await goi(
						app,
						"viec.get",
						"query",
						{ id: v.id },
						p[vai].id,
					);
					const quyen = (
						r.data as { quyen: { trangThai: string[]; xoa: boolean } }
					).quyen;
					const mongTrangThai: readonly string[] =
						vai === "giao" || vai === "thucHien" ? BANG[trangThai][vai] : [];
					const mongXoa = vai === "giao" && trangThai === "CHUA_LAM";
					if (
						r.status !== 200 ||
						JSON.stringify(quyen.trangThai) !== JSON.stringify(mongTrangThai)
					) {
						throw new Error(
							`vc: quyen trang thai sai ${vai} ${trangThai} ${JSON.stringify(quyen.trangThai)}`,
						);
					}
					if (quyen.xoa !== mongXoa) {
						throw new Error(`vc: quyen xoa sai ${vai} ${trangThai}`);
					}
				}
			}
		},
		MA_TEST_MS,
	);
});
