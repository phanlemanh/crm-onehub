---
slug: okr-mau-xoa-cuoc-soan
at: 2026-10-10T22:47:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E1 không nói tập mã của phép quét demThamChieu(tapIdMau()) có gồm mã cuộc soạn không, trong khi E6 giữ hàng aiChiPhi có taskId bằng mã cuộc | Nếu tập quét gồm mã cuộc thì sau --xoa phép quét ra aiChiPhi.taskId:1, E1 đỏ dù code đúng; đột biến (d) xoá chi phí lại làm E1 xanh | Ghi rõ tập quét; đối chứng dương trước khi xoá | fixed: E1 ghi ids = tapIdMau() của okr-mau-san.ts — chỉ mã người, bộ phận, phòng ban, chu kỳ, Mục tiêu, KR, không gồm mã cuộc; đối chứng dương đòi đủ bốn khoá okrCuocSoan.* trong phép quét trước khi xoá |
| P1 | evals | Điều kiện chọn cuộc có bốn vế nhưng mọi cuộc dựng đều mang mã mẫu ở cả ba vế; không ca một-vế, không đột biến bỏ vế | Code chỉ lọc cycleId vẫn xanh; cuộc của người mẫu trên chu kỳ thật sót lại | Ba cuộc một-vế, thông điệp ghim từng vế; đột biến bỏ vế | fixed: AC-1/E1 thêm ba cuộc ghi bằng moCuoc (chỉ departmentId, chỉ divisionId, chỉ nguoiMoUserId), ghim 'omx: con cuoc ve-pb/ve-bp/ve-nguoi'; AC-2 thành 4 cuộc với 5 đề xuất; E9 thêm (f) bỏ vế departmentId, (g) bỏ vế nguoiMoUserId, SO_CAP_KHAI = 7; (c) đổi thành bỏ mọi vế tiền tố để không bị vế khác che |
| P1 | contract | Giá trị «vết» của trục Coverage không có AC, không ở Out of scope | Hàng vết trỏ cuộc hay chu kỳ mẫu sót lại mà không cổng nào thấy | Xếp «vết» vào AC hoặc Out of scope có lý do | fixed: Out of scope thêm dòng — tác tử soạn không ghi vết (bốn bảng docs/agent.md khai), vết soan-okr: của «Đưa vào» mang cycleId/objectiveId mẫu nên đi theo đường xoá vết hiện có |
| P2 | evals | E8 hỏi về từ ghép tự đúc so với CONTEXT.md nhưng CONTEXT.md không ở inputs, AC-8 không có vế đó | Hội đồng đoán, chấm lệch | Thêm CONTEXT.md vào inputs và vế vào AC-8 | fixed: inputs E8 thêm CONTEXT.md; AC-8 thêm vế không tự đúc từ ghép |
