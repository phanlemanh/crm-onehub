import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
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
const MAU_DUONG = /hop-tuan|kr-sheet|okr-xem|theo-don-vi\/bang|cap-nhat-dong/;
const MAU_HEP =
	/hop-tuan|hopTuan|Họp tuần|xem=hop|nut-cap-nhat|cap-nhat-dong|thuTuKr/;
const LA_BAI_KIEM_CI = /^(?:apps|packages)\/[^/]+\/test\//;
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const HO_SO_NAY = "hop-tuan-tren-bang";
const DOI_CHUNG_LOP = "ngan-kr-mot-cho";
const THUOC_THEO_VONG = {
	"khung-khong-con-dung-chu#E5":
		"luat pham vi vong: git diff --quiet merge-base tren messages-guard.spec.ts cua vong khung-khong-con-dung-chu — nhanh nao dang ky chu moi cung do (chu kho V1-33 a)",
	"ve-sinh-do-san-onehub#E17":
		"soat diff merge-base..HEAD cua nhanh dang chay theo nhan vong ve-sinh-do-san-onehub (V1-25)",
	"tro-ly-okr-tom-tat#E17":
		"khong do duoc — eval goi model, AI Gateway het tien (MODEL_CALL_FAILED, V1-26)",
	"trang-bo-okr#E15":
		"thuoc theo vong trang-bo-okr (AC-11): soat diff merge-base..HEAD cua nhanh dang chay theo luat doi thuoc cua VK3 roi chay lai lop cua VK3, phan 1/3 — tron lop VK3 do 5 gio 28, long_running moi phan 200",
	"trang-bo-okr#E17":
		"thuoc theo vong trang-bo-okr (AC-11): chay lai lop cua VK3, phan 2/3",
	"trang-bo-okr#E18":
		"thuoc theo vong trang-bo-okr (AC-11): chay lai lop cua VK3, phan 3/3",
};
const LA_THUOC = /^_acceptance\/|\/test\//;
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx)$/;
const TEP_TRONG_LENH = /[\w@./()[\]-]+\.(?:tsx|ts|mjs|cjs|js)\b/g;
const EXECUTOR_MAY = new Set(["test", "script"]);
const TRAN_LENH_MS = 30 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;
const TEP_CHIEU_DO = "_acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs";

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function hoSoDaKy() {
	const goc = join(GOC, "_acceptance");
	return readdirSync(goc, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.filter((slug) => slug !== HO_SO_NAY)
		.filter((slug) => {
			const hd = join(goc, slug, "contract.md");
			if (!existsSync(hd) || !existsSync(join(goc, slug, "evals.yaml")))
				return false;
			const tt = /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1];
			return TRANG_THAI_DA_KY.has(tt ?? "");
		})
		.sort();
}

function tepCuaLenh(lenh) {
	const tep = new Set();
	for (const m of lenh.matchAll(TEP_TRONG_LENH)) {
		const t = m[0].replace(/^\.\//, "");
		const ung = [t, join("apps/app", t), join("apps/api", t)].find((x) =>
			existsSync(join(GOC, x)),
		);
		if (!ung) continue;
		tep.add(ung);
		if (!ung.includes("/rang/")) continue;
		const thuMuc = dirname(ung);
		for (const f of readdirSync(join(GOC, thuMuc)))
			if (DUOI_MA.test(f)) tep.add(join(thuMuc, f));
	}
	return [...tep];
}

function evalMayCua(slug, cauHinh) {
	const evals = parseEvals(
		readFileSync(join(GOC, "_acceptance", slug, "evals.yaml"), "utf8"),
		["executor", "cmd", "status", "expected_exit"],
	);
	return evals.flatMap((e) => {
		if (!EXECUTOR_MAY.has(String(e.executor).trim())) return [];
		if (String(e.status ?? "").trim() === "not-run") return [];
		const cmd = String(e.cmd ?? "").trim();
		const ref = cmd.replace(/^config:/, "");
		const lenh = String(
			cmd.startsWith("config:") ? (resolveConfigKey(cauHinh, ref) ?? "") : cmd,
		).trim();
		if (lenh === "")
			throw new Error(`khong giai duoc ${slug}#${e.id} (${ref})`);
		const kyVong = Number(String(e.expected_exit ?? "0").trim());
		if (!Number.isInteger(kyVong))
			throw new Error(`expected_exit khong phai so nguyen o ${slug}#${e.id}`);
		return [{ slug, id: e.id, lenh, kyVong, tep: tepCuaLenh(lenh) }];
	});
}

function tepVongSua(cwd = GOC) {
	const coSo = git(["merge-base", "HEAD", NHANH_GOC], cwd);
	return new Set(
		git(["diff", "--name-only", `${coSo}...HEAD`], cwd)
			.split("\n")
			.filter(Boolean),
	);
}

let lopDaQuet = null;

function quetLop() {
	if (lopDaQuet) return lopDaQuet;
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const chamCache = new Map();
	const cham = (t) => {
		if (!chamCache.has(t))
			chamCache.set(t, MAU_DUONG.test(readFileSync(join(GOC, t), "utf8")));
		return chamCache.get(t);
	};
	const doi = tepVongSua();
	const tepCua = new Map();
	const hoSo = hoSoDaKy();
	const tatCa = hoSo.flatMap((slug) => evalMayCua(slug, cauHinh));
	for (const e of tatCa)
		for (const t of e.tep)
			tepCua.set(t, [...new Set([...(tepCua.get(t) ?? []), e.slug])]);
	const loai = [];
	const muc = tatCa
		.filter((e) => e.tep.some((t) => doi.has(t) || cham(t)))
		.filter((e) => {
			const lyDo = THUOC_THEO_VONG[`${e.slug}#${e.id}`];
			if (lyDo) loai.push(`THUOC THEO VONG ${e.slug}#${e.id}: ${lyDo}`);
			return !lyDo;
		})
		.map((e) => {
			const evalRieng = /\bEVAL=/.test(e.lenh) ? e.id : null;
			return {
				ten: `${e.slug}#${e.id}`,
				ciPhu: e.tep.length > 0 && e.tep.every((t) => LA_BAI_KIEM_CI.test(t)),
				hep: e.tep.some((t) =>
					MAU_HEP.test(readFileSync(join(GOC, t), "utf8")),
				),
				lenh: e.lenh,
				evalRieng,
				kyVong: e.kyVong,
				khoa: evalRieng ? `${e.lenh}\u0000EVAL=${evalRieng}` : e.lenh,
			};
		});
	lopDaQuet = { hoSo, muc, tepCua, loai };
	return lopDaQuet;
}

function chayMotLan(muc, cwd) {
	const r = spawnSync("bash", ["-c", muc.lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
		maxBuffer: 64 * 1024 * 1024,
		env: muc.evalRieng ? { ...process.env, EVAL: muc.evalRieng } : process.env,
	});
	return r.status ?? MA_KHONG_DO;
}

function chay(muc, cwd, daChay) {
	if (daChay.has(muc.khoa)) return daChay.get(muc.khoa);
	let ma = chayMotLan(muc, cwd);
	if (ma === MA_KHONG_DO) {
		console.log(
			`THU LAI ${muc.khoa}: lan dau ma ${MA_KHONG_DO} (khong do duoc)`,
		);
		ma = chayMotLan(muc, cwd);
	}
	daChay.set(muc.khoa, ma);
	return ma;
}

function dungCay(dich) {
	const tam = mkdtempSync(join(tmpdir(), "htb-khong-doi-"));
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

function tepThuocDaKy(hoSo) {
	const daKy = new Set(hoSo);
	const ra = new Set(
		[...quetLop().tepCua].filter(([t]) => LA_THUOC.test(t)).map(([t]) => t),
	);
	return { daKy, ra };
}

const DAN_CHAM_TEP = /cham-tep V\d+-\d+/;

function coDongFixChamTep(cwd, slug, tep) {
	const L = join(cwd, "_acceptance", slug, "decisions.jsonl");
	if (!existsSync(L)) return false;
	return readFileSync(L, "utf8")
		.split("\n")
		.filter(Boolean)
		.some((d) => {
			try {
				const o = JSON.parse(d);
				return (
					o.type === "fix" &&
					String(o.decision).includes(tep) &&
					DAN_CHAM_TEP.test(
						`${o.decided_by ?? ""} ${o.why ?? ""} ${o.decision}`,
					)
				);
			} catch {
				return false;
			}
		});
}

function coTaiCoSo(cwd, coSo, tep) {
	return (
		spawnSync("git", ["cat-file", "-e", `${coSo}:${tep}`], { cwd }).status === 0
	);
}

function soatSuaThuoc(cwd) {
	const lop = quetLop();
	const { daKy, ra } = tepThuocDaKy(lop.hoSo);
	const coSo = git(["merge-base", "HEAD", NHANH_GOC], cwd);
	return [...tepVongSua(cwd)]
		.filter((t) => {
			const m = /^_acceptance\/([^/]+)\/(.+)$/.exec(t);
			const laThuoc =
				ra.has(t) ||
				(m !== null &&
					daKy.has(m[1]) &&
					(m[2].startsWith("rang/") || DUOI_MA.test(m[2])));
			if (!laThuoc || !coTaiCoSo(cwd, coSo, t)) return false;
			const chu = [
				...new Set([...(lop.tepCua.get(t) ?? []), ...(m ? [m[1]] : [])]),
			];
			return !chu.some((slug) => coDongFixChamTep(cwd, slug, t));
		})
		.sort()
		.map((t) => `SAI AC-10: SUA THUOC DA KY ${t}`);
}

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "htb-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const duong = join(sao, TEP_CHIEU_DO);
		writeFileSync(
			duong,
			`${readFileSync(duong, "utf8").replace(/\n$/, "")}\nexport const suaThu = 1 + 1;\n`,
		);
		git(["add", "--", TEP_CHIEU_DO], sao);
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
				"test(htb): chieu do tam",
			],
			sao,
		);
		const sai = soatSuaThuoc(sao);
		for (const s of sai) console.log(s);
		const ghim = `SAI AC-10: SUA THUOC DA KY ${TEP_CHIEU_DO}`;
		const bat = sai.includes(ghim);
		console.log(
			`CHIEU DO sua-thuoc: ${bat ? "bat duoc" : "KHONG bat duoc"} ${TEP_CHIEU_DO}`,
		);
		return bat ? MA_DO : 0;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

function datMa(ma, kyVong) {
	return ma === kyVong || ma === 0;
}

function chayTrenNen(hong) {
	if (hong.length === 0) return 0;
	let sai = 0;
	const goc = dungCay(NHANH_GOC);
	try {
		const daChayNen = new Map();
		for (const m of hong) {
			const nen = chay(m, goc.cay, daChayNen);
			const xauHon = datMa(nen, m.kyVong);
			if (xauHon) sai += 1;
			console.log(
				`${xauHon ? "SAI AC-10: " : ""}HO SO ${m.ten}: cay ${m.ma} · nen ${nen}`,
			);
			if (!xauHon) console.log(`DO SAN TREN NEN ${m.ten}`);
		}
	} finally {
		donCay(goc);
	}
	return sai;
}

function chonMuc(muc, chi, tronLop) {
	if (chi) return muc.filter((x) => chi.has(x.ten));
	if (tronLop) return muc;
	const ciPhu = muc.filter((m) => m.ciPhu);
	const ngoaiHep = muc.filter((m) => !m.ciPhu && !m.hep);
	for (const m of ciPhu) console.log(`CI PHU ${m.ten}`);
	for (const m of ngoaiHep) console.log(`NGOAI LOP HEP ${m.ten}`);
	const chon = muc.filter((m) => !m.ciPhu && m.hep);
	console.log(
		`loi b: ${ciPhu.length} eval CI phu, ${ngoaiHep.length} eval ngoai lop hep, chay tai cho ${chon.length} eval (${new Set(chon.map((m) => m.khoa)).size} lan chay rieng)`,
	);
	return chon;
}

function inQuet(lop) {
	for (const l of lop.loai) console.log(l);
	console.log(`quet lop: ${lop.hoSo.length} ho so, ${lop.muc.length} eval`);
	const hoSoCham = new Set(lop.muc.map((m) => m.ten.split("#")[0]));
	const lenhRieng = new Set(lop.muc.map((m) => m.khoa)).size;
	console.log(
		`lop cham: ${hoSoCham.size} ho so co thuoc hay bai kiem cham hop-tuan, kr-sheet, okr-xem, theo-don-vi/bang, cap-nhat-dong hay bi vong sua; ${lenhRieng} lan chay rieng`,
	);
	return hoSoCham.has(DOI_CHUNG_LOP);
}

try {
	if (process.argv.includes("--chieu-do")) process.exit(chieuDo());
	const saiSo = soatSuaThuoc(GOC);
	for (const s of saiSo) console.log(s);
	let sai = saiSo.length;
	const lop = quetLop();
	if (!inQuet(lop)) {
		console.log(`SAI AC-10: LOP THIEU ${DOI_CHUNG_LOP}`);
		process.exit(MA_KHONG_DO);
	}
	console.log(`DUNG doi chung lop: ${DOI_CHUNG_LOP} co trong lop`);
	if (process.argv.includes("--chi-quet")) {
		for (const m of lop.muc) console.log(`MUC ${m.ten}`);
		for (const m of chonMuc(lop.muc, null, process.argv.includes("--tron-lop")))
			console.log(`CHAY ${m.ten}`);
		process.exit(sai === 0 ? 0 : MA_DO);
	}
	const viTriChi = process.argv.indexOf("--chi");
	const chi =
		viTriChi < 0
			? null
			: new Set((process.argv[viTriChi + 1] ?? "").split(",").filter(Boolean));
	if (chi) {
		const coTen = new Set(lop.muc.map((m) => m.ten));
		const lac = [...chi].filter((ten) => !coTen.has(ten));
		if (chi.size === 0 || lac.length > 0)
			throw new Error(
				`--chi khong khop eval nao trong lop: ${chi.size === 0 ? "(rong)" : lac.join(",")}`,
			);
	}
	const chon = chonMuc(lop.muc, chi, process.argv.includes("--tron-lop"));
	const daChayCay = new Map();
	const hong = [];
	for (const m of chon) {
		const ma = chay(m, GOC, daChayCay);
		if (datMa(ma, m.kyVong))
			console.log(
				`HO SO ${m.ten}: cay ${ma}${ma === 0 ? "" : ` (dung ma da khai expected_exit ${m.kyVong})`}`,
			);
		else hong.push({ ...m, ma });
	}
	sai += chayTrenNen(hong);
	console.log(`KET LUAN khong-doi-hinh: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
