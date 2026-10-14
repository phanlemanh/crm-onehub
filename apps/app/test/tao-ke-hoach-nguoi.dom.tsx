// Hồ sơ _acceptance/ke-hoach-sinh-viec — E3: ô tạo kế hoạch có một hàng chọn người cho mỗi phòng ban
// của khuôn (điền sẵn trưởng phòng, hay người cầm trịch), đủ trạng thái chờ / lỗi / rỗng, và giữ lựa
// chọn khi máy chủ từ chối. Khung mock tRPC theo nguoi-nhan-viec.dom.tsx.
import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type GiaTriVao =
	| string
	| number
	| boolean
	| null
	| readonly GiaTriVao[]
	| { readonly [khoa: string]: GiaTriVao };
type DauVaoTrpc = { readonly [khoa: string]: GiaTriVao } | undefined;
type Lay = (input: DauVaoTrpc) => unknown;
const traLoi = new Map<string, Lay>();
const daGoi: Array<{ duong: string; input: unknown }> = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			daGoi.push({ duong: op.path, input: op.input });
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay(op.input as DauVaoTrpc) : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
const proxy = () =>
	createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => proxy() }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/onboarding",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));

const { TaoKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/tao-ke-hoach"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { onboardingMessages } = await import("@/lib/messages/onboarding");

const m = onboardingMessages("vi");
const k = m.tao.keHoach;

const nguoiCo = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@thu.test`,
	image: null,
});
const NHAN_DUOC = [
	nguoiCo("u-chu", "Chủ"),
	nguoiCo("u-ha", "Hà"),
	nguoiCo("u-uyen", "Uyên"),
];
const PHONG = [
	{
		id: "bp-a",
		name: "Kinh doanh",
		position: 0,
		archivedAt: null,
		purgeable: false,
		headUserId: "u-ha",
	},
	{
		id: "bp-b",
		name: "Kế toán",
		position: 1,
		archivedAt: null,
		purgeable: false,
		headUserId: null,
	},
];
const khuon = (steps: Array<{ departmentId: string; position: number }>) => ({
	id: "k-1",
	name: "Khuôn A",
	partnerType: null,
	archivedAt: null,
	purgeable: false,
	steps: steps.map((s, i) => ({ label: `Bước ${i}`, offsetDays: i, ...s })),
});
const KHUON_HAI_PHONG = khuon([
	{ departmentId: "bp-a", position: 0 },
	{ departmentId: "bp-b", position: 1 },
	{ departmentId: "bp-a", position: 2 },
]);

let san: { o: HTMLElement; root: Root } | null = null;

function datChung(): void {
	traLoi.set("onboarding.nguoiNhanViec", () => NHAN_DUOC);
	traLoi.set("users.list", () => [...NHAN_DUOC, nguoiCo("u-okr", "Người OKR")]);
	traLoi.set("users.me", () => nguoiCo("u-chu", "Chủ"));
	traLoi.set("onboarding.listDepartments", () => PHONG);
}

async function mo(man: ReactElement): Promise<void> {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => {
			root.unmount();
		});
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	document.body.innerHTML = "";
});

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 200; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

async function dongMan(): Promise<void> {
	const s = san;
	if (!s) return;
	await act(async () => {
		s.root.unmount();
	});
	s.o.remove();
	san = null;
}

const q = (chon: string) => document.body.querySelector(chon);

async function chonMuc(muc: Element): Promise<void> {
	await act(async () => {
		muc.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
}

async function chonTrong(nhanO: string, tuyChon: string): Promise<void> {
	const o = q(`[aria-label="${nhanO}"]`);
	if (!o) throw new Error(`khong thay o ${nhanO}`);
	await bam(o);
	await cho(
		() =>
			[...document.body.querySelectorAll('[role="option"]')].some(
				(x) => x.textContent?.trim() === tuyChon,
			),
		`tuy chon ${tuyChon}`,
	);
	const muc = [...document.body.querySelectorAll('[role="option"]')].find(
		(x) => x.textContent?.trim() === tuyChon,
	);
	if (!muc) throw new Error(`khong thay tuy chon ${tuyChon}`);
	await chonMuc(muc);
}

const CONG_TY = { id: "ct-1", name: "Công ty A" };

async function moVaChonKhuon(): Promise<void> {
	await mo(<TaoKeHoach mo doiMo={() => {}} congTyCoDinh={CONG_TY} />);
	await cho(() => q(`[aria-label="${k.template}"]`) !== null, "o khuon");
	await cho(() => queryClient.isFetching() === 0, "tai xong");
	await chonTrong(k.template, "Khuôn A");
	await cho(
		() => q('[data-khoi="nguoi-theo-phong"]') !== null,
		"khoi nguoi theo phong",
	);
}

const hangPhong = () =>
	[...document.body.querySelectorAll("[data-phong]")].map((x) => ({
		phong: x.getAttribute("data-phong"),
		chu: x.textContent ?? "",
	}));

describe("kh-man-co-phong", () => {
	test("kh-man-co-phong: một hàng mỗi phòng, điền sẵn trưởng phòng hay cầm trịch, gửi đúng phòng đã đổi", async () => {
		datChung();
		traLoi.set("onboarding.listTemplates", () => [KHUON_HAI_PHONG]);
		traLoi.set("onboarding.createFromTemplate", () => ({
			id: "kh-moi",
			companyId: "ct-1",
			templateId: "k-1",
			startedAt: new Date(),
			targetDays: 30,
			closedAt: null,
			ownerId: "u-chu",
		}));
		await moVaChonKhuon();
		const hang = hangPhong();
		if (
			hang.length !== 2 ||
			hang[0]?.phong !== "bp-a" ||
			hang[1]?.phong !== "bp-b" ||
			!hang[0]?.chu.includes("Hà") ||
			!hang[1]?.chu.includes("Chủ") ||
			!hang[1]?.chu.includes(k.phongChuaCoTruong)
		) {
			throw new Error(`kh: o tao hang phong sai ${JSON.stringify(hang)}`);
		}
		const nhanB = `${k.nguoiTheoPhong} — Kế toán`;
		const oB = q(`[aria-label="${nhanB}"]`);
		if (!oB) throw new Error("kh: o tao hang phong sai thieu o B");
		await bam(oB);
		await cho(
			() => document.body.querySelectorAll('[role="option"]').length > 0,
			"danh sach chon B",
		);
		const ten = [...document.body.querySelectorAll('[role="option"]')]
			.map((x) => x.textContent?.trim())
			.sort();
		if (
			ten.includes("Người OKR") ||
			JSON.stringify(ten) !== JSON.stringify(["Chủ", "Hà", "Uyên"])
		) {
			throw new Error("kh: o chon co vai okr");
		}
		const uyen = [...document.body.querySelectorAll('[role="option"]')].find(
			(x) => x.textContent?.trim() === "Uyên",
		);
		if (!uyen) throw new Error("kh: o chon thieu Uyen");
		await chonMuc(uyen);
		const luu = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === m.tao.save,
		);
		if (!luu) throw new Error("kh: khong thay nut tao");
		await bam(luu);
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.createFromTemplate"),
			"goi tao",
		);
		const goi = daGoi.filter(
			(g) => g.duong === "onboarding.createFromTemplate",
		);
		const nguoi =
			(
				goi[0]?.input as {
					nguoiTheoPhongBan?: Array<{ departmentId: string; userId: string }>;
				}
			)?.nguoiTheoPhongBan ?? [];
		const coUyen = nguoi.some(
			(n) => n.departmentId === "bp-b" && n.userId === "u-uyen",
		);
		if (goi.length !== 1 || !coUyen || nguoi.length !== 1) {
			throw new Error(`kh: o tao goi sai ${JSON.stringify(goi)}`);
		}
		expect(nguoi).toHaveLength(1);
	});
});

describe("kh-man-trang-thai", () => {
	test("kh-man-trang-thai: chờ tải, lỗi có Thử lại, khuôn rỗng nói rõ mà vẫn tạo được", async () => {
		datChung();
		traLoi.set("onboarding.listTemplates", () => new Promise(() => {}));
		await mo(<TaoKeHoach mo doiMo={() => {}} congTyCoDinh={CONG_TY} />);
		await cho(
			() => q('[data-trang-thai="cho-tai"]')?.textContent === k.dangTaiKhuon,
			"cho tai",
		);
		if (q('[data-trang-thai="cho-tai"]')?.textContent !== k.dangTaiKhuon) {
			throw new Error("kh: trang thai o tao sai cho-tai");
		}
		await dongMan();

		let lan = 0;
		traLoi.set("onboarding.listTemplates", () => {
			lan += 1;
			throw new Error("hong");
		});
		await mo(<TaoKeHoach mo doiMo={() => {}} congTyCoDinh={CONG_TY} />);
		await cho(() => q('[data-trang-thai="loi"]') !== null, "loi tai");
		const thuLai = [
			...document.body.querySelectorAll('[data-trang-thai="loi"] button'),
		].find((b) => b.textContent?.trim() === k.thuLai);
		if (
			!q('[data-trang-thai="loi"]')?.textContent?.includes(k.loiTaiKhuon) ||
			!thuLai
		) {
			throw new Error("kh: trang thai o tao sai loi");
		}
		const truoc = lan;
		await bam(thuLai);
		await cho(() => lan > truoc, "thu lai goi lai");
		await dongMan();

		traLoi.set("onboarding.listTemplates", () => [khuon([])]);
		await mo(<TaoKeHoach mo doiMo={() => {}} congTyCoDinh={CONG_TY} />);
		await cho(() => queryClient.isFetching() === 0, "tai xong");
		await chonTrong(k.template, "Khuôn A");
		await cho(() => q('[data-trang-thai="rong"]') !== null, "khuon rong");
		const luu = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === m.tao.save,
		);
		if (
			q('[data-trang-thai="rong"]')?.textContent !== k.khuonRong ||
			// Kế hoạch rỗng là ca kho hỗ trợ (dieu-phoi-va AC-4) nên nút Tạo vẫn bấm được.
			(luu as HTMLButtonElement | undefined)?.disabled !== false
		) {
			throw new Error("kh: trang thai o tao sai rong");
		}
		await dongMan();

		// Danh sách phòng ban đang tải hay lỗi: chưa hiện hàng nào (không đoán trưởng phòng), nút Tạo
		// khoá; lỗi có «Thử lại» gọi lại danh sách phòng ban.
		traLoi.set("onboarding.listTemplates", () => [KHUON_HAI_PHONG]);
		traLoi.set("onboarding.listDepartments", () => new Promise(() => {}));
		await mo(<TaoKeHoach mo doiMo={() => {}} congTyCoDinh={CONG_TY} />);
		await cho(
			() =>
				queryClient.isFetching({
					queryKey: [["onboarding", "listTemplates"]],
				}) === 0,
			"tai khuon",
		);
		await chonTrong(k.template, "Khuôn A");
		await cho(
			() => q('[data-trang-thai="cho-tai"]') !== null,
			"cho tai phong ban",
		);
		const luuCho = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === m.tao.save,
		);
		if (
			q("[data-phong]") !== null ||
			(luuCho as HTMLButtonElement | undefined)?.disabled !== true
		) {
			throw new Error("kh: trang thai o tao sai cho-phong-ban");
		}
		await dongMan();
		let lanPhong = 0;
		traLoi.set("onboarding.listDepartments", () => {
			lanPhong += 1;
			throw new Error("hong");
		});
		await mo(<TaoKeHoach mo doiMo={() => {}} congTyCoDinh={CONG_TY} />);
		await cho(() => queryClient.isFetching() === 0, "tai xong");
		await chonTrong(k.template, "Khuôn A");
		await cho(() => q('[data-trang-thai="loi"]') !== null, "loi phong ban");
		const thuLaiPhong = [
			...document.body.querySelectorAll('[data-trang-thai="loi"] button'),
		].find((b) => b.textContent?.trim() === k.thuLai);
		if (!thuLaiPhong || q("[data-phong]") !== null) {
			throw new Error("kh: trang thai o tao sai loi-phong-ban");
		}
		const truocPhong = lanPhong;
		await bam(thuLaiPhong);
		await cho(() => lanPhong > truocPhong, "thu lai phong ban");
		expect(lan).toBeGreaterThan(truoc);
	});
});

describe("kh-man-loi", () => {
	test("kh-man-loi: máy chủ từ chối «chỉ OKR» — lời lỗi dưới nút, lựa chọn còn nguyên", async () => {
		datChung();
		traLoi.set("onboarding.listTemplates", () => [KHUON_HAI_PHONG]);
		const LOI =
			"Hà mang vai «chỉ OKR» — không làm được bước của phòng Kinh doanh trong kế hoạch đối tác.";
		traLoi.set("onboarding.createFromTemplate", () => {
			throw new Error(LOI);
		});
		await moVaChonKhuon();
		await chonTrong(`${k.nguoiTheoPhong} — Kế toán`, "Uyên");
		const luu = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === m.tao.save,
		);
		if (!luu) throw new Error("kh: khong thay nut tao");
		await bam(luu);
		await cho(
			() => document.body.textContent?.includes(LOI) === true,
			"loi duoi nut",
		);
		const hang = hangPhong();
		if (!hang[1]?.chu.includes("Uyên") || !hang[0]?.chu.includes("Hà")) {
			throw new Error("kh: o tao mat lua chon khi loi");
		}
		expect(hang).toHaveLength(2);
	});
});
