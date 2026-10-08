import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	BangChamOutput,
	KrCham,
	MucTieuCham,
} from "../../api/src/okr/okr-khep.contracts";
import { bangChamOutput } from "../../api/src/okr/okr-khep.contracts";

let bangGia: BangChamOutput;
type VaoBang = { cycleId: string };
type ChonGhi = { onSuccess?: () => void; onError?: (e: Error) => void };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			bangCham: {
				queryOptions: (vao: VaoBang) => ({
					queryKey: ["okr.bangCham", vao],
					queryFn: async () => bangChamOutput.parse(bangGia),
				}),
			},
			setCyclePhase: {
				mutationOptions: (chon: ChonGhi) => ({
					...chon,
					mutationKey: ["okr.setCyclePhase"],
					mutationFn: async () => ({ id: "ky", canhBao: null }),
				}),
			},
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ okr: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr",
}));

const { ChamDiemBang } = await import("@/app/(app)/[slug]/okr/cham-diem");
const { HopThoaiDongKy } = await import(
	"@/app/(app)/[slug]/settings/okr/hop-thoai-dong-ky"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrKhepMessages } = await import("@/lib/messages/okr-khep");

const mk = okrKhepMessages("vi");

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function kr(id: string, doi: Partial<KrCham> = {}): KrCham {
	return {
		id,
		title: `KR ${id}`,
		kind: "tang-toi",
		ownerName: "Phạm Thu Lan",
		unit: "khách",
		startValue: 0,
		targetValue: 10,
		soChot: 4,
		diemGoiY: 0.4,
		diem: null,
		lyDo: null,
		suaDuoc: true,
		doiDichNgoaiRa: [],
		...doi,
	};
}

function mucTieu(id: string, doi: Partial<MucTieuCham>): MucTieuCham {
	return {
		id,
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		ownerName: "Phạm Thu Lan",
		suaDuoc: true,
		diem: null,
		cachDoc: null,
		dieuHocDuoc: "",
		mangSangToi: null,
		mangSangTu: null,
		krs: [kr(`${id}-k1`)],
		...doi,
	};
}

const bangMoi = (doi: Partial<BangChamOutput>): BangChamOutput => ({
	thang: "0-1",
	conLai: 0,
	chuaCham: [],
	hocTapChuaGhi: [],
	mucTieu: [],
	...doi,
});

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function mo(man: ReactElement): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let i = 0; i < 100; i++) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 20));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

const q = (s: string) => document.body.querySelector<HTMLElement>(s);
const qa = (s: string) => [...document.body.querySelectorAll<HTMLElement>(s)];
const KY = {
	id: "ky-1",
	name: "Quý 1/2024",
	kind: "quy",
	phase: "cham-diem",
} as Parameters<typeof HopThoaiDongKy>[0]["ky"];

async function moHopDong(): Promise<void> {
	await mo(<HopThoaiDongKy ky={KY} onOpenChange={() => {}} open />);
	await cho(
		() =>
			q("[data-hoc-tap-chua-ghi]") !== null ||
			q("[data-chua-cham]") !== null ||
			q("[role='alertdialog']") !== null,
		"hop dong ky tai xong",
	);
}

const coXacNhan = () => q("[role='alertdialog']") !== null;
const tenHocTap = () =>
	qa("[data-hoc-tap-chua-ghi] [data-hoc-tap]").map(
		(e) => e.textContent?.trim() ?? "",
	);
const tenKhongDich = () =>
	qa("[data-hoc-tap-chua-ghi] [translate='no']").length;

describe("hop-dong-ky", () => {
	test("(a) conLai 0 + mot hoc-tap chua ghi: hop chan liet ke ten, khong co hop xac nhan", async () => {
		bangGia = bangMoi({
			hocTapChuaGhi: [{ id: "h1", ten: "Kiểm gói dùng thử" }],
		});
		await moHopDong();
		ghim(!coXacNhan(), "hop xac nhan hien khi con hoc-tap chua ghi");
		ghim(tenKhongDich() === 1, "ten hoc-tap thieu translate no");
		expect({
			ten: tenHocTap(),
			nutKhep: q("[data-nut='dong-ky']")?.hasAttribute("disabled") ?? null,
		}).toEqual({ ten: ["Kiểm gói dùng thử"], nutKhep: true });
	});

	test("(b) conLai 0 + khong hoc-tap: hop xac nhan nhu hom nay", async () => {
		bangGia = bangMoi({});
		await moHopDong();
		expect({
			xacNhan: coXacNhan(),
			chan: q("[data-hoc-tap-chua-ghi]") !== null,
		}).toEqual({ xacNhan: true, chan: false });
	});

	test("(c) conLai 2 + mot hoc-tap: hop chan co ca hai danh sach", async () => {
		bangGia = bangMoi({
			conLai: 2,
			chuaCham: [{ khoa: "goc", ten: "OneHub", conLai: 2 }],
			hocTapChuaGhi: [{ id: "h1", ten: "Kiểm gói dùng thử" }],
		});
		await moHopDong();
		expect({
			xacNhan: coXacNhan(),
			chuaCham: q("[data-chua-cham]") !== null,
			ten: tenHocTap(),
		}).toEqual({ xacNhan: false, chuaCham: true, ten: ["Kiểm gói dùng thử"] });
	});
});

async function moCham(ds: MucTieuCham[]): Promise<void> {
	await mo(
		<ChamDiemBang
			bang={bangMoi({ conLai: ds.length, mucTieu: ds })}
			daDong={false}
			kyKe={null}
			tenKy="Quý 1/2024"
			onCham={async () => true}
			onGhiHoc={async () => true}
			onMangSang={async () => true}
		/>,
	);
	await cho(() => q("[data-o-hoc]") !== null, "man cham tai xong");
}

const chuCua = () => document.body.textContent ?? "";

describe("man-cham", () => {
	test("hoc-tap chua tra loi khi diem trong: co nhan va chu thich bat buoc", async () => {
		await moCham([mucTieu("h", { kind: "hoc-tap", cachDoc: "chua-tra-loi" })]);
		ghim(
			chuCua().includes(mk.cachDoc["chua-tra-loi"]),
			"hoc-tap diem trong mat nhan cach doc",
		);
		expect({
			nhan: q("[data-cach-doc]")?.getAttribute("data-cach-doc") ?? null,
			batBuoc: q("[data-hoc-bat-buoc]")?.textContent?.trim() ?? null,
		}).toEqual({ nhan: "chua-tra-loi", batBuoc: mk.cham.hoc.batBuoc });
	});

	test("hoc-tap da tra loi", async () => {
		await moCham([
			mucTieu("h", {
				kind: "hoc-tap",
				cachDoc: "da-tra-loi",
				dieuHocDuoc: "Khách cần bản dùng thử",
			}),
		]);
		expect(chuCua().includes(mk.cachDoc["da-tra-loi"])).toBe(true);
	});

	test("cam-ket khong co chu thich bat buoc", async () => {
		await moCham([mucTieu("c", { kind: "cam-ket" })]);
		expect({
			batBuoc: q("[data-hoc-bat-buoc]") !== null,
			chu: chuCua().includes(mk.cham.hoc.batBuoc),
		}).toEqual({ batBuoc: false, chu: false });
	});
});
