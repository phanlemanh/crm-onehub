import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ttc${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
let dem = 0;
function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

type TraLoi = { status: number; data: unknown; loi: string };
type Ai = "quan" | "thuong" | "chu";
type Phien = { nguoi: string; cookie: string; token: string };

let app: INestApplication;
const phien: Record<Ai, Phien> = {
	quan: { nguoi: "", cookie: "", token: "" },
	thuong: { nguoi: "", cookie: "", token: "" },
	chu: { nguoi: "", cookie: "", token: "" },
};

async function goi(
	thuTuc: string,
	vao: unknown,
	ai: Ai = "quan",
): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", phien[ai].cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function doc<T>(thuTuc: string, ai: Ai = "quan"): Promise<T> {
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/${thuTuc}`)
		.set("cookie", phien[ai].cookie);
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as T;
}

function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

const cay = () => doc<TreeOutput>("org.tree");

async function tao(
	thuTuc: string,
	vao: unknown,
	nhan: string,
): Promise<string> {
	return ok<{ id: string }>(await goi(thuTuc, vao), nhan).id;
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
	for (const [khoa, vai] of [
		["quan", "admin"],
		["thuong", "member"],
		["chu", "owner"],
	] as const) {
		const id = ma(khoa);
		await gieoThanhVien(id, vai);
		const moi = await mintPhien(id);
		phien[khoa] = { nguoi: id, cookie: moi.cookie, token: moi.token };
	}
});

afterAll(async () => {
	await app.close();
	await db.orgSecondaryDepartment.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.department.updateMany({
		where: { name: { startsWith: TIEN_TO } },
		data: { headUserId: null, divisionId: null },
	});
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
});

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

async function nguoiMoi(
	ten: string,
	vai: "member" | "admin" | "owner" = "member",
): Promise<string> {
	const id = ma(ten);
	await gieoThanhVien(id, vai);
	return id;
}

async function datViTri(
	userId: string,
	primaryDepartmentId: string | null,
	secondaryDepartmentIds: string[] = [],
	managerUserId: string | null = null,
): Promise<TraLoi> {
	return goi("org.setPlacement", {
		userId,
		primaryDepartmentId,
		secondaryDepartmentIds,
		managerUserId,
	});
}

const pbMoi = (ten: string, divisionId: string | null = null) =>
	tao("org.createDepartment", { name: ma(ten), divisionId }, `tao ${ten}`);

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
