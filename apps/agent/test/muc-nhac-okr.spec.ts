import { describe, expect, test } from "bun:test";
import type { ViecNhac } from "@crm/db/onboarding-nhac";
import { dungTin, TIEU_DE } from "../agent/lib/tin-nhac";

const im: ViecNhac = {
	loai: "okr-kr-im",
	keyResultId: "kr-1",
	objectiveId: "mt-1",
	nhan: "Doanh thu",
	soNgay: 15,
	chuTen: null,
};

const MAU: { [K in ViecNhac["loai"]]: Extract<ViecNhac, { loai: K }> } = {
	"okr-cap-nhat": {
		loai: "okr-cap-nhat",
		krIds: ["kr-1"],
		nhan: "Doanh thu",
		soKr: 1,
	},
	"buoc-qua-han": {
		loai: "buoc-qua-han",
		planId: "p-1",
		stepId: "s-1",
		companyName: "Công ty A",
		nhan: "Ký hợp đồng",
		goiY: "Ký hợp đồng",
		han: "2026-10-10",
		soNgay: 3,
	},
	"buoc-sap-han": {
		loai: "buoc-sap-han",
		planId: "p-2",
		stepId: "s-2",
		companyName: "Công ty B",
		nhan: "Gửi báo giá",
		goiY: "Gửi báo giá",
		han: "2026-10-15",
		soNgay: 2,
	},
	"ke-hoach-im": {
		loai: "ke-hoach-im",
		planId: "p-3",
		companyName: "Công ty C",
		nhan: "Công ty C",
		goiY: "Giao bước «Gọi điện»",
		soNgay: 8,
	},
	"moc-ngay": {
		loai: "moc-ngay",
		planId: "p-4",
		companyName: "Công ty D",
		nhan: "Công ty D",
		goiY: "2/5 bước xong",
		soNgay: 7,
		soBuocXong: 2,
		soBuocTong: 5,
		targetDays: 30,
	},
	"okr-kr-im": im,
	"okr-duoc-giao": {
		loai: "okr-duoc-giao",
		objectiveId: "mt-2",
		keyResultId: "kr-2",
		nhan: "Khách mới",
	},
	"okr-nhac-ten": {
		loai: "okr-nhac-ten",
		commentId: "c-1",
		objectiveId: "mt-3",
		nhan: "Tăng trưởng",
		nguoiTen: "Bình",
	},
	"okr-theo-doi": {
		loai: "okr-theo-doi",
		objectiveId: "mt-4",
		nhan: "Giữ chân",
		capNhat: 1,
		binhLuan: 2,
	},
};

describe("loai-la", () => {
	test("loai-la: muc loai okr-moi lam dungTin nem, thong diep neu ten loai", () => {
		const la = { ...im, loai: "okr-moi" } as unknown as ViecNhac;
		let loi = "";
		try {
			dungTin("An", [im, la], () => null);
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (!loi.includes("okr-moi")) {
			throw new Error("loai-la: okr-moi bi bo im");
		}
	});

	test("loai-la: doi chung bo muc la -> dung mot dong KR im", () => {
		const { text } = dungTin("An", [im], () => null);
		expect(
			text.split("\n").filter((d) => d.includes("«Doanh thu» im 15 ngày")),
		).toHaveLength(1);
	});

	test("loai-la: moi loai co mau dung mot tin mot muc, khong nem, mot dong duoi tieu de cua no", () => {
		for (const v of Object.values(MAU)) {
			const { text, daGui } = dungTin("An", [v], () => null);
			const dong = text.split("\n");
			const tieuDe = dong.indexOf(`*${TIEU_DE[v.loai]}*`);
			expect({
				loai: v.loai,
				daGui: daGui.length,
				coTieuDe: tieuDe > 0,
			}).toEqual({ loai: v.loai, daGui: 1, coTieuDe: true });
			expect(dong[tieuDe + 1]?.startsWith("• ")).toBe(true);
		}
	});
});
