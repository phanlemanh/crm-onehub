import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function diemGop() {
	return execFileSync(
		"git",
		["-C", GOC, "merge-base", "HEAD", "origin/onehub"],
		{ encoding: "utf8" },
	).trim();
}

export const VONG = Object.freeze({
	truoc: diemGop(),
	sau: "HEAD",
});

export const HO_SO_BI_CHAM = [];
