#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const DAY = fileURLToPath(new URL(".", import.meta.url));
const GOC = resolve(DAY, "..", "..", "..");
const VUNG = join(GOC, "apps", "api", "src", "onboarding");
const CAU_HINH = join(VUNG, "onboarding-config.ts");
const CAU_HINH_NHAC = join(GOC, "packages", "db", "src", "onboarding-nhac.ts");

const NGUONG = new Set([30, 7]);

function tepTs(thuMuc) {
	const ra = [];
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) ra.push(...tepTs(duong));
		else if (muc.name.endsWith(".ts")) ra.push(duong);
	}
	return ra;
}

function soGhim(duong) {
	const nguon = readFileSync(duong, "utf8");
	const cay = ts.createSourceFile(duong, nguon, ts.ScriptTarget.Latest, true);
	const thay = [];

	const di = (nut) => {
		if (ts.isNumericLiteral(nut) && NGUONG.has(Number(nut.text))) {
			const cha = nut.parent;
			const laKhoiTao =
				ts.isVariableDeclaration(cha) ||
				ts.isPropertyAssignment(cha) ||
				ts.isBinaryExpression(cha) ||
				ts.isPropertyDeclaration(cha);
			if (laKhoiTao) {
				const { line } = cay.getLineAndCharacterOfPosition(nut.getStart(cay));
				thay.push({ so: Number(nut.text), dong: line + 1 });
			}
		}
		ts.forEachChild(nut, di);
	};
	di(cay);
	return thay;
}

const tep = tepTs(VUNG);
if (tep.length === 0) {
	console.error(
		"hang-so-o-config: khong nap duoc tep nguon nao duoi",
		relative(GOC, VUNG),
	);
	process.exit(2);
}

const viPham = [];
for (const duong of tep) {
	if (resolve(duong) === resolve(CAU_HINH)) continue;
	for (const t of soGhim(duong)) {
		viPham.push(`${relative(GOC, duong)}:${t.dong} ghim so ${t.so}`);
	}
}

const nguonCauHinh = readFileSync(CAU_HINH, "utf8");
const nguonNhac = readFileSync(CAU_HINH_NHAC, "utf8");
const khaiDu =
	/defaultTargetDays:\s*30\b/.test(nguonCauHinh) &&
	/imSauNgay:\s*7\b/.test(nguonNhac);
if (!khaiDu) {
	console.error(
		"hang-so-o-config: KHONG khai du hai nguong — 30 o onboarding-config.ts (defaultTargetDays), 7 o packages/db/src/onboarding-nhac.ts (NHAC.imSauNgay)",
	);
	process.exit(1);
}

const coNguoiDung = tep.some(
	(duong) =>
		resolve(duong) !== resolve(CAU_HINH) &&
		/from\s+"\.\/onboarding-config"/.test(readFileSync(duong, "utf8")),
);
if (!coNguoiDung) {
	console.error(
		"hang-so-o-config: khong tep nao import tu onboarding-config.ts — cau hinh la trang tri",
	);
	process.exit(1);
}

if (viPham.length > 0) {
	console.error("hang-so-o-config: co hang so ghim ngoai cau hinh");
	for (const d of viPham) console.error("  " + d);
	process.exit(1);
}

console.log(
	`hang-so-o-config: sach — ${tep.length} tep quet, 0 ghim ngoai cau hinh, cau hinh co nguoi dung`,
);
