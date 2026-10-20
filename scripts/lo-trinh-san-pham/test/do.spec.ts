import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { db } from "../../../packages/db/src/client.ts";
import { taoSanPham } from "../../../packages/db/src/san-pham-lo-trinh.ts";
import { CO, doSanPham, inDong } from "../do.ts";

const TIEN_TO = `ltsp-do-${process.env.TEST_RUN_ID ?? Date.now().toString(36)}`;
const T = new Date("2026-10-20T00:00:00Z").getTime();
const GIO = 3_600_000;
const PHUT = 60_000;
let nguoi = "";

async function sp(
	ten: string,
	taoLuc: number,
	caiLuc: number | null,
	layDauLuc: number | null,
) {
	const ma = `${TIEN_TO}-${ten}`;
	await taoSanPham(db, {
		ma,
		ten: ma,
		kho: `phanlemanh/${ma}`,
		nhanh: "main",
		duongTep: "LO-TRINH.html",
		taoBoiId: nguoi,
	});
	await db.sanPhamLoTrinh.update({
		where: { ma },
		data: {
			taoLuc: new Date(taoLuc),
			caiLuc: caiLuc === null ? null : new Date(caiLuc),
			layDauLuc: layDauLuc === null ? null : new Date(layDauLuc),
		},
	});
	return ma;
}

beforeAll(async () => {
	nguoi = `${TIEN_TO}-nguoi`;
	await db.user.create({
		data: { id: nguoi, name: nguoi, email: `${nguoi}@thu.test` },
	});
});

afterAll(async () => {
	await db.sanPhamLoTrinh.deleteMany({
		where: { ma: { startsWith: TIEN_TO } },
	});
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("ltsp-do", () => {
	test("mỗi sản phẩm một dòng, độ trễ tính từ mốc muộn hơn của khai và cài", async () => {
		const x = await sp("x", T, T + GIO, T + GIO + 5 * PHUT);
		const y = await sp("y", T + 2 * GIO, T, T + 26 * GIO + 5 * PHUT);
		const z = await sp("z", T, T, null);
		const kq = await doSanPham(db, { tienTo: TIEN_TO });
		expect(kq.dong.map((d) => d.ma).sort()).toEqual([x, y, z].sort());
		const dong = new Map(kq.dong.map((d) => [d.ma, d]));
		if (dong.get(x)?.treMs !== 5 * PHUT)
			throw new Error("do tre khong tinh tu moc muon hon: X");
		expect(inDong(dong.get(x) ?? kq.dong[0]!)).toContain("do-tre 5m");
		expect(dong.get(y)?.treMs).toBe(24 * GIO + 5 * PHUT);
		expect(dong.get(y)?.co).toEqual([CO.quaMotNgay]);
		expect(dong.get(z)?.co).toEqual([CO.chuaCoBanChup]);
		expect(kq.dat).toBe(false);
		await db.sanPhamLoTrinh.deleteMany({ where: { ma: { in: [y, z] } } });
		expect((await doSanPham(db, { tienTo: TIEN_TO })).dat).toBe(true);
	});

	test("không đọc được danh bạ thì thoát 2 và không in «dat»", () => {
		const url = new URL(
			process.env.DATABASE_URL ?? "postgresql://x@localhost:5432/x",
		);
		url.pathname = "/khong_co_kho_nay_ltsp";
		const r = spawnSync("bun", [path.join(import.meta.dir, "..", "do.ts")], {
			env: {
				...process.env,
				NODE_ENV: "development",
				DATABASE_URL: url.toString(),
			},
			encoding: "utf8",
			timeout: 60_000,
		});
		expect(r.status).toBe(2);
		expect(r.stdout).not.toContain("dat");
	});
});
