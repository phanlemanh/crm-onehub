import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SO_LAN = 20;
const TRAN_MS = 600_000;
const CA = [
	[
		"tasks",
		`bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t 'a limited lock subquery'"`,
	],
	[
		"goiKiemTu",
		`bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/goi-soan.integration.spec.ts -t goiKiemTu"`,
	],
];

const ketQua = [];
let hong = 0;
for (const [ten, lenh] of CA) {
	let xanh = 0;
	for (let lan = 1; lan <= SO_LAN; lan++) {
		const r = spawnSync("sh", ["-c", lenh], {
			cwd: GOC,
			encoding: "utf8",
			timeout: TRAN_MS,
			maxBuffer: 64 * 1024 * 1024,
		});
		if (r.status === 0) {
			xanh++;
			continue;
		}
		hong++;
		const ra = `${r.stdout}\n${r.stderr}`.split("\n");
		const loi = ra.find((d) => /^(error|[A-Za-z]*Error):/.test(d)) ?? "";
		const ca = ra.find((d) => d.startsWith("(fail)")) ?? "";
		console.log(`${ten} lan ${lan} do (ma ${r.status}): ${ca} ${loi}`);
	}
	ketQua.push(`${ten} ${xanh}/${SO_LAN}`);
}
console.log(`LAP: ${ketQua.join(", ")}`);
process.exit(hong === 0 ? 0 : 1);
