import { describe, expect, test } from "bun:test";
import {
	mailboxGrantsNeeded,
	needsMailboxGrant,
	SYNC_SCOPES,
} from "../src/scopes";

const GOOGLE_KHONG_HOP_THU = [
	{ providerId: "google", scope: "openid email profile" },
];
const GOOGLE_DA_CAP = [{ providerId: "google", scope: SYNC_SCOPES.join(",") }];

describe("tuong hop thu theo vai", () => {
	test("vai okr khong bao gio can cap hop thu", () => {
		expect(mailboxGrantsNeeded(GOOGLE_KHONG_HOP_THU, "okr")).toEqual([]);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU, "okr")).toBe(false);
	});

	test("member va admin van bi tuong nhu cu", () => {
		expect(mailboxGrantsNeeded(GOOGLE_KHONG_HOP_THU, "member")).toEqual([
			"google",
		]);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU, "member")).toBe(true);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU, "admin")).toBe(true);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU)).toBe(true);
	});

	test("da cap thi khong tuong, bat ke vai", () => {
		expect(needsMailboxGrant(GOOGLE_DA_CAP, "member")).toBe(false);
		expect(needsMailboxGrant(GOOGLE_DA_CAP, "okr")).toBe(false);
	});
});
