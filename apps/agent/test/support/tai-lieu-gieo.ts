import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import { zipLuu } from "../../../api/test/tai-lieu-nguon-mau.ts";
import { TAI_LIEU_AGENT } from "../../agent/lib/tai-lieu-config";
import type { LeasedTask } from "../../agent/lib/tasks";

export const MAU = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"..",
	"_acceptance",
	"may-soan-de-xuat",
	"mau",
);

export const TIEN_TO = `msd${(process.env.TEST_RUN_ID ?? "").slice(0, 6)}-`;
let dem = 0;
export const ma = (p: string) =>
	`${TIEN_TO}${p}-${Date.now().toString(36)}-${++dem}`;

export const docMau = (tep: string) =>
	new Uint8Array(readFileSync(join(MAU, tep)));

export const bam = (b: Uint8Array | string) =>
	createHash("sha256").update(b).digest("hex");

export const DOAN_QUYET_DINH = [
	"QUYẾT ĐỊNH VỀ HOA HỒNG CÔNG TY ĐỐI TÁC",
	"Điều 2. Kể từ ngày 01/10/2026, mức hoa hồng áp dụng cho công ty đối tác tầng hai là 1,5% và tầng ba là 1,8% giá trị giao dịch đã xác nhận.",
	"Đối tượng áp dụng: các công ty đối tác đã ký hợp đồng khung.",
] as const;

export function docxTu(doanVan: readonly string[]): Uint8Array {
	const than = doanVan
		.map((d) => `<w:p><w:r><w:t xml:space="preserve">${d}</w:t></w:r></w:p>`)
		.join("");
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
			`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${than}</w:body></w:document>`,
		],
		["docProps/nhan.xml", `<nhan>${ma("docx")}</nhan>`],
	]);
}

export async function gieoNguoi(ten = "Người tải"): Promise<string> {
	const id = ma("u");
	await db.user.create({ data: { id, name: ten, email: `${id}@thu.test` } });
	return id;
}

export async function gieoTrang(
	chuTrangId: string,
	slug = ma("trang"),
): Promise<string> {
	const t = await db.taiLieuTrang.create({
		data: {
			slug,
			ten: "Trang thử",
			loai: "quy-dinh",
			chuTrangId,
			taoBoiId: chuTrangId,
		},
	});
	return t.id;
}

export async function datBanDangDung(
	trangId: string,
	nguoiId: string,
	noiDung: string,
): Promise<void> {
	const so =
		((
			await db.taiLieuPhienBan.aggregate({
				where: { trangId },
				_max: { so: true },
			})
		)._max.so ?? 0) + 1;
	await db.$transaction(async (tx) => {
		const trang = await tx.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: { banDangDungId: true },
		});
		const { deXuatId } = await taoDeXuatTaiLieu(tx, {
			trangId,
			banGocId: trang.banDangDungId,
			ten: "Trang thử",
			noiDung,
			taoBoiId: nguoiId,
			suKien: "DE_XUAT",
		});
		const ban = await tx.taiLieuPhienBan.create({
			data: {
				trangId,
				so,
				ten: "Trang thử",
				noiDung,
				noiDungHash: bam(noiDung),
				deXuatId,
				duyetBoiId: nguoiId,
				duyetLuc: new Date(),
			},
		});
		await tx.taiLieuDeXuat.update({
			where: { id: deXuatId },
			data: { trangThai: "DA_DUYET", xuLyLuc: new Date() },
		});
		await tx.taiLieuTrang.update({
			where: { id: trangId },
			data: { banDangDungId: ban.id },
		});
	});
}

export async function xoaQuyTacViet(): Promise<void> {
	const co = await db.taiLieuTrang.findUnique({
		where: { slug: TAI_LIEU_AGENT.soan.slugQuyTacViet },
		select: { id: true },
	});
	if (!co) return;
	await db.taiLieuSuKien.deleteMany({ where: { trangId: co.id } });
	await db.taiLieuTrang.update({
		where: { id: co.id },
		data: { banDangDungId: null },
	});
	await db.taiLieuDeXuat.updateMany({
		where: { trangId: co.id },
		data: { banGocId: null },
	});
	await db.taiLieuPhienBan.deleteMany({ where: { trangId: co.id } });
	await db.taiLieuDeXuat.deleteMany({ where: { trangId: co.id } });
	await db.taiLieuTrang.delete({ where: { id: co.id } });
}

export async function datQuyTacViet(
	nguoiId: string,
	noiDung: string,
): Promise<void> {
	await xoaQuyTacViet();
	const trangId = await gieoTrang(nguoiId, TAI_LIEU_AGENT.soan.slugQuyTacViet);
	await datBanDangDung(trangId, nguoiId, noiDung);
}

export async function gieoNguon(input: {
	tep: string;
	trangId: string;
	taiBoiId: string;
	byte?: Uint8Array;
	bamKhai?: string;
	trangThai?: string;
	chu?: string;
	banGocId?: string | null;
	phienId?: string | null;
}): Promise<{ id: string; pathname: string; byte: Uint8Array }> {
	const byte = input.byte ?? docMau(input.tep);
	const pathname = ma("blob");
	const n = await db.taiLieuNguon.create({
		data: {
			sha256: input.bamKhai ?? bam(byte),
			tenTep: input.tep,
			kieu: input.tep.endsWith(".pdf") ? "pdf" : "docx",
			kichThuoc: byte.length,
			blobPathname: pathname,
			taiBoiId: input.taiBoiId,
			trangId: input.trangId,
			trangThai: input.trangThai ?? "CHO_DOC",
			chu: input.chu ?? null,
			banGocId: input.banGocId ?? null,
			phienId: input.phienId ?? null,
		},
		select: { id: true },
	});
	return { id: n.id, pathname, byte };
}

export async function gieoViec(nguonId: string): Promise<LeasedTask> {
	const v = await db.agentTask.create({
		data: {
			kind: "soan-tu-nguon",
			reason: "thu",
			priority: 300,
			budget: 0,
			dueAt: new Date(),
			payload: { nguonId },
		},
	});
	return {
		id: v.id,
		contactId: null,
		companyId: null,
		dealId: null,
		kind: v.kind,
		reason: v.reason,
		payload: { nguonId },
		budget: 0,
		attempts: 1,
		priority: 300,
		dueAt: v.dueAt,
	};
}

export async function donTaiLieu(nguoiIds: readonly string[]): Promise<void> {
	await xoaQuyTacViet();
	const trang = await db.taiLieuTrang.findMany({
		where: { chuTrangId: { in: [...nguoiIds] } },
		select: { id: true },
	});
	const trangId = { in: trang.map((t) => t.id) };
	await db.agentTask.deleteMany({
		where: { kind: "soan-tu-nguon", reason: "thu" },
	});
	await db.taiLieuSuKien.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.updateMany({
		where: { id: trangId },
		data: { banDangDungId: null },
	});
	await db.taiLieuDeXuat.updateMany({
		where: { trangId },
		data: { banGocId: null },
	});
	await db.taiLieuPhienBan.deleteMany({ where: { trangId } });
	await db.taiLieuDeXuat.deleteMany({ where: { trangId } });
	await db.taiLieuNguon.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.deleteMany({ where: { id: trangId } });
	await db.user.deleteMany({ where: { id: { in: [...nguoiIds] } } });
}
