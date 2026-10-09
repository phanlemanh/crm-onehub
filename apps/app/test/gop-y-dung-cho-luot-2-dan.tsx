import { describe, test } from "bun:test";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_DOI_TRONG,
	D_KR1,
	D_KR2,
	docCua,
	dsTroLy,
	dung,
	dungSheet,
	goiCua,
	HopThoaiMucTieu,
	KR_1,
	KR_2,
	kho,
	kiemCa,
	MT_ID,
	mtSheet,
	okrGopYMessages,
	qs,
	thaoHet,
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

describe("k3-cau-dan", () => {
	const CA = [
		{ ten: "gop-y-duoi-kr", ds: [D_KR1, D_KR2] },
		{ ten: "cau-hoi-ca-bo", ds: [D_DOI_TRONG] },
	] as const;

	test("k3-cau-dan hop Sua Muc tieu: cau dan dung khi gop y nam duoi KR lan khi la cau hoi cho ca bo KR, vi va en", async () => {
		for (const locale of ["vi", "en"] as const)
			for (const ca of CA) {
				const mL = okrGopYMessages(locale);
				kho.troLy = () => dsTroLy([...ca.ds]);
				await dung(
					<HopThoaiMucTieu
						dong={() => {}}
						yeuCau={{
							loai: "sua",
							mucTieu: mtSheet({ soGopYCho: ca.ds.length }),
						}}
					/>,
					"",
					locale,
				);
				await cho(
					() => qs("[data-dan-sang]") !== null,
					`${locale}/${ca.ten} dong dan`,
				);
				const cau =
					qs("[data-dan-sang] [data-slot=item-description]")?.textContent ?? "";
				if (
					ca.ten === "cau-hoi-ca-bo" &&
					(cau.includes("dưới từng KR") || cau.includes("under each KR"))
				)
					throw new Error("cau dan sai cho cau hoi ca bo");
				kiemCa(
					{ cau },
					{ cau: mL.danSang.moTaMucTieu },
					() => `${locale}/${ca.ten} cau dan sai`,
				);
				await thaoHet();
			}
	});
});
