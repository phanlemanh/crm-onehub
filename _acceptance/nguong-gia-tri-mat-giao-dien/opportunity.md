---
schema_version: 1
slug: nguong-gia-tri-mat-giao-dien
feature: Mỗi hồ sơ có mặt giao diện chờ Cổng Giá trị có ngưỡng điền xong, để phiên nghiệm thu mở được
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F39
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F39 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` — chưa có trang: trang nền, mã F39
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Mỗi hồ sơ có mặt giao diện chờ Cổng Giá trị có ngưỡng điền xong, để phiên nghiệm thu mở được

Vì sao: start-scan 31/10: 78 hồ sơ mang cờ nguong-chua-chot; 51 hồ sơ có mặt giao diện (phụ lục B của docs/plan/don-dep-3110.md) — người dùng thật bấm vào được nên ngưỡng phải điền, không khai «không đo được». Ngưỡng còn trống thì skill uat-session từ chối mở phiên.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «start-scan không còn hồ sơ có mặt giao diện nào mang cờ nguong-chua-chot; mỗi ngưỡng do máy đề xuất mang nhãn [đề xuất] tới khi người chốt ở thẻ Cổng Bằng chứng của hàng này; không ngưỡng nào đổi sau khi đã có số đo» chưa?
- Kết quả nào là SỐNG: [đề xuất] start-scan không còn hồ sơ có mặt giao diện nào mang cờ nguong-chua-chot; mỗi ngưỡng do máy đề xuất mang nhãn [đề xuất] tới khi người chốt ở thẻ Cổng Bằng chứng của hàng này; không ngưỡng nào đổi sau khi đã có số đo
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «start-scan không còn hồ sơ có mặt giao diện nào mang cờ nguong-chua-chot; mỗi ngưỡng do máy đề xuất mang nhãn [đề xuất] tới khi người chốt ở thẻ Cổng Bằng chứng của hàng này; không ngưỡng nào đổi sau khi đã có số đo» khi hết timebox
- Timebox: …
