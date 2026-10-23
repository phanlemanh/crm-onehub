import type { LoaiSuKien, NoiDungThongBao } from "./thong-bao";
import type { KhoaChoTinHieu } from "./tin-hieu-cho";

export const CAU_SU_KIEN_VI = {
	cau: {
		"tac-nhan-xong": "Kara đã dựng xong «{ten}» — mở để duyệt",
		"tac-nhan-can-tra-loi": "Kara cần bạn trả lời để dựng tiếp «{ten}»",
		"tac-nhan-hong": "Kara chưa dựng được «{ten}»",
		"tin-hieu-doi-cho": "Tín hiệu «{tieuDe}» của bạn: {nhan}",
	},
	tacNhanKhongTen: "Chưa đặt tên",
	nhanCho: {
		"cho-gom": "Đang xem xét",
		le: "Không thành việc",
		"da-phu": "Đã có việc",
		"nhom-chua-cat": "Đã vào nhóm",
		"chan-troi": "Để sau",
		"chua-bat-dau": "Chưa bắt đầu",
		"dang-lam": "Đang làm",
		"da-giao": "Đã giao",
		"hang-khac": "Khác",
	},
} as const satisfies {
	cau: Record<LoaiSuKien, string>;
	tacNhanKhongTen: string;
	nhanCho: Record<KhoaChoTinHieu, string>;
};

export type NoiDungSuKien = Extract<NoiDungThongBao, { loai: LoaiSuKien }>;

function dien(mau: string, gia: Record<string, string>): string {
	return mau.replace(/\{(\w+)\}/g, (nguyen, khoa: string) => gia[khoa] ?? nguyen);
}

export function cauSuKienVi(nd: NoiDungSuKien): string {
	const m = CAU_SU_KIEN_VI;
	if (nd.loai === "tin-hieu-doi-cho") {
		return dien(m.cau[nd.loai], {
			tieuDe: nd.tieuDe,
			nhan: m.nhanCho[nd.khoa],
		});
	}
	return dien(m.cau[nd.loai], {
		ten: nd.ten.trim().length > 0 ? nd.ten : m.tacNhanKhongTen,
	});
}
