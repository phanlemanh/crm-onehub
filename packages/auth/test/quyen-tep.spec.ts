import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type { WorkspaceRole } from "../src/roles";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG = ["apps/api/src/fields", "apps/app/components/crm/fields"];
const PHAI_GOI = [
	{ tep: "apps/api/src/fields/field-files.service.ts", ham: "downloadUrl" },
	{ tep: "apps/api/src/fields/fields.service.ts", ham: "tepTheoBanGhi" },
];

async function napLuat() {
	try {
		return await import("../src/quyen-tep");
	} catch {
		throw new Error("tcb ham: thieu quyenMoTep");
	}
}

type Vai = WorkspaceRole | null;
type QuanHe = "chinh-minh" | "nguoi-khac" | "chua-co";
const VAI: Vai[] = ["owner", "admin", "member", "okr", null];
const QUAN_HE: QuanHe[] = ["chinh-minh", "nguoi-khac", "chua-co"];

const DAP_AN_MO = new Map<string, string>([
	["owner chinh-minh", "mo"],
	["owner nguoi-khac", "mo"],
	["owner chua-co", "mo"],
	["admin chinh-minh", "mo"],
	["admin nguoi-khac", "mo"],
	["admin chua-co", "mo"],
	["member chinh-minh", "mo"],
	["member nguoi-khac", "khong-phu-trach"],
	["member chua-co", "chua-co-phu-trach"],
	["okr chinh-minh", "ngoai-pham-vi"],
	["okr nguoi-khac", "ngoai-pham-vi"],
	["okr chua-co", "ngoai-pham-vi"],
	["null chinh-minh", "ngoai-pham-vi"],
	["null nguoi-khac", "ngoai-pham-vi"],
	["null chua-co", "ngoai-pham-vi"],
]);

const DAP_AN_XOA = new Map<string, boolean>([
	["owner chinh-minh toi", true],
	["owner chinh-minh khac", true],
	["owner nguoi-khac toi", true],
	["owner nguoi-khac khac", true],
	["owner chua-co toi", true],
	["owner chua-co khac", true],
	["admin chinh-minh toi", true],
	["admin chinh-minh khac", true],
	["admin nguoi-khac toi", true],
	["admin nguoi-khac khac", true],
	["admin chua-co toi", true],
	["admin chua-co khac", true],
	["member chinh-minh toi", true],
	["member chinh-minh khac", true],
	["member nguoi-khac toi", true],
	["member nguoi-khac khac", false],
	["member chua-co toi", true],
	["member chua-co khac", false],
	["okr chinh-minh toi", false],
	["okr chinh-minh khac", false],
	["okr nguoi-khac toi", false],
	["okr nguoi-khac khac", false],
	["okr chua-co toi", false],
	["okr chua-co khac", false],
	["null chinh-minh toi", false],
	["null chinh-minh khac", false],
	["null nguoi-khac toi", false],
	["null nguoi-khac khac", false],
	["null chua-co toi", false],
	["null chua-co khac", false],
]);

const TOI = "nguoi-goi";
const phuTrachTheo = (q: QuanHe) =>
	q === "chinh-minh" ? TOI : q === "nguoi-khac" ? "nguoi-khac" : null;

function tepTrongVung(): string[] {
	const ket: string[] = [];
	const di = (thuMuc: string) => {
		for (const ten of readdirSync(thuMuc)) {
			const duong = join(thuMuc, ten);
			if (statSync(duong).isDirectory()) di(duong);
			else if (/\.(ts|tsx)$/.test(ten)) ket.push(duong);
		}
	};
	for (const v of VUNG) di(join(GOC, v));
	return ket;
}

const TEN_LUAT_VAI = new Set(["isWorkspaceAdmin", "laQuanTriWorkspace"]);
const CHU_VAI = new Set(["owner", "admin"]);

function luatThuHai(tenTep: string, nguon: string): string[] {
	const sf = ts.createSourceFile(tenTep, nguon, ts.ScriptTarget.Latest, true);
	const loi: string[] = [];
	const dong = (n: ts.Node) =>
		sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
	const xem = (n: ts.Node) => {
		if (
			ts.isCallExpression(n) &&
			ts.isIdentifier(n.expression) &&
			TEN_LUAT_VAI.has(n.expression.text)
		) {
			loi.push(`${tenTep}:${dong(n)}`);
		}
		if (
			ts.isBinaryExpression(n) &&
			[
				ts.SyntaxKind.EqualsEqualsEqualsToken,
				ts.SyntaxKind.ExclamationEqualsEqualsToken,
			].includes(n.operatorToken.kind) &&
			[n.left, n.right].some(
				(v) => ts.isStringLiteral(v) && CHU_VAI.has(v.text),
			)
		) {
			loi.push(`${tenTep}:${dong(n)}`);
		}
		ts.forEachChild(n, xem);
	};
	xem(sf);
	return loi;
}

function hamGoiLuat(tenTep: string, nguon: string, ham: string): boolean {
	const sf = ts.createSourceFile(tenTep, nguon, ts.ScriptTarget.Latest, true);
	let thay = false;
	const xem = (n: ts.Node) => {
		if (
			ts.isMethodDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.name.text === ham &&
			n.body
		) {
			const goi = (m: ts.Node): void => {
				if (
					ts.isCallExpression(m) &&
					((ts.isIdentifier(m.expression) &&
						m.expression.text === "quyenMoTep") ||
						(ts.isPropertyAccessExpression(m.expression) &&
							m.expression.name.text === "quyenMoTep"))
				) {
					thay = true;
				}
				ts.forEachChild(m, goi);
			};
			goi(n.body);
		}
		ts.forEachChild(n, xem);
	};
	xem(sf);
	return thay;
}

describe("tcb-ham", () => {
	it("tcb-ham: bảng chân lý của quyenMoTep và coTheXoaTep", async () => {
		const { quyenMoTep, coTheXoaTep } = await napLuat();
		let soMo = 0;
		for (const vai of VAI) {
			for (const q of QUAN_HE) {
				const o = `${vai} ${q}`;
				const kq = quyenMoTep({
					vai,
					userId: TOI,
					phuTrachId: phuTrachTheo(q),
				});
				const thay = kq.coTheMo ? "mo" : kq.lyDo;
				if (thay !== DAP_AN_MO.get(o)) {
					throw new Error(`tcb ham: ${vai} ${q} ${thay}`);
				}
				soMo += 1;
			}
		}
		if (soMo !== 15) throw new Error(`tcb ham: thieu o ${soMo}`);

		let soXoa = 0;
		for (const vai of VAI) {
			for (const q of QUAN_HE) {
				for (const tai of ["toi", "khac"] as const) {
					const o = `${vai} ${q} ${tai}`;
					const kq = coTheXoaTep({
						vai,
						userId: TOI,
						phuTrachId: phuTrachTheo(q),
						taiBoiId: tai === "toi" ? TOI : "nguoi-tai-khac",
					});
					if (kq !== DAP_AN_XOA.get(o)) {
						throw new Error(`tcb ham: xoa ${o} ${kq}`);
					}
					soXoa += 1;
				}
			}
		}
		if (soXoa !== 30) throw new Error(`tcb ham: thieu o xoa ${soXoa}`);
	});

	it("tcb-ham: không chỗ nào khác tính quyền tệp, và hai nơi đọc đều gọi quyenMoTep", () => {
		const tep = tepTrongVung();
		expect(tep.length).toBeGreaterThan(0);
		for (const duong of tep) {
			const loi = luatThuHai(relative(GOC, duong), readFileSync(duong, "utf8"));
			if (loi.length > 0) throw new Error(`tcb ham: luat thu hai ${loi[0]}`);
		}
		for (const { tep: t, ham } of PHAI_GOI) {
			const nguon = readFileSync(join(GOC, t), "utf8");
			if (!hamGoiLuat(t, nguon, ham)) {
				throw new Error(`tcb ham: khong goi ${t}#${ham}`);
			}
		}

		const goc = readFileSync(
			join(GOC, "apps/api/src/fields/field-files.service.ts"),
			"utf8",
		);
		const sao = goc.replace(
			"async downloadUrl(",
			"private soCu(vai: string) { if (isWorkspaceAdmin(vai)) return true; return false; }\n\tasync downloadUrl(",
		);
		if (sao === goc) throw new Error("tcb ham: doi chung khong chen duoc");
		if (luatThuHai("ban-sao.ts", sao).length === 0) {
			throw new Error("tcb ham: quet mu");
		}
	});
});
