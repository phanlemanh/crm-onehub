import "./bat-dem-truy-van";
import { describe, expect, test } from "bun:test";
import { db, type PrismaLogRecord, setPrismaLogSink } from "@crm/db";
import { viecOkrCanNhac } from "@crm/db/okr-nhac";
import { hoiYDoPhuOutput } from "../src/okr/okr-hoi-y.contracts";
import { datDongHo, dungSanHoiY, gieoHoiY, sauGio } from "./okr-hoi-y-san";
import { bpMoi, datViTri, goiQuery, ok, pbMoi } from "./okr-san";

dungSanHoiY();

const CHO_MS = 120_000;
const LUC = new Date("2026-11-02T03:00:00.000Z");
const SO_PHONG_BAN_NHO = 5;
const SO_PHONG_BAN_LON = 50;
const SO_BO_PHAN = 3;

const CHAY_RIENG = process.env.DB_DA_NAP_TRUOC_TEP_DEM === "false";
if (process.env.PRISMA_LOG_QUERIES_DO_TEP_DEM === "true") {
	delete process.env.PRISMA_LOG_QUERIES;
	delete process.env.PRISMA_LOG_QUERIES_DO_TEP_DEM;
}
if (!CHAY_RIENG)
	console.warn(
		"hieu-nang: !!! KHÔNG ĐO !!! @crm/db đã nạp trong tiến trình này trước tệp hiệu năng nên không có nhật ký truy vấn; số truy vấn cố định của hoiYDoPhu chỉ được đo khi chạy riêng: cd apps/api && bun test test/okr-hoi-y-hieu-nang.spec.ts",
	);

const chiGhiLoi = (r: PrismaLogRecord) => {
	if (r.level === "error") console.error(r.message);
	if (r.level === "warn") console.warn(r.message);
};
if (CHAY_RIENG) setPrismaLogSink(chiGhiLoi);

async function doDem(
	hoiYId: string,
	cookie: string,
): Promise<{ cau: number; soPhongBan: number }> {
	let cau = 0;
	setPrismaLogSink((r) => {
		if (r.level === "query") cau += 1;
	});
	const tra = await goiQuery("okr.hoiYDoPhu", cookie, { hoiYId });
	setPrismaLogSink(chiGhiLoi);
	const bang = hoiYDoPhuOutput.parse(ok(tra, "hoiYDoPhu"));
	return {
		cau,
		soPhongBan: bang.hang.filter((h) => h.loai === "phong-ban").length,
	};
}

describe("hieu-nang", () => {
	test.if(CHAY_RIENG)(
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

	test.if(CHAY_RIENG)(
		"hieu-nang: số câu truy vấn của việc OKR không tăng khi lần hỏi ý đi từ 1 lên 4 và thành viên tăng theo",
		async () => {
			datDongHo(LUC);
			const now = sauGio(LUC, 1);
			const doNhac = async () => {
				let cau = 0;
				setPrismaLogSink((r) => {
					if (r.level === "query") cau += 1;
				});
				const ket = await viecOkrCanNhac(db, { now, cuaSo: "truc-tiep" });
				setPrismaLogSink(chiGhiLoi);
				return { cau, soNguoi: ket.size };
			};
			await gieoHoiY({ yCua: ["T"] });
			await doNhac();
			const mot = await doNhac();
			for (let i = 0; i < 3; i += 1) await gieoHoiY({ yCua: ["T", "A"] });
			await doNhac();
			const bon = await doNhac();
			console.log(
				`hieu-nang: viecOkrCanNhac ${mot.cau} câu với ${mot.soNguoi} người, ${bon.cau} câu với ${bon.soNguoi} người`,
			);
			expect(`viecOkrCanNhac đếm được câu truy vấn: ${mot.cau > 0}`).toBe(
				"viecOkrCanNhac đếm được câu truy vấn: true",
			);
			expect(bon.soNguoi - mot.soNguoi, "so nguoi them").toBeGreaterThan(0);
			expect(
				`viecOkrCanNhac: 1 lần hỏi ý = ${mot.cau} câu, 4 lần hỏi ý = ${bon.cau} câu`,
			).toBe(
				`viecOkrCanNhac: 1 lần hỏi ý = ${mot.cau} câu, 4 lần hỏi ý = ${mot.cau} câu`,
			);
		},
		CHO_MS,
	);
});
