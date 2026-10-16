import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const RANG_THUOC = "_acceptance/gioi-han-duyet-cay-okr/rang";
export const THUOC = `${RANG_THUOC}/soi-ma.mjs`;
export const RA = join(GOC, ".acceptance-runs", "ghim-thuoc-soi-xem-okr");
const LIEN_KET = ["apps", "packages", "node_modules"];

export function dungGuong(ten) {
	const goc = join(RA, `guong-${ten}-${process.pid}`);
	rmSync(goc, { recursive: true, force: true });
	mkdirSync(join(goc, dirname(RANG_THUOC)), { recursive: true });
	for (const x of LIEN_KET) {
		if (!existsSync(join(GOC, x))) throw new Error(`thieu ${x} o goc kho`);
		symlinkSync(join(GOC, x), join(goc, x));
	}
	cpSync(join(GOC, RANG_THUOC), join(goc, RANG_THUOC), { recursive: true });
	return goc;
}

export function boGuong(goc) {
	rmSync(goc, { recursive: true, force: true });
}

export function chuThuocCay() {
	return readFileSync(join(GOC, THUOC), "utf8");
}

export function ghiThuoc(goc, chu) {
	writeFileSync(join(goc, THUOC), chu);
}

export function chayTrong(goc, lenh) {
	const r = spawnSync("bash", ["-c", lenh], { cwd: goc, encoding: "utf8" });
	return { ma: r.status ?? 2, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

export function chayThuoc(goc, doiSo = "--ca xem") {
	return chayTrong(goc, `bun ${THUOC} ${doiSo}`);
}

function moKhoi(m) {
	const tron = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(
		`\\t\\{\\n\\t\\ttep: "${tron(m.tep)}",\\n\\t\\tham: "${tron(m.ham)}",\\n\\t\\tbang: "${tron(m.bang)}",\\n\\t\\tlyDo: "([^"]*)",\\n\\t\\},\\n`,
		"g",
	);
}

function motCho(chu, m) {
	const thay = [...chu.matchAll(moKhoi(m))];
	if (thay.length !== 1)
		throw new Error(
			`khoa ${m.tep}#${m.ham}#${m.bang} khop ${thay.length} cho, can 1`,
		);
	return thay[0];
}

export function boDong(chu, m) {
	const k = motCho(chu, m);
	return chu.slice(0, k.index) + chu.slice(k.index + k[0].length);
}

export function xoaLyDo(chu, m) {
	const k = motCho(chu, m);
	const moi = k[0].replace(/lyDo: "[^"]*"/, 'lyDo: ""');
	return chu.slice(0, k.index) + moi + chu.slice(k.index + k[0].length);
}

export function themDong(chu, m, lyDo) {
	const dau = "const MIEN_XEM = [\n";
	const i = chu.indexOf(dau);
	if (i === -1 || chu.indexOf(dau, i + 1) !== -1)
		throw new Error("khong tim duoc dung mot cho mo MIEN_XEM");
	const khoi = `\t{\n\t\ttep: "${m.tep}",\n\t\tham: "${m.ham}",\n\t\tbang: "${m.bang}",\n\t\tlyDo: "${lyDo}",\n\t},\n`;
	return chu.slice(0, i + dau.length) + khoi + chu.slice(i + dau.length);
}
