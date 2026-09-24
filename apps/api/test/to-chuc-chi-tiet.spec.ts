import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import type { ImportApplyOutput } from "../src/to-chuc/to-chuc.contracts";
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

describe("nhap-moi", () => {
	test("nhap-moi: newNames bang dung tap don vi ma luot ghi tao ra, bo trung chu hoa thuong", async () => {
		const bpCu = await tao(
			"org.createDivision",
			{ name: ma("nm-kd") },
			"bp cu",
		);
		const c0 = await cay();
		const tenBpCu = c0.divisions.find((d) => d.id === bpCu)?.name ?? "";
		const [a, b, c] = [
			await nguoiMoi("nm-a"),
			await nguoiMoi("nm-b"),
			await nguoiMoi("nm-c"),
		];
		const pbMoi1 = ma("nm-pb1");
		const pbMoi2 = ma("nm-pb2");
		const bpMoi = ma("nm-bp-moi");
		const chu = [
			`${a}@thu.test\t${pbMoi1}\t${tenBpCu.toLocaleUpperCase("vi")}\t`,
			`${b}@thu.test\t${pbMoi2}\t${bpMoi}\t`,
			`${c}@thu.test\t${pbMoi2.toLocaleUpperCase("vi")}\t${bpMoi}\t`,
		].join("\n");
		const xem = ok<{
			newNames: { departments: string[]; divisions: string[] };
		}>(await goi("org.previewImport", { text: chu }), "xem");
		const tenTruoc = (t: typeof c0) =>
			new Set([
				...t.divisions.map((d) => d.name),
				...t.chuaXep.map((d) => d.name),
				...t.divisions.flatMap((d) => d.departments.map((p) => p.name)),
			]);
		const truoc = tenTruoc(await cay());
		const ghi = ok<{
			newNames?: { departments: string[]; divisions: string[] };
		}>(await goi("org.applyImport", { text: chu, traTen: true }), "ghi");
		const sau = await cay();
		const moiPb = [
			...sau.chuaXep,
			...sau.divisions.flatMap((d) => d.departments),
		]
			.map((d) => d.name)
			.filter((t) => !truoc.has(t))
			.sort();
		const moiBp = sau.divisions
			.map((d) => d.name)
			.filter((t) => !truoc.has(t))
			.sort();
		expect({
			pb: [...xem.newNames.departments].sort(),
			bp: [...xem.newNames.divisions].sort(),
		}).toEqual({ pb: moiPb, bp: moiBp });
		expect(`so pb moi ${moiPb.length}, bp moi ${moiBp.length}`).toBe(
			"so pb moi 2, bp moi 1",
		);
		expect({
			pb: [...(ghi.newNames?.departments ?? [])].sort(),
			bp: [...(ghi.newNames?.divisions ?? [])].sort(),
		}).toEqual({ pb: moiPb, bp: moiBp });
		const d = await nguoiMoi("nm-d");
		const khongXin = ok<ImportApplyOutput>(
			await goi("org.applyImport", {
				text: `${d}@thu.test\t${pbMoi1}\t${tenBpCu}\t`,
			}),
			"ghi khong xin ten",
		);
		expect(Object.keys(khongXin).sort()).toEqual([
			"newDepartments",
			"newDivisions",
			"written",
		]);
	});

	test("nhap-moi: moi dong hong mang dung cau cua cot thieu, chuoi nguyen van", async () => {
		const a = await nguoiMoi("nc-a");
		const b = await nguoiMoi("nc-b");
		const chu = [
			`\t${ma("nc-pb")}\t\t`,
			`${a}@thu.test\t\t${ma("nc-bp")}\t`,
			`${b}@thu.test\t${ma("nc-pb2")}\t\tbộ phận`,
		].join("\n");
		const xem = ok<{ rows: { line: number; error: string | null }[] }>(
			await goi("org.previewImport", { text: chu }),
			"xem",
		);
		expect(xem.rows.map((r) => [r.line, r.error])).toEqual([
			[1, "Thiếu email"],
			[2, "Thiếu phòng ban"],
			[
				3,
				"Trưởng bộ phận cần cột bộ phận, hoặc phòng ban đã thuộc một bộ phận",
			],
		]);
	});
});

describe("truong-api", () => {
	test("truong-api: dat truong phong ban roi doc cay dung nguoi, nguoi ngoai phong ban bi tu choi va cay khong doi", async () => {
		const pb = await pbMoi("ta-pb");
		const trong = await nguoiMoi("ta-trong");
		const ngoai = await nguoiMoi("ta-ngoai");
		ok(await datViTri(trong, pb), "xep nguoi");
		ok(
			await goi("org.setHead", { kind: "department", id: pb, userId: trong }),
			"dat truong",
		);
		const doc = async () =>
			(await cay()).chuaXep.find((d) => d.id === pb)?.head?.id ?? null;
		expect(await doc()).toBe(trong);

		const truoc = JSON.stringify(await cay());
		const tra = await goi("org.setHead", {
			kind: "department",
			id: pb,
			userId: ngoai,
		});
		expect(`HTTP ${tra.status} ${tra.loi}`).toBe(
			`HTTP 400 ${T.truongNgoaiPhongBan}`,
		);
		expect(JSON.stringify(await cay()) === truoc ? "" : "cay doi").toBe("");
	});
});

describe("sap-api", () => {
	test("sap-api: sap bo phan va phong ban roi doc lai dung thu tu, day thieu mot bo phan bi tu choi", async () => {
		const a = await tao("org.createDivision", { name: ma("sa-a") }, "bp a");
		const b = await tao("org.createDivision", { name: ma("sa-b") }, "bp b");
		const khac = (await cay()).divisions
			.map((d) => d.id)
			.filter((id) => id !== a && id !== b);
		ok(
			await goi("org.reorderDivisions", { ids: [b, ...khac, a] }),
			"sap bo phan",
		);
		const thuTu = (await cay()).divisions.map((d) => d.id);
		expect(thuTu).toEqual([b, ...khac, a]);

		const p1 = await pbMoi("sa-p1", a);
		const p2 = await pbMoi("sa-p2", a);
		const p3 = await pbMoi("sa-p3", a);
		ok(
			await goi("org.moveDepartment", { id: p3, divisionId: a, index: 0 }),
			"sap phong ban",
		);
		expect(await thuTuTrong(a)).toEqual([p3, p1, p2]);

		const tra = await goi("org.reorderDivisions", { ids: [a, ...khac] });
		expect(`HTTP ${tra.status} ${tra.loi}`).toBe(
			`HTTP 400 ${T.thuTuBoPhanLech}`,
		);
		expect((await cay()).divisions.map((d) => d.id)).toEqual([b, ...khac, a]);
	});
});
