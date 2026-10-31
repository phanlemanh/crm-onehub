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
import { useQueryClient } from "@tanstack/react-query";
import { act } from "react";
import { chuoiMoiLan, dienBienKr } from "../../api/src/okr/dien-bien";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	dienBienOutput,
	type LichSuKrOutput,
	lichSuKrOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	ghiMacDinh,
	goiCua,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nguoiDung,
	nhip,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const dieuHuong = { soLan: 0 };

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {
			dieuHuong.soLan += 1;
		},
		replace: () => {
			dieuHuong.soLan += 1;
		},
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
const { TargetLineChart } = await import(
	"@crm/ui/components/target-line-chart"
);
const { useRouter } = await import("next/navigation");
const { okrMessages } = await import("@/lib/messages/okr");

const mo = okrMessages("vi");

type LanMau = {
	id: string;
	luc: string;
	tuan: string;
	giaTri: number;
	tuTin?: "cao" | "vua" | "thap";
	ghiChu?: string;
	camXuc?: LichSuKrOutput["lan"][number]["camXuc"];
};

const TUAN_KY = [
	"2026-09-14",
	"2026-09-21",
	"2026-09-28",
	"2026-10-05",
	"2026-10-12",
	"2026-10-19",
	"2026-10-26",
	"2026-11-02",
];
const HOM_NAY = new Date("2026-10-21T05:00:00.000Z");
const kyVongTuan = (tuan: string) => (TUAN_KY.indexOf(tuan) + 1) * 12;

const CHIN_LAN: LanMau[] = [
	{
		id: "L1",
		luc: "2026-09-15T03:00:00.000Z",
		tuan: "2026-09-14",
		giaTri: 12,
		ghiChu: "bat dau",
	},
	{ id: "L2", luc: "2026-09-22T03:00:00.000Z", tuan: "2026-09-21", giaTri: 14 },
	{
		id: "L3",
		luc: "2026-09-29T03:00:00.000Z",
		tuan: "2026-09-28",
		giaTri: 15,
		tuTin: "thap",
	},
	{ id: "L4", luc: "2026-10-06T02:00:00.000Z", tuan: "2026-10-05", giaTri: 17 },
	{
		id: "L5",
		luc: "2026-10-08T03:00:00.000Z",
		tuan: "2026-10-05",
		giaTri: 18,
		ghiChu: "sang",
	},
	{
		id: "L6",
		luc: "2026-10-08T07:30:00.000Z",
		tuan: "2026-10-05",
		giaTri: 19,
		ghiChu: "chieu",
		tuTin: "cao",
	},
	{ id: "L7", luc: "2026-10-13T03:00:00.000Z", tuan: "2026-10-12", giaTri: 21 },
	{ id: "L8", luc: "2026-10-20T03:00:00.000Z", tuan: "2026-10-19", giaTri: 23 },
	{
		id: "L9",
		luc: "2026-10-21T03:00:00.000Z",
		tuan: "2026-10-19",
		giaTri: 24,
		ghiChu: "moi nhat",
	},
];

const NHAN_MONG = new Map<string, string>([
	["L1", "10:00 15/09/2026"],
	["L2", "10:00 22/09/2026"],
	["L3", "10:00 29/09/2026"],
	["L4", "09:00 06/10/2026"],
	["L5", "10:00 08/10/2026"],
	["L6", "14:30 08/10/2026"],
	["L7", "10:00 13/10/2026"],
	["L8", "10:00 20/10/2026"],
	["L9", "10:00 21/10/2026"],
]);
const TRUC_MONG = [
	"15/09",
	"22/09",
	"29/09",
	"06/10",
	"08/10",
	"08/10",
	"13/10",
	"20/10",
	"21/10",
];

function krSo(kieu: "tang-toi" | "moc", lan: LanMau[]) {
	return {
		id: "A",
		thuTu: 0,
		khoaLuc: null,
		kieu,
		khoi: 10,
		dich: 50,
		lan: lan.map((l) => ({
			id: l.id,
			tuan: l.tuan,
			luc: new Date(l.luc),
			tuTin: l.tuTin ?? "vua",
			ghiChu: l.ghiChu ?? "",
			giaTri: l.giaTri,
		})),
	};
}

function lichSuCua(
	lan: LanMau[],
	kieu: "tang-toi" | "moc" = "tang-toi",
): LichSuKrOutput {
	return lichSuKrOutput.parse({
		kieu,
		tieuDe: "KR A",
		dich: 50,
		donVi: kieu === "moc" ? "" : "đại lý",
		coCapNhat: lan.length > 0,
		lan: lan.map((l) => ({
			checkInId: l.id,
			luc: l.luc,
			ngay: l.luc.slice(0, 10),
			tuan: l.tuan,
			giaTri: kieu === "moc" ? null : l.giaTri,
			tuTin: l.tuTin ?? "vua",
			ghiChu: l.ghiChu ?? null,
			camXuc: l.camXuc ?? [],
		})),
		chuoi: chuoiMoiLan(krSo(kieu, lan), TUAN_KY, HOM_NAY, kyVongTuan),
	});
}

function datNgan(lay: () => LichSuKrOutput | Promise<LichSuKrOutput>): void {
	kho.rieng.set("okr.lichSuKr", () => lay() as LichSuKrOutput);
	kho.rieng.set("okr.objective", () => {
		const k = kr("A", "mt-1", { title: "KR A", hienTaiQuaCapNhat: true });
		return chiTietTu(mucTieu("mt-1", [k], { canEdit: true }), {
			canEditKr: ["A"],
		});
	});
	kho.rieng.set("okr.canhKr", () =>
		canhKrOutput.parse({
			kr: {
				id: "A",
				title: "KR A",
				kind: "tang-toi",
				objectiveId: "mt-1",
				ownerName: "Nguyễn Thị Lan",
				xong: false,
			},
			dong: [],
			bangChung: [],
			quyen: { suaDuoc: true, ganDuoc: false },
			khoa: false,
			choDuyet: false,
		}),
	);
	kho.rieng.set("okr.dienBien", () =>
		dienBienOutput.parse({
			kieu: "tang-toi",
			tieuDe: "KR A",
			khoi: 10,
			dich: 50,
			donVi: "đại lý",
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
					contentRect: { width: 640, height: 144 } as DOMRectReadOnly,
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

const LICH_SU = '[data-muc-ngan="lich-su"]';
const dongLan = () => qsa(`${LICH_SU} [data-lan-cap-nhat]`);
const maDong = () => dongLan().map((d) => d.getAttribute("data-lan-cap-nhat"));
const chamGiaTri = (goc = LICH_SU) =>
	document.querySelectorAll(
		`${goc} .recharts-line-dots circle:not([data-diem-moi])`,
	).length;

async function moNgan(): Promise<void> {
	await dung(<RecordSheetHost />, "?record=objective:mt-1,kr:A");
	await cho(() => qs('[data-kr-sheet="A"]') !== null, "ngan A");
}

async function choLichSu(): Promise<void> {
	await cho(
		() =>
			qs(`${LICH_SU} [data-lich-su-kr]`) !== null ||
			qs(`${LICH_SU} [data-slot="target-line-chart"]`) !== null,
		"lich su dung",
	);
}

beforeEach(() => {
	datLai();
	dieuHuong.soLan = 0;
});
afterEach(async () => {
	await thaoHet();
	setSystemTime();
	globalThis.ResizeObserver = roCu;
	HTMLElement.prototype.getBoundingClientRect = rectCu;
});

describe("lsml-danh-sach", () => {
	test("lsml-danh-sach: chin lan, moi lan mot dong moi nhat truoc, nhan gio gui", async () => {
		datNgan(() => lichSuCua(CHIN_LAN));
		await moNgan();
		await choLichSu();
		const loi: string[] = [];
		let dem = 0;
		const mong = [...CHIN_LAN].reverse();
		if (dongLan().length !== 9)
			loi.push(`lsml-danh-sach: ${dongLan().length} dong can 9`);
		if (qsa(`${LICH_SU} [data-lich-su-kr] [data-lan-cap-nhat]`).length !== 9)
			loi.push("lsml-danh-sach: dong khong nam trong data-lich-su-kr");
		for (const [i, l] of mong.entries()) {
			const d = dongLan()[i];
			const chu = d?.textContent ?? "";
			if (d?.getAttribute("data-lan-cap-nhat") !== l.id)
				loi.push(
					`lsml-danh-sach: dong ${i} la ${d?.getAttribute("data-lan-cap-nhat")} can ${l.id}`,
				);
			const nhan = d?.querySelector("[data-luc-lan]")?.textContent;
			if (nhan !== NHAN_MONG.get(l.id))
				loi.push(
					`lsml-danh-sach: ${l.id} nhan «${nhan}» can «${NHAN_MONG.get(l.id)}»`,
				);
			const so = d?.querySelector("[data-gia-tri-lan]")?.textContent ?? "";
			if (
				!new RegExp(`(^|\\D)${l.giaTri}(\\D|$)`).test(so) ||
				!so.includes("đại lý")
			)
				loi.push(`lsml-danh-sach: ${l.id} gia tri «${so}»`);
			if (l.ghiChu && !chu.includes(l.ghiChu))
				loi.push(`lsml-danh-sach: ${l.id} thieu ghi chu`);
			const tuTin = [...(d?.querySelectorAll("[data-tu-tin]") ?? [])].map((e) =>
				e.getAttribute("data-tu-tin"),
			);
			if (JSON.stringify(tuTin) !== JSON.stringify([l.tuTin ?? "vua"]))
				loi.push(
					`lsml-danh-sach: ${l.id} muc tu tin ${JSON.stringify(tuTin)} can ${l.tuTin ?? "vua"}`,
				);
			if (d?.querySelector(`[data-hang-cam-xuc="${l.id}"]`) === null)
				loi.push(`lsml-danh-sach: ${l.id} thieu hang cam xuc`);
			dem += 1;
		}
		const l5 = dongLan().find(
			(d) => d.getAttribute("data-lan-cap-nhat") === "L5",
		);
		const l6 = dongLan().find(
			(d) => d.getAttribute("data-lan-cap-nhat") === "L6",
		);
		if (
			l5?.getAttribute("data-ngay") !== "2026-10-08" ||
			l6?.getAttribute("data-ngay") !== "2026-10-08" ||
			l5 === l6
		)
			loi.push("lsml-danh-sach: hai lan cung ngay khong la hai dong");
		console.log(`lsml-danh-sach: ${dem}/9`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(9);
	});
});

describe("lsml-bieu-do", () => {
	test("lsml-bieu-do: moi lan mot cham, nhan truc theo ngay gui, chu lan cap nhat", async () => {
		coKhungDoThi();
		const loiKhoa: string[] = [];
		const errCu = console.error;
		console.error = (...a: unknown[]) => {
			const s = a.map(String).join(" ");
			if (s.includes("same key")) loiKhoa.push(s);
		};
		try {
			datNgan(() => lichSuCua(CHIN_LAN));
			await moNgan();
			await cho(() => chamGiaTri() > 0, "bieu do co cham");
			const loi: string[] = [];
			let dem = 0;
			if (chamGiaTri() !== 9)
				loi.push(`lsml-bieu-do: ${chamGiaTri()} cham can 9`);
			dem += 1;
			const hang = qsa(`${LICH_SU} table.sr-only tbody tr`)
				.filter((r) => r.querySelector("td")?.textContent !== "—")
				.map((r) => r.querySelector("th")?.textContent);
			if (JSON.stringify(hang) !== JSON.stringify(TRUC_MONG))
				loi.push(
					`lsml-bieu-do: nhan truc ${JSON.stringify(hang)} can ${JSON.stringify(TRUC_MONG)}`,
				);
			dem += 1;
			if (
				qs(`${LICH_SU} [data-muc="dich"]`) === null &&
				qs(`${LICH_SU} .recharts-reference-line`) === null
			)
				loi.push("lsml-bieu-do: thieu vach dich");
			const tuanCuoi = "2026-10-19";
			const leRaMong = TUAN_KY.flatMap((t) => {
				const k = Math.round((10 + (40 * kyVongTuan(t)) / 100) * 100) / 100;
				const soLan =
					t > tuanCuoi ? 0 : CHIN_LAN.filter((l) => l.tuan === t).length;
				return Array.from({ length: Math.max(soLan, 1) }, () => k);
			});
			const leRa = qsa(`${LICH_SU} table.sr-only tbody tr`).map((r) => {
				const o = r.querySelectorAll("td")[1]?.textContent ?? "";
				return o === "—" ? null : Number(o);
			});
			if (JSON.stringify(leRa) !== JSON.stringify(leRaMong))
				loi.push(
					`lsml-bieu-do: cot le ra ${JSON.stringify(leRa)} can ${JSON.stringify(leRaMong)}`,
				);
			const duongKyVong = qsa(
				`${LICH_SU} .recharts-line path.recharts-curve`,
			).filter(
				(p) =>
					p.getAttribute("stroke") === "var(--color-expected)" &&
					(p.getAttribute("d") ?? "").length > 0,
			);
			if (duongKyVong.length !== 1)
				loi.push(`lsml-bieu-do: ${duongKyVong.length} duong ky vong can 1`);
			dem += 1;
			const nhan =
				qs(`${LICH_SU} [data-slot="chart"]`)?.getAttribute("aria-label") ?? "";
			const chuGiai = qs(`${LICH_SU} figcaption`)?.textContent ?? "";
			const dauCot = qs(`${LICH_SU} table.sr-only thead th`)?.textContent ?? "";
			if (!nhan.includes("qua từng lần cập nhật") || nhan.includes("theo tuần"))
				loi.push(`lsml-bieu-do: aria-label «${nhan}»`);
			if (/tuần/i.test(chuGiai) && !chuGiai.includes("trong tuần ấy"))
				loi.push(`lsml-bieu-do: chu giai «${chuGiai}»`);
			if (!chuGiai.includes("mỗi lần cập nhật"))
				loi.push(`lsml-bieu-do: chu giai thieu lan cap nhat «${chuGiai}»`);
			if (/tuần/i.test(dauCot) || !/lần cập nhật/i.test(dauCot))
				loi.push(`lsml-bieu-do: dau cot «${dauCot}»`);
			dem += 1;
			if (loiKhoa.length !== 0)
				loi.push(`lsml-bieu-do: trung khoa ${loiKhoa[0]?.slice(0, 120)}`);
			dem += 1;
			await thaoHet();
			datLai();
			coKhungDoThi();
			const tuan = dienBienKr(
				krSo("tang-toi", CHIN_LAN),
				TUAN_KY,
				HOM_NAY,
				kyVongTuan,
			);
			await dung(
				<div data-doi-chung>
					<TargetLineChart
						data={tuan.map((p) => ({
							x: p.tuan,
							value: p.giaTri,
							expected: p.kyVong,
						}))}
						label="doi chung"
						target={50}
						targetLabel="Dich"
					/>
				</div>,
			);
			await cho(() => chamGiaTri("[data-doi-chung]") > 0, "doi chung cham");
			const dauCotTuan = qs(
				"[data-doi-chung] table.sr-only thead th",
			)?.textContent;
			if (chamGiaTri("[data-doi-chung]") !== 6 || dauCotTuan !== "Tuần")
				loi.push(
					`lsml-bieu-do: doi chung theo tuan ${chamGiaTri("[data-doi-chung]")} cham «${dauCotTuan}» can 6 «Tuần»`,
				);
			dem += 1;
			console.log(`lsml-bieu-do: ${dem}/6`);
			expect(loi.join("\n")).toBe("");
			expect(dem).toBe(6);
		} finally {
			console.error = errCu;
		}
	});
});

const KHOI_MO = '[data-khoi-cap-nhat-kr="mo"]';

async function guiTuKhoi(giaTri: string): Promise<void> {
	const h = qs(KHOI_MO);
	if (!h) throw new Error("khong co khoi cap nhat");
	const o = h.querySelector<HTMLInputElement>('[data-o="gia-tri"] input');
	if (!o) throw new Error("khong co o gia tri");
	const u = nguoiDung();
	await act(async () => {
		await u.clear(o);
		await u.type(o, giaTri);
	});
	const muc = [...h.querySelectorAll('[data-o="tu-tin"] button')].find(
		(b) => b.textContent?.trim() === mo.capNhat.mucTuTin.vua,
	);
	if (muc) await bamChuot(muc);
	const gui = () =>
		h.querySelector<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]');
	await cho(() => gui()?.disabled === false, "nut gui bat");
	await bamChuot(gui() as HTMLButtonElement);
}

function NutDieuHuongThu() {
	const router = useRouter();
	return (
		<button
			data-nut-dieu-huong-thu=""
			onClick={() => router.push("/ws/okr/khac")}
			type="button"
		>
			di
		</button>
	);
}

describe("lsml-sau-gui", () => {
	test("lsml-sau-gui: hai lan gui trong tuan, moi lan them mot dong va mot cham", async () => {
		coKhungDoThi();
		setSystemTime(HOM_NAY);
		const lan: LanMau[] = CHIN_LAN.slice(0, 7);
		let dem = 0;
		const loi: string[] = [];
		datNgan(() => lichSuCua(lan));
		kho.ghiRieng.set("okr.guiCapNhat", async (vao) => {
			const it = (vao?.items as { value: number }[] | undefined)?.[0];
			const so = lan.length + 1;
			lan.push({
				id: `M${so}`,
				luc: `2026-10-21T0${so - 6}:00:00.000Z`,
				tuan: "2026-10-19",
				giaTri: Number(it?.value ?? 0),
			});
			return ghiMacDinh("okr.guiCapNhat", vao);
		});
		await moNgan();
		await choLichSu();
		await cho(() => chamGiaTri() > 0, "cham ban dau");
		for (const [i, gia] of ["30", "31"].entries()) {
			const dongTruoc = dongLan().length;
			const chamTruoc = chamGiaTri();
			const docTruoc = docCua("okr.lichSuKr").length;
			if (i > 0)
				await bamChuot(qs('[data-nut="mo-khoi-cap-nhat-kr"]') as HTMLElement);
			await cho(() => qs(KHOI_MO) !== null, `khoi lan ${i + 1}`);
			await guiTuKhoi(gia);
			await cho(
				() => dongLan().length === dongTruoc + 1,
				`dong tang lan ${i + 1}`,
			).catch(() => {});
			await nhip(3);
			if (dongLan().length !== dongTruoc + 1)
				loi.push(
					`lsml-sau-gui: dong khong tang sau lan ${i + 1} (${dongTruoc} -> ${dongLan().length})`,
				);
			if (maDong()[0] !== lan.at(-1)?.id)
				loi.push(`lsml-sau-gui: dong dau ${maDong()[0]} can ${lan.at(-1)?.id}`);
			if (chamGiaTri() !== chamTruoc + 1)
				loi.push(
					`lsml-sau-gui: cham ${chamTruoc} -> ${chamGiaTri()} sau lan ${i + 1}`,
				);
			if (docCua("okr.lichSuKr").length <= docTruoc)
				loi.push(`lsml-sau-gui: khong doc lai lichSuKr sau lan ${i + 1}`);
			dem += 1;
		}
		if (dieuHuong.soLan !== 0)
			loi.push(`lsml-sau-gui: router dieu huong ${dieuHuong.soLan} lan`);
		await thaoHet();
		datLai();
		await dung(<NutDieuHuongThu />);
		await bamChuot(qs("[data-nut-dieu-huong-thu]") as HTMLElement);
		if (dieuHuong.soLan !== 1)
			loi.push(
				`lsml-sau-gui: doi chung bo dem router ${dieuHuong.soLan} can 1`,
			);
		dem += 1;
		console.log(`lsml-sau-gui: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

describe("lsml-trang-thai", () => {
	test("lsml-trang-thai: moc, rong, dang tai, loi co Thu lai, 30 lan", async () => {
		const loi: string[] = [];
		let dem = 0;
		const mucSo = () => qs('[data-muc-ngan="so"]') !== null;

		datNgan(() =>
			lichSuCua(
				[
					{
						id: "M1",
						luc: "2026-10-06T03:00:00.000Z",
						tuan: "2026-10-05",
						giaTri: 0,
						ghiChu: "chua xong",
						tuTin: "thap",
					},
					{
						id: "M2",
						luc: "2026-10-20T03:00:00.000Z",
						tuan: "2026-10-19",
						giaTri: 1,
						ghiChu: "xong roi",
						tuTin: "cao",
					},
				],
				"moc",
			),
		);
		await moNgan();
		await choLichSu();
		if (
			dongLan().length !== 2 ||
			qs(`${LICH_SU} [data-gia-tri-lan]`) !== null ||
			qs(`${LICH_SU} [data-slot="target-line-chart"]`) !== null ||
			!(qs(`${LICH_SU} [data-lich-su-kr]`)?.textContent ?? "").includes(
				"xong roi",
			) ||
			!mucSo()
		)
			loi.push("lsml-trang-thai: kr moc");
		const dongMoc = dongLan().map((d) => ({
			id: d.getAttribute("data-lan-cap-nhat"),
			tuTin: [...d.querySelectorAll("[data-tu-tin]")].map((e) =>
				e.getAttribute("data-tu-tin"),
			),
			ghiChu: d.textContent ?? "",
		}));
		const mongMoc = [
			{ id: "M2", tuTin: ["cao"], ghiChu: "xong roi" },
			{ id: "M1", tuTin: ["thap"], ghiChu: "chua xong" },
		];
		if (
			dongMoc.length !== 2 ||
			mongMoc.some(
				(m, i) =>
					dongMoc[i]?.id !== m.id ||
					JSON.stringify(dongMoc[i]?.tuTin) !== JSON.stringify(m.tuTin) ||
					!dongMoc[i]?.ghiChu.includes(m.ghiChu),
			)
		)
			loi.push(
				`lsml-trang-thai: kr moc dong ${JSON.stringify(dongMoc.map(({ id, tuTin }) => ({ id, tuTin })))} can M2 cao, M1 thap kem ghi chu`,
			);
		dem += 1;
		await thaoHet();

		datLai();
		datNgan(() => lichSuCua([]));
		await moNgan();
		await cho(
			() =>
				(qs(LICH_SU)?.textContent ?? "").includes("Chưa có lần cập nhật nào"),
			"rong",
		);
		if (qs(`${LICH_SU} [data-slot="target-line-chart"]`) !== null || !mucSo())
			loi.push("lsml-trang-thai: rong co bieu do");
		dem += 1;
		await thaoHet();

		datLai();
		datNgan(() => new Promise<LichSuKrOutput>(() => {}));
		await moNgan();
		await cho(
			() => qs(`${LICH_SU} [data-slot="skeleton"]`) !== null,
			"dang tai",
		).catch(() => {});
		if (qs(`${LICH_SU} [data-slot="skeleton"]`) === null || !mucSo())
			loi.push("lsml-trang-thai: dang tai khong co khung xuong");
		dem += 1;
		await thaoHet();

		datLai();
		datNgan(() => {
			throw new LoiTrpc("INTERNAL_SERVER_ERROR", "hong");
		});
		await moNgan();
		const nutThuLai = () =>
			qsa(`${LICH_SU} button`).find((b) => b.textContent?.includes("Thử lại"));
		await cho(() => nutThuLai() !== undefined, "loi co Thu lai").catch(
			() => {},
		);
		const docTruoc = docCua("okr.lichSuKr").length;
		const nut = nutThuLai();
		if (!nut || !mucSo()) loi.push("lsml-trang-thai: loi khong co Thu lai");
		else {
			await bamChuot(nut);
			await cho(
				() => docCua("okr.lichSuKr").length > docTruoc,
				"doc lai",
			).catch(() => {});
			if (docCua("okr.lichSuKr").length <= docTruoc)
				loi.push("lsml-trang-thai: Thu lai khong goi lai lichSuKr");
		}
		dem += 1;
		await thaoHet();

		datLai();
		const ba_muoi: LanMau[] = Array.from({ length: 30 }, (_, i) => ({
			id: `B${i}`,
			luc: new Date(
				Date.parse("2026-09-15T01:00:00.000Z") + i * 26 * 3600_000,
			).toISOString(),
			tuan: TUAN_KY[Math.min(5, Math.floor(i / 5))] ?? "2026-10-19",
			giaTri: 11 + i,
		}));
		datNgan(() => lichSuCua(ba_muoi));
		await moNgan();
		await choLichSu();
		if (dongLan().length !== 30)
			loi.push(`lsml-trang-thai: 30 lan dung ${dongLan().length} dong`);
		dem += 1;

		console.log(`lsml-trang-thai: ${dem}/5`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(5);
	});
});

describe("lsml-cam-xuc", () => {
	test("lsml-cam-xuc: tha tren L1 gan L1, dong L1 hien so moi, L2 giu nguyen", async () => {
		const loi: string[] = [];
		let dem = 0;
		const camL1 = { loai: "co-len" as const, so: 1, cuaToi: false, nguoi: [] };
		const camL2 = { loai: "co-len" as const, so: 1, cuaToi: false, nguoi: [] };
		const lan: LanMau[] = [
			{
				id: "L1",
				luc: "2026-10-20T03:00:00.000Z",
				tuan: "2026-10-19",
				giaTri: 20,
				camXuc: [camL1],
			},
			{
				id: "L2",
				luc: "2026-10-21T03:00:00.000Z",
				tuan: "2026-10-19",
				giaTri: 21,
				camXuc: [camL2],
			},
		];
		datNgan(() => lichSuCua(lan));
		kho.ghiRieng.set("okr.thaCamXuc", async (vao) => {
			const id = String(vao?.checkInId ?? "");
			const l = lan.find((x) => x.id === id);
			const moi = [{ loai: "co-len" as const, so: 2, cuaToi: true, nguoi: [] }];
			if (l) l.camXuc = moi;
			return moi as never;
		});
		await moNgan();
		await choLichSu();
		const chip = (id: string) =>
			qs<HTMLButtonElement>(
				`${LICH_SU} [data-lan-cap-nhat="${id}"] [data-cam-xuc="co-len"]`,
			);
		const so = (id: string) => chip(id)?.textContent?.replace(/[^0-9]/g, "");
		await cho(
			() => chip("L1") !== null && chip("L2") !== null,
			"chip hai dong",
		);
		const docTruoc = docCua("okr.lichSuKr").length;
		await bamChuot(chip("L1") as HTMLButtonElement);
		await cho(() => goiCua("okr.thaCamXuc").length === 1, "goi tha");
		if (goiCua("okr.thaCamXuc")[0]?.vao?.checkInId !== "L1")
			loi.push(
				`lsml-cam-xuc: tha L1 gan ${goiCua("okr.thaCamXuc")[0]?.vao?.checkInId}`,
			);
		await cho(() => docCua("okr.lichSuKr").length > docTruoc, "doc lai").catch(
			() => {},
		);
		await nhip(3);
		if (docCua("okr.lichSuKr").length <= docTruoc)
			loi.push("lsml-cam-xuc: khong doc lai lichSuKr sau khi tha");
		if (so("L1") !== "2" || so("L2") !== "1")
			loi.push(`lsml-cam-xuc: sau tha L1 so L1=${so("L1")} L2=${so("L2")}`);
		dem += 1;
		await bamChuot(chip("L2") as HTMLButtonElement);
		await cho(() => goiCua("okr.thaCamXuc").length === 2, "goi tha L2");
		if (goiCua("okr.thaCamXuc")[1]?.vao?.checkInId !== "L2")
			loi.push(
				`lsml-cam-xuc: doi chung tha L2 gan ${goiCua("okr.thaCamXuc")[1]?.vao?.checkInId}`,
			);
		dem += 1;
		console.log(`lsml-cam-xuc: ${dem}/2`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(2);
	});
});
