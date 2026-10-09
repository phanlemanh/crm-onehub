import {
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "vong-doi-mot-cach-cat";
const CHIEU_DO = process.argv.includes("--chieu-do");
const APP = join(GOC, "apps", "app");

const MA_TRAN = [
	"apps/app/components/crm/record-sheet/record-actions.tsx",
	"apps/app/app/(app)/[slug]/contacts/contacts-bulk-actions.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-bulk-actions.tsx",
	"apps/app/app/(app)/[slug]/deals/deals-bulk-actions.tsx",
];

const GOI_LUU_TRU =
	/trpc(?:\.(?:contacts|companies|deals)|\[RECORD_PROCEDURES\[[^\]]+\]\])\.(?:bulkArchive|archive)\.mutationOptions/;
const CO_HOAN_TAC = /\bbaoDaLuuTru\(|\bbaoLuuTruLoat\(/;

function quet(thuMuc, ra) {
	for (const ten of readdirSync(thuMuc)) {
		if (ten === "node_modules" || ten === "test" || ten.startsWith("."))
			continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) quet(duong, ra);
		else if (ten.endsWith(".tsx")) ra.push(duong);
	}
	return ra;
}

const tep = quet(APP, []);
let gia = null;
if (CHIEU_DO) {
	const noi = mkdtempSync(join(tmpdir(), "vdc-duong-"));
	gia = join(noi, "luu-tru-tran.tsx");
	writeFileSync(
		gia,
		"const archive = useMutation(trpc.contacts.bulkArchive.mutationOptions({ onSuccess: (r) => reportBulk(r) }));\n",
	);
	tep.push(gia);
}

const tim = [];
for (const t of tep) {
	const noiDung = readFileSync(t, "utf8");
	if (!GOI_LUU_TRU.test(noiDung)) continue;
	const ten = t === gia ? "(tep gia chieu do)" : relative(GOC, t);
	tim.push({ ten, hoanTac: CO_HOAN_TAC.test(noiDung) });
}
if (gia) rmSync(dirname(gia), { recursive: true, force: true });

const loi = [];
const thay = new Set(tim.map((x) => x.ten));
for (const muc of MA_TRAN)
	if (!thay.has(muc))
		loi.push(`duong-luu-tru: cho trong ma tran khong con goi luu tru: ${muc}`);
for (const x of tim) {
	console.log(`  ${x.ten} -> ${x.hoanTac ? "co Hoan tac" : "KHONG Hoan tac"}`);
	if (!MA_TRAN.includes(x.ten))
		loi.push(`duong-luu-tru: cho luu tru moi chua khai: ${x.ten}`);
	if (!x.hoanTac) loi.push(`duong-luu-tru: cho khong co hoan tac: ${x.ten}`);
}
const dat = tim.filter((x) => MA_TRAN.includes(x.ten) && x.hoanTac).length;
console.log(`  ${dat}/${MA_TRAN.length} cho trong ma tran co Hoan tac`);
for (const l of loi) console.log(`  SAI ${l}`);
if (loi.length > 0) {
	console.log(`${HO_SO} duong-luu-tru: hong ${loi.length}`);
	process.exit(1);
}
console.log(`${HO_SO} duong-luu-tru: dat`);
