import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "do-man-tren-kho-rieng";
const MAU_KHAC =
	"VIOLATION [loi-vao-dieu-phoi-30-ngay]: status=implemented but approved_by is empty — làn V đòi xanh-sạch hoặc chữ ký (không có evidence-report.md).";
const MAU_NAY = MAU_KHAC.replace("[loi-vao-dieu-phoi-30-ngay]", `[${SLUG}]`);

export function viPhamKhac(dauRa) {
	return dauRa
		.split("\n")
		.map((dong) => dong.trim())
		.filter((dong) => /^VIOLATION \[[^\]]+\]:/.test(dong))
		.filter((dong) => !dong.startsWith(`VIOLATION [${SLUG}]:`));
}

let sai = 0;
function khang(dieu, cau) {
	console.log(`  ${dieu ? "DUNG" : "SAI "} ${cau}`);
	if (!dieu) sai += 1;
}

khang(
	viPhamKhac(MAU_KHAC).length === 1,
	"doi chung: dong vi pham cua ho so khac duoc dem",
);
khang(
	viPhamKhac(MAU_NAY).length === 0,
	"doi chung: dong vi pham cua chinh ho so nay duoc bo",
);

const ra = spawnSync(
	"bash",
	["scripts/pre-merge-check.sh", ".", "--base", "origin/onehub"],
	{ cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
if (ra.status !== 0 && ra.status !== 1) {
	console.log(`KHONG DO DUOC: pre-merge-check thoat ${ra.status ?? ra.signal}`);
	console.log((ra.stderr ?? "").split("\n").slice(-10).join("\n"));
	process.exit(2);
}
const khac = viPhamKhac(`${ra.stdout}\n${ra.stderr}`);
for (const dong of khac) console.log(`    ${dong}`);
khang(
	khac.length === 0,
	`pre-merge toan kho: ${khac.length} vi pham cua ho so khac`,
);
console.log(
	`truoc-gop: pre-merge thoat ${ra.status}, ${sai === 0 ? "sach" : `${sai} SAI`}`,
);
process.exit(sai > 0 ? 1 : 0);
