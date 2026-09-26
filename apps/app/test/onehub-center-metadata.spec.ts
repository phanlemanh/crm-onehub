import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const LAYOUT = join(import.meta.dir, "..", "app", "layout.tsx");

function metadataThat() {
	const nguon = ts.createSourceFile(
		LAYOUT,
		readFileSync(LAYOUT, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const ra = new Map<string, string>();
	const docObject = (o: ts.ObjectLiteralExpression, tien: string) => {
		for (const p of o.properties) {
			if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
			const khoa = `${tien}${p.name.text}`;
			if (ts.isStringLiteral(p.initializer)) ra.set(khoa, p.initializer.text);
			if (ts.isObjectLiteralExpression(p.initializer))
				docObject(p.initializer, `${khoa}.`);
		}
	};
	const di = (n: ts.Node) => {
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.name.text === "metadata" &&
			n.initializer &&
			ts.isObjectLiteralExpression(n.initializer)
		) {
			docObject(n.initializer, "");
		}
		ts.forEachChild(n, di);
	};
	di(nguon);
	return ra;
}

const META = metadataThat();

describe("ten tab va manifest", () => {
	it("doc duoc metadata tu layout", () => {
		expect(META.size, "khong doc duoc metadata").toBeGreaterThan(0);
	});

	it("title mac dinh", () => {
		expect(META.get("title.default")).toBe("OneHub Center");
	});

	it("khuon title", () => {
		expect(META.get("title.template")).toBe("%s · OneHub Center");
	});

	it("manifest name", () => {
		const m = JSON.parse(
			readFileSync(
				join(import.meta.dir, "..", "public", "site.webmanifest"),
				"utf8",
			),
		);
		expect(m.name).toBe("OneHub Center");
	});
});
