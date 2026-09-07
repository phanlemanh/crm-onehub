import { execFileSync } from "node:child_process";
import {
	existsSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { docConfig, dungLai, GOC } from "./chung.mjs";

const SHA = "e55a9e88e7423cb362b965dac5ad1260c499c2a3";
const TAM = join(GOC, "apps", "api", "scripts", "build-func-cu.mjs");
const HAM = join(
	GOC,
	".vercel",
	"output",
	"functions",
	"api",
	"index.func",
	"index.mjs",
);

let ma = 0;
try {
	writeFileSync(
		TAM,
		execFileSync("git", ["show", `${SHA}:apps/api/scripts/build-func.mjs`], {
			cwd: GOC,
			encoding: "utf8",
		}),
	);
	const cu = execFileSync("node", ["scripts/build-func-cu.mjs"], {
		cwd: join(GOC, "apps", "api"),
		encoding: "utf8",
		env: { ...process.env, DATABASE_URL: "postgresql://x:y@localhost:5432/z" },
		stdio: "pipe",
	});
	void cu;
	const cfgCu = docConfig();
	if (cfgCu === undefined) {
		console.error("MA 2: ban cu khong ghi duoc config.json");
		process.exit(2);
	}

	const d = dungLai();
	if (d.ma !== 0) {
		console.error(`MA 2: ban HEAD tra ma ${d.ma}`);
		console.error(d.chu.slice(-600));
		process.exit(2);
	}
	const cfgMoi = docConfig();

	const lech = [];
	for (const khoa of new Set([...Object.keys(cfgCu), ...Object.keys(cfgMoi)])) {
		if (khoa === "crons") continue;
		const a = JSON.stringify(cfgCu[khoa]);
		const b = JSON.stringify(cfgMoi[khoa]);
		if (a !== b) lech.push(`${khoa}: cu ${a} · moi ${b}`);
	}

	console.log(
		`cron cu: ${(cfgCu.crons ?? []).length} · cron moi: ${(cfgMoi.crons ?? []).length}`,
	);
	console.log(
		`khoa ngoai crons: ${[...Object.keys(cfgMoi)].filter((k) => k !== "crons").join(", ")}`,
	);

	if ((cfgCu.crons ?? []).length === (cfgMoi.crons ?? []).length) {
		console.error(
			"MA 2: so cron cu va moi bang nhau — khong co gi de so, phep do nay khong con nghia",
		);
		process.exit(2);
	}

	if (!existsSync(HAM) || statSync(HAM).size === 0) {
		lech.push(`ham dung ra khong ton tai hoac rong: ${HAM}`);
	} else {
		console.log(`ham dung ra: ${statSync(HAM).size} byte`);
	}

	if (lech.length > 0) {
		console.error("DO: co thu ngoai khoi crons da doi:");
		for (const l of lech) console.error(`  ${l}`);
		ma = 1;
	} else {
		console.log(
			"XANH: chi khoi crons khac; version va routes trung tung ky tu, va ham dung ra van co.",
		);
	}
} finally {
	rmSync(TAM, { force: true });
}
process.exit(ma);
