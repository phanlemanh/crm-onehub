---
slug: test-nghe-127
at: 2026-10-21T23:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Số Bun.serve lệch giữa thiết kế (16) và eval (15); máy quét chỉ thấy dạng Bun.serve({. | Một lời gọi Bun.serve viết khác dạng lọt máy quét, E1 vẫn xanh, bài đó vẫn vấp lỗi trên máy có Colima. | Đếm mọi \bBun.serve\b và serve( từ bun; ma trận theo tệp; dạng lạ thành vi phạm có ghim. | fixed: máy quét đếm mọi Bun.serve, dạng lạ vào nhóm dangLa, ma trận khai số theo từng tệp; thiết kế ghi 15 trên tổng 17. |
| P1 | evals | Số chỗ dựng app 44 so 49 không giải thích; cửa sổ 600 ký tự không buộc listen trên đúng biến. | Hai app dựng sát nhau, chỉ một nghe, máy quét vẫn cho qua; supertest tự mở cổng cho app đầu. | Ma trận 49 chỗ theo tệp; listen trên đúng biến, trước chỗ dựng kế tiếp; ca tự thử hai app sát nhau. | fixed: ma trận KHAI_DUNG_APP theo tệp (46 tệp, 49 chỗ: 21 createNestApplication + 28 createApp), kiểm <biến>.listen(0, "127.0.0.1") trước chỗ dựng kế tiếp, ca tự thử hai-app-sat-nhau; thiết kế ghi đúng 21 và 28. |
| P1 | contract | Phép đổi của răng khẳng định rộng hơn và hẹp hơn bốn dạng của AC-4. | Một expect đổi localhost thành 127.0.0.1 lọt qua; Bun.serve một dòng chèn hostname giữa dòng bị đánh trượt. | Giới hạn phép localhost, chèn giữa dòng, ca tự thử, AC-4 liệt đủ dạng. | fixed: localhost chỉ áp cho http://localhost:${ ở dòng không khẳng định; thêm phép chèn hostname giữa dòng; năm ca tự thử; AC-4 liệt đủ sáu dạng. Giới hạn còn lại: biome gộp hay tách dòng thì răng có thể đỏ oan — sửa bằng cách giữ định dạng của dòng gốc. |
| P1 | evals | Răng khẳng định chỉ đọc commit mang slug trong message. | Commit sửa không mang slug đổi một expect mà răng không thấy. | Diff merge-base...HEAD như thiết kế viết. | fixed: răng đọc git diff merge-base...HEAD; chỉ khi nhánh đã gộp (diff rỗng) mới quay về commit mang slug. |
| P2 | contract | listen() không đối số bị bỏ qua; AC-2 chỉ nói apps/api. | Một http.createServer(h).listen() ngoài apps/api lọt máy quét, không AC nào phủ. | Đếm listen() là vi phạm; mở rộng Given của AC-2. | fixed: listen() không đối số là vi phạm, có ca tự thử; AC-2 phủ mọi thư mục test. |
