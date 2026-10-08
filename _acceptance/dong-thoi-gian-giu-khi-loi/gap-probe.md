---
slug: dong-thoi-gian-giu-khi-loi
at: 2026-10-08T10:14:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Design hứa làm mới hỏng ở trạng thái rỗng thì hiện thông báo trên khung rỗng, nhưng không có AC, dòng bảng trạng thái hay eval | Cá nhân chưa có hoạt động, ghi hoạt động đầu tiên, lượt làm mới hỏng: bản cài rơi vào nhánh rỗng không thông báo, lỗi đang thấy được thành lỗi hiện như rỗng, người ghi lại sinh bản trùng; E1–E6 vẫn xanh | Vế «hoặc đang ở trạng thái rỗng» cho AC-3 + ô rỗng cho E3 với đối chứng dương + chiều đỏ ghim «dtg: lam moi loi tren rong im lang» | fixed: AC-3 thêm vế trạng thái rỗng; E3 thêm ô rỗng, đối chứng dương và chiều đỏ ghim; bảng trạng thái thêm ST-dtg-rong-lam-moi-loi |
| P1 | evals | Vế «Xem cũ hơn quay lại khi còn trang» của AC-2 không có eval; E2(b) chỉ có ô hết trang, khẳng định âm thiếu đối chứng dương | Bản cài giữ cờ «đã lỗi» không đặt lại hoặc ẩn hẳn nút sau lỗi; không xem tiếp được trang thứ ba; E2 vẫn xanh | Ô (c) cho E2: trang c1 trả nextCursor c2 → CÓ nút, bấm thì cursor c2 + chiều đỏ ghim «dtg: xem cu khong quay lai» | fixed: E2 thêm ô (c) làm đối chứng dương cho ô (b), kèm chiều đỏ ghim |
| P2 | evals | «Đang tải thì Thử lại tắt, không gọi chồng» ở design mục 4 không có AC hay eval | Bấm Thử lại hai lần nhanh, trang c1 bị gọi hai lần; E2 vẫn xanh | Ô treo promise: nút disabled, bấm thêm số lần gọi tăng đúng 1 | fixed: AC-2 thêm vế đang tải thì tắt; E2 thêm ô (d) |
| P2 | evals | Thông báo làm mới (AC-3) không có ảnh 390 hay câu hỏi hội đồng | Alert làm mới tràn ngang ở 390 mà mọi eval xanh | Mở rộng E6 chụp lỗi làm mới ở 390, hoặc ghi rõ ngoài phạm vi | deferred: AC-6 ghi rõ thông báo làm mới chỉ đo bằng bài DOM; hai thông báo dùng cùng Alert + KaraRetry, chữ xuống dòng, E6 đo đúng thành phần đó ở 390 |
| P2 | evals | E4 đòi o.length 4 nhưng chỉ kể ba ô, người duyệt không kiểm được ô thứ tư có đụng hành vi mới không [zalo-va-cach-ly#F1] | Nếu một ô của bài K6b khẳng định khung lỗi sau isError có dữ liệu, bản cài đúng làm E4 đỏ | Ghi nguyên văn tên bốn ô và xác nhận không ô nào phụ thuộc nhánh lỗi-khi-có-dữ-liệu | fixed: E4 kể đủ bốn ô (loi, loi-sang-rong, rong, en), cả bốn ở nhánh chưa có dữ liệu hoặc thành công |
