import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { docBanGoc, docHead, git, GOC, THU_MUC_CHAY } from "./luong.mjs";

const TEP = ".github/workflows/acceptance.yml";
const BO = {
	hld_build_heap: "chay next build, de lan ghim lai",
	ld_ba_noi_deu_chay: "chay tron pre-push (ca bo test), de lan ghim lai; dieu 5 (buoc build khong if, khong continue-on-error) do ngay duoi",
};
const PHAI_THAY = ["lkv_ci", "dpvb_cong", "ld_ba_noi_deu_chay", "kcb_khong_noi_tran"];
const BO_DEM = 4 * 1024 * 1024 * 1024;

function trangThai(chu) {
	const fm = chu.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	return fm.match(/^status:\s*(\S+)/m)?.[1];
}

export function rutLenh() {
	const config = Bun.YAML.parse(readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8"));
	const kq = new Map();
	const boQua = [];
	for (const slug of readdirSync(join(GOC, "_acceptance"))) {
		const hd = join(GOC, "_acceptance", slug, "contract.md");
		const ev = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(hd) || !existsSync(ev)) continue;
		if (!["signed-off", "machine-cleared"].includes(trangThai(readFileSync(hd, "utf8")))) continue;
		const chuEv = readFileSync(ev, "utf8");
		let evals;
		try {
			evals = Bun.YAML.parse(chuEv)?.evals ?? [];
		} catch (e) {
			if (chuEv.includes(".github")) throw new Error(`${slug}/evals.yaml khong doc duoc ma co nhac .github: ${e.message}`);
			boQua.push(slug);
			continue;
		}
		for (const e of evals) {
			if (e.executor !== "script") continue;
			if (!(e.paths ?? []).some((p) => new Bun.Glob(p).match(TEP))) continue;
			const khoa = String(e.cmd ?? "").replace(/^config:executors\.script\./, "");
			const lenh = config?.executors?.script?.[khoa];
			if (!lenh) throw new Error(`${slug} ${e.id}: khong giai duoc ${e.cmd}`);
			if (!kq.has(khoa)) kq.set(khoa, { lenh, noi: [] });
			kq.get(khoa).noi.push(`${slug}#${e.id}`);
		}
	}
	if (boQua.length > 0) console.log(`bo qua ${boQua.length} evals.yaml khong doc duoc va khong nhac .github: ${boQua.join(", ")}`);
	return kq;
}

function chayLenh(lenh, cwd, log) {
	const r = spawnSync("bash", ["-c", lenh], { cwd, encoding: "utf8", maxBuffer: BO_DEM, env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" } });
	writeFileSync(log, `${r.stdout ?? ""}${r.stderr ?? ""}`);
	return { ma: r.status ?? 128, chu: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function dungCay(ten, sua) {
	const thu = join(THU_MUC_CHAY, ten);
	rmSync(thu, { recursive: true, force: true });
	mkdirSync(thu, { recursive: true });
	execSync(`git -C "${GOC}" archive --format=tar HEAD | tar -x -C "${thu}"`, { maxBuffer: BO_DEM });
	sua(join(thu, TEP));
	return thu;
}

function dieu5(wf) {
	const buoc = Object.values(wf?.jobs ?? {}).flatMap((j) => j?.steps ?? []).filter((b) => /\bbun run build\b/.test(String(b?.run ?? "")));
	if (buoc.length === 0) return "khong co buoc nao chay bun run build";
	const xau = buoc.filter((b) => b["continue-on-error"] === true || b.if !== undefined);
	return xau.length === 0 ? null : `${xau.length} buoc build mang if hoac continue-on-error`;
}

function chay() {
	const hong = [];
	let lenh;
	try {
		lenh = rutLenh();
	} catch (e) {
		console.error(`MA 2: ${e.message}`);
		process.exit(2);
	}
	console.log(`rut duoc ${lenh.size} lenh: ${[...lenh.entries()].map(([k, v]) => `${k} (${v.noi.join(", ")})`).join("; ")}`);
	for (const k of PHAI_THAY) {
		if (!lenh.has(k)) {
			console.log(`sai bo rut khong thay ${k}`);
			hong.push(`bo rut khong thay ${k}`);
		}
	}
	const goc = docBanGoc();
	const banGocYaml = git("show", `${goc.sha}:${TEP}`);
	const cayGoc = dungCay("cay-goc", (t) => writeFileSync(t, `${banGocYaml}\n`));
	const ld = dieu5(docHead());
	if (ld) hong.push(`dieu 5 cua ld: ${ld}`);
	console.log(ld ? `sai dieu 5 ld: ${ld}` : "dat dieu 5 ld: buoc build khong if, khong continue-on-error");
	for (const [khoa, { lenh: l }] of lenh) {
		if (BO[khoa]) {
			console.log(`bo ${khoa}: ${BO[khoa]}`);
			continue;
		}
		const h = chayLenh(l, GOC, join(THU_MUC_CHAY, `ho-so-${khoa}-head.log`));
		if (h.ma === 0) {
			console.log(`dat ${khoa} ma 0`);
			continue;
		}
		const g = chayLenh(l, cayGoc, join(THU_MUC_CHAY, `ho-so-${khoa}-goc.log`));
		if (g.ma === h.ma) console.log(`do san ${khoa}: ma ${h.ma} ca tren ban merge-base — khong do vong nay gay (${join(THU_MUC_CHAY, `ho-so-${khoa}-head.log`)})`);
		else {
			console.log(`sai ${khoa} ma ${h.ma}, ban merge-base ma ${g.ma} (${join(THU_MUC_CHAY, `ho-so-${khoa}-head.log`)})`);
			hong.push(`${khoa} do them`);
		}
	}
	const lkv = lenh.get("lkv_ci")?.lenh;
	if (lkv) {
		const cayPha = dungCay("cay-pha", (t) => writeFileSync(t, readFileSync(t, "utf8").replace("  luat-kho:\n    name: acceptance gate\n", "  luat-kho:\n    name: acceptance gate\n    if: github.event_name == 'pull_request'\n")));
		const p = chayLenh(lkv, cayPha, join(THU_MUC_CHAY, "ho-so-pha.log"));
		const bat = p.ma !== 0 && p.chu.includes("job co dieu kien if");
		console.log(bat ? "BAT luat-kho-co-if" : `KHONG BAT luat-kho-co-if (ma ${p.ma})`);
		if (!bat) hong.push("chieu do luat-kho-co-if khong bat");
		rmSync(cayPha, { recursive: true, force: true });
	}
	rmSync(cayGoc, { recursive: true, force: true });
	console.log(`E3: ${hong.length === 0 ? "MA 0" : `MA 1 — ${hong.join("; ")}`}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

if (import.meta.main) chay();
