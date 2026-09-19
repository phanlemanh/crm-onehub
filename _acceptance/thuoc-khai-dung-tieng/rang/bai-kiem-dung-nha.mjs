import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bang, GOC, ghim } from "./chung.mjs";

const HANG_SO_TEP = 224;

const NHAP_NGUOC =
	/\bfrom\s+["'][^"']*\.\.\/apps\/[^"']*["']|\brequire\(\s*["'][^"']*\.\.\/apps\/[^"']*["']\s*\)|\bimport\(\s*["'][^"']*\.\.\/apps\/[^"']*["']\s*\)/;

const tep = execFileSync(
	"git",
	[
		"-C",
		GOC,
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		"packages/*.ts",
		"packages/*.tsx",
		"packages/*.mts",
		"packages/*.mjs",
	],
	{ encoding: "utf8" },
)
	.trim()
	.split("\n")
	.filter((t) => t !== "" && !t.includes("/generated/"));

console.log(
	"-- HANG GHIM chep tay tu cay: " +
		`${HANG_SO_TEP} tep nguon duoi packages/ (bo /generated/).\n` +
		"   So TRUOC khi dem vi pham. Mot glob neo sai goc quet duoc 0 tep va bao\n" +
		"   0 vi pham — hai con so cung suy tu mot luot quet thi 0 bang 0.\n" +
		"-- PHAM VI: ca src/ LAN test/. Bai kiem cung la tep cua goi; mot bai kiem\n" +
		"   nhap nguoc chieu keo ca apps/ vao do hinh cua goi dung chung.",
);
ghim("so tep nguon duoi packages/", tep.length, HANG_SO_TEP);

const hang = [];
let hong = 0;

for (const t of tep) {
	const noi_dung = readFileSync(join(GOC, t), "utf8");
	const dong = noi_dung.split("\n");
	for (let i = 0; i < dong.length; i += 1) {
		if (NHAP_NGUOC.test(dong[i])) {
			hang.push(
				`${t}:${i + 1} [nhap-nguoc-chieu] ${dong[i].trim().slice(0, 90)}`,
			);
			hong += 1;
		}
	}
}

if (hong === 0) {
	console.log(`-- Da quet ${tep.length} tep, khong tep nao nhap nguoc chieu.`);
} else {
	bang(`-- ${hong} cho nhap nguoc chieu:`, hang);
	console.log(
		"   packages/ la goi dung chung; apps/ la nguoi dung no. Mot tep duoi packages/\n" +
			"   nhap ../../apps/ dao chieu phu thuoc, va thuong keo tep do ra khoi moi tsconfig.",
	);
}

console.log(`ket qua: ${hong} cho nhap nguoc chieu tren ${tep.length} tep`);
process.exit(hong > 0 ? 1 : 0);
