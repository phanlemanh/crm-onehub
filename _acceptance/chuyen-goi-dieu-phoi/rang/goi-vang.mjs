import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative, sep } from "node:path";
import { GOC, Ket, khongDoDuoc, moiTruongSach, thuMucTam } from "./chung.mjs";
import { BIEN, giaiGoi } from "./goi.mjs";

const { taoKho } = await import(join(GOC, "scripts", "kiem-cheo", "test", "kho-gia.mjs"));
const { KIEM_CHEO } = await import(join(GOC, "scripts", "kiem-cheo", "cau-hinh.mjs"));
const KQ = KIEM_CHEO.ketQua;
const LENH_CAI = "claude plugin install dieu-phoi@acceptance-gate-kit";
const ket = new Ket();
const goi = giaiGoi();
const tamDon = [];
const pidNgu = [];
const tam = (ten) => {
	const d = thuMucTam(ten);
	tamDon.push(d);
	return d;
};

const giai = readFileSync(join(GOC, "scripts", "resolve-plugin.mjs"), "utf8");
if (!giai.includes("os.homedir()") || /process\.env\b/.test(giai)) khongDoDuoc("resolve-plugin.mjs khong con chi doc HOME qua os.homedir()");
console.log("HOME la bien duy nhat resolve-plugin.mjs doc de tim ban cai");

const LAN = `import { writeFileSync } from "node:fs";
writeFileSync(process.env.KCS_DAU_LAN, "chay\\n");
process.stdout.write(JSON.stringify({ suites: [{ cmd: "true", exit: 0 }], slugs: { ky: { evals_exit: { E1: 0 }, lech: [] } } }));
`;

function dungKho() {
	const kho = taoKho();
	tamDon.push(kho.tam);
	kho.hoSo("ky", { paths: ["a.txt"] });
	kho.git("add", "-A");
	kho.git("commit", "-q", "-m", "ho so");
	kho.git("push", "-q", "origin", "onehub");
	const T = kho.sha();
	const D = kho.gop({ "a.txt": "b" });
	const thuMuc = join(kho.goc, KIEM_CHEO.thuMuc);
	mkdirSync(thuMuc, { recursive: true });
	writeFileSync(join(thuMuc, KIEM_CHEO.tep.moc), `${JSON.stringify({ sha: T, luc: new Date().toISOString() })}\n`);
	return { kho, thuMuc, D };
}

const bam = (p) => (existsSync(p) ? createHash("sha256").update(readFileSync(p)).digest("hex") : "vang");

function dotSong(goc) {
	const dot = join(goc, ".acceptance-runs", "dieu-phoi-thu");
	mkdirSync(join(dot, "xin"), { recursive: true });
	mkdirSync(join(dot, "khoa"), { recursive: true });
	const ngu = spawn("node", ["-e", "setTimeout(() => {}, 600000)"], { detached: true, stdio: "ignore" });
	ngu.unref();
	pidNgu.push(ngu.pid);
	writeFileSync(join(dot, "phat-lich.pid"), String(ngu.pid));
	symlinkSync(dot, join(goc, ".acceptance-runs", "dieu-phoi-hien-tai"));
	return dot;
}

function chayLuot(dem, { bien, home, coDot = false, tranMs = 120_000 }) {
	const { kho, thuMuc, D } = dungKho();
	const dot = coDot ? dotSong(kho.goc) : null;
	const tamLuot = tam("luot");
	const dauLan = join(tamLuot, "lan.txt");
	const dauBao = join(tamLuot, "bao.txt");
	const lan = join(tamLuot, "lan.mjs");
	writeFileSync(lan, LAN);
	const mocTep = join(thuMuc, KIEM_CHEO.tep.moc);
	const truoc = bam(mocTep);
	const env = moiTruongSach({
		KIEM_CHEO_LAN: lan,
		KIEM_CHEO_DUNG_CAY: "true",
		KIEM_CHEO_THONG_BAO: `printf 'bao\\n' >> '${dauBao}'`,
		KCS_DAU_LAN: dauLan,
	});
	if (home) env.HOME = home;
	if (bien === undefined) delete env[BIEN];
	else env[BIEN] = bien;
	const r = spawnSync("node", [dem, "--goc", kho.goc], { encoding: "utf8", env, timeout: tranMs });
	const ngay = existsSync(thuMuc) ? readdirSync(thuMuc).filter((t) => /^\d{4}-\d{2}-\d{2}\.json$/.test(t)) : [];
	const ket_ = ngay.length ? JSON.parse(readFileSync(join(thuMuc, ngay.at(-1)), "utf8")) : null;
	const moc = existsSync(mocTep) ? JSON.parse(readFileSync(mocTep, "utf8")) : null;
	const xin = dot && existsSync(join(dot, "xin")) ? readdirSync(join(dot, "xin")) : [];
	return { ma: r.status, ra: `${r.stdout}${r.stderr}`, ket: ket_, dauLan: existsSync(dauLan), dauBao: existsSync(dauBao), mocGiu: bam(mocTep) === truoc, moc, xin, D };
}

function vang(dem, ca, tuyChon) {
	const r = chayLuot(dem, { ...tuyChon, coDot: true });
	const doDs = [];
	if (r.xin.length) doDs.push(`DO co-don-xin ${ca}: ${r.xin.join(",")}`);
	if (r.ket?.ket_qua !== KQ.khongChayDuoc) doDs.push(`DO goi-vang-im ${ca} ket_qua=${r.ket?.ket_qua ?? "khong tep ngay"}`);
	else {
		if (!String(r.ket.ly_do).includes("dieu-phoi") || !String(r.ket.ly_do).includes(LENH_CAI)) doDs.push(`DO thieu-lenh-cai ${ca}: ${r.ket.ly_do}`);
		if (!r.dauBao) doDs.push(`DO khong-bao ${ca}`);
		if (r.dauLan) doDs.push(`DO lan-van-chay ${ca}`);
		if (!r.mocGiu) doDs.push(`DO moc-doi ${ca}`);
	}
	return doDs;
}

function daCai(dem, ca, home) {
	const r = chayLuot(dem, { bien: undefined, home });
	const doDs = [];
	if (r.ket?.ket_qua !== KQ.xanh) doDs.push(`DO khong-dot ${ca} ket_qua=${r.ket?.ket_qua ?? "-"} ly_do=${r.ket?.ly_do ?? ""}`);
	if (!r.dauLan) doDs.push(`DO lan-khong-chay ${ca}`);
	if (r.moc?.sha !== r.D) doDs.push(`DO moc-khong-tien ${ca}`);
	return doDs;
}

function homeCoBanCai() {
	const fl = spawnSync("node", [join(GOC, "scripts", "resolve-plugin.mjs"), "--plugin", "feature-loop", "--json"], { encoding: "utf8" });
	if (fl.status !== 0) khongDoDuoc("khong giai duoc feature-loop da cai de rut bo cuc cai");
	const { root, version } = JSON.parse(fl.stdout);
	const tuong = relative(homedir(), root).split(sep);
	const iGoi = tuong.lastIndexOf("feature-loop");
	if (iGoi < 0 || tuong[iGoi + 1] !== version) khongDoDuoc(`bo cuc cai feature-loop la: ${root}`);
	const ban = JSON.parse(readFileSync(join(goi.goc, ".claude-plugin", "plugin.json"), "utf8")).version;
	tuong[iGoi] = "dieu-phoi";
	tuong[iGoi + 1] = ban;
	const home = tam("home-cai");
	cpSync(goi.goc, join(home, ...tuong), { recursive: true });
	console.log(`ban cai gia: ~/${tuong.join("/")} (rut tu ~/${relative(homedir(), root)})`);
	return home;
}

function banSao(ten, sua) {
	const goc = tam(`kc-${ten}`);
	const kc = join(goc, "scripts", "kiem-cheo");
	cpSync(join(GOC, "scripts", "kiem-cheo"), kc, { recursive: true });
	cpSync(join(GOC, "scripts", "resolve-plugin.mjs"), join(goc, "scripts", "resolve-plugin.mjs"));
	cpSync(join(GOC, "lib"), join(goc, "lib"), { recursive: true });
	const p = join(kc, ten.endsWith("goi") ? "goi-dieu-phoi.mjs" : "dem.mjs");
	const truoc = readFileSync(p, "utf8");
	const sau = sua(truoc);
	if (sau === truoc) khongDoDuoc(`ban sao ${ten} khong doi gi`);
	writeFileSync(p, sau);
	return join(kc, "dem.mjs");
}

const DEM = join(GOC, "scripts", "kiem-cheo", "dem.mjs");
try {
	const a = vang(DEM, "bien-rong", { bien: tam("goi-rong") });
	ket.kiem(a.length === 0, "bien-rong: khong-chay-duoc, neu lenh cai, bao nguoi, khong lan, khong don, moc giu", a.join(" | "));
	const b = vang(DEM, "khong-ban-cai", { bien: undefined, home: tam("home-rong") });
	ket.kiem(b.length === 0, "khong-ban-cai: khong-chay-duoc, neu lenh cai, bao nguoi, khong lan, khong don, moc giu", b.join(" | "));
	const homeCai = homeCoBanCai();
	const c = daCai(DEM, "da-cai-khong-dot", homeCai);
	ket.kiem(c.length === 0, "da-cai-khong-dot: xanh, lan chay, moc tien", c.join(" | "));
	const that = spawnSync("node", [join(GOC, "scripts", "resolve-plugin.mjs"), "--plugin", "dieu-phoi", "--require", "scripts/dot.mjs"], { encoding: "utf8" });
	if (that.status === 0) {
		const d = daCai(DEM, "ban-cai-that", undefined);
		ket.kiem(d.length === 0, "ban-cai-that", d.join(" | "));
	} else console.log("bo (d): goi chua cai — do o luot ghim lai sau cai");

	const demIm = banSao("im", (x) => x.replace("\tif (loiGoi) {\n", "\tif (false) {\n"));
	const demTuTim = banSao("tu-tim", (x) =>
		x.replace(
			"\tif (loiGoi) {\n",
			'\tif (loiGoi) {\n\t\tgoi = {\n\t\t\ttimThuMucDot: (g) => {\n\t\t\t\ttry {\n\t\t\t\t\treturn nodeFs.realpathSync(join(g, ".acceptance-runs", "dieu-phoi-hien-tai"));\n\t\t\t\t} catch {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t},\n\t\t\tchamNhip: () => [],\n\t\t};\n\t\tloiGoi = null;\n\t}\n\tif (loiGoi) {\n',
		),
	);
	ket.bat("tu-tim-dot-khi-goi-vang", vang(demTuTim, "bien-rong", { bien: tam("goi-rong-4"), tranMs: 30_000 }), "DO co-don-xin");
	ket.bat("nuot-loi-nap-goi", vang(demIm, "bien-rong", { bien: tam("goi-rong-2") }), "DO goi-vang-im");
	const demThieu = banSao("thieu-goi", (x) => x.replace(" — cai bang: ${lenhCai}", ""));
	ket.bat("thieu-lenh-cai", vang(demThieu, "bien-rong", { bien: tam("goi-rong-3") }), "DO thieu-lenh-cai");
	const demKhongDot = banSao("khong-dot", (x) => x.replace("timDot: goi.timThuMucDot", 'timDot: () => {\n\t\tthrow new Error("timDot hong");\n\t}'));
	ket.bat("timdot-nem", daCai(demKhongDot, "da-cai-khong-dot", homeCai), "DO khong-dot");
} finally {
	for (const pid of pidNgu) {
		try {
			process.kill(pid);
		} catch {}
	}
	for (const d of tamDon) rmSync(d, { recursive: true, force: true });
}
ket.ket();
