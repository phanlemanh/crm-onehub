import {
	afterAll,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from "bun:test";

type KetQua = { error: null | { message?: string } };

const signOut = mock(async (): Promise<KetQua> => ({ error: null }));
const toastError = mock((_: string) => {});
const assign = mock((_: string) => {});
const consoleError = spyOn(console, "error").mockImplementation(() => {});

mock.module("@crm/auth/client", () => ({ signOut }));
mock.module("sonner", () => ({ toast: { error: toastError } }));
Object.defineProperty(globalThis, "window", {
	value: { location: { assign } },
	configurable: true,
	writable: true,
});

const { signOutAndRedirect } = await import("@/lib/sign-out");

const CAU = "Chưa đăng xuất được.";

const MA_TRAN: [string, () => void][] = [
	[
		"tra loi co message",
		() =>
			signOut.mockResolvedValueOnce({
				error: { message: "Failed to sign out" },
			}),
	],
	["tra loi khong message", () => signOut.mockResolvedValueOnce({ error: {} })],
	[
		"nem loi mang",
		() => signOut.mockRejectedValueOnce(new TypeError("Failed to fetch")),
	],
];

afterAll(() => {
	consoleError.mockRestore();
});

describe("dang xuat", () => {
	beforeEach(() => {
		signOut.mockClear();
		toastError.mockClear();
		assign.mockClear();
	});

	for (const [ca, dung] of MA_TRAN) {
		it(`${ca} -> chi cau tieng Viet cua noi goi, khong chuyen huong`, async () => {
			dung();
			await signOutAndRedirect(CAU);
			expect(toastError).toHaveBeenCalledTimes(1);
			expect(toastError.mock.calls[0]?.[0], "Failed to sign out").toBe(CAU);
			expect(assign).not.toHaveBeenCalled();
		});
	}

	it("thanh cong → chuyen huong ve /sign-in, khong toast", async () => {
		signOut.mockResolvedValueOnce({ error: null });
		await signOutAndRedirect(CAU);
		expect(toastError).not.toHaveBeenCalled();
		expect(assign).toHaveBeenCalledWith("/sign-in");
	});
});
