import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chuCungTrongJsx } from "../../nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const ts = createRequire(import.meta.url)("typescript");

const GIAO_DIEN = [
	"apps/app/components/crm/agent-panel.tsx",
	"apps/app/components/crm/agent-conversations.tsx",
	"apps/app/components/agent-clarification-composer.tsx",
	"apps/app/components/agent-session-limit-composer.tsx",
	"apps/app/components/crm/facts.tsx",
	"apps/app/components/crm/enrichment-actions.tsx",
	"apps/app/components/crm/record-sheet/record-parts.tsx",
	"apps/app/components/crm/record-sheet/company-plans.tsx",
];
const NOI_DAY = "apps/app/lib/agent-record.ts";
const TEP = [...GIAO_DIEN, NOI_DAY];
const SO_TEP = 9;
const CAM = [
	"bun run dev",
	"AGENT_URL",
	"AGENT_BRIDGE_SECRET",
	"Start it with",
	"Set AGENT",
];
const SO_MUC_CAM = 5;

const CO_CHU = /\p{L}{2,}/u;
const DINH_DANH = /^[a-z][A-Za-z0-9]*(?:[-_][a-z0-9]+)*$/;

function ket(ma, dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

if (TEP.length !== SO_TEP || CAM.length !== SO_MUC_CAM) {
	ket(2, [
		`khong do duoc: danh sach viet truoc lech (${TEP.length} tep, ${CAM.length} muc cam)`,
	]);
}

const thieu = TEP.filter((tep) => !existsSync(join(GOC, tep)));
if (thieu.length > 0) {
	ket(
		2,
		thieu.map((tep) => `khong do duoc: thieu ${tep}`),
	);
}

function moTep(tep) {
	return ts.createSourceFile(
		tep,
		readFileSync(join(GOC, tep), "utf8"),
		ts.ScriptTarget.Latest,
		true,
		tep.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function moiChuoi(sf) {
	const ra = [];
	const di = (node) => {
		if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
			ra.push({ node, chu: node.text });
		} else if (ts.isTemplateExpression(node)) {
			ra.push({
				node,
				chu: [
					node.head.text,
					...node.templateSpans.map((s) => s.literal.text),
				].join(" "),
			});
		} else if (ts.isJsxText(node)) {
			ra.push({ node, chu: node.text });
		}
		ts.forEachChild(node, di);
	};
	di(sf);
	return ra;
}

const dong = (sf, node) =>
	sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

const jsx = chuCungTrongJsx(GIAO_DIEN.map((tep) => join(GOC, tep)));
const chuCung = new Map(TEP.map((tep) => [tep, []]));
for (const h of jsx.hit) {
	const tep = TEP.find((t) => h.file.endsWith(t));
	chuCung.get(tep)?.push(`${tep}:${h.dong} ${JSON.stringify(h.chu)}`);
}

const sfNoiDay = moTep(NOI_DAY);
for (const { node, chu } of moiChuoi(sfNoiDay)) {
	const t = chu.trim();
	if (!CO_CHU.test(t) || DINH_DANH.test(t)) continue;
	chuCung
		.get(NOI_DAY)
		?.push(`${NOI_DAY}:${dong(sfNoiDay, node)} ${JSON.stringify(t)}`);
}

let soPhepKiem = 0;
const goiY = new Map(TEP.map((tep) => [tep, []]));
for (const tep of TEP) {
	const sf = moTep(tep);
	const chuoi = moiChuoi(sf);
	soPhepKiem += CAM.length;
	for (const { node, chu } of chuoi) {
		const trung = CAM.filter((muc) => chu.includes(muc));
		if (trung.length > 0) {
			goiY
				.get(tep)
				?.push(
					`${tep}:${dong(sf, node)} chua ${trung.map((m) => `"${m}"`).join(", ")}`,
				);
		}
	}
}

const ra = [];
let tong = 0;
for (const tep of TEP) {
	const c = chuCung.get(tep) ?? [];
	const g = goiY.get(tep) ?? [];
	tong += c.length + g.length;
	ra.push(`${tep.split("/").at(-1)}: ${c.length} chu cung`);
	ra.push(`${tep.split("/").at(-1)}: ${g.length} goi y lap trinh vien`);
	ra.push(...c.map((x) => `  ${x}`), ...g.map((x) => `  ${x}`));
}
ra.push(`phep kiem goi y: ${soPhepKiem} (${SO_TEP} tep x ${SO_MUC_CAM} muc)`);
if (soPhepKiem !== SO_TEP * SO_MUC_CAM) {
	ket(2, [...ra, "khong do duoc: so phep kiem lech"]);
}
ra.push(`KET LUAN: ${tong} cho sai — ma thoat ${tong === 0 ? 0 : 1}`);
ket(tong === 0 ? 0 : 1, ra);
