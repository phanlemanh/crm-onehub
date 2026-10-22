import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG =
	/^(apps\/[^/]+\/test\/|packages\/[^/]+\/test\/|scripts\/.+\/test\/).+\.(ts|tsx|mjs|js)$/;
const NGHE = '.listen(0, "127.0.0.1")';
const KHANG_DINH = /\bexpect\(|\.toBe\(|\.toEqual\(|\.toContain\(|\.toMatch\(/;

const THEM_MOT_MINH = [
	/^\s*hostname: "127\.0\.0\.1",$/,
	/^\s*await [\w.]+\.listen\(0, "127\.0\.0\.1"\);$/,
];
const BO_MOT_MINH = [/^\s*await [\w.]+\.listen\(0\);$/];
const DOI_DONG = [
	(x) => x.replace(/\.listen\(0\)/, NGHE),
	(x) =>
		KHANG_DINH.test(x)
			? x
			: x.replaceAll("http://localhost:${", "http://127.0.0.1:${"),
	(x) =>
		x.replace(
			/Bun\.serve\(\{ port: (\w+),/,
			'Bun.serve({ port: $1, hostname: "127.0.0.1",',
		),
	(x) => x.replace(/(\w+)\.init\(\)/, `$1${NGHE}`),
	(x) => x.replace(`await app${NGHE}`, "app.getHttpServer()"),
];

function git(...a) {
	return execFileSync("git", a, {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
}

function xet(tep, hunk) {
	const loi = [];
	const daDung = new Set();
	for (const x of hunk.bo) {
		const j = hunk.them.findIndex(
			(y, k) =>
				!daDung.has(k) && DOI_DONG.some((f) => f(x) !== x && f(x) === y),
		);
		if (j >= 0) daDung.add(j);
		else if (!BO_MOT_MINH.some((r) => r.test(x))) {
			loi.push(
				`khang dinh: ${tep}:${hunk.dong} bo dong ngoai nam dang «${x.trim()}»`,
			);
		}
	}
	hunk.them.forEach((y, k) => {
		if (!daDung.has(k) && !THEM_MOT_MINH.some((r) => r.test(y))) {
			loi.push(
				`khang dinh: ${tep}:${hunk.dong} them dong ngoai nam dang «${y.trim()}»`,
			);
		}
	});
	return loi;
}

function tachHunk(diff) {
	const ra = [];
	let tep = null;
	let cur = null;
	for (const d of diff.split("\n")) {
		if (d.startsWith("+++ b/")) tep = d.slice(6);
		else if (d.startsWith("@@")) {
			const m = /\+(\d+)/.exec(d);
			cur = { tep, dong: m ? Number(m[1]) : 0, bo: [], them: [] };
			ra.push(cur);
		} else if (cur && d.startsWith("-") && !d.startsWith("---"))
			cur.bo.push(d.slice(1));
		else if (cur && d.startsWith("+") && !d.startsWith("+++"))
			cur.them.push(d.slice(1));
	}
	return ra;
}

const tuThu = [
	{
		ten: "lanh",
		hunk: {
			dong: 1,
			bo: ["\tawait app.init();", "\t\turl: `http://localhost:${sv.port}`,"],
			them: [
				'\t\thostname: "127.0.0.1",',
				`\tawait app${NGHE};`,
				"\t\turl: `http://127.0.0.1:${sv.port}`,",
			],
		},
		dat: true,
	},
	{
		ten: "doi-expect",
		hunk: {
			dong: 1,
			bo: ["\texpect(r.status).toBe(200);"],
			them: ["\texpect(r.status).toBe(500);"],
		},
		dat: false,
	},
	{
		ten: "expect-doi-localhost",
		hunk: {
			dong: 1,
			bo: ["\texpect(u).toBe(`http://localhost:${p}/x`);"],
			them: ["\texpect(u).toBe(`http://127.0.0.1:${p}/x`);"],
		},
		dat: false,
	},
	{
		ten: "hostname-giua-dong",
		hunk: {
			dong: 1,
			bo: ["\tconst sv = Bun.serve({ port: 0, fetch });"],
			them: [
				'\tconst sv = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch });',
			],
		},
		dat: true,
	},
	{
		ten: "them-dong-la",
		hunk: { dong: 1, bo: [], them: ["\tawait db.user.deleteMany();"] },
		dat: false,
	},
];

const loiTuThu = [];
for (const c of tuThu) {
	const ok = xet("tu-thu", c.hunk).length === 0;
	if (ok !== c.dat)
		loiTuThu.push(`khang dinh: tu thu ${c.ten} ra ${ok} ky vong ${c.dat}`);
}

const tepDoi = new Set();
let diff = "";
let nguon = "";
const base = git("merge-base", "HEAD", "origin/onehub").trim();
const tepNhanh = git("diff", "--name-only", `${base}...HEAD`)
	.split("\n")
	.filter((t) => VUNG.test(t));
if (tepNhanh.length) {
	nguon = `nhanh ${base.slice(0, 12)}...HEAD`;
	for (const t of tepNhanh) tepDoi.add(t);
	diff = git("diff", "-U0", `${base}...HEAD`, "--", ...tepNhanh);
} else {
	const commit = git(
		"log",
		"--no-merges",
		"--grep",
		"test-nghe-127",
		"--format=%H",
	)
		.split("\n")
		.filter(Boolean);
	nguon = `${commit.length} commit test-nghe-127 (nhanh da gop)`;
	for (const c of commit) {
		const tep = git("show", "--name-only", "--format=", c)
			.split("\n")
			.filter((t) => VUNG.test(t));
		for (const t of tep) tepDoi.add(t);
		if (tep.length) diff += git("show", "-U0", "--format=", c, "--", ...tep);
	}
}
const hunks = tachHunk(diff);
const loi = [...loiTuThu, ...hunks.flatMap((h) => xet(h.tep, h))];
if (tepDoi.size === 0)
	loi.push("khang dinh: khong commit nao cua test-nghe-127 doi tep test");

console.log(
	`khang dinh: ${nguon} · ${tepDoi.size} tep test doi · ${hunks.length} khuc · tu thu ${tuThu.length} ca`,
);
for (const l of loi) console.error(`error: ${l}`);
process.exit(loi.length === 0 ? 0 : 1);
