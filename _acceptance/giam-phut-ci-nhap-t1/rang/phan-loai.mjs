import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chepVao, GOC, Ket, thuMucSach } from "./chung.mjs";

const TEP_PL = ".github/scripts/phan-loai.mjs";
const NODE = spawnSync("bash", ["-c", "command -v node"], { encoding: "utf8" }).stdout.trim();
const GIT = spawnSync("bash", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const laT1Gia = (t) => t.startsWith("docs/") || t.endsWith(".md") || t === ".github/workflows/ci.yml";

const MA_TRAN = [
	["push", "", ["apps/api/x.ts"], true, "khong-phai-pr"],
	["schedule", "", [], true, "khong-phai-pr"],
	["workflow_dispatch", "", ["docs/a.md"], true, "khong-phai-pr"],
	["pull_request", "true", ["docs/a.md"], false, "nhap"],
	["pull_request", "true", ["apps/api/x.ts"], false, "nhap"],
	["pull_request", "true", [".github/workflows/ci.yml"], false, "nhap"],
	["pull_request", "true", [], false, "nhap"],
	["pull_request", "false", ["docs/a.md", "AGENTS.md"], false, "chi-t1"],
	["pull_request", "false", [".github/workflows/ci.yml"], true, "cham-github"],
	["pull_request", "false", ["docs/a.md", ".github/scripts/x.sh"], true, "cham-github"],
	["pull_request", "false", ["docs/a.md", "apps/api/x.ts"], true, "co-tep-nang"],
	["pull_request", "false", [], true, "khong-co-tep"],
	["pull_request", "", ["docs/a.md"], false, "chi-t1"],
];

function gitTai(cwd, ...args) {
	const r = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout.trim();
}

function dungKho(ten, { sua, motCha = false, coConfig = true }) {
	const goc = thuMucSach(`kho-tam/${ten}`);
	gitTai(goc, "init", "-q", "-b", "goc");
	if (coConfig) {
		mkdirSync(join(goc, "_acceptance"));
		writeFileSync(join(goc, "_acceptance", "config.yaml"), readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8"));
	}
	mkdirSync(join(goc, "apps", "api"), { recursive: true });
	mkdirSync(join(goc, "docs"), { recursive: true });
	writeFileSync(join(goc, "apps", "api", "a.ts"), "export const a = 1;\n");
	writeFileSync(join(goc, "docs", "x.md"), "x\n");
	gitTai(goc, "add", "-A");
	gitTai(goc, "commit", "-q", "-m", "goc");
	gitTai(goc, "checkout", "-q", "-b", "nhanh");
	sua(goc);
	gitTai(goc, "add", "-A");
	gitTai(goc, "commit", "-q", "-m", "nhanh");
	if (!motCha) {
		gitTai(goc, "checkout", "-q", "goc");
		gitTai(goc, "merge", "-q", "--no-ff", "-m", "hop", "nhanh");
	}
	return goc;
}

function chayCli(cli, goc, env = {}) {
	const ra = join(goc, "..", `${goc.split("/").pop()}.out`);
	writeFileSync(ra, "");
	const r = spawnSync(NODE, [cli, "--goc", goc], { encoding: "utf8", env: { ...process.env, SU_KIEN: "pull_request", NHAP: "false", GITHUB_OUTPUT: ra, GITHUB_STEP_SUMMARY: "", ...env } });
	const chu = readFileSync(ra, "utf8");
	return { ma: r.status, nang: chu.match(/^nang=(.*)$/m)?.[1], lyDo: chu.match(/^ly_do=(.*)$/m)?.[1] ?? "" };
}

async function kiemBoPhanLoai(goc, k, ghi) {
	const cli = join(goc, TEP_PL);
	const mod = await import(`${cli}?v=${Date.now()}`);
	let so = 0;
	for (const [suKien, nhap, tep, nang, lyDo] of MA_TRAN) {
		const kq = mod.quyetDinh({ suKien, nhap, tep, laT1: laT1Gia });
		so++;
		ghi(kq.nang === nang && kq.lyDo === lyDo, `ma-tran ${suKien}/${JSON.stringify(nhap)}/${tep.join("+") || "rong"} -> ${lyDo}`, `ra ${JSON.stringify(kq)}`);
	}
	k.soOMaTran = so;
	const chiDocs = dungKho("chi-docs", { sua: (g) => writeFileSync(join(g, "docs", "x.md"), "y\n") });
	const haiCha = gitTai(chiDocs, "rev-list", "--parents", "-n", "1", "HEAD").split(" ").length === 3;
	const diff = gitTai(chiDocs, "diff", "--name-only", "HEAD^1", "HEAD");
	ghi(haiCha && diff === "docs/x.md", "doi-chung-duong kho-tam", `hai cha ${haiCha}, diff ${JSON.stringify(diff)}`);
	const a = chayCli(cli, chiDocs);
	ghi(a.ma === 0 && a.nang === "false" && a.lyDo === "chi-t1", "cli chi-docs -> nhe chi-t1", JSON.stringify(a));
	const b = chayCli(cli, dungKho("doi-ten", { sua: (g) => gitTai(g, "mv", "apps/api/a.ts", "docs/a.md") }));
	ghi(b.ma === 0 && b.nang === "true", "cli doi-ten -> nang", JSON.stringify(b));
	const c = chayCli(cli, dungKho("mot-cha", { sua: (g) => writeFileSync(join(g, "docs", "x.md"), "y\n"), motCha: true }));
	ghi(c.ma === 0 && c.nang === "true" && c.lyDo.startsWith("loi:"), "cli mot-cha -> nang loi", JSON.stringify(c));
	const d = chayCli(cli, dungKho("vang-config", { sua: (g) => writeFileSync(join(g, "docs", "x.md"), "y\n"), coConfig: false }));
	ghi(d.ma === 0 && d.nang === "true" && d.lyDo.startsWith("loi:"), "cli config-vang -> nang loi", JSON.stringify(d));
	const bin = thuMucSach(`kho-tam/bin-${Date.now()}`);
	symlinkSync(GIT, join(bin, "git"));
	const e = chayCli(cli, chiDocs, { PATH: bin });
	ghi(e.ma === 0 && e.nang === "true" && e.lyDo.startsWith("loi:"), "cli khong-bash -> nang loi", JSON.stringify(e));
}

const k = new Ket();
await kiemBoPhanLoai(GOC, k, (ok, nhan, ly) => k.kiem(ok, nhan, ly));
k.kiem(k.soOMaTran === MA_TRAN.length, `so-o ${k.soOMaTran}/${MA_TRAN.length}`, "so ca lech");
const kiemThu = spawnSync(NODE, ["--test", join(GOC, ".github/scripts/test/phan-loai.test.mjs")], { encoding: "utf8" });
k.kiem(kiemThu.status === 0, "node --test phan-loai.test.mjs", kiemThu.stdout.split("\n").filter((d) => /^ℹ (pass|fail)/.test(d)).join(" "));

const DOT_BIEN = [
	["cham-github", 'if (tep.some((t) => t.startsWith(THU_MUC_GITHUB))) return { nang: true, lyDo: "cham-github" };', ""],
	["doi-ten", '"--no-renames", ', ""],
	["loi-mo", "return { nang: true, lyDo: `loi:", "return { nang: false, lyDo: `loi:"],
	["nhap-rong", 'if (nhap === "true")', "if (nhap)"],
];
for (const [ca, cu, moi] of DOT_BIEN) {
	const ban = thuMucSach(`dot-bien/${ca}`);
	chepVao(ban, TEP_PL, "scripts/pre-merge-check.sh", "lib", "_acceptance/config.yaml");
	const p = join(ban, TEP_PL);
	const goc = readFileSync(p, "utf8");
	if (!goc.includes(cu)) {
		k.bat(ca, false, "khong tim thay doan can dot bien");
		continue;
	}
	writeFileSync(p, goc.replace(cu, moi));
	const loi = [];
	await kiemBoPhanLoai(ban, {}, (ok, nhan) => {
		if (!ok) loi.push(nhan);
	});
	k.bat(ca, loi.length > 0, loi.join("; "));
}
k.xong();
