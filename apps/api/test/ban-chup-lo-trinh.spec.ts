import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { API_KEY_HEADER, auth, KHOA_DAY_LO_TRINH } from "@crm/auth";
import { db } from "@crm/db";
import { docBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import {
	BAN_CHUP_LO_TRINH,
	phanTichBanChupLuu,
} from "@crm/validation/ban-chup-lo-trinh";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ldbc${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = ["owner", "admin", "member", "okr", "doi", "roi"] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	owner: "owner",
	admin: "admin",
	member: "member",
	okr: "okr",
	doi: "admin",
	roi: "admin",
} satisfies Record<Nguoi, WorkspaceRole>;
const DUONG = `${REST_BRIDGE_PATH}/lo-trinh/ban-chup`;
const NGUON = BAN_CHUP_LO_TRINH.nguonCrm;
const CHO_MS = 120_000;
const PHUT = 60_000;
const T1 = Date.parse("2026-10-14T08:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();
const sha = (c: string) => c.repeat(40);

const GOC = join(import.meta.dir, "..", "..", "..");
const khoiJson = z.record(z.string(), z.json());
const KHOI_HTML =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/.exec(
		readFileSync(join(GOC, "LO-TRINH.html"), "utf8"),
	)?.[1];
if (!KHOI_HTML) throw new Error("LO-TRINH.html khong mang khoi");
const KHOI = khoiJson.parse(JSON.parse(KHOI_HTML));

const khoaTao = z.object({ id: z.string(), key: z.string() });
const ketQuaRa = z.object({ ketQua: z.enum(BAN_CHUP_LO_TRINH.ketQua) });
const loiRa = z.object({
	issues: z.array(
		z.object({ path: z.array(z.union([z.string(), z.number()])) }),
	),
});

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;

type Than = {
	nguon: string;
	sha: string;
	commitLuc: string;
	duLieu: z.infer<typeof khoiJson>;
	canhBao: string[];
};

const than = (o: Partial<Than> = {}): Than => ({
	nguon: NGUON,
	sha: sha("a"),
	commitLuc: iso(T1),
	duLieu: structuredClone(KHOI),
	canhBao: [],
	...o,
});

async function trpc(
	n: Nguoi,
	thuTuc: string,
	vao: Readonly<Record<string, string | number | null | undefined>>,
) {
	const r = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie[n])
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return { status: r.status, data: r.body?.result?.data };
}

async function taoKhoa(n: Nguoi, loai?: string) {
	const r = await trpc(n, "apiKeys.create", {
		name: `ldbc-${n}-${loai ?? "thuong"}`,
		expiresInDays: null,
		loai,
	});
	return {
		status: r.status,
		khoa: r.status === 200 ? khoaTao.parse(r.data) : null,
	};
}

async function khoaDay(n: Nguoi) {
	const { khoa } = await taoKhoa(n, "day-lo-trinh");
	if (!khoa) throw new Error(`khong tao duoc khoa Day lo trinh cho ${n}`);
	return khoa;
}

function guiChuoi(key: string | undefined, chuoi: string) {
	const r = request(app.getHttpServer())
		.post(DUONG)
		.set("content-type", "application/json");
	return (key === undefined ? r : r.set(API_KEY_HEADER, key)).send(chuoi);
}

const day = (key: string | undefined, vao: Than) =>
	guiChuoi(key, JSON.stringify(vao));

const hang = () =>
	db.banChupLoTrinh.findUnique({
		where: { nguon: NGUON },
		select: { sha: true, commitLuc: true, layLuc: true },
	});

const don = () => db.banChupLoTrinh.deleteMany({ where: { nguon: NGUON } });

beforeAll(async () => {
	app = await createApp();
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
	}
	await don();
}, CHO_MS);

afterAll(async () => {
	await don();
	await db.apikey.deleteMany({
		where: { referenceId: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

describe("ldbc-day", () => {
	test(
		"ldbc-day: khoi that qua cau REST that, mot hang mang dung sha, gio va nguyen khoi",
		async () => {
			await don();
			expect("tin_hieu" in KHOI).toBe(true);
			const khoa = await khoaDay("owner");
			const truoc = Date.now();
			const r = await day(khoa.key, than());
			const sau = Date.now();
			expect(r.status, JSON.stringify(r.body)).toBe(200);
			expect(ketQuaRa.parse(r.body).ketQua).toBe("nhan");
			expect(await db.banChupLoTrinh.count({ where: { nguon: NGUON } })).toBe(
				1,
			);
			const doc = await docBanChupLoTrinh(db, NGUON);
			if (!doc) throw new Error("khong co hang ban chup");
			expect(doc.sha).toBe(sha("a"));
			expect(doc.commitLuc.toISOString()).toBe(iso(T1));
			expect(
				doc.layLuc.getTime() >= truoc && doc.layLuc.getTime() <= sau,
				"gio lay khong phai gio nhan",
			).toBe(true);
			expect(doc.duLieu, "ban chup mat phan trang chua doc (tin_hieu)").toEqual(
				KHOI,
			);
			const kq = phanTichBanChupLuu(doc);
			expect(kq.ok).toBe(true);
			if (kq.ok) expect(kq.banChup.layLuc).toBe(doc.layLuc.toISOString());
		},
		CHO_MS,
	);
});

describe("ldbc-khoa", () => {
	test(
		"ldbc-khoa: 7 khoa x duong nhan, chi khoa Day cua chu hay quan tri con quyen duoc nhan",
		async () => {
			await don();
			const sai: string[] = [];
			let luc = T1;
			const kiem = async (ten: string, key: string | undefined, ma: number) => {
				const truoc = await hang();
				luc += PHUT;
				const r = await day(key, than({ sha: sha("b"), commitLuc: iso(luc) }));
				if (r.status !== ma) sai.push(`${ten}: ${r.status} != ${ma}`);
				if (ma !== 200) {
					const sau = await hang();
					if (JSON.stringify(sau) !== JSON.stringify(truoc))
						sai.push(`${ten}: ban chup bi doi`);
				}
				await don();
			};
			await kiem("k1 khoa Day cua chu", (await khoaDay("owner")).key, 200);
			await kiem("k2 khoa Day cua quan tri", (await khoaDay("admin")).key, 200);
			const thuong = await taoKhoa("owner");
			if (!thuong.khoa) throw new Error("khong tao duoc khoa thuong");
			await kiem("k3 khoa thuong cua chu", thuong.khoa.key, 401);
			const keo = await taoKhoa("owner", "keo-tin-hieu");
			if (!keo.khoa) throw new Error("khong tao duoc khoa chi keo");
			await kiem("k4 khoa chi keo tin hieu", keo.khoa.key, 401);
			const thuHoi = await khoaDay("owner");
			const rThuHoi = await trpc("owner", "apiKeys.revoke", { id: thuHoi.id });
			expect(rThuHoi.status).toBe(200);
			await kiem("k5 khoa Day da thu hoi", thuHoi.key, 401);
			const roi = await khoaDay("roi");
			const thanhVien = await db.member.findFirstOrThrow({
				where: { userId: uid("roi") },
				select: { id: true },
			});
			const go = await trpc("owner", "workspace.removeMember", {
				memberId: thanhVien.id,
			});
			expect(go.status).toBe(200);
			await kiem("k6 khoa Day cua nguoi da bi go", roi.key, 401);
			const doi = await khoaDay("doi");
			await gieoThanhVien(uid("doi"), "member");
			await kiem("k7 khoa Day cua nguoi bi ha vai", doi.key, 403);
			await kiem("khong co khoa", undefined, 401);
			expect(sai, "khoa cua nguoi bi ha vai van day duoc").toEqual([]);
		},
		CHO_MS,
	);

	test(
		"ldbc-khoa: khoa Day khong mo duoc duong nao khac; khoa dung loai thi mo duoc",
		async () => {
			const day = await khoaDay("owner");
			const thuong = (await taoKhoa("owner")).khoa;
			const keo = (await taoKhoa("owner", "keo-tin-hieu")).khoa;
			if (!thuong || !keo) throw new Error("khong tao duoc khoa doi chung");
			const goi = {
				"tRPC workspace.get": (key: string) =>
					request(app.getHttpServer())
						.get("/api/trpc/workspace.get")
						.set(API_KEY_HEADER, key),
				"REST tin-hieu/lich/keo-ve": (key: string) =>
					request(app.getHttpServer())
						.post(`${REST_BRIDGE_PATH}/tin-hieu/lich/keo-ve`)
						.set(API_KEY_HEADER, key)
						.set("content-type", "application/json")
						.send("{}"),
				"REST contacts/search": (key: string) =>
					request(app.getHttpServer())
						.post(`${REST_BRIDGE_PATH}/contacts/search`)
						.set(API_KEY_HEADER, key)
						.set("content-type", "application/json")
						.send("{}"),
			} as const;
			const doiChung = {
				"tRPC workspace.get": thuong.key,
				"REST tin-hieu/lich/keo-ve": keo.key,
				"REST contacts/search": thuong.key,
			} as const;
			const sai: string[] = [];
			for (const [ten, chay] of Object.entries(goi)) {
				const duong = await chay(doiChung[ten as keyof typeof doiChung]);
				if (duong.status !== 200)
					sai.push(`doi chung ${ten}: khoa dung loai tra ${duong.status}`);
				const khoaDayGoi = await chay(day.key);
				if (khoaDayGoi.status !== 401)
					sai.push(`${ten}: khoa Day tra ${khoaDayGoi.status}, khong phai 401`);
			}
			const phienThuong = await auth.api.getSession({
				headers: new Headers({ [API_KEY_HEADER]: thuong.key }),
			});
			if (!phienThuong)
				sai.push("doi chung getSession: khoa thuong khong mo phien");
			const phienDay = await auth.api
				.getSession({ headers: new Headers({ [API_KEY_HEADER]: day.key }) })
				.then((p) => (p ? "mo phien" : "khong phien"))
				.catch((loi: Error) => `nem ${loi.name}`);
			if (phienDay === "mo phien") sai.push("getSession: khoa Day mo phien");
			expect(sai, "khoa day mo duoc duong khac").toEqual([]);
		},
		CHO_MS,
	);

	test(
		"ldbc-khoa: chi chu va quan tri tao duoc loai khoa Day",
		async () => {
			for (const n of ["member", "okr"] as const)
				expect((await taoKhoa(n, "day-lo-trinh")).status, n).toBe(403);
			const { khoa } = await taoKhoa("admin", "day-lo-trinh");
			if (!khoa) throw new Error("quan tri khong tao duoc khoa Day");
			const dong = await db.apikey.findUniqueOrThrow({
				where: { id: khoa.id },
				select: { configId: true },
			});
			expect(dong.configId).toBe(KHOA_DAY_LO_TRINH.configId);
		},
		CHO_MS,
	);
});

describe("ldbc-hong", () => {
	test(
		"ldbc-hong: 6 o hong bi tu choi nguyen khoi, ban chup dang luu khong doi",
		async () => {
			await don();
			const khoa = await khoaDay("owner");
			const goc = await day(
				khoa.key,
				than({ sha: sha("c"), commitLuc: iso(T1) }),
			);
			expect(goc.status).toBe(200);
			const khuonKhac = structuredClone(KHOI);
			khuonKhac.khuon = "khac";
			const thieuLoTrinh = structuredClone(KHOI);
			delete thieuLoTrinh.lo_trinh;
			const thieuMa = z
				.looseObject({
					lo_trinh: z.array(
						z.looseObject({ hang: z.array(z.record(z.string(), z.json())) }),
					),
				})
				.parse(structuredClone(KHOI));
			const hang0 = thieuMa.lo_trinh[0]?.hang[0];
			if (!hang0) throw new Error("khoi that khong co hang");
			delete hang0.ma;
			const moi = iso(T1 + 10 * PHUT);
			const ca: [string, string, number, string][] = [
				[
					"h1 khuon la",
					JSON.stringify(than({ commitLuc: moi, duLieu: khuonKhac })),
					400,
					"duLieu.khuon",
				],
				[
					"h2 thieu lo_trinh",
					JSON.stringify(than({ commitLuc: moi, duLieu: thieuLoTrinh })),
					400,
					"duLieu.lo_trinh",
				],
				[
					"h3 sha rong",
					JSON.stringify(than({ commitLuc: moi, sha: "" })),
					400,
					"sha",
				],
				[
					"h4 commitLuc khong phai gio",
					JSON.stringify(than({ commitLuc: "hom qua" })),
					400,
					"commitLuc",
				],
				[
					"h5 than lon hon tran",
					JSON.stringify({
						...than({ commitLuc: moi }),
						dem: "x".repeat(BAN_CHUP_LO_TRINH.tranThanByte + 1),
					}),
					413,
					"",
				],
				[
					"h6 hang thieu ma",
					JSON.stringify(
						than({ commitLuc: moi, duLieu: khoiJson.parse(thieuMa) }),
					),
					400,
					"duLieu.lo_trinh.0.hang.0.ma",
				],
			];
			const sai: string[] = [];
			for (const [ten, vao, ma, duong] of ca) {
				const truoc = await hang();
				const r = await guiChuoi(khoa.key, vao);
				if (r.status !== ma) sai.push(`${ten}: ${r.status} != ${ma}`);
				const loi = loiRa.safeParse(r.body);
				const duongLoi = loi.success
					? loi.data.issues.map((i) => i.path.join("."))
					: [];
				if (duong && !duongLoi.includes(duong))
					sai.push(
						`${ten}: loi khong goi ten ${duong}: ${duongLoi.join(", ")}`,
					);
				if (JSON.stringify(await hang()) !== JSON.stringify(truoc))
					sai.push(`${ten}: khoi hong van duoc luu`);
			}
			const doiChung = await day(
				khoa.key,
				than({ sha: sha("d"), commitLuc: moi }),
			);
			if (doiChung.status !== 200)
				sai.push(`doi chung khong pha: ${doiChung.status}`);
			expect(sai).toEqual([]);
		},
		CHO_MS,
	);
});

describe("ldbc-thu-tu", () => {
	test(
		"ldbc-thu-tu: cu hon, trung, moi hon va chay dua",
		async () => {
			await don();
			const khoa = await khoaDay("owner");
			const gui = async (s: string, ms: number) => {
				const r = await day(
					khoa.key,
					than({ sha: sha(s), commitLuc: iso(ms) }),
				);
				return r.status === 200
					? ketQuaRa.parse(r.body).ketQua
					: `loi ${r.status}`;
			};
			expect(await gui("a", T1)).toBe("nhan");
			const layDau = (await hang())?.layLuc;
			expect(await gui("b", T1 - PHUT), "ban chup cu ghi de ban moi").toBe(
				"cu-hon",
			);
			expect((await hang())?.sha).toBe(sha("a"));
			expect(await gui("a", T1)).toBe("trung");
			expect((await hang())?.layLuc).toEqual(layDau);
			expect(await gui("c", T1 + PHUT)).toBe("nhan");
			expect((await hang())?.sha).toBe(sha("c"));
			for (const thuTu of [
				["d", "e"],
				["e", "d"],
			] as const) {
				await don();
				await gui("c", T1);
				const lucCua = { d: T1 + 2 * PHUT, e: T1 + 3 * PHUT };
				await Promise.all(thuTu.map((s) => gui(s, lucCua[s])));
				expect((await hang())?.sha, "chay dua de lai ban cu hon").toBe(
					sha("e"),
				);
			}
			await don();
			const dau = await Promise.all([gui("f", T1), gui("f", T1)]);
			expect(dau.sort()).toEqual(["nhan", "trung"]);
			expect(await db.banChupLoTrinh.count({ where: { nguon: NGUON } })).toBe(
				1,
			);
		},
		CHO_MS,
	);
});

const khoiTho = z.looseObject({
	lo_trinh: z.array(
		z.looseObject({
			hang: z.array(
				z.looseObject({ ma: z.string(), gio_may: z.json().optional() }),
			),
			moc: z.array(
				z.looseObject({
					ten: z.string(),
					con_viec: z.boolean(),
					gio_may: z.json().optional(),
					du_kien: z.json().optional(),
					qua_tai: z.json().optional(),
				}),
			),
		}),
	),
});
type DauVaoDay = {
	goc: string;
	env: Record<string, string | undefined>;
	fetch: typeof fetch;
	sha: string;
	commitLuc: string;
	in: (dong: string) => void;
	loi: (dong: string) => void;
};
const KICH_BAN_DAY = join(GOC, "scripts", "ban-chup-lo-trinh", "day.ts");
const { day: dayKichBan }: { day: (o: DauVaoDay) => Promise<number> } =
	await import(KICH_BAN_DAY);
const giaTri = z.json().optional();
type GiaTri = z.infer<typeof giaTri>;
const giong = (a: GiaTri, b: GiaTri) =>
	JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

async function kiemDayGioMay(
	doc: typeof phanTichBanChupLuu,
): Promise<{ khoa: string; hoanTat: string }> {
	await don();
	const html = readFileSync(join(GOC, "LO-TRINH.html"), "utf8");
	const tho = khoiTho.parse(structuredClone(KHOI));
	const m = tho.lo_trinh.flatMap((l) => l.moc).find((x) => x.con_viec);
	if (!m) throw new Error("khoi that khong co moc dang chay");
	m.du_kien = {
		ngay_tinh: "2026-10-15",
		hoan_tat: "2026-10-31",
		chu: "dự báo lúc bắt đầu (15/10): hoàn tất 31/10",
	};
	m.qua_tai = "mốc quá tải: dự kiến 31/10, mục tiêu 28/10";
	const thu = mkdtempSync(join(tmpdir(), "ldk-day-"));
	writeFileSync(
		join(thu, "LO-TRINH.html"),
		html.replace(
			/<script type="application\/json" id="lo-trinh-du-lieu">[\s\S]*?<\/script>/,
			`<script type="application/json" id="lo-trinh-du-lieu">${JSON.stringify(tho).replace(/</g, "\\u003c")}</script>`,
		),
	);
	const khoa = await khoaDay("owner");
	if (!app.getHttpServer().address()) await app.listen(0);
	const may = app.getHttpServer().address() as AddressInfo;
	const dong: string[] = [];
	const ma = await dayKichBan({
		goc: thu,
		env: {
			CRM_API_URL: `http://127.0.0.1:${may.port}`,
			CRM_KHOA_DAY_LO_TRINH: khoa.key,
		},
		fetch,
		sha: sha("e"),
		commitLuc: iso(T1),
		in: (d) => dong.push(d),
		loi: (d) => dong.push(d),
	});
	expect(ma, dong.join("\n")).toBe(0);
	expect(
		dong.filter((d) => d === "::notice title=ban-chup-lo-trinh::nhan"),
	).toHaveLength(1);
	const luu = await docBanChupLoTrinh(db, NGUON);
	if (!luu) throw new Error("khong co hang ban chup");
	const kq = doc(luu);
	if (!kq.ok) throw new Error(`hang luu lech khuon: ${kq.duongKhoa}`);
	kq.banChup.duLieu.lo_trinh.forEach((l, i) => {
		const lt = tho.lo_trinh[i];
		lt?.moc.forEach((x, j) => {
			const y = l.moc[j];
			for (const k of ["gio_may", "du_kien", "qua_tai"] as const)
				if (!giong(y?.[k], x[k]))
					throw new Error(`ban chup mat ngay du kien: ${x.ten}`);
		});
		lt?.hang.forEach((h, j) => {
			if (!giong(l.hang[j]?.gio_may, h.gio_may))
				throw new Error(`ban chup mat gio may: ${h.ma}`);
		});
	});
	return { khoa: m.ten, hoanTat: "2026-10-31" };
}

describe("ldk-gio-may", () => {
	test(
		"ldk-gio-may: kich ban day qua app that, ban chup luu giu ngay du kien va gio may",
		async () => {
			const { hoanTat } = await kiemDayGioMay(phanTichBanChupLuu);
			expect(hoanTat).toBe("2026-10-31");
		},
		CHO_MS,
	);
	test(
		"ldk-gio-may: pha-thu — doc hang luu bang khuon bo du_kien thi do",
		async () => {
			const hong: typeof phanTichBanChupLuu = (h) => {
				const kq = phanTichBanChupLuu(h);
				if (!kq.ok) return kq;
				for (const l of kq.banChup.duLieu.lo_trinh)
					for (const m of l.moc) m.du_kien = null;
				return kq;
			};
			await expect(kiemDayGioMay(hong)).rejects.toThrow(
				"ban chup mat ngay du kien:",
			);
		},
		CHO_MS,
	);
});
