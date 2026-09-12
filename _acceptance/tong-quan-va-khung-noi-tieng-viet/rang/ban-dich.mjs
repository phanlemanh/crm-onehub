import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");

const KHO = [
	[
		"khung-ung-dung",
		(await import(`${GOC}/apps/app/lib/messages/khung-ung-dung.ts`))
			.khungUngDungMessages,
	],
	[
		"tong-quan",
		(await import(`${GOC}/apps/app/lib/messages/tong-quan.ts`))
			.tongQuanMessages,
	],
];

const phang = (o, tien = "") =>
	Object.entries(o).flatMap(([k, v]) =>
		v instanceof Function
			? [[`${tien}${k}`, v]]
			: v instanceof Object
				? phang(v, `${tien}${k}.`)
				: [[`${tien}${k}`, v]],
	);

const hien = (v) => (v instanceof Function ? v("N", "A", "B") : v);
const o = (v) => String(hien(v)).replaceAll("|", "\\|");

let ra =
	"# Bảng dịch — lát Tổng quan và khung điều hướng\n\n> Máy sinh từ hai kho chuỗi, không gõ tay. Hàm ghép biến hiện với đối số N · A · B.\n> Sinh lại: `node _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/ban-dich.mjs`.\n";
let tong = 0;

for (const [ten, lay] of KHO) {
	const en = new Map(phang(lay("en")));
	const vi = new Map(phang(lay("vi")));
	ra += `\n## \`${ten}.ts\` — ${vi.size} khoá\n\n| Khoá | Tiếng Anh | Tiếng Việt |\n|---|---|---|\n`;
	for (const [k, v] of vi) ra += `| \`${k}\` | ${o(en.get(k))} | ${o(v)} |\n`;
	tong += vi.size;
}

ra += `\nTổng: ${tong} khoá trên hai kho.\n`;
writeFileSync(`${HERE}/../ban-dich.md`, ra);
console.log(`ban-dich.md: ${tong} khoa tren ${KHO.length} kho`);
