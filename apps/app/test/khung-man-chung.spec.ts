import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import {
	type CoTrongCay,
	coKhiTai,
	coNgoaiSuspense,
	type DocTep,
	type DuyetCay,
	docTuDia,
	dongCua,
	GOC_KHO,
	giaTriChuoi,
	hamMacDinh,
	hamTen,
	moiPhanTu,
	moiTepTsx,
	nhapCucBo,
	phanTich,
	TIEN_SLUG,
	tenThe,
	thuocTinh,
} from "./lib/quet-jsx";

const SHA_GOC = "3a2783409";
const TEP_KHUNG = [
	"apps/app/components/page-shell.tsx",
	"apps/app/components/page-shell-loading.tsx",
];
const BANG_HINH: { tep: string; hinh: string }[] = JSON.parse(
	readFileSync(
		join(GOC_KHO, "apps/app/test/fixtures/khung-man-chung-hinh.json"),
		"utf8",
	),
);
const TIEU_DE_THEO_DU_LIEU = [
	"campaigns/[campaignId]/page.tsx",
	"tai-lieu/[trang]/page.tsx",
	"tai-lieu/[trang]/sua/page.tsx",
	"tai-lieu/de-xuat/[id]/page.tsx",
].map((t) => `${TIEN_SLUG}${t}`);
const NUT_GIU_CHO = [
	"contacts/create-contact-sheet.tsx",
	"deals/create-deal-sheet.tsx",
	"companies/create-company-sheet.tsx",
	"campaigns/create-campaign-sheet.tsx",
	"settings/api-keys/create-api-key-sheet.tsx",
	"settings/sso/add-sso-provider-sheet.tsx",
].map((t) => `${TIEN_SLUG}${t}`);
const HAI_COT = [`${TIEN_SLUG}settings/onboarding/page.tsx`];
const TRANG_NHAC = `${TIEN_SLUG}reminders/page.tsx`;
const LAYOUT_OKR = `${TIEN_SLUG}okr/layout.tsx`;

function docBat(doc: DocTep, tep: string): string {
	const nguon = doc(tep);
	if (nguon === null) throw new Error(`kmc-quet: khong doc duoc ${tep}`);
	return nguon;
}

function tepAppTsx(): string[] {
	return [
		...moiTepTsx(GOC_KHO, "apps/app/app"),
		...moiTepTsx(GOC_KHO, "apps/app/components"),
	];
}

export function quetKhongVongQuay(doc: DocTep, tep: string[]): string[] {
	const loi: string[] = [];
	if (doc("apps/app/components/page-shell-loading.tsx") !== null) {
		loi.push("kmc-quet: con page-shell-loading.tsx");
	}
	for (const t of tep) {
		const nguon = doc(t);
		if (nguon === null) continue;
		const ngan = t.replace(TIEN_SLUG, "");
		if (nguon.includes("PageShellLoading")) {
			loi.push(`kmc-quet: con PageShellLoading o ${ngan}`);
		}
		if (!t.endsWith("page.tsx") || !t.startsWith("apps/app/app/")) continue;
		const sf = phanTich(t, nguon);
		for (const n of moiPhanTu(sf)) {
			if (tenThe(n) !== "Suspense") continue;
			const fb = thuocTinh(n, "fallback");
			if (fb && moiPhanTu(fb).some((x) => tenThe(x) === "Spinner")) {
				loi.push(`kmc-quet: fallback Spinner o ${ngan}`);
			}
		}
	}
	return loi;
}

type ChayGit = (thamSo: string[]) => string;

const chayGitThat: ChayGit = (thamSo) =>
	execFileSync("git", ["-C", GOC_KHO, ...thamSo], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});

const GHI_CHU_NONG = `kmc-quet: checkout nong — bo so voi git grep o ${SHA_GOC}`;

export function tepGocCoVongQuay(git: ChayGit = chayGitThat): string[] | null {
	try {
		git(["cat-file", "-e", `${SHA_GOC}^{commit}`]);
	} catch {
		return null;
	}
	const ra = git(["grep", "-l", "PageShellLoading", SHA_GOC, "--", "apps/app"]);
	return ra
		.split("\n")
		.filter(Boolean)
		.map((d) => d.slice(`${SHA_GOC}:`.length))
		.filter((t) => t.endsWith(".tsx") && !TEP_KHUNG.includes(t));
}

export function quetHinhTheoMan(
	doc: DocTep,
	bang: { tep: string; hinh: string }[],
	tepGoc: string[] | null,
	moiTep: string[],
): string[] {
	const loi: string[] = [];
	const trongBang = new Set(bang.map((d) => d.tep));
	if (tepGoc === null) {
		loi.push(GHI_CHU_NONG);
	} else {
		const canCo = [...tepGoc, `${TIEN_SLUG}tai-lieu/page.tsx`];
		for (const t of canCo) {
			if (!trongBang.has(t)) loi.push(`kmc-quet: bang hinh thieu ${t}`);
		}
		for (const t of trongBang) {
			if (!canCo.includes(t)) loi.push(`kmc-quet: bang hinh thua ${t}`);
		}
	}
	for (const { tep, hinh } of bang) {
		const nguon = doc(tep);
		const ngan = tep.replace(TIEN_SLUG, "");
		if (nguon === null) {
			loi.push(`kmc-quet: khong doc duoc ${ngan}`);
			continue;
		}
		const khung = moiPhanTu(phanTich(tep, nguon)).filter(
			(n) => tenThe(n) === "KhungXuong",
		);
		if (khung.length === 0) {
			loi.push(`kmc-quet: ${ngan} khong dung KhungXuong`);
			continue;
		}
		for (const k of khung) {
			const thuc = giaTriChuoi(thuocTinh(k, "hinh"));
			if (thuc !== hinh) {
				loi.push(`kmc-quet: ${ngan} dung hinh ${thuc}, bang ghi ${hinh}`);
			}
			const cot = thuocTinh(k, "cot")?.initializer?.getText() ?? null;
			if (HAI_COT.includes(tep) && cot !== "{2}") {
				loi.push(`kmc-quet: ${ngan} thieu cot={2}`);
			}
			if (!HAI_COT.includes(tep) && cot !== null) {
				loi.push(
					`kmc-quet: ${ngan} dung cot ma khong nam trong danh sach hai cot`,
				);
			}
		}
	}
	for (const t of moiTep) {
		if (trongBang.has(t)) continue;
		if (doc(t)?.includes("<KhungXuong")) {
			loi.push(`kmc-quet: KhungXuong ngoai bang o ${t}`);
		}
	}
	return loi;
}

const laTen =
	(dich: string): CoTrongCay =>
	(ten) =>
		ten === dich;

function laThanhPhan(
	doc: DocTep,
	tep: string,
	trung: CoTrongCay,
	sau: number,
	duyet: DuyetCay = coKhiTai,
): CoTrongCay {
	const nguon = doc(tep);
	if (nguon === null) return () => false;
	const sf = phanTich(tep, nguon);
	const nhap = nhapCucBo(sf, tep);
	return (ten, node) => {
		if (trung(ten, node)) return true;
		if (sau <= 0) return false;
		const tepCon = nhap.get(ten);
		if (!tepCon) {
			const hamCungTep = /^[A-Z]/.test(ten) ? hamTen(sf, ten) : null;
			return (
				hamCungTep !== null &&
				duyet(hamCungTep, laThanhPhan(doc, tep, trung, sau - 1, duyet))
			);
		}
		const nguonCon = doc(tepCon);
		if (nguonCon === null) return false;
		const ham = hamTen(phanTich(tepCon, nguonCon), ten);
		return (
			ham !== null &&
			duyet(ham, laThanhPhan(doc, tepCon, trung, sau - 1, duyet))
		);
	};
}

export function quetTieuDeKhiTai(doc: DocTep, trang: string[]): string[] {
	const loi: string[] = [];
	for (const t of trang) {
		const ngan = t.replace(TIEN_SLUG, "");
		const sf = phanTich(t, docBat(doc, t));
		const ham = hamMacDinh(sf);
		if (!ham) {
			loi.push(`kmc-quet: ${ngan} khong co ham mac dinh`);
			continue;
		}
		if (!coKhiTai(ham, laThanhPhan(doc, t, laTen("PageShellTitle"), 3))) {
			loi.push(`kmc-quet: ${ngan} khong dung tieu de luc tai`);
		}
		if (!coKhiTai(ham, laThanhPhan(doc, t, laTen("PageShellDescription"), 3))) {
			loi.push(`kmc-quet: ${ngan} khong dung mo ta luc tai`);
		}
	}
	const layout = phanTich(LAYOUT_OKR, docBat(doc, LAYOUT_OKR));
	const hamLayout = hamMacDinh(layout);
	if (
		hamLayout &&
		coKhiTai(
			hamLayout,
			laThanhPhan(doc, LAYOUT_OKR, laTen("PageShellTitle"), 3),
		)
	) {
		loi.push("kmc-quet: okr/layout.tsx van dung tieu de");
	}
	return loi;
}

const coBreadcrumb: CoTrongCay = (ten, node) =>
	ten === "PageShellHeader" && thuocTinh(node, "breadcrumb") !== null;
const laDauTrang: CoTrongCay = (ten) => ten === "PageShellHeader";

export function quetBreadcrumbChiTiet(doc: DocTep, trang: string[]): string[] {
	const loi: string[] = [];
	for (const t of trang) {
		const ngan = t.replace(TIEN_SLUG, "");
		const sf = phanTich(t, docBat(doc, t));
		const ham = hamMacDinh(sf);
		if (!ham || !coKhiTai(ham, laThanhPhan(doc, t, coBreadcrumb, 2))) {
			loi.push(`kmc-quet: breadcrumb ${ngan} trong Suspense hoac vang`);
		}
		const laChienDich = ngan.startsWith("campaigns/");
		const khung = moiPhanTu(sf).filter((n) => tenThe(n) === "KhungXuong");
		const dung = khung.some((k) => {
			const hinh = giaTriChuoi(thuocTinh(k, "hinh"));
			const coTieuDe = thuocTinh(k, "coTieuDe") !== null;
			return laChienDich
				? hinh === "tong-quan" && coTieuDe
				: hinh === "chi-tiet";
		});
		if (!dung) {
			loi.push(
				laChienDich
					? `kmc-quet: ${ngan} thieu coTieuDe`
					: `kmc-quet: ${ngan} khong dung hinh chi-tiet`,
			);
		}
	}
	return loi;
}

export function quetMotDauTrang(doc: DocTep, trang: string[]): string[] {
	const loi: string[] = [];
	for (const t of trang) {
		const ngan = t.replace(TIEN_SLUG, "");
		const sf = phanTich(t, docBat(doc, t));
		const ham = hamMacDinh(sf);
		if (!ham) {
			loi.push(`kmc-quet: ${ngan} khong co ham mac dinh`);
			continue;
		}
		if (
			coNgoaiSuspense(ham, laThanhPhan(doc, t, laDauTrang, 2, coNgoaiSuspense))
		) {
			loi.push(`kmc-quet: ${ngan} co dau trang ngoai fallback`);
		}
		const suspense = moiPhanTu(ham).filter((n) => tenThe(n) === "Suspense");
		const dauTrangFallback = suspense.filter((n) => {
			const fb = thuocTinh(n, "fallback");
			return fb !== null && coKhiTai(fb, laThanhPhan(doc, t, laDauTrang, 2));
		});
		if (dauTrangFallback.length !== 1) {
			loi.push(
				`kmc-quet: ${ngan} co ${dauTrangFallback.length} fallback mang dau trang`,
			);
		}
	}
	return loi;
}

export function quetNutGiuCho(doc: DocTep, moiTep: string[]): string[] {
	const loi: string[] = [];
	for (const t of moiTep) {
		const nguon = doc(t);
		if (nguon === null || !nguon.includes("Suspense")) continue;
		const sf = phanTich(t, nguon);
		for (const n of moiPhanTu(sf)) {
			if (tenThe(n) !== "Suspense") continue;
			const fb = thuocTinh(n, "fallback");
			if (!fb) continue;
			if (moiPhanTu(fb).some((x) => thuocTinh(x, "disabled") !== null)) {
				loi.push(
					`kmc-quet: nut giu cho tat o ${t.replace(TIEN_SLUG, "")}:${dongCua(sf, n)}`,
				);
			}
		}
	}
	for (const t of NUT_GIU_CHO) {
		const sf = phanTich(t, docBat(doc, t));
		const coVach = moiPhanTu(sf).some(
			(n) =>
				tenThe(n) === "Suspense" &&
				moiPhanTu(thuocTinh(n, "fallback") ?? sf).some(
					(x) => tenThe(x) === "Skeleton",
				),
		);
		if (!coVach) {
			loi.push(`kmc-quet: ${t.replace(TIEN_SLUG, "")} khong co vach giu cho`);
		}
	}
	return loi;
}

export function quetMucNhac(doc: DocTep): string[] {
	const loi: string[] = [];
	const nguon = docBat(doc, TRANG_NHAC);
	if (nguon.includes("<h2")) loi.push("kmc-muc: reminders con <h2 tho");
	const sf = phanTich(TRANG_NHAC, nguon);
	const tieuDe = moiPhanTu(sf).filter(
		(n) =>
			tenThe(n) === "SectionHeading" &&
			thuocTinh(n, "level")?.initializer?.getText() === "{2}",
	);
	if (tieuDe.length !== 2) {
		loi.push(`kmc-muc: reminders co ${tieuDe.length} SectionHeading level 2`);
	}
	const ids = new Set(tieuDe.map((n) => giaTriChuoi(thuocTinh(n, "id"))));
	for (const n of moiPhanTu(sf)) {
		if (tenThe(n) !== "section") continue;
		const nhan = giaTriChuoi(thuocTinh(n, "aria-labelledby"));
		if (!nhan || !ids.has(nhan)) {
			loi.push(
				`kmc-muc: section aria-labelledby=${nhan} khong tro SectionHeading`,
			);
		}
	}
	return loi;
}

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

const DOC = docTuDia();
const TEP = tepAppTsx();
const TEP_TIEU_DE = BANG_HINH.map((d) => d.tep).filter(
	(t) => t.endsWith("/page.tsx") && !TIEU_DE_THEO_DU_LIEU.includes(t),
);
const LIEN_HE = `${TIEN_SLUG}contacts/page.tsx`;

describe("khong-vong-quay", () => {
	test("khong con PageShellLoading, khong fallback Spinner", () => {
		const trangDaQuet = new Set(
			TEP.filter(
				(t) => t.startsWith("apps/app/app/") && t.endsWith("page.tsx"),
			),
		);
		const trangBang = BANG_HINH.map((d) => d.tep).filter((t) =>
			t.endsWith("/page.tsx"),
		);
		expect(trangBang.filter((t) => !trangDaQuet.has(t))).toEqual([]);
		expect(trangDaQuet.size).toBeGreaterThanOrEqual(trangBang.length);
		process.stdout.write(`kmc-quet: da quet ${trangDaQuet.size} trang\n`);
		expect(
			quetKhongVongQuay(DOC, [
				...TEP,
				...moiTepTsx(GOC_KHO, "packages/ui/src"),
			]),
		).toEqual([]);
	});

	test("chieu do: chen lai PageShellLoading va fallback Spinner", () => {
		const nhac = `${TIEN_SLUG}reminders/page.tsx`;
		const doc = docThay(
			docThay(
				DOC,
				LIEN_HE,
				(s) => `import { PageShellLoading } from "x";\n${s}`,
			),
			nhac,
			(s) =>
				s.replace(/fallback=\{<KhungXuong[^}]*\}/, "fallback={<Spinner />}"),
		);
		const loi = quetKhongVongQuay(doc, [LIEN_HE, nhac]);
		expect(loi).toContain("kmc-quet: con PageShellLoading o contacts/page.tsx");
		expect(loi).toContain("kmc-quet: fallback Spinner o reminders/page.tsx");
	});
});

describe("hinh-theo-man", () => {
	test("bang hinh bang dung tap tep goc va moi tep dung hinh", () => {
		const goc = tepGocCoVongQuay();
		expect(BANG_HINH.length).toBe(38);
		if (goc === null) {
			expect(quetHinhTheoMan(DOC, BANG_HINH, goc, TEP)).toEqual([GHI_CHU_NONG]);
			return;
		}
		expect(goc.length).toBe(37);
		expect(quetHinhTheoMan(DOC, BANG_HINH, goc, TEP)).toEqual([]);
	});

	test("chieu do: thieu dong, sai hinh, KhungXuong ngoai bang", () => {
		const goc = tepGocCoVongQuay() ?? BANG_HINH.map((d) => d.tep);
		const thieu = BANG_HINH.filter((d) => d.tep !== LIEN_HE);
		expect(quetHinhTheoMan(DOC, thieu, goc, [])).toContain(
			`kmc-quet: bang hinh thieu ${LIEN_HE}`,
		);
		const saiHinh = docThay(DOC, LIEN_HE, (s) =>
			s.replace('hinh="bang"', 'hinh="the"'),
		);
		expect(quetHinhTheoMan(saiHinh, BANG_HINH, goc, [])).toContain(
			"kmc-quet: contacts/page.tsx dung hinh the, bang ghi bang",
		);
		const motCot = docThay(DOC, HAI_COT[0] ?? "", (s) =>
			s.replace(" cot={2}", ""),
		);
		expect(quetHinhTheoMan(motCot, BANG_HINH, goc, [])).toContain(
			"kmc-quet: settings/onboarding/page.tsx thieu cot={2}",
		);
		const ngoai = `${TIEN_SLUG}okr/soan/khung-trang-okr.tsx`;
		const lac = docThay(
			DOC,
			ngoai,
			(s) => `${s}\nconst x = <KhungXuong hinh="the" />;\n`,
		);
		expect(quetHinhTheoMan(lac, BANG_HINH, goc, [ngoai])).toContain(
			`kmc-quet: KhungXuong ngoai bang o ${ngoai}`,
		);
	});
});

describe("checkout-nong", () => {
	const gitNong: ChayGit = (thamSo) => {
		if (thamSo[0] === "cat-file") throw new Error("fatal: Not a valid object");
		throw new Error(`kmc-quet: git nong khong duoc goi ${thamSo[0]}`);
	};

	test("thieu commit goc: bo phep so, chi mot dong ghi chu", () => {
		const goc = tepGocCoVongQuay(gitNong);
		expect(goc).toBeNull();
		expect(quetHinhTheoMan(DOC, BANG_HINH, goc, TEP)).toEqual([GHI_CHU_NONG]);
	});

	test("doi chung: van bat sai hinh khi checkout nong", () => {
		const saiHinh = docThay(DOC, LIEN_HE, (s) =>
			s.replace('hinh="bang"', 'hinh="the"'),
		);
		const loi = quetHinhTheoMan(
			saiHinh,
			BANG_HINH,
			tepGocCoVongQuay(gitNong),
			[],
		);
		expect(loi).toContain(GHI_CHU_NONG);
		expect(loi).toContain(
			"kmc-quet: contacts/page.tsx dung hinh the, bang ghi bang",
		);
	});

	test("commit co mat: phep so chay va bat bang thieu tep", () => {
		const goc = tepGocCoVongQuay();
		if (goc === null) return;
		const thieu = BANG_HINH.filter((d) => d.tep !== LIEN_HE);
		expect(quetHinhTheoMan(DOC, thieu, goc, [])).toContain(
			`kmc-quet: bang hinh thieu ${LIEN_HE}`,
		);
	});
});

describe("tieu-de-ngoai-suspense", () => {
	test("man tieu de tinh dung tieu de va mo ta luc tai", () => {
		expect(TEP_TIEU_DE.length).toBe(31);
		expect(quetTieuDeKhiTai(DOC, TEP_TIEU_DE)).toEqual([]);
	});

	test("chieu do: tieu de vao Suspense, mat tieu de", () => {
		const tl = `${TIEN_SLUG}tai-lieu/page.tsx`;
		const gd = `${TIEN_SLUG}settings/giai-doan/page.tsx`;
		const boc = docThay(DOC, tl, (s) =>
			s
				.replace(
					"<PageShellHeader>",
					"<Suspense fallback={null}><PageShellHeader>",
				)
				.replace("</PageShellHeader>", "</PageShellHeader></Suspense>"),
		);
		expect(quetTieuDeKhiTai(boc, [tl])).toContain(
			"kmc-quet: tai-lieu/page.tsx khong dung tieu de luc tai",
		);
		const bo = docThay(DOC, gd, (s) =>
			s.replace(/<PageShellTitle>[\s\S]*?<\/PageShellTitle>/, ""),
		);
		expect(quetTieuDeKhiTai(bo, [gd])).toContain(
			"kmc-quet: settings/giai-doan/page.tsx khong dung tieu de luc tai",
		);
	});
});

describe("breadcrumb-chi-tiet", () => {
	test("bon man ban ghi dung breadcrumb luc tai va dung hinh", () => {
		expect(quetBreadcrumbChiTiet(DOC, TIEU_DE_THEO_DU_LIEU)).toEqual([]);
	});

	test("chieu do: breadcrumb mat luc tai, chien dich thieu coTieuDe", () => {
		const cd = TIEU_DE_THEO_DU_LIEU[0] ?? "";
		const mat = docThay(DOC, cd, (s) =>
			s.replace("<PageShellHeader breadcrumb={duongDan}>", "<PageShellHeader>"),
		);
		expect(quetBreadcrumbChiTiet(mat, [cd])).toContain(
			"kmc-quet: breadcrumb campaigns/[campaignId]/page.tsx trong Suspense hoac vang",
		);
		const khongTieuDe = docThay(DOC, cd, (s) => s.replaceAll(" coTieuDe", ""));
		expect(quetBreadcrumbChiTiet(khongTieuDe, [cd])).toContain(
			"kmc-quet: campaigns/[campaignId]/page.tsx thieu coTieuDe",
		);
	});
});

describe("mot-dau-trang", () => {
	test("bon man ban ghi chi dung dau trang trong fallback", () => {
		expect(TIEU_DE_THEO_DU_LIEU.length).toBe(4);
		expect(quetMotDauTrang(DOC, TIEU_DE_THEO_DU_LIEU)).toEqual([]);
	});

	test("chieu do: dau trang ngoai Suspense quay lai", () => {
		const doc = `${TIEN_SLUG}tai-lieu/[trang]/page.tsx`;
		const thua = docThay(DOC, doc, (s) =>
			s.replace(
				"<Suspense",
				"<PageShellHeader breadcrumb={null} />\n\t\t\t<Suspense",
			),
		);
		expect(quetMotDauTrang(thua, [doc])).toContain(
			"kmc-quet: tai-lieu/[trang]/page.tsx co dau trang ngoai fallback",
		);
	});
});

describe("nut-giu-cho", () => {
	test("khong fallback nao co nut tat, sau tep dung vach", () => {
		expect(quetNutGiuCho(DOC, TEP)).toEqual([]);
	});

	test("chieu do: nut giu cho tat quay lai", () => {
		const t = NUT_GIU_CHO[0] ?? "";
		const doc = docThay(DOC, t, (s) =>
			s.replace(
				/fallback=\{<Skeleton[^}]*\}/,
				"fallback={<AddButton disabled />}",
			),
		);
		expect(
			quetNutGiuCho(doc, [t]).some((l) =>
				l.startsWith(
					"kmc-quet: nut giu cho tat o contacts/create-contact-sheet.tsx",
				),
			),
		).toBe(true);
	});
});

describe("muc-nhac", () => {
	test("Nhac buoi sang dung SectionHeading level 2", () => {
		expect(quetMucNhac(DOC)).toEqual([]);
	});

	test("chieu do: h2 tho quay lai", () => {
		const doc = docThay(
			DOC,
			TRANG_NHAC,
			(s) => `${s}\nconst x = <h2>x</h2>;\n`,
		);
		expect(quetMucNhac(doc)).toContain("kmc-muc: reminders con <h2 tho");
	});
});

test("tep bang hinh ton tai tren dia", () => {
	for (const { tep } of BANG_HINH) {
		expect(existsSync(join(GOC_KHO, tep))).toBe(true);
	}
	expect(ts.version.length).toBeGreaterThan(0);
});
