import { afterAll, describe, expect, mock, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ReactElement, ReactNode } from "react";

const HTML_X2 = readFileSync(
	path.join(import.meta.dir, "fixtures/lo-trinh/x2/LO-TRINH.html"),
	"utf8",
);
const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;

type ChuKho = Record<string, number | string | null>;
type TomTat = { moi_nguoi: Record<string, string | null>; chu_kho: ChuKho };
type Hang = { ma: string; tom_tat: TomTat | null };
type Khoi = { lo_trinh: { tep: string; hang: Hang[] }[] };

const THO: Khoi = JSON.parse(KHOI.exec(HTML_X2)?.[1] ?? "null");
const CO_DAI = THO.lo_trinh.flatMap((lo) =>
	lo.hang
		.filter((h) => h.tom_tat !== null)
		.map((h) => ({ khoa: `${lo.tep}#${h.ma}`, tom_tat: h.tom_tat as TomTat })),
);
const MA = CO_DAI.map((h) => h.tom_tat.chu_kho.ma).filter(
	(x): x is string => typeof x === "string",
);

let vaiHienTai: string | null = null;
let props: Record<string, unknown>[] = [];

mock.module("@/lib/session", () => ({
	requireSession: async () => ({ user: { id: "nguoi-do" } }),
}));
mock.module("@crm/auth", () => ({
	workspaceRoleOf: async () => vaiHienTai,
}));
mock.module("@/lib/lo-trinh/doc-tep", () => ({
	docTepLoTrinh: () => HTML_X2,
	duongTepLoTrinh: () => "LO-TRINH.html",
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/components/lo-trinh/noi-dung", () => ({
	NoiDungLoTrinh: (p: Record<string, unknown>) => {
		props.push(p);
		return null;
	},
}));

const { choVaiXem } = await import("@/lib/lo-trinh/cho-vai");
const { docTrangLoTrinh } = await import("@/lib/lo-trinh/doc-trang");

const APP = path.join(import.meta.dir, "..");
const TRANG = path.join(APP, "app/(app)/[slug]/lo-trinh/page.tsx");
const BAN_SAO = path.join(APP, ".next-phien-do-lhs-vai");

afterAll(() => rmSync(BAN_SAO, { recursive: true, force: true }));

type ThanhPhan = (p: Record<string, unknown>) => unknown;

async function giai(nut: ReactNode): Promise<void> {
	if (Array.isArray(nut)) {
		for (const x of nut) await giai(x);
		return;
	}
	if (!nut || typeof nut !== "object" || !("type" in nut)) return;
	const el = nut as ReactElement<Record<string, unknown>>;
	const loai = el.type as unknown;
	if (typeof loai === "function" && loai.constructor.name === "AsyncFunction") {
		await giai((await (loai as ThanhPhan)(el.props)) as ReactNode);
		return;
	}
	if (
		typeof loai === "function" &&
		(loai as { name?: string }).name === "NoiDungLoTrinh"
	) {
		(loai as ThanhPhan)(el.props);
		return;
	}
	await giai(el.props?.children as ReactNode);
}

async function propsCua(
	trang: () => Promise<ReactNode>,
	vai: string | null,
): Promise<Record<string, unknown>> {
	vaiHienTai = vai;
	props = [];
	await giai(await trang());
	const p = props[0];
	if (props.length !== 1 || !p)
		throw new Error(`trang trao ${props.length} lan cho thanh phan khach`);
	return p;
}

function kiemProps(p: Record<string, unknown>, vai: string | null): string[] {
	const loi: string[] = [];
	const khoa = Object.keys(p).sort();
	if (khoa.join() !== "dauVao")
		loi.push(`vai ${vai} props mang khoa la: ${khoa.join()}`);
	const dv = p.dauVao as {
		kieu: string;
		duLieu?: Khoi;
	};
	if (dv?.kieu !== "co-du-lieu" || !dv.duLieu)
		return [...loi, `vai ${vai} khong co du lieu`];
	const theoKhoa = new Map<string, TomTat | null>(
		dv.duLieu.lo_trinh.flatMap((lo) =>
			lo.hang.map((h): [string, TomTat | null] => [
				`${lo.tep}#${h.ma}`,
				h.tom_tat,
			]),
		),
	);
	for (const h of CO_DAI) {
		const tt = theoKhoa.get(h.khoa);
		if (!tt) {
			loi.push(`vai ${vai} mat dai ${h.khoa}`);
			continue;
		}
		if (JSON.stringify(tt.moi_nguoi) !== JSON.stringify(h.tom_tat.moi_nguoi))
			loi.push(`vai ${vai} lech tang moi nguoi ${h.khoa}`);
		if (vai === "owner") {
			if (JSON.stringify(tt.chu_kho) !== JSON.stringify(h.tom_tat.chu_kho))
				loi.push(`vai owner lech tang chu kho ${h.khoa}`);
		} else if (tt.chu_kho !== null)
			loi.push(`vai ${vai} lot chu_kho qua props ${h.khoa}`);
	}
	if (vai !== "owner") {
		const chuoi = JSON.stringify(p);
		const lot = MA.filter((ma) => chuoi.includes(ma));
		if (lot.length > 0) loi.push(`vai ${vai} lot ma chu kho ${lot[0]}`);
	}
	return loi;
}

const VAI = ["owner", "admin", "member", "okr", null] as const;

describe("vai", () => {
	test("so dem viet truoc: 81 viec co dai, 81 ma commit", () => {
		expect(CO_DAI.length).toBe(81);
		expect(MA.length).toBe(81);
	});

	test("trang may chu that: 5 vai x 81 viec, props chi mang dauVao", async () => {
		const { default: LoTrinhPage } = await import(
			"@/app/(app)/[slug]/lo-trinh/page"
		);
		let dem = 0;
		for (const vai of VAI) {
			const p = await propsCua(LoTrinhPage, vai);
			const loi = kiemProps(p, vai);
			expect(loi, loi[0]).toEqual([]);
			dem += CO_DAI.length;
		}
		expect(dem).toBe(5 * 81);
	});

	test("ham thuan choVaiXem cho cung ket qua o ca 5 vai", () => {
		const dv = docTrangLoTrinh(HTML_X2);
		for (const vai of VAI) {
			const loi = kiemProps({ dauVao: choVaiXem(dv, vai) }, vai);
			expect(loi, loi[0]).toEqual([]);
		}
	});

	test("chieu do: ban sao trang truyen khoi nguyen kem vai, ban sao bo buoc loc", async () => {
		const goc = readFileSync(TRANG, "utf8");
		const goi = /choVaiXem\(\s*(await docDauVao\(\))\s*,\s*vai\s*\)/;
		if (!goi.test(goc))
			throw new Error(
				"khong thay cho goi choVaiXem(await docDauVao(), vai) trong page.tsx",
			);
		mkdirSync(BAN_SAO, { recursive: true });
		const ca = [
			{ ten: "kem-vai", ma: goc.replace(goi, "$1} vai={vai") },
			{ ten: "bo-loc", ma: goc.replace(goi, "$1") },
		];
		for (const c of ca) {
			const tep = path.join(BAN_SAO, `${c.ten}.tsx`);
			writeFileSync(tep, c.ma);
			const { default: BanSao } = await import(tep);
			const loi = kiemProps(await propsCua(BanSao, "member"), "member");
			expect(
				loi.some((l) => l.startsWith("vai member lot chu_kho qua props ")),
				c.ten,
			).toBe(true);
		}
	});
});
