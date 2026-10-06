import { db } from "../../../packages/db/src/index.ts";
import { ngayVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { parseNhacPayload } from "../../../packages/validation/src/nhac-ke-hoach.ts";
import { onboardingActivityMeta } from "../../../packages/validation/src/onboarding-activity.ts";

const LOAI = "nhac-ke-hoach";
const CHU_DE = /^user:(.+):(\d{4}-\d{2}-\d{2})$/;
const NGAY_MS = 24 * 60 * 60 * 1000;

export type KetNguong = {
	coXong: number;
	mau: number;
	nham: string[];
};

type Db = typeof db;

export async function doNguong(
	ket: Db,
	ky: { tu: Date; den: Date },
): Promise<KetNguong> {
	const tuNgay = ngayVN(ky.tu);
	const denNgay = ngayVN(ky.den);
	const trongKy = (ngay: string) => ngay >= tuNgay && ngay <= denNgay;
	const khung = {
		gte: new Date(ky.tu.getTime() - NGAY_MS),
		lte: new Date(ky.den.getTime() + NGAY_MS),
	};
	const hang = await ket.agentTask.findMany({
		where: { kind: LOAI, dueAt: khung },
		select: { subject: true, payload: true },
	});
	const tin = new Map<string, Set<string>>();
	for (const h of hang) {
		const khop = CHU_DE.exec(h.subject ?? "");
		if (!khop?.[2] || !trongKy(khop[2])) continue;
		const p = parseNhacPayload(h.payload);
		if (p.kenh !== "zalo") continue;
		const buoc = (p.daGui ?? []).flatMap((m) => (m.stepId ? [m.stepId] : []));
		tin.set(`${khop[1]}|${khop[2]}`, new Set(buoc));
	}
	const vet = await ket.activity.findMany({
		where: {
			type: "PLAN_CHANGE",
			occurredAt: khung,
			meta: { path: ["source"], equals: "zalo" },
		},
		select: { id: true, createdById: true, occurredAt: true, meta: true },
	});
	const coXong = new Set<string>();
	const nham: string[] = [];
	for (const v of vet) {
		const meta = onboardingActivityMeta.parse(v.meta);
		if (meta.kind !== "buoc.xong" || !v.occurredAt) continue;
		const ngay = ngayVN(v.occurredAt);
		if (!trongKy(ngay)) continue;
		const khoa = `${v.createdById}|${ngay}`;
		if (tin.get(khoa)?.has(meta.stepId)) coXong.add(khoa);
		else nham.push(v.id);
	}
	return { coXong: coXong.size, mau: tin.size, nham };
}

function doc(ten: string): Date {
	const i = process.argv.indexOf(ten);
	const gia = i < 0 ? undefined : process.argv[i + 1];
	const ngay = gia ? new Date(gia) : new Date(Number.NaN);
	if (Number.isNaN(ngay.getTime())) {
		console.error(`thieu hoac sai ${ten}`);
		process.exit(2);
	}
	return ngay;
}

if (import.meta.main) {
	const ket = await doNguong(db, { tu: doc("--tu"), den: doc("--den") });
	console.log(`ti_le_co_xong: ${ket.coXong}/${ket.mau}`);
	console.log(`danh_dau_nham: ${ket.nham.length}`);
	for (const id of ket.nham) console.log(`nham: ${id}`);
	await db.$disconnect();
}
