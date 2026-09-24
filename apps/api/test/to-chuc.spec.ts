import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { WorkspaceService } from "../src/workspace/workspace.service";
import {
	cay,
	datViTri,
	doc,
	dungSan,
	goi,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	TIEN_TO,
	tao,
} from "./to-chuc-san";

dungSan();

describe("du-lieu-cu", () => {
	test("du-lieu-cu: phong ban khong divisionId nam o chuaXep theo position, da luu tru chi o archived", async () => {
		const ids: string[] = [];
		for (const ten of ["D", "A", "C", "B"]) {
			ids.push(
				await tao(
					"onboarding.createDepartment",
					{ name: ma(ten) },
					`tao ${ten}`,
				),
			);
		}
		const luu = await tao(
			"onboarding.createDepartment",
			{ name: ma("luu") },
			"tao luu",
		);
		ok(await goi("onboarding.archiveDepartment", { id: luu }), "luu tru");

		const c1 = await cay();
		const thuTu = c1.chuaXep.map((d) => d.id).filter((id) => ids.includes(id));
		expect(`chuaXep: ${thuTu.length} phong ban`).toBe("chuaXep: 4 phong ban");
		expect(thuTu).toEqual(ids);
		expect(
			`luu tru trong chuaXep ${c1.chuaXep.some((d) => d.id === luu)}`,
		).toBe("luu tru trong chuaXep false");
		expect(
			`luu tru trong archived ${c1.archived.departments.some((d) => d.id === luu)}`,
		).toBe("luu tru trong archived true");

		const bp = await tao(
			"org.createDivision",
			{ name: ma("bp") },
			"tao bo phan",
		);
		ok(
			await goi("org.moveDepartment", { id: ids[0], divisionId: bp, index: 0 }),
			"chuyen",
		);
		const c2 = await cay();
		expect(
			c2.chuaXep.map((d) => d.id).filter((id) => ids.includes(id)).length,
		).toBe(3);
	});
});

type Buoc = {
	boPhan: { id: string; name: string; phongBan: string[] }[];
	chuaXep: string[];
};

function chieu(c: TreeOutput, bpIds: string[], pbIds: string[]): Buoc {
	return {
		boPhan: c.divisions
			.filter((b) => bpIds.includes(b.id))
			.map((b) => ({
				id: b.id,
				name: b.name,
				phongBan: b.departments
					.map((d) => d.id)
					.filter((id) => pbIds.includes(id)),
			})),
		chuaXep: c.chuaXep.map((d) => d.id).filter((id) => pbIds.includes(id)),
	};
}

describe("vong-doi-don-vi", () => {
	test("vong-doi-don-vi: tao, doi ten, sap, them, chuyen — cay khop tung buoc; ten sai bi tu choi", async () => {
		const tenA = ma("A");
		const tenB = ma("B");
		const a = await tao("org.createDivision", { name: tenA }, "tao A");
		const b = await tao("org.createDivision", { name: tenB }, "tao B");
		const bp = [a, b];
		const ky: Buoc = {
			boPhan: [
				{ id: a, name: tenA, phongBan: [] },
				{ id: b, name: tenB, phongBan: [] },
			],
			chuaXep: [],
		};
		const pb: string[] = [];
		const soVoi = async (nhan: string) => {
			expect({ nhan, ...chieu(await cay(), bp, pb) }).toEqual({ nhan, ...ky });
		};
		await soVoi("sau khi tao");

		const tenA2 = ma("A2");
		ok(await goi("org.renameDivision", { id: a, name: tenA2 }), "doi ten A");
		ky.boPhan[0] = { id: a, name: tenA2, phongBan: [] };
		await soVoi("sau khi doi ten");

		ok(await goi("org.reorderDivisions", { ids: [b, a] }), "sap");
		ky.boPhan.reverse();
		await soVoi("sau khi sap");

		const tenP1 = ma("P1");
		for (const ten of [tenP1, ma("P2"), ma("P3")]) {
			pb.push(
				await tao("org.createDepartment", { name: ten, divisionId: a }, ten),
			);
		}
		ky.boPhan[1] = { id: a, name: tenA2, phongBan: [...pb] };
		await soVoi("sau khi them phong ban");

		ok(
			await goi("org.moveDepartment", { id: pb[1], divisionId: b, index: 0 }),
			"chuyen P2",
		);
		ky.boPhan[0] = { id: b, name: tenB, phongBan: [pb[1] as string] };
		ky.boPhan[1] = {
			id: a,
			name: tenA2,
			phongBan: [pb[0] as string, pb[2] as string],
		};
		await soVoi("sau khi chuyen P2");

		ok(
			await goi("org.moveDepartment", {
				id: pb[2],
				divisionId: null,
				index: 0,
			}),
			"ve chua xep",
		);
		ky.boPhan[1] = { id: a, name: tenA2, phongBan: [pb[0] as string] };
		ky.chuaXep = [pb[2] as string];
		await soVoi("sau khi ve chua xep");

		const TU_CHOI: [string, unknown, string][] = [
			["org.createDivision", { name: "   " }, "Tên không được để trống."],
			["org.createDivision", { name: "x".repeat(81) }, "Tên dài quá 80 ký tự."],
			[
				"org.createDivision",
				{ name: tenB.toUpperCase() },
				`Đã có «${tenB.toUpperCase()}» ở cấp này.`,
			],
			[
				"org.createDepartment",
				{ name: "   ", divisionId: null },
				"Tên không được để trống.",
			],
			[
				"org.createDepartment",
				{ name: "x".repeat(81), divisionId: null },
				"Tên dài quá 80 ký tự.",
			],
			[
				"org.createDepartment",
				{ name: tenP1.toUpperCase(), divisionId: null },
				`Đã có «${tenP1.toUpperCase()}» ở cấp này.`,
			],
		];
		for (const [thuTuc, vao, cau] of TU_CHOI) {
			const truoc = chieu(await cay(), bp, pb);
			const r = await goi(thuTuc, vao);
			expect(`${thuTuc}: HTTP ${r.status} ${r.loi}`).toBe(
				`${thuTuc}: HTTP 400 ${cau}`,
			);
			expect(chieu(await cay(), bp, pb)).toEqual(truoc);
		}

		const dai = `${TIEN_TO}-`.padEnd(80, "z");
		const daiId = await tao(
			"org.createDivision",
			{ name: dai },
			"ten 80 ky tu",
		);
		ok(await goi("org.archiveDivision", { id: daiId }), "luu tru ten dai");
		ok(await goi("onboarding.archiveDepartment", { id: pb[0] }), "luu tru P1");
		await tao(
			"org.createDepartment",
			{ name: tenP1, divisionId: null },
			"tao lai ten da luu tru",
		);
	});
});

describe("do-phu", () => {
	test("do-phu: phong ban moi khong truong lam tang dem chua co truong dung so", async () => {
		const truoc = (await cay()).coverage.departmentsWithoutHead;
		await tao(
			"org.createDepartment",
			{ name: ma("khong-truong-1"), divisionId: null },
			"pb 1",
		);
		await tao(
			"org.createDepartment",
			{ name: ma("khong-truong-2"), divisionId: null },
			"pb 2",
		);
		const sau = (await cay()).coverage.departmentsWithoutHead;
		expect(`chua co truong tang ${sau - truoc}`).toBe("chua co truong tang 2");
	});
});

describe("vi-tri", () => {
	test("vi-tri: mot phong ban chinh, phu khong trung chinh, nguoi chi co phu nam o chuaCoPhongBan", async () => {
		const a = await nguoiMoi("A");
		const b = await nguoiMoi("B");
		const [p1, p2, p3] = [
			await pbMoi("P1"),
			await pbMoi("P2"),
			await pbMoi("P3"),
		];
		const viTri = async (nhan: string) => {
			const c = await cay();
			const nguoi = c.people.find((p) => p.id === a);
			const soHang = await db.orgPlacement.count({ where: { userId: a } });
			return {
				nhan,
				chinh: nguoi?.primaryDepartmentId ?? null,
				phu: [...(nguoi?.secondaryDepartmentIds ?? [])].sort(),
				soHang,
			};
		};

		ok(await datViTri(a, p1), "chinh P1");
		expect(await viTri("chinh P1")).toEqual({
			nhan: "chinh P1",
			chinh: p1,
			phu: [],
			soHang: 1,
		});
		ok(await datViTri(a, p2), "chinh P2");
		expect(await viTri("chinh P2")).toEqual({
			nhan: "chinh P2",
			chinh: p2,
			phu: [],
			soHang: 1,
		});
		ok(await datViTri(a, p2, [p3, p1]), "phu P3 P1");
		expect(await viTri("phu P3 P1")).toEqual({
			nhan: "phu P3 P1",
			chinh: p2,
			phu: [p1, p3].sort(),
			soHang: 1,
		});
		const trung = await datViTri(a, p2, [p2, p1]);
		expect(`phu trung chinh: HTTP ${trung.status} ${trung.loi}`).toBe(
			"phu trung chinh: HTTP 400 Phòng ban phụ không được trùng phòng ban chính.",
		);
		ok(await datViTri(a, p2, [p1]), "bo phu P3");
		expect(await viTri("bo phu P3")).toEqual({
			nhan: "bo phu P3",
			chinh: p2,
			phu: [p1],
			soHang: 1,
		});

		ok(await datViTri(b, null, [p3]), "B chi co phu");
		const c = await cay();
		expect(
			`B trong chuaCoPhongBan ${c.chuaCoPhongBan.some((n) => n.id === b)}`,
		).toBe("B trong chuaCoPhongBan true");
		const nut = (pb: string) =>
			c.chuaXep.find((d) => d.id === pb)?.people.find((n) => n.id === a)
				?.primary ?? null;
		expect({ duoiP2: nut(p2), duoiP1: nut(p1) }).toEqual({
			duoiP2: true,
			duoiP1: false,
		});
	});
});

describe("truong", () => {
	test("truong: nam ca dat truong, mot truong moi don vi, truong khong duoc them quyen", async () => {
		const trong = await nguoiMoi("trong");
		const ngoai = await nguoiMoi("ngoai");
		const daRoi = await nguoiMoi("da-roi");
		const bp = await tao("org.createDivision", { name: ma("bp") }, "tao bp");
		const pb = await pbMoi("pb", bp);
		ok(await datViTri(trong, pb), "trong vao pb");
		ok(await datViTri(ngoai, null), "ngoai");
		await db.member.delete({
			where: {
				organizationId_userId: { organizationId: "workspace", userId: daRoi },
			},
		});

		const MA_TRAN: [string, unknown, string][] = [
			[
				"pb, nguoi trong",
				{ kind: "department", id: pb, userId: trong },
				"HTTP 200 ",
			],
			[
				"pb, nguoi ngoai",
				{ kind: "department", id: pb, userId: ngoai },
				"HTTP 400 Trưởng phòng ban phải là người của phòng ban đó.",
			],
			[
				"pb, bo truong",
				{ kind: "department", id: pb, userId: null },
				"HTTP 200 ",
			],
			[
				"bp, thanh vien bat ky",
				{ kind: "division", id: bp, userId: ngoai },
				"HTTP 200 ",
			],
			[
				"pb, nguoi da roi",
				{ kind: "department", id: pb, userId: daRoi },
				`HTTP 400 Người ${daRoi} không phải thành viên đang hoạt động.`,
			],
		];
		for (const [nhan, vao, ky] of MA_TRAN) {
			const r = await goi("org.setHead", vao);
			expect(`${nhan}: HTTP ${r.status} ${r.loi}`).toBe(`${nhan}: ${ky}`);
		}

		const khac = await nguoiMoi("khac");
		ok(await datViTri(khac, pb), "khac vao pb");
		ok(
			await goi("org.setHead", { kind: "department", id: pb, userId: trong }),
			"truong 1",
		);
		ok(
			await goi("org.setHead", { kind: "department", id: pb, userId: khac }),
			"truong 2",
		);
		const c = await cay();
		const nut = c.divisions
			.find((d) => d.id === bp)
			?.departments.find((d) => d.id === pb);
		expect(`truong pb: ${nut?.head?.id}`).toBe(`truong pb: ${khac}`);
		expect(c.divisions.find((d) => d.id === bp)?.head?.id).toBe(ngoai);

		ok(await datViTri(phien.thuong.nguoi, pb), "thuong vao pb");
		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pb,
				userId: phien.thuong.nguoi,
			}),
			"thuong lam truong",
		);
		const GHI: [string, () => unknown][] = [
			["org.setHead", () => ({ kind: "department", id: pb, userId: khac })],
			[
				"org.applyImport",
				() => ({ text: `${khac}@thu.test\t${nut?.name}\t\t` }),
			],
			["org.createDivision", () => ({ name: ma("bp-thuong") })],
			[
				"org.setPlacement",
				() => ({
					userId: khac,
					primaryDepartmentId: pb,
					secondaryDepartmentIds: [],
					managerUserId: null,
				}),
			],
		];
		for (const [thuTuc, vao] of GHI) {
			const r = await goi(thuTuc, vao(), "thuong");
			expect(`${thuTuc} boi truong thuong: HTTP ${r.status}`).toBe(
				`${thuTuc} boi truong thuong: HTTP 403`,
			);
		}
		for (const [thuTuc, vao] of GHI) {
			ok(await goi(thuTuc, vao(), "quan"), `${thuTuc} boi quan tri`);
		}
	});

	test("truong: truong-roi-phong-ban — doi phong ban chinh sang cho khac thi phong ban cu chua co truong", async () => {
		const t = await nguoiMoi("truong-roi");
		const p1 = await pbMoi("roi-1");
		const p2 = await pbMoi("roi-2");
		ok(await datViTri(t, p1), "t vao p1");
		ok(
			await goi("org.setHead", { kind: "department", id: p1, userId: t }),
			"t truong p1",
		);
		const truoc = (await cay()).coverage.departmentsWithoutHead;
		ok(await datViTri(t, p2), "t sang p2");
		const c = await cay();
		expect(
			`p1 head ${c.chuaXep.find((d) => d.id === p1)?.head?.id ?? null}`,
		).toBe("p1 head null");
		expect(
			`chua co truong tang ${c.coverage.departmentsWithoutHead - truoc}`,
		).toBe("chua co truong tang 1");
	});
});

describe("quan-ly", () => {
	test("quan-ly: bay dong cua chuoi suy, doi truong thi quan ly doi theo, bo ghi de ve phep suy", async () => {
		const ten = [
			"thuong",
			"truongPb",
			"truongBp",
			"oPbKhongTruong",
			"coChonTay",
			"chonTayToi",
			"khongPhongBan",
			"chonTayDaRoi",
			"daRoi",
		] as const;
		const id = Object.fromEntries(
			await Promise.all(ten.map(async (t) => [t, await nguoiMoi(t)] as const)),
		) as Record<(typeof ten)[number], string>;
		const bp = await tao("org.createDivision", { name: ma("bp-ql") }, "bp");
		const pb0 = await pbMoi("pb0", bp);
		const pb1 = await pbMoi("pb1", bp);
		const pb2 = await pbMoi("pb2", bp);
		ok(await datViTri(id.truongBp, pb0), "truongBp");
		ok(
			await goi("org.setHead", {
				kind: "division",
				id: bp,
				userId: id.truongBp,
			}),
			"truong bp",
		);
		for (const n of ["truongPb", "thuong"] as const)
			ok(await datViTri(id[n], pb1), n);
		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pb1,
				userId: id.truongPb,
			}),
			"truong pb1",
		);
		ok(await datViTri(id.oPbKhongTruong, pb2), "pb2");
		ok(await datViTri(id.coChonTay, pb1, [], id.chonTayToi), "co chon tay");
		ok(await datViTri(id.chonTayDaRoi, pb1, [], id.daRoi), "chon tay da roi");
		await db.member.delete({
			where: {
				organizationId_userId: {
					organizationId: "workspace",
					userId: id.daRoi,
				},
			},
		});

		const BANG: [(typeof ten)[number], (typeof ten)[number] | null, string][] =
			[
				["thuong", "truongPb", "truong-phong-ban"],
				["truongPb", "truongBp", "truong-bo-phan"],
				["truongBp", null, "khong-co"],
				["oPbKhongTruong", "truongBp", "truong-bo-phan"],
				["coChonTay", "chonTayToi", "chon-tay"],
				["khongPhongBan", null, "khong-co"],
				["chonTayDaRoi", "truongPb", "truong-phong-ban"],
			];
		const docQl = async () => {
			const c = await cay();
			return (n: (typeof ten)[number]) => {
				const p = c.people.find((x) => x.id === id[n]);
				return `${n}: ${p?.manager?.id ?? null} ${p?.managerSource}`;
			};
		};
		const ql = await docQl();
		for (const [n, quanLy, nguon] of BANG) {
			expect(ql(n)).toBe(
				`${n}: ${quanLy === null ? null : id[quanLy]} ${nguon}`,
			);
		}

		const minh = await datViTri(id.thuong, pb1, [], id.thuong);
		expect(`chon tay chinh minh: HTTP ${minh.status} ${minh.loi}`).toBe(
			"chon tay chinh minh: HTTP 400 Quản lý trực tiếp phải là người khác.",
		);

		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pb1,
				userId: id.thuong,
			}),
			"doi truong pb1",
		);
		const ql2 = await docQl();
		expect(ql2("truongPb")).toBe(`truongPb: ${id.thuong} truong-phong-ban`);
		expect(ql2("coChonTay")).toBe(`coChonTay: ${id.chonTayToi} chon-tay`);
		ok(await datViTri(id.coChonTay, pb1, [], null), "bo ghi de");
		expect((await docQl())("coChonTay")).toBe(
			`coChonTay: ${id.thuong} truong-phong-ban`,
		);
	});
});

const agent = {
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

describe("nguoi-roi", () => {
	test("nguoi-roi: go khoi workspace thi roi cay, dem, truong va ghi de ve phep suy", async () => {
		const r = await nguoiMoi("R");
		const s = await nguoiMoi("S");
		const t = await nguoiMoi("T");
		const p1 = await pbMoi("roi-p1");
		const p2 = await pbMoi("roi-p2");
		ok(await datViTri(r, p1), "R vao p1");
		ok(await datViTri(t, p1), "T vao p1");
		ok(await datViTri(s, p2, [], r), "S ghi de R");
		ok(
			await goi("org.setHead", { kind: "department", id: p1, userId: r }),
			"R truong p1",
		);

		const truoc = await cay();
		const nhin = (c: TreeOutput) => ({
			rTrongCay:
				c.people.some((p) => p.id === r) ||
				c.chuaXep.some((d) => d.people.some((n) => n.id === r)),
			p1Head: c.chuaXep.find((d) => d.id === p1)?.head?.id ?? null,
			sQuanLy: c.people.find((p) => p.id === s)?.manager?.id ?? null,
			tQuanLy: c.people.find((p) => p.id === t)?.manager?.id ?? null,
		});
		expect(nhin(truoc)).toEqual({
			rTrongCay: true,
			p1Head: r,
			sQuanLy: r,
			tQuanLy: r,
		});

		const hang = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: "workspace", userId: r },
			},
			select: { id: true },
		});
		await new WorkspaceService(db, agent).removeMember(phien.quan.nguoi, {
			memberId: hang?.id ?? "",
		});

		const sau = await cay();
		expect(nhin(sau)).toEqual({
			rTrongCay: false,
			p1Head: null,
			sQuanLy: null,
			tQuanLy: null,
		});
		expect(sau.people.find((p) => p.id === s)?.managerSource).not.toBe(
			"chon-tay",
		);
		expect({
			members: sau.coverage.members - truoc.coverage.members,
			khongTruong:
				sau.coverage.departmentsWithoutHead -
				truoc.coverage.departmentsWithoutHead,
		}).toEqual({ members: -1, khongTruong: 1 });
	});
});

async function demDocLap() {
	const [x] = await db.$queryRaw<{ m: bigint; x: bigint; k: bigint }[]>`
		SELECT
			(SELECT count(*) FROM "member" WHERE "organizationId" = 'workspace') AS m,
			(SELECT count(*) FROM "member" mb
				JOIN "orgPlacement" p ON p."userId" = mb."userId"
				JOIN "department" d ON d.id = p."primaryDepartmentId"
				WHERE mb."organizationId" = 'workspace' AND d."archivedAt" IS NULL) AS x,
			(SELECT count(*) FROM "department" d WHERE d."archivedAt" IS NULL AND NOT EXISTS (
				SELECT 1 FROM "member" mb
				WHERE mb."userId" = d."headUserId" AND mb."organizationId" = 'workspace'
				AND (
					EXISTS (SELECT 1 FROM "orgPlacement" p WHERE p."userId" = d."headUserId" AND p."primaryDepartmentId" = d.id)
					OR EXISTS (SELECT 1 FROM "orgSecondaryDepartment" s WHERE s."userId" = d."headUserId" AND s."departmentId" = d.id)
				))) AS k`;
	return {
		members: Number(x?.m),
		withPrimary: Number(x?.x),
		departmentsWithoutHead: Number(x?.k),
	};
}

describe("do-phu", () => {
	test("do-phu: dong do phu bang phep dem doc lap tren cung du lieu", async () => {
		const truoc = (await cay()).coverage;
		const bp = await tao("org.createDivision", { name: ma("bp-dp") }, "bp");
		const pbCoTruong1 = await pbMoi("dp-1", bp);
		const pbCoTruong2 = await pbMoi("dp-2", bp);
		const pbTruongRoi = await pbMoi("dp-3", bp);
		const pbKhongTruong = await pbMoi("dp-4", bp);
		const pbLuu = await pbMoi("dp-5", bp);
		const nguoi = await Promise.all(
			Array.from({ length: 10 }, (_, i) => nguoiMoi(`dp-n${i}`)),
		);
		const roi = await nguoiMoi("dp-roi");
		const song = [pbCoTruong1, pbCoTruong2, pbTruongRoi, pbKhongTruong];
		for (const [i, n] of nguoi.slice(0, 7).entries()) {
			ok(await datViTri(n, song[i % 4] as string), `gan ${i}`);
		}
		ok(await datViTri(nguoi[7] as string, null, [pbCoTruong1]), "chi phu");
		ok(await datViTri(nguoi[8] as string, pbLuu), "chinh sap luu tru");
		ok(await datViTri(roi, pbTruongRoi), "nguoi se roi");
		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pbCoTruong1,
				userId: nguoi[0],
			}),
			"truong 1",
		);
		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pbCoTruong2,
				userId: nguoi[1],
			}),
			"truong 2",
		);
		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pbTruongRoi,
				userId: roi,
			}),
			"truong 3",
		);
		await db.department.update({
			where: { id: pbLuu },
			data: { archivedAt: new Date() },
		});
		await db.member.delete({
			where: {
				organizationId_userId: { organizationId: "workspace", userId: roi },
			},
		});

		const c = await cay();
		expect(c.coverage).toEqual(await demDocLap());
		expect({
			members: c.coverage.members - truoc.members,
			withPrimary: c.coverage.withPrimary - truoc.withPrimary,
			departmentsWithoutHead:
				c.coverage.departmentsWithoutHead - truoc.departmentsWithoutHead,
		}).toEqual({ members: 10, withPrimary: 7, departmentsWithoutHead: 2 });

		ok(await datViTri(nguoi[9] as string, pbKhongTruong), "gan nguoi khong gi");
		const c2 = await cay();
		expect(c2.coverage).toEqual(await demDocLap());
		expect(`X tang ${c2.coverage.withPrimary - c.coverage.withPrimary}`).toBe(
			"X tang 1",
		);
	});
});

type Chieu = { boPhan: Buoc["boPhan"]; chuaXep: string[]; luu: string[] };

function chieuLuu(c: TreeOutput, bpIds: string[], pbIds: string[]): Chieu {
	return {
		...chieu(c, bpIds, pbIds),
		luu: [
			...c.archived.divisions.map((d) => d.id),
			...c.archived.departments.map((d) => d.id),
		]
			.filter((id) => bpIds.includes(id) || pbIds.includes(id))
			.sort(),
	};
}

describe("luu-tru", () => {
	test("luu-tru: muoi ca luu tru, khoi phuc, xoa han", async () => {
		const bp = await tao("org.createDivision", { name: ma("lt-bp") }, "bp");
		const bpRong = await tao(
			"org.createDivision",
			{ name: ma("lt-bp-rong") },
			"bp rong",
		);
		const bpXoa = await tao(
			"org.createDivision",
			{ name: ma("lt-bp-xoa") },
			"bp xoa",
		);
		const bpChuaLuu = await tao(
			"org.createDivision",
			{ name: ma("lt-bp-chua") },
			"bp chua luu",
		);
		const pbNguoi = await pbMoi("lt-nguoi", bp);
		const pbPhu = await pbMoi("lt-phu", bp);
		const pbCuaBpRong = await pbMoi("lt-trong-bp-rong", bpRong);
		const pbBuoc = await pbMoi("lt-buoc");
		const pbNguoiRoi = await pbMoi("lt-nguoi-roi");
		const pbChuaLuu = await pbMoi("lt-chua-luu");
		const bpIds = [bp, bpRong, bpXoa, bpChuaLuu];
		const pbIds = [pbNguoi, pbPhu, pbCuaBpRong, pbBuoc, pbNguoiRoi, pbChuaLuu];

		const n1 = await nguoiMoi("lt-n1");
		const n2 = await nguoiMoi("lt-n2");
		const n3 = await nguoiMoi("lt-n3");
		const nRoi = await nguoiMoi("lt-roi");
		ok(await datViTri(n1, pbNguoi), "n1");
		ok(await datViTri(n2, pbNguoi), "n2");
		ok(await datViTri(n3, null, [pbPhu]), "n3 phu");
		ok(await datViTri(nRoi, pbNguoiRoi), "nguoi roi");
		await db.member.delete({
			where: {
				organizationId_userId: { organizationId: "workspace", userId: nRoi },
			},
		});
		const cty = await db.company.create({
			data: { name: ma("lt-cty") },
			select: { id: true },
		});
		const keHoach = await db.onboardingPlan.create({
			data: {
				companyId: cty.id,
				startedAt: new Date(),
				targetDays: 30,
				ownerId: phien.quan.nguoi,
				steps: {
					create: [
						{
							label: "buoc",
							departmentId: pbBuoc,
							dueAt: new Date(),
							position: 0,
						},
					],
				},
			},
			select: { id: true },
		});
		const viTriPhu = await db.department.findUnique({
			where: { id: pbPhu },
			select: { divisionId: true, position: true },
		});

		const tuChoi = async (
			nhan: string,
			thuTuc: string,
			id: string,
			cau: string,
		) => {
			const truoc = chieuLuu(await cay(), bpIds, pbIds);
			const r = await goi(thuTuc, { id });
			expect(`${nhan}: HTTP ${r.status} ${r.loi}`).toBe(
				`${nhan}: HTTP 400 ${cau}`,
			);
			expect(chieuLuu(await cay(), bpIds, pbIds)).toEqual(truoc);
		};

		await tuChoi(
			"1 luu tru phong ban con 2 nguoi chinh",
			"onboarding.archiveDepartment",
			pbNguoi,
			"Còn 2 người có phòng ban chính ở đây — chuyển họ trước.",
		);
		ok(
			await goi("onboarding.archiveDepartment", { id: pbPhu }),
			"2 luu tru phong ban chi con nguoi phu",
		);
		await tuChoi(
			"3 luu tru bo phan con 1 phong ban",
			"org.archiveDivision",
			bpRong,
			"Bộ phận còn 1 phòng ban — chuyển hoặc lưu trữ chúng trước.",
		);
		ok(
			await goi("onboarding.archiveDepartment", { id: pbCuaBpRong }),
			"luu tru pb cua bp rong",
		);
		ok(
			await goi("org.archiveDivision", { id: bpRong }),
			"4 luu tru bo phan chi con phong ban da luu tru",
		);
		ok(
			await goi("onboarding.restoreDepartment", { id: pbPhu }),
			"5 khoi phuc phong ban",
		);
		expect(
			await db.department.findUnique({
				where: { id: pbPhu },
				select: { divisionId: true, position: true },
			}),
		).toEqual(viTriPhu);

		ok(
			await goi("onboarding.archiveDepartment", { id: pbBuoc }),
			"luu tru pb buoc",
		);
		await tuChoi(
			"6 xoa han phong ban da luu tru con buoc",
			"onboarding.purgeDepartment",
			pbBuoc,
			"Đã được dùng nên không xoá vĩnh viễn được — lịch sử kế hoạch còn trỏ tới.",
		);
		ok(
			await goi("onboarding.archiveDepartment", { id: pbNguoiRoi }),
			"luu tru pb nguoi roi",
		);
		await tuChoi(
			"7 xoa han phong ban da luu tru con nguoi chinh",
			"onboarding.purgeDepartment",
			pbNguoiRoi,
			"Phòng ban còn người trỏ tới nên không xoá hẳn được.",
		);
		ok(await goi("org.archiveDivision", { id: bpXoa }), "luu tru bp xoa");
		ok(
			await goi("org.purgeDivision", { id: bpXoa }),
			"8 xoa han bo phan da luu tru khong con gi",
		);
		await tuChoi(
			"9 xoa han bo phan chua luu tru va rong",
			"org.purgeDivision",
			bpChuaLuu,
			"Chỉ xoá hẳn được đơn vị đã lưu trữ.",
		);
		await tuChoi(
			"10 xoa han phong ban chua luu tru va rong",
			"onboarding.purgeDepartment",
			pbChuaLuu,
			"Chỉ xoá vĩnh viễn được thứ đã lưu trữ.",
		);

		const c = await cay();
		expect({
			bpRongTrongCay: c.divisions.some((d) => d.id === bpRong),
			bpRongLuuTru: c.archived.divisions.some((d) => d.id === bpRong),
		}).toEqual({ bpRongTrongCay: false, bpRongLuuTru: true });

		await db.onboardingPlan.delete({ where: { id: keHoach.id } });
		await db.company.delete({ where: { id: cty.id } });
	});
});

function thuTucGhi(): string[] {
	const nguon = readFileSync(
		join(import.meta.dir, "../src/generated/server.ts"),
		"utf8",
	);
	const ra: string[] = [];
	let nhom = "";
	let thuTuc = "";
	for (const dong of nguon.split("\n")) {
		const r = dong.match(/^ {2}(\w+): t\.router\(/);
		if (r) nhom = r[1] as string;
		const p = dong.match(/^ {4}(\w+): publicProcedure/);
		if (p) thuTuc = p[1] as string;
		if (dong.includes(".mutation(") && nhom !== "" && thuTuc !== "") {
			ra.push(`${nhom}.${thuTuc}`);
		}
	}
	return ra
		.filter((t) => t.startsWith("org.") || /^onboarding\.\w*Department/.test(t))
		.sort();
}

async function dungDauVaoHopLe(): Promise<
	Record<string, () => Promise<unknown>>
> {
	const bpMoi = () => tao("org.createDivision", { name: ma("q-bp") }, "q bp");
	const pbTrong = () => pbMoi("q-pb");
	const pbLuu = async () => {
		const id = await pbTrong();
		ok(await goi("onboarding.archiveDepartment", { id }), "q luu pb");
		return id;
	};
	const bpLuu = async () => {
		const id = await bpMoi();
		ok(await goi("org.archiveDivision", { id }), "q luu bp");
		return id;
	};
	return {
		"org.createDivision": async () => ({ name: ma("q-tao-bp") }),
		"org.renameDivision": async () => ({
			id: await bpMoi(),
			name: ma("q-ten"),
		}),
		"org.reorderDivisions": async () => ({ ids: [await bpMoi()] }),
		"org.archiveDivision": async () => ({ id: await bpMoi() }),
		"org.restoreDivision": async () => ({ id: await bpLuu() }),
		"org.purgeDivision": async () => ({ id: await bpLuu() }),
		"org.createDepartment": async () => ({
			name: ma("q-tao-pb"),
			divisionId: null,
		}),
		"org.renameDepartment": async () => ({
			id: await pbTrong(),
			name: ma("q-ten-pb"),
		}),
		"org.moveDepartment": async () => ({
			id: await pbTrong(),
			divisionId: await bpMoi(),
			index: 0,
		}),
		"org.setHead": async () => ({
			kind: "division",
			id: await bpMoi(),
			userId: await nguoiMoi("q-truong"),
		}),
		"org.setPlacement": async () => ({
			userId: await nguoiMoi("q-vi-tri"),
			primaryDepartmentId: await pbTrong(),
			secondaryDepartmentIds: [],
			managerUserId: null,
		}),
		"org.previewImport": async () => ({
			text: `${await nguoiMoi("q-xem")}@thu.test\t${ma("q-xem-pb")}\t\t`,
		}),
		"org.applyImport": async () => ({
			text: `${await nguoiMoi("q-nhap")}@thu.test\t${ma("q-nhap-pb")}\t\t`,
		}),
		"onboarding.createDepartment": async () => ({ name: ma("q-onb-tao") }),
		"onboarding.updateDepartment": async () => ({
			id: await pbTrong(),
			name: ma("q-onb-ten"),
		}),
		"onboarding.archiveDepartment": async () => ({ id: await pbTrong() }),
		"onboarding.restoreDepartment": async () => ({ id: await pbLuu() }),
		"onboarding.purgeDepartment": async () => ({ id: await pbLuu() }),
		"onboarding.reorderDepartments": async () => ({ ids: [await pbTrong()] }),
	};
}

describe("quyen", () => {
	test("quyen: moi thu tuc ghi rut tu router — thuong FORBIDDEN, quan tri va chu khong", async () => {
		const thuTuc = thuTucGhi();
		console.log(`thu tuc ghi: ${thuTuc.length} — ${thuTuc.join(", ")}`);
		expect(thuTuc.length).toBeGreaterThan(10);
		const vao = await dungDauVaoHopLe();
		const thieu = thuTuc.filter((t) => !(t in vao));
		expect(`thieu input hop le cho ${thieu.join(", ")}`).toBe(
			"thieu input hop le cho ",
		);
		let daGui = 0;
		for (const t of thuTuc) {
			const lam = vao[t] as () => Promise<unknown>;
			const thuong = await goi(t, await lam(), "thuong");
			expect(`${t}: thuong HTTP ${thuong.status}`).toBe(
				`${t}: thuong HTTP 403`,
			);
			for (const ai of ["quan", "chu"] as const) {
				const r = await goi(t, await lam(), ai);
				expect(`${t}: ${ai} HTTP ${r.status} ${r.loi}`).toBe(
					`${t}: ${ai} HTTP 200 `,
				);
			}
			daGui += 1;
		}
		console.log(`da gui input hop le: ${daGui}/${thuTuc.length}`);
		expect(
			(await doc<{ canManage: boolean }>("org.access", "thuong")).canManage,
		).toBe(false);
		await doc("org.tree", "thuong");
	});
});
