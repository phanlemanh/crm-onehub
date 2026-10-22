import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db, Prisma } from "@crm/db";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import type { TinhNang } from "@crm/db/ai-chi-phi-danh-muc";
import { troLyOkrSanSang } from "@crm/db/okr-tro-ly";
import type {
	OkrProgram,
	OkrProgramSua,
} from "@crm/validation/okr-chuong-trinh";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "tro-ly-okr-chi-tieu";
const id = (phan: string) => `tlc-${suffix}-${phan}`;
const BAY_GIO = new Date("2031-05-20T12:00:00+07:00");
const THANG = "2031-05";

let app: NestExpressApplication;
const nguoi = { quan: id("quan"), thuong: id("thuong"), okr: id("okr") };
const cookie = { quan: "", thuong: "", okr: "" };
let khoaOkr = "";
const kiemCuaBai: string[] = [];

type ChiTieu = {
	thang: string;
	theoNhom: { nhom: string; soBuoc: number; usd: number }[];
	tongUsd: number;
	troLyOkr: { chiUsd: number; tranUsd: number; phanTram: number };
	sanSang: { bat: true; conLaiUsd: number } | { bat: false; lyDo: string };
	dangKiem: boolean;
	doiSoat: {
		thang: string;
		ketQua: string;
		lechPhanTram: number | null;
	} | null;
};

const DONG: [string, TinhNang, string][] = [
	["2031-05-01T00:30:00+07:00", "crm.nghien-cuu", "0.123456"],
	["2031-05-03T10:00:00+07:00", "crm.nghien-cuu", "0.2"],
	["2031-05-04T10:00:00+07:00", "crm.hoi-dap", "0.011111"],
	["2031-05-05T10:00:00+07:00", "zalo.hoi-crm", "0.022222"],
	["2031-05-06T10:00:00+07:00", "crm.dung-tac-nhan", "0.033333"],
	["2031-05-07T10:00:00+07:00", "crm.tac-nhan", "0.044444"],
	["2031-05-08T10:00:00+07:00", "okr.chuyen-tiep", "0.5"],
	["2031-05-09T10:00:00+07:00", "okr.de-xuat", "1.25"],
	["2031-05-10T10:00:00+07:00", "okr.tom-tat", "0.75"],
	["2031-05-11T10:00:00+07:00", "khac", "0.066666"],
	["2031-05-12T10:00:00+07:00", "okr.de-xuat", "0.000001"],
	["2031-04-30T23:59:00+07:00", "crm.nghien-cuu", "7"],
	["2031-06-01T06:30:00+07:00", "crm.nghien-cuu", "9"],
];

const cong = (...so: string[]) =>
	Number(so.reduce((s, x) => s.plus(x), new Prisma.Decimal(0)).toFixed(6));

async function goiTrpc(
	thuTuc: string,
	ai: keyof typeof cookie,
	vao?: OkrProgramSua,
): Promise<{ status: number; data: unknown }> {
	const r =
		vao === undefined
			? await request(app.getHttpServer())
					.get(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie[ai])
			: await request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie[ai])
					.set("content-type", "application/json")
					.send(JSON.stringify(vao));
	return { status: r.status, data: r.body?.result?.data };
}

async function chiTieu(): Promise<ChiTieu> {
	const r = await goiTrpc("okr.aiChiTieu", "quan");
	expect(r.status).toBe(200);
	return r.data as ChiTieu;
}

async function kiem(outcome: "san-sang" | "chua-co-khoa-mo-hinh", luc: string) {
	const hang = await db.agentTask.create({
		data: {
			kind: "okr-kiem-san-sang",
			reason: "okr-kiem-san-sang",
			subject: id("kiem"),
			dueAt: new Date(luc),
			finishedAt: new Date(luc),
			outcome,
		},
	});
	kiemCuaBai.push(hang.id);
}

async function thang(tran: number) {
	const r = await goiTrpc("okr.setProgram", "quan", { aiTranThangUsd: tran });
	expect(r.status).toBe(200);
}

const truc = () =>
	troLyOkrSanSang(db, { viec: "de-xuat", now: BAY_GIO, coTacTu: true });

beforeAll(async () => {
	setSystemTime(BAY_GIO);
	app = await createApp();
	await app.listen(0, "127.0.0.1");
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	spyOn(app.get(AgentTriggerService), "canReachAgent").mockReturnValue(true);
	await gieoThanhVien(nguoi.quan, "admin");
	await gieoThanhVien(nguoi.thuong, "member");
	await gieoThanhVien(nguoi.okr, "okr");
	cookie.quan = (await mintPhien(nguoi.quan)).cookie;
	cookie.thuong = (await mintPhien(nguoi.thuong)).cookie;
	cookie.okr = (await mintPhien(nguoi.okr)).cookie;
	khoaOkr = (
		await auth.api.createApiKey({
			body: { name: id("khoa"), userId: nguoi.okr },
		})
	).key;
	for (const [i, [at, tinhNang, usd]] of DONG.entries()) {
		await ghiChiPhi(db, {
			id: id(`buoc-${i}`),
			at: new Date(at),
			sessionId: id("phien"),
			phienCha: null,
			kenh: null,
			tinhNang,
			taskId: null,
			modelId: null,
			inputTokens: 100,
			cacheReadTokens: 0,
			outputTokens: 10,
			costUsd: Number(usd),
		});
	}
	await kiem("san-sang", "2031-05-10T00:00:00Z");
});

afterAll(async () => {
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: id("") } } });
	await db.aiDoiSoat.deleteMany({ where: { thang: "2031-04" } });
	await db.agentTask.deleteMany({ where: { id: { in: kiemCuaBai } } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { in: Object.values(nguoi) } },
	});
	await db.apikey.deleteMany({
		where: { referenceId: { in: Object.values(nguoi) } },
	});
	await db.session.deleteMany({
		where: { userId: { in: Object.values(nguoi) } },
	});
	await db.member.deleteMany({
		where: { userId: { in: Object.values(nguoi) } },
	});
	await db.user.deleteMany({ where: { id: { in: Object.values(nguoi) } } });
	await app.close();
	setSystemTime();
});

describe("chi-tieu", () => {
	test("bật AI qua setProgram: phiên bản +1 mang trường AI, xếp đúng một việc kiểm sẵn sàng", async () => {
		const truoc = (await goiTrpc("okr.program", "quan")).data as {
			version: number;
		};
		const r = await goiTrpc("okr.setProgram", "quan", {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 5,
		});
		expect(r.status).toBe(200);
		const sau = (await goiTrpc("okr.program", "quan")).data as OkrProgram;
		expect(sau).toMatchObject({
			version: truoc.version + 1,
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTomTatPhamVi: "tat",
			aiTranThangUsd: 5,
		});
		const dangCho = await db.agentTask.findMany({
			where: { kind: "okr-kiem-san-sang", finishedAt: null },
		});
		expect(dangCho).toHaveLength(1);
		expect((await chiTieu()).dangKiem).toBe(true);
		kiemCuaBai.push(...dangCho.map((h) => h.id));
		await db.agentTask.updateMany({
			where: { id: { in: dangCho.map((h) => h.id) } },
			data: {
				finishedAt: new Date("2031-05-11T00:00:00Z"),
				outcome: "san-sang",
			},
		});
		await goiTrpc("okr.setProgram", "quan", { aiTranThangUsd: 5 });
		expect(
			await db.agentTask.count({
				where: { kind: "okr-kiem-san-sang", finishedAt: null },
			}),
		).toBe(0);
	});

	test("sáu nhóm theo tháng giờ Việt Nam, số bằng tổng tay", async () => {
		const c = await chiTieu();
		const theo = Object.fromEntries(c.theoNhom.map((n) => [n.nhom, n]));
		expect(
			theo["nghien-cuu-danh-ba"]?.usd,
			`thang VN lech: ${theo["nghien-cuu-danh-ba"]?.usd}`,
		).toBe(cong("0.123456", "0.2"));
		expect(c).toMatchObject({
			thang: THANG,
			theoNhom: [
				{ nhom: "nghien-cuu-danh-ba", soBuoc: 2, usd: cong("0.123456", "0.2") },
				{ nhom: "tro-ly-ai", soBuoc: 1, usd: 0.011111 },
				{ nhom: "hoi-crm-zalo", soBuoc: 1, usd: 0.022222 },
				{ nhom: "tac-nhan", soBuoc: 2, usd: cong("0.033333", "0.044444") },
				{
					nhom: "tro-ly-okr",
					soBuoc: 4,
					usd: cong("0.5", "1.25", "0.75", "0.000001"),
				},
				{ nhom: "chua-gan", soBuoc: 1, usd: 0.066666 },
			],
			tongUsd: cong(...DONG.slice(0, 11).map((d) => d[2])),
			troLyOkr: { chiUsd: 2.500001, tranUsd: 5, phanTram: 50 },
			dangKiem: false,
		});
		expect(c.sanSang).toEqual(await truc());
		expect(c.sanSang).toEqual({ bat: true, conLaiUsd: 2.499999 });
	});

	test("ma trận sẵn sàng qua API bằng gọi thẳng trên cùng kho", async () => {
		await kiem("chua-co-khoa-mo-hinh", "2031-05-15T00:00:00Z");
		const khongKhoa = await chiTieu();
		expect(khongKhoa.sanSang).toEqual({
			bat: false,
			lyDo: "chua-co-khoa-mo-hinh",
		});
		expect(khongKhoa.sanSang).toEqual(await truc());

		await kiem("san-sang", "2031-05-16T00:00:00Z");
		await thang(2);
		const hetTran = await chiTieu();
		expect(hetTran.sanSang).toEqual({ bat: false, lyDo: "het-tran-thang" });
		expect(hetTran.sanSang).toEqual(await truc());
		expect(hetTran.troLyOkr.phanTram).toBe(125);

		await thang(5);
		const du = await chiTieu();
		expect(du.sanSang).toEqual(await truc());
		expect(du.sanSang.bat).toBe(true);
	});

	test("chỉ chế độ ẩn toàn công ty: chỉ báo đi tới trần và khoá, không báo góp ý tắt", async () => {
		const chiAn: OkrProgramSua = {
			aiDeXuatPhamVi: "tat",
			aiDeXuatDonVi: [],
			aiDeXuatAnPhamVi: "toan-cong-ty",
			aiDeXuatAnDonVi: [],
		};
		expect((await goiTrpc("okr.setProgram", "quan", chiAn)).status).toBe(200);
		const an = await chiTieu();
		expect(an.sanSang.bat ? "bat" : an.sanSang.lyDo, "an ma bao tat").not.toBe(
			"viec-tat",
		);
		expect(an.sanSang).toEqual({ bat: true, conLaiUsd: 2.499999 });

		await thang(2);
		expect((await chiTieu()).sanSang).toEqual({
			bat: false,
			lyDo: "het-tran-thang",
		});
		await thang(5);

		const r = await goiTrpc("okr.setProgram", "quan", {
			aiDeXuatPhamVi: "toan-cong-ty",
			aiDeXuatAnPhamVi: "tat",
		});
		expect(r.status).toBe(200);
		const dangCho = await db.agentTask.findMany({
			where: { kind: "okr-kiem-san-sang", finishedAt: null },
			select: { id: true },
		});
		kiemCuaBai.push(...dangCho.map((h) => h.id));
	});

	test("đối soát gần nhất là tháng đã qua", async () => {
		await db.aiDoiSoat.create({
			data: {
				thang: "2031-04",
				tuNgay: new Date("2031-04-01T00:00:00Z"),
				denNgay: new Date("2031-04-30T00:00:00Z"),
				soSoUsd: new Prisma.Decimal(1),
				soGatewayUsd: new Prisma.Decimal(1.14),
				lechPhanTram: new Prisma.Decimal(14),
				ketQua: "lech",
			},
		});
		expect((await chiTieu()).doiSoat).toMatchObject({
			thang: "2031-04",
			ketQua: "lech",
			lechPhanTram: 14,
		});
	});

	test("thành viên và vai chỉ OKR bị từ chối qua tRPC và REST", async () => {
		expect((await goiTrpc("okr.aiChiTieu", "thuong")).status).toBe(403);
		expect((await goiTrpc("okr.aiChiTieu", "okr")).status).toBe(403);
		const rest = await request(app.getHttpServer())
			.get(`${REST_BRIDGE_PATH}/okr/ai-spend`)
			.set(API_KEY_HEADER, khoaOkr);
		expect(rest.status).toBe(403);
		expect(
			(await goiTrpc("okr.setProgram", "thuong", { aiOn: false })).status,
		).toBe(403);
	});
});
