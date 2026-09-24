import { decideSignInFromDb } from "./allow-list";
import { PASSWORD } from "./chia-mat-khau";
import { env } from "./env";
import { guiThu } from "./thu";

const SECONDS_PER_MINUTE = 60;

export const THU_MAT_KHAU = {
	xin: {
		tieuDe: "Đặt lại mật khẩu CRM OneHub",
		than: (lienKet: string, phut: number) =>
			[
				"Có người vừa xin đặt lại mật khẩu cho tài khoản này.",
				"",
				`Mở liên kết dưới đây để đặt mật khẩu mới. Liên kết dùng được một lần và còn hạn ${phut} phút:`,
				lienKet,
				"",
				"Nếu không phải bạn xin, bỏ qua thư này — mật khẩu hiện tại vẫn nguyên.",
			].join("\n"),
	},
	daDoi: {
		tieuDe: "Mật khẩu CRM OneHub vừa được đổi",
		than: (luc: string) =>
			[
				`Mật khẩu của tài khoản này vừa được đổi lúc ${luc}.`,
				"",
				"Nếu không phải bạn đổi, báo ngay cho quản trị viên để thu hồi quyền.",
			].join("\n"),
	},
} as const;

function duongDatMatKhau(token: string): string {
	return new URL(`/dat-mat-khau/${token}`, env.appUrl).toString();
}

export async function guiThuXinDatLai(input: {
	email: string;
	token: string;
}): Promise<void> {
	const duocVao = await decideSignInFromDb(input.email);

	if (!duocVao.allowed) return;

	await guiThu({
		den: input.email,
		tieuDe: THU_MAT_KHAU.xin.tieuDe,
		than: THU_MAT_KHAU.xin.than(
			duongDatMatKhau(input.token),
			Math.round(PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE),
		),
	});
}

export async function guiThuBaoDaDoi(email: string): Promise<void> {
	await guiThu({
		den: email,
		tieuDe: THU_MAT_KHAU.daDoi.tieuDe,
		than: THU_MAT_KHAU.daDoi.than(
			new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
		),
	});
}
