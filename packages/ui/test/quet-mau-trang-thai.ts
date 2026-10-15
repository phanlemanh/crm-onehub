import ts from "typescript";

export const MAU_TRANG_THAI = new Set([
	"success",
	"warning",
	"error",
	"neutral",
	"info",
	"primary",
]);

const THANH_PHAN_CHAM = /\b(StatusIndicator|IndicatorDot|StatusTone)\b/;

const KHOA_KHONG_PHAI_TRANG_THAI = new Set([
	"tone",
	"variant",
	"kind",
	"color",
]);

export type ViPham = { tep: string; dong: number; chu: string };

function boNgoac(nut: ts.Node): ts.Node {
	let p = nut.parent;
	while (
		p &&
		(ts.isAsExpression(p) ||
			ts.isSatisfiesExpression(p) ||
			ts.isParenthesizedExpression(p) ||
			ts.isConditionalExpression(p) ||
			(ts.isBinaryExpression(p) &&
				(p.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
					p.operatorToken.kind === ts.SyntaxKind.BarBarToken)))
	)
		p = p.parent;
	return p;
}

function tenKhoa(pa: ts.PropertyAssignment): string {
	const ten = pa.name;
	if (ts.isIdentifier(ten) || ts.isStringLiteral(ten)) return ten.text;
	return ten.getText();
}

function laBangChua(doiTuong: ts.ObjectLiteralExpression): boolean {
	const cha = boNgoac(doiTuong);
	return (
		ts.isPropertyAssignment(cha) ||
		ts.isReturnStatement(cha) ||
		ts.isArrowFunction(cha) ||
		ts.isVariableDeclaration(cha)
	);
}

function laViPham(nut: ts.Node, chat: boolean): boolean {
	const cha = boNgoac(nut);
	if (ts.isJsxAttribute(cha)) return chat && cha.name.getText() === "tone";
	if (ts.isJsxExpression(cha)) {
		const thuocTinh = cha.parent;
		return (
			chat &&
			ts.isJsxAttribute(thuocTinh) &&
			thuocTinh.name.getText() === "tone"
		);
	}
	if (ts.isReturnStatement(cha) || ts.isCaseClause(cha)) return true;
	if (ts.isArrowFunction(cha)) return true;
	if (ts.isArrayLiteralExpression(cha)) {
		const ngoai = boNgoac(cha);
		return (
			ts.isArrayLiteralExpression(ngoai) &&
			ts.isNewExpression(boNgoac(ngoai)) &&
			(boNgoac(ngoai) as ts.NewExpression).expression.getText() === "Map"
		);
	}
	if (ts.isPropertyAssignment(cha)) {
		if (!KHOA_KHONG_PHAI_TRANG_THAI.has(tenKhoa(cha))) return true;
		if (tenKhoa(cha) !== "tone") return false;
		return ts.isObjectLiteralExpression(cha.parent) && laBangChua(cha.parent);
	}
	return false;
}

export function tepCanQuet(goc: string): string[] {
	const ra = Bun.spawnSync(["git", "ls-files", "apps/app", "packages/ui/src"], {
		cwd: goc,
	});
	return ra.stdout
		.toString()
		.trim()
		.split("\n")
		.filter(
			(t) =>
				/\.(ts|tsx)$/.test(t) &&
				!t.startsWith("apps/app/app/proto/") &&
				!/(^|\/)test\//.test(t) &&
				!t.endsWith("packages/ui/src/lib/status-tone.ts") &&
				!t.endsWith("packages/ui/src/components/status-indicator.tsx"),
		);
}

export function docBangNghia(
	nguon: string,
	tep: string,
	ten: string,
): Record<string, string> | null {
	const sf = ts.createSourceFile(
		tep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		tep.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	let ra: Record<string, string> | null = null;
	const di = (nut: ts.Node): void => {
		if (
			ts.isVariableDeclaration(nut) &&
			ts.isIdentifier(nut.name) &&
			nut.name.text === ten &&
			nut.initializer
		) {
			let gt: ts.Node = nut.initializer;
			while (ts.isAsExpression(gt) || ts.isSatisfiesExpression(gt))
				gt = gt.expression;
			if (ts.isObjectLiteralExpression(gt)) {
				ra = {};
				for (const pt of gt.properties) {
					if (
						ts.isPropertyAssignment(pt) &&
						(ts.isStringLiteral(pt.initializer) ||
							ts.isNoSubstitutionTemplateLiteral(pt.initializer))
					)
						ra[tenKhoa(pt)] = pt.initializer.text;
				}
			}
		}
		ts.forEachChild(nut, di);
	};
	di(sf);
	return ra;
}

export function quetMau(
	nguon: string,
	tep: string,
	{ chat }: { chat: boolean },
): ViPham[] {
	if (!THANH_PHAN_CHAM.test(nguon)) return [];
	const sf = ts.createSourceFile(
		tep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		tep.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const ra: ViPham[] = [];
	const di = (nut: ts.Node): void => {
		if (
			(ts.isStringLiteral(nut) || ts.isNoSubstitutionTemplateLiteral(nut)) &&
			MAU_TRANG_THAI.has(nut.text) &&
			!ts.isLiteralTypeNode(nut.parent) &&
			laViPham(nut, chat)
		) {
			const { line } = sf.getLineAndCharacterOfPosition(nut.getStart());
			ra.push({ tep, dong: line + 1, chu: nut.text });
		}
		ts.forEachChild(nut, di);
	};
	di(sf);
	return ra;
}
