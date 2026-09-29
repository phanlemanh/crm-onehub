---
slug: trang-chua-de-xuat-mo-duoc
at: 2026-09-29T10:12:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Thứ tự ưu tiên của `dangCho` không có trong AC-4; ma trận E4 không có trang mang hai dấu hiệu, chiều đỏ ghim ca không được gieo; không ô nào cho nguồn đã soạn xong. Gần [khep-ky-okr#F1]. | Bản đầu bị trả lại rồi «Soạn lại»: nguồn `DANG_SOAN` + bản `TRA_LAI`; bản cài xét `TRA_LAI` trước → màn báo «bị trả lại» khi máy đang soạn; E4 vẫn xanh. | AC-4 nêu thứ tự; E4 thêm bốn trang ghép, một ô cho mỗi giá trị `TRANG_THAI_NGUON` nhập từ hằng, số khẳng định = số ô; chiều đỏ ở ô `TRA_LAI` + `DANG_SOAN`. | fixed: AC-4 thêm vế thứ tự ưu tiên; E4 thêm trang ghép (a)–(d) + hai nguồn, ô cho từng `TRANG_THAI_NGUON` kể cả `DA_SOAN`, chiều đỏ ghim `tra-lai-roi-soan-lai`; design doc nói rõ `DA_SOAN` không là dấu hiệu chờ |
| P1 | evals | AC-6 (cross-layer) hứa gõ, gửi duyệt rồi màn đọc báo chờ duyệt; E6 gọi thẳng API, E6u dừng ở trình soạn trống. Gần [bo-dung-khong-ket#F1]. | `ManSoan` với `banGoc` rỗng khoá nút gửi, gửi sai khuôn, hay không làm mới cache `taiLieu.get` → người dùng không gửi được bản đầu mà cả E6 lẫn E6u xanh. | E6u thêm bước 4: gõ chuỗi mốc, «Gửi duyệt», về màn đọc có chữ chờ duyệt, CSDL có đúng một bản `banGocId` null; chiều đỏ có ghim. | fixed: AC-6 thêm vế «về màn đọc báo chờ duyệt mà không tải lại»; E6u thêm bước 4 và chiều đỏ `--chieu-do=4` bỏ làm mới cache |
| P1 | contract | Chiều ngược trang → nguồn không được hứa: `get` trả `choLanDau.nguon` cho mọi người thấy trang, «Xem nguồn» dẫn tới dòng mà `dieuKienThayNguon` có thể giấu. Gần [may-soan-de-xuat#F1]. | Người thấy trang mà không thấy nguồn bấm «Xem nguồn» → neo chết, tên tệp và lý do lộ cho người luật nguồn giấu. | AC-2 thêm vế: `choLanDau.nguon` khác null ⇒ nguồn có trong `taiLieuNguon.list` của chính người đó, ngược lại `nguon: null`; E2 quét 36 ô; chiều đỏ có ghim. | fixed: AC-2 thêm vế; design: `nguon` chỉ trả khi người xem thấy nguồn theo `dieuKienThayNguon`, `dangCho` vẫn tính trên nguồn mới nhất; E2 thêm quét 36 ô và chiều đỏ (b) ghim `nguon khong thay: tao loi` |
| P2 | evals | AC-7 hứa không cuộn ngang ở 390 nhưng E7u chỉ đo trang máy đang soạn; `go-tay`, `loi` có hai nút, tên tệp và lý do dài chỉ được chụp ảnh. | Tên tệp liền không dấu cách đẩy khung `loi` rộng quá 390; E7u in «đạt», E9j không thấy phần bị cắt. | E7u lặp bốn trạng thái với tên tệp và lý do dài, bốn khẳng định `scrollWidth <= clientWidth`; chiều đỏ có ghim. | fixed: AC-7 nói rõ bốn trạng thái và chữ dài; E7u bước 2 lặp bốn trang, chiều đỏ `--chieu-do=2` ghim `cuon ngang loi-390` |
| P2 | evals | `lyDo` của nguồn `LOI` do phép đo tự đặt, không đi qua bên ghi của máy soạn. Gần [toan-canh-okr#F1]. | Máy soạn để `lyDo` null hay ghi cột khác → E4 xanh, production hiện «Nguồn X: » trống lý do. | E4 đi qua hàm đánh dấu thất bại của máy soạn, khẳng định `lyDo` khác rỗng. | rejected: bên ghi `LOI` + lý do đọc được đã có thước của `may-soan-de-xuat` AC-10 (`msd_soan_hong`, chạy trong `apps/agent`); test API không nhập được mã `apps/agent`. Màn vẫn chịu `lyDo` null: E5 thêm ô `loi` không lý do chỉ hiện tên tệp |
