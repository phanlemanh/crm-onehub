import { expect, test } from "bun:test";
import { googleHostedDomain, isWorkspaceEmail } from "../src/workspace";
import { traLaiDanhSachSauTep } from "./danh-sach-goc";

traLaiDanhSachSauTep();

const BANG = [
	["onemount.com", "onemount.com", true],
	["onemount.com,phanlemanh@gmail.com", undefined, true],
	["phanlemanh@gmail.com", undefined, false],
	["onemount.com,partner.com", undefined, true],
	[undefined, undefined, false],
	["", undefined, false],
] as const;

test.each(BANG)("danh sach %p", (danhSach, hd, choPhep) => {
	if (danhSach === undefined) delete process.env.ALLOWED_SIGN_IN;
	else process.env.ALLOWED_SIGN_IN = danhSach;

	expect(googleHostedDomain()).toBe(hd as never);
	expect(isWorkspaceEmail("ai@onemount.com")).toBe(choPhep);
});

test("cau hinh onehub: tron mot domain voi mot dia chi le", () => {
	process.env.ALLOWED_SIGN_IN = "onemount.com,phanlemanh@gmail.com";

	expect(googleHostedDomain()).toBeUndefined();
	expect(isWorkspaceEmail("ai-do@onemount.com")).toBe(true);
	expect(isWorkspaceEmail("phanlemanh@gmail.com")).toBe(true);
	expect(isWorkspaceEmail("nguoi-la@gmail.com")).toBe(false);
});
