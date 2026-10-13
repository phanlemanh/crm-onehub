import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { KIEM_CHEO } from "./cau-hinh.mjs";

const GIAI_BANG = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	KIEM_CHEO.goiDieuPhoi.giaiBang,
);

export function giaiGoiDieuPhoi({
	bien = process.env[KIEM_CHEO.goiDieuPhoi.bien],
} = {}) {
	const { plugin, can, lenhCai } = KIEM_CHEO.goiDieuPhoi;
	const doiSo = [
		GIAI_BANG,
		"--plugin",
		plugin,
		...can.flatMap((tep) => ["--require", tep]),
		...(bien ? ["--root", bien] : []),
	];
	try {
		return execFileSync(process.execPath, doiSo, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch (e) {
		const loi = String(e.stderr || e.message)
			.split("\n")
			.map((dong) => dong.trim())
			.filter(Boolean)
			.join(" · ");
		throw new Error(
			`goi ${plugin} khong giai duoc: ${loi} — cai bang: ${lenhCai}`,
		);
	}
}

export async function napGoiDieuPhoi(tuyChon) {
	const goc = giaiGoiDieuPhoi(tuyChon);
	const nap = (tep) => import(pathToFileURL(join(goc, tep)).href);
	const [dot, nhip, hinhDang] = await Promise.all(
		KIEM_CHEO.goiDieuPhoi.can.map(nap),
	);
	return {
		goc,
		timThuMucDot: dot.timThuMucDot,
		chamNhip: nhip.chamNhip,
		kiemDon: hinhDang.kiemDon,
	};
}
