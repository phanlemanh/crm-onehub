import "./bat-dem-truy-van";
import { describe, expect, test } from "bun:test";
import { db, setPrismaLogSink } from "@crm/db";
import { hoiYDoPhuOutput } from "../src/okr/okr-hoi-y.contracts";
import { datDongHo, dungSanHoiY, gieoHoiY } from "./okr-hoi-y-san";
import { bpMoi, datViTri, goiQuery, ok, pbMoi } from "./okr-san";

dungSanHoiY();

const CHO_MS = 120_000;
const LUC = new Date("2026-11-02T03:00:00.000Z");
const SO_PHONG_BAN_NHO = 5;
const SO_PHONG_BAN_LON = 50;
const SO_BO_PHAN = 3;

async function demCauMoiKhoiChay(): Promise<boolean> {
	let cau = 0;
	setPrismaLogSink((r) => {
		if (r.level === "query") cau += 1;
	});
	await db.$queryRaw`SELECT 1`;
	setPrismaLogSink(null);
	return cau > 0;
}

const DEM_DUOC = await demCauMoiKhoiChay();
if (!DEM_DUOC)
	console.warn(
		"hieu-nang: bỏ qua — máy khách Prisma đã nạp trước khi tệp này bật nhật ký truy vấn; chạy riêng: bun test test/okr-hoi-y-hieu-nang.spec.ts",
	);

async function doDem(
	hoiYId: string,
	cookie: string,
): Promise<{ cau: number; soPhongBan: number }> {
	let cau = 0;
	setPrismaLogSink((r) => {
		if (r.level === "query") cau += 1;
	});
	const tra = await goiQuery("okr.hoiYDoPhu", cookie, { hoiYId });
	setPrismaLogSink(null);
	const bang = hoiYDoPhuOutput.parse(ok(tra, "hoiYDoPhu"));
	return {
		cau,
		soPhongBan: bang.hang.filter((h) => h.loai === "phong-ban").length,
	};
}

describe("hieu-nang", () => {
	test.if(DEM_DUOC)(
		"hieu-nang: số câu truy vấn của hoiYDoPhu không tăng khi phòng ban đi từ 5 lên 50",
		async () => {
			datDongHo(LUC);
			const { h, nguoi } = await gieoHoiY({ yCua: ["T", "O", "A"] });
			const boPhan = [
				await bpMoi("hn-bp-0"),
				await bpMoi("hn-bp-1"),
				await bpMoi("hn-bp-2"),
			];
			expect(boPhan.length).toBe(SO_BO_PHAN);
			const phongBan: string[] = [];
			const themPhongBan = async (den: number) => {
				while (phongBan.length < den) {
					const bo = boPhan[phongBan.length % SO_BO_PHAN] ?? null;
					phongBan.push(await pbMoi(`hn-pb-${phongBan.length}`, bo));
				}
			};
			const xepNguoi = async () => {
				for (const [i, ai] of [nguoi.T, nguoi.O, nguoi.A, nguoi.B].entries()) {
					const pb = phongBan[i % phongBan.length];
					if (pb) ok(await datViTri(ai.id, pb), "xep nguoi");
				}
			};

			await themPhongBan(SO_PHONG_BAN_NHO);
			await xepNguoi();
			await doDem(h, nguoi.Q.cookie);
			const nho = await doDem(h, nguoi.Q.cookie);

			await themPhongBan(SO_PHONG_BAN_LON);
			await xepNguoi();
			await doDem(h, nguoi.Q.cookie);
			const lon = await doDem(h, nguoi.Q.cookie);

			console.log(
				`hieu-nang: ${nho.soPhongBan} phòng ban ${nho.cau} câu, ${lon.soPhongBan} phòng ban ${lon.cau} câu`,
			);
			expect(`hoiYDoPhu đếm được câu truy vấn: ${nho.cau > 0}`).toBe(
				"hoiYDoPhu đếm được câu truy vấn: true",
			);
			expect(lon.soPhongBan - nho.soPhongBan, "so phong ban them").toBe(
				SO_PHONG_BAN_LON - SO_PHONG_BAN_NHO,
			);
			expect(
				`hoiYDoPhu: số câu ${nho.soPhongBan} phòng ban = ${nho.cau}, ${lon.soPhongBan} phòng ban = ${lon.cau}`,
			).toBe(
				`hoiYDoPhu: số câu ${nho.soPhongBan} phòng ban = ${nho.cau}, ${lon.soPhongBan} phòng ban = ${nho.cau}`,
			);
		},
		CHO_MS,
	);
});
