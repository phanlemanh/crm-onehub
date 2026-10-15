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
// F8 neo (ve-sinh-do-san-onehub): tap tep cua vong rut tu cap gop PR #146 da dua vong len onehub (B = 679432a0f^1,
// D = 679432a0f), khong tu merge-base(HEAD, onehub) — sau khi gop, merge-base chua san vong
// nay nen tap rong (ma 2) hoac la tep cua vong khac.
const CAP = Object.freeze({
	goc: "100847e8a747d474b79bc10adb82a94e06313f82",
	dinh: "679432a0f013398f717f4d04d3b779d5f3472a3d",
});
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
	const pha = goc.replace(
		"<TableCell",
		'<TableCell className="bg-red-500 text-gray-400"',
	);
	if (pha === goc) khongDo(`khong chen duoc className vao TableCell cua ${TEP_PHA}`);
	writeFileSync(ban, pha);
	const r = cong(ban);
	rmSync(tam, { recursive: true, force: true });
	const dat = r.status !== 0 && /gray-on-color/.test(r.stdout ?? "");
	console.log(
		`${dat ? "DUNG" : "SAI"} pha-gray-on-color: ban sao co className="bg-red-500 text-gray-400" tren TableCell -> design-gate ma ${r.status}`,
	);
	process.exit(dat ? 0 : 1);
}

for (const sha of [CAP.goc, CAP.dinh])
	if (spawnSync("git", ["-C", GOC, "cat-file", "-e", `${sha}^{commit}`]).status !== 0)
		khongDo(`khong giai duoc cap gop ${sha}`);
// F8 neo (ve-sinh-do-san-onehub): tep cua vong = diff cap gop B..D; design-gate soi ban hien tai cua tung tep.
const tep = git("diff", "--name-only", `${CAP.goc}..${CAP.dinh}`)
	.split("\n")
	.filter(Boolean)
	.filter((t) => VUNG.test(t))
	.filter((t) => existsSync(join(GOC, t)));
// F8 neo (ve-sinh-do-san-onehub): cau in goi ten cap gop thay cho merge-base.
if (tep.length === 0) khongDo(`khong tep giao dien nao trong diff cap gop ${CAP.goc.slice(0, 8)}..${CAP.dinh.slice(0, 8)}`);
console.log(`tap tep: ${tep.length} (diff cap gop ${CAP.goc.slice(0, 8)}..${CAP.dinh.slice(0, 8)})`);

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
