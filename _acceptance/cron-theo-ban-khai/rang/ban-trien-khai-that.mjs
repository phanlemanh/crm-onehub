import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { bangNhau, docKhai, GOC } from "./chung.mjs";

const DU_AN = "crm-onehub-api";
const NEN = join(homedir(), "Library", "Application Support", "com.vercel.cli");

function goi(duong) {
	const tok = JSON.parse(readFileSync(join(NEN, "auth.json"), "utf8")).token;
	const doi = JSON.parse(
		readFileSync(join(NEN, "config.json"), "utf8"),
	).currentTeam;
	const sep = duong.includes("?") ? "&" : "?";
	return fetch(`https://api.vercel.com${duong}${sep}teamId=${doi}`, {
		headers: { Authorization: `Bearer ${tok}` },
	}).then((r) =>
		r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
	);
}

const sha = execFileSync("git", ["rev-parse", "HEAD"], {
	cwd: GOC,
	encoding: "utf8",
}).trim();

let ds;
try {
	ds = await goi(`/v6/deployments?app=${DU_AN}&limit=40`);
} catch (e) {
	console.error(`MA 2: khong doc duoc danh sach ban trien khai — ${e.message}`);
	process.exit(2);
}

const cua = (ds.deployments ?? []).filter(
	(d) => d.meta?.githubCommitSha === sha && d.state === "READY",
);
console.log(
	`sha dang xet: ${sha.slice(0, 8)} · ban trien khai READY khop sha: ${cua.length}`,
);

if (cua.length === 0) {
	console.error(
		`MA 2: chua co ban trien khai READY nao cua ${DU_AN} dung tu sha ${sha.slice(0, 8)} — day la phep do tren NEN TANG, no can mot ban dung that de doc`,
	);
	process.exit(2);
}

let day;
try {
	day = await goi(`/v13/deployments/${cua[0].uid}`);
} catch (e) {
	console.error(
		`MA 2: khong doc duoc ban trien khai ${cua[0].uid} — ${e.message}`,
	);
	process.exit(2);
}

const nenTang = (day.crons ?? []).map((c) => ({
	path: c.path,
	schedule: c.schedule,
}));
const khai = docKhai().crons.map((c) => ({
	path: c.path,
	schedule: c.schedule,
}));

console.log(`nen tang dang ky: ${nenTang.length} · ban khai: ${khai.length}`);
for (const c of nenTang) console.log(`  ${c.schedule}  ${c.path}`);

if (!bangNhau(khai, nenTang)) {
	console.error("DO: lich NEN TANG dang ky khong bang ban khai:");
	console.error(`  khai:     ${JSON.stringify(khai)}`);
	console.error(`  nen tang: ${JSON.stringify(nenTang)}`);
	process.exit(1);
}

console.log(
	`XANH: ban trien khai that cua ${DU_AN} dang ky dung ${khai.length} viec, tung cap path va nhip khop ban khai.`,
);
