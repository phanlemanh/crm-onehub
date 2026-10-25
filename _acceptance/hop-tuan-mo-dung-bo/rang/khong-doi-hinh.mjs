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
const MAU_DUONG = /hop-tuan|okr\/bo-okr|okr\/theo-don-vi|thanh-ben-muc-tieu/;
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const NGUONG_TEP_CHUNG = 5;
const HO_SO_NAY = "hop-tuan-mo-dung-bo";
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
const LOP_DUOC_PHEP = [
	{
		ten: "trang-bo-okr E10: chuoi ky vong tieu de/duong cua ca xem-khong-don",
		tep: "_acceptance/trang-bo-okr/rang/man-bo-okr-do.mjs",
		ham: "export async function e10(",
		ca: '"xem-khong-don",',
		bo: "{tham:{[THAM.xem]:«S»},ten:n.tenGoc},",
		them: "{tham:{[THAM.xem]:«S»,[THAM.don]:«S»(n.pb.id)},ten:n.pb.name},",
	},
];
const EXECUTOR_MAY = new Set(["test", "script"]);
const CHO_CHUOI = "«S»";
const TRAN_LENH_MS = 30 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;
const TEP_CHIEU_DO = LOP_DUOC_PHEP[0].tep;
const SO_CHIEU_DO = "_acceptance/trang-bo-okr/decisions.jsonl";

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
				lenh: e.lenh,
				evalRieng,
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
	const tam = mkdtempSync(join(tmpdir(), "htmb-khong-doi-"));
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

function soCoDongFix(slug, tep, cwd) {
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
					o.decided_by === CHU_KHO &&
					String(o.decision).includes(tep)
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
			return { dong: Number(dong), mau, bo, them };
		});
}

function trongCa(dongMa, lop, dong) {
	const i = dong - 1;
	const dauHam = dongMa.findLastIndex(
		(d, j) => j <= i && d.startsWith("export "),
	);
	if (dauHam < 0 || !dongMa[dauHam].startsWith(lop.ham)) return false;
	const ca = dongMa.findLastIndex(
		(d, j) => j > dauHam && j <= i && /^\s*"[\w-]+",\s*$/.test(d),
	);
	return ca >= 0 && dongMa[ca].trim() === lop.ca;
}

function lopCuaKhoi(tep, k, dongMa) {
	return (
		LOP_DUOC_PHEP.find(
			(lop) =>
				lop.tep === tep &&
				chuanHoa(k.bo.join("\n")) === lop.bo &&
				chuanHoa(k.them.join("\n")) === lop.them &&
				trongCa(dongMa, lop, k.dong),
		) ?? null
	);
}

function soatMotTep(tep, cacHoSo, coSo, cwd) {
	const diff = git(["diff", "-U0", `${coSo}...HEAD`, "--", tep], cwd);
	if (diff === "") return [];
	const khoi = khoiDiff(diff);
	if (
		cacHoSo.length >= NGUONG_TEP_CHUNG &&
		khoi.every((k) => k.bo.length === 0)
	) {
		for (const k of khoi) console.log(`THEM DANG KY ${tep}:${k.dong} ${k.mau}`);
		return [];
	}
	const slug = cacHoSo.find((h) => soCoDongFix(h, tep, cwd));
	if (!slug) return [`SAI AC-10: THIEU SO ${tep} (ho so ${cacHoSo.join(",")})`];
	const dongMa = existsSync(join(cwd, tep))
		? readFileSync(join(cwd, tep), "utf8").split("\n")
		: [];
	const sai = [];
	for (const k of khoi) {
		const lop = lopCuaKhoi(tep, k, dongMa);
		if (lop) console.log(`DOI THUOC ${tep}:${k.dong} thuoc lop «${lop.ten}»`);
		else sai.push(`SAI AC-10: DOI LOGIC ${tep}:${k.dong} ${k.mau}`);
	}
	if (sai.length === 0)
		console.log(
			`DOI THUOC ${tep}: ${khoi.length} khoi deu thuoc lop khai truoc, so ${slug} co dong fix`,
		);
	return sai;
}

function soatDoiThuoc(cwd) {
	const coSo = git(["merge-base", "HEAD", NHANH_GOC], cwd);
	const doi = tepVongSua(cwd);
	return [...quetLop().tepCua]
		.filter(([tep]) => LA_THUOC.test(tep) && doi.has(tep))
		.flatMap(([tep, cacHoSo]) => soatMotTep(tep, cacHoSo, coSo, cwd));
}

function themDongLogic(sao) {
	const duong = join(sao, TEP_CHIEU_DO);
	const dong = readFileSync(duong, "utf8").replace(/\n$/, "").split("\n");
	writeFileSync(
		duong,
		`${dong.join("\n")}\nexport const doiLogicThu = 1 + 1;\n`,
	);
	return {
		ghim: `SAI AC-10: DOI LOGIC ${TEP_CHIEU_DO}:${dong.length + 1} `,
		viTri: `${TEP_CHIEU_DO}:${dong.length + 1}`,
	};
}

function xoaDongSo(sao) {
	const duong = join(sao, SO_CHIEU_DO);
	const dong = readFileSync(duong, "utf8").split("\n");
	const con = dong.filter((d) => {
		try {
			const o = JSON.parse(d);
			return !(
				o.type === "fix" &&
				o.decided_by === CHU_KHO &&
				String(o.decision).includes(TEP_CHIEU_DO)
			);
		} catch {
			return true;
		}
	});
	if (con.length === dong.length)
		throw new Error(`chieu do so: khong thay dong fix nhac ${TEP_CHIEU_DO}`);
	writeFileSync(duong, con.join("\n"));
	return {
		ghim: `SAI AC-10: THIEU SO ${TEP_CHIEU_DO}`,
		viTri: TEP_CHIEU_DO,
	};
}

function chieuDo(kieu) {
	const tam = mkdtempSync(join(tmpdir(), "htmb-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const doi = (kieu === "so" ? xoaDongSo : themDongLogic)(sao);
		git(["add", "--", SO_CHIEU_DO, TEP_CHIEU_DO], sao);
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
				"test(htmb): chieu do tam",
			],
			sao,
		);
		const sai = soatDoiThuoc(sao);
		for (const s of sai) console.log(s);
		const bat = sai.some((s) => s.startsWith(doi.ghim));
		console.log(
			`CHIEU DO ${kieu}: ${bat ? "bat duoc" : "KHONG bat duoc"} ${doi.viTri}`,
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
				`${xauHon ? "SAI AC-10: " : ""}HO SO ${m.ten}: cay ${m.ma} · nen ${nen}`,
			);
			if (nen !== 0) console.log(`DO SAN TREN NEN ${m.ten}`);
		}
	} finally {
		donCay(goc);
	}
	return sai;
}

function inQuet(lop) {
	for (const l of lop.loai) console.log(l);
	console.log(`quet lop: ${lop.hoSo.length} ho so, ${lop.muc.length} eval`);
	const hoSoCham = new Set(lop.muc.map((m) => m.ten.split("#")[0]));
	const lenhRieng = new Set(lop.muc.map((m) => m.khoa)).size;
	console.log(
		`lop cham: ${hoSoCham.size} ho so co thuoc hay bai kiem cham hop-tuan, /okr/bo-okr, theo-don-vi, thanh ben khu Muc tieu hay bi vong sua; ${lenhRieng} lan chay rieng`,
	);
}

try {
	const viTri = process.argv.indexOf("--chieu-do");
	if (viTri >= 0)
		process.exit(chieuDo(process.argv[viTri + 1] === "so" ? "so" : "dong"));
	const saiSo = soatDoiThuoc(GOC);
	for (const s of saiSo) console.log(s);
	let sai = saiSo.length;
	const lop = quetLop();
	inQuet(lop);
	if (process.argv.includes("--chi-quet")) {
		for (const m of lop.muc) console.log(`MUC ${m.ten}`);
		process.exit(sai === 0 ? 0 : MA_DO);
	}
	const daChayCay = new Map();
	const hong = [];
	for (const m of lop.muc) {
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
