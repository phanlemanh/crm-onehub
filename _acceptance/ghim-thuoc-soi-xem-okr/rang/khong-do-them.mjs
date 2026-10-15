import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chayTrong, GOC, RA } from "./guong.mjs";

const KHOA = ["gpct_hinh_acceptance", "gpct_luong", "dpvb_cong", "gpa_hinh", "gpa_khong_mat_lenh"];
const BUOC_BUILD = "      - run: bun run build\n        env:\n          NODE_OPTIONS: --max-old-space-size=6144\n";

function lenhCua(k) {
	const m = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8").match(new RegExp(`^ {4}${k}: *(.*)$`, "m"));
	if (!m) throw new Error(`config khong co ${k}`);
	return m[1].trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function git(...a) {
	return execFileSync("git", a, { cwd: GOC, encoding: "utf8" }).trim();
}

function chuan(ra, goc) {
	return new Set(
		ra
			.split(goc).join("<goc>")
			.split(GOC).join("<goc>")
			.replace(/\d{4}-\d\d-\d\dT[\d:.]+Z/g, "<gio>")
			.replace(/\b[0-9a-f]{7,40}\b/g, "<sha>")
			.replace(/\b\d+(\.\d+)?\s?(ms|s)\b/g, "<giay>")
			.split("\n")
			.map((d) => d.trim())
			.filter(Boolean),
	);
}

function chayHet(goc, lenh) {
	return Object.fromEntries(KHOA.map((k) => [k, chuan(chayTrong(goc, lenh[k]).ra, goc)]));
}

function dongMoi(nen, nhanh) {
	return KHOA.flatMap((k) => [...nhanh[k]].filter((d) => !nen[k].has(d)).map((d) => `${k}: ${d}`));
}

function chay() {
	let lenh;
	let mb;
	try {
		lenh = Object.fromEntries(KHOA.map((k) => [k, lenhCua(k)]));
		mb = git("merge-base", "HEAD", "origin/onehub");
	} catch (e) {
		console.log(`KHONG DO DUOC: ${e.message}`);
		return 2;
	}
	const nenGoc = join(RA, `nen-${process.pid}`);
	try {
		git("worktree", "add", "--detach", nenGoc, mb);
		if (existsSync(join(GOC, "node_modules"))) symlinkSync(join(GOC, "node_modules"), join(nenGoc, "node_modules"));
	} catch (e) {
		console.log(`KHONG DO DUOC: khong dung duoc worktree nen ${mb}: ${e.message}`);
		return 2;
	}
	let lot = 0;
	try {
		console.log(`nen: merge-base ${mb}`);
		const nen = chayHet(nenGoc, lenh);
		const nhanh = chayHet(GOC, lenh);
		const moi = dongMoi(nen, nhanh);
		for (const d of moi) console.log(`moi ${d}`);
		if (moi.length === 0) console.log(`dat ${KHOA.length} lenh: nhanh khong co dong nao nen khong co`);
		else lot++;
		const tepWf = join(nenGoc, ".github", "workflows", "acceptance.yml");
		const wf = readFileSync(tepWf, "utf8");
		if (!wf.includes(BUOC_BUILD)) {
			console.log("LOT doi-chung: khong tim thay buoc build de bo");
			lot++;
		} else {
			writeFileSync(tepWf, wf.replace(BUOC_BUILD, ""));
			const doiChung = dongMoi(nen, chayHet(nenGoc, lenh));
			if (doiChung.length > 0) console.log(`bat doi-chung: ${doiChung.length} dong moi khi bo buoc build (vd ${doiChung[0].slice(0, 120)})`);
			else {
				console.log("LOT doi-chung: bo buoc build ma khong lenh nao sinh dong moi");
				lot++;
			}
		}
	} finally {
		try {
			git("worktree", "remove", "--force", nenGoc);
		} catch {
			rmSync(nenGoc, { recursive: true, force: true });
			git("worktree", "prune");
		}
	}
	return lot === 0 ? 0 : 1;
}

process.exit(chay());
