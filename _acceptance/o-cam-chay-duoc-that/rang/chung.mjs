import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const DUONG_CONFIG = join(GOC, "_acceptance", "config.yaml");
export const SHA_GHIM = "632aee6a3dde3e070f4dcaa7c61af21a9e6d2618";

export const NEO = {
	oCamKeThua: 227,
	oCamThem: 9,
	oCamTong: 236,
	phaiSua: 16,
	fileBaoCao: 25,
	khoaVerifier: 222,
};

export const O_CAM_MOI = [
	"oc_moi_o_cam_chay_duoc",
	"oc_yaml_doc_duoc",
	"oc_hai_trinh_doc_bang_nhau",
	"oc_khoa_khong_doi",
	"oc_verifier_con_giai_duoc",
	"oc_lenh_van_lam_dung_viec",
	"oc_chan_ho_so_da_ky_chay_lai",
	"oc_ham_kit_chua_doi",
	"oc_nam_lenh_chung",
];

export const PHAI_SUA = [
	"executors.test.tt_api",
	"executors.test.go_khoa_api",
	"executors.test.go_khoa_app",
	"executors.script.rang_suite_sach",
	"executors.script.rang_suite_thu_tu",
	"executors.script.rang_microsoft_duong",
	"executors.script.rang_microsoft_do",
	"executors.script.rang_microsoft_nguon_env",
	"executors.script.rang_microsoft_hinh_thuc",
	"executors.script.tt_crawl_to_ingest",
	"executors.script.apr_lech_so_dong_do",
	"executors.script.apr_check_run",
	"executors.script.apr_lech_so_dong",
	"executors.script.apr_lech_noi_dung",
	"executors.script.apr_check_run_do",
	"executors.script.apr_lech_noi_dung_do",
];

export const BO_GIAI = resolve(
	process.env.HOME ?? "",
	".claude/plugins/cache/acceptance-gate-kit/feature-loop/2.8.0/scripts/resolve-plugin.mjs",
);

export function napHamKit() {
	const goc = execFileSync(
		"node",
		[
			BO_GIAI,
			"--plugin",
			"acceptance-gate",
			"--require",
			"lib/evidence-core.cjs",
		],
		{ encoding: "utf8" },
	).trim();
	const duong = join(goc, "lib", "evidence-core.cjs");
	return {
		giai: createRequire(import.meta.url)(duong).resolveConfigKey,
		duong,
	};
}

export function docConfig() {
	return readFileSync(DUONG_CONFIG, "utf8");
}

export function bam(chu) {
	return createHash("sha256").update(chu).digest("hex");
}

export function moiOCam(chu) {
	const ra = [];
	let nhom = null;
	for (const line of chu.split("\n")) {
		const g = line.match(/^ {2}([a-z_]+):\s*$/);
		if (g) {
			nhom = g[1];
			continue;
		}
		const k = line.match(/^ {4}([a-z0-9_]+):\s/);
		if (k && nhom) ra.push(`executors.${nhom}.${k[1]}`);
	}
	return ra;
}

export function ketThuc(bamDau, ma) {
	if (bam(docConfig()) !== bamDau) {
		console.error(
			"MA 2: chan da de lai rac — sha256 cua config.yaml doi so voi luc bat dau",
		);
		process.exit(2);
	}
	process.exit(ma);
}
