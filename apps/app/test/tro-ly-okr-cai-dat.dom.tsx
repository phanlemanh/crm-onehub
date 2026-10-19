import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	AiChiTieuOutput,
	SoDoNac,
	TroLySoDoOutput,
} from "../../api/src/okr/okr.contracts";

let coQuyen: boolean;
let aiOn: boolean;
let choSo: Promise<void>;
let loiSo: boolean;
let chuaGan: number;
let rong: boolean;
let sanSang: AiChiTieuOutput["sanSang"];
let doiSoat: AiChiTieuOutput["doiSoat"];
let cauHinh: OkrProgramSua;

const chuongTrinh = () => ({
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	aiOn,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiDeXuatAnPhamVi: "tat",
	aiDeXuatAnDonVi: [],
	aiTomTatAnPhamVi: "tat",
	aiTomTatAnDonVi: [],
	aiSoanPhamVi: "tat",
	aiSoanDonVi: [],
	aiSoanAnPhamVi: "tat",
	aiSoanAnDonVi: [],
	aiTranThangUsd: 9,
	aiTranThangDatOkrUsd: null,
	duyetCongBo: false,
	...cauHinh,
	version: 4,
	canManage: coQuyen,
});

const nacRong = (): SoDoNac => ({
	soLuot: 0,
	sinhRa: 0,
	daHien: 0,
	nhan: 0,
	sua: 0,
	bac: 0,
	boQua: 0,
	tyLeNhan: null,
	tyLeSua: null,
	tyLeBac: null,
	tyLeBoQua: null,
	tyLeDuocNhan: null,
	daNhan: 0,
	hoanTac: 0,
	tyLeHoanTac: null,
	soLuotDo: 0,
	p50Ms: null,
	p90Ms: null,
	tongCau: 0,
	biLoai: 0,
	tyLeBiLoai: null,
	theoMa: [],
	tienUsd: 0,
	chiPhiMoiNhanUsd: null,
	chiPhiMoiLuotUsd: null,
});

const soDo = (): TroLySoDoOutput => ({
	thang: "2026-09",
	bat: nacRong(),
	an: nacRong(),
});

const NHOM = [
	["nghien-cuu-danh-ba", 5.84],
	["tro-ly-ai", 1.93],
	["hoi-crm-zalo", 2.71],
	["tac-nhan", 0.64],
	["tro-ly-okr", 2.42],
] as const;

const chiTieu = (): AiChiTieuOutput => {
	if (loiSo) throw new Error("so hong");
	const theoNhom = [
		...NHOM.map(([nhom, usd]) => ({
			nhom,
			soBuoc: rong ? 0 : 10,
			usd: rong ? 0 : usd,
		})),
		{ nhom: "chua-gan" as const, soBuoc: chuaGan > 0 ? 1 : 0, usd: chuaGan },
	];
	return {
		thang: "2026-09",
		theoNhom,
		tongUsd: theoNhom.reduce((s, n) => s + n.usd, 0),
		troLyOkr: { chiUsd: rong ? 0 : 2.42, tranUsd: 9, phanTram: rong ? 0 : 27 },
		sanSang,
		nguonKhoa: null,
		dangKiem: false,
		doiSoat,
	};
};

const CAY = {
	divisions: [
		{
			id: "bp-kd",
			name: "Khối Kinh doanh",
			position: 0,
			head: null,
			departments: [
				{ id: "pb-mk", name: "Phòng Marketing", position: 0, head: null },
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
};

type DauVao = OkrProgramSua | undefined;
let daGoi: { duong: string; dauVao: DauVao }[] = [];
let daDoc: string[] = [];
let daLamMoi = 0;

function thuTuc<TRa>(duong: string, doc: () => TRa = () => null as TRa) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => {
				daDoc.push(duong);
				if (duong === "okr.aiChiTieu") await choSo;
				return doc();
			},
		}),
		mutationOptions: (chon?: {
			onSuccess?: () => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				return { ok: true };
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			program: thuTuc("okr.program", chuongTrinh),
			aiChiTieu: thuTuc("okr.aiChiTieu", chiTieu),
			setProgram: thuTuc("okr.setProgram"),
			troLySoDo: thuTuc("okr.troLySoDo", soDo),
			troLyAn: thuTuc("okr.troLyAn", () => ({ thang: "2026-09", luot: [] })),
			cycles: thuTuc("okr.cycles", () => ({ cycles: [], currentId: null })),
			soanSoDo: thuTuc("okr.soanSoDo"),
			soanAn: thuTuc("okr.soanAn"),
		},
		org: { tree: thuTuc("org.tree", () => CAY) },
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async () => {
			daLamMoi += 1;
		},
	}),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/settings/okr",
}));

const { KhoiTroLyOkr } = await import(
	"@/app/(app)/[slug]/settings/okr/khoi-tro-ly-okr"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { formatMoney } = await import("@crm/ui/lib/format");
const { troLyOkrMessages } = await import("@/lib/messages/tro-ly-okr");

const m = troLyOkrMessages("vi");
const tienVi = (usd: number) => formatMoney(Math.round(usd * 100), "usd", "vi");

type San = { o: HTMLElement; root: Root; client: QueryClient };
let dangMo: San[] = [];

async function mo(): Promise<QueryClient> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<KhoiTroLyOkr />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root, client });
	return client;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
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

async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement)) throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function chonLuaChon(trigger: Element, chu: string): Promise<void> {
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length > 0,
		`mo o chon ${chu}`,
	);
	const lua = [...document.body.querySelectorAll('[role="option"]')].find(
		(o) => o.textContent?.trim() === chu,
	);
	if (!lua) throw new Error(`khong co lua chon ${chu}`);
	await act(async () => {
		lua.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
}

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const chuCua = (chon: string) => q(chon)?.textContent?.trim() ?? "";
const daTaiXong = () =>
	q('[data-the="tro-ly-okr"]:not([aria-busy])') !== null &&
	q('[data-the="so-chi-phi"]:not([aria-busy])') !== null;

beforeEach(() => {
	coQuyen = true;
	aiOn = false;
	choSo = Promise.resolve();
	loiSo = false;
	chuaGan = 0;
	rong = false;
	sanSang = { bat: true, conLaiUsd: 6.58 };
	doiSoat = null;
	cauHinh = {};
	daGoi = [];
	daDoc = [];
	daLamMoi = 0;
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("quan-tri", () => {
	test("hai thẻ có mặt, bảng năm việc với tiền theo Intl của dự án, Chưa gán việc chỉ khi > 0", async () => {
		aiOn = true;
		await mo();
		await cho(daTaiXong, "hai the tai xong");
		const dong = tatCa("[data-nhom]").filter(
			(o) => o.getAttribute("data-nhom") !== "tong",
		);
		expect(dong.map((o) => o.getAttribute("data-nhom"))).toEqual(
			NHOM.map(([n]) => n),
		);
		expect(
			dong.map((o) => o.querySelector("[data-tien]")?.textContent),
		).toEqual(NHOM.map(([, usd]) => tienVi(usd)));
		expect(chuCua('[data-nhom="tong"] [data-tien]')).toBe(
			tienVi(NHOM.reduce((s, [, u]) => s + u, 0)),
		);
		expect(chuCua("[data-tran]")).toContain(
			`${tienVi(2.42)} / ${tienVi(9)} (27%)`,
		);
		const sanSangO = q("[data-san-sang]");
		expect(sanSangO?.textContent).toBe(m.troLy.sanSang.sanSang);
		expect(sanSangO?.closest('[data-slot="card-description"]')).toBeNull();
		expect(sanSangO?.closest('[data-slot="card-content"]')).not.toBeNull();
		const the = tatCa("[data-the]").map((o) => o.getAttribute("data-the"));
		expect(the.indexOf("soan-so-do"), "the soan sau the gop y").toBe(
			the.indexOf("gop-y-so-do") + 1,
		);
		expect(chuCua('[data-the="soan-so-do"] [data-slot="empty-title"]')).toBe(
			"Chu kỳ này chưa có cuộc soạn nào",
		);
	});

	test("Chưa gán việc hiện khi có tiền", async () => {
		chuaGan = 0.07;
		await mo();
		await cho(daTaiXong, "tai xong");
		expect(chuCua('[data-nhom="chua-gan"]')).toContain(m.so.nhom["chua-gan"]);
		expect(chuCua('[data-nhom="chua-gan"] [data-tien]')).toBe(tienVi(0.07));
	});

	test("bật, chọn đơn vị cho góp ý, trần 7,5 → setProgram đúng một lần với trường AI", async () => {
		await mo();
		await cho(daTaiXong, "tai xong");
		const nutLuu = q('[data-nut="luu-tro-ly"]');
		expect(nutLuu?.hasAttribute("disabled")).toBe(true);

		const congTac = q('[data-cong-tac="tro-ly-okr"]');
		if (!congTac) throw new Error("khong co cong tac");
		await bam(congTac);
		await cho(
			() => congTac.getAttribute("aria-checked") === "true",
			"cong tac bat",
		);

		const phamVi = q('[data-pham-vi="de-xuat"]');
		if (!phamVi) throw new Error("khong co o pham vi");
		await chonLuaChon(phamVi, m.troLy.phamVi["danh-sach"]);
		await cho(
			() => q('[data-nut="chon-don-vi-de-xuat"]') !== null,
			"nut chon don vi",
		);
		const nutChon = q('[data-nut="chon-don-vi-de-xuat"]');
		if (!nutChon) throw new Error("khong co nut chon don vi");
		await bam(nutChon);
		await cho(
			() => q('[data-slot="pick-list-item"][data-id="bp-kd"]') !== null,
			"hop chon don vi",
		);
		const hop = q('[data-slot="pick-list-item"][data-id="bp-kd"] button');
		if (!hop) throw new Error("khong co o chon bo phan");
		await bam(hop);
		const xacNhan = tatCa('[role="dialog"] button').find(
			(o) => o.textContent?.trim() === m.troLy.hop.xacNhan(1),
		);
		if (!xacNhan) throw new Error("khong co nut xac nhan");
		await bam(xacNhan);
		await cho(() => q('[role="dialog"]') === null, "dong hop");
		expect(chuCua('[data-viec="de-xuat"] ul')).toBe("Khối Kinh doanh");

		await go(q("[data-o-tran-ai]"), "7,5");
		const luu = q('[data-nut="luu-tro-ly"]');
		if (!luu) throw new Error("khong co nut luu");
		expect(luu.hasAttribute("disabled")).toBe(false);
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		expect(daGoi).toEqual([
			{
				duong: "okr.setProgram",
				dauVao: {
					aiOn: true,
					aiDeXuatPhamVi: "danh-sach",
					aiDeXuatDonVi: ["bp-kd"],
					aiTomTatPhamVi: "tat",
					aiTomTatDonVi: [],
					aiDeXuatAnPhamVi: "tat",
					aiDeXuatAnDonVi: [],
					aiTomTatAnPhamVi: "tat",
					aiTomTatAnDonVi: [],
					aiSoanPhamVi: "tat",
					aiSoanDonVi: [],
					aiSoanAnPhamVi: "tat",
					aiSoanAnDonVi: [],
					aiTranThangUsd: 7.5,
					aiTranThangDatOkrUsd: null,
				},
			},
		]);
	});

	test("trần sai khoá Lưu và hiện lỗi dưới ô", async () => {
		await mo();
		await cho(daTaiXong, "tai xong");
		await go(q("[data-o-tran-ai]"), "-1");
		expect(q('[data-nut="luu-tro-ly"]')?.hasAttribute("disabled")).toBe(true);
		expect(document.body.textContent).toContain(m.troLy.tranHong);
		await go(q("[data-o-tran-ai]"), "abc");
		expect(q('[data-nut="luu-tro-ly"]')?.hasAttribute("disabled")).toBe(true);
	});
});

describe("trang-thai", () => {
	test("đang tải: cả hai thẻ aria-busy khi sổ chưa về", async () => {
		let tha = () => {};
		choSo = new Promise((r) => {
			tha = r;
		});
		await mo();
		await cho(
			() =>
				q('[data-the="tro-ly-okr"][aria-busy="true"]') !== null &&
				q('[data-the="so-chi-phi"][aria-busy="true"]') !== null,
			"hai the dang tai",
		);
		await act(async () => tha());
		await cho(daTaiXong, "tai xong");
	});

	test("rỗng: tháng chưa có lượt AI nào", async () => {
		rong = true;
		await mo();
		await cho(daTaiXong, "tai xong");
		expect(
			chuCua('[data-the="so-chi-phi"] [data-trang-thai="rong"]'),
		).toContain(m.so.rong);
	});

	test("lỗi: nút thử lại gọi lại sổ chi phí", async () => {
		loiSo = true;
		await mo();
		await cho(
			() => q('[data-the="so-chi-phi"] [data-trang-thai="loi"]') !== null,
			"the loi",
		);
		const truoc = daDoc.filter((d) => d === "okr.aiChiTieu").length;
		loiSo = false;
		const thuLai = q('[data-nut="thu-lai-so"]');
		if (!thuLai) throw new Error("khong co nut thu lai");
		await bam(thuLai);
		await cho(daTaiXong, "tai lai xong");
		expect(daDoc.filter((d) => d === "okr.aiChiTieu").length).toBe(truoc + 1);
	});

	test("chỉ báo sẵn sàng: chưa có khoá mô hình, chạm trần có ngày 01/MM", async () => {
		const chay = async (s: AiChiTieuOutput["sanSang"]) => {
			sanSang = s;
			aiOn = true;
			await mo();
			await cho(daTaiXong, "tai xong");
			const chu = chuCua("[data-san-sang]");
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
			return chu;
		};
		const khongKhoa = await chay({ bat: false, lyDo: "chua-co-khoa-mo-hinh" });
		expect(khongKhoa).toContain("Chưa sẵn sàng");
		expect(khongKhoa).toContain(m.troLy.sanSang.lyDo["chua-co-khoa-mo-hinh"]);
		expect(await chay({ bat: false, lyDo: "het-tran-thang" })).toBe(
			m.troLy.sanSang.hetTran("01/10"),
		);
		expect(await chay({ bat: true, conLaiUsd: 1 })).toBe(
			m.troLy.sanSang.sanSang,
		);
	});

	test("dòng đối soát: chưa có, khớp, lệch, không đối soát được", async () => {
		const d = m.so.doiSoat;
		const ca: [AiChiTieuOutput["doiSoat"], string][] = [
			[null, d.chuaCo],
			[
				{
					thang: "2026-08",
					soSoUsd: 1,
					soGatewayUsd: 1.03,
					lechPhanTram: 3,
					ketQua: "khop",
					lyDo: null,
					luc: new Date(),
				},
				d.khop("08/2026", "3"),
			],
			[
				{
					thang: "2026-08",
					soSoUsd: 1,
					soGatewayUsd: 1.14,
					lechPhanTram: 14,
					ketQua: "lech",
					lyDo: null,
					luc: new Date(),
				},
				d.lech("08/2026", "14"),
			],
			[
				{
					thang: "2026-08",
					soSoUsd: 1,
					soGatewayUsd: null,
					lechPhanTram: null,
					ketQua: "khong-doi-soat-duoc",
					lyDo: "khong-co-khoa-rieng",
					luc: new Date(),
				},
				d.khongDuoc("08/2026", d.khongCoKhoaRieng),
			],
		];
		for (const [ds, chu] of ca) {
			doiSoat = ds;
			await mo();
			await cho(daTaiXong, "tai xong");
			expect(chuCua("[data-doi-soat]")).toBe(chu);
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
		}
	});
});

describe("thanh-vien", () => {
	test("thành viên không thấy hai thẻ và không gọi sổ chi phí", async () => {
		coQuyen = false;
		await mo();
		await cho(() => daDoc.includes("okr.program"), "doc chuong trinh");
		for (let i = 0; i < 5; i += 1) {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
		expect(
			{
				the: tatCa("[data-the]").length,
				goiSo: daDoc.filter((d) => d === "okr.aiChiTieu").length,
			},
			"lo khoi AI cho thanh vien",
		).toEqual({ the: 0, goiSo: 0 });
	});
});

const VIEC = ["de-xuat", "tom-tat-tuan"] as const;

const nhanTrongHop = () =>
	tatCa('[data-slot="pick-list-item"]').map((o) => o.getAttribute("data-id"));

async function moHopAn(viec: string): Promise<void> {
	const nut = q(`[data-nut="chon-don-vi-an-${viec}"]`);
	if (!nut) throw new Error(`khong co nut chon don vi an ${viec}`);
	await bam(nut);
	await cho(
		() => q('[data-slot="pick-list-item"]') !== null,
		"hop chon don vi an",
	);
}

describe("nac", () => {
	test("nac: mỗi việc có hai dòng «Bật cho» và «Chế độ ẩn cho», mỗi dòng ba lựa chọn", async () => {
		aiOn = true;
		await mo();
		await cho(daTaiXong, "tai xong");
		for (const viec of VIEC) {
			expect(
				tatCa(`[data-viec="${viec}"] [data-nac] [data-slot="field-label"]`).map(
					(o) => o.textContent?.trim(),
				),
				`hai dong nac cua ${viec}`,
			).toEqual([m.troLy.nac.bat, m.troLy.nac.an]);
		}
		expect(m.troLy.nac).toEqual({ bat: "Bật cho", an: "Chế độ ẩn cho" });
		expect(
			chuCua(
				'[data-viec="de-xuat"] [data-nac="an"] [data-slot="field-description"]',
			),
		).toBe(
			"Kara góp ý khi Mục tiêu được lưu; chỉ quản trị thấy kết quả, ở thẻ bên dưới.",
		);
		const an = q('[data-pham-vi-an="de-xuat"]');
		if (!an) throw new Error("khong co o che do an");
		await bam(an);
		await cho(() => tatCa('[role="option"]').length > 0, "mo o chon che do an");
		expect(tatCa('[role="option"]').map((o) => o.textContent?.trim())).toEqual([
			m.troLy.phamVi.tat,
			m.troLy.phamVi["toan-cong-ty"],
			m.troLy.phamVi["danh-sach"],
		]);
	});

	test("nac: chọn toàn công ty ở Bật cho khoá Chế độ ẩn cho, kèm «mọi đơn vị đã bật»", async () => {
		aiOn = true;
		cauHinh = { aiDeXuatAnPhamVi: "danh-sach", aiDeXuatAnDonVi: ["pb-mk"] };
		await mo();
		await cho(daTaiXong, "tai xong");
		const an = () => q('[data-pham-vi-an="de-xuat"]');
		expect(an()?.hasAttribute("disabled"), "o an khoa khi chua bat toan").toBe(
			false,
		);
		const bat = q('[data-pham-vi="de-xuat"]');
		if (!bat) throw new Error("khong co o bat");
		await chonLuaChon(bat, m.troLy.phamVi["toan-cong-ty"]);
		await cho(
			() =>
				chuCua('[data-pham-vi="de-xuat"]') === m.troLy.phamVi["toan-cong-ty"],
			"bat toan cong ty",
		);
		const dongAn = q('[data-viec="de-xuat"] [data-nac="an"]');
		expect(
			{
				khoa: an()?.hasAttribute("disabled"),
				nut: q('[data-nut="chon-don-vi-an-de-xuat"]') !== null,
				moTa: dongAn
					?.querySelector('[data-slot="field-description"]')
					?.textContent?.trim(),
			},
			"an khong khoa khi bat toan",
		).toEqual({ khoa: true, nut: false, moTa: m.troLy.khoaAn });
		expect(m.troLy.khoaAn.toLowerCase()).toContain("mọi đơn vị đã bật");
		expect(
			q('[data-viec="tom-tat-tuan"] [data-pham-vi-an]')?.hasAttribute(
				"disabled",
			),
			"viec kia khong bi khoa theo",
		).toBe(false);
	});

	test("nac: cấu hình đã lưu bật toàn công ty thì dòng chế độ ẩn khoá ngay khi mở", async () => {
		aiOn = true;
		cauHinh = { aiTomTatPhamVi: "toan-cong-ty" };
		await mo();
		await cho(daTaiXong, "tai xong");
		expect(
			{
				khoa: q('[data-pham-vi-an="tom-tat-tuan"]')?.hasAttribute("disabled"),
				moTa: chuCua(
					'[data-viec="tom-tat-tuan"] [data-nac="an"] [data-slot="field-description"]',
				),
			},
			"an khong khoa khi bat toan",
		).toEqual({ khoa: true, moTa: m.troLy.khoaAn });
	});

	test("nac: bật toàn công ty rồi Lưu — gói gửi chế độ ẩn tắt, không mang danh sách ẩn cũ", async () => {
		aiOn = true;
		cauHinh = { aiDeXuatAnPhamVi: "danh-sach", aiDeXuatAnDonVi: ["pb-mk"] };
		await mo();
		await cho(daTaiXong, "tai xong");
		const bat = q('[data-pham-vi="de-xuat"]');
		if (!bat) throw new Error("khong co o bat");
		await chonLuaChon(bat, m.troLy.phamVi["toan-cong-ty"]);
		await cho(
			() =>
				chuCua('[data-pham-vi="de-xuat"]') === m.troLy.phamVi["toan-cong-ty"],
			"bat toan cong ty",
		);
		const luu = q('[data-nut="luu-tro-ly"]');
		if (!luu) throw new Error("khong co nut luu");
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		const vao = daGoi[0]?.dauVao;
		expect(
			{
				bat: vao?.aiDeXuatPhamVi,
				an: vao?.aiDeXuatAnPhamVi,
				anDonVi: vao?.aiDeXuatAnDonVi,
			},
			"an con song khi bat toan",
		).toEqual({ bat: "toan-cong-ty", an: "tat", anDonVi: [] });
		expect(chuCua('[data-pham-vi-an="de-xuat"]')).toBe(m.troLy.phamVi.tat);
	});

	test("nac: danh sách chế độ ẩn không cho chọn đơn vị đã ở danh sách bật", async () => {
		aiOn = true;
		cauHinh = {
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: ["bp-kd"],
			aiDeXuatAnPhamVi: "danh-sach",
			aiDeXuatAnDonVi: [],
		};
		await mo();
		await cho(daTaiXong, "tai xong");
		await moHopAn("de-xuat");
		expect(nhanTrongHop(), "an cho chon don vi da bat").toEqual(["onehub"]);
	});

	test("nac: Lưu gửi đúng các trường AI, danh sách ẩn bỏ đơn vị đã bật", async () => {
		aiOn = true;
		cauHinh = {
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: ["pb-mk"],
		};
		await mo();
		await cho(daTaiXong, "tai xong");

		const an = q('[data-pham-vi-an="de-xuat"]');
		if (!an) throw new Error("khong co o an");
		await chonLuaChon(an, m.troLy.phamVi["danh-sach"]);
		await cho(
			() => q('[data-nut="chon-don-vi-an-de-xuat"]') !== null,
			"nut chon don vi an",
		);
		expect(
			chuCua(
				'[data-viec="de-xuat"] [data-nac="an"] [data-slot="field-description"]',
			),
		).toBe(m.troLy.chuaChonDonViAn);
		await moHopAn("de-xuat");
		expect(nhanTrongHop()).toEqual(["onehub", "bp-kd"]);
		const hop = q('[data-slot="pick-list-item"][data-id="bp-kd"] button');
		if (!hop) throw new Error("khong co o bo phan");
		await bam(hop);
		const xacNhan = tatCa('[role="dialog"] button').find(
			(o) => o.textContent?.trim() === m.troLy.hop.xacNhan(1),
		);
		if (!xacNhan) throw new Error("khong co nut xac nhan");
		await bam(xacNhan);
		await cho(() => q('[role="dialog"]') === null, "dong hop");
		expect(chuCua('[data-viec="de-xuat"] [data-nac="an"] ul')).toBe(
			"Khối Kinh doanh",
		);

		const anTomTat = q('[data-pham-vi-an="tom-tat-tuan"]');
		if (!anTomTat) throw new Error("khong co o an tom tat");
		await chonLuaChon(anTomTat, m.troLy.phamVi["toan-cong-ty"]);
		await cho(
			() =>
				chuCua('[data-pham-vi-an="tom-tat-tuan"]') ===
				m.troLy.phamVi["toan-cong-ty"],
			"an tom tat toan cong ty",
		);

		const luu = q('[data-nut="luu-tro-ly"]');
		if (!luu) throw new Error("khong co nut luu");
		expect(luu.hasAttribute("disabled")).toBe(false);
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		expect(daGoi).toEqual([
			{
				duong: "okr.setProgram",
				dauVao: {
					aiOn: true,
					aiDeXuatPhamVi: "danh-sach",
					aiDeXuatDonVi: ["pb-mk"],
					aiTomTatPhamVi: "tat",
					aiTomTatDonVi: [],
					aiDeXuatAnPhamVi: "danh-sach",
					aiDeXuatAnDonVi: ["bp-kd"],
					aiTomTatAnPhamVi: "toan-cong-ty",
					aiTomTatAnDonVi: [],
					aiSoanPhamVi: "tat",
					aiSoanDonVi: [],
					aiSoanAnPhamVi: "tat",
					aiSoanAnDonVi: [],
					aiTranThangUsd: 9,
					aiTranThangDatOkrUsd: null,
				},
			},
		]);
	});

	test("nac: đơn vị đã bật sau khi chọn ẩn thì không còn trong danh sách ẩn khi lưu", async () => {
		aiOn = true;
		cauHinh = {
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: ["bp-kd"],
			aiDeXuatAnPhamVi: "danh-sach",
			aiDeXuatAnDonVi: ["onehub", "pb-mk"],
		};
		await mo();
		await cho(daTaiXong, "tai xong");
		expect(chuCua('[data-viec="de-xuat"] [data-nac="an"] ul')).toBe(
			m.troLy.hop.onehub,
		);
		await go(q("[data-o-tran-ai]"), "8");
		const luu = q('[data-nut="luu-tro-ly"]');
		if (!luu) throw new Error("khong co nut luu");
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		expect(daGoi[0]?.dauVao?.aiDeXuatAnDonVi).toEqual(["onehub"]);
	});

	test("nac: thành viên không thấy thẻ Kara · OKR, thẻ Góp ý và không gọi số đo", async () => {
		coQuyen = false;
		await mo();
		await cho(() => daDoc.includes("okr.program"), "doc chuong trinh");
		for (let i = 0; i < 5; i += 1) {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
		expect(
			{
				the: tatCa("[data-the]").length,
				goi: daDoc.filter((d) => d !== "okr.program" && d !== "org.tree"),
			},
			"lo the tro ly cho thanh vien",
		).toEqual({ the: 0, goi: [] });
	});
});
