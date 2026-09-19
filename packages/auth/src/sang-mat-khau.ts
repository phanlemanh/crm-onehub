import { createHash } from "node:crypto";
import { APIError } from "better-auth/api";
import * as z from "zod";
import { PASSWORD } from "./chia-mat-khau";

const DUONG_DAT_LAI = "/reset-password";

export const SANG_MAT_KHAU = {
	goc: "https://api.pwnedpasswords.com/range",
	doDaiTienTo: 5,
	hetGioMs: 4000,
} as const;

export const CAU_MAT_KHAU = {
	quaNgan: (soKyTu: number) => `Mật khẩu phải có ít nhất ${soKyTu} ký tự.`,
	daLo: "Mật khẩu này đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu khác.",
} as const;

const thanDatLai = z.object({ newPassword: z.string() });

export async function canhDatMatKhau(ctx: {
	path: string;
	body: unknown;
}): Promise<void> {
	if (ctx.path !== DUONG_DAT_LAI) return;

	const than = thanDatLai.safeParse(ctx.body);
	if (!than.success) return;

	const matKhau = than.data.newPassword;

	if (matKhau.length < PASSWORD.minLength) {
		throw new APIError("BAD_REQUEST", {
			message: CAU_MAT_KHAU.quaNgan(PASSWORD.minLength),
		});
	}

	let daLo = false;

	try {
		daLo = await hoiDanhSachDaLo(matKhau);
	} catch (loi) {
		console.warn(
			`[auth] khong voi toi duoc danh sach mat khau da lo, cho mat khau di qua: ${String((loi as Error)?.message ?? loi)}`,
		);
		return;
	}

	if (daLo) {
		throw new APIError("BAD_REQUEST", { message: CAU_MAT_KHAU.daLo });
	}
}

async function hoiDanhSachDaLo(matKhau: string): Promise<boolean> {
	const bam = createHash("sha1").update(matKhau).digest("hex").toUpperCase();
	const tienTo = bam.slice(0, SANG_MAT_KHAU.doDaiTienTo);
	const duoi = bam.slice(SANG_MAT_KHAU.doDaiTienTo);

	const traLoi = await fetch(`${SANG_MAT_KHAU.goc}/${tienTo}`, {
		headers: { "Add-Padding": "true" },
		signal: AbortSignal.timeout(SANG_MAT_KHAU.hetGioMs),
	});

	if (!traLoi.ok) {
		throw new Error(`danh sach mat khau da lo tra ve ${traLoi.status}`);
	}

	const than = await traLoi.text();

	return than
		.split("\n")
		.some((dong) => dong.split(":")[0]?.trim().toUpperCase() === duoi);
}
