import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type DongTungCau, dongTungCau } from "../../tro-ly-doc-kho/rang/quyet-do";
import { bam, type Bang, docBaoCao, ghiBaoCao, kiemBangChung, tinhBang } from "./bang-do";
import { BO_MAU } from "./bo-mau-config";
import { khuonBoMau } from "./khuon";

const BO_THO = readFileSync(BO_MAU.duong.bo, "utf8");
const BO = khuonBoMau.parse(JSON.parse(BO_THO));
const LENH = join(BO_MAU.duong.hoSo, "rang", "do-bo-mau.ts");
const CHAM_GIA = join(BO_MAU.duong.hoSo, "rang", "cham-gia.ts");

const MOT_KHAC: Record<string, "TRA_LOI-sai" | "LOI" | "TU_CHOI"> = {
	m02: "TRA_LOI-sai",
	m05: "LOI",
	m29: "TRA_LOI-sai",
	m37: "TRA_LOI-sai",
};
const HAI_KHAC: Record<string, "khong-hang" | "co-hang" | "loi"> = {
	m07: "khong-hang",
	m47: "co-hang",
	m48: "loi",
};

function fixture(): DongTungCau[] {
	const ngoai = (n: string) => n === "khong-phai-quy-dinh";
	const mot = BO.cau
		.filter((c) => !ngoai(c.nhom))
		.map((c) =>
			dongTungCau(
				{ id: c.id, nhom: c.nhom, ketCuc: MOT_KHAC[c.id] ?? (c.nhom === "khong-co" ? "TU_CHOI" : "TRA_LOI-du") },
				1,
			),
		);
	const hai = BO.cau.map((c) => {
		const kc = HAI_KHAC[c.id] ?? (ngoai(c.nhom) ? "khong-hang" : "co-hang");
		return dongTungCau({ id: c.id, nhom: c.nhom, ketCuc: kc }, 2, false, {
			ketQua: kc === "loi" ? null : "da-tra-loi",
			loi: kc === "loi" ? "het-cho" : null,
			coHang: kc === "co-hang",
		});
	});
	return [...mot, ...hai];
}

const BANG_VIET_TRUOC: Bang = {
	tang: {
		S1: { k: 13, n: 14, loi: 1 },
		S2: { k: 5, n: 5, loi: 0 },
		S3: { k: 8, n: 8, loi: 0 },
		"S6-gan": { k: 3, n: 4, loi: 0 },
		"S6-ngoai": { k: 4, n: 4, loi: 0 },
		S7: { k: 9, n: 10, loi: 0 },
	},
	kieuChu: {
		chuan: { k: 33, n: 35, loi: 1 },
		"khong-dau": { k: 1, n: 2, loi: 0 },
		"viet-tat": { k: 2, n: 2, loi: 0 },
		"sai-chinh-ta": { k: 2, n: 2, loi: 0 },
		"tron-anh": { k: 2, n: 2, loi: 0 },
		"tin-zalo": { k: 2, n: 2, loi: 0 },
	},
	zalo: {
		S1: { k: 14, n: 15, loi: 0 },
		S2: { k: 5, n: 5, loi: 0 },
		S3: { k: 8, n: 8, loi: 0 },
		"S6-gan": { k: 4, n: 4, loi: 0 },
		"S6-ngoai": { k: 4, n: 4, loi: 0 },
		S7: { k: 10, n: 10, loi: 0 },
		"ngoai-kho": { k: 2, n: 3, loi: 1 },
	},
	khongDat: [
		"m02 (luot 1: sai)",
		"m05 (luot 1: loi)",
		"m07 (luot 2: khong-chuyen)",
		"m29 (luot 1: sai)",
		"m37 (luot 1: sai)",
		"m47 (luot 2: chuyen)",
		"m48 (luot 2: loi)",
	],
};

const jsonlCua = (ds: DongTungCau[]) => `${ds.map((d) => JSON.stringify(d)).join("\n")}\n`;
const baoCaoCua = (ds: DongTungCau[], boTho = BO_THO) =>
	ghiBaoCao({
		bam: bam(boTho),
		bamTroLy: "a".repeat(64),
		maCham: 1,
		luot: ".acceptance-runs/tro-ly-doc-kho/cham-bo-do/gia",
		tong: ["dungTrang gia"],
		bang: tinhBang(BO, ds),
		soLuot: { mot: 46, hai: 50 },
	});

describe("bang-do", () => {
	test("tinhBang tren fixture sinh bang dongTungCau bang dung bang viet truoc", () => {
		const ds = fixture();
		expect(ds.filter((d) => d.luot === 1).length).toBe(46);
		expect(ds.filter((d) => d.luot === 2).length).toBe(50);
		expect(tinhBang(BO, ds)).toEqual(BANG_VIET_TRUOC);
	});

	test("ghiBaoCao roi docBaoCao khu hoi", () => {
		const md = baoCaoCua(fixture());
		expect(docBaoCao(md)).toEqual({ bam: bam(BO_THO), maCham: 1, bang: BANG_VIET_TRUOC });
	});

	test("kiemBangChung lanh thi ok", () => {
		const ds = fixture();
		const k = kiemBangChung(BO_THO, baoCaoCua(ds), jsonlCua(ds));
		expect(k.ok).toBe(true);
	});

	const ca: [string, () => [string, string | null, string | null], string][] = [
		["sua mot o k", () => {
			const ds = fixture();
			return [BO_THO, baoCaoCua(ds).replace('"k": 13', '"k": 12'), jsonlCua(ds)];
		}, "tang.S1.k"],
		["jsonl thieu mot ma", () => {
			const ds = fixture();
			return [BO_THO, baoCaoCua(ds), jsonlCua(ds.filter((d) => !(d.luot === 1 && d.id === "m03")))];
		}, "thieu m03"],
		["bam khac", () => {
			const ds = fixture();
			return [BO_THO, baoCaoCua(ds, `${BO_THO} `), jsonlCua(ds)];
		}, "bam lech"],
		["thieu tep jsonl", () => [BO_THO, baoCaoCua(fixture()), null], BO_MAU.bangChung.tungCau],
		["bang chu bi sua tay", () => {
			const ds = fixture();
			return [BO_THO, baoCaoCua(ds).replace("| S2 | 5 | 5 |", "| S2 | 4 | 5 |"), jsonlCua(ds)];
		}, "bang chu"],
	];
	for (const [ten, dung, ghim] of ca)
		test(`do: ${ten}`, () => {
			const k = kiemBangChung(...dung());
			expect(k.ok).toBe(false);
			if (!k.ok) expect(k.loi).toContain(ghim);
		});

	describe("cli kiem", () => {
		const chay = (thuMuc: string) =>
			spawnSync("bun", [LENH], {
				encoding: "utf8",
				env: { ...process.env, [BO_MAU.bien.evidence]: thuMuc },
			});

		test("md lech o thi thoat 1 va ghim o", () => {
			const t = mkdtempSync(join(tmpdir(), "bcm-ev-"));
			try {
				const ds = fixture();
				writeFileSync(join(t, BO_MAU.bangChung.baoCao), baoCaoCua(ds).replace('"k": 13', '"k": 12'));
				writeFileSync(join(t, BO_MAU.bangChung.tungCau), jsonlCua(ds));
				const r = chay(t);
				expect(r.status).toBe(1);
				expect(r.stdout).toContain("tang.S1.k");
			} finally {
				rmSync(t, { recursive: true, force: true });
			}
		});

		test("md lanh thi thoat 0, in khop, khong sinh tep", () => {
			const t = mkdtempSync(join(tmpdir(), "bcm-ev-"));
			try {
				const ds = fixture();
				writeFileSync(join(t, BO_MAU.bangChung.baoCao), baoCaoCua(ds));
				writeFileSync(join(t, BO_MAU.bangChung.tungCau), jsonlCua(ds));
				const truoc = readdirSync(t).sort();
				const r = chay(t);
				expect(r.status).toBe(0);
				expect(r.stdout).toContain("khop");
				expect(r.stdout).toContain("luot 1: 46 ma");
				expect(readdirSync(t).sort()).toEqual(truoc);
			} finally {
				rmSync(t, { recursive: true, force: true });
			}
		});
	});
});

describe("ma-thoat", () => {
	const trangThaiTroLy = () =>
		spawnSync("git", ["-C", BO_MAU.duong.goc, "status", "--porcelain", "--", "_acceptance/tro-ly-doc-kho"], { encoding: "utf8" }).stdout;

	function chayGia(ca: string) {
		const goc = mkdtempSync(join(tmpdir(), "bcm-gia-"));
		const chay = join(goc, "chay");
		const r = spawnSync("bun", [LENH, "--do"], {
			encoding: "utf8",
			env: {
				...process.env,
				[BO_MAU.bien.lenhCham]: `bun ${JSON.stringify(CHAM_GIA)}`,
				[BO_MAU.bien.chay]: chay,
				CHAM_GIA_CA: ca,
				CHAM_GIA_DIR: join(goc, "luot"),
			},
		});
		const ra = (() => {
			try {
				const d = readdirSync(chay).filter((x) => x !== "luot");
				return d.length ? readFileSync(join(chay, d[0] as string, BO_MAU.bangChung.baoCao), "utf8") : "";
			} catch {
				return "";
			}
		})();
		rmSync(goc, { recursive: true, force: true });
		return { r, ra };
	}

	const ca: [string, string, number, string[]][] = [
		["gia thoat 0 du ma", "0", 0, ["ma thoat cham-bo-do: 0"]],
		["gia thoat 1 du ma", "1", 0, ["ma thoat cham-bo-do: 1"]],
		["gia thoat 2", "2", 2, ["KHONG DO DUOC"]],
		["luot mot thieu m01 lap m02", "thieu", 2, ["KHONG DO DUOC", "thieu m01", "trung m02"]],
		["luot hai thieu m50", "thieu-zalo", 2, ["KHONG DO DUOC", "thieu m50"]],
	];
	for (const [ten, maGia, maLenh, ghim] of ca)
		test(`${ten} → lenh thoat ${maLenh}`, () => {
			const truoc = trangThaiTroLy();
			const { r, ra } = chayGia(maGia);
			expect(r.status).toBe(maLenh);
			for (const g of ghim) expect(`${r.stdout}\n${ra}`).toContain(g);
			if (maLenh === 0) {
				expect(ra).toContain(`bam bo-mau: ${bam(BO_THO)}`);
				expect(ra).toMatch(/^bam tro-ly: [0-9a-f]{64}$/m);
				expect(ra).toContain("luot 1: 46 ma");
				expect(ra).toContain("luot 2: 50 ma");
			}
			expect(trangThaiTroLy()).toBe(truoc);
		});
});
