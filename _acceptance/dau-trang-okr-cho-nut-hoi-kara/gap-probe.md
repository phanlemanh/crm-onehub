---
slug: dau-trang-okr-cho-nut-hoi-kara
at: 2026-10-16T00:30:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-3 không có ca khung chờ bị gỡ giữa lúc okr.hoiMo còn chạy; AC-3 đi qua máy chủ mà không mang tag cross-layer | Dữ liệu tới trước khi hoiMo trả về, khung chờ bị gỡ, cột hỏi không mở; người bấm lại thành hai cuộc hỏi; E3 vẫn xanh | Ca «bam roi du lieu toi» giữ lời trả, gỡ khung chờ, dựng nút mới, rồi thả; đòi hoiMo đúng 1 lần và record=hoi-okr | fixed: AC-3 thêm vế khung chờ bị thay giữa chừng; E3 thành ma trận 2 ô (dung-yen, go-giua-chung) có ghim. rejected vế cross-layer: vòng này không đổi máy chủ, lời gọi okr.hoiMo y như khi đầu trang đã tải xong và đã được đo ở hồ sơ hoi-dap-okr |
| P1 | evals | AC-4 hứa bộ kiểm nút hỏi đáp chạy không sửa nhưng không eval nào đo vế đó | Thợ đổi nut-hoi-kara.tsx và sửa kỳ vọng bộ kiểm hỏi đáp; E4 vẫn xanh | Neo git diff trên tệp kiểm của nút hỏi đáp rồi chạy chúng | fixed: kho không có bộ kiểm DOM riêng cho nút hỏi đáp; AC-4 đổi thành «không commit nào của vòng chạm nut-hoi-kara.tsx hay hai tệp kiểm khung-man-chung», E4 thành script khong-sua.mjs đo đúng điều đó, có chiều đỏ |
| P1 | design | Dòng sổ mot-loi chỉ loại ô xương cỡ cố định; lối «nút thật nhưng khoá lúc chờ» chưa bị loại, nên việc cho bấm lúc chờ là máy chọn mà sổ không ghi | Người ký Cổng 1 tưởng chỉ có một lối, việc tạo cuộc hỏi lúc chờ lọt cổng không ai hỏi | Dòng sổ riêng cho «bấm được lúc chờ» hoặc đổi AC sang khoá | fixed: dòng sổ approach mới cho «bấm được lúc chờ», lối khoá bị loại vì docs/design.md đòi một dòng nói vì sao cho nút khoá; rủi ro bấm sớm được đo ở E3 go-giua-chung |
| P2 | evals | AC-2 hứa nút lúc chờ cùng chữ, cùng dấu Kara như khi xong; E2 chỉ đo chữ | Khung chờ dựng biến thể nút không dấu Kara; E2 và E1 vẫn xanh, nút nhảy hình khi tải xong | So outerHTML nút khung chờ với NutHoiKara dựng riêng | fixed: E2 thêm phép so outerHTML, ghim «dto-cho <ngôn ngữ>: nut giong luc xong» |
| P2 | evals | E4 neo «vòng này» bằng merge-base với origin/onehub, rỗng sau khi gộp [neo-thuoc-het-han#F1] | Sau gộp, một PR khác sửa kỳ vọng khung-man-chung mà E4 vẫn xanh rỗng | Neo cố định | fixed: E4 lấy commit của vòng bằng git log --no-merges --grep=<slug> (khuôn AC-6 của neo-thuoc-het-han), không dùng merge-base; không thấy commit nào → KHONG DO DUOC thoát 2 |
