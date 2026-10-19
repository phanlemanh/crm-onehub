import { describe, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { createGateway } from "@ai-sdk/gateway";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import { modelChoBuocGoc, modelChoPhienGoc } from "../agent/lib/model";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import {
	kepTranTomTat,
	type MoHinhSong,
	moHinhTroLyOkr,
} from "../agent/lib/okr/mo-hinh";
import {
	chonMoHinhTroLyOkr,
	type MucMoHinh,
} from "../agent/lib/okr/mo-hinh-thu";

const BIEN = TRO_LY_OKR.moHinhThu.bien;
const [GEMINI, HAIKU] = TRO_LY_OKR.moHinhThu.danhSach;
const MOI = join(import.meta.dir, "support", "mo-hinh-thu-moi.ts");
const VAI = ["gopY", "tomTat", "phienGoc", "buocGoc"] as const;
const TRAN_TOM_TAT = TRO_LY_OKR.tranRaTomTatMoiLoiGoi;
const TRAN_LON = 1_000_000;

type Vai = (typeof VAI)[number];
type Goi = Parameters<MockLanguageModelV4["doGenerate"]>[0];
type KetVai = {
	ma: string | null;
	tran: number | null;
	cuaSo: number | null;
	providerOptions: Goi["providerOptions"] | null;
};

const ctxOkr = {
	session: {
		auth: { current: { attributes: { purpose: "okr" } }, initiator: null },
	},
} as never;

const moHinhGoiDuoc = z.custom<MoHinhSong>(
	(v) => v instanceof Object && "doGenerate" in v,
	"thk: vai khong co model goi duoc",
);

function hong(dieuKien: boolean, thongDiep: string) {
	if (dieuKien) throw new Error(thongDiep);
}

function gatewayGia() {
	const ma: string[] = [];
	const goi: Goi[] = [];
	const gia = new MockLanguageModelV4({
		doGenerate: async (vao) => {
			goi.push(vao);
			return {} as never;
		},
	});
	const tao = (() => (id: string) => {
		ma.push(id);
		return gia;
	}) as unknown as typeof createGateway;
	return { tao, ma, goi };
}

async function goiThat(
	model: MoHinhSong | string | undefined,
	gw: ReturnType<typeof gatewayGia>,
) {
	await moHinhGoiDuoc.parse(model).doGenerate({
		prompt: [],
		maxOutputTokens: TRAN_LON,
	});
	const vao = gw.goi.at(-1);
	return {
		ma: gw.ma.at(-1) ?? null,
		tran: vao?.maxOutputTokens ?? null,
		providerOptions: vao?.providerOptions ?? null,
	};
}

async function chayVai(vai: Vai, muc: MucMoHinh): Promise<KetVai> {
	const gw = gatewayGia();
	if (vai === "gopY")
		return {
			...(await goiThat(moHinhTroLyOkr({}, gw.tao, undefined, muc), gw)),
			cuaSo: null,
		};
	if (vai === "tomTat")
		return {
			...(await goiThat(moHinhTroLyOkr({}, gw.tao, kepTranTomTat, muc), gw)),
			cuaSo: null,
		};
	if (vai === "buocGoc") {
		const buoc = modelChoBuocGoc(ctxOkr, gw.tao, {}, muc);
		return {
			...(await goiThat(buoc?.model, gw)),
			cuaSo: buoc?.modelContextWindowTokens ?? null,
		};
	}
	const goc = await modelChoPhienGoc(ctxOkr, muc);
	return {
		ma: goc?.model ?? null,
		tran: null,
		cuaSo: goc?.modelContextWindowTokens ?? null,
		providerOptions: (goc?.modelOptions?.providerOptions ?? null) as never,
	};
}

function tranMong(vai: Vai, muc: MucMoHinh): number | null {
	if (vai === "phienGoc") return null;
	return vai === "tomTat" ? TRAN_TOM_TAT : muc.tranRaMoiLoiGoi;
}

function cuaSoMong(vai: Vai, muc: MucMoHinh): number | null {
	return vai === "phienGoc" || vai === "buocGoc" ? muc.cuaSoNguCanh : null;
}

function chayMoi(giaTri: string | undefined) {
	const phien = `thk-${randomUUID()}`;
	const { [BIEN]: _bo, ...goc } = process.env;
	const env = giaTri === undefined ? goc : { ...goc, [BIEN]: giaTri };
	const r = Bun.spawnSync([process.execPath, MOI, phien], {
		cwd: join(import.meta.dir, ".."),
		env,
	});
	return {
		ma: r.exitCode,
		stdout: r.stdout.toString(),
		stderr: r.stderr.toString(),
	};
}

function docMoi(out: string): Record<string, string | number | null> {
	const dong = out.trim().split("\n").at(-1) ?? "{}";
	return JSON.parse(dong) as Record<string, string | number | null>;
}

function kiemNapMoi(
	ket: Record<string, string | number | null>,
	muc: MucMoHinh,
	nhan: string,
) {
	hong(
		ket.tranGopY !== muc.tranRaMoiLoiGoi,
		`thk: ${nhan} tran gop y khi nap ${ket.tranGopY}, mong ${muc.tranRaMoiLoiGoi}`,
	);
	for (const vai of ["cuaSoGopY", "cuaSoTomTat"] as const)
		hong(
			ket[vai] !== muc.cuaSoNguCanh,
			`thk: ${nhan} ${vai} khi nap ${ket[vai]}, mong ${muc.cuaSoNguCanh}`,
		);
}

describe("thk-mac-dinh", () => {
	const NGUON = [
		{ ten: "rong", env: {} },
		{ ten: "gemini-tuong-minh", env: { [BIEN]: GEMINI.ma } },
	] as const;

	test("2 nguon x 4 vai deu chay Gemini 3.8 Flash voi tran va cua so cu", async () => {
		let soO = 0;
		for (const nguon of NGUON) {
			const muc = chonMoHinhTroLyOkr(nguon.env);
			for (const vai of VAI) {
				soO++;
				const ket = await chayVai(vai, muc);
				hong(
					ket.ma !== GEMINI.ma,
					`thk: mac dinh doi model ${nguon.ten} ${vai}`,
				);
				hong(
					ket.tran !== tranMong(vai, GEMINI) ||
						ket.cuaSo !== cuaSoMong(vai, GEMINI) ||
						(vai !== "tomTat" && vai !== "phienGoc" && ket.tran !== 2_000) ||
						(cuaSoMong(vai, GEMINI) !== null && ket.cuaSo !== 1_048_576),
					`thk: mac dinh doi tran ${nguon.ten} ${vai}`,
				);
			}
		}
		hong(soO !== NGUON.length * VAI.length, `thk: thieu o ${soO}`);
		hong(
			JSON.stringify(chonMoHinhTroLyOkr({ [BIEN]: GEMINI.ma })) !==
				JSON.stringify(chonMoHinhTroLyOkr({})),
			"thk: gemini tuong minh lech mac dinh",
		);
	});

	test("tien trinh con khong dat bien ghi model phien Gemini", () => {
		const r = chayMoi(undefined);
		hong(
			r.ma !== 0,
			`thk: mac dinh ghi sai model phien (ma ${r.ma}: ${r.stderr.slice(-300)})`,
		);
		const ket = docMoi(r.stdout);
		hong(
			ket.ghiModelPhien !== GEMINI.ma,
			"thk: mac dinh ghi sai model phien rong",
		);
		for (const vai of VAI)
			hong(ket[vai] !== GEMINI.ma, `thk: mac dinh doi model rong ${vai}`);
		kiemNapMoi(ket, GEMINI, "mac dinh");
	});
});

describe("thk-haiku", () => {
	test("4 vai goi Haiku voi ZDR, the, tran va cua so cua Haiku, khong suy nghi rieng", async () => {
		const muc = chonMoHinhTroLyOkr({
			[BIEN]: HAIKU.ma,
			NODE_ENV: "development",
		});
		for (const vai of VAI) {
			const ket = await chayVai(vai, muc);
			hong(ket.ma !== HAIKU.ma, `thk: haiku khong toi ${vai}`);
			const gw = (
				ket.providerOptions as {
					gateway?: { zeroDataRetention?: boolean; tags?: string[] };
				} | null
			)?.gateway;
			hong(
				gw?.zeroDataRetention !== true ||
					!gw.tags?.includes(TRO_LY_OKR.tags[0]),
				`thk: haiku mat zdr ${vai}`,
			);
			hong(
				Boolean(ket.providerOptions?.anthropic),
				`thk: haiku co suy nghi rieng ${vai}`,
			);
			hong(
				ket.tran !== tranMong(vai, HAIKU) ||
					ket.cuaSo !== cuaSoMong(vai, HAIKU) ||
					(vai === "gopY" && ket.tran !== 4_000) ||
					(cuaSoMong(vai, HAIKU) !== null && ket.cuaSo !== 1_000_000),
				`thk: haiku sai tran ${vai}`,
			);
		}
	});

	test("tien trinh con nhan bien: 4 vai va model phien deu la Haiku", () => {
		const r = chayMoi(HAIKU.ma);
		hong(
			r.ma !== 0,
			`thk: tien trinh con khong nhan bien (ma ${r.ma}: ${r.stderr.slice(-300)})`,
		);
		const ket = docMoi(r.stdout);
		for (const vai of VAI)
			hong(ket[vai] !== HAIKU.ma, `thk: tien trinh con khong nhan bien ${vai}`);
		hong(ket.ghiModelPhien !== HAIKU.ma, "thk: haiku ghi sai model phien");
		kiemNapMoi(ket, HAIKU, "haiku");
	});
});

describe("thk-gia-tri-la", () => {
	const LA = ["zai/glm-5.2-fast", "   ", "ANTHROPIC/CLAUDE-HAIKU-5.5"] as const;

	test("gia tri ngoai danh sach thi nem, goi ten bien, gia tri va hai ma", () => {
		let soCa = 0;
		for (const giaTri of LA) {
			soCa++;
			let loi: Error | null = null;
			try {
				chonMoHinhTroLyOkr({ [BIEN]: giaTri, NODE_ENV: "development" });
			} catch (e) {
				loi = e instanceof Error ? e : new Error(String(e));
			}
			hong(loi === null, `thk: gia tri la lui lang ${giaTri}`);
			const tin = loi?.message ?? "";
			hong(
				!tin.includes(BIEN) ||
					!tin.includes(giaTri) ||
					!tin.includes(GEMINI.ma) ||
					!tin.includes(HAIKU.ma),
				`thk: loi khong goi ten ${giaTri}`,
			);
		}
		hong(soCa !== 3, `thk: thieu ca la ${soCa}`);
		for (const muc of [GEMINI, HAIKU])
			hong(
				JSON.stringify(
					chonMoHinhTroLyOkr({ [BIEN]: muc.ma, NODE_ENV: "development" }),
				) !== JSON.stringify(muc),
				`thk: ma hop le tra sai muc ${muc.ma}`,
			);
	});

	test("nap mo-dun voi gia tri la thi tien trinh khong len", () => {
		const r = chayMoi("zai/glm-5.2-fast");
		hong(
			r.ma === 0 || !r.stderr.includes(BIEN),
			"thk: nap module khong chan gia tri la",
		);
	});
});

describe("thk-production", () => {
	test("production bo qua bien, ke ca gia tri la", () => {
		for (const giaTri of [HAIKU.ma, "zai/glm-5.2-fast"]) {
			let muc: MucMoHinh | null = null;
			try {
				muc = chonMoHinhTroLyOkr({ [BIEN]: giaTri, NODE_ENV: "production" });
			} catch {
				throw new Error(`thk: production nem loi ${giaTri}`);
			}
			hong(
				JSON.stringify(muc) !== JSON.stringify(GEMINI),
				`thk: production doc bien ${giaTri}`,
			);
		}
	});
});
