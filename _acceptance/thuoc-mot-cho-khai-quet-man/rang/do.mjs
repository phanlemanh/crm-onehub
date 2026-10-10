import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const SLUG = "thuoc-mot-cho-khai-quet-man";
const RANG_K2B = "_acceptance/soan-okr-khong-lac/rang";
const BAN_CU = "d089cb8da";
const MONG = {
	agent: "apps/agent-okr/agent",
	"khu-soan": "apps/app/app/(app)/[slug]/okr/soan",
	validation: "packages/validation/src",
};
const LOP = Object.keys(MONG);
const DONG_XANH = "mot-nguon: KET_QUA_NOP 1 cho, agent + app dung chung";
const THEM = 'export const T = ["da-ghi", "tu-choi"] as const;\n';
const NHA = path.join(ROOT, ".acceptance-runs", SLUG);
const CHE_DO = ["lanh", "khai-trung", "goc-rong", "mot-cho", "k2b-giu", "ranh-gioi"];

const che = process.argv[2];
const tuThu = process.argv.includes("--tu-thu");
if (!CHE_DO.includes(che)) {
	console.log(`KHONG DO DUOC: che do «${che}» khong co; dung ${CHE_DO.join(" | ")} [--tu-thu]`);
	process.exit(2);
}

let sai = 0;
const bao = (dong) => {
	sai += 1;
	console.log(dong);
};

function moiTruong() {
	const env = { ...process.env };
	for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
	return env;
}

const CHAY = { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruong() };
const git = (args) => execFileSync("git", args, CHAY);
const ketQua = (r) => ({ ma: r.status, ra: `${r.stdout}${r.stderr}` });
const vo = (lenh) => ketQua(spawnSync("bash", ["-c", lenh], CHAY));
const chayBun = (tep) => ketQua(spawnSync("bun", [tep], CHAY));

function lenhCauHinh(khoa) {
	const cfg = Bun.YAML.parse(fs.readFileSync(path.join(ROOT, "_acceptance/config.yaml"), "utf8"));
	const lenh = cfg.executors?.script?.[khoa];
	if (!lenh) {
		console.log(`KHONG DO DUOC: thieu executors.script.${khoa} trong _acceptance/config.yaml`);
		process.exit(2);
	}
	return lenh;
}

function tepTs(thuMuc) {
	if (!fs.existsSync(thuMuc)) return [];
	return fs
		.readdirSync(thuMuc, { recursive: true, withFileTypes: true })
		.filter((d) => d.isFile() && /\.tsx?$/.test(d.name))
		.map((d) => path.join(d.parentPath ?? d.path, d.name))
		.sort();
}

const demGit = (goc) =>
	git(["ls-files", "--", `:(literal)${goc}/`])
		.split("\n")
		.filter((t) => /\.tsx?$/.test(t)).length;

function vanTay() {
	const h = createHash("sha256");
	for (const goc of Object.values(MONG))
		for (const t of tepTs(path.join(ROOT, goc))) h.update(t).update(fs.readFileSync(t));
	h.update(git(["status", "--porcelain"]));
	return h.digest("hex");
}

function dungCay(ten, ban, sua) {
	const goc = path.join(NHA, ten);
	fs.rmSync(goc, { recursive: true, force: true });
	try {
		for (const g of Object.values(MONG))
			fs.cpSync(path.join(ROOT, g), path.join(goc, g), { recursive: true });
		for (const g of ["apps/agent-okr", "packages/validation"]) {
			fs.symlinkSync(path.join(ROOT, g, "node_modules"), path.join(goc, g, "node_modules"));
			fs.copyFileSync(path.join(ROOT, g, "package.json"), path.join(goc, g, "package.json"));
		}
		const rang = path.join(goc, RANG_K2B);
		fs.mkdirSync(rang, { recursive: true });
		for (const t of ["mot-nguon.mjs", "chung.mjs"]) {
			const noi =
				ban === "cu"
					? git(["show", `${BAN_CU}:${RANG_K2B}/${t}`])
					: fs.readFileSync(path.join(ROOT, RANG_K2B, t), "utf8");
			fs.writeFileSync(path.join(rang, t), noi);
		}
		sua?.(goc);
		return chayBun(path.join(rang, "mot-nguon.mjs"));
	} finally {
		fs.rmSync(goc, { recursive: true, force: true });
	}
}

function doiChungCu() {
	const r = dungCay("cu-lanh", "cu");
	if (r.ma !== 0 || !r.ra.includes(DONG_XANH)) {
		console.log(`KHONG DO DUOC: ban ${BAN_CU} thoat ${r.ma} tren cay lanh\n${r.ra}`);
		process.exit(2);
	}
}

const themVao = (l) => (goc) => fs.writeFileSync(path.join(goc, MONG[l], "them.ts"), THEM);

const lamRong = (l) => (goc) => {
	const t = path.join(goc, MONG[l]);
	fs.rmSync(t, { recursive: true, force: true });
	fs.mkdirSync(t, { recursive: true });
};

function docDem(ra) {
	const m = /quet: agent (\d+) · khu-soan (\d+) · validation (\d+)/.exec(ra);
	return m ? { agent: Number(m[1]), "khu-soan": Number(m[2]), validation: Number(m[3]) } : null;
}

function globSangRe(mau) {
	let re = "";
	for (let i = 0; i < mau.length; i += 1) {
		const c = mau[i];
		if (c === "*" && mau[i + 1] === "*") {
			re += ".*";
			i += 1;
		} else if (c === "*") re += "[^/]*";
		else re += c.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(`^${re}$`);
}

async function lanh() {
	const { GOC_QUET } = await import(path.join(ROOT, RANG_K2B, "chung.mjs"));
	if (JSON.stringify(GOC_QUET) !== JSON.stringify(MONG))
		bao(`lanh: GOC_QUET lech ${JSON.stringify(GOC_QUET)}`);
	const r = tuThu
		? dungCay("lanh-thieu", "moi", (goc) =>
				fs.rmSync(tepTs(path.join(goc, MONG["khu-soan"])).find((t) => t.endsWith(".tsx"))),
			)
		: vo(lenhCauHinh("k2b_mot_nguon"));
	const dem = docDem(r.ra);
	if (!dem) bao("lanh: khong doc duoc dong dem «quet:»");
	else
		for (const l of LOP) {
			const g = demGit(MONG[l]);
			if (dem[l] !== g || g === 0) bao(`lanh: ${l} khong khop (${dem[l]} / ${g})`);
		}
	if (!tuThu && (r.ma !== 0 || !r.ra.includes(DONG_XANH))) bao(`lanh: mot-nguon thoat ${r.ma}`);
	if (!sai) console.log(`lanh: ${LOP.map((l) => `${l} ${dem[l]}=${demGit(MONG[l])}`).join(" · ")}`);
}

function khaiTrung() {
	const truoc = vanTay();
	doiChungCu();
	const ban = tuThu ? "cu" : "moi";
	let bat = 0;
	for (const l of LOP) {
		const r = dungCay(`khai-${l}`, ban, themVao(l));
		const dung =
			r.ma === 1 && r.ra.includes("tap ket qua khai 2 cho:") && r.ra.includes(`${MONG[l]}/them.ts`);
		if (dung) bat += 1;
		else bao(`khai-trung: ${l} khong bi bat (thoat ${r.ma})`);
	}
	if (!tuThu) {
		const cu = dungCay("cu-khu-soan", "cu", themVao("khu-soan"));
		if (cu.ma !== 0) bao(`khai-trung: ban cu khong tai hien loi (thoat ${cu.ma})`);
	}
	if (vanTay() !== truoc) bao("khai-trung: tep that doi sau luot");
	if (!sai)
		console.log(
			`khai-trung: ${bat}/${LOP.length} lop bi bat; ban cu bo lot khu-soan, ban moi bat; tep that nguyen`,
		);
}

function gocRong() {
	const truoc = vanTay();
	if (tuThu) doiChungCu();
	const ca = tuThu ? ["khu-soan"] : LOP;
	let bat = 0;
	for (const l of ca) {
		const r = dungCay(`rong-${l}`, tuThu ? "cu" : "moi", lamRong(l));
		const dung =
			r.ma === 1 &&
			r.ra.includes(`goc quet rong: ${l}`) &&
			!r.ra.includes(DONG_XANH) &&
			!r.ra.includes("Cannot find module");
		if (dung) bat += 1;
		else bao(`goc-rong: ${l} khong bi bat (thoat ${r.ma})`);
	}
	if (vanTay() !== truoc) bao("goc-rong: tep that doi sau luot");
	if (!sai) console.log(`goc-rong: ${bat}/${ca.length} goc rong bi bat; tep that nguyen`);
}

function motCho() {
	const thuMuc = path.join(ROOT, RANG_K2B);
	const tep = new Map(
		fs
			.readdirSync(thuMuc)
			.filter((t) => t.endsWith(".mjs"))
			.sort()
			.map((t) => [t, fs.readFileSync(path.join(thuMuc, t), "utf8")]),
	);
	if (tuThu) {
		tep.set("gia.mjs", `const A = "${MONG["khu-soan"]}";\nconst B = fs.glob("x");\n`);
		tep.set("mot-nguon.mjs", `${tep.get("mot-nguon.mjs")}\nconst C = "packages/validation/src/**/*.ts";\n`);
	}
	const coSoan = [...tep].flatMap(([t, s]) => Array(s.split(MONG["khu-soan"]).length - 1).fill(t));
	if (coSoan.length !== 1 || coSoan[0] !== "chung.mjs")
		bao(`duong khu soan khai ${coSoan.length} cho: ${coSoan.join(", ")}`);
	for (const [l, g] of Object.entries(MONG))
		if (tep.get("mot-nguon.mjs")?.includes(g)) bao(`mot-nguon khai goc ${l}`);
	const nhapGlob = /import\s*\{[^}]*\bglob\b[^}]*\}\s*from\s*["']node:fs(?:\/promises)?["']/;
	for (const [t, s] of tep) if (/\bglob\s*\(/.test(s) || nhapGlob.test(s)) bao(`glob o ${t}`);
	if (!sai) console.log("mot-cho: duong khu soan 1 cho (chung.mjs), mot-nguon khong khai goc, khong glob");
}

function k2bGiu() {
	const lenh = lenhCauHinh("k2b_mot_nguon");
	const dong = tuThu ? "mot-nguon: KHONG CO" : DONG_XANH;
	const lanhRa = vo(lenh);
	const doRa = vo(`${lenh} --ban-sao them-tap`);
	if (lanhRa.ma !== 0 || !lanhRa.ra.includes(dong)) bao(`k2b-giu: lanh thieu dong (thoat ${lanhRa.ma})`);
	if (doRa.ma !== 1 || !doRa.ra.includes("tap ket qua khai 2 cho"))
		bao(`k2b-giu: them-tap khong do (thoat ${doRa.ma})`);
	if (!sai) console.log("k2b-giu: E7 cua K2b chay nhu da ky");
}

function ranhGioi() {
	const { globs } = JSON.parse(fs.readFileSync(path.join(HERE, "ranh-gioi.json"), "utf8"));
	const mau = globs.map(globSangRe);
	const nen = git(["merge-base", "HEAD", "origin/onehub"]).trim();
	let tu = nen;
	let den = "HEAD";
	if (nen === git(["rev-parse", "HEAD"]).trim()) {
		const gop = git([
			"log",
			"origin/onehub",
			"--first-parent",
			"--reverse",
			"--format=%H",
			"--",
			`_acceptance/${SLUG}/contract.md`,
		])
			.split("\n")
			.filter(Boolean)[0];
		if (!gop) {
			console.log("KHONG DO DUOC: khong tim thay merge dua ho so len onehub");
			process.exit(2);
		}
		tu = `${gop}^1`;
		den = gop;
	}
	const tep = git(["diff", "--name-only", tu, den]).split("\n").filter(Boolean);
	let cfg = git(["diff", "-U0", tu, den, "--", "_acceptance/config.yaml"]).split("\n");
	if (tuThu) {
		tep.push("apps/api/src/okr/okr.router.ts");
		cfg = [...cfg, "-    k2b_man: x"];
	}
	for (const t of tep) if (!mau.some((r) => r.test(t))) bao(`ngoai ranh: ${t}`);
	if (cfg.some((d) => d.startsWith("-") && !d.startsWith("---"))) bao("config bot dong");
	if (!sai) console.log(`ranh-gioi: ${tep.length} tep trong ranh, config chi them`);
}

const VIEC = {
	lanh,
	"khai-trung": khaiTrung,
	"goc-rong": gocRong,
	"mot-cho": motCho,
	"k2b-giu": k2bGiu,
	"ranh-gioi": ranhGioi,
};
await VIEC[che]();
console.log(`KET LUAN: ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
process.exit(sai ? 1 : 0);
