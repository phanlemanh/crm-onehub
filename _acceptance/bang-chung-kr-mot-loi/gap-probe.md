---
slug: bang-chung-kr-mot-loi
at: 2026-11-02T05:56:15Z
verdict: findings
p0: 1
p1: 2
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-1 ghi máy quyết «dòng nhập tại chỗ» bằng hàng «Thêm một mục con» của docs/design.md, trong khi chính docs/design.md (bảng «Dấu hiệu vẽ tay») xếp «Dialog mở từ trong ngăn để ghi một dòng vào bản ghi» sang khối soạn trong ngăn, và ghi chú nợ ghi đích «khối soạn trong ngăn» — hai câu luật trái nhau nên đây là lựa chọn chỉ người có. Cùng lớp [rang-dau-hieu-ve-tay#F2]. | Cổng Phạm vi duyệt AC-1 đến AC-3 theo hình dòng nhập, người soát sau gộp áp luật khối soạn và trả lại, phải đổi AC và ghim lại hai hồ sơ khung ngăn thêm một lượt. | Dòng sổ Hỏi thay d-1, trích cả hai câu, người chọn ở Cổng 1; chọn khối soạn thì AC-1, AC-2 và E1, E2 đo thêm thu/mở và nút chính duy nhất. | human-gate1: dòng sổ Hỏi mang supersedes d-1 (Hỏi-1 trên thẻ), khuyến nghị dòng nhập |
| P1 | evals | AC-5 và AC-7 hứa ô ở khối cập nhật là chính ODuongDanBangChung và không còn ô tự dựng, nhưng E5 chỉ đo dấu và chữ trùng; E7, E8 không chạm khoi-cap-nhat-kr.tsx. Cùng lớp [rang-dau-hieu-ve-tay#F1]. | Khối cập nhật giữ Input type="url" tự dựng thêm dấu và chép chữ; E5, E7, E8 vẫn xanh trong khi còn hai ô. | Răng quét mã ma trận viết trước, đối chứng bản sao có ô tự dựng mang dấu. | fixed: thêm E13 (rang/mot-o.mjs, ba ô: chỉ o-duong-dan đặt dấu, khối cập nhật nhập ODuongDanBangChung và hết type="url", dòng nhập nhập ODuongDanBangChung; bản sao đỏ hai ô) |
| P1 | evals | AC-3 hứa hỏi lại khi ‹ › sang KR khác và Esc chỉ đóng dòng nhập; E3 không có ca ‹ › và không kiểm ngăn còn mở sau Esc. | Esc lan tới Sheet hay drawer và đóng cả ngăn, huy-esc vẫn xanh; bấm › làm mất nháp không hỏi mà không ca nào bắt. | Thêm kiểm ngăn còn mở và ca giu-nhap-chuyen-kr với đối chứng. | fixed: E3 thêm kiểm [data-kr-sheet] còn mở và không câu hỏi sau Esc/Huỷ, thêm ca giu-nhap-chuyen-kr và đối chứng bấm › khi chưa gõ |
| P2 | evals | Chỉ E10 đo khổ 375 và E10 chụp bản mẫu, không chụp drawer thật của ngăn KR. | Trên ngăn thật ở 375 dòng nhập trong drawer bị che hay tràn mà AC-9 vẫn xanh. | Thêm bước ui-check trên ngăn KR thật ở 375 qua do:man. | deferred: dòng nhập dựng bằng cùng Item/Field/Input với DongNhap của việc KR đang chạy trong drawer; E9 (thước canh-kr-okr) đi ngăn thật ở 1440. Ghi revisit trong sổ: bổ sung bước 375 khi thước canh-kr-okr có khổ điện thoại |
