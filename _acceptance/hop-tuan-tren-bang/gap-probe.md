---
slug: hop-tuan-tren-bang
at: 2026-10-27T13:19:26Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
# Phản biện context sạch — hop-tuan-tren-bang

Một tác tử tươi chỉ đọc design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`, `opportunity.md` và bản claim-scan
(12 dòng).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, sổ | Mốc so của mức đổi ghi là máy quyết, trích luật «tụt» của toan-canh-okr — câu ấy liên quan chứ không quyết; câu giao ghi «so với lần trước» | Chủ kho ký với hiểu «lần liền trước»; KR sửa 1,10 rồi 1,08 trong tuần mà bảng hiện so với 1,17 | Dòng chỉ-người có khuyến nghị và lối khác lên thẻ | human-gate1: thành Hỏi-3 (dòng mới supersedes d-20261027T131457Z-2) |
| P0 | evals E10, sổ | Bỏ E10 với lý do chi phí khoá s4, không phải ràng buộc; vòng này chuyển NutCapNhatDong và đổi lối ‹ › mà hồ sơ đã ký đo | Bài kiểm đã ký nhập theo-don-vi/bang.tsx đỏ sau khi chuyển tệp; S4 không có eval chạy nó; chỉ lộ sau gộp | Khôi phục E10 có giới hạn lớp, đối chứng dương ngan-kr-mot-cho | fixed: E10 chạy trong S4, lớp gồm theo-don-vi/bang và cap-nhat-dong, đối chứng dương ngan-kr-mot-cho (dòng mới supersedes d-20261027T131457Z-12) |
| P1 | contract AC-1 AC-3, evals E1 E3 | Thiếu ca nhiều lần trong cùng tuần đầu, không có lần ở tuần trước | KR cập nhật hai lần trong tuần đầu Quý 4, bảng in «Lần đầu cập nhật» cho lần thứ hai | Ô thứ chín ở E1 và E3 | fixed: thêm ca thứ chín; luật so với lần đầu tiên khi đã có từ hai lần; «Lần đầu cập nhật» chỉ khi đúng một lần (thuộc Hỏi-3) |
| P1 | contract AC-4 AC-9, evals E4 E11 | Không nói gì khi gửi từ dòng làm KR rời Đang bàn sang Còn lại đang gập | KR biến khỏi phần đang hiện, tiêu điểm rơi về body, E11 không đọc được dòng K | Một Then cho ca đổi phần, E4 (e), tiền đề của E11 | human-gate1: Hỏi-4 (khuyến nghị Còn lại tự mở, tiêu điểm về KR); E4 (e) và tiền đề E11 đã viết theo khuyến nghị |
| P1 | evals E2 E8 | «Hiện đúng một lần mỗi dòng» chỉ đo trong jsdom, nơi CSS không áp; E8 chỉ đếm số dòng có ghi chú | Ở 768 cả cột ghi chú lẫn bản dưới tên KR cùng hiện, mỗi dòng hai ghi chú, cả hai eval vẫn xanh | Đếm theo dòng bằng checkVisibility() trên trình duyệt thật, có đối chứng dương | fixed: E8 đếm từng dòng bằng checkVisibility() kèm đối chứng; E2 đổi sang luật phân khổ viết trước (ba khoá data-kho phủ kín, không chồng) |
