import { spawnSync } from "node:child_process";
import {
	chmodSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	tepTuBanGhi,
	vietTep,
} from "../../../packages/validation/src/tin-hieu.ts";
import { GOM } from "../gom-cau-hinh.ts";
import type { chayGom } from "../gom-lich.ts";

export const GOC_CRM = path.resolve(import.meta.dir, "..", "..", "..");
export const KHOA_GIA = "sk-test-KHOA-BI-MAT";
export const TEP_LO_TRINH = "docs/plan/lo-trinh-mau.json";

const tam: string[] = [];
export function donTam(): void {
	for (const d of tam.splice(0)) rmSync(d, { recursive: true, force: true });
}

export function thuMuc(ten: string): string {
	const d = mkdtempSync(path.join(tmpdir(), `gtc-${ten}-`));
	tam.push(d);
	return d;
}

export function giaiKit(): string {
	const r = spawnSync("node", [...GOM.kit.giai], {
		cwd: GOC_CRM,
		encoding: "utf8",
	});
	const g = r.stdout.trim();
	if (r.status !== 0 || !g)
		throw new Error(`không giải được gói acceptance-gate: ${r.stderr}`);
	return g;
}

export const NGUOI = { ten: "Manh Phan", thu: "phanlemanh@gmail.com" };

export function g(
	cwd: string,
	thamSo: string[],
	ai: { ten: string; thu: string } = { ten: "thu", thu: "thu@thu.test" },
	them: Record<string, string> = {},
): string {
	const r = spawnSync("git", thamSo, {
		cwd,
		encoding: "utf8",
		env: {
			...process.env,
			GIT_AUTHOR_NAME: ai.ten,
			GIT_AUTHOR_EMAIL: ai.thu,
			GIT_COMMITTER_NAME: ai.ten,
			GIT_COMMITTER_EMAIL: ai.thu,
			...them,
		},
	});
	if (r.status !== 0) throw new Error(`git ${thamSo.join(" ")}: ${r.stderr}`);
	return r.stdout.trim();
}

export type KhoGom = { origin: string; seed: string; goc: string };

const VE_GIA = `import { readFileSync, writeFileSync } from "node:fs";
const d = JSON.parse(readFileSync("${TEP_LO_TRINH}", "utf8"));
writeFileSync("${GOM.vung.trang}", \`<ul>\${(d.hang ?? []).map((h) => \`<li>\${h.cau_giao}</li>\`).join("")}</ul>\\n\`);
`;

const CAU_HINH = `tin_hieu:
  nguon: [tin-hieu/crm]
  gom: tin-hieu/gom
lo_trinh:
  tep:
    - ${TEP_LO_TRINH}
`;

const HOP_DONG_CU = `---
schema_version: 1
feature: «Quản trị nhập OKR từ bảng tính có đủ cột Loại mục tiêu»
slug: viec-cu
status: signed-off
---

# viec-cu
`;

export function dungKhoGom(
	o: { tinHieu?: number[]; daGiao?: boolean } = {},
): KhoGom {
	const origin = thuMuc("origin");
	g(origin, ["init", "--quiet", "--bare", "-b", GOM.nhanhChinh]);
	const seed = thuMuc("seed");
	g(seed, ["clone", "--quiet", origin, "."]);
	g(seed, ["switch", "--quiet", "-c", GOM.nhanhChinh]);
	for (const d of [
		"_acceptance",
		"tin-hieu/crm",
		"tin-hieu/gom",
		"docs/plan",
		"scripts",
		"apps/app",
	])
		mkdirSync(path.join(seed, d), { recursive: true });
	writeFileSync(path.join(seed, "README.md"), "kho thu\n");
	writeFileSync(path.join(seed, "_acceptance", "config.yaml"), CAU_HINH);
	writeFileSync(path.join(seed, "apps", "app", "package.json"), "{}\n");
	writeFileSync(path.join(seed, "tin-hieu", "gom", ".gitkeep"), "");
	writeFileSync(
		path.join(seed, TEP_LO_TRINH),
		`${JSON.stringify({ hang: [{ ma: "X1", slug: "viec-x", ten: "Việc x", cau_giao: "«Ai đó làm được x»", hang: "T2" }] }, null, 1)}\n`,
	);
	writeFileSync(path.join(seed, "scripts", "product-map.mjs"), VE_GIA);
	spawnSync("node", ["scripts/product-map.mjs"], { cwd: seed });
	if (o.daGiao) {
		mkdirSync(path.join(seed, "_acceptance", "viec-cu"), { recursive: true });
		writeFileSync(
			path.join(seed, "_acceptance", "viec-cu", "contract.md"),
			HOP_DONG_CU,
		);
	}
	for (const so of o.tinHieu ?? [1, 2, 3, 4])
		copyFileSync(
			path.join(GOC_CRM, "tin-hieu", "crm", `crm-${so}.json`),
			path.join(seed, "tin-hieu", "crm", `crm-${so}.json`),
		);
	g(seed, ["add", "."]);
	g(seed, ["commit", "--quiet", "-m", "goc"]);
	g(seed, ["push", "--quiet", "origin", GOM.nhanhChinh]);
	const goc = thuMuc("goc");
	g(goc, ["clone", "--quiet", origin, "."]);
	return { origin, seed, goc };
}

export function themTinHieu(
	kho: KhoGom,
	so: number,
	o: { luc?: Date; ngayCommit?: string } = {},
): void {
	g(kho.seed, ["switch", "--quiet", GOM.nhanhChinh]);
	g(kho.seed, ["pull", "--quiet", "--ff-only", "origin", GOM.nhanhChinh]);
	writeFileSync(
		path.join(kho.seed, "tin-hieu", "crm", `crm-${so}.json`),
		vietTep(
			tepTuBanGhi({
				tieuDe: `Tín hiệu thử ${so}`,
				muonLam: `Muốn làm việc ${so}`,
				daXayRa: `Đã gặp chuyện ${so}`,
				man: "/okr",
				guiLuc: o.luc ?? new Date(Date.now() - 3_600_000),
			}),
		),
	);
	g(kho.seed, ["add", "."]);
	const ngay = o.ngayCommit
		? { GIT_COMMITTER_DATE: o.ngayCommit, GIT_AUTHOR_DATE: o.ngayCommit }
		: {};
	g(kho.seed, ["commit", "--quiet", "-m", `tin hieu ${so}`], undefined, ngay);
	g(kho.seed, ["push", "--quiet", "origin", GOM.nhanhChinh]);
}

export function commitNguoi(kho: KhoGom): void {
	const d = thuMuc("nguoi");
	g(d, ["clone", "--quiet", "-b", GOM.nhanhDeXuat, kho.origin, "."]);
	g(d, ["commit", "--quiet", "--allow-empty", "-m", "doi ten nhom"], NGUOI);
	g(d, ["push", "--quiet", "origin", GOM.nhanhDeXuat]);
}

export function sha(kho: KhoGom, ref: string): string | null {
	const r = spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], {
		cwd: kho.origin,
		encoding: "utf8",
	});
	return r.status === 0 ? r.stdout.trim() : null;
}

export type CheDo =
	| "dung"
	| "bo-sot"
	| "hai-cho"
	| "lot-ma"
	| "hang-sai"
	| "khong-gom"
	| "hai-gom"
	| "ngoai-commit"
	| "ngoai-chua-theo-doi"
	| "xoa-tin-hieu"
	| "ngoai-config"
	| "khong-commit"
	| "ba-nhom"
	| "thoat-1"
	| "ngu"
	| "chi-duoc-phep"
	| "tu-choi"
	| "git-fsmonitor"
	| "git-hook"
	| "git-remote"
	| "git-ref"
	| "git-info"
	| "lot-ten-nhom"
	| "lot-cau-giao-b64"
	| "lot-ly-do"
	| "lot-tep-b64";

export const TEN_NHOM = {
	G1: "Người gửi xem được trọn bảng tín hiệu trên màn hẹp",
	G2: "Quản trị nhập OKR từ bảng tính mà không mất cột",
	G3: "Trưởng phòng thấy số tuần trước khi cập nhật kết quả",
} as const;

const CLAUDE_GIA = (d: string) => `#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync, rmSync, copyFileSync } from "node:fs";
const D = ${JSON.stringify(d)};
const argv = process.argv.slice(2);
writeFileSync(D + "/argv.json", JSON.stringify(argv));
writeFileSync(D + "/env.json", JSON.stringify(process.env));
const iCd = argv.indexOf("--settings");
if (iCd >= 0 && existsSync(argv[iCd + 1])) copyFileSync(argv[iCd + 1], D + "/cai-dat.json");
const cheDo = readFileSync(D + "/che-do", "utf8").trim();
const b64 = (s) => Buffer.from(s).toString("base64");
const docMoi = (ten) => existsSync(D + "/" + ten) ? readFileSync(D + "/" + ten, "utf8") : "";
if (cheDo === "thoat-1") { console.error("loi mo hinh gia " + (process.env.ANTHROPIC_API_KEY ?? "")); process.exit(1); }
if (cheDo === "ngu") { await Bun.sleep(30000); process.exit(0); }
if (cheDo === "khong-gom") process.exit(0);
const caiDat = existsSync(D + "/cai-dat.json") ? JSON.parse(readFileSync(D + "/cai-dat.json", "utf8")) : null;
const lenhDuoc = (caiDat?.permissions?.allow ?? []).filter((a) => a.startsWith("Bash(")).map((a) => a.slice(5, -1));
const chayDuoc = (duoiLenh) => {
  const l = lenhDuoc.find((x) => x.endsWith(duoiLenh));
  if (!l) throw new Error("khong co lenh duoc phep: " + duoiLenh);
  const [bin, ...ts] = l.split(" ");
  return execFileSync(bin, ts, { encoding: "utf8" });
};
const cg = JSON.parse(cheDo === "chi-duoc-phep" ? chayDuoc("--chua-gom") : execFileSync("node", [process.env.AG + "/scripts/tin-hieu.mjs", "--root", ".", "--chua-gom"], { encoding: "utf8" }));
const ids = cg.tin_hieu.map((t) => t.id).sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
const ten = ${JSON.stringify(TEN_NHOM)};
const so = readdirSync("tin-hieu/gom").filter((f) => f.endsWith(".md") && readFileSync("tin-hieu/gom/" + f, "utf8").length).length + 1;
const dot = "tin-hieu-dot-" + so;
const tepGom = process.env.TIN_HIEU_BAN_GOM || "tin-hieu/gom/" + dot + ".md";
const con = [...ids];
const phu = cg.da_giao.length ? con.shift() : null;
const le = con.pop();
const nua = Math.ceil(con.length / 2);
let g1 = con.slice(0, nua);
let g2 = con.slice(nua);
let g3 = [];
if (cheDo === "ba-nhom") { const ba = Math.ceil(con.length / 3); g1 = con.slice(0, ba); g2 = con.slice(ba, 2 * ba); g3 = con.slice(2 * ba); }
if (cheDo === "bo-sot") g1 = g1.slice(1);
if (cheDo === "hai-cho") g2 = [...g2, g1[0]];
const tenG1 = cheDo === "lot-ma" ? ten.G1 + " (" + ids[0] + ")" : cheDo === "lot-ten-nhom" ? ten.G1 + " " + process.env.ANTHROPIC_API_KEY : ten.G1;
const ma = (xs) => xs.map((x) => "\`" + x + "\`").join(", ");
const dong = ["dot: " + dot, "dang: chuoi", "nguon: cửa tín hiệu — lịch gom", "truc: ket-qua", "den: " + new Date().toISOString(), "",
  "- \`G1\` — " + tenG1, "  - tín hiệu: " + ma(g1)];
if (g2.length) dong.push("- \`G2\` — " + ten.G2, "  - tín hiệu: " + ma(g2));
if (g3.length) dong.push("- \`G3\` — " + ten.G3, "  - tín hiệu: " + ma(g3));
dong.push("", "- lẻ \`" + le + "\` — lời cảm ơn, không phải điều cần làm" + (cheDo === "lot-ly-do" ? " " + process.env.ANTHROPIC_API_KEY : ""));
if (phu) dong.push("- đã phủ \`" + phu + "\` — " + cg.da_giao[0].slug);
writeFileSync(tepGom, dong.join("\\n") + "\\n");
if (cheDo === "hai-gom") writeFileSync(tepGom.replace(/\\.md$/, "-b.md"), dong.join("\\n").replace("dot: " + dot, "dot: " + dot + "-b") + "\\n");
if (cheDo === "lot-tep-b64") writeFileSync(tepGom, readFileSync(tepGom, "utf8") + "\\n<!-- " + b64(process.env.ANTHROPIC_API_KEY ?? "") + " -->\\n");
const lt = JSON.parse(readFileSync(${JSON.stringify(TEP_LO_TRINH)}, "utf8"));
const nhom = ["G1", ...(g2.length ? ["G2"] : []), ...(g3.length ? ["G3"] : [])];
for (const n of nhom) {
  if (cheDo === "hang-sai" && n === nhom[nhom.length - 1]) continue;
  const cauGiao = "«" + ten[n] + "»" + (cheDo === "lot-cau-giao-b64" && n === "G1" ? " " + b64(docMoi("token")) : "");
  lt.hang.push({ ma: dot + "-" + n, slug: dot + "-" + n.toLowerCase(), ten: ten[n], cau_giao: cauGiao, hang: "T2", dot, phu: [n] });
}
writeFileSync(${JSON.stringify(TEP_LO_TRINH)}, JSON.stringify(lt, null, 1) + "\\n");
if (cheDo === "ngoai-commit") writeFileSync("apps/app/package.json", '{"doi":1}\\n');
if (cheDo === "ngoai-config") appendFileSync("_acceptance/config.yaml", "# doi\\n");
if (cheDo === "ngoai-chua-theo-doi") writeFileSync("scripts/x.ts", "export {};\\n");
if (cheDo === "ngoai-commit") execFileSync("git", ["add", "--", "apps/app/package.json"]);
if (cheDo === "xoa-tin-hieu") execFileSync("git", ["rm", "--quiet", "tin-hieu/crm/crm-1.json"]);
const gd = execFileSync("git", ["rev-parse", "--absolute-git-dir"], { encoding: "utf8" }).trim();
const moi = (ten) => D + "/" + ten;
if (cheDo === "git-fsmonitor") appendFileSync(gd + "/config", "[core]\\n\\tfsmonitor = touch " + moi("A") + "\\n");
if (cheDo === "git-hook") { mkdirSync(gd + "/hooks", { recursive: true }); writeFileSync(gd + "/hooks/pre-push", "#!/bin/sh\\ntouch " + moi("B") + "\\n"); chmodSync(gd + "/hooks/pre-push", 0o755); }
if (cheDo === "git-remote") appendFileSync(gd + "/config", '[remote "ra"]\\n\\turl = ' + (docMoi("origin-hai") || "/khong-co") + "\\n");
if (cheDo === "git-ref") { const h = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); mkdirSync(gd + "/refs/heads", { recursive: true }); writeFileSync(gd + "/refs/heads/ngoai", h + "\\n"); }
if (cheDo === "git-info") { mkdirSync(gd + "/info", { recursive: true }); writeFileSync(gd + "/info/attributes", "* filter=ngoai\\n"); }
if (cheDo === "tu-choi") process.stdout.write(JSON.stringify({ type: "result", permission_denials: [{ tool_name: "Bash", tool_use_id: "x", tool_input: { command: "node -e DOI-SO-MOI" } }, { tool_name: "WebFetch", tool_use_id: "y", tool_input: { url: "https://DOI-SO-MOI.test" } }] }));
if (cheDo === "chi-duoc-phep") { try { chayDuoc("--rang"); } catch { process.exit(1); } }
if (cheDo === "chi-duoc-phep") process.stdout.write(JSON.stringify({ type: "result", permission_denials: [] }));
`;

export type CaiDatPhien = {
	permissions: {
		allow: string[];
		deny: string[];
		blockReadsOutsideWorkingDirectories?: boolean;
	};
	disableAllHooks?: boolean;
};

export type ClaudeGia = {
	bin: string;
	thuMuc: string;
	datCheDo: (c: CheDo) => void;
	datMoi: (ten: string, noiDung: string) => void;
	env: () => Record<string, string>;
	caiDat: () => CaiDatPhien | null;
	argv: () => string[] | null;
	daGoi: () => boolean;
	xoaVet: () => void;
};

export function claudeGia(cheDo: CheDo = "dung"): ClaudeGia {
	const d = thuMuc("claude");
	const bin = path.join(d, "claude");
	writeFileSync(bin, CLAUDE_GIA(d));
	chmodSync(bin, 0o755);
	writeFileSync(path.join(d, "che-do"), cheDo);
	const tep = path.join(d, "argv.json");
	const docJson = <T>(ten: string): T | null =>
		existsSync(path.join(d, ten))
			? (JSON.parse(readFileSync(path.join(d, ten), "utf8")) as T)
			: null;
	return {
		bin,
		thuMuc: d,
		datCheDo: (c) => writeFileSync(path.join(d, "che-do"), c),
		datMoi: (ten, noiDung) => writeFileSync(path.join(d, ten), noiDung),
		env: () => docJson<Record<string, string>>("env.json") ?? {},
		caiDat: () => docJson<CaiDatPhien>("cai-dat.json"),
		argv: () =>
			existsSync(tep)
				? (JSON.parse(readFileSync(tep, "utf8")) as string[])
				: null,
		daGoi: () => existsSync(tep),
		xoaVet: () => rmSync(tep, { force: true }),
	};
}

export type PrGia = {
	number: number;
	state: "OPEN" | "CLOSED" | "MERGED";
	body: string;
	title: string;
	mergedAt: string | null;
	createdAt: string;
};

const GH_GIA = (d: string) => `#!/usr/bin/env bun
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
const D = ${JSON.stringify(d)};
const a = process.argv.slice(2);
appendFileSync(D + "/log", JSON.stringify(a) + "\\n");
appendFileSync(D + "/env-log", JSON.stringify({ a, GH_TOKEN: process.env.GH_TOKEN ?? null }) + "\\n");
if (existsSync(D + "/loi-list") && a[0] === "pr" && a[1] === "list") { process.stdout.write(readFileSync(D + "/loi-list", "utf8")); process.exit(0); }
const ds = JSON.parse(readFileSync(D + "/prs.json", "utf8"));
const lay = (c) => { const i = a.indexOf(c); return i < 0 ? null : a[i + 1]; };
if (a[0] === "pr" && a[1] === "list") { process.stdout.write(JSON.stringify(ds.map(({ number, state, body, mergedAt, createdAt }) => ({ number, state, body, mergedAt, createdAt })))); process.exit(0); }
if (a[0] === "pr" && a[1] === "create") {
  const number = ds.reduce((m, p) => Math.max(m, p.number), 0) + 1;
  ds.push({ number, state: "OPEN", body: lay("--body"), title: lay("--title"), mergedAt: null, createdAt: process.env.GH_GIA_NOW ?? new Date().toISOString() });
  writeFileSync(D + "/prs.json", JSON.stringify(ds));
  console.log("https://github.com/thu/thu/pull/" + number); process.exit(0);
}
if (a[0] === "pr" && a[1] === "edit") {
  const p = ds.find((x) => x.number === Number(a[2]));
  if (!p) { console.error("khong co PR"); process.exit(1); }
  p.body = lay("--body") ?? p.body; p.title = lay("--title") ?? p.title;
  writeFileSync(D + "/prs.json", JSON.stringify(ds)); process.exit(0);
}
process.exit(0);
`;

export type GhGia = {
	bin: string;
	nhatKy: () => string[][];
	nhatKyEnv: () => { a: string[]; GH_TOKEN: string | null }[];
	prs: () => PrGia[];
	datPr: (ds: PrGia[]) => void;
	doiTrangThai: (so: number, state: PrGia["state"], mergedAt?: string) => void;
	loiDanhSach: (chu: string) => void;
};

export function ghGia(): GhGia {
	const d = thuMuc("gh");
	const bin = path.join(d, "gh");
	writeFileSync(bin, GH_GIA(d));
	chmodSync(bin, 0o755);
	writeFileSync(path.join(d, "prs.json"), "[]");
	const docDs = (): PrGia[] =>
		JSON.parse(readFileSync(path.join(d, "prs.json"), "utf8")) as PrGia[];
	return {
		bin,
		nhatKyEnv: () =>
			existsSync(path.join(d, "env-log"))
				? readFileSync(path.join(d, "env-log"), "utf8")
						.split("\n")
						.filter(Boolean)
						.map(
							(l) => JSON.parse(l) as { a: string[]; GH_TOKEN: string | null },
						)
				: [],
		nhatKy: () =>
			existsSync(path.join(d, "log"))
				? readFileSync(path.join(d, "log"), "utf8")
						.split("\n")
						.filter(Boolean)
						.map((l) => JSON.parse(l) as string[])
				: [],
		prs: docDs,
		datPr: (ds) => writeFileSync(path.join(d, "prs.json"), JSON.stringify(ds)),
		doiTrangThai: (so, state, mergedAt) => {
			const ds = docDs();
			const p = ds.find((x) => x.number === so);
			if (p) {
				p.state = state;
				p.mergedAt = mergedAt ?? null;
			}
			writeFileSync(path.join(d, "prs.json"), JSON.stringify(ds));
		},
		loiDanhSach: (chu) => writeFileSync(path.join(d, "loi-list"), chu),
	};
}

export function gopDeXuat(kho: KhoGom, ngay?: string): void {
	g(kho.seed, ["fetch", "--quiet", "origin"]);
	g(kho.seed, ["switch", "--quiet", GOM.nhanhChinh]);
	g(kho.seed, ["pull", "--quiet", "--ff-only", "origin", GOM.nhanhChinh]);
	const them = ngay ? { GIT_COMMITTER_DATE: ngay, GIT_AUTHOR_DATE: ngay } : {};
	g(
		kho.seed,
		[
			"merge",
			"--quiet",
			"--no-ff",
			"-m",
			"gop de xuat",
			`origin/${GOM.nhanhDeXuat}`,
		],
		undefined,
		them,
	);
	g(kho.seed, ["push", "--quiet", "origin", GOM.nhanhChinh]);
}

export function suaBanGomNguoi(
	kho: KhoGom,
	doi: (txt: string) => string,
): void {
	const d = thuMuc("sua");
	g(d, ["clone", "--quiet", "-b", GOM.nhanhDeXuat, kho.origin, "."]);
	const tep =
		g(d, ["ls-files", "tin-hieu/gom/*.md"]).split("\n").filter(Boolean)[0] ??
		"";
	writeFileSync(
		path.join(d, tep),
		doi(readFileSync(path.join(d, tep), "utf8")),
	);
	g(d, ["commit", "--quiet", "-am", "chu kho sua nhom"], NGUOI);
	g(d, ["push", "--quiet", "origin", GOM.nhanhDeXuat]);
}

export function quaNhanhHangCho(
	kho: KhoGom,
	so: number,
	ngayTep: string,
	ngayGop: string,
): void {
	g(kho.seed, ["switch", "--quiet", GOM.nhanhChinh]);
	g(kho.seed, ["pull", "--quiet", "--ff-only", "origin", GOM.nhanhChinh]);
	g(kho.seed, ["switch", "--quiet", "-c", "tin-hieu/keo-ve"]);
	writeFileSync(
		path.join(kho.seed, "tin-hieu", "crm", `crm-${so}.json`),
		vietTep(
			tepTuBanGhi({
				tieuDe: `Tín hiệu hàng chờ ${so}`,
				muonLam: `Muốn ${so}`,
				daXayRa: `Gặp ${so}`,
				man: "/okr",
				guiLuc: new Date(Date.parse(ngayTep) - 3_600_000),
			}),
		),
	);
	g(kho.seed, ["add", "."]);
	g(kho.seed, ["commit", "--quiet", "-m", `keo ${so}`], undefined, {
		GIT_COMMITTER_DATE: ngayTep,
		GIT_AUTHOR_DATE: ngayTep,
	});
	g(kho.seed, ["switch", "--quiet", GOM.nhanhChinh]);
	g(
		kho.seed,
		["merge", "--quiet", "--no-ff", "-m", "gop keo ve", "tin-hieu/keo-ve"],
		undefined,
		{ GIT_COMMITTER_DATE: ngayGop, GIT_AUTHOR_DATE: ngayGop },
	);
	g(kho.seed, ["branch", "--quiet", "-D", "tin-hieu/keo-ve"]);
	g(kho.seed, ["push", "--quiet", "origin", GOM.nhanhChinh]);
}

export const GOC_TEST = path.resolve(import.meta.dir, "..");
const VALIDATION = path.resolve(
	GOC_TEST,
	"..",
	"..",
	"packages",
	"validation",
	"src",
	"tin-hieu-gom.ts",
);

export type Tiem = {
	tep: "gom-lich.ts" | "gom-than-pr.ts" | "gom-cau-hinh.ts";
	tu: string;
	thanh: string;
};

export async function banTiem(sua: Tiem[]): Promise<typeof chayGom> {
	const d = thuMuc("tiem");
	for (const t of ["gom-lich.ts", "gom-than-pr.ts", "gom-cau-hinh.ts"]) {
		let s = readFileSync(path.join(GOC_TEST, t), "utf8").replaceAll(
			"../../packages/validation/src/tin-hieu-gom.ts",
			VALIDATION,
		);
		for (const x of sua.filter((y) => y.tep === t)) {
			const so = s.split(x.tu).length - 1;
			if (so !== 1)
				throw new Error(`nhát tiêm không khớp đúng một chỗ (${so}): ${x.tu}`);
			s = s.replace(x.tu, x.thanh);
		}
		writeFileSync(path.join(d, t), s);
	}
	const m = (await import(path.join(d, "gom-lich.ts"))) as {
		chayGom: typeof chayGom;
	};
	return m.chayGom;
}

