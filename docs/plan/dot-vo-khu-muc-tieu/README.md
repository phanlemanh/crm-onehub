# Gói đợt vo-khu-muc-tieu — làn Mac Studio

Làn Mac Studio trong lộ trình ba làn (#487, chủ kho 19/10): Vỏ khu Mục tiêu (đợt `okr-vo-khu-1810`, #478) trước, OKR xếp
sau ở đợt kế. Gói theo khuôn §4.1 của kit: `dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ lộ
trình qua `nguon_hang`. Chủ kho duyệt hàng, Cổng Đáng (`build`) và quyền tự merge ở thẻ khởi tạo của
`/dieu-phoi:mo-dot vo-khu-muc-tieu`, không phải ở đây.

## Mở đợt

1. crm đã ở kit 2.33.0 (#483); mở từ một PHIÊN MỚI để nạp bản đó.
2. Không đợt nào của Mac Studio đang chạy (r2 đóng 17/10).
3. Phiên mở đợt nhận luôn vai gọi lượt gộp trên #375 (luật 26).

## Dãy

| Dãy | Hàng (theo thứ tự) | Ghi chú |
|---|---|---|
| V1 | VK1 thanh bên khu → VK2 vỏ Mục tiêu (+DH11) → VK3 Bộ OKR → VK10 chế độ Soạn → VK8 hàng số | Đường găng của mốc |
| V2 | VK4 đổi nhãn → VK5 chữ máy sinh → DH12 khung chờ một hình → DH13 lọc không tự đóng | VK4 gộp trước VK2 (luật 21) |
| V3 | sau VK2: VK6 sơ đồ → VK9 một nút tạo → VK11 mọi KR → VK12 cập nhật gần đây → VK7 ngăn KR | VK7 sau VS8 của M5 (luật 20) |

Mốc chung: `m-1026vk` Vỏ khu Mục tiêu, 26/10 (hệ số 10 giờ máy mỗi vòng). Không vào đợt: OKR xếp sau (DH2 Ngoài đã thành
DH12, DH13 ở V2; 7n → 10 → 8b, L → T, K5 + K7b, VS11, K7c) — đợt kế của làn Mac Studio sau mốc này.

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.
