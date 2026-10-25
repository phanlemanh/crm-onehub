---
slug: tieu-diem-sau-hop-xoa-tin-hieu
at: 2026-10-24T07:18:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-20261024T065710Z-6) | Dòng bỏ bản mẫu thiết kế ghi máy quyết theo nguồn một-lối, nhưng ràng buộc nêu không đúng: bản mẫu dựng được ca «vừa lấy về» bằng dữ liệu giả; bỏ hay giữ khoảnh khắc nhìn trước duyệt là đánh đổi của người [chi-tiet-cong-ty-hai-cot#F1] | Chủ kho duyệt bằng chữ một hành vi mắt thấy được, lần đầu thấy ở ảnh Cổng Bằng chứng; muốn chỗ đứng khác thì phải mở vòng hai | Thay dòng 6 bằng một dòng Hỏi kèm khuyến nghị; thẻ Cổng Phạm vi có câu hỏi một chạm | human-gate1: dòng d-20261024T070103Z-8 thay dòng 6, nguồn chỉ-người, khuyến nghị bỏ bản mẫu — anh trả lời ở Cổng Phạm vi |
| P1 | contract | Thiếu ô người dùng tự dời tiêu điểm trong lúc chờ rồi xoá xong; sổ chưa chọn giữa kéo về dòng kế và để yên | Người làm áp điều kiện để-yên của ca hỏng cho cả ca xoá xong mà E5 vẫn xanh; Cổng Phạm vi duyệt mà không biết hành vi này | Dòng sổ chốt hành vi, thêm When vào AC-4, thêm ô tu-doi-roi-xong vào E4 có chiều đỏ ghim | fixed: dòng d-20261024T070103Z-9 giữ hành vi TH6 đã ký (căn cứ hợp đồng TH6 AC-5); AC-4 thêm When xoá xong; E4 thêm ô tu-doi-roi-xong × {375, 1280} với chiều đỏ «xoa xong khong toi dong ke» |
| P1 | evals (E6) | Mười ô dùng chung một bộ tín hiệu, nhắm dòng theo vị trí; bước chấm ảnh hỏi mã đích không có trong inputs | Ô lay-ve biến dòng giữa thành đã lấy về, ô sau không xoá được; người chấm ảnh không biết vòng sáng đúng mã nào | Mỗi ô tự gieo dữ liệu, nhắm theo mã, ghi evidence/o.jsonl vào inputs | fixed: mỗi ô một người gửi riêng tự gieo ba tín hiệu (trần 10 tín hiệu mỗi ngày mỗi người), nhắm theo mã, dòng ĐÚNG/SAI in mã đích và mã tiêu điểm, evidence/o.jsonl vào inputs và bước chấm ảnh |
| P2 | evals (E4) | Ô cho-dung-yen không kiểm tiêu điểm nằm trong bản đang hiện | Ở 375 tiêu điểm vào bản bảng đang ẩn, happy-dom vẫn xanh, Chrome thật rơi về đầu trang | Thêm khẳng định bản đang hiện và chiều đỏ trỏ bản đầu DOM | fixed: E4 gia lập bản đang hiện như E1, thêm khẳng định và chiều đỏ «tieu diem toi ban an» |
| P2 | evals (E2, E6) | Vế «Xoá khoá kèm lý do» chỉ đo trên mẫu tự dựng, không round-trip từ máy chủ thật | Lần làm mới tại chỗ sau 409 vẽ lại dòng làm menu không khoá; E2 và E6 vẫn xanh | Ô lay-ve của E6 mở menu từ tiêu điểm ngay sau làm mới, không tải lại | fixed: ô lay-ve-<w> của E6 nhấn Enter trên tiêu điểm sau khi ổn định, không tải lại, kiểm mục Xoá khoá và dòng lý do lấy từ tệp lời |
