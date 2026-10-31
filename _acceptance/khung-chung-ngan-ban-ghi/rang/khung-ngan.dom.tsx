import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { TooltipProvider } from "@crm/ui/components/tooltip";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactElement, ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

const { DetailSheet } = await import("@/components/detail-sheet");
const { KhungNgan, KhungTaiLoi } = await import(
	"@/components/crm/record-sheet/record-parts"
);
const { KhungChungNganBanGhiMau } = await import(
	"@/app/proto/_modules/khung-chung-ngan-ban-ghi"
);
const { PROTO_CATALOG } = await import("@/app/proto/catalog");

const dangMo: Root[] = [];
afterEach(() => {
	for (const r of dangMo.splice(0)) act(() => r.unmount());
	document.body.innerHTML = "";
});

async function dung(man: ReactElement, trongNgan = true): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter>
				<LocaleProvider locale="vi">
					<TooltipProvider>
						{trongNgan ? (
							<DetailSheet open onOpenChange={() => {}}>
								{man}
							</DetailSheet>
						) : (
							man
						)}
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
	});
	return document.body;
}

const qs = (s: string) => document.body.querySelector<HTMLElement>(s);

describe("bk1-khung", () => {
	test("bk1-cho-tai: khung xuong hinh ngan, dau ngan giu tieu de, khong vong quay", async () => {
		await dung(<KhungNgan loading error={null} title="Tieu de tam" />);
		expect(
			qs('[data-khung-xuong="ngan"][aria-busy="true"]'),
			"thieu khung xuong hinh ngan",
		).not.toBeNull();
		expect(
			qs("[data-khung-xuong-ngan]"),
			"thieu vo khung xuong ngan",
		).not.toBeNull();
		expect(document.body.textContent).toContain("Tieu de tam");
		expect(
			document.body.querySelector(".animate-spin"),
			"con vong quay",
		).toBeNull();
	});

	test("bk1-loi-mat-ket-noi: KhungTaiLoi boc VungTaiLoi, thu lai goi dung mot lan", async () => {
		let goi = 0;
		await dung(
			<KhungNgan loading={false} error="x" onRetry={() => goi++} title="T" />,
		);
		const vo = qs('[data-khung-tai-loi][data-ly-do="mat-ket-noi"]');
		expect(vo, "thieu vo KhungTaiLoi mat-ket-noi").not.toBeNull();
		expect(
			vo?.querySelector("[data-vung-tai-loi]"),
			"mat thu lai khong phai VungTaiLoi",
		).not.toBeNull();
		const nut = vo?.querySelector<HTMLElement>('[data-slot="kara-retry"]');
		await act(async () => nut?.click());
		expect(goi).toBe(1);
	});

	test("bk1-loi-ly-do: khong-con co nut Dong, khong-quyen co nut Dong, khong nut thu lai", async () => {
		for (const lyDo of ["khong-con", "khong-quyen"] as const) {
			await dung(<KhungTaiLoi lyDo={lyDo} onRetry={() => {}} />);
			const vo = qs(`[data-khung-tai-loi][data-ly-do="${lyDo}"]`);
			expect(vo, `thieu ${lyDo}`).not.toBeNull();
			expect(
				vo?.querySelector('[data-slot="kara-retry"]'),
				`${lyDo} khong duoc co thu lai`,
			).toBeNull();
			expect(
				vo?.querySelectorAll("button").length,
				`${lyDo} phai co mot nut`,
			).toBe(1);
			for (const r of dangMo.splice(0)) act(() => r.unmount());
			document.body.innerHTML = "";
		}
	});

	test("bk1-hanh-dong: khe hanhDong thay nut mac dinh, giu data-nut", async () => {
		let bam = 0;
		await dung(
			<KhungTaiLoi
				lyDo="khong-con"
				tieuDe="Khong thay KR"
				moTa="KR da bi go"
				hanhDong={{
					nhan: "Ve muc tieu",
					onClick: () => bam++,
					"data-nut": "ve-muc-tieu",
				}}
			/>,
		);
		const nut = qs('[data-khung-tai-loi] [data-nut="ve-muc-tieu"]');
		expect(nut?.textContent).toBe("Ve muc tieu");
		expect(document.body.textContent).toContain("Khong thay KR");
		await act(async () => nut?.click());
		expect(bam).toBe(1);
	});

	test("bk1-than: the con nam giua than, vo va vung than mang dau du lieu", async () => {
		await dung(
			<KhungNgan
				loading={false}
				error={null}
				title="T"
				vo={{ "data-vo-thu": "a" }}
				vungThan={{ "data-than-thu": "b" }}
				tabs={[
					{ value: "v", label: "Viec", content: <p data-noi-dung-the="" /> },
				]}
				tab="v"
				onTabChange={() => {}}
				than={(theCon) => (
					<div>
						<p data-truoc-the="" />
						{theCon}
						<p data-sau-the="" />
					</div>
				)}
			/>,
		);
		expect(qs('[data-vo-thu="a"]'), "vo khong mang dau").not.toBeNull();
		const vung = qs('[data-than-thu="b"]');
		expect(vung, "vung than khong mang dau").not.toBeNull();
		const thu = [
			...(vung?.querySelectorAll(
				"[data-truoc-the],[role=tablist],[data-sau-the]",
			) ?? []),
		].map((e) =>
			e.hasAttribute("data-truoc-the")
				? "truoc"
				: e.hasAttribute("data-sau-the")
					? "sau"
					: "the",
		);
		expect(thu).toEqual(["truoc", "the", "sau"]);
	});

	test("bk1-doi-chung-am: ngan KR tu dung cu khong co khung xuong ngan, ngan trong khung thi co", async () => {
		await dung(
			<KhungChungNganBanGhiMau state="ST-kr-cu-moi-dang-tai" />,
			false,
		);
		const cu = qs("[data-ngan-cu]");
		const moi = qs('[data-ngan-mau="kr"]');
		expect(cu, "thieu ngan cu").not.toBeNull();
		expect(
			cu?.querySelector('[data-khung-xuong="ngan"]'),
			"ngan cu lai co khung xuong ngan",
		).toBeNull();
		expect(
			moi?.querySelector('[data-khung-xuong="ngan"]'),
			"ngan moi thieu khung xuong ngan",
		).not.toBeNull();
	});

	const muc = PROTO_CATALOG.find((m) => m.slug === "khung-chung-ngan-ban-ghi");
	const DOI_TUONG = ["deal", "lien-he", "cong-ty", "ke-hoach", "muc-tieu", "kr", "so-kr"];
	const TRANG = ["dang-tai", "loi", "du"];
	const MA_TRAN_ST = [
		...DOI_TUONG.flatMap((d) => TRANG.map((t) => `ST-${d}-${t}`)),
		"ST-kr-cu-moi-dang-tai",
		"ST-kr-cu-moi-loi",
	];
	test("bk1-proto: so khai dung ma tran viet truoc 7 doi tuong x 3 trang thai va 2 canh truoc sau", () => {
		expect(MA_TRAN_ST.length).toBe(23);
		expect([...(muc?.states ?? [])].map((s) => s.id).sort()).toEqual([...MA_TRAN_ST].sort());
	});
	for (const s of muc?.states ?? []) {
		test(`bk1-proto ${s.id}: dung khung dung trang thai`, async () => {
			await dung(<KhungChungNganBanGhiMau state={s.id} />, false);
			const tt = /-(dang-tai|loi|du)$/.exec(s.id)?.[1];
			expect(tt, "state khong co duoi trang thai").toBeDefined();
			const ngan = [...document.body.querySelectorAll("[data-ngan-mau]")];
			expect(ngan.length, "moi trang co ngan trong khung").toBeGreaterThan(0);
			for (const n of ngan) {
				expect(
					n.querySelector(
						'[data-slot="sheet-header"], [data-slot="drawer-header"]',
					),
					"thieu dau ngan",
				).not.toBeNull();
				if (tt === "dang-tai")
					expect(
						n.querySelector('[data-khung-xuong="ngan"]'),
						"thieu khung xuong",
					).not.toBeNull();
				if (tt === "loi")
					expect(
						n.querySelector("[data-khung-tai-loi]"),
						"thieu KhungTaiLoi",
					).not.toBeNull();
				if (tt === "du")
					expect(
						n.querySelector("[data-khung-tai-loi],[data-khung-xuong]"),
						"trang du con trang thai khac",
					).toBeNull();
			}
		});
	}
});
