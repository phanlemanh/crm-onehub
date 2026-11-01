---
slug: rang-giu-khung-ngan
at: 2026-11-01T05:40:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Vấn đề gốc (răng không chạy trong bun run lint:slop, bun run test) không eval nào đo; E1 gọi thẳng oxlint, không kiểm tệp:dòng; E13 chỉ suy từ glob | lint:slop hay script test của app không gồm thư mục ngăn hay bài: luật và bài có thật mà không chạy trong CI, E1–E13 vẫn xanh | E1 chạy đúng lệnh script lint:slop trên bản sao, ghim tệp:dòng; E10 chạy bun run lint:slop trên cây thật; E13 chạy bun test của app tìm tên ca | fixed: AC-1, AC-11 đổi lời; E1 đọc lệnh lint:slop từ package.json và ghim deal-sheet.tsx:<dòng>; E10 chạy bun run lint:slop ở gốc; thêm E14 «cd apps/app && bun test -t proto-mau» tìm tên tệp bài |
| P0 | design | Dòng sổ d-5 (cấm họ theo tiền tố) ghi muc-tieu mà câu trích không quyết cách khớp họ; tiền tố áp cả bốn khối cũ | SkeletonRow hay SpinnerButton tương lai bị cấm oan theo quy tắc chủ kho chưa chọn | Đổi thành Hỏi, hoặc khai họ trong khuôn và ma trận tên họ cho từng khối | fixed: dòng sổ mới supersedes d-5 — họ khai trong khuôn bằng cam_ho: [Sheet, Dialog], chỉ hai khối ấy cấm họ; AC-2, E2 thêm SkeletonRow vào đối chứng im |
| P1 | contract | Hình dòng ngoai_le tự mâu thuẫn: AC-5, AC-6 coi một dòng là một cặp, AC-9 đòi 14 dòng mỗi dòng một tệp, trong khi bảng đo có 20 cặp trên 14 tệp | Thợ viết 20 dòng thì E11 đỏ; viết 14 dòng thì E5, E7 đổi nghĩa — S4 phải sửa thước | Chốt một hình; E11 so tập cặp viết trước | fixed: chốt một dòng một tệp (khoi là tên hay danh sách); AC-5, AC-6, AC-9 đổi lời; E11 so 14 dòng và đúng tập 20 cặp viết trước |
| P1 | evals | Thành phần thay theo khối không có chỗ sống; nếu nằm trong mã luật thì phạm E3; E2 chỉ đếm dòng | Bảng thay trong mã làm E3 đỏ, hoặc năm khối thiếu thông điệp thay mà E2 vẫn xanh | Khoá khuôn cho thành phần thay; E2 ghim chuỗi thay từng tên; E3 cấm cả tên thay trong mã | fixed: khoá thay_cho trong khuôn, bộ đọc ném lỗi khi khối thiếu dòng; E2 ghim tám cặp tên → thay; E3 cấm tên khối và tên thay trong tệp luật; E3b ca thieu-thay |
| P2 | evals | Bộ đọc YAML tự viết không có ca khứ hồi với bộ đọc chuẩn, không ca khuôn sai hình; fixture tiêm có thể viết tay | Khuôn viết danh sách dạng khối, bộ đọc trả rỗng, luật và bài cùng im | Ca so với Bun.YAML.parse; ca danh sách khối ném lỗi; fixture dựng từ chữ thật | fixed: thêm E3b (khu-hoi-yaml, danh-sach-khoi, thieu-thay); AC-3 đổi lời; E13 và design ghi bản ghi tiêm dựng bằng cách sửa chữ tệp thật |
