import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { LO_TRINH } from "./cau-hinh";

export function duongTepLoTrinh(goc: string = process.cwd()): string {
	const canh = path.join(goc, LO_TRINH.tep);
	return existsSync(canh) ? canh : path.join(goc, "..", "..", LO_TRINH.tep);
}

export function docTepLoTrinh(goc?: string): string | null {
	const duong = duongTepLoTrinh(goc);
	return existsSync(duong) ? readFileSync(duong, "utf8") : null;
}
