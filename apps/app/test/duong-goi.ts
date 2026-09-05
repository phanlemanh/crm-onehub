import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type * as TS from "typescript";

const ts: typeof TS = createRequire(import.meta.url)("typescript");

const THU_MUC_KHO = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"lib",
	"messages",
);

const HAM_KHO = new Set(
	readdirSync(THU_MUC_KHO)
		.filter((t) => t.endsWith(".ts"))
		.flatMap((t) => {
			const nguon = readFileSync(join(THU_MUC_KHO, t), "utf8");
			return [...nguon.matchAll(/^export function ([A-Za-z0-9_]+)\s*\(/gm)].map(
				(m) => m[1],
			);
		}),
);

const GOC = "__KHO_CHUOI__";
const SAU_TOI_DA = 6;

export type DuongGoi = {
	readonly cap: ReadonlySet<string>;
	readonly don: ReadonlySet<string>;
	readonly congDong: ReadonlySet<string>;
};

type NganXep = Map<string, string[]>[];

const BO_QUA = ["/lib/messages", "/test", "/node_modules", "/.next"];

function tepNguon(goc: string): string[] {
	return readdirSync(goc, { recursive: true, withFileTypes: true })
		.filter((muc) => muc.isFile() && /\.tsx?$/.test(muc.name))
		.map((muc) => join(muc.parentPath, muc.name))
		.filter((duong) => {
			const rieng = `/${relative(goc, duong)}`;
			return !BO_QUA.some((bo) => rieng.includes(`${bo}/`));
		});
}

function chuoiTruyCap(nut: TS.Node): string[] | null {
	if (
		ts.isCallExpression(nut) &&
		ts.isIdentifier(nut.expression) &&
		HAM_KHO.has(nut.expression.text)
	)
		return [GOC];
	if (ts.isIdentifier(nut)) return [nut.text];
	if (ts.isPropertyAccessExpression(nut)) {
		const truoc = chuoiTruyCap(nut.expression);
		return truoc === null ? null : [...truoc, nut.name.text];
	}
	if (ts.isCallExpression(nut)) return chuoiTruyCap(nut.expression);
	return null;
}

function laPhamVi(nut: TS.Node): boolean {
	return (
		ts.isSourceFile(nut) ||
		ts.isBlock(nut) ||
		ts.isFunctionDeclaration(nut) ||
		ts.isArrowFunction(nut) ||
		ts.isFunctionExpression(nut) ||
		ts.isMethodDeclaration(nut) ||
		ts.isForStatement(nut) ||
		ts.isForOfStatement(nut) ||
		ts.isCaseClause(nut)
	);
}

function tra(ngan: NganXep, ten: string): string[] | undefined {
	for (let i = ngan.length - 1; i >= 0; i -= 1) {
		const co = ngan[i]?.get(ten);
		if (co) return co;
	}
	return undefined;
}

function noRong(ngan: NganXep, chuoi: string[], sau = 0): string[] {
	if (sau > SAU_TOI_DA) return chuoi;
	const thay = tra(ngan, chuoi[0] ?? "");
	if (!thay || thay[0] === chuoi[0]) return chuoi;
	return noRong(ngan, [...thay, ...chuoi.slice(1)], sau + 1);
}

function tenKhoTuKieu(kieu: TS.TypeNode | undefined): boolean {
	return (
		kieu !== undefined &&
		ts.isTypeReferenceNode(kieu) &&
		ts.isIdentifier(kieu.typeName) &&
		/Messages$/.test(kieu.typeName.text)
	);
}

function thamSoKho(nut: TS.Node): string[] {
	if (!ts.isParameter(nut)) return [];

	if (ts.isIdentifier(nut.name) && tenKhoTuKieu(nut.type))
		return [nut.name.text];

	if (
		ts.isObjectBindingPattern(nut.name) &&
		nut.type !== undefined &&
		ts.isTypeLiteralNode(nut.type)
	) {
		const kho = new Set(
			nut.type.members
				.filter(
					(m): m is TS.PropertySignature =>
						ts.isPropertySignature(m) &&
						ts.isIdentifier(m.name) &&
						tenKhoTuKieu(m.type),
				)
				.map((m) => (m.name as TS.Identifier).text),
		);
		return nut.name.elements
			.filter(
				(e) =>
					ts.isIdentifier(e.name) &&
					kho.has(
						e.propertyName && ts.isIdentifier(e.propertyName)
							? e.propertyName.text
							: e.name.text,
					),
			)
			.map((e) => (e.name as TS.Identifier).text);
	}

	return [];
}

function ghiKhaiBao(
	nut: TS.VariableDeclaration,
	ngan: NganXep,
	hien: Map<string, string[]>,
): void {
	if (!nut.initializer) return;
	const chuoi = chuoiTruyCap(nut.initializer);
	if (!chuoi) return;
	const day = noRong(ngan, chuoi);
	if (ts.isIdentifier(nut.name)) {
		hien.set(nut.name.text, day);
		return;
	}
	if (!ts.isObjectBindingPattern(nut.name)) return;
	for (const phan of nut.name.elements) {
		if (!ts.isIdentifier(phan.name)) continue;
		const nguon =
			phan.propertyName && ts.isIdentifier(phan.propertyName)
				? phan.propertyName.text
				: phan.name.text;
		hien.set(phan.name.text, [...day, nguon]);
	}
}

function ghiTruyCapDong(
	nut: TS.ElementAccessExpression,
	ngan: NganXep,
	ra: { cap: Set<string>; congDong: Set<string> },
): void {
	const chuoi = chuoiTruyCap(nut.expression);
	if (!chuoi) return;
	const day = noRong(ngan, chuoi);
	if (day[0] !== GOC || day.length < 2) return;
	const cuoi = day[day.length - 1] ?? "";
	const doiSo = nut.argumentExpression;
	if (ts.isStringLiteralLike(doiSo)) ra.cap.add(`${cuoi}.${doiSo.text}`);
	else ra.congDong.add(cuoi);
}

function ghiTraCuuMap(
	nut: TS.CallExpression,
	ngan: NganXep,
	ra: { cap: Set<string>; congDong: Set<string> },
): void {
	const goi = nut.expression;
	if (!ts.isPropertyAccessExpression(goi) || goi.name.text !== "get") return;
	const chuoi = chuoiTruyCap(goi.expression);
	if (!chuoi) return;
	const day = noRong(ngan, chuoi);
	if (day[0] !== GOC || day.length < 2) return;
	const cuoi = day[day.length - 1] ?? "";
	const doiSo = nut.arguments[0];
	if (doiSo && ts.isStringLiteralLike(doiSo))
		ra.cap.add(`${cuoi}.${doiSo.text}`);
	else ra.congDong.add(cuoi);
}

function ghiTruyCapTinh(
	nut: TS.PropertyAccessExpression,
	ngan: NganXep,
	ra: { cap: Set<string>; don: Set<string> },
): void {
	const chuoi = chuoiTruyCap(nut);
	if (!chuoi || chuoi.length < 2) return;
	const day = noRong(ngan, chuoi);
	if (day[0] !== GOC) return;
	for (let i = 1; i + 1 < day.length; i += 1)
		ra.cap.add(`${day[i]}.${day[i + 1]}`);
	for (const doan of day.slice(1)) ra.don.add(doan);
}

export function docDuongGoi(thuMuc: string): DuongGoi {
	const cap = new Set<string>();
	const don = new Set<string>();
	const congDong = new Set<string>();

	for (const tep of tepNguon(thuMuc)) {
		const cay = ts.createSourceFile(
			tep,
			readFileSync(tep, "utf8"),
			ts.ScriptTarget.Latest,
			true,
			/\.tsx$/.test(tep) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
		);

		const di = (nut: TS.Node, ngan: NganXep): void => {
			const sau = laPhamVi(nut) ? [...ngan, new Map<string, string[]>()] : ngan;
			const hien = sau[sau.length - 1];

			if (hien) for (const ten of thamSoKho(nut)) hien.set(ten, [GOC]);
			if (hien && ts.isVariableDeclaration(nut)) ghiKhaiBao(nut, sau, hien);
			if (ts.isElementAccessExpression(nut))
				ghiTruyCapDong(nut, sau, { cap, congDong });
			if (ts.isCallExpression(nut)) ghiTraCuuMap(nut, sau, { cap, congDong });
			if (
				ts.isPropertyAccessExpression(nut) &&
				!ts.isPropertyAccessExpression(nut.parent)
			)
				ghiTruyCapTinh(nut, sau, { cap, don });

			ts.forEachChild(nut, (con) => di(con, sau));
		};
		di(cay, []);
	}

	return { cap, don, congDong };
}

export function taoSong(duongGoi: DuongGoi): (duong: string) => boolean {
	return (duong: string) => {
		const phan = duong.split(".");
		const la = phan[phan.length - 1] ?? "";
		const cha = phan[phan.length - 2];
		if (!cha) return duongGoi.don.has(la);
		if (duongGoi.cap.has(`${cha}.${la}`) || duongGoi.congDong.has(cha))
			return true;

		for (let i = 0; i < phan.length - 1; i += 1) {
			const to = phan[i] ?? "";
			if (duongGoi.congDong.has(to)) return true;
			const sau = phan[i + 1] ?? "";
			if (
				/^\d+$/.test(sau) &&
				(duongGoi.don.has(to) || duongGoi.cap.has(`${phan[i - 1] ?? ""}.${to}`))
			)
				return true;
		}
		return false;
	};
}
