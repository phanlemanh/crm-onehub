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
import { duyet, nap, quetTs, tenGoi, ts, viTri } from "./ast.mjs";

const GHIM = "apps/agent con cam tin nhan o cho quyet quyen";
const TOI = join(RANG, "khong-cam-tin-nhan.mjs");

function cham(goc) {
	const dan = quetTs(join(goc, "apps", "agent", "agent"));
	if (dan.length === 0)
		hong(`${GHIM}\n  dan so rong: khong tep .ts nao duoi apps/agent/agent`);

	const loi = [];
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
					if (
						ts.isPropertySignature(thanhVien) &&
						ts.isIdentifier(thanhVien.name) &&
						thanhVien.name.text === "message"
					) {
						loi.push(
							`${viTri(sf, thanhVien, goc)} — builderSessionAttributes con tham so message`,
						);
					}
				}
			}

			if (
				(ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
				node.name &&
				ts.isIdentifier(node.name) &&
				node.name.text === "builderCommandType"
			) {
				loi.push(`${viTri(sf, node, goc)} — builderCommandType con ton tai`);
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
					const laCommandType =
						thuocTinh.name &&
						ts.isIdentifier(thuocTinh.name) &&
						thuocTinh.name.text === "commandType";
					if (!laCommandType) continue;
					if (!ts.isPropertyAssignment(thuocTinh)) {
						loi.push(
							`${viTri(sf, thuocTinh, goc)} — commandType tai cho goi khong phai truy cap thuoc tinh tran`,
						);
						continue;
					}
					if (!ts.isPropertyAccessExpression(thuocTinh.initializer)) {
						loi.push(
							`${viTri(sf, thuocTinh, goc)} — commandType tai cho goi la bieu thuc tinh toan`,
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
	if (loi.length > 0) {
		hong(`${GHIM}\n${loi.map((l) => `  ${l}`).join("\n")}`);
	}
	process.stdout.write(
		`khong-cam-tin-nhan: ${dan.length} tep, ${soChoGoi} cho goi builderSessionAttributes — sach\n`,
	);
}

const VECTO = {
	"cay-lai-tham-so": (sao) => {
		const duong = join(sao, DUONG_DISPATCH);
		const nguon = readFileSync(duong, "utf8");
		const moc =
			"export function builderSessionAttributes(input: {\n\tcommandType: string;";
		if (!nguon.includes(moc))
			hongGian(`khong tim thay moc de dot bien trong ${duong}`);
		writeFileSync(
			duong,
			nguon.replace(moc, `${moc}\n\tmessage: Prisma.JsonValue;`),
		);
	},
	"cho-goi-tinh-toan": (sao) => {
		const duong = join(sao, DUONG_DISPATCH);
		const nguon = readFileSync(duong, "utf8");
		const moc = "\t\t\tcommandType: row.commandType,";
		if (!nguon.includes(moc))
			hongGian(`khong tim thay moc de dot bien trong ${duong}`);
		writeFileSync(
			duong,
			nguon.replace(
				moc,
				[
					"\t\t\tcommandType:",
					'\t\t\t\tJSON.stringify(row.message).includes("agent")',
					'\t\t\t\t\t? "CREATE_AGENT"',
					"\t\t\t\t\t: row.commandType,",
				].join("\n"),
			),
		);
	},
};

chayRang(() => {
	const ten = coCo("--vecto");
	if (!ten) {
		cham(coCo("--goc") ?? GOC);
		return;
	}
	const dotBien = VECTO[ten];
	if (!dotBien)
		hongGian(
			`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`,
		);

	const ma = voiCaySao(({ sao }) => {
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
	process.exitCode = ma;
});
