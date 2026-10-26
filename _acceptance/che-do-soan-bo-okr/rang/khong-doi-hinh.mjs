import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const require = createRequire(import.meta.url);
const { parseEvals } = require(join(GOC, "lib", "eval-yaml.cjs"));
const { resolveConfigKey } = require(join(GOC, "lib", "evidence-core.cjs"));

const HO_SO_NAY = "che-do-soan-bo-okr";
const DANH_SACH = [
	"gop-y-dung-cho",
	"kara-gop-y-luot-2",
	"gan-tay-va-kara-co-ly-do",
	"nen-kara",
	"muc-tieu-va-kr",
	"okr-to-chuc-va",
	"soan-okr-cung-tro-ly",
	"soan-okr-song-lai",
	"soan-okr-trong-khung",
	"khung-soan-chan-lien-ket",
	"mot-nut-tao-muc-tieu",
	"trang-bo-okr",
	"dieu-huong-khu-muc-tieu",
	"khung-okr-truoc-r1",
	"okr-soat-anh-luot-3",
	"trang-don-vi-mot-bang",
	"quyet-gop-y-noi-dung-ly-do",
];
const MAU =
	/data-vung-kara|VungKara|DeXuatNeo|data-de-xuat-neo|data-nhom-soan|NutSoan|Soạn cùng Kara|Thêm mục tiêu|data-cau-rong-bo/;
const NHANH_GOC = "origin/onehub";
const CHU_KHO = "Phan Le Manh";
const CON_TRO = `${HO_SO_NAY}#AC-7`;
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const EXECUTOR_MAY = new Set(["test", "script"]);
const NGUONG_TEP_CHUNG = 5;
const THUOC_THEO_VONG = {
	"trang-bo-okr#E15":
		"thuoc theo vong trang-bo-okr (AC-11): soat diff merge-base..HEAD cua nhanh dang chay roi chay lai lop cua VK3, phan 1/3 — tron lop do 5 gio 28",
	"trang-bo-okr#E17":
		"thuoc theo vong trang-bo-okr (AC-11): chay lai lop cua VK3, phan 2/3",
	"trang-bo-okr#E18":
		"thuoc theo vong trang-bo-okr (AC-11): chay lai lop cua VK3, phan 3/3",
	"muc-tieu-va-kr#E14":
		"thuoc chay thuoc: rang/ho-so-cham.mjs tu chay eval cua 14 ho so khac theo diff merge-base cua nhanh dang chay",
	"dieu-huong-khu-muc-tieu#E11":
		"thuoc theo vong dieu-huong-khu-muc-tieu (AC-9): rut tep kiem tu diff merge-base cua nhanh dang chay, tiem throw vao tep kiem tai cho",
	"trang-don-vi-mot-bang#E12":
		"thuoc theo vong trang-don-vi-mot-bang: rut tep kiem tu diff merge-base cua nhanh dang chay roi chay eval cua ho so khac",
};
const DONG_YAML_NGHI = /^ {4}(?:status: not-run|superseded_by: \S+)$/;
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx|sh)$/;
const TEP_TRONG_LENH = /[\w@./()[\]-]+\.(?:tsx|ts|mjs|cjs|js|sh)\b/g;
const NHAP_TUONG_DOI = /(?:from\s+|import\(\s*)["'](\.{1,2}\/[^"']+)["']/g;
const GOC_TEP = [
	"",
	"apps/app",
	"apps/api",
	"apps/agent",
	"apps/agent-okr",
	"packages/ui",
	"packages/validation",
	"packages/db",
];
const LA_BAI = /(^|\/)test\//;
const CHO_CHUOI = "«S»";
const PHUT_MS = 60_000;
const TRAN_LENH_MS = 40 * PHUT_MS;
const MA_DO = 1;
const MA_KHONG_DO = 2;
const ANH_XA = join(HERE, "anh-xa-nghi.json");
const CHIEU_DO_HO_SO = "gop-y-dung-cho";
const CHIEU_DO_LOT = "mot-nut-tao-muc-tieu";

const git = (args, cwd = GOC) =>
	execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	}).trim();

const laTep = (p) => existsSync(p) && statSync(p).isFile();

function trangThai(slug, cwd) {
	const hd = join(cwd, "_acceptance", slug, "contract.md");
	if (!existsSync(hd)) return null;
	return /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1] ?? null;
}

function hoSoDaKy(cwd) {
	return readdirSync(join(cwd, "_acceptance"), { withFileTypes: true })
		.filter((d) => d.isDirectory() && d.name !== HO_SO_NAY)
		.map((d) => d.name)
		.filter(
			(slug) =>
				TRANG_THAI_DA_KY.has(trangThai(slug, cwd) ?? "") &&
				existsSync(join(cwd, "_acceptance", slug, "evals.yaml")),
		)
		.sort();
}

const docEvals = (tho) =>
	parseEvals(tho, [
		"executor",
		"cmd",
		"status",
		"expected_exit",
		"superseded_by",
	]);

function evalsCua(slug, cwd) {
	return docEvals(
		readFileSync(join(cwd, "_acceptance", slug, "evals.yaml"), "utf8"),
	);
}

const chu = (v) => String(v ?? "").trim();
const nghi = (e) => chu(e.status) === "not-run";

function giaiLenh(cauHinh, e, ten) {
	const cmd = chu(e.cmd);
	if (!cmd.startsWith("config:")) return cmd;
	const ref = cmd.slice("config:".length);
	const lenh = chu(resolveConfigKey(cauHinh, ref));
	if (lenh === "" && EXECUTOR_MAY.has(chu(e.executor)) && !nghi(e))
		throw new Error(`khong giai duoc ${ten} (${ref})`);
	return lenh;
}

function tepCuaLenh(lenh, cwd) {
	const tep = new Set();
	for (const m of lenh.matchAll(TEP_TRONG_LENH)) {
		const t = m[0].replace(/^\.\//, "");
		const ung = GOC_TEP.map((g) => join(g, t)).find((x) => laTep(join(cwd, x)));
		if (!ung) continue;
		if (LA_BAI.test(ung)) tep.add(ung);
	}
	return tep;
}

function bongNhap(tep, cwd) {
	const hang = [...tep];
	while (hang.length > 0) {
		const t = hang.pop();
		for (const m of readFileSync(join(cwd, t), "utf8").matchAll(
			NHAP_TUONG_DOI,
		)) {
			const goc = join(dirname(t), m[1]);
			const ung = [goc, `${goc}.ts`, `${goc}.tsx`, `${goc}.mjs`].find((x) =>
				laTep(join(cwd, x)),
			);
			if (!ung || !LA_BAI.test(ung) || tep.has(ung)) continue;
			tep.add(ung);
			hang.push(ung);
		}
	}
	return tep;
}

function tepRang(slug, cwd) {
	const thuMuc = join(cwd, "_acceptance", slug, "rang");
	if (!existsSync(thuMuc)) return [];
	return readdirSync(thuMuc, { recursive: true })
		.map(String)
		.filter((f) => DUOI_MA.test(f))
		.map((f) => relative(cwd, join(thuMuc, f)));
}

function tepThuoc(slug, cwd, cauHinh, { caNghi }) {
	const bai = new Set();
	for (const e of evalsCua(slug, cwd)) {
		if (!caNghi && nghi(e)) continue;
		if (chu(e.cmd) === "") continue;
		for (const t of tepCuaLenh(giaiLenh(cauHinh, e, `${slug}#${e.id}`), cwd))
			bai.add(t);
	}
	return [...new Set([...tepRang(slug, cwd), ...bongNhap(bai, cwd)])];
}

function buocQuet(cwd, danhSach) {
	const cauHinh = readFileSync(join(cwd, "_acceptance", "config.yaml"), "utf8");
	const khop = hoSoDaKy(cwd).filter((slug) =>
		tepThuoc(slug, cwd, cauHinh, { caNghi: false }).some((t) =>
			MAU.test(readFileSync(join(cwd, t), "utf8")),
		),
	);
	const lot = khop.filter((s) => !danhSach.includes(s));
	const sai = lot.map((s) => `SAI AC-11: lot ${s}`);
	if (sai.length === 0)
		console.log(
			`QUET ${khop.length} khop, deu trong DANH SACH ${danhSach.length}: ${khop.join(", ")}`,
		);
	return sai;
}

function docAnhXa(cwd) {
	const tep = join(cwd, relative(GOC, ANH_XA));
	if (!existsSync(tep)) return [];
	const bang = JSON.parse(readFileSync(tep, "utf8"));
	if (!Array.isArray(bang)) throw new Error("anh-xa-nghi.json khong phai mang");
	return bang;
}

function evalsTaiGoc(slug, coSo, cwd) {
	const r = spawnSync(
		"git",
		["show", `${coSo}:_acceptance/${slug}/evals.yaml`],
		{ cwd, encoding: "utf8", maxBuffer: 64 << 20 },
	);
	return r.status === 0 ? docEvals(r.stdout) : [];
}

function buocNghi(cwd, coSo) {
	const sai = [];
	const bang = docAnhXa(cwd);
	const idMoi = new Set(evalsCua(HO_SO_NAY, cwd).map((e) => chu(e.id)));
	const nghiMoi = [];
	for (const slug of DANH_SACH) {
		const goc = new Map(
			evalsTaiGoc(slug, coSo, cwd).map((e) => [chu(e.id), e]),
		);
		for (const e of evalsCua(slug, cwd)) {
			const truoc = goc.get(chu(e.id));
			if (!nghi(e) || (truoc && nghi(truoc))) continue;
			const ten = `${slug}#${e.id}`;
			nghiMoi.push(ten);
			const sb = chu(e.superseded_by);
			if (sb === "") sai.push(`SAI AC-11: ${ten} nghi khong co chu`);
			else if (sb !== CON_TRO)
				sai.push(`SAI AC-11: ${ten} nghi tro ${sb}, khong phai ${CON_TRO}`);
			const dong = bang.filter((d) => d?.cu === ten);
			if (dong.length === 0)
				sai.push(`SAI AC-11: ${ten} nghi khong co trong anh-xa-nghi.json`);
			for (const d of dong)
				if (!idMoi.has(chu(d.moi)))
					sai.push(
						`SAI AC-11: ${ten} anh xa tro ${d.moi} khong co o ${HO_SO_NAY}`,
					);
		}
	}
	for (const d of bang)
		if (!nghiMoi.includes(d?.cu)) sai.push(`SAI AC-11: anh xa thua ${d?.cu}`);
	console.log(
		`eval nghi trong vong: ${nghiMoi.length} (${nghiMoi.join(", ")})`,
	);
	return sai;
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

function coDongFix(slug, tep, coSo, cwd) {
	const duong = `_acceptance/${slug}/decisions.jsonl`;
	const L = join(cwd, duong);
	if (!existsSync(L)) return false;
	const goc = spawnSync("git", ["show", `${coSo}:${duong}`], {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	const cu = new Set(goc.status === 0 ? goc.stdout.split("\n") : []);
	return readFileSync(L, "utf8")
		.split("\n")
		.filter((d) => d !== "" && !cu.has(d))
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

function khoiDoiChuoi(tep, k) {
	if (tep.endsWith("evals.yaml"))
		return k.bo.length === 0 && k.them.every((d) => DONG_YAML_NGHI.test(d));
	if (k.bo.length === 0 || k.them.length === 0) return false;
	return chuanHoa(k.bo.join("\n")) === chuanHoa(k.them.join("\n"));
}

function soatMotTep(tep, cacHoSo, soHoSoDung, coSo, cwd) {
	const diff = git(["diff", "-U0", coSo, "--", tep], cwd);
	if (diff === "") return [];
	const khoi = khoiDiff(diff);
	if (
		soHoSoDung >= NGUONG_TEP_CHUNG &&
		khoi.every((k) => k.bo.length === 0) &&
		!tep.startsWith("_acceptance/")
	) {
		for (const k of khoi) console.log(`THEM DANG KY ${tep}:${k.dong} ${k.mau}`);
		return [];
	}
	const sai = [];
	for (const k of khoi)
		if (!khoiDoiChuoi(tep, k))
			sai.push(
				`SAI AC-11: ${cacHoSo.join(",")}#${tep}:${k.dong} doi logic — ${k.mau}`,
			);
	for (const slug of cacHoSo)
		if (!coDongFix(slug, tep, coSo, cwd))
			sai.push(`SAI AC-11: ${slug}#${tep} thieu dong so fix decided_by`);
	if (sai.length === 0)
		console.log(
			`DOI THUOC ${tep}: ${khoi.length} khoi chi doi chuoi, so ${cacHoSo.join(",")} co dong fix`,
		);
	return sai;
}

function buocDoiThuoc(cwd, coSo) {
	const cauHinh = readFileSync(join(cwd, "_acceptance", "config.yaml"), "utf8");
	const doi = new Set(
		git(["diff", "--name-only", coSo], cwd).split("\n").filter(Boolean),
	);
	const dungBoi = new Map();
	for (const slug of hoSoDaKy(cwd))
		for (const e of evalsCua(slug, cwd)) {
			if (chu(e.cmd) === "") continue;
			for (const t of tepCuaLenh(giaiLenh(cauHinh, e, `${slug}#${e.id}`), cwd))
				dungBoi.set(t, new Set([...(dungBoi.get(t) ?? []), slug]));
		}
	const cuaHoSo = new Map();
	for (const slug of DANH_SACH)
		for (const t of [
			...tepThuoc(slug, cwd, cauHinh, { caNghi: true }),
			`_acceptance/${slug}/evals.yaml`,
		])
			cuaHoSo.set(t, [...new Set([...(cuaHoSo.get(t) ?? []), slug])]);
	return [...cuaHoSo]
		.filter(([t]) => doi.has(t))
		.flatMap(([t, cacHoSo]) =>
			soatMotTep(t, cacHoSo, dungBoi.get(t)?.size ?? 0, coSo, cwd),
		);
}

function evalMay(cauHinh) {
	return DANH_SACH.flatMap((slug) =>
		evalsCua(slug, GOC).flatMap((e) => {
			if (!EXECUTOR_MAY.has(chu(e.executor)) || nghi(e)) return [];
			const ten = `${slug}#${e.id}`;
			const lenh = giaiLenh(cauHinh, e, ten);
			const kyVong = Number(chu(e.expected_exit) || "0");
			if (!Number.isInteger(kyVong))
				throw new Error(`expected_exit khong phai so nguyen o ${ten}`);
			const evalRieng = /\bEVAL=/.test(lenh) ? chu(e.id) : null;
			return [
				{
					ten,
					slug,
					lenh,
					kyVong,
					evalRieng,
					khoa: evalRieng ? `${lenh}\u0000EVAL=${evalRieng}` : lenh,
				},
			];
		}),
	);
}

const tepBanHoSo = (cwd) =>
	git(
		[
			"status",
			"--porcelain",
			"--",
			...DANH_SACH.map((s) => `_acceptance/${s}`),
		],
		cwd,
	)
		.split("\n")
		.filter(Boolean)
		.map((d) => ({ ma: d.slice(0, 2), tep: d.slice(3) }));

function traLai(cwd, truoc) {
	const daBan = new Set(truoc.map((d) => d.tep));
	for (const { ma, tep } of tepBanHoSo(cwd)) {
		if (daBan.has(tep)) continue;
		if (ma === "??") rmSync(join(cwd, tep), { recursive: true, force: true });
		else git(["checkout", "--", tep], cwd);
		console.log(`TRA LAI ${tep} (lenh do ghi vao ho so da ky)`);
	}
}

function chayMotLan(muc, cwd) {
	const truoc = tepBanHoSo(cwd);
	const r = spawnSync("bash", ["-c", muc.lenh], {
		cwd,
		stdio: ["ignore", "ignore", "ignore"],
		timeout: TRAN_LENH_MS,
		killSignal: "SIGKILL",
		env: muc.evalRieng ? { ...process.env, EVAL: muc.evalRieng } : process.env,
	});
	traLai(cwd, truoc);
	return r.error ? MA_KHONG_DO : (r.status ?? MA_KHONG_DO);
}

function chay(muc, cwd, daChay) {
	if (daChay.has(muc.khoa)) return daChay.get(muc.khoa);
	let ma = chayMotLan(muc, cwd);
	if (ma === MA_KHONG_DO) {
		console.log(`THU LAI ${muc.ten}: lan dau ma ${MA_KHONG_DO}`);
		ma = chayMotLan(muc, cwd);
	}
	daChay.set(muc.khoa, ma);
	return ma;
}

function dungCay(dich) {
	const tam = mkdtempSync(join(tmpdir(), "vk10-khong-doi-"));
	const cay = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", cay, dich]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(cay, ".env"));
	for (const [buoc, thuMuc] of [
		[["install", "--frozen-lockfile", "--silent"], cay],
		[["run", "db:generate"], join(cay, "packages", "db")],
	]) {
		const r = spawnSync("bun", buoc, { cwd: thuMuc, stdio: "ignore" });
		if (r.status !== 0)
			throw new Error(`khong dung duoc cay nen: bun ${buoc.join(" ")}`);
	}
	return { tam, cay };
}

function donCay({ tam, cay }) {
	spawnSync("git", ["worktree", "remove", "--force", cay], { cwd: GOC });
	rmSync(tam, { recursive: true, force: true });
	spawnSync("git", ["worktree", "prune"], { cwd: GOC });
}

function buocChay(chi) {
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const tatCa = evalMay(cauHinh);
	const sai = [];
	for (const m of tatCa.filter((x) => THUOC_THEO_VONG[x.ten]))
		console.log(`THUOC THEO VONG ${m.ten}: ${THUOC_THEO_VONG[m.ten]}`);
	const muc = tatCa.filter(
		(x) => !THUOC_THEO_VONG[x.ten] && (!chi || chi.has(x.ten)),
	);
	console.log(
		`chay ${muc.length} eval qua ${new Set(muc.map((m) => m.khoa)).size} lenh rieng`,
	);
	const daChayCay = new Map();
	const hong = [];
	for (const m of muc) {
		const ma = chay(m, GOC, daChayCay);
		if (ma === m.kyVong) console.log(`HO SO ${m.ten}: cay ${ma}`);
		else hong.push({ ...m, ma });
	}
	if (hong.length === 0) return sai;
	const nen = dungCay(NHANH_GOC);
	try {
		const daChayNen = new Map();
		for (const m of hong) {
			const maNen = chay(m, nen.cay, daChayNen);
			if (maNen === m.kyVong)
				sai.push(`SAI AC-11: ${m.ten} cay ${m.ma} · nen ${maNen}`);
			else console.log(`DO SAN TREN NEN ${m.ten}: cay ${m.ma} · nen ${maNen}`);
		}
	} finally {
		donCay(nen);
	}
	return sai;
}

function inTheoHoSo(sai) {
	for (const slug of DANH_SACH) {
		const cua = sai.filter((s) =>
			new RegExp(`^SAI AC-11: (?:[\\w,-]*,)?${slug}[#,]`).test(s),
		);
		if (cua.length === 0) console.log(`GIU ${slug}`);
	}
	for (const s of sai) console.log(s);
}

function chieuDoNghi() {
	const tam = mkdtempSync(join(tmpdir(), "vk10-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const tep = join(sao, "_acceptance", CHIEU_DO_HO_SO, "evals.yaml");
		const tho = readFileSync(tep, "utf8");
		const muc = evalsCua(CHIEU_DO_HO_SO, sao).find(
			(e) => !nghi(e) && EXECUTOR_MAY.has(chu(e.executor)),
		);
		if (!muc)
			throw new Error(`chieu do: ${CHIEU_DO_HO_SO} khong con eval chay`);
		const dau = `  - id: ${muc.id}\n`;
		if (!tho.includes(dau))
			throw new Error(`chieu do: khong thay ${dau.trim()}`);
		writeFileSync(tep, tho.replace(dau, `${dau}    status: not-run\n`));
		const coSo = git(["merge-base", "HEAD", NHANH_GOC], sao);
		const ghim = `SAI AC-11: ${CHIEU_DO_HO_SO}#${muc.id} nghi khong co chu`;
		const sai = buocNghi(sao, coSo);
		for (const s of sai) console.log(s);
		const bat = sai.includes(ghim);
		console.log(
			`CHIEU DO nghi: ${bat ? "bat duoc" : "KHONG bat duoc"} «${ghim}»`,
		);
		return bat;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

function chieuDoLot() {
	const ghim = `SAI AC-11: lot ${CHIEU_DO_LOT}`;
	const sai = buocQuet(
		GOC,
		DANH_SACH.filter((s) => s !== CHIEU_DO_LOT),
	);
	for (const s of sai) console.log(s);
	const bat = sai.includes(ghim);
	console.log(`CHIEU DO lot: ${bat ? "bat duoc" : "KHONG bat duoc"} «${ghim}»`);
	return bat;
}

function chinh() {
	if (process.argv.includes("--chieu-do")) {
		const nghiBat = chieuDoNghi();
		const lotBat = chieuDoLot();
		console.log(
			`KET LUAN chieu do: ${nghiBat && lotBat ? "ca hai bat duoc" : "CO CHIEU KHONG BAT"}`,
		);
		return nghiBat && lotBat ? MA_DO : 0;
	}
	const coSo = git(["merge-base", "HEAD", NHANH_GOC]);
	console.log(`nen ${coSo.slice(0, 9)} (${NHANH_GOC})`);
	const sai = [
		...buocQuet(GOC, DANH_SACH),
		...buocNghi(GOC, coSo),
		...buocDoiThuoc(GOC, coSo),
	];
	if (!process.argv.includes("--chi-quet")) {
		const viTri = process.argv.indexOf("--chi");
		const chi =
			viTri < 0
				? null
				: new Set((process.argv[viTri + 1] ?? "").split(",").filter(Boolean));
		sai.push(...buocChay(chi));
	}
	inTheoHoSo(sai);
	console.log(
		`KET LUAN khong-doi-hinh: ${sai.length === 0 ? "dat" : `${sai.length} SAI`}`,
	);
	return sai.length === 0 ? 0 : MA_DO;
}

try {
	process.exit(chinh());
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
