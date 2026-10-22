import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cayTach, git, GOC, kiemKe, SLUG, TAM } from "./chung.mjs";

const NHAT_KY = join(TAM, "cong-gop");

export function lenhCi() {
	const wf = readFileSync(join(GOC, ".github", "workflows", "acceptance.yml"), "utf8");
	const m = wf.match(/bash scripts\/pre-merge-check\.sh \. --base "origin\/\$\{\{ github\.base_ref \}\}"/);
	if (!m) throw new Error("acceptance.yml khong con lenh pre-merge-check --base origin/<base_ref>");
	return ["scripts/pre-merge-check.sh", ".", "--base", "origin/onehub"];
}

function chayCi(root, nhan) {
	const r = spawnSync("bash", lenhCi(), { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
	const text = `${r.stdout}\n${r.stderr}`;
	writeFileSync(join(NHAT_KY, `${nhan}.log`), text);
	const cuoi = text.trim().split("\n").filter((d) => d.startsWith("pre-merge-check:")).pop() ?? "";
	return { clean: cuoi === "pre-merge-check: clean", cuoi, text };
}

export function ngoaiHoSoVong(doi) {
	return doi.filter((t) => !t.startsWith(`_acceptance/${SLUG}/`));
}

function goHoSoVong(goc) {
	git(goc, "rm", "-r", "-q", join("_acceptance", SLUG));
	git(goc, "-c", "user.name=cong-gop", "-c", "user.email=cong-gop@local", "commit", "-q", "-m", "go ho so vong");
	return ngoaiHoSoVong(git(goc, "diff", "--name-only", "HEAD~1", "HEAD").split("\n").filter(Boolean));
}

mkdirSync(NHAT_KY, { recursive: true });
git(GOC, "fetch", "-q", "origin");
const loi = [];
const cayDau = cayTach("HEAD", "cong-gop-head");
try {
	const ngoai = goHoSoVong(cayDau.goc);
	if (ngoai.length) loi.push(`go ho so vong cham tep khac: ${ngoai.join(", ")}`);
	const dau = chayCi(cayDau.goc, "head");
	console.log(`HEAD (bo ${SLUG}): ${dau.cuoi}`);
	if (!dau.clean) loi.push(`HEAD khong clean: ${dau.cuoi}`);
} finally {
	cayDau.don();
}
const daGop = new Set(git(GOC, "branch", "-r", "--merged", "origin/onehub", "--list", "origin/chore/don-ho-so-cu-lo-*").split("\n").map((s) => s.trim()).filter(Boolean));
for (const nhanh of git(GOC, "branch", "-r", "--list", "origin/chore/don-ho-so-cu-lo-*").split("\n").map((s) => s.trim()).filter(Boolean)) {
	if (daGop.has(nhanh)) continue;
	const cay = cayTach(nhanh, `cong-gop-${nhanh.split("/").pop()}`);
	try {
		const r = chayCi(cay.goc, nhanh.split("/").pop());
		console.log(`${nhanh}: ${r.cuoi}`);
		if (!r.clean) loi.push(`${nhanh} khong clean`);
	} finally {
		cay.don();
	}
}
if (loi.length) {
	console.log(loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}
const cu = kiemKe({ root: GOC }).map((h) => h.slug);
const chon = cu.find((s) => s !== SLUG);
if (!chon) {
	console.log("KET LUAN: khong do duoc — khong con ho so cu nao de dung ca do");
	process.exit(2);
}
const cay = cayTach("HEAD", "cong-gop-ca-do");
try {
	appendFileSync(join(cay.goc, "_acceptance", chon, "run-log.jsonl"), `${JSON.stringify({ ts: "2000-01-01T00:00:00Z", kind: "ca-do" })}\n`);
	git(cay.goc, "-c", "user.name=cong-gop", "-c", "user.email=cong-gop@local", "commit", "-q", "-am", "ca do");
	const r = chayCi(cay.goc, "ca-do");
	if (r.text.includes(`VIOLATION [${chon}]: evidence is stale`)) console.log(`BAT cham-ho-so-cu (${chon})`);
	else {
		console.log("KET LUAN: do — thuoc hong: cham-ho-so-cu");
		process.exit(1);
	}
} finally {
	cay.don();
}
if (ngoaiHoSoVong([`_acceptance/${SLUG}/evals.yaml`, `_acceptance/${chon}/run-log.jsonl`]).length !== 1) {
	console.log("KET LUAN: do — thuoc hong: go-them-tep-khac");
	process.exit(1);
}
console.log("BAT go-them-tep-khac");
console.log("KET LUAN: xanh");
