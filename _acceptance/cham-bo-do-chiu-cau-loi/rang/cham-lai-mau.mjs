import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const MAU = join(GOC, "_acceptance/tro-ly-doc-kho/rang/mau-luot-that");
const TEP = "cham-tung-cau.jsonl";
const CHI_SO = /^(dungTrang|tuChoiDung|chuyenQuyDinh|chuyenNham): /;

const { tranCauLoi } = await import(
	join(GOC, "_acceptance/tro-ly-doc-kho/rang/quyet-do.ts")
);

function chamLai(thuMuc) {
	const env = { ...process.env };
	delete env.E15_QUYET;
	const r = spawnSync("bun", [CHAM, "--cham-lai", thuMuc], {
		cwd: GOC,
		encoding: "utf8",
		env,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const docDong = (tep) =>
	readFileSync(tep, "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d) => JSON.parse(d));
const ghiDong = (tep, ds) =>
	writeFileSync(tep, `${ds.map((d) => JSON.stringify(d)).join("\n")}\n`);

const tam = mkdtempSync(join(tmpdir(), "cham-lai-mau-"));
const ketQua = [];
try {
	const luot = join(tam, "luot-1");
	mkdirSync(luot);
	cpSync(join(MAU, TEP), join(luot, TEP));
	const goc = docDong(join(luot, TEP));

	const r1 = chamLai(luot);
	const dong = r1.ra.split("\n");
	const loi = dong.find((d) => d.startsWith("cau loi model: "));
	const soChiSo = dong.filter((d) => CHI_SO.test(d)).length;
	ketQua.push({
		ca: "nguyen-van",
		ma: r1.ma,
		dat:
			r1.ma !== 2 &&
			!!loi &&
			loi.startsWith("cau loi model: 1/") &&
			loi.includes("(c33)") &&
			soChiSo === 4,
		chiTiet: loi ?? "thieu dong cau loi model",
	});

	const tran = tranCauLoi(goc.length);
	const loiGoc = Number(
		loi?.match(/^cau loi model: (\d+)\//)?.[1] ?? Number.NaN,
	);
	const soDoi = tran + 1 - loiGoc;
	let conDoi = soDoi;
	const vuot = goc.map((d) => {
		if (conDoi > 0 && d.luot === 1 && d.ketCuc !== "LOI") {
			conDoi--;
			return { ...d, ketCuc: "LOI" };
		}
		return d;
	});
	ghiDong(join(luot, TEP), vuot);
	const r2 = chamLai(luot);
	const mong2 = `KHONG DO DUOC: ${tran + 1} cau loi vuot tran ${tran}`;
	ketQua.push({
		ca: "vuot-tran",
		ma: r2.ma,
		dat: conDoi === 0 && r2.ma === 2 && r2.ra.includes(mong2),
		chiTiet: mong2,
	});

	ghiDong(join(luot, TEP), [...goc, goc[0]]);
	const r3 = chamLai(luot);
	ketQua.push({
		ca: "trung-ma",
		ma: r3.ma,
		dat: r3.ma === 2 && r3.ra.includes("trung ma"),
		chiTiet: `trung ma ${goc[0].luot}:${goc[0].id}`,
	});
} finally {
	rmSync(tam, { recursive: true, force: true });
}

for (const k of ketQua)
	console.log(`${k.ca} ma ${k.ma} ${k.dat ? "dat" : "sai"} — ${k.chiTiet}`);
process.exit(ketQua.length === 3 && ketQua.every((k) => k.dat) ? 0 : 1);
