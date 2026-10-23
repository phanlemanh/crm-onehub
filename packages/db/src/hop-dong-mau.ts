import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const THU_MUC_HOP_DONG_MAU = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"mau",
	"hop-dong",
);

export const TEP_DAP_AN_HOP_DONG_MAU = "dap-an.json";

export function docDapAnThoHopDongMau(
	thuMuc: string = THU_MUC_HOP_DONG_MAU,
): string {
	return readFileSync(join(thuMuc, TEP_DAP_AN_HOP_DONG_MAU), "utf8");
}

export function docByteHopDongMau(
	tenTep: string,
	thuMuc: string = THU_MUC_HOP_DONG_MAU,
): Uint8Array {
	return new Uint8Array(readFileSync(join(thuMuc, tenTep)));
}
