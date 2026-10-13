import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { dropDatabase, withMaintenance } from "../scripts/test-db-admin";
import { db } from "../src/client";
import { TrangThaiViec } from "../src/generated/prisma/enums";
import { databaseName, runScopedUrl } from "../src/test-database";
import { chepViecCanLam, doiTrangThai } from "../src/viec-ghi";
import {
	donNguoi,
	khuonApi,
	moToChuc,
	taoNguoi,
} from "./support/viec-can-lam-cu";

const MA = `cvl${Date.now().toString(36)}`;
const LENH = fileURLToPath(
	new URL("../scripts/chep-viec-can-lam.ts", import.meta.url),
);
const GOI = fileURLToPath(new URL("..", import.meta.url));
const SEED = fileURLToPath(new URL("../prisma/seed.ts", import.meta.url));
const KHO_XA = "postgresql://u:p@db.example.com:5432/crm";
const MOC_MS = 60 * 60 * 1000;
const GIEO_MS = 240_000;
const LENH_MS = 60_000;

const KHO = runScopedUrl(
	process.env.TEST_DATABASE_URL ?? "",
	process.env.TEST_RUN_ID,
);

type SoDem = {
	taskTong: number;
	taskMo: number;
	taskXong: number;
	daChep: number;
	chuaChep: number;
	banChep: number;
	banChepDaDoi: number;
	nguoiTaoKhongNhan: number;
	taskTaoSau: number | null;
};

let quanTri = "";
let thuong = "";
let okr = "";
let thoaThuan = "";
let moc = new Date();

function hong(dieu: boolean, thongDiep: string): void {
	if (!dieu) throw new Error(thongDiep);
}

function chay(co: string[], env: Record<string, string> = {}) {
	const ket = spawnSync("bun", [LENH, ...co], {
		cwd: GOI,
		encoding: "utf8",
		timeout: LENH_MS,
		env: {
			...process.env,
			NODE_ENV: "development",
			DATABASE_URL: KHO,
			ALLOW_REMOTE_DB: "",
			...env,
		},
	});
	return { ma: ket.status, ra: ket.stdout, loi: ket.stderr };
}

function json<T>(ra: string): T {
	return JSON.parse(ra) as T;
}

async function vanTay() {
	const [activity, viec, viecVet, viecGan] = await Promise.all([
		db.activity.count(),
		db.viec.count(),
		db.viecVet.count(),
		db.viecGan.count(),
	]);
	return JSON.stringify({ activity, viec, viecVet, viecGan });
}

function emailCua(id: string): string {
	return `${id}@thu.test`;
}

beforeAll(async () => {
	await moToChuc();
	quanTri = await taoNguoi(`${MA}-q`, "admin");
	thuong = await taoNguoi(`${MA}-m`, "member");
	okr = await taoNguoi(`${MA}-okr`, "okr");
	const cty = await db.company.create({ data: { name: `${MA} cty` } });
	thoaThuan = (
		await db.deal.create({
			data: { name: `${MA} deal`, companyId: cty.id, ownerId: thuong },
		})
	).id;
	moc = new Date(Date.now() - MOC_MS);
});

afterAll(async () => {
	await donNguoi(MA);
});

describe("cvc-lenh", () => {
	test("cvc-lenh: đếm, chạy thử, chép, đảo, chặn kho xa qua dòng lệnh", async () => {
		const nen = json<SoDem>(chay(["--tu", moc.toISOString()]).ra);
		const truocMoc = new Date(moc.getTime() - MOC_MS);
		const mo1 = await khuonApi({
			createdById: thuong,
			subject: "Mở một",
			dealId: thoaThuan,
			createdAt: truocMoc,
		});
		const mo2 = await khuonApi({
			createdById: thuong,
			subject: "Mở hai",
			dealId: thoaThuan,
			createdAt: truocMoc,
		});
		await khuonApi({
			createdById: okr,
			subject: "Mở của okr",
			dealId: thoaThuan,
		});
		const xong1 = await khuonApi({
			createdById: thuong,
			subject: "Xong một",
			dealId: thoaThuan,
			completedAt: new Date(),
			createdAt: truocMoc,
		});
		await khuonApi({
			createdById: thuong,
			subject: "Xong hai",
			dealId: thoaThuan,
			completedAt: new Date(),
		});
		const ban = await db.$transaction(async (tx) => {
			const nguoiChay = { id: quanTri, ten: quanTri };
			const a = await chepViecCanLam(tx, {
				activityId: mo2,
				nguoiChay,
				now: new Date(),
			});
			const b = await chepViecCanLam(tx, {
				activityId: xong1,
				nguoiChay,
				now: new Date(),
			});
			return [a?.id ?? "", b?.id ?? ""];
		});
		await db.$transaction((tx) =>
			doiTrangThai(tx, {
				viecId: ban[0] ?? "",
				nguoiId: thuong,
				nguon: "web",
				now: new Date(),
				den: TrangThaiViec.DANG_LAM,
			}),
		);

		const vtTruoc = await vanTay();
		const dem = chay(["--tu", moc.toISOString()]);
		hong(dem.ma === 0, `cvc: dem sai ${dem.loi}`);
		const d = json<SoDem>(dem.ra);
		const ky: SoDem = {
			taskTong: nen.taskTong + 5,
			taskMo: nen.taskMo + 3,
			taskXong: nen.taskXong + 2,
			daChep: nen.daChep + 2,
			chuaChep: nen.chuaChep + 3,
			banChep: nen.banChep + 2,
			banChepDaDoi: nen.banChepDaDoi + 1,
			nguoiTaoKhongNhan: nen.nguoiTaoKhongNhan + 1,
			taskTaoSau: (nen.taskTaoSau ?? 0) + 2,
		};
		hong(JSON.stringify(d) === JSON.stringify(ky), `cvc: dem sai ${dem.ra}`);
		hong((await vanTay()) === vtTruoc, "cvc: lenh dem ghi vao kho");
		hong(json<SoDem>(chay([]).ra).taskTaoSau === null, "cvc: dem tao sau sai");

		for (const co of [["--chay", "--nguoi", emailCua(thuong)], ["--chay"]]) {
			const vt = await vanTay();
			const r = chay(co);
			hong(
				r.ma !== 0 && r.loi.includes("quản trị") && (await vanTay()) === vt,
				"cvc: lenh chay khong co quan tri",
			);
		}

		const vtThu = await vanTay();
		const thu = chay(["--chay", "--thu", "--nguoi", emailCua(quanTri)]);
		const kThu = json<{ thu: boolean; loi: unknown[] }>(thu.ra);
		hong(
			thu.ma === 0 &&
				kThu.thu === true &&
				kThu.loi.length === 0 &&
				(await vanTay()) === vtThu,
			"cvc: chay thu ghi vao kho",
		);

		const that = chay(["--chay", "--nguoi", emailCua(quanTri)]);
		const k = json<{ truoc: SoDem; chep: number; loi: unknown[]; sau: SoDem }>(
			that.ra,
		);
		hong(
			that.ma === 0 &&
				k.truoc.taskTong === ky.taskTong &&
				k.chep === ky.chuaChep &&
				k.loi.length === 0 &&
				k.sau.banChep === ky.banChep + ky.chuaChep &&
				k.sau.chuaChep === 0 &&
				k.sau.taskTong === ky.taskTong,
			`cvc: ban in chay sai ${that.ra}`,
		);

		const dao = chay(["--dao"]);
		const kd = json<{ xoa: number; giuLai: string[]; sau: SoDem }>(dao.ra);
		const daDoi = k.sau.banChepDaDoi;
		hong(
			dao.ma === 0 &&
				kd.xoa === k.sau.banChep - daDoi &&
				kd.giuLai.length === daDoi &&
				kd.giuLai.includes(ban[0] ?? ""),
			`cvc: ban in dao sai ${dao.ra}`,
		);
		const dao2 = chay(["--dao", "--ca-ban-da-doi"]);
		const kd2 = json<{ xoa: number; giuLai: string[]; sau: SoDem }>(dao2.ra);
		hong(
			dao2.ma === 0 &&
				kd2.xoa === daDoi &&
				kd2.giuLai.length === 0 &&
				kd2.sau.banChep === 0,
			`cvc: ban in dao sai ${dao2.ra}`,
		);
		hong(
			(await db.activity.count({
				where: { id: { in: [mo1, mo2, xong1] } },
			})) === 3,
			"cvc: ban in dao sai ban goc mat",
		);

		for (const co of [["--chay", "--nguoi", emailCua(quanTri)], ["--dao"]]) {
			const r = chay(co, { DATABASE_URL: KHO_XA });
			hong(
				r.ma !== 0 && r.loi.includes("Refusing to run viec:chep-cu"),
				"cvc: lenh ghi chay tren kho xa",
			);
		}
		const demXa = chay([], { DATABASE_URL: KHO_XA });
		hong(
			!demXa.loi.includes("Refusing to run"),
			"cvc: lenh ghi chay tren kho xa",
		);
		const choPhep = chay(["--chay", "--nguoi", emailCua(quanTri)], {
			DATABASE_URL: KHO_XA,
			ALLOW_REMOTE_DB: "1",
		});
		hong(
			choPhep.ma !== 0 && !choPhep.loi.includes("Refusing to run"),
			"cvc: bo chan chan ca khi da cho phep",
		);
	}, 120_000);

	test(
		"cvc-lenh: dữ liệu mẫu không gieo việc cần làm",
		async () => {
			const ten = `${databaseName(KHO).replace(/_test$/, "")}_cvcgieo_test`;
			const url = new URL(KHO);
			url.pathname = `/${ten}`;
			const kho = url.toString();
			await withMaintenance(KHO, async (c) => {
				await dropDatabase(c, ten);
				await c.query(`CREATE DATABASE "${ten}"`);
			});
			try {
				const env = {
					...process.env,
					NODE_ENV: "development",
					DATABASE_URL: kho,
				};
				const mig = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
					cwd: GOI,
					encoding: "utf8",
					env,
				});
				hong(mig.status === 0, `cvc: gieo khong dung duoc kho ${mig.stderr}`);
				const gieo = spawnSync("bun", [SEED], {
					cwd: GOI,
					encoding: "utf8",
					env,
				});
				hong(gieo.status === 0, `cvc: gieo khong chay ${gieo.stderr}`);
				const c = new pg.Client({ connectionString: kho });
				await c.connect();
				const dem = await c
					.query(
						`SELECT count(*) FILTER (WHERE type = 'TASK')::int AS task, count(*)::int AS tong FROM activity`,
					)
					.then((r) => r.rows[0] as { task: number; tong: number })
					.finally(() => c.end());
				hong(dem.tong > 0, "cvc: gieo khong ra hoat dong nao");
				hong(dem.task === 0, "cvc: gieo con viec can lam");
				expect(dem.task).toBe(0);
			} finally {
				await withMaintenance(KHO, (c) => dropDatabase(c, ten));
			}
		},
		GIEO_MS,
	);
});
