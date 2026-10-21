---
slug: sort-moi-truong
at: 2026-10-21T00:58:30Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — sort-moi-truong

Một tác tử tươi đọc sáu tệp: design, contract, evals, sổ quyết định, bài học từ feature trước (claim-scan), ô cơ hội.
Không đọc hội thoại, không đọc mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-4 ghi một-lối cho «khoá sort chết về mặc định, không báo», nhưng lối «về mặc định kèm một dòng báo» vẫn sống; người dùng thấy chuyện này. Cùng dạng [zalo-cau-thu-hai-lien-ket#F1] | Mở view đã lưu sắp theo một trường vừa bị lưu trữ, bảng về thứ tự mặc định mà không chữ nào giải thích | Thay d-4 bằng câu chi-nguoi; vế view đã lưu của AC-3 viết theo câu trả lời | human-gate1: d-20261021T005908Z-16 (Hỏi-4, supersedes d-4), khuyên không báo; AC-3 ghi «theo Hỏi-4, lối máy khuyên» kèm đối chứng trường sống; design ghi lý do |
| P0 | contract | Sổ d-2 trích câu chỉ quyết trống cuối, không quyết luật hoà createdAt; sort chuẩn hoà theo tên bản ghi (Điện thoại của Liên hệ hoà theo lastName) | Cùng kiểu Điện thoại: cột chuẩn hoà theo họ, cột tự tạo hoà theo bản mới nhất — trái anti-goal «bảng sort riêng cho trường tự tạo» | Một luật hoà chung; E2 so trường PHONE tự tạo với phone chuẩn trên cùng liên hệ | fixed: d-20261021T005908Z-15 (supersedes d-2) hoà theo tên bản ghi A→Z rồi id, trích contacts.service.ts; AC-1, AC-2, design, E1 (tên T1..T5), E2 (lời 'hoa lech chuan') sửa theo |
| P1 | evals | Các eval API chung một tệp và một kho crm_<id>_test dùng chung giữa các tệp, không bước cô lập hay dọn; design gọi nhầm là «kho thử riêng». Cùng dạng [va-gantt-lich-bay-ngay#F1] | Trường DEAL của ca khác bật «Hiện trong bảng» đứng trước, E7 nhận trường lạ; thoả thuận của ca khác rơi vào đoạn trống của E1; E8 để lại 5.000 bản ghi cho tệp sau | Cô lập theo ca, đếm đầu ca, dọn cuối ca | fixed: mọi eval API gắn tiền tố tên riêng và gọi list, board với q là tiền tố ấy, đầu ca đếm khác 0 thì ném 'smt <ca>: lan'; E7 tự sắp trường của mình lên đầu bằng fields.reorder; E8 chạy riêng sau SMT_TOC_DO=1 và dọn hết, lời 'smt toc do: don de lai'; design có mục «Cô lập trong bài kiểm», sửa chữ «kho thử riêng» |
| P1 | contract | Ngưỡng SỐNG «trên điện thoại» của opportunity không có đường đo; AC-9 không đo bảng ở 375; E5 mở menu trong jsdom nơi hideBelow không có hiệu lực | Menu sort ở điện thoại chỉ dựng từ cột đang thấy thì ở 375 không sắp được theo trường tự tạo, mà E5, E9 vẫn xanh | AC-9 thêm 375 với menu sort; E9 thêm bước và ảnh | fixed: AC-9 vế 375 menu sort; E9 bước 1b với ảnh smt-bang-thoa-thuan-375-menu.png và các lời 'smt man: 375 menu thieu', '375 url', '375 thu tu'; Đường đo thêm hàng điện thoại |
| P1 | evals | Trống có hai dạng (không hàng, hàng có cột null) mà fixture chỉ tạo một dạng; đoạn trống dùng none không lọc cột | Bản ghi có hàng giá trị cột null (khoá ngoại SetNull) bị loại khỏi cả hai đoạn, biến khỏi mọi trang trong khi total vẫn đếm | E1b dựng cả hai dạng qua đường thật và đi trang | fixed: design đổi đoạn trống thành none với cột not null; AC-1 nêu hai dạng; E1b dựng dạng một bằng deals.update xoá giá trị, dạng hai bằng xoá User để SetNull thật, lời 'fixture trong mot dang' và '<dir> sot <id>' |
