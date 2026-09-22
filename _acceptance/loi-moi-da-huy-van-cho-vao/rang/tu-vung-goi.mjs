import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "..", "..", "..");
const NEO = process.env.NEO_GOI ?? join(GOC, "packages", "auth", "package.json");

function tuChoi(vi) {
	console.error(`MA 2: ${vi}`);
	process.exit(2);
}

let goiGoc;
let duongGoi;
let ban;

try {
	const req = createRequire(NEO);
	const diem = req.resolve("better-auth/plugins/organization");
	const cat = diem.indexOf(`${sep}dist${sep}`);
	if (cat < 0) tuChoi(`duong giai duoc khong co thu muc dist: ${diem}`);
	goiGoc = diem.slice(0, cat);
	duongGoi = join(goiGoc, "package.json");
	ban = JSON.parse(readFileSync(duongGoi, "utf8")).version;
} catch (loi) {
	tuChoi(`khong giai duoc better-auth tu ${NEO}: ${loi.message}`);
}

const treoTaiAuth = join(
	GOC,
	"packages",
	"auth",
	"node_modules",
	"better-auth",
);

let duongThatCuaAuth;

try {
	duongThatCuaAuth = realpathSync(treoTaiAuth);
} catch (loi) {
	tuChoi(`packages/auth khong treo better-auth tai ${treoTaiAuth}: ${loi.message}`);
}

if (realpathSync(goiGoc) !== duongThatCuaAuth) {
	tuChoi(
		`goi giai duoc KHAC goi packages/auth treo — giai: ${realpathSync(goiGoc)}, packages/auth treo: ${duongThatCuaAuth}`,
	);
}

console.log(`goi: ${duongGoi}`);
console.log(`ban: ${ban}`);

const dist = join(goiGoc, "dist");
let thoGoi;

try {
	thoGoi = execFileSync("grep", ["-rho", "InvitationStatus = [^;]*", dist], {
		encoding: "utf8",
	});
} catch (loi) {
	tuChoi(`khong doc duoc InvitationStatus trong ${dist}: ${loi.message}`);
}

const dong = thoGoi.split("\n").find((d) => d.includes("|"));

if (!dong) tuChoi(`khong tim thay dinh nghia InvitationStatus trong ${dist}`);

const tapGoi = [...dong.matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();

const modKho = join(
	GOC,
	"packages",
	"validation",
	"src",
	"invitation-status.ts",
);

let tapKho;

try {
	const tho = execFileSync(
		"bun",
		[
			"-e",
			`import { TRANG_THAI_LOI_MOI } from ${JSON.stringify(modKho)}; console.log(JSON.stringify(TRANG_THAI_LOI_MOI));`,
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	tapKho = JSON.parse(tho.trim()).slice().sort();
} catch (loi) {
	tuChoi(`khong nap duoc TRANG_THAI_LOI_MOI tu ${modKho}: ${loi.message}`);
}

if (!Array.isArray(tapKho) || tapKho.length === 0) {
	tuChoi(`TRANG_THAI_LOI_MOI nap ve khong phai mang co phan tu: ${JSON.stringify(tapKho)}`);
}

console.log(`tap goi: ${JSON.stringify(tapGoi)}`);
console.log(`tap kho: ${JSON.stringify(tapKho)}`);

const thua = tapKho.filter((t) => !tapGoi.includes(t));
const thieu = tapGoi.filter((t) => !tapKho.includes(t));

if (thua.length || thieu.length) {
	console.error(
		`MA 1: hai tap khong bang nhau — kho thua ${JSON.stringify(thua)}, kho thieu ${JSON.stringify(thieu)}`,
	);
	process.exit(1);
}

console.log(`DAT: hai tap bang nhau, ${tapKho.length} trang thai`);
