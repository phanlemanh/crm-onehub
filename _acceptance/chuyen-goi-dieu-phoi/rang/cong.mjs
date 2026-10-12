import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { docTai, GOC, Ket, MB } from "./chung.mjs";

const MAT = "test:dieu-phoi";
const LENH_MAT = "bun run test:dieu-phoi";
const TEP = {
	pkg: "package.json",
	pp: ".githooks/pre-push",
	gs: ".githooks/gate-shape.json",
	acc: ".github/workflows/acceptance.yml",
};
const ket = new Ket();

function vongPrePush(chu) {
	const dong = chu.split("\n").find((d) => /^for task in .*; do$/.test(d));
	if (!dong) return null;
	const ra = execFileSync("bash", ["-c", `${dong}\n\techo "$task"\ndone`], { encoding: "utf8" });
	return { dong, task: ra.split("\n").filter(Boolean) };
}

function lenhWorkflow(wf) {
	return Object.values(wf.jobs ?? {}).flatMap((j) => (j.steps ?? []).map((b) => b.run).filter(Boolean).map((r) => String(r).trim()));
}

const hieu = (a, b) => a.filter((x) => !b.includes(x));

function do_(cu, moi, inRa = false) {
	const doDs = [];
	const pkgCu = JSON.parse(cu.pkg);
	const pkgMoi = JSON.parse(moi.pkg);
	const sCu = Object.keys(pkgCu.scripts);
	const sMoi = Object.keys(pkgMoi.scripts);
	const pkgCuBo = { ...pkgCu, scripts: Object.fromEntries(Object.entries(pkgCu.scripts).filter(([k]) => k !== MAT)) };
	if (JSON.stringify(hieu(sCu, sMoi)) !== JSON.stringify([MAT]) || hieu(sMoi, sCu).length || !isDeepStrictEqual(pkgCuBo, pkgMoi)) {
		doDs.push(`DO package.json mat ${JSON.stringify(hieu(sCu, sMoi))} them ${JSON.stringify(hieu(sMoi, sCu))}`);
	} else if (inRa) console.log("dat package.json");

	const vCu = vongPrePush(cu.pp);
	const vMoi = vongPrePush(moi.pp);
	if (!vCu || !vMoi) doDs.push("DO pre-push khong tim thay vong for task");
	else {
		const conLai = cu.pp.replace(vCu.dong, vMoi.dong) === moi.pp;
		if (JSON.stringify(hieu(vCu.task, vMoi.task)) !== JSON.stringify([MAT]) || hieu(vMoi.task, vCu.task).length || !conLai) {
			doDs.push(`DO pre-push mat ${JSON.stringify(hieu(vCu.task, vMoi.task))} them ${JSON.stringify(hieu(vMoi.task, vCu.task))}${conLai ? "" : " va doi ngoai dong vong"}`);
		} else if (inRa) console.log("dat pre-push");
		for (const t of vMoi.task) if (!(t in pkgMoi.scripts)) doDs.push(`DO task-khong-script ${t}`);
		if (inRa && !doDs.some((d) => d.startsWith("DO task-khong-script"))) console.log("dat task-co-script");
	}

	const gCu = JSON.parse(cu.gs);
	const gMoi = JSON.parse(moi.gs);
	const gCuBo = { ...gCu, checkers: gCu.checkers.filter((c) => c.id !== MAT) };
	const idCu = gCu.checkers.map((c) => c.id);
	const idMoi = gMoi.checkers.map((c) => c.id);
	if (JSON.stringify(hieu(idCu, idMoi)) !== JSON.stringify([MAT]) || hieu(idMoi, idCu).length) doDs.push(`DO gate-shape mat ${JSON.stringify(hieu(idCu, idMoi))} them ${JSON.stringify(hieu(idMoi, idCu))}`);
	else if (!isDeepStrictEqual(gCuBo, gMoi)) doDs.push("DO gate-shape doi khac");
	else if (inRa) console.log("dat gate-shape.json");

	const wCu = Bun.YAML.parse(cu.acc);
	const wMoi = Bun.YAML.parse(moi.acc);
	const lCu = lenhWorkflow(wCu);
	const lMoi = lenhWorkflow(wMoi);
	const wCuBo = structuredClone(wCu);
	for (const j of Object.values(wCuBo.jobs)) j.steps = (j.steps ?? []).filter((b) => String(b.run ?? "").trim() !== LENH_MAT);
	if (JSON.stringify(hieu(lCu, lMoi)) !== JSON.stringify([LENH_MAT]) || hieu(lMoi, lCu).length) doDs.push(`DO workflow mat them ${JSON.stringify(hieu(lCu, lMoi))} them ${JSON.stringify(hieu(lMoi, lCu))}`);
	else if (!isDeepStrictEqual(wCuBo, wMoi)) doDs.push("DO workflow doi khac");
	else if (inRa) console.log("dat acceptance.yml");
	return doDs;
}

const cu = Object.fromEntries(Object.entries(TEP).map(([k, t]) => [k, docTai(MB, t)]));
const moi = Object.fromEntries(Object.entries(TEP).map(([k, t]) => [k, readFileSync(join(GOC, t), "utf8")]));
const that = do_(cu, moi, true);
ket.kiem(that.length === 0, "bon noi mat dung test:dieu-phoi, khong doi gi khac", that.join(" | "));

const sua = (khoa, f) => do_(cu, { ...moi, [khoa]: f(moi[khoa]) });
ket.bat(
	"workflow-mat-product-map",
	sua("acc", (t) => t.replace(/ {6}- name: Product map\n {8}if: \$\{\{ !cancelled\(\) \}\}\n {8}run: node scripts\/product-map\.mjs --root \. --check\n\n?/, "")),
	"DO workflow mat them",
);
ket.bat(
	"package-giu-test-dieu-phoi",
	sua("pkg", (t) => {
		const j = JSON.parse(t);
		j.scripts[MAT] = 'node --test "scripts/dieu-phoi/test/*.test.mjs"';
		return JSON.stringify(j, null, "\t");
	}),
	"DO package.json",
);
ket.bat(
	"vong-them-lint-moi",
	sua("pp", (t) => t.replace(" build; do", " build lint:moi; do")),
	"DO task-khong-script lint:moi",
);
ket.bat(
	"gate-shape-doi-note",
	sua("gs", (t) => {
		const j = JSON.parse(t);
		const c = j.checkers.find((x) => x.kind === "turbo" && /build/.test(x.id));
		c.note = `${c.note} (doi)`;
		return JSON.stringify(j, null, "\t");
	}),
	"DO gate-shape doi khac",
);
ket.ket();
