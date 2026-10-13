---
slug: mo-lai-khong-tra-viec-chi-okr
at: 2026-10-13T00:41:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | Không ca nào có người cầm trịch vẫn nhận được việc mà người được giao bước hay người theo dõi lại không nhận được việc; ma trận vật × người giữ chỉ đo ô góc | Mã chỉ gỡ bước và lượt theo dõi bên trong nhánh đổi người cầm trịch vẫn qua E1–E5 và E8 5/5; kế hoạch do M cầm trịch mở lại vẫn trả bước và lượt theo dõi về A vai okr | Ca «cầm trịch đọc được» ở E1 với hai thông điệp ghim, cặp đột biến (f) lồng phần gỡ vào nhánh đổi cầm trịch, SO_CAP_KHAI 6 | fixed: AC-1 thêm Given thứ hai; E1 thêm ca «cầm trịch đọc được» với 'mlk: cam trich doc duoc ma buoc con trong tay vai okr' và 'mlk: cam trich doc duoc ma vai okr con theo doi'; AC-8 và E8 thêm (f), SO_CAP_KHAI = 6 |
| P1 | contract, evals | AC-5 đòi hai vết theo thứ tự, eval sắp theo (occurredAt, id); hai vết cùng giao dịch có thể trùng occurredAt và id không tăng dần | Mã đúng ghi bỏ xong rồi giao cùng mili giây; nửa số lượt E5 ném 'mlk: vet bo xong sai', E6 chập chờn — lớp «createdAt trùng» | Hợp đồng nói nguồn thứ tự, hoặc chỉ đòi đúng đa tập vết | fixed: AC-1 và AC-5 so vết như tập; E1, E5 so tập kind sắp theo chữ; E6 so đa tập đếm theo kind |
| P2 | evals | E1, E3, E5 không có chốt dương ở bước dựng; E5 không nói ai cầm trịch | doiVai thật gỡ lượt theo dõi làm phép kiểm theo dõi đúng sẵn và (c) không đỏ; E5 với A cầm trịch kế hoạch đang chạy bị setMemberRole chặn 409 ở bước dựng, người viết lách bằng đặt vai thẳng | Chốt dựng 'mlk: dung sai <khoá>' trước thao tác; AC-5 ghim M cầm trịch và đổi vai qua đường thật | fixed: E1 ca «chỉ OKR» và E5 đổi vai qua WorkspaceService.setMemberRole thật, M cầm trịch ở AC-5; chỉ ca «dữ liệu cũ» đặt vai thẳng (lượt theo dõi sót trước DA0a); E1, E3, E5 có chốt 'mlk: dung sai <khoá>'; đột biến (c) đo bằng ca «cầm trịch đọc được» có chốt dựng |
| P2 | evals | E7 gọi thước bằng đường không nói tính từ đâu; bun run test chạy với thư mục làm việc apps/api | Đường tương đối trỏ apps/api/_acceptance/…, thoát khác 0, E7 ném 'mlk: thuoc con viec mo sau mo lai' dù mã đúng | Đường suy từ import.meta.dir; chốt 'mlk: khong thay thuoc <đường>' | fixed: E7 khai đường từ gốc kho suy từ vị trí tệp bài kiểm và chốt tệp thước tồn tại |
