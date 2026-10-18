import type { Db } from "./client";
import { docLichLam } from "./du-an";
import { taoDuAn, taoMoc, taoPhuThuoc, themNgayLe } from "./du-an-ghi";
import { laKhoCucBo, loiKhoXa } from "./kho-cuc-bo";
import { congNgayLam, laNgayLam, ngayLamKe } from "./lich-lam-viec";
import { ngayVN } from "./onboarding-nhac";
import { docDuocDoiTac } from "./vai-doi-tac";
import { doiLich, taoViec } from "./viec-ghi";
import { WORKSPACE_ID } from "./workspace";

export const TEN_DU_AN_MAU = "Triển khai Ngân hàng mẫu";

export const LE_MAU = { ten: "Nghỉ bù mẫu", sauNgayLam: 6 } as const;

type ViecMau = {
	tieuDe: string;
	ai: "giao" | "lam";
	soNgay: number | null;
	cho: number[];
	keoThem?: number;
};

const VIEC_MAU: readonly ViecMau[] = [
	{ tieuDe: "Ký phụ lục hợp tác mẫu", ai: "giao", soNgay: 2, cho: [] },
	{ tieuDe: "Cấu hình sản phẩm mẫu", ai: "lam", soNgay: 3, cho: [0] },
	{ tieuDe: "Đào tạo RM mẫu đợt 1", ai: "lam", soNgay: 2, cho: [1] },
	{
		tieuDe: "Soạn tài liệu bán hàng mẫu",
		ai: "giao",
		soNgay: 4,
		cho: [],
		keoThem: 1,
	},
	{ tieuDe: "Chạy thử với khách mẫu", ai: "lam", soNgay: 2, cho: [2, 3] },
	{ tieuDe: "Tổng kết tuần đầu mẫu", ai: "giao", soNgay: null, cho: [] },
];

const MOC_MAU = { ten: "Go-live mẫu", cho: 4 } as const;

function ngayDb(ngay: string): Date {
	return new Date(`${ngay}T00:00:00.000Z`);
}

export async function gieoDuAnMau(
	db: Db,
	chon: { databaseUrl: string; nguon: string; now: Date },
): Promise<{ duAnId: string | null; taoBoiId: string | null }> {
	if (!laKhoCucBo(chon.databaseUrl) && process.env.ALLOW_REMOTE_DB !== "1") {
		throw new Error(loiKhoXa("db:seed", chon.databaseUrl, chon.nguon));
	}
	if ((await db.duAn.count({ where: { ten: TEN_DU_AN_MAU } })) > 0) {
		return { duAnId: null, taoBoiId: null };
	}
	const thanhVien = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		orderBy: { createdAt: "asc" },
		select: { userId: true, role: true },
	});
	const [giao, lam] = thanhVien
		.filter((m) => docDuocDoiTac(m.role))
		.map((m) => m.userId);
	if (!giao || !lam) return { duAnId: null, taoBoiId: null };
	const now = chon.now;
	const dau = { nguoiId: giao, now };
	return db.$transaction(async (tx) => {
		const homNay = ngayVN(now);
		const lichDau = await docLichLam(tx);
		const ngayLe = congNgayLam(
			ngayLamKe(homNay, lichDau),
			LE_MAU.sauNgayLam,
			lichDau,
		);
		if (laNgayLam(ngayLe, lichDau)) {
			await themNgayLe(tx, {
				nguoiId: giao,
				ngay: ngayDb(ngayLe),
				ten: LE_MAU.ten,
			});
		}
		const lich = await docLichLam(tx);
		const duAn = await taoDuAn(tx, {
			...dau,
			ten: TEN_DU_AN_MAU,
			moTa: "Dự án mẫu: sáu việc, bốn phụ thuộc và một mốc.",
		});
		const batDauSom = ngayLamKe(homNay, lich);
		const ngay: { batDau: string; han: string }[] = [];
		const ids: string[] = [];
		for (const mau of VIEC_MAU) {
			const ke = mau.cho
				.map((i) => ngay[i]?.han)
				.filter((h): h is string => h !== undefined)
				.map((h) => ngayLamKe(h, lich))
				.sort()
				.at(-1);
			const batDau = ke ?? batDauSom;
			const han =
				mau.soNgay === null ? null : congNgayLam(batDau, mau.soNgay - 1, lich);
			const v = await taoViec(tx, {
				nguoiId: giao,
				tieuDe: mau.tieuDe,
				nguoiThucHienId: mau.ai === "giao" ? giao : lam,
				gan: [],
				duAnId: duAn.id,
				hanNgay: han ? ngayDb(han) : null,
				batDauNgay: han ? ngayDb(batDau) : null,
				nguon: "api",
				now,
			});
			ids.push(v.id);
			ngay.push({ batDau, han: han ?? batDau });
		}
		for (const [i, mau] of VIEC_MAU.entries()) {
			for (const truoc of mau.cho) {
				const truocId = ids[truoc];
				const sauId = ids[i];
				if (truocId && sauId) {
					await taoPhuThuoc(tx, { ...dau, truocId, sauId });
				}
			}
		}
		for (const [i, mau] of VIEC_MAU.entries()) {
			const id = ids[i];
			const cu = ngay[i];
			if (!mau.keoThem || !id || !cu) continue;
			await doiLich(tx, {
				viecId: id,
				nguoiId: giao,
				batDauNgay: ngayDb(cu.batDau),
				hanNgay: ngayDb(congNgayLam(cu.han, mau.keoThem, lich)),
				nguon: "api",
				now,
			});
		}
		const choId = ids[MOC_MAU.cho];
		const cho = await tx.viec.findUnique({
			where: { id: choId ?? "" },
			select: { hanNgay: true },
		});
		const hanCho = cho?.hanNgay?.toISOString().slice(0, 10) ?? batDauSom;
		await taoMoc(tx, {
			...dau,
			duAnId: duAn.id,
			ten: MOC_MAU.ten,
			ngay: ngayDb(ngayLamKe(hanCho, lich)),
			cho: choId ? [choId] : [],
		});
		return { duAnId: duAn.id, taoBoiId: giao };
	});
}
