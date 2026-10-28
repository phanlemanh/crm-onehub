import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC_THUOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const require = createRequire(import.meta.url);
const { parseEvals } = require(join(GOC_THUOC, "lib", "eval-yaml.cjs"));
const { resolveConfigKey } = require(join(GOC_THUOC, "lib", "evidence-core.cjs"));

const NHANH_GOC = "origin/onehub";
const HO_SO_NAY = "lich-su-moi-lan-cap-nhat";
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const EXECUTOR_MAY = new Set(["test", "script"]);
const CHO_PHEP = new Set([
	"apps/app/test/ngan-kr-mot-cho.dom.tsx",
	"_acceptance/ngan-kr-mot-cho/rang/man.mjs",
]);
const SO_VK7 = "_acceptance/ngan-kr-mot-cho/decisions.jsonl";
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx|sh)$/;
const TEP_TRONG_LENH = /[\w@./()[\]-]+\.(?:tsx|ts|mjs|cjs|js|sh)\b/g;
const TEP_CHIEU_DO = "_acceptance/hop-tuan-tren-bang/rang/man.mjs";
const MA_DO = 1;
const MA_KHONG_DO = 2;

const git = (args, cwd) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function hoSoDaKy(goc) {
	const thu = join(goc, "_acceptance");
	return readdirSync(thu, { withFileTypes: true })
		.filter((d) => d.isDirectory() && d.name !== HO_SO_NAY)
		.map((d) => d.name)
		.filter((slug) => {
			const hd = join(thu, slug, "contract.md");
			if (!existsSync(hd)) return false;
			const tt = /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1];
			return TRANG_THAI_DA_KY.has(tt ?? "");
		});
}

function tepRang(goc, slug) {
	const rang = join(goc, "_acceptance", slug, "rang");
	if (!existsSync(rang)) return [];
	return readdirSync(rang, { recursive: true })
		.map(String)
		.filter((f) => DUOI_MA.test(f))
		.map((f) => `_acceptance/${slug}/rang/${f}`);
}

function tepCuaLenh(goc, lenh) {
	const ra = [];
	for (const m of lenh.matchAll(TEP_TRONG_LENH)) {
		const t = m[0].replace(/^\.\//, "");
		const ung = [t, join("apps/app", t), join("apps/api", t)].find((x) =>
			existsSync(join(goc, x)),
		);
		if (ung) ra.push(ung);
	}
	return ra;
}

function tapThuoc(goc) {
	const cauHinh = readFileSync(join(goc, "_acceptance", "config.yaml"), "utf8");
	const tap = new Set();
	for (const slug of hoSoDaKy(goc)) {
		for (const t of tepRang(goc, slug)) tap.add(t);
		const tepEval = join(goc, "_acceptance", slug, "evals.yaml");
		if (!existsSync(tepEval)) continue;
		const evals = parseEvals(readFileSync(tepEval, "utf8"), [
			"executor",
			"cmd",
			"status",
		]);
		for (const e of evals) {
			if (!EXECUTOR_MAY.has(String(e.executor).trim())) continue;
			if (String(e.status ?? "").trim() === "not-run") continue;
			const cmd = String(e.cmd ?? "").trim();
			const lenh = cmd.startsWith("config:")
				? String(resolveConfigKey(cauHinh, cmd.slice(7)) ?? "")
				: cmd;
			for (const t of tepCuaLenh(goc, lenh)) tap.add(t);
		}
	}
	return tap;
}

function coDongSoVk7(goc) {
	const p = join(goc, SO_VK7);
	if (!existsSync(p)) return false;
	return readFileSync(p, "utf8")
		.split("\n")
		.filter(Boolean)
		.some((dong) => {
			try {
				const d = JSON.parse(dong);
				const chu = `${d.decision ?? ""} ${d.why ?? ""}`;
				return (
					String(d.decided_by ?? "").trim() !== "" &&
					chu.includes("Ngoài-1") &&
					chu.includes(HO_SO_NAY)
				);
			} catch {
				return false;
			}
		});
}

function soat(goc) {
	const coSo = git(["merge-base", "HEAD", NHANH_GOC], goc);
	const doi = git(["diff", "--name-only", `${coSo}...HEAD`], goc)
		.split("\n")
		.filter(Boolean);
	const thuoc = tapThuoc(goc);
	const sua = doi.filter((t) => thuoc.has(t));
	const sai = [];
	for (const t of sua) {
		if (!CHO_PHEP.has(t)) sai.push(`SAI AC-10: SUA THUOC DA KY ${t}`);
	}
	if (sua.some((t) => CHO_PHEP.has(t)) && !coDongSoVk7(goc))
		sai.push("SAI AC-10: THIEU DONG SO NGAN-KR-MOT-CHO");
	console.log(`pham vi: ${thuoc.size} tep thuoc da ky, ${sua.length} bi sua`);
	for (const t of sua.filter((x) => CHO_PHEP.has(x)))
		console.log(`CHO PHEP THEO HOI-1 ${t}`);
	return sai;
}

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "lsml-pham-vi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"], GOC_THUOC);
		const duong = join(sao, TEP_CHIEU_DO);
		writeFileSync(
			duong,
			`${readFileSync(duong, "utf8").replace(/\n$/, "")}\nexport const suaThu = 1 + 1;\n`,
		);
		git(["add", "--", TEP_CHIEU_DO], sao);
		git(
			[
				"-c",
				"user.name=kiem-do",
				"-c",
				"user.email=kiem@do.do",
				"commit",
				"-q",
				"--no-verify",
				"-m",
				"test(lsml): chieu do tam",
			],
			sao,
		);
		const sai = soat(sao);
		for (const s of sai) console.log(s);
		const ghim = `SAI AC-10: SUA THUOC DA KY ${TEP_CHIEU_DO}`;
		const bat = sai.includes(ghim);
		console.log(
			`CHIEU DO pham-vi: ${bat ? "bat duoc" : "KHONG bat duoc"} ${TEP_CHIEU_DO}`,
		);
		return bat ? MA_DO : 0;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], {
			cwd: GOC_THUOC,
		});
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC_THUOC });
	}
}

try {
	if (process.argv.includes("--chieu-do")) process.exit(chieuDo());
	const sai = soat(GOC_THUOC);
	for (const s of sai) console.log(s);
	console.log(
		`KET LUAN pham-vi: ${sai.length === 0 ? "dat" : `${sai.length} SAI`}`,
	);
	process.exit(sai.length === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
