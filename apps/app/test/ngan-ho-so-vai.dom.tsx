import { afterAll, describe, expect, mock, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { type ComponentProps, isValidElement, type ReactNode } from "react";
import type { NoiDungLoTrinh as ThanhPhanKhach } from "@/components/lo-trinh/noi-dung";
import { hangThoCua, propsNoiDung } from "./lo-trinh-khoi-tho";

const HTML_X2 = readFileSync(
	path.join(import.meta.dir, "fixtures/lo-trinh/x2/LO-TRINH.html"),
	"utf8",
);

const CO_DAI = hangThoCua(HTML_X2).flatMap((h) =>
	h.tom_tat ? [{ khoa: h.khoa, tom_tat: h.tom_tat }] : [],
);
const MA = CO_DAI.map((h) => h.tom_tat.chu_kho.ma).filter(
	(x): x is string => x !== null,
);

let vaiHienTai: string | null = null;
type PropsKhach = ComponentProps<typeof ThanhPhanKhach>;
let props: PropsKhach[] = [];

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
	NoiDungLoTrinh: (p: PropsKhach) => {
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

async function giai(nut: ReactNode): Promise<void> {
	if (Array.isArray(nut)) {
		for (const x of nut) await giai(x);
		return;
	}
	if (!isValidElement<{ children?: ReactNode }>(nut)) return;
	const loai: unknown = nut.type;
	if (loai instanceof Function && loai.constructor.name === "AsyncFunction") {
		await giai(await loai(nut.props));
		return;
	}
	if (loai instanceof Function && loai.name === "NoiDungLoTrinh") {
		loai(nut.props);
		return;
	}
	await giai(nut.props.children);
}

async function propsCua(
	trang: () => Promise<ReactNode>,
	vai: string | null,
): Promise<PropsKhach> {
	vaiHienTai = vai;
	props = [];
	await giai(await trang());
	const p = props[0];
	if (props.length !== 1 || !p)
		throw new Error(`trang trao ${props.length} lan cho thanh phan khach`);
	return p;
}

function kiemProps(p: PropsKhach, vai: string | null): string[] {
	const loi: string[] = [];
	const kq = propsNoiDung.safeParse(p);
	if (!kq.success)
		return [
			`vai ${vai} props mang khoa la: ${khoaCua(p)}`,
			...(vai === "owner"
				? []
				: [`vai ${vai} lot chu_kho qua props ${CO_DAI[0]?.khoa}`]),
		];
	const dv = kq.data.dauVao;
	if (dv.kieu !== "co-du-lieu" || !dv.duLieu)
		return [`vai ${vai} khong co du lieu`];
	const theoKhoa = new Map(
		dv.duLieu.lo_trinh.flatMap((lo) =>
			lo.hang.map((h): [string, typeof h.tom_tat] => [
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

function khoaCua(p: PropsKhach): string {
	return Object.keys(p).sort().join();
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
		const goi = /docDauVaoChoVai\(\s*vai\s*,/;
		const khach = "<NoiDungLoTrinh dauVao={dauVao} />";
		if (!goi.test(goc) || !goc.includes(khach))
			throw new Error(
				"khong thay cho goi docDauVaoChoVai(vai, …) va <NoiDungLoTrinh dauVao={dauVao} /> trong page.tsx",
			);
		mkdirSync(BAN_SAO, { recursive: true });
		const boLoc = goc.replace(goi, 'docDauVaoChoVai("owner",');
		const ca = [
			{
				ten: "kem-vai",
				ma: boLoc.replace(
					khach,
					"<NoiDungLoTrinh dauVao={dauVao} vai={vai} />",
				),
			},
			{ ten: "bo-loc", ma: boLoc },
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
