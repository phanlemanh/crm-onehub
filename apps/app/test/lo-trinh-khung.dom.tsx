import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy({}, { get: () => new Proxy({}, { get: () => () => ({}) }) }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/lo-trinh",
}));

const { NoiDungLoTrinh } = await import("@/components/lo-trinh/noi-dung");
const { docTrangLoTrinh } = await import("@/lib/lo-trinh/doc-trang");
const { loTrinhMessages } = await import("@/lib/messages/lo-trinh");
const { crmMessages } = await import("@/lib/messages/crm");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { formatDay } = await import("@crm/ui/lib/format");

type DauVao = ReturnType<typeof docTrangLoTrinh>;
type DuLieu = Extract<DauVao, { kieu: "co-du-lieu" }>["duLieu"];

const DV = docTrangLoTrinh(
	readFileSync(
		path.join(import.meta.dir, "fixtures/lo-trinh/LO-TRINH.mau.html"),
		"utf8",
	),
);
if (DV.kieu !== "co-du-lieu") throw new Error(`tep mau hong: ${DV.kieu}`);
const DL: DuLieu = DV.duLieu;
const m = loTrinhMessages("vi");
const dong = crmMessages("vi").sheet.close;
const CHU_CUNG = new Set(["Chưa mở", "Đã giao", "Đang làm"]);
const NHAN = {
	"chua-bat-dau": m.nhom.chuaBatDau,
	"dang-lam": m.nhom.dangLam,
	"da-giao": m.nhom.daGiao,
	khac: m.nhom.khac,
} as const;

const VIEC = DL.lo_trinh.flatMap((lo) => {
	const theoMoc = new Map<string, { ngay: string; ten: string }>();
	for (const moc of lo.moc)
		for (const ma of moc.hang) if (!theoMoc.has(ma)) theoMoc.set(ma, moc);
	return lo.hang.map((h) => {
		const cungLo = lo.hang;
		return {
			...h,
			khoa: `${lo.tep}#${h.ma}`,
			loTen: lo.ten ?? lo.tep,
			tenMoc: theoMoc.get(h.ma)?.ten ?? null,
			ngayMoc: theoMoc.get(h.ma)?.ngay ?? null,
			coCanTruoc: h.dung_tren.some((ma) => cungLo.some((x) => x.ma === ma)),
			coDangCho: cungLo.some((x) => x.dung_tren.includes(h.ma)),
		};
	});
});

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

async function mo(khoa: string) {
	act(() => root?.unmount());
	document.body.innerHTML = "";
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const q = new URLSearchParams({ vongDoi: "tat-ca", viec: khoa }).toString();
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter hasMemory searchParams={q}>
				<LocaleProvider locale="vi">
					<TooltipProvider>
						<NoiDungLoTrinh dauVao={DV} />
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		),
	);
	for (let i = 0; i < 4; i++)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

const chu = (e: Element | null | undefined) =>
	(e?.textContent ?? "").replace(/\s+/g, " ").trim();

describe("khung-chung", () => {
	test("ngan moi viec dung khung chi tiet chung cua ngan Thoa thuan", async () => {
		expect(VIEC.length).toBeGreaterThan(2);
		expect(VIEC.some((v) => v.bat_khi || v.vi_sao)).toBe(true);
		expect(VIEC.some((v) => !v.bat_khi && !v.vi_sao)).toBe(true);
		expect(VIEC.some((v) => v.tenMoc === null)).toBe(true);
		let soDaKiem = 0;
		for (const v of VIEC) {
			await mo(v.khoa);
			const ngan = document.body.querySelector("[data-lo-trinh-chi-tiet-viec]");
			expect(ngan?.getAttribute("data-lo-trinh-chi-tiet-viec"), v.khoa).toBe(
				v.ma,
			);
			const dai = ngan?.querySelectorAll("[data-slot=detail-sheet-stats]");
			expect(
				dai?.length,
				`ngan khong dung khung chi tiet chung: ${v.khoa}`,
			).toBe(1);
			const o = dai?.[0];
			expect(
				[...(o?.querySelectorAll("dt") ?? [])].map(chu),
				`nhan dai o: ${v.khoa}`,
			).toEqual([m.hoSo.trangThai, m.hoSo.moc, m.hoSo.loTrinh, m.hoSo.nhom]);
			const gt = [...(o?.querySelectorAll("dd") ?? [])].map(chu);
			expect(gt[0], `o trang thai: ${v.khoa}`).toContain(
				NHAN[v.nhom_trang_thai],
			);
			expect(gt[1], `o moc: ${v.khoa}`).toContain(
				v.ngayMoc ? formatDay(v.ngayMoc, "vi") : m.loc.chuaHenMoc,
			);
			expect(
				[...(o?.querySelectorAll("dd") ?? [])].every(
					(d) => d.querySelector("[data-lo-trinh-trang-thai-phu]") === null,
				),
				`dai o mot dong: ${v.khoa}`,
			).toBe(true);
			expect(gt[2], `o lo trinh: ${v.khoa}`).toBe(v.loTen);
			expect(gt[3], `o nhom: ${v.khoa}`).toBe(v.nhom || m.loc.khongNhom);
			expect(
				chu(ngan?.querySelector("[data-slot$=-title]")),
				`tieu de: ${v.khoa}`,
			).toBe(v.cau_giao);
			expect(
				chu(ngan?.querySelector("[data-slot$=-description]")),
				`mo ta: ${v.khoa}`,
			).toBe(`${v.ma} · ${v.loTen}${v.nhom ? ` · ${v.nhom}` : ""}`);
			expect(
				[...(ngan?.querySelectorAll("button") ?? [])].some(
					(b) => chu(b) === dong,
				),
				`nut dong: ${v.khoa}`,
			).toBe(true);
			const muc = [...(ngan?.querySelectorAll("section > div > h3") ?? [])].map(
				chu,
			);
			const phu =
				v.trang_thai !== NHAN[v.nhom_trang_thai] && !CHU_CUNG.has(v.trang_thai);
			expect(muc.includes(m.hoSo.chiTiet), `muc Chi tiet: ${v.khoa}`).toBe(
				Boolean(phu || v.tenMoc || v.bat_khi || v.vi_sao),
			);
			const thuocTinh = chu(
				[...(ngan?.querySelectorAll("section") ?? [])].find(
					(x) => chu(x.querySelector("h3")) === m.hoSo.chiTiet,
				),
			);
			if (v.tenMoc) expect(thuocTinh, `ten moc: ${v.khoa}`).toContain(v.tenMoc);
			if (phu)
				expect(thuocTinh, `ke hoach ghi: ${v.khoa}`).toContain(v.trang_thai);
			expect(
				muc.includes(m.hoSo.canXongTruoc),
				`muc Can xong truoc: ${v.khoa}`,
			).toBe(v.coCanTruoc);
			expect(muc.includes(m.hoSo.dangCho), `muc Dang cho: ${v.khoa}`).toBe(
				v.coDangCho,
			);
			expect(
				ngan?.querySelectorAll("[data-slot=card]").length,
				`con Card trong ngan: ${v.khoa}`,
			).toBe(0);
			soDaKiem++;
		}
		expect(soDaKiem).toBe(VIEC.length);
	});
});
