import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { z } from "zod";
import {
	type DocTep,
	docTuDia,
	dongCua,
	GOC_KHO,
	moiPhanTu,
	phanTich,
	TIEN_SLUG,
	tenThe,
	thuocTinh,
} from "./lib/quet-jsx";

const TEP_NGOAI_LE = "apps/app/test/fixtures/hang-cong-cu-ngoai-le.json";
const VUNG = ["apps/app/app/", "apps/app/components/"];
const BO_QUA = ["apps/app/app/proto/"];
const DAU_HIEU = [
	"chip-dinh-thanh",
	"chip-trong-the",
	"nhom-gap-bang",
] as const;
const LOAI = ["no", "o-nhap"] as const;
const BAO_O_NHAP = new Set(["Field", "FieldSet", "FieldGroup"]);
const THE = new Set(["Card", "CardHeader", "CardContent"]);
const BE_MAT_BANG = /^(Bang[A-Z]\w*|DataTable|SimpleTable|Table)$/;

const dongNgoaiLe = z.object({
	tep: z.string(),
	dau_hieu: z.string(),
	so: z.number().int(),
	loai: z.string(),
	ly_do: z.string(),
});

type DongNgoaiLe = z.infer<typeof dongNgoaiLe>;
type DauHieu = (typeof DAU_HIEU)[number];
type Trung = { tep: string; dau_hieu: DauHieu; dong: number };
type KetQuaQuet = { loi: string[]; trung: Trung[]; daDoc: string[] };

function docNgoaiLe(nguon: string): DongNgoaiLe[] {
	const kq = z.array(dongNgoaiLe).safeParse(JSON.parse(nguon));
	if (!kq.success) {
		throw new Error(`hcc: ${TEP_NGOAI_LE} sai khuon: ${kq.error.message}`);
	}
	return kq.data;
}

function locTep(ds: string[]): string[] {
	return ds
		.filter(
			(t) =>
				t.endsWith(".tsx") &&
				VUNG.some((v) => t.startsWith(v)) &&
				!BO_QUA.some((b) => t.startsWith(b)),
		)
		.sort();
}

function moiTep(): string[] {
	const ra = execFileSync(
		"git",
		[
			"-C",
			GOC_KHO,
			"ls-files",
			"--cached",
			"--others",
			"--exclude-standard",
			"--",
			...VUNG,
		],
		{ encoding: "utf8" },
	);
	return locTep([...new Set(ra.split("\n").filter(Boolean))]);
}

function tenNgan(tep: string): string {
	return tep.startsWith(TIEN_SLUG)
		? tep.slice(TIEN_SLUG.length)
		: tep.replace("apps/app/", "");
}

function toTien(n: ts.Node): string[] {
	const ra: string[] = [];
	for (let p = n.parent; p; p = p.parent) {
		if (ts.isJsxElement(p)) ra.push(tenThe(p));
	}
	return ra;
}

function laONhap(n: ts.JsxElement | ts.JsxSelfClosingElement): boolean {
	return toTien(n).some((t) => BAO_O_NHAP.has(t));
}

function timDauHieu(tep: string, nguon: string): Trung[] {
	const sf = phanTich(tep, nguon);
	const ra: Trung[] = [];
	for (const n of moiPhanTu(sf)) {
		const ten = tenThe(n);
		if (ten === "ToggleGroup" && !laONhap(n)) {
			const dong = dongCua(sf, n);
			if (thuocTinh(n, "spacing")?.initializer?.getText() === "{0}") {
				ra.push({ tep, dau_hieu: "chip-dinh-thanh", dong });
			}
			if (toTien(n).some((t) => THE.has(t))) {
				ra.push({ tep, dau_hieu: "chip-trong-the", dong });
			}
		}
		if (
			ten === "CollapsibleContent" &&
			moiPhanTu(n).some((x) => BE_MAT_BANG.test(tenThe(x)))
		) {
			ra.push({ tep, dau_hieu: "nhom-gap-bang", dong: dongCua(sf, n) });
		}
	}
	return ra;
}

const CAU = {
	"chip-dinh-thanh": "chip loc dinh thanh (spacing={0})",
	"chip-trong-the": "chip loc trong the",
	"nhom-gap-bang": "nhom gap chua bang duoi bang",
} as const satisfies Record<DauHieu, string>;

function quetHangCongCu(
	doc: DocTep,
	tep: string[],
	bang: DongNgoaiLe[],
): KetQuaQuet {
	const ds = locTep(tep);
	const tap = new Set(ds);
	const loi: string[] = [];
	const trung: Trung[] = [];
	const daDoc: string[] = [];
	for (const t of ds) {
		const nguon = doc(t);
		daDoc.push(t);
		if (nguon === null) {
			loi.push(`hcc: khong doc duoc ${tenNgan(t)}`);
			continue;
		}
		if (!nguon.includes("ToggleGroup") && !nguon.includes("Collapsible")) {
			continue;
		}
		trung.push(...timDauHieu(t, nguon));
	}
	const khoa = (tep: string, d: string) => `${tep}\u0000${d}`;
	const dem = new Map<string, number>();
	for (const x of trung) {
		dem.set(
			khoa(x.tep, x.dau_hieu),
			(dem.get(khoa(x.tep, x.dau_hieu)) ?? 0) + 1,
		);
	}
	const daKhai = new Map<string, DongNgoaiLe>();
	for (const d of bang) {
		const ngan = tenNgan(d.tep);
		const k = khoa(d.tep, d.dau_hieu);
		if (daKhai.has(k)) loi.push(`hcc: ngoai le trung ${ngan} ${d.dau_hieu}`);
		daKhai.set(k, d);
		if (!tap.has(d.tep)) loi.push(`hcc: ngoai le tro tep khong con ${ngan}`);
		if (!(DAU_HIEU as readonly string[]).includes(d.dau_hieu)) {
			loi.push(`hcc: ngoai le dau hieu la ${d.dau_hieu} o ${ngan}`);
		}
		if (!(LOAI as readonly string[]).includes(d.loai)) {
			loi.push(`hcc: ngoai le loai la ${d.loai} o ${ngan}`);
		}
		if (d.ly_do.trim() === "") loi.push(`hcc: ngoai le thieu ly do o ${ngan}`);
		const thuc = dem.get(k) ?? 0;
		if (tap.has(d.tep) && thuc < d.so) {
			loi.push(
				`hcc: ngoai le thua ${ngan} ${d.dau_hieu} (khai ${d.so}, con ${thuc})`,
			);
		}
	}
	for (const x of trung) {
		const k = khoa(x.tep, x.dau_hieu);
		const d = daKhai.get(k);
		if (d && (dem.get(k) ?? 0) <= d.so) continue;
		loi.push(`hcc: ${tenNgan(x.tep)}:${x.dong} ${CAU[x.dau_hieu]}`);
	}
	return { loi, trung, daDoc };
}

const DOC = docTuDia();
const TEP = moiTep();
const BANG = docNgoaiLe(readFileSync(join(GOC_KHO, TEP_NGOAI_LE), "utf8"));
const TRANG_MOI = `${TIEN_SLUG}trang-moi/loc.tsx`;
const LICH = `${TIEN_SLUG}settings/lich-lam-viec/lich-lam-viec.tsx`;

const NO_DUNG = [
	`${TIEN_SLUG}okr/moi-kr/moi-kr.tsx`,
	`${TIEN_SLUG}overview-scope.tsx`,
	"apps/app/components/crm/timeline/timeline.tsx",
	"apps/app/components/lo-trinh/trang-lo-trinh.tsx",
	`${TIEN_SLUG}okr/hop-tuan.tsx`,
	`${TIEN_SLUG}okr/nhom-da-bo.tsx`,
	"apps/app/components/du-an/tat-ca-du-an.tsx",
];

function docThem(goc: DocTep, them: Record<string, string>): DocTep {
	return (t) => them[t] ?? goc(t);
}

const CHIP_TRONG_THE = `export function Loc() {
	return (
		<Card>
			<CardContent>
				<ToggleGroup type="single" variant="outline" size="sm">
					<ToggleGroupItem value="a">A</ToggleGroupItem>
				</ToggleGroup>
			</CardContent>
		</Card>
	);
}
`;
const CHIP_DINH_THANH = `export function Loc() {
	return (
		<ToggleGroup type="single" variant="outline" size="sm" spacing={0}>
			<ToggleGroupItem value="a">A</ToggleGroupItem>
		</ToggleGroup>
	);
}
`;
const NHOM_GAP = `export function Loc() {
	return (
		<div>
			<DataTable />
			<Collapsible>
				<CollapsibleTrigger>Da bo (3)</CollapsibleTrigger>
				<CollapsibleContent>
					<DataTable />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
`;
const HANG_DUNG = `export function Loc() {
	return (
		<div>
			<ToggleGroup type="single" variant="outline" size="sm">
				<ToggleGroupItem value="a">A</ToggleGroupItem>
			</ToggleGroup>
			<Collapsible>
				<CollapsibleTrigger>Doc them</CollapsibleTrigger>
				<CollapsibleContent>
					<p>x</p>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
`;

const quetMoi = (nguon: string, t: string = TRANG_MOI) =>
	quetHangCongCu(docThem(DOC, { [t]: nguon }), [...TEP, t], BANG).loi;

describe("tap-tep", () => {
	test("quet moi tep tsx cua app va components, tru proto", () => {
		const { loi, trung, daDoc } = quetHangCongCu(DOC, TEP, BANG);
		const docLap = execFileSync(
			"git",
			[
				"-C",
				GOC_KHO,
				"ls-files",
				"--cached",
				"--others",
				"--exclude-standard",
				"--",
				":(glob)apps/app/app/**/*.tsx",
				":(glob)apps/app/components/**/*.tsx",
				":(exclude,glob)apps/app/app/proto/**",
			],
			{ encoding: "utf8" },
		)
			.split("\n")
			.filter(Boolean);
		expect([...new Set(daDoc)].sort()).toEqual([...new Set(docLap)].sort());
		expect(daDoc.some((t) => t.startsWith(TIEN_SLUG))).toBe(true);
		expect(daDoc.some((t) => t.startsWith("apps/app/components/"))).toBe(true);
		expect(loi).toEqual([]);
		process.stdout.write(
			`hcc: ${TEP.length} tep · ${trung.length} dau hieu da khai\n`,
		);
	});
});

describe("chip-dinh-thanh", () => {
	test("chieu do: tep moi co chip loc spacing 0", () => {
		expect(quetMoi(CHIP_DINH_THANH)).toEqual([
			"hcc: trang-moi/loc.tsx:3 chip loc dinh thanh (spacing={0})",
		]);
	});
});

describe("chip-trong-the", () => {
	test("chieu do: tep moi dat chip loc trong CardContent", () => {
		expect(quetMoi(CHIP_TRONG_THE)).toEqual([
			"hcc: trang-moi/loc.tsx:5 chip loc trong the",
		]);
	});
});

describe("nhom-gap-bang", () => {
	test("chieu do: tep moi gap mot bang duoi bang", () => {
		expect(quetMoi(NHOM_GAP)).toEqual([
			"hcc: trang-moi/loc.tsx:7 nhom gap chua bang duoi bang",
		]);
	});
});

describe("doi-chung-duong", () => {
	test("chip dung khuon va nhom gap khong chua bang thi im", () => {
		expect(quetMoi(HANG_DUNG)).toEqual([]);
	});

	test("o nhap trong Field duoc mien, bo Field thi do", () => {
		const trongField = `export function O() {
	return (
		<Field>
			<ToggleGroup type="single" spacing={0}>
				<ToggleGroupItem value="a">A</ToggleGroupItem>
			</ToggleGroup>
		</Field>
	);
}
`;
		expect(quetMoi(trongField)).toEqual([]);
		expect(
			quetMoi(
				trongField.replace("<Field>", "<div>").replace("</Field>", "</div>"),
			),
		).toEqual(["hcc: trang-moi/loc.tsx:4 chip loc dinh thanh (spacing={0})"]);
	});
});

describe("ma-tran-boc", () => {
	const chip = (mo: string, dong: string, them = "") =>
		`export function L() {\n\treturn (\n\t\t${mo}\n\t\t\t<ToggleGroup type="single"${them}>\n\t\t\t\t<ToggleGroupItem value="a">A</ToggleGroupItem>\n\t\t\t</ToggleGroup>\n\t\t${dong}\n\t);\n}\n`;
	const trong = "hcc: trang-moi/loc.tsx:4 chip loc trong the";

	test("chip trong Card, CardHeader, CardContent deu do", () => {
		expect(quetMoi(chip("<Card>", "</Card>"))).toEqual([trong]);
		expect(quetMoi(chip("<CardHeader>", "</CardHeader>"))).toEqual([trong]);
		expect(quetMoi(chip("<CardContent>", "</CardContent>"))).toEqual([trong]);
	});

	test("aria-labelledby khong mien: chip co nhan trong CardContent van do", () => {
		expect(
			quetMoi(chip("<CardContent>", "</CardContent>", ' aria-labelledby="t"')),
		).toEqual([trong]);
	});

	test("o nhap trong Field, FieldSet, FieldGroup duoc mien, ke ca trong Card", () => {
		for (const boc of ["Field", "FieldSet", "FieldGroup"]) {
			expect(
				quetMoi(chip(`<Card><${boc}>`, `</${boc}></Card>`, " spacing={0}")),
			).toEqual([]);
		}
		expect(
			quetMoi(chip("<Card><div>", "</div></Card>", " spacing={0}")),
		).toEqual([
			"hcc: trang-moi/loc.tsx:4 chip loc dinh thanh (spacing={0})",
			trong,
		]);
	});

	test("nhom gap chua Bang…, DataTable, SimpleTable, Table deu do; Item thi im", () => {
		const gap = (be: string) =>
			`export function G() {\n\treturn (\n\t\t<Collapsible>\n\t\t\t<CollapsibleContent>\n\t\t\t\t<${be} />\n\t\t\t</CollapsibleContent>\n\t\t</Collapsible>\n\t);\n}\n`;
		for (const be of ["BangDaBo", "DataTable", "SimpleTable", "Table"]) {
			expect(quetMoi(gap(be))).toEqual([
				"hcc: trang-moi/loc.tsx:4 nhom gap chua bang duoi bang",
			]);
		}
		expect(quetMoi(gap("Item"))).toEqual([]);
	});
});

describe("bang-ngoai-le", () => {
	const dau = BANG[0] as DongNgoaiLe;
	const ngan = tenNgan(dau.tep);
	const quet = (bang: DongNgoaiLe[]) => quetHangCongCu(DOC, TEP, bang).loi;
	const thay = (moi: Partial<DongNgoaiLe>) => [
		{ ...dau, ...moi },
		...BANG.slice(1),
	];

	test("chieu do: tep khong con", () => {
		expect(
			quet([
				...BANG,
				{
					tep: `${TIEN_SLUG}khong-co.tsx`,
					dau_hieu: "chip-dinh-thanh",
					so: 1,
					loai: "no",
					ly_do: "x",
				},
			]),
		).toEqual(["hcc: ngoai le tro tep khong con khong-co.tsx"]);
	});

	test("chieu do: trung, dau hieu la, loai la, thieu ly do", () => {
		expect(quet([...BANG, dau])).toContain(
			`hcc: ngoai le trung ${ngan} ${dau.dau_hieu}`,
		);
		expect(quet(thay({ loai: "khac" }))).toEqual([
			`hcc: ngoai le loai la khac o ${ngan}`,
		]);
		expect(quet(thay({ ly_do: " " }))).toEqual([
			`hcc: ngoai le thieu ly do o ${ngan}`,
		]);
		expect(quet(thay({ dau_hieu: "khac" }))).toContain(
			`hcc: ngoai le dau hieu la khac o ${ngan}`,
		);
	});

	test("chieu do: khai thua so va them mot cho moi o tep da khai", () => {
		expect(quet(thay({ so: dau.so + 1 }))).toEqual([
			`hcc: ngoai le thua ${ngan} ${dau.dau_hieu} (khai ${dau.so + 1}, con ${dau.so})`,
		]);
		const lich = BANG.find((d) => d.tep === LICH) as DongNgoaiLe;
		const it = quet(BANG.map((d) => (d === lich ? { ...d, so: 0 } : d)));
		expect(it.length).toBe(1);
		expect(it[0]).toStartWith("hcc: settings/lich-lam-viec/lich-lam-viec.tsx:");
		expect(it[0]).toEndWith("chip loc trong the");
	});
});

describe("doi-chung-bang", () => {
	test("bang 10 dong, bay dong no dung tap, moi dong no co dich", () => {
		expect(BANG.length).toBe(10);
		const no = BANG.filter((d) => d.loai === "no");
		expect(no.map((d) => d.tep).sort()).toEqual([...NO_DUNG].sort());
		expect(no.filter((d) => !d.ly_do.includes("đích:"))).toEqual([]);
	});
});

describe("chieu-im", () => {
	test("tep ngoai app, components hay trong proto khong bi quet", () => {
		const ngoai = [
			"docs/x/loc.tsx",
			"_acceptance/x/loc.tsx",
			"packages/ui/src/x/loc.tsx",
			"apps/app/app/proto/_modules/x/loc.tsx",
		];
		const doc = docThem(
			DOC,
			Object.fromEntries(ngoai.map((t) => [t, CHIP_DINH_THANH])),
		);
		expect(quetHangCongCu(doc, [...TEP, ...ngoai], BANG).loi).toEqual([]);
	});
});
