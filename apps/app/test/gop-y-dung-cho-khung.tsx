import { describe, expect, test } from "bun:test";
import { troLySanSangOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_DOI_TRONG,
	D_KR1,
	D_TEN,
	docCua,
	dsTroLy,
	dung,
	dungCuaToi,
	dungSheet,
	HopThoaiKr,
	HopThoaiMucTieu,
	HUNG,
	KR_1,
	kho,
	MT_A,
	MT_ID,
	m,
	mo,
	mtSheet,
	nhip,
	qs,
	qsa,
	SAN_SANG,
	thaoHet,
} from "./khung-gop-y-dung-cho";

describe("doi-trong", () => {
	const MA_TRAN = [
		{
			ten: "bat-co-cau-hoi",
			ds: [D_DOI_TRONG],
			sanSang: SAN_SANG,
			lyDo: null,
			canhBao: false,
		},
		{
			ten: "bat-khong-cau-hoi",
			ds: [D_TEN],
			sanSang: SAN_SANG,
			lyDo: null,
			canhBao: true,
		},
		{
			ten: "chua-bat",
			ds: [],
			sanSang: troLySanSangOutput.parse({
				bat: false,
				lyDo: "don-vi-chua-bat",
			}),
			lyDo: "don-vi-chua-bat" as const,
			canhBao: true,
		},
	];

	test("canh bao doi trong chi nhuong cho cau hoi cua Kara", async () => {
		for (const ca of MA_TRAN) {
			kho.sanSang = ca.sanSang;
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: ca.ds.length }));
			kho.troLy = () => dsTroLy(ca.ds, { lyDo: ca.lyDo });
			await dungSheet();
			await cho(
				() => docCua("okr.troLyDanhSach").length > 0,
				"doc danh sach kara",
			);
			await nhip(10);
			const co = qs("[data-canh-bao-doi-trong]") !== null;
			if (co !== ca.canhBao)
				throw new Error(
					ca.canhBao ? `mat canh bao: ${ca.ten}` : `canh bao trung: ${ca.ten}`,
				);
			expect(co).toBe(ca.canhBao);
			await thaoHet();
			kho.daDoc = [];
		}
		console.log(`so ca doi-trong: ${MA_TRAN.length}`);
	});
});

describe("trang-thai-kara", () => {
	test("danh sach, hai hop Sua va tab Vet khong con chu Tro ly OKR", async () => {
		await dungCuaToi([MT_A()]);
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
		await thaoHet();
		const mt = mtSheet({ soGopYCho: 2 });
		kho.troLy = () => dsTroLy([D_KR1]);
		await dung(
			<HopThoaiMucTieu dong={() => {}} yeuCau={{ loai: "sua", mucTieu: mt }} />,
		);
		await cho(() => qs("[data-hop-thoai-muc-tieu]") !== null, "hop muc tieu");
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
		await thaoHet();
		await dung(
			<HopThoaiKr
				chuMacDinh={HUNG.id}
				dong={() => {}}
				kr={KR_1}
				mucTieu={mt}
				objectiveId={MT_ID}
				suaDuocCot
			/>,
		);
		await cho(() => qs("[data-hop-thoai-kr]") !== null, "hop KR");
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
		await thaoHet();
		kho.chiTiet = () =>
			chiTietTu(mtSheet(), {
				trail: [
					{
						id: "v-kara",
						at: "2026-10-03T03:00:00.000Z",
						actor: HUNG,
						action: "sua-kr",
						keyResultId: KR_1.id,
						before: { title: KR_1.title },
						after: { title: D_KR1.sau ?? "" },
						note: `tro-ly-okr:${D_KR1.id}`,
					},
				],
			});
		await dungSheet();
		const tabVet = qsa("[role=tab]").find(
			(t) => t.textContent?.trim().startsWith(mo.sheet.tabVet) === true,
		);
		if (!tabVet) throw new Error("khong co tab Vet");
		await bamChuot(tabVet);
		await cho(
			() =>
				qs(
					"[role=tabpanel][data-state=active] [data-vet-hang]",
				)?.textContent?.includes(m.vet.theoKara) === true,
			"hang vet theo Kara khong hien",
		);
		expect(document.body.textContent).not.toContain("Trợ lý OKR");
	});
});
