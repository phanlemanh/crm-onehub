export type DongSoKhoa = { loai: "don" } | { loai: "chan"; lyDo: string };

const DON: DongSoKhoa = { loai: "don" };
const chan = (lyDo: string): DongSoKhoa => ({ loai: "chan", lyDo });
const NGOAI =
	"dữ liệu nghiệp vụ ngoài bộ mẫu — người mẫu không tạo trong phép đo nào";

export const SO_KHOA_NGUOI: Readonly<Record<string, DongSoKhoa>> = {
	"AgentConversationSubmission.submittedBy": chan(NGOAI),
	"AgentDefinition.createdBy": chan(NGOAI),
	"AgentVersion.createdBy": chan(NGOAI),
	"AgentTrigger.createdBy": chan(NGOAI),
	"Deal.owner": chan(NGOAI),
	"Campaign.createdBy": chan(NGOAI),
	"CampaignTouch.createdBy": chan(NGOAI),
	"Activity.createdBy": chan(NGOAI),
	"OnboardingPlan.owner": chan(NGOAI),
	"OkrObjective.person": DON,
	"OkrObjective.owner": DON,
	"OkrKeyResult.owner": DON,
	"TaiLieuTrang.chuTrang": DON,
	"TaiLieuTrang.taoBoi": DON,
	"TaiLieuPhienBan.duyetBoi": DON,
	"TaiLieuDeXuat.taoBoi": DON,
	"TaiLieuNguon.taiBoi": DON,
	"TaiLieuSuKien.ai": DON,
	"TaiLieuHoi.nguoiHoi": chan(NGOAI),
	"TaiLieuHoi.xuLyBoi": chan(NGOAI),
	"TaiLieuBaoSai.nguoiBao": chan(NGOAI),
	"TaiLieuBaoSai.xuLyBoi": chan(NGOAI),
	"OkrViecKr.nguoiLam": DON,
	"OkrViecKr.taoBoi": DON,
	"OkrBangChung.tacGia": DON,
	"OkrGhiNhan.tacGia": DON,
	"OkrGhiNhanNhan.user": DON,
	"OkrMau.taoBoi": DON,
	"OkrNguoiXem.user": DON,
	"OkrNguoiXem.createdBy": DON,
	"OkrHoiY.nguoiChon": DON,
	"OkrHoiY.taoBoi": DON,
	"OkrHoiYBanTruoc.vietBoi": DON,
	"OkrY.tacGia": DON,
	"OkrYDongY.user": DON,
	"OkrHoiYHieu.user": DON,
	"Viec.nguoiGiao": DON,
	"Viec.nguoiThucHien": DON,
	"Viec.taoBoi": DON,
	"SanPhamLoTrinh.taoBoi": chan(NGOAI),
	"DuAn.taoBoi": chan(NGOAI),
	"DuAnMoc.taoBoi": chan(NGOAI),
	"ViecPhuThuoc.taoBoi": chan(
		"phụ thuộc giữa việc của người mẫu đi theo việc (Cascade); phụ thuộc do người mẫu nối giữa việc người ngoài là dữ liệu ngoài bộ mẫu",
	),
	"NgayNghi.taoBoi": chan(NGOAI),
	"GoiYKeHoach.nguoiNhan": chan(NGOAI),
};

const XOA_KHONG_CHAN = new Set(["Cascade", "SetNull", "SetDefault"]);

export function khoaChanTuLuocDo(luocDo: string): string[] {
	const ra: string[] = [];
	for (const [, model, than] of luocDo.matchAll(
		/^model (\w+) \{([\s\S]*?)^\}/gm,
	))
		for (const [, truong, tuyChon, thamSo] of than.matchAll(
			/^\s+(\w+)\s+User(\?)?\s+@relation\(([^)]*)\)/gm,
		)) {
			const xoa =
				thamSo.match(/onDelete:\s*(\w+)/)?.[1] ??
				(tuyChon ? "SetNull" : "Restrict");
			if (!XOA_KHONG_CHAN.has(xoa)) ra.push(`${model}.${truong}`);
		}
	return ra.sort();
}

export function soKhoaLech(
	luocDo: string,
	so: Readonly<Record<string, DongSoKhoa>> = SO_KHOA_NGUOI,
): { thieu: string[]; thua: string[] } {
	const that = new Set(khoaChanTuLuocDo(luocDo));
	const khai = new Set(Object.keys(so));
	return {
		thieu: [...that].filter((k) => !khai.has(k)).sort(),
		thua: [...khai].filter((k) => !that.has(k)).sort(),
	};
}
