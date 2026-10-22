import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { GHI_CHU_TOI_DA, guiCapNhatInput } from "@crm/validation/okr-cap-nhat";
import { useQuery } from "@tanstack/react-query";
import { act } from "react";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import { dienBienOutput } from "../../api/src/okr/okr-xem.contracts";
import {
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nguoiDung,
	nhip,
	nut,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { useCapNhatKr } = await import("@/app/(app)/[slug]/okr/cap-nhat-kr");
const { krCapNhatTuSheet } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr"
);
const { BangCapNhat, OGiaTri } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan"
);
const { giaTri } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { useTRPC } = await import("@/lib/trpc/client");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrLanTruocMessages } = await import("@/lib/messages/okr-lan-truoc");
const { NGHIA_TU_TIN } = await import("@crm/ui/components/okr-status");
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");

const mo = okrMessages("vi");
const ml = okrLanTruocMessages("vi");

const MT = "mt-hct";
const LUC = "2026-10-15T02:30:00.000Z";
const TUAN = "2026-10-12";
const GHI_CHU = "Chốt xong 2 hợp đồng, chờ pháp chế <A&B> 🚀";

type MucTuTin = "cao" | "vua" | "thap";
type Ca = {
	ten: string;
	kind: "tang-toi" | "phan-tram" | "moc";
	unit: string;
	dich: number;
	hienTai: number;
	so: number | string;
	tuTin: MucTuTin;
	ghiChu: string | null;
};

type Tay = {
	mo: ReturnType<typeof useCapNhatKr>["mo"] | null;
	mt: ObjectiveOutput | null;
};
const tay: Tay = { mo: null, mt: null };

function ThuHook({
	keyResultId,
	docDienBien,
}: {
	keyResultId: string;
	docDienBien: boolean;
}) {
	const trpc = useTRPC();
	const q = useQuery(trpc.okr.objective.queryOptions({ id: MT }));
	useQuery({
		...trpc.okr.dienBien.queryOptions({ keyResultId }),
		enabled: docDienBien,
	});
	const capNhat = useCapNhatKr();
	tay.mo = capNhat.mo;
	tay.mt = q.data ?? null;
	return capNhat.hop;
}

function vet(
	id: string,
	keyResultId: string,
	at: string,
	so: number | string,
	tuTin: MucTuTin,
) {
	return {
		id,
		at,
		actor: null,
		action: "cap-nhat-tuan",
		keyResultId,
		before: { currentValue: 0 },
		after: { currentValue: so, confidence: tuTin, onBehalf: false },
		note: null,
	};
}

function dienBien(
	ca: Pick<Ca, "kind" | "dich" | "unit">,
	diem: {
		tuan: string;
		giaTri: number | null;
		tuTin: MucTuTin | null;
		ghiChu: string | null;
	}[],
) {
	return dienBienOutput.parse({
		kieu: ca.kind,
		tieuDe: "KR",
		khoi: 0,
		dich: ca.dich,
		donVi: ca.unit,
		coCapNhat: diem.length > 0,
		tuanDau: diem[0]?.tuan ?? null,
		diem: diem.map((d) => ({ ...d, kyVong: null })),
	});
}

function mtCua(
	id: string,
	ca: Pick<Ca, "kind" | "unit" | "dich" | "hienTai">,
	trail: ReturnType<typeof vet>[],
) {
	return chiTietTu(
		mucTieu(
			MT,
			[
				kr(id, MT, {
					kind: ca.kind,
					unit: ca.unit,
					startValue: 0,
					targetValue: ca.dich,
					currentValue: ca.hienTai,
					hienTaiQuaCapNhat: true,
					laCuaToi: true,
				}),
			],
			{ canEdit: true },
		),
		{ trail } as Partial<ObjectiveOutput>,
	);
}

const hop = () => qs("[data-hop-cap-nhat-kr]");
const khoi = () => qs("[data-lan-truoc]");

async function moHop(
	mt: ObjectiveOutput,
	locale: "vi" | "en" = "vi",
	docDienBien = true,
) {
	kho.chiTiet = () => mt;
	const k = mt.keyResults[0];
	if (!k) throw new Error("thieu KR");
	await dung(
		<ThuHook docDienBien={docDienBien} keyResultId={k.id} />,
		"",
		locale,
	);
	await cho(() => tay.mt !== null, "doc muc tieu");
	await act(async () => {
		if (tay.mt) tay.mo?.(tay.mt, k);
	});
	await cho(() => hop() !== null, "hop cap nhat");
	return k;
}

beforeEach(() => {
	datLai();
	tay.mo = null;
	tay.mt = null;
});
afterEach(thaoHet);

const MA_TRAN: Ca[] = [
	{
		ten: "tang-toi",
		kind: "tang-toi",
		unit: "khách",
		dich: 5000,
		hienTai: 1234.5,
		so: 1234.5,
		tuTin: "vua",
		ghiChu: GHI_CHU,
	},
	{
		ten: "phan-tram",
		kind: "phan-tram",
		unit: "%",
		dich: 100,
		hienTai: 45,
		so: 45,
		tuTin: "cao",
		ghiChu: "Đạt nửa chặng",
	},
	{
		ten: "moc",
		kind: "moc",
		unit: "",
		dich: 1,
		hienTai: 1,
		so: 1,
		tuTin: "thap",
		ghiChu: "Đã ký",
	},
	{
		ten: "so-may",
		kind: "tang-toi",
		unit: "khách",
		dich: 100,
		hienTai: 70,
		so: 55,
		tuTin: "vua",
		ghiChu: "Theo số CRM",
	},
];

describe("hct-khoi", () => {
	test("hct-khoi: ma tran bon o viet truoc — khoi dau hop co ngay gio VN, so dung kieu, muc tu tin, ghi chu nguyen van khong dich; o so goi Hien tai", async () => {
		const loi: string[] = [];
		const daChay: string[] = [];
		for (const ca of MA_TRAN) {
			datLai();
			const id = `k-${ca.ten}`;
			kho.rieng.set("okr.dienBien", () =>
				dienBien(ca, [
					{
						tuan: TUAN,
						giaTri: ca.kind === "moc" ? null : Number(ca.so),
						tuTin: ca.tuTin,
						ghiChu: ca.ghiChu,
					},
				]),
			);
			const k = await moHop(
				mtCua(id, ca, [vet("v1", id, LUC, ca.so, ca.tuTin)]),
			);
			await cho(
				() =>
					qs("[data-ghi-chu-truoc]") !== null ||
					qs("[data-ghi-chu-truoc-loi]") !== null,
				`ghi chu ${ca.ten}`,
			);
			const h = hop();
			const b = khoi();
			if (!h || !b) {
				loi.push(`hct-khoi: thieu khoi (${ca.ten})`);
			} else {
				const oSo = qs('[data-o="gia-tri"]', h);
				if (
					!oSo ||
					!(b.compareDocumentPosition(oSo) & Node.DOCUMENT_POSITION_FOLLOWING)
				)
					loi.push(`hct-khoi: khoi khong dung truoc o gia tri (${ca.ten})`);
				const tieuDe =
					b.querySelector('[data-slot="item-title"]')?.textContent ?? "";
				const gio = tieuDe.match(/\d{2}:\d{2}/)?.[0] ?? "";
				if (!tieuDe.includes("15/10, 09:30"))
					loi.push(`hct-khoi: ngay gio lech (${gio}, can 09:30)`);
				const so = qs("[data-lan-truoc-so]", b)?.textContent ?? null;
				const soMong = giaTri(k, Number(ca.so), "vi");
				if (so !== soMong)
					loi.push(`hct-khoi: so lech (${ca.ten}: ${so}, can ${soMong})`);
				const st = qs('[data-slot="status-indicator"]', b);
				if (
					st?.getAttribute("data-tone") !==
						toneTheoNghia(NGHIA_TU_TIN[ca.tuTin]) ||
					st.textContent?.trim() !== mo.capNhat.mucTuTin[ca.tuTin]
				)
					loi.push(`hct-khoi: muc tu tin lech (${ca.ten})`);
				const gc = qs("[data-ghi-chu-truoc]", b);
				if (gc?.textContent !== ca.ghiChu || !gc?.closest('[translate="no"]'))
					loi.push(`hct-khoi: thieu ghi chu lan truoc (${ca.ten})`);
				if (ca.ten === "so-may") {
					const moTa =
						qs('[data-o="gia-tri"] [data-slot="field-description"]', h)
							?.textContent ?? "";
					if (!moTa.includes(mo.capNhat.hienTai) || !moTa.includes("70 khách"))
						loi.push(`hct-khoi: o so khong goi Hien tai (${moTa})`);
					if (h.textContent?.includes(`${mo.capNhat.lanTruoc["lan-truoc"]} 70`))
						loi.push("hct-khoi: hai so cung nhan lan truoc (55, 70)");
				}
			}
			daChay.push(ca.ten);
			await thaoHet();
		}

		datLai();
		const mtDoi = mtCua("k-doi", MA_TRAN[3] as Ca, []);
		const krDoi = krCapNhatTuSheet(
			mtDoi,
			mtDoi.keyResults[0] as ObjectiveOutput["keyResults"][number],
		);
		await dung(
			<OGiaTri
				datGiaTri={() => {}}
				khoa={false}
				kr={krDoi}
				lan="lan-truoc"
				loi={null}
				so={70}
				value="70"
			/>,
		);
		const doiChung =
			document.body.textContent?.includes(
				`${mo.capNhat.lanTruoc["lan-truoc"]} 70`,
			) ?? false;

		expect({ loi, daChay, doiChung }).toEqual({
			loi: [],
			daChay: MA_TRAN.map((c) => c.ten),
			doiChung: true,
		});
	});
});

describe("hct-rong", () => {
	test("hct-rong: chua co lan nao thi khong khoi; lan truoc khong ghi chu thi khong dong ghi chu; so hong thi khong o so", async () => {
		const ca = MA_TRAN[0] as Ca;
		const loi: string[] = [];

		kho.rieng.set("okr.dienBien", () => dienBien(ca, []));
		const kA = await moHop(mtCua("k-a", ca, []));
		await nhip(3);
		const a = {
			khoi: qsa("[data-lan-truoc]").length,
			chu: hop()?.textContent?.includes(ml.tieuDe) ?? true,
			tieuDiem: document.activeElement?.id === `${kA.id}-gia-tri`,
		};
		if (a.khoi !== 0 || a.chu)
			loi.push("hct-rong: co khoi khi chua co lan nao");
		await thaoHet();

		datLai();
		kho.rieng.set("okr.dienBien", () =>
			dienBien(ca, [{ tuan: TUAN, giaTri: 50, tuTin: "vua", ghiChu: null }]),
		);
		await moHop(mtCua("k-b", ca, [vet("v1", "k-b", LUC, 50, "vua")]));
		await cho(
			() => qs("[data-ghi-chu-truoc-cho]") === null && khoi() !== null,
			"khoi b tai xong",
		);
		const b = {
			khoi: qsa("[data-lan-truoc]").length,
			so: qs("[data-lan-truoc-so]") !== null,
			ghiChu: qsa("[data-ghi-chu-truoc]").length,
		};
		if (b.ghiChu !== 0)
			loi.push("hct-rong: co dong ghi chu khi lan truoc khong ghi chu");
		await thaoHet();

		datLai();
		kho.rieng.set("okr.dienBien", () =>
			dienBien(ca, [{ tuan: TUAN, giaTri: 50, tuTin: "vua", ghiChu: "Co" }]),
		);
		await moHop(mtCua("k-c", ca, [vet("v1", "k-c", LUC, 50, "vua")]));
		await cho(() => qs("[data-ghi-chu-truoc]") !== null, "doi chung c");
		const c = { ghiChu: qsa("[data-ghi-chu-truoc]").length };
		await thaoHet();

		datLai();
		kho.rieng.set("okr.dienBien", () => dienBien(ca, []));
		await moHop(mtCua("k-d", ca, [vet("v1", "k-d", LUC, "abc", "vua")]));
		await cho(() => khoi() !== null, "khoi d");
		const d = {
			khoi: qsa("[data-lan-truoc]").length,
			so: qs("[data-lan-truoc-so]") !== null,
			ngay: khoi()?.textContent?.includes("15/10, 09:30") ?? false,
		};

		expect({ loi, a, b, c, d }).toEqual({
			loi: [],
			a: { khoi: 0, chu: false, tieuDiem: true },
			b: { khoi: 1, so: true, ghiChu: 0 },
			c: { ghiChu: 1 },
			d: { khoi: 1, so: false, ngay: true },
		});
	});
});

describe("hct-tai", () => {
	test("hct-tai: dang tai van co ngay so tu tin va gui duoc; loi co cau va nut Thu lai, bam thi tai lai va hien ghi chu", async () => {
		const ca = MA_TRAN[0] as Ca;
		const loi: string[] = [];
		const u = nguoiDung();

		kho.rieng.set("okr.dienBien", () => new Promise<object>(() => {}));
		await moHop(mtCua("k-cho", ca, [vet("v1", "k-cho", LUC, 1234.5, "vua")]));
		await cho(() => khoi() !== null, "khoi dang tai");
		const b = khoi();
		const coDu =
			(b?.textContent?.includes("15/10, 09:30") ?? false) &&
			qs("[data-lan-truoc-so]", b ?? document.body) !== null &&
			qs('[data-slot="status-indicator"]', b ?? document.body) !== null;
		if (!coDu) loi.push("hct-tai: thieu ngay so tu tin khi dang tai ghi chu");
		const cho1 = qs("[data-ghi-chu-truoc-cho]") !== null;
		await act(async () => {
			await u.click(nut(mo.capNhat.mucTuTin.cao, hop() ?? document.body));
		});
		await cho(
			() =>
				qs<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]')?.disabled ===
				false,
			"gui duoc khi dang tai",
		);
		await thaoHet();

		datLai();
		let lan = 0;
		kho.rieng.set("okr.dienBien", () => {
			lan += 1;
			if (lan === 1) throw new LoiTrpc("INTERNAL_SERVER_ERROR", "hong");
			return dienBien(ca, [
				{ tuan: TUAN, giaTri: 1234.5, tuTin: "vua", ghiChu: "Lan hai" },
			]);
		});
		await moHop(
			mtCua("k-loi", ca, [vet("v1", "k-loi", LUC, 1234.5, "vua")]),
			"vi",
			false,
		);
		await cho(() => qs("[data-ghi-chu-truoc-loi]") !== null, "loi ghi chu");
		const cauLoi = khoi()?.textContent?.includes(ml.loiGhiChu) ?? false;
		const coNut = (khoi()?.querySelectorAll("button") ?? []).length > 0;
		if (!coNut) loi.push("hct-tai: thieu nut thu lai khi loi");
		await act(async () => {
			await u.click(nut(mo.capNhat.mucTuTin.cao, hop() ?? document.body));
		});
		const guiDuoc =
			qs<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]')?.disabled === false;
		const docTruoc = docCua("okr.dienBien").length;
		if (coNut)
			await act(async () => {
				await u.click(nut(ml.thuLai, khoi() ?? document.body));
			});
		await cho(
			() => qs("[data-ghi-chu-truoc]") !== null || !coNut,
			"ghi chu sau thu lai",
		);
		const sau = {
			docThem: docCua("okr.dienBien").length - docTruoc,
			ghiChu: qs("[data-ghi-chu-truoc]")?.textContent ?? null,
		};

		expect({ loi, cho1, cauLoi, guiDuoc, sau }).toEqual({
			loi: [],
			cho1: true,
			cauLoi: true,
			guiDuoc: true,
			sau: { docThem: 1, ghiChu: "Lan hai" },
		});
	});
});

describe("hct-goi-y", () => {
	test("hct-goi-y: hop co ba cau goi y duoi o ghi chu (vi, en), o mot dong 200 ky tu; trang Cap nhat tuan khong co", async () => {
		const ca = MA_TRAN[0] as Ca;
		const loi: string[] = [];
		const docGoiY = () =>
			[
				...(qs('[data-o="ghi-chu"] [data-goi-y-ghi-chu]')?.querySelectorAll(
					"[data-cau-goi-y]",
				) ?? []),
			].map((c) => c.textContent);

		kho.rieng.set("okr.dienBien", () => dienBien(ca, []));
		await moHop(mtCua("k-g", ca, []));
		const vi = docGoiY();
		if (vi.length === 0) loi.push("hct-goi-y: thieu cau hoi goi y trong hop");
		const o = qs<HTMLInputElement>('[data-o="ghi-chu"] input');
		const oGhiChu = { the: o?.tagName ?? null, toiDa: o?.maxLength ?? null };
		await thaoHet();

		datLai();
		kho.rieng.set("okr.dienBien", () => dienBien(ca, []));
		await moHop(mtCua("k-g-en", ca, []), "en");
		const en = docGoiY();
		await thaoHet();

		datLai();
		const mt = mtCua("k-tuan", ca, []);
		const k = mt.keyResults[0] as ObjectiveOutput["keyResults"][number];
		await dung(
			<BangCapNhat
				duLieu={{
					items: [krCapNhatTuSheet(mt, k)],
					weekStart: TUAN,
					dueWeekday: 5,
				}}
				sessionId="phien-tuan"
			/>,
		);
		const trang = {
			oGhiChu: qsa('[data-o="ghi-chu"]').length,
			goiY: qsa("[data-goi-y-ghi-chu]").length,
		};
		if (trang.goiY !== 0)
			loi.push("hct-goi-y: trang Cap nhat tuan co cau goi y");

		const enMong = okrLanTruocMessages("en").goiY;
		expect({
			loi,
			vi,
			en,
			enKhacVi: en.every((c, i) => c !== vi[i] && (c ?? "").length > 0),
			oGhiChu,
			trang,
		}).toEqual({
			loi: [],
			vi: [...ml.goiY],
			en: [...enMong],
			enKhacVi: true,
			oGhiChu: { the: "INPUT", toiDa: GHI_CHU_TOI_DA },
			trang: { oGhiChu: 1, goiY: 0 },
		});
	});
});

describe("hct-sau-gui", () => {
	test("hct-sau-gui: gui xong may lam moi dien bien va muc tieu; mo lai hop thi khoi la lan vua gui", async () => {
		const ca = MA_TRAN[0] as Ca;
		const id = "k-sg";
		const lucCu = "2026-10-20T02:00:00.000Z";
		const lucMoi = "2026-10-21T03:00:00.000Z";
		const tuanNay = "2026-10-19";
		let daGui = false;
		const mtCu = mtCua(id, { ...ca, hienTai: 40 }, [
			vet("v1", id, lucCu, 40, "cao"),
		]);
		const mtMoi = mtCua(id, { ...ca, hienTai: 60 }, [
			vet("v1", id, lucCu, 40, "cao"),
			vet("v2", id, lucMoi, 60, "thap"),
		]);
		kho.rieng.set("okr.dienBien", () =>
			dienBien(ca, [
				daGui
					? { tuan: tuanNay, giaTri: 60, tuTin: "thap", ghiChu: "Moi" }
					: { tuan: tuanNay, giaTri: 40, tuTin: "cao", ghiChu: "A" },
			]),
		);
		kho.ghiRieng.set("okr.guiCapNhat", async (vao) => {
			guiCapNhatInput.parse(vao);
			daGui = true;
			kho.chiTiet = () => mtMoi;
			return { id: "ok", canhBao: null };
		});
		const k = await moHop(mtCu);
		await cho(
			() => qs("[data-ghi-chu-truoc]")?.textContent === "A",
			"ghi chu cu",
		);
		const u = nguoiDung();
		const o = qs<HTMLInputElement>(`[id="${id}-gia-tri"]`);
		if (!o) throw new Error("thieu o gia tri");
		await act(async () => {
			await u.clear(o);
			await u.type(o, "60");
			await u.click(nut(mo.capNhat.mucTuTin.thap, hop() ?? document.body));
			const g = qs<HTMLInputElement>(`[id="${id}-ghi-chu"]`);
			if (g) await u.type(g, "Moi");
		});
		const docTruoc = {
			dienBien: docCua("okr.dienBien").length,
			mucTieu: docCua("okr.objective").length,
		};
		await cho(
			() =>
				qs<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]')?.disabled ===
				false,
			"nut gui",
		);
		await act(async () => {
			await u.click(qs('[data-nut="gui-cap-nhat-kr"]') ?? document.body);
		});
		await cho(() => hop() === null, "hop dong");
		await cho(() => tay.mt?.trail.length === 2, "muc tieu moi");
		const lamMoi = {
			dienBien: docCua("okr.dienBien").length > docTruoc.dienBien,
			mucTieu: docCua("okr.objective").length > docTruoc.mucTieu,
		};
		await act(async () => {
			if (tay.mt) tay.mo?.(tay.mt, k);
		});
		await cho(
			() => khoi() !== null && qs("[data-ghi-chu-truoc]") !== null,
			"khoi sau gui",
		);
		const thay = qs("[data-ghi-chu-truoc]")?.textContent ?? null;
		const loi =
			thay === "Moi" ? [] : [`hct-sau-gui: ghi chu cu sau khi gui (${thay})`];
		expect({
			loi,
			lamMoi,
			so: qs("[data-lan-truoc-so]")?.textContent ?? null,
			tuTin:
				qs(
					'[data-lan-truoc] [data-slot="status-indicator"]',
				)?.textContent?.trim() ?? null,
		}).toEqual({
			loi: [],
			lamMoi: { dienBien: true, mucTieu: true },
			so: giaTri(k, 60, "vi"),
			tuTin: mo.capNhat.mucTuTin.thap,
		});
	});
});
