---
slug: paths-chet-chin-ho-so
at: 2026-10-31T13:40:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai hồ sơ còn lý do khác tắt bộ lọc: eval judgment E9 (goi-y-mo-ke-hoach) và E9j (hoi-dap-okr) không có paths | Gỡ đủ 25 mục chết mà E2 vẫn SAI ở 2/9 hồ sơ; thợ tự thêm paths ngoài phép | Thêm dòng vào bảng sửa và một câu hỏi cho người ở Cổng Phạm vi | fixed: Hỏi-1 (khuyên paths = inputs), hai dòng mới trong bang-sua.json; thử trên clone: E2–E3 286 DUNG, 0 SAI |
| P0 | design | Dòng tro-ly-okr-nen E21 gỡ db/okr-can-chinh.ts với căn cứ sai — thước E21 đọc validation/okr-can-chinh.ts | PR đổi validation/okr-can-chinh.ts làm E21 đỏ mà hồ sơ không hoá cũ | Thay đường; dòng sổ cho mọi gỡ ở eval đang chạy trích tệp lệnh đọc | fixed: thay bằng packages/validation/src/okr-can-chinh.ts; dòng sổ «gỡ khi lệnh không đọc, thay khi có đọc» kèm căn cứ từng dòng |
| P1 | evals | Không thước nào chứng phần đổi trong paths đúng bằng bảng | Gỡ thêm một mục sống, E1–E5 vẫn xanh | So tập bỏ/thêm với bảng, đối chứng dương gỡ mục sống | fixed: E4 so tập chính xác, đối chứng dương a/song.ts và b/khac.ts cùng lượt; clone 18/0, gốc 9 SAI |
| P1 | contract | Sửa sổ của gom-tin-hieu-tu-chay (hồ sơ đã ký thứ mười) không có người cho phép, AC-7 không phủ | Hồ sơ bị đòi ghim mà lượt ghim không có nó | Dòng sổ người cho phép; E7 phủ nó | fixed: Hỏi-2 cho chủ kho; E7 đọc cả gom-tin-hieu-tu-chay (theo decisions.jsonl) |
| P2 | contract | Ngưỡng «PR chỉ đổi tài liệu không gọi tên chín hồ sơ» không đạt nguyên văn — hai hồ sơ khai CONTEXT.md, docs/*.md | Số đọc lúc đo giá trị sai | Viết lại ngưỡng theo «không chạm mục paths» | fixed: «Đường đo» đọc ngưỡng theo câu «không chạm mục paths nào thì không gọi tên», ghi chú lý do; ô cơ hội không sửa (chữ của Cổng Đáng) |
