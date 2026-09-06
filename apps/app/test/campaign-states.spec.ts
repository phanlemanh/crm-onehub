import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import type * as TS from "typescript";
import {
	createState,
	listState,
} from "@/app/(app)/[slug]/campaigns/campaign-state";
import { campaignMessages } from "@/lib/messages/campaigns";

const ts: typeof TS = createRequire(import.meta.url)("typescript");

const MAN = join(import.meta.dir, "..", "app", "(app)", "[slug]", "campaigns");

type Nhanh = ReadonlyMap<string, readonly string[]>;

function laGoi(nut: TS.Node, ten: string): boolean {
	return (
		ts.isCallExpression(nut) &&
		ts.isIdentifier(nut.expression) &&
		nut.expression.text === ten
	);
}

function chuoiTruyCap(nut: TS.Node): string[] | null {
	if (ts.isIdentifier(nut)) return [nut.text];
	if (ts.isPropertyAccessExpression(nut)) {
		const truoc = chuoiTruyCap(nut.expression);
		return truoc === null ? null : [...truoc, nut.name.text];
	}

	return null;
}

function khoaChuoi(than: TS.Node): string[] {
	const ra: string[] = [];
	const duyet = (nut: TS.Node) => {
		if (
			ts.isPropertyAccessExpression(nut) &&
			!(
				ts.isPropertyAccessExpression(nut.parent) &&
				nut.parent.expression === nut
			)
		) {
			const chuoi = chuoiTruyCap(nut);
			if (chuoi !== null && chuoi[0] === "m" && chuoi.length > 1) {
				ra.push(chuoi.slice(1).join("."));
			}
		}
		ts.forEachChild(nut, duyet);
	};
	duyet(than);

	return ra;
}

function nhanhTheoTrangThai(tep: string, tenHam: string): Nhanh {
	const nguon = readFileSync(join(MAN, tep), "utf8");
	const cay = ts.createSourceFile(
		tep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);

	const bienTuHam = new Set<string>();
	const timBien = (nut: TS.Node) => {
		if (
			ts.isVariableDeclaration(nut) &&
			ts.isIdentifier(nut.name) &&
			nut.initializer !== undefined &&
			laGoi(nut.initializer, tenHam)
		) {
			bienTuHam.add(nut.name.text);
		}
		ts.forEachChild(nut, timBien);
	};
	timBien(cay);

	const ra = new Map<string, readonly string[]>();
	const timNhanh = (nut: TS.Node) => {
		if (ts.isIfStatement(nut) && ts.isBinaryExpression(nut.expression)) {
			const { left, operatorToken, right } = nut.expression;
			const noiVaoHam =
				laGoi(left, tenHam) ||
				(ts.isIdentifier(left) && bienTuHam.has(left.text));

			if (
				noiVaoHam &&
				operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
				ts.isStringLiteral(right)
			) {
				ra.set(right.text, khoaChuoi(nut.thenStatement));
			}
		}
		ts.forEachChild(nut, timNhanh);
	};
	timNhanh(cay);

	return ra;
}

const m = campaignMessages("vi");

const KHO = new Map<string, string>([
	["title", m.title],
	["empty.list", m.empty.list],
	["empty.noViews", m.empty.noViews],
	["empty.members", m.empty.members],
	["empty.noPhone", m.empty.noPhone],
	["loading.list", m.loading.list],
	["loading.members", m.loading.members],
	["create.segment", m.create.segment],
	["create.segmentHint", m.create.segmentHint],
	["create.openContacts", m.create.openContacts],
]);

function cauHienRa(nhanh: Nhanh, ma: string, tep: string): string[] {
	const khoa = nhanh.get(ma);
	if (khoa === undefined) {
		throw new Error(`${tep} không còn nhánh nào cho trạng thái "${ma}".`);
	}

	return khoa
		.map(
			(duong) =>
				KHO.get(duong) ?? `${tep} vẽ m.${duong}, bài chưa khai chuỗi đó`,
		)
		.sort();
}

describe("trạng thái hai màn chiến dịch", () => {
	it("không có dòng nào thì là rỗng, có dòng thì là danh sách", () => {
		expect(listState([], false)).toBe("empty");
		expect(listState([{ id: "a" }], false)).toBe("rows");
		expect(listState([], true)).toBe("loading");
	});

	it("chưa có góc nhìn cá nhân dùng chung thì hộp tạo nói thẳng", () => {
		expect(createState([])).toBe("no-views");
		expect(createState([{ id: "v1" }])).toBe("ready");
	});

	it("E25 · ba trạng thái đơn vị nối đúng câu chữ màn hiện ra", () => {
		const bang = nhanhTheoTrangThai("campaigns-table.tsx", "listState");
		const hop = nhanhTheoTrangThai("create-campaign-sheet.tsx", "createState");

		expect(cauHienRa(bang, listState([], true), "campaigns-table.tsx")).toEqual(
			[m.loading.list].sort(),
		);
		expect(
			cauHienRa(bang, listState([], false), "campaigns-table.tsx"),
		).toEqual([m.title, m.empty.list].sort());
		expect(
			cauHienRa(hop, createState([]), "create-campaign-sheet.tsx"),
		).toEqual(
			[m.empty.noViews, m.create.segmentHint, m.create.openContacts].sort(),
		);
	});
});
