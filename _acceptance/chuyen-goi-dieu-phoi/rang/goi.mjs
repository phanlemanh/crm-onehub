import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { GOC, git, khongDoDuoc, RA } from "./chung.mjs";

export const BIEN = "KIEM_CHEO_GOI_DIEU_PHOI";
const CAN = [
	"scripts/dot.mjs",
	"scripts/hook-nhip.mjs",
	"scripts/hinh-dang.mjs",
	"scripts/dieu-phoi.mjs",
	"scripts/lich.mjs",
	"scripts/ghi.mjs",
	"scripts/goi-dot.mjs",
	"scripts/chan-doan.mjs",
	"hooks/hooks.json",
];
const TEP_TRO = join(RA, "goi-tam.json");

function giaiBang(them) {
	return spawnSync(
		process.execPath,
		[
			join(GOC, "scripts/resolve-plugin.mjs"),
			"--plugin",
			"dieu-phoi",
			...CAN.flatMap((t) => ["--require", t]),
			...them,
		],
		{ encoding: "utf8" },
	);
}

function trichTuKit() {
	if (!existsSync(TEP_TRO)) return null;
	const { kho, ref } = JSON.parse(readFileSync(TEP_TRO, "utf8"));
	const sha = git(kho, "rev-parse", ref).trim();
	const dich = join(realpathSync(tmpdir()), `cgdp-goi-${sha.slice(0, 12)}`);
	if (!existsSync(join(dich, "dieu-phoi", "hooks", "hooks.json"))) {
		const tam = `${dich}.tam-${process.pid}`;
		rmSync(tam, { recursive: true, force: true });
		mkdirSync(tam, { recursive: true });
		const tar = execFileSync("git", ["-C", kho, "archive", sha, "dieu-phoi"], {
			maxBuffer: 64 * 1024 * 1024,
		});
		execFileSync("tar", ["-x", "-C", tam], { input: tar });
		try {
			renameSync(tam, dich);
		} catch {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	return { goc: join(dich, "dieu-phoi"), sha };
}

export function giaiGoi({ inRa = true } = {}) {
	let g;
	const bien = process.env[BIEN];
	if (bien) {
		const r = giaiBang(["--root", bien]);
		if (r.status !== 0) khongDoDuoc(`${BIEN}=${bien} khong mang du tep: ${r.stderr.trim()}`);
		g = { goc: r.stdout.trim(), nguon: "bien", nhan: `chi dinh qua ${BIEN}` };
	} else {
		const r = giaiBang(["--json"]);
		if (r.status === 0) {
			const j = JSON.parse(r.stdout);
			g = { goc: j.root, nguon: "da-cai", nhan: `da cai ${j.version}` };
		} else {
			const t = trichTuKit();
			if (!t) khongDoDuoc(`goi dieu-phoi chua cai, khong ${BIEN}, khong tep tro ${TEP_TRO}`);
			const kiem = giaiBang(["--root", t.goc]);
			if (kiem.status !== 0) khongDoDuoc(`ban trich kit ${t.sha.slice(0, 12)} thieu tep: ${kiem.stderr.trim()}`);
			g = { goc: t.goc, nguon: "chua-phat-hanh", nhan: `CHUA PHAT HANH kit ${t.sha.slice(0, 12)}` };
		}
	}
	if (inRa) console.log(`goi dieu-phoi: ${g.nhan} · ${g.goc}`);
	return g;
}

export const napGoi = (g, tep) => import(pathToFileURL(join(g.goc, tep)).href);
