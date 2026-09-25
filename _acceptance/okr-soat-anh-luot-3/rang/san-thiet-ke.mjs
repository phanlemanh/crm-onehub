import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = join(DAY, "..", "..", "..");
const NHANH_GOC = "origin/onehub";
const VUNG =
	/^(apps\/app\/(?!test\/|app\/proto\/).+\.tsx|packages\/ui\/src\/components\/.+\.tsx)$/;
const TEP_PHA = "apps/app/app/(app)/[slug]/okr/hop-thoai-nhap.tsx";

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

const goiKit =
	process.env.CLAUDE_PLUGIN_ROOT ??
	execFileSync(
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
const CONG = join(goiKit, "scripts", "design-gate.mjs");
if (!existsSync(CONG)) khongDo(`khong co ${CONG}`);

function cong(duong) {
	return spawnSync("node", [CONG, "--target", duong, "--mode", "static"], {
		cwd: GOC,
		encoding: "utf8",
	});
}

if (process.argv.includes("--pha")) {
	const tam = mkdtempSync(join(tmpdir(), "osa-san-"));
	const ban = join(tam, "hop-thoai-nhap.tsx");
	const goc = readFileSync(join(GOC, TEP_PHA), "utf8");
	const pha = goc.replace("<TableCell", '<TableCell className="bg-red-500"');
	if (pha === goc) khongDo(`khong chen duoc className vao TableCell cua ${TEP_PHA}`);
	writeFileSync(ban, pha);
	const r = cong(ban);
	rmSync(tam, { recursive: true, force: true });
	const dat = r.status !== 0;
	console.log(
		`${dat ? "DUNG" : "SAI"} pha-bg-red: ban sao co className="bg-red-500" tren TableCell -> design-gate ma ${r.status}`,
	);
	process.exit(dat ? 0 : 1);
}

const moc = git("merge-base", "HEAD", NHANH_GOC);
const tep = git("diff", "--name-only", moc)
	.split("\n")
	.filter(Boolean)
	.filter((t) => VUNG.test(t))
	.filter((t) => existsSync(join(GOC, t)));
if (tep.length === 0) khongDo(`khong tep giao dien nao trong diff so voi ${moc}`);
console.log(`tap tep: ${tep.length} (diff so voi ${NHANH_GOC} @ ${moc.slice(0, 8)})`);

let sai = 0;
for (const t of tep) {
	const r = cong(t);
	if (r.status === 0) {
		console.log(`DUNG ${t}: design-gate ma 0`);
		continue;
	}
	sai += 1;
	console.log(`SAI ${t}: design-gate ma ${r.status}`);
	for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(0, 8))
		console.log(`  ${d}`);
}
console.log(`KET LUAN ${tep.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
process.exit(sai ? 1 : 0);
