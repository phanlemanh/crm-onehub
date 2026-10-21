import { describe, test } from "bun:test";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import { giuKhiChiDoiLoc } from "@/app/(app)/[slug]/okr/theo-don-vi/giu-bang";

type DuLieu = { rows: string[] };

const CU: DuLieu = { rows: ["mt-1"] };
const PB: DonChonOkr = { loai: "pb", id: "pb-1" };
const PB_KHAC: DonChonOkr = { loai: "pb", id: "pb-2" };

function truyVan(cycleId: string, unit: DonChonOkr, trangThai: string[]) {
	return {
		queryKey: [
			["okr", "danhSach"],
			{ input: { cycleId, unit, loc: { trangThai } }, type: "query" },
		],
	};
}

function phai(dieuKien: boolean, thongDiep: string): void {
	if (!dieuKien) throw new Error(thongDiep);
}

describe("ldv-giu", () => {
	test("ldv-giu: cung chu ky, cung don vi, khac loc thi giu bang cu", () => {
		const giu = giuKhiChiDoiLoc<DuLieu>({ cycleId: "ky-1", don: PB });
		phai(
			giu(CU, truyVan("ky-1", PB, [])) === CU,
			"ldv-giu: doi loc khong giu bang cu",
		);
	});

	test("ldv-giu: khac don vi thi khong giu", () => {
		const giu = giuKhiChiDoiLoc<DuLieu>({ cycleId: "ky-1", don: PB_KHAC });
		phai(
			giu(CU, truyVan("ky-1", PB, ["dung-han"])) === undefined,
			"ldv-giu: doi don vi giu bang cu",
		);
	});

	test("ldv-giu: khac chu ky thi khong giu", () => {
		const giu = giuKhiChiDoiLoc<DuLieu>({ cycleId: "ky-2", don: PB });
		phai(
			giu(CU, truyVan("ky-1", PB, ["dung-han"])) === undefined,
			"ldv-giu: doi chu ky giu bang cu",
		);
	});

	test("ldv-giu: chua co truy van truoc thi khong giu", () => {
		const giu = giuKhiChiDoiLoc<DuLieu>({ cycleId: "ky-1", don: PB });
		phai(giu(undefined, undefined) === undefined, "ldv-giu: lan dau van giu");
	});
});
