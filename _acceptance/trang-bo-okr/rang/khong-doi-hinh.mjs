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
const CHU_KHO = "Phan Le Manh";
const MAU_DUONG = /okr\/bo-okr|okr\/theo-don-vi|data-view-switch|ViewSwitch/;
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const NGUONG_TEP_CHUNG = 5;
const HO_SO_NAY = "trang-bo-okr";
const THUOC_THEO_VONG = {
	"ve-sinh-do-san-onehub#E17":
		"soat diff merge-base..HEAD cua nhanh dang chay theo nhan vong ve-sinh-do-san-onehub (V1-25)",
	"tro-ly-okr-tom-tat#E17":
		"khong do duoc — eval goi model, AI Gateway het tien (MODEL_CALL_FAILED, V1-26)",
};
const LA_THUOC = /^_acceptance\/|\/test\//;
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx)$/;
const TEP_TRONG_LENH = /[\w@./()[\]-]+\.(?:tsx|ts|mjs|cjs|js)\b/g;
const TEP_TAY = {
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
	"_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs":
		"khung-cho-don-vi-mot-hinh",
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
	"apps/app/test/mot-nut-tao-muc-tieu.dom.tsx": { phep: "V1-26", so: "V1-26" },
};
const EXECUTOR_MAY = new Set(["test", "script"]);
const CHO_CHUOI = "\u00abS\u00bb";
const TRAN_LENH_MS = 30 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;

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
		["executor", "cmd", "status"],
	);
	return evals.flatMap((e) => {
		if (!EXECUTOR_MAY.has(String(e.executor).trim())) return [];
		if (String(e.status ?? "").trim() === "not-run") return [];
		const ref = String(e.cmd ?? "")
			.trim()
			.replace(/^config:/, "");
		const lenh = String(resolveConfigKey(cauHinh, ref) ?? "").trim();
		if (lenh === "")
			throw new Error(`khong giai duoc ${slug}#${e.id} (${ref})`);
		return [{ slug, id: e.id, lenh, tep: tepCuaLenh(lenh) }];
	});
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
	const coSo = git(["merge-base", "HEAD", NHANH_GOC]);
	const doi = new Set(
		git(["diff", "--name-only", `${coSo}...HEAD`])
			.split("\n")
			.filter(Boolean),
	);
	const tepCua = new Map(Object.entries(TEP_TAY).map(([t, s]) => [t, [s]]));
	const hoSo = hoSoDaKy();
	const tatCa = hoSo.flatMap((slug) => evalMayCua(slug, cauHinh));
	for (const e of tatCa)
		for (const t of e.tep)
			tepCua.set(t, [...new Set([...(tepCua.get(t) ?? []), e.slug])]);
	const doiRieng = (t) =>
		doi.has(t) && (tepCua.get(t)?.length ?? 0) < NGUONG_TEP_CHUNG;
	const loai = [];
	const muc = tatCa
		.filter((e) => e.tep.some((t) => doiRieng(t) || cham(t)))
		.filter((e) => {
			const lyDo = THUOC_THEO_VONG[`${e.slug}#${e.id}`];
			if (lyDo) loai.push(`THUOC THEO VONG ${e.slug}#${e.id}: ${lyDo}`);
			return !lyDo;
		})
		.map((e) => {
			const evalRieng = /\bEVAL=/.test(e.lenh) ? e.id : null;
			return {
				ten: `${e.slug}#${e.id}`,
				lenh: e.lenh,
				evalRieng,
				khoa: evalRieng ? `${e.lenh}\u0000EVAL=${evalRieng}` : e.lenh,
			};
		});
	lopDaQuet = { hoSo, muc, tepCua, loai };
	return lopDaQuet;
}

function docPhan(argv) {
	const i = argv.indexOf("--phan");
	if (i < 0) return { k: 1, n: 1 };
	const m = /^(\d+)\/(\d+)$/.exec(argv[i + 1] ?? "");
	const k = Number(m?.[1]);
	const n = Number(m?.[2]);
	if (!m || k < 1 || k > n) throw new Error(`--phan sai: ${argv[i + 1]}`);
	return { k, n };
}

function chiaPhan(ds, { k, n }) {
	if (n === 1) return ds;
	const khoa = [...new Set(ds.map((m) => m.khoa))].sort();
	const nang = khoa.filter((x) => /tien-de|mot-luot\.sh/.test(x));
	const nhe = khoa.filter((x) => !/tien-de|mot-luot\.sh/.test(x));
	const cua = new Set([...nang, ...nhe].filter((_, i) => i % n === k - 1));
	return ds.filter((m) => cua.has(m.khoa));
}

function danhSach() {
	return quetLop().muc;
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
	for (const [tep, cacHoSo] of quetLop().tepCua) {
		if (!LA_THUOC.test(tep)) continue;
		const diff = git(["diff", "-U0", `${coSo}...HEAD`, "--", tep], cwd);
		if (diff === "") continue;
		const viet = VIET_LAI[tep] ?? null;
		const tatCa = khoiDiff(diff);
		if (
			!viet &&
			cacHoSo.length >= NGUONG_TEP_CHUNG &&
			tatCa.every((k) => k.bo.length === 0)
		) {
			for (const k of tatCa)
				console.log(`THEM DANG KY ${tep}:${k.dong} ${k.mau}`);
			continue;
		}
		const slug = cacHoSo.find((h) => soCoDongFix(h, tep, viet?.so ?? null));
		if (!slug) {
			sai.push(`SAI AC-11: THIEU SO ${cacHoSo.join(",")}: ${tep}`);
			continue;
		}
		const khoi = tatCa;
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
	const phan = docPhan(process.argv);
	const saiSo = phan.k === 1 ? soatDoiThuoc(GOC) : [];
	for (const s of saiSo) console.log(s);
	let sai = saiSo.length;
	const ds = chiaPhan(danhSach(), phan);
	console.log(`phan ${phan.k}/${phan.n}`);
	const lenhRieng = new Set(ds.map((m) => m.khoa)).size;
	const lop = quetLop();
	for (const l of lop.loai) console.log(l);
	const hoSoCham = new Set(ds.map((m) => m.ten.split("#")[0]));
	console.log(
		`quet lop: ${lop.hoSo.length} ho so da ky, ${hoSoCham.size} ho so co thuoc cham /okr/bo-okr, theo-don-vi, o chuyen kieu xem hay bi vong sua, ${ds.length} eval may cham, ${lenhRieng} lan chay rieng`,
	);
	if (process.argv.includes("--chi-quet")) {
		for (const m of ds) console.log(`MUC ${m.ten}`);
		process.exit(sai === 0 ? 0 : MA_DO);
	}
	const daChayCay = new Map();
	const hong = [];
	const banSao = phan.n > 1 ? dungCay("HEAD") : null;
	try {
		for (const m of ds) {
			const ma = chay(m, banSao?.cay ?? GOC, daChayCay);
			if (ma === 0) console.log(`HO SO ${m.ten}: cay 0`);
			else hong.push({ ...m, ma });
		}
	} finally {
		if (banSao) donCay(banSao);
	}
	sai += chayTrenNen(hong);
	console.log(`KET LUAN khong-doi-hinh: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
