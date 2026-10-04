import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const GOC = execFileSync("git", ["rev-parse", "--show-toplevel"], {
	encoding: "utf8",
}).trim();
const BASE = execFileSync("git", ["merge-base", "HEAD", "origin/onehub"], {
	cwd: GOC,
	encoding: "utf8",
}).trim();

const NGUYEN = "apps/app/test/soan-okr-thu-lai.dom.tsx";
const CO_KHOI = "apps/app/test/soan-okr-hong.dom.tsx";
const KHOI = 'describe("hong — Thu lai roi van im"';

function docGoc(tep) {
	return execFileSync("git", ["show", `${BASE}:${tep}`], {
		cwd: GOC,
		encoding: "utf8",
	});
}

function boKhoi(noiDung, tep) {
	const dau = noiDung.indexOf(KHOI);
	if (dau < 0) {
		console.log(`mat khoi duoc phep sua: ${tep}`);
		process.exit(1);
	}
	const cuoi = noiDung.indexOf("\n});\n", dau);
	if (cuoi < 0) {
		console.log(`khong tim thay cuoi khoi: ${tep}`);
		process.exit(1);
	}
	return noiDung.slice(0, dau) + noiDung.slice(cuoi + "\n});\n".length);
}

const nguyenGoc = docGoc(NGUYEN);
const nguyenNay = readFileSync(`${GOC}/${NGUYEN}`, "utf8");
if (nguyenGoc !== nguyenNay) {
	console.log(`tep da ky bi sua: ${NGUYEN}`);
	process.exit(1);
}

const khoiGoc = boKhoi(docGoc(CO_KHOI), `${CO_KHOI}@merge-base`);
const khoiNay = boKhoi(readFileSync(`${GOC}/${CO_KHOI}`, "utf8"), CO_KHOI);
if (khoiGoc !== khoiNay) {
	console.log(`sua ngoai khoi duoc phep: ${CO_KHOI}`);
	process.exit(1);
}

let ma = 0;
for (const tep of [NGUYEN, CO_KHOI]) {
	const kq = spawnSync(
		"bun",
		[
			"test",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			`./${tep.replace("apps/app/", "")}`,
		],
		{
			cwd: `${GOC}/apps/app`,
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
			stdio: "inherit",
		},
	);
	if (kq.status !== 0) ma = kq.status ?? 1;
}
console.log(ma === 0 ? "GIU R1H: xanh" : `GIU R1H: do (ma ${ma})`);
process.exit(ma);
