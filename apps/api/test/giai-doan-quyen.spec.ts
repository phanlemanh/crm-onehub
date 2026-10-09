import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KHONG_TRONG_PHAM_VI, type WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { GIAI_DOAN_API } from "../src/giai-doan/giai-doan-config";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "giai-doan-quyen";
const TIEN_TO = `gdq-${suffix}`;

type Vai = "owner" | "admin" | "member" | "okr";
type TraLoi = { status: number; data: unknown; loi: string; ma: string };

const cookie = {
	owner: "",
	admin: "",
	member: "",
	okr: "",
} satisfies Record<Vai, string>;
const daGieo = { nguoi: [] as string[], phien: [] as string[] };
let app: INestApplication;

type DauVao = {
	id?: string;
	label?: string;
	kind?: string;
	ids?: string[];
	moveTo?: string;
};

async function goi(ai: Vai, thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/giaiDoan.${thuTuc}`)
		.set("cookie", cookie[ai])
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

async function docList(ai: Vai): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.get("/api/trpc/giaiDoan.list")
		.set("cookie", cookie[ai]);
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

function mutationGiaiDoan(): string[] {
	const nguon = readFileSync(
		join(import.meta.dir, "..", "src", "generated", "server.ts"),
		"utf8",
	);
	const khoi =
		nguon
			.split("giaiDoan: t.router({")[1]
			?.split(/\n {2}\w+: t\.router\(/)[0] ?? "";
	return [
		...khoi.matchAll(
			/\n {4}(\w+): publicProcedure[\s\S]*?\.(mutation|query)\(/g,
		),
	]
		.filter((m) => m[2] === "mutation")
		.map((m) => m[1] as string)
		.sort();
}

async function taoTam(ten: string): Promise<string> {
	const g = await db.dealStage.create({
		data: {
			id: `${TIEN_TO}-${ten}-${Date.now().toString(36)}`,
			label: `${TIEN_TO} ${ten} ${Date.now().toString(36)}`,
			kind: "OPEN",
			position: 90,
		},
	});
	return g.id;
}

async function dauVaoHopLe(thuTuc: string): Promise<DauVao> {
	switch (thuTuc) {
		case "create":
			return {
				label: `${TIEN_TO} mới ${Date.now().toString(36)}`,
				kind: "OPEN",
			};
		case "rename":
			return {
				id: await taoTam("doi"),
				label: `${TIEN_TO} đổi ${Date.now().toString(36)}`,
			};
		case "reorder": {
			const ids = (
				await db.dealStage.findMany({
					where: { kind: "OPEN", archivedAt: null },
					orderBy: { position: "asc" },
					select: { id: true },
				})
			).map((g) => g.id);
			return { kind: "OPEN", ids };
		}
		case "archive":
			return { id: await taoTam("xoa") };
		case "restore": {
			const id = await taoTam("kp");
			await db.dealStage.update({
				where: { id },
				data: { archivedAt: new Date() },
			});
			return { id };
		}
		default:
			throw new Error(`thieu dau vao cho ${thuTuc}`);
	}
}

async function chup() {
	return db.dealStage.findMany({
		orderBy: { id: "asc" },
		select: {
			id: true,
			label: true,
			kind: true,
			position: true,
			archivedAt: true,
		},
	});
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
	for (const vai of ["owner", "admin", "member", "okr"] as const) {
		const id = `${TIEN_TO}-${vai}`;
		await gieoThanhVien(id, vai as WorkspaceRole);
		const phien = await mintPhien(id);
		cookie[vai] = phien.cookie;
		daGieo.nguoi.push(id);
		daGieo.phien.push(phien.token);
	}
});

afterAll(async () => {
	await app.close();
	await db.dealStage.deleteMany({
		where: {
			OR: [{ id: { startsWith: TIEN_TO } }, { label: { startsWith: TIEN_TO } }],
		},
	});
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

describe("giai-doan-quyen", () => {
	test("member va okr bi chan moi thu tuc ghi, du lieu khong doi", async () => {
		const ds = mutationGiaiDoan();
		expect(ds).toEqual(["archive", "create", "rename", "reorder", "restore"]);
		let soCa = 0;
		for (const vai of ["member", "okr"] as const) {
			for (const thuTuc of ds) {
				const dauVao = await dauVaoHopLe(thuTuc);
				const truoc = await chup();
				const tra = await goi(vai, thuTuc, dauVao);
				expect(
					`${vai}: giaiDoan.${thuTuc} ${tra.status}`,
					`${vai}: giaiDoan.${thuTuc} khong bi tu choi`,
				).toBe(`${vai}: giaiDoan.${thuTuc} 403`);
				expect(await chup(), `${vai}: giaiDoan.${thuTuc} doi du lieu`).toEqual(
					truoc,
				);
				soCa += 1;
			}
		}
		expect(soCa).toBe(ds.length * 2);
	});

	test("okr khong doc duoc list, member doc duoc voi canManage false", async () => {
		const okr = await docList("okr");
		expect(`${okr.status} ${okr.loi}`).toBe(`403 ${KHONG_TRONG_PHAM_VI}`);
		const member = await docList("member");
		expect(member.status).toBe(200);
		expect((member.data as { canManage: boolean }).canManage).toBe(false);
	});

	test("owner va admin lam duoc moi thu tuc ghi", async () => {
		const ds = mutationGiaiDoan();
		let soCa = 0;
		for (const vai of ["owner", "admin"] as const) {
			for (const thuTuc of ds) {
				const tra = await goi(vai, thuTuc, await dauVaoHopLe(thuTuc));
				expect(`${vai}: giaiDoan.${thuTuc} ${tra.status} ${tra.loi}`).toBe(
					`${vai}: giaiDoan.${thuTuc} 200 `,
				);
				soCa += 1;
			}
		}
		expect(soCa).toBe(ds.length * 2);
		const owner = await docList("owner");
		expect((owner.data as { canManage: boolean }).canManage).toBe(true);
		expect(GIAI_DOAN_API.messages.forbidden).toContain("owner or an admin");
	});
});
