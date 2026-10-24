import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

export const GOC = join(import.meta.dir, "..", "..", "..", "..");
export const HO_SO = join(GOC, "_acceptance/bam-kr-mo-chi-tiet-kr/rang");
const KHU_OKR = join(GOC, "apps/app/app/(app)/[slug]/okr");
export const LOP_CHU = [
	join(GOC, "apps/app/lib/messages"),
	join(GOC, "apps/agent/agent/lib"),
];
export const NGOAI_LOP_CHU = new Set([
	join(GOC, "apps/agent/agent/lib/okr/chi-dan-tom-tat.ts"),
]);
export const LAU_VI = /(?<![Nn]gày )[Cc]ập nhật tuần(?! này)/;
export const LAU_EN = /[Ww]eekly update(?! day)/;

export type CapChu = {
	tep: string;
	lang: "vi" | "en";
	cu: string;
	moi: string;
	soLan: number;
};
export type ChoGoi = { tep: string; kind: string; id: string; dong: number };
export type DongBang = { tep: string; kind: string; id: string; nguon: string };

export function tepTrong(thuMuc: string): string[] {
	return readdirSync(thuMuc).flatMap((ten) => {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) return tepTrong(duong);
		return /\.(ts|tsx)$/.test(ten) ? [duong] : [];
	});
}

function nguon(duong: string): ts.SourceFile {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		duong.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

export function chuoiTrong(duong: string): string[] {
	const ra: string[] = [];
	const di = (n: ts.Node) => {
		if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
			ra.push(n.text);
		else if (ts.isTemplateExpression(n)) {
			ra.push(n.head.text);
			for (const s of n.templateSpans) ra.push(s.literal.text);
		}
		ts.forEachChild(n, di);
	};
	di(nguon(duong));
	return ra;
}

export function quetChuLop(): { tep: number; chuoi: number; lot: string[] } {
	const tep = LOP_CHU.flatMap(tepTrong).filter((t) => !NGOAI_LOP_CHU.has(t));
	const lot: string[] = [];
	let chuoi = 0;
	for (const t of tep) {
		for (const c of chuoiTrong(t)) {
			chuoi += 1;
			if (LAU_VI.test(c) || LAU_EN.test(c))
				lot.push(`bkr-chu: ${relative(GOC, t)} "${c}"`);
		}
	}
	return { tep: tep.length, chuoi, lot };
}

function obj(n: ts.Expression): ts.ObjectLiteralExpression[] {
	if (ts.isObjectLiteralExpression(n)) return [n];
	if (ts.isConditionalExpression(n))
		return [...obj(n.whenTrue), ...obj(n.whenFalse)];
	if (ts.isParenthesizedExpression(n)) return obj(n.expression);
	return [];
}

function giaTriKind(n: ts.Expression): string[] {
	if (ts.isStringLiteral(n)) return [n.text];
	if (ts.isConditionalExpression(n))
		return [...giaTriKind(n.whenTrue), ...giaTriKind(n.whenFalse)];
	return ["dong"];
}

export function quetMo(thuMuc = KHU_OKR): ChoGoi[] {
	const ra: ChoGoi[] = [];
	for (const duong of tepTrong(thuMuc)) {
		const sf = nguon(duong);
		const ten = new Set<string>();
		const tim = (n: ts.Node) => {
			if (
				ts.isVariableDeclaration(n) &&
				ts.isIdentifier(n.name) &&
				n.initializer &&
				ts.isCallExpression(n.initializer) &&
				ts.isIdentifier(n.initializer.expression) &&
				n.initializer.expression.text === "useOpenRecord"
			)
				ten.add(n.name.text);
			ts.forEachChild(n, tim);
		};
		tim(sf);
		const goi = (n: ts.Node) => {
			if (
				ts.isCallExpression(n) &&
				ts.isIdentifier(n.expression) &&
				ten.has(n.expression.text) &&
				n.arguments[0]
			) {
				for (const o of obj(n.arguments[0])) {
					const lay = (k: string) =>
						o.properties.find(
							(p): p is ts.PropertyAssignment =>
								ts.isPropertyAssignment(p) &&
								ts.isIdentifier(p.name) &&
								p.name.text === k,
						)?.initializer;
					const kind = lay("kind");
					const id = lay("id");
					for (const k of kind ? giaTriKind(kind) : ["dong"])
						ra.push({
							tep: relative(thuMuc, duong),
							kind: k,
							id: id ? id.getText(sf) : "",
							dong: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
						});
				}
			}
			ts.forEachChild(n, goi);
		};
		goi(sf);
	}
	return ra;
}

export function soBangMo(tim: ChoGoi[], bang: DongBang[]): string[] {
	const loi: string[] = [];
	const khoa = (x: { tep: string; kind: string; id: string }) =>
		`${x.tep}|${x.kind}|${x.id}`;
	const theoKhoa = new Map(bang.map((b) => [khoa(b), b]));
	for (const g of tim) {
		if (theoKhoa.has(khoa(g))) continue;
		const krCungCho = bang.find(
			(b) =>
				b.tep === g.tep && b.id === g.id && b.nguon === "kr" && g.kind !== "kr",
		);
		loi.push(
			krCungCho
				? `bkr-quet-mo: ${g.tep}:${g.dong} nguon KR mo ${g.kind}`
				: `bkr-quet-mo: cho goi moi ${g.tep}:${g.dong} (${g.kind} ${g.id})`,
		);
	}
	for (const b of bang)
		if (b.nguon === "kr" && b.kind !== "kr")
			loi.push(`bkr-quet-mo: bang khai ${b.tep} nguon KR ma kind ${b.kind}`);
	if (tim.length !== bang.length)
		loi.push(`bkr-quet-mo: tim ${tim.length} cho goi, bang ${bang.length}`);
	return loi;
}
