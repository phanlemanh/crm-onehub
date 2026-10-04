---
slug: soan-okr-khong-tru-luot
at: 2026-10-04T06:52:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design, contract, evals | Câu «Lượt này không bị tính» là lời hứa quan hệ với soLuot, nhưng lyDoHong chỉ đọc status | Lượt đã tính rồi luồng GET hỏng, hay trình duyệt mất mạng sau khi POST tới cửa — màn vẫn nói «không bị tính» | Ma trận câu × soLuot; ô POST 202 rồi luồng hỏng | fixed: cửa trả `luot: "da-hoan"` chỉ khi hoanLuot thật sự trừ; lyDoHong trả { ma, daHoan }; câu khongTinh tách dòng, chỉ hiện khi daHoan; mã mat-mang riêng; AC-1, AC-2, AC-7, AC-8; E1, E2, E7, E8 |
| P1 | contract, evals | Ngưỡng CHẾT đã ký nói «còn một ca hỏng phía agent vẫn trừ lượt», mà Đường đo không nêu turn.failed và ca Trợ lý treo | Gateway hết ngân sách hay Trợ lý treo tới hết thời hạn hàm — lượt vẫn mất, Cổng Giá trị đọc CHẾT dù mọi eval xanh | Dòng Đường đo nêu tên hai ca; hoặc AC thời hạn chờ | fixed (ca treo): CUA_OKR.choTroLyMs, quá hạn → 504 tro-ly-okr-qua-han và hoàn; AC-1 thêm kết quả thứ 11, AC-4 phân biệt người huỷ với thời hạn; E1, E4. human-gate1 (turn.failed): dòng «Ngoài đường đo» trong contract — chủ kho chọn ký lại ngưỡng hẹp hay nới sang apps/agent-okr |
| P1 | contract, evals | Các lần «Thử lại» mà lyDoHong trả null (từ chối lượt có tên, chưa cấu hình) không có lời hứa đổi câu | Bấm Thử lại khi đã hết lượt → nếu chỗ báo lỗi chung còn nguyên thì vẫn là đường im mà E8 xanh | E8 rút ca từ CUA_OKR.trangThaiTuChoiLuot lúc chạy | fixed: AC-8 thêm vế — ca từ chối có tên và chưa cấu hình thì chỗ báo lỗi chung biến mất, thông báo có tên hiện; E8 rút ca từ hằng, sàn viết tay |
| P2 | evals | E9 khẳng định soLuot = 0 không có đối chứng dương; không chứng minh màn đã gửi POST lượt | Màn không tự gửi lượt hoặc bộ đo đọc nhầm kho → soLuot = 0 đúng tầm thường | Đếm POST qua nghe mạng; chiều đỏ phải thấy soLuot = 1 | fixed: AC-9 và E9 đếm POST /session, in tên kho phiên đo; --kiem-do-do với máy giả 202 phải thấy soLuot = 1 |
| P2 | design, evals | Dòng cảnh báo hoan-luot-hong không được đo; mock một phần trong cùng tệp với 44 ô hàm thật | Cửa nuốt im lỗi hoàn; hoặc mock rò sang ô khác tuỳ thứ tự nạp | Spy console.error; tệp riêng; --randomize --seed | fixed: ô hoàn-hỏng và ca khong-ghi-duoc-phien sang tệp riêng soan-okr-hoan-hong.spec.ts; spy console.error đúng 1 lời gọi; lệnh chạy mỗi tệp hai seed |
