import { db } from "@crm/db";
import { donThongBaoCu } from "./thong-bao-ghi";

export async function donThongBaoDinhKy(now = new Date()): Promise<number> {
	const da = await donThongBaoCu(db, now);
	if (da > 0) console.log(`[thong-bao] don ${da} thong bao qua han giu`);
	return da;
}
