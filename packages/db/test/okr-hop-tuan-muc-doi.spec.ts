import { describe, expect, test } from "bun:test";
import {
	ghiChuMoiNhatCua,
	type KrSo,
	type MucDoiKr,
	mucDoiCua,
} from "../src/okr-hop-tuan";

const vn = (s: string) => new Date(`${s}+07:00`);

const kr = (l: KrSo["lan"]): KrSo => ({
	id: "K",
	thuTu: 0,
	khoaLuc: null,
	lan: l,
});

const lanSo = (
	tuan: string,
	luc: string,
	giaTri: number,
	ghiChu = "",
): KrSo["lan"][number] => ({
	tuan,
	luc: vn(luc),
	tuTin: "vua",
	ghiChu,
	giaTri,
});

const MUC_DOI: [string, KrSo, MucDoiKr | null][] = [
	["chua-lan-nao", kr([]), null],
	["mot-lan", kr([lanSo("2026-11-16", "2026-11-17T09:00:00", 4)]), null],
	[
		"nhieu-tuan",
		kr([
			lanSo("2026-11-02", "2026-11-03T09:00:00", 2),
			lanSo("2026-11-09", "2026-11-10T09:00:00", 5),
			lanSo("2026-11-16", "2026-11-17T09:00:00", 8),
		]),
		{ tu: 5, den: 8, ngayTruoc: "2026-11-10" },
	],
	[
		"hai-lan-cung-tuan",
		kr([
			lanSo("2026-11-09", "2026-11-10T09:00:00", 1.17),
			lanSo("2026-11-16", "2026-11-16T09:00:00", 1.1),
			lanSo("2026-11-16", "2026-11-18T09:00:00", 1.08),
		]),
		{ tu: 1.17, den: 1.08, ngayTruoc: "2026-11-10" },
	],
	[
		"hai-lan-tuan-dau",
		kr([
			lanSo("2026-11-16", "2026-11-16T09:00:00", 3),
			lanSo("2026-11-16", "2026-11-18T09:00:00", 4),
		]),
		{ tu: 3, den: 4, ngayTruoc: "2026-11-16" },
	],
	[
		"khong-doi",
		kr([
			lanSo("2026-11-09", "2026-11-10T09:00:00", 6),
			lanSo("2026-11-16", "2026-11-17T09:00:00", 6),
		]),
		{ tu: 6, den: 6, ngayTruoc: "2026-11-10" },
	],
	[
		"moi-nhat-tuan-cu",
		kr([
			lanSo("2026-11-02", "2026-11-03T09:00:00", 1),
			lanSo("2026-11-09", "2026-11-10T09:00:00", 0),
		]),
		{ tu: 1, den: 0, ngayTruoc: "2026-11-03" },
	],
];

describe("mucDoiCua", () => {
	for (const [ten, k, mongDoi] of MUC_DOI) {
		test(ten, () => {
			expect(mucDoiCua(k)).toEqual(mongDoi);
		});
	}
	test("hai-lan-cung-tuan khong so voi lan lien truoc", () => {
		const k = MUC_DOI.find(([t]) => t === "hai-lan-cung-tuan")?.[1];
		expect(k?.lan.at(-2)?.giaTri).not.toBe(mucDoiCua(k as KrSo)?.tu);
	});
});

describe("ghiChuMoiNhatCua", () => {
	test("bo qua lan khong ghi chu, lay ngay VN cua lan mang ghi chu", () => {
		const k = kr([
			lanSo("2026-11-09", "2026-11-10T23:30:00", 5, "  cu  "),
			lanSo("2026-11-16", "2026-11-17T09:00:00", 6, "   "),
		]);
		expect(ghiChuMoiNhatCua(k)).toEqual({
			ghiChu: "  cu  ",
			ngay: "2026-11-10",
		});
	});
	test("chua ghi chu bao gio", () => {
		expect(
			ghiChuMoiNhatCua(kr([lanSo("2026-11-16", "2026-11-17T09:00:00", 1)])),
		).toBeNull();
	});
});
