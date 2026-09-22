---
slug: khuon-mat-bo-phan
at: 2026-09-22T01:40:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Hàm chặn lưu trữ bộ phận (khuôn đang dùng còn nhắc) được viết lại trên hàm quét mới nhưng không tiêu chí nào giữ luật đó, dù Coverage gạch ô «đã lưu trữ × khuôn đang dùng» dựa vào nó | Viết lại làm rơi cờ đã lưu trữ, lưu trữ B thành công khi khuôn đang dùng còn nhắc B; E1–E5 vẫn xanh vì fixture lưu trữ khuôn trước | Thêm luật chặn lưu trữ vào AC-5 và chạy lại bài kiểm api-chan-luu-tru | fixed: AC-5 thêm luật chặn lưu trữ; thêm E6 chạy slt_api_chan_luu_tru |
| P1 | contract | Dòng feature hứa «khuôn đã lưu trữ luôn khôi phục được», trong khi khuôn đã mồ côi từ trước vẫn 404 và AC-2 buộc khôi phục bộ phận trước | Người duyệt tin khuôn đã kẹt trên prod sẽ được cứu; thử lại sau gộp vẫn 404 | Viết lại dòng feature theo hướng chặn xoá | fixed: dòng feature viết lại, nói rõ khôi phục được sau khi khôi phục bộ phận; Out of scope giữ khuôn mồ côi cũ |
| P2 | evals | Thông điệp chỉ hai lối (xoá khuôn trước, bỏ bộ phận khỏi khuôn) nhưng E3 chỉ đo lối một | Làm theo lối hai mà hàm quét đọc bước cũ, purgeable vẫn false, thông điệp thành chỉ dẫn sai | Thêm lối b vào E3 bằng updateTemplate thật | fixed: AC-3 và E3 đo cả hai lối |
| P2 | evals | Không ca nào có một bộ phận nằm trong hai khuôn đã lưu trữ | Bản đồ ghi đè một khuôn mỗi bộ phận, xoá một khuôn làm bộ phận thành xoá được trong khi khuôn kia còn nhắc — đúng lỗi gốc | Ca hai khuôn: thông điệp nêu cả hai, xoá K1 vẫn chặn và nêu K2 | fixed: AC-1 và E1 thêm ca hai khuôn, chiều đỏ ghim «B2 con trong K2 sau khi xoa K1» |
| P2 | contract | Design khẳng định màn làm mới danh sách bộ phận sau khi xoá khuôn nhưng không phép đo nào giữ điều đó | Xoá K xong nút của B không hiện vì danh sách bộ phận không làm mới; E3 xanh vì gọi API thẳng | Bài kiểm useLamMoiDieuPhoi làm mất hiệu lực listDepartments | deferred: vòng không đổi mã màn; lam-moi.ts đã làm mới cả hai danh sách từ vòng trước; Notes ghi rõ không có phép đo máy, phép thử là chủ kho thử lại đường dọn sau khi gộp |
