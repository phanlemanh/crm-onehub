---
slug: du-an-gantt
at: 2026-10-16T08:29:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design · contract · sổ | Hai lựa chọn chỉ người quyết được bị sổ ghi là máy quyết: chặn bằng 400 thay vì cho chồng rồi tô đỏ (câu trích chỉ gọi tên loại phụ thuộc), và kéo không bám ngày làm việc (lối bám không chết vì khung việc vẫn đặt được ngày nghỉ). Kèm lỗi thứ tự: AC-7 và E7b chạy «hạn A về 20/10» trước vế 400 «(hạn 23/10)» và vế A → E. Cùng lớp với [neo-thuoc-het-han#F1] và [e24-qua-han-khong-phai-ha-tang#F1]. | Chủ kho ký mà không thấy hai đánh đổi người dùng cảm rõ nhất; sau gộp phải sửa AC-5, AC-7, E5b, E7b. Chạy đúng thứ tự viết thì hai vế ném 'dg: dat som khong chan' và 'dg: tao phu thuoc khong doi'. | Hỏi-5 và Hỏi-6 nguồn chi-nguoi, supersedes hai dòng cũ; đặt lại thứ tự vế trong AC-7, E7b. | human-gate1: Hỏi-5 (thay d-20261016T082504Z-10) và Hỏi-6 (thay d-20261016T082504Z-11) lên thẻ Cổng Phạm vi; fixed: AC-7 và E7b nay chạy vế 400 và vế A → E khi hạn A còn 23/10, vế kéo sớm đứng sau. |
| P0 | design · contract AC-7, AC-10 · sổ | Tự dời chạy thay người kéo kể cả khi họ không sửa được việc sau — đánh đổi giá trị, không có dòng sổ, không có ô đo; lượt này lại không báo ai. | Người thực hiện việc đầu chuỗi kéo hạn lùi một tuần, việc của Q dời theo mà Q không biết; mã chặn hay cho đều qua mọi eval cũ. | Dòng sổ chi-nguoi; vế đo trong AC-7, E7b; đột biến E15. | human-gate1: Hỏi-7; fixed: AC-7 thêm vế «người kéo A không sửa được B thì B vẫn dời, vết ghi người kéo», E7b ném 'dg: tu doi doi quyen o sau', E15 thêm đột biến (s). |
| P1 | evals E12 · contract Đường đo | Đáp án thước suy biến (cả bốn trường bằng 1) nên không tách được các trường; vế «bỏ dữ liệu mẫu» bị bỏ không có dòng sổ. | nguoiTaoDat đếm dự án, duAnDatDu bỏ điều kiện mốc, duAnCoPhuThuoc trả duAnDat — cả ba vẫn xanh E12; Cổng Giá trị đọc sai. | Fixture bốn dự án, mỗi trường một đáp án khác nhau; ba đột biến; dòng sổ dữ liệu mẫu. | fixed: E12 dựng P1–P4 (đáp án 3 · 1 · 2 · 3), E15 thêm đột biến (o), (p), (q); dòng sổ muc-tieu trích CLAUDE.md «Dữ liệu mẫu không lên production.» |
| P1 | evals E10 · design mục Quyền | Bảng 63 ô không suy được từ thiết kế: mọi dự án dựng đều có lịch sử nên cột xoá không có ô thành công; chỗ của 409 trong thứ tự kiểm không ghim; cột mở lại không nói dự án phải đóng trước. | Lỗi «quản trị không xoá được» hay «người lạ xoá được dự án rỗng» lọt E10; hoặc E10 đỏ giả khi đoán 403 mà mã trả 409. | Ghim chỗ 409; khai trạng thái dựng theo cột; ô xoá thành công; đột biến xoá. | fixed: design ghi duAn.xoa kiểm quyền trước lịch sử; E10 khai trạng thái dựng từng cột, thêm hai ô xoá trên dự án có lịch sử (65 ô); E15 thêm đột biến (r). |
| P1 | evals AC-3, AC-5 | Không eval nào đo ô Bắt đầu, Hạn và nút «Đặt ngày» gửi đúng ngày lịch Việt Nam; E5b không ghim khuôn ngày. | DatePicker trả nửa đêm giờ máy, khách gửi toISOString thành 2026-10-19T17:00Z, máy chủ lưu sớm một ngày; E3, E5, E7b vẫn xanh vì gọi API bằng chuỗi. | E3b chạy dưới hai múi giờ; E5b ghim khuôn 'YYYY-MM-DD' và ca «Đặt ngày» ở 375. | fixed: thêm E3b (khoá dg_man_ngay chạy TZ=Asia/Ho_Chi_Minh và TZ=UTC), E5b ghim khuôn ngày và ca 375, E15 thêm đột biến (t). |

Ghi chú của người phản biện: trục «hai người cùng dời» chưa có AC — fixed: AC-7 và E7b thêm vế hai lần đổi cùng lúc (trả lời trong 5 giây, kết quả cuối đúng ràng buộc), coverage-scan Core mục 8 ghi trục này.
