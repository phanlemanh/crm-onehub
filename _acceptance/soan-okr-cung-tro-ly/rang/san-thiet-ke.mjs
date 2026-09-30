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
const CAU_HINH = {
	nhanGoc: "origin/onehub",
	vung: /^(apps\/app\/app\/\(app\)\/\[slug\]\/okr\/soan\/.+\.tsx|apps\/app\/app\/\(app\)\/\[slug\]\/okr\/theo-don-vi\/.+\.tsx|apps\/app\/app\/\(app\)\/\[slug\]\/settings\/okr\/(the-tro-ly-okr|the-soan-so-do)\.tsx|apps\/app\/app\/\(app\)\/\[slug\]\/settings\/organization\/.+\.tsx|apps\/app\/app\/\(app\)\/\[slug\]\/tai-lieu\/.+\.tsx|packages\/ui\/src\/components\/(proposed-change|empty|nav-item|section-heading)\.tsx|packages\/ui\/src\/components\/ai-elements\/(suggestion|prompt-input)\.tsx)$/,
	tepPha: "apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx",
	chenPha: 'className="bg-red-500 text-gray-400"',
	tienToTam: "soan-san-",
};

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
	const tam = mkdtempSync(join(tmpdir(), CAU_HINH.tienToTam));
	const ban = join(tam, "bang-nhap.tsx");
	const goc = readFileSync(join(GOC, CAU_HINH.tepPha), "utf8");
	const pha = goc.replace("<Button", `<Button ${CAU_HINH.chenPha}`);
	if (pha === goc)
		khongDo(`khong chen duoc className vao Button cua ${CAU_HINH.tepPha}`);
	writeFileSync(ban, pha);
	const r = cong(ban);
	rmSync(tam, { recursive: true, force: true });
	const dat = r.status !== 0 && /gray-on-color/.test(r.stdout ?? "");
	console.log(
		`${dat ? "DUNG" : "SAI"} pha-gray-on-color: ban sao co ${CAU_HINH.chenPha} tren Button -> design-gate ma ${r.status}`,
	);
	process.exit(dat ? 0 : 1);
}

const moc = git("merge-base", "HEAD", CAU_HINH.nhanGoc);
const tep = git("diff", "--name-only", moc)
	.split("\n")
	.filter(Boolean)
	.filter((t) => CAU_HINH.vung.test(t))
	.filter((t) => existsSync(join(GOC, t)));
if (tep.length === 0)
	khongDo(`khong tep giao dien nao trong diff so voi ${moc}`);
console.log(
	`tap tep: ${tep.length} (diff so voi ${CAU_HINH.nhanGoc} @ ${moc.slice(0, 8)})`,
);

let sai = 0;
for (const t of tep) {
	const r = cong(t);
	if (r.status === 0) {
		console.log(`DUNG ${t}: design-gate ma 0`);
		continue;
	}
	sai += 1;
	console.log(`SAI ${t}: design-gate ma ${r.status}`);
	for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`
		.trim()
		.split("\n")
		.slice(0, 8))
		console.log(`  ${d}`);
}
console.log(
	`KET LUAN ${tep.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
