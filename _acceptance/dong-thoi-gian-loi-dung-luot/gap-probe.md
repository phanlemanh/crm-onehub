---
slug: dong-thoi-gian-loi-dung-luot
at: 2026-10-08T17:20:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design, evals | Thiết kế coi mọi lần dataUpdatedAt đổi là một lượt tải xong; setQueryData hay maxPages phá giả định đó mà không ghi ra | Một lệnh ghi thẳng cache dòng thời gian làm dataUpdatedAt đổi, số trang giữ nguyên, nên cảnh báo làm mới tắt dù chưa làm mới được | Ô E3 dùng setQueryData, hoặc ghi giả định kèm grep | deferred: grep setQueryData/setInfiniteData trong apps/app/components, lib, app = 0 chỗ chạm khoá dòng thời gian và không dùng maxPages; giả định ghi vào design doc và Notes của hợp đồng, thêm lệnh ghi cache sau này phải xét lại |
| P1 | design, evals | Chưa nói mốc so sánh khi gắn và khi đổi khoá, chưa nói thứ tự xét khi cả hai dấu cùng mới | Quay lại tab đang lỗi trong cache (staleTime 30 s, không tải lại lúc gắn): lấy giá trị hiện tại làm mốc thì lỗi bị nuốt | Ô E4 quay lại tab với staleTime như app, chiều đỏ ghim | fixed: design ghi mốc «chưa thấy gì» khi gắn và đổi khoá, status quyết định nhánh xét; AC-4 thêm vế quay lại tab; E4 thêm ô staleTime 30000 và chiều đỏ «dtl: quay lai tab loi mat thong bao» |
| P1 | contract, evals | AC-1 hứa nút «Xem cũ hơn» ở trạng thái đang tải nhưng E1 ô a không đo nút | Bản cài ẩn nút hay để bấm được, fetchNextPage huỷ và gọi lại; E1 vẫn xanh | E1 ô a đo nút disabled và đếm lần gọi khi bấm thêm | fixed: AC-1 ghi nút bị tắt và bấm thêm không gọi chồng; E1 ô a đo disabled === true và số lần gọi cursor c1 vẫn là 1 |
| P2 | evals, contract | Ngưỡng hứa «0 lần thông báo sai hiện ra trong lúc đang tải» nhưng E1, E2 chỉ đọc DOM một lần [d-20261008T151355Z-8] | Bản cài render đầu đọc cờ thô rồi mới đổi, thông báo nháy một lần trước nhịp thứ 10; E1 vẫn xanh | MutationObserver đếm số lần chèn thông báo sai suốt lúc treo, so === 0 | fixed: E1 ô a và E2 ô a gắn MutationObserver từ lúc bấm/invalidate tới lúc giải promise, đếm === 0; AC-1, AC-2 ghi «không lúc nào» |
| P2 | design | Nhận lượt mới bằng dấu thời gian mili-giây; hai lỗi cùng mili-giây hay đồng hồ giả đứng thì không nhận | Lỗi làm mới và lỗi trang c1 cùng mili-giây trong bun, thông báo xem cũ không hiện, E1 đỏ chập chờn | Dùng errorUpdateCount, chạy dưới đồng hồ đặt lại | fixed: lỗi nhận bằng errorUpdateCount; mỗi bài đặt lại đồng hồ thật bằng setSystemTime() vì đồng hồ giả của tệp khác có thể rò sang |
