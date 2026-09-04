import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC = resolve(HERE, "../../..");
const KHAI = JSON.parse(readFileSync(`${HERE}/lat-cua-vao.json`, "utf8"));

function quetThuMuc(goc) {
	return readdirSync(goc, { recursive: true, withFileTypes: true })
		.filter((m) => m.isFile() && m.name.endsWith(".tsx"))
		.map((m) => relative(GOC, join(m.parentPath, m.name)));
}

export function lat() {
	const tuDia = KHAI.thu_muc.flatMap((d) => quetThuMuc(`${GOC}/${d}`));
	const them = KHAI.them;

	const thieu = [...them, ...KHAI.khong_quet.map((k) => k.duong)].filter(
		(d) => !existsSync(`${GOC}/${d}`),
	);

	const loaiRa = new Set(KHAI.khong_quet.map((k) => k.duong));
	const treo = KHAI.khong_quet.filter((k) => !tuDia.includes(k.duong));

	return {
		file: [...tuDia.filter((d) => !loaiRa.has(d)), ...them].sort(),
		mienTru: KHAI.mien_tru,
		khongQuet: KHAI.khong_quet,
		thieu,
		treo,
		soTuDia: tuDia.length,
	};
}
