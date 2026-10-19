# Gói đợt viec-du-an-kho-tai-lieu — làn M5

Làn M5 trong lộ trình ba làn (#487, chủ kho 19/10): Việc–Dự án và Kho tài liệu, cộng VS8. Gói theo khuôn §4.1 của kit:
`dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ lộ trình qua `nguon_hang`. Chủ kho duyệt hàng,
Cổng Đáng (`build`) và quyền tự merge ở thẻ khởi tạo của `/dieu-phoi:mo-dot viec-du-an-kho-tai-lieu`, không phải ở đây.

## Mở đợt

1. crm đã ở kit 2.33.0 (#483); mở từ một PHIÊN MỚI trên M5 để nạp bản đó.
2. Hai vòng đi trước đợt, chạy ngoài gói: DA11 (sửa gấp, #490 đã gộp 19/10) và l5 (nhận #410, đã ký Cổng 2). Mở đợt
   sau khi #410 gộp, để VS8 đứng trên `record-sheet` đã có l5 (luật 20).
3. Vai gọi lượt gộp vẫn ở `vk · Giám sát (Mac Studio)` (luật 26).

## Dãy

| Dãy | Hàng (theo thứ tự) | Mốc | Ghi chú |
|---|---|---|---|
| V1 | DA12 vá Gantt: lịch bảy ngày, dự án 300 việc | 24/10 | Gom hạt giống ô chọn dự án 375 nếu cùng vùng (luật 23) |
| R1 | VS8 ngăn bản ghi không dựng lại khi mở, đóng | m-1022vs, 22/10 | Sau khi #410 gộp (luật 20) |
| K1 | l7 Zalo câu thứ hai → MH4 model theo vai → MH2 model mặc định | 30/10 | l7 là T3; MH4, MH2 sau lời dặn Kara (luật 21, 22) |

Mỗi dãy một vòng một lúc; toàn máy một lượt S4 một lúc (luật 9). Không vào đợt: E4b (chờ điều kiện, chưa có mốc —
luật 24).

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.
