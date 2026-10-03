import { describe, expect, setSystemTime, test } from "bun:test";
import { TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { act } from "react";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_CAN,
	D_DOI_TRONG,
	D_KR1,
	D_TEN,
	DetailSheet,
	danhSachTu,
	deXuat,
	docCua,
	dsTroLy,
	dung,
	dungSheet,
	dungSheetCoGopY,
	goiCua,
	HUNG,
	kho,
	MT_ID,
	m,
	mtSheet,
	nhip,
	nhom,
	nut,
	nutCo,
	ObjectiveSheet,
	qs,
	qsa,
	TheoDonVi,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";

const chipCua = (id: string) =>
	qs(`[data-chip-gop-y="${id}"]`)?.innerText ??
	qs(`[data-chip-gop-y="${id}"]`)?.textContent ??
	null;

describe("dong-bo", () => {
	test("mo khung khi chip danh sach con dem cu thi danh sach doc lai va chip ve so khung hien (AC-3)", async () => {
		let soServer = 3;
		kho.danhSach = () => danhSachTu([mtSheet({ soGopYCho: soServer })], 1);
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: soServer }));
		kho.troLy = () => dsTroLy([D_TEN, D_DOI_TRONG, D_CAN]);
		const san = await dung(<TheoDonVi />);
		await cho(
			() => chipCua(MT_ID) === `Kara · ${m.chip("3")}`,
			"chip danh sach dem 3",
		);
		soServer = 2;
		kho.troLy = () => dsTroLy([D_TEN, D_CAN]);
		await san.veLai(
			<>
				<TheoDonVi />
				<DetailSheet onOpenChange={() => {}} open>
					<ObjectiveSheet objectiveId={MT_ID} />
				</DetailSheet>
			</>,
		);
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"khung co gop y",
		);
		await nhip(15);
		const chip = chipCua(MT_ID);
		if (chip !== `Kara · ${m.chip("2")}`)
			throw new Error(`chip khong khop khung sau khi mo: ${chip}`);
		expect(kho.daLamMoi.filter((id) => id === MT_ID).length).toBe(1);
	});
});

describe("focus-khung", () => {
	test("quyet de xuat dau nhom giu cho va focus o Hoan tac sau khi danh sach doc lai", async () => {
		const daQuyet = new Set<string>();
		kho.ghiRieng.set("okr.troLyQuyet", async (vao) => {
			daQuyet.add(String(vao?.deXuatId));
			return { ok: true };
		});
		await dungSheetCoGopY([D_TEN, D_DOI_TRONG, D_CAN]);
		kho.troLy = () =>
			dsTroLy([D_TEN, D_DOI_TRONG, D_CAN].filter((d) => !daQuyet.has(d.id)));
		const ten = deXuat(D_TEN.id);
		if (!ten) throw new Error("khong co de xuat ten muc tieu");
		const docTruoc = docCua("okr.troLyDanhSach").length;
		await bamChuot(nut(m.de.doiTenMucTieu, ten));
		await cho(
			() => docCua("okr.troLyDanhSach").length > docTruoc,
			"danh sach Kara doc lai sau khi quyet",
		);
		await nhip(10);
		const thuTu = qsa("[data-nhom-kara] [data-gop-y]").map((o) =>
			o.getAttribute("data-gop-y"),
		);
		if (thuTu[0] !== D_TEN.id)
			throw new Error(`de xuat da quyet doi cho: ${thuTu.join(", ")}`);
		expect(thuTu).toEqual([D_TEN.id, D_DOI_TRONG.id, D_CAN.id]);
		const hoanTac = nut(ui.proposedChange.undo, deXuat(D_TEN.id) ?? document);
		expect(document.activeElement).toBe(hoanTac);
	});
});

const CHO_DUYET = {
	nguoiGui: HUNG,
	guiLuc: "2026-10-02T03:00:00.000Z",
	nguoiDuyet: { ten: "Nguyễn Thị Lan" },
	lanTraLaiTruoc: null,
};

describe("trang-thai-kara", () => {
	test("muc tieu cho duyet: gop y van hien nhung nut quyet khoa co ly do, khong nut nho; muc tieu da bo khong co vung Kara", async () => {
		kho.chiTiet = () =>
			chiTietTu(mtSheet({ status: "cho-duyet", soGopYCho: 2 }), {
				choDuyet: CHO_DUYET,
			});
		kho.troLy = () => dsTroLy([D_TEN, D_KR1]);
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"nhom kara cho duyet",
		);
		await nhip(5);
		const nutQuyet = qsa("[data-gop-y] button");
		const mo = nutQuyet.filter((b) => !(b as HTMLButtonElement).disabled);
		if (mo.length > 0)
			throw new Error(
				`khoa ghi khong khoa nut quyet: ${mo.length}/${nutQuyet.length} nut mo`,
			);
		expect(nutQuyet.length).toBeGreaterThan(0);
		expect(qsa("[data-gop-y]").map((d) => d.textContent ?? "")).toEqual([
			expect.stringContaining(m.de.khoaSua),
			expect.stringContaining(m.de.khoaSua),
		]);
		expect(qs("[data-nut=nho-kara]")).toBeNull();

		await thaoHet();
		kho.chiTiet = () => chiTietTu(mtSheet({ status: "da-bo" }));
		kho.troLy = () => dsTroLy([], { maKetThuc: null, docLuc: null });
		await dungSheet();
		await nhip(10);
		if (qs("[data-nhom-kara]") !== null)
			throw new Error(
				`muc tieu da bo con vung Kara: ${qs("[data-nhom-kara]")?.getAttribute("data-nhom-kara")}`,
			);
	});

	test("danh sach Kara dang tai thi khong hien Kara dang doc", async () => {
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
		kho.troLy = () => new Promise(() => {});
		await dungSheet();
		await nhip(10);
		if (document.body.textContent?.includes(m.vung.dangDoc))
			throw new Error("dang tai ma noi Kara dang doc");
		expect(qs("[data-nhom-kara]")).toBeNull();
	});
});

describe("neo", () => {
	test("co neoGopY thi cuon toi vung Kara khi vung da hien roi xoa co; mo kieu khac khong cuon", async () => {
		const goc = HTMLElement.prototype.scrollIntoView;
		const lan: boolean[] = [];
		HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
			lan.push(this.querySelector("[data-nhom-kara]") !== null);
		};
		try {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 1 }));
			kho.troLy = async () => {
				await new Promise((r) => setTimeout(r, 20));
				return dsTroLy([D_TEN]);
			};
			const san = await dungSheet({
				thamSo: `?record=objective:${MT_ID}&neoGopY=true`,
			});
			await cho(() => san.url().get("neoGopY") === null, "xoa co neoGopY");
			await nhip(5);
			if (!lan.includes(true))
				throw new Error(
					`cuon truoc khi vung Kara hien: ${JSON.stringify(lan)}`,
				);
			expect(lan).toEqual([true]);
			lan.length = 0;
			await thaoHet();
			await dungSheet();
			await cho(() => nhom() !== null, "vung Kara khi mo thuong");
			await nhip(5);
			expect(lan).toEqual([]);
		} finally {
			HTMLElement.prototype.scrollIntoView = goc;
		}
	});
});

const choLau = async (xong: () => boolean, moTa: string, hanMs = 8000) => {
	const het = Date.now() + hanMs;
	while (Date.now() < het) {
		if (xong()) return;
		await nhip(1);
		await new Promise((r) => setTimeout(r, 40));
	}
	throw new Error(`khong toi: ${moTa}`);
};

describe("trang-thai-kara", () => {
	test("doc qua han thi Thu lai mo duoc va nho lai Kara", async () => {
		let pha: "chua" | "soan" = "chua";
		let tha: (() => void) | null = null;
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
		kho.troLy = () =>
			pha === "chua"
				? dsTroLy([], { maKetThuc: null, docLuc: null })
				: new Promise((r) => {
						tha = () =>
							r(dsTroLy([], { dangSoan: true, maKetThuc: null, docLuc: null }));
					});
		kho.ghiRieng.set("okr.troLyDeXuat", async () => {
			pha = "soan";
			return { bat: true, taskId: "t-1", dungLai: false };
		});
		await dungSheet();
		await cho(() => qs("[data-nut=nho-kara]") !== null, "nut nho Kara");
		await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
		await cho(() => tha !== null, "doc lai sau khi nho");
		try {
			setSystemTime(new Date(Date.now() + TRO_LY_OKR_TRAN.tranChoMs + 1000));
			await act(async () => tha?.());
			await cho(
				() => nhom()?.getAttribute("data-nhom-kara") === "loi",
				"trang thai loi qua han",
			);
			const thuLai = nut(m.vung.thuLai, nhom() ?? document);
			if ((thuLai as HTMLButtonElement).disabled)
				throw new Error("thu lai bi khoa khi qua han");
			await bamChuot(thuLai);
			await cho(
				() => goiCua("okr.troLyDeXuat").length === 2,
				"nho lai Kara sau Thu lai",
			);
		} finally {
			setSystemTime();
		}
	});

	test("quyet het roi nho Kara doc lai thi hien dang doc va bao loi khi lan doc lai hong", async () => {
		let pha: "cho" | "da-quyet" | "soan" | "loi" = "cho";
		kho.chiTiet = () =>
			chiTietTu(mtSheet({ soGopYCho: pha === "cho" ? 1 : 0 }));
		kho.troLy = () => {
			if (pha === "cho") return dsTroLy([D_TEN]);
			if (pha === "da-quyet") return dsTroLy([]);
			if (pha === "soan")
				return dsTroLy([], { dangSoan: true, maKetThuc: null });
			return dsTroLy([], { maKetThuc: "loi" });
		};
		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			pha = "da-quyet";
			return { ok: true };
		});
		kho.ghiRieng.set("okr.troLyDeXuat", async () => {
			pha = "soan";
			return { bat: true, taskId: "t-2", dungLai: false };
		});
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"nhom kara co gop y",
		);
		await bamChuot(nut(m.de.boQua, deXuat(D_TEN.id) ?? document));
		await cho(
			() => nutCo(m.vung.docLai, nhom() ?? document) !== null,
			"nut doc lai",
		);
		await bamChuot(nut(m.vung.docLai, nhom() ?? document));
		await cho(
			() => goiCua("okr.troLyDeXuat").length === 1,
			"goi nho Kara doc lai",
		);
		await nhip(10);
		if (!nhom()?.textContent?.includes(m.vung.dangDoc))
			throw new Error("doc lai khong hien dang doc");
		pha = "loi";
		await choLau(
			() => nhom()?.textContent?.includes(m.vung.loi) === true,
			"doc lai hong khong bao loi",
		);
		expect(
			(nut(m.vung.thuLai, nhom() ?? document) as HTMLButtonElement).disabled,
		).toBe(false);
		expect(
			qs(`[data-gop-y="${D_TEN.id}"] [data-slot=proposed-change-receipt]`),
		).not.toBeNull();
	});
});

describe("dong-bo", () => {
	test("Kara doc xong trong khung thi chip danh sach va so cua Muc tieu lam moi theo so moi", async () => {
		let pha: "chua" | "soan" | "xong" = "chua";
		const so = () => (pha === "xong" ? 2 : 0);
		kho.danhSach = () => danhSachTu([mtSheet({ soGopYCho: so() })], 0);
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: so() }));
		kho.troLy = () => {
			if (pha === "chua") return dsTroLy([], { maKetThuc: null, docLuc: null });
			if (pha === "soan") {
				pha = "xong";
				return dsTroLy([], { dangSoan: true, maKetThuc: null });
			}
			return dsTroLy([D_TEN, D_KR1]);
		};
		kho.ghiRieng.set("okr.troLyDeXuat", async () => {
			pha = "soan";
			return { bat: true, taskId: "t-3", dungLai: false };
		});
		await dung(
			<>
				<TheoDonVi />
				<DetailSheet onOpenChange={() => {}} open>
					<ObjectiveSheet objectiveId={MT_ID} />
				</DetailSheet>
			</>,
		);
		await cho(() => qs("[data-nut=nho-kara]") !== null, "nut nho Kara");
		expect(chipCua(MT_ID)).toBeNull();
		await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
		await choLau(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"Kara doc xong co gop y",
			6000,
		);
		await nhip(15);
		const chip = chipCua(MT_ID);
		if (chip !== `Kara · ${m.chip("2")}`)
			throw new Error(`chip khong lam moi sau khi Kara doc xong: ${chip}`);
	}, 15000);
});
