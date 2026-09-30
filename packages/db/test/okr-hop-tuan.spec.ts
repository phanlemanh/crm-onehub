import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import { type KrSo, type LyDoHop, lyDoCua } from "../src/okr-hop-tuan";

const vn = (s: string) => new Date(`${s}+07:00`);

const HOM_NAY = vn("2026-11-18T10:00:00");

const lan = (
	tuan: string,
	luc: string,
	tuTin: MucTuTin,
	ghiChu = "",
): KrSo["lan"][number] => ({ tuan, luc: vn(luc), tuTin, ghiChu, giaTri: 0 });

const kr = (l: KrSo["lan"], khoaLuc: string | null = null): KrSo => ({
	id: "K",
	thuTu: 0,
	khoaLuc: khoaLuc ? vn(khoaLuc) : null,
	lan: l,
});

const BANG: [string, KrSo, LyDoHop[]][] = [
	[
		"tut-1-bac",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
			lan("2026-11-16", "2026-11-17T09:00:00", "vua"),
		]),
		[{ loai: "tut", tu: "cao", den: "vua", bac: 1 }],
	],
	[
		"tut-2-bac",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
			lan("2026-11-16", "2026-11-17T09:00:00", "thap"),
		]),
		[{ loai: "tut", tu: "cao", den: "thap", bac: 2 }],
	],
	[
		"tut-so-tuan-truoc-hai-lan-tuan-nay",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
			lan("2026-11-16", "2026-11-16T09:00:00", "vua"),
			lan("2026-11-16", "2026-11-17T09:00:00", "thap"),
		]),
		[{ loai: "tut", tu: "cao", den: "thap", bac: 2 }],
	],
	[
		"khong-tut-khi-lan-cuoi-tuan-nay-lai-cao",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
			lan("2026-11-16", "2026-11-16T09:00:00", "thap"),
			lan("2026-11-16", "2026-11-17T09:00:00", "cao"),
		]),
		[],
	],
	[
		"tang-bac-khong-tut",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "thap"),
			lan("2026-11-16", "2026-11-17T09:00:00", "cao"),
		]),
		[],
	],
	["im-13", kr([lan("2026-11-02", "2026-11-05T09:00:00", "vua")]), []],
	[
		"im-14",
		kr([lan("2026-11-02", "2026-11-04T09:00:00", "vua")]),
		[{ loai: "im", soNgay: 14 }],
	],
	[
		"im-15",
		kr([lan("2026-11-02", "2026-11-03T09:00:00", "cao")]),
		[{ loai: "im", soNgay: 15 }],
	],
	[
		"im-14-tu-khoa-luc",
		kr([], "2026-11-04T09:00:00"),
		[{ loai: "im", soNgay: 14 }],
	],
	["im-13-tu-khoa-luc", kr([], "2026-11-05T09:00:00"), []],
	[
		"im-tinh-tu-lan-cuoi-khong-tu-khoa-luc",
		kr(
			[lan("2026-11-09", "2026-11-12T09:00:00", "vua")],
			"2026-10-05T09:00:00",
		),
		[],
	],
	[
		"ghi-chu-truoc-dau-tuan-truoc",
		kr([lan("2026-11-02", "2026-11-08T23:00:00", "vua", "Chờ duyệt")]),
		[],
	],
	[
		"ghi-chu-sau-dau-tuan-truoc",
		kr([lan("2026-11-09", "2026-11-09T00:30:00", "vua", "Chờ duyệt")]),
		[{ loai: "ghi-chu", ngay: "2026-11-09" }],
	],
	[
		"ghi-chu-toan-khoang-trang",
		kr([lan("2026-11-09", "2026-11-12T09:00:00", "vua", "   ")]),
		[],
	],
	[
		"ghi-chu-gan-nhat-thang",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "vua", "Cũ"),
			lan("2026-11-16", "2026-11-17T09:00:00", "vua", "Mới"),
		]),
		[{ loai: "ghi-chu", ngay: "2026-11-17" }],
	],
	[
		"tut-roi-ghi-chu",
		kr([
			lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
			lan("2026-11-16", "2026-11-17T11:00:00", "vua", "Đối tác lùi lịch"),
		]),
		[
			{ loai: "tut", tu: "cao", den: "vua", bac: 1 },
			{ loai: "ghi-chu", ngay: "2026-11-17" },
		],
	],
	["kr-trong", kr([]), []],
];

describe("okr-hop-tuan", () => {
	for (const [ten, k, mong] of BANG) {
		test(`ly do lech: ${ten}`, () => {
			expect({ [`ly do lech: ${ten}`]: lyDoCua(k, HOM_NAY) }).toEqual({
				[`ly do lech: ${ten}`]: mong,
			});
		});
	}

	test("so ca cua bang", () => {
		console.log(`so ca: ${BANG.length}`);
		expect(BANG.length).toBe(17);
	});

	test("tep hop-tuan.ts khong con o apps/api/src/okr", () => {
		const cu = join(import.meta.dir, "../../../apps/api/src/okr/hop-tuan.ts");
		expect({ "hop-tuan.ts con o API": existsSync(cu) }).toEqual({
			"hop-tuan.ts con o API": false,
		});
	});
});
