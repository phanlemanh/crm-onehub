---
slug: da-luu-tru-tai-loi
at: 2026-10-08T09:00:56Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design | Chia theo isError/isPending làm khung lỗi biến mất lúc tải lại, vì TanStack Query đưa truy vấn chưa có dữ liệu về pending, error null khi refetch | Bấm Thử lại thì khung lỗi nháy sang khung xương, nút không còn để khoá; E3 hoặc đỏ oan hoặc xanh nhờ useQuery giả | Thiết kế ghi cờ giữ khung lỗi; E3 chạy QueryClient thật; E6 thêm ô đang-thử-lại | fixed: thiết kế giữ khung lỗi khi chưa có dữ liệu và errorUpdateCount > 0, nút khoá theo isFetching; AC-3 hứa khung lỗi còn lúc tải lại; E3 dòng 1 ghim «khung lỗi nháy sang khung xương», chạy QueryClient thật; E6 thêm ô dang-thu-lai-1440 |
| P1 | evals | E6 chặn theo chuỗi URL mà client tRPC gộp yêu cầu (httpBatchLink) | Chặn lô có cả giaiDoan.list làm lỗi cả trang, ô SAI giả hoặc người chấm nhận nhầm khung lỗi của trang | Tiền đề: yêu cầu bị chặn chỉ mang đúng giaiDoan.archived, đi chung lô thì mã 2; ghim đủ 3 thẻ và không có lỗi của trang; trần chờ đủ lần thử lại | fixed: E6 thêm tiền đề không đo được khi đi chung lô, ghim ba thẻ và không có loiTai của trang ở mọi ô, chờ khung lỗi tới 20 giây (app thử lại 1 lần với 5xx) |
| P2 | contract | AC-6 hứa nằm trọn trong khung nhìn và thử lại ở cả hai khổ, E6 chỉ đo ngang và thử lại ở 1440 | Người chấm đọc AC nghĩa đen REJECT, hoặc thiếu ô 375 cho vế thử lại | Sửa AC hoặc thêm ô | fixed: AC-6 nói «sau khi cuộn tới cuối trang… không tràn ngang», vế thử lại chỉ ở 1440; E6 loi-375 cuộn tới cuối |
| P2 | contract | AC-1 hứa lưu trữ được khi khung lỗi hiện nhưng E1 chỉ đo tay kéo | Bản cài khoá hành động theo isError mà E1 vẫn xanh | Thêm dòng E1: Lưu trữ gọi archive 1 lần, khung lỗi còn | fixed: AC-1 nói rõ lưu trữ giai đoạn trống gọi giaiDoan.archive đúng một lần; E1 dòng 6 |
| P2 | contract | Đường đo phiên nghiệm thu không nói giả lập lỗi tải bằng cách nào | Tới phiên nghiệm thu không dựng được trạng thái lỗi, ngưỡng CHẾT không đo được | Ghi cách dựng lỗi ở mục Đường đo | fixed: Đường đo ghi người điều phối chặn URL giaiDoan.archived trong DevTools của máy thử, không báo trước, và câu hỏi sau phiên |
