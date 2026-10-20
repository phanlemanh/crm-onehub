export const PHUT_MS = 60_000;
const GIO_MS = 60 * PHUT_MS;

export const GOM = {
	nhanhChinh: "onehub",
	nhanhDeXuat: "tin-hieu/gom",
	tacGia: {
		ten: "github-actions[bot]",
		thu: "41898282+github-actions[bot]@users.noreply.github.com",
	},
	tieuDe: (ngay: Date): string =>
		`TH2 · chore(gom-tin-hieu-tu-chay): Đợt tín hiệu ${ngay.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" })}`,
	kit: {
		bien: ["AG", "CLAUDE_PLUGIN_ROOT"],
		giai: [
			"scripts/resolve-plugin.mjs",
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/tin-hieu.mjs",
			"--require",
			"skills/gom-tin-hieu/SKILL.md",
			"--require",
			"scripts/cat-luot.mjs",
		],
		tinHieu: "scripts/tin-hieu.mjs",
		catLuot: "scripts/cat-luot.mjs",
	},
	khoaMoHinh: ["ANTHROPIC_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN"],
	moHinh: {
		ten: "sonnet",
		tranLuot: 60,
		tranMs: 25 * PHUT_MS,
		congCu: [
			"Read",
			"Write",
			"Edit",
			"Glob",
			"Grep",
			"Skill",
			"Bash(git add:*)",
			"Bash(git commit:*)",
			"Bash(git status:*)",
			"Bash(git diff:*)",
			"Bash(git log:*)",
			"Bash(node:*)",
		].join(","),
		loiDan: (phuQuyet: string[]): string =>
			[
				"Chạy skill /acceptance-gate:gom-tin-hieu cho mọi tín hiệu chưa có chỗ, rồi skill /acceptance-gate:cat-luot với chính bản gom vừa ghi làm bản phạm vi.",
				"Ghi bản gom mới vào thư mục bản gom của kho, ghi hàng đề xuất vào tệp lộ trình. Commit cục bộ được; không đẩy, không mở PR, không sửa tệp nào khác — lượt lịch tự kiểm và giao.",
				"Không có người để hỏi: câu nào skill bảo hỏi người thì chọn theo khuyến nghị của skill và ghi lý do vào tên nhóm hay lý do lẻ.",
				...(phuQuyet.length
					? [
							`Chủ kho đã phủ quyết đề xuất trước gồm các nhóm: ${phuQuyet.map((t) => `«${t}»`).join(", ")}. Đừng lặp lại đúng cách gom đó.`,
						]
					: []),
			].join("\n"),
	},
	vung: {
		trang: "LO-TRINH.html",
		veLai: ["scripts/product-map.mjs", "--root", "."],
	},
	than: {
		mo: "Lịch gom tín hiệu đề xuất đợt này. Máy không gộp PR này.",
		sua: "Sửa: sửa bản gom hay hàng đề xuất ngay trên nhánh của PR này — lượt lịch sau không ghi đè sửa của anh.",
		phuQuyet:
			"Phủ quyết: đóng PR — máy không đề xuất lại các tín hiệu này cho tới khi có tín hiệu mới.",
		gop: "Gộp: chủ nhóm của tệp lộ trình gộp khi đồng ý.",
		nhom: "Nhóm và hàng đề xuất",
		le: "Không xếp vào nhóm nào",
		daPhu: "Đã có việc làm xong",
		hangChua: "chưa có hàng đề xuất",
	},
	thongDiep: {
		khongMoi: "không có tín hiệu nào chưa có chỗ — không gọi mô hình",
		nguoiSua:
			"đề xuất đang mở có sửa của người — không đụng; tín hiệu mới vào đề xuất kế sau khi PR này gộp hay đóng",
		cungDau: "đề xuất đang mở đã gồm mọi tín hiệu chưa có chỗ",
		phuQuyet:
			"đề xuất cho đúng các tín hiệu này đã bị phủ quyết — chờ tín hiệu mới",
		thieuKhoa:
			"thiếu khoá mô hình — chủ kho đặt bí mật ANTHROPIC_API_KEY (hoặc CLAUDE_CODE_OAUTH_TOKEN) cho kho rồi chạy tay lại lịch gom",
		thieuLenh:
			"không chạy được lệnh claude — bước cài Claude Code của tệp lịch hỏng; chủ kho xem nhật ký bước cài rồi chạy tay lại",
		moHinhHong: "phiên gom thoát lỗi — chạy tay lại lịch gom",
		quaTran: "phiên gom quá trần phút — chạy tay lại lịch gom",
		thieuKit:
			"không tìm được gói acceptance-gate — bước cài gói kit của tệp lịch hỏng, hoặc token của lịch không đọc được kho kit",
		tinHieuSai: "tệp tín hiệu sai khuôn — sửa ở nguồn trước khi gom",
		chamNgoai: "phiên gom chạm tệp ngoài vùng cho phép",
		soBanGom: "phiên gom phải ghi đúng một bản gom mới",
		rangDo: "răng phủ đỏ — có tín hiệu thiếu chỗ hay ở hai chỗ",
		cauDo: "câu cho người gửi lọt mã hay từ nội bộ",
		catLuotDo: "răng cắt lượt đỏ — hàng đề xuất không khớp bản gom",
		dayHong: "đẩy nhánh đề xuất hỏng",
		moPrHong: "mở hay sửa PR đề xuất hỏng",
		danhSachLa: "danh sách PR đề xuất trả về không đọc được",
		veHong: "vẽ lại trang lộ trình hỏng",
	},
	boHookTruocDay: { CRM_SKIP_HOOKS: "1" },
} as const;

export const GOM_DO = {
	nguongMs: 48 * GIO_MS,
	gioMs: GIO_MS,
	nguongSua: 1 / 5,
	khongCo: "chưa có tín hiệu nào trên nhánh chính — chưa có gì để đo",
	quaNguong: "chờ quá 2 ngày mà chưa có chỗ",
	quaPhuQuyet: "qua một đề xuất bị phủ quyết",
	dat: "đạt",
	chuaDat: "chưa đạt",
} as const;
