import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TRUOC_VONG = "d6267b1d4eb65f28e1e2cede64e9e8e34de6aebf";
const LICH_SU = "_acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs";
const PHAN_LOAI = "scripts/pre-push-t1.mjs";
const CA_NANG = "1ddf125b3";
const CHO_CAY = "export function phanLoaiDay(goc, dongs, remote) {";
const DONG_SAP =
	"pre-push: không phân loại được lần đẩy (gia sap) — chạy đủ năm bước.";
const TEP = [
	PHAN_LOAI,
	".github/scripts/phan-loai.mjs",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	"_acceptance/config.yaml",
	".githooks/gate-shape.json",
];

function gitPhai(cwd, ...a) {
	const r = spawnSync("git", a, { cwd, encoding: "utf8", maxBuffer: 1 << 26 });
	if (r.status !== 0) throw new Error(`git ${a[0]} hong: ${r.stderr.trim()}`);
	return r.stdout;
}

function ghi(goc, duong, chu) {
	mkdirSync(dirname(join(goc, duong)), { recursive: true });
	writeFileSync(join(goc, duong), chu);
}

const sha = gitPhai(GOC, "rev-parse", CA_NANG).trim();
const goc0 = readFileSync(join(GOC, PHAN_LOAI), "utf8");
if (goc0.split(CHO_CAY).length !== 2) {
	console.log("thuoc hong: cho cay khong thay dung mot lan");
	process.exit(1);
}
const phanLoaiSap = goc0.replace(
	CHO_CAY,
	`${CHO_CAY}\n\tif (dongs.some((d) => d.localSha === ${JSON.stringify(sha)})) throw new Error("gia sap");`,
);

function chay(banLichSu, ten) {
	const d = mkdtempSync(join(tmpdir(), `lich-su-sap-${ten}-`));
	try {
		const goc = join(d, "kho");
		gitPhai(d, "clone", "-q", "--shared", "--no-checkout", GOC, goc);
		for (const t of TEP) {
			mkdirSync(dirname(join(goc, t)), { recursive: true });
			copyFileSync(join(GOC, t), join(goc, t));
		}
		ghi(goc, PHAN_LOAI, phanLoaiSap);
		ghi(goc, LICH_SU, banLichSu);
		const r = spawnSync("node", [join(goc, LICH_SU)], {
			cwd: goc,
			encoding: "utf8",
			maxBuffer: 1 << 26,
		});
		return {
			ma: r.status,
			dong: `${r.stdout}${r.stderr}`.split("\n").filter(Boolean),
		};
	} finally {
		rmSync(d, { recursive: true, force: true });
	}
}

const ngan = sha.slice(0, 9);
const moi = chay(readFileSync(join(GOC, LICH_SU), "utf8"), "moi");
const sap = moi.dong.filter((l) => l.startsWith("sap "));
const lech = moi.dong.filter((l) => l.startsWith("lech "));
if (
	moi.ma !== 1 ||
	sap.length !== 1 ||
	sap[0] !== `sap ${ngan}: ${DONG_SAP}` ||
	lech.length
) {
	console.log(
		`thuoc hong: ban hien tai (ma ${moi.ma}, sap ${sap.length}, lech ${lech.length})`,
	);
	for (const l of [...sap, ...lech].slice(0, 5)) console.log(l);
	process.exit(1);
}
console.log(`BAT sap: ${ngan}`);

const cu = chay(gitPhai(GOC, "show", `${TRUOC_VONG}:${LICH_SU}`), "cu");
const cuNhac = cu.dong.filter(
	(l) => l.includes(ngan) && !l.startsWith("ca 523:"),
);
if (cu.dong.some((l) => l.startsWith("sap ")) || cuNhac.length) {
	console.log("thuoc hong: ban cu da tach");
	process.exit(1);
}
console.log("dat chieu-do: ban cu dem ca sap la khop");
console.log("dat lich-su-sap");
