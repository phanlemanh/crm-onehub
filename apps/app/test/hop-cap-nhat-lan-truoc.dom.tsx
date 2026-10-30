import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homNayVN } from "@crm/validation/ngay-vn";
import {
	GHI_CHU_TOI_DA,
	type GuiCapNhatInput,
	guiCapNhatInput,
} from "@crm/validation/okr-cap-nhat";
import { useQueryClient } from "@tanstack/react-query";
import { act } from "react";
import { chuoiMoiLan } from "../../api/src/okr/dien-bien";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	dienBienOutput,
	lichSuKrOutput,
} from "../../api/src/okr/okr-xem.contracts";
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
	ui,
} from "./khung-gop-y-dung-cho";

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/bo-okr",
	useSearchParams: () => new URLSearchParams(),
}));
const NGUON_CACHE = readFileSync(
	join(import.meta.dir, "..", "lib", "trpc", "cache.ts"),
	"utf8",
);
const KHOA_CACHE_OKR = new Set(
	[...NGUON_CACHE.matchAll(/trpc\.okr\.([A-Za-z]+)\.queryKey\(\)/g)].map(
		(m) => `okr.${m[1]}`,
	),
);
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return {
			okr: async (id?: string) => {
				kho.daLamMoi.push(id ?? "");
				await qc.invalidateQueries({
					predicate: (q) => KHOA_CACHE_OKR.has(String(q.queryKey[0])),
				});
			},
		};
	},
}));
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
const { krCapNhatTuSheet, mucDoi } = await import(
	"@/components/crm/record-sheet/khoi-cap-nhat-kr"
);
const { BangCapNhat, OGiaTri } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan"
);
const { giaTri } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { luc } = await import("@/app/(app)/[slug]/okr/bang-vet");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrLanTruocMessages } = await import("@/lib/messages/okr-lan-truoc");
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { NGHIA_TU_TIN } = await import("@crm/ui/components/okr-status");
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");

const mo = okrMessages("vi");
const ml = okrLanTruocMessages("vi");
const mk = okrCanhKrMessages("vi");
const loiLichSu = okrToanCanhMessages("vi").dienBien.loi;

const MT = "mt-hct";
const LUC = "2026-10-15T02:30:00.000Z";
const TUAN = "2026-10-12";
const NGAY_GIO = luc(LUC, "vi");
const GHI_CHU = "Chốt xong 2 hợp đồng, chờ pháp chế <A&B> 🚀";
const BAY_GIO = new Date("2026-10-22T03:00:00.000Z");
const TUAN_KY = ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"];

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
	go: string;
	soGo: number;
};

const NHAN_TU_TIN = {
	cao: ui.okr.tuTinCao,
	vua: ui.okr.tuTinVua,
	thap: ui.okr.tuTinThap,
} satisfies Record<MucTuTin, string>;

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

type Lan = {
	id: string;
	luc: string;
	tuan: string;
	giaTri: number | null;
	tuTin: MucTuTin;
	ghiChu: string | null;
};

function lichSu(ca: Pick<Ca, "kind" | "dich" | "unit">, lan: Lan[]) {
	const laMoc = ca.kind === "moc";
	return lichSuKrOutput.parse({
		kieu: ca.kind,
		tieuDe: "KR",
		dich: ca.dich,
		donVi: ca.unit,
		coCapNhat: lan.length > 0,
		lan: lan.map((l) => ({
			checkInId: l.id,
			luc: l.luc,
			ngay: homNayVN(new Date(l.luc)),
			tuan: l.tuan,
			giaTri: laMoc ? null : l.giaTri,
			tuTin: l.tuTin,
			ghiChu: l.ghiChu,
			camXuc: [],
		})),
		chuoi: chuoiMoiLan(
			{
				id: "kr",
				thuTu: 0,
				khoaLuc: null,
				kieu: ca.kind,
				khoi: 0,
				dich: ca.dich,
				lan: lan.map((l) => ({
					id: l.id,
					tuan: l.tuan,
					luc: new Date(l.luc),
					tuTin: l.tuTin,
					ghiChu: l.ghiChu ?? "",
					giaTri: l.giaTri ?? 0,
				})),
			},
			TUAN_KY,
			new Date(),
			() => null,
		),
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

function datKhoNgan(): void {
	kho.rieng.set("okr.canhKr", (vao) => {
		const k = kho
			.chiTiet()
			.keyResults.find((x) => x.id === String(vao?.keyResultId ?? ""));
		if (!k) throw new LoiTrpc("NOT_FOUND", "khong co KR");
		return canhKrOutput.parse({
			kr: {
				id: k.id,
				title: k.title,
				kind: k.kind,
				objectiveId: MT,
				ownerName: k.owner.name,
				xong: false,
			},
			dong: [],
			bangChung: [],
			quyen: { suaDuoc: true, ganDuoc: false },
			khoa: false,
			choDuyet: false,
		});
	});
	kho.rieng.set("okr.dienBien", () =>
		dienBienOutput.parse({
			kieu: "tang-toi",
			tieuDe: "KR",
			khoi: 0,
			dich: 100,
			donVi: "khách",
			coCapNhat: false,
			tuanDau: null,
			diem: [],
		}),
	);
}

const roCu = globalThis.ResizeObserver;
const rectCu = HTMLElement.prototype.getBoundingClientRect;
class QuanSatCoCo {
	constructor(private cb: ResizeObserverCallback) {}
	observe(el: Element) {
		this.cb(
			[
				{
					target: el,
					contentRect: { width: 640, height: 160 } as DOMRectReadOnly,
				} as ResizeObserverEntry,
			],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}
function coKhungDoThi(): void {
	globalThis.ResizeObserver = QuanSatCoCo as unknown as typeof ResizeObserver;
	HTMLElement.prototype.getBoundingClientRect = () =>
		({
			width: 640,
			height: 160,
			top: 0,
			left: 0,
			right: 640,
			bottom: 160,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		}) as DOMRect;
}

const KHOI = "[data-khoi-cap-nhat-kr]";
const LICH_SU = '[data-muc-ngan="lich-su"]';
const DONG = "[data-lich-su-kr] [data-lan-cap-nhat]";
const khoiCapNhat = () => qs(KHOI);
const trangThaiKhoi = () =>
	khoiCapNhat()?.getAttribute("data-khoi-cap-nhat-kr");
const dongDau = () => qs(DONG);
const ghiChuDau = () =>
	qs(
		'[data-slot="item-description"]',
		dongDau() ?? document.createElement("i"),
	);
const soDau = () =>
	qs("[data-gia-tri-lan]", dongDau() ?? document.createElement("i"));
const mucDoiKhoi = () =>
	qs(`${KHOI} [data-xem-truoc-cap-nhat]`)?.textContent ?? null;
const ngan = () => qs("[data-kr-sheet]");

async function moKhoi(
	mt: ObjectiveOutput,
	locale: "vi" | "en" = "vi",
	choKhoi = true,
) {
	kho.chiTiet = () => mt;
	const k = mt.keyResults[0];
	if (!k) throw new Error("thieu KR");
	await dung(
		<RecordSheetHost />,
		`?record=objective:${MT},kr:${k.id}&tab=cap-nhat`,
		locale,
	);
	await cho(() => qs(`[data-kr-sheet="${k.id}"]`) !== null, "ngan KR");
	if (choKhoi) await cho(() => trangThaiKhoi() === "mo", "khoi cap nhat");
	return k;
}

async function goGiaTri(id: string, chu: string): Promise<void> {
	const o = qs<HTMLInputElement>(`[id="${id}-gia-tri"]`);
	if (!o) throw new Error("thieu o gia tri");
	const u = nguoiDung();
	await act(async () => {
		await u.clear(o);
		await u.type(o, chu);
	});
	await nhip(2);
}

beforeEach(() => {
	datLai();
	datKhoNgan();
	setSystemTime(BAY_GIO);
	coKhungDoThi();
});
afterEach(async () => {
	await thaoHet();
	setSystemTime();
	globalThis.ResizeObserver = roCu;
	HTMLElement.prototype.getBoundingClientRect = rectCu;
});

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
		go: "1300",
		soGo: 1300,
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
		go: "50",
		soGo: 50,
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
		go: mo.moc.chuaXong,
		soGo: 0,
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
		go: "60",
		soGo: 60,
	},
];

function lanMot(ca: Ca, doi: Partial<Lan> = {}): Lan {
	return {
		id: "c1",
		luc: LUC,
		tuan: TUAN,
		giaTri: Number(ca.so),
		tuTin: ca.tuTin,
		ghiChu: ca.ghiChu,
		...doi,
	};
}

function soLanTruocLech(ca: Ca, so: string | null, soMong: string): boolean {
	return ca.kind !== "moc" && so !== soMong;
}

describe("hct-khoi", () => {
	test("hct-khoi: ma tran bon o viet truoc — dong dau Lich su co ngay gio VN, so dung kieu, muc tu tin, ghi chu nguyen van khong dich; muc doi tinh tu lan truoc; o so goi Hien tai", async () => {
		const loi: string[] = [];
		const daChay: string[] = [];
		for (const ca of MA_TRAN) {
			datLai();
			datKhoNgan();
			const id = `k-${ca.ten}`;
			kho.rieng.set("okr.lichSuKr", () => lichSu(ca, [lanMot(ca)]));
			const mt = mtCua(id, ca, [vet("v1", id, LUC, ca.so, ca.tuTin)]);
			const k = await moKhoi(mt);
			await cho(
				() => docCua("okr.lichSuKr").length > 0,
				`doc lich su ${ca.ten}`,
			);
			await nhip(3);
			const h = khoiCapNhat();
			const b = dongDau();
			if (!h || !b) {
				loi.push(`hct-khoi: thieu khoi (${ca.ten})`);
			} else {
				if (!(h.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING))
					loi.push(
						`hct-khoi: dong dau Lich su khong dung sau khoi cap nhat (${ca.ten})`,
					);
				const tieuDe =
					b.querySelector('[data-slot="item-title"]')?.textContent ?? "";
				const gio = tieuDe.match(/\d{2}:\d{2}/)?.[0] ?? "";
				if (!tieuDe.includes(NGAY_GIO))
					loi.push(`hct-khoi: ngay gio lech (${gio}, can 09:30)`);
				if (!(qs(LICH_SU)?.textContent ?? "").includes(mk.khung.lichSu))
					loi.push(`hct-khoi: hop thieu tieu de khoi (${ca.ten})`);
				const so = soDau()?.textContent ?? null;
				const soMong = giaTri(k, Number(ca.so), "vi");
				if (soLanTruocLech(ca, so, soMong))
					loi.push(`hct-khoi: so lech (${ca.ten}: ${so}, can ${soMong})`);
				const st = qs('[data-slot="status-indicator"]', b);
				if (
					st?.getAttribute("data-tone") !==
						toneTheoNghia(NGHIA_TU_TIN[ca.tuTin]) ||
					st.textContent?.trim() !== NHAN_TU_TIN[ca.tuTin]
				)
					loi.push(`hct-khoi: muc tu tin lech (${ca.ten})`);
				const gc = ghiChuDau();
				if (gc?.textContent !== ca.ghiChu || !gc?.closest('[translate="no"]'))
					loi.push(`hct-khoi: thieu ghi chu lan truoc (${ca.ten})`);
				if (ca.ten === "so-may") {
					const moTa =
						qs('[data-o="gia-tri"] [data-slot="field-description"]', h)
							?.textContent ?? "";
					if (!moTa.includes(mo.capNhat.hienTai) || !moTa.includes("70 khách"))
						loi.push(`hct-khoi: o so khong goi Hien tai (${moTa})`);
					if (
						ngan()?.textContent?.includes(
							`${mo.capNhat.lanTruoc["lan-truoc"]} 70`,
						)
					)
						loi.push("hct-khoi: hai so cung nhan lan truoc (55, 70)");
				}
				if (ca.kind === "moc")
					await act(async () => {
						await nguoiDung().click(
							nut(ca.go, qs('[data-o="gia-tri"]', h) ?? h),
						);
					});
				else await goGiaTri(k.id, ca.go);
				await nhip(2);
				const doiMong = mucDoi(
					{ kind: ca.kind, unit: ca.unit },
					Number(ca.so),
					ca.soGo,
					"vi",
					mk.khoiCapNhat.mucDoi,
				);
				if (mucDoiKhoi() !== doiMong)
					loi.push(
						`hct-khoi: muc doi lech (${ca.ten}: ${mucDoiKhoi()}, can ${doiMong})`,
					);
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

		kho.rieng.set("okr.lichSuKr", () => lichSu(ca, []));
		const kA = await moKhoi(mtCua("k-a", ca, []));
		await nhip(3);
		const a = {
			khoi: qsa(DONG).length,
			chu: ngan()?.textContent?.includes(ml.tieuDe) ?? true,
			tieuDiem: document.activeElement?.id === `${kA.id}-gia-tri`,
		};
		if (a.khoi !== 0 || a.chu)
			loi.push("hct-rong: co khoi khi chua co lan nao");
		await thaoHet();

		datLai();
		datKhoNgan();
		kho.rieng.set("okr.lichSuKr", () =>
			lichSu(ca, [lanMot(ca, { giaTri: 50, tuTin: "vua", ghiChu: null })]),
		);
		await moKhoi(mtCua("k-b", ca, [vet("v1", "k-b", LUC, 50, "vua")]));
		await cho(() => dongDau() !== null, "khoi b tai xong");
		const b = {
			khoi: qsa(DONG).length,
			so: soDau() !== null,
			ghiChu: ghiChuDau() === null ? 0 : 1,
		};
		if (b.ghiChu !== 0)
			loi.push("hct-rong: co dong ghi chu khi lan truoc khong ghi chu");
		await thaoHet();

		datLai();
		datKhoNgan();
		kho.rieng.set("okr.lichSuKr", () =>
			lichSu(ca, [lanMot(ca, { giaTri: 50, tuTin: "vua", ghiChu: "Co" })]),
		);
		await moKhoi(mtCua("k-c", ca, [vet("v1", "k-c", LUC, 50, "vua")]));
		await cho(() => ghiChuDau() !== null, "doi chung c");
		const c = { ghiChu: ghiChuDau() === null ? 0 : 1 };
		await thaoHet();

		datLai();
		datKhoNgan();
		kho.rieng.set("okr.lichSuKr", () =>
			lichSu(ca, [lanMot(ca, { giaTri: null, tuTin: "vua", ghiChu: null })]),
		);
		await moKhoi(mtCua("k-d", ca, [vet("v1", "k-d", LUC, "abc", "vua")]));
		await cho(() => dongDau() !== null, "khoi d");
		const d = {
			khoi: qsa(DONG).length,
			so: soDau() !== null,
			ngay: dongDau()?.textContent?.includes(NGAY_GIO) ?? false,
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

		kho.rieng.set("okr.lichSuKr", () => new Promise<object>(() => {}));
		await moKhoi(
			mtCua("k-cho", ca, [vet("v1", "k-cho", LUC, 1234.5, "vua")]),
			"vi",
			false,
		);
		await nhip(3);
		const cho1 = qs(`${LICH_SU} [data-slot="skeleton"]`) !== null;
		await act(async () => {
			await u.click(
				nut(mo.capNhat.mucTuTin.cao, khoiCapNhat() ?? document.body),
			);
		});
		await cho(
			() =>
				qs<HTMLButtonElement>(`${KHOI} [data-nut="gui-cap-nhat-kr"]`)
					?.disabled === false,
			"gui duoc khi dang tai",
		);
		await thaoHet();

		datLai();
		datKhoNgan();
		let lan = 0;
		kho.rieng.set("okr.lichSuKr", () => {
			lan += 1;
			if (lan === 1) throw new LoiTrpc("INTERNAL_SERVER_ERROR", "hong");
			return lichSu(ca, [
				lanMot(ca, { giaTri: 1234.5, tuTin: "vua", ghiChu: "Lan hai" }),
			]);
		});
		await moKhoi(
			mtCua("k-loi", ca, [vet("v1", "k-loi", LUC, 1234.5, "vua")]),
			"vi",
			false,
		);
		await cho(
			() => qs(`${LICH_SU} [data-vung-tai-loi]`) !== null,
			"loi ghi chu",
		);
		const lichSuEl = () => qs(LICH_SU);
		const cauLoi = lichSuEl()?.textContent?.includes(loiLichSu) ?? false;
		const coNut = (lichSuEl()?.querySelectorAll("button") ?? []).length > 0;
		if (!coNut) loi.push("hct-tai: thieu nut thu lai khi loi");
		await act(async () => {
			await u.click(
				nut(mo.capNhat.mucTuTin.cao, khoiCapNhat() ?? document.body),
			);
		});
		const guiDuoc =
			qs<HTMLButtonElement>(`${KHOI} [data-nut="gui-cap-nhat-kr"]`)
				?.disabled === false;
		const docTruoc = docCua("okr.lichSuKr").length;
		if (coNut)
			await act(async () => {
				await u.click(nut(ml.thuLai, lichSuEl() ?? document.body));
			});
		await cho(() => ghiChuDau() !== null || !coNut, "ghi chu sau thu lai");
		const sau = {
			docThem: docCua("okr.lichSuKr").length - docTruoc,
			ghiChu: ghiChuDau()?.textContent ?? null,
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
	test("hct-goi-y: khoi co ba cau goi y duoi o ghi chu (vi, en), o mot dong 200 ky tu; trang Cap nhat tuan khong co", async () => {
		const ca = MA_TRAN[0] as Ca;
		const loi: string[] = [];
		const docGoiY = () =>
			[
				...(qs(
					`${KHOI} [data-o="ghi-chu"] [data-goi-y-ghi-chu]`,
				)?.querySelectorAll("[data-cau-goi-y]") ?? []),
			].map((c) => c.textContent);

		kho.rieng.set("okr.lichSuKr", () => lichSu(ca, []));
		await moKhoi(mtCua("k-g", ca, []));
		const vi = docGoiY();
		if (vi.length === 0) loi.push("hct-goi-y: thieu cau hoi goi y trong hop");
		const o = qs<HTMLInputElement>(`${KHOI} [data-o="ghi-chu"] input`);
		const oGhiChu = { the: o?.tagName ?? null, toiDa: o?.maxLength ?? null };
		await thaoHet();

		datLai();
		datKhoNgan();
		kho.rieng.set("okr.lichSuKr", () => lichSu(ca, []));
		await moKhoi(mtCua("k-g-en", ca, []), "en");
		const en = docGoiY();
		await thaoHet();

		datLai();
		const mt = mtCua("k-tuan", ca, []);
		const k = mt.keyResults[0] as ObjectiveOutput["keyResults"][number];
		await dung(
			<BangCapNhat
				duLieu={{
					items: [
						{ ...krCapNhatTuSheet(mt, k), donOkr: "pb:pb-1", cycleId: "q4" },
					],
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
	test("hct-sau-gui: gui xong may lam moi Lich su va muc tieu; mo lai khoi thi dong dau Lich su la lan vua gui", async () => {
		const ca = MA_TRAN[0] as Ca;
		const id = "k-sg";
		const lucCu = "2026-10-20T02:00:00.000Z";
		const lucMoi = "2026-10-21T03:00:00.000Z";
		const tuanNay = "2026-10-19";
		let daGui: Pick<
			GuiCapNhatInput["items"][number],
			"value" | "confidence" | "note"
		> | null = null;
		const mtCu = mtCua(id, { ...ca, hienTai: 40 }, [
			vet("v1", id, lucCu, 40, "cao"),
		]);
		kho.rieng.set("okr.lichSuKr", () =>
			lichSu(ca, [
				{
					id: "c1",
					luc: lucCu,
					tuan: tuanNay,
					giaTri: 40,
					tuTin: "cao",
					ghiChu: "A",
				},
				...(daGui
					? [
							{
								id: "c2",
								luc: lucMoi,
								tuan: tuanNay,
								giaTri: daGui.value,
								tuTin: daGui.confidence,
								ghiChu: daGui.note === "" ? null : daGui.note,
							},
						]
					: []),
			]),
		);
		kho.ghiRieng.set("okr.guiCapNhat", async (vao) => {
			const muc = guiCapNhatInput.parse(vao).items[0];
			if (!muc) throw new Error("hct-sau-gui: gui khong co muc nao");
			const gui = {
				value: muc.value,
				confidence: muc.confidence,
				note: muc.note,
			};
			daGui = gui;
			kho.chiTiet = () =>
				mtCua(id, { ...ca, hienTai: gui.value }, [
					vet("v1", id, lucCu, 40, "cao"),
					vet("v2", id, lucMoi, gui.value, gui.confidence),
				]);
			return { id: "ok", canhBao: null };
		});
		const k = await moKhoi(mtCu);
		await cho(() => ghiChuDau()?.textContent === "A", "ghi chu cu");
		const u = nguoiDung();
		const o = qs<HTMLInputElement>(`[id="${id}-gia-tri"]`);
		if (!o) throw new Error("thieu o gia tri");
		await act(async () => {
			await u.clear(o);
			await u.type(o, "60");
			await u.click(
				nut(mo.capNhat.mucTuTin.thap, khoiCapNhat() ?? document.body),
			);
			const g = qs<HTMLInputElement>(`[id="${id}-ghi-chu"]`);
			if (!g) throw new Error("hct-sau-gui: thieu o ghi chu");
			await u.type(g, "Moi");
		});
		const docTruoc = {
			lichSu: docCua("okr.lichSuKr").length,
			mucTieu: docCua("okr.objective").length,
		};
		await cho(
			() =>
				qs<HTMLButtonElement>(`${KHOI} [data-nut="gui-cap-nhat-kr"]`)
					?.disabled === false,
			"nut gui",
		);
		await act(async () => {
			await u.click(
				qs(`${KHOI} [data-nut="gui-cap-nhat-kr"]`) ?? document.body,
			);
		});
		await cho(() => trangThaiKhoi() === "thu", "khoi thu sau gui");
		await cho(
			() => docCua("okr.objective").length > docTruoc.mucTieu,
			"muc tieu moi",
		);
		const lamMoi = {
			lichSu: docCua("okr.lichSuKr").length > docTruoc.lichSu,
			mucTieu: docCua("okr.objective").length > docTruoc.mucTieu,
		};
		await act(async () => {
			await u.click(
				qs(`${KHOI} [data-nut="mo-khoi-cap-nhat-kr"]`) ?? document.body,
			);
		});
		await cho(
			() => trangThaiKhoi() === "mo" && ghiChuDau() !== null,
			"khoi sau gui",
		);
		await nhip(3);
		const thay = ghiChuDau()?.textContent ?? null;
		const loi =
			thay === "Moi" ? [] : [`hct-sau-gui: ghi chu cu sau khi gui (${thay})`];
		const so = soDau()?.textContent ?? null;
		const tuTin =
			qs(
				'[data-slot="status-indicator"]',
				dongDau() ?? document.body,
			)?.textContent?.trim() ?? null;
		await goGiaTri(k.id, "70");
		expect({
			loi,
			lamMoi,
			so,
			tuTin,
			mucDoi: mucDoiKhoi(),
		}).toEqual({
			loi: [],
			lamMoi: { lichSu: true, mucTieu: true },
			so: giaTri(k, 60, "vi"),
			tuTin: NHAN_TU_TIN.thap,
			mucDoi: mucDoi(
				{ kind: ca.kind, unit: ca.unit },
				60,
				70,
				"vi",
				mk.khoiCapNhat.mucDoi,
			),
		});
	});
});
