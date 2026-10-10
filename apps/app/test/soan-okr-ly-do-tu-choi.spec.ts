import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	LY_DO_TU_CHOI_NOP,
	type LyDoTuChoiNop,
} from "@crm/validation/okr-cuoc-soan";
import { okrSoanMessages } from "@/lib/messages/okr-soan";

type NgonNgu = "vi" | "en";

const CAU: Record<NgonNgu, Record<LyDoTuChoiNop, string>> = JSON.parse(
	readFileSync(
		resolve(
			import.meta.dir,
			"../../../_acceptance/ly-do-tu-choi-nop-theo-locale/rang/cau-da-duyet.json",
		),
		"utf8",
	),
);

const MA = Object.keys(LY_DO_TU_CHOI_NOP) as LyDoTuChoiNop[];

function soBanDo(
	banDo: Partial<Record<string, string>>,
	cau: Record<LyDoTuChoiNop, string>,
): string[] {
	const loi: string[] = [];
	for (const ma of MA) {
		const c = banDo[ma];
		if (c === undefined) loi.push(`thieu cau cho ma: ${ma}`);
		else if (c !== cau[ma]) loi.push(`cau sai cho ma: ${ma}`);
	}
	for (const k of Object.keys(banDo))
		if (!MA.includes(k as LyDoTuChoiNop)) loi.push(`khoa la: ${k}`);
	return loi;
}

describe("k2c-ban-do", () => {
	for (const ngonNgu of ["vi", "en"] as const) {
		test(`bản đồ câu ${ngonNgu} đủ bảy mã, từng câu bằng bảng đã duyệt`, () => {
			const banDo = okrSoanMessages(ngonNgu).moc.lyDoTuChoi;
			expect(Object.keys(banDo).sort().join(",")).toBe(
				[...MA].sort().join(","),
			);
			expect(soBanDo(banDo, CAU[ngonNgu])).toEqual([]);
		});
	}

	test("đối chứng: bản đồ giả đổi chỗ hai câu và bản đồ giả thiếu một mã bị bắt đúng thông điệp", () => {
		const that = okrSoanMessages("vi").moc.lyDoTuChoi;
		const doiCho = {
			...that,
			cuocKhongDang: that.phienKhongSong,
			phienKhongSong: that.cuocKhongDang,
		};
		expect(soBanDo(doiCho, CAU.vi)).toEqual([
			"cau sai cho ma: cuocKhongDang",
			"cau sai cho ma: phienKhongSong",
		]);
		const { phienKhongSong: _bo, ...thieu } = that;
		expect(soBanDo(thieu, CAU.vi)).toEqual([
			"thieu cau cho ma: phienKhongSong",
		]);
	});
});
