import { describe, expect, test } from "bun:test";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { LOI_DAN_SOAN } from "../agent/lib/loi-dan-soan";

const MIEN_BO_MAU =
	/đối tác|thanh toán|công nợ|tạm ứng|chuyến|giao hàng|kho hàng|kho lạnh|vận chuyển|hỗ trợ/iu;

const LOI_DAN = LOI_DAN_SOAN;

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
		const hai = cap[0]?.match(/«([^»]+)»/g) ?? [];
		expect(hai.length).toBe(2);
		for (const nua of hai)
			expect(nua, `vi du doi trong la dem viec: ${nua}`).not.toMatch(
				/^«(Số|Thời gian)\s/u,
			);
	});

	test("ví dụ trong lời dặn không lấy từ miền của bộ mẫu (hậu cần, tài chính, đối tác)", () => {
		const viDu = muc("OKR method")
			.split("\n")
			.filter((d) => /^\s*- (not|pair) «/.test(d));
		expect(viDu.length).toBe(2);
		for (const d of viDu)
			expect(d, `vi du trong mien bo mau: ${d}`).not.toMatch(MIEN_BO_MAU);
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
		expect(luat).toContain("unless the person has already dropped it");
		expect(luat).toContain("in this unit's own words");
	});

	test("bản nháp nộp trọn trong một lời gọi: mọi Mục tiêu cùng đủ KR, không chia nhiều lời gọi", () => {
		const banNhap = muc("What to do").replace(/\s+/g, " ");
		expect(banNhap).toContain(
			"call `nop_ban_nhap` with the whole draft in a single call — every Mục tiêu with all its KR together, never split across calls:",
		);
	});

	test("dòng bị loại: sửa theo viPham rồi nộp lại trong cùng lượt, không để dòng bị loại; không nêu số lần gọi mỗi lượt", () => {
		const banNhap = muc("What to do");
		const sua = gach(banNhap, "- When lines come back in `biLoai`");
		expect(sua).toContain("`viPham`");
		expect(sua).toContain("call `nop_ban_nhap` again in the same turn");
		expect(sua).toContain("never end the turn with a dropped line");
		expect(sua).toContain("`da-bac`");
		for (const tran of [
			/at most (once|twice)/i,
			/per turn/i,
			/once more/i,
			/`nop_ban_nhap` once\b/i,
			/một lần|hai lần/i,
		])
			expect(LOI_DAN, `loi dan con tran so lan goi: ${tran}`).not.toMatch(tran);
	});

	test("luật judge và tiêu chí khởi điểm liệt kê đúng nguồn khởi điểm của lời dặn, cấm số đích", () => {
		const DG = TRO_LY_OKR_SOAN.danhGia;
		const NGUON = [
			"lời người",
			"số chốt kỳ trước",
			"số CRM",
			"số hiện tại của KR cấp trên cùng chỉ số",
			"hồ sơ công ty hay trang chiến lược",
		];
		const tieuChiKhoiDiem = DG.boiCanh.tieuChi[1];
		for (const chu of [DG.luatJudge, tieuChiKhoiDiem]) {
			let truoc = -1;
			for (const nguon of NGUON) {
				const o = chu.indexOf(nguon);
				expect(o, `thieu nguon khoi diem: ${nguon}`).toBeGreaterThan(truoc);
				truoc = o;
			}
			expect(chu).toContain("không bao giờ là một số đích");
			expect(chu).toContain("đúng chỉ số đó");
		}
		const kd = gach(muc("What to do"), "- `khoiDiemGoiY`");
		for (const nguon of [
			"person's own messages",
			"part `3`",
			"part `4`",
			"`hienTai`",
			"strategy page",
		])
			expect(kd).toContain(nguon);
	});
});
