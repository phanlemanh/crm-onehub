import { describe, expect, test } from "bun:test";
import { ClientError } from "eve/client";
import { lyDoHong } from "@/app/(app)/[slug]/okr/soan/loi-cua";
import { CUA_OKR, MA_LY_DO_HONG, type MaLyDoHong } from "@/lib/cua-okr-config";
import { okrSoanMessages } from "@/lib/messages/okr-soan";

const L = CUA_OKR.loi;
const LUOT = { luot: CUA_OKR.luotDaHoan };

function loiHttpTho(status: number, body: string): ClientError {
	return new ClientError(status, body, new Headers());
}

function loiHttp(status: number, than: Record<string, string>): ClientError {
	return loiHttpTho(status, JSON.stringify(than));
}

type Dong = {
	ten: string;
	vao: Parameters<typeof lyDoHong>[0];
	ra: { ma: MaLyDoHong; daHoan: boolean } | null;
};

const KHONG = { qua45s: false, loiMoLai: null } as const;

function haiChieu(
	ten: string,
	status: number,
	error: string,
	ma: MaLyDoHong,
): Dong[] {
	return [
		{
			ten: `${ten} co luot`,
			vao: { ...KHONG, loi: loiHttp(status, { error, ...LUOT }) },
			ra: { ma, daHoan: true },
		},
		{
			ten: `${ten} khong luot`,
			vao: { ...KHONG, loi: loiHttp(status, { error }) },
			ra: { ma, daHoan: false },
		},
	];
}

const BANG: readonly Dong[] = [
	...haiChieu("khong-noi-duoc", 502, L.khongNoiDuoc, "khong-noi-duoc"),
	...haiChieu("qua-han", 504, L.quaHan, "qua-han"),
	...haiChieu("tro-ly-tu-choi", 409, L.troLyTuChoi, "tro-ly-tu-choi"),
	...haiChieu("tro-ly-loi", 503, L.troLyLoi, "tro-ly-loi"),
	...haiChieu(
		"khong-doc-duoc-phien",
		502,
		L.khongDocDuocPhien,
		"chua-mo-duoc-phien",
	),
	...haiChieu(
		"khong-ghi-duoc-phien",
		502,
		L.khongGhiDuocPhien,
		"chua-mo-duoc-phien",
	),
	{
		ten: "chua-dem-duoc-luot",
		vao: { ...KHONG, loi: loiHttp(502, { error: L.khongDemDuocLuot }) },
		ra: { ma: "chua-dem-duoc-luot", daHoan: false },
	},
	{
		ten: "het-dang-nhap",
		vao: { ...KHONG, loi: loiHttp(401, { error: L.chuaDangNhap }) },
		ra: { ma: "het-dang-nhap", daHoan: false },
	},
	{
		ten: "4xx tro ly khong ma cua",
		vao: { ...KHONG, loi: loiHttp(422, { error: "khac" }) },
		ra: { ma: "tro-ly-tu-choi", daHoan: false },
	},
	{
		ten: "5xx tro ly khong ma cua",
		vao: { ...KHONG, loi: loiHttp(500, { message: "x" }) },
		ra: { ma: "tro-ly-loi", daHoan: false },
	},
	{
		ten: "than khong json",
		vao: { ...KHONG, loi: loiHttpTho(502, "<html>502 Bad Gateway</html>") },
		ra: { ma: "tro-ly-loi", daHoan: false },
	},
	{
		ten: "luong GET 502 khong-noi-duoc khong luot",
		vao: {
			...KHONG,
			loi: loiHttp(502, { error: L.khongNoiDuoc, detail: "x" }),
		},
		ra: { ma: "khong-noi-duoc", daHoan: false },
	},
	{
		ten: "mat-mang",
		vao: { ...KHONG, loi: new TypeError("fetch failed") },
		ra: { ma: "mat-mang", daHoan: false },
	},
	{
		ten: "chua-mo-lai-duoc",
		vao: { loi: undefined, qua45s: false, loiMoLai: new Error("conflict") },
		ra: { ma: "chua-mo-lai-duoc", daHoan: false },
	},
	{
		ten: "qua-45s",
		vao: { loi: undefined, qua45s: true, loiMoLai: null },
		ra: { ma: "qua-45s", daHoan: false },
	},
	{
		ten: "dung-giua-chung",
		vao: { loi: undefined, qua45s: false, loiMoLai: null },
		ra: { ma: "dung-giua-chung", daHoan: false },
	},
	...Object.entries(CUA_OKR.trangThaiTuChoiLuot).map(([error, status]) => ({
		ten: `tu-choi-co-ten ${error}`,
		vao: { ...KHONG, loi: loiHttp(status, { error }) },
		ra: null,
	})),
	{
		ten: "chua-cau-hinh",
		vao: {
			...KHONG,
			loi: loiHttp(CUA_OKR.trangThaiChuaCauHinh, { error: L.chuaCauHinh }),
		},
		ra: null,
	},
	{
		ten: "da-co-phien",
		vao: { ...KHONG, loi: loiHttp(409, { error: L.daCoPhien, ...LUOT }) },
		ra: null,
	},
	{
		ten: "phien-da-thay",
		vao: { ...KHONG, loi: loiHttp(409, { error: L.phienDaThay }) },
		ra: null,
	},
];

describe("ly-do-hong", () => {
	for (const dong of BANG) {
		test(`ly-do-hong: ${dong.ten}`, () => {
			expect(lyDoHong(dong.vao), `ly-do-sai ${dong.ten}`).toEqual(dong.ra);
		});
	}

	test("ly-do-hong: bang phu dung tap ma, bang tap khoa cau vi va en", () => {
		const phu = [
			...new Set(BANG.flatMap((d) => (d.ra ? [d.ra.ma] : []))),
		].sort();
		const tap = [...MA_LY_DO_HONG].sort();
		expect(phu, `ly-do-lech: ${phu.join(",")}`).toEqual(tap);
		for (const tieng of ["vi", "en"] as const)
			expect(
				Object.keys(okrSoanMessages(tieng).hoiThoai.lyDoHong).sort(),
				`ly-do-lech: ${tieng}`,
			).toEqual(tap);
	});

	test("ly-do-hong: daHoan dung khi va chi khi than mang luot da-hoan", () => {
		for (const dong of BANG) {
			if (!dong.ra) continue;
			const loi = dong.vao.loi;
			const mangLuot =
				loi instanceof ClientError &&
				loi.body.includes(`"luot":"${CUA_OKR.luotDaHoan}"`);
			expect(lyDoHong(dong.vao)?.daHoan, `da-hoan-sai ${dong.ten}`).toBe(
				mangLuot,
			);
		}
	});
});

const MONG_DOI_MA_CUA: Record<
	keyof typeof CUA_OKR.loi,
	{ status: number; ma: MaLyDoHong | null }
> = {
	chuaCauHinh: { status: 503, ma: null },
	chuaDangNhap: { status: 401, ma: "het-dang-nhap" },
	thieuCuoc: { status: 400, ma: "tro-ly-tu-choi" },
	duongKhongPhucVu: { status: 404, ma: "tro-ly-tu-choi" },
	cuocKhongThuocBan: { status: 403, ma: "tro-ly-tu-choi" },
	cuocKhongDang: { status: 403, ma: null },
	phienKhongThuocCuoc: { status: 403, ma: "tro-ly-tu-choi" },
	daCoPhien: { status: 409, ma: null },
	phienDaThay: { status: 409, ma: null },
	khongDocDuocPhien: { status: 502, ma: "chua-mo-duoc-phien" },
	khongGhiDuocPhien: { status: 502, ma: "chua-mo-duoc-phien" },
	khongDemDuocLuot: { status: 502, ma: "chua-dem-duoc-luot" },
	khongNoiDuoc: { status: 502, ma: "khong-noi-duoc" },
	quaHan: { status: 504, ma: "qua-han" },
	troLyTuChoi: { status: 401, ma: "tro-ly-tu-choi" },
	troLyLoi: { status: 500, ma: "tro-ly-loi" },
};

describe("ma-cua-du", () => {
	test("ma-cua-du: bang mong doi phu dung tap khoa CUA_OKR.loi", () => {
		expect(Object.keys(MONG_DOI_MA_CUA).sort(), "ma-cua-thieu-dong").toEqual(
			Object.keys(CUA_OKR.loi).sort(),
		);
	});

	for (const [khoa, o] of Object.entries(MONG_DOI_MA_CUA)) {
		const error = CUA_OKR.loi[khoa as keyof typeof CUA_OKR.loi];
		test(`ma-cua-du: ${khoa}`, () => {
			const ra = lyDoHong({
				...KHONG,
				loi: loiHttp(o.status, { error }),
			});
			expect(ra?.ma ?? null, `ly-do-sai ma-cua ${khoa}`).toBe(o.ma);
		});
	}
});

const LOI_MANG_TRINH_DUYET = [
	"Failed to fetch",
	"fetch failed",
	"NetworkError when attempting to fetch resource.",
	"Load failed",
] as const;

function loiLuongEve(ma: string, thongDiep: string): Error {
	const loi = new Error(thongDiep);
	loi.name = ma;
	return loi;
}

const KHONG_STATUS: readonly { ten: string; loi: Error; ma: MaLyDoHong }[] = [
	...LOI_MANG_TRINH_DUYET.map((cau) => ({
		ten: `mang ${cau}`,
		loi: new TypeError(cau),
		ma: "mat-mang" as const,
	})),
	{
		ten: "eve session.failed",
		loi: loiLuongEve("session.failed", "Turn failed"),
		ma: "dung-giua-chung",
	},
	{
		ten: "eve turn.failed het ngan sach",
		loi: loiLuongEve("turn.failed", "Insufficient credits for AI Gateway"),
		ma: "dung-giua-chung",
	},
	{ ten: "error thuong", loi: new Error("boom"), ma: "dung-giua-chung" },
	{
		ten: "typeerror khac",
		loi: new TypeError("Cannot read properties of undefined"),
		ma: "dung-giua-chung",
	},
];

const SAN_KHONG_STATUS = 8;

describe("loi-khong-status", () => {
	test("loi-khong-status: san ma tran", () => {
		if (KHONG_STATUS.length < SAN_KHONG_STATUS) throw new Error("ma tran rong");
	});

	for (const dong of KHONG_STATUS) {
		test(`loi-khong-status: ${dong.ten}`, () => {
			expect(
				lyDoHong({ ...KHONG, loi: dong.loi }),
				`mat-mang-sai ${dong.ten}`,
			).toEqual({ ma: dong.ma, daHoan: false });
		});
	}
});
