import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TEP = ".github/workflows/ci.yml";
const BAN_323 = join(import.meta.dirname, "ci-323.yml");
const BLOB_323 = "c4c5f58e06e42e594b519c2a2e7eb40fb9afbfcb";
const KHO = "phanlemanh/crm-onehub";
const LUOT_323 = ["37860355090", "37862221635"];
const KHOA_JOB = [
	"name",
	"runs-on",
	"strategy",
	"services",
	"env",
	"steps",
	"needs",
	"if",
];

const blob = execFileSync("git", ["-C", GOC, "hash-object", BAN_323], {
	encoding: "utf8",
}).trim();
if (blob !== BLOB_323) {
	console.error(
		`khop-323: ${BAN_323} co blob ${blob}, khac ban da do ${BLOB_323}`,
	);
	process.exit(2);
}

function khac(a, b) {
	const ra = [];
	const ten = [
		...new Set([...Object.keys(a.jobs ?? {}), ...Object.keys(b.jobs ?? {})]),
	];
	for (const j of ten)
		for (const k of KHOA_JOB) {
			const x = JSON.stringify(a.jobs?.[j]?.[k] ?? null);
			const y = JSON.stringify(b.jobs?.[j]?.[k] ?? null);
			if (x !== y) ra.push(`jobs.${j}.${k}`);
		}
	return ra;
}

const da = Bun.YAML.parse(readFileSync(BAN_323, "utf8"));
const that = readFileSync(join(GOC, TEP), "utf8");
const hong = khac(Bun.YAML.parse(that), da).map(
	(k) => `ban that khac ban #323 o ${k}`,
);

const pha = that.replace(
	"loc: --filter=api\n",
	"loc: --filter=api --filter=@crm/db\n",
);
if (pha === that) hong.push("chieu do: khong tao duoc ban sao");
else {
	const k = khac(Bun.YAML.parse(pha), da);
	const bat = k.some((x) => x.startsWith("jobs.test.strategy"));
	console.log(
		`chieu do doi bo loc o api: ${bat ? "DO dung cho" : "KHONG BAT"} — ${k.join(", ")}`,
	);
	if (!bat) hong.push("chieu do: khong bat jobs.test.strategy.matrix");
}

for (const run of LUOT_323) {
	const r = JSON.parse(
		execFileSync("gh", ["api", `repos/${KHO}/actions/runs/${run}`], {
			encoding: "utf8",
		}),
	);
	const jobs = JSON.parse(
		execFileSync("gh", ["api", `repos/${KHO}/actions/runs/${run}/jobs`], {
			encoding: "utf8",
		}),
	).jobs;
	const dai = Math.max(
		...jobs.map(
			(j) => (Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000,
		),
	);
	console.log(
		`luot #323 ${run}: ${r.conclusion}, job dai nhat ${dai.toFixed(1)} phut`,
	);
	if (r.conclusion !== "success")
		hong.push(`luot #323 ${run} khong xanh (${r.conclusion})`);
}

if (hong.length > 0) {
	console.error(hong.join("\n"));
	process.exit(1);
}
console.log(
	`khop-323: ${TEP} trung ban da do o #323 (blob ${BLOB_323.slice(0, 9)}) tren ${KHOA_JOB.join(", ")}; chieu do dung cho`,
);
