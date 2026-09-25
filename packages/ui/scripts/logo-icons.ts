import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
	GOC_KHO,
	sinhAnhNgoai,
	sinhBoIcon,
	type TepIcon,
} from "./logo-icons-lib";

function ghi(goc: string, tep: TepIcon[]): void {
	for (const t of tep) {
		const dich = join(goc, t.duong);
		writeFileSync(dich, t.noiDung);
		console.log(`logo-icons: ${dich} (${t.noiDung.length} byte)`);
	}
}

const co = process.argv.slice(2);
const viTriNgoai = co.indexOf("--external");

if (viTriNgoai === -1) {
	ghi(GOC_KHO, await sinhBoIcon());
} else {
	const thuMuc = co[viTriNgoai + 1];
	if (!thuMuc || thuMuc.startsWith("--")) {
		console.error("logo-icons: --external can mot thu muc");
		process.exit(2);
	}
	const goc = resolve(thuMuc);
	mkdirSync(goc, { recursive: true });
	ghi(goc, await sinhAnhNgoai());
}
