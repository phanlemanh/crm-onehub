import { describe, expect, test } from "bun:test";
import { dongSoan as dongSoanApi } from "../../../apps/api/src/okr/okr.contracts";
import { LOAI_MUC_TIEU_NHAP, mucTieuNhap } from "../src/okr-cuoc-soan";
import { CACH_DOC, type CachDoc, cachDoc } from "../src/okr-khep";
import {
	LOAI_MUC_TIEU,
	type LoaiMucTieu,
	type TinhTrang,
	tinhTrang,
} from "../src/okr-muc-tieu";
import { dongMucTieuMoi } from "../src/okr-tro-ly";

const BA_LOAI = new Set(["cam-ket", "tham-vong", "hoc-tap"]);

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const tapCua = (xs: readonly string[]) => new Set(xs);

describe("mot-nguon", () => {
	test("LOAI_MUC_TIEU, LOAI_MUC_TIEU_NHAP va enum loaiMucTieu cua hop dong API la mot tap", () => {
		const apiMucTieuMoi = dongSoanApi.options.find(
			(o) => o.shape.loai.value === "muc-tieu-moi",
		);
		if (!apiMucTieuMoi) throw new Error("khong thay nhanh muc-tieu-moi");
		const api = apiMucTieuMoi.shape.loaiMucTieu.options;
		ghim(
			JSON.stringify([...LOAI_MUC_TIEU_NHAP].sort()) ===
				JSON.stringify([...LOAI_MUC_TIEU].sort()),
			"LOAI_MUC_TIEU_NHAP lech LOAI_MUC_TIEU",
		);
		expect({
			goc: tapCua(LOAI_MUC_TIEU),
			nhap: tapCua(LOAI_MUC_TIEU_NHAP),
			api: tapCua(api),
		}).toEqual({ goc: BA_LOAI, nhap: BA_LOAI, api: BA_LOAI });
	});
});

const KY_VONG = 50;
const MUC = [0, 0.49, 0.5, 0.69, 0.7, 0.85, 1] as const;
const BANG_TINH_TRANG: Record<
	LoaiMucTieu,
	Record<(typeof MUC)[number], TinhTrang>
> = {
	"cam-ket": {
		0: "truot",
		0.49: "truot",
		0.5: "cham-nhip",
		0.69: "cham-nhip",
		0.7: "cham-nhip",
		0.85: "dung-nhip",
		1: "dung-nhip",
	},
	"tham-vong": {
		0: "cham-nhip",
		0.49: "cham-nhip",
		0.5: "cham-nhip",
		0.69: "cham-nhip",
		0.7: "dung-nhip",
		0.85: "dung-nhip",
		1: "dung-nhip",
	},
	"hoc-tap": {
		0: "cham-nhip",
		0.49: "cham-nhip",
		0.5: "cham-nhip",
		0.69: "cham-nhip",
		0.7: "dung-nhip",
		0.85: "dung-nhip",
		1: "dung-nhip",
	},
};

describe("tinh-trang", () => {
	test("bang 3 loai x 7 muc ti le", () => {
		ghim(
			tinhTrang(0.49 * KY_VONG, KY_VONG, "hoc-tap") !== "truot",
			"hoc-tap ra truot o muc 0.49",
		);
		let soDong = 0;
		for (const loai of LOAI_MUC_TIEU)
			for (const muc of MUC) {
				const thay = tinhTrang(muc * KY_VONG, KY_VONG, loai);
				if (loai === "hoc-tap")
					ghim(thay !== "truot", `hoc-tap ra truot o muc ${muc}`);
				expect(`${loai} ${muc} -> ${thay}`).toBe(
					`${loai} ${muc} -> ${BANG_TINH_TRANG[loai][muc]}`,
				);
				soDong += 1;
			}
		expect(soDong).toBe(21);
	});

	test("hoc-tap doc nhu tham-vong o moi muc", () => {
		expect(MUC.map((m) => tinhTrang(m * KY_VONG, KY_VONG, "hoc-tap"))).toEqual(
			MUC.map((m) => tinhTrang(m * KY_VONG, KY_VONG, "tham-vong")),
		);
	});

	test("hoc-tap khong co ky vong", () => {
		expect([
			tinhTrang(20, null, "hoc-tap"),
			tinhTrang(20, 0, "hoc-tap"),
		]).toEqual(["chua-co-ky-vong", "chua-co-ky-vong"]);
	});
});

const CO_CHU = "Khách cần bản dùng thử";
const BANG_CACH_DOC: [LoaiMucTieu, number | null, string, CachDoc | null][] = [
	["hoc-tap", null, "", "chua-tra-loi"],
	["hoc-tap", null, "   ", "chua-tra-loi"],
	["hoc-tap", null, CO_CHU, "da-tra-loi"],
	["hoc-tap", 0, "", "chua-tra-loi"],
	["hoc-tap", 0, "   ", "chua-tra-loi"],
	["hoc-tap", 0, CO_CHU, "da-tra-loi"],
	["hoc-tap", 1, "", "chua-tra-loi"],
	["hoc-tap", 1, "   ", "chua-tra-loi"],
	["hoc-tap", 1, CO_CHU, "da-tra-loi"],
	["cam-ket", 0.99, CO_CHU, "chua-tron"],
	["cam-ket", 1, CO_CHU, "dat"],
	["tham-vong", 0.69, CO_CHU, "duoi-muc-tot"],
	["tham-vong", 0.7, CO_CHU, "tot"],
];

describe("cach-doc", () => {
	test("bang 13 dong", () => {
		let soDong = 0;
		for (const [loai, diem, chu, mong] of BANG_CACH_DOC) {
			const thay = cachDoc(loai, diem, chu);
			if (loai === "hoc-tap" && chu === "   ")
				ghim(thay !== "da-tra-loi", "khoang trang doc thanh da-tra-loi");
			expect(`${loai} ${diem} «${chu}» -> ${thay}`).toBe(
				`${loai} ${diem} «${chu}» -> ${mong}`,
			);
			soDong += 1;
		}
		expect(soDong).toBe(13);
	});

	test("cam-ket va tham-vong chua co diem khong co cach doc", () => {
		expect([
			cachDoc("cam-ket", null, CO_CHU),
			cachDoc("tham-vong", null, CO_CHU),
		]).toEqual([null, null]);
	});

	test("tap CACH_DOC du sau gia tri", () => {
		expect(new Set(CACH_DOC)).toEqual(
			new Set([
				"tot",
				"duoi-muc-tot",
				"dat",
				"chua-tron",
				"da-tra-loi",
				"chua-tra-loi",
			]),
		);
	});
});

describe("soan-nhan", () => {
	test("luoc do soan OKR nhan hoc-tap, tu choi ma sai", () => {
		const nhan = dongMucTieuMoi.shape.loaiMucTieu.safeParse("hoc-tap");
		const nhanNhap = mucTieuNhap.shape.loai.safeParse("hoc-tap");
		ghim(nhan.success && nhanNhap.success, "soan OKR tu choi hoc-tap");
		const sai = dongMucTieuMoi.shape.loaiMucTieu.safeParse("hoc tap");
		expect({
			nhan: nhan.success,
			nhanNhap: nhanNhap.success,
			sai: sai.success,
		}).toEqual({
			nhan: true,
			nhanNhap: true,
			sai: false,
		});
	});
});
