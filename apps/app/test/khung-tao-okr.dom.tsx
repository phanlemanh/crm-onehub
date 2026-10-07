import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, type ReactElement } from "react";
import { z } from "zod";
import type { DongHien } from "../../api/src/okr/okr.contracts";
import {
	bam,
	cho,
	dat,
	datMacDinh,
	dongHet,
	go,
	HAI,
	hopKr,
	hopMucTieu,
	KR_1,
	KR_2,
	MT,
	mo,
	nhip,
	nut,
	phim,
} from "./khung-gop-y";
import {
	bonPayload,
	bonPayloadSchema,
	THU_TUC_GUI,
} from "./khung-tao-okr-payload";

const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
const { HopThoaiKr } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
const { CreateDealSheet } = await import(
	"@/app/(app)/[slug]/deals/create-deal-sheet"
);
const { okrMessages } = await import("@/lib/messages/okr");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const h = okrMessages("vi").hopThoai;
const tenDong = uiMessages("vi").dialog.close;

afterEach(dongHet);

async function choUrl(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 40; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 25));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

const ngan = (o: HTMLElement | null): HTMLElement | null =>
	o?.closest<HTMLElement>('[data-slot="sheet-content"]') ?? null;

async function dataSizeNganDeal(): Promise<string> {
	datMacDinh([]);
	dat("giaiDoan.list", () => ({ stages: [] }));
	dat("currency.settings", () => ({ reportingCurrency: "VND" }));
	await mo(<CreateDealSheet />, { searchParams: "new=true" });
	await cho(
		() => document.querySelector('[data-slot="sheet-content"]') !== null,
		"ngan tao deal mo",
	);
	const gia = document
		.querySelector('[data-slot="sheet-content"]')
		?.getAttribute("data-size");
	await dongHet();
	if (!gia) throw new Error("ngan deal thieu data-size");
	return gia;
}

type Ngan = {
	ten: "tao-muc-tieu" | "sua-muc-tieu" | "them-kr" | "sua-kr";
	dung: (dong: () => void) => ReactElement;
	hop: () => HTMLElement | null;
};

const BON_NGAN: readonly [Ngan, Ngan, Ngan, Ngan] = [
	{
		ten: "tao-muc-tieu",
		dung: (dong) => (
			<HopThoaiMucTieu
				yeuCau={{
					loai: "tao",
					cycleId: MT.cycleId,
					don: { loai: "goc" },
					tenDon: "OneHub",
				}}
				dong={dong}
			/>
		),
		hop: hopMucTieu,
	},
	{
		ten: "sua-muc-tieu",
		dung: (dong) => (
			<HopThoaiMucTieu yeuCau={{ loai: "sua", mucTieu: MT }} dong={dong} />
		),
		hop: hopMucTieu,
	},
	{
		ten: "them-kr",
		dung: (dong) => (
			<HopThoaiKr
				objectiveId={MT.id}
				mucTieu={MT}
				kr={null}
				chuMacDinh={HAI.id}
				suaDuocCot
				dong={dong}
			/>
		),
		hop: hopKr,
	},
	{
		ten: "sua-kr",
		dung: (dong) => (
			<HopThoaiKr
				objectiveId={MT.id}
				mucTieu={MT}
				kr={KR_1}
				chuMacDinh={HAI.id}
				suaDuocCot
				dong={dong}
			/>
		),
		hop: hopKr,
	},
];

async function moNgan(
	n: Ngan,
	dong: readonly DongHien[] = [],
): Promise<{ lan: () => number }> {
	datMacDinh([...dong]);
	let lan = 0;
	await mo(
		n.dung(() => {
			lan += 1;
		}),
	);
	await cho(() => n.hop() !== null, `ngan ${n.ten} mo`);
	return { lan: () => lan };
}

const oTen = (hop: HTMLElement | null) =>
	hop?.querySelector<HTMLInputElement>('input[id$="-ten"]') ?? null;

async function bamLopPhu(): Promise<void> {
	const lop = [...document.querySelectorAll('[data-slot="sheet-overlay"]')].at(
		-1,
	);
	if (!lop) throw new Error("khong thay lop phu ngan");
	await act(async () => {
		lop.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		(lop as HTMLElement).click();
	});
	await nhip(5);
}

function nutX(hop: HTMLElement): HTMLButtonElement {
	const x = [
		...(ngan(hop)?.querySelectorAll<HTMLButtonElement>("button") ?? []),
	].find((b) => b.textContent?.trim() === tenDong);
	if (!x) throw new Error("khong thay dau X");
	return x;
}

const DUONG_DONG = ["esc", "lop-phu", "huy", "x"] as const;

async function dongBang(
	duong: (typeof DUONG_DONG)[number],
	hop: HTMLElement,
): Promise<void> {
	if (duong === "esc") await phim(hop, "Escape");
	if (duong === "lop-phu") await bamLopPhu();
	if (duong === "huy") await bam(nut(h.huy, ngan(hop) ?? document.body));
	if (duong === "x") await bam(nutX(hop));
}

describe("khung-tao-okr — giữ chữ đang sửa", () => {
	test("giu: bốn ngăn × bốn đường đóng × có hay không có sửa", async () => {
		let soKhang = 0;
		for (const n of BON_NGAN) {
			for (const duong of DUONG_DONG) {
				for (const coSua of [true, false]) {
					const ngn = await moNgan(n);
					const hop = n.hop();
					if (!hop) throw new Error(`khong mo ${n.ten}`);
					if (coSua) await go(oTen(hop), "Một cái tên khác hẳn");
					await dongBang(duong, hop);
					if (coSua) {
						const hoi = document.querySelector('[role="alertdialog"]');
						const canHoi = duong !== "lop-phu";
						if (n.hop() === null || ngn.lan() !== 0)
							throw new Error(
								`dong mat thay doi: ${n.ten.endsWith("kr") ? "kr" : "muc tieu"} (${n.ten}/${duong})`,
							);
						if (canHoi !== (hoi !== null))
							throw new Error(
								`hoi lai sai: ${n.ten}/${duong} (${hoi ? "co" : "khong"} hop hoi)`,
							);
					} else if (ngn.lan() !== 1) {
						throw new Error(
							`khong dong khi khong sua: ${n.ten}/${duong} (${ngn.lan()})`,
						);
					}
					soKhang += 1;
					await dongHet();
				}
			}
		}
		console.log(`so khang dinh: ${soKhang}`);
		expect(soKhang).toBe(32);
	}, 300_000);
});

describe("khung-tao-okr — gửi đúng dữ liệu", () => {
	test("gui-dung: bốn thao tác qua ngăn gửi đúng dữ liệu hộp thoại cũ đã gửi", async () => {
		const chuan = z
			.object({ nguon: z.string().min(7), payload: bonPayloadSchema })
			.parse(
				JSON.parse(
					readFileSync(
						join(
							import.meta.dir,
							"../../../_acceptance/khung-tao-okr-nhu-deal/rang/payload-cu.json",
						),
						"utf8",
					),
				),
			);
		const moi = await bonPayload({ HopThoaiMucTieu, HopThoaiKr });
		for (const thuTuc of THU_TUC_GUI) {
			const a = JSON.stringify(moi[thuTuc]);
			const b = JSON.stringify(chuan.payload[thuTuc]);
			if (a !== b)
				throw new Error(
					`payload lech: ${thuTuc.split(".")[1]} moi ${a} cu ${b}`,
				);
			console.log(`${thuTuc} khop hop cu ${chuan.nguon.slice(0, 8)}: ${a}`);
		}
	}, 120_000);
});

const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { useRecordStack } = await import(
	"@/components/crm/record-sheet/record-stack"
);
const { NganTaoMucTieu, NutThemMucTieu } = await import(
	"@/app/(app)/[slug]/okr/ngan-okr-url"
);
const { default: userEvent } = await import("@testing-library/user-event");

type NhatKy = { lan: URLSearchParams[]; cuoi: () => URLSearchParams };

function nhatKyUrl(): NhatKy & {
	ghi: (e: { searchParams: URLSearchParams }) => void;
} {
	const lan: URLSearchParams[] = [];
	return {
		lan,
		ghi: (e) => {
			lan.push(new URLSearchParams(e.searchParams));
		},
		cuoi: () => lan.at(-1) ?? new URLSearchParams(),
	};
}

function datKhung(chon: { suaDuoc?: boolean; cho?: number } = {}): void {
	const sua = chon.suaDuoc ?? true;
	const chiTiet = {
		...MT,
		canEdit: sua,
		keyResults: MT.keyResults.map((k) => ({
			...k,
			soViec: { xong: 0, tong: 0 },
			soSangKien: 0,
			coBangChung: false,
		})),
		cycleName: "Quý 4/2026",
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: sua ? [KR_1.id, KR_2.id] : [],
		hienThi: "cong-khai",
		nguoiXem: [],
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: sua,
			congBo: sua,
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
		},
	};
	dat("okr.objective", () =>
		chon.cho
			? new Promise((r) => setTimeout(() => r(chiTiet), chon.cho))
			: chiTiet,
	);
	dat("okr.comments", () => ({ comments: [], dong: [] }));
	dat("okr.alignmentTargets", () => ({ targets: [] }));
	dat("okr.thanhVien", () => [HAI]);
	dat("workspace.get", () => ({ viewerRole: "member" }));
}

function NutDongKhung() {
	const { close } = useRecordStack();
	return (
		<button type="button" data-nut="dong-khung" onClick={close}>
			đóng khung
		</button>
	);
}

async function moKhung(
	searchParams: string,
	nk: ReturnType<typeof nhatKyUrl>,
	dong: readonly DongHien[] = [],
	chon: { suaDuoc?: boolean; cho?: number } = {},
): Promise<void> {
	datMacDinh([...dong]);
	datKhung(chon);
	await mo(
		<>
			<NutDongKhung />
			<DetailSheet onOpenChange={() => {}} open>
				<ObjectiveSheet objectiveId={MT.id} />
			</DetailSheet>
		</>,
		{ searchParams, onUrlUpdate: nk.ghi, giuHangDoiUrl: true },
	);
	await cho(
		() => document.querySelector(`[data-okr-sheet="${MT.id}"]`) !== null,
		"khung muc tieu",
	);
	await nhip(10);
}

async function bamMuc(nhanNut: string, chuMuc: string): Promise<void> {
	const u = userEvent.setup({ document, pointerEventsCheck: 0 });
	await cho(
		() => document.querySelector(`button[aria-label="${nhanNut}"]`) !== null,
		`nut ${nhanNut}`,
	);
	const menu = document.querySelector<HTMLButtonElement>(
		`button[aria-label="${nhanNut}"]`,
	);
	if (!menu) throw new Error(`khong thay ${nhanNut}`);
	await u.click(menu);
	await nhip(5);
	const muc = [...document.querySelectorAll('[role="menuitem"]')].find(
		(o) => o.textContent?.trim() === chuMuc,
	);
	if (!muc) throw new Error(`khong thay muc ${chuMuc}`);
	await u.click(muc);
	await nhip(5);
}

const hs = okrMessages("vi").sheet;
const nhanMenuKr = (ten: string) => hs.menuKr.replace("{ten}", ten);

type DichKhung = {
	khoa: string;
	bam: () => Promise<void>;
	kiem: () => boolean;
};

const BON_DICH: readonly DichKhung[] = [
	{
		khoa: "muc-tieu",
		bam: () => bamMuc(hs.menu, hs.sua),
		kiem: () => hopMucTieu()?.getAttribute("data-hop-thoai-muc-tieu") === MT.id,
	},
	{
		khoa: "kr-moi",
		bam: async () => {
			await cho(
				() => document.querySelector("[data-nut='them-kr']") !== null,
				"nut them kr",
			);
			const b = document.querySelector<HTMLButtonElement>(
				"[data-nut='them-kr']",
			);
			if (b) await bam(b);
		},
		kiem: () => hopKr()?.getAttribute("data-hop-thoai-kr") === "moi",
	},
	{
		khoa: `kr:${KR_1.id}`,
		bam: () => bamMuc(nhanMenuKr(KR_1.title), hs.suaKr),
		kiem: () =>
			hopKr()?.getAttribute("data-hop-thoai-kr") === KR_1.id &&
			oTen(hopKr())?.value === KR_1.title,
	},
	{
		khoa: `kr:${KR_2.id}`,
		bam: () => bamMuc(nhanMenuKr(KR_2.title), hs.suaKr),
		kiem: () =>
			hopKr()?.getAttribute("data-hop-thoai-kr") === KR_2.id &&
			oTen(hopKr())?.value === KR_2.title,
	},
];

describe("khung-tao-okr — tạo Mục tiêu trên URL", () => {
	test("tao-muc-tieu: bấm ghi new, URL mở lại ngăn, tạo xong mở khung Mục tiêu, không quyền thì không mở", async () => {
		const coDeal = await dataSizeNganDeal();
		const dung = (suaDuoc: boolean | undefined) => (
			<>
				<NutThemMucTieu suaDuoc={suaDuoc} />
				<NganTaoMucTieu
					suaDuoc={suaDuoc}
					cycleId={MT.cycleId}
					don={{ loai: "goc" }}
					tenDon="OneHub"
				/>
			</>
		);

		let nk = nhatKyUrl();
		datMacDinh([]);
		dat("okr.createObjective", () => ({ id: "mt-moi", canhBao: null }));
		await mo(dung(true), { onUrlUpdate: nk.ghi });
		await bam(nut(okrMessages("vi").themMucTieu));
		if (nk.cuoi().get("new") !== "true") throw new Error("khong ghi url: new");
		await cho(() => hopMucTieu() !== null, "ngan tao mo");
		const khung = ngan(hopMucTieu());
		expect(khung?.getAttribute("data-side")).toBe("right");
		expect(hopMucTieu()?.getAttribute("data-hop-thoai-muc-tieu")).toBe("moi");
		expect(khung?.getAttribute("data-size")).toBe(coDeal);
		await dongHet();

		nk = nhatKyUrl();
		datMacDinh([]);
		dat("okr.createObjective", () => ({ id: "mt-moi", canhBao: null }));
		await mo(dung(true), { searchParams: "new=true", onUrlUpdate: nk.ghi });
		await cho(() => hopMucTieu() !== null, "ngan tao mo tu url");
		await go(oTen(hopMucTieu()), "Không thoả thuận nào bị mất dấu");
		await bam(nut(h.taoMucTieu));
		await cho(
			() => nk.cuoi().get("record") === "objective:mt-moi",
			"mo khung moi",
		);
		expect(nk.cuoi().get("new")).toBeNull();
		await dongHet();

		nk = nhatKyUrl();
		datMacDinh([]);
		await mo(dung(false), {
			searchParams: "new=true",
			onUrlUpdate: nk.ghi,
			giuHangDoiUrl: true,
		});
		await choUrl(() => nk.lan.length > 0, "xoa khoa new").catch(() => {
			throw new Error("mo ngan khong quyen: new");
		});
		if (hopMucTieu() !== null) throw new Error("mo ngan khong quyen: new");
		expect(nk.cuoi().has("new")).toBe(false);
		await dongHet();

		nk = nhatKyUrl();
		datMacDinh([]);
		await mo(dung(undefined), {
			searchParams: "new=true",
			onUrlUpdate: nk.ghi,
		});
		await nhip(10);
		expect(nk.lan.length).toBe(0);
	}, 120_000);
});

describe("khung-tao-okr — ngăn trong khung Mục tiêu trên URL", () => {
	test("url-khung: bốn đích × bấm hay URL, đóng ngăn, đóng khung, khoá sai, không quyền, dữ liệu chưa tải", async () => {
		let soKhang = 0;
		for (const d of BON_DICH) {
			let nk = nhatKyUrl();
			await moKhung(`record=objective:${MT.id}`, nk);
			await d.bam();
			await cho(d.kiem, `ngan ${d.khoa} mo bang bam`);
			if (nk.cuoi().get("hopOkr") !== d.khoa)
				throw new Error(
					`bam khong ghi hopOkr=${d.khoa}: ${nk.cuoi().get("hopOkr")}`,
				);
			soKhang += 1;
			await dongHet();

			nk = nhatKyUrl();
			await moKhung(`record=objective:${MT.id}&hopOkr=${d.khoa}`, nk);
			await cho(d.kiem, `ngan ${d.khoa} mo bang url`);
			soKhang += 1;
			await dongHet();
		}

		let nk = nhatKyUrl();
		await moKhung(`record=objective:${MT.id}&hopOkr=muc-tieu`, nk);
		await cho(() => hopMucTieu() !== null, "ngan muc tieu");
		await bam(nut(h.huy, ngan(hopMucTieu()) ?? document.body));
		await cho(() => hopMucTieu() === null, "ngan dong");
		expect(nk.cuoi().has("hopOkr")).toBe(false);
		expect(
			document.querySelector(`[data-okr-sheet="${MT.id}"]`),
		).not.toBeNull();
		soKhang += 1;
		await dongHet();

		nk = nhatKyUrl();
		await moKhung(`record=objective:${MT.id}&hopOkr=muc-tieu`, nk);
		await cho(
			() => hopMucTieu() !== null,
			"ngan muc tieu truoc khi dong khung",
		);
		const nutDong = document.querySelector<HTMLButtonElement>(
			"[data-nut='dong-khung']",
		);
		if (!nutDong) throw new Error("khong thay nut dong khung");
		await bam(nutDong);
		if (nk.cuoi().has("hopOkr")) throw new Error("khoa con sau khi dong khung");
		expect(nk.cuoi().has("record")).toBe(false);
		soKhang += 1;
		await dongHet();

		nk = nhatKyUrl();
		await moKhung(`record=objective:${MT.id}&hopOkr=kr:khong-co`, nk);
		await choUrl(() => nk.lan.length > 0, "xoa khoa kr khong co");
		expect(hopKr()).toBeNull();
		expect(nk.cuoi().has("hopOkr")).toBe(false);
		soKhang += 1;
		await dongHet();

		for (const khoa of ["muc-tieu", "kr-moi", `kr:${KR_1.id}`]) {
			nk = nhatKyUrl();
			await moKhung(`record=objective:${MT.id}&hopOkr=${khoa}`, nk, [], {
				suaDuoc: false,
			});
			await choUrl(() => nk.lan.length > 0, `xoa khoa ${khoa}`).catch(() => {
				throw new Error(`mo ngan khong quyen: ${khoa}`);
			});
			if (hopMucTieu() !== null || hopKr() !== null)
				throw new Error(`mo ngan khong quyen: ${khoa}`);
			expect(nk.cuoi().has("hopOkr")).toBe(false);
			soKhang += 1;
			await dongHet();
		}

		nk = nhatKyUrl();
		await moKhung(`record=objective:${MT.id}&hopOkr=muc-tieu`, nk, [], {
			cho: 60,
		});
		await cho(() => hopMucTieu() !== null, "ngan mo sau khi du lieu toi");
		expect(nk.lan.some((u) => !u.has("hopOkr"))).toBe(false);
		await dongHet();

		console.log(`so khang dinh: ${soKhang}`);
		expect(soKhang).toBe(8 + 3 + 3);
	}, 300_000);
});
