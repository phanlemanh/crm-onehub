import { describe, expect, it } from "bun:test";
import { DIA_CHI, diaChiDaKy } from "@crm/auth/dia-chi";
import { headerGuiApi } from "@/lib/api-proxy-headers";

const KHOA = "khoa-thu-proxy";
const DIA_CHI_NEN_TANG = "203.0.113.9";
const DIA_CHI_TRINH_DUYET = "9.9.9.9";

function vaoTuTrinhDuyet(): Headers {
	return new Headers({
		host: "crm.example.test",
		[DIA_CHI.nenTang]: DIA_CHI_NEN_TANG,
		"x-forwarded-for": DIA_CHI_TRINH_DUYET,
		[DIA_CHI.goc]: "6.6.6.6",
		[DIA_CHI.ky]: "chu-ky-gia",
		[DIA_CHI.tin]: "6.6.6.6",
	});
}

describe("proxy ky dia chi", () => {
	it("ky dia chi nen tang, ben doc that cua API doc ra dung dia chi do", () => {
		const ra = headerGuiApi(vaoTuTrinhDuyet(), KHOA);
		const doc = diaChiDaKy(ra, KHOA);
		if (doc !== DIA_CHI_NEN_TANG) {
			throw new Error(`proxy ky dia chi trinh duyet tu dat: ${doc}`);
		}
		expect([...ra.values()].join(" ")).not.toContain(DIA_CHI_TRINH_DUYET);
		expect(ra.get(DIA_CHI.tin)).toBeNull();
	});

	it("thieu khoa hoac thieu dia chi nen tang thi khong co header dia chi nao va khong nem", () => {
		const thieuKhoa = headerGuiApi(vaoTuTrinhDuyet(), undefined);
		const thieuDiaChi = headerGuiApi(
			new Headers({ [DIA_CHI.goc]: "6.6.6.6", [DIA_CHI.ky]: "gia" }),
			KHOA,
		);
		for (const ra of [thieuKhoa, thieuDiaChi]) {
			expect([
				ra.get(DIA_CHI.goc),
				ra.get(DIA_CHI.ky),
				ra.get(DIA_CHI.tin),
			]).toEqual([null, null, null]);
		}
	});

	it("x-forwarded-for va host van bi xoa nhu truoc", () => {
		const ra = headerGuiApi(vaoTuTrinhDuyet(), KHOA);
		expect([ra.get("x-forwarded-for"), ra.get("host")]).toEqual([null, null]);
	});
});
