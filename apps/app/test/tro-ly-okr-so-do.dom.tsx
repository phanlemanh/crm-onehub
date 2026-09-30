import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { MA_LOAI_DE_XUAT } from "@crm/validation/okr-tro-ly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	aiChiTieuOutput,
	type SoDoNac,
	type TroLyAnOutput,
	type TroLySoDoOutput,
	troLyAnOutput,
	troLySoDoOutput,
} from "../../api/src/okr/okr.contracts";

let choSoDo: Promise<void>;
let loiSoDo: boolean;
let rong: boolean;
let daDoc: string[] = [];

const nac = (chon: Partial<SoDoNac> & Pick<SoDoNac, "soLuot">): SoDoNac => ({
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
	...chon,
});

const SO_DO: TroLySoDoOutput = troLySoDoOutput.parse({
	thang: "2026-09",
	bat: nac({
		soLuot: 12,
		sinhRa: 30,
		daHien: 8,
		nhan: 3,
		sua: 1,
		bac: 2,
		boQua: 1,
		tyLeNhan: 0.375,
		tyLeSua: 0.125,
		tyLeBac: 0.25,
		tyLeBoQua: 0.125,
		tyLeDuocNhan: 0.5,
		daNhan: 4,
		hoanTac: 1,
		tyLeHoanTac: 0.25,
		soLuotDo: 12,
		p50Ms: 7412,
		p90Ms: 13950,
		tongCau: 33,
		biLoai: 3,
		tyLeBiLoai: 0.0909,
		theoMa: [
			{ maLoai: "so-moi", so: 2 },
			{ maLoai: "tu-cam", so: 1 },
		],
		tienUsd: 0.2,
		chiPhiMoiNhanUsd: 0.05,
		chiPhiMoiLuotUsd: 0.016667,
	}),
	an: nac({
		soLuot: 5,
		sinhRa: 11,
		soLuotDo: 5,
		p50Ms: 6200,
		p90Ms: 9800,
		tongCau: 12,
		biLoai: 1,
		tyLeBiLoai: 0.0833,
		theoMa: [{ maLoai: "so-moi", so: 1 }],
		tienUsd: 0.085,
		chiPhiMoiLuotUsd: 0.017,
	}),
});

const SO_DO_RONG: TroLySoDoOutput = {
	thang: "2026-09",
	bat: nac({ soLuot: 0 }),
	an: nac({ soLuot: 0 }),
};

const dongGoc = {
	objectiveId: "mt-1",
	keyResultId: null,
	maVanDe: null,
	targetObjectiveId: null,
	targetKeyResultId: null,
	lyDo: "Tên nói việc làm, chưa nói kết quả.",
};

const LUOT_AN: TroLyAnOutput = troLyAnOutput.parse({
	thang: "2026-09",
	luot: [
		{
			taskId: "l-an-1",
			nac: "an",
			objectiveId: "mt-1",
			tenMucTieu: "Không thoả thuận nào của miền Nam bị mất dấu",
			keyResultId: null,
			nguoiYeuCau: null,
			taoLuc: "2026-09-20T03:00:00.000Z",
			xongLuc: "2026-09-20T03:00:07.400Z",
			ketQua: "da-nop",
			doTreMs: 7400,
			chiPhiUsd: 0.017,
			dong: [
				{
					...dongGoc,
					id: "d-1",
					loai: "viet-lai",
					truong: "title",
					truoc: "Mở rộng thị phần miền Nam",
					sau: "Không thoả thuận nào của miền Nam bị mất dấu",
					trangThai: "cho",
					maLoai: null,
				},
				{
					...dongGoc,
					id: "d-2",
					loai: "viet-lai",
					keyResultId: "kr-1",
					truong: "kr.title",
					truoc: "Gọi 60 cuộc mỗi tuần",
					sau: "Tăng thoả thuận chốt lên 30 mỗi quý",
					trangThai: "bi-loai",
					maLoai: "so-moi",
				},
				{
					...dongGoc,
					id: "d-3",
					loai: "hoi",
					truong: null,
					truoc: null,
					sau: "KR «Doanh thu mới» có đích nhưng chưa có khởi điểm — số 0 là thật?",
					maVanDe: null,
					trangThai: "cho",
					maLoai: null,
				},
			],
		},
	],
});

const LUOT_BAT: TroLyAnOutput = troLyAnOutput.parse({
	thang: "2026-09",
	luot: [
		{
			taskId: "l-bat-1",
			nac: "bat",
			objectiveId: "mt-2",
			tenMucTieu: "Mọi khách lớn gia hạn trước tháng 3",
			keyResultId: null,
			nguoiYeuCau: "u-1",
			taoLuc: "2026-09-22T03:00:00.000Z",
			xongLuc: "2026-09-22T03:00:08.900Z",
			ketQua: "da-nop",
			doTreMs: 8900,
			chiPhiUsd: 0.019,
			dong: [
				{
					...dongGoc,
					objectiveId: "mt-2",
					id: "d-9",
					loai: "viet-lai",
					truong: "title",
					truoc: "Giữ khách lớn",
					sau: "Mọi khách lớn gia hạn trước tháng 3",
					trangThai: "nhan",
					maLoai: null,
				},
			],
		},
	],
});

type VaoLuot = { nac?: "an" | "bat" };

function thuTuc<TVao, TRa>(duong: string, doc: (vao?: TVao) => TRa) {
	return {
		queryKey: (vao?: TVao) => [duong, vao],
		pathKey: () => [duong],
		queryOptions: (vao?: TVao) => ({
			queryKey: [duong, vao],
			queryFn: async () => {
				daDoc.push(duong);
				if (duong === "okr.troLySoDo") {
					await choSoDo;
					if (loiSoDo) throw new Error("so do hong");
				}
				return doc(vao);
			},
		}),
	};
}

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			troLySoDo: thuTuc("okr.troLySoDo", () => (rong ? SO_DO_RONG : SO_DO)),
			troLyAn: thuTuc(
				"okr.troLyAn",
				(vao?: VaoLuot): TroLyAnOutput =>
					rong
						? { thang: "2026-09", luot: [] }
						: vao?.nac === "bat"
							? LUOT_BAT
							: LUOT_AN,
			),
		},
	}),
}));

const { TheGopYSoDo } = await import(
	"@/app/(app)/[slug]/settings/okr/the-gop-y-so-do"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { troLyOkrMessages } = await import("@/lib/messages/tro-ly-okr");

const m = troLyOkrMessages("vi").soDo;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(searchParams = ""): Promise<void> {
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
						<TooltipProvider>
							<TheGopYSoDo />
						</TooltipProvider>
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

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const chuCua = (chon: string) => q(chon)?.textContent?.trim() ?? "";
const coSo = () => q('[data-the="gop-y-so-do"] [data-so-do="luot"]') !== null;

beforeEach(() => {
	choSoDo = Promise.resolve();
	loiSoDo = false;
	rong = false;
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

describe("trang-thai", () => {
	test("đang tải: thẻ aria-busy với khung xương khi số đo chưa về", async () => {
		let tha = () => {};
		choSoDo = new Promise((r) => {
			tha = r;
		});
		await mo();
		await cho(
			() => q('[data-the="gop-y-so-do"][aria-busy="true"]') !== null,
			"the dang tai",
		);
		expect(
			tatCa('[data-the="gop-y-so-do"] [data-slot="skeleton"]').length,
		).toBeGreaterThan(0);
		await act(async () => tha());
		await cho(coSo, "tai xong");
		expect(q('[data-the="gop-y-so-do"][aria-busy]')).toBeNull();
	});

	test("rỗng: tháng chưa có lượt góp ý nào", async () => {
		rong = true;
		await mo();
		await cho(
			() => q('[data-the="gop-y-so-do"] [data-trang-thai="rong"]') !== null,
			"the rong",
		);
		expect(chuCua('[data-trang-thai="rong"] [data-slot="empty-title"]')).toBe(
			"Tháng này chưa có lượt góp ý nào",
		);
		expect(m.rong).toBe("Tháng này chưa có lượt góp ý nào");
	});

	test("lỗi: Thử lại gọi lại số đo và hiện bảng", async () => {
		loiSoDo = true;
		await mo();
		await cho(
			() => q('[data-the="gop-y-so-do"] [data-trang-thai="loi"]') !== null,
			"the loi",
		);
		expect(chuCua('[data-trang-thai="loi"] [data-slot="empty-title"]')).toBe(
			m.loi,
		);
		const truoc = daDoc.filter((d) => d === "okr.troLySoDo").length;
		loiSoDo = false;
		const thuLai = q('[data-nut="thu-lai-so-do"]');
		if (!thuLai) throw new Error("khong co nut thu lai");
		await bam(thuLai);
		await cho(coSo, "tai lai xong");
		expect(daDoc.filter((d) => d === "okr.troLySoDo").length).toBe(truoc + 1);
	});
});

describe("co-so", () => {
	test("hai cột Bật · Chế độ ẩn, mỗi số đúng dữ liệu tRPC", async () => {
		await mo();
		await cho(coSo, "tai xong");
		expect(
			tatCa('[data-bang="so-do"] thead th').map((o) => o.textContent?.trim()),
		).toEqual([m.cotSo, "Bật", "Chế độ ẩn"]);
		const o = (hang: string, cot: string) =>
			chuCua(`[data-so-do="${hang}"] [data-cot="${cot}"]`);
		const bang = Object.fromEntries(
			[
				"luot",
				"daHien",
				"nhan",
				"sua",
				"bac",
				"boQua",
				"hoanTac",
				"p50",
				"p90",
				"biLoai",
				"ma-so-moi",
				"ma-tu-cam",
				"chiPhiMoiNhan",
				"chiPhiMoiLuot",
			].map((hang) => [hang, [o(hang, "bat"), o(hang, "an")]]),
		);
		expect(bang).toEqual({
			luot: ["12", "5"],
			daHien: ["8 / 30", "0 / 11"],
			nhan: ["38%", "—"],
			sua: ["13%", "—"],
			bac: ["25%", "—"],
			boQua: ["13%", "—"],
			hoanTac: ["25%", "—"],
			p50: ["7,4 giây", "6,2 giây"],
			p90: ["14 giây", "9,8 giây"],
			biLoai: ["9%", "8%"],
			"ma-so-moi": ["2", "1"],
			"ma-tu-cam": ["1", "0"],
			chiPhiMoiNhan: ["0,05\u00a0US$", "—"],
			chiPhiMoiLuot: ["—", "0,017\u00a0US$"],
		});
		expect(chuCua('[data-so-do="ma-so-moi"] [data-cot="nhan"]')).toBe(
			m.maLoai["so-moi"],
		);
		expect(chuCua('[data-so-do="hoanTac"] [data-cot="nhan"]')).toBe(
			"Hoàn tác trong 7 ngày",
		);
		expect(
			tatCa("[data-so-do][data-sub]").map((o) => o.getAttribute("data-so-do")),
		).toEqual(["ma-so-moi", "ma-tu-cam"]);
	});

	test("bảng lượt gần đây: cả hai nấc, mới nhất trước, đếm dòng bị loại riêng", async () => {
		await mo();
		await cho(coSo, "tai xong");
		expect(
			tatCa("[data-luot]").map((o) => [
				o.getAttribute("data-luot"),
				o.querySelector('[data-cot="nac"]')?.textContent?.trim(),
				o.querySelector('[data-cot="dong"]')?.textContent?.trim(),
			]),
		).toEqual([
			["l-bat-1", "Bật", "1"],
			["l-an-1", "Chế độ ẩn", `2 ${m.dongBiLoai("1")}`],
		]);
		expect(
			q('[data-luot="l-an-1"] [translate="no"]')?.textContent?.trim(),
		).toBe("Không thoả thuận nào của miền Nam bị mất dấu");
	});
});

describe("ngan", () => {
	test("bấm một lượt mở ngăn hiện mọi dòng kể cả dòng bị loại kèm nhãn mã loại", async () => {
		await mo();
		await cho(coSo, "tai xong");
		const mo1 = q('[data-luot="l-an-1"] [data-nut="mo-luot"]');
		if (!mo1) throw new Error("khong co nut mo luot");
		await bam(mo1);
		await cho(() => q("[data-ngan-luot]") !== null, "ngan mo");
		const ngan = q("[data-ngan-luot]");
		expect(ngan?.getAttribute("data-ngan-luot")).toBe("l-an-1");
		expect(
			ngan
				?.querySelector('[data-slot="sheet-title"]')
				?.getAttribute("translate"),
		).toBe("no");
		const dong = tatCa("[data-ngan-luot] [data-dong]");
		expect(dong.map((o) => o.getAttribute("data-dong"))).toEqual([
			"d-1",
			"d-2",
			"d-3",
		]);
		expect(
			dong.map((o) =>
				o.querySelector("[data-trang-thai-dong]")?.textContent?.trim(),
			),
		).toEqual([
			m.trangThai.cho,
			m.biLoaiMa(m.maLoai["so-moi"]),
			m.trangThai.cho,
		]);
		expect(
			dong.map((o) => o.querySelector("[data-sau]")?.getAttribute("translate")),
		).toEqual(["no", "no", "no"]);
		expect(q('[data-dong="d-2"] [data-truoc]')?.textContent?.trim()).toBe(
			"Gọi 60 cuộc mỗi tuần",
		);
	});

	test("ngăn mở từ URL: tham số lượt trên đường dẫn mở đúng lượt", async () => {
		await mo("?luotGopY=l-bat-1");
		await cho(() => q("[data-ngan-luot]") !== null, "ngan mo tu url");
		expect(q("[data-ngan-luot]")?.getAttribute("data-ngan-luot")).toBe(
			"l-bat-1",
		);
		expect(chuCua('[data-dong="d-9"] [data-trang-thai-dong]')).toBe(
			m.trangThai.nhan,
		);
	});
});

describe("nhan-ma-loai", () => {
	test("mọi mã trong MA_LOAI_DE_XUAT có nhãn ở cả hai tiếng", () => {
		const thieu = (["vi", "en"] as const).flatMap((locale) => {
			const nhan: Partial<Record<(typeof MA_LOAI_DE_XUAT)[number], string>> =
				troLyOkrMessages(locale).soDo.maLoai;
			return MA_LOAI_DE_XUAT.filter((ma) => !nhan[ma]?.trim()).map(
				(ma) => `ma loai khong nhan: ${ma}`,
			);
		});
		expect(thieu).toEqual([]);
	});
});

describe("nguon-khoa", () => {
	const THIET_KE = new URL(
		"../../../docs/superpowers/specs/2026-10-01-va-tro-ly-okr-sau-thu-design.md",
		import.meta.url,
	);
	const s = troLyOkrMessages("vi").troLy.sanSang;
	const docBang = () =>
		readFileSync(THIET_KE, "utf8")
			.split("\n")
			.map((d) => d.match(/^\| (ST-caidat-[\w-]+) \|/)?.[1])
			.filter((x): x is string => Boolean(x));

	const vao = (sanSang: unknown, nguonKhoa: unknown) => ({
		sanSang: aiChiTieuOutput.shape.sanSang.parse(sanSang),
		nguonKhoa: aiChiTieuOutput.shape.nguonKhoa.parse(nguonKhoa),
	});

	const CA: Record<
		string,
		{ du: ReturnType<typeof vao>; co: string[]; khong: string[] }
	> = {
		"ST-caidat-san-sang-rieng": {
			du: vao({ bat: true, conLaiUsd: 9 }, "khoa-rieng"),
			co: [s.sanSangNguon["khoa-rieng"]],
			khong: [],
		},
		"ST-caidat-san-sang-chung": {
			du: vao({ bat: true, conLaiUsd: 9 }, "khoa-chung"),
			co: [s.sanSangNguon["khoa-chung"]],
			khong: [],
		},
		"ST-caidat-san-sang-oidc": {
			du: vao({ bat: true, conLaiUsd: 9 }, "oidc"),
			co: [s.sanSangNguon.oidc],
			khong: [],
		},
		"ST-caidat-san-sang-cu": {
			du: vao({ bat: true, conLaiUsd: 9 }, "chua-ro"),
			co: [s.sanSang],
			khong: [s.lyDo["chua-co-khoa-mo-hinh"], "·"],
		},
		"ST-caidat-thieu-khoa": {
			du: vao({ bat: false, lyDo: "chua-co-khoa-mo-hinh" }, null),
			co: [
				s.chuaSanSang(s.lyDo["chua-co-khoa-mo-hinh"]),
				"OKR_AI_GATEWAY_API_KEY",
				"AI_GATEWAY_API_KEY",
				"OIDC",
			],
			khong: [],
		},
	};

	async function moChiBao(du: ReturnType<typeof vao>) {
		const { ChiBaoSanSang } = await import(
			"@/app/(app)/[slug]/settings/okr/the-tro-ly-okr"
		);
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		await act(async () => {
			root.render(
				<LocaleProvider locale="vi">
					<ChiBaoSanSang
						aiOn
						dangKiem={false}
						sanSang={du.sanSang}
						nguonKhoa={du.nguonKhoa}
						thang="2026-10"
					/>
				</LocaleProvider>,
			);
		});
		dangMo.push({ o, root });
		return o;
	}

	test("nguon-khoa: moi dong ST-caidat-* cua bang trang thai co mot ca, dung chu", async () => {
		const bang = docBang();
		expect(bang.length).toBeGreaterThan(0);
		for (const st of bang) {
			const ca = CA[st];
			if (!ca) throw new Error(`trang thai chua do: ${st}`);
			const o = await moChiBao(ca.du);
			const chu = o.textContent ?? "";
			for (const c of ca.khong) {
				if (st === "ST-caidat-san-sang-cu" && chu.includes(c))
					throw new Error("the lech san sang cu");
				expect(chu).not.toContain(c);
			}
			for (const c of ca.co) expect(chu, `${st} thieu: ${c}`).toContain(c);
			expect(o.querySelector('input[type="password"]')).toBeNull();
		}
		expect(Object.keys(CA).sort()).toEqual([...bang].sort());
	});
});
