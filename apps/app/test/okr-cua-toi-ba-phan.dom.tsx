import { describe, expect, mock, test } from "bun:test";
import { act, createElement } from "react";
import {
	type CapNhatTuanOutput,
	capNhatTuanOutput,
	cyclesOutput,
	type MucTieuOutput,
	mineOutput,
	okrAccessOutput,
	viecCuaToiOutput,
} from "../../api/src/okr/okr.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import {
	bamChuot,
	CuaToi,
	cho,
	type DauVao,
	danhSachTu,
	dung,
	kho,
	kr,
	mucTieu,
	nhip,
	okrMessages,
} from "./okr-don-san";

const { demNhip } = await import("@/app/(app)/[slug]/okr/phan-don-vi-dan");
const { DongLyDoKhu, HanhDongKhu, useQuyenKhu } = await import(
	"@/app/(app)/[slug]/okr/hanh-dong-khu"
);

/* ---------- fixture: mọi khuôn đi qua zod của chính máy chủ ---------- */

type KrCapNhat = CapNhatTuanOutput["items"][number];

function krTuan(id: string, daGui: boolean): KrCapNhat {
	return {
		keyResultId: id,
		title: `KR tuan ${id}`,
		objectiveId: "mt-1",
		objectiveTitle: "Tăng trưởng quý 4",
		unitName: "Kinh doanh",
		kind: "tang-toi",
		unit: "khách",
		targetValue: 50,
		currentValue: 10,
		lastConfidence: daGui ? "cao" : null,
		lastAt: daGui ? "2026-10-13T03:00:00.000Z" : null,
		updatedThisWeek: daGui,
		nguon: "tay",
		doCanh: false,
		soMay: null,
	};
}

const tuan = (items: KrCapNhat[]) =>
	capNhatTuanOutput.parse({ items, weekStart: "2026-10-12", dueWeekday: 5 });

const BA_THIEU = tuan([
	krTuan("a", false),
	krTuan("b", false),
	krTuan("c", false),
]);
const MOT_THIEU = tuan([
	krTuan("a", false),
	krTuan("b", true),
	krTuan("c", true),
]);
const DU_HET = tuan([krTuan("a", true), krTuan("b", true), krTuan("c", true)]);
const KHONG_KR = tuan([]);

function chuKy(id: string, name: string, phase: string) {
	return {
		id,
		kind: "quy",
		name,
		parentId: null,
		startsOn: "2026-07-01",
		endsOn: "2026-12-31",
		phase,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 5,
		cuaSoRa: null,
		anLuc: null,
		anLyDo: null,
		quyConHien: 0,
		viec: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: false,
		},
	};
}
const HAI_KY = cyclesOutput.parse({
	cycles: [
		chuKy("q4", "Quý 4/2026", "dang-chay"),
		chuKy("q3", "Quý 3/2026", "cham-diem"),
	],
	currentId: "q4",
});

const VIEC_CO_CAP_NHAT = viecCuaToiOutput.parse({
	lienQuanOkr: true,
	viec: [
		{ loai: "okr-cap-nhat", krIds: ["a", "b"], nhan: "KR a, KR b", soKr: 2 },
		{
			loai: "okr-duoc-giao",
			objectiveId: "mt-2",
			keyResultId: "kr-4",
			nhan: "Mười đối tác mới",
		},
	],
});

function nguoi(id: string) {
	return { id, name: `Người ${id}`, email: `${id}@onehub.vn` };
}

function phongBan(id: string, ten: string, boPhan: string | null) {
	return {
		id,
		name: ten,
		moTa: "",
		position: 0,
		divisionId: boPhan,
		head: nguoi(`truong-${id}`),
		stepCount: 0,
		okrMo: 0,
		people: [],
	};
}

const CAY = orgTreeOutput.parse({
	divisions: [
		{
			id: "bp-1",
			name: "Kinh doanh",
			moTa: "",
			position: 0,
			head: nguoi("toi"),
			okrMo: 0,
			departments: [phongBan("pb-1", "Kinh doanh vùng 1", "bp-1")],
		},
		{
			id: "bp-2",
			name: "Vận hành",
			moTa: "",
			position: 1,
			head: nguoi("toi"),
			okrMo: 0,
			departments: [phongBan("pb-2", "Chăm sóc khách hàng", "bp-2")],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
});

const quyen = (divisions: string[], departments: string[]) =>
	okrAccessOutput.parse({
		canManageProgram: false,
		headOf: { divisions, departments },
	});

function krTien(
	id: string,
	objectiveId: string,
	progress: number,
	laCuaToi = false,
) {
	return { ...kr(id, objectiveId), progress, laCuaToi };
}

/** Ba mục tiêu, năm KR với tiến độ 45·30 | 10·50 | 20 trên kỳ vọng 47, cam kết. */
const BA_MUC_TIEU: MucTieuOutput[] = [
	mucTieu("o1", {
		keyResults: [krTien("o1a", "o1", 45), krTien("o1b", "o1", 30)],
	}),
	mucTieu("o2", {
		keyResults: [krTien("o2a", "o2", 10), krTien("o2b", "o2", 50)],
	}),
	mucTieu("o3", { keyResults: [krTien("o3a", "o3", 20)] }),
];

/* ---------- dựng màn ---------- */

function datCoBan(o: {
	tuan?: CapNhatTuanOutput;
	headOf?: [string[], string[]];
	viec?: typeof VIEC_CO_CAP_NHAT;
}) {
	kho.doc.set("okr.cycles", () => HAI_KY);
	kho.doc.set("okr.capNhatTuan", () => o.tuan ?? BA_THIEU);
	kho.doc.set("okr.access", () => quyen(...(o.headOf ?? [[], []])));
	kho.doc.set("org.tree", () => CAY);
	if (o.viec) kho.doc.set("okr.viecCuaToi", () => o.viec ?? null);
	let n = 0;
	kho.ghi.set("okr.moCapNhat", () => {
		n += 1;
		return { id: `phien-${n}`, canhBao: null, sessionId: `phien-${n}` };
	});
	kho.ghi.set("okr.guiCapNhat", (vao) => ({
		id: "ok",
		canhBao: null,
		written: Array.isArray(vao?.items) ? vao.items.length : 0,
		seconds: 3,
	}));
}

const phan = (ten: string) =>
	document.body.querySelector<HTMLElement>(`[data-phan="${ten}"]`);
/** Phần `ten` có mặt VÀ chứa `sel` — phần vắng thì sai, không bao giờ «undefined !== null». */
const co = (ten: string, sel: string) =>
	(phan(ten)?.querySelector(sel) ?? null) !== null;
const moPhien = () => kho.daGhi.filter((g) => g.duong === "okr.moCapNhat");
const daTaiPhan1 = () =>
	phan("can-cap-nhat") !== null && !co("can-cap-nhat", "[data-khung-xuong]");

/* ---------- ctbp-phan-mot (E1) ---------- */

describe("ctbp-phan-mot", () => {
	const MA_TRAN: [string, CapNhatTuanOutput, number][] = [
		["3 thieu", BA_THIEU, 3],
		["1 thieu 2 du", MOT_THIEU, 1],
		["0 thieu 3 du", DU_HET, 0],
		["rong", KHONG_KR, 0],
	];
	for (const locale of ["vi", "en"] as const)
		for (const [ten, du, thieu] of MA_TRAN)
			test(`ctbp-phan-mot: ${ten} ${locale}`, async () => {
				datCoBan({ tuan: du, viec: VIEC_CO_CAP_NHAT });
				const m = okrMessages(locale).baPhan;
				await dung(<CuaToi />, "", locale);
				await cho(daTaiPhan1, "phan 1 tai xong");
				await cho(
					() => document.body.querySelector('[data-khoi="viec-okr"]') !== null,
					"khoi viec hien",
				);
				const goc = phan("can-cap-nhat")?.parentElement;
				const con = [...(goc?.children ?? [])];
				const p1 = phan("can-cap-nhat");
				const nut = p1?.querySelector('[data-nut="cap-nhat-tai-cho"]') ?? null;
				const dong = p1?.querySelectorAll("[data-kr]").length ?? -1;
				const dau = p1 ? con.indexOf(p1) : -1;
				const viec = con.findIndex((x) => x.matches('[data-khoi="viec-okr"]'));
				const chu = p1?.textContent ?? "";
				const ketQua = {
					dauTien: dau,
					viecSau: viec === dau + 1,
					dong,
					nut: nut?.textContent ?? null,
					daDu: chu.includes(m.daDu(du === DU_HET ? "12/10" : "-")),
					suaLanGui:
						(p1?.querySelector('[data-nut="sua-lan-gui"]') ?? null) !== null,
					khongKr: chu.includes(m.khongKr),
					viecCapNhatConTrongCuaToi:
						document.body
							.querySelector('[data-khoi="viec-okr"]')
							?.textContent?.includes("KR a, KR b") ?? false,
				};
				expect(ketQua).toEqual({
					dauTien: 0,
					viecSau: true,
					dong: thieu,
					nut: thieu > 0 ? m.capNhatN(thieu) : null,
					daDu: du === DU_HET,
					suaLanGui: du === DU_HET,
					khongKr: du === KHONG_KR,
					viecCapNhatConTrongCuaToi: false,
				});
				if (du === MOT_THIEU && dong !== 1)
					throw new Error(
						`ctbp-phan-mot: phan 1 co ${dong} dong, mong 1 (o 1 thieu 2 du)`,
					);
			});

	test("ctbp-phan-mot: o chu ky cu — phan 1 van theo chu ky dang chay", async () => {
		datCoBan({ tuan: BA_THIEU });
		await dung(<CuaToi />, "?kyOkr=q3");
		await cho(daTaiPhan1, "phan 1 tai xong");
		const goiTuan = kho.daDoc.filter((d) => d.duong === "okr.capNhatTuan");
		expect({
			soLanGoi: goiTuan.length > 0,
			vaoKhongMangKy: goiTuan.every((d) => d.dauVao === undefined),
			dong: phan("can-cap-nhat")?.querySelectorAll("[data-kr]").length,
		}).toEqual({ soLanGoi: true, vaoKhongMangKy: true, dong: 3 });
	});
});

/* ---------- ctbp-cap-nhat-tai-cho (E2) ---------- */

async function chonCaoMoiDong(goc: HTMLElement): Promise<void> {
	const m = okrMessages("vi").capNhat;
	for (const dong of goc.querySelectorAll<HTMLElement>("[data-kr]")) {
		const nut = [
			...dong.querySelectorAll<HTMLButtonElement>('[data-o="tu-tin"] button'),
		].find((b) => b.textContent?.includes(m.mucTuTin.cao));
		if (nut) await act(async () => nut.click());
	}
}

describe("ctbp-cap-nhat-tai-cho", () => {
	test("ctbp-cap-nhat-tai-cho: khong mo phien khi tai, bam mo dung 1 phien cua-toi ngay trong phan 1, gui 3 KR", async () => {
		datCoBan({ tuan: BA_THIEU });
		await dung(<CuaToi />);
		await cho(daTaiPhan1, "phan 1 tai xong");
		await nhip(2);
		const truocBam = moPhien().length;

		const nut = phan("can-cap-nhat")?.querySelector<HTMLButtonElement>(
			'[data-nut="cap-nhat-tai-cho"]',
		);
		if (!nut) throw new Error("ctbp-cap-nhat-tai-cho: khong thay nut cap nhat");
		await bamChuot(nut);
		await cho(
			() => co("can-cap-nhat", '[data-trang-thai^="ST-capnhat-"]'),
			"bang cap nhat mo trong phan 1",
		);
		const p1 = phan("can-cap-nhat");
		if (truocBam !== 0)
			throw new Error(
				`ctbp-cap-nhat-tai-cho: moCapNhat goi ${truocBam} lan khi chua bam, mong 0`,
			);
		const entry = moPhien()[0]?.dauVao?.entry;
		if (entry !== "cua-toi")
			throw new Error(
				`ctbp-cap-nhat-tai-cho: entry «${String(entry)}», mong «cua-toi»`,
			);
		const o = (sel: string) => (p1?.querySelectorAll(sel).length ?? 0) > 0;
		expect({
			soPhien: moPhien().length,
			oSo: o('[data-o="gia-tri"]'),
			oTuTin: o('[data-o="tu-tin"]'),
			oGhiChu: o('[data-o="ghi-chu"]'),
			nutGui: o('[data-nut="gui"]'),
		}).toEqual({
			soPhien: 1,
			oSo: true,
			oTuTin: true,
			oGhiChu: true,
			nutGui: true,
		});

		if (!p1) throw new Error("mat phan 1");
		await chonCaoMoiDong(p1);
		const gui = p1.querySelector<HTMLButtonElement>('[data-nut="gui"]');
		if (!gui) throw new Error("khong thay nut gui");
		const lamMoiTruoc = kho.lamMoi;
		await act(async () => gui.click());
		await cho(
			() => co("can-cap-nhat", '[data-trang-thai="ST-capnhat-dagui"]'),
			"da gui",
		);
		const daGui = kho.daGhi.filter((g) => g.duong === "okr.guiCapNhat");
		const vao = daGui[0]?.dauVao;
		expect({
			soLanGui: daGui.length,
			sessionId: vao?.sessionId,
			soMuc: Array.isArray(vao?.items) ? vao.items.length : -1,
			lamMoi: kho.lamMoi - lamMoiTruoc,
			veCuaToi: (phan("can-cap-nhat")?.textContent ?? "").includes(
				okrMessages("vi").capNhat.veCuaToi,
			),
		}).toEqual({
			soLanGui: 1,
			sessionId: "phien-1",
			soMuc: 3,
			lamMoi: 1,
			veCuaToi: false,
		});
	});
});

/* ---------- ctbp-loi-vao-tu (E4) ---------- */

describe("ctbp-loi-vao-tu", () => {
	const MA_TRAN: [string, string, string | null][] = [
		["nhac", "?tu=nhac", "nhac"],
		["viec-cua-toi", "?tu=viec-cua-toi", "viec-cua-toi"],
		["vang", "", null],
		["tab", "?tu=tab", null],
		["la", "?tu=la", null],
	];
	for (const [ten, thamSo, kyVong] of MA_TRAN)
		test(`ctbp-loi-vao-tu: ${ten}`, async () => {
			datCoBan({ tuan: BA_THIEU });
			const san = await dung(<CuaToi />, thamSo);
			await cho(daTaiPhan1, "phan 1 tai xong");
			await nhip(4);
			const mo = moPhien();
			const p1 = phan("can-cap-nhat");
			if (kyVong === null) {
				expect({
					soPhien: mo.length,
					bangMo: (p1?.querySelector('[data-nut="gui"]') ?? null) !== null,
				}).toEqual({
					soPhien: 0,
					bangMo: false,
				});
				return;
			}
			await cho(
				() => (p1?.querySelector('[data-o="gia-tri"]') ?? null) !== null,
				"bang mo san",
			);
			await nhip(2);
			if (san.url().get("tu") !== null)
				throw new Error("ctbp-loi-vao-tu: tu con tren duong dan sau khi mo");
			const focusTrongPhan1 =
				document.activeElement !== null &&
				(p1?.contains(document.activeElement) ?? false) &&
				document.activeElement.closest('[data-o="gia-tri"]') !== null;
			expect({
				soPhien: mo.length,
				entry: mo[0]?.dauVao?.entry,
				focusTrongPhan1,
			}).toEqual({ soPhien: 1, entry: kyVong, focusTrongPhan1: true });

			await dung(<CuaToi />, san.url().toString());
			await nhip(6);
			expect(moPhien().length).toBe(1);
		});
});

/* ---------- ctbp-don-vi-dan (E7) ---------- */

const SO_O_BA_MUC_TIEU = {
	soMucTieu: 3,
	soKr: 5,
	tienDoTb: 31,
	dungNhip: 2,
	chamNhip: 1,
	truot: 2,
};

describe("ctbp-don-vi-dan", () => {
	test("ctbp-don-vi-dan: demNhip tinh dung sau so cua bang tay", () => {
		expect(demNhip(BA_MUC_TIEU)).toEqual(SO_O_BA_MUC_TIEU);
		expect(demNhip([])).toEqual({
			soMucTieu: 0,
			soKr: 0,
			tienDoTb: 0,
			dungNhip: 0,
			chamNhip: 0,
			truot: 0,
		});
	});

	const MA_TRAN: [string, [string[], string[]], string[]][] = [
		["1 bo phan", [["bp-1"], []], ["bp:bp-1"]],
		["1 phong ban", [[], ["pb-2"]], ["pb:pb-2"]],
		[
			"bo phan + phong ban, API dat nguoc",
			[["bp-2", "bp-1"], ["pb-1"]],
			["bp:bp-1", "bp:bp-2", "pb:pb-1"],
		],
		["khong dan", [[], []], []],
	];
	for (const [ten, headOf, kyVong] of MA_TRAN)
		for (const coMucTieu of [true, false])
			test(`ctbp-don-vi-dan: ${ten} · ${coMucTieu ? "3 muc tieu" : "rong"}`, async () => {
				datCoBan({ headOf });
				kho.doc.set("okr.danhSach", () =>
					danhSachTu(coMucTieu ? BA_MUC_TIEU : [], []),
				);
				const m = okrMessages("vi").baPhan;
				await dung(<CuaToi />, "?kyOkr=q4");
				await cho(daTaiPhan1, "phan 1 tai xong");
				await nhip(6);
				const the = [
					...document.body.querySelectorAll<HTMLElement>("[data-don-vi-dan]"),
				];
				const thuTu = the.map((t) => t.getAttribute("data-don-vi-dan"));
				if (kyVong.length > 1 && thuTu[0]?.startsWith("pb:"))
					throw new Error("ctbp-don-vi-dan: the 1 la phong ban, mong bo phan");
				expect(thuTu).toEqual(kyVong);
				if (kyVong.length === 0) {
					expect(phan("don-vi-dan")).toBeNull();
					return;
				}
				await cho(
					() =>
						the.every((t) => t.querySelector("[data-khung-xuong]") === null),
					"the don vi tai xong",
				);
				for (const t of the) {
					const href = t
						.querySelector('[data-nut="mo-don-vi"]')
						?.getAttribute("href");
					const khoa = t.getAttribute("data-don-vi-dan") ?? "";
					expect(href).toBe(
						`/ws/okr/theo-don-vi?${new URLSearchParams({ donOkr: khoa, kyOkr: "q4" })}`,
					);
					if (!coMucTieu) {
						expect(t.textContent).toContain(m.donViRong("Quý 4/2026"));
						continue;
					}
					const so = t.querySelector<HTMLElement>("[data-so-kr]");
					const doc = (k: string) =>
						Number(
							t.querySelector(`[data-so-${k}]`)?.getAttribute(`data-so-${k}`),
						);
					const thuc = {
						soMucTieu: Number(so?.getAttribute("data-so-muc-tieu")),
						soKr: Number(so?.getAttribute("data-so-kr")),
						tienDoTb: Number(so?.getAttribute("data-so-tien-do")),
						dungNhip: doc("dung-nhip"),
						chamNhip: doc("cham-nhip"),
						truot: doc("truot"),
					};
					if (thuc.soKr !== SO_O_BA_MUC_TIEU.soKr)
						throw new Error(`ctbp-don-vi-dan: so KR ${thuc.soKr}, mong 5`);
					expect(thuc).toEqual(SO_O_BA_MUC_TIEU);
				}
				const goiDs = kho.daDoc
					.filter((d) => d.duong === "okr.danhSach")
					.map((d) => JSON.stringify(d.dauVao?.unit));
				for (const khoa of kyVong) {
					const [loai, id] = khoa.split(":");
					expect(goiDs).toContain(JSON.stringify({ loai, id }));
				}
			});
});

/* ---------- ctbp-kr-phu-trach (E8) ---------- */

describe("ctbp-kr-phu-trach", () => {
	test("ctbp-kr-phu-trach: KR cua toi o phan 3, muc tieu khong KR cua toi o nhom tham gia, khong muc tieu nao roi Cua toi", async () => {
		datCoBan({});
		const o1 = mucTieu("o1", {
			unitName: "Kinh doanh",
			keyResults: [
				krTien("o1a", "o1", 40, true),
				krTien("o1b", "o1", 20, true),
			],
		});
		const o2 = mucTieu("o2", {
			unitName: "Vận hành",
			keyResults: [krTien("o2a", "o2", 40, true), krTien("o2b", "o2", 20)],
		});
		const o3 = mucTieu("o3", {
			unitName: "Kế toán",
			keyResults: [krTien("o3a", "o3", 40)],
		});
		const o4 = mucTieu("o4", { keyResults: [krTien("o4a", "o4", 40)] });
		kho.mine = mineOutput.parse({
			objectives: [o1, o2, o3, o4],
			dangTheoDoi: [mucTieu("t1")],
			daBo: [
				mucTieu("d1", {
					status: "da-bo",
					droppedAt: "2026-10-03T00:00:00.000Z",
				}),
			],
		});
		await dung(<CuaToi />);
		await cho(() => co("kr-phu-trach", "[data-kr]"), "phan 3 hien");
		const p3 = phan("kr-phu-trach");
		const dongKr = [...(p3?.querySelectorAll("[data-kr]") ?? [])].map((d) =>
			d.getAttribute("data-kr"),
		);
		const nhom = p3?.querySelector<HTMLElement>('[data-nhom="tham-gia"]');
		const moNhom = nhom?.querySelector<HTMLButtonElement>("button");
		if (!moNhom)
			throw new Error("ctbp-kr-phu-trach: muc tieu O3, O4 roi khoi Cua toi");
		await bamChuot(moNhom);
		await nhip(2);
		const trongNhom = new Set(
			[
				...(nhom?.querySelectorAll(
					"[data-muc-tieu],[data-objective-id],tr[data-row-id]",
				) ?? []),
			]
				.map(
					(x) =>
						x.getAttribute("data-muc-tieu") ??
						x.getAttribute("data-objective-id") ??
						x.getAttribute("data-row-id"),
				)
				.filter((x): x is string => x !== null),
		);
		const coTrongNhom = (id: string) =>
			trongNhom.has(id) || (nhom?.textContent ?? "").includes(`Mục tiêu ${id}`);
		const phanBa = new Set(["o1", "o2"]);
		const hop = ["o1", "o2", "o3", "o4"].filter(
			(id) => phanBa.has(id) || coTrongNhom(id),
		);
		expect({
			dongKr,
			nhomCoO3: coTrongNhom("o3"),
			nhomCoO4: coTrongNhom("o4"),
			nhomKhongCoO1: !coTrongNhom("o1"),
			hopBangMine: hop,
			theoDoi:
				document.body.querySelector("[data-nhom-dang-theo-doi]") !== null,
			daBo: document.body.querySelector("[data-nhom-da-bo]") !== null,
		}).toEqual({
			dongKr: ["o1a", "o1b", "o2a"],
			nhomCoO3: true,
			nhomCoO4: true,
			nhomKhongCoO1: true,
			hopBangMine: ["o1", "o2", "o3", "o4"],
			theoDoi: true,
			daBo: true,
		});
	});
});

/* ---------- ctbp-khong-dan (E9) ---------- */

function DauKhuThu() {
	const q = useQuyenKhu("cua-toi");
	return (
		<div data-slot="page-shell-header">
			<DongLyDoKhu q={q} />
			<HanhDongKhu cauNoi={false} chonChuKy={null} q={q} tab="cua-toi" />
		</div>
	);
}

describe("ctbp-khong-dan", () => {
	for (const caNhan of [false, true])
		test(`ctbp-khong-dan: OKR ca nhan ${caNhan ? "bat" : "tat"}`, async () => {
			datCoBan({ headOf: [[], []] });
			kho.doc.set("okr.program", () => ({
				objectiveCap: 5,
				krCap: 5,
				capMode: "canh-bao",
				scoreScale: "0-1",
				weightsOn: false,
				personalOn: caNhan,
				version: 1,
			}));
			const m = okrMessages("vi");
			await dung(
				<main>
					<DauKhuThu />
					<CuaToi />
				</main>,
			);
			await cho(daTaiPhan1, "phan 1 tai xong");
			await cho(
				() => document.body.querySelector("[data-ly-do-khu]") !== null,
				"dong ly do khoa",
			);
			const main = document.body.querySelector("main");
			const than = [...(main?.children ?? [])].filter(
				(x) => !x.matches('[data-slot="page-shell-header"]'),
			);
			const moiTao = than.flatMap((x) =>
				[...x.querySelectorAll<HTMLElement>("a,button")].filter(
					(n) =>
						/tạo|thêm mục tiêu|OKR cá nhân/i.test(n.textContent ?? "") ||
						n.matches('[data-nut^="tao"],[data-nut="them-muc-tieu"]'),
				),
			);
			if (moiTao.length > 0)
				throw new Error(
					`ctbp-khong-dan: than Cua toi co loi moi tao «${moiTao[0]?.textContent}»`,
				);
			const nut = main?.querySelector<HTMLButtonElement>(
				'[data-nut="them-muc-tieu"]',
			);
			const lyDo = document.body.querySelector("[data-ly-do-khu]");
			expect({
				phan2: phan("don-vi-dan"),
				nutKhoa:
					nut?.disabled === true ||
					nut?.getAttribute("aria-disabled") === "true",
				troLyDo: nut?.getAttribute("aria-describedby") === lyDo?.id,
				lyDo: lyDo?.textContent,
			}).toEqual({
				phan2: null,
				nutKhoa: true,
				troLyDo: true,
				lyDo: m.khoaTao.chuaDan,
			});
		});

	test("ctbp-khong-dan: trang thai rong chi moi Sang Theo don vi", async () => {
		datCoBan({ headOf: [[], []], tuan: KHONG_KR });
		await dung(<CuaToi />);
		await cho(
			() =>
				document.body.querySelector('[data-trang-thai="ST-cuatoi-rong"]') !==
				null,
			"trang thai rong",
		);
		const rong = document.body.querySelector(
			'[data-trang-thai="ST-cuatoi-rong"]',
		);
		const lienKet = [...(rong?.querySelectorAll("a,button") ?? [])].map(
			(x) => x.textContent,
		);
		expect(lienKet).toEqual([okrMessages("vi").cuaToiRong.action]);
	});
});

/* ---------- ctbp-tai-loi (E11) ---------- */

const treo = () => new Promise<never>(() => {});

describe("ctbp-tai-loi", () => {
	const TRUY_VAN = ["okr.capNhatTuan", "okr.danhSach", "okr.mine"] as const;
	const PHAN = {
		"okr.capNhatTuan": "can-cap-nhat",
		"okr.danhSach": "don-vi-dan",
		"okr.mine": "kr-phu-trach",
	} as const;
	/** Phần 3 giữ hai trạng thái tải/lỗi đã ký của Của tôi (hồ sơ muc-tieu-va-kr). */
	const KHUNG = {
		"okr.capNhatTuan": "[data-khung-xuong]",
		"okr.danhSach": "[data-khung-xuong]",
		"okr.mine": "[data-trang-thai='ST-donvi-dangtai']",
	} as const;
	const LOI = {
		"okr.capNhatTuan": '[data-trang-thai="ST-ctbp-loi-phan"]',
		"okr.danhSach": '[data-trang-thai="ST-ctbp-loi-phan"]',
		"okr.mine": "[data-trang-thai='ST-donvi-loi']",
	} as const;
	for (const tv of TRUY_VAN)
		for (const kieu of ["dang-tai", "loi"] as const)
			test(`ctbp-tai-loi: ${tv} ${kieu}`, async () => {
				datCoBan({ headOf: [["bp-1"], []] });
				kho.doc.set("okr.danhSach", () => danhSachTu(BA_MUC_TIEU, []));
				kho.mine = mineOutput.parse({
					objectives: [
						mucTieu("o1", { keyResults: [krTien("o1a", "o1", 40, true)] }),
					],
					dangTheoDoi: [],
					daBo: [],
				});
				const cu = kho.doc.get(tv);
				const goc = tv === "okr.mine" ? () => kho.mine : (cu ?? (() => null));
				let lan = 0;
				kho.doc.set(tv, (vao: DauVao) => {
					lan += 1;
					if (kieu === "dang-tai") return treo() as never;
					if (lan === 1) throw new Error("hong");
					return goc(vao);
				});
				await dung(<CuaToi />, "?kyOkr=q4");
				const ten = PHAN[tv];
				const khac = Object.values(PHAN).filter((p) => p !== ten);
				const coDuLieu = (p: string) =>
					p === "can-cap-nhat"
						? (phan(p)?.querySelectorAll("[data-kr]").length ?? 0) > 0
						: p === "don-vi-dan"
							? co(p, "[data-so-kr]")
							: (phan(p)?.querySelectorAll("[data-kr]").length ?? 0) > 0;
				await cho(() => khac.every(coDuLieu), "hai phan kia co du lieu");
				if (kieu === "dang-tai") {
					expect(co(ten, KHUNG[tv])).toBe(true);
					return;
				}
				await cho(() => co(ten, LOI[tv]), `loi rieng phan ${ten}`);
				const loiKhac = khac.filter(
					(p) =>
						co(p, '[data-trang-thai="ST-ctbp-loi-phan"]') ||
						co(p, "[data-trang-thai='ST-donvi-loi']"),
				);
				if (loiKhac.length > 0)
					throw new Error(
						`ctbp-tai-loi: ${tv} loi lam an phan ${loiKhac.join(", ")}`,
					);
				const nut =
					phan(ten)?.querySelector<HTMLButtonElement>(
						'[data-nut="thu-lai-phan"]',
					) ?? phan(ten)?.querySelector<HTMLButtonElement>(`${LOI[tv]} button`);
				if (!nut) throw new Error("khong thay nut thu lai");
				const truoc = lan;
				await bamChuot(nut);
				await cho(() => lan > truoc, "goi lai dung truy van");
				expect(lan - truoc).toBe(1);
			});
});

/* ---------- ctbp-bon-the (E10) ---------- */

// Thanh thẻ nằm cạnh đầu trang khu trong cùng tệp; khung trang cần ViewTransition mà
// bản React của bộ kiểm không có — giả khung như bài okr-thanh-tab.dom.tsx.
const khoiThe =
	(the: string) =>
	({ children }: { children?: React.ReactNode }) =>
		createElement(the, null, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoiThe("header"),
	PageShellHeading: khoiThe("div"),
	PageShellTitle: khoiThe("h1"),
	PageShellDescription: khoiThe("p"),
	PageShellActions: khoiThe("div"),
}));
const { ThanhTabOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
const { TAB } = await import("@/app/(app)/[slug]/okr/tab-okr");

describe("ctbp-bon-the", () => {
	const KY_VONG = {
		vi: ["Của tôi", "Theo đơn vị", "Toàn cảnh", "Hỏi ý"],
		en: ["Mine", "By unit", "Overview", "Call for ideas"],
	} as const;
	for (const locale of ["vi", "en"] as const)
		test(`ctbp-bon-the: ${locale}`, async () => {
			const m = okrMessages(locale);
			await dung(
				<ThanhTabOkr tab="cua-toi" />,
				"?kyOkr=q3&donOkr=pb%3Apb-1",
				locale,
			);
			const the = [...document.body.querySelectorAll('[role="tab"]')];
			if (the.length !== 4)
				throw new Error(`ctbp-bon-the: ${the.length} the, mong 4`);
			const conKhoaCu = (o: Record<string, string>) =>
				Object.hasOwn(o, "cap-nhat-tuan");
			expect({
				nhan: the.map((t) => t.textContent),
				nhanTuMessages: the.map((t) => t.textContent),
				soTab: TAB.length,
				khoaTab: conKhoaCu(m.tab),
				khoaMoTa: conKhoaCu(m.moTa),
				moTaCuaToi: m.moTa["cua-toi"],
				giuThamSo: the.every((t) => {
					const q = new URL(t.getAttribute("href") ?? "", "http://x")
						.searchParams;
					return q.get("kyOkr") === "q3" && q.get("donOkr") === "pb:pb-1";
				}),
			}).toEqual({
				nhan: [...KY_VONG[locale]],
				nhanTuMessages: [
					m.tab["cua-toi"],
					m.tab["theo-don-vi"],
					m.tab["toan-canh"],
					m.tab["hoi-y"],
				],
				soTab: 4,
				khoaTab: false,
				khoaMoTa: false,
				moTaCuaToi:
					locale === "vi"
						? "Việc cần cập nhật tuần này, đơn vị bạn dẫn và KR bạn phụ trách."
						: "Your weekly updates, the units you lead and the key results you own.",
				giuThamSo: true,
			});
		});
});
