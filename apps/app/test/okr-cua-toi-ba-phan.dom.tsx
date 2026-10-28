import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
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

type KrCapNhat = CapNhatTuanOutput["items"][number];

function krTuan(id: string, daGui: boolean): KrCapNhat {
	return {
		keyResultId: id,
		title: `KR tuan ${id}`,
		objectiveId: "mt-1",
		objectiveTitle: "Tăng trưởng quý 4",
		unitName: "Kinh doanh",
		donOkr: "pb:pb-1",
		cycleId: "q4",
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

const BA_MUC_TIEU: MucTieuOutput[] = [
	mucTieu("o1", {
		keyResults: [krTien("o1a", "o1", 45), krTien("o1b", "o1", 30)],
	}),
	mucTieu("o2", {
		keyResults: [krTien("o2a", "o2", 10), krTien("o2b", "o2", 50)],
	}),
	mucTieu("o3", { keyResults: [krTien("o3a", "o3", 20)] }),
];

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
const co = (ten: string, sel: string) =>
	(phan(ten)?.querySelector(sel) ?? null) !== null;
const daTaiPhan1 = () =>
	phan("can-cap-nhat") !== null && !co("can-cap-nhat", "[data-khung-xuong]");

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
						`/ws/okr/bo-okr?${new URLSearchParams({ donOkr: khoa, kyOkr: "q4" })}`,
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

const treo = () => new Promise<never>(() => {});

describe("ctbp-tai-loi", () => {
	const TRUY_VAN = ["okr.capNhatTuan", "okr.danhSach", "okr.mine"] as const;
	const PHAN = {
		"okr.capNhatTuan": "can-cap-nhat",
		"okr.danhSach": "don-vi-dan",
		"okr.mine": "kr-phu-trach",
	} as const;
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
				let hong = true;
				kho.doc.set(tv, (vao: DauVao) => {
					lan += 1;
					if (kieu === "dang-tai") return treo() as never;
					if (hong) throw new Error("hong");
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
				if (kieu === "dang-tai") {
					await cho(() => khac.every(coDuLieu), "hai phan kia co du lieu");
					expect(co(ten, KHUNG[tv])).toBe(true);
					return;
				}
				await cho(() => co(ten, LOI[tv]), `loi rieng phan ${ten}`);
				await nhip(4);
				const loiKhac = khac.filter(
					(p) =>
						phan(p) === null ||
						co(p, '[data-trang-thai="ST-ctbp-loi-phan"]') ||
						co(p, "[data-trang-thai='ST-donvi-loi']"),
				);
				if (loiKhac.length > 0)
					throw new Error(
						`ctbp-tai-loi: ${tv} loi lam an phan ${loiKhac.join(", ")}`,
					);
				await cho(() => khac.every(coDuLieu), "hai phan kia co du lieu");
				const nut =
					phan(ten)?.querySelector<HTMLButtonElement>(
						'[data-nut="thu-lai-phan"]',
					) ?? phan(ten)?.querySelector<HTMLButtonElement>(`${LOI[tv]} button`);
				if (!nut) throw new Error("khong thay nut thu lai");
				const truoc = lan;
				hong = false;
				await bamChuot(nut);
				await cho(() => lan > truoc, "goi lai dung truy van");
				expect(lan - truoc).toBe(1);
			});
});

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
		vi: ["Của tôi", "Theo đơn vị", "Toàn cảnh", "Lấy ý kiến"],
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
						: "Your updates, the units you lead and the key results you own.",
				giuThamSo: true,
			});
		});
});
