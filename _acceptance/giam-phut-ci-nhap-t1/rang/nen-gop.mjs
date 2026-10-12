import { spawnSync } from "node:child_process";
import { GOC, Ket, WF_ACC, WF_CI, yamlHead } from "./chung.mjs";
import { moPhong, NGU_CANH } from "./luong.mjs";

function repo() {
	const r = spawnSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`gh repo view: ${r.stderr}`);
	return r.stdout.trim();
}

function ghApi(duong) {
	const r = spawnSync("gh", ["api", duong], { cwd: GOC, encoding: "utf8" });
	if (r.status === 0) return { ok: true, du: JSON.parse(r.stdout || "null") };
	const chu = `${r.stdout}${r.stderr}`;
	if (/Branch not protected|HTTP 404/.test(chu)) return { ok: true, du: null };
	throw new Error(`gh api ${duong}: ${chu.trim().split("\n")[0]}`);
}

export function checkBatBuoc({ rules, protection }) {
	const tap = new Set();
	for (const r of rules ?? []) if (r?.type === "required_status_checks") for (const c of r.parameters?.required_status_checks ?? []) tap.add(c.context);
	for (const c of protection?.required_status_checks?.contexts ?? []) tap.add(c);
	for (const c of protection?.required_status_checks?.checks ?? []) tap.add(c.context);
	return [...tap].sort();
}

function tenCheck(wf, tenHienThi) {
	const job = Object.values(wf.jobs).find((j) => (j.name ?? "") === tenHienThi);
	const o = job?.strategy?.matrix?.o;
	if (!o || !tenHienThi.includes("${{ matrix.o.ten }}")) return [tenHienThi];
	return o.map((x) => tenHienThi.replace("${{ matrix.o.ten }}", x.ten));
}

export function jobKhiPr(wfs) {
	const nc = NGU_CANH.find((n) => n.ten === "PR synchronize");
	return [...new Set(wfs.flatMap((wf) => moPhong(wf, nc).jobChay.flatMap((t) => tenCheck(wf, t))))].sort();
}

export function kiemNen(batBuoc, coJob) {
	return batBuoc.filter((c) => !coJob.includes(c));
}

const k = new Ket();
const wfs = [await yamlHead(WF_CI), await yamlHead(WF_ACC)];
const coJob = jobKhiPr(wfs);
k.kiem(coJob.includes("acceptance gate") && coJob.includes("test (api)") && coJob.includes("ci-ok"), `doi-chung-duong job khi PR: ${coJob.join(", ")}`, "mo phong khong thay job nen");
let batBuoc;
try {
	const r = repo();
	const rules = ghApi(`repos/${r}/rules/branches/onehub`).du ?? [];
	const protection = ghApi(`repos/${r}/branches/onehub/protection`).du;
	batBuoc = checkBatBuoc({ rules, protection });
} catch (e) {
	console.log(`MA 2: ${e.message}`);
	process.exit(2);
}
console.log(`check bat buoc cua onehub: [${batBuoc.join(", ")}]`);
const thieu = kiemNen(batBuoc, coJob);
k.kiem(thieu.length === 0, "moi check bat buoc con job chay khi PR", thieu.map((c) => `check bat buoc ${c} khong con job`).join("; "));

const tuGia = (contexts) => kiemNen(checkBatBuoc({ rules: [{ type: "required_status_checks", parameters: { required_status_checks: contexts.map((context) => ({ context })) } }] }), coJob);
k.bat("luat-kho-cu", bang1(tuGia(["luật kho"]), "luật kho"), "bat buoc «luật kho» phai thieu");
k.kiem(tuGia(["acceptance gate"]).length === 0, "doi-chung-duong bat buoc acceptance gate du", "bat buoc «acceptance gate» phai du");
k.kiem(tuGia(["test (api)", "test (con-lai)"]).length === 0, "doi-chung-duong ten o ma tran bung", "ten o ma tran khong bung");
k.xong();

function bang1(ds, x) {
	return ds.length === 1 && ds[0] === x;
}
