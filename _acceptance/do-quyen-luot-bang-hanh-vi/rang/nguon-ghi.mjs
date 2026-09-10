import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	GOC,
	hong,
	hongGian,
	RANG,
	voiCaySao,
} from "./chung.mjs";
import { duoiKhoaDoc, duyet, hamBao, nap, quetTs, ts, viTri } from "./ast.mjs";

const GHIM = "ma tran khoa commandType lech danh sach da ghim";
const TOI = join(RANG, "nguon-ghi.mjs");
const DUONG_SERVICE = "apps/api/src/conversations/conversations.service.ts";
const DUONG_CONTRACTS = "apps/api/src/conversations/conversations.contracts.ts";
const DUONG_SHARING =
	"apps/api/src/conversations/conversation-sharing.service.ts";

const DA_GHIM = [
	`${DUONG_SHARING} :: resolve :: doc`,
	`${DUONG_CONTRACTS} :: <dinh tep> :: khac`,
	`${DUONG_CONTRACTS} :: <dinh tep> :: khac`,
	`${DUONG_CONTRACTS} :: <dinh tep> :: khac`,
	`${DUONG_SERVICE} :: listBuilder :: doc`,
	`${DUONG_SERVICE} :: builderById :: doc`,
	`${DUONG_SERVICE} :: createBuilder :: khai`,
	`${DUONG_SERVICE} :: submitBuilder :: khai`,
	`${DUONG_SERVICE} :: answerBuilderQuestion :: suy`,
];

function laKhoaCommandType(node) {
	return (
		(ts.isPropertyAssignment(node) ||
			ts.isShorthandPropertyAssignment(node) ||
			ts.isPropertySignature(node)) &&
		node.name &&
		ts.isIdentifier(node.name) &&
		node.name.text === "commandType"
	);
}

function loaiCua(node) {
	if (ts.isPropertySignature(node)) return "khac";
	if (duoiKhoaDoc(node)) return "doc";
	if (!ts.isPropertyAssignment(node)) return "khac";
	const dau = node.initializer;
	if (
		ts.isPropertyAccessExpression(dau) &&
		ts.isIdentifier(dau.name) &&
		dau.name.text === "commandType"
	) {
		return "khai";
	}
	if (
		ts.isCallExpression(dau) &&
		((ts.isIdentifier(dau.expression) &&
			dau.expression.text === "commandTypeFromAuthorization") ||
			(ts.isPropertyAccessExpression(dau.expression) &&
				dau.expression.name.text === "commandTypeFromAuthorization"))
	) {
		return "suy";
	}
	return "khac";
}

function thuMaTran(goc) {
	const dan = quetTs(join(goc, "apps", "api", "src"));
	if (dan.length === 0) {
		hong(`${GHIM}\n  dan so rong: khong tep .ts nao duoi apps/api/src`);
	}
	const thay = [];
	for (const duong of dan) {
		const sf = nap(duong);
		duyet(sf, (node) => {
			if (!laKhoaCommandType(node)) return;
			const loai = loaiCua(node);
			const vt = viTri(sf, node, goc);
			thay.push({
				khoa: `${vt.replace(/:\d+$/, "")} :: ${hamBao(sf, node)} :: ${loai}`,
				viTri: vt,
				loai,
				chu: node.getText(sf).split("\n")[0].slice(0, 70),
			});
		});
	}
	return thay;
}

function cham(goc) {
	const thay = thuMaTran(goc);
	const timDuoc = thay.map((t) => t.khoa).sort();
	const daGhim = [...DA_GHIM].sort();

	if (timDuoc.join("\n") !== daGhim.join("\n")) {
		hong(
			[
				GHIM,
				`  tim duoc ${thay.length} cho viet khoa commandType, da ghim ${DA_GHIM.length}`,
				"  so SANH CO BOI: moi lan xuat hien la mot phan tu rieng",
				"  them mot cho viet khoa commandType la viec phai sua danh sach ghim trong",
				"  rang/nguon-ghi.mjs, khong phai viec de thuoc do oan",
				"  tim duoc:",
				...thay.map((t) => `    ${t.khoa}   (${t.viTri})  ${t.chu}`),
				"  da ghim:",
				...daGhim.map((k) => `    ${k}`),
			].join("\n"),
		);
	}

	const la = thay.filter(
		(t) => t.loai === "khac" && !t.viTri.startsWith(DUONG_CONTRACTS),
	);
	if (la.length > 0) {
		hong(
			[
				GHIM,
				"  co cho ghi commandType khong lay tu hai nguon da dat ten:",
				...la.map((t) => `    ${t.viTri} — ${t.chu}`),
			].join("\n"),
		);
	}

	process.stdout.write(
		`nguon-ghi: ${thay.length} cho viet khoa commandType, khop dung danh sach da ghim\n${thay
			.map((t) => `  ${t.viTri} — ${t.loai}`)
			.join("\n")}\n`,
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
	"ghim-cung": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"\n\t\t\t\t\t\tcommandType: input.commandType,",
			'\n\t\t\t\t\t\tcommandType: "CREATE_AGENT",',
		),
	"bien-trung-gian": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"\n\t\t\t\t\t\tcommandType: input.commandType,",
			"\n\t\t\t\t\t\tcommandType: doanQuyen(input.message),",
		),
	"quan-he-long": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"\n\t\t\t\t\tsubmissions: {",
			'\n\t\t\t\t\tbanSao: {\n\t\t\t\t\t\tcreate: {\n\t\t\t\t\t\t\tcommandType: "CREATE_AGENT",\n\t\t\t\t\t\t},\n\t\t\t\t\t},\n\t\t\t\t\tsubmissions: {',
		),
	"upsert-ghim-cung": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"\n\tasync createBuilder(",
			'\n\tasync banSaoUpsert(id: string) {\n\t\treturn this.db.agentConversationSubmission.upsert({\n\t\t\twhere: { id },\n\t\t\tupdate: { commandType: "CREATE_AGENT" },\n\t\t\tcreate: { id },\n\t\t});\n\t}\n\n\tasync createBuilder(',
		),
	"data-la-bien": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"\n\tasync createBuilder(",
			'\n\tasync banSaoNhieu(id: string) {\n\t\tconst hang = [{ conversationId: id, commandType: "CREATE_AGENT" }];\n\t\treturn this.db.agentConversationSubmission.createMany({ data: hang });\n\t}\n\n\tasync createBuilder(',
		),
	"select-thanh-doc": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"\n\t\t\tselect: { id: true },",
			"\n\t\t\tselect: { id: true, commandType: true },",
		),
};

const XEP_DOC = new Set(["select-thanh-doc"]);

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
		if (!/apps\/api\/[^\s]+:\d+/.test(sau.chu)) {
			hongGian(`vecto "${ten}" do nhung khong in file:dong`);
		}
		const dau = sau.chu.indexOf("  tim duoc:");
		const cuoi = sau.chu.indexOf("  da ghim:");
		if (dau === -1 || cuoi === -1 || cuoi <= dau) {
			hongGian(`vecto "${ten}" do nhung khong in duoc khoi "tim duoc"`);
		}
		const soDoc = (sau.chu.slice(dau, cuoi).match(/ :: doc\b/g) ?? []).length;
		if (XEP_DOC.has(ten) && soDoc < 4) {
			hongGian(
				`vecto "${ten}" do nhung cho moi KHONG duoc xep loai "doc" (dem duoc ${soDoc}) — bo do dang khong phan biet doc voi ghi`,
			);
		}
		if (!XEP_DOC.has(ten) && soDoc !== 3) {
			hongGian(
				`vecto "${ten}" lam so cho loai "doc" doi thanh ${soDoc} — dot bien nay le ra chi them mot cho GHI`,
			);
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
