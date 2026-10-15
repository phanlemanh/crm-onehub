import { describe, expect, test } from "bun:test";
import ts from "typescript";
import {
	type DocTep,
	docTuDia,
	GOC_KHO,
	giaTriChuoi,
	moiPhanTu,
	moiTepTsx,
	phanTich,
	TIEN_SLUG,
	tenThe,
	thuocTinh,
} from "./lib/quet-jsx";

const MIEN_TRU = "apps/app/components/lo-trinh/trang-lo-trinh.tsx";
const ONBOARDING = `${TIEN_SLUG}onboarding/danh-muc-cong-cu.tsx`;
const DICH = [
	ONBOARDING,
	`${TIEN_SLUG}tai-lieu/danh-sach-trang.tsx`,
	`${TIEN_SLUG}viec/viec-cua-toi.tsx`,
] as const;

type KetQuaQuet = {
	loi: string[];
	coItem: Set<string>;
	coCount: Set<string>;
	viPhamMienTru: number;
};

function tepQuet(): string[] {
	return moiTepTsx(GOC_KHO, "apps/app").filter(
		(t) =>
			!t.startsWith("apps/app/test/") &&
			!t.includes("/.next/") &&
			!t.includes("/node_modules/"),
	);
}

function laSoDem(node: ts.JsxElement | ts.JsxSelfClosingElement): boolean {
	const lop = giaTriChuoi(thuocTinh(node, "className"));
	return lop !== null && lop.split(/\s+/).includes("tabular-nums");
}

export function quetSoDem(doc: DocTep, tep: string[]): KetQuaQuet {
	const ra: KetQuaQuet = {
		loi: [],
		coItem: new Set(),
		coCount: new Set(),
		viPhamMienTru: 0,
	};
	for (const t of tep) {
		const nguon = doc(t);
		if (nguon === null || !nguon.includes("ToggleGroupItem")) continue;
		const sf = phanTich(t, nguon);
		for (const item of moiPhanTu(sf)) {
			if (tenThe(item) !== "ToggleGroupItem") continue;
			ra.coItem.add(t);
			if (thuocTinh(item, "count")) ra.coCount.add(t);
			if (!ts.isJsxElement(item)) continue;
			const tuDat = item.children.some((con) => moiPhanTu(con).some(laSoDem));
			if (!tuDat) continue;
			if (t === MIEN_TRU) ra.viPhamMienTru += 1;
			else ra.loi.push(`lkx-quet: ToggleGroupItem tu dat so dem o ${t}`);
		}
	}
	return ra;
}

export function kiemSoDem(kq: KetQuaQuet): string[] {
	const loi = [...kq.loi];
	if (kq.viPhamMienTru === 0) loi.push("lkx-quet: mien tru thua");
	for (const d of DICH) {
		if (!kq.coItem.has(d)) loi.push(`lkx-quet: khong quet thay ${d}`);
		else if (!kq.coCount.has(d)) loi.push(`lkx-quet: ${d} khong truyen count`);
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
const TEP = tepQuet();

describe("lkx-quet", () => {
	test("khong ToggleGroupItem nao tu dat so dem, ba man dich truyen count", () => {
		expect(TEP.length).toBeGreaterThan(0);
		expect(TEP).toContain(MIEN_TRU);
		for (const d of DICH) expect(TEP).toContain(d);
		expect(kiemSoDem(quetSoDem(DOC, TEP))).toEqual([]);
	});

	test("chieu do: onboarding tra lai span tabular-nums opacity-60 thi bai bat", () => {
		const hong = docThay(DOC, ONBOARDING, (s) =>
			s.replace(
				/(<ToggleGroupItem[^>]*key=\{tt\}[^>]*>)/,
				'$1<span className="tabular-nums opacity-60">0</span>',
			),
		);
		const loi = kiemSoDem(quetSoDem(hong, TEP));
		expect(loi).toContain(
			`lkx-quet: ToggleGroupItem tu dat so dem o ${ONBOARDING}`,
		);
	});

	test("chieu do: tep mien tru het vi pham thi bao mien tru thua", () => {
		const sach = docThay(DOC, MIEN_TRU, (s) =>
			s.replaceAll("tabular-nums", "tabular"),
		);
		expect(kiemSoDem(quetSoDem(sach, TEP))).toContain(
			"lkx-quet: mien tru thua",
		);
	});
});
