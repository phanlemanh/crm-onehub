---
slug: ca-chap-chon-cach-ly
at: 2026-10-07T23:58:16Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

Phản biện chạy trên bản nháp đầu (bản có bước dọn `.eve`). Sau đó tái hiện ngày 08/10 lật bước dọn đó, và chủ kho duyệt bản sửa. Cột «Xử lý» ghi việc đã làm trên bản đã sửa.

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Chiều đỏ của AC-4/E5 ghim «Received: 503», nhưng bản sao chỉ gỡ bước dọn. Bước chờ route vẫn còn trong bản sao và giẫm lên chiều đỏ. | Trạng thái sót làm `/health` trả 503 mãi. `khoiDongEve` ném lỗi có tên khi hết trần, hoặc hook hết giờ trước. Không lối nào in «Received: 503», nên E5 thoát 1 dù mã đúng. | Gỡ cả hai bước trên bản sao, hoặc ghim lỗi có tên của bước chờ; trần chờ nhỏ hơn trần hook, có một dòng đo điều đó. | fixed: chiều đỏ của AC-4 nay ghim lỗi «dang co eve dev khong phai cua bai thu». Lỗi đó ra ở nhánh `trung` trước khi bước chờ route chạy, nên hai bước không còn giẫm nhau. AC-3 và E3 thêm dòng đo `KHOI_DONG.sanSang.choMs < KHOI_DONG.choMs`. |
| P1 | evals | AC-5 hứa trần cho ba hook, nhưng cặp (d) chỉ phá hook của `dungSan()` và chỉ chạy `tai-lieu-khong-ro`. | Mã chỉ thêm trần vào `dungSan()`. Hook riêng của hai spec vẫn chịu trần 5 s. E6 và E7 vẫn xanh, và CI lại đỏ sau khi đã ký. | Ma trận 3 hook × 2 chiều; nâng `SO_CAP_KHAI`; in tên hook ở mỗi dòng. | fixed: E7 có cặp (d1), (d2), (d3), mỗi cặp một hook; `SO_CAP_KHAI = 10`. |
| P1 | evals | Nhánh an toàn AC-2 chỉ đo trên tệp trạng thái viết tay, không đọc lại tệp do bên ghi thật viết. | Hàm đọc cổng ở một trường đoán sai. Khi một eve dev thật đang chạy, nó coi như «không ai nghe» và xoá trạng thái của eve đang sống. E2 vẫn xanh. | Đối chứng với bên ghi thật; fixture lấy khuôn từ tệp do bên ghi thật viết. | fixed theo thiết kế mới: không còn đọc tệp trạng thái của eve. Bước dọn chỉ dừng pid có trong tệp khoá do chính hàm ghi khoá của `khoi-dong.ts` viết. E1 và E2 dựng khoá bằng tiến trình con chạy mã thật, không viết tay. Pid bị tái dùng có ca riêng: E2 (ii). |
| P1 | evals | Given AC-3 có «từ chối kết nối», nhưng E3 không đo lối từ chối vài lần rồi sẵn sàng. | Mã ném ngay ở lần bị từ chối đầu tiên. E3 vẫn xanh, và lượt thật vẫn đỏ khi `/health` chưa kịp mở. | Ca từ chối N lần rồi mở và trả 404; cặp đỏ (c') riêng. | fixed: E3 thêm ca (2) và cặp (c'). |
| P2 | contract | AC-6/E8 chỉ đọc chuỗi trong `turbo --dry=json`, không đo tiến trình test có nhận biến hay không. | Một lớp bọc nằm giữa turbo và test lọc biến. `--dry` vẫn liệt biến, nhưng ca vẫn chạy và vẫn đỏ. | Chạy `bun run test` qua lớp bọc với biến bật, thấy dòng bỏ ca; đối chứng khi tắt biến. | fixed: AC-6 viết lại thành quan hệ bật thì bỏ ca, tắt thì chạy ca. E8 chạy qua `bun run test` ở gốc hai lần. Cặp (e) của E7 là chiều đỏ. |
