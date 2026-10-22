import { afterAll, beforeAll } from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { KhoTepTruong } from "@crm/db/blob-tep-truong";
import type { FieldEntityName } from "@crm/db/fields";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const PHUT_MS = 60_000;
export const TTP_SAN = { hookMs: 2 * PHUT_MS } as const;

export const RUN = (process.env.TEST_RUN_ID ?? "local")
	.replace(/[^a-z0-9]/gi, "")
	.toLowerCase()
	.slice(-8);
export const TIEN_TO = `ttp${RUN}`;

export const AI = ["quanTri", "nv1", "nv2", "okr"] as const;
export type Ai = (typeof AI)[number];
const VAI = {
	quanTri: "admin",
	nv1: "member",
	nv2: "member",
	okr: "okr",
} satisfies Record<Ai, WorkspaceRole>;

export type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };

export type TraLoi = { status: number; data: Json; loi: string; ma: string };

type Phien = { nguoi: string; cookie: string };

export type San = {
	app: () => INestApplication;
	phien: Record<Ai, Phien>;
	goi: (ai: Ai, thuTuc: string, vao: Json) => Promise<TraLoi>;
	hoi: (ai: Ai, thuTuc: string, vao?: Json) => Promise<TraLoi>;
};

function traLoi(res: request.Response): TraLoi {
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

async function mocDb(): Promise<Date> {
	const [dong] = await db.$queryRaw<
		{ bayGio: Date }[]
	>`SELECT now() AS "bayGio"`;
	return dong?.bayGio ?? new Date();
}

export async function viecMoCoi(tu: Date): Promise<number> {
	const [dong] = await db.$queryRaw<{ so: bigint }[]>`
		SELECT count(*) AS so FROM "agentTask" t
		WHERE t."createdAt" >= ${tu} AND t."finishedAt" IS NULL AND (
			(t."dealId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "deal" d WHERE d.id = t."dealId"))
			OR (t."companyId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "company" c WHERE c.id = t."companyId"))
			OR (t."contactId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "contact" k WHERE k.id = t."contactId"))
		)`;
	return Number(dong?.so ?? 0);
}

export function dungSan(opts: {
	kho?: KhoTepTruong;
	ten: string;
	don?: () => Promise<void>;
}): San {
	let app: INestApplication;
	const phien = Object.fromEntries(
		AI.map((a) => [a, { nguoi: "", cookie: "" }]),
	) as Record<Ai, Phien>;

	let batDau = new Date();

	beforeAll(async () => {
		batDau = await mocDb();
		const { AppModule } = await import("../src/app.module");
		const { KHO_TEP } = await import("../src/fields/kho-tep");
		const dung = Test.createTestingModule({ imports: [AppModule] });
		const modul: TestingModule = await (opts.kho
			? dung.overrideProvider(KHO_TEP).useValue(opts.kho)
			: dung
		).compile();
		app = modul.createNestApplication({ bodyParser: false });
		await app.init();
		for (const ai of AI) {
			const id = `${TIEN_TO}-${opts.ten}-${ai}`;
			await gieoThanhVien(id, VAI[ai]);
			phien[ai] = { nguoi: id, cookie: (await mintPhien(id)).cookie };
		}
	}, TTP_SAN.hookMs);

	afterAll(async () => {
		await app.close();
		await opts.don?.();
		const con = await viecMoCoi(batDau);
		if (con > 0) throw new Error(`ttp don: con ${con} viec mo coi`);
		const nguoi = AI.map((ai) => phien[ai].nguoi).filter(Boolean);
		await db.session.deleteMany({ where: { userId: { in: nguoi } } });
		await db.member.deleteMany({ where: { userId: { in: nguoi } } });
		await db.user.deleteMany({ where: { id: { in: nguoi } } });
	});

	return {
		app: () => app,
		phien,
		goi: async (ai, thuTuc, vao) =>
			traLoi(
				await request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("cookie", phien[ai].cookie)
					.set("content-type", "application/json")
					.send(JSON.stringify(vao)),
			),
		hoi: async (ai, thuTuc, vao) =>
			traLoi(
				await request(app.getHttpServer())
					.get(
						`/api/trpc/${thuTuc}${vao === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(vao))}`}`,
					)
					.set("cookie", phien[ai].cookie),
			),
	};
}

export function canData<T>(tl: TraLoi, nhan: string): T {
	if (tl.status !== 200) {
		throw new Error(`ttp ${nhan}: ${tl.status} ${tl.ma} ${tl.loi}`);
	}
	return tl.data as T;
}

const BANG_CRC = (() => {
	const bang = new Uint32Array(256);
	for (let n = 0; n < 256; n += 1) {
		let c = n;
		for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		bang[n] = c >>> 0;
	}
	return bang;
})();

function crc32(byte: Uint8Array): number {
	let c = 0xffffffff;
	for (const b of byte) c = (BANG_CRC[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

export function zipLuu(tep: Record<string, string | Uint8Array>): Uint8Array {
	const ma = new TextEncoder();
	const phan: Uint8Array[] = [];
	const trungTam: Uint8Array[] = [];
	let viTri = 0;
	for (const [ten, noiDung] of Object.entries(tep)) {
		const tenByte = ma.encode(ten);
		const du = noiDung instanceof Uint8Array ? noiDung : ma.encode(noiDung);
		const crc = crc32(du);
		const dau = new DataView(new ArrayBuffer(30));
		dau.setUint32(0, 0x04034b50, true);
		dau.setUint16(4, 20, true);
		dau.setUint32(14, crc, true);
		dau.setUint32(18, du.length, true);
		dau.setUint32(22, du.length, true);
		dau.setUint16(26, tenByte.length, true);
		phan.push(new Uint8Array(dau.buffer), tenByte, du);
		const tt = new DataView(new ArrayBuffer(46));
		tt.setUint32(0, 0x02014b50, true);
		tt.setUint16(4, 20, true);
		tt.setUint16(6, 20, true);
		tt.setUint32(16, crc, true);
		tt.setUint32(20, du.length, true);
		tt.setUint32(24, du.length, true);
		tt.setUint16(28, tenByte.length, true);
		tt.setUint32(42, viTri, true);
		trungTam.push(new Uint8Array(tt.buffer), tenByte);
		viTri += 30 + tenByte.length + du.length;
	}
	const coTT = trungTam.reduce((t, p) => t + p.length, 0);
	const het = new DataView(new ArrayBuffer(22));
	het.setUint32(0, 0x06054b50, true);
	het.setUint16(8, Object.keys(tep).length, true);
	het.setUint16(10, Object.keys(tep).length, true);
	het.setUint32(12, coTT, true);
	het.setUint32(16, viTri, true);
	return noi(...phan, ...trungTam, new Uint8Array(het.buffer));
}

export function noi(...phan: Uint8Array[]): Uint8Array {
	const ket = new Uint8Array(phan.reduce((t, p) => t + p.length, 0));
	let viTri = 0;
	for (const p of phan) {
		ket.set(p, viTri);
		viTri += p.length;
	}
	return ket;
}

const chu = (s: string) => new TextEncoder().encode(s);

export const MAU_TEP = {
	pdf: (nhan: string) => chu(`%PDF-1.4\n% ${nhan}\n%%EOF\n`),
	docx: (nhan: string) =>
		zipLuu({
			"[Content_Types].xml": "<Types/>",
			"word/document.xml": `<w:document><w:body>${nhan}</w:body></w:document>`,
		}),
	docxMacro: (nhan: string) =>
		zipLuu({
			"[Content_Types].xml": "<Types/>",
			"word/document.xml": `<w:document>${nhan}</w:document>`,
			"word/vbaProject.bin": "macro",
		}),
	png: (nhan: string) =>
		noi(
			new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
			chu(nhan),
		),
	jpeg: (nhan: string) =>
		noi(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), chu(nhan)),
	xlsx: (nhan: string) =>
		zipLuu({ "[Content_Types].xml": "<Types/>", "xl/workbook.xml": nhan }),
} as const;

export const KIEU_MAU = {
	pdf: { ten: "Hop dong.pdf", kieu: "pdf" },
	docx: { ten: "Phu luc.docx", kieu: "docx" },
	png: { ten: "Anh chup.png", kieu: "png" },
	jpeg: { ten: "Anh ky.jpg", kieu: "jpeg" },
} as const;

export type OTep = {
	entity: FieldEntityName;
	recordId: string;
	fieldKey: string;
};

export async function donBanGhi(ids: {
	deal?: string[];
	company?: string[];
	contact?: string[];
	field?: string[];
}): Promise<void> {
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ dealId: { in: ids.deal ?? [] } },
				{ contactId: { in: ids.contact ?? [] } },
				{ companyId: { in: ids.company ?? [] } },
			],
		},
	});
	await db.deal.deleteMany({ where: { id: { in: ids.deal ?? [] } } });
	await db.contact.deleteMany({ where: { id: { in: ids.contact ?? [] } } });
	await db.company.deleteMany({ where: { id: { in: ids.company ?? [] } } });
	await db.fieldDefinition.deleteMany({
		where: { id: { in: ids.field ?? [] } },
	});
	await db.blobChoXoa.deleteMany({
		where: { fieldId: { in: ids.field ?? [] } },
	});
}
