#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const chiSoGoc = process.argv.indexOf("--goc");
const GOC =
	chiSoGoc > 0 && process.argv[chiSoGoc + 1]
		? resolve(process.argv[chiSoGoc + 1])
		: resolve(HERE, "..", "..", "..");
const THANH_PHAN = join(GOC, "packages", "ui", "src", "components");
const CONFIRMATION = join(THANH_PHAN, "ai-elements", "confirmation.tsx");
const LUAT_CHAT = join(GOC, "docs", "chat-ui.md");
const SO_LECH = join(
	GOC,
	"_acceptance",
	"nen-chat-ai-elements",
	"so-lech-chuan.md",
);
const MO_COI = join(
	GOC,
	"_acceptance",
	"nen-chat-ai-elements",
	"rang",
	"mo-coi.mjs",
);
const TEN_CU = "Suggestion";

const ts = createRequire(join(GOC, "packages", "ui", "package.json"))(
	"typescript",
);

const loi = [];
const kiem = (dung, dong) => {
	console.log(`${dung ? "  ĐẠT" : "  ĐỎ "} ${dong}`);
	if (!dung) loi.push(dong);
};

function liet(thuMuc) {
	return readdirSync(thuMuc).flatMap((ten) => {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) return liet(duong);
		return /\.(tsx?|jsx?)$/.test(ten) ? [duong] : [];
	});
}

function coModifier(nut, loai) {
	return (ts.getModifiers?.(nut) ?? nut.modifiers ?? []).some(
		(m) => m.kind === loai,
	);
}

function tenXuat(duong) {
	const nguon = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const ten = [];
	for (const cau of nguon.statements) {
		if (
			ts.isExportDeclaration(cau) &&
			cau.exportClause &&
			ts.isNamedExports(cau.exportClause)
		) {
			for (const muc of cau.exportClause.elements) ten.push(muc.name.text);
			continue;
		}
		if (!coModifier(cau, ts.SyntaxKind.ExportKeyword)) continue;
		if (ts.isVariableStatement(cau)) {
			for (const k of cau.declarationList.declarations)
				if (ts.isIdentifier(k.name)) ten.push(k.name.text);
		} else if (cau.name && ts.isIdentifier(cau.name)) {
			ten.push(cau.name.text);
		}
	}
	return ten;
}

console.log(`RĂNG TÊN GỌI — the-gop-y-okr (gốc: ${GOC})`);

const THU_MUC_AI = join(THANH_PHAN, "ai-elements") + "/";
const tepXuatCu = liet(THANH_PHAN)
	.filter((t) => !t.startsWith(THU_MUC_AI))
	.filter((t) => tenXuat(t).includes(TEN_CU));
kiem(
	tepXuatCu.length === 0,
	tepXuatCu.length === 0
		? `packages/ui/src/components (ngoài ai-elements) không còn export tên ${TEN_CU}`
		: `con export ${TEN_CU}: ${tepXuatCu.map((t) => relative(GOC, t)).join(", ")}`,
);

kiem(existsSync(CONFIRMATION), "ai-elements/confirmation.tsx có trong cây");

const moCoi = spawnSync(process.execPath, [MO_COI], { encoding: "utf8" });
const raMoCoi = `${moCoi.stdout}${moCoi.stderr}`;
const dongSong = raMoCoi
	.split("\n")
	.find(
		(d) => /^\s+confirmation\.tsx — /.test(d) && !/MO COI|miễn trừ/.test(d),
	);
kiem(
	moCoi.status === 0 && dongSong !== undefined,
	dongSong
		? `cổng mồ côi thấy confirmation.tsx khả đạt từ apps/**: ${dongSong.trim()}`
		: `cổng mồ côi (mã ${moCoi.status}) không thấy confirmation.tsx khả đạt từ apps/**`,
);

const luat = readFileSync(LUAT_CHAT, "utf8");
const khoiAdopted = luat.slice(
	luat.indexOf("### Adopted"),
	luat.indexOf("### What is in the tree today"),
);
kiem(
	khoiAdopted.includes("`confirmation`"),
	"docs/chat-ui.md ghi confirmation trong khối Adopted",
);
const khoiTrongCay = luat.slice(
	luat.indexOf("### What is in the tree today"),
	luat.indexOf("### Available"),
);
kiem(
	/^\| `confirmation\.tsx` \|/m.test(khoiTrongCay),
	"docs/chat-ui.md có dòng confirmation.tsx trong bảng What is in the tree today",
);
const khoiAvailable = luat.slice(
	luat.indexOf("### Available"),
	luat.indexOf("### Not for this product"),
);
kiem(
	!khoiAvailable.includes("`confirmation`"),
	"docs/chat-ui.md không còn ghi confirmation là Available",
);

kiem(
	/^### confirmation\.tsx$/m.test(readFileSync(SO_LECH, "utf8")),
	"so-lech-chuan.md có mục cho confirmation.tsx",
);

if (loi.length > 0) {
	console.log(`\nRĂNG TÊN GỌI ĐỎ — ${loi.length} chỗ`);
	process.exit(1);
}
console.log("\nRĂNG TÊN GỌI XANH");
