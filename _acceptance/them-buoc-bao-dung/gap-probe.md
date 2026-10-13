---
slug: them-buoc-bao-dung
at: 2026-10-13T00:40:30Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Gap-probe: them-buoc-bao-dung

Phản biện context sạch, một lượt, đọc design doc + contract + evals + decisions + claims (input 5) + opportunity.md.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-3 máy tự quyết sửa bài kiểm của hồ sơ đã ký dieu-phoi-va (toBe(400) thành toBe(404)); sửa hồ sơ người đã ký là lựa chọn chỉ người có, lối «người sửa AC-6 ở cổng» vẫn sống. E8 chỉ canh dòng expect, không thấy .skip hay fixture bị sửa | Ghim lại dieu-phoi-va xanh trên bài kiểm nay khẳng định 404 trong khi AC-6 đã ký ghi BAD_REQUEST, không ai ký sự thay thế; thêm test.skip vào bo-phan-hong mà E8 vẫn thoát 0 | Đổi d-3 thành câu hỏi trên thẻ Cổng 1; E8 thêm chiều đỏ cho .skip/.todo và cho sửa fixture của bo-phan-hong | human-gate1: d-20261013T004121Z-10 thay d-3 thành Hỏi-1 (yêu cầu can-nguoi P5-1 đã gửi giám sát); E8 thêm kiểm .skip/.todo/.only và so khối bo-phan-hong từng dòng, tự thử 7/7 có phá-thử đỏ |
| P1 | evals | E3–E7 cùng một tệp DOM, E6/E7 ghim múi giờ ở khẳng định đầu; expected không nói lệnh nào lọc describe | tbd_qua_han_lui chạy cả tệp thì describe qua-han-tien đỏ vì sai múi giờ, mã đúng mà S4 REJECT | Ghi phần lọc vào expected của từng eval | fixed: config đã lọc -t theo describe; expected E1, E3, E6, E7 ghi rõ lọc và TZ; describe khứ hồi chỉ chạy khi TBD_KHU_HOI=1 |
| P1 | evals | E6, E7 viết tay dữ liệu đúng khuôn bên đọc; không eval nào rút dữ liệu từ dashboard.summary thật; lời hứa là quan hệ giữa hai phía | Máy chủ gửi dueAt lệch biên so với dauNgayVN thì màn thật vẫn hiện «nữa» thừa trong khi E6, E7 xanh | Eval xuyên lớp: gieo bước thật, gọi summary thật ở đồng hồ ghim, đưa đầu ra vào hàm của app ở hai múi giờ, khẳng định quan hệ | fixed: AC-9 + E9 (cross-layer, backend-effect) — gieo hai bước ở biên, gọi DashboardService.summary thật ở hai đồng hồ quanh nửa đêm VN, đưa mySteps vào buocQuaHanVN của app ở Los_Angeles và Kiritimati, so với quaHan.buoc |
| P1 | evals | surfaces có ui mà không eval ui-check; lý do bỏ ui-observed (không chặn mạng được) không đứng vì công cụ trình duyệt chặn được và đặt được múi giờ | VungTaiLoi đặt trong form hẹp ở drawer 390 tràn ngang hay cắt nút thử lại, E3–E5 chỉ đo DOM nên xanh, người ký không có khung hình | Thước màn chặn listDepartments, chụp 1440 và 390, đặt múi giờ trang cho Tổng quan | fixed: d-20261013T004121Z-11 thay d-7; E10 (AC-3/AC-5, 3 trạng thái × 2 khổ, không cuộn ngang, nút thử lại trong khung) và E11 (AC-6/AC-7, múi giờ chọn theo giờ VN lúc đo) qua rang/man.mjs (puppeteer-core: setRequestInterception, emulateTimezone) |
| P2 | contract | Trục A có «tạo kế hoạch từ khuôn» và «khôi phục khuôn» không thuộc ô nào; AC-2 thiếu sửa khuôn; E1, E2 gọi service thay vì thủ tục tRPC | Đường khuôn khác hay lớp router trả mã khác mà E1, E2 vẫn xanh | Liệt đủ đường hoặc đưa vào Later/Never; gọi qua router và so TRPCError.code | fixed: AC-2 và E2 thêm sửa khuôn; Never ghi hai đường không nhận mã từ người gọi (mã đã lưu trong khuôn, org.* từ chối xoá hẳn phòng ban còn khuôn giữ). rejected phần router: DomainErrorMiddleware ánh xạ mã HTTP sang mã tRPC bằng một hàm, và E1 so status với chính đường org.* đi qua cùng middleware |
