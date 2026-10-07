import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const REPO = "phanlemanh/crm-onehub";
const JOB = "check-types, lint, test";
const BUOC = "Run bun run test";
const TRAN_JOB_PHUT = 22;
const TRAN_BUOC_PHUT = 16;
const SO_LUOT = 30;
const SO_SANH = [
	"scripts/ci",
	"package.json",
	"packages/db/scripts/test-run.ts",
];

function lenh(cmd, doiSo) {
	const r = spawnSync(cmd, doiSo, { cwd: GOC, encoding: "utf8" });
	return r.status === 0 ? r.stdout.trim() : null;
}

function cay(sha, p) {
	return lenh("git", ["rev-parse", `${sha}:${p}`]);
}

function phut(a, b) {
	return (new Date(b) - new Date(a)) / 60000;
}

function chinh() {
	const nhanh = lenh("git", ["branch", "--show-current"]);
	const runs = JSON.parse(
		lenh("gh", [
			"run",
			"list",
			"--repo",
			REPO,
			"--workflow",
			"CI",
			"--branch",
			nhanh,
			"--status",
			"completed",
			"--limit",
			String(SO_LUOT),
			"--json",
			"databaseId,headSha",
		]) ?? "[]",
	);
	const dau = SO_SANH.map((p) => cay("HEAD", p));
	const khop = runs.find((r) =>
		SO_SANH.every((p, i) => cay(r.headSha, p) === dau[i]),
	);
	if (!khop) {
		console.log("KHONG DO DUOC: chua co luot CI cho cay hien tai");
		process.exit(2);
	}
	const jobs =
		JSON.parse(
			lenh("gh", [
				"run",
				"view",
				String(khop.databaseId),
				"--repo",
				REPO,
				"--json",
				"jobs",
			]) ?? "{}",
		).jobs ?? [];
	const job = jobs.find((j) => j.name === JOB);
	const buoc = job?.steps?.find((s) => s.name === BUOC);
	if (!job || !buoc) {
		console.log(
			`KHONG DO DUOC: luot ${khop.databaseId} khong co job/buoc can do`,
		);
		process.exit(2);
	}
	const pJob = phut(job.startedAt, job.completedAt);
	const pBuoc = phut(buoc.startedAt, buoc.completedAt);
	console.log(
		`luot ${khop.databaseId} sha ${khop.headSha.slice(0, 9)}: job ${job.conclusion} ${pJob.toFixed(1)}p · buoc test ${pBuoc.toFixed(1)}p`,
	);
	const ok =
		job.conclusion === "success" &&
		pJob < TRAN_JOB_PHUT &&
		pBuoc < TRAN_BUOC_PHUT;
	console.log(
		ok
			? "XANH"
			: `DO: can success, job < ${TRAN_JOB_PHUT}p, buoc test < ${TRAN_BUOC_PHUT}p`,
	);
	process.exit(ok ? 0 : 1);
}

chinh();
