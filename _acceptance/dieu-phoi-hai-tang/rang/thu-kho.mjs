import { execFileSync, spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHO_NHIP_MS = 20_000;
const CHO_DUNG_MS = 5_000;
const BUOC_MS = 200;
const DONG_XEM = /^đợt thu-kho · dang-chay · nhịp \S+ · khoá trống · chờ lượt 0 · chờ người 0$/;
const MOC_DONG = "  dungPhatLich(cwd);\n";
const CHO_MONITOR_MS = 15_000;
const KHOI_DONG_TAIL_MS = 1_000;

let sai = 0;
const ghi = (s) => process.stdout.write(`${s}\n`);
const do_ = (ca) => {
	sai++;
	ghi(`DO: ${ca}`);
};
const ngu = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const song = (pid) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};

function banSao(dotBien) {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "dph-kho-")));
	execFileSync("git", ["init", "-q"], { cwd: d });
	cpSync(join(GOC, "scripts", "dieu-phoi"), join(d, "scripts", "dieu-phoi"), { recursive: true });
	if (dotBien) {
		const p = join(d, "scripts", "dieu-phoi", "dieu-phoi.mjs");
		const cu = readFileSync(p, "utf8");
		if (!cu.includes(MOC_DONG)) {
			ghi("MOC VANG dungPhatLich trong dongDot");
			process.exit(2);
		}
		writeFileSync(p, cu.replace(MOC_DONG, ""));
	}
	return d;
}

const cli = (du, ...doi) => {
	const r = spawnSync(process.execPath, [join(du, "scripts", "dieu-phoi", "dieu-phoi.mjs"), ...doi], { cwd: du, encoding: "utf8", timeout: 20_000 });
	return { ma: r.status, ra: (r.stdout ?? "").trim(), loi: (r.stderr ?? "").trim() };
};
const hook = (du) =>
	spawnSync(process.execPath, [join(du, "scripts", "dieu-phoi", "hook-chan-s4.mjs")], {
		cwd: du,
		input: JSON.stringify({ tool_name: "Workflow", cwd: du, tool_input: { scriptPath: "/x/acceptance-verify.js" } }),
		encoding: "utf8",
		timeout: 20_000,
	}).status;

function choDen(dieuKien, han) {
	const het = Date.now() + han;
	while (Date.now() < het) {
		if (dieuKien()) return true;
		ngu(BUOC_MS);
	}
	return dieuKien();
}

function lenhMonitor() {
	const readme = readFileSync(join(GOC, "scripts", "dieu-phoi", "README.md"), "utf8");
	const dong = readme.split("\n").find((d) => d.includes("tail -n0 -F") && d.includes("grep --line-buffered"));
	const m = dong?.match(/`([^`]*tail -n0 -F[^`]*)`/);
	if (!m) {
		ghi("KHONG DO DUOC: README khong co lenh Monitor");
		process.exit(2);
	}
	return m[1];
}

async function thuMonitor(lenh, dot, tenDon) {
	const con = spawn("sh", ["-c", lenh], { detached: true, stdio: ["ignore", "pipe", "ignore"] });
	let ra = "";
	con.stdout.on("data", (b) => {
		ra += b;
	});
	await new Promise((r) => setTimeout(r, KHOI_DONG_TAIL_MS));
	writeFileSync(join(dot, "xin", tenDon), "{hong");
	const het = Date.now() + CHO_MONITOR_MS;
	while (Date.now() < het && !ra.includes('"can_phan":true')) await new Promise((r) => setTimeout(r, BUOC_MS));
	try {
		process.kill(-con.pid, "SIGKILL");
	} catch {}
	return ra.split("\n").filter((d) => d.includes('"can_phan":true')).length;
}

function chayVongDoi(du, ten) {
	const dot = join(du, ".acceptance-runs", "dieu-phoi-thu-kho");
	const mo = cli(du, "mo", "thu-kho");
	ghi(`${ten} mo: ma ${mo.ma} ${mo.ra}${mo.loi}`);
	if (mo.ma !== 0) do_(`${ten} mo ma ${mo.ma}`);
	const ch = cli(du, "chay");
	ghi(`${ten} chay: ma ${ch.ma} ${ch.ra}${ch.loi}`);
	const pid = Number(choDen(() => existsSync(join(dot, "phat-lich.pid")), CHO_NHIP_MS) ? readFileSync(join(dot, "phat-lich.pid"), "utf8") : 0);
	if (!choDen(() => existsSync(join(dot, "trang-thai.json")), CHO_NHIP_MS)) do_(`${ten} khong co nhip trong ${CHO_NHIP_MS} ms`);
	return { dot, pid };
}

const tam = [];
const conSot = [];
try {
	const du = banSao(false);
	tam.push(du);
	const { pid } = chayVongDoi(du, "that");
	conSot.push(pid);
	if (!pid || !song(pid)) do_("that tien-trinh-khong-song-sau-chay");
	const xem = cli(du, "xem");
	ghi(`that xem: ma ${xem.ma} '${xem.ra}'`);
	if (xem.ma !== 0 || !DONG_XEM.test(xem.ra)) do_(`that dong-xem-sai '${xem.ra}'`);
	const monitor = lenhMonitor();
	const dotThat = join(du, ".acceptance-runs", "dieu-phoi-thu-kho");
	const lenhThat = monitor.replace("<thư mục đợt>", dotThat);
	ghi(`monitor lenh: ${lenhThat}`);
	const soDong = await thuMonitor(lenhThat, dotThat, "P9-s4.json");
	ghi(`monitor: ${soDong} dong`);
	if (soDong < 1) do_("monitor-khong-nha-dong");
	const soDongSai = await thuMonitor(lenhThat.replace("su-kien.jsonl", "su-kien.json"), dotThat, "P8-s4.json");
	if (soDongSai === 0) ghi("  lenh monitor doi ten tep su kien: DO: monitor-cam");
	else {
		sai++;
		ghi(`SOT monitor: lenh sai ten tep van nha ${soDongSai} dong`);
	}
	const h1 = hook(du);
	ghi(`that hook trong dot: ma ${h1}`);
	if (h1 !== 2) do_(`that hook-trong-dot ma ${h1}`);
	const dg = cli(du, "dong");
	ghi(`that dong: ma ${dg.ma} ${dg.ra}${dg.loi}`);
	if (!choDen(() => !song(pid), CHO_DUNG_MS)) do_("tien-trinh-con-song-sau-dong");
	const h2 = hook(du);
	ghi(`that hook sau dong: ma ${h2}`);
	if (h2 !== 0) do_(`that hook-sau-dong ma ${h2}`);
	const xem2 = cli(du, "xem");
	ghi(`that xem sau dong: ma ${xem2.ma} '${xem2.loi}'`);
	if (xem2.ma !== 1 || xem2.loi !== "dieu-phoi: không có đợt nào đang chạy") do_(`that xem-sau-dong ma ${xem2.ma} '${xem2.loi}'`);

	const db = banSao(true);
	tam.push(db);
	const kq = chayVongDoi(db, "dot-bien");
	conSot.push(kq.pid);
	cli(db, "dong");
	if (kq.pid && !choDen(() => !song(kq.pid), CHO_DUNG_MS)) ghi("  ban sao dot bien: DO: tien-trinh-con-song-sau-dong");
	else {
		sai++;
		ghi("SOT dot-bien: tien trinh da dung du dongDot khong goi dungPhatLich");
	}
} finally {
	for (const pid of conSot) if (pid && song(pid)) process.kill(pid, "SIGKILL");
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${sai === 0 ? "xanh" : `${sai} sai`}`);
process.exit(sai === 0 ? 0 : 1);
