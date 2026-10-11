import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CHAY, docTai, git, GOC, Ket, SHA_GHIM, SLUG, WF_ACC, WF_CI, yaml } from "./chung.mjs";

const TEP_WF = [WF_CI, WF_ACC];
const BO = {
	hld_build_heap: "chay next build, de lan ghim lai; dieu kien heap do thang ben duoi",
	ld_ba_noi_deu_chay: "chay tron pre-push, de lan ghim lai; dieu 5 (buoc build khong if, khong continue-on-error) do thang ben duoi",
};
const PHAI_CO = ["lkv_ci", "dpvb_cong", "kcb_khong_noi_tran", "cmtb_phu_goi"];
const PHAI_VANG = ["gpa_hinh", "gpa_khong_mat_lenh", "gpa_ho_so_cu", "gpa_nen_gop", "cmtb_hinh", "cmtb_khop_323"];
const BO_DEM = 4 * 1024 * 1024 * 1024;

const trangThai = (chu) => chu.match(/^---\n([\s\S]*?)\n---/)?.[1]?.match(/^status:\s*(\S+)/m)?.[1];

function rutLenh() {
	const config = yaml(readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"));
	const kq = new Map();
	for (const slug of readdirSync(join(GOC, "_acceptance"))) {
		if (slug === SLUG) continue;
		const hd = join(GOC, "_acceptance", slug, "contract.md");
		const ev = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(hd) || !existsSync(ev)) continue;
		if (!["signed-off", "machine-cleared"].includes(trangThai(readFileSync(hd, "utf8")))) continue;
		const chu = readFileSync(ev, "utf8");
		let evals;
		try {
			evals = yaml(chu)?.evals ?? [];
		} catch (e) {
			if (chu.includes(".github")) throw new Error(`${slug}/evals.yaml khong doc duoc ma co nhac .github: ${e.message}`);
			continue;
		}
		for (const e of evals) {
			if (e.executor !== "script" || String(e.status ?? "").trim() === "not-run") continue;
			if (!(e.paths ?? []).some((p) => TEP_WF.some((t) => new Bun.Glob(p).match(t)))) continue;
			const khoa = String(e.cmd ?? "").replace(/^config:executors\.script\./, "");
			const lenh = config?.executors?.script?.[khoa];
			if (!lenh) throw new Error(`${slug} ${e.id}: khong giai duoc ${e.cmd}`);
			if (!kq.has(khoa)) kq.set(khoa, { lenh, noi: [] });
			kq.get(khoa).noi.push(`${slug}#${e.id}`);
		}
	}
	return kq;
}

function chayLenh(lenh, cwd, log) {
	const r = spawnSync("bash", ["-c", lenh], { cwd, encoding: "utf8", maxBuffer: BO_DEM, env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" } });
	writeFileSync(log, `${r.stdout ?? ""}${r.stderr ?? ""}`);
	return { ma: r.status ?? 128, chu: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function dungCay(ten, sua, { caiGoi = false } = {}) {
	const thu = mkdtempSync(join(tmpdir(), `gpct-${ten}-`));
	rmSync(thu, { recursive: true, force: true });
	git("worktree", "add", "--detach", "--quiet", thu, "HEAD");
	sua(thu);
	if (caiGoi) {
		if (existsSync(join(GOC, ".env"))) symlinkSync(join(GOC, ".env"), join(thu, ".env"));
		for (const l of ["bun install --frozen-lockfile", "bun run db:generate"]) {
			const r = chayLenh(l, thu, join(CHAY, `khong-do-them-${ten}-${l.split(" ")[2]}.log`));
			if (r.ma !== 0) throw new Error(`cay ${ten}: «${l}» ma ${r.ma}`);
		}
	}
	return thu;
}

function goCay(thu) {
	try {
		git("worktree", "remove", "--force", thu);
	} catch {
		rmSync(thu, { recursive: true, force: true });
		git("worktree", "prune");
	}
}

const heap = (b) => Number(String(b?.env?.NODE_OPTIONS ?? "").match(/--max-old-space-size=(\d+)/)?.[1] ?? Number.NaN);

export function dieuKienNang(acc, ci) {
	const loi = [];
	const buoc = (acc.jobs?.build?.steps ?? []).filter((b) => /\bbun run build\b/.test(String(b?.run ?? "")));
	if (buoc.length !== 1) loi.push(`build co ${buoc.length} buoc bun run build`);
	const tatCa = Object.values(acc.jobs ?? {}).flatMap((j) => j?.steps ?? []).filter((b) => /\bbun run build\b/.test(String(b?.run ?? "")));
	if (tatCa.some((b) => b.if !== undefined)) loi.push("build co if");
	if (tatCa.some((b) => b["continue-on-error"] === true)) loi.push("build co continue-on-error");
	const hCt = heap((ci.jobs?.check?.steps ?? []).find((b) => b.run === "bun run check-types"));
	const hB = heap(buoc[0]);
	if (!(hB > 2048) || hB !== hCt) loi.push(`heap build ${hB} khac check-types ${hCt} hoac khong vuot 2048`);
	return loi;
}

const k = new Ket();
let lenh;
try {
	lenh = rutLenh();
} catch (e) {
	console.log(`MA 2: ${e.message}`);
	process.exit(2);
}
console.log(`rut duoc ${lenh.size} lenh: ${[...lenh].map(([kk, v]) => `${kk} (${v.noi.join(", ")})`).join("; ")}`);
for (const kk of PHAI_CO) k.kiem(lenh.has(kk), `bo-rut co ${kk}`, `bo rut ${kk}`);
for (const kk of PHAI_VANG) k.kiem(!lenh.has(kk), `bo-rut vang ${kk}`, `bo rut ${kk}`);

const acc = yaml(readFileSync(join(GOC, WF_ACC), "utf8"));
const ci = yaml(readFileSync(join(GOC, WF_CI), "utf8"));
const dk = dieuKienNang(acc, ci);
k.kiem(dk.length === 0, "dieu-kien lenh nang tren workflow", dk.join("; "));

mkdirSync(CHAY, { recursive: true });
let cayGocDung = null;
const cayGocLuoi = () => {
	cayGocDung ??= dungCay(
		"cay-goc",
		(t) => {
			for (const f of TEP_WF) writeFileSync(join(t, f), docTai(SHA_GHIM, f));
			rmSync(join(t, ".github/scripts"), { recursive: true, force: true });
		},
		{ caiGoi: true },
	);
	return cayGocDung;
};
try {
	for (const [kk, { lenh: l }] of lenh) {
		if (BO[kk]) {
			console.log(`bo ${kk}: ${BO[kk]}`);
			continue;
		}
		const logH = join(CHAY, `khong-do-them-${kk}-head.log`);
		const h = chayLenh(l, GOC, logH);
		if (h.ma === 0) {
			k.dat(kk);
			continue;
		}
		const g = chayLenh(l, cayGocLuoi(), join(CHAY, `khong-do-them-${kk}-goc.log`));
		if (g.ma === h.ma) console.log(`do san ${kk}: ma ${h.ma} tren ca hai cay (${logH})`);
		else k.kiem(false, kk, `ma ${h.ma} tren HEAD, ${g.ma} tren cay mang workflow cua sha ghim (${logH})`);
	}
} finally {
	if (cayGocDung) goCay(cayGocDung);
}

const lkv = lenh.get("lkv_ci")?.lenh;
if (lkv) {
	const cayPha = dungCay("cay-pha", (t) => {
		const p = join(t, WF_ACC);
		writeFileSync(p, readFileSync(p, "utf8").replace("      - run: node scripts/luat-kho/do-cay.mjs --du-luat\n", "      - run: node scripts/luat-kho/do-cay.mjs --du-luat\n        continue-on-error: true\n"));
	});
	try {
		const p = chayLenh(lkv, cayPha, join(CHAY, "khong-do-them-pha.log"));
		k.bat("luat-kho-khong-chan", p.ma !== 0 && p.chu.includes("job khong chan"), `ma ${p.ma}`);
	} finally {
		goCay(cayPha);
	}
}
const accPha = structuredClone(acc);
accPha.jobs.build.steps.find((b) => b.run === "bun run build").if = "github.event_name == 'push'";
k.bat("build-if", dieuKienNang(accPha, ci).includes("build co if"), dieuKienNang(accPha, ci).join("; "));
k.xong();
