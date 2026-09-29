import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import {
	type Ai,
	deXuat,
	donTaiLieu,
	dungSan,
	duyet,
	hoi,
	ok,
	phien,
	taoTrang,
	traLai,
} from "./tai-lieu-san";

dungSan();

const MONG = { chu: 2, admin: 3, khac: 0, tao: 1 } as const satisfies Partial<
	Record<Ai, number>
>;

const QUYEN = join(import.meta.dir, "..", "src", "tai-lieu", "quyen.ts");

const DINH_NGHIA_LUAT =
	/\b(?:function|const)\s+(dieuKienDuyetDuoc|dieuKienThayDeXuat|dieuKienThay)\b/g;

function luatTuDinhNghia(nguon: string): string[] {
	return [...nguon.matchAll(DINH_NGHIA_LUAT)].map((m) => m[1] as string);
}

beforeAll(async () => {
	await donTaiLieu({});
	const px = await taoTrang("Bảng tab X", "Gốc X.\n", "tao", "chu");
	await duyet(px.deXuatId, "chu");
	const c1 = await deXuat(px.slug, "Sửa X lần một.\n", "khac");
	await deXuat(px.slug, "Sửa X sẽ thành cũ.\n", "khac");
	await duyet(c1, "chu");
	await traLai(await deXuat(px.slug, "Sửa X bị trả lại.\n", "khac"), "chu");
	await deXuat(px.slug, "Sửa X chờ một.\n", "khac");
	await deXuat(px.slug, "Sửa X chờ hai.\n", "khac");
	await taoTrang("Bảng tab Y", "Nháp Y.\n", "khac", "tao");
	const theoTrangThai = await db.taiLieuDeXuat.groupBy({
		by: ["trangThai"],
		_count: { _all: true },
	});
	expect(
		Object.fromEntries(theoTrangThai.map((t) => [t.trangThai, t._count._all])),
	).toMatchObject({ CHO_DUYET: 3, TRA_LAI: 1, CU: 1 });
});

describe("nhac-bang-tab", () => {
	test("nhac-bang-tab: tab, nhac sang, tong quan va so viet truoc bang nhau voi bon nguoi", async () => {
		let soKhangDinh = 0;
		for (const [ai, n] of Object.entries(MONG) as [
			keyof typeof MONG,
			number,
		][]) {
			const tab = ok<{ choToiDuyet: number }>(
				await hoi("taiLieu.proposals", undefined, ai),
				`tab ${ai}`,
			).choToiDuyet;
			const viec =
				(
					await viecCanNhac(db, {
						now: new Date(),
						userId: phien[ai].nguoi,
						cuaSo: "buoi-sang",
					})
				).get(phien[ai].nguoi) ?? [];
			const muc = viec.find((v) => v.loai === "tai-lieu-cho-duyet");
			const nhac = muc?.loai === "tai-lieu-cho-duyet" ? muc.so : 0;
			const tongQuan = ok<{ taiLieuChoDuyet: number }>(
				await hoi("dashboard.summary", { scope: "me" }, ai),
				`tong quan ${ai}`,
			).taiLieuChoDuyet;
			if (tab !== nhac) {
				throw new Error(`nhac-bang-tab: ${ai} tab ${tab} != nhac ${nhac}`);
			}
			expect(tab, `nhac-bang-tab: ${ai} tab`).toBe(n);
			expect(nhac, `nhac-bang-tab: ${ai} nhac`).toBe(n);
			expect(tongQuan, `nhac-bang-tab: ${ai} tong quan`).toBe(n);
			expect(tab === nhac && nhac === tongQuan).toBe(true);
			soKhangDinh += 4;
		}
		expect(soKhangDinh).toBe(16);
	});

	test("nhac-bang-tab: luat duyet chi dinh nghia mot cho, quyen.ts cua API goi lai", () => {
		const cu = [
			"export function dieuKienDuyetDuoc(",
			"\tnguoi: NguoiGoi,",
			"): Prisma.TaiLieuDeXuatWhereInput {",
			"\treturn { trang: { chuTrangId: nguoi.id } };",
			"}",
		].join("\n");
		expect(
			luatTuDinhNghia(cu),
			"doi chung duong: ban cu co dinh nghia",
		).toEqual(["dieuKienDuyetDuoc"]);
		expect(luatTuDinhNghia(readFileSync(QUYEN, "utf8"))).toEqual([]);
	});
});
