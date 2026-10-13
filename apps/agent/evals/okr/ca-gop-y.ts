import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type CaGopY, parseCaGopY } from "@crm/validation/okr-ca-gop-y";

const DAY = dirname(fileURLToPath(import.meta.url));

export const THU_MUC_CA_MAU = join(DAY, "ca-gop-y", "mau");
export const THU_MUC_CA_THAT = join(DAY, "ca-gop-y", "that");
export const THU_MUC_CA_QUY_4 = join(DAY, "ca-gop-y", "quy-4");

export function thuMucBoCa(
	env: Record<string, string | undefined>,
	khoa: string,
	macDinh: () => string = () => THU_MUC_CA_MAU,
): string {
	const chon = env[khoa]?.trim();
	if (!chon) return macDinh();
	if (!existsSync(chon)) throw new Error(`Thư mục ca góp ý ${chon} không có`);
	return chon;
}

export function docBoCaGopY(thuMuc: string): CaGopY[] {
	const tep = readdirSync(thuMuc)
		.filter((t) => t.endsWith(".json"))
		.sort();
	const ca = tep.map((t) => {
		const duong = join(thuMuc, t);
		let json: unknown;
		try {
			json = JSON.parse(readFileSync(duong, "utf8"));
		} catch (loi) {
			throw new Error(
				`Ca góp ý ${duong} không phải JSON: ${loi instanceof Error ? loi.message : String(loi)}`,
			);
		}
		return parseCaGopY(json, duong);
	});
	const thay = new Map<string, string>();
	for (const [i, c] of ca.entries()) {
		const truoc = thay.get(c.id);
		if (truoc) throw new Error(`Mã ca ${c.id} trùng ở ${truoc} và ${tep[i]}`);
		thay.set(c.id, tep[i] ?? "");
	}
	return ca;
}
