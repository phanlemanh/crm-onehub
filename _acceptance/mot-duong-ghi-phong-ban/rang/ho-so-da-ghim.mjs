import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const CHINH = "mot-duong-ghi-phong-ban";
const TAM = [
	"dieu-phoi-30-ngay-dau",
	"test-api-khong-de-viec-vo-chu",
	"quan-ly-danh-muc-30-ngay",
	"noi-bon-nut-dieu-phoi",
	"khuon-mat-bo-phan",
	"sua-luu-tru-dieu-phoi",
	"cau-truc-to-chuc",
	"to-chuc-danh-sach-chi-tiet",
];
const DA_KY = new Set([
	"signed-off",
	"machine-cleared",
	"da-cham-boi-thuc-te",
	"verified",
]);

function git(...doi) {
	const r = spawnSync("git", ["-C", GOC, ...doi], {
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});
	if (r.status !== 0) throw new Error(`git ${doi.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

const docTep = (t) => fs.readFileSync(path.join(GOC, t), "utf8");

function docCauHinh() {
	const chu = docTep("_acceptance/config.yaml");
	const lenh = new Map();
	for (const m of chu.matchAll(/^ {4}([a-z0-9_]+):\s*(.+)$/gm)) {
		lenh.set(m[1], m[2]);
	}
	const t1 = [];
	const khoi = chu.split("t1_skip_globs:")[1]?.split(/\n {2}[a-z]/)[0] ?? "";
	for (const m of khoi.matchAll(/^\s+- "([^"]+)"/gm)) t1.push(m[1]);
	return { lenh, t1 };
}

function hoSo() {
	return fs
		.readdirSync(path.join(GOC, "_acceptance"), { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.flatMap((slug) => {
			const c = path.join(GOC, "_acceptance", slug, "contract.md");
			const e = path.join(GOC, "_acceptance", slug, "evals.yaml");
			if (!fs.existsSync(c) || !fs.existsSync(e)) return [];
			const trangThai = fs
				.readFileSync(c, "utf8")
				.match(/^status:\s*(\S+)/m)?.[1];
			const refs = [];
			for (const khoi of fs.readFileSync(e, "utf8").split(/\n\s*- id:/)) {
				const loai = khoi.match(/executor:\s*(\w+)/)?.[1];
				const ref = khoi.match(/cmd:\s*config:executors\.\w+\.(\w+)/)?.[1];
				if (ref && (loai === "test" || loai === "script")) refs.push(ref);
			}
			return [{ slug, trangThai, refs }];
		});
}

function tapBiCham(dsHoSo, lenh, tepKiemDoi) {
	return dsHoSo
		.filter((h) => h.slug !== CHINH && DA_KY.has(h.trangThai))
		.filter((h) =>
			h.refs.some((r) => {
				const cmd = lenh.get(r) ?? "";
				return tepKiemDoi.some((t) => {
					const ten = path.basename(t).replace(/\./g, "\\.");
					return new RegExp(`(^|[/ "'])${ten}\\b`).test(cmd);
				});
			}),
		)
		.map((h) => h.slug)
		.sort();
}

function dongGhimCuoi(runLog) {
	const dong = runLog
		.split("\n")
		.filter(Boolean)
		.flatMap((d) => {
			try {
				return [JSON.parse(d)];
			} catch {
				return [];
			}
		})
		.filter((d) => d.kind === "repin");
	return dong.at(-1);
}

function soGhim(slug, ghim, verifiedCommit, tepDoiTuPin, t1) {
	const loi = [];
	if (!ghim) return [`${slug}: khong co dong repin`];
	const evals = Object.values(ghim.evals_exit ?? {});
	if (evals.length === 0 || evals.some((x) => x !== 0)) {
		loi.push(`${slug}: lan ghim co eval do`);
	}
	if (!(ghim.suites_exit ?? []).every((x) => x === 0)) {
		loi.push(`${slug}: lan ghim co suite do`);
	}
	if (ghim.sha !== verifiedCommit) {
		loi.push(`${slug}: sha ${ghim.sha} khac verified_commit ${verifiedCommit}`);
	}
	const hoaCu = tepDoiTuPin.filter(
		(t) =>
			!t.startsWith("_acceptance/") &&
			!t1.some((g) => new Bun.Glob(g).match(t)),
	);
	if (hoaCu.length > 0)
		loi.push(`${slug}: hoa cu — ${hoaCu.slice(0, 3).join(", ")}`);
	return loi;
}

function demKhangDinh(chu) {
	return (chu.match(/\bexpect\(|\bok\(/g) ?? []).length;
}

const { lenh, t1 } = docCauHinh();
const base = git("merge-base", "HEAD", "origin/onehub").trim();
const tepKiemDoi = git("diff", "--name-only", base, "HEAD")
	.split("\n")
	.filter((t) => /^apps\/[^/]+\/test\/.+\.(ts|tsx)$/.test(t));
const dsHoSo = hoSo();
let so = 0;
const loi = [];

const tap = tapBiCham(dsHoSo, lenh, tepKiemDoi);
so += 1;
if (JSON.stringify(tap) !== JSON.stringify([...TAM].sort())) {
	loi.push(
		`tap bi cham lech: thua ${tap.filter((s) => !TAM.includes(s)).join(",") || "-"} · thieu ${TAM.filter((s) => !tap.includes(s)).join(",") || "-"}`,
	);
}

const runIds = new Set();
const ghimTheoSlug = new Map();
for (const slug of TAM) {
	const runLog = docTep(`_acceptance/${slug}/run-log.jsonl`);
	const ghim = dongGhimCuoi(runLog);
	ghimTheoSlug.set(slug, ghim);
	const vc = docTep(`_acceptance/${slug}/evidence-report.md`).match(
		/^verified_commit:\s*(\S+)/m,
	)?.[1];
	const doi = ghim?.sha
		? git("diff", "--name-only", ghim.sha, "HEAD").split("\n").filter(Boolean)
		: [];
	loi.push(...soGhim(slug, ghim, vc, doi, t1));
	if (ghim?.run_id) runIds.add(ghim.run_id);
	so += 4;
}
so += 1;
if (runIds.size !== 1)
	loi.push(`tam ho so khong chung mot run_id: ${[...runIds].join(", ")}`);

const pm = spawnSync(
	"bash",
	["scripts/pre-merge-check.sh", ".", "--base", "origin/onehub"],
	{ cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
);
const viPham = `${pm.stdout}\n${pm.stderr}`
	.split("\n")
	.filter((d) => d.includes("VIOLATION"));
const viPhamKhac = viPham.filter((d) => !d.includes(`[${CHINH}]`));
so += 1;
console.log(
	`pre-merge-check toan kho: ${viPham.length} VIOLATION, ${viPhamKhac.length} o ho so khac`,
);
for (const d of viPhamKhac) loi.push(`pre-merge: ${d.trim()}`);

const tepKiemCuaTap = tepKiemDoi.filter((t) =>
	dsHoSo
		.filter((h) => TAM.includes(h.slug))
		.some((h) =>
			h.refs.some((r) => (lenh.get(r) ?? "").includes(path.basename(t))),
		),
);
fs.writeFileSync(
	path.join(GOC, "_acceptance", CHINH, "bai-kiem-da-ky.diff"),
	git("diff", base, "HEAD", "--", ...tepKiemCuaTap),
);
const hang = tepKiemCuaTap.map((t) => {
	let truoc = 0;
	try {
		truoc = demKhangDinh(git("show", `${base}:${t}`));
	} catch {
		truoc = 0;
	}
	return `| \`${t}\` | ${truoc} | ${demKhangDinh(docTep(t))} |`;
});
fs.writeFileSync(
	path.join(GOC, "_acceptance", CHINH, "bai-kiem-dem.md"),
	[
		`# Đếm khẳng định trước và sau — base ${base.slice(0, 8)}`,
		"",
		"| Tệp | expect/ok trước | expect/ok sau |",
		"|---|---|---|",
		...hang,
		"",
	].join("\n"),
);
console.log(
	`sinh: bai-kiem-da-ky.diff (${tepKiemCuaTap.length} tep), bai-kiem-dem.md`,
);

const doCau = ghimTheoSlug.get("cau-truc-to-chuc");
const hong = doCau
	? {
			...doCau,
			evals_exit: Object.fromEntries(
				Object.entries(doCau.evals_exit ?? { E0: 0 }).map(([k, v], i) => [
					k,
					i === 0 ? 1 : v,
				]),
			),
		}
	: undefined;
const doMot = soGhim("cau-truc-to-chuc", hong, hong?.sha, [], t1).some((l) =>
	l.startsWith("cau-truc-to-chuc: lan ghim co eval do"),
);
const gia = {
	slug: "ho-so-gia",
	trangThai: "signed-off",
	refs: ["__gia__"],
};
const lenhGia = new Map([
	...lenh,
	["__gia__", "bun test apps/api/test/dieu-phoi.spec.ts"],
]);
const tapGia = tapBiCham([...dsHoSo, gia], lenhGia, tepKiemDoi);
const doHai = tapGia.includes("ho-so-gia") && !TAM.includes("ho-so-gia");
console.log(
	`chieu do: ${doMot ? "cau-truc-to-chuc: lan ghim co eval do" : "KHONG BAT eval do"} · ${doHai ? "ho-so-gia: bi cham ma chua ghim lai" : "KHONG BAT ho so gia"}`,
);
if (!doMot || !doHai) {
	console.error("thuoc mu");
	process.exit(2);
}

console.log(`khang dinh: ${so}, loi: ${loi.length}`);
for (const l of loi) console.error(l);
process.exit(loi.length === 0 ? 0 : 1);
