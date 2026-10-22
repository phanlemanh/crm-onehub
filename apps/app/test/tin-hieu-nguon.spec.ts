import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Prisma } from "@crm/db";
import { db } from "@crm/db";
import { ghiBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import { type BanDung, chonNguon } from "@/lib/lo-trinh/chon-nguon";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import {
	type BanChupTho,
	docBanChupTho,
	docNguonTinHieu,
} from "@/lib/tin-hieu/nguon";
import { docNenTatCa } from "@/lib/tin-hieu/tat-ca";
import { docTrangThaiDu } from "@/lib/tin-hieu/trang-thai";
import { dungKhoiMau, GOC_KHO } from "./support/khoi-tin-hieu-mau";

const RUN = (process.env.TEST_RUN_ID ?? `${Date.now()}`).slice(0, 8);
const NGUON = `ttts-${RUN}`;
const MA = "crm-1";
const TEN_NHOM = `TTTS-NHOM-${RUN}`;
const GIO_DUNG = "2026-10-22T02:00:00.000Z";
const m = tinHieuMessages("vi");

const CU = dungKhoiMau({ tinHieu: [{ ma: MA }] });
const MOI = dungKhoiMau({
	tinHieu: [{ ma: MA }],
	nhom: [{ ma: "g1", ten: TEN_NHOM, tinHieu: [MA] }],
});

const tepDongGoi = () =>
	readFileSync(path.join(GOC_KHO, "LO-TRINH.html"), "utf8");
const bam = (s: string) => createHash("sha256").update(s).digest("hex");

describe("ttts-doc-ban-chup", () => {
	test("ttts-doc-ban-chup: hai trang tin hieu doc cho moi tu ban chup ghi bang ben viet that", async () => {
		const banDau = bam(tepDongGoi());
		try {
			await ghiBanChupLoTrinh(
				db,
				{
					nguon: NGUON,
					sha: "b".repeat(40),
					commitLuc: "2026-10-22T03:00:00.000Z",
					duLieu: MOI as Prisma.InputJsonObject,
					canhBao: [],
				},
				new Date(),
			);
			const banDung: BanDung = {
				sha: "a".repeat(40),
				dungLuc: GIO_DUNG,
				moiTruong: "production",
			};
			const nguon = await docNguonTinHieu({
				docBanChup: () => docBanChupTho(db, NGUON),
				docBanDung: async () => tepDongGoi(),
				banDung,
				ghiCanhBao: () => {},
			});
			expect(nguon.kieu, "trang tin hieu khong doc ban chup").toBe(
				"ban-chup",
			);
			expect(
				typeof nguon.dauVao === "object" &&
					nguon.dauVao !== null &&
					"duLieu" in nguon.dauVao
					? (nguon.dauVao.duLieu as { tin_hieu?: unknown }).tin_hieu
					: undefined,
				"ban chup mat danh sach tin hieu khi doc",
			).toEqual((MOI as { tin_hieu?: unknown }).tin_hieu);

			const cuaToi = docTrangThaiDu(
				nguon.dauVao,
				[{ ma: MA, daKeoVe: true }],
				m,
			);
			const tt = cuaToi.trangThai[MA];
			expect(tt?.khoa, "trang tin hieu khong doc ban chup").toBe(
				"nhom-chua-cat",
			);
			expect(tt?.nhan).toBe(m.nhan.daVaoNhom);
			expect(tt?.cau).toContain(TEN_NHOM);

			const tatCa = docNenTatCa({
				rows: [
					{
						so: 1,
						guiLuc: "2026-10-20T00:00:00Z",
						daKeoVe: true,
						phongBan: null,
					},
				],
				html: nguon.dauVao,
				m,
			});
			expect(tatCa.trangThai[MA]?.khoa).toBe(tt?.khoa);
			expect(tatCa.trangThai[MA]?.cau).toBe(tt?.cau);
			expect(bam(tepDongGoi()), "tep dong goi bi doi trong luot").toBe(banDau);
		} finally {
			await db.banChupLoTrinh.deleteMany({ where: { nguon: NGUON } });
		}
	});
});

const CA = [
	"cung-sha",
	"sau-gio-dung",
	"cu-hon",
	"mo-ho",
	"preview",
	"chua-co",
	"kho-loi",
	"hang-hong",
] as const;
type Ca = (typeof CA)[number];
const KY_VONG: Record<Ca, "ban-chup" | "ban-dung"> = {
	"cung-sha": "ban-chup",
	"sau-gio-dung": "ban-chup",
	"cu-hon": "ban-dung",
	"mo-ho": "ban-dung",
	preview: "ban-dung",
	"chua-co": "ban-dung",
	"kho-loi": "ban-dung",
	"hang-hong": "ban-dung",
};
const SHA_DUNG = "c".repeat(40);
const banChupCo = (sha: string, commitLuc: string): BanChupTho => ({
	kieu: "co",
	sha,
	commitLuc,
	layLuc: "2026-10-22T04:00:00.000Z",
	duLieu: MOI,
});

function dauVaoCa(ca: Ca): {
	doc: () => Promise<BanChupTho>;
	banDung: BanDung;
} {
	const banDung: BanDung = {
		sha: SHA_DUNG,
		dungLuc: GIO_DUNG,
		moiTruong: "production",
	};
	switch (ca) {
		case "cung-sha":
			return {
				doc: async () => banChupCo(SHA_DUNG, "2026-10-22T01:00:00.000Z"),
				banDung,
			};
		case "sau-gio-dung":
			return {
				doc: async () => banChupCo("d".repeat(40), "2026-10-22T03:00:00.000Z"),
				banDung,
			};
		case "cu-hon":
			return {
				doc: async () => banChupCo("e".repeat(40), "2026-10-21T01:00:00.000Z"),
				banDung,
			};
		case "mo-ho":
			return {
				doc: async () => banChupCo("f".repeat(40), "2026-10-22T01:59:00.000Z"),
				banDung,
			};
		case "preview":
			return {
				doc: async () => banChupCo("d".repeat(40), "2026-10-22T03:00:00.000Z"),
				banDung: { ...banDung, moiTruong: "preview" },
			};
		case "chua-co":
			return { doc: async () => ({ kieu: "khong" }), banDung };
		case "kho-loi":
			return {
				doc: async () => {
					throw new Error("kho du lieu khong tra loi");
				},
				banDung,
			};
		case "hang-hong":
			return {
				doc: async () => ({ kieu: "hong", lyDo: "lo_trinh: sai khuon" }),
				banDung,
			};
	}
}

describe("ttts-khong-lui", () => {
	test("ttts-khong-lui: 8 ca x 2 trang, trang tin hieu chon nguon dung nhu trang Lo trinh", async () => {
		const sai: string[] = [];
		console.log(`ttts-khong-lui: ${CA.length * 2} o`);
		const choCu = docTrangThaiDu({ duLieu: CU }, [{ ma: MA, daKeoVe: true }], m)
			.trangThai[MA]?.khoa;
		const choMoi = docTrangThaiDu(
			{ duLieu: MOI },
			[{ ma: MA, daKeoVe: true }],
			m,
		).trangThai[MA]?.khoa;
		expect(choCu).not.toBe(choMoi);
		for (const ca of CA) {
			const { doc, banDung } = dauVaoCa(ca);
			const canhBao: string[] = [];
			let kq: Awaited<ReturnType<typeof docNguonTinHieu>>;
			try {
				kq = await docNguonTinHieu({
					docBanChup: doc,
					docBanDung: async () => ({ duLieu: CU }),
					banDung,
					ghiCanhBao: (o) => canhBao.push(o.ca),
				});
			} catch {
				sai.push(`${ca}: kho loi lam vo trang tin hieu`);
				continue;
			}
			const tho = await doc().catch(() => null);
			const loTrinh = chonNguon(tho?.kieu === "co" ? tho : null, banDung).kieu;
			if (kq.kieu !== KY_VONG[ca])
				sai.push(
					`${ca}: trang tin hieu hien cho cu hon ban dang chay (${kq.kieu})`,
				);
			if (kq.kieu !== loTrinh)
				sai.push(`${ca}: khac trang Lo trinh (${kq.kieu} != ${loTrinh})`);
			for (const trang of ["cua-toi", "tat-ca"] as const) {
				const khoa =
					trang === "cua-toi"
						? docTrangThaiDu(kq.dauVao, [{ ma: MA, daKeoVe: true }], m)
								.trangThai[MA]?.khoa
						: docNenTatCa({
								rows: [
									{
										so: 1,
										guiLuc: "2026-10-20T00:00:00Z",
										daKeoVe: true,
										phongBan: null,
									},
								],
								html: kq.dauVao,
								m,
							}).trangThai[MA]?.khoa;
				const kyVong = KY_VONG[ca] === "ban-chup" ? choMoi : choCu;
				if (khoa !== kyVong)
					sai.push(`${ca} ${trang}: khoa ${khoa} != ${kyVong}`);
			}
			const soCanhBao = ca === "kho-loi" || ca === "hang-hong" ? 1 : 0;
			if (canhBao.length !== soCanhBao)
				sai.push(`${ca}: ${canhBao.length} dong canh bao`);
		}
		expect(sai).toEqual([]);
	});
});
