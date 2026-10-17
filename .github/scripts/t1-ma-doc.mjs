import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { docGlobT1, tachT1 } from "./phan-loai.mjs";

const KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TEP_DOC_DS = join(KHO, "lib", "workspace-record.cjs");
const DUOI_MA = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|sh)$/;
const GOC_MA = /^(apps|packages)\//;
const NODE_MODULES = "/node_modules/";
const LOI_GOI_DOC =
	/readFileSync|readFile\(|existsSync|Bun\.file\(|createReadStream|copyFileSync|cpSync|spawnSync|execSync|execFileSync|spawn\(|import\(/;
const TU = /[^\s"'`/(),;:=<>{}[\]\\]+/g;
const TRUOC_TEN_CO_THU_MUC = `[\\s"'\`/(]`;
const TRUOC_TEN_O_GOC = `[\\s"'\`(]`;
const SAU_TEN = `([\\s"'\`),;]|$)`;
const SAU_THU_MUC = `([\\s"'\`/,)]|$)`;
const HINH_CONG = ".githooks/gate-shape.json";
const CHINH_NO = ".github/scripts/t1-ma-doc.mjs";
const KY_TU_DAI_DIEN = /[*?[]/;
const DUOI_MOI_TANG = "**";

export const MIEN = {
	"AGENTS.md": {
		"packages/ui/test/pre-push-t1.spec.ts": "viết tệp cùng tên vào kho tạm để thử lần đẩy, không đọc tệp của kho",
	},
	"CLAUDE.md": {
		"packages/ui/test/pre-push-t1.spec.ts": "viết tệp cùng tên vào kho tạm để thử lần đẩy, không đọc tệp của kho",
	},
	".github/workflows/ci.yml": {
		"packages/ui/test/pre-push-t1.spec.ts": "viết tệp cùng tên vào kho tạm để thử lần đẩy, không đọc tệp của kho",
	},
	"_acceptance/hoi-dap-okr/evidence/do-hoi-dap.md": {
		"_acceptance/hoi-dap-okr/rang/do-hoi-dap.mjs": "răng ghi bảng kết quả vào đó, không đọc",
	},
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function nhacTen(chu, tep) {
	const doan = tep.split("/");
	const ten = doan.at(-1);
	if (!chu.includes(ten)) return false;
	const truoc = doan.length > 1 ? TRUOC_TEN_CO_THU_MUC : TRUOC_TEN_O_GOC;
	if (!new RegExp(`(^|${truoc})${esc(ten)}${SAU_TEN}`).test(chu)) return false;
	return doan
		.slice(0, -1)
		.every((d) => new RegExp(`(^|${TRUOC_TEN_CO_THU_MUC})${esc(d)}${SAU_THU_MUC}`).test(chu));
}

function tepTheoDoi(goc) {
	const r = spawnSync("git", ["ls-files", "-z"], { cwd: goc, encoding: "utf8", maxBuffer: 1 << 28 });
	if (r.status !== 0) throw new Error(`git ls-files hong: ${(r.stderr || "").trim().split("\n")[0]}`);
	return r.stdout.split("\0").filter((t) => t && !t.includes(NODE_MODULES));
}

function docChu(goc, tep, kho) {
	if (!kho.has(tep)) {
		let chu = "";
		try {
			chu = readFileSync(join(goc, tep), "utf8");
		} catch {
			chu = "";
		}
		kho.set(tep, chu);
	}
	return kho.get(tep);
}

function scriptRang(goc) {
	const p = join(goc, HINH_CONG);
	if (!existsSync(p)) return [];
	const hinh = JSON.parse(readFileSync(p, "utf8"));
	return (hinh.checkers ?? []).flatMap((k) => (k.rang?.checks ?? []).map((c) => c.script)).filter(Boolean);
}

function globChet(globs, tep, tapTep) {
	return globs.filter((g) => {
		const m = g.search(KY_TU_DAI_DIEN);
		if (m < 0) return !tapTep.has(g);
		const dau = g.slice(0, m);
		const ungVien = tep.filter((t) => t.startsWith(dau));
		if (ungVien.length === 0) return true;
		if (g === `${dau}${DUOI_MOI_TANG}`) return false;
		return tachT1([g], ungVien).t1.size === 0;
	});
}

export function quetDauVao(goc = KHO, { mien = MIEN } = {}) {
	const tep = tepTheoDoi(goc);
	const tapTep = new Set(tep);
	const kho = new Map();
	const theoTen = new Map();
	for (const t of tep) {
		if (GOC_MA.test(t)) continue;
		const ten = t.split("/").at(-1);
		theoTen.set(ten, [...(theoTen.get(ten) ?? []), t]);
	}
	const duocNhac = (chu) => {
		const ra = new Set();
		for (const tu of new Set(chu.match(TU) ?? [])) {
			for (const t of theoTen.get(tu) ?? []) if (nhacTen(chu, t)) ra.add(t);
		}
		return ra;
	};
	const globs = docGlobT1(goc);
	const nguon = new Set(tep.filter((t) => GOC_MA.test(t) && DUOI_MA.test(t)));
	const cau = new Set(scriptRang(goc).filter((s) => tapTep.has(s)));
	for (const n of nguon) {
		const chu = docChu(goc, n, kho);
		if (!LOI_GOI_DOC.test(chu)) continue;
		for (const t of duocNhac(chu)) if (DUOI_MA.test(t)) cau.add(t);
	}
	const cauT1 = tachT1(globs, [...cau]);
	for (const t of cau) if (t !== CHINH_NO && !cauT1.t1.has(t) && !cauT1.maDoc.has(t)) nguon.add(t);
	const cap = [];
	for (const n of nguon) {
		const chu = docChu(goc, n, kho);
		if (!LOI_GOI_DOC.test(chu)) continue;
		for (const t of duocNhac(chu)) if (t !== n) cap.push([t, n]);
	}
	const { t1, maDoc } = tachT1(globs, [...new Set(cap.map(([t]) => t))]);
	const dich = new Map();
	const thieu = [];
	const thay = new Set();
	for (const [d, n] of cap) {
		if (!t1.has(d) && !maDoc.has(d)) continue;
		dich.set(d, [...(dich.get(d) ?? []), n].sort());
		thay.add(`${d}\u0000${n}`);
		if (maDoc.has(d) || mien[d]?.[n]) continue;
		thieu.push({ dich: d, nguon: n });
	}
	const mienThua = Object.entries(mien)
		.flatMap(([d, ds]) => Object.keys(ds).map((n) => ({ dich: d, nguon: n })))
		.filter(({ dich: d, nguon: n }) => !thay.has(`${d}\u0000${n}`));
	const { configList } = createRequire(import.meta.url)(TEP_DOC_DS);
	const chet = globChet(configList(readFileSync(join(goc, "_acceptance", "config.yaml"), "utf8"), "t1_ma_doc"), tep, tapTep);
	const sapXep = (a, b) => `${a.dich}${a.nguon}`.localeCompare(`${b.dich}${b.nguon}`);
	thieu.sort(sapXep);
	mienThua.sort(sapXep);
	const baoCao = [
		...thieu.map((x) => `thieu-khai ${x.dich} ← ${x.nguon}`),
		...mienThua.map((x) => `mien-thua ${x.dich} ← ${x.nguon}`),
		...chet.map((g) => `glob-chet ${g}`),
	];
	return { dich: new Map([...dich].sort(([a], [b]) => a.localeCompare(b))), thieu, mienThua, globChet: chet, baoCao };
}

function chay() {
	const i = process.argv.indexOf("--goc");
	const goc = i >= 0 ? resolve(process.argv[i + 1]) : KHO;
	const kq = quetDauVao(goc, process.argv.includes("--mien-rong") ? { mien: {} } : {});
	if (kq.baoCao.length) {
		for (const d of kq.baoCao) process.stdout.write(`${d}\n`);
		process.exit(1);
	}
	process.stdout.write(`sach: ${kq.dich.size} tep T1 co ben doc, deu da khai\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) chay();
