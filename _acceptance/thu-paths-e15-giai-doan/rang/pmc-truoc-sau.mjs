import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docDanhSach, verifiedCommit } from "./hoa-cu-theo-paths.mjs";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const Y = createRequire(import.meta.url)(join(GOC, "lib", "eval-yaml.cjs"));
const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { maxBuffer: 1 << 30 }).toString();

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
}

function chayPmc(cay) {
	const r = spawnSync(
		"bash",
		[join(cay, "scripts", "pre-merge-check.sh"), cay],
		{
			encoding: "utf8",
			maxBuffer: 1 << 30,
		},
	);
	const ra = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
	if (!/pre-merge-check: .*(violation|clean|merge)/i.test(ra))
		khongDo(`pre-merge-check khong chay tron tren ${cay}`);
	const hoaCu = new Set(
		[...ra.matchAll(/VIOLATION \[([^\]]+)\]: evidence is stale/g)].map(
			(m) => m[1],
		),
	);
	const khongAp = [
		...ra.matchAll(
			/NOTE \[([^\]]+)\]: bộ lọc paths không áp \(eval-ngoai-may-thieu-paths:([^)]+)\)/g,
		),
	].map((m) => ({ slug: m[1], id: m[2] }));
	return { hoaCu, khongAp };
}

function laJudgment(slug, id) {
	let chu;
	try {
		chu = readFileSync(join(GOC, "_acceptance", slug, "evals.yaml"), "utf8");
	} catch {
		return false;
	}
	return Y.parseEvals(chu, ["executor"]).some(
		(e) =>
			String(e.id) === id && String(e.executor ?? "").trim() === "judgment",
	);
}

function chay() {
	const i = process.argv.indexOf("--ho-so");
	if (i === -1) khongDo("can --ho-so <slug,...|@tep>");
	const chon = docDanhSach(process.argv[i + 1] ?? "");
	const mb = git("merge-base", "HEAD", "origin/onehub").trim();
	if (mb === git("rev-parse", "HEAD").trim()) {
		console.log("da gop, khong so");
		return 0;
	}
	const tam = mkdtempSync(join(tmpdir(), "tpe-pmc-"));
	const cay = join(tam, "cay");
	const go = () => {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		rmSync(tam, { recursive: true, force: true });
	};
	for (const tin of ["SIGINT", "SIGTERM"])
		process.once(tin, () => {
			go();
			process.exit(130);
		});
	try {
		git("worktree", "add", "--detach", "--quiet", cay, mb);
		const truoc = chayPmc(cay);
		const sau = chayPmc(GOC);
		let hong = 0;
		const daKy = chon.filter((s) => verifiedCommit(s));
		const roi = [];
		for (const s of daKy) {
			if (sau.hoaCu.has(s)) {
				hong += 1;
				console.log(`VAN_HOA_CU ${s}`);
			} else if (truoc.hoaCu.has(s)) roi.push(s);
			else console.log(`GHI_CHU ${s}: khong hoa cu ca truoc`);
		}
		const moi = [...sau.hoaCu].filter((s) => !truoc.hoaCu.has(s));
		for (const s of moi) {
			hong += 1;
			console.log(`MOI_HOA_CU ${s}`);
		}
		if (!(sau.hoaCu.size < truoc.hoaCu.size)) {
			hong += 1;
			console.log(`KHONG_GIAM truoc ${truoc.hoaCu.size} sau ${sau.hoaCu.size}`);
		}
		for (const { slug, id } of sau.khongAp)
			if (chon.includes(slug) && laJudgment(slug, id)) {
				hong += 1;
				console.log(`KHONG_AP_JUDGMENT ${slug}#${id}`);
			}
		console.log(
			`pmc: truoc ${truoc.hoaCu.size} · sau ${sau.hoaCu.size} · roi ${roi.join(",") || "-"} · moi ${moi.length}`,
		);
		return hong;
	} finally {
		go();
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url))
	process.exit(chay() ? 1 : 0);
