import { describe, expect, test } from "bun:test";
import { type DocTep, docTuDia, TIEN_SLUG } from "./lib/quet-jsx";
import {
	bangThat,
	type DongNgoaiLe,
	moiTrang,
	quetKhungTrang,
	soTapTrang,
} from "./support/khung-trang";

const DOC = docTuDia();
const TRANG = moiTrang();
const BANG = bangThat();
const TAI_LIEU = `${TIEN_SLUG}tai-lieu/page.tsx`;
const LIEN_HE = `${TIEN_SLUG}contacts/page.tsx`;
const THOA_THUAN = `${TIEN_SLUG}deals/[dealId]/page.tsx`;
const CHIEN_DICH = `${TIEN_SLUG}campaigns/[campaignId]/page.tsx`;
const TRANG_MOI = `${TIEN_SLUG}trang-moi/page.tsx`;

const NO_DUNG = [
	"(agent-builder)/agents/[agentId]/page.tsx",
	"(agent-builder)/chat/page.tsx",
	"(agent-builder)/chat/[chatId]/page.tsx",
	"tai-lieu/[trang]/lich-su/page.tsx",
	"tai-lieu/[trang]/lich-su/[so]/page.tsx",
].map((t) => `${TIEN_SLUG}${t}`);

const DAU_TRANG_DU = `import { PageShell, PageShellDescription, PageShellHeader, PageShellHeading, PageShellTitle } from "@/components/page-shell";
export default function TrangMoi() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Tieu de</PageShellTitle>
					<PageShellDescription>Mo ta</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
		</PageShell>
	);
}
`;

const DAU_TRANG_TU_DUNG = `export default function TrangMoi() {
	return (
		<div>
			<h1>Tieu de</h1>
			<p>Mo ta</p>
		</div>
	);
}
`;

function docThay(
	goc: DocTep,
	tep: string,
	thay: (s: string) => string,
): DocTep {
	return (t) => {
		const nguon = goc(t);
		return t === tep && nguon !== null ? thay(nguon) : nguon;
	};
}

function docThem(goc: DocTep, them: Record<string, string>): DocTep {
	return (t) => them[t] ?? goc(t);
}

describe("tap-trang", () => {
	test("tap trang bang ls-files, moi trang dung mot nhom", () => {
		const { loi, nhom } = quetKhungTrang(DOC, TRANG, BANG);
		const daQuet = Object.values(nhom).flat();
		expect(soTapTrang(daQuet, TRANG)).toEqual([]);
		expect(new Set(daQuet).size).toBe(daQuet.length);
		expect(daQuet.length).toBe(TRANG.length);
		expect(loi).toEqual([]);
		process.stdout.write(
			`ktm: ${TRANG.length} trang · khung ${nhom.khung.length} · chuyen-huong ${nhom["chuyen-huong"].length} · ngoai-le ${nhom["ngoai-le"].length}\n`,
		);
	});

	test("chieu do: tep ls-files khong doc duoc, tap trang lech", () => {
		const ma = `${TIEN_SLUG}khong-co/page.tsx`;
		expect(quetKhungTrang(DOC, [...TRANG, ma], BANG).loi).toContain(
			"ktm: khong doc duoc khong-co/page.tsx",
		);
		expect(soTapTrang(TRANG.slice(1), TRANG)).toEqual([
			"ktm: tap trang lech ls-files",
		]);
	});
});

describe("trang-moi-ngoai-khung", () => {
	test("chieu do: trang moi dung div va h1 rieng", () => {
		const doc = docThem(DOC, { [TRANG_MOI]: DAU_TRANG_TU_DUNG });
		expect(quetKhungTrang(doc, [...TRANG, TRANG_MOI], BANG).loi).toEqual([
			"ktm: trang-moi/page.tsx dung dau trang ngoai PageShellHeader",
		]);
	});

	test("doi chung duong: trang moi dung khung chung", () => {
		const doc = docThem(DOC, { [TRANG_MOI]: DAU_TRANG_DU });
		const { loi, nhom } = quetKhungTrang(doc, [...TRANG, TRANG_MOI], BANG);
		expect(loi).toEqual([]);
		expect(nhom.khung).toContain(TRANG_MOI);
	});
});

describe("thieu-mot-khoi", () => {
	const quet = (thay: (s: string) => string) =>
		quetKhungTrang(docThay(DOC, TAI_LIEU, thay), TRANG, BANG).loi;

	test("ban goc khong loi", () => {
		expect(quet((s) => s)).toEqual([]);
	});

	test("chieu do: tieu de trong Suspense", () => {
		expect(
			quet((s) =>
				s
					.replace(
						/<PageShellTitle>/,
						"<Suspense fallback={null}><PageShellTitle>",
					)
					.replace(/<\/PageShellTitle>/, "</PageShellTitle></Suspense>"),
			),
		).toEqual(["ktm: tai-lieu/page.tsx thieu tieu de luc tai"]);
	});

	test("chieu do: mat mo ta", () => {
		expect(
			quet((s) =>
				s.replace(/<PageShellDescription[\s\S]*?<\/PageShellDescription>/, ""),
			),
		).toEqual(["ktm: tai-lieu/page.tsx thieu mo ta luc tai"]);
	});

	test("chieu do: h1 rieng canh dau trang", () => {
		expect(
			quet((s) =>
				s.replace("<PageShellHeader", "<h1>x</h1>\n<PageShellHeader"),
			),
		).toEqual(["ktm: tai-lieu/page.tsx dung <h1> rieng"]);
	});
});

describe("chuyen-huong", () => {
	test("trang khong JSX thuoc nhom chuyen-huong, khong co dong trong bang", () => {
		const { nhom } = quetKhungTrang(DOC, TRANG, BANG);
		expect(nhom["chuyen-huong"]).toContain(THOA_THUAN);
		expect(nhom["chuyen-huong"]).toContain(
			`${TIEN_SLUG}settings/notifications/page.tsx`,
		);
		const trongBang = new Set(BANG.map((d) => d.tep));
		expect(nhom["chuyen-huong"].filter((t) => trongBang.has(t))).toEqual([]);
	});

	test("chieu do: trang chuyen huong them JSX khong dau trang", () => {
		const doc = docThay(DOC, THOA_THUAN, (s) =>
			s.replace(/\tredirect\(/, "\treturn <div>x</div>;\n\tredirect("),
		);
		const { loi, nhom } = quetKhungTrang(doc, TRANG, BANG);
		expect(nhom["chuyen-huong"]).not.toContain(THOA_THUAN);
		expect(loi).toEqual([
			"ktm: deals/[dealId]/page.tsx dung dau trang ngoai PageShellHeader",
		]);
	});
});

describe("bang-ngoai-le", () => {
	const dau = BANG[0] as DongNgoaiLe;
	const quet = (bang: DongNgoaiLe[]) => quetKhungTrang(DOC, TRANG, bang).loi;
	const thay = (moi: Partial<DongNgoaiLe>) => [
		{ ...dau, ...moi },
		...BANG.slice(1),
	];

	test("chieu do: tep khong con", () => {
		expect(
			quet([
				...BANG,
				{ tep: `${TIEN_SLUG}khong-co/page.tsx`, loai: "no", ly_do: "x" },
			]),
		).toEqual(["ktm: ngoai le tro tep khong con khong-co/page.tsx"]);
	});

	test("chieu do: dong trung", () => {
		expect(quet([...BANG, dau])).toEqual([
			`ktm: ngoai le trung ${dau.tep.replace("apps/app/app/", "")}`,
		]);
	});

	test("chieu do: loai la", () => {
		expect(quet(thay({ loai: "khac" }))).toEqual([
			`ktm: ngoai le loai la khac o ${dau.tep.replace("apps/app/app/", "")}`,
		]);
	});

	test("chieu do: thieu ly do", () => {
		expect(quet(thay({ ly_do: " " }))).toEqual([
			`ktm: ngoai le thieu ly do o ${dau.tep.replace("apps/app/app/", "")}`,
		]);
	});
});

describe("ngoai-le-thua", () => {
	test("chieu do: dong cho trang da dung khung", () => {
		expect(
			quetKhungTrang(DOC, TRANG, [
				...BANG,
				{ tep: LIEN_HE, loai: "no", ly_do: "x" },
			]).loi,
		).toEqual(["ktm: ngoai le thua contacts/page.tsx"]);
	});

	test("chieu do: tieu-de-theo-du-lieu mat PageShellHeader luc tai", () => {
		const doc = docThay(DOC, CHIEN_DICH, (s) =>
			s
				.replace(/<PageShellHeader[^>]*>/, "<div>")
				.replace("</PageShellHeader>", "</div>"),
		);
		expect(quetKhungTrang(doc, TRANG, BANG).loi).toEqual([
			"ktm: campaigns/[campaignId]/page.tsx mang tieu-de-theo-du-lieu ma khong co PageShellHeader luc tai",
		]);
	});
});

describe("doi-chung-duong", () => {
	test("cay that xanh, bang 21 dong, nam dong no dung tap", () => {
		expect(quetKhungTrang(DOC, TRANG, BANG).loi).toEqual([]);
		expect(BANG.length).toBe(21);
		const no = BANG.filter((d) => d.loai === "no");
		expect(no.map((d) => d.tep).sort()).toEqual([...NO_DUNG].sort());
		expect(no.filter((d) => !d.ly_do.includes("đích:"))).toEqual([]);
	});
});

describe("chieu-im", () => {
	const NGOAI = [
		"docs/x/page.tsx",
		"_acceptance/x/page.tsx",
		"packages/ui/x/page.tsx",
	];

	test("duong ngoai apps/app/app khong vao tap trang", () => {
		const doc = docThem(
			DOC,
			Object.fromEntries(NGOAI.map((t) => [t, DAU_TRANG_TU_DUNG])),
		);
		const goc = quetKhungTrang(DOC, TRANG, BANG);
		const co = quetKhungTrang(doc, [...TRANG, ...NGOAI], BANG);
		expect(Object.values(co.nhom).flat().sort()).toEqual(
			Object.values(goc.nhom).flat().sort(),
		);
		expect(co.loi).toEqual([]);
	});

	test("doi chung: cung noi dung trong apps/app/app thi do", () => {
		const t = `${TIEN_SLUG}x/page.tsx`;
		const doc = docThem(DOC, { [t]: DAU_TRANG_TU_DUNG });
		expect(quetKhungTrang(doc, [...TRANG, t], BANG).loi).toEqual([
			"ktm: x/page.tsx dung dau trang ngoai PageShellHeader",
		]);
	});
});
