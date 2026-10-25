import { describe, expect, it, test } from "bun:test";
import { type LyDoRong, lyDoRong } from "@/app/(app)/[slug]/okr/ly-do-rong";
import {
	type HopTuanOutput,
	hopTuanOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { type OSo, oSoHop } from "../app/(app)/[slug]/okr/o-so-hop";

type TuTin = "cao" | "vua" | "thap" | null;

const CHU_KY = { startsOn: "2026-10-01", endsOn: "2026-12-31" };
const THU_TU_O: OSo["khoa"][] = [
	"da-cap-nhat",
	"dang-ban",
	"tu-tin-thap",
	"ngay-con",
];
const CHU_HONG = /NaN|undefined|-\d/;

function dong(id: string, tuTin: TuTin) {
	return {
		keyResultId: id,
		objectiveId: `mt-${id}`,
		tieuDe: `KR ${id}`,
		mucTieu: `Mục tiêu ${id}`,
		chuTen: "Trần Minh Hải",
		progress: 40,
		expected: 50,
		laMoc: false,
		tuTin,
		ghiChu: null,
		lyDo: [],
	};
}

function hop(dangBan: TuTin[], conLai: TuTin[]): HopTuanOutput {
	return hopTuanOutput.parse({
		tuan: "2026-11-09",
		tuanDau: false,
		daCapNhat: 3,
		tongKr: dangBan.length + conLai.length,
		dangBan: dangBan.map((t, i) => dong(`b${i}`, t)),
		conLai: conLai.map((t, i) => dong(`c${i}`, t)),
	});
}

const MAC_DINH = hop(["thap", "vua"], ["thap", null, "cao"]);

type Ca = {
	ten: string;
	d: HopTuanOutput;
	homNay: string;
	khoa: OSo["khoa"];
	giaTri: string;
	moTa?: OSo["moTa"];
};

const MA_TRAN: Ca[] = [
	{
		ten: "dau-ky",
		d: MAC_DINH,
		homNay: "2026-09-30T17:30:00Z",
		khoa: "ngay-con",
		giaTri: "92",
		moTa: { loai: "ket-thuc", ngay: "31/12" },
	},
	{
		ten: "truoc-bat-dau",
		d: MAC_DINH,
		homNay: "2026-09-30T16:00:00Z",
		khoa: "ngay-con",
		giaTri: "—",
		moTa: { loai: "bat-dau", ngay: "01/10" },
	},
	{
		ten: "ngay-cuoi",
		d: MAC_DINH,
		homNay: "2026-12-31T05:00:00Z",
		khoa: "ngay-con",
		giaTri: "1",
		moTa: { loai: "ket-thuc", ngay: "31/12" },
	},
	{
		ten: "da-qua",
		d: MAC_DINH,
		homNay: "2027-01-01T03:00:00Z",
		khoa: "ngay-con",
		giaTri: "0",
		moTa: { loai: "da-ket-thuc", ngay: "31/12" },
	},
	{
		ten: "khong-thap",
		d: hop(["vua", "cao"], ["cao", null]),
		homNay: "2026-11-12T03:00:00Z",
		khoa: "tu-tin-thap",
		giaTri: "0",
		moTa: { loai: "moi-nhat", ngay: null },
	},
	{
		ten: "chua-tu-tin",
		d: hop([null, null], [null]),
		homNay: "2026-11-12T03:00:00Z",
		khoa: "tu-tin-thap",
		giaTri: "0",
		moTa: { loai: "moi-nhat", ngay: null },
	},
];

function soat(
	ten: string,
	o: OSo[],
	nhan: string,
	loi: string[],
): Map<OSo["khoa"], OSo> {
	const khoa = o.map((x) => x.khoa);
	if (khoa.join(",") !== THU_TU_O.join(","))
		loi.push(`${nhan}: ${ten} thu tu o ${khoa.join(",")}`);
	for (const x of o) {
		const chu = `${x.giaTri}|${x.moTa.ngay ?? ""}`;
		if (CHU_HONG.test(chu)) loi.push(`${nhan}: ${ten} o ${x.khoa} in ${chu}`);
	}
	return new Map(o.map((x) => [x.khoa, x]));
}

describe("htmb-o-so", () => {
	test("bon o cua tuan theo lich gio Viet Nam", () => {
		const loi: string[] = [];
		let dem = 0;
		for (const ca of MA_TRAN) {
			const o = oSoHop(ca.d, CHU_KY, new Date(ca.homNay));
			const theoKhoa = soat(ca.ten, o, "htmb-o-so", loi);
			const thuc = theoKhoa.get(ca.khoa);
			if (thuc?.giaTri !== ca.giaTri)
				loi.push(`htmb-o-so: ${ca.ten} ra ${thuc?.giaTri}, can ${ca.giaTri}`);
			if (
				ca.moTa &&
				(thuc?.moTa.loai !== ca.moTa.loai || thuc?.moTa.ngay !== ca.moTa.ngay)
			)
				loi.push(
					`htmb-o-so: ${ca.ten} mo ta ${thuc?.moTa.loai} ${thuc?.moTa.ngay}, can ${ca.moTa.loai} ${ca.moTa.ngay}`,
				);
			dem += 1;
		}
		const tuan = soat(
			"tuan",
			oSoHop(MAC_DINH, CHU_KY, new Date("2026-11-12T03:00:00Z")),
			"htmb-o-so",
			loi,
		);
		const chuoi = [...tuan.values()]
			.map((x) => `${x.khoa}=${x.giaTri}:${x.moTa.loai}:${x.moTa.ngay}`)
			.join(" ");
		const can =
			"da-cap-nhat=3/5:tuan:09/11 dang-ban=2:can-ban:null tu-tin-thap=2:moi-nhat:null ngay-con=50:ket-thuc:31/12";
		if (chuoi !== can) loi.push(`htmb-o-so: tuan ra ${chuoi}, can ${can}`);
		expect(loi).toEqual([]);
		expect(dem).toBe(6);
	});
});

describe("htmb-bien-o-so", () => {
	test("chu ky mot ngay va ngay ket thuc truoc ngay bat dau", () => {
		const loi: string[] = [];
		const motNgay = soat(
			"mot-ngay",
			oSoHop(
				MAC_DINH,
				{ startsOn: "2026-11-12", endsOn: "2026-11-12" },
				new Date("2026-11-12T03:00:00Z"),
			),
			"htmb-bien-o-so",
			loi,
		);
		if (motNgay.get("ngay-con")?.giaTri !== "1")
			loi.push(
				`htmb-bien-o-so: mot-ngay ra ${motNgay.get("ngay-con")?.giaTri}, can 1`,
			);
		for (const homNay of [
			"2026-11-01T03:00:00Z",
			"2026-11-12T03:00:00Z",
			"2026-11-20T03:00:00Z",
		]) {
			soat(
				`nguoc-${homNay.slice(0, 10)}`,
				oSoHop(
					MAC_DINH,
					{ startsOn: "2026-11-15", endsOn: "2026-11-10" },
					new Date(homNay),
				),
				"htmb-bien-o-so",
				loi,
			);
		}
		const rong = soat(
			"rong",
			oSoHop(hop([], []), CHU_KY, new Date("2026-11-12T03:00:00Z")),
			"htmb-bien-o-so",
			loi,
		);
		if (rong.get("da-cap-nhat")?.giaTri !== "3/0")
			loi.push(
				`htmb-bien-o-so: rong ra ${rong.get("da-cap-nhat")?.giaTri}, can 3/0`,
			);
		expect(loi).toEqual([]);
	});
});

const HOM_NAY_VN_SAU_NUA_DEM = new Date("2026-10-24T17:30:00Z");
const NGAY_BAT_DAU_HOM_NAY = "2026-10-25";
const NGAY_BAT_DAU_SAU = "2026-10-27";

function hopLyDo(v: { tongKr: number; daCapNhat: number; tuanDau: boolean }) {
	return hopTuanOutput.parse({
		tuan: "2026-10-19",
		tuanDau: v.tuanDau,
		daCapNhat: v.daCapNhat,
		tongKr: v.tongKr,
		dangBan: [],
		conLai: [],
	});
}

type CaLyDo = {
	ten: string;
	hop: ReturnType<typeof hop>;
	chuKy: { phase: string; startsOn: string };
	can: LyDoRong;
};

const MA_TRAN_LY_DO: readonly CaLyDo[] = [
	{
		ten: "lap-ke-hoach",
		hop: hopLyDo({ tongKr: 0, daCapNhat: 0, tuanDau: false }),
		chuKy: { phase: "lap-ke-hoach", startsOn: NGAY_BAT_DAU_SAU },
		can: "chu-ky-chua-chay",
	},
	{
		ten: "chua-toi-ngay",
		hop: hopLyDo({ tongKr: 3, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_SAU },
		can: "chu-ky-chua-chay",
	},
	{
		ten: "chua-kr",
		hop: hopLyDo({ tongKr: 0, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: "chua-kr-cong-bo",
	},
	{
		ten: "chua-cap-nhat",
		hop: hopLyDo({ tongKr: 4, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: "chua-ai-cap-nhat",
	},
	{
		ten: "co-cap-nhat",
		hop: hopLyDo({ tongKr: 4, daCapNhat: 2, tuanDau: false }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: null,
	},
];

describe("htmb-ly-do-ham", () => {
	it("lyDoRong chon dung ly do cho tung o cua ma tran", () => {
		let dem = 0;
		for (const ca of MA_TRAN_LY_DO) {
			const ra = lyDoRong({
				hop: ca.hop,
				chuKy: ca.chuKy,
				homNay: HOM_NAY_VN_SAU_NUA_DEM,
			});
			expect(ra, `htmb-ly-do: ${ca.ten} ra ${ra}`).toBe(ca.can);
			dem += 1;
		}
		expect(dem).toBe(5);
	});
});
