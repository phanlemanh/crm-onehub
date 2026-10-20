import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { homNayVN } from "@crm/validation/ngay-vn";
import { type KieuKr, tienDoKr } from "@crm/validation/okr-kr";
import { useQuery } from "@tanstack/react-query";
import { act } from "react";
import type { CapNhatKr } from "@/app/(app)/[slug]/okr/cap-nhat-kr";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import { dienBienOutput } from "../../api/src/okr/okr-xem.contracts";
import {
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	goiCua,
	type KetQuaGhi,
	kho,
	kr,
	mucTieu,
	nguoiDung,
	nhip,
	nut,
	qs,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { useCapNhatKr } = await import("@/app/(app)/[slug]/okr/cap-nhat-kr");
const { useTRPC } = await import("@/lib/trpc/client");
const { okrMessages } = await import("@/lib/messages/okr");
const { congNgay } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan"
);
const { hienSo } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");

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
