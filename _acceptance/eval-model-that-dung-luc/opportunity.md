---
schema_version: 1
slug: eval-model-that-dung-luc
feature: Eval gọi model thật chỉ chạy khi đầu vào của nó đổi (prompt, model, dữ liệu mẫu), và chấm theo biên thống kê thay vì một ngưỡng cứng sát điểm đo
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07
prototype:
  base_commit:
  disposition:
---

Gốc: điều phối làn «lên trước 14/10», 05–06/10/2026 (`.acceptance-runs/dieu-phoi-1410/LUAT.md`). Cùng đợt với `kiem-cheo-sau-gop`.

## Vấn đề & ai gặp

Mỗi lượt ghim lại chạy lại mọi eval của hồ sơ, kể cả eval gọi model thật qua AI Gateway, dù prompt, model và dữ liệu mẫu không đổi. Hai hệ quả:

| Trục | Số |
| --- | --- |
| Token | Số dư AI Gateway 47,84 USD (05/10 05:10) → 32,51 USD (06/10 07:10); phần lớn tiêu cho lượt ghim lại và lượt dài, không phải cho tính năng mới |
| Lượt xuất hiện, thời gian | `tro-ly-doc-kho` E15 đỏ 2 lần trong một ngày vì sát ngưỡng: 50,0% rồi 79,2% với ngưỡng ≥ 80% (05/10 00:39, 05:09), lượt thứ ba xanh trọn; mỗi lần đỏ là một lượt ghim lại bỏ đi và một lượt `s4` nữa |
| Chẩn đoán | Lần đỏ 00:39 có 20 câu «loi» mà không còn biết gốc, vì nhật ký tác tử của phiên đo bị ghi đè mỗi lượt; lỗi đó bị quy oan cho Gateway 402 suốt một ngày |

**Người gặp:** các hồ sơ có eval model thật (Kho tài liệu, Trợ lý OKR, soạn OKR, Zalo); chủ kho trả tiền Gateway.

## Giả định chốt sinh tử

- Đầu vào của một eval model thật liệt kê được (tệp prompt, id model, bộ câu mẫu, mã gọi), nên băm được; băm không đổi thì dùng lại kết quả đã ký.
- Chấm theo n lượt và một biên (ví dụ cận dưới khoảng tin cậy ≥ ngưỡng) phản ánh lời hứa tốt hơn một lượt so với một con số, mà không tăng tổng token.
- Nhật ký tác tử của mỗi lượt đo được giữ theo `run_id`, không ghi đè.

## Câu hỏi mở cho Cổng Đáng

- Chủ kho chấp nhận «dùng lại kết quả đã ký khi đầu vào không đổi» cho eval model thật không, hay luôn đo lại trước mỗi lần gộp?
- Ngưỡng hiện có (ví dụ 80% của E15) giữ nguyên rồi thêm biên, hay đặt lại theo số đo nhiều lượt?
- Trần token cho một lượt ghim lại là bao nhiêu thì dừng hỏi?

## Hạng mục cùng lớp

`kiem-cheo-sau-gop`, `ca-chap-chon-cach-ly`, `thuoc-khong-tu-het-han`. Bộ nhớ đệm theo băm đầu vào cho mọi eval thuộc bộ kit, đi chip riêng.

## Quyết định Cổng Đáng

07/10/2026, chủ kho: «Đưa F9-F12 vào đợt» — `build`, làm trong dãy P4 của đợt `sau-14-10`. Các câu hỏi mở ở trên chuyển sang Cổng Phạm vi của vòng.
