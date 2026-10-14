import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { THU_TU_NHAC, type ViecNhac } from "@crm/db/onboarding-nhac";
import { MUC_MAU } from "./muc-mau";
import { moXuong } from "./nhac-gieo";

export const CHUP = {
	appUrl: "https://crm.test",
	ten: "Lan",
	luc: new Date("2026-10-14T01:30:00Z"),
} as const;

export type BanChup = Record<
	string,
	{ zalo: string; slack: string; duong: string | null }
>;

type LienKet = (v: ViecNhac) => string | null;
type DungTin = (
	ten: string,
	luc: Date,
	viec: ViecNhac[],
	lienKet: LienKet,
	khuon?: "slack" | "tron",
	tranKyTu?: number,
	dongCuoi?: string | null,
) => { text: string };

export async function chupTin(
	dungTin: DungTin,
	lienKet: LienKet,
	zalo: { tranKyTu: number; goiY: string },
): Promise<BanChup> {
	const ra: BanChup = {};
	for (const loai of [...THU_TU_NHAC].sort()) {
		const v = MUC_MAU[loai];
		ra[loai] = {
			zalo: dungTin(
				CHUP.ten,
				CHUP.luc,
				[v],
				lienKet,
				"tron",
				zalo.tranKyTu,
				zalo.goiY,
			).text,
			slack: dungTin(CHUP.ten, CHUP.luc, [v], lienKet).text,
			duong: lienKet(v),
		};
	}
	return ra;
}

function co(ten: string): string {
	const i = process.argv.indexOf(ten);
	const giaTri = i >= 0 ? process.argv[i + 1] : undefined;
	if (!giaTri) {
		console.error(`chup-tin-nhac: thieu ${ten}`);
		process.exit(2);
	}
	return giaTri;
}

if (import.meta.main) {
	const goc = resolve(co("--goc"));
	const tep = resolve(co("--ra"));
	const lib = join(goc, "apps/agent/agent/lib");
	const { dungTin } = await import(join(lib, "tin-nhac.ts"));
	const { duongMo } = await import(join(lib, "nhac-ke-hoach.ts"));
	const { ZALO } = await import(join(lib, "zalo-config.ts"));
	if (typeof duongMo !== "function") {
		console.error("chup-tin-nhac: ma goc chua xuat duongMo");
		process.exit(2);
	}
	await moXuong();
	const banChup = await chupTin(dungTin, await duongMo(CHUP.appUrl), {
		tranKyTu: ZALO.tranKyTu,
		goiY: ZALO.loi.goiY,
	});
	writeFileSync(tep, `${JSON.stringify(banChup, null, "\t")}\n`);
	console.log(`chup-tin-nhac: ${Object.keys(banChup).length} loai → ${tep}`);
	process.exit(0);
}
