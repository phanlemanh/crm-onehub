import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import {
	cay,
	datViTri,
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

async function thuTuTrong(divisionId: string): Promise<string[]> {
	const c = await cay();
	return (
		c.divisions
			.find((d) => d.id === divisionId)
			?.departments.map((p) => p.id) ?? []
	);
}

async function roiWorkspace(userId: string): Promise<void> {
	await db.member.delete({
		where: {
			organizationId_userId: { organizationId: "workspace", userId },
		},
	});
}

describe("gan-phong-ban", () => {
	test("gan-phong-ban: lo tron vao bo phan theo thu tu, bo trung, lo hong tu choi ca lo, goi lai khong doi", async () => {
		const a = await tao("org.createDivision", { name: ma("gan-a") }, "bp A");
		const b = await tao("org.createDivision", { name: ma("gan-b") }, "bp B");
		const pb1 = await pbMoi("gan-pb1", b);
		const pbChuaXep = await pbMoi("gan-chua-xep");
		const pbTuA = await pbMoi("gan-tu-a", a);

		ok(
			await goi("org.attachDepartments", {
				divisionId: b,
				departmentIds: [pbChuaXep, pbTuA, pb1, pbChuaXep],
			}),
			"gan lo",
		);
		expect(await thuTuTrong(b)).toEqual([pb1, pbChuaXep, pbTuA]);
		expect(`A con pbTuA: ${(await thuTuTrong(a)).includes(pbTuA)}`).toBe(
			"A con pbTuA: false",
		);

		const pbLuu = await pbMoi("gan-luu");
		ok(await goi("onboarding.archiveDepartment", { id: pbLuu }), "luu pb");
		const bLuu = await tao(
			"org.createDivision",
			{ name: ma("gan-b-luu") },
			"bp luu",
		);
		ok(await goi("org.archiveDivision", { id: bLuu }), "luu bp");
		const pbKhac = await pbMoi("gan-khac");

		for (const [nhan, vao, cau] of [
			[
				"co pb da luu tru",
				{ divisionId: b, departmentIds: [pbKhac, pbLuu] },
				T.phongBanDaLuuTru,
			],
			[
				"co id khong ton tai",
				{ divisionId: b, departmentIds: [pbKhac, "khong-co-that"] },
				T.khongCoPhongBan("khong-co-that"),
			],
			[
				"bo phan dich da luu tru",
				{ divisionId: bLuu, departmentIds: [pbKhac] },
				T.boPhanDaLuuTru,
			],
		] as const) {
			const truoc = JSON.stringify(await cay());
			const tra = await goi("org.attachDepartments", vao);
			expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(
				`${nhan}: HTTP ${cau === T.khongCoPhongBan("khong-co-that") ? 404 : 400} ${cau}`,
			);
			const sau = JSON.stringify(await cay());
			expect(
				`${nhan}: ${sau === truoc ? "cay giu nguyen" : "cay doi sau lo bi tu choi"}`,
			).toBe(`${nhan}: cay giu nguyen`);
		}

		ok(
			await goi("org.attachDepartments", {
				divisionId: b,
				departmentIds: [pbChuaXep, pbTuA],
			}),
			"gan lai",
		);
		expect(await thuTuTrong(b)).toEqual([pb1, pbChuaXep, pbTuA]);
	});
});

describe("them-nguoi", () => {
	test("them-nguoi: bon nguoi cung vao phong ban chinh, phu bi go, ghi de giu, lo hong khong ghi gi", async () => {
		const p = await pbMoi("tn-p");
		const q = await pbMoi("tn-q");
		const a = await nguoiMoi("tn-a");
		const b = await nguoiMoi("tn-b");
		const c = await nguoiMoi("tn-c");
		const d = await nguoiMoi("tn-d");
		const quanLy = await nguoiMoi("tn-ql");
		ok(await datViTri(b, q), "b o Q");
		ok(await datViTri(c, q, [p]), "c phu P");
		ok(await datViTri(d, q, [], quanLy), "d ghi de");

		ok(
			await goi("org.addPeople", { departmentId: p, userIds: [a, b, c, d] }),
			"them lo",
		);
		const sau = await cay();
		const vt = (id: string) => sau.people.find((n) => n.id === id);
		expect(
			[a, b, c, d].map(
				(id) =>
					`${id === a ? "a" : id === b ? "b" : id === c ? "c" : "d"}:${vt(id)?.primaryDepartmentId === p}`,
			),
		).toEqual(["a:true", "b:true", "c:true", "d:true"]);
		expect(`c con P phu: ${vt(c)?.secondaryDepartmentIds.includes(p)}`).toBe(
			"c con P phu: false",
		);
		expect(`d ghi de: ${vt(d)?.managerOverrideId === quanLy}`).toBe(
			"d ghi de: true",
		);
		const pbQ = [
			...sau.chuaXep,
			...sau.divisions.flatMap((x) => x.departments),
		].find((x) => x.id === q);
		expect(`Q con b: ${pbQ?.people.some((n) => n.id === b && n.primary)}`).toBe(
			"Q con b: false",
		);

		const e = await nguoiMoi("tn-e");
		const f = await nguoiMoi("tn-f");
		const roi = await nguoiMoi("tn-roi");
		await roiWorkspace(roi);
		const anh = async () =>
			JSON.stringify(
				await db.orgPlacement.findMany({
					where: { userId: { in: [e, f, roi] } },
					orderBy: { userId: "asc" },
				}),
			);
		for (const [nhan, ids, cau] of [
			["co nguoi da roi", [e, f, roi], T.khongPhaiThanhVien(roi)],
			["co id rac", [e, "khong-ai"], T.khongPhaiThanhVien("khong-ai")],
		] as const) {
			const truoc = await anh();
			const tra = await goi("org.addPeople", {
				departmentId: p,
				userIds: [...ids],
			});
			expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(
				`${nhan}: HTTP 400 ${cau}`,
			);
			const sauLo = await anh();
			expect(
				`${nhan}: ${sauLo === truoc ? "khong ghi gi" : "lo co nguoi da roi van ghi"}`,
			).toBe(`${nhan}: khong ghi gi`);
		}
	});
});

describe("quyen-moi", () => {
	test("quyen-moi: hai thu tuc ghi moi chi quan tri goi duoc, va co trong router sinh", async () => {
		const bp = await tao("org.createDivision", { name: ma("qm-bp") }, "bp");
		const pb = await pbMoi("qm-pb");
		const n = await nguoiMoi("qm-n");
		const goiCa = async (ai: "quan" | "thuong") => [
			(
				await goi(
					"org.attachDepartments",
					{ divisionId: bp, departmentIds: [pb] },
					ai,
				)
			).status,
			(await goi("org.addPeople", { departmentId: pb, userIds: [n] }, ai))
				.status,
		];
		expect(`thuong: ${(await goiCa("thuong")).join(",")}`).toBe(
			"thuong: 403,403",
		);
		expect(`quan: ${(await goiCa("quan")).join(",")}`).toBe("quan: 200,200");
		const nguon = readFileSync(
			join(import.meta.dir, "../src/generated/server.ts"),
			"utf8",
		);
		const org = nguon.slice(nguon.indexOf("org: t.router("));
		for (const ten of ["attachDepartments", "addPeople"])
			expect(
				`${ten} trong router: ${new RegExp(`^ {4}${ten}: publicProcedure`, "m").test(org)}`,
			).toBe(`${ten} trong router: true`);
	});
});

describe("o-so", () => {
	test("o-so: X, M, K va hai danh sach bang phep dem doc lap bang Prisma", async () => {
		const bp = await tao("org.createDivision", { name: ma("os-bp") }, "bp");
		const coTruong = await pbMoi("os-co", bp);
		await pbMoi("os-khong", bp);
		await pbMoi("os-chua-xep");
		const t = await nguoiMoi("os-t");
		ok(await datViTri(t, coTruong), "t vao");
		ok(
			await goi("org.setHead", { kind: "department", id: coTruong, userId: t }),
			"t truong",
		);
		await nguoiMoi("os-chua-1");
		await nguoiMoi("os-chua-2");
		const roi = await nguoiMoi("os-roi");
		ok(await datViTri(roi, coTruong), "roi vao");
		await roiWorkspace(roi);

		const members = await db.member.findMany({
			where: { organizationId: "workspace" },
			select: { userId: true },
		});
		const conHieuLuc = new Set(members.map((m) => m.userId));
		const placements = await db.orgPlacement.findMany({
			select: {
				userId: true,
				primaryDepartment: { select: { archivedAt: true } },
			},
		});
		const coPhongBan = new Set(
			placements
				.filter(
					(p) =>
						conHieuLuc.has(p.userId) &&
						p.primaryDepartment !== null &&
						p.primaryDepartment.archivedAt === null,
				)
				.map((p) => p.userId),
		);
		const phongBan = await db.department.findMany({
			where: { archivedAt: null },
			select: {
				id: true,
				headUserId: true,
				primaryOf: { select: { userId: true } },
				secondaryMembers: { select: { userId: true } },
			},
		});
		const khongTruong = phongBan
			.filter((p) => {
				const h = p.headUserId;
				if (!h || !conHieuLuc.has(h)) return true;
				return ![...p.primaryOf, ...p.secondaryMembers].some(
					(x) => x.userId === h,
				);
			})
			.map((p) => p.id)
			.sort();

		const c = await cay();
		const M = conHieuLuc.size;
		const X = coPhongBan.size;
		expect({
			m: c.coverage.members,
			x: c.coverage.withPrimary,
			k: c.coverage.departmentsWithoutHead,
		}).toEqual({ m: M, x: X, k: khongTruong.length });
		expect(c.chuaCoPhongBan.map((n) => n.id).sort()).toEqual(
			[...conHieuLuc].filter((id) => !coPhongBan.has(id)).sort(),
		);
		const khongTruongCay = [
			...c.chuaXep,
			...c.divisions.flatMap((d) => d.departments),
		]
			.filter((p) => p.head === null)
			.map((p) => p.id)
			.sort();
		expect(khongTruongCay).toEqual(khongTruong);
	});
});
