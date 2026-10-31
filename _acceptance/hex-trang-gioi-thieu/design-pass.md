---
slug: hex-trang-gioi-thieu
at: 2026-10-31T14:30:00Z
context: in-host
reaction: nac-1
---

# Design-pass — hex-trang-gioi-thieu

Bản bấm được: trang giới thiệu `/` thật, chạy trong phiên đo của cây (`IS_MARKETING=true`), bản nháp sau dựng bằng
đổi lớp ngay trên trang (`HTG_XEM_SAU=1`) và tiêm khai lại token cho `.dark` từ `globals.css`.

## Ma trận chụp

| Khổ | Nền máy khách | Trước (onehub 6ca59691a) | Bản nháp sau |
|---|---|---|---|
| 1280 | tối | evidence/truoc-1280.png | evidence/nhap-sau-1280.png |
| 375 | tối | evidence/truoc-375.png | evidence/nhap-sau-375.png |
| 1280 | sáng | .acceptance-runs (nền trắng, hỏng) | trùng nền tối, 0 điểm khác |
| 375 | sáng | .acceptance-runs (nền trắng, hỏng) | trùng nền tối, 0 điểm khác |

## Findings

- F1: cây gốc vẽ nền sáng khi máy khách đặt nền sáng; chữ `text-white` mất trên nền trắng. Sửa ở `globals.css`.
- F2: nhãn nhỏ (BUILT WITH, SUGGESTED, WHY, hạn việc) đổi từ xám 35–43% lên 63%; tương phản 2.87–4.12 → 7.66–8.13:1.
- F3: sao GitHub từ vàng `#E3B341` sang cam `warning`; lệnh «/Create agent» từ `#00805E` sang `#40be96`.
- F4: bản nháp sau, ngoài 16 hộp của 11 chỗ: 0 điểm khác ở cả hai khổ (đối chứng dương 19383 và 9048 điểm).

## Nấc

- Ngữ cảnh: in-host — trang thật trong phiên đo của cây.
- Phản ứng: nac-1 — không đồng bộ, gói ảnh đi kèm thẻ Cổng Phạm vi.
