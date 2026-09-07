import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const DUONG_KHAI = join(GOC, "apps", "api", "vercel.json");
export const DUONG_CONFIG = join(GOC, ".vercel", "output", "config.json");

export function dungLai() {
	rmSync(DUONG_CONFIG, { force: true });
	const r = spawnSync("node", ["scripts/build-func.mjs"], {
		cwd: join(GOC, "apps", "api"),
		encoding: "utf8",
		env: { ...process.env, DATABASE_URL: "postgresql://x:y@localhost:5432/z" },
	});
	return { ma: r.status, chu: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

export function docConfig() {
	if (!existsSync(DUONG_CONFIG)) return undefined;
	return JSON.parse(readFileSync(DUONG_CONFIG, "utf8"));
}

export function docKhai() {
	return JSON.parse(readFileSync(DUONG_KHAI, "utf8"));
}

export function bangNhau(a, b) {
	return (
		Array.isArray(a) &&
		Array.isArray(b) &&
		a.length === b.length &&
		a.every((x, i) => x.path === b[i].path && x.schedule === b[i].schedule)
	);
}
