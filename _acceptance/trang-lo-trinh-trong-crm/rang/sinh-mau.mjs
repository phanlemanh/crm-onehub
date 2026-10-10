import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	cpSync,
	existsSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GOC_KHO = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
export const THU_MUC_MAU = path.join(
	GOC_KHO,
	"apps/app/test/fixtures/lo-trinh",
);
export const NGUON_MAU = path.join(THU_MUC_MAU, "nguon");
export const TEP_MAU = path.join(THU_MUC_MAU, "LO-TRINH.mau.html");
export const BO_VE_MAC_DINH = path.join(GOC_KHO, "scripts/product-map.mjs");

export function docBoVe(thamSo) {
	const i = thamSo.indexOf("--bo-ve");
	if (i < 0) return BO_VE_MAC_DINH;
	const giaTri = thamSo[i + 1];
	if (!giaTri || giaTri.startsWith("--"))
		throw new Error("--bo-ve cần đường dẫn tới product-map.mjs ngay sau nó");
	return path.resolve(giaTri);
}

export function veVaoThuMucTam(boVe) {
	const tam = mkdtempSync(path.join(os.tmpdir(), "lo-trinh-mau-"));
	try {
		cpSync(NGUON_MAU, tam, { recursive: true });
		const git = spawnSync("git", ["init", "-q"], {
			cwd: tam,
			encoding: "utf8",
		});
		if (git.status !== 0)
			throw new Error(`git init hỏng: ${git.stderr || git.error}`);
		const ve = spawnSync("node", [boVe, "--root", tam], {
			cwd: tam,
			encoding: "utf8",
		});
		const trang = path.join(tam, "LO-TRINH.html");
		if (ve.status !== 0 || !existsSync(trang))
			throw new Error(
				`bộ vẽ ${boVe} không vẽ được LO-TRINH.html (mã ${ve.status}): ${ve.stderr}`,
			);
		return { tam, trang };
	} catch (loi) {
		rmSync(tam, { recursive: true, force: true });
		throw loi;
	}
}

export function sinhMau(boVe = BO_VE_MAC_DINH) {
	const { tam, trang } = veVaoThuMucTam(boVe);
	try {
		return readFileSync(trang);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

const laChinhNo = (() => {
	if (!process.argv[1]) return false;
	try {
		return (
			realpathSync(process.argv[1]) ===
			realpathSync(fileURLToPath(import.meta.url))
		);
	} catch {
		return false;
	}
})();

if (laChinhNo) {
	const thamSo = process.argv.slice(2);
	try {
		const boVe = docBoVe(thamSo);
		const { tam, trang } = veVaoThuMucTam(boVe);
		if (thamSo.includes("--ghi")) {
			copyFileSync(trang, TEP_MAU);
			rmSync(tam, { recursive: true, force: true });
			console.log(TEP_MAU);
		} else {
			console.log(trang);
		}
	} catch (loi) {
		console.error(`sinh-mau: ${loi.message}`);
		process.exit(2);
	}
}
