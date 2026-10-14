import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db } from "@crm/db";
import {
	coChoSauGom,
	demNguongSong,
	docPhanHoiKeoVe,
	dongDemTuKeoVe,
	dongDemTuTatCa,
	idTep,
} from "@crm/validation/tin-hieu";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `mth${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"owner",
	"admin",
	"member",
	"okr",
] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	a: "member",
	b: "member",
	c: "member",
	d: "member",
	e: "member",
	owner: "owner",
	admin: "admin",
	member: "member",
	okr: "okr",
} satisfies Record<Nguoi, WorkspaceRole>;
const GUI = ["a", "b", "c", "d", "e"] as const;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;
const thu = (n: Nguoi) => `${uid(n)}@thu.test`;
const tieuDe = (n: Nguoi) => `${TIEN_TO} tieu de ${n}`;
const pb = { kd: "", ns: "", kd2: "" };

type DongTatCa = {
	id: string;
	so: number;
	ma: string;
	tieuDe: string;
	guiLuc: string;
	daKeoVe: boolean;
	nguoiGui: { id: string; ten: string } | null;
	phongBan: { id: string; ten: string } | null;
};

async function trpc(n: Nguoi, thuTuc: string, vao?: Record<string, string>) {
	const r = vao
		? await request(app.getHttpServer())
				.post(`/api/trpc/${thuTuc}`)
				.set("cookie", cookie[n])
				.set("content-type", "application/json")
				.send(JSON.stringify(vao))
		: await request(app.getHttpServer())
				.get(`/api/trpc/${thuTuc}`)
				.set("cookie", cookie[n]);
	return { status: r.status, data: r.body?.result?.data, text: r.text };
}

async function khoaCua(n: Nguoi): Promise<string> {
	return (
		await auth.api.createApiKey({ body: { name: `mth-${n}`, userId: uid(n) } })
	).key;
}

const tatCaRest = (key: string) =>
	request(app.getHttpServer())
		.get(`${REST_BRIDGE_PATH}/tin-hieu/tat-ca`)
		.set(API_KEY_HEADER, key);

const keoVeRest = (key: string) =>
	request(app.getHttpServer())
		.post(`${REST_BRIDGE_PATH}/tin-hieu/keo-ve`)
		.set(API_KEY_HEADER, key)
		.set("content-type", "application/json")
		.send("{}");

async function datPhong(n: Nguoi, phong: string) {
	await db.orgPlacement.upsert({
		where: { userId: uid(n) },
		create: { userId: uid(n), primaryDepartmentId: phong },
		update: { primaryDepartmentId: phong },
	});
}

async function gieo(): Promise<void> {
	await db.tinHieu.deleteMany({});
	for (const n of GUI) {
		const r = await trpc(n, "tinHieu.gui", {
			muonLam: `muon ${n}`,
			daXayRa: tieuDe(n),
			man: "/okr",
		});
		expect(`${n}: ${r.status}`).toBe(`${n}: 200`);
		if (n === "b") await keoVeRest(await khoaCua("owner"));
	}
	await db.session.deleteMany({ where: { userId: uid("d") } });
	await db.member.deleteMany({ where: { userId: uid("d") } });
	await db.apikey.deleteMany({ where: { referenceId: uid("d") } });
	await db.orgPlacement.deleteMany({ where: { userId: uid("d") } });
	await db.user.delete({ where: { id: uid("d") } });
}

async function tatCa(n: Nguoi): Promise<DongTatCa[]> {
	const r = await trpc(n, "tinHieu.tatCa");
	expect(`${n}: ${r.status}`).toBe(`${n}: 200`);
	return (r.data as { rows: DongTatCa[] }).rows;
}

beforeAll(async () => {
	app = await createApp();
	pb.kd = (
		await db.department.create({
			data: { name: `${TIEN_TO} Kinh doanh`, position: 9101 },
		})
	).id;
	pb.ns = (
		await db.department.create({
			data: { name: `${TIEN_TO} Nhân sự`, position: 9102 },
		})
	).id;
	pb.kd2 = (
		await db.department.create({
			data: { name: `${TIEN_TO} Kinh doanh`, position: 9103 },
		})
	).id;
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
	}
	await datPhong("a", pb.kd);
	await datPhong("b", pb.ns);
	await datPhong("d", pb.kd);
	await datPhong("e", pb.kd2);
	await gieo();
}, 120_000);

afterAll(async () => {
	await db.tinHieu.deleteMany({});
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.apikey.deleteMany({
		where: { referenceId: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.department.deleteMany({
		where: { id: { in: [pb.kd, pb.ns, pb.kd2] } },
	});
	await app.close();
});

describe("mth-tat-ca", () => {
	test("mth-tat-ca: owner va admin thay moi tin hieu, du truong, khong thu dien tu, khong dong dau", async () => {
		const hang = await db.tinHieu.findMany({ orderBy: { guiLuc: "desc" } });
		const dauTruoc = hang.map((h) => h.keoVeLuc?.toISOString() ?? null);
		const kyVongPhong = {
			a: { id: pb.kd, ten: `${TIEN_TO} Kinh doanh` },
			b: { id: pb.ns, ten: `${TIEN_TO} Nhân sự` },
			c: null,
			d: { id: pb.kd, ten: `${TIEN_TO} Kinh doanh` },
			e: { id: pb.kd2, ten: `${TIEN_TO} Kinh doanh` },
		};
		for (const vien of ["owner", "admin"] as const) {
			const rows = await tatCa(vien);
			expect(rows.length).toBe(GUI.length);
			expect(rows.map((r) => r.id)).toEqual(hang.map((h) => h.id));
			for (const n of GUI) {
				const r = rows.find((x) => x.tieuDe === tieuDe(n));
				const h = hang.find((x) => x.tieuDe === tieuDe(n));
				expect(r?.ma).toBe(idTep(h?.so ?? -1));
				expect(r?.nguoiGui, `nguoi gui cua ${n}`).toEqual(
					n === "d" ? null : { id: uid(n), ten: uid(n) },
				);
				expect(r?.phongBan, `phong ban cua ${n}`).toEqual(kyVongPhong[n]);
				expect(r?.daKeoVe).toBe(h?.keoVeLuc !== null);
			}
			const chu = JSON.stringify(rows);
			for (const n of GUI)
				expect(
					chu.includes(thu(n)),
					"phan hoi mang thu dien tu nguoi gui",
				).toBe(false);
		}
		const sau = await db.tinHieu.findMany({ orderBy: { guiLuc: "desc" } });
		expect(
			sau.map((h) => h.keoVeLuc?.toISOString() ?? null),
			"danh sach moi tin hieu dong dau keo ve",
		).toEqual(dauTruoc);
		expect(dauTruoc.filter((x) => x !== null).length).toBeGreaterThan(0);
		expect(dauTruoc.filter((x) => x === null).length).toBeGreaterThan(0);
	});

	test("mth-tat-ca: member va okr bi tu choi, REST owner cung tap ma", async () => {
		for (const vien of ["member", "okr"] as const) {
			const r = await trpc(vien, "tinHieu.tatCa");
			expect(r.status, "thanh vien doc duoc moi tin hieu").toBe(403);
			expect(r.data).toBeUndefined();
		}
		const rest = await tatCaRest(await khoaCua("owner"));
		expect(rest.status).toBe(200);
		const restRows = (rest.body.rows ?? rest.body.result?.data?.rows) as {
			ma: string;
		}[];
		expect(restRows.map((r) => r.ma).sort()).toEqual(
			(await tatCa("owner")).map((r) => r.ma).sort(),
		);
		expect((await tatCaRest(await khoaCua("member"))).status).toBe(403);
	});
});

describe("mth-khop-that", () => {
	test("mth-khop-that: keo ve va danh sach cung tap ma, cung ma phong ban, cung ba so, keo ve khong mang danh tinh", async () => {
		const ds = await tatCa("owner");
		const keo = await keoVeRest(await khoaCua("owner"));
		expect(keo.status).toBe(200);
		const tep = docPhanHoiKeoVe(keo.body);
		expect(tep.map((t) => t.id).sort()).toEqual(ds.map((r) => r.ma).sort());
		for (const r of ds) {
			const t = tep.find((x) => x.id === r.ma);
			expect(
				t?.phongBanId ?? null,
				"keo ve va danh sach dem phong ban khac nhau",
			).toBe(r.phongBan?.id ?? null);
		}
		const now = new Date();
		const tuKeo = demNguongSong(
			dongDemTuKeoVe(tep),
			now,
			coChoSauGom({ kieu: "khong-co" }),
		);
		const tuDs = demNguongSong(
			dongDemTuTatCa(ds),
			now,
			coChoSauGom({ kieu: "khong-co" }),
		);
		expect(
			[tuKeo.trongKy, tuKeo.soPhong, tuKeo.chuaCoCho],
			"keo ve va danh sach dem phong ban khac nhau",
		).toEqual([tuDs.trongKy, tuDs.soPhong, tuDs.chuaCoCho]);
		expect(tuDs.soPhong, "hai phong ban trung ten bi gop").toBe(3);
		const chuKeo = JSON.stringify(keo.body);
		const danhTinh = GUI.filter((n) => n !== "d").flatMap((n) => [
			uid(n),
			thu(n),
		]);
		expect(danhTinh.length).toBeGreaterThan(0);
		for (const x of danhTinh)
			expect(chuKeo.includes(x), "tep keo ve mang danh tinh nguoi gui").toBe(
				false,
			);
		const chuDs = JSON.stringify(ds);
		expect(
			danhTinh.filter((x) => !x.includes("@")).every((x) => chuDs.includes(x)),
		).toBe(true);
	});
});

describe("mth-khong-quyen", () => {
	test("mth-khong-quyen: member va okr goi tRPC va REST bang khoa cua minh deu 403, than khong mang du lieu; owner co", async () => {
		const chuoi = GUI.flatMap((n) => [
			tieuDe(n),
			...(n === "d" ? [] : [uid(n)]),
		]);
		expect(chuoi.length).toBeGreaterThan(0);
		for (const vien of ["member", "okr"] as const) {
			const t = await trpc(vien, "tinHieu.tatCa");
			const r = await tatCaRest(await khoaCua(vien));
			expect([t.status, r.status], "thanh vien doc duoc moi tin hieu").toEqual([
				403, 403,
			]);
			for (const x of chuoi) {
				expect(t.text.includes(x)).toBe(false);
				expect(r.text.includes(x)).toBe(false);
			}
		}
		const o = await tatCaRest(await khoaCua("owner"));
		expect(o.status).toBe(200);
		for (const x of chuoi) expect(o.text.includes(x)).toBe(true);
	});
});
