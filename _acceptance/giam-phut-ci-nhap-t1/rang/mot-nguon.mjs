import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chepVao, git, GOC, Ket, thuMucSach, WF_ACC, WF_CI, yaml } from "./chung.mjs";

const TEP_PL = ".github/scripts/phan-loai.mjs";
const TONG_HOP = ["AGENTS.md", "docs/sau/x.md", ".github/workflows/ci.yml"];

function t1TheoPreMerge(globs, tep) {
	const lenh = `eval "$(sed -n '/^glob_variants() {/,/^}/p;/^match_globs() {/,/^}/p' "$1")"; while IFS= read -r f; do if match_globs "$f" "$2"; then echo 1; else echo 0; fi; done`;
	const r = spawnSync("bash", ["-c", lenh, "doi-chieu", join(GOC, "scripts/pre-merge-check.sh"), globs.join("\n")], { input: `${tep.join("\n")}\n`, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	const dong = r.stdout.split("\n").filter(Boolean);
	if (r.status !== 0 || dong.length !== tep.length) throw new Error(`doi chieu pre-merge hong: ma ${r.status}, ${dong.length}/${tep.length} dong`);
	return new Set(tep.filter((_, i) => dong[i] === "1"));
}

async function kiemNguNghia(modPath, ghi) {
	const mod = await import(`${modPath}?v=${Date.now()}`);
	const globs = mod.docGlobT1(GOC);
	const tep = [...new Set([...git("ls-files").split("\n").filter(Boolean), ...TONG_HOP])];
	const cuaPl = mod.tepT1(globs, tep);
	const cuaPm = t1TheoPreMerge(globs, tep);
	const lech = tep.filter((t) => cuaPl.has(t) !== cuaPm.has(t));
	ghi(lech.length === 0, `ngu-nghia-pre-merge: ${tep.length} tep, ${cuaPm.size} T1`, `lech pre-merge: ${lech.slice(0, 5).join(", ")}`);
	return { cuaPm, mod };
}

function khongDsHai(wf) {
	const loi = [];
	for (const su of ["pull_request", "push"]) {
		const o = wf.on?.[su] ?? {};
		for (const khoa of ["paths", "paths-ignore"]) if (khoa in o) loi.push(`on.${su}.${khoa}`);
	}
	return loi;
}

function khongChepGlob(chu, globs) {
	const chep = globs.filter((g) => chu.includes(`"${g}"`) || chu.includes(`'${g}'`));
	const thieu = ["configList", "match_globs"].filter((x) => !chu.includes(x));
	return { chep, thieu };
}

const k = new Ket();
const ghi = (ok, nhan, ly) => k.kiem(ok, nhan, ly);
const { cuaPm, mod } = await kiemNguNghia(join(GOC, TEP_PL), ghi);
k.kiem(cuaPm.has("AGENTS.md") && cuaPm.has("CLAUDE.md") && !cuaPm.has("apps/api/package.json") && cuaPm.size > 0, "doi-chung-duong tap-T1", `AGENTS.md ${cuaPm.has("AGENTS.md")}, CLAUDE.md ${cuaPm.has("CLAUDE.md")}`);

const banCfg = thuMucSach("glob-moi");
const cfg = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8").replace("  t1_skip_globs:\n", '  t1_skip_globs:\n    - "tam-moi/**"\n');
chepVao(banCfg, "_acceptance/config.yaml");
writeFileSync(join(banCfg, "_acceptance/config.yaml"), cfg);
const truoc = mod.tepT1(mod.docGlobT1(GOC), ["tam-moi/a.ts"]).has("tam-moi/a.ts");
const sau = mod.tepT1(mod.docGlobT1(banCfg), ["tam-moi/a.ts"]).has("tam-moi/a.ts");
const githubSach = git("status", "--porcelain", "--", ".github").trim() === "";
k.kiem(!truoc && sau && githubSach, "glob-moi", `truoc ${truoc}, sau ${sau}, .github sach ${githubSach}`);

const wfLoi = [WF_CI, WF_ACC].flatMap((f) => khongDsHai(yaml(readFileSync(join(GOC, f), "utf8"))).map((l) => `${f} ${l}`));
k.kiem(wfLoi.length === 0, "khong-ds-2", `co danh sach thu hai: ${wfLoi.join(", ")}`);

const globs = mod.docGlobT1(GOC);
const kq = khongChepGlob(readFileSync(join(GOC, TEP_PL), "utf8"), globs);
k.kiem(kq.chep.length === 0 && kq.thieu.length === 0, "khong-chep-glob", `chep ${kq.chep.join(", ")}; thieu ${kq.thieu.join(", ")}`);

const banRe = thuMucSach("dot-bien/regex");
chepVao(banRe, TEP_PL, "scripts/pre-merge-check.sh", "lib", "_acceptance/config.yaml");
const plGoc = readFileSync(join(banRe, TEP_PL), "utf8");
const dau = plGoc.indexOf("export function tepT1(");
const cuoi = plGoc.indexOf("\n}\n", dau) + 3;
const THAN_REGEX = String.raw`export function tepT1(globs, tep) {
	const re = globs.map((g) => new RegExp("^" + g.split("**").map((p) => p.split("*").map((q) => q.replace(/[.+?^$()|[\]\\]/g, "\\$&")).join("[^/]*")).join(".*") + "$"));
	return new Set(tep.filter((t) => re.some((r) => r.test(t))));
}
`;
writeFileSync(join(banRe, TEP_PL), `${plGoc.slice(0, dau)}${THAN_REGEX}${plGoc.slice(cuoi)}`);
const loiRe = [];
await kiemNguNghia(join(banRe, TEP_PL), (ok, nhan, ly) => ok || loiRe.push(ly));
k.bat("regex-tu-viet", loiRe.length > 0, loiRe.join("; "));

const wfPha = yaml(readFileSync(join(GOC, WF_ACC), "utf8"));
wfPha.on.pull_request["paths-ignore"] = ["docs/**"];
const loiPha = khongDsHai(wfPha);
k.bat("co-danh-sach-thu-hai", loiPha.length > 0, loiPha.join(", "));

const kqPha = khongChepGlob(`${plGoc}\nconst X = "docs/**";\n`, globs);
k.bat("chep-glob", kqPha.chep.length > 0, kqPha.chep.join(", "));
k.xong();
