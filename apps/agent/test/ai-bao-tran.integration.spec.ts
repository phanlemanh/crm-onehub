import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db, Prisma } from "@crm/db";
import { dinhUsd } from "@crm/db/ai-chi-phi-danh-muc";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import { gieoNguoi, moXuong } from "./support/nhac-gieo";
import { lucVN } from "./support/nhac-gui-gieo";
import { batBot, donOkr, noiZalo, tatBot, voiToken } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi, gieoChiPhi } from "./support/tro-ly-gieo";
import { zaloGia } from "./support/zalo-gia";

const APP_URL = "https://crm.test";
const TRAN = 10;
const THANG_DOI_SOAT = "2031-09";

let chu = "";
let quanTri = "";
let thanhVien = "";

async function datVai(userId: string, role: string) {
	await db.member.updateMany({ where: { userId }, data: { role } });
}

async function chayNgay(ngay: string) {
	const luc = lucVN(ngay, 1);
	setSystemTime(luc);
	await lenLichNhac(luc);
	const z = zaloGia();
	const tin = new Map<string, string[]>();
	for (const [userId, zalo] of [
		[chu, "ZC"],
		[quanTri, "ZQ"],
		[thanhVien, "ZT"],
	] as const) {
		const hang = await db.agentTask.findFirst({
			where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(userId, luc) },
		});
		if (hang) {
			await voiToken(() =>
				chayNhac(hang, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
			);
		}
		tin.set(
			userId,
			z.guiToi(zalo).map((g) => String(g.body.text ?? "")),
		);
	}
	return tin;
}

function dem(tin: Map<string, string[]>, userId: string, chu: string): number {
	return (tin.get(userId) ?? []).filter((t) => t.includes(chu)).length;
}

const TAM_MUOI = "Kara đã dùng 80% trần tháng";
const CHAM_TRAN = "Kara đã chạm trần tháng";
const DOI_SOAT = "Đối soát tháng 09/2031 với AI Gateway lệch 12%";

beforeAll(async () => {
	await donOkr();
	await donTroLy();
	await db.aiDoiSoat.deleteMany({ where: { thang: { startsWith: "2031-" } } });
	await moXuong();
	await batBot();
	const c = await gieoNguoi("Chủ");
	const q = await gieoNguoi("Quản");
	const t = await gieoNguoi("Thành");
	chu = c.id;
	quanTri = q.id;
	thanhVien = t.id;
	await datVai(chu, "owner");
	await datVai(quanTri, "admin");
	await noiZalo(chu, "ZC");
	await noiZalo(quanTri, "ZQ");
	await noiZalo(thanhVien, "ZT");
	await gieoCauHinhAi(new Date("2031-09-30T00:00:00Z"), {
		aiOn: true,
		aiTranThangUsd: TRAN,
	});
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await db.aiDoiSoat.deleteMany({ where: { thang: { startsWith: "2031-" } } });
	await donTroLy();
	await donOkr();
	await tatBot();
});

describe("bao-tran", () => {
	test("80% báo đúng một lần cho chủ sở hữu và quản trị, thành viên không nhận, tin chỉ có dòng này vẫn gửi", async () => {
		await gieoChiPhi(new Date("2031-10-01T00:30:00+07:00"), "okr.de-xuat", 5);
		await gieoChiPhi(
			new Date("2031-10-05T10:00:00+07:00"),
			"okr.chuyen-tiep",
			3.5,
		);
		await gieoChiPhi(
			new Date("2031-10-05T10:00:00+07:00"),
			"crm.nghien-cuu",
			50,
		);

		const ngay1 = await chayNgay("2031-10-10");
		const ngay2 = await chayNgay("2031-10-11");
		const ngay3 = await chayNgay("2031-10-12");

		const tinQuanTri = ngay1.get(quanTri)?.[0] ?? "";
		expect(tinQuanTri).toContain(
			`${TAM_MUOI} (${dinhUsd(8.5)} / ${dinhUsd(TRAN)})`,
		);
		expect(tinQuanTri).toContain(`${APP_URL}/`);
		expect(tinQuanTri).toContain("/settings/okr");
		expect(
			{
				chu: [ngay1, ngay2, ngay3].map((n) => dem(n, chu, TAM_MUOI)),
				quanTri: [ngay1, ngay2, ngay3].map((n) => dem(n, quanTri, TAM_MUOI)),
				thanhVien: [ngay1, ngay2, ngay3].map(
					(n) => (n.get(thanhVien) ?? []).length,
				),
			},
			"bao tran lap lai",
		).toEqual({ chu: [1, 0, 0], quanTri: [1, 0, 0], thanhVien: [0, 0, 0] });
	}, 60_000);

	test("vượt trần báo «đã chạm trần» đúng một lần", async () => {
		await gieoChiPhi(new Date("2031-10-12T10:00:00+07:00"), "okr.de-xuat", 1.6);
		const ngay4 = await chayNgay("2031-10-13");
		const ngay5 = await chayNgay("2031-10-14");
		expect(ngay4.get(chu)?.[0] ?? "").toContain(
			`${CHAM_TRAN} (${dinhUsd(10.1)} / ${dinhUsd(TRAN)}) — tạm nghỉ tới 01/11`,
		);
		expect([
			dem(ngay4, quanTri, CHAM_TRAN),
			dem(ngay5, quanTri, CHAM_TRAN),
		]).toEqual([1, 0]);
		expect(dem(ngay4, quanTri, TAM_MUOI)).toBe(0);
	}, 60_000);

	test("đối soát tháng trước lệch báo đúng một lần", async () => {
		await db.aiDoiSoat.create({
			data: {
				thang: THANG_DOI_SOAT,
				tuNgay: new Date("2031-09-01T00:00:00Z"),
				denNgay: new Date("2031-09-30T00:00:00Z"),
				soSoUsd: new Prisma.Decimal(1),
				soGatewayUsd: new Prisma.Decimal(1.12),
				lechPhanTram: new Prisma.Decimal(12),
				ketQua: "lech",
			},
		});
		const ngay6 = await chayNgay("2031-10-15");
		const ngay7 = await chayNgay("2031-10-16");
		expect(ngay6.get(chu)?.[0] ?? "").toContain(
			`${DOI_SOAT} (sổ ${dinhUsd(1)}, Gateway ${dinhUsd(1.12)})`,
		);
		expect([
			dem(ngay6, quanTri, DOI_SOAT),
			dem(ngay7, quanTri, DOI_SOAT),
		]).toEqual([1, 0]);
		expect((ngay6.get(thanhVien) ?? []).length).toBe(0);
	}, 60_000);

	test("sang tháng mới báo lại được; mỗi (tháng, mức, người) đúng một dòng", async () => {
		await gieoChiPhi(new Date("2031-11-02T10:00:00+07:00"), "okr.tom-tat", 8.2);
		const thangMoi = await chayNgay("2031-11-10");
		expect(dem(thangMoi, chu, TAM_MUOI)).toBe(1);
		expect(dem(thangMoi, quanTri, TAM_MUOI)).toBe(1);
		const dong = await db.aiBaoTran.findMany({
			where: { userId: { in: [chu, quanTri, thanhVien] } },
			orderBy: [{ userId: "asc" }, { thang: "asc" }, { muc: "asc" }],
			select: { thang: true, muc: true, userId: true },
		});
		const cua = (userId: string) =>
			dong.filter((d) => d.userId === userId).map((d) => `${d.thang}:${d.muc}`);
		expect({
			chu: cua(chu),
			quanTri: cua(quanTri),
			thanhVien: cua(thanhVien),
		}).toEqual({
			chu: ["2031-09:0", "2031-10:80", "2031-10:100", "2031-11:80"],
			quanTri: ["2031-09:0", "2031-10:80", "2031-10:100", "2031-11:80"],
			thanhVien: [],
		});
	}, 60_000);
});
