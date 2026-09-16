import { createHash } from "node:crypto";
import { mkdirSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function luotCua(goc) {
	const dau = createHash("sha1")
		.update(realpathSync(goc))
		.digest("hex")
		.slice(0, 10);
	return join(tmpdir(), `chan-lai-component-ra-man-${dau}`);
}

const GOC = join(import.meta.dirname, "..", "..", "..");
export const LUOT = luotCua(GOC);

export function duongLuot(ten) {
	mkdirSync(LUOT, { recursive: true });
	return join(LUOT, ten);
}

export function xoaTaoPhamCu(ten) {
	rmSync(duongLuot(ten), { force: true });
}
