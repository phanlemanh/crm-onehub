import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CHAN_UI } from "../../ho-so-khai-dung-tieng/rang/bang-dot-bien.mjs";
import { bang, chay, GOC, ghim, giuKhoa } from "./chung.mjs";

const nhaKhoa = await giuKhoa("ho-so-cu-van-xanh");
process.on("exit", nhaKhoa);

const GOC_VONG = "32491c87";
const VUNG = "_acceptance/ho-so-khai-dung-tieng/evidence/vung-khai.json";

const SAN_PHAM = [
	"packages/ui/src/components/foreign-text.tsx",
	"apps/app/components/crm/record-sheet/record-parts.tsx",
	"apps/app/components/crm/record-sheet/company-sheet.tsx",
	"apps/app/components/crm/record-sheet/contact-sheet.tsx",
	"apps/app/components/crm/timeline/timeline-entry.tsx",
	"apps/app/components/crm/timeline/timeline.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-table.tsx",
	"apps/app/app/(app)/[slug]/sales-dashboard.tsx",
	"apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
	"apps/app/components/crm/stage-stepper.tsx",
	"apps/app/components/crm/deal-stage.tsx",
];

const CHAN = [
	...CHAN_UI.map((c) => ({
		ten: c,
		lenh: "bun",
		doi_so: ["_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs", c],
	})),
	{
		ten: "mot-duong",
		lenh: "bun",
		doi_so: ["_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs"],
	},
	{
		ten: "hoi-quy-nam-cho",
		lenh: "bun",
		doi_so: ["_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs"],
	},
];

console.log(
	"-- Loi hua trung tam cua vong nay: THUOC doi, SAN PHAM khong doi.\n" +
		`-- HANG GHIM chep tay tu hop dong: ${SAN_PHAM.length} tep san pham.\n` +
		`-- Ve (a): chay lai ${CHAN.length} chan cua ho so cu, goi ten tung cai.`,
);
ghim("so tep san pham", SAN_PHAM.length, 11);

let hong = 0;
const hang = [];

for (const c of CHAN) {
	const r = chay(c.lenh, c.doi_so);
	if (r.ma !== 0) {
		hang.push(`DO   [ho-so-cu-do:${c.ten}] ma thoat ${r.ma}`);
		hong += 1;
	} else {
		hang.push(`xanh ${c.ten}`);
	}
}

const vung = JSON.parse(readFileSync(join(GOC, VUNG), "utf8"));
let lech = 0;
for (const [ten, m] of Object.entries(vung)) {
	if (Array.isArray(m.cho)) {
		const xau = m.cho.filter((x) => x.boc !== m.mong_boc).length;
		if (xau > 0) {
			hang.push(`BANG CHUNG LECH [bang-chung-con-lech:${ten}] ${xau} cho`);
			lech += xau;
		}
	}
	if (Array.isArray(m.tieng_viet_lot) && m.tieng_viet_lot.length > 0) {
		hang.push(
			`TIENG VIET LOT [bang-chung-con-lech:${ten}] ${m.tieng_viet_lot.length} chuoi`,
		);
		lech += m.tieng_viet_lot.length;
	}
}
hong += lech;
hang.push(`bang chung: ${lech} cho lech tren ${Object.keys(vung).length} muc`);

console.log(
	`\n-- Ve (b): diff ${GOC_VONG}..HEAD co cham tep san pham nao khong.`,
);
const doi = [
	...new Set([
		...execFileSync("git", ["-C", GOC, "diff", "--name-only", GOC_VONG], {
			encoding: "utf8",
		})
			.trim()
			.split("\n"),
		...execFileSync(
			"git",
			["-C", GOC, "ls-files", "--others", "--exclude-standard"],
			{ encoding: "utf8" },
		)
			.trim()
			.split("\n"),
	]),
].filter((d) => d !== "");

ghim("diff phai KHAC RONG", doi.length > 0, true);
console.log(
	`   ${doi.length} tep doi so voi ${GOC_VONG}, KE CA thay doi chua commit va tep chua theo doi.\n` +
		"   Ban cu dung `${GOC_VONG}...HEAD` — chi lich su DA COMMIT — nen phep pha ma ban\n" +
		"   khai cho ve nay (sua mot dong trong foreign-text.tsx) khong the kich hoat: no\n" +
		"   sua cay lam viec, ma phep do khong nhin cay lam viec. Va khong doi chung duong\n" +
		'   nao: mot khoang diff RONG cung cho ra "RONG" va xanh. Hoi dong S4 vong 3 bat.',
);
const giao = doi.filter((d) => SAN_PHAM.includes(d));
if (giao.length > 0) {
	for (const g of giao) hang.push(`CHAM SAN PHAM [cham-san-pham:${g}]`);
	hong += giao.length;
} else {
	hang.push(
		`diff ${doi.length} tep, giao voi ${SAN_PHAM.length} tep san pham: RONG`,
	);
}

bang("-- Ket qua:", hang);
console.log(`ket qua: ${hong} cho hong`);
process.exit(hong > 0 ? 1 : 0);
