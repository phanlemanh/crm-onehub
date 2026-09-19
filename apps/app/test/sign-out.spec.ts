import { beforeEach, describe, expect, it, mock } from "bun:test";

type KetQua = { error: null | { message?: string } };

const signOut = mock(async (): Promise<KetQua> => ({ error: null }));
const toastError = mock((_: string) => {});
const assign = mock((_: string) => {});

mock.module("@crm/auth/client", () => ({ signOut }));
mock.module("sonner", () => ({ toast: { error: toastError } }));
Object.defineProperty(globalThis, "window", {
	value: { location: { assign } },
	configurable: true,
	writable: true,
});

const { signOutAndRedirect } = await import("@/lib/sign-out");

describe("dang xuat", () => {
	beforeEach(() => {
		signOut.mockClear();
		toastError.mockClear();
		assign.mockClear();
	});

	it("bi tu choi khong kem cau → toast dung cau truyen vao, khong chuyen huong", async () => {
		signOut.mockResolvedValueOnce({ error: {} });
		await signOutAndRedirect("Chưa đăng xuất được.");
		expect(toastError).toHaveBeenCalledTimes(1);
		expect(toastError).toHaveBeenCalledWith("Chưa đăng xuất được.");
		expect(assign).not.toHaveBeenCalled();
	});

	it("bi tu choi kem cau may chu → chuyen tiep cau may chu, khong dich", async () => {
		signOut.mockResolvedValueOnce({ error: { message: "Session revoked" } });
		await signOutAndRedirect("Chưa đăng xuất được.");
		expect(toastError).toHaveBeenCalledWith("Session revoked");
		expect(assign).not.toHaveBeenCalled();
	});

	it("thanh cong → chuyen huong ve /sign-in, khong toast", async () => {
		signOut.mockResolvedValueOnce({ error: null });
		await signOutAndRedirect("Chưa đăng xuất được.");
		expect(toastError).not.toHaveBeenCalled();
		expect(assign).toHaveBeenCalledWith("/sign-in");
	});
});
