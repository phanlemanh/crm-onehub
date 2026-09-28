import { createHash } from "node:crypto";

const MA_HOA = new TextEncoder();

function u16(n: number): number[] {
	return [n & 0xff, (n >>> 8) & 0xff];
}

function u32(n: number): number[] {
	return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
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

export function zipLuu(tep: readonly [string, string][]): Uint8Array {
	const phan: number[] = [];
	const trungTam: number[] = [];
	for (const [ten, noiDung] of tep) {
		const tenB = MA_HOA.encode(ten);
		const dl = MA_HOA.encode(noiDung);
		const crc = crc32(dl);
		const viTri = phan.length;
		phan.push(
			...u32(0x04034b50),
			...u16(20),
			...u16(0),
			...u16(0),
			...u16(0),
			...u16(0),
			...u32(crc),
			...u32(dl.length),
			...u32(dl.length),
			...u16(tenB.length),
			...u16(0),
			...tenB,
			...dl,
		);
		trungTam.push(
			...u32(0x02014b50),
			...u16(20),
			...u16(20),
			...u16(0),
			...u16(0),
			...u16(0),
			...u16(0),
			...u32(crc),
			...u32(dl.length),
			...u32(dl.length),
			...u16(tenB.length),
			...u16(0),
			...u16(0),
			...u16(0),
			...u16(0),
			...u32(0),
			...u32(viTri),
			...tenB,
		);
	}
	const batDauTT = phan.length;
	const ket = [
		...u32(0x06054b50),
		...u16(0),
		...u16(0),
		...u16(tep.length),
		...u16(tep.length),
		...u32(trungTam.length),
		...u32(batDauTT),
		...u16(0),
	];
	return new Uint8Array([...phan, ...trungTam, ...ket]);
}

export function docxNho(chu: string): Uint8Array {
	return zipLuu([
		[
			"[Content_Types].xml",
			'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
		],
		[
			"word/document.xml",
			`<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${chu}</w:t></w:r></w:p></w:body></w:document>`,
		],
	]);
}

export function pdfNho(chu: string): Uint8Array {
	return MA_HOA.encode(
		`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n%${chu}\ntrailer<</Root 1 0 R>>\n%%EOF\n`,
	);
}

export function pngNho(): Uint8Array {
	return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2]);
}

export function bam(byte: Uint8Array): string {
	return createHash("sha256").update(byte).digest("hex");
}
