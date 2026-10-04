import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import { parseSuKienChiTiet } from "@crm/validation/tai-lieu";
import { dungSan, ma, phien, taoTrang } from "./tai-lieu-san";

dungSan();

const DICH_VU = join(
	import.meta.dir,
	"..",
	"src",
	"tai-lieu",
	"tai-lieu.service.ts",
);

function duongGhiRieng(ma: string): string[] {
	const thay: string[] = [];
	if (/taiLieuDeXuat\s*\.\s*create\s*\(/.test(ma)) {
		thay.push("taiLieuDeXuat.create");
	}
	const goi = ma.match(/taoDeXuatTaiLieu\s*\(/g)?.length ?? 0;
	if (goi < 2) thay.push(`taoDeXuatTaiLieu goi ${goi} lan`);
	return thay;
}

async function nguonGia(trangId: string): Promise<string> {
	const n = await db.taiLieuNguon.create({
		data: {
			sha256: ma("sha"),
			tenTep: "quyet-dinh.docx",
			kieu: "docx",
			kichThuoc: 10,
			blobPathname: ma("blob"),
			taiBoiId: phien.tao.nguoi,
			trangId,
		},
		select: { id: true },
	});
	return n.id;
}

describe("de-xuat-chung", () => {
	test("de-xuat-chung: noi dung khong NFC bi tu choi, khong ghi gi", async () => {
		const { trangId } = await taoTrang(ma("NFC"), "## Mot\n\nBan dau.");
		const truoc = await db.taiLieuDeXuat.count({ where: { trangId } });
		const nfd = "Quy định".normalize("NFD");
		let loi = "";
		try {
			await db.$transaction((tx) =>
				taoDeXuatTaiLieu(tx, {
					trangId,
					banGocId: null,
					ten: "Tên",
					noiDung: nfd,
					taoBoiId: phien.tao.nguoi,
					suKien: "DE_XUAT",
				}),
			);
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		expect(loi).toContain("noi dung khong NFC");
		expect(await db.taiLieuDeXuat.count({ where: { trangId } })).toBe(truoc);
	});

	test("de-xuat-chung: ghi nguonId, trichDoan va su kien DE_XUAT trong mot lan", async () => {
		const { trangId } = await taoTrang(ma("Nguon"), "## Mot\n\nBan dau.");
		const nguonId = await nguonGia(trangId);
		const trich = [{ menhDe: "Tầng 2 hưởng 1,5%", trich: "tầng 2 là 1,5%" }];
		const { deXuatId } = await db.$transaction((tx) =>
			taoDeXuatTaiLieu(tx, {
				trangId,
				banGocId: null,
				ten: "Chính sách hoa hồng",
				noiDung: "## Hoa hồng\n\nTầng 2 hưởng 1,5%.",
				taoBoiId: phien.tao.nguoi,
				nguonId,
				trichDoan: trich,
				suKien: "DE_XUAT",
			}),
		);
		const hang = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
			select: { nguonId: true, trichDoan: true, trangThai: true },
		});
		expect(hang.nguonId).toBe(nguonId);
		expect(hang.trichDoan).toEqual(trich);
		expect(hang.trangThai).toBe("CHO_DUYET");
		const suKien = await db.taiLieuSuKien.findMany({ where: { trangId } });
		const cuaNo = suKien
			.map((s) => parseSuKienChiTiet(s.chiTiet))
			.filter((c) => "deXuatId" in c && c.deXuatId === deXuatId);
		expect(cuaNo.map((c) => c.loai)).toEqual(["DE_XUAT"]);
	});

	test("de-xuat-chung: de xuat nguoi viet khong mang nguon", async () => {
		const { deXuatId } = await taoTrang(ma("Nguoi"), "## Mot\n\nBan dau.");
		const hang = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
			select: { nguonId: true, trichDoan: true },
		});
		expect(hang).toEqual({ nguonId: null, trichDoan: null });
	});

	test("de-xuat-chung: dich vu luot 1 chi ghi de xuat qua ham chung", () => {
		const that = readFileSync(DICH_VU, "utf8");
		const pha = `${that}\nconst x = tx.taiLieuDeXuat.create({ data });\n`;
		expect(duongGhiRieng(pha)).toContain("taiLieuDeXuat.create");
		expect(duongGhiRieng(that)).toEqual([]);
	});
});
