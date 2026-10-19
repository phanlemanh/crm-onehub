import { afterAll, beforeAll, describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { dropDatabase, withMaintenance } from "../scripts/test-db-admin";
import { taoDuAn, taoPhuThuoc } from "../src/du-an-ghi";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseName, runScopedUrl } from "../src/test-database";
import { doiDuAn, taoViec, taoViecCon } from "../src/viec-ghi";
import { WORKSPACE_ID } from "../src/workspace";

const MA = `vrc${Date.now().toString(36)}`;
const GOI = fileURLToPath(new URL("..", import.meta.url));
const LENH_MS = 60_000;
const GIEO_MS = 240_000;
const KHO_CHAY = runScopedUrl(
	process.env.TEST_DATABASE_URL ?? "",
	process.env.TEST_RUN_ID,
);
const TEN_KHO = `${databaseName(KHO_CHAY).replace(/_test$/, "")}_vrcdem_test`;
const KHO = (() => {
	const u = new URL(KHO_CHAY);
	u.pathname = `/${TEN_KHO}`;
	return u.toString();
})();

let kho: PrismaClient;

function ngay(s: string): Date {
	return new Date(`${s}T00:00:00.000Z`);
}

function chay(env: Record<string, string>) {
	const ket = spawnSync("bun", ["run", "viec:dem-rieng"], {
		cwd: GOI,
		encoding: "utf8",
		timeout: LENH_MS,
		env: { ...process.env, NODE_ENV: "development", ...env },
	});
	return { ma: ket.status, ra: ket.stdout, loi: ket.stderr };
}

async function nguoi(ten: string): Promise<string> {
	const id = `${MA}-${ten}`;
	await kho.user.create({ data: { id, name: id, email: `${id}@thu.test` } });
	await kho.member.create({
		data: {
			id: `m-${id}`,
			organizationId: WORKSPACE_ID,
			userId: id,
			role: "member",
			createdAt: new Date(0),
		},
	});
	return id;
}

async function vanTay() {
	const [viec, viecVet, viecPhuThuoc] = await Promise.all([
		kho.viec.count(),
		kho.viecVet.count(),
		kho.viecPhuThuoc.count(),
	]);
	return JSON.stringify({ viec, viecVet, viecPhuThuoc });
}

beforeAll(async () => {
	await withMaintenance(KHO_CHAY, async (c) => {
		await dropDatabase(c, TEN_KHO);
		await c.query(`CREATE DATABASE "${TEN_KHO}"`);
	});
	const mig = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
		cwd: GOI,
		encoding: "utf8",
		env: { ...process.env, NODE_ENV: "development", DATABASE_URL: KHO },
	});
	if (mig.status !== 0)
		throw new Error(`vrc: kho thu khong dung ${mig.stderr}`);
	kho = new PrismaClient({ adapter: new PrismaPg({ connectionString: KHO }) });
	await kho.organization.create({
		data: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: new Date() },
	});
}, GIEO_MS);

afterAll(async () => {
	await kho?.$disconnect();
	await withMaintenance(KHO_CHAY, (c) => dropDatabase(c, TEN_KHO));
});

describe("vrc-dem", () => {
	test(
		"vrc-dem: lệnh đếm chỉ đọc ra đúng số khung hứa sai và số dòng lịch sử nhắc việc riêng",
		async () => {
			if ((await kho.viec.count()) !== 0)
				throw new Error("vrc: kho thu khong trong");
			const a = await nguoi("a");
			const b = await nguoi("b");
			const now = new Date();
			const cty = await kho.company.create({ data: { name: `${MA} cty` } });
			const deal = await kho.deal.create({
				data: { name: `${MA} deal`, companyId: cty.id, ownerId: a },
			});
			const ids = await kho.$transaction(async (tx) => {
				const P = await taoDuAn(tx, { nguoiId: a, ten: `${MA} P`, now });
				const viec = (
					tieuDe: string,
					batDau: string,
					han: string,
					gan: { loai: "deal"; id: string }[] = [],
				) =>
					taoViec(tx, {
						nguoiId: a,
						nguoiThucHienId: b,
						tieuDe,
						gan,
						duAnId: P.id,
						batDauNgay: ngay(batDau),
						hanNgay: ngay(han),
						nguon: "web",
						now,
					});
				const V = await viec("vrc V", "2026-11-02", "2026-11-03");
				const G = await viec("vrc G", "2026-11-02", "2026-11-03", [
					{ loai: "deal", id: deal.id },
				]);
				const W1 = await viec("vrc W1", "2026-11-04", "2026-11-05");
				const W2 = await viec("vrc W2", "2026-11-04", "2026-11-05");
				for (const [truoc, sau] of [
					[V, W1],
					[V, W2],
					[G, W1],
				] as const) {
					await taoPhuThuoc(tx, {
						nguoiId: a,
						truocId: truoc.id,
						sauId: sau.id,
						now,
					});
				}
				await doiDuAn(tx, {
					viecId: V.id,
					nguoiId: a,
					duAnId: null,
					nguon: "web",
					now,
				});
				const R3 = await taoViec(tx, {
					nguoiId: a,
					nguoiThucHienId: b,
					tieuDe: "vrc R3",
					gan: [],
					nguon: "web",
					now,
				});
				await taoViecCon(tx, {
					chaId: R3.id,
					nguoiId: a,
					tieuDe: "vrc R2",
					nguoiThucHienId: b,
					now,
				});
				return { V: V.id, W1: W1.id, W2: W2.id };
			});
			for (const w of ["W1", "W2"] as const) {
				for (const loai of ["them-phu-thuoc", "go-phu-thuoc"] as const) {
					const hang = await kho.viecVet.findMany({
						where: { viecId: ids[w], loai },
						select: { truoc: true, sau: true },
					});
					const n = hang.filter((h) =>
						JSON.stringify(h).includes(ids.V),
					).length;
					if (n !== 1) throw new Error(`vrc: fixture vet ${w} ${loai} ${n}`);
				}
			}
			const truoc = await vanTay();
			const dem = chay({ DATABASE_URL: KHO });
			if (dem.ma !== 0)
				throw new Error(`vrc: dem thoat ${dem.ma} ${dem.loi.slice(0, 300)}`);
			let so: unknown;
			try {
				so = JSON.parse(dem.ra.trim().split("\n").at(-1) ?? "");
			} catch {
				throw new Error(`vrc: dem sai ${dem.ra.slice(0, 300)}`);
			}
			const mong = {
				viecDuAnKhongGan: 2,
				vetNhacViecRieng: 4,
				viecRiengBiNhac: 1,
			};
			if (JSON.stringify(so) !== JSON.stringify(mong)) {
				throw new Error(`vrc: dem sai ${JSON.stringify(so)}`);
			}
			if ((await vanTay()) !== truoc) throw new Error("vrc: dem ghi vao kho");
			const { giaoDichChiDoc } = await import("../scripts/dem-viec-rieng");
			let maLoi: unknown = null;
			try {
				await giaoDichChiDoc(kho, (tx) =>
					tx.viec.create({
						data: {
							tieuDe: "vrc ghi len",
							nguoiGiaoId: a,
							nguoiThucHienId: b,
							taoBoiId: a,
						},
					}),
				);
			} catch (loi) {
				maLoi = JSON.stringify(loi, Object.getOwnPropertyNames(loi));
			}
			if (typeof maLoi !== "string" || !maLoi.includes("25006")) {
				throw new Error("vrc: giao dich ghi duoc");
			}
			const rong = chay({ DATABASE_URL: "" });
			if (rong.ma !== 2 || !rong.loi.includes("DATABASE_URL")) {
				throw new Error("vrc: thieu bien khong chan");
			}
		},
		GIEO_MS,
	);
});
