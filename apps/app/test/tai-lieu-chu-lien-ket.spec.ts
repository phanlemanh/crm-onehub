import { describe, expect, test } from "bun:test";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";

const LOI_TIM = {
	vi: "Chưa tìm được trang — thử gõ lại.",
	en: "Couldn't search pages — try typing again.",
} as const;

describe("kn-chu", () => {
	test("kn-chu: cau loi tim cua hop chen lien ket dung o hai ngon ngu, cung tap khoa", () => {
		const sai: string[] = [];
		for (const ngon of ["vi", "en"] as const) {
			const nhom = taiLieuMessages(ngon).soan.lienKetTrang as Record<
				string,
				string
			>;
			if (!("loiTim" in nhom)) sai.push(`kn-chu: thieu loiTim o ${ngon}`);
			else if (nhom.loiTim !== LOI_TIM[ngon]) {
				sai.push(`kn-chu: loiTim ${ngon} lech: ${nhom.loiTim}`);
			}
		}
		const khoa = (ngon: "vi" | "en") =>
			Object.keys(taiLieuMessages(ngon).soan.lienKetTrang).sort();
		expect(sai).toEqual([]);
		expect(khoa("en")).toEqual(khoa("vi"));
	});
});
