import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bang, chay, GOC, ghim } from "./chung.mjs";

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

console.log(
	"\n-- VE (b): bai kiem co NAM TRONG mot chuong trinh kieu that su soi no khong.\n" +
		"   Day la QUAN HE (tep thuoc tap tep tsc doc), khong phai chuoi dai dien.\n" +
		"   Ve (a) mu dung cho benh that nam: packages/ui/tsconfig.json tung khai\n" +
		'   include: ["src"], nen MOI tep duoi test/ roi ra ngoai bat ke no nhap gi.\n' +
		"   Hoi dong S4 vong 1 bat cho nay; phep do duoi day dung `tsc --listFiles`.",
);

const CAP_KIEM = [
	{ goi: "packages/ui", tep: "test/khai-tieng.spec.tsx" },
	{ goi: "apps/app", tep: "test/khai-tieng-metaline.spec.tsx" },
];

const hangB = [];
for (const c of CAP_KIEM) {
	const r = chay(
		"bunx",
		["tsc", "-p", "tsconfig.json", "--listFiles", "--noEmit"],
		{
			cwd: join(GOC, c.goi),
		},
	);
	const dong = r.ra
		.split("\n")
		.filter((d) => d.trim().endsWith(".ts") || d.trim().endsWith(".tsx"));
	if (dong.length < 10) {
		console.log(
			`KHONG DO DUOC: \`tsc --listFiles\` o ${c.goi} chi liet ${dong.length} tep —\n` +
				'   khong nap duoc tsconfig thi danh sach RONG, va "khong thay bai kiem trong\n' +
				'   danh sach rong" trong y het "bai kiem bi bo quen". Tien de hong.',
		);
		process.exit(2);
	}
	const duongDay = join(GOC, c.goi, c.tep);
	const co = dong.some((d) => d.trim() === duongDay);
	if (co) {
		hangB.push(
			`nam trong chuong trinh ${c.goi}/${c.tep} (tsc doc ${dong.length} tep)`,
		);
	} else {
		hangB.push(
			`NGOAI CHUONG TRINH [bai-kiem-ngoai-tsconfig:${c.goi}/${c.tep}] tsc doc ${dong.length} tep ma khong co tep nay`,
		);
		hong += 1;
	}
}
bang(`-- ${CAP_KIEM.length} bai kiem, doi chieu bang tsc --listFiles:`, hangB);

console.log(
	`ket qua: ${hong} cho hong (ve a: nhap nguoc chieu tren ${tep.length} tep · ve b: ${CAP_KIEM.length} bai kiem)`,
);
process.exit(hong > 0 ? 1 : 0);
