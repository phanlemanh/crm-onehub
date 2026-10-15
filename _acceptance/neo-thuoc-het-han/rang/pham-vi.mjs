import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	commitGia,
	GOC,
	gitThu,
	kit,
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
	[`_acceptance/${SOT}/evals.yaml`, new Set(["E23", "E25"])],
	[`_acceptance/${LMCV}/evals.yaml`, new Set(["E5", "E3"])],
]);
const TRUONG = [
	"criterion",
	"executor",
	"cmd",
	"expected",
	"status",
	"layer",
	"question",
];
const CAM = "_acceptance/cap-nhat-tuan-okr/";

export const trongDanhSach = (t) =>
	P7_24.has(t) ||
	TEP_KHAC.has(t) ||
	t.startsWith(`_acceptance/${SLUG}/`) ||
	(t.startsWith("docs/superpowers/") && t.includes(SLUG));

function docEvals(goc, ref, tep) {
	const r = spawnSync("git", ["-C", goc, "show", `${ref}:${tep}`], {
		encoding: "utf8",
	});
	if (r.status !== 0) return new Map();
	const { Y, core } = kit();
	return new Map(
		Y.parseEvals(r.stdout, TRUONG).map((e) => [
			e.id,
			{ ...e, paths: JSON.stringify(core.evalPathsOf(r.stdout, e.id)) },
		]),
	);
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
		for (const id of new Set([...truoc.keys(), ...sau.keys()])) {
			if (!truoc.has(id) || !sau.has(id)) {
				loi.push(`DOI NGOAI ${hs}:${id}:${truoc.has(id) ? "xoa" : "them"}`);
				continue;
			}
			for (const k of [...TRUONG, "paths"]) {
				if (truoc.get(id)[k] === sau.get(id)[k]) continue;
				if (duoc.has(id) && k === "expected") continue;
				loi.push(`DOI NGOAI ${hs}:${id}:${k}`);
			}
		}
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
			if (dong.startsWith("-") && !dong.startsWith("---"))
				loi.push(
					`CONFIG DOI GIA TRI ${dong.slice(1).trim().split(":")[0]} (${c.slice(0, 9)})`,
				);
	return { tep, loi };
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
