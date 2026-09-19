import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

export function thoat(ma, ...dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

export function ghim(ten, thuc, mong) {
	if (thuc !== mong) {
		throw new Error(
			`HANG GHIM LECH: ${ten} — dem duoc ${thuc}, ban khai noi ${mong}.\n` +
				"   Hai con so cung suy tu mot luot quet la 0 bang 0 khi glob neo sai goc,\n" +
				"   nen hang phai chep tay tu cay va so TRUOC khi dem vi pham.",
		);
	}
	return thuc;
}

export function bang(tieu_de, hang) {
	console.log(tieu_de);
	for (const d of hang) console.log(`   ${d}`);
}

export function chay(lenh, doi_so, tuy = {}) {
	const r = spawnSync(lenh, doi_so, {
		cwd: tuy.cwd ?? GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		env: { ...process.env, ...(tuy.env ?? {}) },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
