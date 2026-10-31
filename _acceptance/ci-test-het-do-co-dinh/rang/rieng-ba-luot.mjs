import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SO_LUOT = 3;
const BO_BIEN = new Set(["CLAUDECODE", "DAU_HOOK_TRAN_MS"]);
const ENV = Object.fromEntries(
	Object.entries(process.env).filter(([k]) => !BO_BIEN.has(k)),
);
const CA = [
	{
		goi: "ui",
		tep: "./test/pre-push-da-chung.spec.ts",
		phai: "(pass) dau-hook > dau-hook (e): chuoi ngay 13 roi 15",
	},
	{
		goi: "api",
		tep: "./test/mat-khau-lien-ket.spec.ts",
		phai: "(pass) quyen-hai-ve",
	},
	{
		goi: "api",
		tep: "./test/vai-chi-okr.spec.ts",
		phai: "(pass) vai-chi-okr > gan-vai",
	},
	{
		goi: "api",
		tep: "./test/du-an-do-nguong.spec.ts",
		phai: "(pass) dgt-thuoc > dgt-thuoc",
	},
];

function chay({ goi, tep }) {
	if (goi === "ui") {
		return spawnSync("bun", ["test", "--preload", "./test/setup-dom.ts", tep], {
			cwd: join(GOC, "packages", "ui"),
			encoding: "utf8",
			env: ENV,
		});
	}
	const lenh = `cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts ${tep}`;
	return spawnSync("bun", ["packages/db/scripts/test-run.ts", lenh], {
		cwd: GOC,
		encoding: "utf8",
		env: ENV,
		maxBuffer: 1 << 28,
	});
}

const loi = [];
for (const c of CA) {
	for (let luot = 1; luot <= SO_LUOT; luot += 1) {
		const r = chay(c);
		const ra = `${r.stdout}${r.stderr}`;
		const dat = r.status === 0 && /\b0 fail\b/.test(ra) && ra.includes(c.phai);
		console.log(
			`${dat ? "DAT" : "TRUOT"} ${c.goi} ${c.tep} luot ${luot}/${SO_LUOT}`,
		);
		if (!dat) {
			console.log(
				ra
					.split("\n")
					.filter((d) => d.includes("(fail)") || d.includes("error"))
					.slice(0, 20)
					.join("\n"),
			);
			loi.push(`${c.tep}#${luot}`);
		}
	}
}

if (loi.length) {
	console.log(`TRUOT ${loi.length} luot: ${loi.join(", ")}`);
	process.exit(1);
}
console.log("DAT tat ca");
