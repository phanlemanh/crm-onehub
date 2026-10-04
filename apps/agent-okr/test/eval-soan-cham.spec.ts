import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { bocModelZdr } from "@crm/ai-okr";
import { wrapLanguageModel } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { boCa } from "../evals/okr-soan/ca";
import {
	type LanJudge,
	loiTraLoiJudge,
	thuLaiJudge,
} from "../evals/okr-soan/judge";
import { phanViTheoLoaiLuot } from "../evals/okr-soan/tinh";
import {
	bangTieuChi,
	CHOT_DO_TRE,
	docSuKienHong,
	docTinDung,
	docTomTat,
	docTomTatTep,
	docTongKet,
	KHONG_HA_TANG,
	ketLuanThuoc,
	ketLuanTinDung,
	ketQuaAB,
	loaiHaTang,
	phanLoaiHaTang,
	phanLoaiHong,
	soChotHong,
	THIEU_TOM_TAT,
	type TomTatChay,
	thieuKetQua,
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
	ab: { thang: 15, daCham: 15, khongCham: 0 },
	tyLeNguong: TRO_LY_OKR_SOAN.danhGia.boiCanh.tyLeThang,
	maEve: 1,
	haTang: KHONG_HA_TANG,
	soChotHong: 0,
	thieu: [],
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
		expect(
			ketLuanThuoc({
				phan,
				...CO_BAN,
				ab: { thang: 7, daCham: 10, khongCham: 5 },
			}).ma,
		).toBe(2);
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
				phienHong: false,
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
			{ id: "okr-soan/soan/0001", ten: "loi: ket noi dong", phienHong: false },
		]);
	});

	test("không judge hỏng: tỷ lệ thắng thấp là mã 1, eval bỏ qua là mã 2, sạch là mã 0", () => {
		const phan = { chotMa: [], judgeHong: [], duoiNguong: [] };
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 0 })).toEqual({
			ma: 0,
			cau: null,
		});
		expect(
			ketLuanThuoc({
				phan,
				...CO_BAN,
				maEve: 0,
				ab: { thang: 9, daCham: 15, khongCham: 0 },
			}).ma,
		).toBe(1);
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 0, boQua: 1 }).ma).toBe(2);
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 1 }).ma).toBe(1);
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

const HT = TRO_LY_OKR_SOAN.danhGia.haTang;
const CAU_NGAN_SACH =
	"API key budget exceeded. Current spend: $20.00, limit: $20.00. Team owners can edit this budget in AI Gateway Budgets & Spend.";
const CHI_TIET_LAN_7 = {
	apiErrorMessage: CAU_NGAN_SACH,
	gatewayName: "GatewayInternalServerError",
	gatewayType: "internal_server_error",
	statusCode: 402,
	upstreamStatusCode: 402,
	upstreamType: "quota_for_entity_exceeded",
	upstreamMessage: CAU_NGAN_SACH,
	responseBodySnippet: `{"error":{"message":"${CAU_NGAN_SACH}","type":"quota_for_entity_exceeded"}}`,
};

function hangHong(sessionId: string, details: Record<string, string | number>) {
	const data = {
		code: "MODEL_CALL_FAILED",
		details,
		message: `GatewayInternalServerError: ${details.apiErrorMessage ?? "loi"}`,
	};
	return HT.suKienHong.map((type) => ({
		sessionId,
		type,
		data:
			type === "session.failed"
				? { ...data, sessionId }
				: { ...data, sequence: 0, turnId: "turn_0" },
	}));
}

const EVAL_LAN_7 = [
	...Array.from(
		{ length: 14 },
		(_, i) => `okr-soan/soan-boi-canh/${String(i + 1).padStart(4, "0")}`,
	),
	...Array.from(
		{ length: 10 },
		(_, i) => `okr-soan/soan-do-tre/${String(i).padStart(4, "0")}`,
	),
	...Array.from(
		{ length: 5 },
		(_, i) => `okr-soan/soan/${String(i).padStart(4, "0")}`,
	),
];

const TOM_TAT_LAN_7 = {
	target: "http://127.0.0.1:64048/",
	passed: 1,
	failed: 29,
	scored: 0,
	skipped: 0,
	errored: 0,
	totalEvals: 30,
	evals: [
		{
			id: "okr-soan/soan-boi-canh/0000",
			verdict: "passed",
			status: "completed",
			assertions: [
				{ name: "equals", score: 1, severity: "gate", passed: true },
			],
		},
		...EVAL_LAN_7.map((id) => ({
			id,
			verdict: "failed",
			status: "completed",
			assertions: [
				{
					name: "equals",
					score: 0,
					severity: "gate",
					passed: false,
					message: 'expected "waiting"; received "failed"',
					metadata: { actual: "failed", expected: "waiting" },
				},
			],
		})),
	],
};

const SU_KIEN_LAN_7 = EVAL_LAN_7.flatMap((id, i) =>
	id.includes("boi-canh")
		? [
				...hangHong(`wrun_${i}a`, CHI_TIET_LAN_7),
				...hangHong(`wrun_${i}b`, CHI_TIET_LAN_7),
			]
		: hangHong(`wrun_${i}`, CHI_TIET_LAN_7),
);

describe("eval-soan: hỏng hạ tầng gateway không phải chốt mã hỏng", () => {
	test("khuôn lần chạy 7: hết ngân sách khoá → mã 2 «khong do duoc», không gọi là chốt mã hỏng", () => {
		const phan = phanLoaiHong(docTomTat(JSON.stringify(TOM_TAT_LAN_7)));
		expect(phan.chotMa.length).toBe(29);
		expect(phan.chotMa.every((c) => c.phienHong)).toBe(true);
		const haTang = phanLoaiHaTang(docSuKienHong(SU_KIEN_LAN_7));
		expect(haTang.soPhien).toBe(43);
		expect(haTang.phienKhac).toBe(0);
		expect(haTang.theoLoai.map((l) => [l.loai, l.soPhien])).toEqual([
			[HT.loai.nganSachKhoa, 43],
		]);
		const kl = ketLuanThuoc({ phan, ...CO_BAN, haTang });
		expect(kl.ma).toBe(2);
		expect(kl.cau).toStartWith(
			`khong do duoc: ${HT.loai.nganSachKhoa} (43 phien)`,
		);
		expect(kl.cau).not.toContain("chot ma hong");
	});

	test("cùng lần chạy mà có một chốt thật đỏ → vẫn mã 1, gọi tên chốt", () => {
		const tom = docTomTat(JSON.stringify(TOM_TAT_LAN_7));
		tom.evals[0]?.assertions.push({
			name: "equals [khong ma loai con lai]",
			score: 0,
			severity: "gate",
			passed: false,
		});
		const phan = phanLoaiHong(tom);
		const haTang = phanLoaiHaTang(docSuKienHong(SU_KIEN_LAN_7));
		const kl = ketLuanThuoc({ phan, ...CO_BAN, haTang });
		expect(kl.ma).toBe(1);
		expect(kl.cau).toContain("chot ma hong 30");
		expect(kl.cau).toContain("equals [khong ma loai con lai]");
	});

	test("phiên hỏng mà không có dấu hạ tầng → mã 1 như cũ", () => {
		const phan = phanLoaiHong(docTomTat(JSON.stringify(TOM_TAT_LAN_7)));
		expect(ketLuanThuoc({ phan, ...CO_BAN }).ma).toBe(1);
		const loiMa = phanLoaiHaTang(
			docSuKienHong(
				EVAL_LAN_7.flatMap((_, i) =>
					hangHong(`wrun_${i}`, {
						apiErrorMessage: "nop_ban_nhap nem loi",
					}).map((h) => ({ ...h, data: { ...h.data, code: "TOOL_FAILED" } })),
				),
			),
		);
		expect(loiMa.soPhien).toBe(0);
		expect(loiMa.phienKhac).toBe(29);
		expect(ketLuanThuoc({ phan, ...CO_BAN, haTang: loiMa }).ma).toBe(1);
	});

	test("một phiên hỏng vì mã lẫn trong phiên hết ngân sách → mã 1", () => {
		const phan = phanLoaiHong(docTomTat(JSON.stringify(TOM_TAT_LAN_7)));
		const haTang = phanLoaiHaTang(
			docSuKienHong([
				...SU_KIEN_LAN_7,
				...hangHong("wrun_ma", { apiErrorMessage: "schema sai" }),
			]),
		);
		expect(haTang.phienKhac).toBe(1);
		expect(ketLuanThuoc({ phan, ...CO_BAN, haTang }).ma).toBe(1);
	});

	test("hạ tầng có hỏng nhưng không eval nào dừng vì phiên → không chặn", () => {
		const phan = { chotMa: [], judgeHong: [], duoiNguong: [] };
		const haTang = phanLoaiHaTang(
			docSuKienHong(hangHong("wrun_x", CHI_TIET_LAN_7)),
		);
		expect(ketLuanThuoc({ phan, ...CO_BAN, maEve: 0, haTang })).toEqual({
			ma: 0,
			cau: null,
		});
	});

	test("phân loại: 402 insufficient_funds, 429, 5xx là hạ tầng; 400 thì không", () => {
		const mot = (details: Record<string, string | number>) => {
			const [dau] = docSuKienHong(hangHong("wrun_1", details));
			if (!dau) throw new Error("thieu su kien");
			return loaiHaTang(dau);
		};
		expect(mot(CHI_TIET_LAN_7)).toBe(HT.loai.nganSachKhoa);
		expect(
			mot({
				statusCode: 402,
				upstreamType: "insufficient_funds",
				apiErrorMessage: "Insufficient funds",
			}),
		).toBe(HT.loai.tinDung);
		expect(mot({ statusCode: 402, apiErrorMessage: "payment required" })).toBe(
			HT.loai.tinDung,
		);
		expect(mot({ statusCode: 429, upstreamType: "rate_limit_exceeded" })).toBe(
			HT.loai.gioiHan,
		);
		expect(
			mot({ statusCode: 503, apiErrorMessage: "upstream unavailable" }),
		).toBe(HT.loai.mayChu);
		expect(
			mot({ statusCode: 400, gatewayType: "invalid_request_error" }),
		).toBeNull();
	});

	test("hàng sự kiện sai khuôn là lỗi thật, không nuốt", () => {
		expect(() =>
			docSuKienHong([
				{ sessionId: "wrun_1", type: "session.failed", data: {} },
			]),
		).toThrow();
	});
});

describe("eval-soan: đọc tín dụng gateway trước khi chạy", () => {
	test("số dư dạng chuỗi; 0 → mã 2 «het tin dung», còn tiền → đi tiếp", () => {
		const het = ketLuanTinDung(
			docTinDung(JSON.stringify({ balance: "0.00", total_used: "20.00" })),
		);
		expect(het.ma).toBe(2);
		expect(het.cau).toStartWith(`khong do duoc: ${HT.loai.tinDung}`);
		expect(
			ketLuanTinDung(
				docTinDung(JSON.stringify({ balance: "3.50", total_used: "16.50" })),
			),
		).toEqual({
			ma: 0,
			cau: null,
		});
		expect(() =>
			docTinDung(JSON.stringify({ balance: "abc", total_used: "1" })),
		).toThrow();
	});
});

const tieuChiLan7 = (ca: string, duoi: number[]) =>
	TRO_LY_OKR_SOAN.danhGia.boiCanh.tieuChi.map((_, i) => ({
		name: `judge.autoevals.closedQA [${ca} tc${i + 1}]`,
		score: duoi.includes(i + 1) ? 0 : 1,
		severity: "soft",
		passed: !duoi.includes(i + 1),
		metadata: { choice: duoi.includes(i + 1) ? "N" : "Y" },
	}));

const TOM_TAT_HOP_DONG: TomTatChay = {
	totalEvals: 3,
	passed: 1,
	failed: 1,
	scored: 1,
	skipped: 0,
	evals: [
		{
			id: "okr-soan/soan/0002",
			verdict: "scored",
			assertions: [
				{
					name: "equals [dich null]",
					score: 1,
					severity: "gate",
					passed: true,
				},
				...tieuChiLan7("pb-kd-bac", [2, 4, 6]),
			],
		},
		{
			id: "okr-soan/soan/0003",
			verdict: "scored",
			assertions: [
				{
					name: "equals [dich null]",
					score: 1,
					severity: "gate",
					passed: true,
				},
				...tieuChiLan7("pb-kho-van", [1, 2, 4]),
			],
		},
		{
			id: "okr-soan/soan-boi-canh/0002",
			verdict: "failed",
			assertions: [
				{
					name: "judge.autoevals.closedQA [boi-canh:pb-kd-bac#v1]",
					score: 0,
					severity: "gate",
					passed: false,
					message: LOI_JUDGE,
				},
			],
		},
	],
};

describe("eval-soan: mã thoát theo hợp đồng (AC-13 / E22)", () => {
	const phan = phanLoaiHong(TOM_TAT_HOP_DONG);

	test("khuôn lần chạy 7: 0 chốt mã hỏng, 14/15 cặp chấm được đều thắng, 6 tiêu chí dưới ngưỡng → mã 0", () => {
		expect(phan.chotMa).toEqual([]);
		expect(phan.duoiNguong.length).toBe(6);
		expect(phan.judgeHong.map((h) => h.nhan)).toEqual([
			"boi-canh:pb-kd-bac#v1",
		]);
		expect(
			ketLuanThuoc({
				phan,
				...CO_BAN,
				ab: { thang: 14, daCham: 14, khongCham: 1 },
				soChotHong: soChotHong(TOM_TAT_HOP_DONG),
			}),
		).toEqual({ ma: 0, cau: null });
	});

	test("khuôn lần chạy 7 thêm một chốt hỏng không xếp được → mã 1", () => {
		const tom = structuredClone(TOM_TAT_HOP_DONG);
		tom.evals[0]?.assertions.push({
			name: "judge.autoevals.factuality [la]",
			score: 0,
			severity: "soft",
			passed: false,
			metadata: { choice: "C" },
		});
		const phanThem = phanLoaiHong(tom);
		expect(phanThem.chotMa.map((c) => c.ten)).toEqual([
			"judge.autoevals.factuality [la]",
		]);
		const kl = ketLuanThuoc({
			phan: phanThem,
			...CO_BAN,
			ab: { thang: 14, daCham: 14, khongCham: 1 },
			soChotHong: soChotHong(tom),
		});
		expect(kl.ma).toBe(1);
	});

	test("eve thoát khác 0 mà số chốt hỏng trong summary khác số đã xếp chẩn đoán → mã 1", () => {
		const kl = ketLuanThuoc({
			phan,
			...CO_BAN,
			ab: { thang: 14, daCham: 14, khongCham: 1 },
			soChotHong: soChotHong(TOM_TAT_HOP_DONG) + 1,
		});
		expect(kl.ma).toBe(1);
		expect(kl.cau).toContain("khong ro nguyen nhan: 8 chot hong");
	});

	test("eval hỏng mà không có chốt nào đỏ → chốt mã hỏng, mã 1", () => {
		const tom = structuredClone(TOM_TAT_HOP_DONG);
		tom.evals.push({
			id: "okr-soan/soan-do-tre/0009",
			verdict: "failed",
			assertions: [],
		});
		expect(
			ketLuanThuoc({
				phan: phanLoaiHong(tom),
				...CO_BAN,
				ab: { thang: 14, daCham: 14, khongCham: 1 },
				soChotHong: soChotHong(tom),
			}).ma,
		).toBe(1);
	});

	test("cùng khuôn mà 5 cặp không chấm được, gói thắng 7/10 → mã 2, kết luận có thể đổi", () => {
		const kl = ketLuanThuoc({
			phan,
			...CO_BAN,
			ab: { thang: 7, daCham: 10, khongCham: 5 },
		});
		expect(kl.ma).toBe(2);
		expect(kl.cau).toStartWith("judge hong, ket luan co the doi");
		expect(kl.cau).toContain("xau nhat 47 %, tot nhat 80 %");
	});

	test("không chấm được mà dù thắng hết vẫn dưới 70 % → mã 1", () => {
		expect(
			ketLuanThuoc({
				phan,
				...CO_BAN,
				ab: { thang: 4, daCham: 12, khongCham: 3 },
			}).ma,
		).toBe(1);
	});

	test("một chốt mã đỏ → mã 1 dù A/B đạt", () => {
		const tom = structuredClone(TOM_TAT_HOP_DONG);
		tom.evals[0]?.assertions.push({
			name: "equals [khong ma loai con lai]",
			score: 0,
			severity: "gate",
			passed: false,
		});
		const kl = ketLuanThuoc({
			phan: phanLoaiHong(tom),
			...CO_BAN,
			ab: { thang: 14, daCham: 14, khongCham: 1 },
		});
		expect(kl.ma).toBe(1);
		expect(kl.cau).toContain("equals [khong ma loai con lai]");
	});

	test("ketQuaAB: tỷ lệ trên cặp chấm được, xấu nhất và tốt nhất", () => {
		expect(ketQuaAB({ thang: 14, daCham: 14, khongCham: 1 }, 0.7)).toEqual({
			tyLeDaCham: 1,
			tyLeXauNhat: 14 / 15,
			tyLeTotNhat: 1,
			dat: true,
			coTheDoi: false,
		});
		expect(ketQuaAB({ thang: 0, daCham: 0, khongCham: 0 }, 0.7).dat).toBe(
			false,
		);
	});

	test("bangTieuChi in sáu cột mỗi ca, judge hỏng thành ô trống", () => {
		const tom = structuredClone(TOM_TAT_HOP_DONG);
		const dau = tom.evals[0]?.assertions[1];
		if (dau) dau.metadata = null;
		expect(bangTieuChi(tom)).toEqual([
			{ ca: "pb-kd-bac", diem: [null, 0, 1, 0, 1, 0] },
			{ ca: "pb-kho-van", diem: [0, 0, 1, 0, 1, 1] },
		]);
	});
});

const CAN_KET_QUA = {
	soan: boCa().length,
	boiCanh: TRO_LY_OKR_SOAN.danhGia.boiCanh.soCapMacDinh,
	doTre: TRO_LY_OKR_SOAN.danhGia.doTre.soCuoc,
};
const so4 = (i: number) => String(i).padStart(4, "0");
const chotQua = (moTa: string) => ({
	name: `satisfies(${moTa})`,
	score: 1,
	severity: "gate",
	passed: true,
});

function tomTatDu(): TomTatChay {
	const evals: TomTatChay["evals"] = [
		...Array.from({ length: CAN_KET_QUA.soan }, (_, i) => ({
			id: `okr-soan/soan/${so4(i)}`,
			verdict: "passed",
			assertions: [chotQua("co ban nhap")],
		})),
		...Array.from({ length: CAN_KET_QUA.boiCanh }, (_, i) => ({
			id: `okr-soan/soan-boi-canh/${so4(i)}`,
			verdict: i === 2 ? "failed" : "passed",
			assertions: [
				i === 2
					? {
							name: `judge.autoevals.closedQA [boi-canh:ca#v${i}]`,
							score: 0,
							severity: "gate",
							passed: false,
							message: LOI_JUDGE,
						}
					: {
							name: `judge.autoevals.closedQA [boi-canh:ca#v${i}]`,
							score: 1,
							severity: "soft",
							passed: true,
							metadata: { choice: "Y" },
						},
			],
		})),
		...Array.from({ length: CAN_KET_QUA.doTre }, (_, i) => ({
			id: `okr-soan/soan-do-tre/${so4(i)}`,
			verdict: "passed",
			assertions: [
				chotQua(CHOT_DO_TRE.usd),
				...(i === CAN_KET_QUA.doTre - 1
					? [chotQua(CHOT_DO_TRE.p50), chotQua(CHOT_DO_TRE.p90)]
					: []),
			],
		})),
	];
	return {
		totalEvals: evals.length,
		passed: evals.length - 1,
		failed: 1,
		scored: 0,
		skipped: 0,
		evals,
	};
}

function ketLuanCua(tom: TomTatChay) {
	return ketLuanThuoc({
		phan: phanLoaiHong(tom),
		...CO_BAN,
		ab: { thang: 14, daCham: 14, khongCham: 1 },
		soChotHong: soChotHong(tom),
		thieu: thieuKetQua(tom, CAN_KET_QUA),
	});
}

const ID_CUOI = `okr-soan/soan-do-tre/${so4(CAN_KET_QUA.doTre - 1)}`;

describe("eval-soan: đủ kết quả theo id eval trong summary", () => {
	test("đủ 5 soạn, 15 A/B, 10 độ trễ, có p50/p90/chi phí → mã 0", () => {
		expect(thieuKetQua(tomTatDu(), CAN_KET_QUA)).toEqual([]);
		expect(ketLuanCua(tomTatDu())).toEqual({ ma: 0, cau: null });
	});

	test("mất eval độ trễ cuối → mã 2, gọi tên id và hai chốt p50/p90", () => {
		const tom = tomTatDu();
		tom.evals = tom.evals.filter((e) => e.id !== ID_CUOI);
		const kl = ketLuanCua(tom);
		expect(kl.ma).toBe(2);
		expect(kl.cau).toContain(`thieu ket qua: ${ID_CUOI}`);
		expect(kl.cau).toContain(CHOT_DO_TRE.p50);
		expect(kl.cau).toContain(CHOT_DO_TRE.p90);
	});

	test("còn eval cuối mà thiếu chốt p50/p90 → mã 2, gọi tên hai chốt", () => {
		const tom = tomTatDu();
		const cuoi = tom.evals.find((e) => e.id === ID_CUOI);
		if (cuoi)
			cuoi.assertions = cuoi.assertions.filter(
				(a) => !a.name.includes("p50") && !a.name.includes("p90"),
			);
		expect(thieuKetQua(tom, CAN_KET_QUA)).toEqual([
			`okr-soan/soan-do-tre/ ${CHOT_DO_TRE.p50}`,
			`okr-soan/soan-do-tre/ ${CHOT_DO_TRE.p90}`,
		]);
		expect(ketLuanCua(tom).ma).toBe(2);
	});

	test("11 dòng độ trễ, một dòng lặp và mất dòng thứ 10 → mã 2", () => {
		const tom = tomTatDu();
		const lap = tom.evals.find((e) => e.id === "okr-soan/soan-do-tre/0008");
		tom.evals = tom.evals.filter((e) => e.id !== ID_CUOI);
		if (lap) tom.evals.push(structuredClone(lap), structuredClone(lap));
		expect(
			tom.evals.filter((e) => e.id.startsWith("okr-soan/soan-do-tre/")).length,
		).toBe(11);
		const kl = ketLuanCua(tom);
		expect(kl.ma).toBe(2);
		expect(kl.cau).toContain(ID_CUOI);
	});

	test("một eval độ trễ thiếu chốt chi phí → mã 2", () => {
		const tom = tomTatDu();
		const dau = tom.evals.find((e) => e.id === "okr-soan/soan-do-tre/0000");
		if (dau) dau.assertions = [];
		expect(thieuKetQua(tom, CAN_KET_QUA)).toEqual([
			`okr-soan/soan-do-tre/0000 ${CHOT_DO_TRE.usd}`,
		]);
	});

	test("không có summary.json → mã 2 «thieu ket qua: summary.json»", () => {
		expect(
			docTomTatTep(join(import.meta.dir, "khong-co", "summary.json")),
		).toEqual({ ketLuan: THIEU_TOM_TAT });
		expect(THIEU_TOM_TAT.ma).toBe(2);
		expect(THIEU_TOM_TAT.cau).toStartWith("thieu ket qua: summary.json");
	});
});
