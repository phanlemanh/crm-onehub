import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { homNayVN } from "@crm/validation/ngay-vn";
import { type KieuKr, tienDoKr } from "@crm/validation/okr-kr";
import { troLyTomTatOutput } from "@crm/validation/okr-tom-tat";
import { useQuery } from "@tanstack/react-query";
import { act, Profiler, useCallback } from "react";
import type { CapNhatKr } from "@/app/(app)/[slug]/okr/cap-nhat-kr";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	banGhiChiSoOutput,
	lichSuSoOutput,
} from "../../api/src/okr/okr-so.contracts";
import {
	dienBienOutput,
	hopTuanOutput,
	khoiCuaToiOutput,
	quanhMucTieuOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	dungTheoDonVi,
	goiCua,
	type Json,
	type KetQuaGhi,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nguoiDung,
	nhip,
	nut,
	qs,
	type San,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { useCapNhatKr } = await import("@/app/(app)/[slug]/okr/cap-nhat-kr");
const { useTRPC } = await import("@/lib/trpc/client");
const { okrMessages } = await import("@/lib/messages/okr");
const { congNgay } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan"
);
const { hienSo } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
const { SEARCH_PARAM } = await import("@/lib/search-param-keys");

const mo = okrMessages("vi");

const MT = "mt-ngan";
const BON_KR = ["k1", "k2", "k3", "k4"].map((id, i) =>
	kr(id, MT, {
		title: `KR thứ ${i + 1} của mục tiêu`,
		hienTaiQuaCapNhat: true,
		laCuaToi: true,
	}),
);

const chiTiet = (): ObjectiveOutput =>
	chiTietTu(mucTieu(MT, BON_KR, { canEdit: true }));

type Tay = { mo: CapNhatKr["mo"] | null };

const tay: Tay = { mo: null };

function DocKr({ keyResultId }: { keyResultId: string }) {
	const trpc = useTRPC();
	useQuery(trpc.okr.canhKr.queryOptions({ keyResultId }));
	useQuery(trpc.okr.dienBien.queryOptions({ keyResultId }));
	return null;
}

function ThuHook({ docKr }: { docKr: string }) {
	const capNhat = useCapNhatKr();
	tay.mo = capNhat.mo;
	return (
		<>
			<DocKr keyResultId={docKr} />
			{capNhat.hop}
		</>
	);
}

const hop = () => qs("[data-hop-cap-nhat-kr]");
const oGiaTri = (id: string) => qs<HTMLInputElement>(`[id="${id}-gia-tri"]`);

beforeEach(datLai);
afterEach(thaoHet);

describe("vk7-cap-nhat-ngan", () => {
	test("vk7-cap-nhat-ngan: hop mo voi tieu diem o o gia tri; mo K1 roi K3 khi phien con dang mo -> hop K3, gui dung K3 va phien sau, lam moi canhKr va lich su", async () => {
		const traPhien: ((kq: KetQuaGhi) => void)[] = [];
		kho.ghiRieng.set(
			"okr.moCapNhat",
			() => new Promise<KetQuaGhi>((r) => traPhien.push(r)),
		);
		kho.rieng.set("okr.dienBien", () => dienBienCua(CA_TANG));
		const mt = chiTiet();
		const [k1, , k3] = mt.keyResults;
		if (!k1 || !k3) throw new Error("thieu KR mau");
		await dung(<ThuHook docKr={k3.id} />);
		await cho(
			() =>
				docCua("okr.canhKr").length === 1 &&
				docCua("okr.dienBien").length === 1,
			"doc KR lan dau",
		);
		const docTruoc = {
			canhKr: docCua("okr.canhKr").length,
			lichSu: docCua("okr.dienBien").length,
		};

		await act(async () => {
			tay.mo?.(mt, k1);
		});
		await cho(() => hop() !== null, "hop K1");
		const tieuDiemK1 = document.activeElement === oGiaTri(k1.id);
		await act(async () => {
			tay.mo?.(mt, k3);
		});
		await nhip(3);
		const krCuaHop = hop()?.getAttribute("data-hop-cap-nhat-kr");
		if (krCuaHop !== k3.id) throw new Error(`hop sai kr: ${krCuaHop}`);
		const tieuDiemK3 = document.activeElement === oGiaTri(k3.id);
		await act(async () => {
			traPhien[1]?.({ sessionId: "phien-2" });
		});
		await act(async () => {
			traPhien[0]?.({ sessionId: "phien-1" });
		});
		await nhip(2);

		const h = hop();
		if (!h) throw new Error("hop dong mat");
		const o = oGiaTri(k3.id);
		if (!o) throw new Error("khong co o gia tri K3");
		const u = nguoiDung();
		await act(async () => {
			await u.clear(o);
			await u.type(o, "33");
		});
		await act(async () => {
			await u.click(nut(mo.capNhat.mucTuTin.vua, h));
		});
		const gui = () =>
			h.querySelector<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]');
		await cho(() => gui()?.disabled === false, "nut gui bat");
		const btn = gui();
		if (!btn) throw new Error("khong co nut gui");
		await act(async () => {
			await u.click(btn);
		});
		await cho(() => hop() === null, "hop dong sau gui");

		const lamMoi = {
			"canh-kr": docCua("okr.canhKr").length - docTruoc.canhKr,
			"lich-su": docCua("okr.dienBien").length - docTruoc.lichSu,
		};
		for (const [truyVan, lan] of Object.entries(lamMoi)) {
			if (lan < 1) throw new Error(`khong lam moi: ${truyVan}`);
		}
		if (!tieuDiemK1 || !tieuDiemK3)
			throw new Error(
				`o gia tri khong co tieu diem: K1 ${tieuDiemK1}, K3 ${tieuDiemK3}`,
			);
		expect({
			tieuDe: h.querySelector('[data-slot="dialog-description"]')?.textContent,
			khongDich: h
				.querySelector('[data-slot="dialog-description"]')
				?.getAttribute("translate"),
			phien: goiCua("okr.moCapNhat").map((g) => g.vao),
			gui: goiCua("okr.guiCapNhat").map((g) => g.vao),
		}).toEqual({
			tieuDe: k3.title,
			khongDich: "no",
			phien: [{ entry: "sheet" }, { entry: "sheet" }],
			gui: [
				{
					sessionId: "phien-2",
					items: [
						{ keyResultId: k3.id, value: 33, confidence: "vua", note: "" },
					],
				},
			],
		});
	});
});

class QuanSatCoCo {
	constructor(private cb: ResizeObserverCallback) {}
	observe(el: Element) {
		this.cb(
			[
				{
					target: el,
					contentRect: { width: 640, height: 144 } as DOMRectReadOnly,
				} as ResizeObserverEntry,
			],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}

const roCu = globalThis.ResizeObserver;
const rectCu = HTMLElement.prototype.getBoundingClientRect;

function coKhungDoThi(): void {
	globalThis.ResizeObserver = QuanSatCoCo as unknown as typeof ResizeObserver;
	HTMLElement.prototype.getBoundingClientRect = () =>
		({
			width: 640,
			height: 144,
			top: 0,
			left: 0,
			right: 640,
			bottom: 144,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		}) as DOMRect;
}

function thuHaiTuanNay(): string {
	const hom = homNayVN(new Date());
	const thu = new Date(`${hom}T00:00:00Z`).getUTCDay();
	return congNgay(hom, -((thu + 6) % 7));
}

type CaKieu = {
	ten: string;
	kieu: KieuKr;
	khoi: number;
	dich: number;
	lichSu: [number, number, number];
};

const CA_TANG: CaKieu = {
	ten: "tang-toi",
	kieu: "tang-toi",
	khoi: 0,
	dich: 100,
	lichSu: [10, 20, 30],
};

const CA_SO: CaKieu[] = [
	CA_TANG,
	{
		ten: "giam-xuong",
		kieu: "giam-xuong",
		khoi: 100,
		dich: 0,
		lichSu: [90, 80, 70],
	},
];

function dienBienCua(ca: CaKieu) {
	const thuHai = thuHaiTuanNay();
	const tuan = [-21, -14, -7, 0, 7].map((n) => congNgay(thuHai, n));
	return dienBienOutput.parse({
		kieu: ca.kieu,
		tieuDe: `KR ${ca.ten}`,
		khoi: ca.khoi,
		dich: ca.dich,
		donVi: "",
		coCapNhat: true,
		tuanDau: tuan[0] ?? null,
		diem: tuan.map((t, i) => ({
			tuan: t,
			giaTri: ca.lichSu[i] ?? null,
			kyVong: null,
			tuTin: i < ca.lichSu.length ? "vua" : null,
			ghiChu: null,
		})),
	});
}

function mtMotKr(id: string, doi: Parameters<typeof kr>[2]): ObjectiveOutput {
	return chiTietTu(
		mucTieu(
			MT,
			[
				kr(id, MT, {
					title: `KR ${id}`,
					hienTaiQuaCapNhat: true,
					laCuaToi: true,
					...doi,
				}),
			],
			{ canEdit: true },
		),
	);
}

async function moHopCua(mt: ObjectiveOutput): Promise<HTMLElement> {
	const k = mt.keyResults[0];
	if (!k) throw new Error("thieu KR");
	await dung(<ThuHook docKr={k.id} />);
	await act(async () => {
		tay.mo?.(mt, k);
	});
	await cho(() => hop() !== null, "hop cap nhat");
	const h = hop();
	if (!h) throw new Error("khong co hop");
	return h;
}

const diemMoi = () =>
	[...document.querySelectorAll("[data-diem-moi]")].map((d) =>
		d.getAttribute("data-diem-moi"),
	);
const soDiemLichSu = () =>
	document.querySelectorAll(".recharts-line-dots circle:not([data-diem-moi])")
		.length;
const dongTienDo = () =>
	qs("[data-xem-truoc] [data-tien-do-moi]")?.getAttribute("data-tien-do-moi") ??
	null;

async function goGiaTri(id: string, chu: string): Promise<void> {
	const o = oGiaTri(id);
	if (!o) throw new Error(`khong co o gia tri ${id}`);
	const u = nguoiDung();
	await act(async () => {
		await u.clear(o);
		await u.type(o, chu);
	});
	await nhip(3);
}

describe("vk7-xem-truoc", () => {
	afterEach(() => {
		globalThis.ResizeObserver = roCu;
		HTMLElement.prototype.getBoundingClientRect = rectCu;
	});

	test("vk7-xem-truoc: ma tran ba kieu KR viet truoc — so co diem moi va tien do moi tu tienDoKr, moc chi co chu Xong / Chua xong", async () => {
		const MA_TRAN = ["tang-toi", "giam-xuong", "moc"] as const;
		expect(MA_TRAN.length).toBe(3);
		const daChay: string[] = [];
		for (const ten of MA_TRAN) {
			datLai();
			coKhungDoThi();
			const ca = CA_SO.find((c) => c.ten === ten);
			if (ca) {
				kho.rieng.set("okr.dienBien", () => dienBienCua(ca));
				const id = `x-${ten}`;
				await moHopCua(
					mtMotKr(id, {
						kind: ca.kieu,
						startValue: ca.khoi,
						targetValue: ca.dich,
						currentValue: ca.lichSu[2],
						unit: "",
					}),
				);
				await cho(
					() => qs("[data-xem-truoc] [data-slot='target-line-chart']") !== null,
					`do thi xem truoc ${ten}`,
				);
				const theoGia = [];
				for (const so of [40, 60]) {
					await goGiaTri(id, String(so));
					await cho(() => diemMoi().length > 0, `thieu diem moi: ${ten} ${so}`);
					theoGia.push({
						diemMoi: diemMoi(),
						lichSu: soDiemLichSu(),
						dich: qs("[data-xem-truoc] [data-muc='dich']") !== null,
						tienDo: dongTienDo(),
						mong: String(tienDoKr(ca.kieu, ca.khoi, ca.dich, so)),
					});
				}
				await goGiaTri(id, "abc");
				const loi = qs(`[data-hop-cap-nhat-kr] [data-slot="field-error"]`);
				const thucTe = {
					theoGia,
					sai: {
						diemMoi: diemMoi().length,
						tienDo: dongTienDo(),
						loi: loi?.textContent ?? null,
					},
				};
				expect(thucTe).toEqual({
					theoGia: [40, 60].map((so) => ({
						diemMoi: [String(so)],
						lichSu: 3,
						dich: true,
						tienDo: String(tienDoKr(ca.kieu, ca.khoi, ca.dich, so)),
						mong: String(tienDoKr(ca.kieu, ca.khoi, ca.dich, so)),
					})),
					sai: {
						diemMoi: 0,
						tienDo: null,
						loi: mo.capNhat.loiSo(hienSo(3.5, "vi")),
					},
				});
			} else {
				const id = `x-${ten}`;
				const h = await moHopCua(
					mtMotKr(id, {
						kind: "moc",
						startValue: 0,
						targetValue: 1,
						currentValue: 0,
						unit: "",
					}),
				);
				const chuMoc = () =>
					qs("[data-xem-truoc='moc'] [data-tien-do-moi]")?.textContent ?? "";
				const truoc = {
					chu: chuMoc().startsWith(mo.moc.chuaXong),
					tienDo: dongTienDo(),
				};
				const u = nguoiDung();
				await act(async () => {
					await u.click(nut(mo.moc.xong, h));
				});
				await nhip(3);
				const thucTe = {
					truoc,
					sau: { chu: chuMoc().startsWith(mo.moc.xong), tienDo: dongTienDo() },
					doThi: document.querySelectorAll("[data-slot='target-line-chart']")
						.length,
					docLichSu: docCua("okr.dienBien").length,
				};
				expect(thucTe).toEqual({
					truoc: { chu: true, tienDo: "0" },
					sau: { chu: true, tienDo: "100" },
					doThi: 0,
					docLichSu: 1,
				});
			}
			daChay.push(ten);
			await thaoHet();
		}
		expect(daChay).toEqual([...MA_TRAN]);
	});
});

mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
}));

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { useRecordStack } = await import(
	"@/components/crm/record-sheet/record-stack"
);
const { giaTri } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");

const mk = okrCanhKrMessages("vi").khung;

type KrMau = ReturnType<typeof kr>;

function canhCua(k: KrMau) {
	return canhKrOutput.parse({
		kr: {
			id: k.id,
			title: k.title,
			kind: k.kind,
			objectiveId: k.objectiveId,
			ownerName: k.owner.name,
			xong: false,
		},
		dong: [],
		bangChung: [],
		quyen: { suaDuoc: true, ganDuoc: false },
		khoa: false,
		choDuyet: false,
	});
}

type Chong = { hienTai: string[] };

const chong: Chong = { hienTai: [] };
const host = { soLanMount: 0 };

function DocChong() {
	const { stack } = useRecordStack();
	chong.hienTai = stack.map((r) => `${r.kind}:${r.id}`);
	return null;
}

function demMount(_id: string, pha: string) {
	if (pha === "mount") host.soLanMount += 1;
}

type ChoNgan = {
	ds?: KrMau[];
	mt?: () => ObjectiveOutput;
	dienBien?: () => object;
};

async function dungNgan(krId: string, cho_: ChoNgan = {}) {
	const ds = cho_.ds ?? BON_KR;
	chong.hienTai = [];
	host.soLanMount = 0;
	kho.chiTiet =
		cho_.mt ?? (() => chiTietTu(mucTieu(MT, ds, { canEdit: true })));
	if (!kho.rieng.has("okr.canhKr"))
		kho.rieng.set("okr.canhKr", (vao) => {
			const k = ds.find((x) => x.id === vao?.keyResultId);
			if (!k) throw new LoiTrpc("NOT_FOUND", "khong co KR");
			return canhCua(k);
		});
	if (!kho.rieng.has("okr.dienBien"))
		kho.rieng.set(
			"okr.dienBien",
			cho_.dienBien ?? (() => dienBienCua(CA_TANG)),
		);
	const san = await dung(
		<>
			<Profiler id="host" onRender={demMount}>
				<RecordSheetHost />
			</Profiler>
			<DocChong />
		</>,
		`?record=objective:${MT},kr:${krId}`,
	);
	await cho(() => qs("[data-than-ngan-kr]") !== null, `ngan KR ${krId} dung`);
	return san;
}

const nutCo2 = (nhan: string) =>
	qs<HTMLButtonElement>(`[data-dau-ngan-kr] button[aria-label="${nhan}"]`);
const nutCapNhatDau = () =>
	[
		...document.querySelectorAll<HTMLButtonElement>(
			"[data-dau-ngan-kr] button",
		),
	].find((b) => b.textContent?.trim() === mk.capNhat) ?? null;
const demKr = () => qs("[data-dau-ngan-kr] [data-dem-kr]")?.textContent ?? null;
const trangThaiNgan = () =>
	qs("[data-than-ngan-kr]")?.getAttribute("data-trang-thai") ?? null;
const daDungXong = () =>
	trangThaiNgan() === "ST-ngan-kr-mo" ||
	trangThaiNgan() === "ST-ngan-kr-chi-doc";

describe("vk7-dau-ngan", () => {
	test("vk7-dau-ngan: KR thu 2 cua M bon KR — lien ket M, dem 2/4, hai nut sang KR, Cap nhat primary; ma tran quyen ba o; muc tieu mot KR khong dem", async () => {
		const san = await dungNgan("k2");
		await cho(daDungXong, "ngan KR k2 xong");
		const lk = qs<HTMLAnchorElement>("[data-lien-ket-muc-tieu]");
		const dau = {
			tenMt: lk?.textContent,
			href: new URLSearchParams(
				(lk?.getAttribute("href") ?? "").replace(/^\?/, ""),
			).get("record"),
			dem: demKr(),
			truoc: nutCo2(mk.krTruoc) !== null,
			ke: nutCo2(mk.krKe) !== null,
			capNhat: nutCapNhatDau()?.getAttribute("data-variant") ?? null,
		};
		if (!lk) throw new Error("khong co lien ket muc tieu");
		await act(async () => {
			await nguoiDung().click(lk);
		});
		await cho(() => san.url().get("record") === `objective:${MT}`, "ve ngan M");
		expect(dau).toEqual({
			tenMt: chiTiet().title,
			href: `objective:${MT}`,
			dem: "2/4",
			truoc: true,
			ke: true,
			capNhat: "default",
		});
		await thaoHet();

		const MA_TRAN = [
			{ ten: "duoc-cap-nhat", canEditKr: true, quaCapNhat: true, co: true },
			{
				ten: "khong-trong-canEditKr",
				canEditKr: false,
				quaCapNhat: true,
				co: false,
			},
			{ ten: "hien-tai-do-may", canEditKr: true, quaCapNhat: false, co: false },
		] as const;
		expect(MA_TRAN.length).toBe(3);
		const thucTe: Record<string, boolean> = {};
		for (const o of MA_TRAN) {
			datLai();
			const ds = BON_KR.map((k) =>
				k.id === "k2" ? { ...k, hienTaiQuaCapNhat: o.quaCapNhat } : k,
			);
			await dungNgan("k2", {
				ds,
				mt: () =>
					chiTietTu(mucTieu(MT, ds, { canEdit: true }), {
						canEditKr: o.canEditKr ? ds.map((k) => k.id) : ["k1", "k3"],
					}),
			});
			await cho(daDungXong, `ngan ${o.ten}`);
			thucTe[o.ten] = nutCapNhatDau() !== null;
			await thaoHet();
		}
		expect(thucTe).toEqual(
			Object.fromEntries(MA_TRAN.map((o) => [o.ten, o.co])),
		);

		datLai();
		const motKr = [BON_KR[0]].filter((k): k is KrMau => k !== undefined);
		await dungNgan("k1", { ds: motKr });
		await cho(daDungXong, "ngan muc tieu mot KR");
		expect({
			dem: demKr(),
			truoc: nutCo2(mk.krTruoc),
			ke: nutCo2(mk.krKe),
			capNhat: nutCapNhatDau() !== null,
		}).toEqual({ dem: null, truoc: null, ke: null, capNhat: true });
	});
});

const MUC_NGAN = [
	"so",
	"tien-do",
	"lich-su",
	"viec-bang-chung",
	"so-nguon",
	"chi-tiet",
] as const;

const thuTuMuc = () =>
	[...document.querySelectorAll("[data-than-ngan-kr] [data-muc-ngan]")].map(
		(o) => o.getAttribute("data-muc-ngan"),
	);
const oHienTai = () => qs('[data-muc-ngan="so"] [data-o-so="hien-tai"]');
const dongLichSu = () =>
	[
		...document.querySelectorAll(
			'[data-muc-ngan="lich-su"] [data-lan-cap-nhat]',
		),
	].map((o) => o.getAttribute("data-lan-cap-nhat"));
const diemDoThiNgan = () =>
	document.querySelectorAll(
		'[data-muc-ngan="lich-su"] .recharts-line-dots circle:not([data-diem-moi])',
	).length;
const soLanCapNhat = (d: ReturnType<typeof dienBienCua>) =>
	d.diem.filter((p) => p.giaTri !== null).length;

describe("vk7-than-ngan", () => {
	afterEach(() => {
		globalThis.ResizeObserver = roCu;
		HTMLElement.prototype.getBoundingClientRect = rectCu;
	});

	test("vk7-than-ngan: sau muc theo thu tu, o so Hien tai co gia tri va dich, Progress co vach, do thi co dich va so diem bang so lan cap nhat, lich su moi nhat truoc, hai tab Viec va Bang chung chuyen duoc", async () => {
		coKhungDoThi();
		const ds = BON_KR.map((k) =>
			k.id === "k2" ? { ...k, source: "crm" as const } : k,
		);
		const lichSu = dienBienCua(CA_TANG);
		kho.rieng.set("okr.dienBien", () => lichSu);
		kho.rieng.set("okr.banGhiChiSo", () =>
			banGhiChiSoOutput.parse({
				tenKr: "KR thứ 2 của mục tiêu",
				loai: "crm",
				dinhNghia: null,
				tu: null,
				den: null,
				ngay: "2026-10-19",
				soDaChup: 20,
				soTinhLai: null,
				lech: false,
				tong: 0,
				dong: [],
				lanGhi: [],
			}),
		);
		kho.rieng.set("okr.lichSuSo", () =>
			lichSuSoOutput.parse({
				dong: [{ ngay: "2026-10-19", giaTri: 20, nguon: "crm", tacGia: null }],
			}),
		);
		await dungNgan("k2", { ds });
		await cho(daDungXong, "ngan KR k2 xong");
		await cho(
			() =>
				qs('[data-muc-ngan="lich-su"] [data-slot="target-line-chart"]') !==
					null &&
				qs('[data-muc-ngan="so-nguon"] [data-so-kr-noi-dung]')?.getAttribute(
					"data-trang-thai",
				) === "ST-so-co",
			"lich su va so nguon tai xong",
		);
		const k2 = ds[1];
		if (!k2) throw new Error("thieu k2");
		const moiTruoc = lichSu.diem
			.filter((p) => p.giaTri !== null || p.tuTin !== null)
			.map((p) => p.tuan)
			.reverse();
		expect({
			thuTu: thuTuMuc(),
			hienTai: [
				oHienTai()?.textContent?.includes(giaTri(k2, k2.currentValue, "vi")),
				oHienTai()?.textContent?.includes(giaTri(k2, k2.targetValue, "vi")),
			],
			vach: qs('[data-muc-ngan="tien-do"] [data-expected]')?.getAttribute(
				"data-expected",
			),
			dich: qs('[data-muc-ngan="lich-su"] [data-muc="dich"]') !== null,
			soDiem: diemDoThiNgan(),
			lichSu: dongLichSu(),
		}).toEqual({
			thuTu: [...MUC_NGAN],
			hienTai: [true, true],
			vach: String(chiTiet().expected),
			dich: true,
			soDiem: soLanCapNhat(lichSu),
			lichSu: moiTruoc,
		});
		await thaoHet();

		datLai();
		const dsMoc = BON_KR.map((k) =>
			k.id === "k2"
				? {
						...k,
						kind: "moc" as const,
						startValue: 0,
						targetValue: 1,
						currentValue: 0,
						unit: "",
					}
				: k,
		);
		await dungNgan("k2", { ds: dsMoc });
		await cho(daDungXong, "ngan KR moc xong");
		const tab = (nhan: string) =>
			[
				...document.querySelectorAll<HTMLElement>(
					'[data-muc-ngan="viec-bang-chung"] [role="tab"]',
				),
			].find((t) => t.textContent?.trim() === nhan) ?? null;
		const tabBang = tab(mk.tabBangChung);
		if (!tabBang) throw new Error("thieu tab Bang chung");
		await act(async () => {
			await nguoiDung().click(tabBang);
		});
		await nhip(2);
		const sauBang = tab(mk.tabBangChung)?.getAttribute("aria-selected");
		const tabViec = tab(mk.tabViec);
		if (!tabViec) throw new Error("thieu tab Viec");
		await act(async () => {
			await nguoiDung().click(tabViec);
		});
		await nhip(2);
		expect({
			tab: [
				...document.querySelectorAll(
					'[data-muc-ngan="viec-bang-chung"] [role="tab"]',
				),
			].map((t) => t.textContent?.trim()),
			sauBang,
			sauViec: tab(mk.tabViec)?.getAttribute("aria-selected"),
			thuTu: thuTuMuc(),
		}).toEqual({
			tab: [mk.tabViec, mk.tabBangChung],
			sauBang: "true",
			sauViec: "true",
			thuTu: [...MUC_NGAN],
		});
	});
});

describe("vk7-kr-ke", () => {
	test("vk7-kr-ke: tu K2 bam KR ke -> chong [objective:M, kr:K3], do dai giu, dem 3/4, tieu diem o nut KR ke, host mount mot lan; ma tran bon vi tri x hai nut", async () => {
		const san = await dungNgan("k2");
		await cho(daDungXong, "ngan K2 xong");
		const truocChong = [...chong.hienTai];
		const khung = qs('[data-slot="sheet-content"]');
		const ke = nutCo2(mk.krKe);
		if (!ke) throw new Error("thieu nut KR ke");
		await act(async () => {
			await nguoiDung().click(ke);
		});
		await cho(
			() => qs("[data-kr-sheet='k3']") !== null && demKr() === "3/4",
			"ngan K3",
		);
		await nhip(2);
		if (chong.hienTai.length !== truocChong.length)
			throw new Error(
				`chong ngan doi do dai: ${truocChong.join(",")} -> ${chong.hienTai.join(",")}`,
			);
		if (host.soLanMount !== 1)
			throw new Error(`host bi go: mount ${host.soLanMount} lan`);
		expect({
			truoc: truocChong,
			sau: chong.hienTai,
			url: san.url().get("record"),
			dem: demKr(),
			tieuDiem: document.activeElement === nutCo2(mk.krKe),
			cungKhung: qs('[data-slot="sheet-content"]') === khung,
			mount: host.soLanMount,
		}).toEqual({
			truoc: [`objective:${MT}`, "kr:k2"],
			sau: [`objective:${MT}`, "kr:k3"],
			url: `objective:${MT},kr:k3`,
			dem: "3/4",
			tieuDiem: true,
			cungKhung: true,
			mount: 1,
		});
		await thaoHet();

		const MA_TRAN = BON_KR.flatMap((k, i) => [
			{ kr: k.id, nut: mk.krTruoc, tat: i === 0 },
			{ kr: k.id, nut: mk.krKe, tat: i === BON_KR.length - 1 },
		]);
		expect(MA_TRAN.length).toBe(8);
		let soAssert = 0;
		for (const o of MA_TRAN) {
			datLai();
			await dungNgan(o.kr);
			await cho(daDungXong, `ngan ${o.kr}`);
			expect({ o: `${o.kr} ${o.nut}`, tat: nutCo2(o.nut)?.disabled }).toEqual({
				o: `${o.kr} ${o.nut}`,
				tat: o.tat,
			});
			soAssert += 1;
			await thaoHet();
		}
		expect(soAssert).toBe(8);
	});
});

function dienBienSauGui(ca: CaKieu, giaTriMoi: number) {
	const cu = dienBienCua(ca);
	const viTri = cu.diem.findIndex((p) => p.giaTri === null);
	return dienBienOutput.parse({
		...cu,
		diem: cu.diem.map((p, i) =>
			i === viTri ? { ...p, giaTri: giaTriMoi, tuTin: "vua" } : p,
		),
	});
}

describe("vk7-cap-nhat-ngan", () => {
	afterEach(() => {
		globalThis.ResizeObserver = roCu;
		HTMLElement.prototype.getBoundingClientRect = rectCu;
	});

	test("vk7-cap-nhat-ngan: tu dau ngan KR — bam Cap nhat, tieu diem o o gia tri, gui; may tu lam moi canhKr va lich su, hop dong, chong giu, Hien tai moi, lich su va do thi them mot", async () => {
		coKhungDoThi();
		const GIA_MOI = 42;
		const daGui = () => goiCua("okr.guiCapNhat").length > 0;
		const dsCu = BON_KR;
		const dsMoi = BON_KR.map((k) =>
			k.id === "k2" ? { ...k, currentValue: GIA_MOI } : k,
		);
		kho.rieng.set("okr.dienBien", () =>
			daGui() ? dienBienSauGui(CA_TANG, GIA_MOI) : dienBienCua(CA_TANG),
		);
		const san = await dungNgan("k2", {
			mt: () =>
				chiTietTu(mucTieu(MT, daGui() ? dsMoi : dsCu, { canEdit: true })),
		});
		await cho(daDungXong, "ngan K2 xong");
		await cho(() => diemDoThiNgan() > 0, "do thi lich su");
		const k2 = dsCu[1];
		if (!k2) throw new Error("thieu k2");
		const truoc = {
			hienTai: oHienTai()?.textContent?.includes(
				giaTri(k2, k2.currentValue, "vi"),
			),
			dong: dongLichSu().length,
			diem: diemDoThiNgan(),
			canhKr: docCua("okr.canhKr").length,
			lichSu: docCua("okr.dienBien").length,
		};
		const nutDau = nutCapNhatDau();
		if (!nutDau) throw new Error("thieu nut Cap nhat o dau ngan");
		const u = nguoiDung();
		await act(async () => {
			await u.click(nutDau);
		});
		await cho(() => hop() !== null, "hop cap nhat mo");
		await nhip(3);
		const tieuDiem = document.activeElement === oGiaTri(k2.id);
		const h = hop();
		const o = oGiaTri(k2.id);
		if (!h || !o) throw new Error("thieu hop hay o gia tri");
		await act(async () => {
			await u.clear(o);
			await u.type(o, String(GIA_MOI));
		});
		await act(async () => {
			await u.click(nut(mo.capNhat.mucTuTin.vua, h));
		});
		const gui = () =>
			h.querySelector<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]');
		await cho(() => gui()?.disabled === false, "nut gui bat");
		const btn = gui();
		if (!btn) throw new Error("khong co nut gui");
		await act(async () => {
			await u.click(btn);
		});
		await cho(() => hop() === null, "hop dong sau gui");
		await nhip(3);
		const lamMoi = {
			"canh-kr": docCua("okr.canhKr").length - truoc.canhKr,
			"lich-su": docCua("okr.dienBien").length - truoc.lichSu,
		};
		for (const [truyVan, lan] of Object.entries(lamMoi)) {
			if (lan < 1) throw new Error(`khong lam moi: ${truyVan}`);
		}
		await cho(
			() => dongLichSu().length > truoc.dong && diemDoThiNgan() > truoc.diem,
			"lich su them mot",
		);
		if (!tieuDiem) throw new Error("o gia tri khong co tieu diem");
		expect({
			truoc: truoc.hienTai,
			gui: goiCua("okr.guiCapNhat").map((g) => g.vao),
			hop: hop(),
			chong: chong.hienTai,
			url: san.url().get("record"),
			hienTai: oHienTai()?.textContent?.includes(giaTri(k2, GIA_MOI, "vi")),
			dong: dongLichSu().length - truoc.dong,
			diem: diemDoThiNgan() - truoc.diem,
		}).toEqual({
			truoc: true,
			gui: [
				{
					sessionId: "phien-1",
					items: [
						{ keyResultId: k2.id, value: GIA_MOI, confidence: "vua", note: "" },
					],
				},
			],
			hop: null,
			chong: [`objective:${MT}`, "kr:k2"],
			url: `objective:${MT},kr:k2`,
			hienTai: true,
			dong: 1,
			diem: 1,
		});
	});
});

function datKho(rong: number): () => void {
	const rongCu = window.innerWidth;
	const mmCu = window.matchMedia;
	window.innerWidth = rong;
	window.matchMedia = ((q: string) => {
		const m = /max-width:\s*(\d+)px/.exec(q);
		return {
			matches: m ? rong <= Number(m[1]) : false,
			media: q,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		};
	}) as typeof window.matchMedia;
	return () => {
		window.innerWidth = rongCu;
		window.matchMedia = mmCu;
	};
}

describe("vk7-hep", () => {
	test("vk7-hep: duoi md ngan KR la Drawer co dem, hai nut sang KR va Cap nhat; tu md tro len la Sheet, khong co drawer-content", async () => {
		const KHO = [
			{ ten: "390", rong: 390, drawer: true },
			{ ten: "1280", rong: 1280, drawer: false },
		] as const;
		const thucTe: Record<string, Json> = {};
		for (const k of KHO) {
			datLai();
			const traLai = datKho(k.rong);
			try {
				await dungNgan("k2");
				await cho(daDungXong, `ngan o kho ${k.ten}`);
				const drawer = qs('[data-slot="drawer-content"]') !== null;
				if (!k.drawer && drawer) throw new Error("drawer tren md");
				thucTe[k.ten] = {
					drawer,
					sheet: qs('[data-slot="sheet-content"]') !== null,
					dem: demKr(),
					truoc: nutCo2(mk.krTruoc) !== null,
					ke: nutCo2(mk.krKe) !== null,
					capNhat: nutCapNhatDau() !== null,
					dauTrongNgan:
						qs("[data-dau-ngan-kr]")?.closest(
							k.drawer
								? '[data-slot="drawer-content"]'
								: '[data-slot="sheet-content"]',
						) !== null,
				};
			} finally {
				await thaoHet();
				traLai();
			}
		}
		const dau = {
			dem: "2/4",
			truoc: true,
			ke: true,
			capNhat: true,
			dauTrongNgan: true,
		};
		expect(thucTe).toEqual({
			"390": { drawer: true, sheet: false, ...dau },
			"1280": { drawer: false, sheet: true, ...dau },
		});
	});
});

const KHOA_MOI = [
	"krTruoc",
	"krKe",
	"dem",
	"capNhat",
	"hienTai",
	"dich",
	"tienDo",
	"kyVong",
	"lichSu",
	"viecBangChung",
	"soNguon",
	"nguonTay",
	"chiTiet",
	"chiTietPhuTrach",
	"chiTietHan",
	"chiTietKieu",
	"khongThay",
	"loiTai",
	"loiTaiMoTa",
	"dangTaiNgan",
] as const;

describe("vk7-trang-thai", () => {
	test("vk7-trang-thai: ma tran bon trang thai viet truoc, chu moi vi en khac nhau, ten khong dich, nut co vong focus-visible", async () => {
		const MA_TRAN = ["dang-chay", "loi-thuong", "khong-thay", "da-bo"] as const;
		expect(MA_TRAN.length).toBe(4);
		const thucTe: Record<string, Json> = {};

		datLai();
		kho.rieng.set("okr.canhKr", () => new Promise<never>(() => {}));
		await dungNgan("k2");
		await cho(() => qs("[data-khung-xuong-kr]") !== null, "khung xuong");
		thucTe["dang-chay"] = {
			trangThai: trangThaiNgan(),
			ban: qs("[data-khung-xuong-kr]")?.getAttribute("aria-busy"),
		};
		await thaoHet();

		datLai();
		kho.rieng.set("okr.canhKr", () => {
			throw new LoiTrpc("INTERNAL_SERVER_ERROR", "may chu hong");
		});
		await dungNgan("k2");
		await cho(() => qs("[data-vung-tai-loi]") !== null, "vung tai loi");
		const docTruoc = docCua("okr.canhKr").length;
		const thuLai = qs<HTMLButtonElement>(
			'[data-vung-tai-loi] [data-slot="kara-retry"]',
		);
		if (!thuLai) throw new Error("thieu nut thu lai");
		await act(async () => {
			await nguoiDung().click(thuLai);
		});
		await nhip(5);
		thucTe["loi-thuong"] = {
			trangThai: trangThaiNgan(),
			tieuDe: qs('[data-vung-tai-loi] [data-slot="empty-title"]')?.textContent,
			goiLai: docCua("okr.canhKr").length - docTruoc,
		};
		await thaoHet();

		datLai();
		kho.rieng.set("okr.canhKr", () => {
			throw new LoiTrpc("NOT_FOUND", "khong co KR");
		});
		await dungNgan("k2");
		await cho(() => trangThaiNgan() === "ST-ngan-kr-khong-thay", "khong thay");
		thucTe["khong-thay"] = {
			trangThai: trangThaiNgan(),
			cau: qs("[data-than-ngan-kr]")?.textContent?.includes(mk.khongThay),
		};
		await thaoHet();

		const BIEN = [
			{
				ten: "muc-tieu-bo",
				doi: {
					status: "da-bo" as const,
					droppedAt: "2026-10-10T00:00:00.000Z",
				},
				ky: true,
			},
			{ ten: "ky-khep", doi: {}, ky: false },
		];
		const daBo: Record<string, Json> = {};
		for (const b of BIEN) {
			datLai();
			await dungNgan("k2", {
				mt: () =>
					chiTietTu(mucTieu(MT, BON_KR, { canEdit: true, ...b.doi }), {
						kyGhiDuoc: b.ky,
					}),
			});
			await cho(daDungXong, `ngan ${b.ten}`);
			daBo[b.ten] = {
				trangThai: trangThaiNgan(),
				capNhat: nutCapNhatDau() !== null,
				soMuc: thuTuMuc().length,
			};
			await thaoHet();
		}
		thucTe["da-bo"] = daBo;

		expect(Object.keys(thucTe)).toEqual([...MA_TRAN]);
		expect(thucTe).toEqual({
			"dang-chay": { trangThai: "ST-ngan-kr-dang-tai", ban: "true" },
			"loi-thuong": {
				trangThai: "ST-ngan-kr-loi",
				tieuDe: mk.loiTai,
				goiLai: 1,
			},
			"khong-thay": { trangThai: "ST-ngan-kr-khong-thay", cau: true },
			"da-bo": Object.fromEntries(
				BIEN.map((b) => [
					b.ten,
					{ trangThai: "ST-ngan-kr-chi-doc", capNhat: false, soMuc: 6 },
				]),
			),
		});

		const vi = okrCanhKrMessages("vi").khung;
		const en = okrCanhKrMessages("en").khung;
		const chu = KHOA_MOI.map((k) => ({
			k,
			coVi: k in vi,
			coEn: k in en,
			khac: vi[k] !== en[k],
		}));
		expect(chu.filter((c) => !c.coVi || !c.coEn || !c.khac)).toEqual([]);

		datLai();
		await dungNgan("k2");
		await cho(daDungXong, "ngan K2 xong");
		const khongDich = (o: Element | null) =>
			o?.closest('[translate="no"]') !== null && o !== null;
		const tenKr = [
			...document.querySelectorAll('[data-slot="sheet-content"] *'),
		].find(
			(o) => o.children.length === 0 && o.textContent === BON_KR[1]?.title,
		);
		const nguoi = [
			...document.querySelectorAll('[data-muc-ngan="chi-tiet"] *'),
		].find(
			(o) => o.children.length === 0 && o.textContent === BON_KR[1]?.owner.name,
		);
		expect({
			tenKr: khongDich(tenKr ?? null),
			mucTieu: khongDich(qs("[data-lien-ket-muc-tieu]")),
			nguoi: khongDich(nguoi ?? null),
			vong: [nutCo2(mk.krTruoc), nutCo2(mk.krKe), nutCapNhatDau()].map(
				(b) => b?.className.includes("focus-visible") ?? false,
			),
		}).toEqual({
			tenKr: true,
			mucTieu: true,
			nguoi: true,
			vong: [true, true, true],
		});
	});
});

const thatChong = await import("@/components/crm/record-sheet/record-stack");
const { useRecordStack: chongThat } = thatChong;

type RefMo = { kind: string; id: string };
type GoiMo = RefMo & { cach: "open" | "thayDinh" };

type GhiMo = { goi: GoiMo[] };

const moGhi: GhiMo = { goi: [] };

function useChongGhi() {
	const s = chongThat();
	const { open: moGoc, thayDinh: thayGoc } = s;
	const open = useCallback(
		(ref: Parameters<typeof moGoc>[0]) => {
			moGhi.goi.push({ cach: "open", kind: ref.kind, id: ref.id });
			moGoc(ref);
		},
		[moGoc],
	);
	const thayDinh = useCallback(
		(ref: Parameters<typeof thayGoc>[0]) => {
			moGhi.goi.push({ cach: "thayDinh", kind: ref.kind, id: ref.id });
			thayGoc(ref);
		},
		[thayGoc],
	);
	return { ...s, open, thayDinh };
}

mock.module("@/components/crm/record-sheet/record-stack", () => ({
	...thatChong,
	useRecordStack: useChongGhi,
	useOpenRecord: () => useChongGhi().open,
}));

const { BangKr } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { TheQuanh } = await import(
	"@/app/(app)/[slug]/okr/quanh-muc-tieu/the-quanh"
);
const { KhoiTomTat } = await import("@/app/(app)/[slug]/okr/khoi-tom-tat");
const { KhoiKrCuaToi } = await import("@/app/(app)/[slug]/okr/khoi-kr-cua-toi");
const { HopTuan } = await import("@/app/(app)/[slug]/okr/hop-tuan");

const M_LOI = () =>
	mucTieu(
		MT,
		BON_KR.map((k) => (k.id === "k2" ? { ...k, source: "crm" as const } : k)),
		{ canEdit: true },
	);

function krLoi() {
	const m = M_LOI();
	const k = m.keyResults[1];
	if (!k) throw new Error("thieu KR thu hai");
	return { m, k };
}

function dongKrTu(m: ReturnType<typeof M_LOI>, k: KrMau) {
	return {
		keyResultId: k.id,
		objectiveId: m.id,
		tieuDe: k.title,
		mucTieu: m.title,
		chuTen: k.owner.name,
		progress: k.progress,
		expected: m.expected,
		laMoc: k.kind === "moc",
		tuTin: "vua" as const,
	};
}

type OLoi = {
	o: string;
	dung: () => Promise<San>;
	bam: () => Element | null;
	tab: string | null;
};

const TAB_SO_NGUON_MONG = "so-nguon";
const TAB_DIEN_BIEN_CAM = "dien-bien";

const MA_TRAN_LOI: OLoi[] = [
	{
		o: "dong-kr-trang-don-vi",
		dung: () => dungTheoDonVi([M_LOI()], `?expand=${MT}`),
		bam: () => qs(`[data-kr="${krLoi().k.id}"]`)?.closest("tr") ?? null,
		tab: null,
	},
	{
		o: "nut-viec-bang-kr",
		dung: () => {
			const { m } = krLoi();
			return dung(
				<BangKr
					canh={
						new Map(
							m.keyResults.map((k) => [
								k.id,
								{
									xong: 1,
									tong: 2,
									sangKien: 0,
									coBangChung: false,
									suaDuoc: true,
								},
							]),
						)
					}
					danhDauCuaToi={false}
					expected={m.expected}
					keyResults={m.keyResults}
					kind={m.kind}
				/>,
			);
		},
		bam: () => qs(`[data-mo-khung-kr="${krLoi().k.id}"]`),
		tab: null,
	},
	{
		o: "con-so-bang-kr",
		dung: () => {
			const { m } = krLoi();
			return dung(
				<BangKr
					danhDauCuaToi={false}
					expected={m.expected}
					keyResults={m.keyResults}
					kind={m.kind}
				/>,
			);
		},
		bam: () => qs(`button[data-so-kr="${krLoi().k.id}"]`),
		tab: TAB_SO_NGUON_MONG,
	},
	{
		o: "the-so-do",
		dung: () => {
			const { m, k } = krLoi();
			const quanh = quanhMucTieuOutput.parse({
				tamId: m.id,
				laCongTy: false,
				nut: [
					{
						id: k.id,
						loai: "kr",
						phia: "tam",
						tieuDe: k.title,
						donVi: m.unitName,
						congTy: false,
						tienDo: k.progress,
						mucTieuId: m.id,
					},
				],
				canh: [],
				gopLenCongTy: [],
			});
			const nutKr = quanh.nut[0];
			if (!nutKr) throw new Error("thieu nut KR");
			return dung(<TheQuanh bien="dong" laTam={false} nut={nutKr} />);
		},
		bam: () => qs(`[data-quanh-the="${krLoi().k.id}"]`),
		tab: null,
	},
	{
		o: "tong-quan",
		dung: async () => {
			const { m, k } = krLoi();
			kho.rieng.set("okr.troLyTomTat", () =>
				troLyTomTatOutput.parse({
					ban: {
						id: "tt-loi",
						tuan: "2026-10-12",
						soLanCapNhat: 1,
						cau: [
							{
								vanBan: "Một KR đáng bàn.",
								nguon: [
									{
										id: "ci-loi",
										keyResultId: k.id,
										krTen: k.title,
										mucTieuId: m.id,
										mucTieuTen: m.title,
										ngay: "2026-10-12",
										giaTri: k.currentValue,
										donVi: k.unit,
										tuTin: "vua",
										ghiChu: "",
									},
								],
							},
						],
						phanHoiCuaToi: null,
					},
					dangSoan: false,
					chuaCapNhat: false,
				}),
			);
			const san = await dung(
				<KhoiTomTat cycleId="q4" departmentId={m.unitId ?? "pb-1"} />,
			);
			await cho(() => qs('button[data-trich-dan="1"]') !== null, "trich dan");
			const trich = qs<HTMLButtonElement>('button[data-trich-dan="1"]');
			await act(async () => trich?.click());
			await cho(() => qs("[data-xem-dien-bien]") !== null, "the nguon mo");
			return san;
		},
		bam: () => qs(`[data-xem-dien-bien="${krLoi().k.id}"]`),
		tab: null,
	},
	{
		o: "cua-toi",
		dung: () => {
			const { m, k } = krLoi();
			kho.rieng.set("okr.khoiCuaToi", () =>
				khoiCuaToiOutput.parse({
					kr: [{ ...dongKrTu(m, k), nhip: "dung-nhip" }],
					tong: 1,
				}),
			);
			return dung(<KhoiKrCuaToi cycleId="q4" />);
		},
		bam: () => qs(`[data-kr-cua-toi] [data-mo-kr="${krLoi().k.id}"]`),
		tab: null,
	},
	{
		o: "hop-tuan",
		dung: () => {
			const { m, k } = krLoi();
			kho.rieng.set("okr.hopTuan", () =>
				hopTuanOutput.parse({
					tuan: "2026-10-12",
					tuanDau: false,
					daCapNhat: 1,
					tongKr: m.keyResults.length,
					dangBan: [
						{
							...dongKrTu(m, k),
							ghiChu: null,
							lyDo: [{ loai: "ghi-chu", ngay: "2026-10-12" }],
						},
					],
					conLai: [],
				}),
			);
			return dung(<HopTuan cycleId="q4" unit={{ loai: "bp", id: "bp-1" }} />);
		},
		bam: () => qs(`[data-kr-hop] [data-mo-kr="${krLoi().k.id}"]`),
		tab: null,
	},
];

describe("vk7-moi-loi", () => {
	test("vk7-moi-loi: ma tran bay loi viet truoc — moi loi goi dung mot lan mo {kind: kr, id: K}, khong so-kr, khong tab dien-bien; loi con so mang tab so-nguon", async () => {
		expect(MA_TRAN_LOI.length).toBe(7);
		const thucTe: Record<string, Json> = {};
		for (const o of MA_TRAN_LOI) {
			datLai();
			const { k } = krLoi();
			const san = await o.dung();
			await cho(() => o.bam() !== null, `loi ${o.o} dung`);
			const dich = o.bam();
			if (!dich) throw new Error(`thieu cho bam: ${o.o}`);
			moGhi.goi = [];
			await act(async () => {
				await nguoiDung().click(dich);
			});
			await nhip(3);
			const goi = [...moGhi.goi];
			for (const g of goi)
				if (g.kind !== "kr") throw new Error(`loi lech: ${o.o} -> ${g.kind}`);
			const tab = san.url().get(SEARCH_PARAM.record.tab);
			if (tab === TAB_DIEN_BIEN_CAM)
				throw new Error(`loi lech: ${o.o} -> ${TAB_DIEN_BIEN_CAM}`);
			thucTe[o.o] = {
				goi: goi.map((g) => ({ kind: g.kind, id: g.id })),
				record: san.url().get(SEARCH_PARAM.record.stack),
				tab,
			};
			expect(thucTe[o.o]).toEqual({
				goi: [{ kind: "kr", id: k.id }],
				record: `kr:${k.id}`,
				tab: o.tab,
			});
			await thaoHet();
		}
		expect(Object.keys(thucTe)).toEqual(MA_TRAN_LOI.map((o) => o.o));
	});
});
