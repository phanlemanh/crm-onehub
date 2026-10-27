import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
const MAU_DUONG =
	/okr\/bo-okr|okr\/theo-don-vi|TheoDonVi|data-mo-dong|expandRow|[?&]expand=|data-the-con-bo/;
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const NGUONG_TEP_CHUNG = 5;
const HO_SO_NAY = "bo-okr-co-so";
const THUOC_THEO_VONG = {};
const LA_THUOC = /^_acceptance\/|\/test\//;
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx)$/;
const TEP_TRONG_LENH = /[\w@./()[\]-]+\.(?:tsx|ts|mjs|cjs|js)\b/g;
const DOI_CHUNG_DUONG = [
	"_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs",
	"apps/app/test/okr-trang-don-vi.dom.tsx",
];
const TEP_TAY = {
	"apps/app/test/okr-trang-don-vi.dom.tsx": "trang-don-vi-mot-bang",
	"apps/app/test/okr-theo-don-vi.dom.tsx": "ux-lai-thu-8c-okr",
	"apps/app/test/muc-tieu-va-kr.dom.tsx": "muc-tieu-va-kr",
	"_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs":
		"trang-don-vi-mot-bang",
	"_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs":
		"trang-don-vi-mot-bang",
	"_acceptance/dat-okr-trong-crm/rang/man-okr.mjs": "dat-okr-trong-crm",
	"_acceptance/okr-to-chuc-va/rang/man-okr.mjs": "okr-to-chuc-va",
	"_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs":
		"khung-cho-don-vi-mot-hinh",
};
const PHEP = "Hỏi-1";
const BAN_DUYET = {
	"apps/app/test/okr-trang-don-vi.dom.tsx": {
		lop: "lớp 1, 3",
		bam: "bf97b48750fa6384c9dbb996e1cc974cfaf0b74c6249bdfe5022f2fc06f7946e",
	},
	"apps/app/test/okr-theo-don-vi.dom.tsx": {
		lop: "lớp 2, 4",
		bam: "5686da4c2e5eec6ee7e9eef8727c24111687afd6635ea06865a646d7f76b7c4f",
	},
	"apps/app/test/muc-tieu-va-kr.dom.tsx": {
		lop: "lớp 1",
		bam: "448520d405ef2300852c267f8ac5ea94c2fcdb2b026681da58c5147ea6067963",
	},
	"_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs": {
		lop: "lớp 1, 2",
		bam: "d346a7a1d20fb5aa5f8027cd3c16b3c2d7f553345525b66e3ad68507c61c2dbe",
	},
	"_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs": {
		lop: "lớp 4",
		bam: "9da14f12a18b54b77c1bf8abca1085cc080ebf85906ecd42f47466f204e6d6bb",
	},
	"_acceptance/dat-okr-trong-crm/rang/man-okr.mjs": {
		lop: "lớp 1",
		bam: "e0ed36374c6afbd7a3796b5db8121a0a08343f436f3cf5d1f748197810df7a6b",
	},
	"_acceptance/okr-to-chuc-va/rang/man-okr.mjs": {
		lop: "lớp 1",
		bam: "fb90e2162ab659dff758715b6cb1abe859b300d11794b731785953957d1b4f1c",
	},
	"_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs": {
		lop: "lớp 2, 4",
		bam: "718ee1feb057b13c1b6dbfd62bbe1b7379e1ed5a152788c0b4f159267cac685b",
	},
};
const EXECUTOR_QUET = new Set(["test", "script", "ui-check"]);
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

function evalMayCua(slug, cauHinh, cho = EXECUTOR_MAY) {
	const evals = parseEvals(
		readFileSync(join(GOC, "_acceptance", slug, "evals.yaml"), "utf8"),
		["executor", "cmd", "status"],
	);
	return evals.flatMap((e) => {
		if (!cho.has(String(e.executor).trim())) return [];
		if (String(e.status ?? "").trim() === "not-run") return [];
		const lenh = giaiLenh(cauHinh, slug, e);
		return [{ slug, id: e.id, lenh, tep: tepCuaLenh(lenh) }];
	});
}

function giaiLenh(cauHinh, slug, e) {
	const cmd = String(e.cmd ?? "").trim();
	if (!cmd.startsWith("config:")) {
		if (cmd === "") throw new Error(`khong giai duoc ${slug}#${e.id} (rong)`);
		return cmd;
	}
	const ref = cmd.replace(/^config:/, "");
	const lenh = String(resolveConfigKey(cauHinh, ref) ?? "").trim();
	if (lenh === "") throw new Error(`khong giai duoc ${slug}#${e.id} (${ref})`);
	return lenh;
}

function tuKiemLenh() {
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const ra = [];
	const viet = evalMayCua("cap-nhat-tuan-okr", cauHinh).find(
		(m) => m.id === "E14",
	);
	ra.push(
		viet?.lenh.includes("tien-de.mjs")
			? "DUNG viet-thang: cap-nhat-tuan-okr#E14 giai thanh lenh nguyen van"
			: `SAI viet-thang: ${viet?.lenh ?? "khong co E14"}`,
	);
	try {
		giaiLenh(cauHinh, "gia", { id: "E0", cmd: "config:executors.khong.co" });
		ra.push("SAI khoa-sai: khoa config khong co ma van giai duoc");
	} catch (loi) {
		ra.push(`DUNG khoa-sai: van nem «${loi.message}»`);
	}
	for (const d of ra) console.log(d);
	return ra.every((d) => d.startsWith("DUNG")) ? 0 : MA_DO;
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
	const tepCua = new Map();
	const hoSo = hoSoDaKy();
	const tatCa = hoSo.flatMap((slug) => evalMayCua(slug, cauHinh));
	const deQuet = hoSo.flatMap((slug) =>
		evalMayCua(slug, cauHinh, EXECUTOR_QUET),
	);
	for (const e of deQuet)
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
	lopDaQuet = { hoSo, muc, tepCua, loai, doi };
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
	const tam = mkdtempSync(join(tmpdir(), "bco-thuoc-da-ky-"));
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
	const lop = quetLop();
	for (const t of DOI_CHUNG_DUONG)
		if (
			!lop.tepCua.has(t) ||
			!lop.muc.some((m) => m.lenh.includes(t.split("/").pop()))
		)
			sai.push(`SAI AC-9 quet: thieu ${t}`);
	const thuocDoi = [];
	for (const [tep, cacHoSo] of lop.tepCua) {
		if (!LA_THUOC.test(tep)) continue;
		const diff = git(["diff", "-U0", `${coSo}...HEAD`, "--", tep], cwd);
		if (diff === "") continue;
		const tatCa = khoiDiff(diff);
		if (
			cacHoSo.length >= NGUONG_TEP_CHUNG &&
			tatCa.every((k) => k.bo.length === 0)
		) {
			for (const k of tatCa)
				console.log(`THEM DANG KY ${tep}:${k.dong} ${k.mau}`);
			continue;
		}
		thuocDoi.push(tep);
		const slug = cacHoSo.find((h) => soCoDongFix(h, tep, PHEP));
		if (!slug) {
			sai.push(
				`SAI AC-9 ${tep}: thieu dong so fix «${PHEP}» decided_by chu kho (${cacHoSo.join(",")})`,
			);
			continue;
		}
		const duyet = BAN_DUYET[tep];
		const bam = bamDiff(tatCa);
		if (!duyet || duyet.bam !== bam) {
			const dau = tatCa.find((k) => !chiDoiChuoi(k)) ?? tatCa[0];
			sai.push(
				`SAI AC-9 ${tep}: doi ngoai lop cho phep (bam ${bam.slice(0, 12)} ${duyet ? `khac ban duyet ${duyet.bam.slice(0, 12)}` : "chua co ban duyet"}; dong ${dau?.dong}: ${dau?.mau})`,
			);
			continue;
		}
		console.log(
			`DOI THUOC ${tep}: ${tatCa.length} khoi dung ban duyet (${duyet.lop}), so ${slug} co dong fix`,
		);
	}
	sai.push(...soTay(thuocDoi, Object.keys(TEP_TAY)));
	return sai;
}

function bamDiff(khoi) {
	const noiDung = khoi
		.map((k) =>
			[...k.bo.map((d) => `-${d}`), ...k.them.map((d) => `+${d}`)].join("\n"),
		)
		.join("\n@@\n");
	return createHash("sha256").update(noiDung).digest("hex");
}

function soTay(quet, tay) {
	const loi = [];
	for (const t of quet)
		if (!tay.includes(t))
			loi.push(`SAI AC-9 quet: ${t} lech (quet co, tay khong)`);
	for (const t of tay)
		if (!quet.includes(t))
			loi.push(`SAI AC-9 quet: ${t} lech (tay co, quet khong)`);
	return loi;
}

const TEP_CHIEU_DO = "apps/app/test/okr-trang-don-vi.dom.tsx";

function themDongLogic(ma) {
	const dong = ma.replace(/\n$/, "").split("\n");
	return {
		moi: `${dong.join("\n")}\nexport const doiLogicThu = 1 + 2;\n`,
		so: dong.length + 1,
	};
}

function doiKhangDinh(ma) {
	const cu = "phai(soKr === 3,";
	if (ma.split(cu).length !== 2)
		throw new Error(
			`chieu do doi-khang-dinh: khong thay «${cu}» o ${TEP_CHIEU_DO}`,
		);
	const so = ma.slice(0, ma.indexOf(cu)).split("\n").length;
	return { moi: ma.replace(cu, "phai(soKr === 4,"), so };
}

function chieuDoTayThieu() {
	const lop = quetLop();
	const thuocDoi = [...lop.tepCua.keys()].filter(
		(t) => LA_THUOC.test(t) && Object.hasOwn(TEP_TAY, t) && lop.doi.has(t),
	);
	const bo = "apps/app/test/muc-tieu-va-kr.dom.tsx";
	const loi = soTay(
		thuocDoi,
		Object.keys(TEP_TAY).filter((t) => t !== bo),
	);
	for (const l of loi) console.log(l);
	const ghim = `SAI AC-9 quet: ${bo} lech (quet co, tay khong)`;
	const bat = loi.includes(ghim);
	console.log(
		`CHIEU DO tay-thieu: ${bat ? "bat duoc" : "KHONG bat duoc"} ${bo}`,
	);
	return bat ? MA_DO : 0;
}

function chieuDo(kieu) {
	const tam = mkdtempSync(join(tmpdir(), "bco-thuoc-da-ky-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const tep = TEP_CHIEU_DO;
		const duong = join(sao, tep);
		const doi = (kieu === "doi-khang-dinh" ? doiKhangDinh : themDongLogic)(
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
				"test(bco): chieu do tam",
			],
			sao,
		);
		const sai = soatDoiThuoc(sao);
		for (const s of sai) console.log(s);
		const ghim = `SAI AC-9 ${tep}: doi ngoai lop cho phep`;
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
				`${xauHon ? "SAI AC-9: " : ""}HO SO ${m.ten}: cay ${m.ma} · nen ${nen}`,
			);
			if (nen !== 0) console.log(`DO SAN TREN NEN ${m.ten}`);
		}
	} finally {
		donCay(goc);
	}
	return sai;
}

try {
	if (process.argv.includes("--tu-kiem-lenh")) process.exit(tuKiemLenh());
	const viTri = process.argv.indexOf("--chieu-do");
	if (viTri >= 0)
		process.exit(
			process.argv[viTri + 1] === "tay-thieu"
				? chieuDoTayThieu()
				: chieuDo(
						process.argv[viTri + 1] === "doi-khang-dinh"
							? "doi-khang-dinh"
							: "dong",
					),
		);
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
		`quet lop: ${lop.hoSo.length} ho so da ky, ${hoSoCham.size} ho so co thuoc cham bang muc tieu hay khung trang mot bo, hay bi vong sua, ${ds.length} eval may cham, ${lenhRieng} lan chay rieng`,
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
	console.log(`KET LUAN thuoc-da-ky: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
