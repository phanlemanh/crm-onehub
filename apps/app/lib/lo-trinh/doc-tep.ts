import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { LO_TRINH } from "./cau-hinh";

function duongTheoGoc(goc: string): string {
	const canh = path.join(goc, LO_TRINH.tep);
	return existsSync(canh) ? canh : path.join(goc, "..", "..", LO_TRINH.tep);
}

function duongMacDinh(): string {
	const canh = path.join(process.cwd(), "LO-TRINH.html");
	return existsSync(canh)
		? canh
		: path.join(process.cwd(), "..", "..", "LO-TRINH.html");
}

export function duongTepLoTrinh(goc?: string): string {
	return goc === undefined ? duongMacDinh() : duongTheoGoc(goc);
}

export function docTepLoTrinh(goc?: string): string | null {
	const duong = duongTepLoTrinh(goc);
	return existsSync(duong) ? readFileSync(duong, "utf8") : null;
}
