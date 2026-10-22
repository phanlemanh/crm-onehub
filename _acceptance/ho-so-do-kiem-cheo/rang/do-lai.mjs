import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const TRAN_MS = 20 * 60_000;
const require = createRequire(import.meta.url);

let kitDaNap = null;
export function kit() {
	if (kitDaNap) return kitDaNap;
	const goc = execFileSync(
		"node",
		[
			path.join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"lib/evidence-core.cjs",
			"--require",
			"lib/eval-yaml.cjs",
		],
		{ cwd: GOC, encoding: "utf8" },
	).trim();
	kitDaNap = {
		goc,
		core: require(path.join(goc, "lib", "evidence-core.cjs")),
		Y: require(path.join(goc, "lib", "eval-yaml.cjs")),
	};
	return kitDaNap;
}

export function evalMay(configText, evalsText) {
	const { core, Y } = kit();
	const { byId, errs } = Y.expectedExits(evalsText);
	const recs = Y.parseEvals(evalsText, ["executor", "cmd", "status", "criterion"]);
	const kieuMay = (e) => core.REPIN_MACHINE_EXECUTORS.includes(String(e.executor || "").trim().toLowerCase());
	const may = recs
		.filter((e) => core.isRepinMachineEval(e))
		.map((e) => {
			let cmd = String(e.cmd || "").trim();
			if (cmd.startsWith("config:")) cmd = core.resolveConfigKey(configText, cmd.slice(7)) ?? null;
			return { id: e.id, cmd, kyVong: byId.get(e.id) || 0 };
		});
	return {
		loiKhai: errs,
		may,
		notRun: recs.filter((e) => kieuMay(e) && !core.isRepinMachineEval(e)).map((e) => e.id),
		ngoaiMay: recs.filter((e) => !kieuMay(e)).map((e) => e.id),
	};
}

const SO_DONG_DUOI = 12;
const DO_DAI_DONG = 240;

export function duoiDo(text) {
	return text
		.split("\n")
		.map((l) => l.replace(/\s+$/, ""))
		.filter((l) => l && !/^\s*\(pass\)/.test(l))
		.slice(-SO_DONG_DUOI)
		.map((l) => l.slice(0, DO_DAI_DONG));
}

export const DAU_LENH_CAN_MAY_CHU = ["tien-de.mjs", "mot-luot.sh", "APP_URL"];

function chay(slugs, thuMucLog, boMayChu) {
	const configText = fs.readFileSync(path.join(GOC, "_acceptance/config.yaml"), "utf8");
	const sha = execFileSync("git", ["-C", GOC, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
	fs.mkdirSync(thuMucLog, { recursive: true });
	const hoSo = [];
	for (const slug of slugs) {
		const evalsText = fs.readFileSync(path.join(GOC, "_acceptance", slug, "evals.yaml"), "utf8");
		const ds = evalMay(configText, evalsText);
		const dong = { slug, not_run: ds.notRun, ngoai_may: ds.ngoaiMay, eval: [] };
		for (const e of ds.may) {
			if (!e.cmd) {
				dong.eval.push({ id: e.id, exit: "khong-giai", ky_vong: e.kyVong });
				continue;
			}
			if (boMayChu && DAU_LENH_CAN_MAY_CHU.some((d) => e.cmd.includes(d))) {
				dong.eval.push({ id: e.id, bo: "may-chu", ky_vong: e.kyVong });
				continue;
			}
			const t0 = Date.now();
			const r = spawnSync("bash", ["-c", e.cmd], { cwd: GOC, encoding: "utf8", timeout: TRAN_MS, maxBuffer: 1 << 28 });
			const exit = r.status ?? r.signal ?? "het-tran";
			fs.writeFileSync(
				path.join(thuMucLog, `${slug}__${e.id}.log`),
				`$ ${e.cmd}\n--- exit ${exit} (ky vong ${e.kyVong})\n${r.stdout ?? ""}\n--- stderr\n${r.stderr ?? ""}`,
			);
			const ket = { id: e.id, exit, ky_vong: e.kyVong, giay: Math.round((Date.now() - t0) / 1000) };
			if (exit !== e.kyVong) ket.duoi = duoiDo(`${r.stdout ?? ""}\n${r.stderr ?? ""}`);
			dong.eval.push(ket);
			process.stderr.write(`${slug} ${e.id} exit=${exit} ky=${e.kyVong}\n`);
		}
		hoSo.push(dong);
	}
	return { sha, ngay: new Date().toISOString(), ho_so: hoSo };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const thamSo = process.argv.slice(2);
	const ra = thamSo.indexOf("--ra");
	if (ra < 0 || !thamSo[ra + 1]) {
		process.stderr.write("cach dung: do-lai.mjs --ra <tep.json> [--log <thu muc>] <ho so>...\n");
		process.exit(2);
	}
	const lg = thamSo.indexOf("--log");
	const bo = thamSo.indexOf("--bo-may-chu");
	const thuMucLog = lg >= 0 ? thamSo[lg + 1] : fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "do-lai-"));
	const slugs = thamSo.filter((_, i) => ![ra, ra + 1, lg, lg + 1, bo].includes(i));
	const kq = chay(slugs, thuMucLog, bo >= 0);
	fs.writeFileSync(thamSo[ra + 1], `${JSON.stringify(kq, null, "\t")}\n`);
	const tong = kq.ho_so.flatMap((h) => h.eval).filter((e) => !e.bo);
	const soDo = tong.filter((e) => e.exit !== e.ky_vong).length;
	process.stdout.write(`do-lai: ${kq.ho_so.length} ho so, ${tong.length} eval may, ${soDo} do · log ${thuMucLog}\n`);
}
