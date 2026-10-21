import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const require = createRequire(import.meta.url);
const { parseEvals } = require(join(GOC, "lib", "eval-yaml.cjs"));
const { resolveConfigKey } = require(join(GOC, "lib", "evidence-core.cjs"));

const NHANH_GOC = "origin/onehub";
const HO_SO = [
	"dau-trang-okr-cho-nut-hoi-kara",
	"duong-ly-do-muc-tieu",
	"khung-man-chung",
];
const BAI = "apps/app/test/okr-hoi-y.dom.tsx";
const LENH_BAI = `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-hoi-y.dom.tsx`;
const TRAN_LENH_MS = 15 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function chamCam(cwd, coso) {
	const ds = [...HO_SO.map((s) => `_acceptance/${s}`), BAI];
	return git(["diff", "--name-only", `${coso}...HEAD`, "--", ...ds], cwd)
		.split("\n")
		.filter(Boolean);
}

function danhSach() {
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const ds = [];
	for (const slug of HO_SO) {
		const evals = parseEvals(
			readFileSync(join(GOC, "_acceptance", slug, "evals.yaml"), "utf8"),
			["executor", "cmd", "status"],
		);
		for (const e of evals) {
			if (!["test", "script"].includes(String(e.executor).trim())) continue;
			if (String(e.status ?? "").trim() === "not-run") continue;
			const ref = String(e.cmd ?? "")
				.trim()
				.replace(/^config:/, "");
			const lenh = resolveConfigKey(cauHinh, ref);
			if (typeof lenh !== "string" || lenh.trim() === "")
				throw new Error(`khong giai duoc ${slug}#${e.id} (${ref})`);
			ds.push({ ten: `${slug}#${e.id}`, lenh: lenh.trim() });
		}
	}
	ds.push({ ten: "okr-hoi-y.dom.tsx", lenh: LENH_BAI });
	return ds;
}

function chay(lenh, cwd, daChay) {
	if (daChay.has(lenh)) return daChay.get(lenh);
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	const ma = r.status ?? 2;
	daChay.set(lenh, ma);
	return ma;
}

function dungCayGoc() {
	const tam = mkdtempSync(join(tmpdir(), "gdl-khong-doi-"));
	const cay = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", cay, NHANH_GOC]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(cay, ".env"));
	execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: cay,
		stdio: "inherit",
	});
	execFileSync("bun", ["run", "db:generate"], {
		cwd: join(cay, "packages", "db"),
		stdio: "ignore",
	});
	return { tam, cay };
}

function donCay({ tam, cay }) {
	spawnSync("git", ["worktree", "remove", "--force", cay], { cwd: GOC });
	rmSync(tam, { recursive: true, force: true });
	spawnSync("git", ["worktree", "prune"], { cwd: GOC });
}

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "gdl-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const duong = join(sao, BAI);
		writeFileSync(duong, `${readFileSync(duong, "utf8")}\n`);
		git(["add", "--", BAI], sao);
		git(
			[
				"-c",
				"user.name=kiem-do-do",
				"-c",
				"user.email=kiem@do.do",
				"commit",
				"-q",
				"--no-verify",
				"-m",
				"test(gdl): chieu do tam",
			],
			sao,
		);
		const cham = chamCam(sao, NHANH_GOC);
		for (const t of cham) console.log(`DA SUA ${t}`);
		return cham.includes(BAI) ? MA_DO : 0;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

try {
	if (process.argv.includes("--chieu-do")) process.exit(chieuDo());
	let sai = 0;
	const cham = chamCam(GOC, NHANH_GOC);
	for (const t of cham) console.log(`SAI AC-9: DA SUA ${t}`);
	sai += cham.length;
	const ds = danhSach();
	console.log(`danh sach viet truoc: ${ds.length} muc`);
	const daChayCay = new Map();
	const cay = ds.map((m) => ({ ...m, ma: chay(m.lenh, GOC, daChayCay) }));
	const goc = dungCayGoc();
	try {
		const daChayNen = new Map();
		for (const m of cay) {
			const nen = chay(m.lenh, goc.cay, daChayNen);
			const xauHon = nen === 0 && m.ma !== 0;
			if (xauHon) sai += 1;
			console.log(
				`${xauHon ? "SAI AC-9: " : ""}HO SO ${m.ten}: nen ${nen} · cay ${m.ma}`,
			);
			if (nen !== 0) console.log(`DO SAN TREN NEN ${m.ten}`);
		}
	} finally {
		donCay(goc);
	}
	console.log(`KET LUAN khong-doi-hinh: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
