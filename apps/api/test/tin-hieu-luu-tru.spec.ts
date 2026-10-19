import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db } from "@crm/db";
import {
	demNguongSong,
	docPhanHoiKeoVe,
	dongDemTuKeoVe,
	dongDemTuTatCa,
	idTep,
	TIN_HIEU,
} from "@crm/validation/tin-hieu";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `gtr${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = ["owner", "admin", "member", "okr", "a", "b"] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	owner: "owner",
	admin: "admin",
	member: "member",
	okr: "okr",
	a: "member",
	b: "member",
} satisfies Record<Nguoi, WorkspaceRole>;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const khoa = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;
const pb = { kd: "", ns: "" };

type Tra = { status: number; data: unknown; loi: string; text: string };
type DauVao =
	| { id: string }
	| { muonLam: string; daXayRa: string; man: string }
	| { name: string; expiresInDays: null; loai: string };

async function trpc(
	n: Nguoi,
	thuTuc: string,
	kieu: "query" | "mutation",
	vao?: DauVao,
): Promise<Tra> {
	const r =
		kieu === "query"
			? await request(app.getHttpServer())
					.get(`/api/trpc/${thuTuc}`)
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
		text: r.text,
	};
}

const rest = (
	kieu: "get" | "post",
	duong: string,
	key: string,
): Promise<request.Response> => {
	const r = request(app.getHttpServer())
		[kieu](`${REST_BRIDGE_PATH}${duong}`)
		.set(API_KEY_HEADER, key);
	return kieu === "post"
		? r.set("content-type", "application/json").send("{}")
		: r.send();
};

type Gieo = { id: string; so: number; ma: string };

async function gui(n: Nguoi, chu: string): Promise<Gieo> {
	const r = await trpc(n, "tinHieu.gui", "mutation", {
		muonLam: `muon ${chu}`,
		daXayRa: `${TIEN_TO} ${chu}`,
		man: "/okr",
	});
	expect(`${chu}: ${r.status}`).toBe(`${chu}: 200`);
	const id = (r.data as { id: string }).id;
	const so = (await db.tinHieu.findUniqueOrThrow({ where: { id } })).so;
	return { id, so, ma: idTep(so) };
}

const luuTru = (n: Nguoi, id: string) =>
	trpc(n, "tinHieu.luuTru", "mutation", { id });
const khoiPhuc = (n: Nguoi, id: string) =>
	trpc(n, "tinHieu.khoiPhuc", "mutation", { id });

type DongTatCa = {
	id: string;
	ma: string;
	guiLuc: string;
	phongBan: { id: string; ten: string } | null;
	archivedAt: string | null;
	nguoiLuuTru: { id: string; ten: string } | null;
};

async function danhSach(
	n: Nguoi,
	thuTuc: "tinHieu.tatCa" | "tinHieu.daLuuTru",
): Promise<DongTatCa[]> {
	const r = await trpc(n, thuTuc, "query");
	expect(`${n} ${thuTuc}: ${r.status}`).toBe(`${n} ${thuTuc}: 200`);
	return (r.data as { rows: DongTatCa[] }).rows;
}

const vet = (tinHieuId: string) =>
	db.tinHieuVet.findMany({ where: { tinHieuId }, orderBy: { luc: "asc" } });

async function keoVe(): Promise<string[]> {
	const r = await rest("post", "/tin-hieu/keo-ve", khoa.owner);
	expect(r.status).toBe(200);
	return docPhanHoiKeoVe(r.body).map((t) => t.id);
}

async function khoaLich(): Promise<string> {
	const r = await trpc("owner", "apiKeys.create", "mutation", {
		name: `${TIEN_TO}-lich`,
		expiresInDays: null,
		loai: "keo-tin-hieu",
	});
	expect(r.status).toBe(200);
	return (r.data as { key: string }).key;
}

const don = () => db.tinHieu.deleteMany({});

beforeAll(async () => {
	app = await createApp();
	pb.kd = (
		await db.department.create({
			data: { name: `${TIEN_TO} Kinh doanh`, position: 9301 },
		})
	).id;
	pb.ns = (
		await db.department.create({
			data: { name: `${TIEN_TO} Nhân sự`, position: 9302 },
		})
	).id;
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
		khoa[n] = (
			await auth.api.createApiKey({
				body: { name: `gtr-${n}`, userId: uid(n) },
			})
		).key;
	}
	await db.orgPlacement.create({
		data: { userId: uid("a"), primaryDepartmentId: pb.kd },
	});
	await db.orgPlacement.create({
		data: { userId: uid("b"), primaryDepartmentId: pb.ns },
	});
}, 120_000);

afterAll(async () => {
	await db.tinHieuVet.deleteMany({});
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
	await db.department.deleteMany({ where: { id: { in: [pb.kd, pb.ns] } } });
	await app.close();
});

describe("gtr-luu-tru", () => {
	test("gtr-luu-tru: owner va admin, tRPC va REST — ghi cot, mot dong vet, roi danh sach dang dung", async () => {
		await don();
		const O = [
			["owner", "trpc"],
			["owner", "rest"],
			["admin", "trpc"],
			["admin", "rest"],
		] as const;
		for (const [n, duong] of O) {
			const o = `${n}/${duong}`;
			const t = await gui("a", `luu ${o}`);
			const r =
				duong === "trpc"
					? (await luuTru(n, t.id)).status
					: (await rest("post", `/tin-hieu/${t.id}/luu-tru`, khoa[n])).status;
			expect(`${o}: ${r}`).toBe(`${o}: 200`);
			const h = await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } });
			expect(h.archivedAt, o).not.toBeNull();
			expect(h.archivedById, o).toBe(uid(n));
			const v = await vet(t.id);
			expect(v.length, `${o}: luu tru khong de vet nguoi go`).toBe(1);
			expect(v[0]?.loai).toBe("luu-tru");
			expect(v[0]?.nguoiId).toBe(uid(n));
			expect(v[0]?.so).toBe(t.so);
			expect(
				(await danhSach("owner", "tinHieu.tatCa")).map((d) => d.id),
				`${o}: danh sach dang dung con tin hieu da luu tru`,
			).not.toContain(t.id);
			const da = (await danhSach("owner", "tinHieu.daLuuTru")).find(
				(d) => d.id === t.id,
			);
			expect(da?.archivedAt, o).toBe(h.archivedAt?.toISOString() ?? "");
			expect(da?.nguoiLuuTru, o).toEqual({ id: uid(n), ten: uid(n) });
		}
	});

	test("gtr-luu-tru: luu tru lai giu ngay dau, khong them vet", async () => {
		await don();
		const t = await gui("a", "luu lai");
		await luuTru("owner", t.id);
		const dau = (await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } }))
			.archivedAt;
		await Bun.sleep(20);
		expect((await luuTru("admin", t.id)).status).toBe(200);
		const sau = await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } });
		expect(sau.archivedAt?.getTime(), "luu tru lai doi ngay luu tru dau").toBe(
			dau?.getTime(),
		);
		expect(sau.archivedById).toBe(uid("owner"));
		expect((await vet(t.id)).length).toBe(1);
	});
});

describe("gtr-keo-ve", () => {
	for (const duong of ["tay", "lich"] as const)
		test(`gtr-keo-ve: duong ${duong} — bo qua ban luu tru, lay ban dang dung va ban da khoi phuc`, async () => {
			await don();
			const L = await gui("a", `L ${duong}`);
			const D = await gui("a", `D ${duong}`);
			const K = await gui("b", `K ${duong}`);
			await luuTru("owner", L.id);
			await luuTru("owner", K.id);
			await khoiPhuc("owner", K.id);
			const key = duong === "tay" ? khoa.owner : await khoaLich();
			const r = await rest(
				"post",
				duong === "tay" ? "/tin-hieu/keo-ve" : "/tin-hieu/lich/keo-ve",
				key,
			);
			expect(r.status).toBe(200);
			const ma = docPhanHoiKeoVe(r.body).map((t) => t.id);
			expect(ma, "keo ve mang tin hieu da luu tru").not.toContain(L.ma);
			expect(
				(await db.tinHieu.findUniqueOrThrow({ where: { id: L.id } })).keoVeLuc,
				"keo ve dong dau tin hieu da luu tru",
			).toBeNull();
			for (const t of [D, K]) {
				expect(ma).toContain(t.ma);
				expect(
					(await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } }))
						.keoVeLuc,
				).not.toBeNull();
			}
		});

	test("gtr-keo-ve: doi chung duong — chua luu tru thi ma L co trong luot keo ve", async () => {
		await don();
		const L = await gui("a", "L doi chung");
		expect(await keoVe()).toContain(L.ma);
	});

	test("gtr-lenh: lenh keo ve khong ghi tep cho ban luu tru, tong ket khong dem no", async () => {
		await don();
		const L = await gui("a", "lenh L");
		const D = await gui("a", "lenh D");
		const K = await gui("b", "lenh K");
		await luuTru("owner", L.id);
		await luuTru("owner", K.id);
		await khoiPhuc("admin", K.id);
		await app.listen(0);
		const url = await app.getUrl();
		const goc = mkdtempSync(join(tmpdir(), "gtr-lenh-"));
		try {
			const lenh: {
				chayKeoVe: (o: {
					root: string;
					url: string;
					key: string;
					now: Date;
				}) => Promise<{ loi?: string; tongKet: string[] }>;
			} = await import(
				resolve(import.meta.dir, "..", "..", "..", "scripts/tin-hieu/keo-ve.ts")
			);
			const kq = await lenh.chayKeoVe({
				root: goc,
				url,
				key: khoa.owner,
				now: new Date(),
			});
			expect(kq.loi).toBeUndefined();
			const tep = readdirSync(join(goc, TIN_HIEU.thuMucNguon));
			expect(tep).not.toContain(`${L.ma}.json`);
			expect(tep).toContain(`${D.ma}.json`);
			expect(tep).toContain(`${K.ma}.json`);
			expect(kq.tongKet.join("\n")).toContain(
				`trong ${TIN_HIEU.ngayDem} ngày: 2 tín hiệu`,
			);
		} finally {
			rmSync(goc, { recursive: true, force: true });
		}
	});
});

async function giuKhoa(
	cheDo: "SHARE ROW EXCLUSIVE" | "ROW EXCLUSIVE",
	goi: () => Promise<Tra | string[]>,
	trongKhoa: (
		tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
	) => Promise<unknown>,
): Promise<{ daTraTruoc: boolean; kq: Tra | string[] }> {
	let daTra = false;
	let hua: Promise<Tra | string[]> | undefined;
	let daTraTruoc = false;
	await db.$transaction(
		async (tx) => {
			await tx.$executeRawUnsafe(`LOCK TABLE "tinHieu" IN ${cheDo} MODE`);
			hua = goi().then((x) => {
				daTra = true;
				return x;
			});
			await Bun.sleep(300);
			daTraTruoc = daTra;
			await trongKhoa(tx);
		},
		{ timeout: 10_000 },
	);
	if (!hua) throw new Error("khong goi duoc");
	return { daTraTruoc, kq: await hua };
}

describe("gtr-da-lay-ve", () => {
	test("gtr-da-lay-ve: tin hieu da keo ve bi tu choi 409, khong doi gi", async () => {
		await don();
		const t = await gui("a", "da lay");
		await keoVe();
		const r = await luuTru("owner", t.id);
		expect(r.status, "luu tru duoc tin hieu da lay ve").toBe(409);
		expect(r.loi).toBe(TIN_HIEU.loi.luuTruDaLayVe);
		expect(TIN_HIEU.loi.luuTruDaLayVe).toBe(
			"Đội sản phẩm đã lấy tín hiệu này về — không lưu trữ được nữa.",
		);
		expect(
			(await rest("post", `/tin-hieu/${t.id}/luu-tru`, khoa.owner)).status,
		).toBe(409);
		const h = await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } });
		expect(h.archivedAt).toBeNull();
		expect((await vet(t.id)).length).toBe(0);
	});

	test("gtr-da-lay-ve: (b) keo ve giu khoa truoc — luu tru cho roi bi tu choi", async () => {
		await don();
		const t = await gui("a", "dua b");
		const { daTraTruoc, kq } = await giuKhoa(
			"SHARE ROW EXCLUSIVE",
			() => luuTru("owner", t.id),
			(tx) =>
				tx.tinHieu.update({
					where: { id: t.id },
					data: { keoVeLuc: new Date() },
				}),
		);
		expect(daTraTruoc, "luu tru khong cho luot keo ve").toBe(false);
		expect((kq as Tra).status, "luu tru va keo ve cung thang").toBe(409);
		const h = await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } });
		expect(h.archivedAt, "luu tru va keo ve cung thang").toBeNull();
		expect(h.keoVeLuc).not.toBeNull();
	});

	test("gtr-da-lay-ve: (a) luu tru giu khoa truoc — keo ve cho roi bo qua", async () => {
		await don();
		const t = await gui("a", "dua a");
		const { daTraTruoc, kq } = await giuKhoa(
			"ROW EXCLUSIVE",
			() => keoVe(),
			(tx) =>
				tx.tinHieu.update({
					where: { id: t.id },
					data: { archivedAt: new Date(), archivedById: uid("owner") },
				}),
		);
		expect(daTraTruoc).toBe(false);
		expect(kq as string[], "keo ve mang tin hieu vua luu tru").not.toContain(
			t.ma,
		);
		expect(
			(await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } })).keoVeLuc,
		).toBeNull();
	});
});

describe("gtr-quyen", () => {
	test("gtr-quyen: member va okr bi tu choi o ca ba thu tuc, hai duong", async () => {
		await don();
		const cuaMember = await gui("member", "cua member");
		const cuaKhac = await gui("a", "cua khac");
		await luuTru("owner", cuaKhac.id);
		const tieuDe = [`${TIEN_TO} cua member`, `${TIEN_TO} cua khac`];
		for (const n of ["member", "okr"] as const) {
			const dich = n === "member" ? cuaMember : cuaKhac;
			const truoc = await db.tinHieu.findUniqueOrThrow({
				where: { id: dich.id },
			});
			const vetTruoc = (await vet(dich.id)).length;
			const o: [string, number, string][] = [
				[
					"luuTru/trpc",
					...(await luuTru(n, dich.id).then(
						(r) => [r.status, r.text] as const,
					)),
				],
				[
					"khoiPhuc/trpc",
					...(await khoiPhuc(n, dich.id).then(
						(r) => [r.status, r.text] as const,
					)),
				],
				[
					"daLuuTru/trpc",
					...(await trpc(n, "tinHieu.daLuuTru", "query").then(
						(r) => [r.status, r.text] as const,
					)),
				],
				[
					"luuTru/rest",
					...(await rest("post", `/tin-hieu/${dich.id}/luu-tru`, khoa[n]).then(
						(r) => [r.status, r.text] as const,
					)),
				],
				[
					"khoiPhuc/rest",
					...(await rest(
						"post",
						`/tin-hieu/${dich.id}/khoi-phuc`,
						khoa[n],
					).then((r) => [r.status, r.text] as const)),
				],
				[
					"daLuuTru/rest",
					...(await rest("get", "/tin-hieu/da-luu-tru", khoa[n]).then(
						(r) => [r.status, r.text] as const,
					)),
				],
			];
			expect(o.length).toBe(6);
			for (const [ten, status, than] of o) {
				expect(
					`${n} ${ten}: ${status}`,
					"nguoi khong phai quan tri luu tru duoc tin hieu",
				).toBe(`${n} ${ten}: 403`);
				for (const td of tieuDe) expect(than).not.toContain(td);
			}
			const sau = await db.tinHieu.findUniqueOrThrow({
				where: { id: dich.id },
			});
			expect(sau.archivedAt?.getTime() ?? null).toBe(
				truoc.archivedAt?.getTime() ?? null,
			);
			expect((await vet(dich.id)).length).toBe(vetTruoc);
		}
		const khac = await gui("b", "doi chung");
		expect((await luuTru("owner", khac.id)).status).toBe(200);
		expect((await khoiPhuc("owner", khac.id)).status).toBe(200);
		expect((await trpc("owner", "tinHieu.daLuuTru", "query")).status).toBe(200);
	});
});

describe("gtr-khoi-phuc", () => {
	for (const duong of ["trpc", "rest"] as const)
		test(`gtr-khoi-phuc: ${duong} — xoa hai cot, vet khoi phuc mang nguoi bam, keo ve lay lai`, async () => {
			await don();
			const t = await gui("a", `kp ${duong}`);
			await luuTru("owner", t.id);
			const r =
				duong === "trpc"
					? (await khoiPhuc("admin", t.id)).status
					: (await rest("post", `/tin-hieu/${t.id}/khoi-phuc`, khoa.admin))
							.status;
			expect(r).toBe(200);
			const h = await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } });
			expect(h.archivedAt).toBeNull();
			expect(h.archivedById).toBeNull();
			const v = await vet(t.id);
			expect(
				v.map((x) => [x.loai, x.nguoiId]),
				"khoi phuc khong de vet nguoi lam",
			).toEqual([
				["luu-tru", uid("owner")],
				["khoi-phuc", uid("admin")],
			]);
			expect(
				(await danhSach("owner", "tinHieu.tatCa")).map((d) => d.id),
			).toContain(t.id);
			expect(await keoVe()).toContain(t.ma);
		});

	test("gtr-khoi-phuc: khoi phuc ban dang dung khong them vet; vong luu tru lai bat dau ngay moi", async () => {
		await don();
		const t = await gui("a", "vong");
		await luuTru("owner", t.id);
		const dau = (await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } }))
			.archivedAt;
		await khoiPhuc("admin", t.id);
		expect((await khoiPhuc("admin", t.id)).status).toBe(200);
		expect((await vet(t.id)).length, "khoi phuc ban dang dung them vet").toBe(
			2,
		);
		await Bun.sleep(20);
		await luuTru("owner", t.id);
		const moi = (await db.tinHieu.findUniqueOrThrow({ where: { id: t.id } }))
			.archivedAt;
		expect((await vet(t.id)).length).toBe(3);
		expect((moi?.getTime() ?? 0) > (dau?.getTime() ?? 0)).toBe(true);
	});

	test("gtr-khoi-phuc: nguoi gui xoa tin hieu da luu tru — vet o lai voi ma; khoi phuc sau do bao khong co", async () => {
		await don();
		const t = await gui("a", "bi xoa");
		await luuTru("owner", t.id);
		expect(
			(await trpc("a", "tinHieu.xoa", "mutation", { id: t.id })).status,
		).toBe(200);
		const conLai = await db.tinHieuVet.findMany({ where: { so: t.so } });
		expect(conLai.length, "xoa tin hieu lam mat vet nguoi go").toBe(1);
		expect(conLai[0]?.tinHieuId).toBeNull();
		const r = await khoiPhuc("owner", t.id);
		expect(r.status).toBe(404);
		expect(r.loi).toBe(TIN_HIEU.loi.khongCo);
	});
});

describe("gtr-ba-so", () => {
	test("gtr-ba-so: ba so tren danh sach dang dung bang ba so cua keo ve, khong dem ban luu tru", async () => {
		await don();
		const ds = [
			await gui("a", "bs1"),
			await gui("a", "bs2"),
			await gui("a", "bs3"),
			await gui("b", "bs4"),
			await gui("b", "bs5"),
		];
		const now = new Date();
		const dem = async () => {
			const tatCa = await danhSach("owner", "tinHieu.tatCa");
			return demNguongSong(dongDemTuTatCa(tatCa), now, new Set());
		};
		expect((await dem()).trongKy).toBe(5);
		await luuTru("owner", ds[0]?.id ?? "");
		await luuTru("owner", ds[3]?.id ?? "");
		const trang = await dem();
		expect(trang.trongKy, "ba o so dem tin hieu da luu tru").toBe(3);
		const r = await rest("post", "/tin-hieu/keo-ve", khoa.owner);
		const lenh = demNguongSong(
			dongDemTuKeoVe(docPhanHoiKeoVe(r.body).map((t) => ({ ...t }))),
			now,
			new Set(),
		);
		expect([lenh.trongKy, lenh.soPhong, lenh.chuaCoCho]).toEqual([
			trang.trongKy,
			trang.soPhong,
			trang.chuaCoCho,
		]);
	});
});

describe("gtr-cua-toi", () => {
	test("gtr-cua-toi: nguoi gui thay ca hai dong, co dau da luu tru, khong lo nguoi luu tru, van xoa duoc", async () => {
		await don();
		const giu = await gui("a", "giu");
		const go = await gui("a", "go");
		await luuTru("owner", go.id);
		const r = await trpc("a", "tinHieu.cuaToi", "query");
		expect(r.status).toBe(200);
		const rows = (r.data as { rows: { id: string; daLuuTru: boolean }[] }).rows;
		expect(
			rows.find((x) => x.id === go.id)?.daLuuTru,
			"tin hieu bi luu tru bien mat khoi trang nguoi gui",
		).toBe(true);
		expect(rows.find((x) => x.id === giu.id)?.daLuuTru).toBe(false);
		const doiChung = await trpc("owner", "tinHieu.daLuuTru", "query");
		expect(
			doiChung.text,
			"doi chung duong: danh sach Da luu tru khong mang ten nguoi luu tru",
		).toContain(uid("owner"));
		expect(r.text, "phan hoi nguoi gui lo nguoi luu tru").not.toContain(
			uid("owner"),
		);
		expect(
			(await trpc("a", "tinHieu.xoa", "mutation", { id: go.id })).status,
		).toBe(200);
		expect(await db.tinHieu.findUnique({ where: { id: go.id } })).toBeNull();
	});
});
