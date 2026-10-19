import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { type WorkspaceRole, workspaceRoleOf } from "@crm/auth";
import { db } from "@crm/db";
import { ghiBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import { ghiKetQuaLay, sanPhamXemDuoc } from "@crm/db/san-pham-lo-trinh";
import { maTuTen } from "@crm/validation/san-pham-lo-trinh";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "san-pham-lo-trinh";
const TIEN_TO = `ltsp ${suffix}`;
const MA_GOC = maTuTen(TIEN_TO);

const AI = ["owner", "admin", "a", "b", "okr"] as const;
type Ai = (typeof AI)[number];
const VAI = {
	owner: "owner",
	admin: "admin",
	a: "member",
	b: "member",
	okr: "okr",
} as const satisfies Record<Ai, WorkspaceRole>;

const id = (ai: Ai) => `${MA_GOC}-${ai}`;
const cookie = {} as Record<Ai, string>;
const phien: string[] = [];
let app: INestApplication;

type DauVao = { readonly [khoa: string]: string | readonly string[] };

type TraLoi = { status: number; data: unknown; ma: string; loi: string };

function traLoi(res: request.Response): TraLoi {
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function ghi(ai: Ai, thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/sanPhamLoTrinh.${thuTuc}`)
		.set("cookie", cookie[ai])
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return traLoi(res);
}

async function doc(ai: Ai, thuTuc: string, dauVao?: DauVao): Promise<TraLoi> {
	const q = dauVao
		? `?input=${encodeURIComponent(JSON.stringify(dauVao))}`
		: "";
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/sanPhamLoTrinh.${thuTuc}${q}`)
		.set("cookie", cookie[ai]);
	return traLoi(res);
}

type Hang = { ma: string; ten: string; kho: string; trangThaiLay: string };

async function maThay(ai: Ai): Promise<string[]> {
	const r = await doc(ai, "danhSach");
	const ds = (r.data as { sanPham: Hang[] } | undefined)?.sanPham ?? [];
	return ds
		.map((h) => h.ma)
		.filter((m) => m.startsWith(MA_GOC))
		.sort();
}

let dem = 0;
async function taoSp(ai: Ai = "owner") {
	dem += 1;
	const ten = `${TIEN_TO} sp ${dem}`;
	const r = await ghi(ai, "tao", {
		ten,
		kho: "phanlemanh/acceptance-gate-kit",
		nhanh: "main",
		duongTep: "LO-TRINH.html",
	});
	expect(r.status).toBe(200);
	return (r.data as { ma: string }).ma;
}

async function coLichSu(ma: string, sha = "a".repeat(40)) {
	await ghiBanChupLoTrinh(
		db,
		{
			nguon: ma,
			sha,
			commitLuc: "2026-10-19T10:00:00Z",
			duLieu: { khuon: "lo-trinh-du-lieu" },
			canhBao: [],
		},
		new Date(),
	);
	await ghiKetQuaLay(db, ma, { trangThai: "da-lay", kiemLuc: new Date() });
}

async function donSp() {
	const ds = await db.sanPhamLoTrinh.findMany({
		where: { ma: { startsWith: MA_GOC } },
		select: { ma: true },
	});
	const ma = ds.map((d) => d.ma);
	await db.banChupLoTrinh.deleteMany({ where: { nguon: { in: ma } } });
	await db.sanPhamLoTrinh.deleteMany({ where: { ma: { in: ma } } });
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
	for (const ai of AI) {
		await gieoThanhVien(id(ai), VAI[ai]);
		const p = await mintPhien(id(ai));
		cookie[ai] = p.cookie;
		phien.push(p.token);
	}
});

afterAll(async () => {
	await donSp();
	await app.close();
	await db.session.deleteMany({ where: { token: { in: phien } } });
	await db.member.deleteMany({ where: { userId: { in: AI.map(id) } } });
	await db.user.deleteMany({ where: { id: { in: AI.map(id) } } });
});

describe("ltsp-quyen", () => {
	test("chỉ chủ, quản trị và người được cấp thấy sản phẩm", async () => {
		await donSp();
		const p = await taoSp();
		expect(
			(await ghi("owner", "datNguoiXem", { ma: p, userIds: [id("a")] })).status,
		).toBe(200);

		const ky = {
			owner: [p],
			admin: [p],
			a: [p],
			b: [],
			okr: [],
		} satisfies Record<Ai, string[]>;
		for (const ai of AI) {
			const thay = await maThay(ai);
			if (JSON.stringify(thay) !== JSON.stringify(ky[ai]))
				throw new Error(`nguoi khong duoc cap thay san pham: ${ai}`);
			const motHam = (
				await sanPhamXemDuoc(db, { userId: id(ai), vai: VAI[ai] })
			)
				.map((s) => s.ma)
				.filter((m) => m.startsWith(MA_GOC));
			expect(motHam).toEqual(ky[ai]);
		}

		const b = await doc("b", "nguoiXem", { ma: p });
		expect(b.ma).toBe("FORBIDDEN");
		expect(b.data).toBeUndefined();

		await ghi("owner", "datNguoiXem", { ma: p, userIds: [] });
		expect(await maThay("a")).toEqual([]);
	});

	test("người rời không gian làm việc không còn thấy sản phẩm đã cấp", async () => {
		await donSp();
		const p = await taoSp();
		await ghi("owner", "datNguoiXem", { ma: p, userIds: [id("a")] });
		await db.member.deleteMany({ where: { userId: id("a") } });
		const vai = await workspaceRoleOf(id("a"));
		expect(vai).toBeNull();
		expect(await sanPhamXemDuoc(db, { userId: id("a"), vai })).toEqual([]);
		await gieoThanhVien(id("a"), "member");
	});
});

const HOP_LE = {
	kho: "phanlemanh/acceptance-gate-kit",
	nhanh: "main",
	duongTep: "LO-TRINH.html",
};

describe("ltsp-danh-ba", () => {
	test("thành viên bị chặn mọi thủ tục ghi; chủ và quản trị ghi được", async () => {
		await donSp();
		const p = await taoSp();
		const truoc = await db.sanPhamLoTrinh.count({
			where: { ma: { startsWith: MA_GOC } },
		});
		for (const [thuTuc, dauVao] of [
			["tao", { ...HOP_LE, ten: `${TIEN_TO} member` }],
			["sua", { ma: p, ten: `${TIEN_TO} doi` }],
			["datNguoiXem", { ma: p, userIds: [id("b")] }],
		] as const) {
			const r = await ghi("a", thuTuc, dauVao);
			expect(`${thuTuc}:${r.ma}`).toBe(`${thuTuc}:FORBIDDEN`);
		}
		expect(
			await db.sanPhamLoTrinh.count({ where: { ma: { startsWith: MA_GOC } } }),
		).toBe(truoc);

		const q = await taoSp("admin");
		await ghi("admin", "sua", { ma: q, ten: `${TIEN_TO} doi ten` });
		const r = await doc("owner", "danhSach");
		const hang = (r.data as { sanPham: Hang[] }).sanPham.find(
			(h) => h.ma === q,
		);
		expect(hang?.ten).toBe(`${TIEN_TO} doi ten`);
	});

	test("khai sai bị từ chối đúng ô, không thêm hàng nào", async () => {
		await donSp();
		await taoSp();
		const truoc = await db.sanPhamLoTrinh.count({
			where: { ma: { startsWith: MA_GOC } },
		});
		const SAI: [string, object][] = [
			["kho", { kho: "khong-co-gach" }],
			["kho", { kho: "a/b/c" }],
			["nhanh", { nhanh: "" }],
			["nhanh", { nhanh: "co khoang" }],
			["duongTep", { duongTep: "../x.html" }],
			["duongTep", { duongTep: "/x.html" }],
			["ten", { ten: "" }],
			["ten", { ten: "x".repeat(61) }],
		];
		for (const [o, sai] of SAI) {
			const r = await ghi("owner", "tao", {
				...HOP_LE,
				ten: `${TIEN_TO} sai`,
				...sai,
			});
			expect(`${o}:${r.ma}`).toBe(`${o}:BAD_REQUEST`);
		}
		for (const ten of ["!!!", "CRM", `${TIEN_TO} sp ${dem}`]) {
			const r = await ghi("owner", "tao", { ...HOP_LE, ten });
			expect(`${ten}:${r.ma}`).toBe(`${ten}:BAD_REQUEST`);
			expect(r.loi.startsWith("Name:")).toBe(true);
		}
		expect(
			await db.sanPhamLoTrinh.count({ where: { ma: { startsWith: MA_GOC } } }),
		).toBe(truoc);
	});

	test("sửa nguồn giữ bản chụp cũ và đánh dấu nguồn vừa đổi; sửa tên thì không", async () => {
		await donSp();
		const p = await taoSp();
		await coLichSu(p, "b".repeat(40));
		await ghi("owner", "sua", { ma: p, ten: `${TIEN_TO} chi ten` });
		let sp = await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: p } });
		expect(sp.nguonDoiLuc).toBeNull();
		await ghi("owner", "sua", { ma: p, kho: "phanlemanh/onehub-platform" });
		sp = await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: p } });
		const bc = await db.banChupLoTrinh.findUnique({ where: { nguon: p } });
		if (bc?.sha !== "b".repeat(40))
			throw new Error(`sua nguon mat ban chup cu: ${p}`);
		expect(sp.nguonDoiLuc).not.toBeNull();
		expect(sp.trangThaiLay).toBe("chua-lay");
		expect(sp.layDauLuc).not.toBeNull();
	});

	test("không thủ tục nào nhận mã crm", async () => {
		for (const [thuTuc, dauVao] of [
			["sua", { ma: "crm", ten: "x" }],
			["luuTru", { ma: "crm" }],
			["xoa", { ma: "crm" }],
			["xoaVinhVien", { ma: "crm" }],
			["datNguoiXem", { ma: "crm", userIds: [] }],
		] as const) {
			const r = await ghi("owner", thuTuc, dauVao);
			expect(`${thuTuc}:${r.ma}`).toBe(`${thuTuc}:BAD_REQUEST`);
		}
	});
});

describe("ltsp-vong-doi", () => {
	test("chưa có lịch sử thì Xoá được", async () => {
		await donSp();
		const p = await taoSp();
		expect((await ghi("owner", "xoa", { ma: p })).status).toBe(200);
		expect(await db.sanPhamLoTrinh.findUnique({ where: { ma: p } })).toBeNull();
	});

	test("có lịch sử thì Lưu trữ, giữ ngày đầu, Khôi phục; không Xoá được", async () => {
		await donSp();
		const p = await taoSp();
		await coLichSu(p);
		expect((await ghi("owner", "xoa", { ma: p })).ma).toBe("BAD_REQUEST");
		await ghi("owner", "luuTru", { ma: p });
		const lan1 = (
			await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: p } })
		).luuTruLuc;
		expect(lan1).not.toBeNull();
		await ghi("owner", "luuTru", { ma: p });
		const lan2 = (
			await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: p } })
		).luuTruLuc;
		expect(lan2?.toISOString()).toBe(lan1?.toISOString());
		expect(await maThay("owner")).toEqual([]);
		expect(
			(await sanPhamXemDuoc(db, { userId: id("owner"), vai: "owner" })).some(
				(s) => s.ma === p,
			),
		).toBe(false);
		await ghi("owner", "khoiPhuc", { ma: p });
		expect(
			(await db.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma: p } }))
				.luuTruLuc,
		).toBeNull();
	});

	test("Xoá vĩnh viễn chỉ sau Lưu trữ, mất cả bản chụp và người xem", async () => {
		await donSp();
		const p = await taoSp();
		await coLichSu(p);
		await ghi("owner", "datNguoiXem", { ma: p, userIds: [id("a")] });
		const r = await ghi("owner", "xoaVinhVien", { ma: p });
		if (r.ma !== "BAD_REQUEST")
			throw new Error("xoa vinh vien san pham chua luu tru");
		await ghi("owner", "luuTru", { ma: p });
		expect((await ghi("owner", "xoaVinhVien", { ma: p })).status).toBe(200);
		expect(await db.sanPhamLoTrinh.count({ where: { ma: p } })).toBe(0);
		expect(await db.banChupLoTrinh.count({ where: { nguon: p } })).toBe(0);
		expect(await db.sanPhamNguoiXem.count({ where: { sanPhamMa: p } })).toBe(0);
	});
});
