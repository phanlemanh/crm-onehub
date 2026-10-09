import { describe, expect, setSystemTime, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KaraState } from "@crm/ui/components/kara/state";
import { TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { act } from "react";
import { troLySanSangOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_CAN,
	D_DOI_TRONG,
	D_TEN,
	deXuat,
	docCua,
	dsTroLy,
	dung,
	dungSheet,
	dungSheetCoGopY,
	goiCua,
	kho,
	kiemCa,
	LoiTrpc,
	m,
	mtSheet,
	nhip,
	nhom,
	nut,
	qs,
	qsa,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";
import {
	datDongHo,
	demTiaSang,
	KHUNG,
	trangThaiKara,
	vungKara,
} from "./khung-gop-y-luot-2";

const { nhipHoiLai } = await import("@/app/(app)/[slug]/okr/gop-y-kara");
const { dauThangSau, homNayVn } = await import("@/lib/okr-chu-ky-nhan");

const MAU_KARA_STATE = join(
	import.meta.dir,
	"../../../_acceptance/kara-gop-y-luot-2/rang/kara-state-goc.json",
);

describe("k3-khung", () => {
	test("k3-khung ghim mac dinh: empty khong action va off khong describedBy giu nguyen DOM cua c1067c16", async () => {
		await dung(
			<div data-ghim="empty">
				<KaraState kind="empty" title="Tiêu đề" description="Mô tả" />
			</div>,
		);
		await dung(
			<div data-ghim="off">
				<KaraState
					kind="off"
					reason="Lý do"
					action={<button type="button">Nút</button>}
				/>
			</div>,
		);
		const thuc = {
			empty: qs("[data-ghim=empty]")?.innerHTML ?? "",
			off: qs("[data-ghim=off]")?.innerHTML ?? "",
		};
		if (!existsSync(MAU_KARA_STATE))
			throw new Error(
				`chua co mau kara-state-goc.json: ${JSON.stringify(thuc)}`,
			);
		const goc = JSON.parse(readFileSync(MAU_KARA_STATE, "utf8")) as Record<
			"empty" | "off",
			string
		>;
		kiemCa(
			thuc,
			goc,
			(k) => `kara-state ${k} doi DOM khi khong truyen prop moi`,
		);
	});

	test("k3-khung prop moi: empty co action ve trong EmptyContent, off co describedBy gan id cho cau ly do", async () => {
		await dung(
			<div data-ca="empty">
				<KaraState
					kind="empty"
					title="Tiêu đề"
					description="Mô tả"
					action={<button type="button">Đọc lại</button>}
				/>
			</div>,
		);
		await dung(
			<div data-ca="off">
				<KaraState kind="off" reason="Lý do" describedBy="ly-do-tat" />
			</div>,
		);
		kiemCa(
			{
				nutEmpty:
					qs("[data-ca=empty] [data-slot=empty-content] button")?.textContent ??
					null,
				idOff:
					qs("[data-ca=off] [data-slot=field-description]")?.getAttribute(
						"id",
					) ?? null,
			},
			{ nutEmpty: "Đọc lại", idOff: "ly-do-tat" },
			(k) => `kara-state prop moi sai: ${k}`,
		);
	});
	test("k3-khung vung la DetailSheetSection nhu vung ben canh, mot tia sang, ba KaraProposal, Kara ban thi nut quyet khoa", async () => {
		await dungSheetCoGopY([D_DOI_TRONG, D_CAN, D_TEN]);
		const vung = vungKara();
		if (!vung) throw new Error("khong co [data-vung-kara]");
		const khung = vung.closest("section");
		const benCanh = qs("[data-khu=vi-sao] section");
		const tia = demTiaSang(vung);
		if (tia !== 1) throw new Error(`tia sang trong vung: ${tia}, mong 1`);
		kiemCa(
			{
				coKhung: khung !== null,
				cungKhung: khung?.className === benCanh?.className,
				soDeXuat: qsa(
					"[data-slot=kara-khoa] > [data-slot=proposed-change]",
					vung,
				).length,
			},
			{ coKhung: true, cungKhung: true, soDeXuat: 3 },
			(k) => `vung kara sai: ${k}`,
		);
		await thaoHet();

		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 3 }));
		kho.troLy = () =>
			dsTroLy([D_DOI_TRONG, D_CAN, D_TEN], { dangSoan: true, maKetThuc: null });
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"co gop y khi ban",
		);
		const nutQuyet = qsa("[data-hanh-dong]", vungKara() ?? document.body);
		const mo = nutQuyet.filter(
			(b) => !(b as HTMLButtonElement).disabled,
		).length;
		kiemCa(
			{ soNut: nutQuyet.length > 0, nutMo: mo },
			{ soNut: true, nutMo: 0 },
			(k) => `kara ban ma nut quyet khong khoa: ${k}`,
		);
	});
});

describe("k3-tai-loi", () => {
	const MA_TRAN = [
		{
			ten: "may-chu",
			loi: () => new LoiTrpc("INTERNAL_SERVER_ERROR", "boom"),
		},
		{ ten: "mat-mang", loi: () => new TypeError("Failed to fetch") },
	] as const;

	test("k3-tai-loi vung con, KaraState loi voi cau tai loi, Thu lai chi tai lai danh sach", async () => {
		for (const ca of MA_TRAN) {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
			kho.troLy = () => {
				throw ca.loi();
			};
			await dungSheet();
			await cho(
				() => docCua("okr.troLyDanhSach").length > 0,
				`${ca.ten} doc danh sach`,
			);
			await nhip(6);
			if (vungKara() === null)
				throw new Error("vung kara bien mat khi tai loi");
			const loi = vungKara()?.querySelector("[data-kara-state=error]") ?? null;
			kiemCa(
				{
					tieuDe:
						loi?.querySelector("[data-slot=empty-title]")?.textContent ?? null,
					moTa:
						loi?.querySelector("[data-slot=empty-description]")?.textContent ??
						null,
				},
				{
					tieuDe: ui.karaKhung.chuaDuoc(m.vung.viecTai),
					moTa: m.vung.taiLoiMoTa,
				},
				(k) => `${ca.ten} cau tai loi sai: ${k}`,
			);
			const docTruoc = docCua("okr.troLyDanhSach").length;
			await bamChuot(
				qs("[data-slot=kara-retry]", vungKara() ?? document.body) ??
					document.body,
			);
			await cho(
				() => docCua("okr.troLyDanhSach").length === docTruoc + 1,
				`${ca.ten} tai lai`,
			);
			kiemCa(
				{ nho: goiCua("okr.troLyDeXuat").length },
				{ nho: 0 },
				(k) => `${ca.ten} Thu lai goi nham Kara: ${k}`,
			);
			await thaoHet();
			kho.daDoc = [];
			kho.daGhi = [];
		}
	});

	test("k3-tai-loi giu gop y khi hoi lai loi: da co danh sach thi lan hoi lai hong khong xoa gop y", async () => {
		let hong = false;
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
		kho.troLy = () => {
			if (hong) throw new TypeError("Failed to fetch");
			return dsTroLy([D_DOI_TRONG, D_CAN]);
		};
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"co gop y",
		);
		hong = true;
		await bamChuot(nut(m.de.boQua, deXuat(D_DOI_TRONG.id) ?? document.body));
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "da quyet");
		await nhip(10);
		kiemCa(
			{
				nhom: nhom()?.getAttribute("data-nhom-kara") ?? null,
				conCan: deXuat(D_CAN.id) !== null,
			},
			{ nhom: "co-gop-y", conCan: true },
			(k) => `hoi lai loi xoa gop y dang hien: ${k}`,
		);
	});
});

describe("k3-nho-loi", () => {
	const MA_TRAN = [
		{
			ten: "403",
			loai: "khong-quyen",
			nem: () => new LoiTrpc("FORBIDDEN", "Forbidden resource"),
		},
		{
			ten: "400",
			loai: "khac",
			nem: () => new LoiTrpc("BAD_REQUEST", "krKhacMucTieu"),
		},
		{
			ten: "mat-mang",
			loai: "mat-mang",
			nem: () => new TypeError("Failed to fetch"),
		},
	] as const;

	test("k3-nho-loi Nho Kara bi tu choi hay loi thi vung hien KaraState loi voi cau san pham va Thu lai", async () => {
		for (const ca of MA_TRAN) {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
			kho.troLy = () => dsTroLy([], { maKetThuc: null, docLuc: null });
			kho.ghiRieng.set("okr.troLyDeXuat", async () => {
				throw ca.nem();
			});
			await dungSheet();
			await cho(() => qs("[data-nut=nho-kara]") !== null, `${ca.ten} nut nho`);
			await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
			await cho(
				() => goiCua("okr.troLyDeXuat").length === 1,
				`${ca.ten} da goi`,
			);
			await nhip(6);
			const loi = qsa("[data-kara-state=error]", vungKara() ?? document.body);
			if (loi.length !== 1) throw new Error("nho kara loi ma khong co cau");
			const chu = loi[0]?.textContent ?? "";
			kiemCa(
				{
					tieuDe:
						loi[0]?.querySelector("[data-slot=empty-title]")?.textContent ??
						null,
					moTa:
						loi[0]?.querySelector("[data-slot=empty-description]")
							?.textContent ?? null,
					coThuLai: loi[0]?.querySelector("[data-slot=kara-retry]") !== null,
					loCauTho: chu.includes(ca.nem().message),
				},
				{
					tieuDe: ui.karaKhung.chuaDuoc(m.vung.viecDoc),
					moTa: m.vung.nhoLoi[ca.loai],
					coThuLai: true,
					loCauTho: false,
				},
				(k) => `${ca.ten} sai: ${k}`,
			);
			await thaoHet();
			kho.daGhi = [];
		}
	});
});

describe("k3-qua-han", () => {
	const T0 = Date.parse("2026-10-09T03:00:00.000Z");
	const DANG_DOC = () =>
		dsTroLy([], { dangSoan: true, maKetThuc: null, docLuc: null });
	const MA_TRAN = [
		{
			ten: "duoi-tran",
			lech: TRO_LY_OKR_TRAN.tranChoMs - 1000,
			mong: "working",
		},
		{ ten: "qua-tran", lech: TRO_LY_OKR_TRAN.tranChoMs + 1000, mong: "error" },
	] as const;

	test("k3-qua-han khung mo luc Kara dang doc va khong bam Nho: duoi tran con dang doc, qua tran sang loi co Thu lai", async () => {
		for (const ca of MA_TRAN) {
			try {
				datDongHo(T0);
				kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
				kho.troLy = DANG_DOC;
				const san = await dungSheet();
				await cho(() => trangThaiKara() === "working", `${ca.ten} dang doc`);
				datDongHo(T0 + ca.lech);
				await san.veLai(KHUNG());
				await nhip(4);
				const thuc = trangThaiKara();
				if (ca.mong === "error" && thuc === "working")
					throw new Error("cho mai khi khung mo luc kara dang doc");
				kiemCa(
					{
						trangThai: thuc,
						coThuLai:
							qs("[data-slot=kara-retry]", vungKara() ?? document.body) !==
							null,
						daNho: goiCua("okr.troLyDeXuat").length,
					},
					{ trangThai: ca.mong, coThuLai: ca.mong === "error", daNho: 0 },
					(k) => `${ca.ten} sai: ${k}`,
				);
			} finally {
				setSystemTime();
				await thaoHet();
			}
		}
	});

	test("k3-qua-han doc xong muon: qua tran van hoi lai cham, Kara doc xong thi bo loi va hien gop y", async () => {
		kiemCa(
			{
				duoi: nhipHoiLai(0, TRO_LY_OKR_TRAN.tranChoMs - 1),
				qua: nhipHoiLai(0, TRO_LY_OKR_TRAN.tranChoMs + 1),
			},
			{ duoi: TRO_LY_OKR_TRAN.hoiLaiMs, qua: TRO_LY_OKR_TRAN.tranChoMs },
			(k) => `nhip hoi lai sau qua han sai: ${k}`,
		);
		let xong = false;
		try {
			datDongHo(T0);
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
			kho.troLy = () => (xong ? dsTroLy([D_DOI_TRONG]) : DANG_DOC());
			const san = await dungSheet();
			await cho(() => trangThaiKara() === "working", "dang doc");
			datDongHo(T0 + TRO_LY_OKR_TRAN.tranChoMs + 1000);
			await san.veLai(KHUNG());
			await cho(() => trangThaiKara() === "error", "qua han");
			xong = true;
			await act(async () => {
				await san.client.invalidateQueries({
					queryKey: ["okr.troLyDanhSach"],
				});
			});
			await cho(
				() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
				"doc xong muon van ket loi",
			);
		} finally {
			setSystemTime();
		}
	});
});

describe("k3-tat", () => {
	const LY_DO = [
		{ ma: "het-luot", lyDo: "het-tran-ngay", cau: () => m.vung.hetLuot },
		{
			ma: "tam-nghi",
			lyDo: "het-tran-thang",
			cau: () => m.vung.tamNghi(dauThangSau(homNayVn(new Date()))),
		},
		{ ma: "chua-bat", lyDo: "don-vi-chua-bat", cau: () => m.vung.chuaBat },
	] as const;
	const VUNG = [
		{ ten: "loi", ds: () => dsTroLy([], { maKetThuc: "loi" }) },
		{ ten: "rong", ds: () => dsTroLy([]) },
	] as const;

	test("k3-tat 3 ly do x 2 trang thai vung: KaraState off noi ly do, khong Thu lai xam, nut tro toi cau ly do", async () => {
		let soCa = 0;
		for (const ld of LY_DO)
			for (const v of VUNG) {
				kho.sanSang = troLySanSangOutput.parse({ bat: false, lyDo: ld.lyDo });
				kho.troLy = v.ds;
				kho.chiTiet = () => chiTietTu(mtSheet());
				await dungSheet();
				await cho(
					() =>
						(vungKara()?.querySelector("[data-kara-state=off]") ?? null) !==
						null,
					`${ld.ma}/${v.ten} off`,
				);
				const vung = vungKara() ?? document.body;
				const xam = qsa("button[disabled]", vung).filter(
					(b) => b.textContent?.trim() === ui.karaKhung.thuLai,
				).length;
				if (xam > 0) throw new Error("thu lai xam khong ly do");
				const moTa = qs(
					"[data-kara-state=off] [data-slot=field-description]",
					vung,
				);
				const nutVung = qs("[data-kara-state=off] button", vung);
				kiemCa(
					{
						cau: moTa?.textContent ?? null,
						coId: (moTa?.getAttribute("id") ?? "") !== "",
						troToi:
							nutVung?.getAttribute("aria-describedby") ===
							moTa?.getAttribute("id"),
					},
					{ cau: ld.cau(), coId: true, troToi: true },
					(k) => `${ld.ma}/${v.ten} sai: ${k}`,
				);
				soCa += 1;
				await thaoHet();
			}
		expect(soCa).toBe(6);
	});

	test("k3-tat thu lai khi chua biet san sang: doc san sang loi thi Thu lai doc lai san sang, khong im lang", async () => {
		kho.rieng.set("okr.troLySanSang", () => {
			throw new TypeError("Failed to fetch");
		});
		kho.troLy = () => dsTroLy([], { maKetThuc: "loi" });
		kho.chiTiet = () => chiTietTu(mtSheet());
		await dungSheet();
		await cho(() => trangThaiKara() === "error", "loi doc");
		const truoc = docCua("okr.troLySanSang").length;
		await bamChuot(
			qs("[data-slot=kara-retry]", vungKara() ?? document.body) ??
				document.body,
		);
		await cho(
			() => docCua("okr.troLySanSang").length === truoc + 1,
			"Thu lai im lang khi chua biet san sang",
		);
		expect(goiCua("okr.troLyDeXuat").length).toBe(0);
	});
});
