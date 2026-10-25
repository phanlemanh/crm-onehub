import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	API_KEY_HEADER,
	auth,
	NOT_A_MEMBER,
	type WorkspaceRole,
} from "@crm/auth";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { fieldBackfillOutput } from "../src/fields/fields.contracts";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "cqt";
const THONG_DIEP_CAM =
	"Only an owner or an admin can change the team's fields.";

let dem = 0;
function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

type GiaJson =
	| string
	| number
	| boolean
	| null
	| GiaJson[]
	| { [khoa: string]: GiaJson };
type DauVao = { [khoa: string]: GiaJson };
type TraLoi = { status: number; data: unknown; loi: string };
type TruongRa = {
	id: string;
	key: string;
	label: string;
	position: number;
	archived: boolean;
};

type Loi =
	| "owner"
	| "admin"
	| "member"
	| "nonMember"
	| "memberKey"
	| "adminKey";
const dauXac = {
	owner: { header: "cookie", value: "" },
	admin: { header: "cookie", value: "" },
	member: { header: "cookie", value: "" },
	nonMember: { header: "cookie", value: "" },
	memberKey: { header: API_KEY_HEADER, value: "" },
	adminKey: { header: API_KEY_HEADER, value: "" },
} satisfies Record<Loi, { header: string; value: string }>;
const daGieo = { nguoi: [] as string[], phien: [] as string[] };

let app: INestApplication;

async function goi(ai: Loi, thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/fields.${thuTuc}`)
		.set(dauXac[ai].header, dauXac[ai].value)
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function doc(
	ai: Loi,
	thuTuc: string,
	dauVao: DauVao | undefined,
): Promise<TraLoi> {
	const q =
		dauVao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(dauVao))}`;
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/fields.${thuTuc}${q}`)
		.set(dauXac[ai].header, dauXac[ai].value);
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

async function taoTruong(ai: Loi = "owner"): Promise<TruongRa> {
	return ok<TruongRa>(
		await goi(ai, "create", {
			entity: "COMPANY",
			label: ma("Truong"),
			type: "TEXT",
		}),
		`${ai} tao truong`,
	);
}

async function hang(id: string) {
	return db.fieldDefinition.findUnique({ where: { id } });
}

type Ca = {
	thaoTac: string;
	chuanBi: () => Promise<{
		dauVao: DauVao;
		daXayRa: (tra: TraLoi) => Promise<boolean>;
	}>;
};

const BAY_THAO_TAC: Ca[] = [
	{
		thaoTac: "create",
		chuanBi: async () => {
			const label = ma("Moi");
			return {
				dauVao: { entity: "COMPANY", label, type: "TEXT" },
				daXayRa: async () =>
					(await db.fieldDefinition.count({ where: { label } })) > 0,
			};
		},
	},
	{
		thaoTac: "update",
		chuanBi: async () => {
			const t = await taoTruong();
			const moi = ma("Doi");
			return {
				dauVao: { id: t.id, data: { label: moi } },
				daXayRa: async () => (await hang(t.id))?.label === moi,
			};
		},
	},
	{
		thaoTac: "reorder",
		chuanBi: async () => {
			const a = await taoTruong();
			const b = await taoTruong();
			return {
				dauVao: { entity: "COMPANY", ids: [b.id, a.id] },
				daXayRa: async () => {
					const [ha, hb] = [await hang(a.id), await hang(b.id)];
					return (hb?.position ?? 0) < (ha?.position ?? 0);
				},
			};
		},
	},
	{
		thaoTac: "archive",
		chuanBi: async () => {
			const t = await taoTruong();
			return {
				dauVao: { id: t.id },
				daXayRa: async () => (await hang(t.id))?.archivedAt != null,
			};
		},
	},
	{
		thaoTac: "restore",
		chuanBi: async () => {
			const t = await taoTruong();
			ok(await goi("owner", "archive", { id: t.id }), "owner luu tru");
			return {
				dauVao: { id: t.id },
				daXayRa: async () => (await hang(t.id))?.archivedAt == null,
			};
		},
	},
	{
		thaoTac: "delete",
		chuanBi: async () => {
			const t = await taoTruong();
			return {
				dauVao: { id: t.id },
				daXayRa: async () => (await hang(t.id)) === null,
			};
		},
	},
	{
		thaoTac: "backfill",
		chuanBi: async () => {
			const t = await taoTruong();
			const truoc = await db.agentTask.count();
			return {
				dauVao: { id: t.id },
				daXayRa: async (tra) =>
					fieldBackfillOutput.safeParse(tra.data).success ||
					(await db.agentTask.count()) !== truoc,
			};
		},
	},
];

async function chayMaTran(
	LOI: Loi[],
	maMong: number,
	xayRaMong: boolean,
): Promise<number> {
	let soCa = 0;
	for (const loi of LOI) {
		const nhan = loi === "nonMember" ? "non-member" : loi;
		for (const ca of BAY_THAO_TAC) {
			const { dauVao, daXayRa } = await ca.chuanBi();
			const tra = await goi(loi, ca.thaoTac, dauVao);
			const thongDiep = loi === "nonMember" ? NOT_A_MEMBER : THONG_DIEP_CAM;
			const camDung = maMong === 403 ? tra.loi === thongDiep : true;
			expect(
				`${nhan} ${ca.thaoTac}: HTTP ${tra.status} thong diep ${camDung} xay ra ${await daXayRa(tra)}`,
			).toBe(
				`${nhan} ${ca.thaoTac}: HTTP ${maMong} thong diep true xay ra ${xayRaMong}`,
			);
			soCa += 1;
		}
	}
	return soCa;
}

async function moPhien(loi: Loi, vai: WorkspaceRole | null): Promise<string> {
	const id = ma(loi);
	if (vai === null) {
		const now = new Date();
		await db.user.create({
			data: {
				id,
				name: id,
				email: `${id}@thu.test`,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
		});
	} else {
		await gieoThanhVien(id, vai);
	}
	const phien = await mintPhien(id);
	dauXac[loi].value = phien.cookie;
	daGieo.nguoi.push(id);
	daGieo.phien.push(phien.token);
	return id;
}

async function moKhoa(loi: Loi, userId: string): Promise<void> {
	const khoa = await auth.api.createApiKey({
		body: { name: ma("khoa"), userId },
	});
	dauXac[loi].value = khoa.key;
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.listen(0, "127.0.0.1");

	await moPhien("owner", "owner");
	const adminId = await moPhien("admin", "admin");
	const memberId = await moPhien("member", "member");
	await moPhien("nonMember", null);
	await moKhoa("memberKey", memberId);
	await moKhoa("adminKey", adminId);
});

afterAll(async () => {
	await app.close();
	await db.agentTask.deleteMany({
		where: { kind: "field-backfill", reason: { contains: `${TIEN_TO}-` } },
	});
	await db.fieldDefinition.deleteMany({
		where: { key: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

describe("cqt-member-bi-chan", () => {
	test("cqt-member-bi-chan: ba loi x bay thao tac deu 403 va khong doi du lieu", async () => {
		const LOI: Loi[] = ["member", "memberKey", "nonMember"];
		const soCa = await chayMaTran(LOI, 403, false);
		expect(`so ca ${soCa}`).toBe(`so ca ${LOI.length * BAY_THAO_TAC.length}`);
	});
});

describe("cqt-quan-tri-lam-duoc", () => {
	test("cqt-quan-tri-lam-duoc: ba loi x bay thao tac deu thanh cong", async () => {
		const LOI: Loi[] = ["admin", "owner", "adminKey"];
		const soCa = await chayMaTran(LOI, 200, true);
		expect(`so ca ${soCa}`).toBe(`so ca ${LOI.length * BAY_THAO_TAC.length}`);
	});
});

describe("cqt-member-doc-duoc", () => {
	test("cqt-member-doc-duoc: bon thao tac doc van duoc", async () => {
		const t = await taoTruong();
		const ds = ok<TruongRa[]>(
			await doc("member", "list", { entity: "COMPANY", includeArchived: true }),
			"member list",
		);
		expect(`member list co truong ${ds.some((x) => x.id === t.id)}`).toBe(
			"member list co truong true",
		);
		const mot = ok<TruongRa>(
			await doc("member", "byKey", { entity: "COMPANY", key: t.key }),
			"member byKey",
		);
		expect(`member byKey khoa ${mot.key === t.key}`).toBe(
			"member byKey khoa true",
		);
		ok(await doc("member", "filters", { entity: "COMPANY" }), "member filters");
		ok(await doc("member", "coverage", { id: t.id }), "member coverage");
	});
});

describe("cqt-access", () => {
	test("cqt-access: canManage theo bon vai", async () => {
		const CA: Array<[Loi, boolean]> = [
			["owner", true],
			["admin", true],
			["member", false],
		];
		let soCa = 0;
		for (const [loi, mong] of CA) {
			const tra = ok<{ canManage: boolean }>(
				await doc(loi, "access", undefined),
				`${loi} access`,
			);
			expect(`${loi} canManage ${tra.canManage}`).toBe(
				`${loi} canManage ${mong}`,
			);
			soCa += 1;
		}
		const ngoai = await doc("nonMember", "access", undefined);
		expect(`nonMember access: HTTP ${ngoai.status} ${ngoai.loi}`).toBe(
			`nonMember access: HTTP 403 ${NOT_A_MEMBER}`,
		);
		soCa += 1;
		expect(`so ca ${soCa}`).toBe("so ca 4");
	});
});
