import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = "docs/plan/lo-trinh-okr.json";
const dong = [];
let sai = 0;

function kiem(nhan, dat, chiTiet) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}${chiTiet ? `: ${chiTiet}` : ""}`);
	if (!dat) sai += 1;
}

const keHoach = JSON.parse(readFileSync(join(GOC, TEP), "utf8"));
const hangKeHoach = (keHoach.hang ?? keHoach).find?.((h) => h.ma === "LT1");
if (!hangKeHoach) {
	console.log(`KHONG DO DUOC: khong thay hang LT1 trong ${TEP}`);
	process.exit(2);
}
kiem(
	hangKeHoach.trang_thai === "đã lên onehub"
		? "ke-hoach"
		: "LT1 trong kế hoạch chưa ghi đã lên onehub",
	hangKeHoach.trang_thai === "đã lên onehub" &&
		Array.isArray(hangKeHoach.pr) &&
		hangKeHoach.pr.includes(329) &&
		String(hangKeHoach.buoc_ke ?? "").includes("nghiệm thu"),
	`trang_thai=${hangKeHoach.trang_thai} pr=${JSON.stringify(hangKeHoach.pr)} buoc_ke=${hangKeHoach.buoc_ke}`,
);

const { duLieu, loi } = docDuLieu(
	readFileSync(join(GOC, "LO-TRINH.html"), "utf8"),
);
if (duLieu === null) {
	console.log(`KHONG DO DUOC: LO-TRINH.html khong doc duoc khoi: ${loi}`);
	process.exit(2);
}
const lo = duLieu.lo_trinh.find((x) => x.tep === TEP);
const hangVe = lo?.hang.find((h) => h.ma === "LT1");
kiem(
	"trang-lo-trinh-thay-da-giao",
	hangVe?.nhom_trang_thai === "da-giao",
	`nhom_trang_thai=${hangVe?.nhom_trang_thai} trang_thai=${hangVe?.trang_thai}`,
);

let ag;
try {
	ag = execFileSync(
		"node",
		[
			join(GOC, "scripts/resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/product-map.mjs",
		],
		{ cwd: GOC, encoding: "utf8" },
	).trim();
} catch (e) {
	console.log(
		`KHONG DO DUOC: khong giai duoc goi acceptance-gate: ${e.message}`,
	);
	process.exit(2);
}
let ve = 0;
try {
	execFileSync(
		"node",
		[join(ag, "scripts/product-map.mjs"), "--root", GOC, "--check"],
		{
			cwd: GOC,
			stdio: "pipe",
		},
	);
} catch (e) {
	ve = e.status ?? 1;
}
kiem("ve-lai-khop", ve === 0, `product-map --check ma ${ve}`);

for (const x of dong) console.log(x);
console.log(
	`KET LUAN: ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
