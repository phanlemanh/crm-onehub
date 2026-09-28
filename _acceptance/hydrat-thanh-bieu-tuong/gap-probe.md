---
slug: hydrat-thanh-bieu-tuong
at: 2026-09-28T23:50:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Lý do bỏ ui-observed không đứng: 60 lượt tái hiện chạy trên kho không có dữ liệu OKR, trong khi thước canh-kr bắt được lỗi khi có dữ liệu; gốc lỗi mới là giả thuyết tái hiện bằng fixture viết tay | Gốc thật là đường khác, E1–E5 vẫn xanh, cổng ký «hết lỗi», bàn man-canh-kr tiếp tục lọc LOI_NGOAI mà không ai thấy | Eval ui-check trên phiên do:man có bộ OKR mẫu, tải N lượt trên bản cũ và bản mới, đếm lỗi hydrat có aria-busy hay AppIconRail; bản cũ 0/N thì ghi rõ trên thẻ | fixed: thêm AC-6 và E6u (rang/man-thanh.mjs, bộ OKR mẫu, hai vai, bốn màn, HTML máy chủ + Chrome + ảnh); bỏ entry «bỏ ui-observed». Chạy trên mã cũ: 0/64 lượt, HTML 8/8 sạch — ghi trong Notes của contract và trên thẻ: gốc được xác nhận ở lớp DOM, chưa trên ứng dụng thật |
| P1 | evals | Kênh bắt lỗi chỉ là onRecoverableError; React 19 báo lệch thuộc tính thuần qua console.error; không có đối chứng dương của kênh | Bản cài giữ cấu trúc nhưng lệch một thuộc tính, E1–E5 xanh mà màn thật đỏ | Theo dõi thêm console.error; thêm ca e0 đối chứng dương cho cả hai kênh | fixed: hydratCay nghe onRecoverableError và console.error lọc /hydrat or didn't match or Hydration/i; hai ca e0 (lệch cấu trúc, lệch một thuộc tính aria-busy) xanh và chạy kèm mọi lệnh htbt_e1..e5 |
| P1 | contract | Vế «máy chủ biết vai» không được đo qua đường thật layout.tsx → RailTheoVai; E6 chỉ bắt quên truyền prop | layout truyền null hoặc vai gõ cứng, kiểu vẫn hợp lệ, E1–E5 xanh, người vai okr nhận HTML 10 mục | Đọc HTML máy chủ thật trong phiên do:man cho admin và okr, đếm liên kết của thanh; chiều đỏ null và vai gõ cứng | fixed: bước HTML của E6u (hai vai × bốn màn); chiều đỏ 1 (workspace null) và 2 (vai admin gõ cứng) khai trong expected của E6u |
| P2 | evals | paths thiếu khung-dieu-huong.ts, pham-vi-man.ts, layout.tsx cho các eval dùng chúng [d-20260928T212318Z-7] | Vòng sau đổi MUC_RAIL hay luật vai, bằng chứng đã ký không bị đánh dấu hoá cũ | Bổ sung paths | fixed: thêm khung-dieu-huong.ts cho E1–E5, pham-vi-man.ts cho E3 E4, layout.tsx cho E1–E5 |
| P2 | evals | mock.module một phần có thể rò sang tệp .dom.tsx khác trong cùng tiến trình | test:dom đỏ theo thứ tự nạp | Chạy test:dom với --randomize nhiều seed | rejected: test:dom của apps/app chạy qua packages/ui/test/chay-tung-tep-dom.ts, mỗi tệp .dom.tsx một tiến trình bun riêng; bun test trần không nạp đuôi .dom.tsx |
