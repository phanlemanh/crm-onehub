import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { bocModelZdr } from "@crm/ai-okr";
import { wrapLanguageModel } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import {
	type LanJudge,
	loiTraLoiJudge,
	thuLaiJudge,
} from "../evals/okr-soan/judge";
import { phanViTheoLoaiLuot } from "../evals/okr-soan/tinh";
import {
	docTomTat,
	docTongKet,
	ketLuanThuoc,
	phanLoaiHong,
	type TomTatChay,
	thongKeJudge,
} from "../evals/okr-soan/tong-ket";

const SO_LAN = TRO_LY_OKR_SOAN.judge.soLanThu;
const EVE_DIST = join(
	import.meta.dir,
	"..",
	"node_modules",
	"eve",
	"dist",
	"src",
);
const THU_MUC_PNPM = join(EVE_DIST, "node_modules", ".pnpm");
const TEN_AUTOEVALS = readdirSync(THU_MUC_PNPM).find((d) =>
	d.startsWith("autoevals@"),
);
if (!TEN_AUTOEVALS)
	throw new Error(`khong thay autoevals trong ${THU_MUC_PNPM}`);

const moduleAutoevals = z.object({
	ClosedQA: z.function({
		input: [z.looseObject({})],
		output: z.promise(z.unknown()),
	}),
});
const moduleClient = z.object({
	createAutoevalsClient: z.function({
		input: [z.looseObject({})],
		output: z.looseObject({}),
	}),
});
const diemClosedQA = z.object({
	score: z.number(),
	metadata: z.object({ choice: z.string() }),
});

const { ClosedQA } = moduleAutoevals.parse(
	await import(
		join(
			THU_MUC_PNPM,
			TEN_AUTOEVALS,
			"node_modules",
			"autoevals",
			"jsdist",
			"index.js",
		)
	),
);
const { createAutoevalsClient } = moduleClient.parse(
	await import(join(EVE_DIST, "evals", "autoevals-client.js")),
);

type KetQua = Awaited<ReturnType<MockLanguageModelV4["doGenerate"]>>;
type ThamSo = Parameters<MockLanguageModelV4["doGenerate"]>[0];

const CHON = {
	type: "function" as const,
	name: "select_choice",
	inputSchema: {
		type: "object" as const,
		properties: {
			reasons: { type: "string" as const },
			choice: { type: "string" as const, enum: ["Y", "N"] },
		},
	},
};
const THAM_SO_EP: ThamSo = {
	prompt: [],
	tools: [CHON],
	toolChoice: { type: "tool", toolName: "select_choice" },
};

function traLoi(noiDung: KetQua["content"]): KetQua {
	return {
		content: noiDung,
		finishReason: { unified: "stop", raw: undefined },
		usage: {
			inputTokens: {
				total: 1,
				noCache: 1,
				cacheRead: undefined,
				cacheWrite: undefined,
			},
			outputTokens: { total: 1, text: 1, reasoning: undefined },
		},
		warnings: [],
	};
}
const CHU = traLoi([{ type: "text", text: "Tôi chọn Y vì bản A tốt hơn." }]);
const goiChon = (choice: string) =>
	traLoi([
		{
			type: "tool-call",
			toolCallId: "1",
			toolName: "select_choice",
			input: JSON.stringify({ reasons: "vì bản A căn chỉnh đúng", choice }),
		},
	]);

function dungGia(chuoi: KetQua[]) {
	const daGoi: ThamSo[] = [];
	const ghi: LanJudge[] = [];
	const gia = new MockLanguageModelV4({
		doGenerate: async (vao) => {
			daGoi.push(vao);
			const kq = chuoi[daGoi.length - 1];
			if (!kq) throw new Error("het chuoi gia");
			return kq;
		},
	});
	const model = wrapLanguageModel({
		model: bocModelZdr(gia, {
			tags: TRO_LY_OKR_SOAN.tags,
			tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.judge.tranRaMoiLoiGoi,
		}),
		middleware: thuLaiJudge(SO_LAN, (l) => ghi.push(l)),
	});
	return { model, daGoi, ghi };
}

async function cham(model: ReturnType<typeof wrapLanguageModel>) {
	return diemClosedQA.parse(
		await ClosedQA({
			input: "",
			output: "A: …\n\nB: …",
			criteria: "Đạt khi bản A tốt hơn bản B",
			model: TRO_LY_OKR_SOAN.judge.model,
			client: createAutoevalsClient({ languageModel: model }),
		}),
	);
}

describe("judge-thu-lai: nhận ra trả lời judge hỏng", () => {
	test("gọi đúng công cụ với choice trong danh sách → không lỗi; không ép công cụ → không xét", () => {
		expect(loiTraLoiJudge(THAM_SO_EP, goiChon("Y").content)).toBeNull();
		expect(loiTraLoiJudge({ prompt: [] }, CHU.content)).toBeNull();
	});

	test("trả chữ, choice lạ, input không phải JSON → lỗi có tên", () => {
		expect(loiTraLoiJudge(THAM_SO_EP, CHU.content)).toBe(
			"khong goi select_choice",
		);
		expect(loiTraLoiJudge(THAM_SO_EP, goiChon("C").content)).toBe(
			"choice ngoai danh sach: C",
		);
		expect(
			loiTraLoiJudge(THAM_SO_EP, [
				{
					type: "tool-call",
					toolCallId: "1",
					toolName: "select_choice",
					input: "{choice",
				},
			]),
		).toBe("select_choice sai khuon: input khong phai json");
	});
});

describe("judge-thu-lai: thử lại qua đúng đường chấm của eve", () => {
	test(`trả chữ hai lần rồi gọi công cụ → chấm được ở lần ${SO_LAN}, mọi lần đều mang cờ ZDR`, async () => {
		const { model, daGoi, ghi } = dungGia([CHU, CHU, goiChon("Y")]);
		const kq = await cham(model);
		expect(kq.score).toBe(1);
		expect(kq.metadata.choice).toBe("Y");
		expect(ghi).toEqual([{ lanThu: SO_LAN, loi: null }]);
		expect(daGoi.length).toBe(SO_LAN);
		for (const g of daGoi)
			expect(g.providerOptions?.gateway?.zeroDataRetention).toBe(true);
	});

	test(`hỏng cả ${SO_LAN} lần → vẫn là «không chấm được», dừng ở trần`, async () => {
		const { model, daGoi, ghi } = dungGia([CHU, CHU, CHU, goiChon("Y")]);
		await expect(cham(model)).rejects.toThrow("No tool calls in response");
		expect(daGoi.length).toBe(SO_LAN);
		expect(ghi).toEqual([{ lanThu: SO_LAN, loi: "khong goi select_choice" }]);
	});

	test("đối chứng: không bọc thử lại thì một lần trả chữ là hỏng ngay", async () => {
		const gia = new MockLanguageModelV4({ doGenerate: [CHU, goiChon("Y")] });
		await expect(
			cham(wrapLanguageModel({ model: gia, middleware: [] })),
		).rejects.toThrow("No tool calls in response");
		expect(gia.doGenerateCalls.length).toBe(1);
	});

	test("lần đầu đã đúng → không gọi thêm", async () => {
		const { model, daGoi, ghi } = dungGia([goiChon("N")]);
		expect((await cham(model)).score).toBe(0);
		expect(daGoi.length).toBe(1);
		expect(ghi).toEqual([{ lanThu: 1, loi: null }]);
	});
});

const LOI_JUDGE = "No tool calls in response";
const TOM_TAT_LAN_5: TomTatChay = {
	totalEvals: 4,
	passed: 1,
	failed: 2,
	scored: 1,
	skipped: 0,
	evals: [
		{
			id: "okr-soan/soan/0000",
			verdict: "passed",
			assertions: [{ name: "equals", score: 1, passed: true }],
		},
		{
			id: "okr-soan/soan/0002",
			verdict: "failed",
			assertions: [
				{ name: "equals", score: 1, severity: "gate", passed: true },
				{
					name: "judge.autoevals.closedQA [pb-kd-bac tc1]",
					score: 0,
					severity: "gate",
					passed: false,
					message: LOI_JUDGE,
				},
				{
					name: "judge.autoevals.closedQA [pb-kd-bac tc4]",
					score: 0,
					severity: "soft",
					passed: false,
					message: "rationale: …",
					metadata: { choice: "N" },
				},
			],
		},
		{
			id: "okr-soan/soan-boi-canh/0000",
			verdict: "failed",
			assertions: [
				{
					name: "judge.autoevals.closedQA [boi-canh:onehub#v1]",
					score: 0,
					severity: "gate",
					passed: false,
					message: LOI_JUDGE,
				},
			],
		},
		{
			id: "okr-soan/soan/0003",
			verdict: "scored",
			assertions: [
				{
					name: "judge.autoevals.closedQA [pb-kho-van tc2]",
					score: 0,
					severity: "soft",
					passed: false,
					metadata: { choice: "N" },
				},
			],
		},
	],
};

const CO_BAN = {
	soLanThu: SO_LAN,
	khongGia: 0,
	boQua: 0,
	tyLe: 1,
	tyLeNguong: TRO_LY_OKR_SOAN.danhGia.boiCanh.tyLeThang,
	maEve: 1,
};

describe("eval-soan: tách judge hỏng khỏi chốt mã hỏng", () => {
	test("khuôn lần chạy 5: judge không gọi công cụ là judge hỏng, không phải chốt mã hỏng", () => {
		const phan = phanLoaiHong(docTomTat(JSON.stringify(TOM_TAT_LAN_5)));
		expect(phan.chotMa).toEqual([]);
		expect(phan.judgeHong).toEqual([
			{ id: "okr-soan/soan/0002", nhan: "pb-kd-bac tc1", loi: LOI_JUDGE },
			{
				id: "okr-soan/soan-boi-canh/0000",
				nhan: "boi-canh:onehub#v1",
				loi: LOI_JUDGE,
			},
		]);
		expect(phan.duoiNguong).toEqual([
			{ id: "okr-soan/soan/0002", nhan: "pb-kd-bac tc4", diem: 0 },
			{ id: "okr-soan/soan/0003", nhan: "pb-kho-van tc2", diem: 0 },
		]);
		expect(ketLuanThuoc({ phan, ...CO_BAN }).ma).toBe(2);
	});

	test("một chốt mã đỏ thắng judge hỏng: mã 1, gọi tên chốt", () => {
		const tom = structuredClone(TOM_TAT_LAN_5);
		tom.evals[0]?.assertions.push({
			name: "equals [muc tieu da nhan khong co hang moi cung khoa]",
			score: 0,
			passed: false,
		});
		const phan = phanLoaiHong(docTomTat(JSON.stringify(tom)));
		expect(phan.chotMa).toEqual([
			{
				id: "okr-soan/soan/0000",
				ten: "equals [muc tieu da nhan khong co hang moi cung khoa]",
			},
		]);
		const kl = ketLuanThuoc({ phan, ...CO_BAN });
		expect(kl.ma).toBe(1);
		expect(kl.cau).toContain("chot ma hong 1");
	});

	test("eval lỗi không có chốt nào đỏ vẫn là chốt mã hỏng", () => {
		const phan = phanLoaiHong(
			docTomTat(
				JSON.stringify({
					...TOM_TAT_LAN_5,
					evals: [
						{
							id: "okr-soan/soan/0001",
							verdict: "errored",
							assertions: [],
							error: "ket noi dong",
						},
					],
				}),
			),
		);
		expect(phan.chotMa).toEqual([
			{ id: "okr-soan/soan/0001", ten: "loi: ket noi dong" },
		]);
	});

	test("không judge hỏng: dưới ngưỡng và tỷ lệ thắng thấp là mã 1; sạch là mã 0", () => {
		const phan = { chotMa: [], judgeHong: [], duoiNguong: [] };
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 0 })).toEqual({
			ma: 0,
			cau: null,
		});
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 0, tyLe: 0.6 }).ma).toBe(1);
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 0, boQua: 1 }).ma).toBe(2);
		expect(
			ketLuanThuoc({
				phan: { ...phan, duoiNguong: [{ id: "x", nhan: "tc2", diem: 0 }] },
				...CO_BAN,
			}).ma,
		).toBe(1);
	});
});

describe("eval-soan: số judge và độ trễ theo loại lượt", () => {
	test("dòng judge đọc lại đúng khuôn; thống kê đếm thử lại và hỏng sau cùng", () => {
		const dong = docTongKet(
			[
				{ loai: "judge", lanThu: 1, loi: null },
				{ loai: "judge", lanThu: 2, loi: null },
				{ loai: "judge", lanThu: 3, loi: "khong goi select_choice" },
			]
				.map((d) => JSON.stringify(d))
				.join("\n"),
		);
		expect(
			thongKeJudge(dong.flatMap((d) => (d.loai === "judge" ? [d] : []))),
		).toEqual({
			soLoiGoi: 3,
			phaiThuLai: 2,
			tongLanThu: 6,
			lanThuNhieuNhat: 3,
			hongSauCung: 1,
		});
		expect(thongKeJudge([])).toEqual({
			soLoiGoi: 0,
			phaiThuLai: 0,
			tongLanThu: 0,
			lanThuNhieuNhat: 0,
			hongSauCung: 0,
		});
	});

	test("lượt không gọi công cụ là hỏi–đáp, lượt có gọi là nộp bản nháp", () => {
		const kq = phanViTheoLoaiLuot([
			{ ms: 4_000, soCongCu: 0 },
			{ ms: 30_000, soCongCu: 0 },
			{ ms: 9_000, soCongCu: 1 },
			{ ms: 11_000, soCongCu: 1 },
			{ ms: 67_000, soCongCu: 1 },
		]);
		expect(kq.hoiDap).toEqual({ n: 2, p50: 17_000, p90: 27_400 });
		expect(kq.nopBanNhap.n).toBe(3);
		expect(kq.nopBanNhap.p50).toBe(11_000);
	});
});
