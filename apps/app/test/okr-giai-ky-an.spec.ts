import { describe, expect, test } from "bun:test";
import {
	giaiKy,
	giaiKyHoiY,
	KY_HIEN_TAI,
	kyMacDinhHoiY,
	kyTrongOChon,
	loadOkrSearchParams,
} from "@/app/(app)/[slug]/okr/okr-search-params";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

type Ky = {
	id: string;
	kind: "nam" | "quy";
	phase: "lap-ke-hoach" | "dang-chay" | "cham-diem" | "da-dong";
	startsOn: string;
	anLuc: string | null;
};

const H: Ky = {
	id: "ky-an-nham",
	kind: "nam",
	phase: "lap-ke-hoach",
	startsOn: "2026-01-01",
	anLuc: "2026-09-30T03:00:00.000Z",
};
const C: Ky = {
	id: "ky-dang-chay",
	kind: "nam",
	phase: "dang-chay",
	startsOn: "2026-01-02",
	anLuc: null,
};
const P: Ky = {
	id: "ky-ke-hoach-dung",
	kind: "quy",
	phase: "lap-ke-hoach",
	startsOn: "2026-10-01",
	anLuc: null,
};
const P2: Ky = {
	id: "ky-ke-hoach-sau",
	kind: "nam",
	phase: "lap-ke-hoach",
	startsOn: "2027-01-01",
	anLuc: null,
};

const DU_LIEU = { cycles: [P2, C, H, P], currentId: C.id };

describe("giai-ky-an", () => {
	test("giai-ky-an: id cua chu ky an roi ve ky mac dinh o moi ham giai", () => {
		expect({
			giaiKyAn: giaiKy(H.id, DU_LIEU),
			giaiKyDung: giaiKy(C.id, DU_LIEU),
			giaiKyKeHoach: giaiKy(P.id, DU_LIEU),
			macDinhHoiY: kyMacDinhHoiY(DU_LIEU),
			giaiKyHoiYAn: giaiKyHoiY(H.id, DU_LIEU),
			giaiKyHoiYDung: giaiKyHoiY(P2.id, DU_LIEU),
			giaiKyHoiYHienTai: giaiKyHoiY(KY_HIEN_TAI, DU_LIEU),
			oChon: kyTrongOChon(DU_LIEU.cycles).map((c) => c.id),
		}).toEqual({
			giaiKyAn: C.id,
			giaiKyDung: C.id,
			giaiKyKeHoach: P.id,
			macDinhHoiY: P.id,
			giaiKyHoiYAn: P.id,
			giaiKyHoiYDung: P2.id,
			giaiKyHoiYHienTai: C.id,
			oChon: [P2.id, C.id, P.id],
		});
	});

	test("giai-ky-an: chi con chu ky an o pha lap ke hoach thi Hoi y roi ve ky hien tai", () => {
		const chiAn = { cycles: [H, C], currentId: C.id };
		expect({
			macDinh: kyMacDinhHoiY(chiAn),
			giai: giaiKyHoiY(H.id, chiAn),
		}).toEqual({ macDinh: C.id, giai: C.id });
	});

	test("giai-ky-an-url: ?kyOkr=<id an> tren duong dan cu roi ve ky mac dinh", () => {
		const thamSo = loadOkrSearchParams(
			new URLSearchParams(`${SEARCH_PARAM.okr.ky}=${H.id}`),
		);
		const ky = thamSo[SEARCH_PARAM.okr.ky];
		expect({
			ky,
			giaiKy: giaiKy(ky, DU_LIEU),
			giaiKyHoiY: giaiKyHoiY(ky, DU_LIEU),
		}).toEqual({ ky: H.id, giaiKy: C.id, giaiKyHoiY: P.id });
	});
});
