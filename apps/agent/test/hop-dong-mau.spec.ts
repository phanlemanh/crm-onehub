import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
	cpSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	boHopDongMau,
	MA_HOP_DONG_MAU,
	NHAN_HOP_DONG_MAU,
	type TepHopDongMau,
} from "@crm/validation/hop-dong-mau";
import { PDFDocument } from "pdf-lib";
import { docChu, type KetQuaDocChu } from "../agent/lib/tai-lieu-doc-chu";

const THUOC_TINH = ["ngayKy", "ngayHetHan", "giaTri"] as const;
type ThuocTinh = (typeof THUOC_TINH)[number];

const BANG_CA = {
	HD1: { kieu: "pdf", coChu: true, rong: [] },
	HD2: { kieu: "pdf", coChu: true, rong: [] },
	HD3: { kieu: "docx", coChu: true, rong: [] },
	HD4: { kieu: "docx", coChu: true, rong: ["giaTri"] },
	HD5: { kieu: "pdf", coChu: false, rong: [] },
	HD6: { kieu: "pdf", coChu: true, rong: ["ngayHetHan"] },
} satisfies Record<
	(typeof MA_HOP_DONG_MAU)[number],
	{ kieu: "pdf" | "docx"; coChu: boolean; rong: ThuocTinh[] }
>;

const BANG_GIA_TRI = {
	HD1: ["2026-03-05", "2027-03-04", 1250000000],
	HD2: ["2026-04-12", "2027-04-11", 860000000],
	HD3: ["2026-06-20", "2028-06-19", 2300000000],
	HD4: ["2026-07-15", "2026-12-31", null],
	HD5: ["2026-08-01", "2027-07-31", 480000000],
	HD6: ["2026-09-10", null, 1400000000],
} satisfies Record<
	(typeof MA_HOP_DONG_MAU)[number],
	[string | null, string | null, number | null]
>;

const SO_O_NHAN = 17;
const SO_O_DOC_CHU = 47;

function sha(byte: Uint8Array): string {
	return createHash("sha256").update(byte).digest("hex");
}

function kiemDapAn(bo: TepHopDongMau[]): void {
	if (
		bo.length !== MA_HOP_DONG_MAU.length ||
		bo.some((t, i) => t.ma !== MA_HOP_DONG_MAU[i])
	) {
		throw new Error(`hdm bo mau: dap an ${bo.length}`);
	}
	for (const t of bo) {
		const ca = BANG_CA[t.ma];
		if (t.kieu !== ca.kieu) throw new Error(`hdm bo mau: ${t.ma} lech kieu`);
		if (t.coChu !== ca.coChu) throw new Error(`hdm bo mau: ${t.ma} lech coChu`);
		for (const k of THUOC_TINH) {
			if ((t[k] === null) !== ca.rong.includes(k)) {
				throw new Error(`hdm bo mau: ${t.ma} lech ${k}`);
			}
		}
	}
}

function kiemSha(bo: TepHopDongMau[]): void {
	for (const t of bo) {
		if (sha(t.byte) !== t.sha256) throw new Error(`hdm bo mau: sha ${t.ma}`);
	}
}

function cacDong(kq: KetQuaDocChu): string[] {
	if (kq.loai !== "chu") return [];
	return kq.chu
		.split("\n")
		.map((d) => d.trim())
		.filter(Boolean);
}

async function sieuDuLieu(t: TepHopDongMau): Promise<string[]> {
	if (t.kieu === "pdf") {
		const pdf = await PDFDocument.load(t.byte, { updateMetadata: false });
		return [pdf.getTitle() ?? "", pdf.getSubject() ?? ""];
	}
	const xml = new TextDecoder().decode(t.byte);
	const lay = (the: string) =>
		xml.match(new RegExp(`<dc:${the}>([^<]*)</dc:${the}>`))?.[1] ?? "";
	return [lay("title"), lay("subject")];
}

async function kiemNhan(bo: TepHopDongMau[]): Promise<number> {
	let o = 0;
	for (const t of bo) {
		o += 1;
		if (!t.tenTep.startsWith(NHAN_HOP_DONG_MAU.tienToTen)) {
			throw new Error(`hdm bo mau: nhan ${t.ma} ten`);
		}
		o += 1;
		const [tieuDe, chuDe] = await sieuDuLieu(t);
		if (
			tieuDe !== NHAN_HOP_DONG_MAU.sieuDuLieu ||
			chuDe !== NHAN_HOP_DONG_MAU.sieuDuLieu
		) {
			throw new Error(`hdm bo mau: nhan ${t.ma} sieu du lieu`);
		}
		if (!t.coChu) continue;
		o += 1;
		const dau = cacDong(await docChu(t.byte, t.kieu))[0];
		if (dau !== NHAN_HOP_DONG_MAU.dongDau) {
			throw new Error(`hdm bo mau: nhan ${t.ma} dong dau`);
		}
	}
	if (o !== SO_O_NHAN) throw new Error(`hdm bo mau: thieu o ${o}`);
	return o;
}

function congThang(ngay: string, thang: number, ngayThem: number): string {
	const d = new Date(`${ngay}T00:00:00.000Z`);
	d.setUTCMonth(d.getUTCMonth() + thang);
	d.setUTCDate(d.getUTCDate() + ngayThem);
	return d.toISOString().slice(0, 10);
}

const NGAY_CHU = /ngày (\d{2}) tháng (\d{2}) năm (\d{4})/;
const NGAY_SO = /(\d{2})\/(\d{2})\/(\d{4})/;
const TIEN = /(\d{1,3}(?:\.\d{3})+) đồng/;

function giaTriCuaDoan(k: ThuocTinh, doan: string): string | number | null {
	if (k === "giaTri") {
		const m = doan.match(TIEN);
		return m?.[1] ? Number(m[1].replaceAll(".", "")) : null;
	}
	const m = doan.match(NGAY_CHU) ?? doan.match(NGAY_SO);
	return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function moTa(kq: KetQuaDocChu): string {
	return kq.loai === "chu" ? "chu" : `${kq.loai} ${kq.lyDo}`;
}

async function kiemDocChu(bo: TepHopDongMau[]): Promise<number> {
	let o = 0;
	const chu = new Map<string, string>();
	for (const t of bo) {
		o += 3;
		const [ky, het, gia] = BANG_GIA_TRI[t.ma];
		const dapAn: [ThuocTinh, string | number | null][] = [
			["ngayKy", ky],
			["ngayHetHan", het],
			["giaTri", gia],
		];
		for (const [k, v] of dapAn) {
			if (t[k] !== v) throw new Error(`hdm doc chu: ${t.ma} dap an ${k}`);
		}
		const kq = await docChu(t.byte, t.kieu);
		if (!t.coChu) {
			o += 1;
			if (kq.loai !== "can-go-tay") {
				throw new Error(`hdm doc chu: ${t.ma} ${moTa(kq)}`);
			}
			continue;
		}
		if (kq.loai !== "chu") {
			throw new Error(`hdm doc chu: ${t.ma} khong ra chu ${moTa(kq)}`);
		}
		chu.set(t.ma, kq.chu);
		for (const k of THUOC_TINH) {
			const doan = t.doan[k];
			if (t[k] === null) continue;
			o += 2;
			const giaTri = doan ? giaTriCuaDoan(k, doan) : null;
			if (giaTri === null && !(k === "ngayHetHan" && t.suyTu)) {
				throw new Error(`hdm doc chu: ${t.ma} doan khong doc ${k}`);
			}
			if (giaTri !== null && giaTri !== t[k]) {
				throw new Error(`hdm doc chu: ${t.ma} doan lech ${k}`);
			}
			if (!doan || !kq.chu.includes(doan)) {
				throw new Error(`hdm doc chu: ${t.ma} thieu ${k}`);
			}
		}
	}
	const hd2 = bo.find((t) => t.ma === "HD2");
	if (!hd2?.ngayKy || hd2.ngayHetHan !== congThang(hd2.ngayKy, 12, -1)) {
		throw new Error("hdm doc chu: HD2 suy het han");
	}
	const roRi: [string, ThuocTinh][] = [
		["HD4", "giaTri"],
		["HD6", "ngayHetHan"],
	];
	for (const [ma, k] of roRi) {
		o += 1;
		const cuaNo = chu.get(ma) ?? "";
		for (const khac of bo) {
			const doan = khac.doan[k];
			if (khac.ma !== ma && doan && cuaNo.includes(doan)) {
				throw new Error(`hdm doc chu: ${ma} lo ${k} ${khac.ma}`);
			}
		}
	}
	for (const k of THUOC_TINH) {
		for (const a of bo) {
			for (const b of bo) {
				if (a.ma < b.ma && a[k] !== null && a[k] === b[k]) {
					throw new Error(`hdm doc chu: trung ${k} ${a.ma} ${b.ma}`);
				}
			}
		}
	}
	if (o !== SO_O_DOC_CHU) throw new Error(`hdm doc chu: thieu o ${o}`);
	return o;
}

function banChep(): string {
	const thuMuc = mkdtempSync(join(tmpdir(), "hdm-bo-mau-"));
	cpSync(boHopDongMau().thuMuc, thuMuc, { recursive: true });
	return thuMuc;
}

function doiTep(
	bo: TepHopDongMau[],
	ma: string,
	doi: Partial<TepHopDongMau>,
): TepHopDongMau[] {
	return bo.map((t) => (t.ma === ma ? { ...t, ...doi } : t));
}

describe("hdm-bo-mau", () => {
	test("hdm-bo-mau: sáu tệp đúng bảng ca, sha khớp đáp án, nhãn mẫu ở ba chỗ", async () => {
		const bo = boHopDongMau().tep;
		kiemDapAn(bo);
		kiemSha(bo);
		expect(await kiemNhan(bo)).toBe(SO_O_NHAN);
	});

	test("hdm-bo-mau: đổi một byte hay xoá nhãn trong bản chép thì đỏ đúng chỗ", async () => {
		const thuMuc = banChep();
		try {
			const tenHd3 = boHopDongMau(thuMuc).tep.find(
				(t) => t.ma === "HD3",
			)?.tenTep;
			if (!tenHd3) throw new Error("hdm bo mau: thieu HD3");
			const byte = new Uint8Array(readFileSync(join(thuMuc, tenHd3)));
			byte[byte.length - 1] = (byte[byte.length - 1] ?? 0) ^ 0xff;
			writeFileSync(join(thuMuc, tenHd3), byte);
			expect(() => kiemSha(boHopDongMau(thuMuc).tep)).toThrow(
				"hdm bo mau: sha HD3",
			);

			const hd1 = boHopDongMau(thuMuc).tep.find((t) => t.ma === "HD1");
			if (!hd1) throw new Error("hdm bo mau: thieu HD1");
			const pdf = await PDFDocument.load(hd1.byte, { updateMetadata: false });
			pdf.setTitle("");
			writeFileSync(join(thuMuc, hd1.tenTep), await pdf.save());
			await expect(kiemNhan(boHopDongMau(thuMuc).tep)).rejects.toThrow(
				"hdm bo mau: nhan HD1 sieu du lieu",
			);

			const lanh = boHopDongMau().tep;
			expect(() => kiemSha(lanh)).not.toThrow();
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	});
});

describe("hdm-doc-chu", () => {
	test("hdm-doc-chu: bộ đọc chữ của Kara ra đúng đáp án, bản quét cần gõ tay", async () => {
		expect(await kiemDocChu(boHopDongMau().tep)).toBe(SO_O_DOC_CHU);
	});

	test("hdm-doc-chu: tráo byte hay đảo ngày tháng đáp án thì đỏ đúng chỗ", async () => {
		const bo = boHopDongMau().tep;
		const byteCua = (ma: string) => bo.find((t) => t.ma === ma)?.byte;
		await expect(
			kiemDocChu(doiTep(bo, "HD5", { byte: byteCua("HD1") })),
		).rejects.toThrow("hdm doc chu: HD5 chu");
		await expect(
			kiemDocChu(doiTep(bo, "HD1", { byte: byteCua("HD2") })),
		).rejects.toThrow("hdm doc chu: HD1 thieu ngayKy");
		await expect(
			kiemDocChu(doiTep(bo, "HD2", { ngayKy: "2026-12-04" })),
		).rejects.toThrow("hdm doc chu: HD2 dap an ngayKy");
		const hd1 = bo.find((t) => t.ma === "HD1");
		if (!hd1) throw new Error("hdm doc chu: thieu HD1");
		await expect(
			kiemDocChu(
				doiTep(bo, "HD1", {
					doan: { ...hd1.doan, ngayKy: "ngày 06 tháng 03 năm 2026" },
				}),
			),
		).rejects.toThrow("hdm doc chu: HD1 doan lech ngayKy");
		await expect(
			kiemDocChu(
				doiTep(bo, "HD1", {
					doan: { ...hd1.doan, giaTri: "1.520.000.000 đồng" },
				}),
			),
		).rejects.toThrow("hdm doc chu: HD1 doan lech giaTri");
	});
});
