import {
	afterEach,
	describe,
	expect,
	type Mock,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { dauNgayVN, ngayVN } from "@crm/db/onboarding-nhac";
import { demHoiKho, ghiKetQuaHoi } from "@crm/db/tai-lieu-hoi";
import { TAI_LIEU_HOI, type TraLoiDaKiem } from "@crm/validation/tai-lieu-hoi";
import { KHONG_TRONG_PHAM_VI } from "@crm/validation/vai-workspace";
import { Logger } from "@nestjs/common";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { type Ai, dungSan, goi, hoi, ok, phien } from "./tai-lieu-san";

dungSan();

afterEach(() => {
	setSystemTime();
});

const TRA_LOI: TraLoiDaKiem = {
	cau: [
		{
			chu: "Tầng 2 hưởng 1,2%.",
			trich: [
				{
					slug: "hoa-hong",
					ten: "Chính sách hoa hồng",
					phienBan: 5,
					duyetLuc: "2026-07-01T03:00:00.000Z",
					doan: "| Tầng 2 | 2 – 10 tỷ | 1,2% |",
				},
			],
		},
	],
	quaHan: [],
};

async function hoiKho(cauHoi: string, ai: Ai) {
	return goi("hoiKho.hoi", { cauHoi }, ai);
}

async function soHangCua(ai: Ai): Promise<number> {
	return db.taiLieuHoi.count({ where: { nguoiHoiId: phien[ai].nguoi } });
}

describe("tlk-hoi", () => {
	test("tlk-hoi: hoi ghi hang dang hoi va mot viec hoi-kho trong cung giao dich", async () => {
		const { hoiId } = ok<{ hoiId: string }>(
			await hoiKho("Hoa hồng tầng 2 bao nhiêu?", "khac"),
			"hoi",
		);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: hoiId },
		});
		expect(hang.trangThai).toBe("DANG_HOI");
		expect(hang.kenh).toBe("CRM");
		expect(hang.nguoiHoiId).toBe(phien.khac.nguoi);
		const viec = await db.agentTask.findMany({
			where: { kind: "hoi-kho", payload: { path: ["hoiId"], equals: hoiId } },
		});
		expect(viec).toHaveLength(1);
		expect(viec[0]?.finishedAt).toBeNull();
	});

	test("tlk-hoi: ghi viec hong thi khong con hang nao", async () => {
		const truoc = await soHangCua("tao");
		const gia = spyOn(AgentTriggerService.prototype, "hoiKho") as Mock<
			AgentTriggerService["hoiKho"]
		>;
		gia.mockImplementationOnce(async () => {
			throw new Error("ghi viec hong");
		});
		const tra = await hoiKho(
			"Nghỉ phép năm có chuyển sang năm sau không?",
			"tao",
		);
		gia.mockRestore();
		expect(tra.status).toBe(500);
		expect(await soHangCua("tao")).toBe(truoc);
	});

	test("tlk-hoi: ket qua dang hoi, roi da tra loi doc tu hang da kiem", async () => {
		const { hoiId } = ok<{ hoiId: string }>(
			await hoiKho("Hoa hồng tầng 2 bao nhiêu?", "chu"),
			"hoi",
		);
		expect(
			ok<unknown>(await hoi("hoiKho.ketQua", { hoiId }, "chu"), "ket qua 1"),
		).toEqual({ trangThai: "DANG_HOI" });
		expect(
			await ghiKetQuaHoi(
				db,
				hoiId,
				{ trangThai: "TRA_LOI", traLoi: TRA_LOI },
				new Date(),
			),
		).toBe(true);
		expect(
			ok<unknown>(await hoi("hoiKho.ketQua", { hoiId }, "chu"), "ket qua 2"),
		).toEqual({ trangThai: "TRA_LOI", traLoi: TRA_LOI });
		const khac = await hoi("hoiKho.ketQua", { hoiId }, "khac");
		expect(khac.status).toBe(404);
	});

	test("tlk-hoi: vai okr bi chan, khong co hang", async () => {
		const tra = await hoiKho("Hoa hồng tầng 2 bao nhiêu?", "okr");
		expect(tra.status).toBe(403);
		expect(tra.loi).toBe(KHONG_TRONG_PHAM_VI);
		expect(await soHangCua("okr")).toBe(0);
	});

	test("tlk-hoi: cau ngoai 2-500 ky tu bi tu choi, NFD luu thanh NFC", async () => {
		expect((await hoiKho("a", "admin")).status).toBe(400);
		expect(
			(await hoiKho("a".repeat(TAI_LIEU_HOI.cauHoi.toiDa + 1), "admin")).status,
		).toBe(400);
		const nfd = "Nghỉ phép năm".normalize("NFD");
		const { hoiId } = ok<{ hoiId: string }>(
			await hoiKho(`  ${nfd}  `, "admin"),
			"nfd",
		);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: hoiId },
		});
		expect(hang.cauHoi).toBe("Nghỉ phép năm".normalize("NFC"));
	});
});

describe("tlk-nhat-ky", () => {
	test("tlk-nhat-ky: chin cau, xoa chu cau da tra loi, dem dung, log khong mang chu", async () => {
		const goc = new Date("2030-03-10T03:00:00.000Z");
		const cauHoi = Array.from(
			{ length: 9 },
			(_, i) => `Câu nhật ký số ${i + 1}?`,
		);
		const ghiLog: string[] = [];
		const bat = [
			...(["log", "warn", "error", "debug", "verbose"] as const).map((m) =>
				spyOn(Logger.prototype, m).mockImplementation((...a: string[]) => {
					ghiLog.push(JSON.stringify(a));
				}),
			),
			...(["log", "info", "warn", "error", "debug"] as const).map((m) =>
				spyOn(console, m).mockImplementation((...a: string[]) => {
					ghiLog.push(JSON.stringify(a));
				}),
			),
		];
		const quaHttp = "Câu nhật ký gửi qua HTTP thật?";
		const { hoiId: hoiHttp } = ok<{ hoiId: string }>(
			await hoiKho(quaHttp, "owner"),
			"hoi qua http",
		);
		ok(await hoi("hoiKho.ketQua", { hoiId: hoiHttp }, "owner"), "ket qua");
		const id: string[] = [];
		for (const [i, c] of cauHoi.entries()) {
			const hang = await db.taiLieuHoi.create({
				data: {
					nguoiHoiId: phien.owner.nguoi,
					kenh: i === 3 || i === 6 ? "ZALO" : "CRM",
					cauHoi: c,
					hoiLuc: new Date(goc.getTime() + i * 60_000),
				},
			});
			id.push(hang.id);
		}
		const ma = (i: number): string => {
			const v = id[i];
			if (v === undefined) throw new Error(`tlk-nhat-ky: thieu hang ${i}`);
			return v;
		};
		const xong = new Date(goc.getTime() + 3_600_000);
		for (const i of [0, 1, 2, 3])
			await ghiKetQuaHoi(
				db,
				ma(i),
				{ trangThai: "TRA_LOI", traLoi: TRA_LOI },
				xong,
			);
		for (const i of [4, 5, 6])
			await ghiKetQuaHoi(
				db,
				ma(i),
				{ trangThai: "TU_CHOI", lyDo: "khong-co-trang", ganNhat: [] },
				xong,
			);
		for (const i of [7, 8])
			await ghiKetQuaHoi(
				db,
				ma(i),
				{ trangThai: "LOI", lyDo: "loi-model" },
				xong,
			);
		await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: phien.owner.nguoi,
				kenh: "CRM",
				trangThai: "TRA_LOI",
				hoiLuc: new Date(goc.getTime() - 86_400_000),
			},
		});
		for (const b of bat) b.mockRestore();

		const hang = await db.taiLieuHoi.findMany({ where: { id: { in: id } } });
		const theoId = new Map(hang.map((h) => [h.id, h]));
		for (const i of [0, 1, 2, 3]) {
			expect(theoId.get(ma(i))?.cauHoi).toBeNull();
			expect(theoId.get(ma(i))?.traLoi).toEqual(TRA_LOI);
		}
		for (const i of [4, 5, 6])
			expect(theoId.get(ma(i))?.cauHoi).toBe(cauHoi[i]);
		const so = await demHoiKho(db, goc, new Date(goc.getTime() + 600_000));
		expect(so).toEqual({ traLoi: 4, tuChoi: 3, loi: 2, tiLe: 4 / 7 });
		expect(
			ghiLog.some((l) => l.includes("hoiKho.hoi")),
			"tlk-nhat-ky: bo bat log khong thu duoc dong nao cua duong hoiKho.hoi",
		).toBe(true);
		const lot = [...cauHoi, quaHttp].filter((c) =>
			ghiLog.some((l) => l.includes(c)),
		);
		expect(lot, "tlk-nhat-ky: log mang chu cau hoi").toEqual([]);
	});
});

describe("tlk-tran", () => {
	test("tlk-tran: tran ngay gom bien, khong dem Zalo va hom qua; tran thang", async () => {
		const bayGio = new Date(
			`${new Date().toISOString().slice(0, 10)}T16:50:00.000Z`,
		);
		setSystemTime(bayGio);
		const dau = dauNgayVN(bayGio);
		const P = phien.tao.nguoi;
		await db.taiLieuHoi.deleteMany({ where: { nguoiHoiId: P } });
		const motHang = (kenh: string, hoiLuc: Date, nguoiHoiId = P) => ({
			nguoiHoiId,
			kenh,
			trangThai: "TRA_LOI",
			hoiLuc,
		});
		await db.taiLieuHoi.createMany({
			data: [
				...Array.from({ length: TAI_LIEU_HOI.tran.ngay - 1 }, () =>
					motHang("CRM", new Date(dau.getTime() + 60_000)),
				),
				...Array.from({ length: 5 }, () =>
					motHang("ZALO", new Date(dau.getTime() + 60_000)),
				),
				motHang("CRM", new Date(dau.getTime() - 60_000)),
			],
		});
		ok(await hoiKho("Câu thứ trần ngày?", "tao"), "cau thu tranNgay");
		const viecTruoc = await db.agentTask.count({ where: { kind: "hoi-kho" } });
		const vuot = await hoiKho("Câu vượt trần ngày?", "tao");
		expect(vuot.status).toBe(429);
		expect(vuot.loi).toBe(
			TAI_LIEU_HOI.tranNgay.replace("{so}", String(TAI_LIEU_HOI.tran.ngay)),
		);
		expect(await db.agentTask.count({ where: { kind: "hoi-kho" } })).toBe(
			viecTruoc,
		);

		const dauThang = new Date(`${ngayVN(bayGio).slice(0, 8)}01T00:00:00+07:00`);
		const daCo = await db.taiLieuHoi.count({
			where: { kenh: "CRM", hoiLuc: { gte: dauThang } },
		});
		const thieu = TAI_LIEU_HOI.tran.thang - daCo;
		if (thieu > 0)
			await db.taiLieuHoi.createMany({
				data: Array.from({ length: thieu }, () =>
					motHang(
						"CRM",
						new Date(dauThang.getTime() + 60_000),
						phien.chu.nguoi,
					),
				),
			});
		const thang = await hoiKho("Câu vượt trần tháng?", "khac");
		expect(thang.status).toBe(429);
		expect(thang.loi).toBe(
			TAI_LIEU_HOI.tranThang.replace("{so}", String(TAI_LIEU_HOI.tran.thang)),
		);
	});
});
