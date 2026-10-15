import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	commitGia,
	GOC,
	gitThu,
	MOC_NEN,
	LMCV,
	SLUG,
	SOT,
	voiCayTam,
} from "./chung.mjs";

const P7_24 = new Set([
	`_acceptance/${SOT}/rang/soi-ma.mjs`,
	`_acceptance/${SOT}/rang/migration-chi-them.mjs`,
	`_acceptance/${SOT}/evals.yaml`,
	`_acceptance/${SOT}/evidence-report.md`,
	`_acceptance/${SOT}/run-log.jsonl`,
	`_acceptance/${LMCV}/rang/khong-hoi-quy.mjs`,
	`_acceptance/${LMCV}/evals.yaml`,
	`_acceptance/${LMCV}/evidence-report.md`,
	`_acceptance/${LMCV}/run-log.jsonl`,
	"apps/app/test/lam-moi-chuyen-viec.dom.tsx",
]);
const TEP_KHAC = new Set([
	"_acceptance/config.yaml",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
]);
const EVAL_DUOC_DOI = new Map([
	[`_acceptance/${LMCV}/evals.yaml`, new Set(["E5", "E3"])],
]);
const CAM = "_acceptance/cap-nhat-tuan-okr/";

export const trongDanhSach = (t) =>
	P7_24.has(t) ||
	TEP_KHAC.has(t) ||
	t.startsWith(`_acceptance/${SLUG}/`) ||
	(t.startsWith("docs/superpowers/") && t.includes(SLUG));

export function khoiEval(text) {
	const ra = new Map();
	let id = null;
	let conLai = [];
	let expected = [];
	let thutExp = -1;
	const day = () => {
		if (id !== null)
			ra.set(id, {
				conLai: conLai.join("\n").trimEnd(),
				expected: expected.join("\n").trimEnd(),
			});
	};
	for (const dong of text.split("\n")) {
		const idM = /^\s*-\s+id:\s*(\S+)/.exec(dong);
		if (idM) {
			day();
			id = idM[1];
			conLai = [dong];
			expected = [];
			thutExp = -1;
			continue;
		}
		if (id === null) continue;
		if (thutExp >= 0) {
			if (dong.trim() === "" || dong.search(/\S/) > thutExp) {
				expected.push(dong);
				continue;
			}
			thutExp = -1;
		}
		const k = /^(\s*)expected:/.exec(dong);
		if (k) {
			thutExp = k[1].length;
			expected.push(dong);
			continue;
		}
		conLai.push(dong);
	}
	day();
	return ra;
}

function docEvals(goc, ref, tep) {
	const r = spawnSync("git", ["-C", goc, "show", `${ref}:${tep}`], {
		encoding: "utf8",
	});
	return r.status === 0 ? khoiEval(r.stdout) : new Map();
}

export function soEval(truoc, sau, duoc, hs) {
	const loi = [];
	for (const id of new Set([...truoc.keys(), ...sau.keys()])) {
		if (!truoc.has(id) || !sau.has(id)) {
			loi.push(`DOI NGOAI ${hs}:${id}:${truoc.has(id) ? "xoa" : "them"}`);
			continue;
		}
		if (truoc.get(id).conLai !== sau.get(id).conLai)
			loi.push(`DOI NGOAI ${hs}:${id}:ngoai-expected`);
		if (truoc.get(id).expected !== sau.get(id).expected && !duoc.has(id))
			loi.push(`DOI NGOAI ${hs}:${id}:expected`);
	}
	return loi;
}

function soCommit(goc, c) {
	const loi = [];
	const g = (...a) =>
		spawnSync("git", ["-C", goc, ...a], { encoding: "utf8" }).stdout ?? "";
	const tep = g("diff", "--name-only", `${c}^`, c).split("\n").filter(Boolean);
	for (const t of tep)
		if (!trongDanhSach(t)) loi.push(`NGOAI DANH SACH ${t} (${c.slice(0, 9)})`);
	for (const t of tep)
		if (t.startsWith(CAM)) loi.push(`CHAM ${t} (${c.slice(0, 9)})`);
	for (const [tepEvals, duoc] of EVAL_DUOC_DOI) {
		if (!tep.includes(tepEvals)) continue;
		const truoc = docEvals(goc, `${c}^`, tepEvals);
		const sau = docEvals(goc, c, tepEvals);
		const hs = tepEvals.split("/")[1];
		loi.push(...soEval(truoc, sau, duoc, hs));
	}
	if (tep.includes("_acceptance/config.yaml"))
		for (const dong of g(
			"diff",
			"-U0",
			`${c}^`,
			c,
			"--",
			"_acceptance/config.yaml",
		).split("\n"))
			if (
				dong.startsWith("-") &&
				!dong.startsWith("---") &&
				KHOA_NEN.has(khoaCua(dong.slice(1)))
			)
				loi.push(
					`CONFIG DOI GIA TRI ${dong.slice(1).trim().split(":")[0]} (${c.slice(0, 9)})`,
				);
	return { tep, loi };
}

const khoaCua = (dong) => dong.trim().split(":")[0];
const KHOA_NEN = new Set(
	(gitThu("show", `${MOC_NEN}:_acceptance/config.yaml`) ?? "")
		.split("\n")
		.filter((d) => /^\s+[\w-]+:/.test(d))
		.map(khoaCua),
);

export function hoanLaiConDoi(goc, commits) {
	const loi = [];
	const g = (...a) => spawnSync("git", ["-C", goc, ...a], { encoding: "utf8" });
	const lan = new Map();
	for (const c of commits)
		for (const t of (g("diff", "--name-only", `${c}^`, c).stdout ?? "")
			.split("\n")
			.filter(
				(t) =>
					t.startsWith(`_acceptance/${SOT}/`) && !t.endsWith("/run-log.jsonl"),
			))
			lan.set(t, { dau: lan.get(t)?.dau ?? c, cuoi: c });
	for (const [t, { dau, cuoi }] of lan) {
		const truoc = g("show", `${dau}^:${t}`);
		const sau = g("show", `${cuoi}:${t}`);
		if (
			(truoc.status === 0 ? truoc.stdout : null) !==
			(sau.status === 0 ? sau.stdout : null)
		)
			loi.push(`HOAN LAI CON DOI ${t}`);
	}
	return loi;
}

export function phamVi(goc) {
	const r = spawnSync(
		"git",
		[
			"-C",
			goc,
			"log",
			"--no-merges",
			"--format=%H",
			"-F",
			`--grep=(${SLUG})`,
			"HEAD",
		],
		{ encoding: "utf8" },
	);
	const commits = (r.stdout ?? "").split("\n").filter(Boolean).reverse();
	const tep = new Set();
	const loi = [];
	for (const c of commits) {
		const kq = soCommit(goc, c);
		for (const t of kq.tep) tep.add(t);
		loi.push(...kq.loi);
	}
	loi.push(...hoanLaiConDoi(goc, commits));
	return { commits, tep: [...tep].sort(), loi };
}

function inKetQua({ commits, tep, loi }) {
	const dong = [
		`commit cua vong: ${commits.length}`,
		`tep doi (${tep.length}):`,
		...tep.map((t) => `  ${t}`),
		...loi,
	];
	return dong.join("\n");
}

if (process.env.NTH_PHAM_VI_CHI_IN === "1") {
	console.log(inKetQua(phamVi(GOC)));
	process.exit(0);
}

const hong = [];
if (trongDanhSach("apps/api/gia.ts"))
	hong.push("HONG TU KIEM: bo so tep khong bat tep gia ngoai danh sach");
else console.log("OK tu kiem ngoai danh sach");
const giaTruoc =
	"evals:\n  - id: E1\n    executor: script\n    expected: |\n      a\n  - id: E2\n    executor: script\n";
const giaSau = giaTruoc.replace(
	"    executor: script\n    expected",
	"    executor: script\n    expected_exit: 1\n    expected",
);
if (
	!soEval(
		khoiEval(giaTruoc),
		khoiEval(giaSau),
		new Set(["E1"]),
		"gia",
	).includes("DOI NGOAI gia:E1:ngoai-expected")
)
	hong.push("HONG TU KIEM: them expected_exit khong bi bat");
else console.log("OK tu kiem expected_exit");

const kq = phamVi(GOC);
if (kq.commits.length === 0)
	hong.push("KHONG DO DUOC: khong co commit nao cua vong");
hong.push(...kq.loi);
const inGoc = inKetQua(kq);
console.log(inGoc);

const tepCam = gitThu("ls-files", "--", CAM)?.split("\n").find(Boolean);
voiCayTam("pham-vi", (cay) => {
	writeFileSync(
		join(cay, tepCam),
		`${readFileSync(join(cay, tepCam), "utf8")}\n`,
	);
	const cfg = join(cay, "_acceptance", "config.yaml");
	writeFileSync(
		cfg,
		readFileSync(cfg, "utf8").replace(
			/^(\s+repin_budget_min:\s*)\d+/m,
			"$1999",
		),
	);
	commitGia(cay, "gia: commit ngoai vong cho pham-vi");
	const ra = chay(
		`NTH_PHAM_VI_CHI_IN=1 bun _acceptance/${SLUG}/rang/pham-vi.mjs`,
		cay,
	);
	if (ra.ma !== 0 || ra.stdout.trim() !== inGoc.trim())
		hong.push(
			`HONG LECH pham-vi: cay tam co commit ngoai vong cho ket qua khac`,
		);
	else
		console.log(
			"DOI CHUNG bat bien: cay tam co commit ngoai vong cho ket qua giong het",
		);
});

console.log(`pham-vi: ${hong.length === 0 ? "dat" : `${hong.length} hong`}`);
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
