import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { docKhai, GOC } from "./chung.mjs";

const PHUONG_THUC = ["Get", "Post", "Put", "Patch", "Delete"];

const doi = process.argv.slice(2);
const iSrc = doi.indexOf("--src");
const SRC = iSrc === -1 ? join(GOC, "apps", "api", "src") : doi[iSrc + 1];

function quet(thuMuc, ra = []) {
	for (const ten of readdirSync(thuMuc)) {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) quet(duong, ra);
		else if (ten.endsWith(".ts")) ra.push(duong);
	}
	return ra;
}

function tenTrangTri(nut, ten) {
	for (const d of ts.getDecorators(nut) ?? []) {
		const e = d.expression;
		if (
			ts.isCallExpression(e) &&
			ts.isIdentifier(e.expression) &&
			e.expression.text === ten
		) {
			const a = e.arguments[0];
			return a && ts.isStringLiteral(a) ? a.text : "";
		}
	}
	return undefined;
}

export function bangRoute() {
	const bang = new Map();
	for (const duong of quet(SRC)) {
		const chu = readFileSync(duong, "utf8");
		if (!chu.includes("@Controller")) continue;
		const nguon = ts.createSourceFile(
			duong,
			chu,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TS,
		);
		const di = (nut) => {
			if (ts.isClassDeclaration(nut)) {
				const prefix = tenTrangTri(nut, "Controller");
				if (prefix !== undefined && prefix.startsWith("internal")) {
					for (const m of nut.members) {
						if (!ts.isMethodDeclaration(m) || !ts.isIdentifier(m.name))
							continue;
						for (const p of PHUONG_THUC) {
							const sub = tenTrangTri(m, p);
							if (sub === undefined) continue;
							const duongRoute = `/${prefix}${sub ? `/${sub}` : ""}`;
							const da = bang.get(duongRoute) ?? [];
							da.push({ file: duong, ham: m.name.text, nut: m });
							bang.set(duongRoute, da);
						}
					}
				}
			}
			ts.forEachChild(nut, di);
		};
		di(nguon);
	}
	return bang;
}

if (import.meta.main) {
	const bang = bangRoute();
	const timDuoc = [...bang.keys()].sort();
	console.log(`route /internal/* tim duoc tren dia: ${timDuoc.length}`);
	for (const d of timDuoc) console.log(`  ${d}`);

	if (timDuoc.length === 0) {
		console.error(
			"MA 2: khong quet duoc route nao — tap rong khong bao gio la xanh",
		);
		process.exit(2);
	}

	const khai = docKhai().crons.map((c) => c.path);
	const thieu = khai.filter((p) => !bang.has(p));
	console.log(
		`path trong ban khai: ${khai.length} · thieu route: ${thieu.length}`,
	);

	if (thieu.length > 0) {
		console.error(
			"DO: co path trong ban khai khong tro toi route nao co that:",
		);
		for (const p of thieu) console.error(`  ${p}`);
		console.error(`  route co that: ${timDuoc.join(" ")}`);
		process.exit(1);
	}

	const BI_DANH = "/internal/sync/google";
	if (!bang.has(BI_DANH)) {
		console.error(
			`MA 2: khong thay ${BI_DANH} tren dia — bo quet dang bat thieu, vi bi danh nay chinh la cai dang chay tren ban that`,
		);
		process.exit(2);
	}

	console.log(
		`XANH: ca ${khai.length} path cua ban khai deu tro toi mot route co that, va bo quet bat duoc ca bi danh ${BI_DANH}.`,
	);
}
