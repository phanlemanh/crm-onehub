import { describe, expect, test } from "bun:test";
import { ClientError } from "eve/client";
import { lyDoHong } from "@/app/(app)/[slug]/okr/soan/loi-cua";
import { CUA_OKR, MA_LY_DO_HONG, type MaLyDoHong } from "@/lib/cua-okr-config";
import { okrSoanMessages } from "@/lib/messages/okr-soan";

const L = CUA_OKR.loi;
const LUOT = { luot: CUA_OKR.luotDaHoan };

function loiHttp(status: number, than: unknown): ClientError {
	const body = typeof than === "string" ? than : JSON.stringify(than);
	return new ClientError(status, body, new Headers());
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
		vao: { ...KHONG, loi: loiHttp(502, "<html>502 Bad Gateway</html>") },
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
			expect(dong.ra.daHoan, `da-hoan-sai ${dong.ten}`).toBe(mangLuot);
		}
	});
});
