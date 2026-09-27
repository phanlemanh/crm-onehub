import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	demTaiLieu,
	deXuat,
	donTaiLieu,
	dungSan,
	duyetQuaDb,
	goi,
	hoi,
	ok,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;

type Get = {
	noiDung: string | null;
	coBanCho: boolean;
	phienBan: { so: number } | null;
};

const SLUG_TAO = [
	"quy-dinh-hoa-hong",
	"quy-dinh-hoa-hong-2",
	"quy-dinh-hoa-hong-3",
	"doi-tac-da-nang",
];

describe("tao-trang", () => {
	test("tao-trang: ma tran slug, tu choi ten sai khong ghi gi, noi dung luu NFC", async () => {
		await donTaiLieu({ slug: { in: SLUG_TAO } });
		const MA_TRAN = [
			["tao", "Quy định hoa hồng", "quy-dinh-hoa-hong"],
			["okr", "Đối tác Đà Nẵng", "doi-tac-da-nang"],
			["tao", "Quy định hoa hồng", "quy-dinh-hoa-hong-2"],
			["okr", "Quy định hoa hồng", "quy-dinh-hoa-hong-3"],
		] as const;
		for (const [ai, ten, mong] of MA_TRAN) {
			const tra = await goi(
				"taiLieu.create",
				{ ten, loai: "quy-dinh", noiDung: "Nội dung." },
				ai,
			);
			expect(`${ai} ${ten} -> ${ok<{ slug: string }>(tra, ten).slug}`).toBe(
				`${ai} ${ten} -> ${mong}`,
			);
		}
		const TU_CHOI = [
			["  ✨ !!! ", T.tenKhongChu],
			["   ", T.tenTrong],
			["a".repeat(161), T.tenDai(160)],
		] as const;
		for (const [ten, loi] of TU_CHOI) {
			const truoc = await demTaiLieu();
			const tra = await goi(
				"taiLieu.create",
				{ ten, loai: "quy-dinh", noiDung: "x" },
				"tao",
			);
			expect(`${ten.length}: ${tra.status} ${tra.loi}`).toBe(
				`${ten.length}: 400 ${loi}`,
			);
			expect(await demTaiLieu()).toEqual(truoc);
		}
		const dai = ok<{ slug: string }>(
			await goi(
				"taiLieu.create",
				{ ten: `Đ${"a".repeat(159)}`, loai: "bieu-mau", noiDung: "x" },
				"tao",
			),
			"ten 160",
		);
		expect(dai.slug).toBe(`d${"a".repeat(159)}`);
	});

	test("tao-trang: noi dung NFD luu thanh NFC, trang moi chua co ban dang dung va dung mot de xuat cho", async () => {
		const nfc = "## Hoà giải\n\nĐối tác được hoàn phí trong 48 giờ.";
		const nfd = nfc.normalize("NFD");
		expect(Buffer.from(nfd).equals(Buffer.from(nfc))).toBe(false);
		const { trangId } = await taoTrang("Hoà giải NFD", nfd);
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: {
				banDangDungId: true,
				deXuat: { select: { trangThai: true, banGocId: true, noiDung: true } },
				suKien: { select: { loai: true } },
			},
		});
		expect(trang.banDangDungId).toBe(null);
		expect(trang.deXuat).toHaveLength(1);
		const [dx] = trang.deXuat;
		expect(dx?.trangThai).toBe("CHO_DUYET");
		expect(dx?.banGocId).toBe(null);
		expect(
			Buffer.from(dx?.noiDung ?? "").equals(Buffer.from(nfc)),
			"noi dung khong NFC",
		).toBe(true);
		expect(trang.suKien.map((s) => s.loai)).toEqual(["TAO"]);
	});

	test("tao-trang: chu trang phai la thanh vien, don vi phai ton tai", async () => {
		const truoc = await demTaiLieu();
		const chu = await goi(
			"taiLieu.create",
			{ ten: "Chủ lạ", loai: "quy-dinh", chuTrangId: "khong-co", noiDung: "x" },
			"tao",
		);
		expect(`${chu.status} ${chu.loi}`).toBe(`400 ${T.chuTrangKhongCo}`);
		const donVi = await goi(
			"taiLieu.create",
			{
				ten: "Đơn vị lạ",
				loai: "quy-dinh",
				departmentId: "khong-co",
				noiDung: "x",
			},
			"tao",
		);
		expect(`${donVi.status} ${donVi.loi}`).toBe(`400 ${T.donViKhongCo}`);
		expect(await demTaiLieu()).toEqual(truoc);
	});
});

describe("sua-trang", () => {
	test("sua-trang: de xuat sua co ban goc la ban dang dung; ban dang dung khong doi; chi nguoi thay de xuat thay co ban cho", async () => {
		const { slug, trangId, deXuatId } = await taoTrang(
			"Sửa trang thử",
			"Bản một.\n",
		);
		await duyetQuaDb(deXuatId, "chu");
		const banMot = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: { banDangDungId: true },
		});
		const moi = await deXuat(slug, "Bản hai.\n", "khac");
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: moi } });
		expect(dx.banGocId).toBe(banMot.banDangDungId);
		expect(dx.trangThai).toBe("CHO_DUYET");
		const sau = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: { banDangDungId: true },
		});
		expect(sau.banDangDungId).toBe(banMot.banDangDungId);
		const MONG = [
			["okr", false],
			["tao", false],
			["khac", true],
			["chu", true],
			["admin", true],
		] as const;
		for (const [ai, coBanCho] of MONG) {
			const g = ok<Get>(await hoi("taiLieu.get", { slug }, ai), `get ${ai}`);
			expect(`${ai}: ${g.noiDung} ${g.phienBan?.so}`).toBe(`${ai}: Bản một. 1`);
			expect(`${ai} coBanCho=${g.coBanCho}`, "lo co ban cho").toBe(
				`${ai} coBanCho=${coBanCho}`,
			);
		}
	});

	test("sua-trang: trang khong ton tai va trang chua duyet cua nguoi khac tra cung mot NOT_FOUND", async () => {
		const khongCo = await goi(
			"taiLieu.propose",
			{ slug: "khong-co-trang-nay", noiDung: "x" },
			"khac",
		);
		const { slug } = await taoTrang("Trang chưa duyệt để đề xuất", "a\n");
		const chuaDuyet = await goi(
			"taiLieu.propose",
			{ slug, noiDung: "b" },
			"khac",
		);
		expect(khongCo.status).toBe(404);
		expect({ status: chuaDuyet.status, loi: chuaDuyet.loi }).toEqual({
			status: khongCo.status,
			loi: khongCo.loi,
		});
		expect(khongCo.loi).toBe(T.khongCo);
	});
});

describe("de-xuat-trung", () => {
	test("de-xuat-trung: noi dung trung ban goc sau chuan hoa bi tu choi, khac mot ky tu thi tao duoc", async () => {
		const goc = "## Mục\n\n- một\n- hai\n\nĐối tác hoà giải.\n";
		const { slug, trangId, deXuatId } = await taoTrang("Trùng bản gốc", goc);
		await duyetQuaDb(deXuatId, "chu");
		const demDeXuat = () => db.taiLieuDeXuat.count({ where: { trangId } });
		const truoc = await demDeXuat();
		const trung = goc.normalize("NFD").replace(/^- /gm, "* ");
		expect(trung).not.toBe(goc);
		const tra = await goi("taiLieu.propose", { slug, noiDung: trung }, "khac");
		expect(`${tra.status} ${tra.loi}`, "de xuat trung ban goc duoc tao").toBe(
			`400 ${T.chuaDoi}`,
		);
		expect(await demDeXuat()).toBe(truoc);
		const khac = await goi(
			"taiLieu.propose",
			{ slug, noiDung: goc.replace("hai", "haj") },
			"khac",
		);
		ok(khac, "khac mot ky tu");
		expect(await demDeXuat()).toBe(truoc + 1);
		const doiTen = await goi(
			"taiLieu.propose",
			{ slug, ten: "Trùng bản gốc, tên mới", noiDung: goc },
			"khac",
		);
		ok(doiTen, "chi doi ten");
	});
});
