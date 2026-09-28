import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC_KHO = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const TEN_CU = "BLOB_READ_WRITE_TOKEN";
export const TEP_BLOB = "packages/db/src/blob-nguon.ts";
export const THUOC = "_acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs";
export const NUT_KHOA = "nut tai nguon khoa — phien do thieu";

export function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

export function docTep(goc, tep) {
	const p = join(goc, tep);
	if (!existsSync(p)) khongDo(`thieu tep ${tep}`);
	return readFileSync(p, "utf8");
}

export function tenKhoa(goc) {
	const ten = docTep(goc, TEP_BLOB).match(/bienKhoa:\s*"([A-Z0-9_]+)"/)?.[1];
	if (!ten) khongDo(`khong doc duoc bienKhoa trong ${TEP_BLOB}`);
	return ten;
}
