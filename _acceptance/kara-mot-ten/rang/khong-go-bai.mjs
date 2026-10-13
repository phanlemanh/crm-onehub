import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = join(GOC, "_acceptance", "kara-mot-ten");
const BAI = /\.(spec\.ts|spec\.tsx|dom\.tsx|test\.ts)$/;
const CAM_THEM = /\.(skip|only|todo)\(|test\.if\(\s*false/g;
const GOI = /\b(test|it)\(/g;

const git = (...a) => {
	const r = spawnSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0) throw new Error(`git ${a.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout;
};
const goc = git("merge-base", "HEAD", "origin/onehub").trim();
const dem = (s, re) => (s.match(re) ?? []).length;

const vi = [];
const doi = git("diff", "--name-status", goc, "HEAD")
	.trim()
	.split("\n")
	.filter(Boolean)
	.map((d) => d.split("\t"))
	.filter(([, t]) => BAI.test(t));
for (const [trangThai, tep] of doi) {
	if (trangThai.startsWith("D")) {
		vi.push(`${tep}: xoa tep bai`);
		continue;
	}
	if (trangThai.startsWith("A")) continue;
	const cu = git("show", `${goc}:${tep}`);
	const moi = readFileSync(join(GOC, tep), "utf8");
	if (dem(moi, GOI) < dem(cu, GOI))
		vi.push(
			`${tep}: so loi goi test/it giam ${dem(cu, GOI)} -> ${dem(moi, GOI)}`,
		);
	if (dem(moi, CAM_THEM) > dem(cu, CAM_THEM))
		vi.push(`${tep}: them skip/only/todo`);
}

const sua = doi.filter(([t]) => t.startsWith("M")).map(([, t]) => t);
const hoSo = readdirSync(join(GOC, "_acceptance"), { withFileTypes: true })
	.filter((d) => d.isDirectory() && d.name !== "kara-mot-ten")
	.map((d) => d.name)
	.filter((ten) => {
		try {
			return /^status: (signed-off|machine-cleared)$/m.test(
				readFileSync(join(GOC, "_acceptance", ten, "contract.md"), "utf8"),
			);
		} catch {
			return false;
		}
	});
const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
const lenhCua = (khoa) =>
	cauHinh.match(new RegExp(`^ {4}${khoa}: (.*)$`, "m"))?.[1] ?? "";
const bang = sua.map((tep) => {
	const ten = tep.split("/").at(-1);
	const co = hoSo.filter((h) => {
		let evals;
		try {
			evals = readFileSync(join(GOC, "_acceptance", h, "evals.yaml"), "utf8");
		} catch {
			return false;
		}
		const lenh = [...evals.matchAll(/cmd: config:executors\.\w+\.(\w+)/g)].map(
			(m) => lenhCua(m[1]),
		);
		return lenh.some((l) => l.includes(ten)) || evals.includes(tep);
	});
	return `| ${tep} | ${co.join(", ") || "—"} |`;
});
mkdirSync(join(HO_SO, "evidence"), { recursive: true });
writeFileSync(
	join(HO_SO, "evidence", "ho-so-bai-doi.md"),
	[
		"# Tệp bài đã đổi và hồ sơ đã ký chạy nó",
		"",
		`So với merge-base ${goc.slice(0, 9)}. Hồ sơ ở cột phải ghim lại ở đuôi vòng (điều kiện cham-tep P1-2).`,
		"",
		"| Tệp bài | Hồ sơ đã ký |",
		"|---|---|",
		...bang,
		"",
	].join("\n"),
);
if (vi.length > 0) {
	process.stderr.write(`${vi.join("\n")}\n`);
	process.exit(1);
}
process.stdout.write(`khong-go-bai: ${doi.length} tep doi, 0 vi pham\n`);
