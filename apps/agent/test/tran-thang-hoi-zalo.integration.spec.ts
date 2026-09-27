import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { ZALO } from "../agent/lib/zalo-config";
import { dongHoi, hoiTacTu, type KetHoi } from "../agent/lib/zalo-hoi";
import { donHoi, gieoVai } from "./support/hoi-gieo";
import { donDep, moXuong } from "./support/nhac-gieo";

const PHUT_MS = 60_000;
const DA_CO = 299;
const TRAN_THANG = 300;
let soTin = 0;

function vn(ngay: string, gio: string): Date {
	return new Date(`${ngay}T${gio}:00+07:00`);
}

async function hoi(chatId: string, userId: string, luc: Date): Promise<KetHoi> {
	soTin += 1;
	return db.$transaction((tx) =>
		hoiTacTu(
			tx,
			{
				messageId: `tthz-${Date.now()}-${soTin}`,
				chatId,
				text: "Thoả thuận nào sắp hạn?",
			},
			userId,
			luc,
		),
	);
}

async function gieo(
	soHang: number,
	ketQua: string,
	nguoi: { A: string; D: string },
	batDau: Date,
) {
	await db.zaloHoi.createMany({
		data: Array.from({ length: soHang }, (_, i) => ({
			messageId: `tthz-${ketQua}-${Date.now()}-${i}`,
			crmUserId: i % 2 === 0 ? nguoi.A : nguoi.D,
			zaloChatId: i % 2 === 0 ? "ZA-cu" : "ZD",
			hoiLuc: new Date(batDau.getTime() + i * PHUT_MS),
			ketQua,
		})),
	});
}

async function hangCuoi(userId: string) {
	return db.zaloHoi.findFirst({
		where: { crmUserId: userId },
		orderBy: [{ hoiLuc: "desc" }, { id: "desc" }],
	});
}

beforeAll(async () => {
	await moXuong();
});

beforeEach(async () => {
	await donHoi();
});

afterAll(async () => {
	await donHoi();
	await donDep();
});

describe("tran-thang-hoi-zalo", () => {
	test("gia-tri: ba tran hoi la 3 cau/phut, 20 cau/ngay, 300 cau/thang", () => {
		expect(ZALO.hoi.tran, "tran thang phai la 300 (quyet dinh 27/09)").toEqual({
			phut: 3,
			ngay: 20,
			thang: 300,
		});
	});

	test("bien-300: cau 300 cua xuong mo phien, cau 301 bi chan theo tran thang", async () => {
		const A = await gieoVai("An", "member");
		const D = await gieoVai("Dung", "member");
		await gieo(
			DA_CO,
			"da-tra-loi",
			{ A: A.id, D: D.id },
			vn("2026-10-01", "08:00"),
		);

		const luc300 = vn("2026-10-20", "10:00");
		const cau300 = await hoi("ZA", A.id, luc300);
		expect(cau300.loai, "cau 300 phai mo phien").toBe("hoi");
		if (cau300.loai !== "hoi") return;
		const hang300 = await db.zaloHoi.findUniqueOrThrow({
			where: { id: cau300.yeuCau.hoiId },
		});
		expect(
			hang300.hoiLuc.getTime(),
			"hang cau 300 nam trong thang 10 gio VN",
		).toBe(luc300.getTime());
		await dongHoi(cau300.yeuCau.hoiId, {
			ketQua: "da-tra-loi",
			traLoiLuc: luc300,
		});
		expect(
			await db.zaloHoi.count({
				where: {
					ketQua: { in: ["dang-hoi", "da-tra-loi", "gui-hong"] },
					hoiLuc: { gte: vn("2026-10-01", "00:00") },
				},
			}),
			"xuong du 300 cau da mo phien",
		).toBe(TRAN_THANG);

		const dangHoiTruoc = await db.zaloHoi.count({
			where: { crmUserId: A.id, ketQua: "dang-hoi" },
		});
		const cau301 = await hoi("ZA", A.id, vn("2026-10-20", "10:05"));
		expect(cau301, "cau 301 phai bi chan theo tran thang").toEqual({
			loai: "tra-loi",
			text: ZALO.loi.hetTranThang,
		});
		expect((await hangCuoi(A.id))?.ketQua).toBe("tu-choi-tran-thang");
		expect(
			await db.zaloHoi.count({
				where: { crmUserId: A.id, ketQua: "dang-hoi" },
			}),
		).toBe(dangHoiTruoc);
	});

	test("thang-vn: du 300 thi 23:59 ngay 31/10 bi chan, 00:01 ngay 1/11 gio VN mo phien", async () => {
		const A = await gieoVai("An", "member");
		const D = await gieoVai("Dung", "member");
		await gieo(
			TRAN_THANG,
			"da-tra-loi",
			{ A: A.id, D: D.id },
			vn("2026-10-01", "08:00"),
		);

		const cuoiThang = await hoi("ZA", A.id, new Date("2026-10-31T16:59:00Z"));
		expect(cuoiThang, "23:59 ngay 31/10 gio VN van thang cu").toEqual({
			loai: "tra-loi",
			text: ZALO.loi.hetTranThang,
		});
		const dauThang = await hoi("ZA", A.id, new Date("2026-10-31T17:01:00Z"));
		expect(dauThang.loai, "thang xuong dem lai luc 00:00 ngay 1 gio VN").toBe(
			"hoi",
		);
	});

	test("khong-tinh: hang khong mo phien khong tinh vao tran thang; gui-hong thi tinh", async () => {
		const A = await gieoVai("An", "member");
		const D = await gieoVai("Dung", "member");
		const nguoi = { A: A.id, D: D.id };
		await gieo(DA_CO, "da-tra-loi", nguoi, vn("2026-10-01", "08:00"));
		await gieo(4, "tu-choi-tran-ngay", nguoi, vn("2026-10-10", "08:00"));
		await gieo(4, "tu-choi-tran-phut", nguoi, vn("2026-10-11", "08:00"));
		await gieo(3, "loi", nguoi, vn("2026-10-12", "08:00"));
		await gieo(3, "dang-ban", nguoi, vn("2026-10-13", "08:00"));

		const mo = await hoi("ZA", A.id, vn("2026-10-20", "10:00"));
		expect(mo.loai, "hang khong mo phien khong tinh vao tran thang").toBe(
			"hoi",
		);
		if (mo.loai === "hoi")
			await db.zaloHoi.delete({ where: { id: mo.yeuCau.hoiId } });

		await gieo(1, "gui-hong", nguoi, vn("2026-10-14", "08:00"));
		const chan = await hoi("ZA", A.id, vn("2026-10-20", "10:10"));
		expect(chan, "gui-hong tinh vao tran thang").toEqual({
			loai: "tra-loi",
			text: ZALO.loi.hetTranThang,
		});
	});
});
