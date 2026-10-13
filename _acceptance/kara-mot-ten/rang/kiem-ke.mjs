import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	readdirSync,
	readFileSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const MOC = "4abc05e07";
const TEP = "_acceptance/kara-mot-ten/kiem-ke.json";
const DEM = {
	doi: {
		"ban-ghi": 17,
		"tom-tat": 8,
		soan: 24,
		"cai-dat": 25,
		"tai-lieu": 43,
		"dung-chung": 1,
	},
	tong: 133,
	giu: 8,
	mien: 7,
};
const QUET = `import { mucKhoChu, soatChuCung, soatMotTen, VAT_DOI_DUNG } from "./kara-mot-ten-luat";
process.stdout.write(JSON.stringify({
	kho: soatMotTen(mucKhoChu(), VAT_DOI_DUNG).map((l) => \`\${l.tep}#\${l.khoa}\`),
	cung: soatChuCung([]).map((l) => ({ tep: l.tep, dong: l.dong })),
}));
`;

const loi = [];
const git = (...a) => {
	const r = spawnSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0) throw new Error(`git ${a.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout;
};

const kk = JSON.parse(readFileSync(join(GOC, TEP), "utf8"));
const dem = (f) => kk.filter(f).length;
if (kk.length !== DEM.tong) loi.push(`tong ${kk.length} khac ${DEM.tong}`);
for (const [bm, n] of Object.entries(DEM.doi)) {
	const c = dem((m) => m.be_mat === bm && m.hanh_dong === "doi");
	if (c !== n) loi.push(`${bm}/doi ${c} khac ${n}`);
}
for (const hd of ["giu", "mien"]) {
	const c = dem((m) => m.hanh_dong === hd);
	if (c !== DEM[hd]) loi.push(`${hd} ${c} khac ${DEM[hd]}`);
}
for (const m of kk.filter((x) => x.hanh_dong !== "doi" && !x.ly_do))
	loi.push(`${m.tep}#${m.khoa} thieu ly_do`);

const nguonGoc = new Map();
const docGoc = (tep) => {
	if (!nguonGoc.has(tep)) nguonGoc.set(tep, git("show", `${MOC}:${tep}`));
	return nguonGoc.get(tep);
};
const doan = (cu) =>
	cu
		.split(/(?<!\p{L})[XYZW](?!\p{L})/u)
		.map((s) => s.trim())
		.sort((a, b) => b.length - a.length)[0];
for (const m of kk)
	for (const cu of Object.values(m.cu))
		if (!docGoc(m.tep).includes(doan(cu)))
			loi.push(`kiem-ke ${m.tep}#${m.khoa} khong khop goc`);

const dich = `/private/tmp/kmt-goc-${process.pid}`;
let quet;
try {
	git("worktree", "add", "--detach", dich, MOC);
	symlinkSync(join(GOC, "node_modules"), join(dich, "node_modules"));
	const sinh = join("packages", "db", "src", "generated");
	if (existsSync(join(GOC, sinh)))
		symlinkSync(join(GOC, sinh), join(dich, sinh));
	for (const nhom of ["apps", "packages", "tools"])
		for (const goi of existsSync(join(GOC, nhom))
			? readdirSync(join(GOC, nhom))
			: []) {
			const nm = join(GOC, nhom, goi, "node_modules");
			if (
				existsSync(nm) &&
				existsSync(join(dich, nhom, goi)) &&
				!existsSync(join(dich, nhom, goi, "node_modules"))
			)
				symlinkSync(nm, join(dich, nhom, goi, "node_modules"));
		}
	copyFileSync(
		join(GOC, "apps/app/test/kara-mot-ten-luat.ts"),
		join(dich, "apps/app/test/kara-mot-ten-luat.ts"),
	);
	writeFileSync(join(dich, "apps/app/test/_quet-kmt.ts"), QUET);
	const r = spawnSync("bun", ["./test/_quet-kmt.ts"], {
		cwd: join(dich, "apps/app"),
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0) throw new Error(`quet goc: ${r.stderr.slice(-2000)}`);
	quet = JSON.parse(r.stdout);
} finally {
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", dich]);
}

const khoaKk = new Set(kk.map((m) => `${m.tep}#${m.khoa}`));
const khoaKho = new Set(quet.kho);
for (const k of khoaKho) if (!khoaKk.has(k)) loi.push(`kiem-ke sot ${k}`);
for (const m of kk.filter(
	(x) =>
		(x.hanh_dong === "doi" && x.tep.startsWith("apps/app/lib/messages")) ||
		x.tep === "packages/ui/src/lib/messages.ts",
))
	if (m.hanh_dong === "doi" && !khoaKho.has(`${m.tep}#${m.khoa}`))
		loi.push(`kiem-ke ${m.tep}#${m.khoa} khong trung luat o goc`);
const nguonKk = kk.filter(
	(m) =>
		!m.tep.startsWith("apps/app/lib/messages") &&
		m.tep !== "packages/ui/src/lib/messages.ts",
);
for (const { tep, dong } of quet.cung) {
	const chu = docGoc(tep).split("\n")[dong - 1];
	if (
		!nguonKk.some(
			(m) =>
				m.tep === tep &&
				Object.values(m.cu).some((cu) => chu.includes(doan(cu))),
		)
	)
		loi.push(`kiem-ke sot ${tep}:${dong}`);
}

const dau = git(
	"log",
	"--reverse",
	"--format=%H",
	`${git("merge-base", "HEAD", "origin/onehub").trim()}..HEAD`,
	"--",
	"apps",
	"packages",
)
	.trim()
	.split("\n")[0];
const viet = git("log", "--format=%H", "--", TEP)
	.trim()
	.split("\n")
	.filter(Boolean);
if (dau) {
	const sau = viet.filter(
		(h) =>
			spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", dau, h])
				.status === 0,
	);
	if (sau.length > 0)
		loi.push(
			`kiem-ke viet sau khi sua (${sau.map((h) => h.slice(0, 9)).join(",")})`,
		);
}

if (loi.length > 0) {
	process.stderr.write(`${loi.join("\n")}\n`);
	process.exit(1);
}
process.stdout.write(
	`kiem-ke: ${kk.length} muc, ${dem((m) => m.hanh_dong === "doi")} doi, goc khop\n`,
);
