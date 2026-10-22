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
	"khep-ky-okr",
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
const VIET_LAI = {
	"apps/app/test/okr-trang-don-vi.dom.tsx": { phep: "V1-20", so: "V1-20" },
	"_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs": {
		phep: "V1-20",
		so: "V1-20",
	},
	"_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs": {
		phep: "V1-21",
		so: "V1-21",
	},
	"_acceptance/khep-ky-okr/rang/man-khep-ky.mjs": {
		phep: "V1-21",
		so: "V1-21",
	},
	"_acceptance/vo-khu-muc-tieu/rang/do-man-dieu-huong.mjs": {
		phep: "he-qua-donOkr",
		so: "h.nhan",
	},
	"apps/app/test/okr-theo-don-vi.dom.tsx": { phep: "V1-22", so: "V1-22" },
	"apps/app/test/khung-cho-don-vi.dom.tsx": { phep: "V1-22", so: "V1-22" },
	"apps/app/test/okr-dau-trang-khu.dom.tsx": { phep: "V1-22", so: "V1-22" },
	"apps/app/test/okr-to-chuc-va.dom.tsx": { phep: "V1-22", so: "V1-22" },
};
const EXECUTOR_MAY = new Set(["test", "script"]);
const CHO_CHUOI = "\u00abS\u00bb";
const TRAN_LENH_MS = 30 * 60_000;
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
			if (!EXECUTOR_MAY.has(String(e.executor).trim())) continue;
			if (String(e.status ?? "").trim() === "not-run") continue;
			const ref = String(e.cmd ?? "")
				.trim()
				.replace(/^config:/, "");
			const lenh = String(resolveConfigKey(cauHinh, ref) ?? "").trim();
			if (lenh === "")
				throw new Error(`khong giai duoc ${slug}#${e.id} (${ref})`);
			const evalRieng = /\bEVAL=/.test(lenh) ? e.id : null;
			ds.push({
				ten: `${slug}#${e.id}`,
				lenh,
				evalRieng,
				khoa: evalRieng ? `${lenh}\u0000EVAL=${evalRieng}` : lenh,
			});
		}
	}
	return ds;
}

function chay(muc, cwd, daChay) {
	if (daChay.has(muc.khoa)) return daChay.get(muc.khoa);
	const r = spawnSync("bash", ["-c", muc.lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
		maxBuffer: 64 * 1024 * 1024,
		env: muc.evalRieng ? { ...process.env, EVAL: muc.evalRieng } : process.env,
	});
	const ma = r.status ?? MA_KHONG_DO;
	daChay.set(muc.khoa, ma);
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

function hetChuoi(ma, i, nhay) {
	for (let j = i + 1; j < ma.length; j += 1) {
		if (ma[j] === "\\") j += 1;
		else if (ma[j] === nhay) return j;
		else if (ma[j] === "\n") return -1;
	}
	return -1;
}

function hetNgoac(ma, i) {
	let sau = 1;
	for (let j = i; j < ma.length; j += 1) {
		const c = ma[j];
		if (c === "'" || c === '"') {
			const het = hetChuoi(ma, j, c);
			if (het < 0) return -1;
			j = het;
		} else if (c === "`") {
			const mau = docMau(ma, j);
			if (!mau) return -1;
			j = mau.het;
		} else if (c === "{") sau += 1;
		else if (c === "}") {
			sau -= 1;
			if (sau === 0) return j;
		}
	}
	return -1;
}

function docMau(ma, i) {
	const bieuThuc = [];
	for (let j = i + 1; j < ma.length; j += 1) {
		if (ma[j] === "\\") j += 1;
		else if (ma[j] === "`") return { het: j, bieuThuc };
		else if (ma[j] === "$" && ma[j + 1] === "{") {
			const dong = hetNgoac(ma, j + 2);
			if (dong < 0) return null;
			bieuThuc.push(chuanHoa(ma.slice(j + 2, dong)));
			j = dong;
		}
	}
	return null;
}

function chuanHoa(ma) {
	let ra = "";
	for (let i = 0; i < ma.length; i += 1) {
		const c = ma[i];
		if (c === "'" || c === '"') {
			const het = hetChuoi(ma, i, c);
			if (het >= 0) {
				ra += CHO_CHUOI;
				i = het;
				continue;
			}
		} else if (c === "`") {
			const mau = docMau(ma, i);
			if (mau) {
				ra += `${CHO_CHUOI}(${mau.bieuThuc.join(",")})`;
				i = mau.het;
				continue;
			}
		}
		ra += c;
	}
	return ra.replace(/\s+/g, "").replace(/,(?=[)\]}])/g, "");
}

function khoiDiff(diff) {
	return diff
		.split(/\n(?=@@)/)
		.filter((k) => k.startsWith("@@"))
		.map((k) => {
			const [dau, ...than] = k.split("\n");
			const so = dau.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
			const bo = than.filter((d) => d.startsWith("-")).map((d) => d.slice(1));
			const them = than.filter((d) => d.startsWith("+")).map((d) => d.slice(1));
			const dong = so ? (so[3] === "0" ? so[1] : so[2]) : "?";
			const mau = (them[0] ?? bo[0] ?? "").trim().slice(0, 80);
			return { dong, mau, bo, them };
		});
}

const chiDoiChuoi = (k) =>
	chuanHoa(k.bo.join("\n")) === chuanHoa(k.them.join("\n"));

function soatDoiThuoc(cwd) {
	const coSo = git(["merge-base", "HEAD", NHANH_GOC], cwd);
	const sai = [];
	for (const [tep, slug] of Object.entries(TEP_CUA_HO_SO)) {
		const diff = git(["diff", "-U0", `${coSo}...HEAD`, "--", tep], cwd);
		if (diff === "") continue;
		const viet = VIET_LAI[tep] ?? null;
		if (!soCoDongFix(slug, tep, viet?.so ?? null)) {
			sai.push(`SAI AC-11: THIEU SO ${slug}: ${tep}`);
			continue;
		}
		const khoi = khoiDiff(diff);
		const lech = khoi.filter((k) => !chiDoiChuoi(k));
		if (viet) {
			console.log(
				`VIET LAI ${tep} (${viet.phep}): ${lech.length} khoi doi logic, so ${slug} co dong fix nhac «${viet.so}»`,
			);
			for (const k of lech) console.log(`  khoi ${tep}:${k.dong} ${k.mau}`);
			continue;
		}
		for (const k of lech)
			sai.push(`SAI AC-11: DOI LOGIC ${tep}:${k.dong} ${k.mau}`);
		if (lech.length === 0)
			console.log(
				`DOI THUOC ${tep}: ${khoi.length} khoi doi chuoi, so ${slug} co dong fix`,
			);
	}
	return sai;
}

const TEP_CHIEU_DO = "apps/app/test/vo-khu-muc-tieu.dom.tsx";

function themDongLogic(ma) {
	const dong = ma.replace(/\n$/, "").split("\n");
	return {
		moi: `${dong.join("\n")}\nexport const doiLogicThu = 1 + 1;\n`,
		so: dong.length + 1,
	};
}

function tronVoiChuoi(ma) {
	const dong = ma.split("\n");
	const i = dong.findIndex((d) =>
		d.includes('q("[data-the-con-bo]") !== null'),
	);
	if (i < 0)
		throw new Error(
			`chieu do tron: khong thay dong cho the con o ${TEP_CHIEU_DO}`,
		);
	dong[i] = dong[i].replace(
		'q("[data-the-con-bo]") !== null',
		`q("[data-the-con-bo='bo']") !== null && true`,
	);
	return { moi: dong.join("\n"), so: i + 1 };
}

function chieuDo(kieu) {
	const tam = mkdtempSync(join(tmpdir(), "tbo-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const tep = TEP_CHIEU_DO;
		const duong = join(sao, tep);
		const doi = (kieu === "tron" ? tronVoiChuoi : themDongLogic)(
			readFileSync(duong, "utf8"),
		);
		writeFileSync(duong, doi.moi);
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
		const ghim = `SAI AC-11: DOI LOGIC ${tep}:${doi.so} `;
		const bat = sai.some((s) => s.startsWith(ghim));
		console.log(
			`CHIEU DO ${kieu}: ${bat ? "bat duoc" : "KHONG bat duoc"} ${tep}:${doi.so}`,
		);
		return bat ? MA_DO : 0;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

function chayTrenNen(hong) {
	if (hong.length === 0) return 0;
	let sai = 0;
	const goc = dungCay(NHANH_GOC);
	try {
		const daChayNen = new Map();
		for (const m of hong) {
			const nen = chay(m, goc.cay, daChayNen);
			const xauHon = nen === 0;
			if (xauHon) sai += 1;
			console.log(
				`${xauHon ? "SAI AC-11: " : ""}HO SO ${m.ten}: cay ${m.ma} · nen ${nen}`,
			);
			if (nen !== 0) console.log(`DO SAN TREN NEN ${m.ten}`);
		}
	} finally {
		donCay(goc);
	}
	return sai;
}

try {
	const viTri = process.argv.indexOf("--chieu-do");
	if (viTri >= 0)
		process.exit(chieuDo(process.argv[viTri + 1] === "tron" ? "tron" : "dong"));
	const saiSo = soatDoiThuoc(GOC);
	for (const s of saiSo) console.log(s);
	let sai = saiSo.length;
	const ds = danhSach();
	const lenhRieng = new Set(ds.map((m) => m.khoa)).size;
	console.log(
		`danh sach viet truoc: ${ds.length} muc test/script cua ${HO_SO.length} ho so, ${lenhRieng} lan chay rieng`,
	);
	const daChayCay = new Map();
	const hong = [];
	for (const m of ds) {
		const ma = chay(m, GOC, daChayCay);
		if (ma === 0) console.log(`HO SO ${m.ten}: cay 0`);
		else hong.push({ ...m, ma });
	}
	sai += chayTrenNen(hong);
	console.log(`KET LUAN khong-doi-hinh: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
