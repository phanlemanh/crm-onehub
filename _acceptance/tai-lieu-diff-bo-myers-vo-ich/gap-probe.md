---
slug: tai-lieu-diff-bo-myers-vo-ich
at: 2026-09-28T14:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | contract | «Đúng từng byte» dựa vào đếm đa tập, nhưng sáu fixture đều gồm khối khác nhau từng đôi. | Bản cài đếm phần chung theo tập khoá riêng biệt. Một tài liệu thật có nhiều khối lặp và vài chỗ sửa bị tính `L` vượt trần sai, nên rơi về `theoKhoi` và đổi `diffHash`, trong khi E1 vẫn đủ sáu pass. | Fixture thứ bảy `lap-khoi` và đột biến «đếm theo tập» trong E3. | fixed: thêm `lap-khoi` (1 500 khối, 1 400 khối cùng một câu, sửa 10 khối) vào AC-1/E1, hash ghim từ bản sao mã `cfac5bea`; đã thử đột biến `con.set(khoa, 0)` trên bản mẫu: lọt qua sáu fixture cũ, lệch `lap-khoi`. Thêm trục «cách tính L» vào Coverage. Vế «bằng theo giong mà khác chuỗi thô» không áp dụng: `giong` so nguyên chuỗi `kieu` và `chu`, khoá `JSON.stringify([kieu, chu])` đơn ánh. |
| P1 | evals | E4 và E8 so với merge-base, một mốc trôi. | Sau khi merge, merge-base đã chứa bản sửa. Vòng sau chạm `tai-lieu-diff.ts` làm E4 đỏ giả («không nhanh hơn gốc») hoặc xanh rỗng. | Neo cả hai vào `cfac5bea`, tự kiểm gốc chưa chứa bản sửa. | fixed: AC-4, AC-7, E4, E8 neo `cfac5bea`; E4 thoát 2 «goc so da chua ban sua» khi mốc đã có `canDuoiSua`; Notes giải thích vì sao mốc ghim. |
| P1 | evals | E8 (c) đòi tập literal số bằng đúng merge-base, trong khi công thức cần `0`, `1`, `2`. | Mã viết đúng design (`2 * chung`) bị gắn «luat ma: so ma» nếu tệp gốc thiếu literal đó; đỏ giả. | Literal mới so với mốc thuộc {0, 1, 2}; đối chứng dương `2 * chung` xanh. | fixed: AC-7 và E8 (c) đổi thành «literal mới so với `cfac5bea` thuộc {0, 1, 2}», chiều đỏ `2000`, đối chứng dương `2 * chung`. |
| P2 | evals | E5 bỏ sót các đường nới trần khác mà bun nhận. | Thêm `setDefaultTimeout(20_000)` hay `[test] timeout` trong `bunfig.toml`, E5 vẫn in ba dòng đạt. | Mở rộng E5 ra bảy kiểm, mỗi đường một chiều đỏ ghim. | fixed: AC-5 và E5 thêm `setDefaultTimeout`, tuỳ chọn `timeout` của `test`/`describe`/`it`, `bunfig.toml` ở gói và gốc, `--timeout` ở `package.json` gốc và `turbo.json`. |
