import { describe, expect, test } from "bun:test";
import { TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { act } from "react";
import { mineOutput } from "../../api/src/okr/okr.contracts";
import { HAN_BAI_DOM } from "./han-bai-dom";
import {
	bamChuot,
	CuaToi,
	chiTietTu,
	cho,
	D_CAN,
	D_KR1,
	D_KR2,
	D_TEN,
	danhSachTu,
	deXuat,
	dsTroLy,
	dung,
	dungSheet,
	goChu,
	goiCua,
	type KetQuaGhi,
	KR_1,
	kho,
	kiemCa,
	LoiTrpc,
	m,
	mtSheet,
	nhip,
	nut,
	nutCo,
	qs,
	qsa,
	TheoDonVi,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";
import { choLau, KHUNG, lienKet, type NoiGop } from "./khung-gop-y-luot-2";

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

	test(
		"k3-loi-dong 4 hanh dong x 4 loai loi: cau san pham duoi gop y, khong ma tho",
		async () => {
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
							qs(
								"[data-slot=field-error]",
								deXuat(D_KR1.id) ?? document.body,
							) !== null,
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
		},
		HAN_BAI_DOM.maTranMs,
	);
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

describe("k3-can-chinh", () => {
	const X = "kr-goc";
	const MA_TRAN = [
		{
			ten: "khac-dich",
			truoc: [lienKet("y-cu", "kr-khac")],
			sau: [lienKet("y-cu", "kr-khac"), lienKet("x-moi", X)],
			go: "x-moi",
		},
		{
			ten: "cung-dich",
			truoc: [lienKet("x-cu", X)],
			sau: [lienKet("x-cu", X), lienKet("x-moi", X)],
			go: "x-moi",
		},
		{
			ten: "khong-tao-moi",
			truoc: [lienKet("x-cu", X)],
			sau: [lienKet("x-cu", X)],
			go: null,
		},
		{
			ten: "hai-lien-ket-moi-cung-dich",
			truoc: [],
			sau: [lienKet("x-moi-1", X), lienKet("x-moi-2", X)],
			go: null,
		},
	] as const;

	async function nhanCanChinh(
		ca: { truoc: readonly NoiGop[]; sau: readonly NoiGop[] },
		goDi: string[],
		goLoi: Error | null,
	) {
		let daNhan = false;
		kho.chiTiet = () =>
			chiTietTu(
				mtSheet({
					soGopYCho: 1,
					alignments: [...(daNhan ? ca.sau : ca.truoc)],
				}),
			);
		kho.troLy = () => dsTroLy([D_CAN]);
		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			daNhan = true;
			return { ok: true };
		});
		kho.ghiRieng.set("okr.removeAlignment", async (vao) => {
			goDi.push(String(vao?.id));
			if (goLoi) throw goLoi;
			return { ok: true };
		});
		await dungSheet();
		await cho(() => deXuat(D_CAN.id) !== null, "gop y can chinh");
		await bamChuot(nut(m.dong.canChinh, deXuat(D_CAN.id) ?? document.body));
		await cho(
			() =>
				qs(
					"[data-slot=proposed-change-receipt]",
					deXuat(D_CAN.id) ?? document.body,
				) !== null,
			"bien nhan can chinh",
		);
		await nhip(6);
	}

	test("k3-can-chinh nhan -> lam moi -> Hoan tac: go dung lien ket vua tao, khong bao gio go lien ket co tu truoc", async () => {
		for (const ca of MA_TRAN) {
			const goDi: string[] = [];
			await nhanCanChinh(ca, goDi, null);
			const dong = deXuat(D_CAN.id) ?? document.body;
			const nutHoan = nutCo(ui.proposedChange.undo, dong);
			if (ca.go === null) {
				kiemCa(
					{ coHoanTac: nutHoan !== null },
					{ coHoanTac: false },
					() => `${ca.ten}: co Hoan tac du khong biet lien ket nao vua tao`,
				);
				await thaoHet();
				continue;
			}
			if (!nutHoan) throw new Error(`${ca.ten}: bien nhan khong co Hoan tac`);
			await bamChuot(nutHoan);
			await cho(() => goDi.length > 0, `${ca.ten} goi go lien ket`);
			if (goDi.some((id) => id !== ca.go))
				throw new Error(`go nham lien ket: ${goDi.join(",")}`);
			await cho(
				() =>
					deXuat(D_CAN.id)?.getAttribute("data-trang-thai") === "da-hoan-tac",
				`${ca.ten} ve cho`,
			);
			kiemCa(
				{
					soLan: goDi.length,
					chu:
						qs(
							"[data-slot=proposed-change-decided]",
							deXuat(D_CAN.id) ?? document.body,
						)?.textContent ?? null,
				},
				{ soLan: 1, chu: m.bienNhan.hoanTacCanChinh(D_CAN.tenDich ?? "") },
				(k) => `${ca.ten} sai: ${k}`,
			);
			await thaoHet();
		}
	});

	test("k3-can-chinh Hoan tac loi thi cau loi duoi bien nhan, bien nhan con", async () => {
		const goDi: string[] = [];
		await nhanCanChinh(
			MA_TRAN[1],
			goDi,
			new LoiTrpc("NOT_FOUND", "Không có căn chỉnh clx77"),
		);
		await bamChuot(
			nut(ui.proposedChange.undo, deXuat(D_CAN.id) ?? document.body),
		);
		await cho(
			() =>
				qs("[data-slot=field-error]", deXuat(D_CAN.id) ?? document.body) !==
				null,
			"loi hoan tac",
		);
		kiemCa(
			{
				loi:
					qs("[data-slot=field-error]", deXuat(D_CAN.id) ?? document.body)
						?.textContent ?? null,
				trangThai: deXuat(D_CAN.id)?.getAttribute("data-trang-thai") ?? null,
			},
			{ loi: m.loiDong["khong-con"], trangThai: "da-quyet" },
			(k) => `hoan tac loi sai: ${k}`,
		);
	});
});

describe("k3-chip", () => {
	test("k3-chip nho Kara roi dong khung khi Kara con doc: chip danh sach va Cua toi doi so moi khong tai lai trang", async () => {
		for (const dongKhung of [true, false]) {
			let pha: "chua" | "soan" | "xong" = "chua";
			const mt = () => mtSheet({ soGopYCho: pha === "xong" ? 2 : 0 });
			const datMine = () => {
				kho.mine = mineOutput.parse({
					dangTheoDoi: [],
					objectives: [mt()],
					daBo: [],
				});
			};
			kho.danhSach = () => danhSachTu([mt()], pha === "xong" ? 1 : 0);
			kho.chiTiet = () => chiTietTu(mt());
			kho.troLy = () => {
				if (pha === "xong") return dsTroLy([D_TEN, D_KR1]);
				if (pha === "soan")
					return dsTroLy([], { dangSoan: true, maKetThuc: null });
				return dsTroLy([], { maKetThuc: null, docLuc: null });
			};
			kho.ghiRieng.set("okr.troLyDeXuat", async () => {
				pha = "soan";
				return { bat: true, taskId: "t-chip", dungLai: false };
			});
			datMine();
			const DS = () => (
				<>
					<CuaToi />
					<TheoDonVi />
				</>
			);
			const san = await dung(
				<>
					{DS()}
					{KHUNG()}
				</>,
			);
			await cho(() => qs("[data-nut=nho-kara]") !== null, "nut nho");
			await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
			await cho(() => goiCua("okr.troLyDeXuat").length === 1, "da nho");
			if (dongKhung) await san.veLai(DS());
			pha = "xong";
			datMine();
			const chip = () =>
				qsa("[data-chip-gop-y]").map(
					(c) => c.textContent?.replace(/\s+/g, " ").trim() ?? "",
				);
			await choLau(
				() =>
					chip().length === 2 &&
					chip().every((c) => c === `Kara · ${m.chip("2")}`),
				"chip",
				TRO_LY_OKR_TRAN.hoiLaiMs * 4,
			).catch(() => {
				throw new Error(
					`chip dung so cu sau khi dong khung (dongKhung=${dongKhung}): ${chip().join(" | ")}`,
				);
			});
			await thaoHet();
			kho.daGhi = [];
		}
	}, 30_000);
});
