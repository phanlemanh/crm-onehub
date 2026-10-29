import { describe, expect, test } from "bun:test";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { mineOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	CuaToi,
	cho,
	daBoTu,
	danhSachTu,
	daTaiXong,
	datDuong,
	dung,
	KhoiMucTieu,
	kho,
	mucTieu,
	okrMessages,
	TheoDonVi,
} from "./okr-don-san";

const m = okrMessages("vi");

const nhom = () =>
	document.body.querySelector<HTMLElement>("[data-nhom-da-bo]");
const nutNhom = () =>
	nhom()?.querySelector<HTMLButtonElement>("button") ?? null;
const hangChinh = () =>
	[
		...document.body.querySelectorAll<HTMLElement>("[data-hang-muc-tieu]"),
	].filter((h) => h.closest("[data-nhom-da-bo]") === null);
const hangDaBo = () => [
	...document.body.querySelectorAll<HTMLElement>(
		"[data-nhom-da-bo] [data-hang-muc-tieu]",
	),
];

function anhNhom() {
	return {
		chinh: hangChinh().map((h) => h.getAttribute("data-hang-muc-tieu")),
		chinhCoDaBo: hangChinh().filter((h) => h.hasAttribute("data-da-bo")).length,
		coNhom: nhom() !== null,
		chuNhom: nutNhom()?.textContent?.trim() ?? null,
		moNhom: nutNhom()?.getAttribute("aria-expanded") ?? null,
		daBoHien: hangDaBo().filter((h) => h.hasAttribute("data-da-bo")).length,
	};
}

const nutDaBo = () =>
	document.body.querySelector<HTMLButtonElement>("[data-nut-da-bo]");

function anhNut() {
	return {
		chinh: hangChinh().map((h) => h.getAttribute("data-hang-muc-tieu")),
		chinhCoDaBo: hangChinh().filter((h) => h.hasAttribute("data-da-bo")).length,
		coNut: nutDaBo() !== null,
		chuNut: nutDaBo()?.textContent?.trim() ?? null,
		bat: nutDaBo()?.getAttribute("aria-pressed") ?? null,
	};
}

async function dungDonVi(thamSo = "", locale: "vi" | "en" = "vi") {
	datDuong("/ws/okr/theo-don-vi");
	await dung(<TheoDonVi />, thamSo, locale);
	await cho(daTaiXong, "theo don vi tai xong");
}

const HAI = () => [mucTieu("a1"), mucTieu("a2")];

describe("theo-don-vi", () => {
	test("theo-don-vi (a): 2 dang dung + 3 da bo — danh sach chinh 2, nut Da bo (3) tat, dem dau the 2, bat len thay 3", async () => {
		kho.danhSach = danhSachTu(HAI(), [
			daBoTu("d1"),
			daBoTu("d2"),
			daBoTu("d3"),
		]);
		await dungDonVi();
		const truoc = anhNut();
		const dauThe =
			document.body.textContent?.includes(m.demDonVi(2, 4)) ?? false;
		const nut = nutDaBo();
		if (!nut) throw new Error("khong thay nut Da bo");
		await bamChuot(nut);
		await cho(() => anhNut().chinhCoDaBo === 3, "bat nut Da bo");
		expect({ truoc, dauThe, sau: anhNut() }).toEqual({
			truoc: {
				chinh: ["a1", "a2"],
				chinhCoDaBo: 0,
				coNut: true,
				chuNut: "Đã bỏ (3)",
				bat: "false",
			},
			dauThe: true,
			sau: {
				chinh: ["d1", "d2", "d3"],
				chinhCoDaBo: 3,
				coNut: true,
				chuNut: "Đã bỏ (3)",
				bat: "true",
			},
		});
	});

	test("theo-don-vi (b): 2 dang dung + 0 da bo — khong co nut Da bo", async () => {
		kho.danhSach = danhSachTu(HAI(), []);
		await dungDonVi();
		expect({ coNut: anhNut().coNut, coNhom: anhNhom().coNhom }).toEqual({
			coNut: false,
			coNhom: false,
		});
	});

	test("theo-don-vi (b'): loc phu trach dang bat, khong muc tieu da bo nao khop — khong co nut Da bo", async () => {
		kho.danhSach = danhSachTu([mucTieu("a1")], []);
		await dungDonVi("?phuTrachOkr=hung");
		expect({ coNut: anhNut().coNut, chinh: anhNut().chinh }).toEqual({
			coNut: false,
			chinh: ["a1"],
		});
	});

	test("theo-don-vi (c): 0 dang dung + 2 da bo — trang thai rong cua don vi va nut Da bo (2)", async () => {
		kho.danhSach = danhSachTu([], [daBoTu("d1"), daBoTu("d2")]);
		await dungDonVi();
		expect({
			rong:
				document.body.querySelector("[data-trang-thai='ST-donvi-rong']") !==
				null,
			danhSach:
				document.body.querySelector("[data-trang-thai='ST-donvi-danhsach']") !==
				null,
			chuNut: anhNut().chuNut,
		}).toEqual({ rong: true, danhSach: false, chuNut: "Đã bỏ (2)" });
	});

	test("theo-don-vi (d): loc trang thai Da bo — khong nut Da bo, danh sach chinh la muc tieu da bo", async () => {
		kho.danhSach = danhSachTu([daBoTu("d1"), daBoTu("d2")], []);
		await dungDonVi("?trangThaiOkr=da-bo");
		expect({
			coNut: anhNut().coNut,
			chinh: anhNut().chinh,
			chinhCoDaBo: anhNut().chinhCoDaBo,
		}).toEqual({ coNut: false, chinh: ["d1", "d2"], chinhCoDaBo: 2 });
	});

	test("theo-don-vi (en): chu nut Da bo tieng Anh khac tieng Viet", async () => {
		kho.danhSach = danhSachTu(HAI(), [
			daBoTu("d1"),
			daBoTu("d2"),
			daBoTu("d3"),
		]);
		await dungDonVi("", "en");
		const enBo = okrVoKhuMessages("en").boOkr;
		const viBo = okrVoKhuMessages("vi").boOkr;
		expect({
			chu: anhNut().chuNut,
			khac: enBo.daBo(3) !== viBo.daBo(3),
		}).toEqual({ chu: enBo.daBo(3), khac: true });
	});
});

async function dungCuaToi() {
	datDuong("/ws/okr");
	await dung(<CuaToi />);
	await cho(daTaiXong, "cua toi tai xong");
	const thamGia = document.body.querySelector<HTMLButtonElement>(
		'[data-nhom="tham-gia"] button[aria-expanded="false"]',
	);
	if (thamGia) await bamChuot(thamGia);
}

describe("cua-toi", () => {
	test("cua-toi (a): 1 dang dung + 2 da bo — danh sach chinh 1, dong gap dong Da bo (2), mo ra thay 2", async () => {
		kho.mine = mineOutput.parse({
			dangTheoDoi: [],
			objectives: [mucTieu("a1")],
			daBo: [daBoTu("d1"), daBoTu("d2")],
		});
		await dungCuaToi();
		const truoc = anhNhom();
		const nut = nutNhom();
		if (!nut) throw new Error("khong thay dong gap");
		await bamChuot(nut);
		await cho(() => hangDaBo().length === 2, "mo dong gap cua toi");
		expect({ truoc, sau: anhNhom().daBoHien }).toEqual({
			truoc: {
				chinh: ["a1"],
				chinhCoDaBo: 0,
				coNhom: true,
				chuNhom: "Đã bỏ (2)",
				moNhom: "false",
				daBoHien: 0,
			},
			sau: 2,
		});
	});

	test("cua-toi (b): 0 dang dung + 1 da bo — trang thai rong va dong gap Da bo (1)", async () => {
		kho.mine = mineOutput.parse({
			dangTheoDoi: [],
			objectives: [],
			daBo: [daBoTu("d1")],
		});
		await dungCuaToi();
		expect({
			rong:
				document.body.querySelector("[data-trang-thai='ST-cuatoi-rong']") !==
				null,
			chuNhom: anhNhom().chuNhom,
		}).toEqual({ rong: true, chuNhom: "Đã bỏ (1)" });
	});

	test("cua-toi (c): khong muc tieu da bo — khong co dong gap", async () => {
		kho.mine = mineOutput.parse({
			dangTheoDoi: [],
			objectives: [mucTieu("a1")],
			daBo: [],
		});
		await dungCuaToi();
		expect(anhNhom().coNhom).toBe(false);
	});
});

describe("nhin-khac", () => {
	test("nhin-khac: khoi da bo va khoi nhap — nhan khac bien the, da bo khong thanh tien do, co chu Da bo", async () => {
		await dung(
			<div>
				<KhoiMucTieu
					danhDauCuaToi={false}
					hienDonVi={false}
					mucTieu={mucTieu("n1", { status: "nhap", publishedAt: null })}
				/>
				<KhoiMucTieu
					danhDauCuaToi={false}
					hienDonVi={false}
					mucTieu={daBoTu("d1")}
				/>
			</div>,
		);
		await cho(
			() => document.body.querySelector("[data-muc-tieu='d1']") !== null,
			"ve khoi",
		);
		const anh = (id: string) => {
			const k = document.body.querySelector<HTMLElement>(
				`[data-muc-tieu='${id}']`,
			);
			const hang = k?.querySelector<HTMLElement>("[data-hang-muc-tieu]");
			const nhan = [
				...(hang?.querySelectorAll<HTMLElement>("[data-slot='badge']") ?? []),
			].find(
				(b) => b.textContent === m.trangThai[id === "d1" ? "da-bo" : "nhap"],
			);
			return {
				bienThe: nhan?.getAttribute("data-variant") ?? null,
				daBo: hang?.hasAttribute("data-da-bo") ?? false,
				tienDo: (k?.querySelectorAll("[role='progressbar']").length ?? 0) > 0,
				chuDaBo: hang?.textContent?.includes("Đã bỏ") ?? false,
			};
		};
		const nhap = anh("n1");
		const daBo = anh("d1");
		console.log(
			`nhin-khac: nhap ${JSON.stringify(nhap)}; da bo ${JSON.stringify(daBo)}`,
		);
		expect(
			nhap.bienThe === daBo.bienThe,
			"nhan nhap va da bo cung bien the",
		).toBe(false);
		expect({ nhap, daBo }).toEqual({
			nhap: { bienThe: "outline", daBo: false, tienDo: true, chuDaBo: false },
			daBo: { bienThe: "ghost", daBo: true, tienDo: false, chuDaBo: true },
		});
	});
});
