import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { dealDetailOutput } from "../src/deals/deals.contracts";
import { serializedFieldOutput } from "../src/fields/fields.contracts";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "tmc";

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
type TraLoi = { status: number; data: unknown; ma: string };

let app: INestApplication;
let cookie = "";
let chuId = "";
const daGieo = { nguoi: [] as string[], phien: [] as string[] };
const daTao = { congTy: [] as string[], thoaThuan: [] as string[] };

async function goi(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

async function doc(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.get(
			`/api/trpc/${thuTuc}?input=${encodeURIComponent(JSON.stringify(dauVao))}`,
		)
		.set("cookie", cookie);
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

function ok(tra: TraLoi, nhan: string): unknown {
	if (tra.status !== 200)
		throw new Error(`${nhan}: HTTP ${tra.status} ${tra.ma}`);
	return tra.data;
}

async function taoThoaThuan(): Promise<string> {
	const congTy = ok(
		await goi("companies.create", { name: ma("Cong ty") }),
		"tao cong ty",
	) as { id: string };
	daTao.congTy.push(congTy.id);
	const thoaThuan = ok(
		await goi("deals.create", {
			name: ma("Thoa thuan"),
			companyId: congTy.id,
			ownerId: chuId,
		}),
		"tao thoa thuan",
	) as { id: string };
	daTao.thoaThuan.push(thoaThuan.id);
	return thoaThuan.id;
}

async function taoTruong(type: string, options: { label: string }[] = []) {
	return serializedFieldOutput.parse(
		ok(
			await goi("fields.create", {
				entity: "DEAL",
				label: ma(type),
				type,
				options,
				agentFilled: false,
			}),
			`tao truong ${type}`,
		),
	);
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.listen(0, "127.0.0.1");

	chuId = ma("chu");
	await gieoThanhVien(chuId, "owner");
	const phien = await mintPhien(chuId);
	cookie = phien.cookie;
	daGieo.nguoi.push(chuId);
	daGieo.phien.push(phien.token);
});

afterAll(async () => {
	await app.close();
	await db.fieldValue.deleteMany({
		where: { dealId: { in: daTao.thoaThuan } },
	});
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ dealId: { in: daTao.thoaThuan } },
				{ companyId: { in: daTao.congTy } },
				{ kind: "field-backfill", reason: { contains: `${TIEN_TO}-` } },
			],
		},
	});
	await db.deal.deleteMany({ where: { id: { in: daTao.thoaThuan } } });
	await db.company.deleteMany({ where: { id: { in: daTao.congTy } } });
	await db.fieldDefinition.deleteMany({
		where: { label: { startsWith: `${TIEN_TO}-` } },
	});
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

describe("tmc-api-so", () => {
	test("so luu bang number doc lai dung; chuoi kieu Viet bi tu choi", async () => {
		const truong = await taoTruong("NUMBER");
		const id = await taoThoaThuan();

		ok(
			await goi("deals.update", {
				id,
				data: { fields: { [truong.key]: 1234.5 } },
			}),
			"luu so",
		);
		const ban = dealDetailOutput.parse(
			ok(await doc("deals.byId", { id }), "doc"),
		);
		const giaTri = ban.fields.find((f) => f.key === truong.key)?.value;
		if (giaTri !== 1234.5) throw new Error(`tmc api so: doc lai ${giaTri}`);

		const tuChoi = await goi("deals.update", {
			id,
			data: { fields: { [truong.key]: "1.234,5" } },
		});
		if (tuChoi.status === 200 || tuChoi.ma !== "BAD_REQUEST") {
			throw new Error("tmc api so: chuoi viet lot");
		}
		expect(giaTri).toBe(1234.5);
	});
});

describe("tmc-api-tu-choi", () => {
	test("lua chon vua luu tru bi tu choi voi ma BAD_REQUEST", async () => {
		const truong = await taoTruong("SELECT", [{ label: "A" }, { label: "B" }]);
		const [a, b] = truong.options;
		if (!a || !b) throw new Error("thieu lua chon");
		ok(
			await goi("fields.update", {
				id: truong.id,
				data: { options: [{ id: a.id, label: a.label }] },
			}),
			"luu tru B",
		);
		const id = await taoThoaThuan();

		const tuChoi = await goi("deals.update", {
			id,
			data: { fields: { [truong.key]: b.id } },
		});
		if (tuChoi.status === 200 || tuChoi.ma !== "BAD_REQUEST") {
			throw new Error(`tmc api tu choi: ma ${tuChoi.ma || tuChoi.status}`);
		}

		const duoc = await goi("deals.update", {
			id,
			data: { fields: { [truong.key]: a.id } },
		});
		if (duoc.status !== 200) throw new Error("tmc api tu choi: doi chung A");
		expect(tuChoi.ma).toBe("BAD_REQUEST");
	});
});
