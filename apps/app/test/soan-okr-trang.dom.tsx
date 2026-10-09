import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type BanNhap, banNhap } from "@crm/validation/okr-cuoc-soan";
import { act } from "react";
import { docKhoi, KHOI_MO } from "@/app/(app)/[slug]/okr/soan/khoi-ngu-canh";
import {
	BAN_NHAP,
	bam,
	CUOC,
	cc,
	cho,
	daDung,
	daGui,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	don,
	go,
	goiCua,
	kr,
	m,
	mo,
	moTrang,
	mt,
	nguoiNoi,
	nhip,
	nut,
	TrangSoan,
	urlDoi,
} from "./khung-soan-okr";

type PropsO = {
	defaultSize?: number | string;
	minSize?: number | string;
	maxSize?: number | string;
};
type Soi = { memoizedProps?: PropsO; return?: Soi | null };

function _propsDaDung(o: Element | null): PropsO | null {
	const khoa = o && Object.keys(o).find((k) => k.startsWith("__reactFiber$"));
	let soi: Soi | null | undefined = khoa
		? (o as unknown as Record<string, Soi>)[khoa]
		: null;
	while (soi) {
		if (soi.memoizedProps?.defaultSize !== undefined) return soi.memoizedProps;
		soi = soi.return;
	}
	return null;
}

const q = (s: string) => document.querySelector(s);
const qa = (s: string) => [...document.querySelectorAll(s)];

async function _nhanTab(o: Element | undefined): Promise<void> {
	if (!o) throw new Error("khong thay tab");
	await act(async () => {
		o.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
	});
	await nhip(3);
}

function beRong(rong: number): () => void {
	const goc = window.matchMedia;
	const gia = (truyVan: string) => {
		const tran = /max-width:\s*(\d+)px/.exec(truyVan);
		return {
			matches: tran ? rong <= Number(tran[1]) : false,
			media: truyVan,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		};
	};
	Object.defineProperty(window, "matchMedia", {
		value: gia,
		writable: true,
		configurable: true,
	});
	return () =>
		Object.defineProperty(window, "matchMedia", {
			value: goc,
			writable: true,
			configurable: true,
		});
}

beforeEach(datLai);
afterEach(don);

const dongEl = (id: string) => q(`[data-dong="${id}"]`);
const nutTrong = (id: string, hanh: string) =>
	dongEl(id)?.querySelector<HTMLButtonElement>(`[data-hanh-dong="${hanh}"]`) ??
	null;
const nutHoanTac = (goc: Element | null) =>
	[...(goc?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find(
		(b) => b.textContent?.trim() === "Hoàn tác",
	) ?? null;

async function datBanNhap(
	dong: Parameters<typeof datDanhSach>[0]["dong"],
): Promise<void> {
	datDanhSach({ dong });
}

describe("k2-dong", () => {
	const HAI_MT = [
		mt("1", "Giữ khách lớn miền Bắc"),
		kr("11", "1", "Khách lớn ký lại hợp đồng"),
		kr("12", "1", "Rà soát tuyến trước hạn", "cho", "moc"),
		cc("13", "1"),
		mt("2", "Mở tuyến Hà Nội – Hải Phòng"),
		kr("21", "2", "Chuyến đúng hẹn"),
		kr("22", "2", "Khảo sát tuyến", "cho", "moc"),
		cc("23", "2"),
	];
	const NUT_CHINH = {
		"muc-tieu": m.dong.themMucTieu,
		kr: m.dong.themKr,
		"can-chinh": m.dong.themCanChinh,
	} as const;

	test("mỗi Mục tiêu một nhóm một nhãn Kara, dòng inline, một nút chính theo hậu quả, ô số trên dòng KR có số", async () => {
		await datBanNhap(HAI_MT);
		await moTrang();
		const nhom = qa('[data-slot="kara-proposal-group"]');
		expect(nhom.length).toBe(2);
		for (const g of nhom) {
			expect(g.querySelectorAll('[data-slot="kara-label"]').length).toBe(1);
		}
		const artifact = q('[data-slot="kara-artifact"]');
		expect(
			`the card trong ban nhap: ${artifact?.querySelectorAll('[data-density="card"], [data-slot="confirmation"]').length}`,
		).toBe("the card trong ban nhap: 0");
		let khang = 0;
		for (const d of HAI_MT) {
			const row = dongEl(d.id);
			const loai = row?.getAttribute(
				"data-loai-dong",
			) as keyof typeof NUT_CHINH;
			const chinh = [
				...(row?.querySelectorAll('button[data-variant="default"]') ?? []),
			];
			expect({
				id: d.id,
				chinh: chinh.map((b) => b.textContent?.trim()),
			}).toEqual({
				id: d.id,
				chinh: [NUT_CHINH[loai]],
			});
			expect(
				`nut khong theo hau qua: ${chinh[0]?.textContent?.trim()}`,
			).not.toBe("nut khong theo hau qua: Nhận");
			expect(nutTrong(d.id, "sua") === null).toBe(loai === "can-chinh");
			expect(nutTrong(d.id, "bac")?.textContent?.trim()).toBe(m.dong.boQua);
			khang += 4;
		}
		const oSo = (id: string) =>
			[...(q(`[data-o-so="${id}"]`)?.querySelectorAll("input") ?? [])].length;
		expect([oSo("11"), oSo("21"), oSo("12"), oSo("22")]).toEqual([2, 2, 0, 0]);
		expect(khang).toBe(HAI_MT.length * 4);
	});

	test("KR đã nhận vẫn có hai ô số trên dòng; Mục tiêu đã bỏ qua không hiện KR con", async () => {
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc", "nhan"),
			kr("11", "1", "Khách lớn ký lại hợp đồng", "nhan"),
			mt("2", "Mở tuyến Hà Nội – Hải Phòng", "bac"),
			kr("21", "2", "Chuyến đúng hẹn", "bac"),
		]);
		await moTrang();
		expect(q('[data-the-kr="11"]')?.querySelectorAll("input").length).toBe(2);
		expect(dongEl("21")).toBeNull();
	});
});

describe("k2-quyet", () => {
	const MA_TRAN = [
		{ id: "1", hanh: "nhan" },
		{ id: "1", hanh: "sua" },
		{ id: "1", hanh: "bac" },
		{ id: "11", hanh: "nhan" },
		{ id: "11", hanh: "sua" },
		{ id: "11", hanh: "bac" },
		{ id: "13", hanh: "nhan" },
		{ id: "13", hanh: "bac" },
	] as const;
	const TT = { nhan: "nhan", sua: "sua", bac: "bac" } as const;

	test("ma trận viết trước: mỗi quyết thành biên nhận có Hoàn tác, Hoàn tác gửi đúng một lệnh hoan rồi dòng về đủ nút", async () => {
		let soO = 0;
		for (const { id, hanh } of MA_TRAN) {
			datLai();
			const goc = BAN_NHAP.map((d) =>
				id !== "1" && d.id === "1" ? { ...d, trangThai: "nhan" as const } : d,
			);
			await datBanNhap(goc);
			await moTrang();
			const truoc = [
				...(dongEl(id)?.querySelectorAll("button[data-hanh-dong]") ?? []),
			].map((b) => b.getAttribute("data-hanh-dong"));
			await datBanNhap(
				goc.map((d) => (d.id === id ? { ...d, trangThai: TT[hanh] } : d)),
			);
			if (hanh === "sua") {
				await bam(nutTrong(id, "sua"));
				await bam(nutTrong(id, "nhan-ban-sua"));
			} else {
				await bam(nutTrong(id, hanh));
			}
			await nhip(10);
			const bienNhan = dongEl(id);
			expect(bienNhan?.querySelector('[role="status"]')).not.toBeNull();
			expect(`bo qua khong hoan tac: ${nutHoanTac(bienNhan) !== null}`).toBe(
				"bo qua khong hoan tac: true",
			);
			const soGoi = goiCua("okr.soanQuyet").length;
			await datBanNhap(goc);
			await bam(nutHoanTac(bienNhan));
			await nhip(10);
			const hoan = goiCua("okr.soanQuyet").slice(soGoi);
			expect(hoan.map((g) => g.dauVao)).toEqual([
				{ deXuatId: id, quyet: "hoan" },
			]);
			const sau = [
				...(dongEl(id)?.querySelectorAll("button[data-hanh-dong]") ?? []),
			].map((b) => b.getAttribute("data-hanh-dong"));
			expect({ id, hanh, sau }).toEqual({ id, hanh, sau: truoc });
			soO += 1;
			await don();
		}
		expect(soO).toBe(8);
	});

	test("biên nhận Mục tiêu đã nhận có KR đã quyết nói trước «kèm N KR»; từ chối chua-quyet hiện tại dòng", async () => {
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc", "nhan"),
			kr("11", "1", "A", "nhan"),
			kr("12", "1", "B", "nhan"),
			kr("13", "1", "C", "bac"),
			kr("14", "1", "D"),
		]);
		dat("okr.soanQuyet", () => ({
			ok: false,
			lyDo: "chua-quyet",
			chiTiet: null,
		}));
		await moTrang();
		expect(dongEl("1")?.textContent).toContain(m.dong.kemKr("3"));
		await bam(nutHoanTac(dongEl("1")));
		await nhip(5);
		expect(dongEl("1")?.textContent).toContain(m.lyDoQuyet["chua-quyet"]);
	});

	test("KR Kara vừa bỏ không tính vào «kèm N KR» và không thành quyết định hoàn tác gửi Kara", async () => {
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc", "nhan"),
			kr("11", "1", "Khách lớn ký lại hợp đồng", "nhan"),
			kr("14", "1", "Khách lớn tăng đơn"),
		]);
		await moTrang();
		await datAgent({ status: "streaming" });
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc", "nhan"),
			kr("11", "1", "Khách lớn ký lại hợp đồng", "nhan"),
		]);
		await datAgent({ status: "ready" });
		await cho(() => q('[data-nhan="da-bo"]') !== null, "dong da bo");
		expect(`kem: ${dongEl("1")?.textContent}`).toContain(m.dong.kemKr("1"));
		dat("okr.soanQuyet", () => ({ ok: true }));
		await bam(nutHoanTac(dongEl("1")));
		await nhip(10);
		const heThong = qa('[data-kara-turn="system"]')
			.map((o) => o.textContent)
			.join(" | ");
		expect(`quyet ma: ${heThong.includes("Khách lớn tăng đơn")}`).toBe(
			"quyet ma: false",
		);
	});

	test("lỗi CONFLICT hiện tại dòng: cuộc còn đang soạn thì «dòng cũ», cuộc đã đưa vào thì «cuộc đã đóng»; không có cảnh báo ngoài dòng", async () => {
		const nem = () => {
			throw Object.assign(new Error("Conflict"), {
				data: { code: "CONFLICT" },
			});
		};
		for (const trangThai of ["dang", "da-dua-vao"] as const) {
			datLai();
			await datBanNhap([mt("1", "Giữ khách lớn miền Bắc", "nhan")]);
			dat("okr.soanQuyet", nem);
			await moTrang();
			datDanhSach({ cuoc: { ...CUOC, trangThai } });
			await bam(nutHoanTac(dongEl("1")));
			await nhip(10);
			if (trangThai === "dang") {
				expect(
					`loi conflict ngoai dong: ${dongEl("1")?.textContent?.includes(m.loiQuyet.dongCu)}`,
				).toBe("loi conflict ngoai dong: true");
			} else {
				expect(dongEl("1")?.textContent).toContain(m.loiQuyet.cuocKhongDang);
			}
			expect(qa('[data-slot="alert"][role="alert"]').length).toBe(0);
			await don();
		}
	});

	test("bấm Hoàn tác hai lần nhanh chỉ gửi một lệnh", async () => {
		await datBanNhap([mt("1", "Giữ khách lớn miền Bắc", "nhan")]);
		let mo: (kq: { ok: true }) => void = () => {};
		dat("okr.soanQuyet", () => new Promise((ok) => (mo = ok)));
		await moTrang();
		const nutH = nutHoanTac(dongEl("1"));
		await bam(nutH);
		await bam(nutH);
		expect(goiCua("okr.soanQuyet").length).toBe(1);
		mo({ ok: true });
	});
});

const oNhap = (id: string) =>
	document.getElementById(id) as HTMLInputElement | null;
const biKhoa = (o: Element | null | undefined) =>
	o instanceof HTMLButtonElement || o instanceof HTMLInputElement
		? o.disabled || o.closest("fieldset[disabled]") !== null
		: false;

describe("k2-nhom", () => {
	const NHOM = [
		mt("1", "Giữ khách lớn miền Bắc"),
		kr("11", "1", "Khách lớn ký lại hợp đồng"),
		kr("12", "1", "Khách lớn mua thêm"),
		kr("13", "1", "Rà soát tuyến trước hạn", "cho", "moc"),
	];

	test("nút nhóm đếm KR đủ số và mốc, gửi một lệnh kèm đúng các KR theo thứ tự bản nháp; biên nhận nhóm hoàn tác cả nhóm", async () => {
		await datBanNhap(NHOM);
		await moTrang();
		await go(oNhap("dich-11"), "10");
		const nutNhom = q('[data-slot="kara-batch"]') as HTMLButtonElement | null;
		expect(nutNhom?.textContent).toBe(m.dong.themNhom("2"));
		await datBanNhap(
			NHOM.map((d) =>
				["1", "11", "13"].includes(d.id)
					? { ...d, trangThai: "nhan" as const }
					: d,
			),
		);
		await bam(nutNhom);
		await nhip(10);
		expect(goiCua("okr.soanQuyet").map((g) => g.dauVao)).toEqual([
			{ deXuatId: "1", quyet: "nhan", kem: ["11", "13"] },
		]);
		const nhom = q('[data-slot="kara-proposal-group"]');
		const bienNhan = [
			...(nhom?.querySelectorAll('[role="status"]') ?? []),
		].find((o) => o.textContent?.includes(m.dong.daThemNhom("1", "2")));
		expect(bienNhan).toBeDefined();
		await datBanNhap(NHOM);
		await bam(nutHoanTac(bienNhan?.parentElement ?? null));
		await nhip(10);
		expect(goiCua("okr.soanQuyet").at(-1)?.dauVao).toEqual({
			deXuatId: "1",
			quyet: "hoan",
		});
	});

	test("gửi kr thieu so: KR mới một số không vào nhóm; không còn KR đủ điều kiện thì nút khoá", async () => {
		await datBanNhap(NHOM.filter((d) => d.id !== "13"));
		await moTrang();
		const nutNhom = q('[data-slot="kara-batch"]') as HTMLButtonElement | null;
		expect(`gui kr thieu so: ${nutNhom?.textContent}`).toBe(
			`gui kr thieu so: ${m.dong.themNhom("0")}`,
		);
		expect(nutNhom?.disabled).toBe(true);
		await go(oNhap("dich-12"), "4");
		expect(nutNhom?.textContent).toBe(m.dong.themNhom("1"));
		expect(nutNhom?.disabled).toBe(false);
	});
});

describe("k2-khoa", () => {
	const DU = [
		mt("1", "Giữ khách lớn miền Bắc", "nhan"),
		kr("11", "1", "Rà soát tuyến trước hạn", "nhan", "moc"),
		kr("12", "1", "Khách lớn mua thêm"),
		kr("13", "1", "Khảo sát tuyến", "cho", "moc"),
		mt("2", "Mở tuyến Hà Nội – Hải Phòng"),
		kr("21", "2", "Chuyến chạy thử", "cho", "moc"),
	];

	test("Kara đang soạn: dòng chờ, ô số, Hoàn tác, nút nhóm, Đưa vào đều khoá kèm lý do; Kara xong thì mở lại (đối chứng dương)", async () => {
		await datBanNhap(DU);
		await moTrang();
		const nutDuaVao = () =>
			q('[data-nut="dua-vao"]') as HTMLButtonElement | null;
		expect(biKhoa(nutDuaVao())).toBe(false);
		await datAgent({ status: "streaming" });
		const cho = qa("[data-the-cho] button, [data-the-cho] input");
		expect(cho.length).toBeGreaterThan(0);
		expect(
			`dong cho mo khi kara soan: ${cho.filter((o) => !biKhoa(o)).length}`,
		).toBe("dong cho mo khi kara soan: 0");
		const dau = q('[data-slot="kara-artifact-header"]');
		expect(dau?.querySelector('[data-kara-state="working"]')).not.toBeNull();
		const hoanTac = qa("button").filter(
			(b) => b.textContent?.trim() === "Hoàn tác",
		);
		expect(hoanTac.length).toBeGreaterThan(0);
		expect(hoanTac.every(biKhoa)).toBe(true);
		expect(biKhoa(q('[data-slot="kara-batch"]'))).toBe(true);
		expect(`dua vao mo khi kara soan: ${biKhoa(nutDuaVao())}`).toBe(
			"dua vao mo khi kara soan: true",
		);
		const lyDo = nutDuaVao()?.getAttribute("aria-describedby");
		expect(lyDo ? document.getElementById(lyDo)?.textContent : null).toBe(
			"Kara đang soạn — xong sẽ quyết được.",
		);
		for (const b of qa('[data-the-cho] button[data-hanh-dong="nhan"]')) {
			const id = b.getAttribute("aria-describedby");
			expect(id ? document.getElementById(id)?.textContent : null).toBe(
				"Kara đang soạn — xong sẽ quyết được.",
			);
		}
		await datAgent({ status: "ready" });
		expect(
			qa("[data-the-cho] button, [data-the-cho] input").filter(biKhoa).length,
		).toBe(0);
		expect(biKhoa(nutDuaVao())).toBe(false);
	});
});

describe("k2-so", () => {
	const DS = [
		mt("1", "Giữ khách lớn miền Bắc"),
		kr("11", "1", "Khách lớn ký lại hợp đồng"),
		mt("2", "Mở tuyến Hà Nội – Hải Phòng", "nhan"),
		kr("21", "2", "Chuyến đúng hẹn", "nhan"),
	];
	const lanMoi = (ds: typeof DS) => ds.map((d) => ({ ...d, id: `${d.id}b` }));
	const giaTri = () => [
		oNhap("khoi-11b")?.value ?? oNhap("khoi-11")?.value,
		oNhap("dich-11b")?.value ?? oNhap("dich-11")?.value,
		oNhap("khoi-21b")?.value ?? oNhap("khoi-21")?.value,
		oNhap("dich-21b")?.value ?? oNhap("dich-21")?.value,
	];

	test("số giữ qua Kara nộp lại (id mới, khoá giữ), qua đổi tab, qua gắn lại trang; đưa vào gửi id lần nộp hiện tại", async () => {
		sessionStorage.clear();
		await datBanNhap(DS);
		await moTrang();
		await go(oNhap("khoi-11"), "100");
		await go(oNhap("dich-11"), "150");
		await go(oNhap("khoi-21"), "5");
		await go(oNhap("dich-21"), "9");
		await datBanNhap(lanMoi(DS));
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await nhip(10);
		expect(`mat so sau nop lai: ${giaTri().join(",")}`).toBe(
			"mat so sau nop lai: 100,150,5,9",
		);
		await don();
		await moTrang();
		expect(giaTri()).toEqual(["100", "150", "5", "9"]);
		await bam(nut(m.banNhap.duaVao("1", "1")));
		await bam(nut(m.banNhap.xacNhan.nut));
		expect(goiCua("okr.soanDuaVao").at(-1)?.dauVao).toEqual({
			cuocSoanId: CUOC.id,
			kr: [{ deXuatId: "21b", khoiDiem: 5, dich: 9 }],
		});
	});

	test("kho phiên trình duyệt ném khi ghi: số vẫn sống trong bộ nhớ, không lỗi", async () => {
		const goc = Storage.prototype.setItem;
		Storage.prototype.setItem = () => {
			throw new Error("day");
		};
		try {
			await datBanNhap(DS);
			await moTrang();
			await go(oNhap("dich-21"), "9");
			expect(oNhap("dich-21")?.value).toBe("9");
		} finally {
			Storage.prototype.setItem = goc;
		}
	});

	test("Kara nộp lại khi người đang sửa chữ một dòng: chữ đang sửa còn nguyên", async () => {
		await datBanNhap(DS);
		await moTrang();
		await bam(nutTrong("1", "sua"));
		const o = dongEl("1")?.querySelector(
			"textarea, input",
		) as HTMLInputElement | null;
		await go(o, "Giữ khách lớn và mua thêm");
		await datBanNhap(lanMoi(DS));
		await datAgent({ status: "streaming" });
		await datAgent({ status: "ready" });
		await nhip(10);
		const sau = dongEl("1b")?.querySelector(
			"textarea, input",
		) as HTMLInputElement | null;
		expect(sau?.value).toBe("Giữ khách lớn và mua thêm");
	});
});

describe("k2-dua-vao", () => {
	test("còn thiếu → nút khoá, bấm tên KR tới ô trống; đủ số → xác nhận đơn vị, chu kỳ; sau đó biên nhận đã tạo và không còn nút quyết", async () => {
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc", "nhan"),
			kr("11", "1", "Khách lớn ký lại hợp đồng", "nhan"),
			kr("12", "1", "Rà soát tuyến trước hạn", "nhan", "moc"),
		]);
		await moTrang();
		const nutDuaVao = () =>
			q('[data-nut="dua-vao"]') as HTMLButtonElement | null;
		expect(nutDuaVao()?.disabled).toBe(true);
		const chan = q('[data-slot="kara-artifact-footer"]');
		const thieu = chan?.querySelector('[data-thieu="11"]');
		expect(thieu?.textContent).toBe("Khách lớn ký lại hợp đồng");
		await bam(thieu ?? null);
		expect(document.activeElement?.id).toBe("dich-11");
		await go(oNhap("dich-11"), "12");
		expect(nutDuaVao()?.disabled).toBe(false);
		expect(nutDuaVao()?.textContent).toBe(m.banNhap.duaVao("1", "2"));
		await bam(nutDuaVao());
		const hop = q('[role="alertdialog"], [role="dialog"]');
		expect(hop?.textContent).toContain(CUOC.tenDonVi);
		expect(hop?.textContent).toContain(CUOC.tenChuKy);
		await bam(nut(m.banNhap.xacNhan.nut));
		await nhip(10);
		expect(goiCua("okr.soanDuaVao").length).toBe(1);
		expect(q("[data-da-dua-vao]")?.textContent).toContain(m.banNhap.daTao("1"));
		expect(q('[data-nut="xem-theo-don-vi"]')).not.toBeNull();
		expect(
			`hoan tac sau dua vao: ${qa("button").filter((b) => b.textContent?.trim() === "Hoàn tác").length}`,
		).toBe("hoan tac sau dua vao: 0");
		expect(qa('[data-dong] button[data-variant="default"]').length).toBe(0);
	});
});

const daCuon: Element[] = [];
type CoCuon = { scrollIntoView: Element["scrollIntoView"] };
let protoCuon: CoCuon | null = null;
let cuonGoc: Element["scrollIntoView"] | null = null;
const datCuon = () => {
	daCuon.length = 0;
	let p: object | null = Object.getPrototypeOf(document.createElement("div"));
	while (p && !Object.hasOwn(p, "scrollIntoView")) p = Object.getPrototypeOf(p);
	protoCuon = p as CoCuon | null;
	if (!protoCuon) return;
	cuonGoc = protoCuon.scrollIntoView;
	protoCuon.scrollIntoView = function ghi(this: Element) {
		daCuon.push(this);
	};
};
const traCuon = () => {
	if (protoCuon && cuonGoc) protoCuon.scrollIntoView = cuonGoc;
};

const krVao = (khoa: string, ten: string, kieu = "tang-toi") => ({
	khoa,
	ten,
	kieu,
	donVi: kieu === "moc" ? "mốc" : "khách",
	khoiDiemGoiY: null,
	viSao: "Vì số đo được.",
});
const mtVao = (khoa: string, ten: string, kr: ReturnType<typeof krVao>[]) => ({
	khoa,
	ten,
	viSaoLucNay: "Quý này cần.",
	loai: "cam-ket",
	viSao: "Vì khách lớn.",
	canChinhId: null,
	kr,
});
const NOP_1 = {
	mucTieu: [
		mtVao("m1", "Giữ khách lớn miền Bắc", [
			krVao("k11", "Khách lớn ký lại hợp đồng"),
			krVao("k12", "Khách lớn mua thêm"),
			krVao("k13", "Rà soát tuyến trước hạn", "moc"),
		]),
		mtVao("m2", "Mở tuyến Hà Nội – Hải Phòng", [
			krVao("k21", "Chuyến đúng hẹn"),
			krVao("k22", "Khảo sát tuyến", "moc"),
		]),
	],
};
const NOP_2 = {
	mucTieu: [
		mtVao("m1", "Giữ khách lớn và mua thêm", [
			krVao("k11", "Khách lớn ký lại hợp đồng"),
			krVao("k14", "Đối tác mới ký"),
		]),
		mtVao("m2", "Mở tuyến Hà Nội – Hải Phòng", [
			krVao("k21", "Chuyến đúng hẹn"),
			krVao("k22", "Khảo sát tuyến", "moc"),
			krVao("k13", "Rà soát tuyến trước hạn", "moc"),
		]),
	],
};
const nop = (
	id: string,
	input: BanNhap | { mucTieu: number },
): ReturnType<typeof nguoiNoi> =>
	({
		id,
		role: "assistant",
		parts: [
			{
				type: "tool-nop_ban_nhap",
				toolCallId: `goi-${id}`,
				state: "output-available",
				input,
				output: {
					ketQua: "da-ghi",
					lyDo: "",
					soDong: 0,
					biLoai: [],
					giuNguyen: [],
				},
			},
		],
	}) as unknown as ReturnType<typeof nguoiNoi>;

describe("k2-moc", () => {
	beforeEach(datCuon);
	afterEach(traCuon);

	test("ba lần nộp thành ba mốc đúng chữ; bấm mốc tới dòng đổi đầu tiên và làm nổi; nhãn «vừa sửa» về mốc mới nhất; dòng vừa sửa có chữ cũ gạch; mốc trỏ dòng không còn thì về đầu bản nháp", async () => {
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc"),
			kr("11", "1", "Khách lớn ký lại hợp đồng"),
		]);
		await moTrang();
		await datAgent({ status: "streaming" });
		await datBanNhap([
			mt("1", "Giữ khách lớn và mua thêm"),
			kr("11", "1", "Khách lớn ký lại hợp đồng"),
			kr("14", "1", "Đối tác mới ký"),
		]);
		await datAgent({
			status: "ready",
			data: {
				messages: [
					nop("n1", banNhap.parse(NOP_1)),
					nop("n2", banNhap.parse(NOP_2)),
					nop("n3", { mucTieu: 1 }),
				],
			},
		});
		await nhip(10);
		const moc = qa('[data-kara-turn="checkpoint"]');
		expect(moc.map((o) => o.textContent)).toEqual([
			`Kara soạn bản nháp đầu: ${m.moc.dau("2", "5")}`,
			`Kara sửa bản nháp: ${m.moc.themKr("1")} · ${m.moc.sua("1")} · ${m.moc.chuyen("1")} · ${m.moc.bo("1")}`,
			m.moc.khongDoc,
		]);
		await bam(moc[1]?.querySelector("button") ?? null);
		await nhip(3);
		const dauDoi = q('[data-khoa-dong="muc-tieu-moi:m1"]');
		expect(
			`moc khong noi ban nhap: ${daCuon.includes(dauDoi as Element)}`,
		).toBe("moc khong noi ban nhap: true");
		expect(dauDoi?.closest("[data-noi]")).not.toBeNull();
		const vuaSua = q('[data-nhan-dong="vua-sua"]');
		expect(vuaSua?.tagName).toBe("BUTTON");
		daCuon.length = 0;
		await bam(vuaSua);
		await nhip(3);
		expect(daCuon.at(-1)).toBe(moc[2] as Element);
		expect(dongEl("1")?.querySelector("del")?.textContent).toBe(
			"Giữ khách lớn miền Bắc",
		);
		daCuon.length = 0;
		await bam(moc[0]?.querySelector("button") ?? null);
		await nhip(3);
		expect(daCuon.at(-1)).toBe(q("[data-ban-nhap]") as Element);
	});
});

const oSoanEl = () =>
	q('[data-slot="kara-composer"] textarea') as HTMLTextAreaElement | null;
async function guiOSoan(chu: string): Promise<void> {
	await go(oSoanEl(), chu);
	await bam(q('[data-slot="kara-composer"] button[type="submit"]'));
}

describe("k2-hoi-dong", () => {
	test("hỏi Kara từ một dòng: chip trên ô soạn, focus ô soạn; tin gửi mang khối dòng; bong bóng hiện chip, không lộ dấu khối; gỡ chip thì gửi nguyên văn", async () => {
		await datBanNhap([
			mt("1", "Giữ khách lớn miền Bắc"),
			kr("11", "1", "Tăng số đại lý gắn bó"),
		]);
		await moTrang();
		await bam(nutTrong("11", "hoi"));
		await nhip(3);
		expect(q('[data-slot="kara-context"]')?.textContent).toContain(
			"KR · Tăng số đại lý gắn bó",
		);
		expect(document.activeElement).toBe(oSoanEl());
		await guiOSoan("ngắn hơn");
		const tin = daGui.at(-1) ?? "";
		expect(docKhoi(tin)).toEqual({
			khoi: { dong: { loai: "kr", chu: "Tăng số đại lý gắn bó" }, quyet: [] },
			nguoi: "ngắn hơn",
		});
		await datAgent({ data: { messages: [nguoiNoi("u1", tin)] } });
		const bong = q('[data-kara-turn="user"]');
		expect(bong?.textContent).toContain("Tăng số đại lý gắn bó");
		expect(bong?.textContent).toContain("ngắn hơn");
		expect(
			`lo dau khoi trong bong bong: ${bong?.textContent?.includes(KHOI_MO)}`,
		).toBe("lo dau khoi trong bong bong: false");
		await bam(nutTrong("11", "hoi"));
		await bam(q('[data-slot="kara-context"] button'));
		await guiOSoan("x");
		expect(daGui.at(-1)).toBe("x");
	});

	test("khổ hẹp: bấm hỏi trên dòng thì mở tab Trò chuyện", async () => {
		const tra = beRong(375);
		try {
			await datBanNhap([mt("1", "Giữ khách lớn miền Bắc")]);
			await moTrang(false, true, "?tabSoan=ban-nhap");
			await bam(nutTrong("1", "hoi"));
			await nhip(3);
			expect(urlDoi.at(-1)).toBe("");
		} finally {
			tra();
		}
	});
});

describe("k2-he-thong", () => {
	test("quyết trên bảng thành dòng «Sẽ gửi kèm lượt sau», nhận rồi hoàn tác thì rút; gửi lượt kế mang hai quyết; đọc lại thì dòng hệ thống đứng trước bong bóng", async () => {
		const DS = [
			mt("1", "Giữ khách lớn miền Bắc", "nhan"),
			kr("12", "1", "Tăng số đại lý gắn bó"),
			kr("13", "1", "Đối tác mới ký"),
			mt("2", "Mở tuyến Hà Nội – Hải Phòng"),
		];
		await datBanNhap(DS);
		await moTrang();
		const sau = (id: string, tt: "nhan" | "bac" | "cho") =>
			DS.map((d) => (d.id === id ? { ...d, trangThai: tt } : d));
		await datBanNhap(sau("12", "nhan"));
		await bam(nutTrong("12", "nhan"));
		await datBanNhap(
			sau("12", "nhan").map((d) =>
				d.id === "2" ? { ...d, trangThai: "bac" as const } : d,
			),
		);
		await bam(nutTrong("2", "bac"));
		const daBac = sau("12", "nhan").map((d) =>
			d.id === "2" ? { ...d, trangThai: "bac" as const } : d,
		);
		await datBanNhap(
			daBac.map((d) =>
				d.id === "13" ? { ...d, trangThai: "nhan" as const } : d,
			),
		);
		await bam(nutTrong("13", "nhan"));
		await nhip(5);
		await datBanNhap(daBac);
		await bam(nutHoanTac(dongEl("13")));
		await nhip(5);
		const he = qa('[data-kara-turn="system"]').at(-1);
		expect(he?.textContent).toContain("Sẽ gửi kèm lượt sau:");
		expect(he?.textContent).toContain("Tăng số đại lý gắn bó");
		expect(he?.textContent).toContain("Mở tuyến Hà Nội – Hải Phòng");
		expect(he?.textContent?.includes("Đối tác mới ký")).toBe(false);
		await guiOSoan("tiếp");
		const tin = daGui.at(-1) ?? "";
		expect(docKhoi(tin).khoi?.quyet.length).toBe(2);
		expect(
			`hang quyet gui hai lan: ${qa('[data-kara-turn="system"]').length}`,
		).toBe("hang quyet gui hai lan: 0");
		await datAgent({ data: { messages: [nguoiNoi("u1", tin)] } });
		const luot = qa("[data-kara-turn]");
		const i = luot.findIndex(
			(o) => o.getAttribute("data-kara-turn") === "user",
		);
		expect(luot[i - 1]?.getAttribute("data-kara-turn")).toBe("system");
		expect(luot[i]?.textContent).toBe("tiếp");
	});
});

describe("k2-khoa-dung", () => {
	test("Kara đang soạn: ô soạn có nút Dừng, bấm chấm dứt lượt", async () => {
		await datBanNhap([mt("1", "Giữ khách lớn miền Bắc")]);
		await moTrang();
		await datAgent({ status: "streaming" });
		const dung = q('[data-slot="kara-composer"] button[aria-label="Dừng"]');
		expect(dung).not.toBeNull();
		const truoc = daDung;
		await bam(dung);
		expect(daDung - truoc).toBe(1);
	});
});
