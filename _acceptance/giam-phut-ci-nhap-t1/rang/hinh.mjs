import { bang, Ket, NEU_OKR, NEU_THEO, SHA_GHIM, WF_ACC, WF_CI, yamlHead, yamlTai } from "./chung.mjs";

const GOC_KHOA = ["on", "concurrency", "permissions", "env"];
const LENH_TEST = "node --test .github/scripts/test/phan-loai.test.mjs";
const LENH_PL = "node .github/scripts/phan-loai.mjs";

const boKhoa = (o, ...khoa) => Object.fromEntries(Object.entries(o ?? {}).filter(([k]) => !khoa.includes(k)));
const tapJob = (wf) => Object.keys(wf.jobs).sort().join(",");

function kiemPhanLoai(o, ghi) {
	const j = o.jobs["phan-loai"];
	if (!ghi(!!j, "phan-loai.co", "thieu job phan-loai")) return;
	ghi(j.if === "github.event_name == 'pull_request'", "phan-loai.if", `if = ${JSON.stringify(j.if)}`);
	ghi(j.outputs?.nang === "${{ steps.pl.outputs.nang }}", "phan-loai.outputs", JSON.stringify(j.outputs));
	const s = j.steps ?? [];
	ghi(String(s[0]?.uses).startsWith("actions/checkout@") && s[0]?.with?.["fetch-depth"] === 2, "phan-loai.checkout", JSON.stringify(s[0]));
	const iTest = s.findIndex((b) => b.run === LENH_TEST);
	const iPl = s.findIndex((b) => b.id === "pl");
	ghi(iTest >= 0 && iPl >= 0 && iTest < iPl, "phan-loai.thu-tu", `test o ${iTest}, pl o ${iPl}`);
	const pl = s[iPl] ?? {};
	ghi(pl.run === LENH_PL && pl.env?.SU_KIEN === "${{ github.event_name }}" && pl.env?.NHAP === "${{ github.event.pull_request.draft }}", "phan-loai.buoc-pl", JSON.stringify(pl));
}

function kiemNang(o, g, ten, neu, ghi) {
	const j = o.jobs[ten];
	if (!ghi(!!j, `${ten}.co`, `thieu job ${ten}`)) return;
	ghi(j.needs === "phan-loai", `${ten}.needs`, JSON.stringify(j.needs));
	ghi(j.if === neu, `${ten}.if`, JSON.stringify(j.if));
	const lech = Object.keys({ ...boKhoa(j, "needs", "if"), ...boKhoa(g.jobs[ten], "needs", "if") }).filter((k) => !bang(j[k], g.jobs[ten][k]));
	ghi(lech.length === 0, `${ten}.con-lai`, `khac ban ghim o ${lech.join(", ")}`);
}

function kiemGoc(o, g, khoa, ghi) {
	for (const k of khoa) ghi(bang(o[k], g[k]), k, `khoi ${k} khac ban ghim`);
}

export function kiemCi(o, g, ghi) {
	ghi(tapJob(o) === "check,ci-ok,phan-loai,test", "tap-job", tapJob(o));
	kiemPhanLoai(o, ghi);
	for (const t of ["check", "test"]) kiemNang(o, g, t, NEU_THEO, ghi);
	kiemGoc(o, g, GOC_KHOA, ghi);
}

export function kiemAcc(o, g, ci, ghi) {
	ghi(tapJob(o) === "agent-okr-node24,build,luat-kho,phan-loai", "tap-job", tapJob(o));
	const lk = o.jobs["luat-kho"] ?? {};
	ghi(bang(lk, g.jobs["luat-kho"]) && lk.name === "acceptance gate" && !("if" in lk) && Object.keys(lk.env ?? {})[0] === "DATABASE_URL", "luat-kho", "khac ban ghim hoac sai ten, if, env");
	ghi(bang(o.jobs["phan-loai"], ci.jobs["phan-loai"]), "phan-loai giong ci.yml", "phan-loai khac ci.yml");
	kiemPhanLoai(o, ghi);
	kiemNang(o, g, "build", NEU_THEO, ghi);
	kiemNang(o, g, "agent-okr-node24", NEU_OKR, ghi);
	kiemGoc(o, g, ["on", "concurrency", "permissions"], ghi);
}

const DOT_BIEN_CI = [
	["test-needs", "test.needs", (o) => delete o.jobs.test.needs],
	["check-if", "check.if", (o) => (o.jobs.check.if = "needs.phan-loai.outputs.nang == 'true'")],
	["test-strategy", "test.con-lai", (o) => (o.jobs.test.strategy.matrix.o[0].loc = "--filter=api --filter=x")],
	["on-paths", "on", (o) => (o.on.pull_request.paths = ["apps/**"])],
	["thu-tu", "phan-loai.thu-tu", (o) => o.jobs["phan-loai"].steps.push(o.jobs["phan-loai"].steps.splice(1, 1)[0])],
];
const DOT_BIEN_ACC = [
	["luat-kho-if", "luat-kho", (o) => (o.jobs["luat-kho"].if = "github.event_name == 'pull_request'")],
	["agent-okr-if", "agent-okr-node24.if", (o) => (o.jobs["agent-okr-node24"].if = NEU_THEO)],
	["concurrency", "concurrency", (o) => (o.concurrency.group = "acceptance-${{ github.ref }}")],
	["phan-loai-khac", "phan-loai giong ci.yml", (o) => o.jobs["phan-loai"].steps.push({ run: "echo x" })],
];

const loai = process.argv[2];
if (!["ci", "acceptance"].includes(loai)) {
	console.log("dung: bun hinh.mjs ci|acceptance");
	process.exit(2);
}
const k = new Ket();
const ghiK = (ok, nhan, ly) => k.kiem(ok, nhan, ly);
const ci = await yamlHead(WF_CI);
const gCi = yamlTai(SHA_GHIM, WF_CI);
const acc = await yamlHead(WF_ACC);
const gAcc = yamlTai(SHA_GHIM, WF_ACC);
const chay = (o, ghi) => (loai === "ci" ? kiemCi(o, gCi, ghi) : kiemAcc(o, gAcc, ci, ghi));
chay(loai === "ci" ? ci : acc, ghiK);
for (const [ca, o, sua] of loai === "ci" ? DOT_BIEN_CI : DOT_BIEN_ACC) {
	const ban = structuredClone(loai === "ci" ? ci : acc);
	sua(ban);
	const sai = [];
	chay(ban, (ok, nhan) => {
		if (!ok) sai.push(nhan);
		return ok;
	});
	k.bat(ca, sai.includes(o), `sai ${sai.join(", ")}`);
}
k.xong();
