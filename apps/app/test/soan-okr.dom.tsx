import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KARA_TRE_MS } from "@crm/ui/components/kara/state";
import { act } from "react";
import {
	BAN_NHAP,
	bam,
	baoLoiAgent,
	batDongHoGia,
	CUOC,
	cho,
	chu,
	DanhSachCuoc,
	type DauVao,
	daGui,
	daLamMoi,
	danhSach,
	daTaiLuong,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	dauThangSau,
	diTrang,
	don,
	donViSoanCua,
	go,
	goiCua,
	homNayVn,
	kr,
	MO_DAU,
	m,
	mo,
	moKhung,
	moMan,
	mt,
	nguoiNoi,
	nhip,
	noiTroLy,
	nut,
	q,
	qa,
	SAN_SANG_BAT,
	SOAN_UI,
	soLanMoAgent,
	troi,
	tuyChonAgent,
	urlDoi,
} from "./khung-soan-okr";
import { chuoiToTien, type KieuThat, kieuThat, ranhChanDay } from "./kieu-that";

async function choChiBao(): Promise<string | null> {
	const chon = '[data-kara-turn="kara"] [data-kara-state="working"]';
	if (!q(chon)) return null;
	await act(async () => {
		await new Promise((r) => setTimeout(r, KARA_TRE_MS + 50));
	});
	return q(chon)?.textContent ?? null;
}

const khoiCua = (id: string) =>
	q(`[data-dong="${id}"]`)?.closest('[data-slot="kara-proposal-group"]') ??
	null;

const NUT_DUNG = '[data-slot="kara-composer"] button[aria-label="Dừng"]';
const NUT_GUI = '[data-slot="kara-composer"] button[aria-label="Gửi"]';
const LY_DO_KHOA =
	'[data-slot="kara-composer"] > [data-slot="field-description"]';

async function bamVe(): Promise<boolean> {
	const dong = qa("[data-slot=sheet-header] button").find(
		(b) => b.textContent?.trim() === "Đóng",
	);
	if (!dong) throw new Error("khong thay nut dong khung");
	await act(async () => (dong as HTMLButtonElement).click());
	await nhip(3);
	return q('[role="alertdialog"]') !== null;
}

function banGhiCuoi(): string | null {
	const chuoi = urlDoi.at(-1);
	return chuoi === undefined ? null : new URLSearchParams(chuoi).get("record");
}

async function nhanTab(o: Element | undefined): Promise<void> {
	if (!o) throw new Error("khong thay tab");
	await act(async () => {
		o.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
	});
	await nhip(3);
}

beforeEach(datLai);
afterEach(don);

const DA_NHAN = [
	mt("1", "Giữ khách lớn miền Bắc", "nhan"),
	kr("11", "1", "Khách lớn ký lại hợp đồng", "nhan"),
	kr("12", "1", "Rà soát tuyến trước hạn", "nhan", "moc"),
	kr("14", "1", "Khách lớn tăng đơn", "nhan"),
	mt("2", "Mở tuyến Hà Nội – Hải Phòng", "bac"),
	kr("21", "2", "Chuyến đúng hẹn"),
];

describe("man soan — cua va luot mo dau", () => {
	test("mở phiên qua cửa OKR: host riêng, header mã cuộc, không kèm agent", async () => {
		await moMan();
		const tuyChon = tuyChonAgent.at(-1);
		expect(tuyChon?.host).toBe("/eve/agents/okr");
		expect(tuyChon?.headers).toEqual({ "x-crm-cuoc-soan": CUOC.id });
		expect("agent" in (tuyChon ?? {})).toBe(false);
	});

	test("cuộc chưa có lượt: tự gửi lượt mở đầu, bong bóng lượt đó không hiện", async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
		await moMan();
		expect(daGui).toEqual([SOAN_UI.luotMoDau]);
		expect(
			dauVetAi("ConversationEmptyState")?.textContent,
			"thieu ConversationEmptyState",
		).toContain(m.hoiThoai.moDau);
		await datAgent({
			data: {
				messages: [nguoiNoi("u0", SOAN_UI.luotMoDau), noiTroLy("a0", MO_DAU)],
			},
		});
		expect(qa('[data-luot="nguoi"]')).toHaveLength(0);
		expect(q('[role="log"]')?.textContent).toContain("Kỳ trước phòng đạt 91%");
	});

	test("cuộc đã có lượt: không gửi lại lượt mở đầu", async () => {
		await moMan();
		expect(daGui).toEqual([]);
	});
});

describe("man soan — trang thai theo bang thiet ke", () => {
	test("ST-soan-thieu-boi-canh: người thường không có nút tới Kho", async () => {
		datDanhSach({ thieuBoiCanh: true });
		await moMan(false);
		expect(q('[data-dai="thieu-boi-canh"]')).not.toBeNull();
		expect(q('[data-dai="thieu-boi-canh"] a')).toBeNull();
	});

	test("quyết bị từ chối có tên: câu chiTiet hiện trên thẻ", async () => {
		datDanhSach({ dong: BAN_NHAP });
		dat("okr.soanQuyet", () => ({
			ok: false,
			lyDo: "cha-da-bac",
			chiTiet: "Mục tiêu «Mở tuyến» đã bị bác.",
		}));
		await moMan();
		await bam(nut(m.dong.themKr, q('[data-dong="21"]') ?? document.body));
		await cho(
			() =>
				q('[data-dong="21"]')?.textContent?.includes(
					"Mục tiêu «Mở tuyến» đã bị bác.",
				) === true,
			"loi quyet hien",
		);
		expect(goiCua("okr.soanDanhSach").length).toBeGreaterThan(1);
	});

	test("cửa từ chối lượt: câu có tên, không nút Thử lại", async () => {
		await datAgent({
			status: "error",
			error: Object.assign(new Error("het-tran-thang"), {
				status: 429,
				body: '{"error":"het-tran-thang"}',
			}),
		});
		await moMan();
		expect(chu('[data-tu-choi="het-tran-thang"]')).toBe(
			m.lyDoLuot["het-tran-thang"],
		);
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
	});

	test("Mở cuộc mới bị từ chối: hiện lý do, không chuyển", async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 12 } });
		dat("okr.soanMo", () => ({
			ok: false,
			lyDo: "het-cuoc-ky",
			cuocDang: null,
		}));
		await moMan();
		await bam(q('[data-nut="mo-cuoc-moi"]'));
		await cho(
			() => chu('[data-loi="mo-cuoc-moi"]') === m.lyDo["het-cuoc-ky"],
			"ly do mo cuoc moi",
		);
		expect(diTrang).toEqual([]);
	});

	test("ST-soan-dua-vao-loi: không có chiTiet thì hiện câu theo mã", async () => {
		datDanhSach({ dong: DA_NHAN });
		dat("okr.soanDuaVao", () => ({
			ok: false,
			lyDo: "chu-ky-khong-lap-ke-hoach",
			chiTiet: null,
		}));
		await moMan();
		await go(q("#dich-11"), "10");
		await go(q("#dich-14"), "8");
		await bam(q('[data-nut="dua-vao"]'));
		await bam(
			nut(m.banNhap.xacNhan.nut, q('[role="alertdialog"]') ?? document.body),
		);
		await cho(() => q('[data-loi="dua-vao"]') !== null, "loi dua vao");
		expect(chu('[data-loi="dua-vao"]')).toBe(
			m.banNhap.loiDuaVao["chu-ky-khong-lap-ke-hoach"],
		);
	});

	test("cuộc đã đưa vào mở lại để xem: bảng khoá, không gửi lượt, có đường tới Theo đơn vị", async () => {
		datDanhSach({
			cuoc: { ...CUOC, trangThai: "da-dua-vao" },
			dong: DA_NHAN,
		});
		await moMan();
		expect(q('[data-trang-soan="da-dua-vao"]')).not.toBeNull();
		expect(chu('[data-da-dua-vao] [data-slot="alert-title"]')).toBe(
			m.banNhap.daTao("1"),
		);
		expect(q('[data-dai="cuoc-dong"]')).not.toBeNull();
		expect(q("[data-hanh-dong]")).toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
		expect(daGui).toEqual([]);
	});
});

describe("man soan — giu thay doi", () => {
	test("chữ chưa gửi: rời trang phải hỏi lại", async () => {
		await moMan();
		await go(q("[data-o-soan] textarea"), "Ưu tiên giữ khách");
		expect(await bamVe(), "roi trang khong hoi").toBe(true);
		await nhip(3);
		expect(diTrang).toEqual([]);
		expect(q('[role="alertdialog"]')).not.toBeNull();
	});

	test("không gõ gì: rời trang đi ngay", async () => {
		await moMan();
		expect(await bamVe()).toBe(false);
		await nhip(3);
		expect(q('[role="alertdialog"]')).toBeNull();
	});
});

describe("man soan — giu cho chu va so", () => {
	test("đổi phiên (Thử lại, chỗ giữ mới): số đã gõ còn nguyên, vẫn hỏi lại khi đóng", async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		await go(q("#dich-11"), "10");
		const moTruoc = soLanMoAgent;
		datDanhSach({ cuoc: { ...CUOC, sessionId: "cho-eve:moi" } });
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await cho(() => soLanMoAgent === moTruoc + 1, "than mo lai");
		expect((q("#dich-11") as HTMLInputElement).value).toBe("10");
		expect(await bamVe(), "roi trang khong hoi").toBe(true);
		await nhip(3);
		expect(diTrang).toEqual([]);
		expect(q('[role="alertdialog"]')).not.toBeNull();
	});

	test("khổ hẹp: chữ đang gõ còn sau khi sang tab Bản nháp rồi quay lại", async () => {
		const goc = window.matchMedia;
		Object.defineProperty(window, "matchMedia", {
			value: (truyVan: string) => ({
				...goc(truyVan),
				matches: truyVan === SOAN_UI.khoHep,
			}),
			configurable: true,
			writable: true,
		});
		try {
			datDanhSach({ dong: BAN_NHAP });
			await moMan();
			await go(q("[data-o-soan] textarea"), "Ưu tiên giữ khách");
			const tab = () => qa('[data-khung="hep"] [role="tab"]');
			await nhanTab(tab()[1]);
			await cho(() => q("[data-o-soan] textarea") === null, "sang ban nhap");
			await nhanTab(tab()[0]);
			await cho(() => q("[data-o-soan] textarea") !== null, "ve tro chuyen");
			expect((q("[data-o-soan] textarea") as HTMLTextAreaElement).value).toBe(
				"Ưu tiên giữ khách",
			);
		} finally {
			Object.defineProperty(window, "matchMedia", {
				value: goc,
				configurable: true,
				writable: true,
			});
		}
	});
});

describe("man soan — cho giu phien", () => {
	const CHO_GIU = { ...CUOC, sessionId: "cho-eve:1", soLuot: 0 };

	test("phiên còn chỗ giữ: không tải luồng, gửi lượt đầu, gắn mã eve thì không mở lại", async () => {
		datDanhSach({ cuoc: CHO_GIU });
		await moMan();
		expect(daTaiLuong).toEqual([]);
		expect(daGui).toEqual([SOAN_UI.luotMoDau]);
		const moTruoc = soLanMoAgent;
		datDanhSach({ cuoc: { ...CHO_GIU, sessionId: "wrun_eve", soLuot: 1 } });
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await cho(
			() =>
				chu("[data-o=hoi-thoai] [data-slot=kara-dock-header]")?.includes(
					"1/12",
				) === true,
			"cuoc doc lai",
		);
		expect(soLanMoAgent).toBe(moTruoc);
		expect(daTaiLuong).toEqual([]);
	});

	test("phiên đã có mã eve: tải luồng theo mã đó", async () => {
		await moMan();
		expect(daTaiLuong).toEqual([CUOC.sessionId]);
	});

	test.each(["da-co-phien", "phien-da-thay"])(
		"cửa trả 409 %s: đọc lại cuộc rồi mở lại theo phiên có sẵn",
		async (ma) => {
			datDanhSach({ cuoc: CHO_GIU });
			await moMan();
			const moTruoc = soLanMoAgent;
			const doc = goiCua("okr.soanDanhSach").length;
			datDanhSach({ cuoc: { ...CHO_GIU, sessionId: "wrun_khac", soLuot: 1 } });
			await baoLoiAgent(
				Object.assign(new Error(ma), {
					status: 409,
					body: JSON.stringify({ error: ma }),
				}),
			);
			await nhip(20);
			expect(soLanMoAgent).toBe(moTruoc + 1);
			expect(goiCua("okr.soanDanhSach").length).toBeGreaterThan(doc);
			expect(daTaiLuong).toEqual(["wrun_khac"]);
			expect(q('[data-luot="loi"]')).toBeNull();
		},
	);
});

const DV = {
	cycleId: "q1",
	level: "phong-ban" as const,
	divisionId: null,
	departmentId: "pb-1",
};

const CUOC_DANG = { ...CUOC, soLuot: 2, soDongTong: 5, soDongNhan: 2 };
const DON_PB1 = "pb:pb-1";
const DV_PB1 = {
	cycleId: "q1",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb-1",
} as const;
const BAT_CO_CUOC = { ...SAN_SANG_BAT, cuocDang: CUOC_DANG, soCuocDaDung: 1 };
const moThongTin = () => bam(q('[data-nut="thong-tin-soan"]'));
const chuThongTin = () => q("[data-thong-tin-soan]")?.textContent ?? "";

describe("nut soan — ST-soan-nut-*", () => {
	test("ST-soan-nut: đã dùng cuộc thì có nút xem danh sách cuộc, bấm mở danh sách", async () => {
		await moKhung(DON_PB1, {
			sanSang: { ...SAN_SANG_BAT, soCuocDaDung: 2 },
		});
		await moThongTin();
		expect(chu('[data-nut="ds-cuoc"]')).toBe(m.nut.dsCuoc("2", "3"));
		expect(q("[data-cuoc]")).toBeNull();
		await bam(q('[data-nut="ds-cuoc"]'));
		await cho(() => q("[data-cuoc]") !== null, "danh sach cuoc mo");
		expect(goiCua("okr.soanDanhSachCuoc")[0]?.dauVao).toEqual(DV_PB1);
	});

	test("ST-soan-nut-an: người không phải quản trị không thấy gì dù máy chủ trả nấc ẩn", async () => {
		await moKhung(DON_PB1, {
			sanSang: { ...SAN_SANG_BAT, nac: "an" },
			quanTri: false,
			canEdit: true,
		});
		expect(q("[data-nut-soan]")).toBeNull();
		expect(document.body.textContent).not.toContain(m.nut.cheDoAn);
	});

	test("ngày mở cuộc tính theo giờ Việt Nam, không theo giờ máy", async () => {
		await moKhung(DON_PB1, {
			sanSang: {
				...BAT_CO_CUOC,
				cuocDang: { ...CUOC_DANG, moLuc: "2026-11-30T18:30:00.000Z" },
			},
		});
		await moThongTin();
		expect(chuThongTin()).toContain(m.nut.tiepMoTa("01/12", "2", "3"));
	});

	test("nút bật thường không có nhãn chế độ ẩn", async () => {
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT, quanTri: true });
		expect(q('[data-nut-soan="nut"]')).not.toBeNull();
		expect(document.body.textContent).not.toContain(m.nut.cheDoAn);
	});

	test("ST-soan-nut-het-cuoc: vẫn xem lại được các cuộc đã soạn", async () => {
		await moKhung(DON_PB1, {
			sanSang: { bat: false, lyDo: "het-cuoc-ky" },
		});
		await moThongTin();
		expect(chu('[data-nut="ds-cuoc"]')).toBe(m.nut.dsCuoc("3", "3"));
		await bam(q('[data-nut="ds-cuoc"]'));
		await cho(() => q("[data-cuoc]") !== null, "danh sach cuoc mo");
	});

	test("chưa có khoá mô hình: nút mờ kèm lý do", async () => {
		await moKhung(DON_PB1, {
			sanSang: { bat: false, lyDo: "chua-co-khoa-mo-hinh" },
		});
		expect(
			(q('[data-nut-soan="nut-chua-khoa"] button') as HTMLButtonElement)
				.disabled,
		).toBe(true);
		await moThongTin();
		expect(chuThongTin()).toContain(m.lyDo["chua-co-khoa-mo-hinh"]);
	});
});

describe("nut theo ly do", () => {
	const KET_QUA_THEO_LY_DO = {
		"don-vi-luu-tru": null,
		"don-vi-chua-bat": null,
		"don-vi-che-do-an": null,
		"cuoc-an-dang-mo": null,
		"con-cuoc-dang": null,
		"het-cuoc-ky": "nut-het-cuoc",
		"het-tran-thang": "nut-het-tran",
		"chua-co-khoa-mo-hinh": "nut-chua-khoa",
	} as const;

	test("bảng kết quả khớp đúng các mã lý do của máy chủ", () => {
		expect(Object.keys(KET_QUA_THEO_LY_DO).sort()).toEqual(
			Object.keys(m.lyDo).sort(),
		);
	});

	for (const [lyDo, hinh] of Object.entries(KET_QUA_THEO_LY_DO)) {
		for (const quanTri of [false, true]) {
			test(`mã ${lyDo}, ${quanTri ? "quản trị" : "người thường"}: ${hinh ?? "không có nút"}`, async () => {
				await moKhung(DON_PB1, { sanSang: { bat: false, lyDo }, quanTri });
				const co = qa("[data-nut-soan]").map((o) =>
					o.getAttribute("data-nut-soan"),
				);
				expect(co).toEqual(hinh ? [hinh] : []);
			});
		}
	}

	test("nấc ẩn mà không phải quản trị: không có nút", async () => {
		await moKhung(DON_PB1, {
			sanSang: { bat: false, lyDo: "don-vi-che-do-an" },
			quanTri: false,
		});
		expect(q("[data-nut-soan]")).toBeNull();
	});

	test("chu kỳ không ở pha lập kế hoạch: không có nút và không hỏi máy chủ", async () => {
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT, pha: "dang-chay" });
		expect(q("[data-nut-soan]")).toBeNull();
		expect(goiCua("okr.soanSanSang")).toHaveLength(0);
	});

	test("người không sửa được đơn vị mà không phải quản trị: nút khoá trỏ dòng lý do đầu trang, không hỏi máy chủ", async () => {
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT, canEdit: false });
		const nut = q(
			'[data-nut-soan="nut-khong-quyen"] button',
		) as HTMLButtonElement | null;
		expect(nut?.disabled).toBe(true);
		expect(nut?.getAttribute("aria-describedby")).toBe("okr-khong-them-duoc");
		expect(goiCua("okr.soanSanSang")).toHaveLength(0);
	});

	test("quản trị không sửa được đơn vị vẫn thấy nút", async () => {
		await moKhung(DON_PB1, {
			sanSang: SAN_SANG_BAT,
			canEdit: false,
			quanTri: true,
		});
		expect(q('[data-nut-soan="nut"]')).not.toBeNull();
	});

	test("đơn vị soạn suy từ ô chọn: gốc, bộ phận, phòng ban; người thì không", () => {
		expect(donViSoanCua({ loai: "goc" }, "q1")).toEqual({
			cycleId: "q1",
			level: "onehub",
			divisionId: null,
			departmentId: null,
		});
		expect(donViSoanCua({ loai: "bp", id: "bp-kd" }, "q1")).toEqual({
			cycleId: "q1",
			level: "bo-phan",
			divisionId: "bp-kd",
			departmentId: null,
		});
		expect(donViSoanCua({ loai: "pb", id: "pb-1" }, "q1")).toEqual(DV_PB1);
		expect(donViSoanCua({ loai: "nguoi", id: "hung" }, "q1")).toBeNull();
	});

	test("bấm nút gọi soanMo với đơn vị đúng và đi tới trang soạn", async () => {
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT });
		await bam(q('[data-nut-soan="nut"]'));
		expect(goiCua("okr.soanMo")[0]?.dauVao).toEqual(DV_PB1);
		await cho(() => banGhiCuoi() === `soan:${CUOC.id}`, "mo khung soan");
		expect(diTrang).toEqual([]);
	});

	test("bấm Tiếp cuộc đang soạn không gọi soanMo, mở đúng cuộc", async () => {
		await moKhung(DON_PB1, { sanSang: BAT_CO_CUOC });
		await bam(q('[data-nut-soan="nut-tiep"] button'));
		await cho(() => banGhiCuoi() === `soan:${CUOC.id}`, "mo khung soan");
		expect(goiCua("okr.soanMo")).toHaveLength(0);
		expect(diTrang).toEqual([]);
	});

	test("soanMo báo còn cuộc đang soạn: mở đúng cuộc đó", async () => {
		dat("okr.soanMo", () => ({
			ok: false,
			lyDo: "con-cuoc-dang",
			cuocDang: { ...CUOC, id: "cuoc-cu" },
		}));
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT });
		await bam(q('[data-nut-soan="nut"]'));
		await cho(() => banGhiCuoi() === `soan:${"cuoc-cu"}`, "mo khung soan");
		expect(diTrang).toEqual([]);
	});

	test("soanMo từ chối vì hết cuộc: không mở màn, đọc lại trạng thái sẵn sàng", async () => {
		dat("okr.soanMo", () => ({
			ok: false,
			lyDo: "het-cuoc-ky",
			cuocDang: null,
		}));
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT });
		expect(goiCua("okr.soanSanSang")).toHaveLength(1);
		await bam(q('[data-nut-soan="nut"]'));
		expect(diTrang).toEqual([]);
		expect(goiCua("okr.soanSanSang")).toHaveLength(2);
	});

	test("soanMo lỗi: không mở màn, nút mở lại được", async () => {
		dat("okr.soanMo", () => {
			throw new Error("mất mạng");
		});
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT });
		await bam(q('[data-nut-soan="nut"]'));
		expect(diTrang).toEqual([]);
		expect((q('[data-nut-soan="nut"]') as HTMLButtonElement).disabled).toBe(
			false,
		);
	});

	test("tham số cuộc cũ trên URL chuyển sang trang soạn, không thêm lịch sử", async () => {
		await moKhung(DON_PB1, { sanSang: BAT_CO_CUOC, thamSo: "cuocSoan=cuoc-1" });
		expect(
			diTrang.map((d) => [
				d.kieu,
				new URL(d.duong, "http://x").searchParams.get("record"),
			]),
		).toEqual([["replace", `soan:${"cuoc-1"}`]]);
	});

	test("cuộc mở từ URL vẫn tới trang soạn khi trạng thái sẵn sàng đổi sang hết trần", async () => {
		await moKhung(DON_PB1, {
			sanSang: { bat: false, lyDo: "het-tran-thang" },
			thamSo: "cuocSoan=cuoc-1",
		});
		expect(
			diTrang.map((d) => [
				d.kieu,
				new URL(d.duong, "http://x").searchParams.get("record"),
			]),
		).toEqual([["replace", `soan:${"cuoc-1"}`]]);
		expect(q('[data-nut-soan="nut-het-tran"]')).not.toBeNull();
	});

	test("danh sách cuộc mở từ URL; bấm Tiếp trong danh sách đổi sang màn soạn", async () => {
		dat("okr.soanDanhSachCuoc", () => ({
			cuoc: [CUOC],
			soCuocDaDung: 1,
			tranCuoc: 3,
		}));
		await moKhung(DON_PB1, { sanSang: BAT_CO_CUOC, thamSo: "dsCuoc=1" });
		await cho(
			() => q('[data-cuoc="danh-sach"]') !== null,
			"danh sach mo tu url",
		);
		await bam(q('[data-nut="mo-cuoc"]'));
		await cho(() => banGhiCuoi() === `soan:${CUOC.id}`, "mo khung soan");
		expect(diTrang).toEqual([]);
		await cho(() => q('[data-cuoc="danh-sach"]') === null, "danh sach dong");
	});

	test("không có tham số URL thì không có màn nào mở", async () => {
		await moKhung(DON_PB1, { sanSang: BAT_CO_CUOC });
		expect(diTrang).toEqual([]);
		expect(q("[data-cuoc]")).toBeNull();
	});

	test("tên đơn vị không bị trình duyệt dịch", async () => {
		await moMan();
		expect(q('[data-dau-soan] [translate="no"]')?.textContent).toBe(
			CUOC.tenDonVi,
		);
	});
});

const BA_MUC = [
	mt("1", "Giữ khách lớn miền Bắc"),
	kr("11", "1", "Khách lớn ký lại hợp đồng"),
	mt("2", "Mở tuyến Hà Nội – Hải Phòng"),
	kr("21", "2", "Chuyến đúng hẹn"),
	mt("3", "Tăng đơn khách cũ"),
	kr("31", "3", "Đơn lặp lại mỗi quý"),
];

const BO_MUC_2 = [
	mt("1b", "Giữ khách lớn miền Bắc"),
	kr("11b", "1b", "Khách lớn ký lại hợp đồng"),
	kr("21b", "1b", "Chuyến đúng hẹn"),
	mt("3b", "Tăng đơn khách cũ", "cho", {
		viSaoLucNay: "Khách cũ mua thưa dần từ quý 3.",
	}),
	kr("31b", "3b", "Đơn lặp lại mỗi quý"),
	kr("33b", "3b", "Khách cũ quay lại"),
];

function danhSachDaQuyet(vao: DauVao): void {
	const id = vao?.deXuatId;
	datDanhSach({
		dong: danhSach.dong.map((d) =>
			d.id === id ? { ...d, trangThai: "nhan" } : d,
		),
	});
}

const tagCua = (id: string) =>
	q(`[data-dong="${id}"] [data-slot="proposed-change-tag"]`)?.textContent ??
	undefined;

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const TEP_HOI_THOAI = join(
	GOC_KHO,
	"apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx",
);
const THU_MUC_AI = join(GOC_KHO, "packages/ui/src/components/ai-elements");
const THU_MUC_KARA = join(GOC_KHO, "packages/ui/src/components/kara");

const DAU_VET_AI = {
	Conversation: {
		tep: "conversation.tsx",
		dau: 'role="log"',
		chon: '[data-cot="hoi-thoai"] [role="log"]',
	},
	ConversationEmptyState: {
		tep: "conversation.tsx",
		dau: "export const ConversationEmptyState",
		chon: '[role="log"] [data-slot="conversation-empty-state"]',
	},
	Suggestion: {
		tep: "suggestion.tsx",
		dau: "<ScrollArea",
		chon: '[role="log"] [data-slot="scroll-area"] button[data-slot="button"][data-goi-y]',
	},
	PromptInput: {
		tep: "prompt-input.tsx",
		dau: "<InputGroupTextarea",
		chon: '[data-o-soan] form [data-slot="input-group"] textarea[data-slot="input-group-control"]',
	},
} as const;

function dauVetAi(ten: keyof typeof DAU_VET_AI): Element | null {
	const { tep, dau, chon } = DAU_VET_AI[ten];
	const nguon = readFileSync(join(THU_MUC_AI, tep), "utf8");
	if (!nguon.includes(dau)) throw new Error(`${tep} khong con ${dau}`);
	const dung = readFileSync(TEP_HOI_THOAI, "utf8");
	const nhap = `@crm/ui/components/ai-elements/${tep.replace(".tsx", "")}`;
	const quaKara = [
		...dung.matchAll(/@crm\/ui\/components\/kara\/([a-z-]+)/g),
	].some(([, ten]) =>
		readFileSync(join(THU_MUC_KARA, `${ten}.tsx`), "utf8").includes(nhap),
	);
	if (!dung.includes(nhap) && !quaKara)
		throw new Error(`man soan khong nhap ${nhap}`);
	return q(chon);
}

const DUONG_THIET_KE = join(
	GOC_KHO,
	"docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-design.md",
);

function idBangTrangThai(): string[] {
	const chu = readFileSync(DUONG_THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) throw new Error("khong thay bang UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)]
		.map((k) => k[1] ?? "")
		.filter((id) => id.startsWith("ST-soan-") || id.startsWith("ST-cuoc-"));
}

const CA = {
	"ST-soan-nut": async () => {
		await moKhung(DON_PB1, { sanSang: SAN_SANG_BAT });
		const nutSoan = q('[data-nut-soan="nut"]') as HTMLButtonElement | null;
		expect(nutSoan?.textContent?.trim()).toBe(m.nut.soan);
		expect(nutSoan?.disabled).toBe(false);
		expect(q('[data-nut-soan="nut-tiep"]')).toBeNull();
		expect(q('[data-nut-soan="nut-an"]')).toBeNull();
		expect(q('[data-nut="ds-cuoc"]')).toBeNull();
	},
	"ST-soan-nut-tiep": async () => {
		await moKhung(DON_PB1, { sanSang: BAT_CO_CUOC });
		expect(chu('[data-nut-soan="nut-tiep"] button')).toBe(m.nut.tiep);
		await moThongTin();
		expect(chuThongTin()).toContain(m.nut.tiepMoTa("01/12", "2", "3"));
		expect(chuThongTin()).toContain("lượt");
		expect(q('[data-nut-soan="nut"]')).toBeNull();
		expect(chu('[data-nut="ds-cuoc"]')).toBe(m.nut.dsCuoc("1", "3"));
	},
	"ST-soan-nut-an": async () => {
		await moKhung(DON_PB1, {
			sanSang: { ...SAN_SANG_BAT, nac: "an" },
			quanTri: true,
		});
		expect(chu('[data-nut-soan="nut-an"] button')).toBe(m.nut.soan);
		await moThongTin();
		expect(chu('[data-thong-tin-soan] [data-slot="badge"]')).toBe(
			m.nut.cheDoAn,
		);
		expect(chuThongTin()).toContain(m.nut.cheDoAnMoTa);
	},
	"ST-soan-nut-het-cuoc": async () => {
		await moKhung(DON_PB1, {
			sanSang: { bat: false, lyDo: "het-cuoc-ky" },
		});
		const o = q('[data-nut-soan="nut-het-cuoc"]');
		const nutTat = o?.querySelector("button");
		expect(nutTat?.textContent?.trim()).toBe(m.nut.soan);
		expect(nutTat?.disabled).toBe(true);
		expect(q('[data-nut="thong-tin-soan"]')?.getAttribute("aria-label")).toBe(
			m.nut.thongTin,
		);
		await moThongTin();
		expect(chuThongTin()).toContain(m.nut.hetCuoc("3"));
		await bam(nutTat ?? null);
		expect(goiCua("okr.soanMo")).toHaveLength(0);
	},
	"ST-soan-nut-het-tran": async () => {
		await moKhung(DON_PB1, {
			sanSang: { bat: false, lyDo: "het-tran-thang" },
		});
		const nutTat = q(
			'[data-nut-soan="nut-het-tran"] button',
		) as HTMLButtonElement;
		expect(nutTat.disabled).toBe(true);
		await moThongTin();
		expect(chuThongTin()).toContain(
			m.nut.tamNghi(dauThangSau(homNayVn(new Date()))),
		);
		expect(q('[data-nut="ds-cuoc"]')).toBeNull();
	},
	"ST-soan-mo-dau": async () => {
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		expect(q('[role="log"]')).not.toBeNull();
		const goiY = qa("[data-goi-y]");
		expect(goiY.map((g) => g.textContent?.trim())).toEqual([
			"Giữ khách",
			"Mở tuyến",
			"Có",
			"Chưa có",
		]);
		expect(q('[role="log"]')?.textContent).not.toContain("gợi ý:");
		const oSoan = q('[data-o-soan="mo"] textarea') as HTMLTextAreaElement;
		expect(oSoan.disabled).toBe(false);
		expect(q('[data-o="ban-nhap"]')).toBeNull();
		for (const ten of ["Conversation", "Suggestion", "PromptInput"] as const)
			expect(dauVetAi(ten), `thieu ${ten}`).not.toBeNull();
		await bam(goiY[0] ?? null);
		expect(daGui).toEqual(["Giữ khách"]);
	},
	"ST-soan-thieu-boi-canh": async () => {
		datDanhSach({ thieuBoiCanh: true });
		await moMan(true);
		expect(chu('[data-dai="thieu-boi-canh"] [data-slot="alert-title"]')).toBe(
			m.hoiThoai.thieuBoiCanh,
		);
		const toi = q('[data-dai="thieu-boi-canh"] a');
		expect(toi?.textContent).toBe(m.hoiThoai.toiKho);
		expect(toi?.getAttribute("href")).toBe("/ws/tai-lieu");
	},
	"ST-soan-dang-tra-loi": async () => {
		await datAgent({
			status: "streaming",
			data: { messages: [noiTroLy("a0", MO_DAU)] },
		});
		await moMan();
		expect(await choChiBao()).toContain(m.hoiThoai.dangSoan);
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
		expect(q(NUT_DUNG)).not.toBeNull();
		expect(q(NUT_GUI)).toBeNull();
		expect(qa("[data-goi-y]")).toHaveLength(0);
	},
	"ST-soan-ban-nhap": async () => {
		datDanhSach({ dong: BAN_NHAP });
		await moMan();
		expect(qa('[data-slot="kara-proposal-group"]')).toHaveLength(2);
		expect(qa('[data-loai-dong="kr"]')).toHaveLength(4);
		expect(qa('[data-loai-dong="can-chinh"]')).toHaveLength(1);
		expect((q("#khoi-11") as HTMLInputElement).value).toBe("3");
		expect((q("#dich-11") as HTMLInputElement).value).toBe("");
		expect(q("#khoi-12")).toBeNull();
		expect(chu('[data-o-so="12"]')).toBe(m.banNhap.moc);
		const THEM = {
			"muc-tieu": m.dong.themMucTieu,
			kr: m.dong.themKr,
			"can-chinh": m.dong.themCanChinh,
		} as const;
		for (const the of qa("[data-the-cho]")) {
			const chinh = the.querySelectorAll('button[data-variant="default"]');
			expect(chinh).toHaveLength(1);
			const loai = the.getAttribute("data-loai-dong") as keyof typeof THEM;
			expect(chinh[0]?.textContent?.trim()).toBe(THEM[loai]);
			expect(the.textContent).toContain(m.dong.boQua);
		}
		for (const the of qa(
			'[data-the-cho][data-loai-dong="muc-tieu"], [data-the-cho][data-loai-dong="kr"]',
		))
			expect(the.textContent).toContain(m.banNhap.nut.sua);
		expect(
			q('[data-loai-dong="can-chinh"]')?.textContent?.includes(
				m.banNhap.nut.sua,
			),
		).toBe(false);
		expect(
			q('[data-cot="ban-nhap"] [data-slot="kara-artifact-header"]')
				?.textContent,
		).toContain(m.man.soDong("7"));
	},
	"ST-soan-dong-sua": async () => {
		datDanhSach({ dong: BAN_NHAP });
		await moMan();
		const the = q('[data-dong="11"]');
		await bam(nut(m.banNhap.nut.sua, the ?? document.body));
		const o = q('[data-dong="11"] [data-slot="proposed-change-edit"]');
		expect((o as HTMLTextAreaElement).value).toBe("Khách lớn ký lại hợp đồng");
		nut(m.banNhap.nut.huy, the ?? document.body);
		await go(o, "Khách lớn ký lại trước 15/03");
		await bam(nut(m.dong.themBanSua, the ?? document.body));
		expect(goiCua("okr.soanQuyet").at(-1)?.dauVao).toEqual({
			deXuatId: "11",
			quyet: "sua",
			giaTriCuoi: "Khách lớn ký lại trước 15/03",
		});
	},
	"ST-soan-dong-da-quyet": async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		const nhan = q('[data-dong="11"][data-decided="accepted"]');
		expect(nhan?.textContent).toContain(m.dong.daThem);
		const bac = q('[data-dong="2"][data-decided="dismissed"]');
		expect(bac?.textContent).toContain(m.dong.daBoQua);
		expect(bac?.textContent).toContain(m.banNhap.bacCon("1"));
		expect(khoiCua("2")?.querySelector('[data-loai-dong="kr"]')).toBeNull();
		expect(q("#dich-11")?.matches(":disabled")).toBe(false);
		expect(
			q(
				'[data-dong="11"] [data-slot="proposed-change-decided"] [translate="no"]',
			)?.textContent,
			"chu nguoi go bi dich",
		).toBe("Khách lớn ký lại hợp đồng");
	},
	"ST-soan-sua-qua-chat": async () => {
		datDanhSach({ dong: BA_MUC });
		await moMan();
		const truoc = goiCua("okr.soanDanhSach").length;
		datDanhSach({ dong: BO_MUC_2 });
		await datAgent({ status: "streaming" });
		expect(goiCua("okr.soanDanhSach").length).toBe(truoc);
		await datAgent({ status: "ready" });
		await cho(
			() => goiCua("okr.soanDanhSach").length === truoc + 1,
			"doc lai sau luot",
		);
		await cho(() => tagCua("3b") !== undefined, "nhan hien");
		expect(tagCua("3b")).toBe(m.banNhap.nhan["vua-sua"]);
		expect(tagCua("21b")).toBe(m.banNhap.nhan["vua-chuyen"]);
		expect(tagCua("33b")).toBe(m.banNhap.nhan["vua-them"]);
		expect(tagCua("1b")).toBeUndefined();
		expect(tagCua("11b")).toBeUndefined();
		const muc2 = q('[data-dong="2"][data-decided="dismissed"]');
		expect(muc2?.textContent).toContain(m.dong.daBoQua);
		expect(muc2?.querySelector('[data-nhan="da-bo"]')?.textContent).toBe(
			m.banNhap.nhan["da-bo"],
		);
		expect(khoiCua("2")?.querySelector('[data-loai-dong="kr"]')).toBeNull();
		expect(
			khoiCua("1b")?.querySelector('[data-dong="21b"]') ?? null,
			"KR chuyen sang muc 1",
		).not.toBeNull();
	},
	"ST-soan-dong-bi-loai": async () => {
		const loai = "Đã bỏ một KR vì có số không có trong dữ liệu.";
		datDanhSach({ dong: BAN_NHAP });
		await datAgent({ data: { messages: [noiTroLy("a1", loai)] } });
		await moMan();
		expect(q('[role="log"]')?.textContent).toContain(loai);
		expect(qa("[data-loai-dong]")).toHaveLength(7);
	},
	"ST-soan-loi": async () => {
		await datAgent({ status: "error", error: new Error("mat mang") });
		await moMan();
		expect(chu('[data-luot="loi"] [data-slot="empty-title"]')).toBe(
			m.hoiThoai.loi,
		);
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).not.toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
	},
	"ST-soan-het-luot": async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 12 } });
		dat("okr.soanMo", () => ({
			ok: true,
			cuoc: { ...CUOC, id: "cuoc-2", soLuot: 0 },
		}));
		await moMan();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
		expect(chu(LY_DO_KHOA)).toBe(m.hoiThoai.hetLuot("12"));
		await bam(q('[data-nut="mo-cuoc-moi"]'));
		expect(goiCua("okr.soanMo")[0]?.dauVao).toEqual({
			cycleId: "q1",
			level: "phong-ban",
			divisionId: null,
			departmentId: "pb-1",
			boCuocDangId: CUOC.id,
		});
		await cho(() => banGhiCuoi() === `soan:${"cuoc-2"}`, "mo cuoc moi");
		expect(diTrang).toEqual([]);
	},
	"ST-soan-dua-vao-thieu-dich": async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		const nutDuaVao = q('[data-nut="dua-vao"]') as HTMLButtonElement;
		expect(nutDuaVao.disabled).toBe(true);
		expect(nutDuaVao.textContent).toBe(m.banNhap.duaVao("1", "3"));
		expect(chu("[data-thieu-dich]")).toBe(m.banNhap.thieuDich("2"));
		expect(q("#dich-11")?.getAttribute("aria-invalid")).toBe("true");
		expect(q("#khoi-11")?.getAttribute("aria-invalid")).toBeNull();
	},
	"ST-soan-dua-vao-xac-nhan": async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		await go(q("#dich-11"), "10");
		await go(q("#dich-14"), "7,5");
		const nutDuaVao = q('[data-nut="dua-vao"]') as HTMLButtonElement;
		expect(nutDuaVao.disabled).toBe(false);
		await bam(nutDuaVao);
		await cho(() => q('[role="alertdialog"]') !== null, "hop xac nhan");
		expect(q('[role="alertdialog"]')?.textContent).toContain(
			m.banNhap.xacNhan.than("1", "3", CUOC.tenDonVi, CUOC.tenChuKy),
		);
		await bam(
			nut(m.banNhap.xacNhan.nut, q('[role="alertdialog"]') ?? document.body),
		);
		expect(goiCua("okr.soanDuaVao")[0]?.dauVao).toEqual({
			cuocSoanId: CUOC.id,
			kr: [
				{ deXuatId: "11", khoiDiem: 3, dich: 10 },
				{ deXuatId: "14", khoiDiem: 3, dich: 7.5 },
			],
		});
	},
	"ST-soan-da-dua-vao": async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		await go(q("#dich-11"), "10");
		await go(q("#dich-14"), "8");
		await bam(q('[data-nut="dua-vao"]'));
		await bam(
			nut(m.banNhap.xacNhan.nut, q('[role="alertdialog"]') ?? document.body),
		);
		await cho(() => q("[data-da-dua-vao]") !== null, "da dua vao");
		expect(chu('[data-da-dua-vao] [data-slot="alert-title"]')).toBe(
			m.banNhap.daTao("1"),
		);
		expect(q('[data-nut="xem-theo-don-vi"]')?.getAttribute("href")).toBe(
			"/ws/okr/theo-don-vi?kyOkr=q1&donOkr=pb%3Apb-1",
		);
		expect(q("[data-hanh-dong]")).toBeNull();
		expect(q('[data-nut="dua-vao"]')).toBeNull();
		expect(daLamMoi).toContain("okr");
		expect(q("#dich-11")?.matches(":disabled")).toBe(true);
	},
	"ST-soan-dua-vao-loi": async () => {
		datDanhSach({ dong: DA_NHAN });
		dat("okr.soanDuaVao", () => ({
			ok: false,
			lyDo: "vuot-tran-muc-tieu",
			chiTiet: "Vượt trần 5 Mục tiêu mỗi đơn vị.",
		}));
		await moMan();
		await go(q("#dich-11"), "10");
		await go(q("#dich-14"), "8");
		const truoc = qa('[data-slot="kara-proposal-group"]').length;
		await bam(q('[data-nut="dua-vao"]'));
		await bam(
			nut(m.banNhap.xacNhan.nut, q('[role="alertdialog"]') ?? document.body),
		);
		await cho(() => q('[data-loi="dua-vao"]') !== null, "loi dua vao");
		expect(chu('[data-loi="dua-vao"]')).toBe(
			"Vượt trần 5 Mục tiêu mỗi đơn vị.",
		);
		expect(qa('[data-slot="kara-proposal-group"]')).toHaveLength(truoc);
		expect(q("[data-da-dua-vao]")).toBeNull();
		expect(daLamMoi).toEqual([]);
	},
	"ST-soan-hep": async () => {
		const goc = window.matchMedia;
		const khop = (truyVan: string) => ({
			...goc(truyVan),
			matches: truyVan === SOAN_UI.khoHep,
		});
		Object.defineProperty(window, "matchMedia", {
			value: khop,
			configurable: true,
			writable: true,
		});
		try {
			datDanhSach({ dong: BAN_NHAP });
			await moMan();
			const tab = qa('[data-khung="hep"] [role="tablist"] [role="tab"]');
			expect(tab.map((t) => t.textContent?.trim())).toEqual([
				m.man.tabTroChuyen,
				m.man.tabBanNhap("7"),
			]);
			expect(q('[data-khung="rong"]')).toBeNull();
		} finally {
			Object.defineProperty(window, "matchMedia", {
				value: goc,
				configurable: true,
				writable: true,
			});
		}
	},
	"ST-cuoc-danh-sach": async () => {
		dat("okr.soanDanhSachCuoc", () => ({
			cuoc: [
				{
					...CUOC,
					id: "c-cu",
					trangThai: "da-dua-vao",
					moLuc: "2026-11-02T03:00:00.000Z",
					soDongNhan: 5,
					soDongTong: 9,
				},
				{ ...CUOC, id: "c-moi", moLuc: "2026-12-01T03:00:00.000Z" },
			],
			soCuocDaDung: 2,
			tranCuoc: 3,
		}));
		const mo_: string[] = [];
		await mo(
			<DanhSachCuoc donVi={DV} dong={() => {}} mo={(id) => mo_.push(id)} />,
		);
		await cho(
			() => q('[data-cuoc="danh-sach"] [data-cuoc-id]') !== null,
			"danh sach cuoc",
		);
		const hang = qa('[data-cuoc="danh-sach"] [role="listitem"]');
		expect(hang.map((h) => h.getAttribute("data-cuoc-id"))).toEqual([
			"c-moi",
			"c-cu",
		]);
		expect(hang[1]?.querySelector("[data-dong-nhan]")?.textContent).toBe(
			m.cuoc.dongNhan("5", "9"),
		);
		expect(hang[1]?.querySelector('[translate="no"]')?.textContent).toBe(
			CUOC.nguoiMo.name,
		);
		expect(hang[1]?.textContent).toContain(m.cuoc.trangThai["da-dua-vao"]);
		const nutMo = hang[0]?.querySelector('[data-nut="mo-cuoc"]');
		expect(nutMo?.getAttribute("aria-label")).toBe(
			m.cuoc.nutCuoc(m.cuoc.tiep, "01/12/2026"),
		);
		expect(chu('[data-slot="sheet-description"]')).toBe(m.cuoc.dem("2", "3"));
		await bam(nutMo ?? null);
		expect(mo_).toEqual(["c-moi"]);
	},
	"ST-cuoc-rong": async () => {
		await mo(<DanhSachCuoc donVi={DV} dong={() => {}} mo={() => {}} />);
		await cho(() => q('[data-cuoc="rong"]') !== null, "rong");
		expect(chu('[data-cuoc="rong"] [data-slot="empty-title"]')).toBe(
			m.cuoc.rong,
		);
		await bam(q('[data-cuoc="rong"] [data-nut="mo-cuoc-moi"]'));
		expect(goiCua("okr.soanMo")[0]?.dauVao).toEqual(DV);
	},
} satisfies Record<`ST-${string}`, () => Promise<void>>;

const CA_THEO_ID = new Map(Object.entries(CA));

describe("trang-thai theo bang cua thiet ke", () => {
	const ID = idBangTrangThai();

	test("moi id trong bang co mot ca", () => {
		expect(ID.length).toBeGreaterThan(0);
		const thieu = ID.filter((id) => !CA_THEO_ID.has(id));
		expect(thieu.map((id) => `trang thai chua do: ${id}`)).toEqual([]);
	});

	test("moi ca co id trong bang", () => {
		const la = [...CA_THEO_ID.keys()].filter((id) => !ID.includes(id));
		expect(la.map((id) => `ca la: ${id}`)).toEqual([]);
	});

	for (const id of ID)
		test(`trang-thai ${id}`, async () => {
			const ca = CA_THEO_ID.get(id);
			if (!ca) throw new Error(`trang thai chua do: ${id}`);
			await ca();
		});
});

describe("bang nhap doc lai theo luot", () => {
	test("bang nhap doc lai theo su kien luot, KHONG theo dong ho", async () => {
		datDanhSach({ dong: BAN_NHAP });
		batDongHoGia();
		await moMan();
		const truoc = goiCua("okr.soanDanhSach").length;
		await troi(60_000);
		expect(goiCua("okr.soanDanhSach").length, "doc lai theo dong ho").toBe(
			truoc,
		);
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await cho(
			() => goiCua("okr.soanDanhSach").length === truoc + 1,
			"doc lai sau luot",
		);
	});

	test("nhãn giữ tới lượt kế: quyết một dòng không xoá nhãn, lượt sau không đổi gì thì nhãn tắt", async () => {
		datDanhSach({ dong: BA_MUC });
		await moMan();
		datDanhSach({ dong: BO_MUC_2 });
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await cho(() => tagCua("3b") !== undefined, "nhan hien");
		dat("okr.soanQuyet", (vao) => {
			danhSachDaQuyet(vao);
			return { ok: true };
		});
		const doc = goiCua("okr.soanDanhSach").length;
		await bam(nut(m.dong.themKr, q('[data-dong="11b"]') ?? document.body));
		await cho(
			() => goiCua("okr.soanDanhSach").length > doc,
			"doc lai sau quyet",
		);
		await cho(
			() => q('[data-dong="11b"][data-decided="accepted"]') !== null,
			"dong da nhan",
		);
		expect(tagCua("3b"), "nhan mat sau khi quyet").toBe(
			m.banNhap.nhan["vua-sua"],
		);
		expect(tagCua("21b")).toBe(m.banNhap.nhan["vua-chuyen"]);
		expect(tagCua("33b")).toBe(m.banNhap.nhan["vua-them"]);
		expect(
			q('[data-dong="2"] [data-nhan="da-bo"]'),
			"da bo mat",
		).not.toBeNull();
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await cho(() => tagCua("3b") === undefined, "nhan tat sau luot ke");
		expect(tagCua("21b")).toBeUndefined();
		expect(tagCua("33b")).toBeUndefined();
		expect(q('[data-dong="2"]')).toBeNull();
	});
});

const HEP_PX = 390;
const RONG_PX = 1440;
const NGAN = "[data-trang-soan]";
const THAN_NGAN = '[data-slot="sheet-body"]';
const CAT_NGANG = new Set(["auto", "scroll", "hidden", "clip"]);

const tenO = (o: Element) =>
	o.getAttribute("data-slot") ?? o.getAttribute("data-cot") ?? o.tagName;

const tranNgang = (k: KieuThat) =>
	CAT_NGANG.has(k.get("overflow-x") ?? k.get("overflow") ?? "visible");

async function oLuoiKhongChan(tu: Element, rong: number): Promise<string[]> {
	const loi: string[] = [];
	let con = tu;
	for (const cha of chuoiToTien(tu, NGAN)) {
		const kCha = await kieuThat(cha, rong);
		if (kCha.get("display")?.endsWith("grid")) {
			const kCon = await kieuThat(con, rong);
			const conCo0 = kCon.get("min-width") === "0px" || tranNgang(kCon);
			if (!ranhChanDay(kCha.get("grid-template-columns")) && !conCo0)
				loi.push(
					`${rong}px ${tenO(cha)} > ${tenO(con)}: cot luoi ${kCha.get("grid-template-columns") ?? "auto"} gian theo chu`,
				);
		}
		con = cha;
	}
	return loi;
}

const THANH_TAB = '[data-khung="hep"] [role="tablist"]';
const KHUNG_CHAT = '[data-khung="hep"] [data-cot="hoi-thoai"]';
const NHAN_TAB = '[role="tab"]';
const CO_TAB = 2;
const PX_MOI_REM = 16;
const PX_MOI_KHOANG = 4;
const DAI = {
	px: /^([\d.]+)px$/,
	rem: /^([\d.]+)rem$/,
	khoang: /^calc\(var\(--spacing\)\s*\*\s*([\d.]+)\)$/,
	phanTram: /^(?:calc\()?([\d.]+)%\)?$/,
	phanSo: /^calc\(([\d.]+)\s*\/\s*([\d.]+)\s*\*\s*100%\)$/,
	theoChu: new Set(["max-content"]),
};

function doDai(gia: string | undefined, cha: number): number | null {
	if (!gia) return null;
	if (DAI.theoChu.has(gia)) return Number.POSITIVE_INFINITY;
	const so = (m: RegExpExecArray | null, i = 1) => Number(m?.[i]);
	const px = DAI.px.exec(gia);
	if (px) return so(px);
	const rem = DAI.rem.exec(gia);
	if (rem) return so(rem) * PX_MOI_REM;
	const khoang = DAI.khoang.exec(gia);
	if (khoang) return so(khoang) * PX_MOI_KHOANG;
	const phanTram = DAI.phanTram.exec(gia);
	if (phanTram) return (so(phanTram) / 100) * cha;
	const phanSo = DAI.phanSo.exec(gia);
	if (phanSo) return (so(phanSo) / so(phanSo, 2)) * cha;
	return null;
}

async function rongNgan(ngan: Element, rong: number): Promise<number> {
	const k = await kieuThat(ngan, rong);
	return Math.min(
		doDai(k.get("width"), rong) ?? rong,
		doDai(k.get("max-width"), rong) ?? rong,
	);
}

async function anDi(o: Element, rong: number): Promise<string | null> {
	for (const c of [o, ...chuoiToTien(o, NGAN)]) {
		if (c.hasAttribute("hidden")) return `${tenO(c)} co hidden`;
		const k = await kieuThat(c, rong);
		if (k.get("display") === "none" || k.get("visibility") === "hidden")
			return `${tenO(c)} khong hien`;
	}
	return null;
}

async function rongVuotNgan(o: Element, rong: number): Promise<string[]> {
	const chuoi = chuoiToTien(o, NGAN);
	const ngan = chuoi[chuoi.length - 1];
	if (!ngan) throw new Error("khong thay ngan");
	const tran = await rongNgan(ngan, rong);
	const loi: string[] = [];
	for (const c of [o, ...chuoi.slice(0, -1)]) {
		const k = await kieuThat(c, rong);
		for (const thuocTinh of ["width", "min-width"]) {
			const d = doDai(k.get(thuocTinh), tran);
			if (d !== null && d > tran)
				loi.push(
					`${rong}px ${tenO(c)}: ${thuocTinh} ${k.get(thuocTinh)} > ngan ${tran}px`,
				);
		}
	}
	return loi;
}

async function hangKhongXuongDong(
	tu: Element,
	rong: number,
): Promise<string[]> {
	const loi: string[] = [];
	let coHangXuongDong = false;
	for (const cha of chuoiToTien(tu, THAN_NGAN)) {
		if (cha.matches(THAN_NGAN)) break;
		const k = await kieuThat(cha, rong);
		if (k.get("white-space") === "nowrap")
			loi.push(`${rong}px ${tenO(cha)}: giu mot dong`);
		if (tranNgang(k)) loi.push(`${rong}px ${tenO(cha)}: cuon ngang, cat mep`);
		if (k.get("display")?.endsWith("flex") && k.get("flex-wrap") === "wrap")
			coHangXuongDong = true;
	}
	if (!coHangXuongDong)
		loi.push(`${rong}px ${tenO(tu)}: khong co hang tu xuong dong`);
	return loi;
}

function khoHep(bat: boolean): () => void {
	const goc = window.matchMedia;
	Object.defineProperty(window, "matchMedia", {
		value: (truyVan: string) => ({
			...goc(truyVan),
			matches: bat && truyVan === SOAN_UI.khoHep,
		}),
		configurable: true,
		writable: true,
	});
	return () =>
		Object.defineProperty(window, "matchMedia", {
			value: goc,
			configurable: true,
			writable: true,
		});
}

const THIEU_THANH_TAB =
	"ngan soan o 390px: khong thay thanh tab Tro chuyen/Ban nhap dang hien";
const THIEU_KHUNG_CHAT =
	"ngan soan o 390px: khong thay khung tro chuyen dang hien";
const VUOT_NGAN_HEP =
	"ngan soan o 390px: thanh tab hoac khung tro chuyen rong hon ngan";
const TRAN_NGAN_HEP =
	"ngan soan o 390px: cot luoi chua thanh tab va tro chuyen gian theo chu, tab Ban nhap bi cat";
const BANG_CUOC_CAT =
	"danh sach cuoc: hang khong tu xuong dong, nut Xem va trang thai bi cat o mep";
const NUT_DE_CHU = "thong bao da dua vao: nut Xem o Theo don vi noi de len chu";

describe("bo tri — khong tran, khong cat, khong de chu (E13)", () => {
	test("ngăn soạn ở 390 px: thanh tab và trò chuyện không giãn quá ngăn", async () => {
		const tra = khoHep(true);
		try {
			datDanhSach({ dong: BAN_NHAP });
			await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
			await moMan();
			const thanhTab = q(THANH_TAB);
			if (!thanhTab) throw new Error(THIEU_THANH_TAB);
			expect(thanhTab.querySelectorAll(NHAN_TAB), THIEU_THANH_TAB).toHaveLength(
				CO_TAB,
			);
			expect(await anDi(thanhTab, HEP_PX), THIEU_THANH_TAB).toBeNull();
			const khungChat = q(KHUNG_CHAT);
			if (!khungChat) throw new Error(THIEU_KHUNG_CHAT);
			expect(await anDi(khungChat, HEP_PX), THIEU_KHUNG_CHAT).toBeNull();
			const vuot = [
				...(await rongVuotNgan(thanhTab, HEP_PX)),
				...(await rongVuotNgan(khungChat, HEP_PX)),
			];
			expect(vuot, VUOT_NGAN_HEP).toEqual([]);
			const goc = [
				thanhTab,
				khungChat,
				...thanhTab.querySelectorAll(NHAN_TAB),
				...qa("[data-goi-y]"),
			];
			const loi = (
				await Promise.all(goc.map((o) => oLuoiKhongChan(o, HEP_PX)))
			).flat();
			expect([...new Set(loi)], TRAN_NGAN_HEP).toEqual([]);
		} finally {
			tra();
		}
	});

	test("ngăn soạn ở 1440 px: cột trò chuyện không giãn quá ngăn", async () => {
		datDanhSach({ dong: BAN_NHAP });
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		const goc = qa("[data-goi-y]");
		expect(goc.length).toBeGreaterThan(0);
		const loi = (
			await Promise.all(goc.map((o) => oLuoiKhongChan(o, RONG_PX)))
		).flat();
		expect([...new Set(loi)], TRAN_NGAN_HEP).toEqual([]);
	});

	test("danh sách cuộc ở 390 và 1440 px: hàng tự xuống dòng, không vùng cuộn ngang cắt nút", async () => {
		dat("okr.soanDanhSachCuoc", () => ({
			cuoc: [
				{ ...CUOC, id: "c-cu", trangThai: "da-dua-vao" },
				{ ...CUOC, id: "c-moi", moLuc: "2026-12-01T03:00:00.000Z" },
			],
			soCuocDaDung: 2,
			tranCuoc: 3,
		}));
		await mo(<DanhSachCuoc donVi={DV} dong={() => {}} mo={() => {}} />);
		await cho(
			() => q('[data-cuoc="danh-sach"] [data-nut="mo-cuoc"]') !== null,
			"danh sach cuoc",
		);
		const goc = [
			...qa('[data-cuoc="danh-sach"] [data-nut="mo-cuoc"]'),
			...qa('[data-cuoc="danh-sach"] [data-slot="status-indicator"]'),
		];
		expect(goc).toHaveLength(4);
		const loi: string[] = [];
		for (const rong of [HEP_PX, RONG_PX])
			for (const o of goc) loi.push(...(await hangKhongXuongDong(o, rong)));
		expect([...new Set(loi)], BANG_CUOC_CAT).toEqual([]);
	});

	for (const hep of [true, false])
		test(`đã đưa vào ở ${hep ? HEP_PX : RONG_PX} px: nút Xem ở Theo đơn vị nằm trong luồng, không đè chữ`, async () => {
			const tra = khoHep(hep);
			try {
				datDanhSach({ dong: DA_NHAN });
				await moMan();
				if (hep) {
					await nhanTab(qa('[data-khung="hep"] [role="tab"]')[1]);
					await cho(() => q("#dich-11") !== null, "tab ban nhap");
				}
				await go(q("#dich-11"), "10");
				await go(q("#dich-14"), "8");
				await bam(q('[data-nut="dua-vao"]'));
				await bam(
					nut(
						m.banNhap.xacNhan.nut,
						q('[role="alertdialog"]') ?? document.body,
					),
				);
				await cho(() => q("[data-da-dua-vao]") !== null, "da dua vao");
				const hanhDong = q('[data-da-dua-vao] [data-slot="alert-action"]');
				if (!hanhDong) throw new Error("khong thay nut cua thong bao");
				expect(
					hanhDong.querySelector('[data-nut="xem-theo-don-vi"]'),
				).not.toBeNull();
				const k = await kieuThat(hanhDong, hep ? HEP_PX : RONG_PX);
				expect(k.get("position") ?? "static", NUT_DE_CHU).toBe("static");
			} finally {
				tra();
			}
		});
});
