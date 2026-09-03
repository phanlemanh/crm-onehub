import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const GOC = [
	"apps/app/app/(app)/[slug]/companies",
	"apps/app/app/(app)/[slug]/contacts",
	"apps/app/app/(app)/[slug]/deals",
	"apps/app/components/crm/record-sheet",
	"apps/app/components/crm/timeline",
];
const CHAN = /\/(agent-builder|ai-elements|landing)\/|agent-[\w-]+\.(tsx|ts)$|\/agent-panel\.tsx$/;

const all = new Set(
	execFileSync("git", ["ls-files", "apps/app"], { encoding: "utf8" })
		.trim()
		.split("\n")
		.filter((f) => /\.(tsx|ts)$/.test(f))
		.filter((f) => !/\.(spec|test)\.(tsx|ts)$/.test(f)),
);

function giai(tu, spec) {
	if (spec.startsWith("@/")) {
		const p = `apps/app/${spec.slice(2)}`;
		for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
			if (all.has(p + ext)) return p + ext;
		}
		return all.has(p) ? p : null;
	}
	if (spec.startsWith(".")) {
		const p = path.posix.normalize(path.posix.join(path.posix.dirname(tu), spec));
		for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
			if (all.has(p + ext)) return p + ext;
		}
	}
	return null;
}

export function lat() {
	const hat = [...all].filter((f) => GOC.some((g) => f.startsWith(`${g}/`)) && !CHAN.test(f));
	const tham = new Set(hat);
	const hangdoi = [...hat];
	while (hangdoi.length) {
		const f = hangdoi.shift();
		if (!existsSync(f)) continue;
		for (const m of readFileSync(f, "utf8").matchAll(/from\s+["']([^"']+)["']/g)) {
			const t = giai(f, m[1]);
			if (t && !tham.has(t) && !CHAN.test(t)) {
				tham.add(t);
				hangdoi.push(t);
			}
		}
	}
	return { hat: new Set(hat), tham };
}

if (process.argv[1]?.endsWith("lat.mjs")) {
	const { hat, tham } = lat();
	console.log(`file goc (ba luong ve ra):        ${hat.size}`);
	console.log(`+ file chung nhap vao:            ${tham.size - hat.size}`);
	console.log(`= lat tong cong:                  ${tham.size}`);
	if (process.argv[2] === "--liet-ke") for (const f of [...tham].sort()) console.log(`  ${f}`);
	if (process.argv[2] === "--them") for (const f of [...tham].sort()) if (!hat.has(f)) console.log(`  ${f}`);
}
