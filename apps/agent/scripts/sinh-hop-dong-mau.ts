import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import {
	TEP_DAP_AN_HOP_DONG_MAU,
	THU_MUC_HOP_DONG_MAU,
} from "@crm/db/hop-dong-mau";
import {
	type DongDapAnHopDongMau,
	docDapAnHopDongMau,
	NHAN_HOP_DONG_MAU,
} from "@crm/validation/hop-dong-mau";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { zipLuu } from "../../api/test/tai-lieu-nguon-mau.ts";

const BO_DUNG = {
	phong:
		process.env.PHONG_HOP_DONG_MAU ??
		"/System/Library/Fonts/Supplemental/Arial.ttf",
	ngayTao: new Date("2026-10-22T00:00:00.000Z"),
	nguoiTao: "OneHub — bộ hợp đồng mẫu",
	trang: { rong: 595, cao: 842, le: 56, dongDau: 780, cachDong: 22, coChu: 11 },
	quet: { rong: 680, cao: 300, diem: 3, le: 24, cachDong: 36 },
} as const;

const NS =
	'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const MA_HOA = new TextEncoder();

type DongMau = Omit<DongDapAnHopDongMau, "sha256">;

type NoiDung =
	| { kieu: "pdf"; dong: string[] }
	| { kieu: "docx"; dong: string[] }
	| { kieu: "quet"; dong: string[] };

const BEN_A =
	"Bên A: Công ty Đối tác Mẫu A · mẫu, đại diện: Ông Nguyễn Văn Mẫu";
const BEN_B = "Bên B: Công ty OneHub Mẫu · mẫu, đại diện: Bà Trần Thị Mẫu";

const BO: { mau: DongMau; noiDung: NoiDung }[] = [
	{
		mau: {
			ma: "HD1",
			tenTep: "MAU-HD1-hop-dong-hop-tac.pdf",
			kieu: "pdf",
			thoaThuan: "HĐ mẫu HD1 · mẫu",
			coChu: true,
			ngayKy: "2026-03-05",
			ngayHetHan: "2027-03-04",
			giaTri: 1_250_000_000,
			doan: {
				ngayKy: "ngày 05 tháng 03 năm 2026",
				ngayHetHan: "04/03/2027",
				giaTri: "1.250.000.000 đồng",
			},
		},
		noiDung: {
			kieu: "pdf",
			dong: [
				NHAN_HOP_DONG_MAU.dongDau,
				"HỢP ĐỒNG HỢP TÁC KINH DOANH",
				"Số: 01/2026/HĐHT-MAU",
				"Hôm nay, ngày 05 tháng 03 năm 2026, tại Thành phố Hồ Chí Minh, chúng tôi gồm:",
				BEN_A,
				BEN_B,
				"Điều 1. Bên A giới thiệu khách hàng mua căn hộ cho Bên B trên nền tảng OneHub.",
				"Điều 2. Tổng giá trị hợp đồng: 1.250.000.000 đồng.",
				"Điều 3. Hợp đồng có hiệu lực từ ngày ký đến hết ngày 04/03/2027.",
				"Điều 4. Hai bên thanh toán hoa hồng theo tháng, trước ngày 15 hằng tháng.",
				"Đại diện Bên A                         Đại diện Bên B",
			],
		},
	},
	{
		mau: {
			ma: "HD2",
			tenTep: "MAU-HD2-hop-dong-gioi-thieu.pdf",
			kieu: "pdf",
			thoaThuan: "HĐ mẫu HD2 · mẫu",
			coChu: true,
			ngayKy: "2026-04-12",
			ngayHetHan: "2027-04-11",
			giaTri: 860_000_000,
			doan: {
				ngayKy: "12/04/2026",
				ngayHetHan: "có hiệu lực 12 tháng kể từ ngày ký",
				giaTri: "860.000.000 đồng",
			},
			suyTu: "ngày ký + 12 tháng − 1 ngày",
		},
		noiDung: {
			kieu: "pdf",
			dong: [
				NHAN_HOP_DONG_MAU.dongDau,
				"HỢP ĐỒNG GIỚI THIỆU KHÁCH HÀNG",
				"Số: 02/2026/HĐGT-MAU",
				"Ngày ký: 12/04/2026",
				BEN_A,
				BEN_B,
				"Điều 1. Bên A giới thiệu nhà đầu tư cho dự án do Bên B phân phối.",
				"Điều 2. Giá trị dự kiến của hợp đồng: 860.000.000 đồng.",
				"Điều 3. Hợp đồng này có hiệu lực 12 tháng kể từ ngày ký.",
				"Đại diện Bên A                         Đại diện Bên B",
			],
		},
	},
	{
		mau: {
			ma: "HD3",
			tenTep: "MAU-HD3-hop-dong-dai-ly.docx",
			kieu: "docx",
			thoaThuan: "HĐ mẫu HD3 · mẫu",
			coChu: true,
			ngayKy: "2026-06-20",
			ngayHetHan: "2028-06-19",
			giaTri: 2_300_000_000,
			doan: {
				ngayKy: "ngày 20 tháng 06 năm 2026",
				ngayHetHan: "19/06/2028",
				giaTri: "Hai tỷ ba trăm triệu đồng (2.300.000.000 đồng)",
			},
		},
		noiDung: {
			kieu: "docx",
			dong: [
				NHAN_HOP_DONG_MAU.dongDau,
				"HỢP ĐỒNG ĐẠI LÝ PHÂN PHỐI",
				"Số: 03/2026/HĐĐL-MAU",
				"Hợp đồng được ký vào ngày 20 tháng 06 năm 2026 giữa:",
				BEN_A,
				BEN_B,
				"Điều 1. Bên A làm đại lý phân phối căn hộ cho Bên B tại khu vực phía Nam.",
				"Điều 2. Giá trị hợp đồng: Hai tỷ ba trăm triệu đồng (2.300.000.000 đồng).",
				"Điều 3. Thời hạn hợp đồng đến hết ngày 19/06/2028.",
			],
		},
	},
	{
		mau: {
			ma: "HD4",
			tenTep: "MAU-HD4-hop-dong-dich-vu.docx",
			kieu: "docx",
			thoaThuan: "HĐ mẫu HD4 · mẫu",
			coChu: true,
			ngayKy: "2026-07-15",
			ngayHetHan: "2026-12-31",
			giaTri: null,
			doan: { ngayKy: "15/07/2026", ngayHetHan: "31/12/2026" },
		},
		noiDung: {
			kieu: "docx",
			dong: [
				NHAN_HOP_DONG_MAU.dongDau,
				"HỢP ĐỒNG DỊCH VỤ TƯ VẤN",
				"Số: 04/2026/HĐDV-MAU",
				"Ngày ký: 15/07/2026",
				BEN_A,
				BEN_B,
				"Điều 1. Bên A tư vấn chính sách bán hàng cho Bên B.",
				"Điều 2. Phí dịch vụ tính theo từng đợt, hai bên thống nhất bằng phụ lục riêng.",
				"Điều 3. Hợp đồng có hiệu lực đến ngày 31/12/2026.",
			],
		},
	},
	{
		mau: {
			ma: "HD5",
			tenTep: "MAU-HD5-ban-quet.pdf",
			kieu: "pdf",
			thoaThuan: "HĐ mẫu HD5 · mẫu",
			coChu: false,
			ngayKy: "2026-08-01",
			ngayHetHan: "2027-07-31",
			giaTri: 480_000_000,
			doan: {},
		},
		noiDung: {
			kieu: "quet",
			dong: [
				"BAN MAU - KHONG PHAI HOP DONG THAT",
				"HOP DONG HOP TAC SO 05/2026",
				"NGAY KY: 01/08/2026",
				"HET HAN: 31/07/2027",
				"GIA TRI: 480.000.000 DONG",
			],
		},
	},
	{
		mau: {
			ma: "HD6",
			tenTep: "MAU-HD6-phu-luc-HD1.pdf",
			kieu: "pdf",
			thoaThuan: "HĐ mẫu HD6 · mẫu",
			coChu: true,
			ngayKy: "2026-09-10",
			ngayHetHan: null,
			giaTri: 1_400_000_000,
			doan: { ngayKy: "10/09/2026", giaTri: "1.400.000.000 đồng" },
		},
		noiDung: {
			kieu: "pdf",
			dong: [
				NHAN_HOP_DONG_MAU.dongDau,
				"PHỤ LỤC 01 ĐIỀU CHỈNH GIÁ TRỊ",
				"Phụ lục của hợp đồng số 01/2026/HĐHT-MAU ký ngày 05/03/2026.",
				"Ngày ký phụ lục: 10/09/2026",
				BEN_A,
				BEN_B,
				"Điều 1. Giá trị hợp đồng sau điều chỉnh là 1.400.000.000 đồng, thay cho giá trị cũ.",
				"Điều 2. Phụ lục là bộ phận không tách rời của hợp đồng gốc.",
				"Đại diện Bên A                         Đại diện Bên B",
			],
		},
	},
];

async function pdfChu(dong: string[]): Promise<Uint8Array> {
	const pdf = await PDFDocument.create({ updateMetadata: false });
	pdf.registerFontkit(fontkit);
	const font = await pdf.embedFont(readFileSync(BO_DUNG.phong), {
		subset: true,
	});
	const t = BO_DUNG.trang;
	const p = pdf.addPage([t.rong, t.cao]);
	dong.forEach((c, i) => {
		p.drawText(c, {
			x: t.le,
			y: t.dongDau - i * t.cachDong,
			size: t.coChu,
			font,
		});
	});
	ganSieuDuLieu(pdf);
	return pdf.save();
}

function ganSieuDuLieu(pdf: PDFDocument): void {
	pdf.setTitle(NHAN_HOP_DONG_MAU.sieuDuLieu);
	pdf.setSubject(NHAN_HOP_DONG_MAU.sieuDuLieu);
	pdf.setCreator(BO_DUNG.nguoiTao);
	pdf.setProducer(BO_DUNG.nguoiTao);
	pdf.setCreationDate(BO_DUNG.ngayTao);
	pdf.setModificationDate(BO_DUNG.ngayTao);
}

function xmlAnToan(chu: string): string {
	return chu.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function docx(dong: string[]): Uint8Array {
	const than = dong
		.map(
			(c) =>
				`<w:p><w:r><w:t xml:space="preserve">${xmlAnToan(c)}</w:t></w:r></w:p>`,
		)
		.join("");
	const nhan = xmlAnToan(NHAN_HOP_DONG_MAU.sieuDuLieu);
	return zipLuu([
		[
			"[Content_Types].xml",
			'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>',
		],
		[
			"_rels/.rels",
			'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>',
		],
		[
			"docProps/core.xml",
			`<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${nhan}</dc:title><dc:subject>${nhan}</dc:subject><dc:creator>${xmlAnToan(BO_DUNG.nguoiTao)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${BO_DUNG.ngayTao.toISOString()}</dcterms:created></cp:coreProperties>`,
		],
		[
			"word/document.xml",
			`<?xml version="1.0" encoding="UTF-8"?><w:document ${NS}><w:body>${than}</w:body></w:document>`,
		],
	]);
}

const PHONG_DIEM = new Map(
	Object.entries({
		A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
		B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
		C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
		D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
		E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
		G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
		H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
		I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
		K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
		M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
		N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
		O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
		P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
		R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
		S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
		T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
		U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
		Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
		"0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
		"1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
		"2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
		"3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
		"4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
		"5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
		"6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
		"7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
		"8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
		"9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
		"/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
		".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
		":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
		"-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
		" ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
	}),
);

function crc32(byte: Uint8Array): number {
	let crc = 0xffffffff;
	for (const b of byte) {
		crc ^= b;
		for (let k = 0; k < 8; k += 1) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function khoiPng(loai: string, du: Uint8Array): Uint8Array {
	const ten = MA_HOA.encode(loai);
	const dai = new Uint8Array(4);
	new DataView(dai.buffer).setUint32(0, du.length);
	const crc = new Uint8Array(4);
	new DataView(crc.buffer).setUint32(0, crc32(new Uint8Array([...ten, ...du])));
	return new Uint8Array([...dai, ...ten, ...du, ...crc]);
}

function anhQuet(dong: string[]): Uint8Array {
	const q = BO_DUNG.quet;
	const diem = new Uint8Array(q.rong * q.cao);
	for (let y = 0; y < q.cao; y += 1) {
		for (let x = 0; x < q.rong; x += 1) {
			diem[y * q.rong + x] = 225 + ((x * 13 + y * 7) % 23);
		}
	}
	dong.forEach((c, i) => {
		[...c].forEach((kyTu, j) => {
			const mau = PHONG_DIEM.get(kyTu);
			if (!mau) throw new Error(`phông điểm thiếu ký tự «${kyTu}»`);
			mau.forEach((hang, hy) => {
				[...hang].forEach((bit, hx) => {
					if (bit !== "1") return;
					for (let dy = 0; dy < q.diem; dy += 1) {
						for (let dx = 0; dx < q.diem; dx += 1) {
							const x = q.le + (j * 6 + hx) * q.diem + dx;
							const y = q.le + i * q.cachDong + hy * q.diem + dy;
							if (x < q.rong && y < q.cao) diem[y * q.rong + x] = 30;
						}
					}
				});
			});
		});
	});
	const ihdr = new Uint8Array(13);
	const v = new DataView(ihdr.buffer);
	v.setUint32(0, q.rong);
	v.setUint32(4, q.cao);
	ihdr.set([8, 0, 0, 0, 0], 8);
	const tho = new Uint8Array(q.cao * (q.rong + 1));
	for (let y = 0; y < q.cao; y += 1) {
		tho.set(diem.subarray(y * q.rong, (y + 1) * q.rong), y * (q.rong + 1) + 1);
	}
	return new Uint8Array([
		0x89,
		0x50,
		0x4e,
		0x47,
		0x0d,
		0x0a,
		0x1a,
		0x0a,
		...khoiPng("IHDR", ihdr),
		...khoiPng("IDAT", new Uint8Array(deflateSync(tho, { level: 9 }))),
		...khoiPng("IEND", new Uint8Array()),
	]);
}

async function pdfQuet(dong: string[]): Promise<Uint8Array> {
	const pdf = await PDFDocument.create({ updateMetadata: false });
	const anh = await pdf.embedPng(anhQuet(dong));
	const t = BO_DUNG.trang;
	const p = pdf.addPage([t.rong, t.cao]);
	p.drawRectangle({
		x: 0,
		y: 0,
		width: t.rong,
		height: t.cao,
		color: rgb(1, 1, 1),
	});
	const rong = t.rong - 2 * t.le;
	const cao = (rong * BO_DUNG.quet.cao) / BO_DUNG.quet.rong;
	p.drawImage(anh, {
		x: t.le,
		y: t.cao - t.le - cao,
		width: rong,
		height: cao,
	});
	ganSieuDuLieu(pdf);
	return pdf.save();
}

async function dungByte(nd: NoiDung): Promise<Uint8Array> {
	if (nd.kieu === "docx") return docx(nd.dong);
	if (nd.kieu === "quet") return pdfQuet(nd.dong);
	return pdfChu(nd.dong);
}

const thuMuc = process.argv[2] ?? THU_MUC_HOP_DONG_MAU;
const dapAn: DongDapAnHopDongMau[] = [];
for (const { mau, noiDung } of BO) {
	const byte = await dungByte(noiDung);
	writeFileSync(join(thuMuc, mau.tenTep), byte);
	dapAn.push({
		...mau,
		sha256: createHash("sha256").update(byte).digest("hex"),
	});
}
const chu = `${JSON.stringify(dapAn, null, "\t")}\n`;
docDapAnHopDongMau(chu);
writeFileSync(join(thuMuc, TEP_DAP_AN_HOP_DONG_MAU), chu);
console.log(`Đã dựng ${dapAn.length} tệp mẫu ở ${thuMuc}`);
