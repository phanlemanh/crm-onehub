import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BANG, cham, doCache } from "./cache-noi-that.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");

const dong = BANG[0];
if (dong === undefined) {
	console.error("KHONG DO DUOC: bang cua chan AC-3 rong — khong co vat de dung trang thai.");
	process.exit(2);
}

const duong = join(GOC, dong.file);
const goc = readFileSync(duong, "utf8");
let ma = 0;
try {
	doCache();
	const truoc = doCache();
	cham(duong);
	const sau = doCache();

	if (truoc === null || sau === null) {
		console.error(
			"KHONG DO DUOC: chan AC-3 khong tra ve cap so — khong co gi de doi chieu.",
		);
		process.exit(2);
	}
	console.log(
		`chan AC-3 doc duoc: truoc ${truoc.cached}/${truoc.total} · sau khi cham ${sau.cached}/${sau.total}`,
	);

	if (truoc.total < 1 || sau.total < 1) {
		console.error("KHONG DO DUOC: total = 0 — cache lanh, khong ket luan duoc gi.");
		process.exit(2);
	}
	if (truoc.cached === sau.cached) {
		console.error(
			`DO: cap so KHONG doi khi trang thai cache doi (${truoc.cached} ca hai luot) — chan AC-3 dang doc mot thu khong theo hanh vi thuc, rat co the la mot ban khai.`,
		);
		ma = 1;
	} else {
		console.log(
			`cap so DOI theo trang thai that: ${truoc.cached} -> ${sau.cached}. Ket luan cua chan AC-3 den tu dau ra cua cong cu, khong tu turbo.json.`,
		);
	}
} finally {
	writeFileSync(duong, goc);
}

if (ma === 0)
	console.log(
		"XANH: chan AC-3 doc DAU RA THAT — cap so no dua vao thay doi dung theo trang thai cache ma phep do vua dung len.",
	);
process.exit(ma);
