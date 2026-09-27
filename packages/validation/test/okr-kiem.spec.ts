import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { kiemOkr, MA_LUAT_OKR, type MucTieuKiem } from "../src/okr-kiem";

const kr = (
	title: string,
	kind: MucTieuKiem["keyResults"][number]["kind"],
	startValue = 10,
	targetValue = 20,
) => ({ title, kind, startValue, targetValue });
const mt = (...keyResults: MucTieuKiem["keyResults"]): MucTieuKiem => ({
	title: "Đối tác mới được đỡ trọn tháng đầu",
	whyNow: "",
	keyResults,
});

const CA: [string, MucTieuKiem, ReturnType<typeof kiemOkr>][] = [
	[
		"viec có dấu",
		mt(kr("Gọi điện chào mừng mọi đối tác mới", "tang-toi")),
		[{ ma: "kr-la-viec", truong: "title", krIndex: 0 }],
	],
	[
		"viec không dấu",
		mt(kr("goi 50 cuoc cho doi tac", "tang-toi")),
		[{ ma: "kr-la-viec", truong: "title", krIndex: 0 }],
	],
	[
		"viec tiếng Anh",
		mt(kr("Launch the new partner portal", "phan-tram", 5, 80)),
		[{ ma: "kr-la-viec", truong: "title", krIndex: 0 }],
	],
	[
		"không viec: tỷ lệ",
		mt(kr("Tỷ lệ đối tác gọi lại trong 24 giờ", "tang-toi")),
		[],
	],
	["không viec: mốc", mt(kr("Hoàn thành chuyển kho dữ liệu", "moc", 0, 1)), []],
	[
		"không viec: danh từ",
		mt(kr("Đối tác chấm hài lòng từ 4/5", "tang-toi")),
		[],
	],
	[
		"thiếu khởi điểm tăng tới",
		mt(kr("Đối tác mới ký hợp tác", "tang-toi", 0, 15)),
		[{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }],
	],
	[
		"thiếu khởi điểm phần trăm",
		mt(kr("Tỷ lệ công ty có buổi gặp", "phan-tram", 0, 80)),
		[{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }],
	],
	[
		"thiếu khởi điểm giữ trên",
		mt(kr("Điểm hài lòng trung bình", "giu-tren", 0, 4)),
		[{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 }],
	],
	[
		"mốc khởi điểm 0 không hỏi",
		mt(kr("Bộ câu hỏi thường gặp công bố", "moc", 0, 1)),
		[],
	],
	[
		"khởi điểm 5 không hỏi",
		mt(kr("Đối tác mới ký hợp tác", "tang-toi", 5, 15)),
		[],
	],
	[
		"giảm xuống khởi điểm 8 không hỏi",
		mt(kr("Thời gian phản hồi", "giam-xuong", 8, 2)),
		[],
	],
	[
		"đích bằng khởi điểm giữ trên",
		mt(kr("Điểm hài lòng trung bình", "giu-tren", 4, 4)),
		[{ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: 0 }],
	],
	[
		"đích bằng khởi điểm giữ dưới",
		mt(kr("Tỷ lệ huỷ", "giu-duoi", 5, 5)),
		[{ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: 0 }],
	],
	[
		"đích bằng khởi điểm phần trăm",
		mt(kr("Tỷ lệ gặp tuần đầu", "phan-tram", 60, 60)),
		[{ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: 0 }],
	],
	[
		"tăng tới đích bằng khởi điểm — lượt 3 đã chặn, luật im",
		mt(kr("Doanh số quý", "tang-toi", 20, 20)),
		[],
	],
	[
		"giữ trên đích khác khởi điểm",
		mt(kr("Điểm hài lòng trung bình", "giu-tren", 3, 4)),
		[],
	],
	[
		"phần trăm đích khác khởi điểm",
		mt(kr("Tỷ lệ gặp tuần đầu", "phan-tram", 60, 80)),
		[],
	],
	[
		"thiếu đối trọng ba tăng tới",
		mt(
			kr("Thoả thuận mới", "tang-toi"),
			kr("Cuộc gọi hẹn được", "tang-toi"),
			kr("Đối tác mới ký", "tang-toi"),
		),
		[{ ma: "thieu-doi-trong", truong: "keyResults", krIndex: null }],
	],
	[
		"có giữ dưới thì không hỏi đối trọng",
		mt(kr("Thoả thuận mới", "tang-toi"), kr("Tỷ lệ huỷ", "giu-duoi", 5, 4)),
		[],
	],
	["một KR thì không hỏi đối trọng", mt(kr("Thoả thuận mới", "tang-toi")), []],
	[
		"tăng tới và giảm xuống vẫn không hỏi",
		mt(
			kr("Thoả thuận mới", "tang-toi"),
			kr("Thời gian phản hồi", "giam-xuong", 8, 2),
		),
		[],
	],
	[
		"gộp: việc + thiếu khởi điểm, đúng thứ tự",
		mt(
			kr("Gọi 50 cuộc mỗi tuần", "tang-toi", 0, 50),
			kr("Tỷ lệ huỷ", "giu-duoi", 5, 4),
		),
		[
			{ ma: "kr-la-viec", truong: "title", krIndex: 0 },
			{ ma: "thieu-khoi-diem", truong: "startValue", krIndex: 0 },
		],
	],
	["mục tiêu rỗng", mt(), []],
];

describe("okr-kiem", () => {
	for (const [ten, dau, mong] of CA)
		test(ten, () => expect(kiemOkr(dau)).toEqual(mong));
	test("danh sách mã theo thứ tự khai", () =>
		expect([...MA_LUAT_OKR]).toEqual([
			"kr-la-viec",
			"thieu-khoi-diem",
			"dich-bang-khoi-diem",
			"thieu-doi-trong",
		]));
	test("hàm thuần: không nhập cơ sở dữ liệu hay mạng", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../src/okr-kiem.ts"),
			"utf8",
		);
		for (const cam of ["@crm/db", "prisma", "fetch(", "node:"])
			expect(nguon.includes(cam)).toBe(false);
	});
});
