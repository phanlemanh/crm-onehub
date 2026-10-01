import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";

const LOI_DAN = readFileSync(
	join(import.meta.dir, "..", "agent", "instructions.md"),
	"utf8",
);

function muc(tieuDe: string): string {
	const dau = LOI_DAN.indexOf(`## ${tieuDe}\n`);
	expect(dau, `loi dan thieu muc ${tieuDe}`).toBeGreaterThanOrEqual(0);
	const sau = LOI_DAN.indexOf("\n## ", dau + 1);
	return LOI_DAN.slice(dau, sau === -1 ? undefined : sau);
}

function gach(doan: string, dau: string): string {
	const tu = doan.indexOf(dau);
	expect(tu, `loi dan thieu gach dau ${dau}`).toBeGreaterThanOrEqual(0);
	const het = doan.slice(tu + 1).search(/\n\s*- /);
	return doan
		.slice(tu, het === -1 ? undefined : tu + 1 + het)
		.replace(/\s+/g, " ");
}

describe("lời dặn tĩnh sau lần chạy 6", () => {
	test("cỡ lời dặn không vượt trần ký tự", () => {
		expect(LOI_DAN.length).toBeLessThanOrEqual(
			TRO_LY_OKR_SOAN.loiDanTinh.tranKyTu,
		);
	});

	test("KR đo kết quả: cấm sản phẩm bàn giao, việc và thời gian của bước nội bộ; có câu tự hỏi và đúng một cặp phản ví dụ", () => {
		const phuongPhap = muc("OKR method");
		const kr = gach(phuongPhap, "- A Kết quả then chốt (KR)");
		expect(kr).toContain("deliverable");
		expect(kr).toContain("activity");
		expect(kr).toContain("how long");
		expect(kr).toMatch(/«[^»]+\?»/);
		const cap = phuongPhap.match(/^\s*- not «[^»]+» → «[^»]+»\.?$/gm) ?? [];
		expect(cap.length, "can dung mot cap phan vi du").toBe(1);
		const moc = gach(phuongPhap, "- Use the milestone kind");
		expect(moc).toContain("`moc`");
		expect(moc).toContain("itself the outcome");
		expect(moc).toContain("never for building, launching or deploying");
	});

	test("mỗi Mục tiêu có một KR đối trọng giữ chất lượng, chi phí hay quan hệ, đo kết quả, không số đích; đúng một cặp ví dụ", () => {
		const phuongPhap = muc("OKR method");
		const doiTrong = gach(
			phuongPhap,
			"- Each Mục tiêu has at least one counterbalance KR",
		);
		expect(doiTrong).toContain("quality, cost or a relationship");
		expect(doiTrong).toContain("the unit itself moves");
		expect(doiTrong).toContain(
			"phrased as an outcome and never as a target number",
		);
		const cap = phuongPhap.match(/^\s*- pair «[^»]+» with «[^»]+»\.?$/gm) ?? [];
		expect(cap.length, "can dung mot cap vi du doi trong").toBe(1);
	});

	test("khởi điểm: cùng chỉ số mới lấy, kể cả số hiện tại của KR cấp trên; không bao giờ lấy đích", () => {
		const banNhap = muc("What to do");
		const kd = gach(banNhap, "- `khoiDiemGoiY`");
		for (const nguon of ["part `3`", "part `4`", "part `2a`", "`hienTai`"])
			expect(kd, `khoi diem thieu nguon ${nguon}`).toContain(nguon);
		expect(kd).toContain("the same thing in the same unit of measure");
		expect(kd).toContain("A related or nearby number is not a starting");
		expect(kd).toContain("Never put a target (`dich`) of any level there");
		expect(kd).toContain("for every KR");
	});

	test("bản nháp mở bằng việc cốt lõi trong mô tả đơn vị, trước luật số Mục tiêu", () => {
		const banNhap = muc("What to do");
		const cotLoi = banNhap.indexOf("- start from the unit's job");
		const soMucTieu = banNhap.indexOf("- two to four Mục tiêu");
		expect(cotLoi, "thieu luat viec cot loi").toBeGreaterThanOrEqual(0);
		expect(cotLoi).toBeLessThan(soMucTieu);
		const luat = gach(banNhap, "- start from the unit's job");
		expect(luat).toContain("part `1`");
		expect(luat).toContain("The first Mục tiêu");
		expect(luat).toContain("even when the person's priority lies elsewhere");
		expect(luat).toContain("in this unit's own words");
	});
});
