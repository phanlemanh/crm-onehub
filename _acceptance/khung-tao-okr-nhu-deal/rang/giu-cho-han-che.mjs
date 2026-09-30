import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const SO_BUOC = 7;
const LOI_DA_BIET =
	"/deals: pageerror Error: Hydration failed because the server rendered text didn't match the client.";
const LENH =
	'PHIEN_DO_TEN_CAY=kto-e17 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs"';

const vi = process.argv.indexOf("--tu-tep");
let ra;
let ma;
if (vi !== -1) {
	ra = readFileSync(process.argv[vi + 1], "utf8");
	ma = 1;
} else {
	const kq = spawnSync("bash", ["-c", LENH], {
		cwd: GOC,
		encoding: "utf8",
		env: process.env,
	});
	ra = `${kq.stdout ?? ""}${kq.stderr ?? ""}`;
	ma = kq.status ?? 1;
}
process.stdout.write(ra);

if (ma === 0) {
	console.log("giu-cho-han-che: man-giu-cho dat tron, khong can han che");
	process.exit(0);
}
const dong = ra.split("\n");
const buocDat = new Set(
	dong
		.map((d) => d.match(/^buoc (\d+): dat$/)?.[1])
		.filter((x) => x !== undefined),
);
const soLoi = Number(
	dong.map((d) => d.match(/^loi console app: (\d+)$/)?.[1]).find(Boolean) ??
		"-1",
);
const loi = dong.filter(
	(d) => d.trim().startsWith("/") && /pageerror|console/.test(d),
);
const loiLa = loi.filter((d) => !d.trim().startsWith(LOI_DA_BIET));
const hong = dong.filter(
	(d) => d.startsWith("HONG") || /^\s*buoc \d+: (hong|sai)/.test(d),
);
const duBuoc = buocDat.size === SO_BUOC;
const chiLoiDaBiet = soLoi === 1 && loi.length === 1 && loiLa.length === 0;
console.log(
	`giu-cho-han-che: ${buocDat.size}/${SO_BUOC} buoc dat · loi console ${soLoi} · loi la ${loiLa.length} · dong hong khac ${hong.length}`,
);
if (duBuoc && chiLoiDaBiet && hong.length === 0) {
	console.log(
		"giu-cho-han-che: dat co gioi han — chi con loi hydrat /deals co san tren onehub (han che da biet cua khung-tao-okr-nhu-deal)",
	);
	process.exit(0);
}
if (!duBuoc)
	console.log(`giu-cho-han-che: thieu buoc dat (${[...buocDat].join(",")})`);
if (loiLa.length > 0)
	console.log(
		`giu-cho-han-che: loi console khac: ${loiLa[0].trim().slice(0, 160)}`,
	);
process.exit(ma === 0 ? 1 : ma);
