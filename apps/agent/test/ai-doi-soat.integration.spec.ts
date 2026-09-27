import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import {
	AI_DOI_SOAT,
	baoCaoGatewayThat,
	chayDoiSoat,
	LoiGateway,
	lenLichDoiSoat,
} from "../agent/lib/ai-doi-soat";
import { TIEN_TO } from "./support/nhac-gieo";
import { donTroLy, gieoChiPhi } from "./support/tro-ly-gieo";

const THANG = "2031-08";
const khoaCu = process.env.AI_GATEWAY_API_KEY;
const fetchCu = globalThis.fetch;

async function donDoiSoat(): Promise<void> {
	await db.aiDoiSoat.deleteMany({ where: { thang: { startsWith: "2031-" } } });
	await db.agentTask.deleteMany({
		where: {
			kind: "ai-doi-soat",
			subject: { startsWith: "ai-doi-soat:2031-" },
		},
	});
}

async function hangDoiSoat(thang: string) {
	return db.agentTask.create({
		data: {
			kind: "ai-doi-soat",
			reason: AI_DOI_SOAT.lyDo,
			subject: `${TIEN_TO}doi-soat-${thang}`,
			dueAt: new Date(),
			budget: 0,
			payload: { thang },
		},
	});
}

async function outcome(id: string) {
	return (await db.agentTask.findUniqueOrThrow({ where: { id } })).outcome;
}

async function dongThang() {
	const rows = await db.aiDoiSoat.findMany({ where: { thang: THANG } });
	expect(rows).toHaveLength(1);
	const r = rows[0];
	if (!r) throw new Error("khong co dong doi soat");
	return {
		soSo: r.soSoUsd.toNumber(),
		soGateway: r.soGatewayUsd?.toNumber() ?? null,
		lech: r.lechPhanTram?.toNumber() ?? null,
		ketQua: r.ketQua,
		lyDo: r.lyDo,
	};
}

beforeAll(async () => {
	await donTroLy();
	await donDoiSoat();
	await gieoChiPhi(new Date("2031-08-03T10:00:00Z"), "okr.de-xuat", 0.4);
	await gieoChiPhi(new Date("2031-08-20T10:00:00Z"), "crm.nghien-cuu", 0.6);
	await gieoChiPhi(new Date("2031-07-31T23:30:00Z"), "crm.nghien-cuu", 5);
	await gieoChiPhi(new Date("2031-09-01T00:30:00Z"), "crm.nghien-cuu", 5);
	await gieoChiPhi(new Date("2031-08-11T10:00:00Z"), "crm.nghien-cuu", null);
});

afterEach(() => {
	globalThis.fetch = fetchCu;
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
});

afterAll(async () => {
	await donDoiSoat();
	await donTroLy();
});

describe("doi-soat", () => {
	test("Gateway $1,08 trên sổ $1,00 là khớp, lệch 8%; khung là ngày UTC của tháng", async () => {
		const khung: { tu: string; den: string }[] = [];
		const hang = await hangDoiSoat(THANG);
		await chayDoiSoat(hang, async (k) => {
			khung.push(k);
			return 1.08;
		});
		expect(khung).toEqual([{ tu: "2031-08-01", den: "2031-08-31" }]);
		expect(await dongThang()).toEqual({
			soSo: 1,
			soGateway: 1.08,
			lech: 8,
			ketQua: "khop",
			lyDo: null,
		});
		expect(await outcome(hang.id)).toBe("doi-soat:khop");
	});

	test("Gateway $1,12 là lệch 12%, cùng tháng chạy lại vẫn một dòng", async () => {
		const hang = await hangDoiSoat(THANG);
		await chayDoiSoat(hang, async () => 1.12);
		const dong = await dongThang();
		expect(dong.ketQua, "doi soat khong bat lech 12%").toBe("lech");
		expect(dong).toEqual({
			soSo: 1,
			soGateway: 1.12,
			lech: 12,
			ketQua: "lech",
			lyDo: null,
		});
		expect(await outcome(hang.id)).toBe("doi-soat:lech");
	});

	test("biên 10% là khớp", async () => {
		const hang = await hangDoiSoat(THANG);
		await chayDoiSoat(hang, async () => 1.1);
		expect((await dongThang()).ketQua).toBe("khop");
	});

	test("Gateway trả lỗi thì ghi không đối soát được kèm mã lỗi, không im", async () => {
		const hang = await hangDoiSoat(THANG);
		await chayDoiSoat(hang, async () => {
			throw new LoiGateway("503");
		});
		expect(await dongThang()).toEqual({
			soSo: 1,
			soGateway: null,
			lech: null,
			ketQua: "khong-doi-soat-duoc",
			lyDo: "loi-gateway:503",
		});
		expect(await outcome(hang.id)).toBe(
			"doi-soat:khong-doi-soat-duoc:loi-gateway:503",
		);
	});

	test("chỉ có OIDC, không có khoá riêng để lọc: không đối soát được, lý do nói ra", async () => {
		delete process.env.AI_GATEWAY_API_KEY;
		let goiMang = 0;
		globalThis.fetch = (async () => {
			goiMang += 1;
			return new Response("{}");
		}) as unknown as typeof fetch;
		const hang = await hangDoiSoat(THANG);
		await chayDoiSoat(hang);
		expect(goiMang).toBe(0);
		const dong = await dongThang();
		expect(dong.ketQua).toBe("khong-doi-soat-duoc");
		expect(dong.lyDo).toBe("khong-co-khoa-rieng");
	});

	test("báo cáo thật lọc theo khoá đang dùng và cộng mọi ngày", async () => {
		process.env.AI_GATEWAY_API_KEY = "khoa-gia";
		const url: URL[] = [];
		globalThis.fetch = (async (u: URL) => {
			url.push(new URL(u));
			return Response.json({
				results: [{ day: "2031-08-01", total_cost: 0.5 }, { total_cost: 0.62 }],
			});
		}) as unknown as typeof fetch;
		expect(
			await baoCaoGatewayThat({ tu: "2031-08-01", den: "2031-08-31" }),
		).toBeCloseTo(1.12, 9);
		expect(url[0]?.searchParams.get("api_key_id")).toBe("self");
		expect(url[0]?.searchParams.get("start_date")).toBe("2031-08-01");
		expect(url[0]?.searchParams.get("end_date")).toBe("2031-08-31");
	});

	test("báo cáo thật trả 401 hay thân không đọc được là lỗi có mã", async () => {
		process.env.AI_GATEWAY_API_KEY = "khoa-gia";
		globalThis.fetch = (async () =>
			new Response("no", { status: 401 })) as unknown as typeof fetch;
		await expect(
			baoCaoGatewayThat({ tu: "2031-08-01", den: "2031-08-31" }),
		).rejects.toThrow("401");
		globalThis.fetch = (async () =>
			Response.json({ ket: 1 })) as unknown as typeof fetch;
		await expect(
			baoCaoGatewayThat({ tu: "2031-08-01", den: "2031-08-31" }),
		).rejects.toThrow("bao-cao-khong-doc-duoc");
	});
});

describe("len-lich", () => {
	test("xếp một hàng cho tháng trước từ 9 giờ sáng ngày 2 giờ Việt Nam, không xếp trùng", async () => {
		expect(await lenLichDoiSoat(new Date("2031-09-02T01:59:00Z"))).toBe(false);
		expect(await lenLichDoiSoat(new Date("2031-09-02T02:00:00Z"))).toBe(true);
		expect(await lenLichDoiSoat(new Date("2031-09-20T02:00:00Z"))).toBe(false);
		const hang = await db.agentTask.findMany({
			where: { kind: "ai-doi-soat", subject: "ai-doi-soat:2031-08" },
		});
		expect(hang).toHaveLength(1);
		expect(hang[0]?.payload).toEqual({ thang: "2031-08" });
	});
});
