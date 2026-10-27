import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	tieuDe: "Cập nhật gần đây",
	moTa: "Mọi lần cập nhật KR trong chu kỳ, mới nhất trước — đọc trước buổi họp tuần và trả lời ngay dưới lần cập nhật.",
	locPhamVi: "Lọc theo phạm vi",
	thayCho: (ten: string) => `cập nhật thay ${ten}`,
	coMoiHonNhan: "Có lần cập nhật mới hơn.",
	chuaTha: (loi: string) => `Chưa thả được cảm xúc: ${loi}`,
	traLoi: "Trả lời",
	oTraLoi: (ten: string) => `Trả lời lần cập nhật của ${ten}`,
	goiY: "Trả lời…",
	gui: "Gửi",
	huy: "Huỷ",
	chuaGui: (loi: string) => `Chưa gửi được: ${loi}`,
	mayChu: "máy chủ không trả lời, thử lại sau.",
	loi: {
		tieuDe: "Chưa tải được các lần cập nhật",
		moTa: "Máy chủ không trả lời. Dữ liệu của bạn không mất.",
	},
	rong: {
		tieuDe: "Chu kỳ này chưa có lần cập nhật nào",
		moTa: "Khi người phụ trách cập nhật một KR, lần cập nhật hiện ở đây, mới nhất trước.",
	},
	rongLoc: {
		tieuDe: (chip: string) => `Chưa có lần cập nhật nào ở «${chip}»`,
		moTa: "Theo dõi một mục tiêu hay dẫn một đơn vị để thấy các lần cập nhật của bộ OKR đó ở đây.",
		nut: "Xem tất cả",
	},
};

type OkrCapNhatGanDayMessages = typeof vi;

const en: OkrCapNhatGanDayMessages = {
	tieuDe: "Recent updates",
	moTa: "Every KR update in the cycle, newest first — read before the weekly meeting and reply right under an update.",
	locPhamVi: "Filter by scope",
	thayCho: (ten: string) => `on behalf of ${ten}`,
	coMoiHonNhan: "There is a newer update.",
	chuaTha: (loi: string) => `Could not add the reaction: ${loi}`,
	traLoi: "Reply",
	oTraLoi: (ten: string) => `Reply to ${ten}'s update`,
	goiY: "Reply…",
	gui: "Send",
	huy: "Cancel",
	chuaGui: (loi: string) => `Not sent: ${loi}`,
	mayChu: "the server did not answer, try again later.",
	loi: {
		tieuDe: "Couldn't load the updates",
		moTa: "The server did not answer. Your data is safe.",
	},
	rong: {
		tieuDe: "No updates in this cycle yet",
		moTa: "When an owner updates a KR, the update shows here, newest first.",
	},
	rongLoc: {
		tieuDe: (chip: string) => `No updates under «${chip}» yet`,
		moTa: "Follow an objective or lead a unit to see that OKR set's updates here.",
		nut: "See all",
	},
};

export function okrCapNhatGanDayMessages(
	locale: Locale,
): OkrCapNhatGanDayMessages {
	return locale === "en" ? en : vi;
}
