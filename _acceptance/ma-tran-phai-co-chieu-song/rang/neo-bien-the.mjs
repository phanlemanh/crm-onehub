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

const GHIM = "so nhanh sinh inputResponse lech so hang bai do dung";
const DUONG_SERVICE = "apps/api/src/conversations/conversations.service.ts";
const SO_DA_GHIM = 2;
const TOI = join(
	RANG_CU,
	"..",
	"..",
	"ma-tran-phai-co-chieu-song",
	"rang",
	"neo-bien-the.mjs",
);

function demNhanh(dau) {
	if (!ts.isConditionalExpression(dau)) return 1;
	return demNhanh(dau.whenTrue) + demNhanh(dau.whenFalse);
}

function bieuThucSinh(sf) {
	let thay = null;
	duyet(sf, (node) => {
		if (thay) return;
		if (!ts.isVariableDeclaration(node)) return;
		if (!ts.isIdentifier(node.name) || node.name.text !== "inputResponse") return;
		if (!node.initializer || !ts.isConditionalExpression(node.initializer)) return;
		thay = node;
	});
	return thay;
}

function mangBienThe(sf) {
	let thay = null;
	duyet(sf, (node) => {
		if (thay) return;
		if (!ts.isVariableDeclaration(node)) return;
		if (!ts.isIdentifier(node.name) || node.name.text !== "BIEN_THE") return;
		if (!node.initializer || !ts.isArrayLiteralExpression(node.initializer)) return;
		thay = node;
	});
	return thay;
}

function cham(goc) {
	const sfWriter = nap(join(goc, DUONG_SERVICE));
	const bieuThuc = bieuThucSinh(sfWriter);
	if (!bieuThuc) {
		hongGian(
			`khong tim thay bieu thuc sinh inputResponse trong ${DUONG_SERVICE} — dan so rong khong duoc doc thanh "dat"`,
		);
	}
	const soNhanh = demNhanh(bieuThuc.initializer);

	const sfBaiDo = nap(join(goc, DUONG_SPEC));
	const mang = mangBienThe(sfBaiDo);
	if (!mang) {
		hongGian(
			`khong tim thay mang BIEN_THE trong ${DUONG_SPEC} — dan so rong khong duoc doc thanh "dat"`,
		);
	}
	const soHang = mang.initializer.elements.length;

	if (soNhanh !== soHang || soNhanh !== SO_DA_GHIM) {
		hong(
			[
				GHIM,
				`  may chu sinh ${soNhanh} nhanh   (${viTri(sfWriter, bieuThuc, goc)})`,
				`  bai do dung ${soHang} hang      (${viTri(sfBaiDo, mang, goc)})`,
				`  da ghim trong chan do: ${SO_DA_GHIM}`,
				"  them mot nhanh la viec phai sua ca bai do lan so ghim, khong phai viec de thuoc do oan",
			].join("\n"),
		);
	}

	process.stdout.write(
		`neo-bien-the: may chu sinh ${soNhanh} nhanh, bai do dung ${soHang} hang — khop\n  ${viTri(sfWriter, bieuThuc, goc)}\n  ${viTri(sfBaiDo, mang, goc)}\n`,
	);
}

const VECTO = {
	"them-nhanh-thu-ba": (sao) => {
		const d = join(sao, DUONG_SERVICE);
		const nguon = readFileSync(d, "utf8");
		const tim = [
			"\t\tconst inputResponse = input.optionId",
			"\t\t\t? { requestId: input.requestId, optionId: input.optionId }",
			"\t\t\t: { requestId: input.requestId, text: input.text };",
		].join("\n");
		if (!nguon.includes(tim)) {
			hongGian(`khong tim thay moc de dot bien trong ${d}`);
		}
		const thay = [
			"\t\tconst inputResponse = input.optionId",
			"\t\t\t? { requestId: input.requestId, optionId: input.optionId }",
			"\t\t\t: input.text",
			"\t\t\t\t? { requestId: input.requestId, text: input.text }",
			"\t\t\t\t: { requestId: input.requestId };",
		].join("\n");
		writeFileSync(d, nguon.replace(tim, thay));
	},
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
				`${GHIM}\n  vecto "${ten}" ra XANH — san khong bat duoc nhanh thu ba, tuc thuoc do thung`,
			);
		}
		if (!sau.chu.includes(GHIM)) {
			hongGian(`vecto "${ten}" do nhung thieu thong diep ghim: ${GHIM}`);
		}
		if (!sau.chu.includes("sinh 3 nhanh") || !sau.chu.includes("dung 2 hang")) {
			hongGian(`vecto "${ten}" do nhung khong in ca hai con so`);
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
		`neo-bien-the: ${tenVecto.length} vecto deu do dung nhu khai — ${tenVecto.join(", ")}\n`,
	);
});
