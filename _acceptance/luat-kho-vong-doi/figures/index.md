# Hình tại điểm quyết định — luat-kho-vong-doi (Cổng 1)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| P0 gap-probe — job CI chạy bảy luật khi onehub đỏ luật cách ly (#321): chờ P3 hay cho một dòng đỏ đã ghim | 2 nhánh rẽ, mỗi nhánh 3 bước (S4 · CI · ngày 14) | `cho-hay-ghim.html` / `.png` |
| d-…-3 — soi một bước hàm phụ `this.*` | 2 bước nối tiếp (phương thức → hàm phụ) | dưới ngưỡng: 2 bước |
| d-…-1 — chỉ đo `list*` | 1 bước | dưới ngưỡng: 1 |
| d-…-2 — không đo nút giao diện | 1 bước | dưới ngưỡng: 1 |
| d-…-4 — nền AgentDefinition, không nền #321 | gộp vào hình P0 | — |

## Đề bài hình `cho-hay-ghim`

- Loại: luồng hai nhánh (decision tree).
- Gốc: «onehub đang đỏ luật cach-ly-hai-agent (#321)».
- Nhánh A «Chờ P3 sửa (máy khuyên)»: V2L dừng ở S4 với BLOCKED «chờ bản sửa #321» → P3 gộp bản sửa → S4 chạy, job CI xanh, không che vi phạm nào.
- Nhánh B «Cho đúng một dòng đỏ đã ghim»: E1 chấp nhận đúng dòng `DO cach-ly-hai-agent: apps/agent/test/giai-doan-agent.integration.spec.ts:4` → V2L đi tiếp S4 ngay → job CI vẫn đỏ ở onehub tới khi P3 sửa (CI không phân biệt dòng đã ghim).
- AC liên quan: AC-5, AC-8.
