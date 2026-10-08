import { describe, expect, test } from "bun:test";
import { parseZaloGetUpdates } from "@crm/validation/zalo-update";
import {
	guiZalo,
	LoiHttpZalo,
	moTaLoiZalo,
	zaloGoi,
} from "../agent/lib/zalo-api";
import { ZALO } from "../agent/lib/zalo-config";

const GHIM = "ghim-ly-do-h4";
const TOKEN = "111:tok-h4";

function phanHoiChu(status: number, chu: string): typeof fetch {
	return (async () => new Response(chu, { status })) as unknown as typeof fetch;
}

function phanHoi(
	status: number,
	than: Record<string, string | number | boolean>,
): typeof fetch {
	return phanHoiChu(status, JSON.stringify(than));
}

function mangHong(code: string, message: string): typeof fetch {
	return (async () => {
		throw Object.assign(new Error(message), { code });
	}) as unknown as typeof fetch;
}

async function moTaKhiGui(fetcher: typeof fetch): Promise<string> {
	try {
		await guiZalo(TOKEN, "chat-h4", "chu-h4", { fetcher });
	} catch (loi) {
		if (loi instanceof Error) return moTaLoiZalo(loi);
		throw new Error("loi khong phai Error");
	}
	throw new Error("gui khong hong");
}

const thanLoi = (ma: number) => ({
	ok: false,
	error_code: ma,
	description: GHIM,
});

type DongMoTa = readonly [string, typeof fetch, string];

const MA_TRAN_MO_TA = [
	["200 ok-false", phanHoi(200, thanLoi(403)), `zalo-tu-choi 403 «${GHIM}»`],
	["200 ok-false trong", phanHoi(200, { ok: false }), "zalo-tu-choi - «-»"],
	["200 than la", phanHoi(200, { la: 1, ket: 2 }), "hinh-dang-la khoa=la,ket"],
	[
		"http 400",
		phanHoi(400, thanLoi(400)),
		`http-400 zalo-tu-choi 400 «${GHIM}»`,
	],
	[
		"http 401",
		phanHoi(401, thanLoi(401)),
		`http-401 zalo-tu-choi 401 «${GHIM}»`,
	],
	[
		"http 403",
		phanHoi(403, thanLoi(403)),
		`http-403 zalo-tu-choi 403 «${GHIM}»`,
	],
	[
		"http 404",
		phanHoi(404, thanLoi(404)),
		`http-404 zalo-tu-choi 404 «${GHIM}»`,
	],
	[
		"http 408",
		phanHoi(408, thanLoi(408)),
		`http-408 zalo-tu-choi 408 «${GHIM}»`,
	],
	[
		"http 429",
		phanHoi(429, thanLoi(429)),
		`http-429 zalo-tu-choi 429 «${GHIM}»`,
	],
	["http 500 chu", phanHoiChu(500, "<html>loi</html>"), "http-500"],
	["mang", mangHong("ECONNRESET", "socket"), "mang (ECONNRESET)"],
	[
		"dai",
		phanHoi(200, {
			ok: false,
			error_code: 403,
			description: "x".repeat(ZALO.nhatKy.tranMoTa + 50),
		}),
		`zalo-tu-choi 403 «${"x".repeat(ZALO.nhatKy.tranMoTa)}»`,
	],
] as const satisfies readonly DongMoTa[];

describe("mo-ta", () => {
	test("ma trận viết trước: mười hai phản hồi hỏng của sendMessage", async () => {
		let chay = 0;
		for (const [ten, fetcher, mong] of MA_TRAN_MO_TA) {
			const thuc = await moTaKhiGui(fetcher);
			chay++;
			if (ten === "dai" && thuc !== mong)
				throw new Error("dai: khong cat o tran");
			if (ten.startsWith("http 4") && !thuc.includes(GHIM))
				throw new Error(`${ten}: mat description`);
			if (thuc !== mong) throw new Error(`${ten}: mo ta ${thuc} khac ${mong}`);
		}
		expect(chay).toBe(12);
	});
});

describe("408", () => {
	test("getUpdates 408 vẫn là hết tin; sendMessage 408 là lỗi http-408", async () => {
		const tho = await zaloGoi(
			phanHoi(408, thanLoi(408)),
			TOKEN,
			ZALO.poll.lenhKeo,
			{},
		);
		expect(parseZaloGetUpdates(tho).loai).toBe("het");
		const loi = await zaloGoi(
			phanHoi(408, thanLoi(408)),
			TOKEN,
			"sendMessage",
			{},
		).then(
			() => null,
			(e: Error) => e,
		);
		if (!(loi instanceof LoiHttpZalo))
			throw new Error("408 sendMessage bi cho lot");
		expect(loi.status).toBe(408);
		expect(moTaLoiZalo(loi).startsWith("http-408")).toBe(true);
	});
});
