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
const CHU_KHO = "Phan Le Manh";
const HO_SO = [
	"trang-don-vi-mot-bang",
	"ux-lai-thu-8c-okr",
	"vo-khu-muc-tieu",
	"khung-cho-don-vi-mot-hinh",
	"khung-man-chung",
	"dieu-huong-khu-muc-tieu",
	"khung-okr-truoc-r1",
	"okr-to-chuc-va",
];
const TEP_CUA_HO_SO = {
	"apps/app/test/okr-trang-don-vi.dom.tsx": "trang-don-vi-mot-bang",
	"apps/app/test/okr-theo-don-vi.dom.tsx": "ux-lai-thu-8c-okr",
	"apps/app/test/vo-khu-muc-tieu.dom.tsx": "vo-khu-muc-tieu",
	"apps/app/test/khung-cho-don-vi.dom.tsx": "khung-cho-don-vi-mot-hinh",
	"apps/app/test/okr-dau-trang-khu.dom.tsx": "dieu-huong-khu-muc-tieu",
	"apps/app/test/khung-okr-truoc-r1.dom.tsx": "khung-okr-truoc-r1",
	"apps/app/test/okr-to-chuc-va.dom.tsx": "okr-to-chuc-va",
	"_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs":
		"trang-don-vi-mot-bang",
	"_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs":
		"trang-don-vi-mot-bang",
	"_acceptance/khep-ky-okr/rang/man-khep-ky.mjs": "khep-ky-okr",
	"_acceptance/vo-khu-muc-tieu/rang/do-man-dieu-huong.mjs": "vo-khu-muc-tieu",
};
const VIET_LAI_V1_20 = new Set([
	"apps/app/test/okr-trang-don-vi.dom.tsx",
	"_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs",
]);
const KHUON_DOI_CHUOI =
	/donOkr|data-the-con-bo|data-view-switch|aria-current|theBo|okrVoKhuMessages|SO_NUT_HANG_CONG_CU|coCham|doiXem|xem=|the con trang don vi|chuyen kieu xem trang don vi|bo-okr|data-the|view-switch/;
const TRAN_LENH_MS = 15 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function danhSach() {
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const ds = [];
	for (const slug of HO_SO) {
		const evals = parseEvals(
			readFileSync(join(GOC, "_acceptance", slug, "evals.yaml"), "utf8"),
			["executor", "cmd", "status"],
		);
		for (const e of evals) {
			if (String(e.executor).trim() !== "test") continue;
			if (String(e.status ?? "").trim() === "not-run") continue;
			const ref = String(e.cmd ?? "")
				.trim()
				.replace(/^config:/, "");
			const lenh = String(resolveConfigKey(cauHinh, ref) ?? "").trim();
			if (lenh === "")
				throw new Error(`khong giai duoc ${slug}#${e.id} (${ref})`);
			ds.push({ ten: `${slug}#${e.id}`, lenh });
		}
	}
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
	const ma = r.status ?? MA_KHONG_DO;
	daChay.set(lenh, ma);
	return ma;
}

function dungCay(dich) {
	const tam = mkdtempSync(join(tmpdir(), "tbo-khong-doi-"));
	const cay = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", cay, dich]);
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

function soCoDongFix(slug, tep, phai) {
	const L = join(GOC, "_acceptance", slug, "decisions.jsonl");
	if (!existsSync(L)) return false;
	return readFileSync(L, "utf8")
		.split("\n")
		.filter(Boolean)
		.some((d) => {
			try {
				const o = JSON.parse(d);
				return (
					o.type === "fix" &&
					o.decided_by === CHU_KHO &&
					String(o.decision).includes(tep) &&
					(!phai || String(o.decision).includes(phai))
				);
			} catch {
				return false;
			}
		});
}

function soatDoiThuoc(cwd) {
	const coSo = git(["merge-base", "HEAD", NHANH_GOC], cwd);
	const sai = [];
	for (const [tep, slug] of Object.entries(TEP_CUA_HO_SO)) {
		const diff = git(["diff", "-U0", `${coSo}...HEAD`, "--", tep], cwd);
		if (diff === "") continue;
		const vietLai = VIET_LAI_V1_20.has(tep);
		if (!soCoDongFix(slug, tep, vietLai ? "V1-20" : null)) {
			sai.push(`SAI AC-11: THIEU SO ${slug}: ${tep}`);
			continue;
		}
		if (vietLai) {
			console.log(
				`DOI THUOC ${tep}: viet lai theo V1-20, so ${slug} co dong fix`,
			);
			continue;
		}
		const khoi = diff
			.split(/\n(?=@@)/)
			.filter((k) => k.startsWith("@@"))
			.map((k) =>
				k
					.split("\n")
					.slice(1)
					.filter((d) => /^[+-]/.test(d))
					.map((d) => d.slice(1))
					.join("\n"),
			);
		const lech = khoi.filter((k) => !KHUON_DOI_CHUOI.test(k));
		for (const k of lech)
			sai.push(
				`SAI AC-11: DOI LOGIC ${tep}:${k.split("\n")[0].trim().slice(0, 80)}`,
			);
		if (lech.length === 0)
			console.log(
				`DOI THUOC ${tep}: ${khoi.length} khoi doi chuoi, so ${slug} co dong fix`,
			);
	}
	return sai;
}

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "tbo-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const tep = "apps/app/test/vo-khu-muc-tieu.dom.tsx";
		const duong = join(sao, tep);
		writeFileSync(
			duong,
			`${readFileSync(duong, "utf8")}\nexport const doiLogicThu = 1 + 1;\n`,
		);
		git(["add", "--", tep], sao);
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
				"test(tbo): chieu do tam",
			],
			sao,
		);
		const sai = soatDoiThuoc(sao);
		for (const s of sai) console.log(s);
		return sai.some((s) => s.startsWith("SAI AC-11: DOI LOGIC")) ? MA_DO : 0;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

try {
	if (process.argv.includes("--chieu-do")) process.exit(chieuDo());
	const saiSo = soatDoiThuoc(GOC);
	for (const s of saiSo) console.log(s);
	let sai = saiSo.length;
	const ds = danhSach();
	console.log(
		`danh sach viet truoc: ${ds.length} muc test cua ${HO_SO.length} ho so`,
	);
	const daChayCay = new Map();
	const cay = ds.map((m) => ({ ...m, ma: chay(m.lenh, GOC, daChayCay) }));
	const goc = dungCay(NHANH_GOC);
	try {
		const daChayNen = new Map();
		for (const m of cay) {
			const nen = chay(m.lenh, goc.cay, daChayNen);
			const xauHon = nen === 0 && m.ma !== 0;
			if (xauHon) sai += 1;
			console.log(
				`${xauHon ? "SAI AC-11: " : ""}HO SO ${m.ten}: nen ${nen} · cay ${m.ma}`,
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
