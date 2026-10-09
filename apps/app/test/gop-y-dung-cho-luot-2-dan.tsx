import { describe, test } from "bun:test";
import {
	bamChuot,
	chiTietTu,
	cho,
	docCua,
	dsTroLy,
	dungSheet,
	goiCua,
	KR_1,
	KR_2,
	kho,
	kiemCa,
	MT_ID,
	mtSheet,
	qs,
} from "./khung-gop-y-dung-cho";

describe("k3-nhieu-kr", () => {
	test("k3-nhieu-kr nguoi sua duoc hai KR, khong sua duoc Muc tieu: nut Nho hien, Nho gui ca Muc tieu khong kem keyResultId", async () => {
		kho.chiTiet = () =>
			chiTietTu(mtSheet({ canEdit: false, soGopYCho: 0 }), {
				canEditKr: [KR_1.id, KR_2.id],
			});
		kho.troLy = () => dsTroLy([], { maKetThuc: null, docLuc: null });
		await dungSheet();
		await cho(
			() => qs("[data-nut=nho-kara]") !== null,
			"nut nho cho nguoi hai KR",
		);
		await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
		await cho(() => goiCua("okr.troLyDeXuat").length === 1, "da nho");
		const vao = JSON.stringify(goiCua("okr.troLyDeXuat")[0]?.vao ?? null);
		if (vao === JSON.stringify({ objectiveId: MT_ID, keyResultId: KR_1.id }))
			throw new Error("chi nho cho kr dau");
		kiemCa(
			{
				vao,
				sanSang: JSON.stringify(docCua("okr.troLySanSang")[0]?.vao ?? null),
			},
			{
				vao: JSON.stringify({ objectiveId: MT_ID }),
				sanSang: JSON.stringify({ objectiveId: MT_ID }),
			},
			(k) => `nho nhieu kr sai: ${k}`,
		);
	});
});
