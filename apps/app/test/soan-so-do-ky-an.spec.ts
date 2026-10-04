import { describe, expect, test } from "bun:test";
import { kySoDoSoan } from "@/app/(app)/[slug]/okr/okr-search-params";

type Ky = {
	id: string;
	phase: "lap-ke-hoach" | "dang-chay" | "cham-diem" | "da-dong";
	anLuc: string | null;
};

const AN: Ky = {
	id: "ky-ke-hoach-an",
	phase: "lap-ke-hoach",
	anLuc: "2026-09-30T03:00:00.000Z",
};
const KE_HOACH: Ky = {
	id: "ky-ke-hoach-hien",
	phase: "lap-ke-hoach",
	anLuc: null,
};
const CHAY: Ky = { id: "ky-dang-chay", phase: "dang-chay", anLuc: null };
const CHAY_AN: Ky = {
	id: "ky-dang-chay-an",
	phase: "dang-chay",
	anLuc: "2026-09-30T03:00:00.000Z",
};

describe("so-do-ky-an", () => {
	test("so-do-ky-an: the so do bo qua chu ky lap ke hoach da an, lay chu ky lap ke hoach con hien", () => {
		expect({
			coHien: kySoDoSoan({ cycles: [AN, KE_HOACH, CHAY], currentId: CHAY.id })
				?.id,
			chiAn: kySoDoSoan({ cycles: [AN, CHAY], currentId: CHAY.id })?.id,
		}).toEqual({ coHien: KE_HOACH.id, chiAn: CHAY.id });
	});

	test("so-do-ky-an: ky hien tai da an khong duoc chon; chua tai thi null", () => {
		expect({
			hienTaiAn:
				kySoDoSoan({ cycles: [CHAY_AN, CHAY], currentId: CHAY_AN.id })?.id ??
				null,
			hienTaiHien: kySoDoSoan({ cycles: [CHAY_AN, CHAY], currentId: CHAY.id })
				?.id,
			chuaTai: kySoDoSoan(undefined),
		}).toEqual({ hienTaiAn: null, hienTaiHien: CHAY.id, chuaTai: null });
	});
});
