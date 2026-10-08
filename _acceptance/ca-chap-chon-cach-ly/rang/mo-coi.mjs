import { spawn, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { dungBanSao, GOC, goBanSao, KhongDo, thayMotLan } from "./ban-sao.mjs";

const CHE_DO = process.argv[2];
const SO_LUOT = { xanh: 3, do: 1 };
const NODE_TOI_THIEU = 24;
const CHO_EVE_MS = 120_000;
const NHIP_MS = 300;
const TRAN_LUOT_MS = 300_000;
const LOI_MO_COI = "dang co eve dev khong phai cua bai thu";
const MOC_DON = "\t\t\t\tawait dungMoCoi(khoa);\n";
const KHOA = join(GOC, "node_modules", ".cache", "crm-eve-khoa");

const daThay = new Set();
const testDaGiet = new Set();

function ps(pid, cot) {
	const r = spawnSync("ps", ["-o", cot, "-p", String(pid)], { encoding: "utf8" });
	return r.status === 0 ? r.stdout.trim() : "";
}

function cayCon(pid) {
	const r = spawnSync("pgrep", ["-P", String(pid)], { encoding: "utf8" });
	return (r.stdout ?? "").split("\n").filter(Boolean).map(Number).flatMap((c) => [c, ...cayCon(c)]);
}

function song(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function daGhiCong(trangThai, dongLenh) {
	const cong = dongLenh.match(/--port (\d+)/)?.[1];
	if (!cong) return false;
	try {
		return readFileSync(trangThai, "utf8").includes(`:${cong}`);
	} catch {
		return false;
	}
}

async function dungMoCoi(goiApp) {
	const tien = spawn("bun", ["test", "test/app-rieng.integration.spec.ts"], {
		cwd: goiApp,
		stdio: "ignore",
	});
	const dau = `${goiApp}/node_modules/.bin/eve dev`;
	const trangThai = join(goiApp, ".eve", "dev-server-state.v1.json");
	const het = Date.now() + CHO_EVE_MS;
	let eve = 0;
	let len = false;
	while (Date.now() < het && !len) {
		eve = cayCon(tien.pid).find((p) => ps(p, "command=").includes(dau)) ?? 0;
		len = eve > 0 && daGhiCong(trangThai, ps(eve, "command="));
		if (!len) await Bun.sleep(NHIP_MS);
	}
	process.kill(tien.pid, "SIGKILL");
	testDaGiet.add(tien.pid);
	await Bun.sleep(1_000);
	if (!len || !song(eve) || ps(eve, "ppid=") !== "1")
		throw new KhongDo(`khong dung duoc eve mo coi (eve ${eve || "vang"}, da len: ${len})`);
	const cay = [eve, ...cayCon(eve)];
	for (const p of cay) daThay.add(p);
	return cay;
}

function chayCa(goiApp) {
	const r = spawnSync("bun", ["test", "test/app-rieng.integration.spec.ts", "-t", "chạy cạnh"], {
		cwd: goiApp,
		encoding: "utf8",
		timeout: TRAN_LUOT_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return `${r.stdout}\n${r.stderr}`;
}

function donKhoaCuaTestDaGiet() {
	let ds = [];
	try {
		ds = readdirSync(KHOA);
	} catch {
		return;
	}
	for (const ten of ds) {
		try {
			const chu = JSON.parse(readFileSync(join(KHOA, ten, "chu.json"), "utf8"));
			if (testDaGiet.has(chu.pid)) rmSync(join(KHOA, ten), { recursive: true, force: true });
		} catch {}
	}
}

async function main() {
	if (!(CHE_DO in SO_LUOT)) throw new KhongDo(`che do ${CHE_DO}: can xanh hoac do`);
	const node = spawnSync("node", ["--version"], { encoding: "utf8" }).stdout?.trim() ?? "";
	if (Number(node.match(/^v(\d+)/)?.[1] ?? 0) < NODE_TOI_THIEU)
		throw new KhongDo(`can Node ${NODE_TOI_THIEU}, may chay ${node || "khong co node"}`);
	const goc = CHE_DO === "do" ? dungBanSao("mo-coi") : GOC;
	try {
		if (CHE_DO === "do") thayMotLan(goc, "apps/agent-okr/test/support/khoi-dong.ts", MOC_DON, "");
		const goiApp = join(goc, "apps", "agent-okr");
		let dat = 0;
		for (let n = 1; n <= SO_LUOT[CHE_DO]; n++) {
			const cay = await dungMoCoi(goiApp);
			const log = chayCa(goiApp);
			if (CHE_DO === "xanh") {
				const xanh = /\b1 pass\b/.test(log) && /\b0 fail\b/.test(log);
				const conSong = cay.filter(song);
				if (xanh && conSong.length === 0) {
					console.log(`LUOT ${n}: xanh`);
					dat++;
				} else console.error(`LUOT ${n}: do — ca ${xanh ? "xanh" : "do"}, mo coi con song: ${conSong.join(",") || "khong"}\n${log.slice(-2000)}`);
			} else if (log.includes(LOI_MO_COI)) {
				console.log("DO DUNG: eve mo coi chan luot sau");
				dat++;
			} else console.error(`chieu do khong hien\n${log.slice(-2000)}`);
		}
		return dat === SO_LUOT[CHE_DO] ? 0 : 1;
	} finally {
		for (const p of daThay) if (song(p)) process.kill(p, "SIGKILL");
		donKhoaCuaTestDaGiet();
		if (CHE_DO === "do") goBanSao(goc);
	}
}

try {
	process.exit(await main());
} catch (loi) {
	console.error(loi.message);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
