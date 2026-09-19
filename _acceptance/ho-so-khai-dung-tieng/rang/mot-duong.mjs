import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const CHIN = 9;

const KIEM_KE = [
	"apps/app/components/crm/record-sheet/company-sheet.tsx",
	"apps/app/components/crm/record-sheet/contact-sheet.tsx",
	"apps/app/components/crm/record-sheet/record-parts.tsx",
	"apps/app/components/crm/timeline/timeline-entry.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-table.tsx",
	"apps/app/app/(app)/[slug]/sales-dashboard.tsx",
	"apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
	"apps/app/components/crm/stage-stepper.tsx",
	"apps/app/components/crm/deal-stage.tsx",
];

const MIEN = [
	{ tep: "apps/app/app/layout.tsx", the: "html" },
	{ tep: "apps/app/app/layout.tsx", the: "InlineScript" },
];

function duocMien(tep, the) {
	return MIEN.some((m) => m.tep === tep && m.the === the);
}

const THE_KHAI = /<\s*([A-Za-z][\w.]*)\b((?:[^<>]|=>)*?)\blang\s*=/g;

const NHAP_UI =
	/import\s*\{[^}]*\bForeignText\b[^}]*\}\s*from\s*["']@crm\/ui\/components\/foreign-text["']/s;

function cacCho(noi_dung) {
	const ra = [];
	for (const m of noi_dung.matchAll(THE_KHAI)) {
		const truoc = m[2] ?? "";
		if (/[-\w]$/.test(truoc)) continue;
		ra.push({ the: m[1], vi_tri: m.index });
	}
	return ra;
}

function dong(noi_dung, vi_tri) {
	return noi_dung.slice(0, vi_tri).split("\n").length;
}

const tep = execFileSync(
	"git",
	[
		"-C",
		GOC,
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		"apps/app",
	],
	{ encoding: "utf8" },
)
	.trim()
	.split("\n")
	.filter((t) => t.endsWith(".tsx"));

const coForeignText = [];
const conVietTay = [];
const nhapSai = [];

for (const t of tep) {
	const noi_dung = readFileSync(join(GOC, t), "utf8");
	let coTrongTep = false;

	for (const cho of cacCho(noi_dung)) {
		if (cho.the === "ForeignText") {
			coTrongTep = true;
			continue;
		}
		if (duocMien(t, cho.the)) continue;
		conVietTay.push(`${t}:${dong(noi_dung, cho.vi_tri)} <${cho.the}>`);
	}

	if (coTrongTep) {
		if (NHAP_UI.test(noi_dung)) {
			coForeignText.push(t);
		} else {
			nhapSai.push(t);
		}
	}
}

const thieu = KIEM_KE.filter((t) => !coForeignText.includes(t));
const thua = coForeignText.filter((t) => !KIEM_KE.includes(t));

console.log(
	`-- MA TRAN TOAN PHAN: hang so ${CHIN}, chep tu muc "Chin cho" cua hop dong.`,
);
console.log(
	`   So khang dinh = ${CHIN}, khong phai dem-duoc-bao-nhieu-assert-bay-nhieu.`,
);
console.log(
	"-- MIEN theo CAP (tep, the) — khong mien ca tep:\n" +
		MIEN.map((m) => `     ${m.tep} <${m.the}>`).join("\n"),
);
console.log(
	"-- QUAN HE (AC-6b): tep ve <ForeignText> phai NHAP no tu @crm/ui/components/foreign-text.\n" +
		"   Trung ten the la chua du — mot component cung ten dinh nghia tai cho se lot.",
);
console.log(`-- TIM THAY ${coForeignText.length} tep di qua ForeignText:`);
for (const t of coForeignText) console.log(`     ${t}`);

for (const t of thieu) console.log(`   THIEU: ${t}`);
for (const t of thua) console.log(`   THUA (ngoai ban kiem ke): ${t}`);
for (const c of conVietTay) console.log(`   CON VIET TAY: ${c}`);
for (const t of nhapSai) {
	console.log(
		`   VE <ForeignText> MA KHONG NHAP TU @crm/ui: ${t}
` +
			"      AC-6(b) hua QUAN HE (di qua component cua goi dung chung), khong hua trung TEN THE.",
	);
}

const hong =
	(coForeignText.length === CHIN ? 0 : 1) +
	thieu.length +
	thua.length +
	conVietTay.length +
	nhapSai.length;

console.log(
	`ket qua: so tep=${coForeignText.length} (can ${CHIN}) · thieu=${thieu.length} · thua=${thua.length} · con viet tay=${conVietTay.length} · nhap sai=${nhapSai.length}`,
);

process.exit(hong > 0 ? 1 : 0);
