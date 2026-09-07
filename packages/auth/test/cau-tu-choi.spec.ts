import { expect, test } from "bun:test";
import { auth } from "../src/auth";

type NguoiMoi = { email: string; name: string };

type TruocTao = (user: NguoiMoi) => Promise<{ data: unknown }>;

const BANG = [
	["onemount.com", "Sign in with your @onemount.com account."],
	[
		"onemount.com,phanlemanh@gmail.com",
		"Sign in with your @onemount.com account.",
	],
	["phanlemanh@gmail.com", "That address is not on the allow-list."],
] as const;

function hook(): TruocTao {
	const o = auth.options as {
		databaseHooks?: { user?: { create?: { before?: TruocTao } } };
	};
	const before = o.databaseHooks?.user?.create?.before;
	if (before instanceof Function === false)
		throw new Error("khong tim thay databaseHooks.user.create.before");
	return before;
}

test.each(BANG)("danh sach %p nhan cau cua no", async (danhSach, phanCuoi) => {
	process.env.ALLOWED_SIGN_IN = danhSach;

	let thongDiep = "";
	try {
		await hook()({ email: "nguoi-la@example.test", name: "La" });
	} catch (e) {
		thongDiep =
			(e as { body?: { message?: string }; message?: string }).body?.message ??
			(e as Error).message;
	}

	expect([danhSach, thongDiep.endsWith(phanCuoi)]).toEqual([danhSach, true]);
});
