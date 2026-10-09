---
slug: kiem-cheo-sau-gop
at: 2026-10-08T07:20:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | E3 dùng làn ghim lại giả in đúng khuôn dòng mà bộ đọc của dem.mjs mong; không eval nào cho bộ đọc chạy trên đầu ra của làn thật, không đo chế độ chỉ đo và tập hồ sơ truyền cho làn; vế phá thử trên nhánh nháp không có đường đo | Làn thật in khuôn khác (màu, stderr, run-log) thì đêm nào cũng xanh, E3 vẫn xanh, con trỏ E11 → AC-6 hợp lệ trên một lời hứa không máy nào giữ | Mẫu dòng rút từ lượt ghim lại thật kèm phiên bản kit, ca đỏ khi phiên bản lệch; làn giả ghi argv; cờ chọn nhánh cho phá thử | fixed: E1 (k) bộ đọc chạy trên fixtures/lan-that.txt trích nguyên văn một lượt ghim lại thật, đỏ khi phiên bản feature-loop lệch; E3 (h) argv không --write và đúng tập slug; AC-1 + E1 (j) cờ --nhanh; dòng Đường đo «phá thử bị bắt ở lượt đầu» |
| P1 | contract | AC-6 không nói ca hồ sơ hay eval chưa có ở T (hồ sơ vào trong khoảng) | Hồ sơ X ký ở M1, M2 làm X đỏ, ở T lệnh lỗi vì X chưa có → xếp đỏ sẵn, hồi quy thật bị nuốt | Vế mới ở AC-6 + ô E3 hồ sơ vào ở M1, phá ở M2 | fixed: AC-6 thêm vế hồ sơ vào trong khoảng → tìm nhị phân từ lần gộp mang nó vào; E3 (g) với đối chứng đỏ sẵn |
| P1 | contract | Lượt đêm hỏng im lặng: AC-3 thoát 2 không báo; plist không đòi đường dẫn tuyệt đối tới bun, PATH, tệp log | launchd PATH tối thiểu không có bun, hoặc moc.json vắng → đêm nào cũng hỏng, không tệp, không báo, chạm ngưỡng CHẾT 48 giờ | Mọi thoát khác 0 đều báo; plist đủ PATH và log; ô chạy dưới env -i | fixed: AC-3 và AC-9 báo kết quả loi cho mọi thoát khác 0 kể cả git fetch lỗi; AC-10 + E1 (i) đường dẫn tuyệt đối, PATH, StandardOut/ErrorPath, ô env -i có đối chứng đỏ |
| P1 | contract | Vế CHẾT «chiếm s4 khi có phiên chờ» đo bằng thước không bao giờ đỏ; lượt không có trần thời gian | Đêm quá 20 giờ, kiem-cheo chen trước một thợ rồi giữ s4 hàng giờ, thước «cấp qua bộ phát lịch» vẫn đọc SỐNG | Đếm phút giữ s4 khi có đơn khác chờ, so với trần một lượt | fixed: trần KIEM_CHEO.tranLuotPhut (90) trong AC-8 + E3 (i); Đường đo đếm phút giữ khi có đơn khác chờ; ngưỡng CHẾT [đề xuất] viết lại theo trần (P4-25) |
| P1 | contract | Notes chuyển vế «năm spec Zalo không bị sửa» sang AC-6 mà AC-6 không đo nó | Một lần gộp làm yếu một spec Zalo, suite vẫn xanh, lượt đêm xanh, vế đã ký mất không ai duyệt | Đo vế đó trong AC-6 hoặc bỏ có tên | fixed: bỏ có tên — dòng descope d-20261008T072218Z-5, Notes ghi rõ, anh duyệt ở Cổng 1 |
