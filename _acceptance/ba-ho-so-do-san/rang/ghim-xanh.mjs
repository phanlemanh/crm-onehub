import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { cacEval, docDanhSach, docTai, gitThu, GOC, hong, kit, MOC_NEN } from "./chung.mjs";

function laTo(a, b) {
	return gitThu("merge-base", "--is-ancestor", a, b) !== null;
}

function dongRepinCuoi(text) {
	if (text === null) return null;
	const ds = text
		.split("\n")
		.filter(Boolean)
		.map((l) => {
			try {
				return JSON.parse(l);
			} catch {
				return null;
			}
		})
		.filter((x) => x && x.kind === "repin");
	return ds.at(-1) ?? null;
}

function verifiedCommit(report) {
	const m = /^verified_commit:\s*([0-9a-f]{7,40})\s*$/m.exec(report ?? "");
	return m ? m[1] : null;
}

function evalMayChay(evalsText) {
	return cacEval(evalsText)
		.filter((e) => ["test", "script"].includes(e.executor) && e.status !== "not-run")
		.map((e) => e.id);
}

export function soiGhim({ slug, dong, evalsText, vc, commitCuoi, laToFn }) {
	const loi = [];
	if (!dong || !dong.sha || !laToFn(MOC_NEN, dong.sha) || dong.sha === MOC_NEN) {
		loi.push(`CHUA_GHIM ${slug}`);
		return { loi, soDoi: 0 };
	}
	if (commitCuoi && !laToFn(commitCuoi, dong.sha)) loi.push(`GHIM_CU ${slug}: ${commitCuoi.slice(0, 9)} khong la to tien cua ${dong.sha.slice(0, 9)}`);
	(dong.suites_exit ?? [1]).forEach((m, i) => {
		if (m !== 0) loi.push(`DO ${slug}:suite${i + 1}=${m}`);
	});
	const kyVong = kit().Y.expectedExits(evalsText).byId;
	const ex = dong.evals_exit ?? {};
	let soDoi = 0;
	for (const id of evalMayChay(evalsText)) {
		if (!(id in ex)) continue;
		soDoi++;
		const muon = kyVong.get(id) ?? 0;
		if (ex[id] !== muon) loi.push(`DO ${slug}:${id}=${ex[id]}`);
	}
	const can = evalMayChay(evalsText).length;
	if (soDoi !== can || (can > 0 && soDoi === 0)) loi.push(`DEM_LECH ${slug}: doi chieu ${soDoi}, eval may dang chay ${can}`);
	if (vc !== dong.sha) loi.push(`LECH_VC ${slug}: verified_commit ${vc} != sha ${dong.sha}`);
	return { loi, soDoi };
}

function commitCuoiCham(slug, tepNgoai) {
	const ra = gitThu(
		"log",
		"-1",
		"--format=%H",
		"HEAD",
		"--",
		`_acceptance/${slug}`,
		`:(exclude)_acceptance/${slug}/run-log.jsonl`,
		`:(exclude)_acceptance/${slug}/evidence-report.md`,
		...tepNgoai,
	);
	return ra?.trim() || null;
}

function recheck(slug) {
	const r = spawnSync("node", [join(GOC, "scripts", "recheck-evidence.cjs"), join(GOC, "_acceptance", slug, "evidence-report.md")], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const chu = `${r.stdout}${r.stderr}`;
	return { ma: r.status, violation: /VIOLATION/.test(chu), chu };
}

function tuKiem() {
	const ra = [];
	const slug = "khoa-con-bat-xa-tran";
	const that = dongRepinCuoi(docTai(MOC_NEN, `_acceptance/${slug}/run-log.jsonl`));
	const evalsText = docTai(MOC_NEN, `_acceptance/${slug}/evals.yaml`);
	if (!that || !evalsText) return ["HONG tu kiem: khong doc duoc dong repin that o moc nen"];
	const sha = "f".repeat(40);
	const dauVao = { slug, evalsText, vc: sha, commitCuoi: "a".repeat(40), laToFn: (a, b) => a === MOC_NEN || a === "a".repeat(40) || a === b };
	const bat = (ten, dong, can, them = {}) => {
		const { loi } = soiGhim({ ...dauVao, dong, ...them });
		ra.push(loi.some((l) => l.startsWith(can)) ? `OK tu kiem ${ten}: bat "${can}"` : `HONG tu kiem ${ten}: khong bat "${can}" (${loi.join("; ") || "khong loi"})`);
	};
	const lanh = { ...that, sha };
	const { loi: loiLanh } = soiGhim({ ...dauVao, dong: lanh });
	ra.push(loiLanh.length === 0 ? "OK tu kiem doi chung duong: dong repin that doi sha khong loi" : `HONG tu kiem doi chung duong: ${loiLanh.join("; ")}`);
	const id = Object.keys(that.evals_exit)[0];
	bat("mot eval do", { ...lanh, evals_exit: { ...that.evals_exit, [id]: 1 } }, `DO ${slug}:${id}=1`);
	bat("khong dong repin sau moc nen", null, `CHUA_GHIM ${slug}`);
	bat("ghim cu hon lan sua", lanh, `GHIM_CU ${slug}`, { laToFn: (a, b) => a === MOC_NEN });
	bat("dong repin thieu eval", { ...lanh, evals_exit: {} }, `DEM_LECH ${slug}`);
	return ra;
}

if (import.meta.main) {
	const d = docDanhSach();
	const slugs = [...new Set(d.dong.filter((r) => r.xu_ly !== "tu-het").map((r) => r.ho_so))].sort();
	let xanh = 0;
	const loiTong = [];
	for (const slug of slugs) {
		const evalsText = docTai(null, `_acceptance/${slug}/evals.yaml`);
		const dong = dongRepinCuoi(docTai(null, `_acceptance/${slug}/run-log.jsonl`));
		const vc = verifiedCommit(docTai(null, `_acceptance/${slug}/evidence-report.md`));
		const tepCua = d.dong.filter((r) => r.ho_so === slug && r.xu_ly === "sua-rang").flatMap((r) => r.tep ?? []);
		const { loi, soDoi } = soiGhim({ slug, dong, evalsText, vc, commitCuoi: commitCuoiCham(slug, tepCua), laToFn: laTo });
		if (!loi.length) {
			const rc = recheck(slug);
			if (rc.violation || rc.ma !== 0) loi.push(`RECHECK ${slug}: ma ${rc.ma}${rc.violation ? ", co VIOLATION" : ""}`);
		}
		if (loi.length) loiTong.push(...loi);
		else {
			xanh++;
			console.log(`${slug}: repin ${dong.run_id} sha ${dong.sha.slice(0, 7)} suites 0 evals dat (${soDoi})`);
		}
	}
	const tk = tuKiem();
	for (const l of loiTong) console.log(`HONG ${l}`);
	for (const t of tk) console.log(t);
	if (!slugs.length) hong(2, "MA 2: khong ho so bi cham nao trong danh sach");
	console.log(`ghim-xanh: ${xanh}/${slugs.length} ho so`);
	process.exit(loiTong.length || tk.some((t) => t.startsWith("HONG")) ? 1 : 0);
}
