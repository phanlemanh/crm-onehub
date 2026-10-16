# Quét không gian AC — lam-moi-goi-y-ke-hoach

Preset: entity-feature (thực thể: lần đổi giai đoạn của một deal, nhìn từ thẻ gợi ý trên sheet).

## Trục

| Trục | Giá trị | Thước đủ |
|---|---|---|
| A. Đường đổi giai đoạn | thanh giai đoạn · menu đầu sheet · hộp lý do thua · ô giai đoạn ở bảng · Kanban · hàng loạt · lưu trữ/sửa giai đoạn | grep `deals.setStage` · `deals.bulkSetStage` · `cache.deal(` trong `apps/app` (bảng ở design doc mục 2) |
| B. Chiều chuyển | mở→thắng · thắng→mở · thắng→thua · thắng→thắng khác cột | thẻ chỉ có hiện/ẩn; máy chủ quyết sinh gợi ý (DA3b AC-1) |
| C. Phạm vi làm mới | deal này · deal khác · mọi deal | chữ ký `cache.deal(id?, options?)` |
| D. Nhịp | chờ (`record`) · nền · `settle: "record"` | hàm `run` của `cache.ts` |
| E. Lớp chứng | DOM thật với cache thật · màn thật trên bàn đo · đột biến | luật đo của kit |

## Ô

| Ô | Xếp | AC |
|---|---|---|
| A thanh giai đoạn × B mở→thắng × E DOM | Core | AC-1 |
| A menu × B mở→thắng × E DOM | Core | AC-2 |
| A thanh + menu × B thắng→mở × E DOM | Core | AC-3 |
| C ba giá trị × D chờ + settle record | Core | AC-4 |
| A Kanban · hàng loạt · lưu trữ · hộp lý do thua | Core qua AC-4 (cùng lệnh) | AC-4 |
| E đột biến | Core | AC-5 |
| A thanh × B mở→thắng→mở × E màn thật | Core | AC-6 |
| B thắng→thắng khác cột | Never — máy chủ không sinh gợi ý mới, thẻ giữ nguyên là đúng | — |
| Đẩy thời gian thực khi gợi ý sinh từ nơi khác | Later | Out of scope |
| Làm mới khi tạo kế hoạch từ trang khác | Later | Out of scope |
