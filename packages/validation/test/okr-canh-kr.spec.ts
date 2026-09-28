import { describe, expect, test } from "bun:test";
import {
	duongDanBangChung,
	guiGhiNhanInput,
	themViecInput,
} from "../src/okr-canh-kr";

const CA_URL: [string, boolean][] = [
	["https://drive.google.com/x", true],
	["http://intranet.onehub.vn/a?b=1", true],
	["javascript:alert(1)", false],
	["JAVASCRIPT:alert(1)", false],
	["data:text/html,x", false],
	["ftp://x", false],
	["httpx://x", false],
	["drive.google.com/x", false],
	["", false],
	["   ", false],
	[`https://x.vn/${"a".repeat(1990)}`, false],
];

describe("okr-canh-kr", () => {
	test("đường dẫn bằng chứng", () =>
		expect(CA_URL.map(([u]) => duongDanBangChung.safeParse(u).success)).toEqual(
			CA_URL.map(([, k]) => k),
		));
	test("tiêu đề việc 1 và 201 ký tự bị từ chối, chữ lạ giữ nguyên", () => {
		const co = (t: string) =>
			themViecInput.safeParse({
				keyResultId: "k",
				tieuDe: t,
				nguoiLamUserId: "u",
				hanNgay: null,
			}).success;
		expect([
			co("a"),
			co("a".repeat(201)),
			co("Launch 🚀 bộ câu hỏi"),
			co("x".repeat(200)),
		]).toEqual([false, false, true, true]);
	});
	test("ghi nhận: 0 người, 6 người, trùng người, lời trống, lời 501 ký tự", () => {
		const co = (nguoiNhan: string[], loiNhan: string) =>
			guiGhiNhanInput.safeParse({
				objectiveId: "o",
				keyResultId: null,
				nguoiNhan,
				loiNhan,
			}).success;
		expect([
			co([], "x"),
			co(["a", "b", "c", "d", "e", "f"], "x"),
			co(["a", "a"], "x"),
			co(["a"], ""),
			co(["a"], "x".repeat(501)),
			co(["a", "b"], "Cảm ơn"),
		]).toEqual([false, false, false, false, false, true]);
	});
});
