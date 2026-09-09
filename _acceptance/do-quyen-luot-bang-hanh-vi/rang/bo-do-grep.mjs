import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	DUONG_SPEC,
	GOC,
	hong,
	RANG,
	voiCaySao,
} from "./chung.mjs";
import { chuoiDoiSo, duyet, nap, tenGoi, ts, viTri } from "./ast.mjs";

const GHIM = "bo do theo dong moc lai";
const TOI = join(RANG, "bo-do-grep.mjs");

function khoiBao(node) {
	for (let n = node.parent; n; n = n.parent) {
		if (
			ts.isFunctionDeclaration(n) ||
			ts.isFunctionExpression(n) ||
			ts.isArrowFunction(n) ||
			ts.isMethodDeclaration(n)
		) {
			return n;
		}
	}
	return null;
}

function coRegex(node) {
	let thay = false;
	duyet(node, (con) => {
		if (ts.isRegularExpressionLiteral(con)) thay = true;
	});
	return thay;
}

function cham(goc) {
	const duong = join(goc, DUONG_SPEC);
	const sf = nap(duong);
	const loi = [];
	let soSuyDien = 0;
	let soBaiTrongSuyDien = 0;

	duyet(sf, (node) => {
		const ten = tenGoi(node);
		if (ten === "it" || ten === "test") {
			const nhan = chuoiDoiSo(node, 0);
			if (nhan?.includes("dem tren dia")) {
				loi.push(`${viTri(sf, node, goc)} — bai do "dem tren dia" con ton tai`);
			}
		}
		if (ten === "describe" && chuoiDoiSo(node, 0) === "suy-dien") {
			soSuyDien += 1;
			duyet(node, (con) => {
				const tenCon = tenGoi(con);
				if (tenCon === "it" || tenCon === "test") soBaiTrongSuyDien += 1;
			});
		}
		if (ten === "split") {
			const doi = node.arguments?.[0];
			const laXuongDong =
				doi && ts.isStringLiteral(doi) && doi.text === "\n";
			if (!laXuongDong) return;
			const bao = khoiBao(node);
			if (bao && coRegex(bao)) {
				loi.push(
					`${viTri(sf, node, goc)} — bo do theo dong: split("\\n") cung ham voi mot literal regex`,
				);
			}
		}
	});

	if (soSuyDien !== 1) {
		loi.push(
			`${DUONG_SPEC} — tim thay ${soSuyDien} khoi describe("suy-dien"), phai co dung 1: lenh ql_khong_suy_dien cua ho so cu loc theo dung ten nay`,
		);
	}
	if (soBaiTrongSuyDien === 0) {
		loi.push(
			`${DUONG_SPEC} — khoi describe("suy-dien") rong: lenh ql_khong_suy_dien cua ho so cu loc theo dung ten nay`,
		);
	}
	if (loi.length > 0) hong(`${GHIM}\n${loi.map((l) => `  ${l}`).join("\n")}`);

	process.stdout.write(
		`bo-do-grep: khoi describe("suy-dien") con ${soBaiTrongSuyDien} bai, khong bo do theo dong nao — sach\n`,
	);
}

const VECTO = {
	"cay-lai-bo-do": (sao) => {
		const duong = join(sao, DUONG_SPEC);
		const nguon = readFileSync(duong, "utf8");
		const moc = 'describe("suy-dien", () => {';
		if (!nguon.includes(moc)) hong(`khong tim thay moc de dot bien trong ${duong}`);
		const cay = [
			moc,
			'\tit("suy-dien: dem tren dia so cho suy quyen phai bang 0", () => {',
			"\t\tconst demTrong = (nguon: string) =>",
			"\t\t\tnguon",
			'\t\t\t\t.split("\\n")',
			"\t\t\t\t.filter((dong) => /\\?\\s*[\"']CREATE_AGENT[\"']\\s*:/.test(dong));",
			'\t\texpect(demTrong("x")).toHaveLength(0);',
			"\t});",
		].join("\n");
		writeFileSync(duong, nguon.replace(moc, cay));
	},
};

chayRang(() => {
	const ten = coCo("--vecto");
	if (!ten) {
		cham(coCo("--goc") ?? GOC);
		return;
	}
	const dotBien = VECTO[ten];
	if (!dotBien) hong(`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`);

	const ma = voiCaySao(({ sao }) => {
		const truoc = chay(GOC, ["node", TOI, "--goc", sao]);
		if (truoc.ma !== 0) {
			hong(`doi chung duong hong: cay sao chua dot bien da do\n${truoc.chu}`);
		}
		dotBien(sao);
		const sau = chay(GOC, ["node", TOI, "--goc", sao]);
		process.stdout.write(`cay sao: ${sao}\nvecto: ${ten}\n${sau.chu}`);
		if (sau.ma === 0) {
			hong(`vecto "${ten}" ra XANH — thuoc khong bat duoc dot bien nay`);
		}
		if (!sau.chu.includes(GHIM)) {
			hong(`vecto "${ten}" do nhung thieu thong diep ghim: ${GHIM}`);
		}
		if (!/apps\/agent\/[^\s]+:\d+/.test(sau.chu)) {
			hong(`vecto "${ten}" do nhung khong in file:dong`);
		}
		return sau.ma;
	});
	process.exitCode = ma;
});
