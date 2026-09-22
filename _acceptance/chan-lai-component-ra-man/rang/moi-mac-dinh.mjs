import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ts = createRequire(import.meta.url)("typescript");

export const GOC = [
	"packages/ui/src",
	"apps/app/components",
	"apps/app/lib",
	"apps/app/app",
];
export const LOAI_TRU = ["node_modules", ".next", "dist", "build"];

function diCay(thuMuc, ra) {
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.includes(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, ra);
		else if (/\.tsx?$/.test(ten)) ra.push(duong);
	}
	return ra;
}

export function docFile(goc) {
	return GOC.flatMap((g) => {
		try {
			return diCay(join(goc, g), []).map((p) => p.slice(goc.length + 1));
		} catch {
			return [];
		}
	});
}

export function docMacDinh(goc) {
	const ra = [];
	for (const tuongDoi of docFile(goc)) {
		const nguon = readFileSync(join(goc, tuongDoi), "utf8");
		const sf = ts.createSourceFile(
			tuongDoi,
			nguon,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);
		const di = (n) => {
			if (ts.isBindingElement(n) && n.initializer) {
				const gt = n.initializer;
				if (ts.isStringLiteral(gt) && /\p{L}/u.test(gt.text)) {
					const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
					ra.push({
						file: tuongDoi,
						dong: line + 1,
						tham_so: n.name.getText(sf),
						gia_tri: gt.text,
					});
				}
			}
			ts.forEachChild(n, di);
		};
		di(sf);
	}
	return ra;
}
