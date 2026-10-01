import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	type Ai,
	dungSan,
	duyet,
	goi,
	hoi,
	ma,
	ok,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

type SucKhoe = { quaHan: { rows: { slug: string; xacMinhDen: string }[] } };

const NGUOI: Ai[] = ["chu", "owner", "admin", "khac", "okr"];

describe("tlk-xac-minh", () => {
	test("tlk-xac-minh: ma tran 5 nguoi x 2 trang x dat/go, su kien XAC_MINH, qua han vao Suc khoe", async () => {
		const p1 = await taoTrang(
			ma("Xac minh P1"),
			"## P1\n\nNội dung P1.",
			"tao",
			"chu",
		);
		await duyet(p1.deXuatId, "chu");
		const p2 = await taoTrang(
			ma("Xac minh P2"),
			"## P2\n\nNội dung P2.",
			"tao",
			"tao",
		);
		const mong = {
			[p1.slug]: {
				chu: 200,
				owner: 200,
				admin: 200,
				khac: 403,
				okr: 403,
				tao: 403,
			},
			[p2.slug]: {
				chu: 404,
				owner: 200,
				admin: 200,
				khac: 404,
				okr: 404,
				tao: 200,
			},
		} satisfies Record<string, Record<Ai, number>>;
		let o = 0;
		for (const trang of [p1, p2]) {
			for (const ai of NGUOI) {
				for (const den of ["2026-12-20", null]) {
					const truocSuKien = await db.taiLieuSuKien.count({
						where: { trangId: trang.trangId, loai: "XAC_MINH" },
					});
					const truoc = await db.taiLieuTrang.findUniqueOrThrow({
						where: { id: trang.trangId },
						select: { xacMinhDen: true },
					});
					const tra = await goi(
						"taiLieu.datXacMinh",
						{ slug: trang.slug, den },
						ai,
					);
					const ky = mong[trang.slug]?.[ai];
					expect(
						`tlk-xac-minh: ${ai} ${trang.slug} ${den}: ${tra.status}`,
					).toBe(`tlk-xac-minh: ${ai} ${trang.slug} ${den}: ${ky}`);
					const sau = await db.taiLieuTrang.findUniqueOrThrow({
						where: { id: trang.trangId },
						select: { xacMinhDen: true },
					});
					const sauSuKien = await db.taiLieuSuKien.count({
						where: { trangId: trang.trangId, loai: "XAC_MINH" },
					});
					if (ky === 200) {
						expect(sau.xacMinhDen?.toISOString().slice(0, 10) ?? null).toBe(
							den,
						);
						expect(sauSuKien).toBe(truocSuKien + 1);
					} else {
						expect(sau.xacMinhDen).toEqual(truoc.xacMinhDen);
						expect(sauSuKien).toBe(truocSuKien);
					}
					o += 1;
				}
			}
		}
		expect(o).toBe(20);

		ok(
			await goi(
				"taiLieu.datXacMinh",
				{ slug: p1.slug, den: "2026-01-01" },
				"chu",
			),
			"dat qua khu",
		);
		const sk = ok<SucKhoe>(
			await hoi("taiLieu.sucKhoe", undefined, "chu"),
			"suc khoe",
		);
		expect(sk.quaHan.rows.map((r) => r.slug)).toContain(p1.slug);
	});

	test("tlk-xac-minh: get tra xac minh den, qua han va quyen dat", async () => {
		const p = await taoTrang(
			ma("Xac minh get"),
			"## G\n\nNội dung G.",
			"tao",
			"chu",
		);
		await duyet(p.deXuatId, "chu");
		ok(
			await goi(
				"taiLieu.datXacMinh",
				{ slug: p.slug, den: "2026-01-01" },
				"chu",
			),
			"dat",
		);
		type Get = {
			xacMinhDen: string | null;
			quaHanXacMinh: boolean;
			coQuyenXacMinh: boolean;
		};
		const cuaChu = ok<Get>(
			await hoi("taiLieu.get", { slug: p.slug }, "chu"),
			"get chu",
		);
		expect(cuaChu.xacMinhDen?.slice(0, 10)).toBe("2026-01-01");
		expect(cuaChu.quaHanXacMinh).toBe(true);
		expect(cuaChu.coQuyenXacMinh).toBe(true);
		const cuaKhac = ok<Get>(
			await hoi("taiLieu.get", { slug: p.slug }, "khac"),
			"get khac",
		);
		expect(cuaKhac.coQuyenXacMinh).toBe(false);
	});
});
