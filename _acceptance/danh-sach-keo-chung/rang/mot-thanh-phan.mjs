import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const CAI_DAT = "apps/app/app/(app)/[slug]/settings";
const NHOM = ["giai-doan", "organization"];
const NGUON = "@crm/ui/components/sortable-list";
const CAM = new Set(["SortableList", "SortableItem"]);
const HOP = "organization/danh-sach-keo.tsx";

function tepTsx(thuMuc) {
	return readdirSync(thuMuc, { withFileTypes: true }).flatMap((m) =>
		m.isDirectory()
			? tepTsx(join(thuMuc, m.name))
			: m.name.endsWith(".tsx")
				? [join(thuMuc, m.name)]
				: [],
	);
}

function docTep(duong) {
	const nguon = readFileSync(duong, "utf8");
	return ts.createSourceFile(
		duong,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function tenNhap(sf) {
	return sf.statements.flatMap((st) => {
		if (!ts.isImportDeclaration(st)) return [];
		if (
			!ts.isStringLiteral(st.moduleSpecifier) ||
			st.moduleSpecifier.text !== NGUON
		)
			return [];
		const ten = st.importClause?.namedBindings;
		if (!ten || !ts.isNamedImports(ten)) return [];
		return ten.elements.map((e) => (e.propertyName ?? e.name).text);
	});
}

function hopTuDung(sf) {
	const thay = [];
	const duyet = (n) => {
		if (ts.isJsxAttribute(n) && n.name.getText(sf) === "className") {
			const chu = n.initializer?.getText(sf) ?? "";
			if (/\brounded-lg\b/.test(chu) && /\bborder\b/.test(chu)) {
				thay.push(sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1);
			}
		}
		ts.forEachChild(n, duyet);
	};
	duyet(sf);
	return thay;
}

export function kiem(goc) {
	const loi = [];
	const dung = {};
	for (const nhom of NGUON_NHOM(goc)) {
		dung[nhom.ten] = [];
		for (const tep of tepTsx(nhom.thuMuc)) {
			const sf = docTep(tep);
			const ten = relative(join(goc, CAI_DAT), tep);
			const nhap = tenNhap(sf);
			for (const x of nhap.filter((t) => CAM.has(t))) {
				loi.push(`${ten}: nhap ${x} truc tiep`);
			}
			if (nhap.includes("SortableSaveList")) dung[nhom.ten].push(ten);
			if (ten === HOP) {
				for (const dong of hopTuDung(sf)) {
					loi.push(`${ten}:${dong}: hop rounded-lg border tu dung`);
				}
			}
		}
		if (dung[nhom.ten].length === 0) {
			loi.push(`${nhom.ten}: khong tep nao dung SortableSaveList`);
		}
	}
	return { loi, dung };
}

function NGUON_NHOM(goc) {
	return NHOM.map((ten) => ({ ten, thuMuc: join(goc, CAI_DAT, ten) }));
}

const SACH = {
	"giai-doan/a.tsx": `import { SortableSaveList } from "${NGUON}";\nexport const A = SortableSaveList;\n`,
	"organization/danh-sach-keo.tsx": `import { SortableSaveList } from "${NGUON}";\nexport const B = () => <SortableSaveList />;\n`,
};

const MAU_THU = [
	{
		ten: "nhap-sortable-list",
		tep: {
			...SACH,
			"giai-doan/b.tsx": `import { SortableList } from "${NGUON}";\nexport const C = SortableList;\n`,
		},
		goiTen: "giai-doan/b.tsx",
	},
	{
		ten: "khong-dung-save-list",
		tep: {
			"giai-doan/a.tsx": "export const A = 1;\n",
			"organization/danh-sach-keo.tsx": SACH["organization/danh-sach-keo.tsx"],
		},
		goiTen: "giai-doan: khong tep nao",
	},
	{
		ten: "hop-tu-dung",
		tep: {
			...SACH,
			"organization/danh-sach-keo.tsx": `import { SortableSaveList } from "${NGUON}";\nexport const B = () => (\n\t<div className="rounded-lg border">\n\t\t<SortableSaveList />\n\t</div>\n);\n`,
		},
		goiTen: "organization/danh-sach-keo.tsx:3",
	},
];

function tuThu() {
	const doc = [];
	let hong = 0;
	for (const mau of [
		{ ten: "doi-chung-sach", tep: SACH, goiTen: null },
		...MAU_THU,
	]) {
		const tam = mkdtempSync(join(tmpdir(), "dsk-mot-thanh-phan-"));
		try {
			for (const [duong, nguon] of Object.entries(mau.tep)) {
				const day = join(tam, CAI_DAT, duong);
				mkdirSync(dirname(day), { recursive: true });
				writeFileSync(day, nguon);
			}
			const { loi } = kiem(tam);
			const dat =
				mau.goiTen === null
					? loi.length === 0
					: loi.some((l) => l.includes(mau.goiTen));
			if (!dat) hong += 1;
			doc.push(
				`${dat ? "DUNG" : "SAI"} tu-thu ${mau.ten}: ${loi.length === 0 ? "sach" : loi.join("; ")}`,
			);
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	for (const d of doc) console.log(d);
	return hong;
}

if (process.argv.includes("--tu-thu")) {
	process.exit(tuThu() === 0 ? 0 : 1);
}

const { loi, dung } = kiem(GOC);
for (const l of loi) console.log(`SAI ${l}`);
if (loi.length > 0) {
	console.log(`KET LUAN: ${loi.length} vi pham`);
	process.exit(1);
}
const ds = Object.values(dung).flat().join(", ");
console.log(`0 import SortableList truc tiep; SortableSaveList o ${ds}`);
