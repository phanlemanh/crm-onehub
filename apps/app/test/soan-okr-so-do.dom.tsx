import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { BUOC_CAT } from "@crm/validation/okr-cuoc-soan";
import { MA_LOAI_BAN_NHAP } from "@crm/validation/okr-kiem-ban-nhap";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type CuocSoanOutput,
	type DongSoanOutput,
	type SoanAnOutput,
	type SoanSoDoOutput,
	type SoDoSoanNac,
	soanAnOutput,
	soDoSoanNac,
} from "../../api/src/okr/okr.contracts";

const HANG_SO = Object.keys(soDoSoanNac.shape).filter((k) => k !== "theoMa");

type Vao = { cycleId?: string; cuocSoanId?: string } | undefined;

let rong = false;
let loiSoDo = false;
let loiAn = false;
let loiChuKy = false;
let khongChuKy = false;
let quanTri = true;
let choSoDo: Promise<void> = Promise.resolve();
let daDoc: { duong: string; vao: Vao }[] = [];

const nac = (chon: Partial<SoDoSoanNac> = {}): SoDoSoanNac => ({
	cuocMo: 0,
	cuocDuaVao: 0,
	dongNhan: 0,
	dongSua: 0,
	dongBac: 0,
	dongBiLoai: 0,
	theoMa: [],
	mucTieuNhap: 0,
	mucTieuCongBo14Ngay: 0,
	tyLeCongBo14Ngay: null,
	chiPhiMoiCuocUsd: null,
	p50Ms: null,
	p90Ms: null,
	donViCoCuoc: 0,
	donViHoanTat: 0,
	tyLeDonViHoanTat: null,
	daHien: 0,
	tyLeDuocNhan: null,
	tienUsd: 0,
	...chon,
});

const CUOC_GOC: CuocSoanOutput = {
	id: "c-bat-1",
	cycleId: "q1-2027",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb-bac",
	tenDonVi: "Kinh doanh miền Bắc",
	tenChuKy: "Quý 1 · 2027",
	nguoiMo: { id: "hai", name: "Trần Minh Hải" },
	sessionId: "wrun_bat",
	nac: "bat",
	trangThai: "da-dua-vao",
	soLuot: 4,
	tranLuot: 12,
	moLuc: "2026-11-26T18:30:00.000Z",
	duaVaoLuc: "2026-11-27T03:00:00.000Z",
	soDongNhan: 7,
	soDongTong: 11,
};

const CUOC_AN: CuocSoanOutput = {
	...CUOC_GOC,
	id: "c-an-1",
	departmentId: "pb-nam",
	tenDonVi: "Kinh doanh miền Nam",
	sessionId: "wrun_an",
	nac: "an",
	trangThai: "dang",
	soLuot: 5,
	moLuc: "2026-11-29T02:00:00.000Z",
	duaVaoLuc: null,
	soDongNhan: 0,
	soDongTong: 3,
};

const SO_DO: SoanSoDoOutput = {
	cycleId: "q1-2027",
	bat: nac({
		cuocMo: 4,
		cuocDuaVao: 2,
		dongNhan: 9,
		dongSua: 2,
		dongBac: 3,
		dongBiLoai: 3,
		theoMa: [
			{ maLoai: "so-moi", so: 2 },
			{ maLoai: "tu-cam", so: 1 },
		],
		mucTieuNhap: 5,
		mucTieuCongBo14Ngay: 3,
		tyLeCongBo14Ngay: 0.6,
		chiPhiMoiCuocUsd: 0.12,
		p50Ms: 9400,
		p90Ms: 18100,
		donViCoCuoc: 3,
		donViHoanTat: 2,
		tyLeDonViHoanTat: 0.6667,
		daHien: 14,
		tyLeDuocNhan: 0.7857,
		tienUsd: 0.48,
	}),
	an: nac({
		cuocMo: 2,
		dongBiLoai: 1,
		theoMa: [{ maLoai: "so-moi", so: 1 }],
		chiPhiMoiCuocUsd: 0.19,
		p50Ms: 9800,
		p90Ms: 19600,
		donViCoCuoc: 1,
		tyLeDonViHoanTat: 0,
		daHien: 2,
		tienUsd: 0.38,
	}),
	cuocGanDay: [
		{ ...CUOC_AN, chiPhiUsd: 0.24 },
		{ ...CUOC_GOC, chiPhiUsd: 0.19 },
	],
};

const SO_DO_RONG: SoanSoDoOutput = {
	cycleId: "q1-2027",
	bat: nac(),
	an: nac(),
	cuocGanDay: [],
};

const gocDong = {
	viSao: "Vì miền Nam mất dấu thoả thuận.",
	giaTriCuoi: null,
	taoRaId: null,
};

const DONG_AN: DongSoanOutput[] = [
	{
		...gocDong,
		id: "n1",
		khoa: "m1",
		khoaDong: "muc-tieu-moi:khong thoa thuan nao",
		loai: "muc-tieu-moi",
		ten: "Không thoả thuận nào của miền Nam bị mất dấu",
		viSaoLucNay: "Đầu quý là mùa ký lại.",
		loaiMucTieu: "cam-ket",
		trangThai: "cho",
		maLoai: null,
	},
	{
		...gocDong,
		id: "n3",
		khoa: "k3",
		khoaDong: "kr-moi:doanh thu tuyen",
		chaKhoa: "m1",
		loai: "kr-moi",
		ten: "Doanh thu tuyến Sài Gòn – Cần Thơ đạt 3,8 tỉ",
		kieu: "tang-toi",
		donVi: "tỉ",
		khoiDiemGoiY: null,
		trangThai: "bi-loai",
		maLoai: "so-moi",
	},
];

const AN = new Map<string, SoanAnOutput>([
	[
		"c-an-1",
		soanAnOutput.parse({
			cuoc: { ...CUOC_AN, chiPhiUsd: 0.24 },
			dong: DONG_AN,
			daCat: {
				buoc: ["3-tom-gon", "ngang-cap"],
				truocToken: 41200,
				sauToken: 30500,
				chienLuocCatKyTu: 0,
			},
		}),
	],
	[
		"c-bat-1",
		soanAnOutput.parse({
			cuoc: { ...CUOC_GOC, chiPhiUsd: 0.19 },
			dong: [{ ...DONG_AN[0], id: "b1", trangThai: "nhan" }],
			daCat: null,
		}),
	],
]);

const CHU_KY = {
	cycles: [
		{
			id: "q4-2026",
			kind: "quy",
			name: "Quý 4 · 2026",
			parentId: null,
			startsOn: "2026-10-01",
			endsOn: "2026-12-31",
			phase: "dang-chay",
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
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
		},
		{
			id: "q1-2027",
			kind: "quy",
			name: "Quý 1 · 2027",
			parentId: null,
			startsOn: "2027-01-01",
			endsOn: "2027-03-31",
			phase: "lap-ke-hoach",
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
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
		},
	],
	currentId: "q4-2026",
};

const DU_LIEU = new Map<string, (vao: Vao) => Promise<unknown>>([
	[
		"okr.cycles",
		async () => {
			if (loiChuKy) throw new Error("chu ky hong");
			return khongChuKy ? { cycles: [], currentId: null } : CHU_KY;
		},
	],
	["okr.program", async () => ({ canManage: quanTri })],
	[
		"okr.soanSoDo",
		async () => {
			await choSoDo;
			if (loiSoDo) throw new Error("so do hong");
			return rong ? SO_DO_RONG : SO_DO;
		},
	],
	[
		"okr.soanAn",
		async (vao) => {
			if (loiAn) throw new Error("an hong");
			const ra = AN.get(vao?.cuocSoanId ?? "");
			if (!ra) throw new Error("khong co cuoc");
			return ra;
		},
	],
]);

function thuTuc(duong: string) {
	return {
		queryKey: (vao?: Vao) => [duong, vao],
		pathKey: () => [duong],
		queryOptions: (vao?: Vao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [duong, "bo-qua"], queryFn: skipToken }
				: {
						queryKey: [duong, vao ?? null],
						queryFn: async () => {
							daDoc.push({ duong, vao });
							const lay = DU_LIEU.get(duong);
							if (!lay) throw new Error(`khong gia: ${duong}`);
							return lay(vao);
						},
					},
		mutationOptions: () => ({
			mutationKey: [duong],
			mutationFn: async () => {
				throw new Error(`khong gia: ${duong}`);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy(
			{},
			{
				get: (_g, khong: string) =>
					new Proxy(
						{},
						{ get: (_h, ten: string) => thuTuc(`${khong}.${ten}`) },
					),
			},
		),
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

const { TheSoanSoDo } = await import(
	"@/app/(app)/[slug]/settings/okr/the-soan-so-do"
);
const { KhoiTroLyOkr } = await import(
	"@/app/(app)/[slug]/settings/okr/khoi-tro-ly-okr"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");

const m = okrSoanMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(
	searchParams = "",
	man: ReactElement = <TheSoanSoDo />,
): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={searchParams} hasMemory>
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

async function bam(o: Element | null): Promise<void> {
	if (!o) throw new Error("khong co phan tu de bam");
	await act(async () => {
		(o as HTMLElement).click();
	});
}

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const chuCua = (chon: string) => q(chon)?.textContent?.trim() ?? "";
const coSo = () =>
	q('[data-the="soan-so-do"] [data-so-do="cuocMo"] [data-cot="bat"]') !== null;
const goiCua = (duong: string) => daDoc.filter((d) => d.duong === duong);

beforeEach(() => {
	rong = false;
	loiSoDo = false;
	loiAn = false;
	loiChuKy = false;
	khongChuKy = false;
	quanTri = true;
	choSoDo = Promise.resolve();
	daDoc = [];
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("bang so", () => {
	test("bang co du hang theo khuon dau ra soanSoDo, hai cot Bat · An", async () => {
		await mo();
		await cho(coSo, "tai xong");
		const thieu = HANG_SO.filter(
			(k) => q(`[data-the="soan-so-do"] [data-so-do="${k}"]`) === null,
		);
		expect(thieu.map((k) => `thieu hang: ${k}`)).toEqual([]);
		expect(
			tatCa('[data-bang="so-do-soan"] thead th').map((o) =>
				o.textContent?.trim(),
			),
		).toEqual([m.soDo.cotSo, m.soDo.nacTen.bat, m.soDo.nacTen.an]);
		expect(chuCua('[data-so-do="cuocMo"] [data-cot="bat"]')).toBe("4");
		expect(chuCua('[data-so-do="chiPhiMoiCuocUsd"] [data-cot="bat"]')).toBe(
			"0,12 US$",
		);
		expect(
			tatCa("[data-so-do][data-sub]").map((o) => o.getAttribute("data-so-do")),
		).toEqual(["ma-so-moi", "ma-tu-cam"]);
	});

	test("mỗi hàng mang đúng số của hai nấc, số trống hiện gạch", async () => {
		await mo();
		await cho(coSo, "tai xong");
		const o = (hang: string) => [
			chuCua(`[data-so-do="${hang}"] [data-cot="bat"]`),
			chuCua(`[data-so-do="${hang}"] [data-cot="an"]`),
		];
		expect(
			Object.fromEntries(
				[
					"cuocDuaVao",
					"tyLeDonViHoanTat",
					"tyLeDuocNhan",
					"dongBiLoai",
					"ma-so-moi",
					"ma-tu-cam",
					"mucTieuCongBo14Ngay",
					"tyLeCongBo14Ngay",
					"p50Ms",
					"p90Ms",
					"tienUsd",
				].map((h) => [h, o(h)]),
			),
		).toEqual({
			cuocDuaVao: ["2", "0"],
			tyLeDonViHoanTat: ["67%", "0%"],
			tyLeDuocNhan: ["79%", "—"],
			dongBiLoai: ["3", "1"],
			"ma-so-moi": ["2", "1"],
			"ma-tu-cam": ["1", "0"],
			mucTieuCongBo14Ngay: ["3", "0"],
			tyLeCongBo14Ngay: ["60%", "—"],
			p50Ms: ["9,4 giây", "9,8 giây"],
			p90Ms: ["18,1 giây", "19,6 giây"],
			tienUsd: ["0,48 US$", "0,38 US$"],
		});
		expect(chuCua('[data-so-do="ma-so-moi"] [data-cot="nhan"]')).toBe(
			m.soDo.maLoai["so-moi"],
		);
		expect(chuCua('[data-so-do="mucTieuCongBo14Ngay"] [data-cot="nhan"]')).toBe(
			m.soDo.hang.mucTieuCongBo14Ngay,
		);
	});

	test("số đo của chu kỳ đang lập kế hoạch, tên chu kỳ không bị dịch", async () => {
		await mo();
		await cho(coSo, "tai xong");
		expect(goiCua("okr.soanSoDo").map((g) => g.vao)).toEqual([
			{ cycleId: "q1-2027" },
		]);
		expect(
			q('[data-the="soan-so-do"] [data-slot="card-title"] [translate="no"]')
				?.textContent,
		).toBe("Quý 1 · 2027");
	});
});

describe("trang thai", () => {
	test("đang tải: thẻ aria-busy với khung xương khi số đo chưa về", async () => {
		let tha = () => {};
		choSoDo = new Promise((r) => {
			tha = r;
		});
		await mo();
		await cho(
			() => q('[data-the="soan-so-do"][aria-busy="true"]') !== null,
			"the dang tai",
		);
		expect(
			tatCa('[data-the="soan-so-do"] [data-slot="skeleton"]').length,
		).toBeGreaterThan(0);
		await act(async () => tha());
		await cho(coSo, "tai xong");
		expect(q('[data-the="soan-so-do"][aria-busy]')).toBeNull();
	});

	test("rong: chu ky chua co cuoc", async () => {
		rong = true;
		await mo();
		await cho(
			() => q('[data-the="soan-so-do"] [data-trang-thai="rong"]') !== null,
			"the rong",
		);
		expect(m.soDo.rong).toBe("Chu kỳ này chưa có cuộc soạn nào");
		expect(chuCua('[data-trang-thai="rong"] [data-slot="empty-title"]')).toBe(
			m.soDo.rong,
		);
		expect(q('[data-bang="so-do-soan"]')).toBeNull();
		expect(q('[data-bang="cuoc-soan"]')).toBeNull();
	});

	test("loi co Thu lai goi lai soanSoDo", async () => {
		loiSoDo = true;
		await mo();
		await cho(
			() => q('[data-the="soan-so-do"] [data-trang-thai="loi"]') !== null,
			"the loi",
		);
		expect(chuCua('[data-trang-thai="loi"] [data-slot="empty-title"]')).toBe(
			m.soDo.loi,
		);
		const truoc = goiCua("okr.soanSoDo").length;
		loiSoDo = false;
		await bam(q('[data-the="soan-so-do"] [data-nut="thu-lai"]'));
		await cho(coSo, "tai lai xong");
		expect(goiCua("okr.soanSoDo").length).toBe(truoc + 1);
	});
});

describe("chu ky loi", () => {
	test("chu kỳ lỗi, Thử lại hồi về không có chu kỳ: hiện rỗng, không kẹt ở lỗi", async () => {
		loiChuKy = true;
		await mo();
		await cho(
			() => q('[data-the="soan-so-do"] [data-trang-thai="loi"]') !== null,
			"the loi",
		);
		loiChuKy = false;
		khongChuKy = true;
		await bam(q('[data-the="soan-so-do"] [data-nut="thu-lai"]'));
		await cho(
			() => q('[data-the="soan-so-do"] [data-trang-thai="rong"]') !== null,
			"ket o loi",
		);
		expect(chuCua('[data-trang-thai="rong"] [data-slot="empty-title"]')).toBe(
			m.soDo.rong,
		);
		expect(goiCua("okr.soanSoDo")).toHaveLength(0);
	});

	test("chu kỳ lỗi, Thử lại hồi về có chu kỳ: đọc số đo và hiện bảng", async () => {
		loiChuKy = true;
		await mo();
		await cho(
			() => q('[data-the="soan-so-do"] [data-trang-thai="loi"]') !== null,
			"the loi",
		);
		loiChuKy = false;
		await bam(q('[data-the="soan-so-do"] [data-nut="thu-lai"]'));
		await cho(coSo, "tai lai xong");
		expect(goiCua("okr.soanSoDo").map((g) => g.vao)).toEqual([
			{ cycleId: "q1-2027" },
		]);
	});
});

describe("cuoc gan day", () => {
	test("bảng cuộc: cả hai nấc, mới nhất trước, tên đơn vị không bị dịch", async () => {
		await mo();
		await cho(coSo, "tai xong");
		expect(
			tatCa('[data-bang="cuoc-soan"] [data-cuoc-soan]').map((o) => [
				o.getAttribute("data-cuoc-soan"),
				o.querySelector('[data-cot="nac"]')?.textContent?.trim(),
				o.querySelector('[data-cot="luot"]')?.textContent?.trim(),
				o.querySelector('[data-cot="dong"]')?.textContent?.trim(),
				o.querySelector('[data-cot="chi-phi"]')?.textContent?.trim(),
			]),
		).toEqual([
			["c-an-1", m.soDo.nac.an, "5", "0/3", "0,24 US$"],
			["c-bat-1", m.soDo.nac.bat, "4", "7/11", "0,19 US$"],
		]);
		expect(
			q('[data-cuoc-soan="c-bat-1"] [data-nut="mo-cuoc"] [translate="no"]')
				?.textContent,
		).toBe("Kinh doanh miền Bắc");
		expect(chuCua('[data-cuoc-soan="c-bat-1"] [data-ngay]')).toBe("27/11");
	});

	test("bấm một cuộc mở ngăn và đọc cuộc đó qua soanAn", async () => {
		await mo();
		await cho(coSo, "tai xong");
		expect(q("[data-ngan-cuoc]")).toBeNull();
		await bam(q('[data-cuoc-soan="c-bat-1"] [data-nut="mo-cuoc"]'));
		await cho(
			() => q('[data-ngan-cuoc="c-bat-1"] [data-dong]') !== null,
			"ngan",
		);
		expect(goiCua("okr.soanAn").map((g) => g.vao)).toEqual([
			{ cuocSoanId: "c-bat-1" },
		]);
		expect(
			q("[data-ngan-cuoc] [data-slot='sheet-title']")?.getAttribute(
				"translate",
			),
		).toBe("no");
		expect(chuCua('[data-ngan-cuoc] [data-slot="sheet-description"]')).toBe(
			`${m.soDo.nac.bat} · ${m.soDo.luot("4")} · 0,19 US$ · 27/11`,
		);
		expect(chuCua("[data-ngan-cuoc] [data-ghi-chu]")).toBe(m.soDo.ghiChu.bat);
		expect(chuCua('[data-ngan-cuoc] [data-da-cat="khong"]')).toBe(
			m.soDo.daCat.khong,
		);
		expect(q('[data-bang="da-cat"]')).toBeNull();
	});
});

describe("ngan", () => {
	test("ngan mot cuoc hien dong bi loai kem ma", async () => {
		await mo("?cuocSoanAn=c-an-1");
		await cho(() => q("[data-ngan-cuoc] [data-dong]") !== null, "ngan");
		expect(
			tatCa("[data-ngan-cuoc] [data-dong]").map((o) =>
				o.querySelector("[data-trang-thai-dong]")?.textContent?.trim(),
			),
		).toEqual([m.soDo.trangThai.cho, m.soDo.biLoaiMa(m.soDo.maLoai["so-moi"])]);
		expect(chuCua('[data-dong="n3"] [data-ma-loai]')).toBe("so-moi");
		expect(
			tatCa("[data-ngan-cuoc] [data-dong] [data-slot='item-title']").map((o) =>
				o.getAttribute("translate"),
			),
		).toEqual(["no", "no"]);
		expect(chuCua("[data-ngan-cuoc] [data-ghi-chu]")).toBe(m.soDo.ghiChu.an);
	});

	test("bảng đã cắt: các bước cắt và cỡ gói trước, sau", async () => {
		await mo("?cuocSoanAn=c-an-1");
		await cho(() => q('[data-bang="da-cat"]') !== null, "bang da cat");
		const o = (hang: string) =>
			chuCua(
				`[data-bang="da-cat"] [data-da-cat="${hang}"] [data-cot="gia-tri"]`,
			);
		expect(o("buoc")).toBe(
			[
				m.soDo.daCat.tenBuoc["3-tom-gon"],
				m.soDo.daCat.tenBuoc["ngang-cap"],
			].join(" · "),
		);
		expect(o("truocToken")).toBe("41.200");
		expect(o("sauToken")).toBe("30.500");
		expect(o("chienLuocCatKyTu")).toBe("0");
		expect(q('[data-da-cat="khong"]')).toBeNull();
	});

	test("ngăn không đọc được cuộc: báo lỗi có Thử lại", async () => {
		loiAn = true;
		await mo("?cuocSoanAn=c-an-1");
		await cho(
			() => q('[data-ngan-cuoc] [data-trang-thai="loi"]') !== null,
			"ngan loi",
		);
		expect(chuCua('[data-ngan-cuoc] [data-slot="empty-title"]')).toBe(
			m.soDo.loiCuoc,
		);
		const tieuDe = q('[data-ngan-cuoc] [data-slot="sheet-title"]');
		expect(tieuDe?.textContent, "tieu de ngan rong").toBe(m.soDo.nganTieuDe);
		expect(tieuDe?.getAttribute("translate")).toBeNull();
		const truoc = goiCua("okr.soanAn").length;
		loiAn = false;
		await bam(q('[data-ngan-cuoc] [data-nut="thu-lai"]'));
		await cho(() => q("[data-ngan-cuoc] [data-dong]") !== null, "doc lai");
		expect(goiCua("okr.soanAn").length).toBe(truoc + 1);
	});
});

describe("quyen", () => {
	test("không phải quản trị: không có thẻ, không hỏi số đo", async () => {
		quanTri = false;
		await mo("?cuocSoanAn=c-an-1", <KhoiTroLyOkr />);
		await cho(() => goiCua("okr.program").length > 0, "doc quyen");
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
		expect(q('[data-the="soan-so-do"]')).toBeNull();
		expect(goiCua("okr.soanSoDo")).toHaveLength(0);
		expect(goiCua("okr.soanAn")).toHaveLength(0);
	});
});

describe("nhan", () => {
	test("moi ma trong MA_LOAI_BAN_NHAP co nhan o ca hai tieng", () => {
		const thieu = (["vi", "en"] as const).flatMap((locale) => {
			const nhan: Partial<Record<string, string>> =
				okrSoanMessages(locale).soDo.maLoai;
			return MA_LOAI_BAN_NHAP.filter((ma) => !nhan[ma]?.trim()).map(
				(ma) => `ma loai khong nhan: ${locale} ${ma}`,
			);
		});
		expect(thieu).toEqual([]);
	});

	test("moi buoc cat co nhan o ca hai tieng", () => {
		const thieu = (["vi", "en"] as const).flatMap((locale) => {
			const nhan: Partial<Record<string, string>> =
				okrSoanMessages(locale).soDo.daCat.tenBuoc;
			return BUOC_CAT.filter((b) => !nhan[b]?.trim()).map(
				(b) => `buoc cat khong nhan: ${locale} ${b}`,
			);
		});
		expect(thieu).toEqual([]);
	});
});
