import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { git, GOC, Ket, khongDoDuoc, moiTruongSach, thuMucTam } from "./chung.mjs";
import { BIEN, giaiGoi } from "./goi.mjs";

const { taoKho } = await import(join(GOC, "scripts", "kiem-cheo", "test", "kho-gia.mjs"));
const { KIEM_CHEO } = await import(join(GOC, "scripts", "kiem-cheo", "cau-hinh.mjs"));
const GIO_MS = 60 * 60 * 1000;
const ket = new Ket();
const goi = giaiGoi();
const CLI = join(goi.goc, "scripts", "dieu-phoi.mjs");
const tamDon = [];
const pidMo = new Set();
const tam = (ten) => {
	const d = thuMucTam(ten);
	tamDon.push(d);
	return d;
};

const LAN = `import { existsSync, readFileSync, writeFileSync } from "node:fs";
const p = process.env.KCS_DOT + "/khoa/s4/chu.json";
writeFileSync(process.env.KCS_CHU, existsSync(p) ? readFileSync(p, "utf8") : "vang");
process.stdout.write(JSON.stringify({ suites: [{ cmd: "true", exit: 0 }], slugs: { ky: { evals_exit: { E1: 0 }, lech: [] } } }));
`;

const song = (pid) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};
const cho = (ms) => new Promise((x) => setTimeout(x, ms));

async function chayCa(dem) {
	const kho = taoKho();
	tamDon.push(kho.tam);
	kho.hoSo("ky", { paths: ["a.txt"] });
	kho.git("add", "-A");
	kho.git("commit", "-q", "-m", "ho so");
	kho.git("push", "-q", "origin", "onehub");
	const T = kho.sha();
	const D = kho.gop({ "a.txt": "b" });
	const thuMucKc = join(kho.goc, KIEM_CHEO.thuMuc);
	mkdirSync(thuMucKc, { recursive: true });
	writeFileSync(join(thuMucKc, KIEM_CHEO.tep.moc), `${JSON.stringify({ sha: T, luc: new Date(Date.now() - 21 * GIO_MS).toISOString() })}\n`);
	const may = tam("may");
	const env = moiTruongSach({ DIEU_PHOI_MAY_DIR: may });
	const cli = (...a) => spawnSync("node", [CLI, ...a], { cwd: kho.goc, env, encoding: "utf8" });
	const mo = cli("mo", "thu");
	if (mo.status !== 0) khongDoDuoc(`mo dot: ${mo.stderr.trim()}`);
	const dot = realpathSync(join(kho.goc, ".acceptance-runs", "dieu-phoi-hien-tai"));
	const pCfg = join(dot, "dieu-phoi.config.json");
	writeFileSync(pCfg, `${JSON.stringify({ ...JSON.parse(readFileSync(pCfg, "utf8")), nhanh_chinh: "onehub", tick_giay: 1 }, null, 2)}\n`);
	const chay = cli("chay");
	if (chay.status !== 0) khongDoDuoc(`chay bo phat lich: ${chay.stderr.trim()}`);
	let pid = 0;
	for (let i = 0; i < 150 && !pid; i++) {
		const p = join(dot, "phat-lich.pid");
		const so = existsSync(p) ? Number(readFileSync(p, "utf8")) : 0;
		if (so && song(so)) pid = so;
		else await cho(100);
	}
	if (!pid) khongDoDuoc("bo phat lich khong song sau 15 giay");
	pidMo.add(pid);
	const chuRa = join(tam("chu"), "chu.json");
	const lan = join(tam("lan"), "lan.mjs");
	writeFileSync(lan, LAN);
	const r = spawnSync("node", [dem, "--goc", kho.goc], {
		encoding: "utf8",
		timeout: 5 * 60 * 1000,
		env: moiTruongSach({ [BIEN]: goi.goc, KIEM_CHEO_DUNG_CAY: "true", KIEM_CHEO_LAN: lan, KIEM_CHEO_THONG_BAO: "true", KCS_DOT: dot, KCS_CHU: chuRa }),
	});
	const doDs = [];
	const chu = existsSync(chuRa) ? readFileSync(chuRa, "utf8") : "vang";
	if (chu === "vang") doDs.push("DO khong-qua-phat-lich: lan khong thay khoa/s4/chu.json cua dot");
	else {
		const j = JSON.parse(chu);
		if (j.phien !== "kiem-cheo") doDs.push(`DO khoa-cua-${j.phien}`);
		if ("moc" in j) doDs.push(`DO chu-co-moc ${j.moc}`);
	}
	if (existsSync(join(dot, "khoa", "s4"))) doDs.push("DO khoa-con-giu: khoa/s4 cua dot con sau luot");
	const ngay = readdirSync(thuMucKc).filter((t) => /^\d{4}-\d{2}-\d{2}\.json$/.test(t));
	const kq = ngay.length ? JSON.parse(readFileSync(join(thuMucKc, ngay.at(-1)), "utf8")) : null;
	if (kq?.ket_qua !== KIEM_CHEO.ketQua.xanh) doDs.push(`DO ket-khong-xanh ${kq?.ket_qua ?? "-"} ${kq?.ly_do ?? ""} ${r.stderr.trim().slice(-200)}`);
	const moc = JSON.parse(readFileSync(join(thuMucKc, KIEM_CHEO.tep.moc), "utf8"));
	if (moc.sha !== D) doDs.push(`DO moc-khong-tien ${moc.sha}`);
	const dong = cli("dong");
	for (let i = 0; i < 100 && song(pid); i++) await cho(100);
	if (song(pid)) {
		doDs.push(`DO dong-khong-sach: pid ${pid} con song${dong.status !== 0 ? ` (${dong.stderr.trim()})` : ""}`);
		process.kill(pid, "SIGTERM");
	} else pidMo.delete(pid);
	if (existsSync(join(may, "s4"))) doDs.push("DO khoa-may-con");
	return doDs;
}

function banSao(ten, tep, sua) {
	const goc = tam(`kc-${ten}`);
	cpSync(join(GOC, "scripts", "kiem-cheo"), join(goc, "scripts", "kiem-cheo"), { recursive: true });
	cpSync(join(GOC, "scripts", "resolve-plugin.mjs"), join(goc, "scripts", "resolve-plugin.mjs"));
	cpSync(join(GOC, "lib"), join(goc, "lib"), { recursive: true });
	const p = join(goc, "scripts", "kiem-cheo", tep);
	const truoc = readFileSync(p, "utf8");
	const sau = sua(truoc);
	if (sau === truoc) khongDoDuoc(`ban sao ${ten} khong doi gi`);
	writeFileSync(p, sau);
	return join(goc, "scripts", "kiem-cheo", "dem.mjs");
}

const trangThaiCay = () => git(GOC, "status", "--porcelain");
const truoc = trangThaiCay();
try {
	const that = await chayCa(join(GOC, "scripts", "kiem-cheo", "dem.mjs"));
	ket.kiem(that.length === 0, "khoa-cua-kiem-cheo, nha-khoa, ket-xanh, moc-tien, dong-sach", that.join(" | "));
	const khongNha = banSao("khong-nha", "khoa.mjs", (x) =>
		x.replace(/(\t+)f\.rmSync\(join\(thuMuc, "khoa", loai\), \{\n\t+recursive: true,\n\t+force: true,\n\t+\}\);\n/, ""),
	);
	ket.bat("khoa-khong-nha", await chayCa(khongNha), "DO khoa-con-giu");
	const tay = banSao("khoa-tay", "dem.mjs", (x) => x.replace("timDot: goi.timThuMucDot", "timDot: () => null"));
	ket.bat("bo-qua-dot", await chayCa(tay), "DO khong-qua-phat-lich");
} finally {
	for (const pid of pidMo) if (song(pid)) process.kill(pid, "SIGTERM");
	for (const d of tamDon) rmSync(d, { recursive: true, force: true });
}
ket.kiem(trangThaiCay() === truoc, "git status cua cay goi lenh khong doi", "cay goi lenh doi trong luc do");
ket.ket();
