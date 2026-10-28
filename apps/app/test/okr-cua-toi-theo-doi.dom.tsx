import { describe, expect, test } from "bun:test";
import { mineOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	CuaToi,
	cho,
	type daBoTu,
	daTaiXong,
	datDuong,
	dung,
	kho,
	mucTieu,
} from "./okr-don-san";

const nhomTheoDoi = () =>
	document.body.querySelector<HTMLElement>("[data-nhom-dang-theo-doi]");

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
});
