import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { doiCo, ketLuan } from "./chung.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: HERE, encoding: "utf8" }).trim();
const NGUON = "577f23b2b";
const TEP_NGUON = "apps/agent-okr/agent/lib/config.ts";
const co = doiCo(process.argv.slice(2));

function docGoc() {
	const s = execFileSync("git", ["show", `${NGUON}:${TEP_NGUON}`], { cwd: ROOT, encoding: "utf8" });
	const khoi = /\ttuChoi: \{\n([\s\S]*?)\n\t\},/.exec(s)?.[1] ?? "";
	return Object.fromEntries([...khoi.matchAll(/(\w+): "([^"]*)",/g)].map((m) => [m[1], m[2]]));
}

function docMau() {
	const mau = JSON.parse(fs.readFileSync(path.join(HERE, "ly-do-goc.json"), "utf8"));
	if (!co["mau-sai"]) return mau;
	const [k] = Object.keys(mau);
	return { ...mau, [k]: `${mau[k]} sai` };
}

let sai = 0;
const loi = (cau) => {
	sai += 1;
	console.log(cau);
};

const goc = docGoc();
const mau = docMau();
const khoaGoc = Object.keys(goc);
if (khoaGoc.length !== 7) {
	console.log(`KHONG DO DUOC: khoi tuChoi o ${NGUON} co ${khoaGoc.length} ma, mong 7`);
	process.exit(2);
}
for (const k of new Set([...khoaGoc, ...Object.keys(mau)]))
	if (goc[k] !== mau[k]) loi(`mau lech nguon ${NGUON}: ${k}`);
if (sai) ketLuan(sai);

const { LY_DO_TU_CHOI_NOP, docKetQuaNop } = await import(path.join(ROOT, "packages/validation/src/okr-cuoc-soan.ts"));
const { ketQuaNop } = await import(path.join(ROOT, "apps/agent-okr/agent/lib/nop-ban-nhap.ts"));

const khoaMoi = Object.keys(LY_DO_TU_CHOI_NOP);
for (const k of new Set([...khoaMoi, ...Object.keys(mau)]))
	if (LY_DO_TU_CHOI_NOP[k] !== mau[k]) loi(`gia tri doi: ${k}`);

let vong = 0;
for (const k of khoaMoi) {
	const ghi = ketQuaNop.safeParse({ ketQua: "tu-choi", lyDo: LY_DO_TU_CHOI_NOP[k], soDong: 0, biLoai: [], giuNguyen: [] });
	if (!ghi.success) {
		loi(`ben ghi tu choi ma that: ${k}`);
		continue;
	}
	const doc = docKetQuaNop(ghi.data);
	if (doc?.lyDo !== k) loi(`round-trip sai: ${k} doc ra ${doc?.lyDo ?? "null"}`);
	else vong += 1;
}
const ghiRong = ketQuaNop.safeParse({ ketQua: "da-ghi", lyDo: "", soDong: 0, biLoai: [], giuNguyen: [] });
if (!ghiRong.success) loi("ben ghi tu choi lyDo rong cua da-ghi");
const ghiLa = ketQuaNop.safeParse({ ketQua: "tu-choi", lyDo: "la", soDong: 0, biLoai: [], giuNguyen: [] });
if (ghiLa.success) loi("ben ghi nhan lyDo ngoai tap");

if (!sai) console.log(`gia-tri: ${khoaMoi.length}/7 ma giu nguyen, ${vong}/7 round-trip`);
ketLuan(sai);
