import { describe, expect, it } from "bun:test";
import { kieuTheoTen, nhanKieuTep } from "../src/kieu-tep";

const byte = (...so: number[]) => new Uint8Array(so);
const chu = (s: string) => new TextEncoder().encode(s);

function noi(...phan: Uint8Array[]): Uint8Array {
	const dai = phan.reduce((tong, p) => tong + p.length, 0);
	const ket = new Uint8Array(dai);
	let viTri = 0;
	for (const p of phan) {
		ket.set(p, viTri);
		viTri += p.length;
	}
	return ket;
}

const ZIP = byte(0x50, 0x4b, 0x03, 0x04);

const BANG = [
	{ o: "pdf", vao: noi(chu("%PDF-1.4\n"), chu("x")), ra: { kieu: "pdf" } },
	{
		o: "png",
		vao: byte(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0),
		ra: { kieu: "png" },
	},
	{ o: "jpeg", vao: byte(0xff, 0xd8, 0xff, 0xe0, 0), ra: { kieu: "jpeg" } },
	{
		o: "docx",
		vao: noi(ZIP, chu("....word/document.xml....")),
		ra: { kieu: "docx" },
	},
	{
		o: "docx macro",
		vao: noi(ZIP, chu("word/document.xml..word/vbaProject.bin")),
		ra: { loi: "macro" },
	},
	{ o: "zip khong phai docx", vao: noi(ZIP, chu("xl/workbook.xml")), ra: { loi: "khong-nhan" } },
	{ o: "rac", vao: chu("khong phai tep"), ra: { loi: "khong-nhan" } },
	{ o: "rong", vao: byte(), ra: { loi: "khong-nhan" } },
	{ o: "png cat ngan", vao: byte(0x89, 0x50, 0x4e), ra: { loi: "khong-nhan" } },
] as const;

describe("ttp-kieu-tep", () => {
	it("ttp-kieu-tep: nhận kiểu theo byte, 9 ô viết trước", () => {
		let so = 0;
		for (const o of BANG) {
			const ra = nhanKieuTep(o.vao);
			if (JSON.stringify(ra) !== JSON.stringify(o.ra)) {
				throw new Error(`ttp kieu tep: ${o.o} ra ${JSON.stringify(ra)}`);
			}
			so += 1;
		}
		expect(so).toBe(9);
	});

	it("ttp-kieu-tep: kiểu theo tên chỉ dùng để kiểm sớm, không thay kiểu theo byte", () => {
		expect(kieuTheoTen("Hợp đồng.PDF")).toBe("pdf");
		expect(kieuTheoTen("anh.jpg")).toBe("jpeg");
		expect(kieuTheoTen("anh.jpeg")).toBe("jpeg");
		expect(kieuTheoTen("bang.xlsx")).toBeNull();
		expect(nhanKieuTep(chu("%PDF-1.7")).valueOf()).toEqual({ kieu: "pdf" });
	});
});
