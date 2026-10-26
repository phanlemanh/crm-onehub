---
slug: don-ho-so-cu
at: 2026-10-20T08:46:21Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «một hồ sơ vòng, một PR» ghi nguồn một-lối, nhưng lối «mỗi lô một PR, gộp dần» vẫn sống; đó là lựa chọn chỉ người có. | Người duyệt Cổng Phạm vi tin chỉ có một đường; ~200 lượt ghim nằm chưa gộp qua nhiều lô, vòng khác chạm các hồ sơ ấy vẫn phải tự ghim lại. | Thay dòng sổ bằng một câu hỏi cho người kèm khuyến nghị và giá của hai lối. | fixed: dòng sổ mới mang supersedes thành Hỏi-2 (chỉ-người, khuyến nghị mỗi lô một PR); design viết theo khuyến nghị, nêu lối khác và giá |
| P1 | contract | Không AC nào hứa PR qua được lưới trước-gộp như CI chạy, trong khi làn ghi repin-do vào sổ chạy của hồ sơ đỏ còn cũ. | PR chạm run-log của hồ sơ đỏ còn cũ nên cổng gộp chặn; vòng không gộp được sau Cổng Bằng chứng. | Thêm AC chạy lưới --base origin/onehub trên HEAD, kèm ca phá chạm sổ chạy của hồ sơ cũ. | fixed: thêm AC-9 + E9; design bước 4 hoàn lại thư mục hồ sơ đỏ, bằng chứng đỏ chuyển sang tệp lan/<run_id>.json (AC-4, E4); AC-6/E6 cấm hồ sơ đỏ đổi tệp nào |
| P1 | contract | AC-3/E3 coi hồ sơ có dòng sổ là xong bất kể cách xử; sua-thuoc phải tươi sau khi ghim lại. | Thước sửa xong nhưng không lô nào ghim lại; hồ sơ vẫn cũ mà E3 xanh. | E3: slug sua-thuoc không được cũ trên HEAD, dòng repin mới nhất đi sau commit sửa; ca phá sua-thuoc-chua-ghim. | fixed: AC-3 và E3 viết lại đúng như đề xuất |
| P1 | contract | AC-8/E8 đo tệp có mặt trong PR thay cho quan hệ «làn chủ có vòng đã ký chờ gộp». | Làn chủ có vòng đã ký dưới slug khác, PR không chạm thư mục hồ sơ; E8 xanh và máy sửa thước sai điều kiện duyệt. | AC-8 viết lại theo câu của chủ kho; E8 chụp mọi PR có hợp đồng đã ký, không lọc theo đường tệp; ca phá lan-chu-khac-slug. | fixed: AC-8 trích nguyên câu luật 23; E8 chụp mọi PR mở có hợp đồng đã ký, không rỗng thì phải có câu hỏi và lời trả lời trên #375; thêm ca phá lan-chu-khac-slug |
| P1 | contract | AC-7/E7 ép tac-nhan-va thành loi-kit dù design nói ca đã xanh thì chỉ ghim; AC-4 đòi lượt đỏ thật cho dòng loi-kit. | Kit đã vá resolveConfigKey, tac-nhan-va ghim xanh; E7 đòi dòng loi-kit mà E4 thì đỏ vì không có lượt đỏ. | E7: tac-nhan-va đạt khi không còn cũ hoặc có dòng loi-kit. | fixed: AC-7 và E7 viết lại đúng như đề xuất |
