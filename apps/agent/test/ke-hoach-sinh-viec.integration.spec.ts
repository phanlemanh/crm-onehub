import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { taoViecChoBuoc } from "@crm/db/buoc-viec";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import {
	donDep,
	gieoKeHoach,
	gieoNguoi,
	moXuong,
	TIEN_TO,
} from "./support/nhac-gieo";

const NOW = new Date("2026-10-14T09:00:00+07:00");
const BAT_DAU = new Date("2026-10-01T09:00:00+07:00");
const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

async function donViec() {
	await db.viec.deleteMany({ where: { taoBoiId: { startsWith: TIEN_TO } } });
}

beforeEach(async () => {
	await donViec();
	await moXuong();
	setSystemTime(NOW);
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await donViec();
	await donDep();
});

describe("kh-nhac-buoc", () => {
	test("bước cũ nhắc buoc-qua-han; bước mang Việc chỉ nhắc viec-qua-han, không nhắc trùng", async () => {
		const chu = await gieoNguoi("KH Chủ nhắc");
		const b = await gieoNguoi("KH B nhắc");
		const cu = await gieoKeHoach({
			camTrich: chu.id,
			batDau: BAT_DAU,
			buoc: [{ nhan: "cũ quá hạn", han: han("2026-10-10"), giao: b.id }],
		});
		const moi = await gieoKeHoach({
			camTrich: chu.id,
			batDau: BAT_DAU,
			buoc: [{ nhan: "mới quá hạn", han: han("2026-10-10"), giao: b.id }],
		});
		const buocMoi = moi.buoc[0];
		if (!buocMoi) throw new Error("kh: gieo thieu buoc moi");
		const { viecId } = await db.$transaction((tx) =>
			taoViecChoBuoc(tx, {
				stepId: buocMoi.id,
				planId: moi.plan.id,
				tieuDe: "mới quá hạn",
				hanNgay: han("2026-10-10"),
				nguoiGiaoId: chu.id,
				nguoiThucHienId: b.id,
				nguon: "khuon",
				now: NOW,
			}),
		);

		const gom = await viecCanNhac(db, {
			now: NOW,
			userId: b.id,
			cuaSo: "buoi-sang",
		});
		const cua = gom.get(b.id) ?? [];
		const buocCu = cua.filter(
			(v) =>
				v.loai === "buoc-qua-han" &&
				"stepId" in v &&
				v.stepId === cu.buoc[0]?.id,
		);
		if (buocCu.length !== 1) throw new Error("kh: nhac buoc cu mat");
		const viecCuaBuoc = cua.filter(
			(v) => v.loai === "viec-qua-han" && "viecId" in v && v.viecId === viecId,
		);
		if (viecCuaBuoc.length !== 1) {
			throw new Error("kh: nhac viec cua buoc mat");
		}
		const trung = cua.filter(
			(v) =>
				v.loai.startsWith("buoc-") && "stepId" in v && v.stepId === buocMoi.id,
		);
		if (trung.length !== 0) throw new Error("kh: nhac trung buoc va viec");
		expect(buocCu).toHaveLength(1);
	});
});
