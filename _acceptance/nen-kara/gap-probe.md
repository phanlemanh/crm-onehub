---
slug: nen-kara
at: 2026-10-01T23:20:53Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E1, E3, E10 đòi gốc `[data-slot=proposed-change]` đồng thời là `[data-slot=item]` hay `[data-slot=alert]` — một thuộc tính chỉ có một giá trị | `Item` và `Alert` trải props sau `data-slot` nên gốc mang `proposed-change`; E1, E3 đỏ cả khi cài đúng, hoặc người cài đổi slot làm đỏ thước hồ sơ đã ký | Ghim dấu thật: inline mang `data-variant`, `data-size`, lớp `group/item`; card mang lớp `group/alert`; đối chứng dương trên merge-base | fixed: E1, E3 đo lớp gốc `group/item`/`group/alert` + `data-variant`/`data-size`; E3 thêm đối chứng dương trên bản merge-base; E10 đo viền thật trong trình duyệt |
| P1 | evals | E10 lấy ma trận từ catalog chứ không từ bảng trạng thái viết trước; tên ảnh chưa ghim khuôn khớp inputs của E13 | Bản mẫu bỏ sót ba trạng thái, E10 vẫn đếm đủ và xanh; hoặc tên ảnh lệch làm E13 thiếu inputs | Rút 8 trạng thái từ UX-STATE-TABLE, đòi catalog bằng đúng tập, 32 ô, khuôn tên ảnh từ gốc kho, kiểm inputs E13 có mặt | fixed: E10 steps và expected theo đúng đề xuất, chiều đỏ 'thieu trang thai: <id>' |
| P1 | evals | AC-1 hứa không viền bên trong nhưng E1/E10 không đo viền và nền của phần tử con | Người cài bọc thân trong div `rounded-lg border bg-muted/50`, E1 và E10 vẫn xanh | Đo viền 0 và nền trong suốt cho mọi phần tử con trừ button/textarea/input/ins/del; chiều đỏ 'inline co hop con' | fixed: E10 + AC-9 nói rõ phần tử con, thêm chiều đỏ hop-con |
| P1 | evals | E6 không đo chặn `keydown` và phím Space | Chỉ chặn click; Enter trên «Vì sao?» ở hàng thật bắt onKeyDown vừa mở ô vừa bật hàng | Hàng có cả onClick lẫn onKeyDown; Enter và Space; đối chứng dương; chiều đỏ 'phim lam mo hang' | fixed: E6 + AC-6 |
| P1 | evals | E8 không so chữ cảm ơn, tên nhóm, không chạy lại bài DOM sẵn có của tóm tắt tuần | AiFeedback đổi chữ trên màn thật mà E8 vẫn xanh | So chữ cảm ơn và tên nhóm với khoá cũ, đếm phần tử, chạy tro-ly-okr-tom-tat.dom.tsx; chiều đỏ 'chu cam on doi' | fixed: E8 + AC-7 + lệnh nk_tom_tat chạy thêm tro-ly-okr-tom-tat.dom.tsx |

Ghi chú ngoài 5 mục, cũng đã xử lý: `translate="no"` nay nằm trong AC-1/E1; E14 thêm `the-gop-y.tsx`, `facts.tsx` và liệt mọi `.tsx` dưới `_modules/nen-kara` bằng `find`. Không finding nào dựa trên claim của input 5.
