import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { GOC_KHO, thoat } from "./may-chu.mjs";

const VUNG = join(GOC_KHO, "apps/app/app/proto");

function moiTep(goc) {
	const ra = [];
	for (const ten of readdirSync(goc)) {
		const duong = join(goc, ten);
		if (statSync(duong).isDirectory()) ra.push(...moiTep(duong));
		else if (/\.(ts|tsx)$/.test(ten)) ra.push(duong);
	}
	return ra;
}

const tep = moiTep(VUNG);
if (tep.length < 1) thoat(2, "san cung: khong thay tep nao duoi apps/app/app/proto");

const loi = [];
const CAM = [
	{ re: /from\s+"@crm\/db(\/[^"]*)?"/, cau: "nhap @crm/db" },
	{ re: /from\s+"@crm\/auth(\/[^"]*)?"/, cau: "nhap @crm/auth" },
	{ re: /from\s+"@crm\/ui"/, cau: 'nhap BARREL "@crm/ui" — phai di theo subpath @crm/ui/components/<ten>' },
];

for (const t of tep) {
	const noi = readFileSync(t, "utf8");
	const ten = relative(GOC_KHO, t);
	for (const c of CAM) if (c.re.test(noi)) loi.push(`${ten}: ${c.cau}`);

	for (const m of noi.matchAll(/from\s+"(@crm\/ui[^"]*)"/g)) {
		const duong = m[1];
		if (!/^@crm\/ui\/(components|lib|hooks)\//.test(duong))
			loi.push(`${ten}: nhap "${duong}" khong theo subpath hop le`);
	}
}

if (loi.length === 0) {
	console.log(`OK khong-goi-server: quet ${tep.length} tep`);
	process.exit(0);
}
for (const c of loi) console.error(`  - ${c}`);
thoat(1, `khong-goi-server: ${loi.length} tep vi pham`);
