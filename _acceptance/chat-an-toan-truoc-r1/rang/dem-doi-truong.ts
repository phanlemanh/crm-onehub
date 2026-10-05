import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FIELDS_AGENT } from "../../../apps/agent/agent/lib/fields-config.ts";
import { MODEL_DANH_MUC } from "../../../apps/agent/agent/lib/model-config.ts";
import type { Db } from "../../../packages/db/src/index.ts";

const AGENT = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"apps",
	"agent",
);
const { z } = createRequire(join(AGENT, "package.json"))(
	"zod",
) as typeof import("zod");

const VAI = [
	"owner",
	"admin",
	"member",
	"okr",
	"khong-thanh-vien",
	"tu-dong",
] as const;

type Vai = (typeof VAI)[number];

const duLieuDoiTruong = z.object({
	vai: z.enum(VAI),
	ketQua: z.enum(["lam", "tu-choi"]),
});

export type KetQuaDem = {
	lam: Record<Vai, number>;
	tuChoi: number;
	chet: number;
	biGoLui: number;
	khongTimThay: number;
};

const QUAN_TRI: ReadonlySet<Vai> = new Set(["owner", "admin"]);

export async function demDoiTruong(
	db: Db,
	tu = new Date(0),
): Promise<KetQuaDem> {
	const hang = await db.agentEvent.findMany({
		where: {
			emittedAt: { gte: tu },
			type: {
				in: [
					FIELDS_AGENT.suKien,
					MODEL_DANH_MUC.suKienLui,
					MODEL_DANH_MUC.suKienHong,
				],
			},
		},
		select: { type: true, data: true },
	});
	const lam = Object.fromEntries(VAI.map((v) => [v, 0])) as Record<Vai, number>;
	let tuChoi = 0;
	let biGoLui = 0;
	let khongTimThay = 0;
	for (const h of hang) {
		if (h.type === MODEL_DANH_MUC.suKienLui) biGoLui += 1;
		else if (h.type === MODEL_DANH_MUC.suKienHong) khongTimThay += 1;
		else {
			const d = duLieuDoiTruong.parse(h.data);
			if (d.ketQua === "lam") lam[d.vai] += 1;
			else tuChoi += 1;
		}
	}
	const chet = VAI.filter((v) => !QUAN_TRI.has(v)).reduce(
		(tong, v) => tong + lam[v],
		0,
	);
	return { lam, tuChoi, chet, biGoLui, khongTimThay };
}

if (import.meta.main) {
	const { db } = await import("../../../packages/db/src/index.ts");
	console.log(JSON.stringify(await demDoiTruong(db), null, 2));
	await db.$disconnect();
}
