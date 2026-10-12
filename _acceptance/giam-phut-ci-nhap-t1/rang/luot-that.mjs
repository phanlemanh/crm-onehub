import { git, Ket } from "./chung.mjs";

const TEN_PL = "phân loại PR";
const PR_DOI_CHUNG_NHANH = "feat/okr-mau-xoa-cuoc-soan";

async function gh(...args) {
	const p = Bun.spawn(["gh", ...args], { stdout: "pipe", stderr: "pipe" });
	const [ra, loi, ma] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
	if (ma !== 0) throw new Error(`gh ${args.slice(0, 2).join(" ")}: ${loi.trim().split("\n")[0]}`);
	return ra;
}

const dong = (chu) => chu.split("\n").filter((d) => d.trim()).map((d) => JSON.parse(d));
const tenTest = (jobs) => jobs.filter((j) => j.name.startsWith("test"));

export function kiemLuotNhap(luot) {
	const loi = [];
	const jobs = luot.jobs;
	const pl = jobs.find((j) => j.name === TEN_PL);
	if (!pl || pl.conclusion !== "success" || !/ly_do=nhap/.test(luot.logPhanLoai ?? "") || !/nang=false/.test(luot.logPhanLoai ?? "")) loi.push("phan-loai khong ra nhap");
	const nang = luot.workflow === "CI" ? jobs.filter((j) => j.name === "check-types, lint" || j.name.startsWith("test")) : jobs.filter((j) => j.name === "lệnh dựng" || j.name === "tác nhân OKR trên Node 24");
	if (nang.some((j) => j.conclusion !== "skipped")) loi.push("nang-chay-o-nhap");
	if (luot.workflow === "CI") {
		if (tenTest(jobs).length === 0) loi.push("khong-thay-test");
		if (jobs.find((j) => j.name === "ci-ok")?.conclusion !== "success") loi.push("ci-ok-do");
	} else {
		if (nang.length !== 2) loi.push("thieu job nang cua Acceptance");
		const lk = jobs.find((j) => j.name === "acceptance gate");
		if (!lk || lk.conclusion === "skipped") loi.push("bo-luat-kho");
	}
	return loi;
}

async function docLuot(repo, nhanh) {
	const luot = dong(await gh("api", `repos/${repo}/actions/runs?branch=${encodeURIComponent(nhanh)}&event=pull_request&per_page=50`, "--jq", ".workflow_runs[]|{id,name,status,head_sha}")).filter((l) => l.status === "completed" && ["CI", "Acceptance"].includes(l.name));
	const ra = [];
	for (const l of luot) {
		const jobs = dong(await gh("api", `repos/${repo}/actions/runs/${l.id}/jobs?per_page=100`, "--jq", ".jobs[]|{id,name,conclusion}"));
		const pl = jobs.find((j) => j.name === TEN_PL);
		const logPhanLoai = pl ? await gh("api", `repos/${repo}/actions/jobs/${pl.id}/logs`).catch(() => "") : "";
		ra.push({ id: l.id, workflow: l.name, sha: l.head_sha, jobs, logPhanLoai });
	}
	return ra;
}

const k = new Ket();
const gia = (wf, sua = () => {}) => {
	const jobs = wf === "CI"
		? [{ name: TEN_PL, conclusion: "success" }, { name: "check-types, lint", conclusion: "skipped" }, { name: "test (${{ matrix.o.ten }})", conclusion: "skipped" }, { name: "ci-ok", conclusion: "success" }]
		: [{ name: "acceptance gate", conclusion: "failure" }, { name: TEN_PL, conclusion: "success" }, { name: "lệnh dựng", conclusion: "skipped" }, { name: "tác nhân OKR trên Node 24", conclusion: "skipped" }];
	const l = { workflow: wf, jobs, logPhanLoai: "nang=false\nly_do=nhap\n" };
	sua(l);
	return kiemLuotNhap(l);
};
k.kiem(gia("CI").length === 0 && gia("Acceptance").length === 0, "doi-chung-duong du lieu gia lanh", `${gia("CI")} ${gia("Acceptance")}`);
k.bat("nang-chay-o-nhap", gia("CI", (l) => (l.jobs[1].conclusion = "success")).includes("nang-chay-o-nhap"));
k.bat("test-chay-o-nhap", gia("CI", (l) => (l.jobs[2].conclusion = "success")).includes("nang-chay-o-nhap"));
k.bat("ci-ok-do", gia("CI", (l) => (l.jobs[3].conclusion = "failure")).includes("ci-ok-do"));
k.bat("bo-luat-kho", gia("Acceptance", (l) => (l.jobs[0].conclusion = "skipped")).includes("bo-luat-kho"));
k.bat("khong-thay-test", gia("CI", (l) => l.jobs.splice(2, 1)).includes("khong-thay-test"));

let repo;
let nhanh;
let pr;
try {
	repo = (await gh("repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner")).trim();
	nhanh = git("rev-parse", "--abbrev-ref", "HEAD").trim();
	pr = JSON.parse(await gh("pr", "list", "--head", nhanh, "--state", "open", "--json", "number,isDraft"))[0];
	if (!pr) throw new Error(`nhanh ${nhanh} khong co PR mo`);
	const doiChung = (await docLuot(repo, PR_DOI_CHUNG_NHANH)).filter((l) => l.workflow === "CI");
	k.kiem(doiChung.some((l) => tenTest(l.jobs).length === 3 && tenTest(l.jobs).every((j) => !j.name.includes("${{"))), `doi-chung-duong khop ten tren luot CI cua ${PR_DOI_CHUNG_NHANH}: ba o test da bung ten`, "cach khop ten khong thay ba o");
	const commit = new Set(JSON.parse(await gh("pr", "view", String(pr.number), "--json", "commits")).commits.map((c) => c.oid));
	const luot = await docLuot(repo, nhanh);
	for (const wf of ["CI", "Acceptance"]) {
		const dat = luot.filter((l) => l.workflow === wf && commit.has(l.sha) && kiemLuotNhap(l).length === 0);
		k.kiem(dat.length > 0, `PR #${pr.number} ${wf}: luot nhap dat ${dat.map((l) => `${l.id}@${l.sha.slice(0, 9)}`).join(", ")}`, `khong luot ${wf} nao dat: ${luot.filter((l) => l.workflow === wf).map((l) => `${l.id} ${kiemLuotNhap(l).join("/")}`).join("; ") || "chua co luot"}`);
	}
} catch (e) {
	console.log(`MA 2: ${e.message}`);
	process.exit(2);
}
k.xong();
