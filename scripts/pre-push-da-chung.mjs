import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { docGlobT1, tachT1 } from "../.github/scripts/phan-loai.mjs";

export const TEP_KHAI = join(".githooks", "da-chung.json");
const TEP_HINH = join(".githooks", "gate-shape.json");
const TEP_HOOK = join(".githooks", "pre-push");
const VONG_HOOK = /^for task in (.+); do$/m;
const KHO_DAU = join("crm-pre-push", "da-chung");
const KHO_PHIEU = join("crm-pre-push", "phieu");
const THU_MUC_GITHUB = ".github/";
const SHA_RONG = /^0+$/;
const SHA = /^[0-9a-f]{40}$/;
const NGAY_MS = 24 * 60 * 60 * 1000;
const NGUON = { hook: "hook", s4: "sổ chạy S4", repin: "sổ chạy ghim lại", ci: "CI" };
const SO_CHAY = /^_acceptance\/[^/]+\/run-log\.jsonl$/;
const GITHUB = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/;

function git(goc, args, input) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8", input, maxBuffer: 1 << 28 });
	return { ok: r.status === 0, ra: r.stdout || "", loi: (r.stderr || "").trim().split("\n")[0] };
}

function gitPhai(goc, args, input) {
	const r = git(goc, args, input);
	if (!r.ok) throw new Error(`git ${args[0]} hỏng: ${r.loi}`);
	return r.ra.trim();
}

function chuoiDs(v, ten) {
	if (!Array.isArray(v) || v.some((x) => typeof x !== "string" || !x)) throw new Error(`${TEP_KHAI}: ${ten} phải là danh sách chuỗi`);
	return v;
}

function bangDs(v, ten) {
	if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error(`${TEP_KHAI}: thiếu ${ten}`);
	return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, chuoiDs(x, `${ten}.${k}`)]));
}

function so(v, ten) {
	if (!Number.isFinite(v) || v <= 0) throw new Error(`${TEP_KHAI}: gioi_han.${ten} phải là số dương`);
	return v;
}

export function docKhai(goc) {
	const tep = join(goc, TEP_KHAI);
	if (!existsSync(tep)) return null;
	const tho = JSON.parse(readFileSync(tep, "utf8"));
	const gh = tho.gioi_han ?? {};
	if (typeof tho.test?.lenh !== "string" || typeof tho.test?.loc !== "string") throw new Error(`${TEP_KHAI}: thiếu test.lenh, test.loc`);
	return {
		viSao: typeof tho.vi_sao === "string" ? tho.vi_sao.trim() : "",
		lenh: bangDs(tho.lenh, "lenh"),
		test: { lenh: tho.test.lenh, loc: tho.test.loc },
		ci: bangDs(tho.ci, "ci"),
		gioiHan: {
			ngay: so(gh.ngay, "ngay"),
			tepDiff: so(gh.tep_diff, "tep_diff"),
			shaSoChay: so(gh.sha_so_chay, "sha_so_chay"),
			commitGan: so(gh.commit_gan, "commit_gan"),
			ghToiDa: so(gh.gh_toi_da, "gh_toi_da"),
			giayGh: so(gh.giay_gh, "giay_gh"),
		},
	};
}

function thuTuHook(goc) {
	const m = VONG_HOOK.exec(readFileSync(join(goc, TEP_HOOK), "utf8"));
	if (!m) throw new Error(`không đọc được vòng «for task in …» của ${TEP_HOOK}`);
	return m[1].trim().split(/\s+/);
}

function docHinh(goc) {
	const hinh = JSON.parse(readFileSync(join(goc, TEP_HINH), "utf8"));
	const checkers = Array.isArray(hinh.checkers) ? hinh.checkers : [];
	const khai = new Set(checkers.map((c) => c.id));
	return {
		buoc: thuTuHook(goc).filter((id) => khai.has(id)),
		roots: Array.isArray(hinh.roots) ? hinh.roots : [],
		mienTest: Object.keys(checkers.find((c) => c.id === "test")?.exempt ?? {}),
	};
}

function thuMucChung(goc) {
	const d = gitPhai(goc, ["rev-parse", "--git-common-dir"]);
	return isAbsolute(d) ? d : resolve(goc, d);
}

function phienBan(lenh) {
	const r = spawnSync(lenh, ["--version"], { encoding: "utf8" });
	return r.status === 0 ? (r.stdout || "").trim() : `khong-${lenh}`;
}

export function vanTay(goc) {
	const env = join(goc, ".env");
	const h = createHash("sha256");
	h.update(`${phienBan("node")}\n${phienBan("bun")}\n`);
	h.update(existsSync(env) ? readFileSync(env) : "khong-env");
	return h.digest("hex");
}

function luc(ms) {
	return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function coCommit(goc, sha) {
	return SHA.test(sha) && git(goc, ["cat-file", "-e", `${sha}^{commit}`]).ok;
}

function locCoCommit(goc, ds) {
	const hop = ds.filter((s) => SHA.test(s));
	if (hop.length === 0) return new Set();
	const ra = git(goc, ["cat-file", "--batch-check"], `${hop.map((s) => `${s}^{commit}`).join("\n")}\n`).ra;
	return new Set(ra.split("\n").filter((d) => / commit /.test(d)).map((d) => d.split(" ")[0]));
}

function tepDiff(goc, a, b) {
	return gitPhai(goc, ["diff", "--name-only", "--no-renames", a, b]).split("\n").filter(Boolean);
}

export function cungCayMa(goc, khai, dinh, ungVien) {
	const cung = new Set();
	const can = [];
	for (const sha of new Set(ungVien)) {
		if (sha === dinh) {
			cung.add(sha);
			continue;
		}
		const ds = tepDiff(goc, sha, dinh);
		if (ds.length > khai.gioiHan.tepDiff) continue;
		if (ds.some((t) => t.startsWith(THU_MUC_GITHUB))) continue;
		can.push([sha, ds]);
	}
	const tatCa = [...new Set(can.flatMap(([, ds]) => ds))];
	const { t1 } = tatCa.length ? tachT1(docGlobT1(goc), tatCa) : { t1: new Set() };
	for (const [sha, ds] of can) if (ds.every((t) => t1.has(t))) cung.add(sha);
	return cung;
}

function khoDau(goc) {
	return join(thuMucChung(goc), KHO_DAU);
}

function docDau(goc, khai, vt) {
	const kho = khoDau(goc);
	if (!existsSync(kho)) return [];
	const han = Date.now() - khai.gioiHan.ngay * NGAY_MS;
	const ra = [];
	for (const ten of readdirSync(kho)) {
		const tep = join(kho, ten);
		let d;
		try {
			d = JSON.parse(readFileSync(tep, "utf8"));
		} catch {
			continue;
		}
		const ms = Date.parse(d?.luc ?? "");
		if (!Number.isFinite(ms) || ms < han) {
			rmSync(tep, { force: true });
			continue;
		}
		if (d.van_tay !== vt || !Array.isArray(d.buoc) || !coCommit(goc, d.sha)) continue;
		ra.push({ ten: NGUON.hook, sha: d.sha, ms, buoc: new Set(d.buoc) });
	}
	return ra;
}

export function ghiDau(goc, sha, buoc) {
	const kho = khoDau(goc);
	mkdirSync(kho, { recursive: true });
	const theoHook = docHinh(goc).buoc.filter((b) => buoc.includes(b));
	writeFileSync(join(kho, `${sha}.json`), `${JSON.stringify({ sha, luc: luc(Date.now()), van_tay: vanTay(goc), buoc: theoHook })}\n`);
}

function giaTriYaml(chu) {
	const t = chu.trim();
	if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
	if (t.startsWith('"') && t.endsWith('"')) return JSON.parse(t);
	return t;
}

function lenhCauHinh(cauHinh, duong) {
	const [goc, nhom, ten] = duong.split(".");
	if (goc !== "executors" || !nhom || !ten) return null;
	const dong = cauHinh.split("\n");
	const i = dong.findIndex((d) => d === "executors:");
	if (i < 0) return null;
	let trongNhom = false;
	for (const d of dong.slice(i + 1)) {
		if (/^\S/.test(d)) break;
		if (/^ {2}\S/.test(d)) trongNhom = d.trim() === `${nhom}:`;
		else if (trongNhom && d.startsWith(`    ${ten}:`)) return giaTriYaml(d.slice(`    ${ten}:`.length));
	}
	return null;
}

function lenhGhimLai(cauHinh) {
	const m = /^ {2}suite_keys:\s*\[([^\]]*)\]/m.exec(cauHinh);
	if (!m) return null;
	const ds = m[1].split(",").map((x) => x.trim()).filter(Boolean).map((k) => lenhCauHinh(cauHinh, k));
	return ds.every(Boolean) ? ds : null;
}

export function lenhXanhCuaDong(d) {
	if (!d || typeof d !== "object" || d.kind === "repin" || d.kind === "repin-do") return null;
	if (typeof d.cmd !== "string" || !SHA.test(d.sha ?? "")) return null;
	return d.exit_code === 0 || d.exit_code === "0" ? d.cmd : null;
}

function docSoChay(goc, dinh) {
	const cay = gitPhai(goc, ["ls-tree", "-r", dinh, "--", "_acceptance"]).split("\n").filter(Boolean);
	const blob = cay
		.map((d) => d.split(/\s+/))
		.filter((p) => SO_CHAY.test(p[3] ?? ""))
		.map((p) => p[2]);
	if (blob.length === 0) return [];
	const ra = gitPhai(goc, ["cat-file", "--batch"], `${blob.join("\n")}\n`);
	return ra
		.split("\n")
		.filter((d) => d.startsWith("{"))
		.map((d) => {
			try {
				return JSON.parse(d);
			} catch {
				return null;
			}
		})
		.filter((d) => d && typeof d === "object" && SHA.test(d.sha ?? ""));
}

function boLocTest(khai, lenh) {
	if (lenh === khai.test.lenh) return "*";
	const dau = `${khai.test.lenh} -- `;
	if (!lenh.startsWith(dau)) return null;
	const ds = lenh.slice(dau.length).trim().split(/\s+/);
	if (!ds.every((x) => x.startsWith(khai.test.loc) && !x.startsWith(`${khai.test.loc}!`))) return null;
	return ds.map((x) => x.slice(khai.test.loc.length));
}

function goiCanTest(goc) {
	const hinh = docHinh(goc);
	const goiGoc = new Set(hinh.roots);
	const pkg = join(goc, "package.json");
	if (existsSync(pkg)) for (const w of JSON.parse(readFileSync(pkg, "utf8")).workspaces ?? []) if (w.includes("/*")) goiGoc.add(w.slice(0, w.indexOf("/*")));
	const ds = [];
	for (const g of goiGoc) {
		const d = join(goc, g);
		if (!existsSync(d)) continue;
		for (const ten of readdirSync(d)) {
			const m = join(d, ten, "package.json");
			if (!existsSync(m)) continue;
			const p = JSON.parse(readFileSync(m, "utf8"));
			if (p.scripts?.test && !hinh.mienTest.includes(p.name)) ds.push(p.name);
		}
	}
	return ds;
}

function buocTuLenh(goc, khai, lenhXanh) {
	const buoc = new Set();
	for (const [b, ds] of Object.entries(khai.lenh)) if (ds.some((l) => lenhXanh.has(l))) buoc.add(b);
	const phu = new Set();
	let ca = false;
	for (const l of lenhXanh) {
		const loc = boLocTest(khai, l);
		if (loc === "*") ca = true;
		else if (loc) for (const g of loc) phu.add(g);
	}
	if (ca || (phu.size > 0 && goiCanTest(goc).every((g) => phu.has(g)))) buoc.add("test");
	return buoc;
}

function nguonSoChay(goc, khai, dinh) {
	const cauHinh = readFileSync(join(goc, "_acceptance", "config.yaml"), "utf8");
	const ghimLai = lenhGhimLai(cauHinh);
	const theoSha = new Map();
	const them = (sha, ten, ms, lenh) => {
		const k = `${sha} ${ten}`;
		const o = theoSha.get(k) ?? { sha, ten, ms: 0, lenh: new Set() };
		o.ms = Math.max(o.ms, ms);
		o.lenh.add(lenh);
		theoSha.set(k, o);
	};
	for (const d of docSoChay(goc, dinh)) {
		const ms = Date.parse(d.ts ?? "") || 0;
		if (d.kind === "repin") {
			if (d.tong_ket?.ket_cuc !== "xanh" || !Array.isArray(d.suites_exit) || !ghimLai) continue;
			if (d.suites_exit.length !== ghimLai.length) continue;
			d.suites_exit.forEach((ma, i) => {
				if (ma === 0) them(d.sha, NGUON.repin, ms, ghimLai[i]);
			});
		} else {
			const lenh = lenhXanhCuaDong(d);
			if (lenh) them(d.sha, NGUON.s4, ms, lenh);
		}
	}
	const moi = [...theoSha.values()].sort((a, b) => b.ms - a.ms);
	const shaMoi = [...new Set(moi.map((o) => o.sha))].slice(0, khai.gioiHan.shaSoChay);
	const co = locCoCommit(goc, shaMoi);
	return moi
		.filter((o) => co.has(o.sha))
		.map((o) => ({ ten: o.ten, sha: o.sha, ms: o.ms, buoc: buocTuLenh(goc, khai, o.lenh) }))
		.filter((o) => o.buoc.size > 0);
}

function nguonCi(goc, khai, remote, dinh, xa, conThieu) {
	const url = git(goc, ["remote", "get-url", remote]);
	const m = url.ok ? GITHUB.exec(url.ra.trim()) : null;
	if (!m) return [];
	const ungVien = [...(xa ? [xa] : []), ...gitPhai(goc, ["rev-list", "-n", String(khai.gioiHan.commitGan), dinh]).split("\n").filter(Boolean)];
	const cung = cungCayMa(goc, khai, dinh, ungVien);
	const ra = [];
	let goi = 0;
	for (const sha of ungVien) {
		if (!cung.has(sha) || goi >= khai.gioiHan.ghToiDa || conThieu.size === 0) continue;
		goi += 1;
		const r = spawnSync("gh", ["api", `repos/${m[1]}/${m[2]}/commits/${sha}/check-runs?per_page=100`], {
			cwd: goc,
			encoding: "utf8",
			timeout: khai.gioiHan.giayGh * 1000,
		});
		if (r.status !== 0 || r.error) continue;
		let runs;
		try {
			runs = JSON.parse(r.stdout).check_runs;
		} catch {
			continue;
		}
		if (!Array.isArray(runs)) continue;
		const moiNhat = new Map();
		for (const c of runs) {
			if (typeof c?.name !== "string") continue;
			const ms = Date.parse(c.completed_at ?? "") || 0;
			if (!moiNhat.has(c.name) || moiNhat.get(c.name).ms <= ms) moiNhat.set(c.name, { ms, ket: c.conclusion });
		}
		const xanh = new Set([...moiNhat].filter(([, v]) => v.ket === "success").map(([k]) => k));
		const buoc = new Set(Object.entries(khai.ci).filter(([, ds]) => ds.every((n) => xanh.has(n))).map(([b]) => b));
		if (buoc.size === 0) continue;
		ra.push({ ten: NGUON.ci, sha, ms: Math.max(0, ...[...moiNhat.values()].map((v) => v.ms)), buoc });
		for (const b of buoc) conThieu.delete(b);
	}
	return ra;
}

function chungMotRef(goc, khai, remote, dong, thuTu) {
	const vt = vanTay(goc);
	const dinh = dong.localSha;
	const thieu = new Set(thuTu);
	const dung = [];
	const lay = (ds) => {
		const cung = cungCayMa(goc, khai, dinh, ds.map((n) => n.sha));
		for (const n of ds) {
			if (!cung.has(n.sha)) continue;
			const moi = [...n.buoc].filter((b) => thieu.has(b));
			if (moi.length === 0) continue;
			for (const b of moi) thieu.delete(b);
			dung.push({ ...n, buoc: new Set(moi) });
		}
	};
	lay(docDau(goc, khai, vt));
	if (thieu.size) lay(nguonSoChay(goc, khai, dinh));
	if (thieu.size) {
		const xa = dong.remoteSha && !SHA_RONG.test(dong.remoteSha) && coCommit(goc, dong.remoteSha) ? dong.remoteSha : null;
		dung.push(...nguonCi(goc, khai, remote, dinh, xa, thieu));
	}
	return { sha: dinh, buoc: thuTu.filter((b) => !thieu.has(b)), nguon: dung };
}

export function chungDay(goc, khai, dongs, remote) {
	const thuTu = docHinh(goc).buoc;
	const refs = dongs.filter((d) => d.localSha && !SHA_RONG.test(d.localSha));
	if (refs.length === 0) return { refs: [], buoc: [], dong: null };
	const tung = refs.map((d) => chungMotRef(goc, khai, remote, d, thuTu));
	const buoc = thuTu.filter((b) => tung.every((t) => t.buoc.includes(b)));
	if (buoc.length === 0) return { refs: refs.map((d) => d.localSha), buoc, dong: null };
	const dau = tung[0];
	const daKe = new Set();
	const nguon = dau.nguon
		.filter((n) => buoc.some((b) => n.buoc.has(b)) && !daKe.has(n.ten) && daKe.add(n.ten))
		.map((n) => `${n.ten} (${n.sha.slice(0, 9)}, ${luc(n.ms)})`)
		.join(" và ");
	return {
		refs: refs.map((d) => d.localSha),
		buoc,
		dong: `pre-push: cây mã của ${dau.sha.slice(0, 9)} đã xanh ở ${nguon} — bỏ ${buoc.join(", ")}.`,
	};
}

function tepPhieu(goc) {
	const khoa = createHash("sha256").update(resolve(goc)).digest("hex").slice(0, 16);
	return join(thuMucChung(goc), KHO_PHIEU, `${khoa}.json`);
}

export function ghiPhieu(goc, phieu) {
	const tep = tepPhieu(goc);
	mkdirSync(join(tep, ".."), { recursive: true });
	writeFileSync(tep, `${JSON.stringify(phieu)}\n`);
}

export function docPhieu(goc, sauMs) {
	const tep = tepPhieu(goc);
	if (!existsSync(tep) || statSync(tep).mtimeMs < sauMs) return null;
	const d = JSON.parse(readFileSync(tep, "utf8"));
	const ds = (v) => (Array.isArray(v) && v.every((x) => typeof x === "string") ? v : null);
	if (!ds(d.refs) || !ds(d.t1) || !ds(d.daChung)) throw new Error("phiếu lần đẩy sai khuôn");
	return { refs: d.refs, t1: d.t1, daChung: d.daChung };
}

export function xoaPhieu(goc) {
	rmSync(tepPhieu(goc), { force: true });
}
