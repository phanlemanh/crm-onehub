import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";
import { zipLuu } from "../../api/test/tai-lieu-nguon-mau.ts";

const THU_MUC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"_acceptance",
	"may-soan-de-xuat",
	"mau",
);
const FONT = "/System/Library/Fonts/Supplemental/Arial.ttf";
const MA_HOA = new TextEncoder();

const NS =
	'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

function doan(chu: string, kieu?: string): string {
	const pPr = kieu ? `<w:pPr><w:pStyle w:val="${kieu}"/></w:pPr>` : "";
	return `<w:p>${pPr}<w:r><w:t xml:space="preserve">${chu}</w:t></w:r></w:p>`;
}

function bang(hang: string[][]): string {
	const dong = hang
		.map(
			(h) =>
				`<w:tr>${h.map((o) => `<w:tc><w:p><w:r><w:t>${o}</w:t></w:r></w:p></w:tc>`).join("")}</w:tr>`,
		)
		.join("");
	return `<w:tbl>${dong}</w:tbl>`;
}

function docx(than: string): Uint8Array {
	return zipLuu([
		[
			"[Content_Types].xml",
			'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
		],
		[
			"_rels/.rels",
			'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
		],
		[
			"word/document.xml",
			`<?xml version="1.0" encoding="UTF-8"?><w:document ${NS}><w:body>${than}</w:body></w:document>`,
		],
	]);
}

function quyetDinh(): Uint8Array {
	return docx(
		[
			doan("QUYẾT ĐỊNH VỀ HOA HỒNG CÔNG TY ĐỐI TÁC", "Heading1"),
			doan(
				"Điều 2. Kể từ ngày 01/10/2026, mức hoa hồng áp dụng cho công ty đối tác tầng hai là 1,5% và tầng ba là 1,8% giá trị giao dịch đã xác nhận.",
			),
			doan("Đối tượng áp dụng: các công ty đối tác đã ký hợp đồng khung."),
			bang([
				["Tầng", "Mức hoa hồng"],
				["Tầng hai", "1,5%"],
				["Tầng ba", "1,8%"],
			]),
		].join(""),
	);
}

function theoDoi(): Uint8Array {
	return docx(
		`<w:p><w:r><w:t xml:space="preserve">Mức hoa hồng tầng ba là </w:t></w:r><w:del w:id="1" w:author="Hà"><w:r><w:delText>1,6%</w:delText></w:r></w:del><w:ins w:id="2" w:author="Hà"><w:r><w:t>1,8%</w:t></w:r></w:ins><w:r><w:t xml:space="preserve"> kể từ quý IV.</w:t></w:r></w:p>`,
	);
}

function hong(): Uint8Array {
	const du = quyetDinh();
	return du.slice(0, Math.floor(du.length / 2));
}

async function quyTrinh(): Promise<Uint8Array> {
	const pdf = await PDFDocument.create();
	pdf.registerFontkit(fontkit);
	const font = await pdf.embedFont(readFileSync(FONT), { subset: true });
	const trang = [
		[
			"QUY TRÌNH ĐỐI SOÁT HOA HỒNG",
			"Bước 1. Đối tác gửi bảng kê trong 48 giờ sau khi chốt kỳ.",
			"Bước 2. Bộ phận tài chính kiểm tra số liệu trong 3 ngày làm việc.",
		],
		[
			"Bước 3. Chuyển khoản trước ngày 15 hằng tháng.",
			"Ngoại lệ: kỳ có ngày lễ thì lùi sang ngày làm việc kế tiếp.",
			"Áp dụng từ ngày 01/10/2026.",
		],
	];
	for (const dong of trang) {
		const p = pdf.addPage([595, 842]);
		dong.forEach((c, i) => {
			p.drawText(c, { x: 50, y: 780 - i * 24, size: 12, font });
		});
	}
	return pdf.save();
}

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

function pngXam(rong: number, cao: number): Uint8Array {
	const ihdr = new Uint8Array(13);
	const v = new DataView(ihdr.buffer);
	v.setUint32(0, rong);
	v.setUint32(4, cao);
	ihdr.set([8, 0, 0, 0, 0], 8);
	const tho = new Uint8Array(cao * (rong + 1));
	for (let y = 0; y < cao; y += 1) {
		for (let x = 0; x < rong; x += 1) {
			tho[y * (rong + 1) + 1 + x] = (x * 7 + y * 3) % 256;
		}
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
		...khoiPng("IDAT", new Uint8Array(deflateSync(tho))),
		...khoiPng("IEND", new Uint8Array()),
	]);
}

async function banQuet(): Promise<Uint8Array> {
	const pdf = await PDFDocument.create();
	const anh = await pdf.embedPng(pngXam(120, 160));
	for (let i = 0; i < 2; i += 1) {
		const p = pdf.addPage([595, 842]);
		p.drawImage(anh, { x: 40, y: 60, width: 515, height: 720 });
	}
	return pdf.save();
}

function pdfTay(doiTuong: string[], them = ""): Uint8Array {
	let than = "%PDF-1.4\n";
	const viTri: number[] = [];
	doiTuong.forEach((o, i) => {
		viTri.push(MA_HOA.encode(than).length);
		than += `${i + 1} 0 obj\n${o}\nendobj\n`;
	});
	const xref = MA_HOA.encode(than).length;
	than += `xref\n0 ${doiTuong.length + 1}\n0000000000 65535 f \n`;
	for (const v of viTri) than += `${String(v).padStart(10, "0")} 00000 n \n`;
	than += `trailer\n<</Size ${doiTuong.length + 1}/Root 1 0 R${them}>>\nstartxref\n${xref}\n%%EOF\n`;
	return MA_HOA.encode(than);
}

function pdfChuMaSai(ma: string, soLan: number): Uint8Array {
	const cmap = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CMapName /Thu def 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <41> <5A> <${ma}> endbfrange endcmap CMapName currentdict /CMap defineresource pop end end`;
	const chu = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(soLan);
	const noiDung = `BT /F1 10 Tf 40 780 Td (${chu}) Tj ET`;
	return pdfTay([
		"<</Type/Catalog/Pages 2 0 R>>",
		"<</Type/Pages/Kids[3 0 R]/Count 1>>",
		"<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>",
		"<</Type/Font/Subtype/Type1/BaseFont/Helvetica/ToUnicode 6 0 R>>",
		`<</Length ${noiDung.length}>>\nstream\n${noiDung}\nendstream`,
		`<</Length ${cmap.length}>>\nstream\n${cmap}\nendstream`,
	]);
}

function matKhau(): Uint8Array {
	const hex = (n: number) => "ab".repeat(n);
	return pdfTay(
		[
			"<</Type/Catalog/Pages 2 0 R>>",
			"<</Type/Pages/Kids[3 0 R]/Count 1>>",
			"<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>",
			`<</Filter/Standard/V 1/R 2/O <${hex(32)}>/U <${hex(32)}>/P -44>>`,
		],
		`/Encrypt 4 0 R/ID[<${hex(16)}><${hex(16)}>]`,
	);
}

const MAU: [string, () => Uint8Array | Promise<Uint8Array>][] = [
	["quyet-dinh.docx", quyetDinh],
	["theo-doi.docx", theoDoi],
	["hong.docx", hong],
	["quy-trinh.pdf", quyTrinh],
	["ban-quet.pdf", banQuet],
	["cid.pdf", () => pdfChuMaSai("E000", 3)],
	["fffd.pdf", () => pdfChuMaSai("FFFD", 3)],
	["mat-khau.pdf", matKhau],
];

for (const [ten, dung] of MAU) {
	const byte = await dung();
	writeFileSync(join(THU_MUC, ten), byte);
	console.log(`${ten}: ${byte.length} byte`);
}
