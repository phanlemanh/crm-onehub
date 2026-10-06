import { db } from "../../../packages/db/src/index.ts";
import { SETTINGS_ID } from "../../../packages/db/src/settings.ts";
import { vanTay, ZALO_GETME } from "../../../packages/db/src/zalo-getme.ts";
import { suKienGetMe } from "../../../packages/validation/src/zalo-getme.ts";

const NGAY_MS = 24 * 60 * 60 * 1000;
const MA_TAM = [408, 429];
const MA_MAY_CHU = 500;

type Db = typeof db;

function laMaTam(ma: number | null): boolean {
	return ma !== null && (MA_TAM.includes(ma) || ma >= MA_MAY_CHU);
}

export function dauNgayVN(ngay: string): Date {
	return new Date(`${ngay}T00:00:00+07:00`);
}

export async function demGetMe(
	ket: Db,
	ky: { tu: Date; den: Date },
	tokenDangChay: string | null,
): Promise<string[]> {
	const hang = await ket.agentEvent.findMany({
		where: {
			type: ZALO_GETME.loai,
			emittedAt: { gte: ky.tu, lt: new Date(ky.den.getTime() + NGAY_MS) },
		},
		select: { data: true },
	});
	const suKien = hang.map((h) => suKienGetMe.parse(h.data));
	const theoLop = new Map<string, number>();
	for (const s of suKien) {
		const khoa = `${s.ketLuan} ${s.lop}`;
		theoLop.set(khoa, (theoLop.get(khoa) ?? 0) + 1);
	}
	const tokenSai = suKien.filter((s) => s.ketLuan === "token-sai");
	const dauVanTay = tokenDangChay ? vanTay(tokenDangChay) : null;
	return [
		`tam-loi: ${suKien.length - tokenSai.length}`,
		`token-sai: ${tokenSai.length}`,
		...[...theoLop.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([khoa, n]) => `lop ${khoa}: ${n}`),
		`token-sai mang ma tam: ${tokenSai.filter((s) => laMaTam(s.http) || laMaTam(s.maThan)).length}`,
		`token-sai tren token dang chay: ${tokenSai.filter((s) => s.vanTay === dauVanTay).length}`,
	];
}

function doc(ten: string): Date {
	const i = process.argv.indexOf(ten);
	const gia = i < 0 ? undefined : process.argv[i + 1];
	const ngay = gia ? dauNgayVN(gia) : new Date(Number.NaN);
	if (Number.isNaN(ngay.getTime())) {
		console.error(`thieu hoac sai ${ten} (YYYY-MM-DD)`);
		process.exit(2);
	}
	return ngay;
}

if (import.meta.main) {
	const caiDat = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloBotToken: true },
	});
	const token =
		caiDat?.zaloBotToken?.trim() || process.env.ZALO_BOT_TOKEN?.trim() || null;
	for (const dong of await demGetMe(
		db,
		{ tu: doc("--tu"), den: doc("--den") },
		token,
	)) {
		console.log(dong);
	}
	await db.$disconnect();
}
