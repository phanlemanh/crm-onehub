import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import * as gateway from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { parseSuKienChiTiet } from "@crm/validation/tai-lieu";
import { MockLanguageModelV4 } from "ai/test";
import { MOT_TRIEU, TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import {
	ganZdr,
	modelMaySoan,
	nhanKhoaMaySoan,
} from "../agent/lib/tai-lieu-model";
import { chiPhiUsd } from "../agent/lib/tai-lieu-nop";
import maySoan from "../agent/subagents/may_soan/agent";
import { buocXong, ctxCon, nop } from "./support/may-soan-gia";
import {
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	ma,
} from "./support/tai-lieu-gieo";

const SOAN = TAI_LIEU_AGENT.soan;
const BIEN = SOAN.bienKhoaRieng;
const KHOA = "khoa-gia-7Q";

type ModelDong = { events: { "step.started": () => unknown } };
const dungModel = () =>
	(maySoan.model as unknown as ModelDong).events["step.started"]();

let nguoiId = "";
let trangId = "";
const bienGoc = process.env[BIEN];

beforeAll(async () => {
	nguoiId = await gieoNguoi();
	trangId = await gieoTrang(nguoiId);
});

afterEach(() => {
	if (bienGoc === undefined) delete process.env[BIEN];
	else process.env[BIEN] = bienGoc;
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

function kiemKhoa(): string[] {
	const loi: string[] = [];
	const spy = spyOn(gateway, "createGateway");
	try {
		process.env[BIEN] = KHOA;
		const coKhoa = dungModel();
		const dungKhoa = spy.mock.calls.some(
			([cauHinh]) =>
				(cauHinh as { apiKey?: string } | undefined)?.apiKey === KHOA,
		);
		if (!dungKhoa || coKhoa === null || nhanKhoaMaySoan() !== "rieng") {
			loi.push("khoa rieng khong duoc dung");
		}
		spy.mockClear();
		delete process.env[BIEN];
		let nem = false;
		let khongKhoa: unknown;
		try {
			khongKhoa = dungModel();
		} catch {
			nem = true;
		}
		if (nem) loi.push("vang bien thi nem");
		const coApiKey = spy.mock.calls.some(
			([cauHinh]) => (cauHinh as { apiKey?: string } | undefined)?.apiKey,
		);
		if (coApiKey || khongKhoa === null || khongKhoa === undefined) {
			loi.push("vang bien van goi createGateway voi apiKey");
		}
		if (nhanKhoaMaySoan() !== "chung") loi.push("vang bien khong nhan chung");
	} finally {
		spy.mockRestore();
	}
	return loi;
}

describe("khoa-rieng", () => {
	test("khoa-rieng: co bien thi goi createGateway voi khoa rieng, vang bien thi di duong chung", () => {
		expect(kiemKhoa()).toEqual([]);
	});

	test("khoa-rieng: mot luot bao usage 1200/340 ghi dung mot su kien MAY_SOAN co chi phi", async () => {
		const phienGoc = ma("goc");
		await gieoNguon({
			tep: "quyet-dinh.docx",
			trangId,
			taiBoiId: nguoiId,
			bamKhai: ma("sha"),
			trangThai: "DANG_SOAN",
			chu: "Kể từ ngày 01/10/2026, tầng hai hưởng 1,5%.",
			phienId: phienGoc,
		});
		const ctx = ctxCon(phienGoc);
		const phien = ctx.session.id;
		await buocXong(ctx, { inputTokens: 1000, outputTokens: 300 });
		await buocXong(ctx, { inputTokens: 200, outputTokens: 40 });
		expect(
			await nop(
				{
					ten: "Hoa hồng",
					noiDung: "Tầng hai hưởng 1,5% từ 01/10/2026.",
					trichDoan: [
						{
							menhDe: "Mức",
							trich: "Kể từ ngày 01/10/2026, tầng hai hưởng 1,5%.",
						},
					],
				},
				ctx,
			),
		).toBeNull();
		const suKien = await db.taiLieuSuKien.findMany({
			where: { trangId, loai: "MAY_SOAN" },
		});
		expect(suKien.length).toBe(1);
		const ct = parseSuKienChiTiet(suKien[0]?.chiTiet);
		if (ct.loai !== "MAY_SOAN") throw new Error(`loai ${ct.loai}`);
		const gia = TAI_LIEU_AGENT.bangGia[SOAN.maModel];
		const mongDoi = (1200 * gia.vaoMoiTrieu + 340 * gia.raMoiTrieu) / MOT_TRIEU;
		expect(ct.maModel).toBe(SOAN.maModel);
		expect(ct.nhanKhoa).toBe(nhanKhoaMaySoan());
		expect(ct.tokenVao).toBe(1200);
		expect(ct.tokenRa).toBe(340);
		expect(ct.soLanBac).toBe(0);
		expect(ct.phien).toBe(phien);
		expect(ct.deXuatId).not.toBeNull();
		expect(ct.chiPhiUsd).toBeCloseTo(mongDoi, 12);
	});

	test("khoa-rieng: moi loi goi cua may soan mang co ZDR, ca khoa rieng lan khoa chung", async () => {
		const loi: string[] = [];
		for (const [ten, env] of [
			["rieng", { [BIEN]: KHOA }],
			["chung", {}],
		] as const) {
			const daGoi: Parameters<MockLanguageModelV4["doGenerate"]>[0][] = [];
			const gia = new MockLanguageModelV4({
				doGenerate: async (vao) => {
					daGoi.push(vao);
					return {} as never;
				},
			});
			const tao = (() => () => gia) as unknown as typeof gateway.createGateway;
			const { model } = modelMaySoan(env, tao);
			await (model as unknown as MockLanguageModelV4).doGenerate({
				prompt: [],
				providerOptions: { gateway: { order: ["vertex"] } },
			});
			const gw = daGoi[0]?.providerOptions?.gateway;
			if (gw?.zeroDataRetention !== true) loi.push(`thieu ZDR: ${ten}`);
			const order = gw?.order;
			if (!Array.isArray(order) || order[0] !== "vertex")
				loi.push(`mat tuy chon cu: ${ten}`);
		}
		expect(loi).toEqual([]);
		const ra = await ganZdr.transformParams?.({
			type: "generate",
			model: {} as never,
			params: { prompt: [] },
		});
		expect(ra?.providerOptions?.gateway?.zeroDataRetention).toBe(true);
	});

	test("khoa-rieng: ma model chua co trong bang gia thi chi phi null, khong nem", () => {
		expect(chiPhiUsd("nha-la/model-chua-co-gia", 1200, 340)).toBeNull();
	});
});
