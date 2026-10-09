---
slug: ci-ma-tran-ba-o
at: 2026-10-09T00:29:34Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | contract, evals | Không gì so ci.yml mới với ci.yml hiện tại của onehub; E1 liệt sẵn env, E3 không so khoá cấp gốc | Một PR đổi ci.yml trên onehub sau khi nhánh thử rẽ ra bị chép đè ngầm; E1, E3 vẫn xanh | E1 rút env, lệnh run, khoá cấp gốc từ merge-base với onehub | fixed: E1 rút ba thứ từ ci.yml ở merge-base (không liệt tay), thêm chiều đỏ bỏ GOOGLE_CLIENT_ID; đo 09/10: onehub không đổi ci.yml kể từ gốc nhánh thử (git diff 341a9d6c1^ origin/onehub rỗng) |
| P1 | contract | Ngưỡng 7 ngày chưa có thước đọc được; huỷ vì trần lẫn với huỷ vì đẩy chồng; thiếu luật khi ít lượt | Phiên UAT tự chế thước, đọc CHẾT giả hoặc sót lượt hết trần | Script đo định nghĩa sẵn, chạy được trên dữ liệu thật | fixed: thêm AC-6 và E5 rang/do-7-ngay.mjs (lượt xanh = ci-ok success; huỷ vì trần = cancelled dài ≥ trần − 1′; < 10 lượt = chưa đủ mẫu); Đường đo trỏ script này |
| P1 | evals | E2 gọi turbo thẳng, bỏ qua đường test-run.ts mà CI chạy; tập gói từ glob viết sẵn | test-run.ts làm rơi bộ lọc thứ hai, @crm/ui không chạy ở ô nào mà E2 xanh | Hai nguồn: đường CI thật và log thật của #323; tập gói từ workspaces | fixed: E2 lấy tập gói từ workspaces, đo qua đường bun run test -- và log thật của hai lượt #323, chiều đỏ app-ui chỉ còn --filter=app |
| P2 | evals | E3 cần commit 341a9d6c1 còn với tới được, mà #323 sẽ đóng | Sau khi xoá nhánh thử, E3 đỏ «bad object» ở lượt ghim lại | Bản chép trong rang/ kèm blob sha ghim | fixed: E3 đọc rang/ci-323.yml, kiểm git hash-object khớp c4c5f58e… |
| P2 | contract | Giả định số 3 (kéo release giữ bản OneHub không mất sửa của hãng) không có AC | Lần kéo release kế tiếp mất một biến env của hãng | E6 merge-tree, hoặc chấp nhận không đo | fixed: ghi vào Out of scope «chấp nhận không đo ở vòng này» — anh xác nhận ở Cổng 1 |
