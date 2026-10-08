import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..", process.env.CCCL_GOC ?? "");
const BIEN = "SOKR_KHONG_CHAY_AGENT_CU";
const CANH_BAO = "bo qua ca chay canh apps/agent";
const CA = /\(pass\)[^\n]*chạy cạnh apps\/agent/;
const NODE_TOI_THIEU = 24;

const nodeCua = spawnSync("node", ["--version"], { encoding: "utf8" }).stdout?.trim() ?? "";
if (Number(nodeCua.match(/^v(\d+)/)?.[1] ?? 0) < NODE_TOI_THIEU) {
	console.error(`can Node ${NODE_TOI_THIEU}, may chay ${nodeCua || "khong co node"}`);
	process.exit(2);
}

function chay(bat) {
	const env = { ...process.env };
	delete env[BIEN];
	if (bat) env[BIEN] = "1";
	const r = spawnSync(
		"bun",
		[
			"run",
			"test",
			"--",
			'./node_modules/.bin/turbo run test --filter=agent-okr -- test/app-rieng.integration.spec.ts -t "chạy cạnh"',
		],
		{ cwd: GOC, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	return { ma: r.status, log: `${r.stdout}\n${r.stderr}` };
}

const bat = chay(true);
const tat = chay(false);
const loi = [];
if (bat.log.includes(CANH_BAO) && !CA.test(bat.log)) console.log("BAT: bo ca");
else loi.push(`cong tac khong toi test (ma ${bat.ma})`);
if (CA.test(tat.log) && !tat.log.includes(CANH_BAO)) console.log("TAT: chay ca");
else loi.push(`tat bien ma ca khong chay (ma ${tat.ma})`);
if (loi.length > 0) {
	console.error(loi.join("\n"));
	console.error(bat.log.split("\n").filter((d) => /chạy cạnh|bo qua|pass|fail/.test(d)).join("\n"));
	process.exit(1);
}
