import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { docDanhSach, docTai, gitThu, GOC, hong, kit, MOC_NEN } from "./chung.mjs";

const HO_SO_TU_KIEM = "danh-sach-keo-chung";
const KHONG_GHIM = ["tu-het", "san-pham-hong"];

function laTo(a, b) {
	return gitThu("merge-base", "--is-ancestor", a, b) !== null;
}

export function dongRepinCuoi(text) {
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
	const { core, Y } = kit();
	return Y.parseEvals(evalsText, ["executor", "status", "cmd"])
		.filter((e) => core.isRepinMachineEval(e))
		.map((e) => e.id);
}

export function soiGhim({ slug, dong, evalsText, vc, commitCuoi, laToFn }) {
	const loi = [];
	if (!dong?.sha || dong.sha === MOC_NEN || !laToFn(MOC_NEN, dong.sha)) {
		loi.push(`CHUA_GHIM ${slug}`);
		return { loi, soDoi: 0 };
	}
	if (commitCuoi && !laToFn(commitCuoi, dong.sha)) loi.push(`GHIM_TRUOC_SUA ${slug}: ${commitCuoi.slice(0, 9)} khong la to tien cua ${dong.sha.slice(0, 9)}`);
	(dong.suites_exit ?? [1]).forEach((m, i) => {
		if (m !== 0) loi.push(`GHIM_DO ${slug}:suite${i + 1}=${m}`);
	});
	const kyVong = kit().Y.expectedExits(evalsText).byId;
	const ex = dong.evals_exit ?? {};
	const can = evalMayChay(evalsText);
	let soDoi = 0;
	for (const id of can) {
		if (!(id in ex)) continue;
		soDoi += 1;
		if (ex[id] !== (kyVong.get(id) ?? 0)) loi.push(`GHIM_DO ${slug}:${id}=${ex[id]}`);
	}
	if (soDoi !== can.length) loi.push(`DEM_LECH ${slug}: doi chieu ${soDoi}, eval may dang chay ${can.length}`);
	if (vc !== dong.sha) loi.push(`LECH_SHA ${slug}: verified_commit ${vc} != sha ${dong.sha}`);
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
	return { ma: r.status, violation: /VIOLATION/.test(`${r.stdout}${r.stderr}`) };
}

function tuKiem() {
	const ra = [];
	const that = dongRepinCuoi(docTai(MOC_NEN, `_acceptance/${HO_SO_TU_KIEM}/run-log.jsonl`));
	const evalsText = docTai(MOC_NEN, `_acceptance/${HO_SO_TU_KIEM}/evals.yaml`);
	if (!that || !evalsText) return ["HONG tu kiem: khong doc duoc dong repin that o moc nen"];
	const sha = "f".repeat(40);
	const sua = "a".repeat(40);
	const vao = { slug: HO_SO_TU_KIEM, evalsText, vc: sha, commitCuoi: sua, laToFn: (a, b) => a === MOC_NEN || a === sua || a === b };
	const ex = Object.fromEntries(evalMayChay(evalsText).map((id) => [id, that.evals_exit?.[id] ?? 0]));
	const lanh = { ...that, sha, suites_exit: that.suites_exit.map(() => 0), evals_exit: ex };
	const bat = (ten, dong, can, them = {}) => {
		const { loi } = soiGhim({ ...vao, dong, ...them });
		ra.push(loi.some((l) => l.startsWith(can)) ? `OK tu kiem ${ten}` : `HONG tu kiem ${ten}: khong bat "${can}" (${loi.join("; ") || "khong loi"})`);
	};
	const { loi } = soiGhim({ ...vao, dong: lanh });
	ra.push(loi.length === 0 ? "OK tu kiem doi chung duong" : `HONG tu kiem doi chung duong: ${loi.join("; ")}`);
	bat("suite do", { ...lanh, suites_exit: [1, ...lanh.suites_exit.slice(1)] }, `GHIM_DO ${HO_SO_TU_KIEM}:suite1`);
	bat("lech sha", lanh, `LECH_SHA ${HO_SO_TU_KIEM}`, { vc: "b".repeat(40) });
	bat("chua ghim", null, `CHUA_GHIM ${HO_SO_TU_KIEM}`);
	bat("ghim truoc sua", lanh, `GHIM_TRUOC_SUA ${HO_SO_TU_KIEM}`, { laToFn: (a, b) => a === MOC_NEN || a === b });
	return ra;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const d = docDanhSach();
	const slugs = [...new Set(d.dong.filter((r) => !KHONG_GHIM.includes(r.xu_ly)).map((r) => r.ho_so))].sort();
	if (!slugs.length) hong(2, "MA 2: khong ho so can ghim nao trong danh sach");
	const loiTong = [];
	let xanh = 0;
	for (const slug of slugs) {
		const evalsText = docTai(null, `_acceptance/${slug}/evals.yaml`);
		const dong = dongRepinCuoi(docTai(null, `_acceptance/${slug}/run-log.jsonl`));
		const vc = verifiedCommit(docTai(null, `_acceptance/${slug}/evidence-report.md`));
		const tep = d.dong.filter((r) => r.ho_so === slug).flatMap((r) => r.tep ?? []).filter((t) => !t.startsWith(`_acceptance/${slug}/`));
		const { loi, soDoi } = soiGhim({ slug, dong, evalsText, vc, commitCuoi: commitCuoiCham(slug, tep), laToFn: laTo });
		if (!loi.length) {
			const rc = recheck(slug);
			if (rc.violation || rc.ma !== 0) loi.push(`RECHECK ${slug}: ma ${rc.ma}${rc.violation ? ", co VIOLATION" : ""}`);
		}
		if (loi.length) loiTong.push(...loi);
		else {
			xanh += 1;
			console.log(`${slug}: repin ${dong.run_id} sha ${dong.sha.slice(0, 7)} · suites ${dong.suites_exit.length}/${dong.suites_exit.length} · evals ${soDoi}/${soDoi} · recheck sạch`);
		}
	}
	const tk = tuKiem();
	for (const l of loiTong) console.log(l);
	for (const t of tk) console.log(t);
	console.log(`ghim-xanh: ${xanh}/${slugs.length} hồ sơ`);
	process.exit(loiTong.length || tk.some((t) => t.startsWith("HONG")) ? 1 : 0);
}
