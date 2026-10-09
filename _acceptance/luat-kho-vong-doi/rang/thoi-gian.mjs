import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SHA_GOC = "532e331756a6b774eab842f4a8fe4da9ac826375";
const PHAN = ["apps", "packages", "scripts/luat-kho", ".oxlintrc.json"];
const SO_LUOT = 3;
const TRAN_GIAY = Number(process.env.LKV_TRAN_GIAY ?? 120);
const THUOC = join("scripts", "luat-kho", "do-cay.mjs");

function dungCayCu() {
	const tam = mkdtempSync(join(tmpdir(), "lkv-thoi-gian-"));
	execFileSync(
		"bash",
		[
			"-c",
			'set -o pipefail; g="$1" s="$2" d="$3"; shift 3; git -C "$g" archive "$s" -- "$@" | tar -x -C "$d"',
			"lkv",
			GOC,
			SHA_GOC,
			tam,
			...PHAN,
		],
		{ stdio: ["ignore", "ignore", "pipe"] },
	);
	symlinkSync(join(GOC, "node_modules"), join(tam, "node_modules"));
	return tam;
}

function doLuot(goc) {
	const bd = process.hrtime.bigint();
	const r = spawnSync(process.execPath, [join(goc, THUOC), "--du-luat"], {
		cwd: goc,
		encoding: "utf8",
	});
	const giay = Number(process.hrtime.bigint() - bd) / 1e9;
	const ketLuan = (r.stdout ?? "")
		.split("\n")
		.find((d) => d.startsWith("KET LUAN"));
	if (!ketLuan) {
		console.error(
			`thoi-gian: ${goc} khong in dong KET LUAN (ma ${r.status}) — luot khong do duoc`,
		);
		process.exit(2);
	}
	return { giay, ketLuan };
}

const trungVi = (ds) =>
	[...ds].sort((a, b) => a - b)[Math.floor(ds.length / 2)];

const cayCu = dungCayCu();
try {
	const moi = [];
	const cu = [];
	for (let i = 0; i < SO_LUOT; i++) {
		cu.push(doLuot(cayCu));
		moi.push(doLuot(GOC));
	}
	const tvCu = trungVi(cu.map((x) => x.giay));
	const tvMoi = trungVi(moi.map((x) => x.giay));
	const chenh = tvMoi - tvCu;
	console.log(
		`goc ${SHA_GOC.slice(0, 9)}: ${cu.map((x) => x.giay.toFixed(1)).join(", ")} s · ${cu[0].ketLuan}`,
	);
	console.log(
		`HEAD: ${moi.map((x) => x.giay.toFixed(1)).join(", ")} s · ${moi[0].ketLuan}`,
	);
	console.log(
		`thoi-gian: trung vi goc ${tvCu.toFixed(1)} s, HEAD ${tvMoi.toFixed(1)} s, chenh ${chenh.toFixed(1)} s (tran ${TRAN_GIAY} s)`,
	);
	if (chenh > TRAN_GIAY) {
		console.error(
			`thoi-gian: vuot tran — chenh ${chenh.toFixed(1)} s > ${TRAN_GIAY} s`,
		);
		process.exitCode = 1;
	}
} finally {
	rmSync(cayCu, { recursive: true, force: true });
}
