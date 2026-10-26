import { db } from "@crm/db";
import {
	docBanChupLoTrinh,
	ghiBanChupLoTrinh,
} from "@crm/db/ban-chup-lo-trinh";
import {
	cungNguon,
	ghiKetQuaLay,
	sanPhamDenHan,
	timSanPham,
} from "@crm/db/san-pham-lo-trinh";
import { LO_TRINH_SAN_PHAM } from "@crm/db/san-pham-lo-trinh-danh-muc";
import {
	cauHinhGithubApp,
	type KetQuaGithub,
	layLoTrinhTuGithub,
} from "./lo-trinh-github";

export type KetQuaNhipSanPham = { lay: number; hong: number; boQua: number };

const NHAN = "[lo-trinh-san-pham]";

export async function layLoTrinhSanPham(
	now = new Date(),
	phuThuoc: {
		f?: typeof fetch;
		dongHo?: () => number;
		tienTo?: string;
	} = {},
): Promise<KetQuaNhipSanPham> {
	const f = phuThuoc.f ?? fetch;
	const dongHo = phuThuoc.dongHo ?? (() => performance.now());
	const batDau = dongHo();
	const ketQua: KetQuaNhipSanPham = { lay: 0, hong: 0, boQua: 0 };
	const ds = await sanPhamDenHan(db, now, { tienTo: phuThuoc.tienTo });
	if (ds.length === 0) return ketQua;
	const cau = cauHinhGithubApp();

	for (const sp of ds) {
		if (cau === null) {
			await ghiKetQuaLay(db, sp.ma, {
				trangThai: "chua-cau-hinh",
				kiemLuc: now,
			});
			ketQua.hong += 1;
			continue;
		}
		if (
			dongHo() - batDau + LO_TRINH_SAN_PHAM.tranGoiMs * 4 >
			LO_TRINH_SAN_PHAM.hanNhipMs
		) {
			ketQua.boQua += 1;
			continue;
		}
		let kq: KetQuaGithub;
		try {
			const dangLuu =
				sp.nguonDoiLuc === null ? await docBanChupLoTrinh(db, sp.ma) : null;
			kq = await layLoTrinhTuGithub(
				cau,
				sp,
				dangLuu?.sha ?? null,
				now.getTime(),
				f,
			);
		} catch (loi) {
			kq = {
				trangThai: "loi-github",
				chiTiet: loi instanceof Error ? loi.name : "loi",
				caiLuc: null,
				banChup: null,
				phienBan: null,
				khongDoi: false,
			};
		}
		const hienGio = await timSanPham(db, sp.ma);
		if (hienGio === null || !cungNguon(hienGio, sp)) {
			ketQua.boQua += 1;
			console.log(`${NHAN} ${sp.ma} nguon-doi-giua-luot`);
			continue;
		}
		if (kq.banChup)
			await ghiBanChupLoTrinh(db, kq.banChup, now, {
				thayHan: sp.nguonDoiLuc !== null,
			});
		const daGhi = await ghiKetQuaLay(
			db,
			sp.ma,
			{
				trangThai: kq.trangThai,
				chiTiet: kq.chiTiet,
				kiemLuc: now,
				caiLuc: kq.caiLuc,
				phienBanKhuon: kq.phienBan,
			},
			sp,
		);
		if (!daGhi) {
			ketQua.boQua += 1;
			console.log(`${NHAN} ${sp.ma} nguon-doi-giua-luot`);
			continue;
		}
		if (kq.trangThai === "da-lay") ketQua.lay += 1;
		else ketQua.hong += 1;
		console.log(
			`${NHAN} ${sp.ma} ${kq.trangThai}${kq.khongDoi ? " khong-doi" : ""}`,
		);
	}
	return ketQua;
}
