import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "dai-luu-tru-dung-chung";
const MAN_V2 = "_acceptance/vong-doi-mot-cach-cat/rang/man.mjs";
const DAT_V2 = "vong-doi-mot-cach-cat man: dat";
const CHIEU_DO = process.argv.includes("--chieu-do");
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const ANH = [
	["vdc-ngan-da-cat-1440.png", "dlt-ngan-da-cat-1440.png"],
	["vdc-ngan-da-cat-390.png", "dlt-ngan-da-cat-390.png"],
];

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const NOI_GIU = join(GOC, "_acceptance", HO_SO, "evidence");
mkdirSync(BANG_CHUNG, { recursive: true });
for (const [nguon] of ANH) rmSync(join(BANG_CHUNG, nguon), { force: true });

const r = spawnSync("bun", [MAN_V2, ...(CHIEU_DO ? ["--chieu-do"] : [])], {
	cwd: GOC,
	env: { ...process.env, BANG_CHUNG },
	encoding: "utf8",
	stdio: ["ignore", "pipe", "inherit"],
});
process.stdout.write(r.stdout ?? "");

if (r.status !== 0 || !(r.stdout ?? "").includes(DAT_V2)) {
	const dongDo = (r.stdout ?? "")
		.split("\n")
		.filter((d) => /man: |do|loi/.test(d))
		.slice(-3)
		.join(" | ");
	console.log(
		`${HO_SO} man: do — phep do V2 khong dat (ma ${r.status}): ${dongDo}`,
	);
	process.exit(r.status === 2 ? 2 : 1);
}

const thieu = ANH.filter(([nguon]) => !existsSync(join(BANG_CHUNG, nguon)));
if (thieu.length > 0) {
	console.log(
		`${HO_SO} man: do — man: thieu anh ${thieu.map(([n]) => n).join(", ")}`,
	);
	process.exit(1);
}

const trangThai =
	/^status:\s*(\S+)/m.exec(
		readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8"),
	)?.[1] ?? "";
if (DA_THONG_CONG.has(trangThai))
	console.log(
		`  ho so ${trangThai}: khong chep anh sang _acceptance/${HO_SO}/evidence/ — anh o ${BANG_CHUNG}`,
	);
else if (!CHIEU_DO) {
	mkdirSync(NOI_GIU, { recursive: true });
	for (const [nguon, dich] of ANH)
		copyFileSync(join(BANG_CHUNG, nguon), join(NOI_GIU, dich));
}

console.log(`${HO_SO} man: dat`);
