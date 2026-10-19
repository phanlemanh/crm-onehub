import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dir, "..", "..", "..");

const { z } = createRequire(join(GOC, "apps", "agent", "package.json"))(
	"zod",
) as typeof import("zod");

export const ZCH = {
	goc: GOC,
	hoSo: resolve(import.meta.dir, ".."),
	evidence: resolve(import.meta.dir, "..", "evidence"),
	chuoi: resolve(import.meta.dir, "chuoi.json"),
	nguong: resolve(import.meta.dir, "nguong.json"),
	boMau: join(GOC, "_acceptance", "bo-cau-hoi-mau", "bo-mau.json"),
	tep: {
		ketQua: "ket-qua.jsonl",
		eveLog: "eve.log",
		bam: "eve-log.txt",
		bao: "do.md",
	},
	xong: ["TRA_LOI", "TU_CHOI"],
	dongChiPhi: "chi phi usd:",
} as const;

export const dongKetQua = z.object({
	nguoi: z.string().min(1),
	thuTu: z.union([z.literal(1), z.literal(2), z.literal(3)]),
	maCau: z.string().min(1),
	zaloHoiId: z.string().nullable(),
	sessionId: z.string().nullable(),
	ketQua: z.string().nullable(),
	tlhId: z.string().nullable(),
	tlhZaloHoiId: z.string().nullable(),
	tlhTrangThai: z.string().nullable(),
	tlhLyDo: z.string().nullable(),
	daGuiZalo: z.boolean(),
	loi: z.string().nullable(),
});

export type DongKetQua = z.infer<typeof dongKetQua>;

export function docKetQua(chu: string): DongKetQua[] {
	return chu
		.split("\n")
		.filter(Boolean)
		.map((d) => dongKetQua.parse(JSON.parse(d)));
}

const khuonChuoi = z.object({
	bamBoMau: z.string().length(64),
	chuoi: z
		.array(
			z.object({
				nguoi: z.string().min(1),
				cau: z.array(z.string().min(1)).length(3),
			}),
		)
		.length(8),
});

export type Chuoi = z.infer<typeof khuonChuoi>;

export function docChuoi(): Chuoi {
	return khuonChuoi.parse(JSON.parse(readFileSync(ZCH.chuoi, "utf8")));
}

const khuonNguong = z.object({
	loiModelToiDa: z.number().int().min(0),
	tranUsd: z.number().positive(),
});

export type Nguong = z.infer<typeof khuonNguong>;

export function docNguong(): Nguong {
	return khuonNguong.parse(JSON.parse(readFileSync(ZCH.nguong, "utf8")));
}

export const sha = (chu: string | Uint8Array) =>
	new Bun.CryptoHasher("sha256").update(chu).digest("hex");
