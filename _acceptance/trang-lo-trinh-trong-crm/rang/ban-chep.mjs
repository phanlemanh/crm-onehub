import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const BAN_CHEP = path.join(GOC, "apps/app/lib/lo-trinh/doc-du-lieu.js");
const i = process.argv.indexOf("--ham-goc");
const HAM_GOC =
	i > 0
		? path.resolve(process.argv[i + 1] ?? "")
		: path.join(GOC, "scripts/lo-trinh.mjs");
const DUONG_TRANG = [
	"apps/app/components/lo-trinh",
	"apps/app/app/(app)/[slug]/lo-trinh",
	"apps/app/lib/lo-trinh",
	"packages/validation/src/lo-trinh-du-lieu.ts",
];

function catHam(chu) {
	const dau = chu.indexOf("export function docDuLieu");
	if (dau < 0) return null;
	const mo = chu.indexOf("{", chu.indexOf(")", dau));
	let sau = 0;
	for (let k = mo; k < chu.length; k++) {
		if (chu[k] === "{") sau++;
		if (chu[k] === "}") sau--;
		if (sau === 0) return chu.slice(dau, k + 1);
	}
	return null;
}

const goc = existsSync(HAM_GOC) ? catHam(readFileSync(HAM_GOC, "utf8")) : null;
if (goc === null) {
	console.log(
		`chưa có bộ vẽ mang khối — cần kit ≥ 2.26 (không thấy docDuLieu trong ${path.relative(GOC, HAM_GOC)})`,
	);
	process.exit(2);
}

let sai = 0;
const dong = (dung, nhan, chiTiet) => {
	console.log(
		`${dung ? "DUNG" : "SAI"} ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`,
	);
	if (!dung) sai++;
};

const chep = existsSync(BAN_CHEP)
	? catHam(readFileSync(BAN_CHEP, "utf8"))
	: null;
dong(
	chep !== null && chep === goc,
	chep === goc ? "ban chep khop ham goc" : "ban chep lech ham goc",
);

const khuon = /const KHUON = (\{[\s\S]*?\n\s*\});/.exec(goc)?.[1];
const bangGoc = khuon
	? JSON.parse(
			khuon
				.replace(/'/g, '"')
				.replace(/(\w+):/g, '"$1":')
				.replace(/,(\s*[}\]])/g, "$1"),
		)
	: null;
const bangKho = JSON.parse(
	execFileSync(
		"bun",
		[
			"-e",
			'import {KHOA_LO_TRINH_DU_LIEU as K} from "./src/lo-trinh-du-lieu.ts"; console.log(JSON.stringify(K))',
		],
		{ cwd: path.join(GOC, "packages/validation"), encoding: "utf8" },
	),
);
const khopBang =
	bangGoc !== null && JSON.stringify(bangGoc) === JSON.stringify(bangKho);
dong(
	khopBang,
	khopBang
		? "khuon Zod khop bang khoa cua bo doc"
		: "khuon Zod lech bang khoa cua bo doc",
	khopBang ? "" : JSON.stringify({ bangGoc, bangKho }),
);

const tep = execFileSync("git", ["ls-files", "--", ...DUONG_TRANG], {
	cwd: GOC,
	encoding: "utf8",
})
	.split("\n")
	.filter(Boolean);
const doc = tep.filter((t) =>
	/_acceptance|docs\/plan/.test(readFileSync(path.join(GOC, t), "utf8")),
);
dong(
	doc.length === 0,
	doc.length === 0
		? `trang khong doc ho so hay tep ke hoach (${tep.length} tep)`
		: "trang doc thang ho so hay tep ke hoach",
	doc.join(" · "),
);

process.exit(sai === 0 ? 0 : 1);
