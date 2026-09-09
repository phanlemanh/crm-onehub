import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	GOC,
	hong,
	RANG,
	voiCaySao,
} from "./chung.mjs";
import { duoiKhoaDoc, duyet, hamBao, nap, quetTs, ts, viTri } from "./ast.mjs";

const GHIM = "nguon ghi commandType khong nam trong danh sach da ghim";
const TOI = join(RANG, "nguon-ghi.mjs");
const DUONG_SERVICE = "apps/api/src/conversations/conversations.service.ts";
const VIET = new Set(["create", "update", "upsert"]);

const DA_GHIM = [
	`${DUONG_SERVICE} :: createBuilder :: khai`,
	`${DUONG_SERVICE} :: submitBuilder :: khai`,
	`${DUONG_SERVICE} :: answerBuilderQuestion :: suy`,
];

function nguonCua(khoi) {
	if (!ts.isPropertyAssignment(khoi)) return "la";
	const dau = khoi.initializer;
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
	return "la";
}

function khoiData(goi) {
	const doi = goi.arguments?.[0];
	if (!doi || !ts.isObjectLiteralExpression(doi)) return null;
	for (const thuocTinh of doi.properties) {
		if (
			ts.isPropertyAssignment(thuocTinh) &&
			ts.isIdentifier(thuocTinh.name) &&
			thuocTinh.name.text === "data" &&
			ts.isObjectLiteralExpression(thuocTinh.initializer)
		) {
			return thuocTinh.initializer;
		}
	}
	return null;
}

function thuDanSo(goc) {
	const dan = quetTs(join(goc, "apps", "api", "src"));
	if (dan.length === 0) hong(`${GHIM}\n  dan so rong: khong tep .ts nao duoi apps/api/src`);

	const thay = [];
	for (const duong of dan) {
		const sf = nap(duong);
		duyet(sf, (node) => {
			if (!ts.isCallExpression(node)) return;
			const goi = node.expression;
			if (!ts.isPropertyAccessExpression(goi) || !VIET.has(goi.name.text)) return;
			const data = khoiData(node);
			if (!data) return;
			duyet(data, (con) => {
				const laTen =
					(ts.isPropertyAssignment(con) || ts.isShorthandPropertyAssignment(con)) &&
					ts.isIdentifier(con.name) &&
					con.name.text === "commandType";
				if (!laTen || duoiKhoaDoc(con)) return;
				thay.push({
					khoa: `${viTri(sf, con, goc).replace(/:\d+$/, "")} :: ${hamBao(sf, con)} :: ${nguonCua(con)}`,
					viTri: viTri(sf, con, goc),
					nguon: nguonCua(con),
				});
			});
		});
	}
	return thay;
}

function cham(goc) {
	const thay = thuDanSo(goc);
	const khoaThay = [...new Set(thay.map((t) => t.khoa))].sort();
	const khoaGhim = [...DA_GHIM].sort();

	const la = thay.filter((t) => t.nguon === "la");
	if (la.length > 0) {
		hong(
			[
				GHIM,
				...la.map((t) => `  ${t.viTri} — ${t.khoa}`),
				"  them mot nguon hop le thu ba la viec phai sua danh sach nguon trong rang/nguon-ghi.mjs,",
				"  khong phai viec de thuoc do oan",
			].join("\n"),
		);
	}

	if (khoaThay.join("\n") !== khoaGhim.join("\n")) {
		hong(
			[
				GHIM,
				"  ma tran toan phan lech — tap tim duoc phai BANG DUNG danh sach da ghim",
				"  tim duoc:",
				...thay.map((t) => `    ${t.khoa}   (${t.viTri})`),
				"  da ghim:",
				...khoaGhim.map((k) => `    ${k}`),
			].join("\n"),
		);
	}

	process.stdout.write(
		`nguon-ghi: ${thay.length} cho ghi commandType, khop dung danh sach da ghim\n${thay
			.map((t) => `  ${t.viTri} — ${t.khoa}`)
			.join("\n")}\n`,
	);
}

function doiTrongSao(sao, duong, tim, thay) {
	const d = join(sao, duong);
	const nguon = readFileSync(d, "utf8");
	if (!nguon.includes(tim)) hong(`khong tim thay moc de dot bien trong ${d}`);
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
	"duoi-select": (sao) =>
		doiTrongSao(
			sao,
			DUONG_SERVICE,
			"select: { id: true },",
			"select: { id: true, commandType: true },",
		),
};

const MONG_DOI = {
	"ghim-cung": 2,
	"bien-trung-gian": 2,
	"quan-he-long": 2,
	"duoi-select": 0,
};

chayRang(() => {
	const ten = coCo("--vecto");
	if (!ten) {
		cham(coCo("--goc") ?? GOC);
		return;
	}
	const dotBien = VECTO[ten];
	if (!dotBien) hong(`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`);
	const mong = MONG_DOI[ten];

	const ma = voiCaySao(({ sao }) => {
		const truoc = chay(GOC, ["node", TOI, "--goc", sao]);
		if (truoc.ma !== 0) {
			hong(`doi chung duong hong: cay sao chua dot bien da do\n${truoc.chu}`);
		}
		dotBien(sao);
		const sau = chay(GOC, ["node", TOI, "--goc", sao]);
		process.stdout.write(`cay sao: ${sao}\nvecto: ${ten}\n${sau.chu}`);
		if (sau.ma !== mong) {
			hong(
				`vecto "${ten}" ra ma ${sau.ma}, mong doi ${mong}${mong === 0 ? " — bo do dang khong phan biet doc voi ghi" : " — thuoc khong bat duoc dot bien nay"}`,
			);
		}
		if (mong !== 0) {
			if (!sau.chu.includes(GHIM)) {
				hong(`vecto "${ten}" do nhung thieu thong diep ghim: ${GHIM}`);
			}
			if (!/apps\/api\/[^\s]+:\d+/.test(sau.chu)) {
				hong(`vecto "${ten}" do nhung khong in file:dong`);
			}
		}
		return sau.ma;
	});
	process.exitCode = ma;
});
