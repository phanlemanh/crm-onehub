import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	DUONG_SPEC,
	GOC,
	hong,
	hongGian,
	RANG as RANG_CU,
	voiCaySao,
} from "../../do-quyen-luot-bang-hanh-vi/rang/chung.mjs";
import { duyet, nap, ts, viTri } from "../../do-quyen-luot-bang-hanh-vi/rang/ast.mjs";

const GHIM = "hinh dang ghim so luong ma khong ghim khac biet";
const TOI = join(RANG_CU, "..", "..", "ma-tran-phai-co-chieu-song", "rang", "khong-moc-lai.mjs");

function tenGoiCua(node) {
	if (!ts.isCallExpression(node)) return null;
	const goi = node.expression;
	if (ts.isIdentifier(goi)) return goi.text;
	if (ts.isPropertyAccessExpression(goi)) return goi.name.text;
	if (ts.isCallExpression(goi)) return tenGoiCua(goi);
	return null;
}

function khoiDescribe(sf, ten) {
	let thay = null;
	duyet(sf, (node) => {
		if (thay) return;
		if (!ts.isCallExpression(node)) return;
		if (tenGoiCua(node) !== "describe") return;
		const dau = node.arguments[0];
		if (!dau || !ts.isStringLiteral(dau) || dau.text !== ten) return;
		thay = node;
	});
	return thay;
}

function laBai(node) {
	if (!ts.isCallExpression(node)) return false;
	const goi = node.expression;
	if (ts.isIdentifier(goi) && goi.text === "it") return true;
	return (
		ts.isCallExpression(goi) &&
		ts.isPropertyAccessExpression(goi.expression) &&
		ts.isIdentifier(goi.expression.expression) &&
		goi.expression.expression.text === "it"
	);
}

function baiTrong(khoi) {
	const ra = [];
	duyet(khoi, (node) => {
		if (laBai(node)) ra.push(node);
	});
	return ra;
}

function thanBai(bai) {
	return bai.arguments.filter(
		(d) => ts.isArrowFunction(d) || ts.isFunctionExpression(d),
	);
}

function duyetNong(khoi, fn) {
	const cam = new Set();
	duyet(khoi, (node) => {
		if (laBai(node)) for (const t of thanBai(node)) cam.add(t);
	});
	const di = (node) => {
		if (cam.has(node)) return;
		fn(node);
		node.forEachChild(di);
	};
	di(khoi);
}

function ghimSoLuong(bai, quet = duyet) {
	const ra = [];
	quet(bai, (node) => {
		if (!ts.isCallExpression(node)) return;
		if (tenGoiCua(node) !== "toHaveLength") return;
		const goi = node.expression;
		if (!ts.isPropertyAccessExpression(goi)) return;
		const trong = goi.expression;
		if (!ts.isCallExpression(trong)) return;
		if (tenGoiCua(trong) !== "expect") return;
		const doi = trong.arguments[0];
		if (!doi || !ts.isIdentifier(doi)) return;
		ra.push({ ten: doi.text, node });
	});
	return ra;
}

function thanDuyet(bai, ten, quet = duyet) {
	const ra = [];
	quet(bai, (node) => {
		if (
			ts.isForOfStatement(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === ten
		) {
			ra.push(node.statement);
			return;
		}
		if (!ts.isCallExpression(node)) return;
		const goi = node.expression;
		if (
			ts.isPropertyAccessExpression(goi) &&
			goi.name.text === "forEach" &&
			ts.isIdentifier(goi.expression) &&
			goi.expression.text === ten
		) {
			const than = node.arguments[0];
			if (than) ra.push(than);
			return;
		}
		if (
			ts.isCallExpression(goi) &&
			tenGoiCua(goi) === "each" &&
			goi.arguments.some((d) => ts.isIdentifier(d) && d.text === ten)
		) {
			const than = node.arguments[1];
			if (than) ra.push(than);
		}
	});
	return ra;
}

function chiSoSo(node) {
	const ra = new Set();
	duyet(node, (n) => {
		if (!ts.isElementAccessExpression(n)) return;
		const chi = n.argumentExpression;
		if (chi && ts.isNumericLiteral(chi)) ra.add(chi.text);
	});
	return ra;
}

function coSoCheoHaiLuot(bai, quet = duyet) {
	let thay = false;
	quet(bai, (node) => {
		if (thay) return;
		if (!ts.isCallExpression(node)) return;
		const ten = tenGoiCua(node);
		if (ten !== "toEqual" && ten !== "toStrictEqual") return;
		const goi = node.expression;
		if (!ts.isPropertyAccessExpression(goi)) return;
		const trong = goi.expression;
		if (!ts.isCallExpression(trong) || tenGoiCua(trong) !== "expect") return;
		const trai = chiSoSo(trong.arguments[0]);
		const phai = chiSoSo(node.arguments[0]);
		if (trai.size === 0 || phai.size === 0) return;
		for (const i of trai) {
			for (const j of phai) {
				if (i !== j) thay = true;
			}
		}
	});
	return thay;
}

function cham(goc) {
	const duong = join(goc, DUONG_SPEC);
	const sf = nap(duong);
	const khoi = khoiDescribe(sf, "suy-dien");
	if (!khoi) {
		hong(
			`${GHIM}\n  khoi describe("suy-dien") khong con ton tai: lenh ql_khong_suy_dien cua ho so cu loc theo dung ten nay\n  ${DUONG_SPEC}`,
		);
	}
	const bai = baiTrong(khoi);
	if (bai.length === 0) {
		hong(`${GHIM}\n  khoi describe("suy-dien") khong con bai nao ben trong`);
	}

	const loi = [];
	const donVi = [
		...bai.map((b) => ({ node: b, quet: duyet, nhan: "bai" })),
		{ node: khoi, quet: duyetNong, nhan: "than describe" },
	];
	for (const { node: dv, quet, nhan } of donVi) {
		for (const { ten, node } of ghimSoLuong(dv, quet)) {
			const than = thanDuyet(dv, ten, quet);
			if (than.length === 0) continue;
			if (than.every((t) => coSoCheoHaiLuot(t))) continue;
			loi.push(
				`${viTri(sf, node, goc)} — ghim so luong cua "${ten}" roi duyet chinh no trong ${nhan}, ma THAN VONG khong so cheo hai luot`,
			);
		}
	}
	if (loi.length > 0) {
		hong(`${GHIM}\n${loi.map((l) => `  ${l}`).join("\n")}`);
	}

	process.stdout.write(
		`khong-moc-lai: khoi describe("suy-dien") con ${bai.length} bai, khong bai nao ghim so luong ma khong ghim khac biet — sach\n`,
	);
}

function doiTrongSao(sao, tim, thay) {
	const d = join(sao, DUONG_SPEC);
	const nguon = readFileSync(d, "utf8");
	if (!nguon.includes(tim)) {
		hongGian(`khong tim thay moc de dot bien trong ${d}`);
	}
	writeFileSync(d, nguon.replace(tim, thay));
}

const MOC = 'describe("suy-dien", () => {';

const THAN_CU = [
	'\t\t\texpect(chamCong("CHAT", ir).cham).toEqual({',
	'\t\t\t\ttype: "denied",',
	"\t\t\t\treason: BUILDER_DENIED_REASON,",
	"\t\t\t});",
].join("\n");

const VECTO = {
	"cay-lai-for-of": (sao) =>
		doiTrongSao(
			sao,
			MOC,
			[
				MOC,
				'\tit("suy-dien: hinh dang cu for-of", () => {',
				"\t\texpect(BIEN_THE).toHaveLength(2);",
				"\t\tfor (const ir of BIEN_THE) {",
				THAN_CU,
				"\t\t}",
				"\t});",
				"",
			].join("\n"),
		),
	"cay-lai-foreach": (sao) =>
		doiTrongSao(
			sao,
			MOC,
			[
				MOC,
				'\tit("suy-dien: hinh dang cu foreach", () => {',
				"\t\texpect(BIEN_THE).toHaveLength(2);",
				"\t\tBIEN_THE.forEach((ir) => {",
				THAN_CU,
				"\t\t});",
				"\t});",
				"",
			].join("\n"),
		),
	"cay-vao-bai-co-san": (sao) =>
		doiTrongSao(
			sao,
			"\t\texpect(luot[0].cham).toEqual(luot[1].cham);",
			[
				"\t\texpect(luot[0].cham).toEqual(luot[1].cham);",
				"\t\texpect(BIEN_THE).toHaveLength(2);",
				"\t\tfor (const ir of BIEN_THE) {",
				'\t\t\texpect(chamCong("CHAT", ir).cham).toEqual({',
				'\t\t\t\ttype: "denied",',
				"\t\t\t\treason: BUILDER_DENIED_REASON,",
				"\t\t\t});",
				"\t\t}",
			].join("\n"),
		),
	"cay-lai-it-each": (sao) =>
		doiTrongSao(
			sao,
			MOC,
			[
				MOC,
				"\texpect(BIEN_THE).toHaveLength(2);",
				'\tit.each(BIEN_THE)("suy-dien: hinh dang cu it-each %o", (ir) => {',
				THAN_CU,
				"\t});",
				"",
			].join("\n"),
		),
};

function chayMotVecto(ten) {
	const dotBien = VECTO[ten];
	if (!dotBien) {
		hongGian(
			`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`,
		);
	}
	return voiCaySao(({ sao }) => {
		const truoc = chay(GOC, ["node", TOI, "--goc", sao]);
		if (truoc.ma !== 0) {
			hongGian(
				`doi chung duong hong: cay sao chua dot bien da do\n${truoc.chu}`,
			);
		}
		dotBien(sao);
		const sau = chay(GOC, ["node", TOI, "--goc", sao]);
		process.stdout.write(`cay sao: ${sao}\nvecto: ${ten}\n${sau.chu}`);
		if (sau.ma === 0) {
			hong(
				`${GHIM}\n  vecto "${ten}" ra XANH — san khong bat duoc cach viet nay, tuc thuoc do thung`,
			);
		}
		if (!sau.chu.includes(GHIM)) {
			hongGian(`vecto "${ten}" do nhung thieu thong diep ghim: ${GHIM}`);
		}
		if (!/apps\/agent\/test\/[^\s]+:\d+/.test(sau.chu)) {
			hongGian(`vecto "${ten}" do nhung khong in file:dong`);
		}
		return 0;
	});
}

chayRang(() => {
	const ten = coCo("--vecto");
	if (ten) {
		process.exitCode = chayMotVecto(ten);
		return;
	}
	const goc = coCo("--goc");
	if (goc) {
		cham(goc);
		return;
	}
	cham(GOC);
	const tenVecto = Object.keys(VECTO);
	for (const v of tenVecto) chayMotVecto(v);
	process.stdout.write(
		`khong-moc-lai: ${tenVecto.length} vecto deu do dung nhu khai — ${tenVecto.join(", ")}\n`,
	);
});
