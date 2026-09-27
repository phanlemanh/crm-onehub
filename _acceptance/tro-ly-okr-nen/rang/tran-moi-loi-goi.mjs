import { join } from "node:path";
import { AGENT, chayMau, taoKho, xoaKho } from "./mau-chung.mjs";

const { gateway, generateText } = await import(Bun.resolveSync("ai", AGENT));

const { TRO_LY_OKR } = await import(join(AGENT, "agent/lib/okr/config.ts"));
const { MO_HINH_TRO_LY_OKR, TUY_CHON_MO_HINH } = await import(
	join(AGENT, "agent/lib/okr/mo-hinh.ts")
);

const TRAN = TRO_LY_OKR.tranRaMoiLoiGoi;
const CAU =
	"Write a 3000-word story in English about an invented river town. Use many chapters. Do not summarise and do not stop early. The facts are invented: the town is called Lanh, it has 412 people and one ferry.";

if (
	!process.env.AI_GATEWAY_API_KEY?.trim() &&
	!process.env.VERCEL_OIDC_TOKEN?.trim()
) {
	console.log("khong co khoa mo hinh");
	process.exit(2);
}

async function goi(model) {
	const r = await generateText({
		model,
		prompt: CAU,
		providerOptions: TUY_CHON_MO_HINH.providerOptions,
	});
	const gw = r.providerMetadata?.gateway ?? {};
	return {
		outputTokens: r.usage.outputTokens ?? null,
		reasoningTokens: r.usage.reasoningTokens ?? null,
		zdr:
			gw.enabledZeroDataRetention ??
			gw.zeroDataRetention ??
			gw.routing?.enabledZeroDataRetention ??
			null,
		nhaCungCap:
			gw.routing?.finalProvider ?? gw.routing?.resolvedProvider ?? null,
		finishReason: r.finishReason,
	};
}

const daBoc = await goi(MO_HINH_TRO_LY_OKR);
const tran = await goi(gateway(TRO_LY_OKR.model));

const KHO = "tln-e12";
let trongEve = null;
try {
	const url = taoKho(KHO);
	const r = chayMau({
		ten: "e12-dai",
		kichBan: "dai",
		url,
		env: { MAU_PURPOSE: "research" },
	});
	const buoc = r.ghi.filter(
		(g) => g.ten === "dai_mau" && g.event?.type === "step.completed",
	);
	trongEve = {
		soBuoc: buoc.length,
		outputTokens: buoc.map((b) => b.event.data?.usage?.outputTokens ?? null),
	};
} finally {
	xoaKho(KHO);
}

console.log(JSON.stringify({ tran: TRAN, daBoc, moHinhTran: tran, trongEve }));
console.log(
	`da boc: ${daBoc.outputTokens} token ra (tran ${TRAN}), zdr ${daBoc.zdr}, nha cung cap ${daBoc.nhaCungCap}`,
);

if ((tran.outputTokens ?? 0) <= TRAN) {
	console.log("cau thu khong du dai");
	process.exit(3);
}
if ((daBoc.outputTokens ?? Number.POSITIVE_INFINITY) > TRAN) {
	console.log("khong chan duoc co loi goi");
	process.exit(1);
}
if (daBoc.zdr !== true || daBoc.nhaCungCap !== "vertex") {
	console.log("zdr hoac nha cung cap khong dung");
	process.exit(1);
}
if (!trongEve || trongEve.soBuoc === 0) {
	console.log("khong dung duoc agent mau cho luot trong eve");
	process.exit(2);
}
if (trongEve.outputTokens.some((t) => t === null || t > TRAN)) {
	console.log("khong chan duoc trong eve");
	process.exit(1);
}
process.exit(0);
