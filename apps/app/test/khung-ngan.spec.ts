import { describe, expect, test } from "bun:test";
import { basename, dirname, join } from "node:path";
import ts from "typescript";
import {
	DUONG_KHUON,
	type KhuonNgan,
	khoiCuaTen,
	phanTichKhuon,
} from "../../../tools/oxlint/onehub/shared/doc-khuon-ngan";
import {
	type DocTep,
	docTuDia,
	hamTen,
	phanTich,
	tenThe,
} from "./lib/quet-jsx";

const KHUNG_GOC = "RecordSheetFrame";
const KHUNG_TRINH_BAY = "KhungNgan";
const PROTO = "docs/proto.md";

const NGOAI_LE_MONG = [
	"kr-sheet/Skeleton",
	"so-kr-sheet/Skeleton",
	"company-plans/Spinner",
	"contact-plans/Skeleton",
	"contact-plans/VungTaiLoi",
	"khoi-cap-nhat-kr/Spinner",
	"kr-bang-chung/Dialog",
	"kr-bang-chung/Spinner",
	"lich-su-kr/Skeleton",
	"lich-su-kr/VungTaiLoi",
	"objective-duyet/Dialog",
	"objective-duyet/Spinner",
	"objective-hien-thi/Dialog",
	"objective-hien-thi/Spinner",
	"objective-trao-doi/Skeleton",
	"objective-trao-doi/Spinner",
	"plan-steps/VungTaiLoi",
	"quick-add/Spinner",
	"kr-viec/Skeleton",
	"objective-dien-bien/Skeleton",
];

const KIND_THAT = [
	"deal",
	"contact",
	"company",
	"plan",
	"objective",
	"kr",
	"so-kr",
];

type Sua = Record<string, (nguon: string) => string>;

function docSua(sua: Sua): DocTep {
	const that = docTuDia();
	return (tep) => {
		const nguon = that(tep);
		const doi = sua[tep];
		if (!doi) return nguon;
		return doi(nguon ?? "");
	};
}

function thay(nguon: string, cu: string, moi: string): string {
	if (!nguon.includes(cu)) throw new Error(`fixture: khong thay «${cu}»`);
	return nguon.replace(cu, moi);
}

function kindCuaHost(sf: ts.SourceFile): Map<string, string> {
	const ra = new Map<string, string>();
	const di = (n: ts.Node) => {
		if (
			ts.isConditionalExpression(n) &&
			ts.isBinaryExpression(n.condition) &&
			n.condition.operatorToken.kind ===
				ts.SyntaxKind.EqualsEqualsEqualsToken &&
			n.condition.left.getText().endsWith(".kind") &&
			ts.isStringLiteral(n.condition.right)
		) {
			let nhanh: ts.Node = n.whenTrue;
			while (ts.isParenthesizedExpression(nhanh)) nhanh = nhanh.expression;
			if (ts.isJsxElement(nhanh) || ts.isJsxSelfClosingElement(nhanh))
				ra.set(n.condition.right.text, tenThe(nhanh));
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function nguonNhap(sf: ts.SourceFile): Map<string, string> {
	const ra = new Map<string, string>();
	for (const cau of sf.statements) {
		if (
			!ts.isImportDeclaration(cau) ||
			!ts.isStringLiteral(cau.moduleSpecifier)
		)
			continue;
		const ten = cau.importClause?.namedBindings;
		if (!ten || !ts.isNamedImports(ten)) continue;
		for (const e of ten.elements) ra.set(e.name.text, cau.moduleSpecifier.text);
	}
	return ra;
}

function trongHam(ham: ts.Node): ts.Node[] {
	const ra: ts.Node[] = [];
	const di = (n: ts.Node) => {
		if (n !== ham && ts.isFunctionLike(n)) return;
		if (ts.isReturnStatement(n) && n.expression) ra.push(n.expression);
		ts.forEachChild(n, di);
	};
	di(ham);
	return ra;
}

function thanhPhanDau(n: ts.Node): string | null {
	let x: ts.Node = n;
	while (ts.isParenthesizedExpression(x)) x = x.expression;
	if (ts.isJsxFragment(x)) {
		for (const c of x.children) {
			const t = thanhPhanDau(c);
			if (t) return t;
		}
		return null;
	}
	if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x)) {
		const ten = tenThe(x);
		if (/^[A-Z]/.test(ten)) return ten;
		if (ts.isJsxSelfClosingElement(x)) return null;
		for (const c of x.children) {
			const t = thanhPhanDau(c);
			if (t) return t;
		}
	}
	return null;
}

function gocCuaHam(sf: ts.SourceFile, ten: string): string | null {
	const ham = hamTen(sf, ten);
	if (!ham) return null;
	for (const tra of trongHam(ham)) {
		const t = thanhPhanDau(tra);
		if (t) return t;
	}
	return null;
}

function laKhung(sf: ts.SourceFile, goc: string | null): boolean {
	if (goc === KHUNG_GOC) return true;
	if (!goc) return false;
	return gocCuaHam(sf, goc) === KHUNG_TRINH_BAY;
}

function quetHost(doc: DocTep, k: KhuonNgan): string[] {
	const loi: string[] = [];
	const nguon = doc(k.dangKy);
	if (nguon === null) return [`${k.dangKy}: khong co`];
	const sf = phanTich(k.dangKy, nguon);
	const kinds = kindCuaHost(sf);
	const nhap = nguonNhap(sf);
	const ngoai = new Map(k.ngoaiKhuon.map((n) => [n.kind, n.lyDo]));
	if (k.doiTuong.length !== k.kind.length)
		loi.push("khuon: doi_tuong va nhan_dien.kind khac so phan tu");
	for (const [kind, ly] of ngoai)
		if (!ly.trim()) loi.push(`ngoai_khuon ${kind}: thieu ly do`);
	for (const kind of kinds.keys())
		if (!k.kind.includes(kind) && !ngoai.get(kind)?.trim())
			loi.push(`host dang ky kind ${kind} khong co trong khuon`);
	for (const kind of k.kind) {
		const the = kinds.get(kind);
		if (!the) {
			loi.push(`khuon co kind ${kind} ma host khong dang ky`);
			continue;
		}
		const tu = nhap.get(the);
		if (!tu?.startsWith("./")) {
			loi.push(`host: ${the} khong nhap tu thu muc ngan`);
			continue;
		}
		const tep = `${join(dirname(k.dangKy), tu)}.tsx`;
		const ma = doc(tep);
		if (ma === null) {
			loi.push(`${basename(tep)}: khong co`);
			continue;
		}
		const sfNgan = phanTich(tep, ma);
		const goc = gocCuaHam(sfNgan, the);
		if (!laKhung(sfNgan, goc))
			loi.push(
				`${basename(tep)}: goc JSX la ${goc ?? "rong"}, khong phai khung`,
			);
	}
	return loi;
}

function tenNhap(nguon: string, tep: string): string[] {
	const sf = phanTich(tep, nguon);
	return [...nguonNhap(sf).keys()];
}

function quetNgoaiLe(doc: DocTep, k: KhuonNgan): string[] {
	const loi: string[] = [];
	for (const n of k.ngoaiLe) {
		const nhan = `ngoai_le ${basename(n.tep)}/${n.khoi}`;
		const ma = doc(n.tep);
		if (ma === null) {
			loi.push(`${nhan}: tep khong co`);
			continue;
		}
		if (!k.cam.includes(n.khoi)) {
			loi.push(`${nhan}: khoi khong cam`);
			continue;
		}
		if (!n.lyDo.trim()) loi.push(`${nhan}: thieu ly do`);
		if (!tenNhap(ma, n.tep).some((t) => khoiCuaTen(t, k) === n.khoi))
			loi.push(`${nhan}: ngoai le thua`);
	}
	return loi;
}

function quetProto(doc: DocTep, k: KhuonNgan): string[] {
	const proto = doc(PROTO) ?? "";
	const co = proto
		.split("\n")
		.some((d) => d.includes(k.mauTep) && d.includes(DUONG_KHUON));
	return co ? [] : [`${PROTO}: dong man mau lech khuon`];
}

function khuonTu(doc: DocTep): KhuonNgan {
	return phanTichKhuon(doc(DUONG_KHUON) ?? "");
}

function quet(doc: DocTep): string[] {
	const k = khuonTu(doc);
	return [...quetHost(doc, k), ...quetNgoaiLe(doc, k), ...quetProto(doc, k)];
}

function frontmatter(nguon: string): string {
	return /^---\n([\s\S]*?)\n---/.exec(nguon)?.[1] ?? "";
}

const KHUON_THAT = docTuDia()(DUONG_KHUON) ?? "";

describe("khung-ngan", () => {
	test("cay-that: khong loi, 14 dong ngoai le, dung 20 cap", () => {
		const doc = docTuDia();
		expect(quet(doc)).toEqual([]);
		const k = khuonTu(doc);
		expect(new Set(k.ngoaiLe.map((n) => n.tep)).size).toBe(14);
		const cap = k.ngoaiLe
			.map((n) => `${basename(n.tep, ".tsx")}/${n.khoi}`)
			.sort();
		expect(cap).toEqual([...NGOAI_LE_MONG].sort());
	});

	for (const kind of KIND_THAT) {
		test(`khung: ${kind}`, () => {
			const doc = docTuDia();
			const k = khuonTu(doc);
			expect(k.kind).toContain(kind);
			expect(quetHost(doc, k).filter((d) => d.includes(kind))).toEqual([]);
		});
	}

	test("thieu-ly-do: ly_do rong thi do", () => {
		const doc = docSua({
			[DUONG_KHUON]: (s) =>
				thay(
					s,
					"ly_do: chờ tải của riêng mục «Sổ nguồn» khi quyền còn chưa biết, bên trong thân đã tải xong — không phải chờ tải của ngăn",
					"ly_do: ",
				),
		});
		expect(quetNgoaiLe(doc, khuonTu(doc))).toEqual([
			"ngoai_le kr-sheet.tsx/Skeleton: thieu ly do",
		]);
		expect(khuonTu(doc).ngoaiLe).toHaveLength(NGOAI_LE_MONG.length);
	});

	test("tep-khong-co: dong tro tep khong co thi do", () => {
		const doc = docSua({
			[DUONG_KHUON]: (s) =>
				thay(s, "record-sheet/quick-add.tsx", "record-sheet/khong-co.tsx"),
		});
		expect(quetNgoaiLe(doc, khuonTu(doc))).toEqual([
			"ngoai_le khong-co.tsx/Spinner: tep khong co",
		]);
	});

	test("khoi-khong-cam: khoi ngoai cam_ngoai_khuon thi do", () => {
		const doc = docSua({
			[DUONG_KHUON]: (s) =>
				thay(
					s,
					"record-sheet/so-kr-sheet.tsx\n    khoi: Skeleton",
					"record-sheet/so-kr-sheet.tsx\n    khoi: [Skeleton, DetailSheetEmpty]",
				),
		});
		expect(quetNgoaiLe(doc, khuonTu(doc))).toEqual([
			"ngoai_le so-kr-sheet.tsx/DetailSheetEmpty: khoi khong cam",
		]);
	});

	test("ngoai-le-thua: tep thoi nhap khoi thi do", () => {
		const tep = "apps/app/components/crm/record-sheet/quick-add.tsx";
		const doc = docSua({
			[tep]: (s) =>
				thay(s, 'import { Spinner } from "@crm/ui/components/spinner";', ""),
		});
		expect(quetNgoaiLe(doc, khuonTu(doc))).toEqual([
			"ngoai_le quick-add.tsx/Spinner: ngoai le thua",
		]);
	});

	test("kind-thua: host dang ky kind ngoai khuon thi do", () => {
		const host = "apps/app/components/crm/record-sheet/record-sheet-host.tsx";
		const doc = docSua({
			[host]: (s) =>
				thay(
					s,
					'{shown?.kind === "viec" ? (',
					'{shown?.kind === "hop-dong" ? (\n\t\t\t\t\t<DealSheet key="x" dealId="x" />\n\t\t\t\t) : null}\n\t\t\t\t{shown?.kind === "viec" ? (',
				),
		});
		expect(quetHost(doc, khuonTu(doc))).toEqual([
			"host dang ky kind hop-dong khong co trong khuon",
		]);
	});

	test("kind-thieu: khuon co kind host khong dang ky thi do", () => {
		const doc = docSua({
			[DUONG_KHUON]: (s) =>
				thay(
					s,
					"kind: [deal, contact, company, plan, objective, kr, so-kr]",
					"kind: [deal, contact, company, plan, objective, kr, so-kr, hop-dong]",
				),
		});
		expect(quetHost(doc, khuonTu(doc))).toEqual([
			"khuon: doi_tuong va nhan_dien.kind khac so phan tu",
			"khuon co kind hop-dong ma host khong dang ky",
		]);
	});

	test("ngoai-khung: ngan dung DetailSheetHeader lam goc thi do", () => {
		const tep = "apps/app/components/crm/record-sheet/deal-sheet.tsx";
		const doc = docSua({
			[tep]: (s) => thay(s, "<RecordSheetFrame", "<DetailSheetHeader"),
		});
		expect(quetHost(doc, khuonTu(doc))).toEqual([
			"deal-sheet.tsx: goc JSX la DetailSheetHeader, khong phai khung",
		]);
	});

	test("sheet-dialog: khuon cam Sheet, Dialog; ba tep Dialog tho co ly do", () => {
		const k = khuonTu(docTuDia());
		expect(k.cam).toContain("Sheet");
		expect(k.cam).toContain("Dialog");
		for (const tep of [
			"kr-bang-chung.tsx",
			"objective-duyet.tsx",
			"objective-hien-thi.tsx",
		]) {
			const dong = k.ngoaiLe.find(
				(n) => basename(n.tep) === tep && n.khoi === "Dialog",
			);
			expect(dong?.lyDo.trim().length ?? 0).toBeGreaterThan(0);
		}
	});

	test("proto-mau: docs/proto.md co dong man mau tro khuon", () => {
		expect(quetProto(docTuDia(), khuonTu(docTuDia()))).toEqual([]);
	});

	test("proto-lech: doi mau_dang_chay ma khong doi dong thi do", () => {
		const doc = docSua({
			[DUONG_KHUON]: (s) =>
				thay(
					s,
					"  tep: apps/app/components/crm/record-sheet/deal-sheet.tsx",
					"  tep: apps/app/components/crm/record-sheet/contact-sheet.tsx",
				),
		});
		expect(quetProto(doc, khuonTu(doc))).toEqual([
			"docs/proto.md: dong man mau lech khuon",
		]);
	});

	test("khu-hoi-yaml: bo doc tu viet khop Bun.YAML", () => {
		const k = phanTichKhuon(KHUON_THAT);
		const y = Bun.YAML.parse(frontmatter(KHUON_THAT)) as {
			doi_tuong: string[];
			khuon: { nhap: string };
			nhan_dien: {
				dang_ky: string;
				kind: string[];
				ngoai_khuon: { kind: string; ly_do: string }[];
			};
			mau_dang_chay: { tep: string };
			cam_ngoai_khuon: string[];
			cam_ho: string[];
			thay_cho: Record<string, string>;
			ngoai_le: { tep: string; khoi: string | string[]; ly_do: string }[];
		};
		expect(k.doiTuong).toEqual(y.doi_tuong);
		expect(k.khuonNhap).toBe(y.khuon.nhap);
		expect(k.dangKy).toBe(y.nhan_dien.dang_ky);
		expect(k.kind).toEqual(y.nhan_dien.kind);
		expect(k.ngoaiKhuon).toEqual(
			y.nhan_dien.ngoai_khuon.map((n) => ({ kind: n.kind, lyDo: n.ly_do })),
		);
		expect(k.mauTep).toBe(y.mau_dang_chay.tep);
		expect(k.cam).toEqual(y.cam_ngoai_khuon);
		expect(k.camHo).toEqual(y.cam_ho);
		expect(k.thayCho).toEqual(y.thay_cho);
		expect(k.ngoaiLe).toEqual(
			y.ngoai_le.flatMap((n) =>
				(Array.isArray(n.khoi) ? n.khoi : [n.khoi]).map((khoi) => ({
					tep: n.tep,
					khoi,
					lyDo: n.ly_do,
				})),
			),
		);
	});

	test("danh-sach-khoi: danh sach dang khoi thi bo doc nem loi", () => {
		const sai = thay(
			KHUON_THAT,
			"cam_ngoai_khuon: [DetailSheetHeader, Spinner, VungTaiLoi, Skeleton, Sheet, Dialog]",
			"cam_ngoai_khuon:\n  - DetailSheetHeader\n  - Spinner",
		);
		expect(() => phanTichKhuon(sai)).toThrow("cam_ngoai_khuon");
	});

	test("thieu-thay: khoi thieu thay_cho thi bo doc nem loi", () => {
		const sai = thay(KHUON_THAT, "  Spinner: ChoTaiNgan\n", "");
		expect(() => phanTichKhuon(sai)).toThrow("thay_cho thieu Spinner");
	});
});
