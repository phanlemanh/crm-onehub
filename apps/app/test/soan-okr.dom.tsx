import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import {
	BAN_NHAP,
	bam,
	baoLoiAgent,
	CUOC,
	cho,
	chu,
	DanhSachCuoc,
	daDong,
	daGui,
	daLamMoi,
	daMoCuoc,
	daTaiLuong,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	don,
	go,
	goiCua,
	kr,
	MO_DAU,
	m,
	mo,
	moMan,
	mt,
	nguoiNoi,
	nhip,
	noiTroLy,
	nut,
	q,
	qa,
	SOAN_UI,
	soLanMoAgent,
	tuyChonAgent,
} from "./khung-soan-okr";

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
	test("ST-soan-mo-dau", async () => {
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
		expect(chu('[data-ban-nhap="rong"] [data-slot="empty-title"]')).toBe(
			m.banNhap.rong,
		);
		await bam(goiY[0] ?? null);
		expect(daGui).toEqual(["Giữ khách"]);
	});

	test("ST-soan-thieu-boi-canh", async () => {
		datDanhSach({ thieuBoiCanh: true });
		await moMan(true);
		expect(chu('[data-dai="thieu-boi-canh"] [data-slot="alert-title"]')).toBe(
			m.hoiThoai.thieuBoiCanh,
		);
		const toi = q('[data-dai="thieu-boi-canh"] a');
		expect(toi?.textContent).toBe(m.hoiThoai.toiKho);
		expect(toi?.getAttribute("href")).toBe("/ws/tai-lieu");
	});

	test("ST-soan-thieu-boi-canh: người thường không có nút tới Kho", async () => {
		datDanhSach({ thieuBoiCanh: true });
		await moMan(false);
		expect(q('[data-dai="thieu-boi-canh"]')).not.toBeNull();
		expect(q('[data-dai="thieu-boi-canh"] a')).toBeNull();
	});

	test("ST-soan-dang-tra-loi", async () => {
		await datAgent({
			status: "streaming",
			data: { messages: [noiTroLy("a0", MO_DAU)] },
		});
		await moMan();
		const dang = q('[role="status"][aria-live="polite"][aria-busy="true"]');
		expect(dang?.textContent).toContain(m.hoiThoai.dangSoan);
		const oSoan = q('[data-o-soan="khoa"] textarea') as HTMLTextAreaElement;
		expect(oSoan.disabled).toBe(true);
		expect(chu("[data-o-soan-ghi]")).toBe(m.hoiThoai.khoaKhiSoan);
		expect(qa("[data-goi-y]")).toHaveLength(0);
	});

	test("ST-soan-ban-nhap", async () => {
		datDanhSach({ dong: BAN_NHAP });
		await moMan();
		expect(qa("[data-khoi-muc-tieu]")).toHaveLength(2);
		expect(qa('[data-loai-dong="kr"]')).toHaveLength(4);
		expect(qa('[data-loai-dong="can-chinh"]')).toHaveLength(1);
		expect((q("#khoi-11") as HTMLInputElement).value).toBe("3");
		expect((q("#dich-11") as HTMLInputElement).value).toBe("");
		expect(q("#khoi-12")).toBeNull();
		expect(chu('[data-o-so="12"]')).toBe(m.banNhap.moc);
		for (const the of qa("[data-the-cho]")) {
			expect(
				the.querySelectorAll('button[data-variant="default"]'),
			).toHaveLength(1);
			expect(the.textContent).toContain(m.banNhap.nut.bac);
		}
		expect(
			q('[data-loai-dong="can-chinh"]')?.textContent?.includes(
				m.banNhap.nut.sua,
			),
		).toBe(false);
		expect(chu('[data-cot="ban-nhap"] [data-slot="badge"]')).toBe(
			m.man.soDong("7"),
		);
	});

	test("ST-soan-dong-sua", async () => {
		datDanhSach({ dong: BAN_NHAP });
		await moMan();
		const the = q('[data-dong="11"]');
		await bam(nut(m.banNhap.nut.sua, the ?? document.body));
		const o = q('[data-dong="11"] [data-slot="proposed-change-edit"]');
		expect((o as HTMLTextAreaElement).value).toBe("Khách lớn ký lại hợp đồng");
		nut(m.banNhap.nut.huy, the ?? document.body);
		await go(o, "Khách lớn ký lại trước 15/03");
		await bam(nut(m.banNhap.nut.nhanBanSua, the ?? document.body));
		expect(goiCua("okr.soanQuyet").at(-1)?.dauVao).toEqual({
			deXuatId: "11",
			quyet: "sua",
			giaTriCuoi: "Khách lớn ký lại trước 15/03",
		});
	});

	test("quyết bị từ chối có tên: câu chiTiet hiện trên thẻ", async () => {
		datDanhSach({ dong: BAN_NHAP });
		dat("okr.soanQuyet", () => ({
			ok: false,
			lyDo: "cha-da-bac",
			chiTiet: "Mục tiêu «Mở tuyến» đã bị bác.",
		}));
		await moMan();
		await bam(nut(m.banNhap.nut.nhan, q('[data-dong="21"]') ?? document.body));
		await cho(
			() =>
				q('[data-dong="21"]')?.textContent?.includes(
					"Mục tiêu «Mở tuyến» đã bị bác.",
				) === true,
			"loi quyet hien",
		);
		expect(goiCua("okr.soanDanhSach").length).toBeGreaterThan(1);
	});

	test("ST-soan-dong-da-quyet", async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		const nhan = q('[data-dong="11"][data-decided="accepted"]');
		expect(nhan?.textContent).toContain(m.banNhap.ket.accepted);
		const bac = q('[data-dong="2"][data-decided="dismissed"]');
		expect(bac?.textContent).toContain(m.banNhap.ket.dismissed);
		expect(bac?.textContent).toContain(m.banNhap.bacCon("1"));
		expect(q('[data-khoi-muc-tieu="2"] [data-loai-dong="kr"]')).toBeNull();
		expect((q("#dich-11") as HTMLInputElement | null)?.disabled).toBe(false);
	});

	test("ST-soan-sua-qua-chat: đọc lại sau lượt, nhãn vừa sửa · vừa chuyển · đã bỏ", async () => {
		datDanhSach({ dong: BAN_NHAP });
		await moMan();
		const truoc = goiCua("okr.soanDanhSach").length;
		datDanhSach({
			dong: [
				mt("1", "Giữ khách lớn miền Bắc", "cho", { loaiMucTieu: "tham-vong" }),
				kr("11", "1", "Khách lớn ký lại hợp đồng"),
				kr("21", "1", "Chuyến đúng hẹn"),
				mt("2", "Mở tuyến Hà Nội – Hải Phòng"),
				kr("22", "2", "Khách mới trên tuyến"),
			],
		});
		await datAgent({ status: "streaming" });
		expect(goiCua("okr.soanDanhSach").length).toBe(truoc);
		await datAgent({ status: "ready" });
		await cho(
			() => goiCua("okr.soanDanhSach").length === truoc + 1,
			"doc lai sau luot",
		);
		await cho(
			() => qa('[data-slot="proposed-change-tag"]').length > 0,
			"nhan hien",
		);
		const tag = (id: string) =>
			q(`[data-dong="${id}"] [data-slot="proposed-change-tag"]`)?.textContent;
		expect(tag("1")).toBe(m.banNhap.nhan["vua-sua"]);
		expect(tag("21")).toBe(m.banNhap.nhan["vua-chuyen"]);
		expect(tag("11")).toBeUndefined();
		const bo = q('[data-dong="12"][data-decided="dismissed"]');
		expect(bo?.querySelector('[data-nhan="da-bo"]')?.textContent).toBe(
			m.banNhap.nhan["da-bo"],
		);
	});

	test("ST-soan-dong-bi-loai", async () => {
		const loai = "Đã bỏ một KR vì có số không có trong dữ liệu.";
		datDanhSach({ dong: BAN_NHAP });
		await datAgent({ data: { messages: [noiTroLy("a1", loai)] } });
		await moMan();
		expect(q('[role="log"]')?.textContent).toContain(loai);
		expect(qa("[data-loai-dong]")).toHaveLength(7);
	});

	test("ST-soan-loi", async () => {
		await datAgent({ status: "error", error: new Error("mat mang") });
		await moMan();
		expect(chu('[data-luot="loi"] [data-slot="alert-title"]')).toBe(
			m.hoiThoai.loi,
		);
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
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
		expect(q('[data-nut="thu-lai"]')).toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
	});

	test("ST-soan-het-luot: Mở cuộc mới bỏ cuộc hết lượt rồi chuyển sang cuộc mới", async () => {
		datDanhSach({ cuoc: { ...CUOC, soLuot: 12 } });
		dat("okr.soanMo", () => ({
			ok: true,
			cuoc: { ...CUOC, id: "cuoc-2", soLuot: 0 },
		}));
		await moMan();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
		expect(chu("[data-o-soan-ghi]")).toBe(m.hoiThoai.hetLuot("12"));
		await bam(q('[data-nut="mo-cuoc-moi"]'));
		expect(goiCua("okr.soanMo")[0]?.dauVao).toEqual({
			cycleId: "q1",
			level: "phong-ban",
			divisionId: null,
			departmentId: "pb-1",
			boCuocDangId: CUOC.id,
		});
		await cho(() => daMoCuoc.length === 1, "mo cuoc moi");
		expect(daMoCuoc).toEqual(["cuoc-2"]);
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
		expect(daMoCuoc).toEqual([]);
	});

	test("ST-soan-dua-vao-thieu-dich", async () => {
		datDanhSach({ dong: DA_NHAN });
		await moMan();
		const nutDuaVao = q('[data-nut="dua-vao"]') as HTMLButtonElement;
		expect(nutDuaVao.disabled).toBe(true);
		expect(nutDuaVao.textContent).toBe(m.banNhap.duaVao("1", "3"));
		expect(chu("[data-thieu-dich]")).toBe(m.banNhap.thieuDich("2"));
		expect(q("#dich-11")?.getAttribute("aria-invalid")).toBe("true");
		expect(q("#khoi-11")?.getAttribute("aria-invalid")).toBeNull();
	});

	test("ST-soan-dua-vao-xac-nhan: gửi số người gõ, không gửi số cho mốc", async () => {
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
	});

	test("ST-soan-da-dua-vao", async () => {
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
		expect((q("#dich-11") as HTMLInputElement).disabled).toBe(true);
	});

	test("ST-soan-dua-vao-loi", async () => {
		datDanhSach({ dong: DA_NHAN });
		dat("okr.soanDuaVao", () => ({
			ok: false,
			lyDo: "vuot-tran-muc-tieu",
			chiTiet: "Vượt trần 5 Mục tiêu mỗi đơn vị.",
		}));
		await moMan();
		await go(q("#dich-11"), "10");
		await go(q("#dich-14"), "8");
		const truoc = qa("[data-khoi-muc-tieu]").length;
		await bam(q('[data-nut="dua-vao"]'));
		await bam(
			nut(m.banNhap.xacNhan.nut, q('[role="alertdialog"]') ?? document.body),
		);
		await cho(() => q('[data-loi="dua-vao"]') !== null, "loi dua vao");
		expect(chu('[data-loi="dua-vao"]')).toBe(
			"Vượt trần 5 Mục tiêu mỗi đơn vị.",
		);
		expect(qa("[data-khoi-muc-tieu]")).toHaveLength(truoc);
		expect(q("[data-da-dua-vao]")).toBeNull();
		expect(daLamMoi).toEqual([]);
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

	test("ST-soan-hep", async () => {
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
			const tab = qa('[data-khong="hep"] [role="tablist"] [role="tab"]');
			expect(tab.map((t) => t.textContent?.trim())).toEqual([
				m.man.tabTroChuyen,
				m.man.tabBanNhap("7"),
			]);
			expect(q('[data-khong="rong"]')).toBeNull();
		} finally {
			Object.defineProperty(window, "matchMedia", {
				value: goc,
				configurable: true,
				writable: true,
			});
		}
	});

	test("cuộc đã đưa vào mở lại để xem: bảng khoá, không gửi lượt, có đường tới Theo đơn vị", async () => {
		datDanhSach({
			cuoc: { ...CUOC, trangThai: "da-dua-vao" },
			dong: DA_NHAN,
		});
		await moMan();
		expect(q('[data-man-soan="da-dua-vao"]')).not.toBeNull();
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
	test("chữ chưa gửi: đóng màn phải hỏi lại", async () => {
		await moMan();
		await go(q("[data-o-soan] textarea"), "Ưu tiên giữ khách");
		await bam(q('[data-slot="sheet-content"] > [data-slot="sheet-close"]'));
		expect(daDong).toEqual([]);
		expect(q('[role="alertdialog"]')).not.toBeNull();
	});

	test("không gõ gì: đóng màn đóng ngay", async () => {
		await moMan();
		await bam(q('[data-slot="sheet-content"] > [data-slot="sheet-close"]'));
		expect(daDong).toEqual([1]);
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
		await bam(q('[data-slot="sheet-content"] > [data-slot="sheet-close"]'));
		expect(daDong).toEqual([]);
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
			const tab = () => qa('[data-khong="hep"] [role="tab"]');
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
			() => chu('[data-slot="sheet-description"]')?.includes("1/12") === true,
			"cuoc doc lai",
		);
		expect(soLanMoAgent).toBe(moTruoc);
		expect(daTaiLuong).toEqual([]);
	});

	test("phiên đã có mã eve: tải luồng theo mã đó", async () => {
		await moMan();
		expect(daTaiLuong).toEqual([CUOC.sessionId]);
	});

	test("cửa trả 409 da-co-phien: đọc lại cuộc rồi mở lại theo phiên có sẵn", async () => {
		datDanhSach({ cuoc: CHO_GIU });
		await moMan();
		const moTruoc = soLanMoAgent;
		const doc = goiCua("okr.soanDanhSach").length;
		datDanhSach({ cuoc: { ...CHO_GIU, sessionId: "wrun_khac", soLuot: 1 } });
		await baoLoiAgent(
			Object.assign(new Error("da-co-phien"), {
				status: 409,
				body: '{"error":"da-co-phien"}',
			}),
		);
		await nhip(20);
		expect(soLanMoAgent).toBe(moTruoc + 1);
		expect(goiCua("okr.soanDanhSach").length).toBeGreaterThan(doc);
		expect(daTaiLuong).toEqual(["wrun_khac"]);
		expect(q('[data-luot="loi"]')).toBeNull();
	});
});

describe("danh sach cuoc", () => {
	const DV = {
		cycleId: "q1",
		level: "phong-ban" as const,
		divisionId: null,
		departmentId: "pb-1",
	};

	test("ST-cuoc-danh-sach", async () => {
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
			tranCuoc: 3,
		}));
		const mo_: string[] = [];
		await mo(
			<DanhSachCuoc donVi={DV} dong={() => {}} mo={(id) => mo_.push(id)} />,
		);
		await cho(
			() => q('[data-cuoc="danh-sach"] tbody tr') !== null,
			"bang cuoc",
		);
		const hang = qa('[data-cuoc="danh-sach"] tbody tr');
		expect(hang.map((h) => h.getAttribute("data-cuoc-id"))).toEqual([
			"c-moi",
			"c-cu",
		]);
		expect(hang[1]?.textContent).toContain("5/9");
		expect(hang[1]?.textContent).toContain(m.cuoc.trangThai["da-dua-vao"]);
		const nutMo = hang[0]?.querySelector('[data-nut="mo-cuoc"]');
		expect(nutMo?.getAttribute("aria-label")).toBe(
			m.cuoc.nutCuoc(m.cuoc.tiep, "01/12/2026"),
		);
		expect(chu('[data-slot="sheet-description"]')).toBe(m.cuoc.dem("2", "3"));
		await bam(nutMo ?? null);
		expect(mo_).toEqual(["c-moi"]);
	});

	test("ST-cuoc-rong", async () => {
		await mo(<DanhSachCuoc donVi={DV} dong={() => {}} mo={() => {}} />);
		await cho(() => q('[data-cuoc="rong"]') !== null, "rong");
		expect(chu('[data-cuoc="rong"] [data-slot="empty-title"]')).toBe(
			m.cuoc.rong,
		);
		await bam(q('[data-cuoc="rong"] [data-nut="mo-cuoc-moi"]'));
		expect(goiCua("okr.soanMo")[0]?.dauVao).toEqual(DV);
	});
});
