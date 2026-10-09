import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const NHANH = process.env.NHANH_GOC ?? "origin/onehub";

function git(...a) {
	return execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
}

function gocKit() {
	if (process.env.CLAUDE_PLUGIN_ROOT) return process.env.CLAUDE_PLUGIN_ROOT;
	return execFileSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
			"--require",
			"scripts/design-scan.js",
		],
		{ encoding: "utf8" },
	).trim();
}

export function tepTrongDiff() {
	const moc = git("merge-base", "HEAD", NHANH);
	return git("diff", "--name-only", "--diff-filter=AM", moc)
		.split("\n")
		.filter(
			(t) =>
				t.endsWith(".tsx") &&
				(t.startsWith("apps/app/") || t.startsWith("packages/ui/src/")) &&
				!t.includes("/test/"),
		);
}

function soi(kit, tep) {
	const ra = spawnSync(
		"node",
		[
			join(kit, "scripts", "design-gate.mjs"),
			"--target",
			tep,
			"--mode",
			"static",
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	const kq = JSON.parse(ra.stdout);
	return {
		tep,
		p0: kq.p0_count,
		luat: kq.blocking.map((b) => b.rule ?? String(b)),
		ma: ra.status,
	};
}

export function kiem(kit, ds) {
	return ds.map((tep) => soi(kit, tep));
}

function inKetQua(kq) {
	for (const k of kq) {
		console.log(
			`${k.p0 === 0 ? "DUNG" : "SAI"} ${k.tep}: p0 ${k.p0}${k.luat.length > 0 ? ` (${k.luat.join(", ")})` : ""}`,
		);
	}
}

const kit = gocKit();
const ds = tepTrongDiff();

if (process.argv.includes("--tu-thu")) {
	const tam = mkdtempSync(join(tmpdir(), "dsk-san-thiet-ke-"));
	const gia = join(tam, "gia-xam-tren-mau.tsx");
	writeFileSync(
		gia,
		'export const X = () => <div className="bg-blue-600 text-gray-500">x</div>;\n',
	);
	try {
		const kq = kiem(kit, [...ds, gia]);
		inKetQua(kq);
		const bat = kq.some((k) => k.tep === gia && k.p0 > 0);
		const sachCon = kq.filter((k) => k.tep !== gia).every((k) => k.p0 === 0);
		console.log(
			`tu-thu: ${bat ? "bat duoc tep gia" : "BO LOT tep gia"}; doi chung ${sachCon ? "sach" : "co P0"}`,
		);
		process.exit(bat && sachCon ? 0 : 1);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

console.log(`${ds.length} tep`);
if (ds.length === 0) {
	console.log("KET LUAN: khong co tep giao dien trong diff — khong do duoc");
	process.exit(2);
}
const kq = kiem(kit, ds);
inKetQua(kq);
const hong = kq.filter((k) => k.p0 > 0);
console.log(
	`KET LUAN: ${hong.length === 0 ? "khong P0" : `${hong.length} tep co P0`}`,
);
process.exit(hong.length === 0 ? 0 : 1);
