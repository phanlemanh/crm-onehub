import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { stripVTControlCharacters } from "node:util";
import { VAN_TAY_MODEL } from "./cau-hinh.mjs";

const GOC = resolve(import.meta.dir, "..", "..");
const AGENT = join(GOC, "apps", "agent");
const yeuCau = createRequire(join(AGENT, "package.json"));
const { generateText } = yeuCau("ai") as typeof import("ai");
const { createGateway } = yeuCau(
	"@ai-sdk/gateway",
) as typeof import("@ai-sdk/gateway");
const { DEFAULT_AGENT_MODEL } = await import(
	join(GOC, "packages/db/src/settings.ts")
);
const { TAI_LIEU_AGENT } = await import(
	join(AGENT, "agent/lib/tai-lieu-config.ts")
);
const { modelTaiLieu } = await import(
	join(AGENT, "agent/lib/tai-lieu-model.ts")
);
const { TRO_LY_OKR } = await import(join(AGENT, "agent/lib/okr/config.ts"));
const { MO_HINH_DANG_CHAY } = await import(
	join(AGENT, "agent/lib/okr/mo-hinh-thu.ts")
);
const { moHinhTroLyOkr } = await import(
	join(AGENT, "agent/lib/okr/mo-hinh.ts")
);

type LoiDo = {
	nhan: string;
	ma: string;
	khoa: (string | undefined)[];
	model: () => Parameters<typeof generateText>[0]["model"];
};

const env = process.env;
const chung = env.AI_GATEWAY_API_KEY;

const cacLoiDo: LoiDo[] = [
	{
		nhan: "agent-goc",
		ma: DEFAULT_AGENT_MODEL.id,
		khoa: [chung],
		model: () => createGateway()(DEFAULT_AGENT_MODEL.id),
	},
	...(["soan", "hoi"] as const).map((viec) => ({
		nhan: `tai-lieu-${viec}`,
		ma: TAI_LIEU_AGENT[viec].maModel,
		khoa: [env[TAI_LIEU_AGENT[viec].bienKhoaRieng], chung],
		model: () => modelTaiLieu(viec).model,
	})),
	...TRO_LY_OKR.moHinhThu.danhSach.map(
		(muc: (typeof TRO_LY_OKR.moHinhThu.danhSach)[number]) => ({
			nhan: "tro-ly-okr",
			ma: muc.ma,
			khoa: [env[TRO_LY_OKR.khoa.rieng], chung],
			model: () => moHinhTroLyOkr(env, createGateway, undefined, muc),
		}),
	),
];

const biMat = [chung, ...cacLoiDo.flatMap((d) => d.khoa)].filter(
	(k): k is string => Boolean(k?.trim()),
);

const che = (chu: string) =>
	stripVTControlCharacters(
		biMat.reduce((c, k) => c.split(k).join("***"), chu),
	).split("\n")[0];

async function do1(d: LoiDo): Promise<string> {
	if (!d.khoa.some((k) => k?.trim()))
		return `${d.nhan} ${d.ma} -> ${VAN_TAY_MODEL.khongKhoa}`;
	const kq = await generateText({
		model: d.model(),
		prompt: VAN_TAY_MODEL.loiDo,
		maxOutputTokens: VAN_TAY_MODEL.toiDaToken,
		maxRetries: 0,
		abortSignal: AbortSignal.timeout(VAN_TAY_MODEL.choMoiModelMs),
	});
	const id = kq.response.modelId?.trim();
	if (!id) throw new Error("khong co modelId");
	return `${d.nhan} ${d.ma} -> ${id}`;
}

const ketQua = await Promise.allSettled(cacLoiDo.map(do1));
const hong = ketQua.flatMap((k, i) =>
	k.status === "rejected"
		? [
				`${cacLoiDo[i]?.nhan} ${cacLoiDo[i]?.ma}: ${che(k.reason instanceof Error ? k.reason.message : String(k.reason))}`,
			]
		: [],
);
if (hong.length > 0) {
	for (const dong of hong) console.error(`van-tay-model: ${dong}`);
	process.exit(1);
}

const khoaGoi = createHash("sha256")
	.update(readFileSync(join(GOC, VAN_TAY_MODEL.tepKhoaGoi)))
	.digest("hex");

console.log(`${VAN_TAY_MODEL.tepKhoaGoi} ${khoaGoi}`);
console.log(`bun ${Bun.version}`);
console.log(`tro-ly-okr dang-chay ${MO_HINH_DANG_CHAY.ma}`);
for (const k of ketQua) if (k.status === "fulfilled") console.log(k.value);
