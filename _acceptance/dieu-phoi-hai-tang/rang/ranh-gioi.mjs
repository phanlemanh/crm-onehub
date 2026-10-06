import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DICH = "scripts/dieu-phoi";
const CAM_CHUOI = ["gh pr merge", "--auto", "onehub", "crm", "/Users/"];
const SO_CAM = /(?<![\w.])(60_000|3600_000|300_000|1_800_000|30_000)(?![\w])/;
const TEP_HANG_SO = "cau-hinh.mjs";

let ts;
try {
	ts = createRequire(import.meta.url)("typescript");
} catch (e) {
	process.stdout.write(`KHONG DO DUOC: khong nap duoc typescript: ${e.message.split("\n")[0]}\n`);
	process.exit(2);
}

function liet(goc) {
	const ra = [];
	const di = (thuMuc) => {
		for (const ten of readdirSync(thuMuc)) {
			const p = join(thuMuc, ten);
			const rel = relative(goc, p);
			if (statSync(p).isDirectory()) {
				if (ten !== "test" && ten !== "node_modules") di(p);
				continue;
			}
			if (/\.(mjs|json)$/.test(ten)) ra.push(rel);
		}
	};
	di(join(goc, DICH));
	return ra.sort();
}

function chuThich(text) {
	const sf = ts.createSourceFile("x.mjs", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	const thay = new Set();
	const ra = [];
	const di = (n) => {
		for (const r of [...(ts.getLeadingCommentRanges(text, n.pos) ?? []), ...(ts.getTrailingCommentRanges(text, n.pos) ?? [])]) {
			if (thay.has(r.pos)) continue;
			thay.add(r.pos);
			const than = text.slice(r.pos, r.end);
			if (than.startsWith("#!")) continue;
			ra.push(sf.getLineAndCharacterOfPosition(r.pos).line + 1);
		}
		for (const c of n.getChildren(sf)) di(c);
	};
	di(sf);
	return ra.sort((a, b) => a - b);
}

function quet(goc) {
	const tep = liet(goc);
	const vi = [];
	for (const rel of tep) {
		const text = readFileSync(join(goc, rel), "utf8");
		const dong = text.split("\n");
		dong.forEach((d, i) => {
			for (const c of CAM_CHUOI) if (d.includes(c)) vi.push(`cam-chuoi ${rel}:${i + 1} '${c}'`);
			if (rel.endsWith(".mjs") && !rel.endsWith(TEP_HANG_SO) && SO_CAM.test(d)) vi.push(`hang-so ${rel}:${i + 1} '${d.match(SO_CAM)[1]}'`);
		});
		if (rel.endsWith(".mjs")) for (const so of chuThich(text)) vi.push(`chu-thich ${rel}:${so}`);
	}
	const mau = JSON.parse(readFileSync(join(goc, DICH, "mau", "dieu-phoi.config.json"), "utf8"));
	if (mau.nhanh_chinh !== "main") vi.push(`mau-nhanh ${DICH}/mau/dieu-phoi.config.json:nhanh_chinh '${mau.nhanh_chinh}'`);
	return { tep, vi };
}

function chieuXanh() {
	const { tep, vi } = quet(GOC);
	if (tep.length === 0) {
		process.stdout.write(`KHONG DO DUOC: ${DICH} khong co tep .mjs/.json\n`);
		process.exit(2);
	}
	const git = execFileSync("git", ["ls-files", DICH], { cwd: GOC, encoding: "utf8" })
		.split("\n")
		.filter((p) => /\.(mjs|json)$/.test(p) && !p.split("/").includes("test"))
		.sort();
	process.stdout.write(`da quet ${tep.length} tep; git theo doi ${git.length}\n`);
	if (JSON.stringify(git) !== JSON.stringify(tep)) {
		process.stdout.write(`DO: tap-tep lech git: ${tep.filter((t) => !git.includes(t)).join(", ") || "-"} | thieu: ${git.filter((t) => !tep.includes(t)).join(", ") || "-"}\n`);
		process.exit(1);
	}
	for (const v of vi) process.stdout.write(`DO: ${v}\n`);
	process.stdout.write(vi.length === 0 ? "XANH: 0 vi pham tren cay that\n" : `${vi.length} vi pham tren cay that\n`);
	return vi.length === 0;
}

const TIEM = [
	{ luat: "chu-thich", tep: "lich.mjs", them: (t) => `// tiem\n${t}`, dong: 1 },
	{ luat: "chu-thich", tep: "glob.mjs", them: (t) => t.replace(/\n$/, " // cuoi dong\n"), dong: null },
	{ luat: "chu-thich", tep: "hook-nhip.mjs", them: (t) => t.replace("} catch {\n", "} catch {\n    // tiem trong khoi rong\n"), dong: "sau-catch" },
	{ luat: "cam-chuoi", tep: "dot.mjs", them: (t) => `${t}export const X = 'gh pr merge 1 --auto';\n`, dong: null },
	{ luat: "cam-chuoi", tep: "bang.mjs", them: (t) => `${t}export const Y = 'onehub';\n`, dong: null },
	{ luat: "hang-so", tep: "lich.mjs", them: (t) => `${t}export const Z = 60_000;\n`, dong: null },
];

function chieuDo() {
	let sai = 0;
	for (const t of TIEM) {
		const tam = mkdtempSync(join(tmpdir(), "dph-rg-"));
		try {
			cpSync(join(GOC, DICH), join(tam, DICH), { recursive: true });
			const p = join(tam, DICH, t.tep);
			const cu = readFileSync(p, "utf8");
			const moi = t.them(cu);
			if (moi === cu) {
				process.stdout.write(`MOC VANG ${t.luat} ${t.tep}\n`);
				process.exit(2);
			}
			writeFileSync(p, moi);
			const soDong = t.dong === "sau-catch" ? moi.split("\n").findIndex((d) => d.includes("// tiem trong khoi rong")) + 1 : (t.dong ?? moi.trimEnd().split("\n").length);
			const mong = `${t.luat} ${DICH}/${t.tep}:${soDong}`;
			const { vi } = quet(tam);
			const trung = vi.some((v) => v.startsWith(mong));
			for (const v of vi) process.stdout.write(`  ban sao tiem ${t.luat}/${t.tep}: DO: ${v}\n`);
			process.stdout.write(`${trung ? "BAT" : "SOT"} ${mong}\n`);
			if (!trung) sai++;
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	return sai === 0;
}

const xanh = chieuXanh();
const doDu = chieuDo();
process.stdout.write(`KET LUAN: cay that ${xanh ? "sach" : "co vi pham"} · chieu do ${doDu ? `bat du ${TIEM.length}/${TIEM.length}` : "sot"}\n`);
process.exit(xanh && doDu ? 0 : 1);
