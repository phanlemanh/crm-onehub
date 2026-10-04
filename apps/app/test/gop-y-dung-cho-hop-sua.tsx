import { describe, expect, test } from "bun:test";
import {
	bamChuot,
	cho,
	dong,
	dsTroLy,
	dung,
	goChu,
	HopThoaiKr,
	HopThoaiMucTieu,
	HUNG,
	KR_1,
	kho,
	kiemCa,
	MT_ID,
	m,
	mtSheet,
	nhip,
	nut,
	nutCo,
	qs,
	qsa,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";

describe("hop-sua", () => {
	const MA_TRAN = [
		{ ten: "hop-muc-tieu", hop: "muc-tieu", so: 3 },
		{ ten: "hop-muc-tieu", hop: "muc-tieu", so: 0 },
		{ ten: "hop-kr", hop: "kr", so: 1 },
		{ ten: "hop-kr", hop: "kr", so: 0 },
	] as const;

	function dungHop(ca: (typeof MA_TRAN)[number], dongHop: () => void) {
		const mt = mtSheet({ soGopYCho: ca.hop === "muc-tieu" ? ca.so : 0 });
		kho.troLy = (vao) =>
			dsTroLy(
				ca.hop === "kr" && vao?.keyResultId === KR_1.id
					? Array.from({ length: ca.so }, (_, i) =>
							dong(`d-kr1-${i}`, {
								keyResultId: KR_1.id,
								truong: "kr.title",
								truoc: KR_1.title,
								sau: `Tên mới ${i}`,
							}),
						)
					: [],
			);
		return ca.hop === "muc-tieu" ? (
			<HopThoaiMucTieu dong={dongHop} yeuCau={{ loai: "sua", mucTieu: mt }} />
		) : (
			<HopThoaiKr
				chuMacDinh={HUNG.id}
				dong={dongHop}
				kr={KR_1}
				mucTieu={mt}
				objectiveId={MT_ID}
				suaDuocCot
			/>
		);
	}

	const hop = () =>
		qs("[data-hop-thoai-muc-tieu]") ?? qs("[data-hop-thoai-kr]");

	test("khong con cot, dong dan dung so", async () => {
		for (const ca of MA_TRAN) {
			await dung(dungHop(ca, () => {}));
			await cho(() => hop() !== null, `${ca.ten} mo`);
			await nhip(10);
			if (ca.so > 0)
				await cho(() => qs("[data-dan-sang]") !== null, `${ca.ten} dong dan`);
			const conCot =
				qs("[data-cot-gop-y]") !== null ||
				qs("[data-nut-gop-y]") !== null ||
				qs('[data-slot=sheet-content][data-size="assist"]') !== null ||
				qs('[data-slot=sheet-body][data-split="true"]') !== null;
			if (conCot) throw new Error(`cot gop y con: ${ca.ten}`);
			const dan = qsa("[data-dan-sang]");
			expect(dan.length, `${ca.ten}/${ca.so}`).toBe(ca.so > 0 ? 1 : 0);
			if (ca.so > 0) {
				expect(dan[0]?.textContent).toContain(
					`Kara · ${m.vung.soCho(String(ca.so))}`,
				);
				expect(nutCo(m.danSang.xem, dan[0] ?? document.body)).not.toBeNull();
			}
			await thaoHet();
		}
		console.log(`so ca hop-sua: ${MA_TRAN.length}`);
	});

	test("Xem gop y: form sach thi dong hop va mo khung, form ban thi hoi giu thay doi", async () => {
		for (const ban of [false, true]) {
			for (const ca of [MA_TRAN[0], MA_TRAN[2]]) {
				let daDong = 0;
				const san = await dung(dungHop(ca, () => (daDong += 1)));
				await cho(() => qs("[data-dan-sang]") !== null, `${ca.ten} dong dan`);
				if (ban) {
					const tenCu = ca.hop === "muc-tieu" ? mtSheet().title : KR_1.title;
					const o = qsa("input", hop() ?? document.body).find(
						(i) => (i as HTMLInputElement).value === tenCu,
					);
					if (!o) throw new Error(`${ca.ten}: khong thay o ten`);
					await goChu(o, " sửa");
				}
				await bamChuot(
					nut(m.danSang.xem, qs("[data-dan-sang]") ?? document.body),
				);
				await nhip(5);
				if (ban) {
					await cho(
						() => qs("[role=alertdialog]") !== null,
						`${ca.ten}: hop hoi giu thay doi`,
					);
					expect(qs("[role=alertdialog]")?.textContent).toContain(
						ui.dialog.boThayDoi.tieuDe,
					);
					kiemCa(
						{ daDong, record: san.url().get("record") },
						{ daDong: 0, record: null },
						(truong) => `${ca.ten} ban sai: ${truong}`,
					);
				} else {
					await cho(() => daDong > 0, `${ca.ten}: hop dong`);
					kiemCa(
						{
							daDong,
							record: san.url().get("record"),
							neo: san.url().get("neoGopY"),
						},
						{ daDong: 1, record: `objective:${MT_ID}`, neo: "true" },
						(truong) => `${ca.ten} sach sai: ${truong}`,
					);
				}
				await thaoHet();
			}
		}
		console.log("so ca hop-sua xem-gop-y: 4");
	});
});
