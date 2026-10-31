---
slug: cap-nhat-trong-ngan-kr
at: 2026-10-30T07:00:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

# Phản biện context sạch — cap-nhat-trong-ngan-kr

Một tác tử tươi đọc đúng sáu tệp: design, contract, evals, sổ, bài học từ hồ sơ trước, ô Cổng Đáng.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract (AC-10) · evals (E10b) | AC-10 hứa giữ nguyên kỳ vọng của thước đã ký, nhưng hai lời hứa đã ký sẽ bị thay (khối «lần trước» trong hộp của hop-cap-nhat-lan-truoc, nút đầu ngăn của VK7); sổ không ghi; E10b chỉ đòi suite thoát 0 | Thợ xoá lặng các expect «lần trước» và nút đầu ngăn khi chuyển thước; suite xanh, Cổng Bằng chứng thấy «giữ kỳ vọng» trong khi hai lời hứa mất không ai ký | Ma trận dựng bằng grep, mỗi assertion một nhãn giữ / chuyển chỗ đo / thay lời hứa; ô thay lời hứa thành Hỏi; răng so assertion trước/sau | fixed: AC-10 viết lại theo ma trận nhãn (thuoc-da-ky.md, dựng ở S3); thêm E10c chặn mất lặng; Hỏi-2 lên Cổng Phạm vi (dòng sổ chi-nguoi, yêu cầu V1-9) |
| P1 | evals (E8) · contract (AC-8) | Không ca nào bắt đầu từ lối Họp tuần (tab=cap-nhat) rồi › sang KR kế | tab=cap-nhat còn trên đường dẫn làm khối của KR kế mở và giành tiêu điểm | Ô mới: vào từ Họp tuần, gửi, › tới KR đã cập nhật → khối thu, tab=cap-nhat hết, thuTuKr giữ | fixed: AC-8 thêm vế; E8 thêm ô thứ tư và chiều đỏ ghim |
| P1 | evals (E4a, E9) · opportunity | Vế «biểu đồ thêm một điểm» của AC-4 và của ngưỡng SỐNG không eval nào đo | Biểu đồ đọc cache cũ hay chấm nét đứt còn treo; E4a, E9 vẫn xanh | Đếm điểm liền trước/sau gửi và chấm xem trước sau gửi | fixed: E4a đếm N → N+1 điểm liền và 0 chấm xem trước, chiều đỏ ghim |
| P1 | evals (E1) · contract (AC-1, Hỏi-1) | E1 không phân biệt hai phương án của Hỏi-1, không có ô biên tuần giờ VN | Thợ tính tuần theo UTC hay theo thứ cập nhật; E1 vẫn xanh | Ô đồng hồ thứ Hai với thứ cập nhật thứ Năm; ô lần cuối thứ Hai 00:30 giờ VN | fixed: E1 thêm ô (c) biên tuần và (d) theo phương án Hỏi-1 (ghi khi có trả lời), chiều đỏ UTC ghim |
| P1 | contract (Coverage A, B) · evals | Ghi hộ và KR mốc có trong Coverage nhưng không AC nào nói | Dòng «Ghi hộ» hay ô liên kết bằng chứng rơi mất khi chuyển sang khối; mọi eval xanh | Vế mới trong AC-1 và AC-4; ô ghi hộ ở E1, ô KR mốc ở E4a và E4b | fixed: AC-1 thêm vế ghi hộ, AC-4 thêm vế KR mốc; E1 ô (e), E4a và E4b thêm ô KR mốc |

Ghi chú của tác tử ngoài bảng: E9 khai executor ui-check mà `cmd` trỏ khoá `executors.test` — fixed: trỏ `executors.script.cnk_man` như thước màn của HT2.
