import { describe, test } from "bun:test";
import {
	bamChuot,
	cho,
	D_DOI_TRONG,
	D_KR1,
	D_KR2,
	dsTroLy,
	dung,
	HopThoaiKr,
	HopThoaiMucTieu,
	HUNG,
	KR_1,
	KR_2,
	kho,
	kiemCa,
	MT_ID,
	m,
	mtSheet,
	nut,
	okrGopYMessages,
	qs,
	thaoHet,
} from "./khung-gop-y-dung-cho";

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

describe("k3-neo-kr", () => {
	test("k3-neo-kr Xem gop y tu hop Sua KR dua ma KR len URL", async () => {
		for (const [kr, d] of [
			[KR_2, D_KR2],
			[KR_1, D_KR1],
		] as const) {
			kho.troLy = (vao) => dsTroLy(vao?.keyResultId === kr.id ? [d] : []);
			const san = await dung(
				<HopThoaiKr
					chuMacDinh={HUNG.id}
					dong={() => {}}
					kr={kr}
					mucTieu={mtSheet({ soGopYCho: 2 })}
					objectiveId={MT_ID}
					suaDuocCot
				/>,
			);
			await cho(() => qs("[data-dan-sang]") !== null, `${kr.id} dong dan`);
			await bamChuot(
				nut(m.danSang.xem, qs("[data-dan-sang]") ?? document.body),
			);
			await cho(() => san.url().get("record") !== null, `${kr.id} mo khung`);
			kiemCa(
				{
					record: san.url().get("record"),
					neo: san.url().get("neoGopY"),
					neoKr: san.url().get("neoGopYKr"),
				},
				{ record: `objective:${MT_ID}`, neo: "true", neoKr: kr.id },
				(k) => `${kr.id} url sai: ${k}`,
			);
			await thaoHet();
		}
	});
});
