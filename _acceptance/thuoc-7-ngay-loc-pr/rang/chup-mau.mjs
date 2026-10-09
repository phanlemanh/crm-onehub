import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KHO = "phanlemanh/crm-onehub";
const MAU = join(import.meta.dirname, "mau");

const api = (duong) =>
	JSON.parse(execFileSync("gh", ["api", `repos/${KHO}/${duong}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));

function ghi(ten, du) {
	writeFileSync(join(MAU, `${ten}.json`), `${JSON.stringify(du, null, 1)}\n`);
	console.log(`chup ${ten}`);
}

function annotationCuaJobDung(jobs) {
	return Object.fromEntries(
		jobs
			.filter((j) => j.conclusion === "cancelled")
			.map((j) => [String(j.id), api(`check-runs/${j.id}/annotations`)]),
	);
}

const gonJob = (j) => ({
	id: j.id,
	run_id: j.run_id,
	run_attempt: j.run_attempt,
	name: j.name,
	status: j.status,
	conclusion: j.conclusion,
	started_at: j.started_at,
	completed_at: j.completed_at,
});
const gonRun = (r) => ({
	id: r.id,
	path: r.path,
	event: r.event,
	head_branch: r.head_branch,
	head_sha: r.head_sha,
	run_attempt: r.run_attempt,
	status: r.status,
	conclusion: r.conclusion,
	created_at: r.created_at,
	pull_requests: r.pull_requests,
});
const gonPull = (p) => ({
	number: p.number,
	state: p.state,
	merged_at: p.merged_at,
	head: { ref: p.head.ref, sha: p.head.sha },
	base: { ref: p.base.ref },
});

mkdirSync(MAU, { recursive: true });
for (const id of [37841386976, 37877228894, 37909138411, 37895940297, 37860355090]) {
	const run = api(`actions/runs/${id}`);
	const jobs = api(`actions/runs/${id}/jobs?filter=all&per_page=100`).jobs;
	ghi(`luot-${id}`, {
		run: gonRun(run),
		jobs: jobs.map(gonJob),
		annotations: annotationCuaJobDung(jobs),
		pulls: api(`commits/${run.head_sha}/pulls`).map(gonPull),
	});
}
