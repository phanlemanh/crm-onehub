import { db } from "@crm/db";
import { z } from "zod";
import { modelChoBuocGoc, modelChoPhienGoc } from "../../agent/lib/model";
import { modelPhienDaGhi } from "../../agent/lib/model-phien";
import {
	MO_HINH_TOM_TAT,
	MO_HINH_TRO_LY_OKR,
	type MoHinhSong,
} from "../../agent/lib/okr/mo-hinh";
import troLyOkr from "../../agent/subagents/tro_ly_okr/agent";

const CHO_GHI = { soLan: 40, cachMs: 50 } as const;

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

try {
	const goc = await modelChoPhienGoc(ctx as never);
	const buoc = modelChoBuocGoc(ctx as never);
	const model = (
		troLyOkr as unknown as { model: { events: Record<string, SuKien> } }
	).model;
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
		}),
	);
} finally {
	await db.$disconnect();
}
