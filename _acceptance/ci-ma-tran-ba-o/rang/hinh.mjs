import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TEP = ".github/workflows/ci.yml";
const TRAN_PHUT = 20;
const O = [
	["api", "--filter=api"],
	["app-ui", "--filter=app --filter=@crm/ui"],
	["con-lai", "--filter=!api --filter=!app --filter=!@crm/ui"],
];
const KET_QUA = ["success", "failure", "cancelled", "skipped"];
const LENH_TEST = "bun run test -- ${{ matrix.o.loc }}";
const KHOA_GOC = ["on", "concurrency", "permissions", "env"];
const NEN_TRUOC_GOP = "1dd4e587bf9d77b9eaa357df6ee1e8950178b169";

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const chay = (j) => (j.steps ?? []).map((b) => String(b.run ?? "").trim());
const bang = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function hinh(wf, cu) {
	const loi = [];
	const jobs = wf.jobs ?? {};
	if (!bang(Object.keys(jobs).sort(), ["check", "ci-ok", "test"]))
		loi.push(`jobs: ${Object.keys(jobs).join(", ")} khac check, test, ci-ok`);
	const { check, test } = jobs;
	const ok = jobs["ci-ok"];
	if (!check || !test || !ok) return loi;
	const rc = chay(check);
	const thuTu = [
		"bun install --frozen-lockfile",
		"bun run check-types",
		"bun run lint",
		"bun run lint:slop",
	];
	const vt = thuTu.map((l) => rc.indexOf(l));
	if (vt.some((i) => i === -1) || vt.some((i, k) => k > 0 && i < vt[k - 1]))
		loi.push(`check: chuoi buoc ${rc.filter(Boolean).join(" -> ")}`);
	const ct = check.steps.find(
		(b) => String(b.run ?? "").trim() === "bun run check-types",
	);
	if (ct?.env?.NODE_OPTIONS !== "--max-old-space-size=6144")
		loi.push("check: check-types thieu NODE_OPTIONS=--max-old-space-size=6144");
	if (check.services) loi.push("check: khong duoc co dich vu Postgres");
	if (test.strategy?.["fail-fast"] !== false)
		loi.push("test: fail-fast khac false");
	const o = (test.strategy?.matrix?.o ?? []).map((x) => [x.ten, x.loc]);
	if (!bang(o, O)) loi.push(`test: ma tran ${JSON.stringify(o)}`);
	if (!test.services?.postgres) loi.push("test: thieu dich vu postgres");
	const rt = chay(test);
	const iDeploy = rt.indexOf("bun run db:deploy");
	const iTest = rt.indexOf(LENH_TEST);
	if (iDeploy === -1 || iTest === -1 || iDeploy > iTest)
		loi.push("test: db:deploy phai dung truoc buoc test co bo loc");
	if (!bang([...(ok.needs ?? [])].sort(), ["check", "test"]))
		loi.push(`ci-ok: needs ${JSON.stringify(ok.needs)}`);
	if (ok.if !== "always()")
		loi.push("ci-ok: thieu if always() — ci-ok co the bi bo qua");
	for (const [ten, j] of Object.entries(jobs))
		if (!(Number(j["timeout-minutes"]) <= TRAN_PHUT))
			loi.push(
				`${ten}: timeout-minutes ${j["timeout-minutes"]} > ${TRAN_PHUT}`,
			);
	const jobCu = Object.values(cu.jobs ?? {});
	const envCu = new Set(jobCu.flatMap((j) => Object.keys(j.env ?? {})));
	for (const k of envCu)
		if (!(k in (test.env ?? {}))) loi.push(`test: thieu bien ${k} cua job cu`);
	const runMoi = new Set([...rc, ...rt]);
	for (const l of jobCu.flatMap(chay).filter(Boolean)) {
		const doi = l === "bun run test" ? LENH_TEST : l;
		if (!runMoi.has(doi)) loi.push(`thieu lenh cu «${l}»`);
	}
	for (const k of KHOA_GOC)
		if (!bang(wf[k], cu[k])) loi.push(`khoa cap goc ${k} khac ban onehub`);
	return loi;
}

function ac3(wf) {
	const lenh = String(wf.jobs?.["ci-ok"]?.steps?.at(-1)?.run ?? "");
	const loi = [];
	for (const a of KET_QUA)
		for (const b of KET_QUA) {
			const ban = lenh
				.replaceAll("${{ needs.check.result }}", a)
				.replaceAll("${{ needs.test.result }}", b);
			const ma = spawnSync("bash", ["-c", ban]).status;
			const nen = a === "success" && b === "success" ? 0 : 1;
			if ((ma === 0) !== (nen === 0))
				loi.push(`o (${a}, ${b}): ci-ok ma ${ma}`);
		}
	return loi;
}

const that = readFileSync(join(GOC, TEP), "utf8");
const goc = NEN_TRUOC_GOP;
const cu = Bun.YAML.parse(git("show", `${goc}:${TEP}`));
const kiem = (chu) => {
	const wf = Bun.YAML.parse(chu);
	return [...hinh(wf, cu), ...ac3(wf)];
};

const hong = kiem(that).map((l) => `ban that: ${l}`);
const chieuDo = [
	{
		ten: "bo if always()",
		chu: that.replace("    if: always()\n", ""),
		can: "ci-ok co the bi bo qua",
	},
	{
		ten: "ci-ok luon true",
		chu: that.replace(
			/(\n\s+- run: )test "\$\{\{ needs\.check\.result[^\n]*/,
			"$1true",
		),
		can: "o (failure, success)",
	},
	{
		ten: "bo GOOGLE_CLIENT_ID khoi test",
		chu: (() => {
			const i = that.indexOf("  test:");
			return (
				that.slice(0, i) +
				that.slice(i).replace(/\n\s+GOOGLE_CLIENT_ID: [^\n]*/, "")
			);
		})(),
		can: "test: thieu bien GOOGLE_CLIENT_ID",
	},
];
for (const c of chieuDo) {
	if (c.chu === that) {
		hong.push(`chieu do ${c.ten}: khong tao duoc ban sao`);
		continue;
	}
	const loi = kiem(c.chu);
	const bat = loi.some((l) => l.includes(c.can));
	console.log(
		`chieu do ${c.ten}: ${bat ? "DO dung cho" : "KHONG BAT"} — ${loi.slice(0, 3).join("; ")}`,
	);
	if (!bat) hong.push(`chieu do ${c.ten}: khong bat «${c.can}»`);
}
if (hong.length > 0) {
	console.error(hong.join("\n"));
	process.exit(1);
}
console.log(
	`hinh: ${TEP} dung ba job, ma tran ${O.map((x) => x[0]).join(" · ")}, khong troi so voi nen truoc gop #331 ${goc.slice(0, 9)}, ci-ok dung 16/16 o; ba chieu do dung cho`,
);
