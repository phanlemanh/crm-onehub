import type { createGateway } from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import { modelChoBuocGoc, modelChoPhienGoc } from "../../agent/lib/model";
import { modelPhienDaGhi } from "../../agent/lib/model-phien";
import { chonMoHinhTheoViec } from "../../agent/lib/okr/chon-mo-hinh";
import { TRO_LY_OKR } from "../../agent/lib/okr/config";
import {
	MO_HINH_TOM_TAT,
	MO_HINH_TRO_LY_OKR,
	type MoHinhSong,
	moHinhTroLyOkr,
} from "../../agent/lib/okr/mo-hinh";
import troLyOkr from "../../agent/subagents/tro_ly_okr/agent";

const CHO_GHI = { soLan: 40, cachMs: 50 } as const;
const TRAN_LON = 1_000_000;

const phien = process.argv[2] ?? "thk-moi";
const ctx = {
	session: {
		id: phien,
		auth: { current: { attributes: { purpose: "okr" } }, initiator: null },
	},
};
type SuKien = (event: Record<string, never>, ngu: typeof ctx) => unknown;
const moHinh = z.custom<MoHinhSong>(
	(v) => v instanceof Object && "modelId" in v,
);
const ma = (m: MoHinhSong | string | undefined) => {
	const doc = moHinh.safeParse(m);
	return doc.success ? doc.data.modelId : null;
};

async function tranGopYKhiNap(): Promise<number | null> {
	const goi: Parameters<MockLanguageModelV4["doGenerate"]>[0][] = [];
	const gia = new MockLanguageModelV4({
		doGenerate: async (vao) => {
			goi.push(vao);
			return {} as never;
		},
	});
	const tao = (() => () => gia) as unknown as typeof createGateway;
	await moHinhTroLyOkr({}, tao).doGenerate({
		prompt: [],
		maxOutputTokens: TRAN_LON,
	});
	return goi.at(-1)?.maxOutputTokens ?? null;
}

try {
	const goc = await modelChoPhienGoc(ctx as never);
	const buoc = modelChoBuocGoc(ctx as never);
	const dinhNghia = troLyOkr as unknown as {
		model: { events: Record<string, SuKien> };
		modelContextWindowTokens: number;
	};
	const model = dinhNghia.model;
	const tomTat = await chonMoHinhTheoViec(
		ctx as never,
		async () => ({ kind: TRO_LY_OKR.loaiViecTomTat }) as never,
	);
	await model.events["step.started"]?.({}, ctx);
	let daGhi: string | null = null;
	for (let i = 0; i < CHO_GHI.soLan && !daGhi; i++) {
		daGhi = await modelPhienDaGhi(phien);
		if (!daGhi) await Bun.sleep(CHO_GHI.cachMs);
	}
	console.log(
		JSON.stringify({
			gopY: ma(MO_HINH_TRO_LY_OKR),
			tomTat: ma(MO_HINH_TOM_TAT),
			phienGoc: goc?.model ?? null,
			buocGoc: ma(buoc?.model),
			ghiModelPhien: daGhi,
			tranGopY: await tranGopYKhiNap(),
			cuaSoGopY: dinhNghia.modelContextWindowTokens,
			cuaSoTomTat: tomTat?.modelContextWindowTokens ?? null,
		}),
	);
} finally {
	await db.$disconnect();
}
