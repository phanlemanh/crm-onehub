import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TO_CHUC_TRAN } from "@crm/validation/to-chuc";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import {
	cay,
	doc,
	dungSan,
	goi,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	tao,
} from "./to-chuc-san";

dungSan();

const T = TO_CHUC.thongDiep;
const chu = (n: number) => "a".repeat(n);

function boPhan(c: TreeOutput, id: string) {
	const bp = c.divisions.find((d) => d.id === id);
	if (!bp) throw new Error(`khong thay bo phan ${id}`);
	return bp;
}
function phongBan(c: TreeOutput, id: string) {
	const pb = [...c.divisions.flatMap((d) => d.departments), ...c.chuaXep].find(
		(d) => d.id === id,
	);
	if (!pb) throw new Error(`khong thay phong ban ${id}`);
	return pb;
}
function nguoi(c: TreeOutput, id: string) {
	const n = c.people.find((p) => p.id === id);
	if (!n) throw new Error(`khong thay nguoi ${id}`);
	return n;
}

describe("mo-ta-chuc-danh", () => {
	test("quản trị ghi mô tả 500 ký tự cho bộ phận và phòng ban, chức danh 80 ký tự cho người → lưu, tree() trả về", async () => {
		const bp = await tao("org.createDivision", { name: ma("bp") }, "tao bp");
		const pb = await pbMoi("pb", bp);
		const a = await nguoiMoi("A");
		const moTaBp = `Khối kinh doanh ${chu(TO_CHUC_TRAN.moTa - 16)}`;
		const moTaPb = `Phòng miền Bắc ${chu(TO_CHUC_TRAN.moTa - 15)}`;
		const chucDanh = `Trưởng phòng ${chu(TO_CHUC_TRAN.chucDanh - 13)}`;
		expect([moTaBp.length, moTaPb.length, chucDanh.length]).toEqual([
			500, 500, 80,
		]);
		ok(
			await goi("org.renameDivision", {
				id: bp,
				name: ma("bp-2"),
				moTa: moTaBp,
			}),
			"mo ta bp",
		);
		ok(
			await goi("org.renameDepartment", {
				id: pb,
				name: ma("pb-2"),
				moTa: moTaPb,
			}),
			"mo ta pb",
		);
		ok(
			await goi("org.setPlacement", {
				userId: a,
				primaryDepartmentId: pb,
				secondaryDepartmentIds: [],
				managerUserId: null,
				chucDanh,
			}),
			"chuc danh",
		);
		const c = await cay();
		expect(boPhan(c, bp).moTa).toBe(moTaBp);
		expect(phongBan(c, pb).moTa).toBe(moTaPb);
		expect(nguoi(c, a).chucDanh).toBe(chucDanh);
		ok(
			await goi("org.renameDivision", { id: bp, name: ma("bp-3") }),
			"doi ten khong dong mo ta",
		);
		expect(boPhan(await cay(), bp).moTa, "doi ten lam mat mo ta").toBe(moTaBp);
	});

	test("501 và 81 ký tự → từ chối có tên, không ghi", async () => {
		const bp = await tao(
			"org.createDivision",
			{ name: ma("bp-tran") },
			"tao bp",
		);
		const pb = await pbMoi("pb-tran", bp);
		const a = await nguoiMoi("B");
		const bpDai = await goi("org.renameDivision", {
			id: bp,
			name: ma("x"),
			moTa: chu(TO_CHUC_TRAN.moTa + 1),
		});
		expect([bpDai.status, bpDai.loi], "tran mo ta khong chan").toEqual([
			400,
			T.moTaDai(TO_CHUC_TRAN.moTa),
		]);
		const pbDai = await goi("org.renameDepartment", {
			id: pb,
			name: ma("y"),
			moTa: chu(TO_CHUC_TRAN.moTa + 1),
		});
		expect(
			[pbDai.status, pbDai.loi],
			"tran mo ta phong ban khong chan",
		).toEqual([400, T.moTaDai(TO_CHUC_TRAN.moTa)]);
		const cdDai = await goi("org.setPlacement", {
			userId: a,
			primaryDepartmentId: pb,
			secondaryDepartmentIds: [],
			managerUserId: null,
			chucDanh: chu(TO_CHUC_TRAN.chucDanh + 1),
		});
		expect([cdDai.status, cdDai.loi], "tran chuc danh khong chan").toEqual([
			400,
			T.chucDanhDai(TO_CHUC_TRAN.chucDanh),
		]);
		const c = await cay();
		expect([
			boPhan(c, bp).moTa,
			phongBan(c, pb).moTa,
			c.people.find((p) => p.id === a)?.chucDanh ?? "",
		]).toEqual(["", "", ""]);
	});

	test("thành viên và vai okr đọc được tree() có trường, ghi → 403", async () => {
		const bp = await tao(
			"org.createDivision",
			{ name: ma("bp-doc") },
			"tao bp",
		);
		ok(
			await goi("org.renameDivision", {
				id: bp,
				name: ma("bp-doc-2"),
				moTa: "Khối đọc thử.",
			}),
			"mo ta",
		);
		for (const ai of ["thuong", "okr"] as const) {
			const c = await doc<TreeOutput>("org.tree", ai);
			expect(boPhan(c, bp).moTa, `${ai} doc mo ta`).toBe("Khối đọc thử.");
			expect("chucDanh" in (c.people[0] ?? {}), `${ai} thay chuc danh`).toBe(
				true,
			);
			const ghi = await goi(
				"org.renameDivision",
				{ id: bp, name: ma("z"), moTa: "Sửa trộm." },
				ai,
			);
			expect(ghi.status, `${ai} ghi mo ta`).toBe(403);
			const vt = await goi(
				"org.setPlacement",
				{
					userId: c.people[0]?.id ?? "",
					primaryDepartmentId: null,
					secondaryDepartmentIds: [],
					managerUserId: null,
					chucDanh: "Kẻ lạ",
				},
				ai,
			);
			expect(vt.status, `${ai} ghi chuc danh`).toBe(403);
		}
	});

	test("bản ghi tạo trước migration (không có cột trong lời tạo) đọc lên moTa '' và chucDanh ''", async () => {
		const bp = await db.division.create({
			data: { name: ma("bp-cu"), position: 999 },
			select: { id: true },
		});
		const pb = await db.department.create({
			data: { name: ma("pb-cu"), position: 999, divisionId: bp.id },
			select: { id: true },
		});
		const a = await nguoiMoi("C");
		await db.orgPlacement.create({
			data: { userId: a, primaryDepartmentId: pb.id },
		});
		const c = await cay();
		expect([
			boPhan(c, bp.id).moTa,
			phongBan(c, pb.id).moTa,
			nguoi(c, a).chucDanh,
		]).toEqual(["", "", ""]);
		ok(
			await goi("org.setPlacement", {
				userId: a,
				primaryDepartmentId: pb.id,
				secondaryDepartmentIds: [],
				managerUserId: null,
			}),
			"placement khong gui chuc danh van luu",
		);
		expect(nguoi(await cay(), a).chucDanh).toBe("");
	});

	test("setPlacement không mang chucDanh → giữ nguyên; gửi rỗng tường minh → xoá", async () => {
		const pb = await pbMoi("pb-giu");
		const a = await nguoiMoi("D");
		const vao = {
			userId: a,
			primaryDepartmentId: pb,
			secondaryDepartmentIds: [],
			managerUserId: null,
		};
		ok(
			await goi("org.setPlacement", { ...vao, chucDanh: "Kế toán trưởng" }),
			"dat chuc danh",
		);
		expect(nguoi(await cay(), a).chucDanh).toBe("Kế toán trưởng");
		ok(await goi("org.setPlacement", vao), "khong gui chuc danh");
		expect(nguoi(await cay(), a).chucDanh, "khong gui thi phai giu").toBe(
			"Kế toán trưởng",
		);
		ok(await goi("org.setPlacement", { ...vao, chucDanh: "" }), "gui rong");
		expect(nguoi(await cay(), a).chucDanh, "gui rong thi phai xoa").toBe("");
	});
});
