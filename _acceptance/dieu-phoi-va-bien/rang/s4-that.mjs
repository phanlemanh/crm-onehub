import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ghi = (s) => process.stdout.write(`${s}\n`);
const khongDo = (ly) => {
	ghi(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
};

let ts;
try {
	ts = createRequire(import.meta.url)("typescript");
} catch (e) {
	khongDo(`khong nap duoc typescript: ${e.message.split("\n")[0]}`);
}

function nhanThat(p) {
	const text = readFileSync(p, "utf8");
	const sf = ts.createSourceFile(basename(p), text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	for (const st of sf.statements) {
		if (!ts.isVariableStatement(st)) continue;
		if (!st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
		for (const d of st.declarationList.declarations) {
			if (d.name.getText(sf) !== "meta" || !d.initializer || !ts.isObjectLiteralExpression(d.initializer)) continue;
			for (const pr of d.initializer.properties) {
				if (ts.isPropertyAssignment(pr) && pr.name.getText(sf) === "name" && ts.isStringLiteralLike(pr.initializer)) return pr.initializer.text;
			}
		}
	}
	return null;
}

let kit;
try {
	kit = execFileSync(process.execPath, [join(GOC, "scripts", "resolve-plugin.mjs"), "--plugin", "feature-loop", "--require", "workflows/acceptance-verify.js", "--require", "workflows/execute-parallel.js"], { cwd: GOC, encoding: "utf8" }).trim();
} catch (e) {
	khongDo(`khong tim duoc goi feature-loop: ${e.message.split("\n")[0]}`);
}
if (!kit || !existsSync(join(kit, "workflows", "acceptance-verify.js"))) khongDo("goi feature-loop khong co workflows/acceptance-verify.js");

const chinh = dirname(execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: GOC, encoding: "utf8" }).trim());
const wf = join(chinh, ".acceptance-runs", "wf");
const banChep = existsSync(wf) ? readdirSync(wf).filter((f) => f.endsWith(".js")).map((f) => join(wf, f)) : [];

const { phanLoai } = await import(pathToFileURL(join(GOC, "scripts", "dieu-phoi", "hook-chan-s4.mjs")).href);
const cuaHook = (p) => phanLoai({ tool_name: "Workflow", cwd: GOC, tool_input: { scriptPath: p } });

const tep = [join(kit, "workflows", "acceptance-verify.js"), join(kit, "workflows", "execute-parallel.js"), ...banChep];
let lech = 0;
let soBanChepS4 = 0;
for (const p of tep) {
	const nhan = nhanThat(p);
	const mong = nhan === "acceptance-verify" ? "s4" : null;
	const thay = cuaHook(p);
	const tenNgan = p.startsWith(wf) ? `wf/${basename(p)}` : `kit/${basename(p)}`;
	if (thay !== mong) {
		lech++;
		ghi(`LECH ${tenNgan}: nhan that ${nhan ?? "-"}, hook ${thay ?? "null"}`);
		continue;
	}
	ghi(`${thay === "s4" ? "S4" : "KHONG"} ${tenNgan} (nhan that ${nhan ?? "-"})`);
	if (thay === "s4" && p.startsWith(wf) && /-r\d+\.js$/.test(p)) soBanChepS4++;
}
const ep = join(kit, "workflows", "execute-parallel.js");
if (nhanThat(ep) === "acceptance-verify" || cuaHook(ep) !== null) {
	ghi("DO: doi chung execute-parallel bi nhan la S4");
	lech++;
}
if (soBanChepS4 === 0) {
	ghi("DO: khong co ban chep acceptance-verify-<slug>-r<N>.js nao duoc nhan la S4");
	lech++;
}
ghi(`KET LUAN: ${tep.length - lech} tep khop nhan, ${soBanChepS4} ban chep S4${lech ? `, ${lech} lech` : ""}`);
process.exit(lech === 0 ? 0 : 1);
