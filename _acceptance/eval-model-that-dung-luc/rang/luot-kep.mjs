import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const BANG_CHUNG = join(
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", "tro-ly-doc-kho", "evidence"),
	"cham-bo-do.md",
);
const DONG_EVE = "eve eval tro-ly-kho/cham-bo-do";
const TRAN_MS = 120 * 60_000;

if (!process.env.AI_GATEWAY_API_KEY?.trim() && !process.env.KHO_TAI_LIEU_AI_GATEWAY_API_KEY?.trim()) {
	console.error("can khoa Gateway");
	process.exit(2);
}

function chay(args) {
	const env = { ...process.env };
	delete env.E15_QUYET;
	const r = spawnSync("bun", [CHAM, ...args], {
		cwd: GOC,
		encoding: "utf8",
		env,
		timeout: TRAN_MS,
		maxBuffer: 256 * 1024 * 1024,
	});
	const ra = `${r.stdout}\n${r.stderr}`;
	const goi = Number(ra.match(/SO LOI GOI MODEL: (\d+)/)?.[1] ?? -1);
	return { ma: r.status, ra, goi, dungLai: ra.includes("DUNG LAI "), eve: ra.includes(DONG_EVE) };
}

const tam = mkdtempSync(join(tmpdir(), "luot-kep-"));
try {
	const l1 = chay([]);
	if (l1.ma !== 0) {
		console.error(`KHONG DO DUOC: luot 1 khong dat (ma ${l1.ma})\n${l1.ra.slice(-1500)}`);
		process.exit(2);
	}
	if (!l1.dungLai && !(l1.goi > 2)) {
		console.error(`luot 1 do moi ma SO LOI GOI MODEL = ${l1.goi}, can > 2`);
		process.exit(1);
	}
	console.log(`LUOT 1: ${l1.dungLai ? "dung lai" : "do moi"}, ma 0, goi ${l1.goi}`);
	if (!existsSync(BANG_CHUNG)) {
		console.error(`luot 1 khong ghi ${BANG_CHUNG}`);
		process.exit(1);
	}
	const nguon = join(tam, "luot-1.md");
	copyFileSync(BANG_CHUNG, nguon);
	const l2 = chay(["--nguon-thu", nguon]);
	const sai = [];
	if (l2.ma !== 0) sai.push(`ma ${l2.ma}`);
	if (!l2.dungLai) sai.push("khong DUNG LAI");
	if (l2.eve) sai.push(`co dong «${DONG_EVE}»`);
	if (l2.goi !== 2) sai.push(`SO LOI GOI MODEL = ${l2.goi}, can 2`);
	if (sai.length > 0) {
		console.error(`luot 2 sai: ${sai.join("; ")}\n${l2.ra.slice(-1500)}`);
		process.exit(1);
	}
	console.log(`LUOT 2: DUNG LAI, ma 0, goi ${l2.goi}`);
} finally {
	rmSync(tam, { recursive: true, force: true });
}
