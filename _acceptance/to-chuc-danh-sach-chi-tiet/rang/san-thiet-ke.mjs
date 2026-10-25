import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NHANH_GOC = "origin/onehub";
const KE_HOACH =
	"docs/superpowers/plans/2026-09-24-to-chuc-danh-sach-chi-tiet.md";
const DONG_KHAI = "- Thành phần dùng chung được sửa";
const VUNG_GIAO_DIEN = /^apps\/app\/(?!test\/).+\.tsx$/;
const VUNG_TO_CHUC =
	/^apps\/app\/app\/\(app\)\/\[slug\]\/settings\/organization\/.+\.tsx$/;
const LOP_DUOC_PHEP = [
	/^(flex|inline-flex|grid|block|hidden|contents|sr-only|truncate|tabular-nums)$/,
	/^(flex-1|flex-col|flex-row|flex-wrap|shrink-0|grow|list-disc|divide-y|ms-auto|me-auto)$/,
	/^(items|justify|self)-(start|end|center|between|stretch)$/,
	/^(gap|gap-x|gap-y|space-x|space-y)-\d+(\.\d+)?$/,
	/^[pm][xytrblse]?-\d+(\.\d+)?$/,
	/^(w|h)-(full|auto|fit|\d+)$/,
	/^(min-w|min-h|max-h|max-w)-(0|full|\d+)$/,
	/^overflow(-[xy])?-(auto|hidden)$/,
	/^(col-span|grid-cols)-\d+$/,
	/^grid-cols-\[[\w(),.%-]+\]$/,
	/^text-(start|end|center|xs|sm|base|lg|muted-foreground|destructive|foreground)$/,
	/^font-(medium|normal)$/,
	/^border(-[etbs])?$/,
	/^rounded-(sm|md|lg)$/,
];

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();
const docTep = (t) => readFileSync(join(GOC, t), "utf8");

const moc = git("merge-base", "HEAD", NHANH_GOC);
const doi = git("diff", "--name-only", `${moc}...HEAD`)
	.split("\n")
	.concat(
		git("diff", "--name-only").split("\n"),
		git("ls-files", "--others", "--exclude-standard").split("\n"),
	)
	.filter(Boolean)
	.filter((t, i, ds) => ds.indexOf(t) === i)
	.filter((t) => existsSync(join(GOC, t)));

const giaoDien = doi.filter((t) => VUNG_GIAO_DIEN.test(t));
console.log(`so tep giao dien vong nay cham: ${giaoDien.length}`);
if (giaoDien.length === 0) {
	console.log(
		"KHONG DO DUOC: khong tep giao dien nao trong diff — khong co gi de soi",
	);
	process.exit(2);
}

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

let hong = 0;
for (const t of giaoDien) {
	const r = spawnSync(
		"node",
		[
			join(goiKit, "scripts", "design-gate.mjs"),
			"--target",
			t,
			"--mode",
			"static",
		],
		{
			cwd: GOC,
			encoding: "utf8",
		},
	);
	if (r.status !== 0) {
		hong += 1;
		console.log(`HONG ${t}: design-gate ma ${r.status}`);
		for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`
			.trim()
			.split("\n")
			.slice(0, 8))
			console.log(`  ${d}`);
	} else {
		console.log(`dat  ${t}`);
	}
}

const theMo =
	/<([A-Za-z][\w.]*)\b((?:[^<>"'{}]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})*)>/g;
const lopCua = (thuocTinh) => {
	const m = /\bclassName=(?:"([^"]*)"|\{\s*"([^"]*)"\s*\}|\{`([^`]*)`\})/.exec(
		thuocTinh,
	);
	if (m) return (m[1] ?? m[2] ?? m[3] ?? "").split(/\s+/).filter(Boolean);
	return /\bclassName=/.test(thuocTinh) ? ["<bieu-thuc>"] : null;
};
const boTienTo = (lop) => lop.replace(/^(sm|md|lg|xl):/, "");

const toChuc = doi.filter((t) => VUNG_TO_CHUC.test(t));
for (const t of toChuc) {
	const chu = docTep(t);
	for (const m of chu.matchAll(theMo)) {
		const ten = m[1];
		const lop = lopCua(m[2]);
		if (lop === null) continue;
		const dong = chu.slice(0, m.index).split("\n").length;
		if (/^[A-Z]/.test(ten)) {
			hong += 1;
			console.log(`HONG ${t}:${dong}: className tren ${ten}`);
			continue;
		}
		const la = lop.filter(
			(l) => !LOP_DUOC_PHEP.some((r) => r.test(boTienTo(l))),
		);
		if (la.length > 0) {
			hong += 1;
			console.log(
				`HONG ${t}:${dong}: <${ten}> co lop ngoai tu vung bo cuc va token: ${la.join(" ")}`,
			);
		}
	}
}
console.log(
	`so tep duoi settings/organization da quet className: ${toChuc.length}`,
);

const ui = git("diff", "--name-only", `${moc}...HEAD`, "--", "packages/ui")
	.split("\n")
	.concat(git("diff", "--name-only", "--", "packages/ui").split("\n"))
	.filter(Boolean)
	.filter((t, i, ds) => ds.indexOf(t) === i);
const dongKhai = (t) =>
	(
		docTep(t)
			.split("\n")
			.find((d) => d.startsWith(DONG_KHAI)) ?? ""
	).match(/packages\/ui\/[^`]+/g) ?? [];
const keHoachKhac = git(
	"diff",
	"--name-only",
	`${moc}...HEAD`,
	"--",
	"docs/superpowers/plans",
)
	.split("\n")
	.filter((t) => t.endsWith(".md") && t !== KE_HOACH)
	.filter((t) => existsSync(join(GOC, t)));
const daKhai = new Set(
	dongKhai(KE_HOACH).concat(keHoachKhac.flatMap((t) => dongKhai(t))),
);
if (dongKhai(KE_HOACH).length === 0) {
	console.log(
		`KHONG DO DUOC: ke hoach ${KE_HOACH} khong co dong «${DONG_KHAI}»`,
	);
	process.exit(2);
}
for (const f of ui) {
	if (daKhai.has(f)) console.log(`dat  ${f}: da khai trong ke hoach`);
	else {
		hong += 1;
		console.log(`HONG packages/ui bi sua ngoai khai bao: ${f}`);
	}
}
process.exit(hong === 0 ? 0 : 1);
