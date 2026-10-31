---
slug: ci-test-het-do-co-dinh
at: 2026-10-31T13:32:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | d-2, d-3, d-5 ghi nguồn «một lối» trong khi lối khác vẫn sống: sửa gốc ở lai-ra-man (đắt hơn, không chết), mọi trần 10–60s, dọn theo id đã tạo [cua-toi-chi-liet-kr#F2] | Cổng Phạm vi tin máy đã chứng minh chỉ còn một lối; sau gộp, thứ tự tệp đổi và một tệp dùng Date.now() khác chạy sau lai-ra-man rồi đỏ, app-ui trượt ngưỡng SỐNG | Viết lại với lối còn sống và giá; d-2 thành câu hỏi; Coverage gọi tên rủi ro app-ui | human-gate1: d-2 thành Hỏi-1, d-3 thành Hỏi-2 (giám sát đã gợi ý 30s, chủ kho chốt); d-5 đổi căn cứ sang nếp tiền tố riêng có sẵn (thanh-vien-vao-dung.spec.ts); Coverage thêm dòng [GIẢ ĐỊNH] rủi ro app-ui tới K-1 |
| P0 | design | d-7 (dgt dời createdAt, bền) đi ngược nguyên tắc d-6 (vai nói to, không che rò); chọn bền hay nói to là luật cho bài kiểm | Một tệp sau lại rò thành viên; dgt-thuoc vẫn xanh nhờ dời createdAt, che rò đúng như d-6 muốn tránh; Cổng Phạm vi duyệt hai nguyên tắc trái nhau | Một dòng sổ nêu hai lối cho dgt-thuoc kèm giá, đưa lên Cổng Phạm vi; sửa d-6 cho nhất quán | human-gate1: d-6 thay bằng nguyên tắc chung (tự dựng tiền đề bằng dữ liệu của chính ca thì được, phụ thuộc dữ liệu tệp khác thì nói to); d-7 thành Hỏi-3 với hai lối và giá |
| P1 | evals | AC-3 hứa «mỗi ca» có trần và «không khẳng định cũ nào đổi» nhưng E3 chỉ ép ca (i) và chỉ đòi pass [cap-nhat-trong-ngan-kr#F1] | Chỉ (i) mang trần, (j) vẫn 5s; hoặc một expect cũ bị xoá mà E2, E3 vẫn xanh | Ép trần từng ca; so expect từng ca với 6ca59691a | fixed: dong-ho-va-tran.mjs thêm moi-ca-co-tran (đếm), khang-dinh-cu-giu-nguyen (so với git show 6ca59691a) kèm chiều đỏ khang-dinh-pha, ep-tran-moi-ca (từng ca riêng, kể cả (j)); AC-3 và E3 viết lại |
| P1 | contract | Đường đo không định nghĩa PR nào được tính (PR T1 cho job test skipped), thiếu đường đo vế «expect dgt trong mô tả PR», thiếu ngày đọc | Người đọc thấy hai job skipped và ci-ok success trên PR chỉ sửa .md rồi ký «đạt» | Đòi conclusion success, không nhận skipped; grep mô tả PR; ngày đọc | fixed: Đường đo viết lại — hai lượt đọc có tên, PR phải chạy job test, skipped không tính, ngày đọc muộn nhất 2026-11-03, mô tả PR đọc bằng gh pr view |
| P1 | evals | Chiều đỏ của E1, E8 chỉ là trích tài liệu, S4 không chạy lại tệp thứ tự trên nền | Tệp thứ tự lệch; E1, E8 xanh trên thứ tự không còn dựng lại lỗi | Dựng worktree tạm ở 6ca59691a và chạy cùng tệp thứ tự, đòi đúng chiều đỏ | fixed một phần: phat-lai-thu-tu.mjs kiểm chuỗi nhân quả ngay trong tệp thứ tự (lai-ra-man trước pre-push-da-chung; dev-grant-needed, rồi tệp gọi gieoViecMau, rồi mat-khau-lien-ket, rồi vai-chi-okr và du-an-do-nguong); chiều đỏ cơ chế đo độc lập ở ro-ri.mjs. deferred: chạy lại trọn trên worktree nền tốn thêm khoảng 10′ cộng bun install mỗi lượt S4, giữ log chiều đỏ ở chieu-do-tren-nen.md |
