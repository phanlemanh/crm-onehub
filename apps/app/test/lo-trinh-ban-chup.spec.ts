import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import {
	type BanDung,
	banDungHienTai,
	chonNguon,
} from "@/lib/lo-trinh/chon-nguon";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu.js";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import {
	type DauVaoLoTrinh,
	docDauVaoChoVai,
	docTrangLoTrinh,
	type KetQuaDocBanChup,
	ketQuaTuHang,
} from "@/lib/lo-trinh/doc-trang";

const GOC = path.join(import.meta.dir, "..", "..", "..");
const HTML = docTepLoTrinh();
const KHOI = docDuLieu(HTML);
if (KHOI.duLieu === null) throw new Error("LO-TRINH.html khong mang khoi");
const DU_LIEU: unknown = KHOI.duLieu;

const DUNG_LUC = "2026-10-14T08:00:00.000Z";
const SHA_DUNG = "d".repeat(40);
const SHA_KHAC = "c".repeat(40);
const LAY_LUC = "2026-10-14T08:05:00.000Z";
const LUC = {
	truoc: "2026-10-14T07:59:59.000Z",
	bang: DUNG_LUC,
	sau: "2026-10-14T08:00:01.000Z",
} as const;

const hangMoi = (o: { sha: string; commitLuc: string; duLieu?: unknown }) => ({
	sha: o.sha,
	commitLuc: new Date(o.commitLuc),
	layLuc: new Date(LAY_LUC),
	duLieu: o.duLieu ?? structuredClone(DU_LIEU),
	canhBao: [],
});

const banDung = (o: Partial<BanDung> = {}): BanDung => ({
	sha: SHA_DUNG,
	dungLuc: DUNG_LUC,
	moiTruong: "production",
	...o,
});

const docBanDung = async (): Promise<DauVaoLoTrinh> =>
	docTrangLoTrinh(docTepLoTrinh());

function nguonCua(d: DauVaoLoTrinh): string {
	return d.kieu === "co-du-lieu" ? (d.nguon?.kieu ?? "khong-nguon") : d.kieu;
}

describe("chon-nguon", () => {
	const SHA = { cung: SHA_DUNG, khac: SHA_KHAC } as const;
	const ca = [
		["production", "cung", "truoc", "ban-chup"],
		["production", "cung", "bang", "ban-chup"],
		["production", "cung", "sau", "ban-chup"],
		["production", "khac", "truoc", "ban-dung"],
		["production", "khac", "bang", "ban-dung"],
		["production", "khac", "sau", "ban-chup"],
		["preview", "cung", "truoc", "ban-dung"],
		["preview", "cung", "bang", "ban-dung"],
		["preview", "cung", "sau", "ban-dung"],
		["preview", "khac", "truoc", "ban-dung"],
		["preview", "khac", "bang", "ban-dung"],
		["preview", "khac", "sau", "ban-dung"],
	] as const;

	test("ma tran toan phan 12 o", () => {
		expect(ca.length).toBe(12);
		for (const [moiTruong, sha, luc, kyVong] of ca) {
			const kq = chonNguon(
				{ sha: SHA[sha], commitLuc: LUC[luc], layLuc: LAY_LUC },
				banDung({ moiTruong }),
			);
			expect(`${moiTruong}/${sha}/${luc}: ${kq.kieu}`).toBe(
				`${moiTruong}/${sha}/${luc}: ${kyVong}`,
			);
		}
	});

	test("may dev khong co sha: chi so thoi gian", () => {
		const dev = banDung({ sha: null, moiTruong: null });
		expect(
			chonNguon({ sha: SHA_DUNG, commitLuc: LUC.bang, layLuc: LAY_LUC }, dev)
				.kieu,
		).toBe("ban-dung");
		expect(
			chonNguon({ sha: SHA_DUNG, commitLuc: LUC.sau, layLuc: LAY_LUC }, dev)
				.kieu,
		).toBe("ban-chup");
	});

	test("gio lay: ban chup lay layLuc, ban dung lay dungLuc", () => {
		expect(
			chonNguon(
				{ sha: SHA_DUNG, commitLuc: LUC.sau, layLuc: LAY_LUC },
				banDung(),
			).layLuc,
		).toBe(LAY_LUC);
		expect(chonNguon(null, banDung()).layLuc).toBe(DUNG_LUC);
	});

	test("banDungHienTai doc dung ba bien moi truong", () => {
		const cu = {
			sha: process.env.VERCEL_GIT_COMMIT_SHA,
			luc: process.env.LO_TRINH_DUNG_LUC,
			env: process.env.VERCEL_ENV,
		};
		try {
			process.env.VERCEL_GIT_COMMIT_SHA = SHA_DUNG;
			process.env.LO_TRINH_DUNG_LUC = DUNG_LUC;
			process.env.VERCEL_ENV = "preview";
			expect(banDungHienTai()).toEqual({
				sha: SHA_DUNG,
				dungLuc: DUNG_LUC,
				moiTruong: "preview",
			});
			delete process.env.VERCEL_GIT_COMMIT_SHA;
			delete process.env.VERCEL_ENV;
			expect(banDungHienTai().sha).toBeNull();
			expect(banDungHienTai().moiTruong).toBeNull();
		} finally {
			for (const [k, v] of [
				["VERCEL_GIT_COMMIT_SHA", cu.sha],
				["LO_TRINH_DUNG_LUC", cu.luc],
				["VERCEL_ENV", cu.env],
			] as const) {
				if (v === undefined) delete process.env[k];
				else process.env[k] = v;
			}
		}
	});

	test("next.config dong gio bat dau dung vao env cua ban dung", async () => {
		const truoc = Date.now();
		const { default: cauHinh } = await import(
			`${path.join(GOC, "apps", "app", "next.config.ts")}?t=${truoc}`
		);
		const luc = Date.parse(String(cauHinh.env?.LO_TRINH_DUNG_LUC));
		expect(
			Number.isFinite(luc) && luc >= truoc - 1000 && luc <= Date.now() + 1000,
			"next.config khong dong gio bat dau dung",
		).toBe(true);
		const turbo: { globalPassThroughEnv: string[] } = JSON.parse(
			readFileSync(path.join(GOC, "turbo.json"), "utf8"),
		);
		for (const bien of ["VERCEL_ENV", "VERCEL_GIT_COMMIT_SHA"])
			expect(turbo.globalPassThroughEnv).toContain(bien);
	});
});

describe("doc", () => {
	const ca: [string, () => Promise<KetQuaDocBanChup>, string | null][] = [
		["1 chua co ban chup", async () => ketQuaTuHang(null), null],
		[
			"2 kho loi",
			async () => {
				throw new Error("ECONNREFUSED");
			},
			"loi",
		],
		[
			"3 hang khong qua khuon",
			async () =>
				ketQuaTuHang(
					hangMoi({
						sha: SHA_KHAC,
						commitLuc: LUC.sau,
						duLieu: { khuon: "khac" },
					}),
				),
			"hong",
		],
		[
			"4 ban chup cu hon ban dung",
			async () =>
				ketQuaTuHang(hangMoi({ sha: SHA_KHAC, commitLuc: LUC.truoc })),
			null,
		],
	];

	for (const [ten, docBanChup, canhBaoCa] of ca)
		test(`${ten}: roi ve tep dong goi, khong nem`, async () => {
			const canhBao: { ca: string; lyDo: string }[] = [];
			const kq = await docDauVaoChoVai("owner", {
				docBanChup,
				docBanDung,
				banDung: banDung(),
				ghiCanhBao: (o) => canhBao.push(o),
			});
			expect(`${ten}: ${nguonCua(kq)}`).toBe(`${ten}: ban-dung`);
			expect(canhBao.map((c) => c.ca)).toEqual(canhBaoCa ? [canhBaoCa] : []);
		});

	test("doi chung: ban chup moi hon thi doc ban chup", async () => {
		const kq = await docDauVaoChoVai("owner", {
			docBanChup: async () =>
				ketQuaTuHang(hangMoi({ sha: SHA_KHAC, commitLuc: LUC.sau })),
			docBanDung,
			banDung: banDung(),
			ghiCanhBao: () => {},
		});
		expect(nguonCua(kq)).toBe("ban-chup");
		if (kq.kieu === "co-du-lieu") expect(kq.nguon?.layLuc).toBe(LAY_LUC);
	});
});

describe("vai", () => {
	const VAI: WorkspaceRole[] = ["owner", "admin", "member", "okr"];
	const docMoiHon = async () =>
		ketQuaTuHang(hangMoi({ sha: SHA_KHAC, commitLuc: LUC.sau }));
	const NGUON: [string, () => Promise<KetQuaDocBanChup>][] = [
		["ban-chup", docMoiHon],
		["ban-dung", async () => ketQuaTuHang(null)],
	];

	function soChuKho(d: DauVaoLoTrinh): number {
		if (d.kieu !== "co-du-lieu") return -1;
		return d.duLieu.lo_trinh
			.flatMap((l) => l.hang)
			.filter((h) => h.tom_tat?.chu_kho != null).length;
	}

	test("khoi that co hang mang so lieu chu kho", async () => {
		const kq = await docDauVaoChoVai("owner", {
			docBanChup: docMoiHon,
			docBanDung,
			banDung: banDung(),
			ghiCanhBao: () => {},
		});
		expect(soChuKho(kq)).toBeGreaterThan(0);
	});

	for (const [nguon, docBanChup] of NGUON)
		for (const vai of VAI)
			test(`${vai} x ${nguon}`, async () => {
				const kq = await docDauVaoChoVai(vai, {
					docBanChup,
					docBanDung,
					banDung: banDung(),
					ghiCanhBao: () => {},
				});
				expect(nguonCua(kq)).toBe(nguon);
				const thay = soChuKho(kq) > 0;
				expect(`${vai}/${nguon} thay so lieu chu kho: ${thay}`).toBe(
					`${vai}/${nguon} thay so lieu chu kho: ${vai === "owner"}`,
				);
			});

	test("owner roi member trong cung tien trinh: member van khong thay", async () => {
		const nguon = {
			docBanChup: docMoiHon,
			docBanDung,
			banDung: banDung(),
			ghiCanhBao: () => {},
		};
		expect(soChuKho(await docDauVaoChoVai("owner", nguon))).toBeGreaterThan(0);
		expect(soChuKho(await docDauVaoChoVai("member", nguon))).toBe(0);
	});

	test("trang chi goi docDauVaoChoVai", () => {
		const trang = readFileSync(
			path.join(
				GOC,
				"apps",
				"app",
				"app",
				"(app)",
				"[slug]",
				"lo-trinh",
				"page.tsx",
			),
			"utf8",
		);
		expect(trang).toContain("docDauVaoChoVai(");
		expect(trang).not.toContain("choVaiXem(");
	});
});
