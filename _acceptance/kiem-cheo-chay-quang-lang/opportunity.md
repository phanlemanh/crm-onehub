---
schema_version: 1
slug: kiem-cheo-chay-quang-lang
feature: Lượt kiểm chéo đêm không tranh khoá với đơn thợ, và chạy tiếp từ hồ sơ đang dừng thay vì đo lại từ đầu
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-10
prototype:
  base_commit:
  disposition:
---

Gốc: lượt kiểm chéo sau gộp đầu tiên của F9 `kiem-cheo-sau-gop` (đêm 10/10, `.acceptance-runs/kiem-cheo/lan-2026-10-10.log`).
Hàng F26 của đợt `sau-14-10` (dãy P4).

## Vấn đề & ai gặp

Đo đêm 10/10 (sha `d0ccad984`):

| Lỗi | Đo bằng | Hiện trạng |
| --- | --- | --- |
| Kiểm chéo giữ khoá `s4` của cả đợt | `scripts/dieu-phoi/lich.mjs` `xepHang` | đơn kiểm chéo mang `moc` đứng trước mọi đơn thợ chưa có mốc |
| Một đêm không đo hết | nhật ký làn | 7 suite 13′, 22/146 hồ sơ trong 80′, làn dừng ở trần (mã 4) |
| Dừng là mất | `scripts/kiem-cheo/dem.mjs` | mã 4 → «không chạy được», không lưu hồ sơ nào đã đo, đêm sau đo lại từ đầu |

**Người gặp:** thợ các dãy đứng chờ khoá `s4` trong lúc kiểm chéo chạy; anh không bao giờ nhận được kết quả trọn của một khoảng gộp.

## Giả định chốt sinh tử

- Nhật ký làn ghi đủ một dòng `[lane] <hồ sơ> <eval>: … → exit <mã>` cho mỗi eval đã chạy, theo đúng thứ tự hồ sơ được truyền.
- Hồ sơ đã đo trọn ở đỉnh `D` và không bị lần gộp mới chạm thì kết quả của nó còn đúng ở đỉnh sau.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: thợ có còn phải chờ khoá vì kiểm chéo không, và kiểm chéo có đo hết một khoảng gộp sau
  vài đêm không.
- Kết quả nào là SỐNG: trong 7 đêm sau khi gộp, 0 lần kiểm chéo được cấp khoá khi còn đơn thợ chờ; mỗi khoảng gộp
  được đo hết sau vài đêm nối nhau, không hồ sơ nào bị đo lại khi không bị chạm.
- Kết quả nào là CHẾT: một lần kiểm chéo nhận khoá trước đơn thợ, hoặc hai đêm liền đo lại cùng một hồ sơ không bị chạm.
- Timebox: gộp trước 01:00 ngày 11/10 (giờ launchd chạy kiểm chéo).

## Quyết định Cổng Đáng

10/10/2026 07:22 (giờ máy), chủ kho đồng ý đề nghị sau kiểm chéo lần 1 và giao P4 hàng F26 (sổ luật đợt `sau-14-10`, dòng 554).
Ngưỡng bỏ tiền tố «đề xuất» khi anh duyệt Cổng Phạm vi ngày 10/10 (luật 27 của đợt).
