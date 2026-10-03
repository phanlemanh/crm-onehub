import { describe, expect, test } from "bun:test";
import { act } from "react";
import { toast } from "sonner";
import { troLySanSangOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	bamPhim,
	chiTietTu,
	cho,
	D_CAN,
	D_DOI_TRONG,
	D_KR1,
	D_KR2,
	D_KR3,
	D_TEN,
	D_VI_SAO,
	deXuat,
	docCua,
	dong,
	dsTroLy,
	dung,
	dungCuaToi,
	dungSheet,
	dungSheetCoGopY,
	goChu,
	goiCua,
	HopThoaiKr,
	HopThoaiMucTieu,
	HUNG,
	KR_1,
	KR_2,
	KR_3,
	kho,
	kiemCa,
	LoiTrpc,
	MT_A,
	MT_ID,
	m,
	mo,
	mtSheet,
	nguoiDung,
	nhanKara,
	nhip,
	nhom,
	nut,
	nutCo,
	qs,
	qsa,
	SAN_SANG,
	sau,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";

describe("dong-bo", () => {
	const MA_TRAN = [
		{ ten: "3-cho-3-dong", soGopYCho: 3, ds: [D_TEN, D_KR1, D_CAN], goi: 0 },
		{ ten: "3-cho-2-dong", soGopYCho: 3, ds: [D_TEN, D_KR1], goi: 1 },
	];

	test("lam moi danh sach dung mot lan khi so chip lech so dong cho", async () => {
		for (const ca of MA_TRAN) {
			const mt = mtSheet({ soGopYCho: ca.soGopYCho });
			kho.chiTiet = () => chiTietTu(mt);
			kho.troLy = () => dsTroLy(ca.ds);
			kho.daLamMoi = [];
			await dungSheet();
			await cho(
				() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
				"nhom kara",
			);
			await nhip(10);
			const goi = kho.daLamMoi.filter((id) => id === MT_ID).length;
			if (ca.goi > 0 && goi === 0)
				throw new Error("khong lam moi danh sach khi lech");
			expect(goi, `dong-bo ${ca.ten}`).toBe(ca.goi);
			await thaoHet();
		}
		console.log(`so ca dong-bo: ${MA_TRAN.length + 1}`);
	});

	test("bien nhan da quyet trong phien khong lam lech so dem", async () => {
		let soCho = 3;
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: soCho }));
		kho.troLy = () => dsTroLy([D_TEN, D_KR1, D_CAN]);
		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			soCho = 2;
			return { ok: true };
		});
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"nhom kara",
		);
		const de = deXuat(D_KR1.id);
		if (!de) throw new Error("khong co de xuat KR1");
		await bamChuot(nut(m.de.doiTenKr, de));
		await cho(
			() => qs("[data-slot=proposed-change-receipt]", de) !== null,
			"bien nhan",
		);
		await nhip(15);
		expect(docCua("okr.objective").length).toBeGreaterThan(1);
		const goiDongBo = kho.daLamMoi.filter((id) => id === MT_ID).length - 1;
		expect(goiDongBo, "dong-bo bien-nhan").toBe(0);
	});
});

describe("neo", () => {
	test("sau loai gop y nam dung cho, inline, khong the hay canh bao", async () => {
		await dungSheetCoGopY([D_TEN, D_VI_SAO, D_KR1, D_DOI_TRONG, D_KR3, D_CAN]);
		const vung = nhom();
		if (!vung) throw new Error("khong co nhom kara");
		const khung = qs("[data-okr-sheet]");
		const trongDuoiKr = (dId: string, krId: string) => {
			const hang = qs(`[data-kr="${krId}"]`);
			const duoi = qs(`[data-duoi-kr="${krId}"]`);
			return (
				hang?.nextElementSibling === duoi &&
				duoi?.contains(deXuat(dId)) === true
			);
		};
		const khuViSao = qs("[data-khu=vi-sao]");
		const CHO = [
			{ ten: "kr.title", dung: trongDuoiKr(D_KR1.id, KR_1.id) },
			{ ten: "kr-la-viec", dung: trongDuoiKr(D_KR3.id, KR_3.id) },
			{
				ten: "whyNow",
				dung:
					khuViSao?.nextElementSibling?.contains(deXuat(D_VI_SAO.id)) ===
						true && !vung.contains(deXuat(D_VI_SAO.id)),
			},
			{ ten: "title", dung: vung.contains(deXuat(D_TEN.id)) },
			{ ten: "hoi-bo-kr", dung: vung.contains(deXuat(D_DOI_TRONG.id)) },
			{ ten: "can-chinh", dung: vung.contains(deXuat(D_CAN.id)) },
		];
		for (const ca of CHO) expect(ca.dung, `neo sai: ${ca.ten}`).toBe(true);
		const tatCa = qsa("[data-gop-y]");
		expect(tatCa.length).toBe(6);
		for (const d of tatCa) {
			expect(d.getAttribute("data-slot")).toBe("proposed-change");
			expect(d.getAttribute("data-density")).toBe("inline");
			const the =
				d.parentElement?.closest("[data-slot=card], [role=alert]") ?? null;
			expect(the !== null && khung?.contains(the) === true).toBe(false);
		}
		expect(sau(vung, qs(`[data-kr="${KR_1.id}"]`)), "nhom truoc bang KR").toBe(
			true,
		);
		expect(nhanKara()).toBe(`Kara · ${m.vung.soCho("6")}`);
		console.log(`so khang dinh cho neo: ${CHO.length}`);
	});

	test("Vi sao mo ly do va gio doc; viet lai co del/ins va dung ba nut; cau hoi co loi di", async () => {
		await dungSheetCoGopY([D_KR1, D_DOI_TRONG, D_KR3]);
		await bamChuot(nut(ui.kara.why));
		await cho(
			() => qs("[data-slot=popover-content]") !== null,
			"popover vi sao",
		);
		const pop = qs("[data-slot=popover-content]");
		expect(pop?.textContent).toContain(m.vung.lyDo("3"));
		expect(pop?.textContent).toContain("Đọc lúc");
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		const kr1 = deXuat(D_KR1.id);
		if (!kr1) throw new Error("khong co de xuat KR1");
		expect(qs("del", kr1)?.textContent).toBe(KR_1.title);
		expect(qs("ins", kr1)?.textContent).toBe(D_KR1.sau ?? "");
		expect(qsa("button", kr1).map((b) => b.textContent?.trim())).toEqual([
			m.de.doiTenKr,
			m.de.sua,
			m.de.boQua,
		]);
		const hoi = (id: string) =>
			qsa("button", deXuat(id) ?? document.createElement("div")).map((b) =>
				b.textContent?.trim(),
			);
		expect(hoi(D_DOI_TRONG.id)).toEqual([m.de.themDoiTrong, m.de.boQua]);
		expect(hoi(D_KR3.id)).toEqual([m.de.suaKrNay, m.de.boQua]);
	});
});

describe("doi-trong", () => {
	const MA_TRAN = [
		{
			ten: "bat-co-cau-hoi",
			ds: [D_DOI_TRONG],
			sanSang: SAN_SANG,
			lyDo: null,
			canhBao: false,
		},
		{
			ten: "bat-khong-cau-hoi",
			ds: [D_TEN],
			sanSang: SAN_SANG,
			lyDo: null,
			canhBao: true,
		},
		{
			ten: "chua-bat",
			ds: [],
			sanSang: troLySanSangOutput.parse({
				bat: false,
				lyDo: "don-vi-chua-bat",
			}),
			lyDo: "don-vi-chua-bat" as const,
			canhBao: true,
		},
	];

	test("canh bao doi trong chi nhuong cho cau hoi cua Kara", async () => {
		for (const ca of MA_TRAN) {
			kho.sanSang = ca.sanSang;
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: ca.ds.length }));
			kho.troLy = () => dsTroLy(ca.ds, { lyDo: ca.lyDo });
			await dungSheet();
			await cho(
				() => docCua("okr.troLyDanhSach").length > 0,
				"doc danh sach kara",
			);
			await nhip(10);
			const co = qs("[data-canh-bao-doi-trong]") !== null;
			if (co !== ca.canhBao)
				throw new Error(
					ca.canhBao ? `mat canh bao: ${ca.ten}` : `canh bao trung: ${ca.ten}`,
				);
			expect(co).toBe(ca.canhBao);
			await thaoHet();
			kho.daDoc = [];
		}
		console.log(`so ca doi-trong: ${MA_TRAN.length}`);
	});
});

describe("nhan-hoan-tac", () => {
	test("nhan, sua roi nhan, hoan tac va dau theo Kara", async () => {
		const tenMoi = D_KR1.sau ?? "";
		let daNhan = false;
		const mtGoc = mtSheet({ soGopYCho: 3 });
		kho.chiTiet = () =>
			daNhan
				? chiTietTu(
						mtSheet({
							soGopYCho: 2,
							keyResults: [{ ...KR_1, title: tenMoi }, KR_2, KR_3],
						}),
						{
							trail: [
								{
									id: "v-1",
									at: "2026-10-03T03:00:00.000Z",
									actor: HUNG,
									action: "sua-kr",
									keyResultId: KR_1.id,
									before: { title: KR_1.title },
									after: { title: tenMoi },
									note: `tro-ly-okr:${D_KR1.id}`,
								},
							],
						},
					)
				: chiTietTu(mtGoc);
		kho.troLy = () => dsTroLy([D_KR1, D_KR2, D_TEN]);
		kho.ghiRieng.set("okr.troLyQuyet", async (vao) => {
			if (vao?.deXuatId === D_KR1.id) daNhan = true;
			return { ok: true };
		});
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"nhom kara",
		);

		const kr1 = deXuat(D_KR1.id);
		if (!kr1) throw new Error("khong co de xuat KR1");
		await bamChuot(nut(m.de.doiTenKr, kr1));
		await cho(
			() => qs("[data-slot=proposed-change-receipt]", kr1) !== null,
			"bien nhan KR1",
		);
		expect(goiCua("okr.troLyQuyet")[0]?.vao).toEqual({
			deXuatId: D_KR1.id,
			cach: "nhan",
		});
		expect(
			qs("[data-slot=proposed-change-receipt]", kr1)?.textContent,
		).toContain(m.bienNhan.daDoiTenKr);
		expect(nutCo(ui.proposedChange.undo, kr1)).not.toBeNull();
		await cho(
			() =>
				qs(`[data-kr="${KR_1.id}"]`)?.textContent?.includes(tenMoi) === true &&
				qs(`[data-kr="${KR_1.id}"] [data-slot=kara-trace]`) !== null,
			"ten moi va dau theo Kara",
		);
		expect(nhanKara()).toBe(`Kara · ${m.vung.soCho("2")}`);

		const kr2 = deXuat(D_KR2.id);
		if (!kr2) throw new Error("khong co de xuat KR2");
		await bamChuot(nut(m.de.sua, kr2));
		const oSua = qs("[data-slot=proposed-change-edit]", kr2);
		if (!oSua) throw new Error("khong mo o sua");
		await goChu(oSua, "Tên khác", true);
		await bamChuot(nut(m.de.doiTenKr, kr2));
		await cho(() => goiCua("okr.troLyQuyet").length === 2, "lan quyet hai");
		const lanHai = goiCua("okr.troLyQuyet")[1]?.vao;
		if (lanHai?.giaTri !== "Tên khác") throw new Error("sua mat gia tri");
		expect(lanHai).toEqual({
			deXuatId: D_KR2.id,
			cach: "sua",
			giaTri: "Tên khác",
		});

		await bamChuot(nut(ui.proposedChange.undo, kr1));
		await cho(
			() => goiCua("okr.updateKeyResult").length === 1,
			"hoan tac goi updateKeyResult",
		);
		expect(goiCua("okr.updateKeyResult")[0]?.vao).toEqual({
			id: KR_1.id,
			title: KR_1.title,
		});
		await cho(
			() =>
				qs("[data-slot=proposed-change-receipt]", kr1)?.textContent?.includes(
					m.bienNhan.hoanTacKr(KR_1.title),
				) === true,
			"dong da hoan tac",
		);
		expect(nutCo(ui.proposedChange.undo, kr1)).toBeNull();

		const tabVet = qsa("[role=tab]").find(
			(t) => t.textContent?.trim().startsWith(mo.sheet.tabVet) === true,
		);
		if (!tabVet) throw new Error("khong co tab Vet");
		await bamChuot(tabVet);
		await cho(
			() =>
				qs("[role=tabpanel][data-state=active]")?.textContent?.includes(
					m.vet.theoKara,
				) === true,
			"tab vet theo Kara",
		);
		console.log("so buoc nhan-hoan-tac: 4");
	});
});

describe("bo-qua", () => {
	const HOI = (
		[
			"kr-la-viec",
			"thieu-doi-trong",
			"khong-do-duoc",
			"trung-y",
			"muc-tieu-la-so",
		] as const
	).map((ma) =>
		dong(`d-hoi-${ma}`, {
			loai: "hoi",
			maVanDe: ma,
			sau: `Câu hỏi về ${ma}?`,
			lyDo: `Kara thấy ${ma}.`,
		}),
	);
	const MA_TRAN = [
		{
			d: D_KR1,
			cach: "bac",
			chu: m.bienNhan.boQuaTen(D_KR1.sau ?? ""),
		},
		...HOI.map((d) => ({
			d,
			cach: "bo-qua",
			chu: m.bienNhan.boQuaHoi(m.tomTat[d.maVanDe as keyof typeof m.tomTat]),
		})),
	];

	test("bo qua sau loai, bien nhan noi dung, khong hoan tac, nhan giam", async () => {
		await dungSheetCoGopY(MA_TRAN.map((ca) => ca.d));
		let con = MA_TRAN.length;
		for (const ca of MA_TRAN) {
			const de = deXuat(ca.d.id);
			if (!de) throw new Error(`khong co de xuat ${ca.d.id}`);
			await bamChuot(nut(m.de.boQua, de));
			await cho(
				() => de.getAttribute("data-decided") === "skipped",
				`bo qua ${ca.d.id}`,
			);
			con -= 1;
			const ten = ca.d.maVanDe ?? ca.d.truong ?? ca.d.id;
			const bienNhan =
				qs("[data-slot=proposed-change-receipt]", de)?.textContent ?? "";
			if (!bienNhan.includes(ca.chu))
				throw new Error(`bien nhan khong noi noi dung: ${ten}`);
			expect(nutCo(ui.proposedChange.undo, de)).toBeNull();
			expect(goiCua("okr.troLyQuyet").at(-1)?.vao).toEqual({
				deXuatId: ca.d.id,
				cach: ca.cach,
			});
			expect(nhanKara()).toBe(
				con > 0
					? `Kara · ${m.vung.soCho(String(con))}`
					: `Kara · ${m.vung.daXemHet}`,
			);
		}
		console.log(`so khang dinh bo-qua: ${MA_TRAN.length}`);
	});
});

async function choHet(xong: () => boolean, moTa: string): Promise<void> {
	const het = Date.now() + 3000;
	while (Date.now() < het) {
		if (xong()) return;
		await nhip(1);
		await new Promise((r) => setTimeout(r, 40));
	}
	throw new Error(`khong toi: ${moTa}`);
}

describe("khoa-gui", () => {
	const nutCuaKhac = () =>
		[D_DOI_TRONG.id, D_CAN.id].flatMap((id) =>
			qsa("button", deXuat(id) ?? document.createElement("div")),
		);

	test("dang gui thi moi de xuat khac khoa, xong thi mo", async () => {
		let tha: () => void = () => {};
		kho.ghiRieng.set(
			"okr.troLyQuyet",
			() =>
				new Promise((r) => {
					tha = () => r({ ok: true });
				}),
		);
		await dungSheetCoGopY([D_KR1, D_DOI_TRONG, D_CAN]);
		const kr1 = deXuat(D_KR1.id);
		if (!kr1) throw new Error("khong co de xuat KR1");
		await bamChuot(nut(m.de.doiTenKr, kr1));
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "dang gui");
		const khac = nutCuaKhac();
		const mo = khac.filter((b) => !(b as HTMLButtonElement).disabled).length;
		if (mo > 0)
			throw new Error(`de xuat khac khong khoa: ${mo}/${khac.length} nut mo`);
		expect(khac.length).toBe(4);
		expect(qs("[data-slot=spinner]", kr1)).not.toBeNull();
		await act(async () => tha());
		await cho(
			() => nutCuaKhac().every((b) => !(b as HTMLButtonElement).disabled),
			"mo lai sau khi xong",
		);
	});

	test("CONFLICT doc lai danh sach, loi khac hien dung cho", async () => {
		let lanDau = true;
		kho.troLy = () => dsTroLy(lanDau ? [D_DOI_TRONG, D_CAN] : [D_CAN]);
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"nhom kara",
		);
		await act(async () => {
			toast.error("Đối chứng: toast hiện được trong khung dựng này");
		});
		await cho(
			() => qs("[data-sonner-toast]") !== null,
			"doi chung toast khong hien",
		);
		await act(async () => {
			toast.dismiss();
		});
		await choHet(
			() => qs("[data-sonner-toast]") === null,
			"toast doi chung con",
		);
		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			lanDau = false;
			throw new LoiTrpc("CONFLICT", "Đề xuất đã đổi");
		});
		const docTruoc = docCua("okr.troLyDanhSach").length;
		await bamChuot(nut(m.de.boQua, deXuat(D_DOI_TRONG.id) ?? document.body));
		await cho(() => deXuat(D_DOI_TRONG.id) === null, "de xuat bien mat");
		expect(docCua("okr.troLyDanhSach").length).toBeGreaterThan(docTruoc);
		expect(qs("[data-sonner-toast]"), "co toast loi khi CONFLICT").toBeNull();
		expect(qs("[data-slot=field-error]")).toBeNull();

		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			throw new LoiTrpc("INTERNAL_SERVER_ERROR", "Mất kết nối tới máy chủ");
		});
		const can = deXuat(D_CAN.id);
		if (!can) throw new Error("khong co de xuat can chinh");
		await bamChuot(nut(m.dong.canChinh, can));
		await cho(
			() => qs("[data-slot=field-error]", can) !== null,
			"loi trong de xuat",
		);
		expect(qs("[data-slot=field-error]", can)?.textContent).toContain(
			"Mất kết nối",
		);
		expect((nut(m.dong.canChinh, can) as HTMLButtonElement).disabled).toBe(
			false,
		);
	});
});

describe("focus-khung", () => {
	test("Esc trong o sua khong dong khung va tra focus ve Sua", async () => {
		let soLanDong = 0;
		await dungSheetCoGopY([D_TEN, D_DOI_TRONG, D_CAN, D_KR1], {
			onOpenChange: (moKhung) => {
				if (!moKhung) soLanDong += 1;
			},
		});
		const ten = deXuat(D_TEN.id);
		if (!ten) throw new Error("khong co de xuat ten");
		await bamChuot(nut(m.de.sua, ten));
		const oSua = qs("[data-slot=proposed-change-edit]", ten);
		if (!oSua) throw new Error("khong mo o sua");
		await bamPhim(oSua, "{Escape}");
		if (soLanDong > 0) throw new Error("esc dong khung");
		expect(qs("[data-okr-sheet]")).not.toBeNull();
		expect(document.activeElement).toBe(qs('[data-hanh-dong="sua"]', ten));
	});

	test("Tab tu Vi sao di qua moi nut de xuat theo thu tu nhin thay", async () => {
		await dungSheetCoGopY([D_TEN, D_DOI_TRONG, D_CAN, D_KR1]);
		const MONG = [
			`${D_TEN.id}:nhan`,
			`${D_TEN.id}:sua`,
			`${D_TEN.id}:bo-qua`,
			`${D_DOI_TRONG.id}:loi-di`,
			`${D_DOI_TRONG.id}:bo-qua`,
			`${D_CAN.id}:can-chinh`,
			`${D_CAN.id}:bo-qua`,
			`${D_KR1.id}:nhan`,
			`${D_KR1.id}:sua`,
			`${D_KR1.id}:bo-qua`,
		];
		const viSao = nut(ui.kara.why);
		await act(async () => viSao.focus());
		const u = nguoiDung();
		const di: string[] = [];
		for (let lan = 0; lan < 80 && di.length < MONG.length; lan += 1) {
			await act(async () => {
				await u.tab();
			});
			const o = document.activeElement;
			const goc = o?.closest("[data-gop-y]");
			const hanhDong = o?.getAttribute("data-hanh-dong");
			if (goc && hanhDong)
				di.push(`${goc.getAttribute("data-gop-y")}:${hanhDong}`);
		}
		expect(di).toEqual(MONG);
	});
});

describe("trang-thai-kara", () => {
	const MA_TRAN = [
		{
			ten: "chua-goi",
			ds: dsTroLy([], { maKetThuc: null, docLuc: null }),
			sanSang: SAN_SANG,
			nhom: "chua-goi",
			chu: m.vung.moTaChuaGoi,
			nutKara: null,
		},
		{
			ten: "dang-doc",
			ds: dsTroLy([], { dangSoan: true, maKetThuc: null, docLuc: null }),
			sanSang: SAN_SANG,
			nhom: "dang-doc",
			chu: m.vung.dangDoc,
			nutKara: null,
		},
		{
			ten: "rong",
			ds: dsTroLy([]),
			sanSang: SAN_SANG,
			nhom: "rong",
			chu: m.vung.rong,
			nutKara: null,
		},
		{
			ten: "loi",
			ds: dsTroLy([], { maKetThuc: "loi" }),
			sanSang: SAN_SANG,
			nhom: "loi",
			chu: m.vung.loi,
			nutKara: null,
		},
		{
			ten: "het-luot",
			ds: dsTroLy([], { maKetThuc: null, docLuc: null }),
			sanSang: troLySanSangOutput.parse({ bat: false, lyDo: "het-tran-ngay" }),
			nhom: "chua-goi",
			chu: m.vung.hetLuot,
			nutKara: "het-luot",
		},
		{
			ten: "tam-nghi",
			ds: dsTroLy([], { maKetThuc: null, docLuc: null }),
			sanSang: troLySanSangOutput.parse({
				bat: false,
				lyDo: "het-tran-thang",
			}),
			nhom: "chua-goi",
			chu: "Kara tạm nghỉ tới",
			nutKara: "tam-nghi",
		},
		{
			ten: "chua-bat",
			ds: dsTroLy([], { lyDo: "don-vi-chua-bat", maKetThuc: null }),
			sanSang: troLySanSangOutput.parse({
				bat: false,
				lyDo: "don-vi-chua-bat",
			}),
			nhom: null,
			chu: null,
			nutKara: null,
		},
	];

	test("bay trang thai cua nhom Kara trong khung chi tiet", async () => {
		for (const ca of MA_TRAN) {
			kho.sanSang = ca.sanSang;
			kho.troLy = () => ca.ds;
			kho.chiTiet = () => chiTietTu(mtSheet());
			await dungSheet();
			await cho(
				() =>
					docCua("okr.troLyDanhSach").length > 0 &&
					docCua("okr.troLySanSang").length > 0,
				`doc kara ${ca.ten}`,
			);
			if (ca.nhom !== null)
				await cho(() => nhom() !== null, `nhom kara ${ca.ten}`);
			await nhip(8);
			const n = nhom();
			kiemCa(
				{
					nhom: n?.getAttribute("data-nhom-kara") ?? null,
					coChu:
						ca.chu === null
							? null
							: (n?.textContent?.includes(ca.chu) ?? false),
					nutKara: qs("[data-nut-kara]")?.getAttribute("data-nut-kara") ?? null,
				},
				{
					nhom: ca.nhom,
					coChu: ca.chu === null ? null : true,
					nutKara: ca.nutKara,
				},
				(truong) => `trang thai ${ca.ten} sai: ${truong}`,
			);
			if (
				ca.ten === "dang-doc" &&
				qs("[data-slot=spinner]", n ?? document.body)
			)
				throw new Error("dang doc khong dung ThinkingIndicator");
			const nutNho = qsa("[data-nut=nho-kara]");
			expect(nutNho.length).toBeLessThanOrEqual(1);
			for (const b of nutNho) expect(qs("svg", b)).not.toBeNull();
			expect(document.body.textContent).not.toContain("Trợ lý OKR");
			await thaoHet();
			kho.daDoc = [];
		}
		console.log(`so ca trang-thai-kara: ${MA_TRAN.length}`);
	});

	test("danh sach, hai hop Sua va tab Vet khong con chu Tro ly OKR", async () => {
		await dungCuaToi([MT_A()]);
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
		await thaoHet();
		const mt = mtSheet({ soGopYCho: 2 });
		kho.troLy = () => dsTroLy([D_KR1]);
		await dung(
			<HopThoaiMucTieu dong={() => {}} yeuCau={{ loai: "sua", mucTieu: mt }} />,
		);
		await cho(() => qs("[data-hop-thoai-muc-tieu]") !== null, "hop muc tieu");
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
		await thaoHet();
		await dung(
			<HopThoaiKr
				chuMacDinh={HUNG.id}
				dong={() => {}}
				kr={KR_1}
				mucTieu={mt}
				objectiveId={MT_ID}
				suaDuocCot
			/>,
		);
		await cho(() => qs("[data-hop-thoai-kr]") !== null, "hop KR");
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
		await thaoHet();
		kho.chiTiet = () =>
			chiTietTu(mtSheet(), {
				trail: [
					{
						id: "v-kara",
						at: "2026-10-03T03:00:00.000Z",
						actor: HUNG,
						action: "sua-kr",
						keyResultId: KR_1.id,
						before: { title: KR_1.title },
						after: { title: D_KR1.sau ?? "" },
						note: `tro-ly-okr:${D_KR1.id}`,
					},
				],
			});
		await dungSheet();
		const tabVet = qsa("[role=tab]").find(
			(t) => t.textContent?.trim().startsWith(mo.sheet.tabVet) === true,
		);
		if (!tabVet) throw new Error("khong co tab Vet");
		await bamChuot(tabVet);
		await cho(
			() =>
				qs(
					"[role=tabpanel][data-state=active] [data-vet-hang]",
				)?.textContent?.includes(m.vet.theoKara) === true,
			"hang vet theo Kara khong hien",
		);
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
	});
});
