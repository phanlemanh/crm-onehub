import { readFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { GOC } from "./lat.mjs";

export const BIEN_TEP_THAY = "RANG_TEP_THAY";

function bangThay() {
	const tho = process.env[BIEN_TEP_THAY];
	if (tho === undefined || tho === "") return new Map();
	const bang = new Map(Object.entries(JSON.parse(tho)));
	for (const [duong, banSao] of bang)
		if (String(banSao) !== banSao)
			throw new Error(`${BIEN_TEP_THAY}: ${duong} phai tro mot duong dan ban sao`);
	return bang;
}

export function duongDoc(duong) {
	const tuyetDoi = isAbsolute(duong) ? duong : join(GOC, duong);
	return bangThay().get(relative(GOC, tuyetDoi)) ?? tuyetDoi;
}

export function docTep(duong) {
	return readFileSync(duongDoc(duong), "utf8");
}
