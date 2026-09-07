import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const ra = spawnSync("bunx", ["turbo", "run", "build", "--force"], {
	cwd: GOC,
	encoding: "utf8",
	env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
});

if (ra.error) {
	console.error(`MA 2: khong chay duoc lenh dung — ${ra.error.message}`);
	process.exit(2);
}

const chu = `${ra.stdout}${ra.stderr}`;
if (!/Tasks:\s+\d+ successful/.test(chu)) {
	console.error("MA 2: khong doc duoc dong tong ket cua turbo — lenh dung chua chay tron");
	console.error(chu.slice(-800));
	process.exit(2);
}

const tong = chu.match(/Tasks:\s+(\d+) successful, (\d+) total/);
console.log(`lenh dung: ma ${ra.status} · turbo ${tong?.[1]}/${tong?.[2]} task`);

if (ra.status !== 0) {
	console.error("DO: `bun run build` khong ma 0.");
	console.error(chu.slice(-1500));
	process.exit(1);
}

console.log("XANH: `bun run build` ma 0.");
