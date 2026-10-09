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
	nhip,
	nut,
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

describe("k3-neo-kr", () => {
	const cuonGoc = HTMLElement.prototype.scrollIntoView;

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

	test("k3-neo-kr khung mo tu URL neo KR: focus va lam noi gop y dau tien cua dung KR", async () => {
		HTMLElement.prototype.scrollIntoView = () => {};
		try {
			for (const [kr, d] of [
				[KR_2, D_KR2],
				[KR_1, D_KR1],
			] as const) {
				kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
				kho.troLy = () => dsTroLy([D_KR1, D_KR2]);
				const san = await dungSheet({
					thamSo: `?record=objective:${MT_ID}&neoGopY=true&neoGopYKr=${kr.id}`,
				});
				await cho(
					() => san.url().get("neoGopYKr") === null,
					`${kr.id} bo khoa neo`,
				);
				await nhip(4);
				const dang = document.activeElement;
				if (dang === null || dang === document.body)
					throw new Error("focus roi ve body");
				const o = dang.closest("[data-kara-proposal-kr]");
				kiemCa(
					{
						kr: o?.getAttribute("data-kara-proposal-kr") ?? null,
						gopY: o?.getAttribute("data-gop-y") ?? null,
						noi: o?.getAttribute("data-highlighted") ?? null,
					},
					{ kr: kr.id, gopY: d.id, noi: "true" },
					(k) => `${kr.id} neo sai: ${k}`,
				);
				await thaoHet();
			}
		} finally {
			HTMLElement.prototype.scrollIntoView = cuonGoc;
		}
	});

	test("k3-neo-kr id la: khong co gop y cua KR do thi cuon toi vung Kara, bo ca hai khoa, khong lam noi dong nao", async () => {
		const daCuon: string[] = [];
		HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
			daCuon.push(this.hasAttribute("data-vung-kara") ? "vung" : "khac");
		};
		try {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
			kho.troLy = () => dsTroLy([D_DOI_TRONG, D_KR1]);
			const san = await dungSheet({
				thamSo: `?record=objective:${MT_ID}&neoGopY=true&neoGopYKr=kr-khong-co`,
			});
			await cho(() => san.url().get("neoGopY") === null, "bo khoa neo");
			kiemCa(
				{
					neoKr: san.url().get("neoGopYKr"),
					noi: qs("[data-highlighted=true]") !== null,
					cuon: daCuon.join(","),
				},
				{ neoKr: null, noi: false, cuon: "vung" },
				(k) => `neo id la sai: ${k}`,
			);
		} finally {
			HTMLElement.prototype.scrollIntoView = cuonGoc;
		}
	});
});
