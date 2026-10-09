import { describe, expect, test } from "bun:test";
import { act } from "react";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_KR1,
	D_KR2,
	deXuat,
	dsTroLy,
	dungSheet,
	goChu,
	type KetQuaGhi,
	KR_1,
	kho,
	kiemCa,
	LoiTrpc,
	m,
	mtSheet,
	nhip,
	nut,
	qs,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";

describe("k3-loi-dong", () => {
	const LOI = [
		{
			loai: "khong-con",
			nem: () => new LoiTrpc("NOT_FOUND", "Không có đề xuất clx9k2m1q0000abcd"),
		},
		{ loai: "da-cu", nem: () => new LoiTrpc("CONFLICT", "Đề xuất đã cũ") },
		{
			loai: "chua-san-sang",
			nem: () =>
				new LoiTrpc("BAD_REQUEST", "Chưa sẵn sàng — Mục tiêu đang chờ duyệt"),
		},
		{ loai: "mat-mang", nem: () => new TypeError("Failed to fetch") },
	] as const;
	const HANH_DONG = ["nhan", "sua", "bac", "hoan-tac"] as const;
	const CAM = ["clx", "Trợ lý OKR", "Failed to fetch", "Chưa sẵn sàng"];

	async function lam(hd: (typeof HANH_DONG)[number]) {
		const dong = () => deXuat(D_KR1.id) ?? document.body;
		if (hd === "nhan" || hd === "hoan-tac")
			await bamChuot(nut(m.de.doiTenKr, dong()));
		if (hd === "bac") await bamChuot(nut(m.de.boQua, dong()));
		if (hd === "sua") {
			await bamChuot(nut(m.de.sua, dong()));
			await goChu(qs("textarea", dong()) ?? document.body, " trong quý");
			await bamChuot(nut(m.de.doiTenKr, dong()));
		}
		if (hd === "hoan-tac") {
			await cho(
				() => qs("[data-slot=proposed-change-receipt]", dong()) !== null,
				"bien nhan",
			);
			await bamChuot(nut(ui.proposedChange.undo, dong()));
		}
	}

	test("k3-loi-dong 4 hanh dong x 4 loai loi: cau san pham duoi gop y, khong ma tho", async () => {
		let soO = 0;
		for (const hd of HANH_DONG)
			for (const loi of LOI) {
				kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 1 }));
				kho.troLy = () => dsTroLy([D_KR1]);
				if (hd === "hoan-tac")
					kho.ghiRieng.set("okr.updateKeyResult", async () => {
						throw loi.nem();
					});
				else if (loi.loai === "chua-san-sang")
					kho.ghiRieng.set("okr.troLyQuyet", async () => ({
						ok: false,
						lyDo: "het-tran-ngay",
					}));
				else
					kho.ghiRieng.set("okr.troLyQuyet", async () => {
						throw loi.nem();
					});
				await dungSheet();
				await cho(() => deXuat(D_KR1.id) !== null, `${hd}/${loi.loai} gop y`);
				await lam(hd);
				await cho(
					() =>
						qs("[data-slot=field-error]", deXuat(D_KR1.id) ?? document.body) !==
						null,
					`${hd}/${loi.loai} cau loi`,
				);
				await nhip(4);
				const chu =
					qs("[data-slot=field-error]", deXuat(D_KR1.id) ?? document.body)
						?.textContent ?? "";
				const lo = CAM.find((c) => chu.includes(c));
				if (lo) throw new Error(`lo cau tho: ${lo} (${hd}/${loi.loai})`);
				kiemCa(
					{ chu },
					{ chu: m.loiDong[loi.loai] },
					() => `${hd}/${loi.loai} cau sai`,
				);
				soO += 1;
				await thaoHet();
				kho.ghiRieng.clear();
			}
		expect(soO).toBe(16);
	});
});

describe("k3-hai-hoan", () => {
	test("k3-hai-hoan hoan tac KR1 roi KR2 truoc khi lan dau xong: moi KR ve dung luc lan cua no xong, loi nam duoi dung KR", async () => {
		let hongLanMot: (e: Error) => void = () => {};
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
		kho.troLy = () => dsTroLy([D_KR1, D_KR2]);
		kho.ghiRieng.set("okr.updateKeyResult", (vao) =>
			vao?.id === KR_1.id
				? new Promise<KetQuaGhi>((_, hong) => {
						hongLanMot = hong;
					})
				: Promise.resolve({ id: String(vao?.id), canhBao: null }),
		);
		await dungSheet();
		const tt = (id: string) =>
			deXuat(id)?.getAttribute("data-trang-thai") ?? null;
		const dong = (id: string) => deXuat(id) ?? document.body;
		await cho(
			() => deXuat(D_KR1.id) !== null && deXuat(D_KR2.id) !== null,
			"hai kr",
		);
		await bamChuot(nut(m.de.doiTenKr, dong(D_KR1.id)));
		await cho(() => tt(D_KR1.id) === "da-quyet", "kr1 da nhan");
		await bamChuot(nut(m.de.doiTenKr, dong(D_KR2.id)));
		await cho(() => tt(D_KR2.id) === "da-quyet", "kr2 da nhan");
		await bamChuot(nut(ui.proposedChange.undo, dong(D_KR1.id)));
		await cho(() => tt(D_KR1.id) === "dang-hoan-tac", "kr1 dang hoan tac");
		await bamChuot(nut(ui.proposedChange.undo, dong(D_KR2.id)));
		await nhip(6);
		if (tt(D_KR2.id) !== "da-hoan-tac")
			throw new Error(`kr2 khong ve cho: ${tt(D_KR2.id)}`);
		if (tt(D_KR1.id) !== "dang-hoan-tac")
			throw new Error(`kr1 khong con dang lam: ${tt(D_KR1.id)}`);
		await act(async () => hongLanMot(new LoiTrpc("CONFLICT", "Tên KR đã đổi")));
		await nhip(6);
		const loiCua = (id: string) =>
			qs("[data-slot=field-error]", dong(id))?.textContent ?? null;
		if (loiCua(D_KR2.id) !== null) throw new Error("loi lan mot roi vao kr2");
		if (tt(D_KR1.id) !== "da-quyet")
			throw new Error(`kr1 khong ve cho: ${tt(D_KR1.id)}`);
		kiemCa(
			{ loiKr1: loiCua(D_KR1.id), kr2: tt(D_KR2.id) },
			{ loiKr1: m.loiDong["da-cu"], kr2: "da-hoan-tac" },
			(k) => `hai hoan tac sai: ${k}`,
		);
	});
});
