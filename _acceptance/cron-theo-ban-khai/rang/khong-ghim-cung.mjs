import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { GOC } from "./chung.mjs";

const doi = process.argv.slice(2);
const iFile = doi.indexOf("--file");
const DUONG =
	iFile === -1
		? join(GOC, "apps", "api", "scripts", "build-func.mjs")
		: doi[iFile + 1];

const chu = readFileSync(DUONG, "utf8");
const nguon = ts.createSourceFile(
	DUONG,
	chu,
	ts.ScriptTarget.Latest,
	true,
	ts.ScriptKind.JS,
);

const ghim = [];
const di = (nut) => {
	if (ts.isObjectLiteralExpression(nut)) {
		const khoa = nut.properties
			.filter((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name))
			.map((p) => p.name.text);
		if (khoa.includes("path") && khoa.includes("schedule"))
			ghim.push(
				nguon.getLineAndCharacterOfPosition(nut.getStart(nguon)).line + 1,
			);
	}
	ts.forEachChild(nut, di);
};
di(nguon);

console.log(`soi ${DUONG}`);
console.log(`object literal mang ca hai khoa path+schedule: ${ghim.length}`);

if (ghim.length > 0) {
	console.error("DO: con danh sach cron ghim cung trong ma:");
	for (const d of ghim) console.error(`  ${DUONG}:${d}`);
	process.exit(1);
}

if (!/vercel\.json/.test(chu)) {
	console.error(
		"MA 2: script dung khong he nhac toi vercel.json — no khong ghim cung, nhung cung khong doc ban khai",
	);
	process.exit(2);
}

console.log("XANH: khong cron nao ghim cung, va script co doc vercel.json.");
