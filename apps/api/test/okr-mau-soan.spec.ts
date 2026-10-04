import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../scripts/okr-mau/nap";
import {
	chayLenh,
	congTy,
	demThamChieu,
	lamSachOkr,
	napMau,
	nguoiMau,
	tapIdMau,
} from "./okr-mau-san";
import { dungKho } from "./phien-thu";

const MOC = new Date("2026-11-12T15:00:00+07:00");
const CHO = 180_000;
const bo = congTy();
const TIEN = { startsWith: OKR_MAU.tienTo };

async function demTaiLieuMau() {
	const trang = await db.taiLieuTrang.findMany({
		where: { chuTrangId: TIEN },
		select: {
			id: true,
			loai: true,
			ten: true,
			banDangDungId: true,
			banDangDung: { select: { deXuat: { select: { trangThai: true } } } },
		},
	});
	const trangId = { in: trang.map((t) => t.id) };
	const suKien = await db.taiLieuSuKien.count({
		where: { trangId, loai: "DUYET" },
	});
	const phienBan = await db.taiLieuPhienBan.count({ where: { trangId } });
	return { trang, suKien, phienBan };
}

async function demBang() {
	const [division, department, placement, checkIn, tl] = await Promise.all([
		db.division.count({ where: { id: TIEN } }),
		db.department.count({ where: { id: TIEN } }),
		db.orgPlacement.count({ where: { userId: TIEN } }),
		db.okrCheckIn.count({ where: { id: TIEN } }),
		demTaiLieuMau(),
	]);
	return {
		division,
		department,
		placement,
		checkIn,
		trang: tl.trang.length,
		suKien: tl.suKien,
		phienBan: tl.phienBan,
	};
}

beforeAll(async () => {
	setSystemTime(MOC);
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await dungKho();
	await napMau(MOC);
}, CHO);

afterAll(async () => {
	await xoaBoOkrMau(db);
	await lamSachOkr();
	setSystemTime();
}, CHO);

describe("bo-mau-soan", () => {
	test("quý 3: ≥ 6 KR có chuỗi tự tin cao → vừa → thấp theo thứ tự tuần và ghi chú khác rỗng ở ≥ 2 lần", async () => {
		const krTroi = bo.mucTieu
			.filter((m) => m.chuKy === "quy3" && m.trangThai === "cong-bo")
			.flatMap((m) =>
				m.krs
					.filter((k) => k.kichBanQuy3 === "troi")
					.map((k) => idMau("kr", k.ma)),
			);
		expect(
			krTroi.length,
			"it hon 6 KR troi trong cong-ty.json",
		).toBeGreaterThanOrEqual(6);
		for (const id of krTroi) {
			const lan = await db.okrCheckIn.findMany({
				where: { keyResultId: id },
				orderBy: { weekStart: "asc" },
				select: { confidence: true, note: true },
			});
			const chuoi = lan.map((l) => l.confidence);
			const dau = chuoi.indexOf("cao");
			const giua = chuoi.indexOf("vua");
			const cuoi = chuoi.lastIndexOf("thap");
			expect(
				[dau >= 0, giua > dau, cuoi > giua, chuoi.at(-1)],
				`${id}: ${chuoi.join(">")}`,
			).toEqual([true, true, true, "thap"]);
			expect(
				lan.filter((l) => l.note.trim() !== "").length,
				`${id} thieu ghi chu`,
			).toBeGreaterThanOrEqual(2);
		}
	});

	test("hai trang chien-luoc ở trạng thái đang dùng, đi qua đường tạo + duyệt thật", async () => {
		const { trang, suKien, phienBan } = await demTaiLieuMau();
		const chienLuoc = trang.filter((t) => t.loai === "chien-luoc");
		expect(chienLuoc.map((t) => t.ten).sort()).toEqual(
			bo.taiLieu
				.filter((t) => t.loai === "chien-luoc")
				.map((t) => t.ten)
				.sort(),
		);
		expect(chienLuoc.length).toBe(2);
		for (const t of chienLuoc) {
			expect(t.banDangDungId, `${t.ten} chua co ban dang dung`).not.toBeNull();
			expect(t.banDangDung?.deXuat.trangThai, "trang mau khong qua duyet").toBe(
				"DA_DUYET",
			);
		}
		expect(suKien, "trang mau khong qua duyet").toBe(bo.taiLieu.length);
		expect(phienBan).toBe(bo.taiLieu.length);
	});

	test("mọi bộ phận và phòng ban có mô tả; 40 người có chức danh và quản lý trực tiếp", async () => {
		const bp = await db.division.findMany({
			where: { id: TIEN },
			select: { moTa: true },
		});
		const pb = await db.department.findMany({
			where: { id: TIEN, archivedAt: null },
			select: { moTa: true },
		});
		expect([bp.length, pb.length]).toEqual([3, 10]);
		expect(
			bp.every((b) => b.moTa.trim().length > 0) &&
				pb.every((p) => p.moTa.trim().length > 0),
			"don vi thieu mo ta",
		).toBe(true);
		const vt = await db.orgPlacement.findMany({
			where: { userId: TIEN },
			select: { userId: true, chucDanh: true, managerUserId: true },
		});
		expect(vt.length).toBe(40);
		expect(
			vt.filter((v) => v.chucDanh.trim() !== "").length,
			"nguoi thieu chuc danh",
		).toBe(40);
		expect(
			vt.filter((v) => v.managerUserId !== null && v.managerUserId !== v.userId)
				.length,
			"nguoi thieu quan ly",
		).toBe(40);
		const ceo = vt.find((v) => v.userId === nguoiMau("le-hai-dang"));
		expect(ceo?.chucDanh).toBe("Tổng giám đốc");
	});

	test(
		"--xoa rồi nạp lại: số bản ghi mỗi bảng bằng lần đầu, không hàng mau-okr- mồ côi",
		async () => {
			const lan1 = await demBang();
			expect(lan1.trang).toBe(bo.taiLieu.length);
			const xoa = chayLenh([OKR_MAU.co.xoa]);
			expect(xoa.ma, xoa.loi).toBe(0);
			expect(await demBang()).toEqual({
				division: 0,
				department: 0,
				placement: 0,
				checkIn: 0,
				trang: 0,
				suKien: 0,
				phienBan: 0,
			});
			expect(await tapIdMau()).toEqual([]);
			const nap = chayLenh([OKR_MAU.co.moc, "2026-11-12"]);
			expect(nap.ma, nap.loi).toBe(0);
			expect(nap.ra).toContain(`${bo.taiLieu.length} trang tài liệu`);
			expect(await demBang()).toEqual(lan1);
			const ids = await tapIdMau();
			const truoc = await demThamChieu(ids);
			const xoa2 = chayLenh([OKR_MAU.co.xoa]);
			expect(xoa2.ma, xoa2.loi).toBe(0);
			expect(
				await demThamChieu(ids),
				`mo coi sau xoa: ${JSON.stringify(truoc)}`,
			).toEqual({});
			await napMau(MOC);
		},
		CHO,
	);

	test("DATABASE_URL production giả → từ chối trước khi ghi", async () => {
		const truoc = await demBang();
		const r = chayLenh([], {
			DATABASE_URL: "postgresql://u:p@ep-x.us-east-1.aws.neon.tech:5432/crm",
			NODE_ENV: "development",
		});
		expect(r.ma).toBe(OKR_MAU.ma.chan);
		const r2 = chayLenh([], { NODE_ENV: "production" });
		expect(r2.ma).toBe(OKR_MAU.ma.chan);
		expect(await demBang()).toEqual(truoc);
	});
});
