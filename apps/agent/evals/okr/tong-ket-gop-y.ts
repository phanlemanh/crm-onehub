import type { CaGopY } from "@crm/validation/okr-ca-gop-y";

export const TIEU_CHI_JUDGE = [
	"Câu đề xuất nói kết quả muốn đạt, không nói việc sẽ làm. Chỉ xét trường đang viết lại: nếu là tên Mục tiêu thì viết bằng chữ, không mang con số, không chỉ là tên một chỉ số kèm hướng tăng hay giảm, không mở đầu bằng động từ việc làm; nếu là tên KR thì gọi tên thứ được đo và không kết bằng cụm mơ hồ như «đạt kết quả tốt».",
	"Câu đề xuất giữ ý của người viết câu gốc: không đổi sang mục tiêu khác, không gắn thêm lời tự khen hay khẩu hiệu không đo được («hàng đầu», «được tin cậy», «khẳng định vị thế»); diễn giải cùng ý đó bằng chữ thường không tính là thêm ý.",
	"Câu đề xuất trả lời theo ngôn ngữ chiếm đa số trong nội dung câu gốc.",
] as const;

export const COT_DONG_TONG_KET = {
	id: true,
	loai: true,
	keyResultId: true,
	truong: true,
	truoc: true,
	sau: true,
	maVanDe: true,
	lyDo: true,
	trangThai: true,
	maLoai: true,
} as const;

export type BanGhiTongKet<D> = {
	ca: Pick<CaGopY, "id" | "bo">;
	objectiveId: string;
	krs: readonly { id: string; title: string }[];
	capTrenKr: readonly string[];
	taskId: string;
	outcome: string | null;
	dong: readonly D[];
};

export function dongTongKet<D>(ban: BanGhiTongKet<D>): string {
	return `${JSON.stringify({
		ca: ban.ca.id,
		bo: ban.ca.bo,
		objectiveId: ban.objectiveId,
		krs: ban.krs,
		capTrenKr: ban.capTrenKr,
		taskId: ban.taskId,
		outcome: ban.outcome,
		dong: ban.dong,
	})}\n`;
}
