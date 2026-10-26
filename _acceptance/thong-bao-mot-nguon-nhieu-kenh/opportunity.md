---
schema_version: 1
slug: thong-bao-mot-nguon-nhieu-kenh
feature: Người dùng CRM thấy thông báo nhận qua Zalo cũng nằm trong chuông, và tự chọn loại nào được đẩy qua kênh nào
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TB2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng TB2 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Người dùng CRM thấy thông báo nhận qua Zalo cũng nằm trong chuông, và tự chọn loại nào được đẩy qua kênh nào

Vì sao: Zalo và Slack đang là đường đi riêng của tác nhân; rẽ chúng từ cùng bản ghi thì đã đọc ở một nơi là đủ, và người dùng tự chọn để không bị nhiễu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Mọi thông báo đi qua Zalo trong hai tuần đều có bản tương ứng trong chuông; hành vi Zalo hiện có không đổi» chưa? (chốt bởi Manh Phan 2026-10-24)
- Kết quả nào là SỐNG: Mọi thông báo đi qua Zalo trong hai tuần đều có bản tương ứng trong chuông; hành vi Zalo hiện có không đổi
- Kết quả nào là CHẾT: chưa đạt «Mọi thông báo đi qua Zalo trong hai tuần đều có bản tương ứng trong chuông; hành vi Zalo hiện có không đổi» khi hết timebox
- Timebox: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33)
