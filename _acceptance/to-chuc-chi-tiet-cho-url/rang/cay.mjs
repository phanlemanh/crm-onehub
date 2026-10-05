import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");

function docCay(nguon) {
	return ts.createSourceFile(
		"spec.tsx",
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function laGoi(n, ten) {
	return (
		ts.isCallExpression(n) &&
		ts.isIdentifier(n.expression) &&
		n.expression.text === ten
	);
}

function duyet(n, f) {
	f(n);
	ts.forEachChild(n, (con) => duyet(con, f));
}

function caTrongTep(sf) {
	const ra = [];
	duyet(sf, (n) => {
		if (
			laGoi(n, "test") &&
			n.arguments[0] &&
			ts.isStringLiteral(n.arguments[0])
		)
			ra.push({ ten: n.arguments[0].text, nut: n });
	});
	return ra;
}

function laDocUrl(n, sf) {
	return (
		ts.isCallExpression(n) &&
		ts.isPropertyAccessExpression(n.expression) &&
		n.expression.getText(sf) === "url.get" &&
		n.arguments.length === 1 &&
		ts.isStringLiteral(n.arguments[0])
	);
}

function namTrong(n, ten) {
	for (let p = n.parent; p; p = p.parent) if (laGoi(p, ten)) return true;
	return false;
}

function soSanhUrl(n, sf) {
	return (
		ts.isBinaryExpression(n) &&
		laDocUrl(n.left, sf) &&
		[
			ts.SyntaxKind.EqualsEqualsEqualsToken,
			ts.SyntaxKind.ExclamationEqualsEqualsToken,
		].includes(n.operatorToken.kind)
	);
}

function soSanhTrongCho(choNut, sf, khoa) {
	const ra = [];
	const ham = choNut.arguments[0];
	if (!ham) return ra;
	duyet(ham, (n) => {
		if (soSanhUrl(n, sf) && n.left.arguments[0].text === khoa)
			ra.push({
				phep: n.operatorToken.getText(sf),
				phai: n.right.getText(sf),
				tu: n.getStart(sf),
				den: n.getEnd(),
			});
	});
	return ra;
}

export function docUrlNgoaiCho(nguon) {
	const sf = docCay(nguon);
	const doc = [];
	const la = [];
	for (const ca of caTrongTep(sf)) {
		const bam = [];
		const cho = [];
		const docCa = [];
		duyet(ca.nut, (n) => {
			if (laGoi(n, "bam")) bam.push(n.getStart(sf));
			if (laGoi(n, "cho")) cho.push(n);
			if (laDocUrl(n, sf) && !namTrong(n, "cho"))
				docCa.push({ vi: n.getStart(sf), khoa: n.arguments[0].text });
			if (
				ts.isIdentifier(n) &&
				n.text === "url" &&
				!(
					ts.isPropertyAccessExpression(n.parent) &&
					laDocUrl(n.parent.parent, sf)
				)
			)
				la.push({ ca: ca.ten, dang: n.parent.getText(sf).slice(0, 60) });
		});
		for (const d of docCa) {
			const sauBam = Math.max(
				ca.nut.getStart(sf),
				...bam.filter((v) => v < d.vi),
			);
			const truoc = cho.filter(
				(c) => c.getStart(sf) > sauBam && c.getStart(sf) < d.vi,
			);
			const soSanh = truoc.flatMap((c) => soSanhTrongCho(c, sf, d.khoa));
			const bang = soSanh.filter((s) => s.phep === "===");
			doc.push({
				ca: ca.ten,
				khoa: d.khoa,
				coCho: soSanh.length > 0,
				giaTri: bang.length > 0 ? bang[bang.length - 1].phai : null,
			});
		}
	}
	return { doc, la };
}

function soSanhCuaCa(nguon, tenCa, khoa) {
	const sf = docCay(nguon);
	const ca = caTrongTep(sf).find((c) => c.ten === tenCa);
	if (!ca) return null;
	let ra = null;
	duyet(ca.nut, (n) => {
		if (ra || !laGoi(n, "cho")) return;
		const ham = n.arguments[0];
		if (!ham || !ts.isArrowFunction(ham)) return;
		const than = ham.body;
		if (
			ts.isBinaryExpression(than) &&
			than.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
			soSanhUrl(than.right, sf) &&
			than.right.left.arguments[0].text === khoa
		)
			ra = { than, sf };
	});
	return ra;
}

export function boDieuKienUrl(nguon, tenCa, khoa) {
	const t = soSanhCuaCa(nguon, tenCa, khoa);
	if (!t) return null;
	const { than, sf } = t;
	return (
		nguon.slice(0, than.getStart(sf)) +
		than.left.getText(sf) +
		nguon.slice(than.getEnd())
	);
}

export function doiThanhKhacNull(nguon, tenCa, khoa) {
	const t = soSanhCuaCa(nguon, tenCa, khoa);
	if (!t) return null;
	const phai = t.than.right;
	return `${nguon.slice(0, phai.getStart(t.sf))}url.get("${khoa}") !== null${nguon.slice(phai.getEnd())}`;
}

function laCauCho(n) {
	return (
		ts.isExpressionStatement(n) &&
		ts.isAwaitExpression(n.expression) &&
		laGoi(n.expression.expression, "cho")
	);
}

function dieuKienChuan(choNut, sf) {
	const ham = choNut.arguments[0];
	if (!ham || !ts.isArrowFunction(ham))
		return {
			chuan: ham ? ham.getText(sf).replace(/\s+/g, "") : "",
			coUrl: false,
		};
	const than = ham.body;
	const goc =
		ts.isBinaryExpression(than) &&
		than.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
		soSanhUrl(than.right, sf)
			? than.left
			: than;
	return { chuan: goc.getText(sf).replace(/\s+/g, ""), coUrl: goc !== than };
}

export function banKhongCho(nguon) {
	const sf = docCay(nguon);
	const bo = [];
	const cho = [];
	duyet(sf, (n) => {
		if (!laCauCho(n)) return;
		bo.push([n.getStart(sf), n.getEnd()]);
		cho.push(dieuKienChuan(n.expression.expression, sf));
	});
	let chu = "";
	const viTri = [];
	let k = 0;
	for (let i = 0; i < nguon.length; i += 1) {
		while (k < bo.length && i >= bo[k][1]) k += 1;
		if (k < bo.length && i >= bo[k][0]) continue;
		if (/\s/.test(nguon[i])) continue;
		chu += nguon[i];
		viTri.push(i);
	}
	const ca = caTrongTep(sf).map((c) => ({
		ten: c.ten,
		tu: c.nut.getStart(sf),
		den: c.nut.getEnd(),
	}));
	return { chu, viTri, cho, ca };
}

export function cauKhangDinhCuoi(nguon, tenCa) {
	const sf = docCay(nguon);
	const ca = caTrongTep(sf).find((c) => c.ten === tenCa);
	if (!ca) return null;
	let cuoi = null;
	duyet(ca.nut, (n) => {
		if (
			ts.isExpressionStatement(n) &&
			n.expression.getText(sf).startsWith("expect(")
		)
			cuoi = { tu: n.getStart(sf), den: n.getEnd() };
	});
	return cuoi;
}

export function demCaVaKhangDinh(nguon) {
	const sf = docCay(nguon);
	const ca = caTrongTep(sf);
	let cau = 0;
	for (const c of ca)
		duyet(c.nut, (n) => {
			if (
				ts.isExpressionStatement(n) &&
				n.expression
					.getText(sf)
					.replace(/^await\s+/, "")
					.startsWith("expect(")
			)
				cau += 1;
		});
	return { soCa: ca.length, soCau: cau };
}

export function doanCuaCa(nguon, tenCa) {
	const sf = docCay(nguon);
	const ca = caTrongTep(sf).find((c) => c.ten === tenCa);
	return ca ? { tu: ca.nut.getStart(sf), den: ca.nut.getEnd() } : null;
}
