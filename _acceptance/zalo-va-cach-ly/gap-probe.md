---
slug: zalo-va-cach-ly
at: 2026-10-07T21:05:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract + evals + design | Đếm bài lệch: khối cau-chao có 4 bài, dời 2 bài + 1 hàm; AC-3, AC-4, feature, E3, E4 nói ba bài | Làm đúng design thì E3 đòi 3 bài đỏ; thêm bài thứ ba thì E4 nguyên văn đỏ | Chốt con số từ bản ghim, E3 đọc số pass từng lệnh | fixed: feature, Context, AC-3, AC-4, Coverage, design ghi 2 bài + hàm; E3 đòi hai dòng «2 pass»; E4 bốn mục nguyên văn (hai bài, hàm, spec agent) |
| P1 | contract AC-3 + evals | Không eval nào kiểm import của tệp app mới — có thể chép tay hằng | Tệp app khai const khungUngDungMessages tại chỗ; thân bài trùng byte, E3/E4 xanh mà phép kiểm tách khỏi nhãn thật | E4 kiểm đúng ba import + không tự khai; chiều đỏ thay import bằng hằng | fixed: AC-3 thêm vế «chỉ lấy qua ba dòng import»; E4 kiểm import đúng nguồn + không const/let/function trùng tên; E5 đột biến (3) |
| P1 | contract AC-1 + E1 | Vế «không nới luật» không có thước | Thêm miễn trừ hoặc sửa luật bỏ qua test → do-cay thoát 0, E1 xanh | git diff scripts/luat-kho theo sha | fixed (đổi thước): E1 đòi dòng tự kiểm «DUNG pha-test-cua-agent-nhap-app-khong-phai-nest» và «XANH cach-ly-hai-agent» không kèm «(nen …)»; không dùng git diff theo sha vì tự hết hạn khi V2L/F10 sửa luat-kho |
| P2 | evals E4/E5 | Chiều đỏ chỉ phủ phía app; đột biến không áp được bị báo nhầm | Bộ so agent viết thành tập con; agent mất một expect mà E4 xanh [thu-lai-sau-45-giay#F1] [nen-kara#F1] | Đột biến phía agent; kiểm đột biến áp đúng một lần | fixed: E4 so bằng; E5 ba đột biến (app, agent, import), mỗi cái phải áp đúng một lần (không → mã 2) |
| P2 | opportunity + contract | Ngưỡng «ghim lại soan-okr-cung-tro-ly xanh» chỉ ở Notes | do-cay xanh nhưng làn ghim lại vẫn đỏ ở eval khác; hồ sơ qua mà F13/K2 vẫn kẹt | AC-6 hoặc ghi rõ đo ngoài hồ sơ | fixed (ghi rõ): Notes khai ngưỡng đo ngoài hồ sơ bằng làn ghim lại ở đỉnh trước mo_merge; đỏ thì không mở PR |
