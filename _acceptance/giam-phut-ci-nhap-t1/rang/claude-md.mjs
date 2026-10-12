import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docTai, GOC, Ket, SHA_GHIM, yaml } from "./chung.mjs";

const CAN = ["gh pr create --draft", "gh pr ready", "Cổng Bằng chứng", "acceptance-gate-kit#301"];
const gon = (s) => s.replace(/\s+/g, " ");

function doanOneHub(chu) {
	return chu.split(/\n\s*\n/).find((d) => d.includes("nay do OneHub giữ"));
}

export function kiemClaudeMd(chu, ghim) {
	const loi = [];
	const muc = chu.split(/^## /m).map(gon);
	const co = muc.filter((m) => CAN.every((c) => m.includes(c)));
	if (co.length !== 1) {
		for (const c of CAN) if (!muc.some((m) => m.includes(c))) loi.push(`thieu ${c}`);
		if (!loi.length) loi.push(`${co.length} muc chua du bon chuoi`);
	} else {
		const cau = co[0].split(/(?<=\.)\s+/);
		const iReady = cau.findIndex((c) => c.includes("gh pr ready"));
		const iGhim = cau.findIndex((c) => c.includes("ghim lại"));
		if (iGhim < 0 || iReady < 0 || iReady - iGhim > 1 || iGhim > iReady) loi.push("ghim lai khong dung truoc gh pr ready");
	}
	const doan = doanOneHub(ghim);
	if (!doan || !chu.includes(doan)) loi.push("mat doan OneHub giu ci.yml");
	return loi;
}

const k = new Ket();
const chu = readFileSync(join(GOC, "CLAUDE.md"), "utf8");
const ghim = docTai(SHA_GHIM, "CLAUDE.md");
const loi = kiemClaudeMd(chu, ghim);
k.kiem(loi.length === 0, "muc PR nhap va doan luat 47", loi.join("; "));
const lenh = yaml(readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8")).executors.script.cmtb_claude_md;
const r = spawnSync("bash", ["-c", lenh], { cwd: GOC, encoding: "utf8" });
k.kiem(r.status === 0, "ci-ma-tran-ba-o/E4 (cmtb_claude_md) ma 0", `ma ${r.status}: ${(r.stdout + r.stderr).trim().split("\n").slice(-3).join(" | ")}`);
k.bat("bo-draft", kiemClaudeMd(chu.replace("gh pr create --draft", "gh pr create"), ghim).includes("thieu gh pr create --draft"));
k.bat("mat-doan-47", kiemClaudeMd(chu.replace(doanOneHub(ghim), ""), ghim).includes("mat doan OneHub giu ci.yml"));
k.xong();
