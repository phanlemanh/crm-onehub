---
slug: lam-moi-goi-y-ke-hoach
at: 2026-10-16T15:41:00Z
verdict: findings
p0: 1
p1: 1
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261016T153802Z-2 viện «ngưỡng cùng lúc» của opportunity.md, mà ô cơ hội không có chữ đó — căn cứ mot-loi sai; ô settle record của AC-4/E4 dựng trên dòng ấy | Cổng Phạm vi tin phần chờ là lối duy nhất qua ngưỡng đã ký và duyệt một ô bắt buộc chưa ai cân giá | Dòng sổ mới supersede d-2 với căn cứ có thật hoặc ghi rõ là đánh đổi kỹ thuật | fixed: dòng sổ mới supersedes d-20261016T153802Z-2, nguồn muc-tieu trích docs/api.md mục settle record (phần chờ là của bản ghi, nền là của bảng), nêu giá và nói lối nền vẫn qua ngưỡng 2 giây |
| P1 | contract | Fixture E1–E3 tự dựng hành vi máy chủ (sinh gợi ý ngay sau setStage, trả null khi rời thắng) mà không trích đường ghi thật | Máy chủ sinh gợi ý bất đồng bộ hoặc vẫn trả gợi ý khi rời thắng thì E1–E5 xanh trên mock, E6 đỏ ở S4 và phải đổi máy chủ ngoài phạm vi | Trích hàm thật; thêm eval cross-layer trên API thật cho hai chiều | fixed: Context và design doc mục 2 trích sinhGoiYKeHoach trong giao dịch của DealsService và lọc giaiDoan.kind WON của OnboardingService.goiYCuaDeal; AC-1, AC-3 gắn (cross-layer); thêm E8 (gymk_sinh) và E9 (gymk_xu_ly) — chạy lại bài đã ký của DA3b |
| P2 | contract | Lời hứa «một chỗ phủ mọi đường đổi giai đoạn» chỉ dựa vào grep lúc thiết kế | Một đường đổi giai đoạn làm mới bằng lối khác cache.deal, thẻ ở đó vẫn chậm 30 giây mà mọi eval xanh | Eval script quét apps/app, bảng năm đường viết trước, đối chứng dương | fixed: AC-4 thêm vế quét; E10 rang/duong-doi-giai-doan.mjs quét mọi lời gọi deals.setStage/bulkSetStage với bảng bốn nơi và tự thử ba cây giả; Coverage ghi rõ lưu trữ giai đoạn chỉ đọc lúc thiết kế, không đo |
| P2 | contract | Vế «không đóng mở lại sheet» và «0 lần hỏi» của ngưỡng chưa có đường đo trên bàn đo thật | App thật dựng lại sheet khi giai đoạn đổi mà E6 vẫn đạt vì trang không tải lại | man.mjs giữ handle sheet; Đường đo ghi ai đọc «0 lần hỏi» | fixed: AC-6 và E6 đòi handle sheet còn gắn sau khi thẻ hiện và mất (dòng «E6 sheet khong dung lai»); Đường đo thêm hai dòng, «0 lần hỏi» ghi ở biên bản phiên nghiệm thu |
| P2 | evals | AC-7 hứa mọi suite thoát 0 mà E7 không chạy suite nào | Thêm khoá vào khối deal làm một suite có sẵn đỏ mà E7 vẫn exit 0 | E7 chạy suite hoặc dẫn rõ chỗ cổng chạy suite_keys | fixed: expected của E7 nói S4 chạy từng suite của suite_keys làm suiteCommands mỗi lượt và AC-7 chỉ đạt khi cả E7 và mọi suiteCommands thoát 0 |
