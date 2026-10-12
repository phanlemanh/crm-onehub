import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db } from "@crm/db";
import {
	docPhanHoiKeoVe,
	idTep,
	TIN_HIEU,
	tepTinHieu,
} from "@crm/validation/tin-hieu";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `gth${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = ["a", "b", "c", "d", "owner", "admin", "member", "okr"] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	a: "member",
	b: "member",
	c: "member",
	d: "member",
	owner: "owner",
	admin: "admin",
	member: "member",
	okr: "okr",
} satisfies Record<Nguoi, WorkspaceRole>;
const MS_GIO = 60 * 60 * 1000;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;
let pbDung = "";
let pbCat = "";

type Tra = { status: number; data: unknown; loi: string };

async function trpc(
	n: Nguoi,
	thuTuc: string,
	kieu: "query" | "mutation",
	vao?: unknown,
): Promise<Tra> {
	const r =
		kieu === "query"
			? await request(app.getHttpServer())
					.get(
						`/api/trpc/${thuTuc}${vao === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(vao))}`}`,
					)
					.set("cookie", cookie[n])
			: await request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie[n])
					.set("content-type", "application/json")
					.send(JSON.stringify(vao ?? {}));
	return {
		status: r.status,
		data: r.body?.result?.data,
		loi: String(r.body?.error?.message ?? ""),
	};
}

const gui = (n: Nguoi, muonLam: string, daXayRa: string, man = "/okr/kr") =>
	trpc(n, "tinHieu.gui", "mutation", { muonLam, daXayRa, man });

async function khoaCua(n: Nguoi): Promise<string> {
	return (
		await auth.api.createApiKey({ body: { name: `gth-${n}`, userId: uid(n) } })
	).key;
}

function keoVeRest(key: string) {
	return request(app.getHttpServer())
		.post(`${REST_BRIDGE_PATH}/tin-hieu/keo-ve`)
		.set(API_KEY_HEADER, key)
		.set("content-type", "application/json")
		.send("{}");
}

async function don() {
	await db.tinHieu.deleteMany({});
}

beforeAll(async () => {
	app = await createApp();
	const pa = await db.department.create({
		data: { name: `${TIEN_TO} Kinh doanh`, position: 9001 },
	});
	const pb = await db.department.create({
		data: { name: `${TIEN_TO} Cũ`, position: 9002, archivedAt: new Date() },
	});
	pbDung = pa.id;
	pbCat = pb.id;
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
	}
	for (const [n, pb] of [
		["a", pbDung],
		["b", pbCat],
		["d", pbDung],
	] as const)
		await db.orgPlacement.upsert({
			where: { userId: uid(n) },
			create: { userId: uid(n), primaryDepartmentId: pb },
			update: { primaryDepartmentId: pb },
		});
	await don();
}, 120_000);

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await don();
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.apikey.deleteMany({
		where: { referenceId: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.department.deleteMany({ where: { id: { in: [pbDung, pbCat] } } });
	await app.close();
});

describe("gth-gui", () => {
	test("gth-gui: ma tran bon nguoi gui — mot hang, phong ban luc gui, man sach, tieu de tu dong dau", async () => {
		await don();
		const kyVong = { a: pbDung, b: null, c: null, d: pbDung } as const;
		const man = {
			a: "/okr/kr",
			b: "/tai-lieu",
			c: "/",
			d: "/okr?q=1#x",
		} as const;
		let soTruoc = 0;
		for (const n of ["a", "b", "c", "d"] as const) {
			const tra = await gui(
				n,
				`  muon ${n}  `,
				`\n  xay ra ${n}\nchi tiet ${n}`,
				man[n],
			);
			expect(`${n}: ${tra.status} ${tra.loi}`).toBe(`${n}: 200 `);
			const { id, ma } = tra.data as { id: string; ma: string };
			const hang = await db.tinHieu.findUniqueOrThrow({ where: { id } });
			expect(hang.nguoiGuiId).toBe(uid(n));
			expect(
				hang.phongBanId,
				n === "b" ? "phong ban da luu tru van gan" : `phong ban cua ${n}`,
			).toBe(kyVong[n]);
			expect(hang.man, "man mang phan truy van").not.toMatch(/[?#]/);
			expect(hang.muonLam).toBe(`muon ${n}`);
			expect(hang.daXayRa).toBe(`xay ra ${n}\nchi tiet ${n}`);
			expect(hang.tieuDe).toBe(`xay ra ${n}`);
			expect(hang.so).toBeGreaterThan(soTruoc);
			soTruoc = hang.so;
			expect(ma).toBe(idTep(hang.so));
		}
		expect(await db.tinHieu.count()).toBe(4);
	});

	test("gth-gui: tieu de mot dong 300 ky tu cat dung TIN_HIEU.doDaiTieuDe", async () => {
		const tra = await gui("a", "m", "z".repeat(300));
		const { id } = tra.data as { id: string };
		const hang = await db.tinHieu.findUniqueOrThrow({ where: { id } });
		expect(hang.tieuDe).toBe(`${"z".repeat(TIN_HIEU.doDaiTieuDe)}…`);
	});
});

describe("gth-tran", () => {
	test("gth-tran: du tran trong ngay gio Viet Nam thi 429 khong cat gi, sang ngay moi gui lai duoc", async () => {
		await don();
		setSystemTime(new Date("2026-10-15T16:00:00.000Z"));
		for (let i = 0; i < TIN_HIEU.tranMoiNgay; i++)
			expect((await gui("c", "m", `x ${i}`)).status).toBe(200);
		const truoc = await db.tinHieu.count({ where: { nguoiGuiId: uid("c") } });
		const vuot = await gui("c", "m", "vuot");
		expect(vuot.status).toBe(429);
		expect(vuot.loi).toContain(String(TIN_HIEU.tranMoiNgay));
		expect(await db.tinHieu.count({ where: { nguoiGuiId: uid("c") } })).toBe(
			truoc,
		);
		setSystemTime(new Date("2026-10-15T16:59:00.000Z"));
		expect(
			(await gui("c", "m", "van ngay cu")).status,
			"tran tinh theo ngay UTC",
		).toBe(429);
		setSystemTime(new Date("2026-10-15T17:00:00.000Z"));
		expect(
			(await gui("c", "m", "ngay moi")).status,
			"tran tinh theo ngay UTC",
		).toBe(200);
	});

	test("gth-tran: moi o dai qua TIN_HIEU.doDaiMoiO bi tu choi, khong cat", async () => {
		const dai = "a".repeat(TIN_HIEU.doDaiMoiO + 1);
		expect((await gui("b", dai, "ok")).status).toBe(400);
		expect((await gui("b", "ok", dai)).status).toBe(400);
		expect((await gui("b", "   ", "ok")).status).toBe(400);
	});

	test("gth-tran: hai loi goi dong thoi o so tran - 1 chi mot qua", async () => {
		await don();
		for (let i = 0; i < TIN_HIEU.tranMoiNgay - 1; i++)
			await gui("d", "m", `x ${i}`);
		const [p, q] = await Promise.all([gui("d", "m", "p"), gui("d", "m", "q")]);
		expect([p.status, q.status].sort(), "hai loi goi cung vuot tran").toEqual([
			200, 429,
		]);
	});
});

describe("gth-cua-toi", () => {
	test("gth-cua-toi: moi nguoi chi thay tin hieu cua minh, moi nhat truoc", async () => {
		await don();
		const goc = Date.parse("2026-10-14T03:00:00.000Z");
		let k = 0;
		for (let vong = 0; vong < 3; vong++)
			for (const n of ["a", "b", "c"] as const) {
				setSystemTime(new Date(goc + k * MS_GIO));
				k += 1;
				await gui(n, "m", `${n} ${vong}`);
			}
		setSystemTime();
		for (const n of ["a", "b", "c"] as const) {
			const tra = await trpc(n, "tinHieu.cuaToi", "query");
			expect(tra.status).toBe(200);
			const rows = (tra.data as { rows: { id: string; guiLuc: string }[] })
				.rows;
			const cua = await db.tinHieu.findMany({
				where: { nguoiGuiId: uid(n) },
				select: { id: true },
			});
			expect(
				rows.map((r) => r.id).sort(),
				"danh sach lo tin hieu nguoi khac",
			).toEqual(cua.map((r) => r.id).sort());
			const luc = rows.map((r) => Date.parse(r.guiLuc));
			expect(luc).toEqual([...luc].sort((x, y) => y - x));
		}
	});

	test("gth-cua-toi: khong phien thi 401", async () => {
		const r = await request(app.getHttpServer()).get(
			"/api/trpc/tinHieu.cuaToi",
		);
		expect(r.status).toBe(401);
	});
});

describe("gth-xoa", () => {
	test("gth-xoa: ma tran bon o — chua keo ve xoa duoc, da keo ve 409, nguoi khac 404", async () => {
		await don();
		const moi = async (n: Nguoi) =>
			((await gui(n, "m", "x")).data as { id: string }).id;
		const o1 = await moi("a");
		const so1 = (await db.tinHieu.findUniqueOrThrow({ where: { id: o1 } })).so;
		expect(
			(await trpc("a", "tinHieu.xoa", "mutation", { id: o1 })).status,
		).toBe(200);
		expect(await db.tinHieu.count({ where: { id: o1 } })).toBe(0);
		const o2 = await moi("a");
		await db.tinHieu.update({
			where: { id: o2 },
			data: { keoVeLuc: new Date() },
		});
		const tra2 = await trpc("a", "tinHieu.xoa", "mutation", { id: o2 });
		expect(tra2.status).toBe(409);
		expect(tra2.loi).toBe(TIN_HIEU.loi.daLayVe);
		expect(await db.tinHieu.count({ where: { id: o2 } })).toBe(1);
		const o3 = await moi("b");
		expect(
			(await trpc("a", "tinHieu.xoa", "mutation", { id: o3 })).status,
		).toBe(404);
		expect(await db.tinHieu.count({ where: { id: o3 } })).toBe(1);
		const khoa = await khoaCua("owner");
		const keo = await keoVeRest(khoa);
		const ma = docPhanHoiKeoVe(keo.body).map((t) => t.id);
		expect(ma, "tin hieu da xoa van duoc keo ve").not.toContain(idTep(so1));
		const xoaDaKeo = await trpc("b", "tinHieu.xoa", "mutation", { id: o3 });
		expect(xoaDaKeo.status).toBe(409);
	});

	test("gth-xoa: keo ve va xoa dua tren cung tin hieu khong bao gio vua xoa vua tra ve", async () => {
		const khoa = await khoaCua("admin");
		for (let i = 0; i < 5; i++) {
			await don();
			const id = ((await gui("c", "m", `dua ${i}`)).data as { id: string }).id;
			const so = (await db.tinHieu.findUniqueOrThrow({ where: { id } })).so;
			const [keo, xoa] = await Promise.all([
				keoVeRest(khoa),
				trpc("c", "tinHieu.xoa", "mutation", { id }),
			]);
			const coTrongKeo = docPhanHoiKeoVe(keo.body).some(
				(t) => t.id === idTep(so),
			);
			const daXoa = xoa.status === 200;
			expect(coTrongKeo && daXoa, "tin hieu vua keo ve van bi xoa").toBe(false);
			expect(coTrongKeo || daXoa).toBe(true);
		}
	});
});

describe("gth-keo-ve", () => {
	test("gth-keo-ve: chi owner va admin keo ve, member va okr bi tu choi khong dong dau", async () => {
		await don();
		await gui("a", "m", "x");
		await gui("c", "m", "y");
		for (const n of ["member", "okr"] as const) {
			const r = await keoVeRest(await khoaCua(n));
			expect(r.status, "khoa thanh vien thuong keo ve duoc").toBe(403);
			expect(
				await db.tinHieu.count({ where: { keoVeLuc: { not: null } } }),
			).toBe(0);
		}
		for (const n of ["owner", "admin"] as const)
			expect((await keoVeRest(await khoaCua(n))).status).toBe(200);
	});

	test("gth-keo-ve: tra moi tin hieu theo so, dong dau, lan hai cung byte, khong mang danh tinh", async () => {
		await don();
		for (const n of ["a", "b", "c"] as const)
			await gui(n, `muon ${n}`, `xay ra ${n}`);
		const khoa = await khoaCua("owner");
		const lan1 = await keoVeRest(khoa);
		expect(lan1.status).toBe(200);
		const ds = docPhanHoiKeoVe(lan1.body);
		const hang = await db.tinHieu.findMany({ orderBy: { so: "asc" } });
		expect(ds.map((t) => t.id)).toEqual(hang.map((h) => idTep(h.so)));
		for (const t of ds) expect(tepTinHieu.parse(t.tep)).toEqual(t.tep);
		expect(ds.map((t) => t.phongBan)).toEqual([
			`${TIEN_TO} Kinh doanh`,
			null,
			null,
		]);
		expect(hang.every((h) => h.keoVeLuc !== null)).toBe(true);
		const dau = hang.map((h) => h.keoVeLuc?.toISOString());
		const lan2 = await keoVeRest(khoa);
		expect(JSON.stringify(docPhanHoiKeoVe(lan2.body).map((t) => t.tep))).toBe(
			JSON.stringify(ds.map((t) => t.tep)),
		);
		const sau = await db.tinHieu.findMany({ orderBy: { so: "asc" } });
		expect(sau.map((h) => h.keoVeLuc?.toISOString())).toEqual(dau);
		const danhTinh = (["a", "b", "c"] as const).flatMap((n) => [
			uid(n),
			`${uid(n)}@thu.test`,
		]);
		danhTinh.push(`${TIEN_TO} Kinh doanh`, pbDung);
		const chu = JSON.stringify(ds.map((t) => t.tep));
		for (const x of danhTinh)
			expect(chu.includes(x), "tep mang danh tinh nguoi gui").toBe(false);
	});
});
