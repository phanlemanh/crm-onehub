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

const MIEN = new Set(["apps/app/app/layout.tsx"]);

const THE_KHAI = /<\s*([A-Za-z][\w.]*)\b((?:[^<>]|=>)*?)\blang\s*=/g;

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

const tep = execFileSync("git", ["-C", GOC, "ls-files", "apps/app"], {
	encoding: "utf8",
})
	.trim()
	.split("\n")
	.filter((t) => t.endsWith(".tsx"));

const coForeignText = [];
const conVietTay = [];

for (const t of tep) {
	const noi_dung = readFileSync(join(GOC, t), "utf8");
	let coTrongTep = false;

	for (const cho of cacCho(noi_dung)) {
		if (cho.the === "ForeignText") {
			coTrongTep = true;
			continue;
		}
		if (MIEN.has(t)) continue;
		conVietTay.push(`${t}:${dong(noi_dung, cho.vi_tri)} <${cho.the}>`);
	}

	if (coTrongTep) coForeignText.push(t);
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
	`-- MIEN (khong phai cho khai phan, khong tinh la viet tay): ${[...MIEN].join(" · ")}`,
);
console.log(`-- TIM THAY ${coForeignText.length} tep di qua ForeignText:`);
for (const t of coForeignText) console.log(`     ${t}`);

for (const t of thieu) console.log(`   THIEU: ${t}`);
for (const t of thua) console.log(`   THUA (ngoai ban kiem ke): ${t}`);
for (const c of conVietTay) console.log(`   CON VIET TAY: ${c}`);

const hong =
	(coForeignText.length === CHIN ? 0 : 1) +
	thieu.length +
	thua.length +
	conVietTay.length;

console.log(
	`ket qua: so tep=${coForeignText.length} (can ${CHIN}) · thieu=${thieu.length} · thua=${thua.length} · con viet tay=${conVietTay.length}`,
);

process.exit(hong > 0 ? 1 : 0);
