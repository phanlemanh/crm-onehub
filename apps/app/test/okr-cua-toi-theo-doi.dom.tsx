import { describe, expect, test } from "bun:test";
import { mineOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	CuaToi,
	cho,
	daBoTu,
	daTaiXong,
	datDuong,
	dung,
	kho,
	mucTieu,
	okrMessages,
} from "./okr-don-san";

const en = okrMessages("en");

const nhomTheoDoi = () =>
	document.body.querySelector<HTMLElement>("[data-nhom-dang-theo-doi]");
const nhomDaBo = () =>
	document.body.querySelector<HTMLElement>("[data-nhom-da-bo]");
const nutTheoDoi = () =>
	nhomTheoDoi()?.querySelector<HTMLButtonElement>("button") ?? null;
const hangChinh = () =>
	[...document.body.querySelectorAll<HTMLElement>("[data-hang-muc-tieu]")]
		.filter(
			(h) =>
				h.closest("[data-nhom-dang-theo-doi]") === null &&
				h.closest("[data-nhom-da-bo]") === null,
		)
		.map((h) => h.getAttribute("data-hang-muc-tieu"));
const hangTheoDoi = () =>
	[
		...document.body.querySelectorAll<HTMLElement>(
			"[data-nhom-dang-theo-doi] [data-hang-muc-tieu]",
		),
	].map((h) => h.getAttribute("data-hang-muc-tieu"));

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function dungCuaToi(locale: "vi" | "en" = "vi") {
	datDuong("/ws/okr");
	await dung(<CuaToi />, "", locale);
	await cho(daTaiXong, "cua toi tai xong");
	const thamGia = document.body.querySelector<HTMLButtonElement>(
		'[data-nhom="tham-gia"] button[aria-expanded="false"]',
	);
	if (thamGia) await bamChuot(thamGia);
}

const datMine = (v: {
	objectives: ReturnType<typeof mucTieu>[];
	daBo: ReturnType<typeof daBoTu>[];
	dangTheoDoi: ReturnType<typeof mucTieu>[];
}) => {
	kho.mine = mineOutput.parse(v);
};

describe("cua-toi-theo-doi", () => {
	test("(a) co/co: bang chinh chi cua toi, nhom Dang theo doi (2) dong san, dung truoc Da bo, mo ra dung hai id", async () => {
		datMine({
			objectives: [mucTieu("a1")],
			daBo: [daBoTu("d1")],
			dangTheoDoi: [mucTieu("t1"), mucTieu("t2")],
		});
		await dungCuaToi();
		const nhom = nhomTheoDoi();
		const bo = nhomDaBo();
		ghim(nhom !== null, "khong co nhom dang theo doi");
		const nut = nutTheoDoi();
		if (!nut || !nhom || !bo) throw new Error("thieu nhom hoac nut");
		const truoc = {
			chinh: hangChinh(),
			chu: nut.textContent?.trim() ?? null,
			mo: nut.getAttribute("aria-expanded"),
			truocDaBo:
				(nhom.compareDocumentPosition(bo) &
					Node.DOCUMENT_POSITION_FOLLOWING) !==
				0,
		};
		await bamChuot(nut);
		await cho(() => hangTheoDoi().length === 2, "mo nhom theo doi");
		expect({
			truoc,
			sau: { mo: nut.getAttribute("aria-expanded"), hang: hangTheoDoi() },
		}).toEqual({
			truoc: {
				chinh: ["a1"],
				chu: "Đang theo dõi (2)",
				mo: "false",
				truocDaBo: true,
			},
			sau: { mo: "true", hang: ["t1", "t2"] },
		});
	});

	test("(b) rong/co: trang thai rong van hien va nhom Dang theo doi (1) ngay sau no", async () => {
		datMine({ objectives: [], daBo: [], dangTheoDoi: [mucTieu("t1")] });
		await dungCuaToi();
		const rong = document.body.querySelector(
			"[data-trang-thai='ST-cuatoi-rong']",
		);
		const nhom = nhomTheoDoi();
		ghim(
			rong !== null && nhom !== null,
			"ST-cuatoi-rong khong co nhom theo doi",
		);
		expect({
			keSau: nhom?.previousElementSibling === rong,
			chu: nutTheoDoi()?.textContent?.trim() ?? null,
		}).toEqual({ keSau: true, chu: "Đang theo dõi (1)" });
	});

	test("(c) co/rong: khong co nhom Dang theo doi", async () => {
		datMine({ objectives: [mucTieu("a1")], daBo: [], dangTheoDoi: [] });
		await dungCuaToi();
		expect({
			nhom: nhomTheoDoi() !== null,
			chu: document.body.textContent?.includes("Đang theo dõi (") ?? false,
		}).toEqual({ nhom: false, chu: false });
	});

	test("(d) rong/rong: khong co nhom Dang theo doi", async () => {
		datMine({ objectives: [], daBo: [], dangTheoDoi: [] });
		await dungCuaToi();
		expect({
			nhom: nhomTheoDoi() !== null,
			chu: document.body.textContent?.includes("Đang theo dõi (") ?? false,
			rong:
				document.body.querySelector("[data-trang-thai='ST-cuatoi-rong']") !==
				null,
		}).toEqual({ nhom: false, chu: false, rong: true });
	});

	test("(e) en: nhan nhom la Following (2)", async () => {
		datMine({
			objectives: [mucTieu("a1")],
			daBo: [],
			dangTheoDoi: [mucTieu("t1"), mucTieu("t2")],
		});
		await dungCuaToi("en");
		expect(nutTheoDoi()?.textContent?.trim() ?? null).toBe(
			en.khoiMucTieu.nhomDangTheoDoi(2),
		);
		expect(en.khoiMucTieu.nhomDangTheoDoi(2)).toBe("Following (2)");
	});
});
