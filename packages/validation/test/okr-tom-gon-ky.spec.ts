import { describe, expect, test } from "bun:test";
import { tomGonKr, tomGonKy } from "../src/okr-tom-gon-ky";

const KR = {
	ten: "Tỷ lệ đối tác gia hạn",
	kieu: "tang-toi",
	donVi: "%",
	khoiDiem: 70,
	dich: 90,
	soChot: 82,
	diem: 0.6,
	lyDo: "Bảng giá mới ra trễ",
	capNhat: [
		{ tuan: "2026-07-06", giaTri: 71, tuTin: "cao" as const, ghiChu: "" },
		{ tuan: "2026-07-13", giaTri: 72, tuTin: "cao" as const, ghiChu: "" },
		{
			tuan: "2026-08-03",
			giaTri: 75,
			tuTin: "vua" as const,
			ghiChu: "Ba đối tác lớn hoãn ký vì bảng giá",
		},
		{
			tuan: "2026-09-14",
			giaTri: 82,
			tuTin: "thap" as const,
			ghiChu: "Bảng giá mới chưa được duyệt",
		},
	],
};

describe("tom-gon-ky", () => {
	test("một KR: mức tự tin đầu → cuối, số tuần im, hai ghi chú cuối, số chốt so đích", () => {
		expect(tomGonKr(KR)).toBe(
			"Tỷ lệ đối tác gia hạn (tang-toi, %): 70 → 82/90, điểm 0.6; tự tin cao → thấp; 4 cập nhật, im 7 tuần; ghi chú cuối: «Ba đối tác lớn hoãn ký vì bảng giá» · «Bảng giá mới chưa được duyệt»; lý do điểm: Bảng giá mới ra trễ",
		);
	});

	test("không có cập nhật: nói rõ không có, không ném", () => {
		expect(tomGonKr({ ...KR, capNhat: [], diem: null, lyDo: "" })).toBe(
			"Tỷ lệ đối tác gia hạn (tang-toi, %): 70 → 82/90, chưa chấm; không có Cập nhật tuần",
		);
	});

	test("thứ tự đầu vào không đổi kết quả; chỉ hai ghi chú cuối được giữ; ghi chú trắng bị bỏ", () => {
		const xaoTron = { ...KR, capNhat: [...KR.capNhat].reverse() };
		expect(tomGonKr(xaoTron)).toBe(tomGonKr(KR));
		const nhieu = {
			...KR,
			capNhat: [
				{
					tuan: "2026-07-06",
					giaTri: 71,
					tuTin: "cao" as const,
					ghiChu: "Một",
				},
				{
					tuan: "2026-07-13",
					giaTri: 72,
					tuTin: "cao" as const,
					ghiChu: "Hai",
				},
				{
					tuan: "2026-07-20",
					giaTri: 73,
					tuTin: "vua" as const,
					ghiChu: "   ",
				},
				{ tuan: "2026-07-27", giaTri: 74, tuTin: "vua" as const, ghiChu: "Ba" },
			],
		};
		const s = tomGonKr(nhieu);
		expect(s).toContain("ghi chú cuối: «Hai» · «Ba»");
		expect(s).not.toContain("Một");
		expect(s).toContain("im 0 tuần");
	});

	test("cả kỳ: mỗi Mục tiêu một dòng đầu (điểm, điều học được) và các KR thụt vào", () => {
		const s = tomGonKy({
			mucTieu: [
				{
					ten: "Đối tác miền Bắc gắn bó",
					diem: 0.55,
					dieuHocDuoc: "Giá phải chốt trước tháng 7",
					kr: [KR],
				},
			],
		});
		expect(s.split("\n")[0]).toBe(
			"Mục tiêu «Đối tác miền Bắc gắn bó»: điểm 0.55; học được: Giá phải chốt trước tháng 7",
		);
		expect(s.split("\n")[1]?.startsWith("  - Tỷ lệ đối tác gia hạn")).toBe(
			true,
		);
		expect(s).not.toContain("2026-07-06");
	});

	test("Mục tiêu chưa chấm và không có điều học được: dòng đầu gọn, không ném", () => {
		expect(
			tomGonKy({
				mucTieu: [{ ten: "Kênh đại lý", diem: null, dieuHocDuoc: " ", kr: [] }],
			}),
		).toBe("Mục tiêu «Kênh đại lý»: chưa chấm");
	});
});
