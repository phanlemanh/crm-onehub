import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { GOC, MOC_GOC } from "./neo.mjs";

const TEP_KIEM_KE = join(import.meta.dirname, "..", "kiem-ke.md");
const MAU = join(import.meta.dirname, "mau-moc-troi");
const DUOI_MA = /\.(mjs|cjs|js|ts|sh)$/;
const MA_TRAN_MAU = {
	"01-origin-onehub.mjs": ["origin/onehub"],
	"02-onehub-tran.mjs": ["onehub tran"],
	"03-merge-base.mjs": ["merge-base"],
	"04-cham-cham-head.mjs": ["..HEAD"],
	"05-head-n.mjs": ["HEAD~N"],
	"06-upstream.mjs": ["@{u}"],
	"07-ls-files.mjs": ["git ls-files khong ref"],
	"08-diff-khong-ref.mjs": ["git diff khong ref"],
	"09-neo-sha.mjs": [],
	"10-neo-sha-show.mjs": [],
};

export const DANG_TROI = [
	["origin/onehub", /origin\/onehub/],
	["onehub tran", /["'`\s]onehub\.\.|\.\.onehub\b|["'`]onehub["'`]/],
	["merge-base", /merge-base/],
	["..HEAD", /\.\.HEAD\b/],
	["HEAD~N", /HEAD~\d+/],
	["@{u}", /@\{u\}/],
	["git ls-files khong ref", /["'`]ls-files["'`]|git ls-files/],
	["git diff khong ref", /["'`]diff["'`],\s*["'`]--name-only["'`]\s*\]|git diff --name-only\s*["'`\n]/],
];

export function dangTroiCua(text, laMa) {
	return DANG_TROI.filter(([ten, re]) => (laMa || ten === "origin/onehub" || ten === "merge-base" || ten === "..HEAD") && re.test(text)).map(([ten]) => ten);
}

function tepDuoi(thuMuc) {
	if (!existsSync(thuMuc)) return [];
	return readdirSync(thuMuc).flatMap((t) => {
		const p = join(thuMuc, t);
		return statSync(p).isDirectory() ? tepDuoi(p) : [p];
	});
}

export function quet(goc) {
	const troi = [];
	let thieuPaths = 0;
	let soEval = 0;
	const hoSo = [];
	for (const s of readdirSync(join(goc, "_acceptance")).sort()) {
		const hd = join(goc, "_acceptance", s, "contract.md");
		const ev = join(goc, "_acceptance", s, "evals.yaml");
		if (!existsSync(hd) || !existsSync(ev)) continue;
		const st = /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1];
		if (st !== "signed-off" && st !== "machine-cleared") continue;
		hoSo.push(s);
		const evText = readFileSync(ev, "utf8");
		for (const khoi of evText.split(/\n  - id: /).slice(1)) {
			if (!/\n    executor:\s*(script|test)\b/.test(khoi) || /\n    status:\s*not-run/.test(khoi)) continue;
			soEval += 1;
			if (!/\n    paths:/.test(khoi)) thieuPaths += 1;
		}
		for (const p of [ev, ...tepDuoi(join(goc, "_acceptance", s, "rang"))]) {
			const dang = dangTroiCua(readFileSync(p, "utf8"), DUOI_MA.test(p));
			if (dang.length) troi.push({ tep: relative(goc, p), dang });
		}
	}
	return { hoSo: hoSo.length, soEval, thieuPaths, troi };
}

function quetTaiSha(sha) {
	const tam = mkdtempSync(join(tmpdir(), "kiem-ke-"));
	try {
		execFileSync("bash", ["-c", 'git -C "$1" archive "$2" -- _acceptance | tar -x -C "$3"', "_", GOC, sha, tam]);
		return quet(tam);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

export function viet(kq, sha) {
	return [
		"# Kiểm kê thước còn nhắc mốc trôi — thuoc-khong-tu-het-han",
		"",
		"Sinh bằng `node _acceptance/thuoc-khong-tu-het-han/rang/kiem-ke.mjs --viet`; đo lại bằng cùng lệnh không cờ (E5).",
		"Danh sách là ứng viên: chuỗi có mặt không chứng minh thước tự hết hạn. Sửa từng tệp khi lượt kiểm chéo đêm gọi tên nó đỏ.",
		"",
		`sha: ${sha}`,
		`ho so da ky: ${kq.hoSo}`,
		`eval script/test: ${kq.soEval}`,
		`eval thieu paths: ${kq.thieuPaths}`,
		`tep nhac moc troi: ${kq.troi.length}`,
		"",
		"## Tệp nhắc mốc trôi",
		"",
		...kq.troi.map((x) => `- \`${x.tep}\` — ${x.dang.join(", ")}`),
		"",
	].join("\n");
}

function docKiemKe() {
	const t = readFileSync(TEP_KIEM_KE, "utf8");
	const so = (k) => /^(\S.*?): (.*)$/m.exec(t.split("\n").find((d) => d.startsWith(`${k}: `)) ?? "")?.[2];
	return { text: t, sha: so("sha") };
}

export function soKhop(text, kq, sha) {
	const mong = viet(kq, sha).split("\n");
	const thuc = text.split("\n");
	const loi = [];
	for (let i = 0; i < Math.max(mong.length, thuc.length); i += 1) {
		if (mong[i] !== thuc[i]) {
			loi.push(`dong ${i + 1}: kiem-ke.md «${thuc[i] ?? ""}», quet lai «${mong[i] ?? ""}»`);
			if (loi.length >= 5) break;
		}
	}
	return loi;
}

function main() {
	if (process.argv.includes("--viet")) {
		writeFileSync(TEP_KIEM_KE, viet(quetTaiSha(MOC_GOC), MOC_GOC));
		console.log(`da viet ${relative(GOC, TEP_KIEM_KE)} tai ${MOC_GOC}`);
		return 0;
	}
	const loi = [];
	const mau = readdirSync(MAU).sort();
	if (JSON.stringify(mau) !== JSON.stringify(Object.keys(MA_TRAN_MAU).sort())) loi.push(`bo mau tren dia (${mau.join(", ")}) khac ma tran viet truoc`);
	for (const [t, mong] of Object.entries(MA_TRAN_MAU)) {
		const dang = dangTroiCua(readFileSync(join(MAU, t), "utf8"), true);
		if (JSON.stringify(dang) !== JSON.stringify(mong)) loi.push(`mau ${t}: dem ${JSON.stringify(dang)}, mong ${JSON.stringify(mong)}`);
	}
	const daBao = new Set(Object.values(MA_TRAN_MAU).flat());
	for (const [ten] of DANG_TROI) if (!daBao.has(ten)) loi.push(`dang troi «${ten}» khong co mau nao`);
	console.log(`bo mau: ${Object.keys(MA_TRAN_MAU).length} o cua ma tran viet truoc, ${daBao.size}/${DANG_TROI.length} dang troi co mau`);
	const kk = docKiemKe();
	if (!kk.sha) loi.push("kiem-ke.md thieu dong sha");
	else {
		const kq = quetTaiSha(kk.sha);
		loi.push(...soKhop(kk.text, kq, kk.sha));
		console.log(`quet lai tai ${kk.sha}: ${kq.hoSo} ho so da ky, ${kq.troi.length} tep nhac moc troi, ${kq.thieuPaths}/${kq.soEval} eval thieu paths`);
		const hong = kk.text.replace(/^(tep nhac moc troi: )(\d+)/m, (_, a, b) => `${a}${Number(b) + 1}`);
		if (!soKhop(hong, kq, kk.sha).some((l) => l.includes("tep nhac moc troi"))) loi.push("chieu do: sua so trong ban sao kiem-ke.md ma khong bat");
		else console.log("chieu do: sua mot so trong ban sao kiem-ke.md -> DUNG");
	}
	if (loi.length) {
		console.error(`kiem-ke: DO\n${loi.map((l) => `  - ${l}`).join("\n")}`);
		return 1;
	}
	console.log("kiem-ke: XANH");
	return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main();
