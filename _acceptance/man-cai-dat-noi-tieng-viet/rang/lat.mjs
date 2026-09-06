import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC = resolve(HERE, "../../..");

function quetThuMuc(goc) {
	return readdirSync(goc, { withFileTypes: true })
		.filter((m) => m.isFile() && m.name.endsWith(".tsx"))
		.map((m) => relative(GOC, join(goc, m.name)));
}

export function khaiTuArgv(macDinh) {
	const i = process.argv.indexOf("--lat");
	return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : macDinh;
}

export const KHAI_MAC_DINH = `${HERE}/lat-cai-dat.json`;

export function lat(khai = KHAI_MAC_DINH) {
	const KHAI = JSON.parse(readFileSync(khai, "utf8"));
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
