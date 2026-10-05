---
schema_version: 1
slug: zalo-va
feature: «Zalo quá tải không bị báo token sai; bot chỉ đúng đường tới trang nhắc»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-05T06:38:47Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1g
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1g của «OKR» (`docs/plan/lo-trinh-okr.json`); khảo sát lộ trình 04/10 mục A7 (`.acceptance-runs/dieu-phoi-1410/nguon/khao-sat-lo-trinh/de-xuat-lo-trinh.md`).

«Zalo quá tải không bị báo token sai; bot chỉ đúng đường tới trang nhắc»

- **#26 — Zalo quá tải bị báo là token sai.** `docBot` ở `apps/agent/agent/lib/zalo-bot-xuong.ts` coi mọi mã 4xx (`ZALO.http.tuChoi` 400–499) là token sai, kể cả 408 (hết giờ) và 429 (giới hạn tốc độ). Quản trị dán token đúng vẫn bị báo «Zalo không nhận token này» khi Zalo chỉ tạm lỗi, và có thể thay một token đang tốt. Cùng lớp: `docBot` ở `zalo-bot.ts` gặp bất kỳ lỗi `getMe` nào là xoá tên bot và địa chỉ webhook (`ghiBot({ zaloBotName: null, zaloWebhookUrl: null })`), nên một lần mạng chập là trang Cài đặt báo bot tắt. Người gặp: quản trị nối bot Zalo, và mọi người nhận nhắc khi trang báo sai rồi quản trị gỡ nối.
- **#27 — Bot chỉ sai đường tới trang nhắc.** Câu chào của bot (`zalo-config.ts`, `loi.huongDan`) bảo mở «Cài đặt › Thông báo của bạn», trang đó đã bỏ; nơi nối Zalo nay là trang «Nhắc buổi sáng» (`/<slug>/reminders`, khối `KhoiZalo`). Người gặp: mọi người mới nhắn bot lần đầu — từ 26/10 là cả công ty.
- **Kèm:** `rang/nguong.ts` của `tra-loi-tin-nhac` lấy dấu vết tới `--den` + 24 giờ nhưng hàng nhắc chỉ tới `--den`, nên lần «xong» đúng ở ngày cuối kỳ bị đếm là đánh dấu nhầm (Ngoài-3 đã ghi); log khởi động `capabilities.ts` in «off Zalo reminders» theo biến `ZALO_BOT_TOKEN` dù bot đã nối qua Cài đặt và vẫn chạy.
- Ràng buộc: bot Zalo thật đang phục vụ người dùng — không gọi `setWebhook` hay `getUpdates` lên nó, chỉ dùng Zalo giả.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi giao, quản trị còn bị báo «token sai» hay thấy bot «tắt» khi Zalo chỉ tạm lỗi không; và người mới nhắn bot có tìm được chỗ nối Zalo không.
- Kết quả nào là SỐNG: trong hai tuần đầu R1 (26/10–09/11), 0 lần trang Cài đặt Zalo báo token sai hay xoá tên bot vì 408/429/5xx/lỗi mạng (đếm trên dấu vết lỗi getMe theo lớp lỗi); câu chào của bot trỏ đúng trang nhắc, và người mới nối được Zalo mà không phải hỏi ai.
- Kết quả nào là CHẾT: có dù một lần quản trị bị báo token sai khi token đúng và Zalo chỉ quá tải; hoặc một người mới làm theo câu chào mà không tới được chỗ nối Zalo.
- Timebox: một ngày công, xong trước 10/10 (hạn hàng R1g); đọc số 10/11 sau hai tuần R1.
