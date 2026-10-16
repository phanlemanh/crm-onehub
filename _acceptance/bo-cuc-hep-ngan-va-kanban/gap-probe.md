---
slug: bo-cuc-hep-ngan-va-kanban
at: 2026-10-16T04:04:05Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ bỏ design-pass ghi nguồn một-lối, nhưng lý do không làm lối kia chết: design-pass vẫn chụp được bố cục MỚI trên nhánh ở 375; bỏ hay giữ khoảnh khắc nhìn trước duyệt là lựa chọn chỉ người có. | Người ký Hỏi-2 bằng chữ, tới Cổng Bằng chứng mới thấy thanh giai đoạn năm bước ba dòng đẩy nội dung ngăn xuống; muốn đổi lối phải mở lại Cổng 1. | Đổi dòng đó thành câu hỏi cho người kèm lối khác. | fixed: dòng sổ mới Hỏi-4 (nguồn chỉ người có, supersedes dòng 7) — khuyên bỏ bản mẫu, lối khác dựng nhanh rồi chụp 375 trước khi duyệt. |
| P0 | design | Dòng sổ về DealStageIndicator dựa trên tiền đề CSS sai («span inline không phải phần tử flex»); chiều đỏ E1 phá hai thứ cùng lúc nên không cô lập nguyên nhân. | Chẩn đoán sai được đóng dấu bằng một chiều đỏ ra đúng ghim nhờ thứ còn lại. | Tách chiều đỏ, sửa lý do. | fixed: design doc sửa nguyên nhân (hàng không xuống dòng + nhãn min-width:auto); dòng sổ mới supersedes dòng 6 (giữ cả hai, một-lối có căn cứ); E7 tách thành chiều (2) bỏ flex-wrap và (3) bỏ biến thể xuống dòng, mỗi chiều một ghim. |
| P1 | contract | AC-5 đòi chỉ báo cùng hàng người phụ trách ở 1440 trong khi dữ liệu gieo dài và Hỏi-3 cho xuống dòng ở mọi khổ — mâu thuẫn chưa ai quyết. | E5 đỏ oan với dữ liệu dài, hoặc người dựng thêm nowrap ở md làm nhãn tràn lại ở khổ rộng mà không eval nào bắt. | Tách phạm vi AC-5, thêm bước 1440 với thẻ dài. | fixed: AC-1 nay đo thẻ dài ở cả 375 và 1440; AC-5 chỉ đo thẻ người phụ trách và giai đoạn tên ngắn; E1 thêm bước 1440. |
| P1 | evals | Cam kết «mặc định StatusIndicator vẫn cắt» không có AC hay eval; phần bước chốt của AC-3 không có chiều đỏ và dữ liệu chốt ngắn. | Người dựng đổi mặc định sang xuống dòng, mọi bảng khác cao lên mà E1–E6 vẫn xanh; bước chốt cắt chữ mà E3 không thấy. | Bài kiểm packages/ui + gieo bước chốt dài + chiều đỏ riêng. | fixed: AC-7 + E8 (bài kiểm packages/ui, chiều đỏ ghim 'bch-nhan: mac dinh khong con cat'); E3 gieo giai đoạn chốt tên dài và mở ngăn thoả thuận ở giai đoạn đó; E7 thêm chiều (6) bước chốt bỏ biến thể. |
| P1 | evals | Ca dữ liệu dài chưa vào phép đo: tên người phụ trách không ghim độ dài, thiếu chiều đỏ ô Phụ trách, tên công ty không gieo, E6 không quét phần tử trong thẻ. | Tên phụ trách vừa một dòng ở lưới 2×2 nên E2 xanh dù OwnerCell còn cắt; tên thoả thuận 120 ký tự tràn thẻ nhưng trang không cuộn nên E6 xanh. | Ghim độ dài, thêm chiều đỏ, đo phần tử con của thẻ. | fixed: gieo người phụ trách và công ty tên 120 ký tự không dấu cách; E7 thêm chiều (4) ô Phụ trách bỏ xuongDongDienThoai; E1 đo mọi phần tử con của thẻ dài trong viền thẻ, mỗi phần tử một assert. |
