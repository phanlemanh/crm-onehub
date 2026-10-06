import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TEP_VONG = process.env.CVDN_TEP_VONG ?? join(HERE, "tep-vong.txt");
const CAM_NHAP = ["@crm/auth", "@crm/db"];
const LOI_VAO_CLIENT = new Set(["@crm/auth/client"]);
const LOP_CAM = [
	/(^|\s)(hover:|dark:)?bg-/,
	/(^|\s)(hover:|dark:)?rounded-/,
	/(^|\s)(hover:|dark:)?border/,
	/(^|\s)(hover:|dark:)?shadow/,
	/(^|\s)(hover:|dark:)?text-(?!xs|sm|base|lg|xl|[0-9]|left|right|center|balance|pretty|wrap|nowrap)/,
];
const DUONG_CAM = [
	"apps/app/components/landing/",
	"apps/app/proxy.ts",
	"packages/auth/",
];
const CAN_DUNG = [
	{
		tep: "apps/app/components/cua-vao/khoi-huong-dan.tsx",
		ten: "StepList",
		tu: "@crm/ui/components/step-list",
	},
	{
		tep: "apps/app/components/cua-vao/o-loi-dang-nhap.tsx",
		ten: "Alert",
		tu: "@crm/ui/components/alert",
	},
];

function docTepVong() {
	return readFileSync(TEP_VONG, "utf8")
		.split("\n")
		.map((t) => t.trim())
		.filter((t) => t !== "");
}

function tepVongNay() {
	if (process.env.CVDN_SOI_TEP) return process.env.CVDN_SOI_TEP.split(":");
	return docTepVong().filter(
		(t) =>
			t.startsWith("apps/app/") &&
			/\.(ts|tsx)$/.test(t) &&
			!t.startsWith("apps/app/test/") &&
			existsSync(join(GOC, t)),
	);
}

function docNguon(tep) {
	const duong = tep.startsWith("/") ? tep : join(GOC, tep);
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function laClient(nguon) {
	const dau = nguon.statements[0];
	return (
		dau !== undefined &&
		ts.isExpressionStatement(dau) &&
		ts.isStringLiteral(dau.expression) &&
		dau.expression.text === "use client"
	);
}

function nhapTu(nguon) {
	const bang = new Map();
	for (const s of nguon.statements) {
		if (!ts.isImportDeclaration(s)) continue;
		const tu = s.moduleSpecifier.text;
		const kb = s.importClause;
		if (kb?.name) bang.set(kb.name.text, tu);
		const nb = kb?.namedBindings;
		if (nb && ts.isNamedImports(nb))
			for (const e of nb.elements) bang.set(e.name.text, tu);
	}
	return bang;
}

export function soiTep(tep) {
	const nguon = docNguon(tep);
	const nhap = nhapTu(nguon);
	const loi = [];
	if (laClient(nguon)) {
		for (const tu of new Set(nhap.values())) {
			if (
				!LOI_VAO_CLIENT.has(tu) &&
				CAM_NHAP.some((c) => tu === c || tu.startsWith(`${c}/`))
			) {
				loi.push(`(a) tep client nhap ${tu}`);
			}
		}
	}
	const duyet = (n) => {
		if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
			const ten = n.tagName.getText();
			const tu = nhap.get(ten.split(".")[0]);
			if (tu?.startsWith("@crm/ui/")) {
				for (const tt of n.attributes.properties) {
					if (!ts.isJsxAttribute(tt) || tt.name.getText() !== "className")
						continue;
					const lop = tt.initializer?.getText() ?? "";
					const cam = LOP_CAM.find((re) =>
						re.test(lop.replace(/^["'{`]+|["'}`]+$/g, "")),
					);
					if (cam)
						loi.push(`(c) <${ten}> className doi mau/goc/vien/bong: ${lop}`);
				}
			}
		}
		ts.forEachChild(n, duyet);
	};
	duyet(nguon);
	return loi;
}

function chay() {
	const dong = [];
	const ghi = (dat, chu) => dong.push({ dat, chu });

	for (const [tep, can] of [
		["fixtures/client-nhap-auth.tsx", "(a)"],
		["fixtures/ui-doi-mau.tsx", "(c)"],
	]) {
		const loi = soiTep(join(HERE, tep));
		ghi(
			loi.some((l) => l.startsWith(can)),
			`doi-chung ${tep}: bo soi bat duoc ${can}`,
		);
	}

	const tep = tepVongNay();
	ghi(tep.length > 0, `danh-sach: ${tep.length} tep vong nay trong apps/app`);
	for (const t of tep) {
		const loi = soiTep(t);
		ghi(
			loi.length === 0,
			loi.length === 0 ? `(a)(c) ${t}` : `${t}: ${loi.join("; ")}`,
		);
	}

	for (const { tep: t, ten, tu } of CAN_DUNG) {
		const co = existsSync(join(GOC, t)) && nhapTu(docNguon(t)).get(ten) === tu;
		ghi(co, `(b) ${t} dung ${ten} tu ${tu}`);
	}

	if (!process.env.CVDN_SOI_TEP) {
		const cham = docTepVong().filter((t) =>
			DUONG_CAM.some((d) => t === d || t.startsWith(d)),
		);
		ghi(
			cham.length === 0,
			cham.length === 0
				? "(d) vong khong cham landing, proxy.ts, packages/auth"
				: `(d) vong cham: ${cham.join(", ")}`,
		);
	}

	for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
	const sai = dong.filter((d) => !d.dat).length;
	console.log(
		`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
	);
	process.exit(sai ? 1 : 0);
}

if (import.meta.main) chay();
