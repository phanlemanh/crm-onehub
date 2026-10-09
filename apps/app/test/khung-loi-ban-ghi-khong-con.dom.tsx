import { describe, expect, test } from "bun:test";
import { karaBanGhiMessages } from "@/lib/messages/kara-ban-ghi";

const MONG = {
	vi: {
		moTa: "Có thể bản ghi đã bị xoá, hoặc đường dẫn không đúng.",
		cam: ["vĩnh viễn", "Đã có người"],
		tieuDe: "Bản ghi này không còn",
		dong: "Đóng",
	},
	en: {
		moTa: "It may have been deleted, or the link is wrong.",
		cam: ["permanently", "Someone deleted"],
		tieuDe: "This record no longer exists",
		dong: "Close",
	},
} as const;

describe("kkc-chu", () => {
	for (const ngu of ["vi", "en"] as const) {
		const khung = karaBanGhiMessages(ngu).khung.khongCon;
		const mong = MONG[ngu];

		test(`kkc-chu ${ngu}: moTa`, () => {
			expect(`kkc-chu ${ngu}: moTa -> ${khung.moTa}`).toBe(
				`kkc-chu ${ngu}: moTa -> ${mong.moTa}`,
			);
		});

		for (const chu of mong.cam) {
			test(`kkc-chu ${ngu}: khong chua «${chu}»`, () => {
				expect(khung.moTa.includes(chu)).toBe(false);
			});
		}

		test(`kkc-chu ${ngu}: tieu de va nut giu nguyen`, () => {
			expect(`${khung.tieuDe} | ${khung.dong}`).toBe(
				`${mong.tieuDe} | ${mong.dong}`,
			);
		});
	}
});
