import { readFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { GOC } from "./lat.mjs";

export const BIEN_TEP_THAY = "RANG_TEP_THAY";

function bangThay() {
	const tho = process.env[BIEN_TEP_THAY];
	if (tho === undefined || tho === "") return {};
	const bang = JSON.parse(tho);
	if (bang === null || typeof bang !== "object" || Array.isArray(bang))
		throw new Error(`${BIEN_TEP_THAY} phai la mot object {duong tuong doi goc kho: duong ban sao}`);
	return bang;
}

export function duongDoc(duong) {
	const tuyetDoi = isAbsolute(duong) ? duong : join(GOC, duong);
	return bangThay()[relative(GOC, tuyetDoi)] ?? tuyetDoi;
}

export function docTep(duong) {
	return readFileSync(duongDoc(duong), "utf8");
}
