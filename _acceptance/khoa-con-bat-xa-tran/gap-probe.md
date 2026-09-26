---
slug: khoa-con-bat-xa-tran
at: 2026-09-25T21:55:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-1 hứa cơ sở dữ liệu riêng nhưng lệnh E1/E2/E3 là `bun test` trần (dùng chung `crm_test`); không nói E1 chạy tách khỏi E2/E3. | S4 chạy E2/E3 cùng lúc với E1 trên cùng DB, tranh CPU và khoá hàng, `khoa-con-bat` vượt 1250ms ở một lượt — E1 đỏ giả; hoặc hàng rác của lượt bị cắt làm ca khác đỏ. | Script tự kiểm DB của lượt khác `crm_test`, in tên; E1/E2/E3 khai chạy không chồng nhau; đếm tiến trình `bun test` khác. | fixed: lệnh bọc `bun run test --` (DB riêng mỗi lượt), script từ chối DB `crm_test` với mã 2; E1/E2/E3 xin chung khoá mkdir của hồ sơ; mỗi lượt E1 in số tiến trình `bun test` khác đang chạy. |
| P1 | contract | Lời hứa là CI thôi chạm trần nhưng AC-1 chỉ đo tại chỗ và quy đổi bằng tỉ lệ đo trên tải tuần tự; E1 không khẳng định seed khác nhau. | Tại chỗ 0.75s, CI ít lõi nghẽn fsync khi 8 lượt ghi cùng hàng, ca vẫn 3–5s và chập chờn; không thước nào bắt. | E1b đọc log CI của sha đầu PR, khẳng định ≤ 2500ms; E1 khẳng định 10 seed đôi một khác nhau. | fixed: E1 khẳng định 10 seed đôi một khác nhau. deferred: giờ CI chỉ có sau khi PR chạy CI — đọc ở S5, ghi vào mô tả PR, sổ quyết định entry revisit. |
| P1 | evals | E2 chỉ có đột biến hụt lô (đổi số hàng), thông điệp nói «lệch số»; không đột biến nào cho thứ tự hay phía REST. | Bộ chia lô đẩy kết quả theo thứ tự xong, cùng độ dài: khẳng định chỉ so độ dài thì xanh dù ma trận sai. | Thêm đột biến đảo thứ tự, lô chồng, đột biến chỉ REST; so vector (tên, mã) giữa 8 lượt và 1 lượt. | fixed: khẳng định so trọn danh sách tên theo thứ tự (toEqual), thông điệp đổi thành «lệch danh sách», E2 thêm đột biến đảo thứ tự trong lô (cùng độ dài, cùng tập) và đột biến chỉ maTranRest. rejected (so vector 8 với 1 lượt): hangLot đòi đúng 403 + NOT_A_MEMBER cho từng hàng ngoài ngoại lệ, mã 500 do song song không thể bị đọc thành đã chặn. |
| P1 | evals | E5 chỉ đọc chữ ở chỗ gọi, không đo hành vi tuần tự; giới hạn 8 lượt không có thước; đếm «≥ 6». | Bộ chia lô bỏ qua tham số, Promise.all cả danh sách: chỗ gọi vẫn đúng chữ, E5 xanh, doi-chung-thanh-vien chạy thủ tục ghi song song, 230 lượt dồn vào pool 10. | Ca đo số lượt cùng lúc lớn nhất: mặc định = 1, LO_SONG_SONG = đúng nó và ≤ 8, chiều đỏ có thông điệp ghim; danh sách chỗ gọi viết sẵn. | fixed: thêm ca theo-lo đo số lượt cùng lúc lớn nhất (mặc định 1, LO_SONG_SONG đúng giá trị và ≤ 8) với đột biến bỏ qua tham số làm đỏ có thông điệp ghim; E5 dùng danh sách chỗ gọi viết sẵn, tổng đúng 6. |
| P2 | evals | E4 bỏ qua script test của apps/api/package.json và lệnh test trong workflow; đếm test( kiểu ≥ 17. | Thêm `--timeout 15000` vào script test: CI xanh nhờ trần cao, E4 và E1 vẫn xanh. | Soi mọi script có `bun test` và các dòng run của ci.yml, acceptance.yml; tự kiểm chiều đỏ trên package.json; số test( đúng bằng số testcase. | fixed: E4 soi script của apps/api/package.json và dòng run của ci.yml, acceptance.yml; tự kiểm chiều đỏ trên package.json; số test( ghim đúng 18. |
