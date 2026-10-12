import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { cloneDocLap, git, GOC, Ket, khongDoDuoc, MB, moiTruongSach, SLUG, thuMucRa } from "./chung.mjs";
import { BIEN, giaiGoi } from "./goi.mjs";

const require = createRequire(import.meta.url);
const ey = require(join(GOC, "lib", "eval-yaml.cjs"));
const ec = require(join(GOC, "lib", "evidence-core.cjs"));
const CHI_RUT = process.argv.includes("--chi-rut");
const DA_KY = ["signed-off", "machine-cleared"];
const NHAC = /scripts\/dieu-phoi\/|test:dieu-phoi|scripts\/kiem-cheo\//;
const BO = {
	ld_ba_noi_deu_chay: "chay tron pre-push (check-types, lint, lint:slop, test, build); cung tap lenh voi suite keys cua moi luot S4",
	hld_build_heap: "chay next build; build_khong_cache la suite key cua moi luot S4",
	check_types_khong_cache: "suite key cua moi luot S4",
	lint_khong_cache: "suite key cua moi luot S4",
	build_khong_cache: "suite key cua moi luot S4",
	lint_slop: "suite key cua moi luot S4",
	api: "bun run test tron bo; cung cac suite key cua moi luot S4",
	nc_rang_qua_cong: "bun run test tron bo; cung cac suite key cua moi luot S4",
};
const HO_PRE_PUSH = /^bash _acceptance\/(hinh-cua-luoi\/rang-hinh|luoi-day-do-that\/rang-hook)\.sh /;
const LY_DO_PRE_PUSH = "chay pre-push that nhieu luot (>=13 phut/luot); dong vong cua pre-push do thang ben duoi, va luot day nhanh chay chinh pre-push do tren HEAD";
const MOT_LENH_PHUT = 15;
const ket = new Ket();
const goi = giaiGoi();

function docExecutor() {
	const ra = {};
	let nhom = null;
	for (const dong of readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8").split("\n")) {
		const n = /^ {2}([\w-]+):\s*$/.exec(dong);
		if (n) {
			nhom = n[1];
			continue;
		}
		if (/^\S/.test(dong)) nhom = dong.startsWith("executors:") ? null : "ngoai";
		const m = /^ {4}([\w-]+):\s*(.+)$/.exec(dong);
		if (!m || !nhom || nhom === "ngoai") continue;
		let v = m[2].trim();
		if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1).replace(/''/g, "'");
		else if (v.startsWith('"') && v.endsWith('"')) v = JSON.parse(v);
		ra[`executors.${nhom}.${m[1]}`] = v;
	}
	return ra;
}

function rutTap() {
	const exe = docExecutor();
	const tepDoi = git(GOC, "diff", "--name-only", MB, "HEAD").split("\n").filter((t) => t && !t.startsWith("_acceptance/"));
	const tap = new Map();
	for (const slug of readdirSync(join(GOC, "_acceptance"))) {
		if (slug === SLUG) continue;
		const pHd = join(GOC, "_acceptance", slug, "contract.md");
		const pEv = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(pHd) || !existsSync(pEv)) continue;
		if (!DA_KY.includes(/^status:\s*(\S+)/m.exec(readFileSync(pHd, "utf8"))?.[1])) continue;
		const chu = readFileSync(pEv, "utf8");
		for (const e of ey.parseEvals(chu, ["executor", "cmd", "status"], (s) => ey.stripComment(String(s)).trim())) {
			if (!["test", "script"].includes(e.executor) || e.status.replace(/["']/g, "") === "not-run") continue;
			const ref = e.cmd.replace(/["']/g, "").replace(/^config:/, "");
			const lenh = exe[ref];
			if (!lenh) khongDoDuoc(`${slug}/${e.id}: khong giai duoc ${e.cmd}`);
			const re = (ec.evalPathsOf(chu, e.id) ?? []).map((g) => ec.pathGlobToRe(String(g)));
			const cham = tepDoi.some((t) => re.some((r) => r.test(t)));
			if (!cham && !NHAC.test(lenh)) continue;
			const khoa = ref.split(".").at(-1);
			if (!tap.has(khoa)) tap.set(khoa, { lenh, noi: [] });
			tap.get(khoa).noi.push(`${slug}/${e.id}`);
		}
	}
	return { tap, tepDoi };
}

const { tap, tepDoi } = rutTap();
console.log(`tep doi ngoai _acceptance: ${tepDoi.length} · rut duoc ${tap.size} lenh`);
for (const [k, v] of tap) console.log(`  ${k}: ${v.noi.join(", ")}`);
if (tap.size === 0) {
	console.log("KHONG DO DUOC: tap rong");
	process.exit(2);
}
ket.kiem(tap.has("kcs_don_vi") && tap.has("lkv_ci"), "doi-chung-duong tap chua kcs_don_vi va lkv_ci", `tap: ${[...tap.keys()].join(",")}`);
if (CHI_RUT) ket.ket();

const nhatKy = thuMucRa("khong-do-them");
function dungBan(sha, ten) {
	const b = cloneDocLap(sha, ten);
	git(b.goc, "update-ref", "refs/remotes/origin/onehub", sha);
	git(b.goc, "branch", "-f", "onehub", sha);
	copyFileSync(join(GOC, ".env"), join(b.goc, ".env"));
	for (const lenh of ["bun install --frozen-lockfile", "bun run db:generate"]) {
		const r = spawnSync("bash", ["-c", lenh], { cwd: b.goc, encoding: "utf8", env: moiTruongSach(), maxBuffer: 256 * 1024 * 1024 });
		if (r.status !== 0) {
			b.don();
			khongDoDuoc(`dung ban ${ten}: \`${lenh}\` thoat ${r.status}: ${r.stderr.trim().split("\n").slice(-2).join(" ")}`);
		}
	}
	return b;
}
function chay(ban, khoa, lenh, nhan) {
	const log = join(nhatKy, `${khoa}-${nhan}.log`);
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: ban.goc,
		encoding: "utf8",
		timeout: MOT_LENH_PHUT * 60 * 1000,
		maxBuffer: 512 * 1024 * 1024,
		env: moiTruongSach({ [BIEN]: goi.goc, TURBO_TELEMETRY_DISABLED: "1" }),
	});
	writeFileSync(log, `${r.stdout ?? ""}${r.stderr ?? ""}`);
	return { ma: r.status ?? `tin-hieu ${r.signal}`, log };
}

function dongVong(chu) {
	return chu.split("\n").find((d) => /^for task in .*; do$/.test(d)) ?? null;
}
const ghimHook = /^TAC_VU="([^"]+)"$/m.exec(readFileSync(join(GOC, "_acceptance", "luoi-day-do-that", "rang-hook.sh"), "utf8"))?.[1];
const ghimHinh = /\^for task in ([^;]+); do\$\//.exec(readFileSync(join(GOC, "_acceptance", "hinh-cua-luoi", "rang-hinh.sh"), "utf8"))?.[1];
if (!ghimHook || !ghimHinh) khongDoDuoc("khong rut duoc dong vong ma rang-hook.sh, rang-hinh.sh ghim");
const vongHead = dongVong(readFileSync(join(GOC, ".githooks", "pre-push"), "utf8"));
const vongMb = dongVong(git(GOC, "show", `${MB}:.githooks/pre-push`));
ket.kiem(
	vongHead === `for task in ${ghimHook}; do` && vongHead === `for task in ${ghimHinh}; do`,
	"dong vong pre-push o HEAD bang dong rang-hook.sh va rang-hinh.sh ghim",
	`HEAD: ${vongHead}; rang-hook ghim: ${ghimHook}; rang-hinh ghim: ${ghimHinh}`,
);
console.log(vongMb === vongHead ? "merge-base: dong vong giong HEAD" : `merge-base: dong vong lech dong ghim (${vongMb})`);

const head = git(GOC, "rev-parse", "HEAD").trim();
const banHead = dungBan(head, "kdt-head");
const banMb = dungBan(MB, "kdt-mb");
const don = () => {
	banHead.don();
	banMb.don();
};
process.on("SIGTERM", () => {
	don();
	process.exit(143);
});
try {
	for (const [k, v] of tap) {
		if (BO[k] || HO_PRE_PUSH.test(v.lenh)) {
			console.log(`bo ${k}: ${BO[k] ?? LY_DO_PRE_PUSH}`);
			continue;
		}
		const h = chay(banHead, k, v.lenh, "head");
		if (h.ma === 0) {
			console.log(`xanh ${k}`);
			continue;
		}
		const m = chay(banMb, k, v.lenh, "mb");
		if (m.ma === 0) ket.kiem(false, `${k}`, `ma ${h.ma} tren HEAD, 0 tren merge-base: ${h.log}`);
		else console.log(`do san ${k}: ma ${h.ma} tren HEAD, ${m.ma} tren merge-base: ${h.log}`);
	}
	const pWf = join(banHead.goc, ".github", "workflows", "acceptance.yml");
	const wf = readFileSync(pWf, "utf8");
	const boLuat = wf.replace("      - run: node scripts/luat-kho/do-cay.mjs --du-luat\n", "");
	if (boLuat === wf) khongDoDuoc("khong tim thay buoc do-cay trong acceptance.yml de dot bien");
	writeFileSync(pWf, boLuat);
	const dot = chay(banHead, "lkv_ci", tap.get("lkv_ci").lenh, "dot-bien");
	writeFileSync(pWf, wf);
	if (dot.ma !== 0) console.log(`BAT luoi — sai lkv_ci: ma ${dot.ma} khi acceptance.yml mat buoc luat kho`);
	else ket.kiem(false, "luoi", "thuoc hong: luoi — lkv_ci van 0 khi mat buoc luat kho");
} finally {
	don();
}
ket.ket();
