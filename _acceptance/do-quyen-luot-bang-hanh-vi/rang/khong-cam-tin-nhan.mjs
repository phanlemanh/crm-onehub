import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	DUONG_DISPATCH,
	GOC,
	hong,
	hongGian,
	RANG,
	voiCaySao,
} from "./chung.mjs";
import {
	duoiKhoaDoc,
	duyet,
	hamBao,
	laKhoa,
	nap,
	quetTs,
	tenGoi,
	tenKhoa,
	ts,
	viTri,
} from "./ast.mjs";

const GHIM = "apps/agent con cam tin nhan o cho quyet quyen";
const TOI = join(RANG, "khong-cam-tin-nhan.mjs");
const DUONG_D = "apps/agent/agent/lib/custom-agent-dispatch.ts";

const DA_GHIM = [
	`${DUONG_D} :: dispatchBuilderSubmission :: doc`,
	`${DUONG_D} :: <dinh tep> :: kieu`,
	`${DUONG_D} :: builderSessionAttributes :: kieu`,
	`${DUONG_D} :: builderSessionAttributes :: khai`,
	`${DUONG_D} :: <dinh tep> :: kieu`,
	`${DUONG_D} :: builderSessionAuthFromRow :: khai`,
];

function laTruyCapTran(dau) {
	return (
		ts.isPropertyAccessExpression(dau) &&
		ts.isIdentifier(dau.name) &&
		dau.name.text === "commandType" &&
		ts.isIdentifier(dau.expression)
	);
}

function loaiCua(node) {
	if (ts.isPropertySignature(node)) return "kieu";
	if (duoiKhoaDoc(node)) return "doc";
	if (!ts.isPropertyAssignment(node)) return "khac";
	return laTruyCapTran(node.initializer) ? "khai" : "khac";
}

function mangTen(node, ten) {
	if (ts.isExportSpecifier(node)) return tenKhoa(node.name) === ten;
	return Boolean(node.name) && tenKhoa(node.name) === ten;
}

function cham(goc) {
	const dan = quetTs(join(goc, "apps", "agent", "agent"));
	if (dan.length === 0) {
		hong(`${GHIM}\n  dan so rong: khong tep .ts nao duoi apps/agent/agent`);
	}

	const loi = [];
	const maTran = [];
	let soChoGoi = 0;
	let thayKhaiBao = false;

	for (const duong of dan) {
		const sf = nap(duong);
		duyet(sf, (node) => {
			if (
				ts.isFunctionDeclaration(node) &&
				node.name?.text === "builderSessionAttributes"
			) {
				thayKhaiBao = true;
				const kieu = node.parameters[0]?.type;
				if (!kieu || !ts.isTypeLiteralNode(kieu)) {
					loi.push(
						`${viTri(sf, node, goc)} — khong doc duoc kieu tham so input`,
					);
					return;
				}
				for (const thanhVien of kieu.members) {
					if (laKhoa(thanhVien, "message")) {
						loi.push(
							`${viTri(sf, thanhVien, goc)} — builderSessionAttributes con tham so message`,
						);
					}
				}
			}

			if (mangTen(node, "builderCommandType")) {
				loi.push(
					`${viTri(sf, node, goc)} — con mot thu mang ten builderCommandType (${ts.SyntaxKind[node.kind]})`,
				);
			}

			if (laKhoa(node, "commandType")) {
				const loai = loaiCua(node);
				maTran.push({
					khoa: `${viTri(sf, node, goc).replace(/:\d+$/, "")} :: ${hamBao(sf, node)} :: ${loai}`,
					viTri: viTri(sf, node, goc),
					loai,
					chu: node.getText(sf).split("\n")[0].slice(0, 60),
				});
			}

			if (tenGoi(node) === "builderSessionAttributes") {
				soChoGoi += 1;
				const doi = node.arguments?.[0];
				if (!doi || !ts.isObjectLiteralExpression(doi)) {
					loi.push(
						`${viTri(sf, node, goc)} — doi so cua cho goi khong phai object literal`,
					);
					return;
				}
				for (const thuocTinh of doi.properties) {
					if (!laKhoa(thuocTinh, "commandType")) continue;
					if (
						!ts.isPropertyAssignment(thuocTinh) ||
						!laTruyCapTran(thuocTinh.initializer)
					) {
						loi.push(
							`${viTri(sf, thuocTinh, goc)} — commandType tai cho goi khong phai <hang>.commandType tran`,
						);
					}
				}
			}
		});
	}

	if (!thayKhaiBao) {
		hong(
			`${GHIM}\n  khong tim thay khai bao builderSessionAttributes trong dan so`,
		);
	}
	if (soChoGoi === 0) {
		hong(`${GHIM}\n  dan so rong: 0 cho goi builderSessionAttributes`);
	}

	const timDuoc = maTran.map((t) => t.khoa).sort();
	const daGhim = [...DA_GHIM].sort();
	if (timDuoc.join("\n") !== daGhim.join("\n")) {
		loi.push(
			[
				`ma tran khoa commandType lech: tim duoc ${maTran.length}, da ghim ${DA_GHIM.length}`,
				"  tim duoc:",
				...maTran.map((t) => `    ${t.khoa}   (${t.viTri})  ${t.chu}`),
				"  da ghim:",
				...daGhim.map((k) => `    ${k}`),
			].join("\n"),
		);
	}

	if (loi.length > 0) {
		hong(`${GHIM}\n${loi.map((l) => `  ${l}`).join("\n")}`);
	}

	process.stdout.write(
		`khong-cam-tin-nhan: ${dan.length} tep, ${soChoGoi} cho goi builderSessionAttributes, ma tran ${maTran.length} khoa — sach\n`,
	);
}

function doiTrongSao(sao, duong, tim, thay) {
	const d = join(sao, duong);
	const nguon = readFileSync(d, "utf8");
	if (!nguon.includes(tim)) {
		hongGian(`khong tim thay moc de dot bien trong ${d}`);
	}
	writeFileSync(d, nguon.replace(tim, thay));
}

const VECTO = {
	"cay-lai-tham-so": (sao) =>
		doiTrongSao(
			sao,
			DUONG_DISPATCH,
			"export function builderSessionAttributes(input: {\n\tcommandType: string;",
			"export function builderSessionAttributes(input: {\n\tcommandType: string;\n\tmessage: Prisma.JsonValue;",
		),
	"cho-goi-tinh-toan": (sao) =>
		doiTrongSao(
			sao,
			DUONG_DISPATCH,
			"\t\t\tcommandType: row.commandType,",
			[
				"\t\t\tcommandType:",
				'\t\t\t\tJSON.stringify(row.message).includes("agent")',
				'\t\t\t\t\t? "CREATE_AGENT"',
				"\t\t\t\t\t: row.commandType,",
			].join("\n"),
		),
	"doc-tu-tin-nhan": (sao) =>
		doiTrongSao(
			sao,
			DUONG_DISPATCH,
			"\t\t\tcommandType: row.commandType,",
			"\t\t\tcommandType: row.message.commandType,",
		),
	"khoa-hang-chuoi-agent": (sao) =>
		doiTrongSao(
			sao,
			DUONG_DISPATCH,
			"export function builderSessionAttributes(input: {",
			[
				'const KHOA_LEO = "commandType" as const;',
				"",
				"export function leoQuyen(row: BuilderAuthRow) {",
				"\treturn builderSessionAttributes({",
				'\t\t[KHOA_LEO]: JSON.stringify(row.message).includes("agent")',
				'\t\t\t? "CREATE_AGENT"',
				"\t\t\t: row.commandType,",
				'\t\tconversationId: "c",',
				'\t\tuserId: "u",',
				'\t\tsubmissionId: "s",',
				"\t\thasTitle: false,",
				"\t});",
				"}",
				"",
				"export function builderSessionAttributes(input: {",
			].join("\n"),
		),
	"export-doi-ten": (sao) =>
		doiTrongSao(
			sao,
			DUONG_DISPATCH,
			"export function builderSessionAttributes(input: {",
			[
				"const suyTuTinNhan = (commandType: string, value: Prisma.JsonValue) =>",
				'\tJSON.stringify(value).includes("agent") ? "CREATE_AGENT" : commandType;',
				"",
				"export { suyTuTinNhan as builderCommandType };",
				"",
				"export function builderSessionAttributes(input: {",
			].join("\n"),
		),
	"method-cung-ten": (sao) =>
		doiTrongSao(
			sao,
			DUONG_DISPATCH,
			"export function builderSessionAttributes(input: {",
			[
				"class BoSuyDien {",
				"\tbuilderCommandType(commandType: string): string {",
				"\t\treturn commandType;",
				"\t}",
				"}",
				"",
				"export function builderSessionAttributes(input: {",
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
			hongGian(`vecto "${ten}" ra XANH — thuoc khong bat duoc dot bien nay`);
		}
		if (!sau.chu.includes(GHIM)) {
			hongGian(`vecto "${ten}" do nhung thieu thong diep ghim: ${GHIM}`);
		}
		if (!/apps\/agent\/[^\s]+:\d+/.test(sau.chu)) {
			hongGian(`vecto "${ten}" do nhung khong in file:dong`);
		}
		return sau.ma;
	});
}

chayRang(() => {
	const ten = coCo("--vecto");
	if (ten) {
		process.exitCode = chayMotVecto(ten);
		return;
	}
	cham(coCo("--goc") ?? GOC);
});
