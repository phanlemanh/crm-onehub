---
schema_version: 1
slug: thuoc-khong-tu-het-han
feature: Thước đo của hồ sơ đã ký neo vào mốc cố định của chính lượt đó, không so với origin/onehub hay merge-base, nên không tự đỏ khi các lượt sau gộp vào
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07
prototype:
  base_commit:
  disposition:
---

Gốc: điều phối làn «lên trước 14/10», 04–06/10/2026 (`.acceptance-runs/dieu-phoi-1410/LUAT.md`), cùng các PR sửa thước của phiên cloud #263–#266, #270–#273. Cùng đợt với `kiem-cheo-sau-gop`.

## Vấn đề & ai gặp

Một thước viết đúng cho vòng của chính nó, nhưng đo theo «nhánh đang xét» (`git diff origin/onehub`, `merge-base`, `git log … HEAD` theo slug), sẽ đỏ ở mọi lượt sau có chạm cùng tệp. Lượt sau phải trả một vòng ghim lại, một lượt dài hay một PR sửa thước, dù sản phẩm không hỏng.

| Thước | Biểu hiện |
| --- | --- |
| `ha-tran-thang-hoi-zalo` E7 | đòi `git diff origin/onehub` không chạm `_acceptance/hoi-crm-qua-zalo/**`; R1g chạm → đỏ |
| `slack-thieu-quyen-email` E10 | grep log theo slug từ a62adb16..HEAD; lượt sau nhắc slug → đỏ |
| `tra-loi-tin-nhac` E17 | so `CONTEXT.md` ở merge-base; sau khi onehub có câu đó → tự hết hạn (R1g đã vá trong hồ sơ) |
| Thước migration theo merge-base | thoát 2 sau khi gộp (bộ nhớ «thuoc-migration-tu-het-han») |
| ~15 hồ sơ trong tám PR cloud #263–#266, #270–#273 | «đo theo hiện trạng», «theo diff đo tại commit gộp», khai `paths` |

| Trục | Số |
| --- | --- |
| Lượt xuất hiện | ≥ 20 thước trong ~2 tuần; tám PR sửa thước còn mở 06/10 |
| Thời gian | R1g lượt dài 1 (~3 giờ 45 phút) đỏ chỉ vì ba thước trên; mỗi PR cloud cần gộp onehub và ghim lại riêng |
| Giá trị thu về | 0 lỗi sản phẩm; toàn bộ là chi phí bảo trì thước |

**Người gặp:** mọi phiên có diff chạm vùng của hồ sơ đã ký; người điều phối xếp tám PR sửa thước.

## Giả định chốt sinh tử

- Mọi thước «vòng này» viết được bằng mốc cố định ghi trong hồ sơ (sha commit gộp của lượt, commit đầu của hồ sơ), không cần ref nhánh — cũng chạy được trên CI nông.
- Một lần quét toàn kho tìm thước dùng `origin/onehub`, `merge-base`, `HEAD` theo slug đủ để liệt kê hết số còn lại.

## Câu hỏi mở cho Cổng Đáng

- Gộp tám PR cloud vào hạt giống này (một lượt, một lần ghim lại) hay để chúng merge lẻ trước?
- Thêm một luật quét (lint) chặn thước mới dùng ref nhánh ngay từ S2, đặt trong kho hay trong bộ kit?
- Thước «không chạm hồ sơ đã ký» (như E7 ở trên) còn cần khi đã có `kiem-cheo-sau-gop` không, hay bỏ hẳn?

## Hạng mục cùng lớp

`kiem-cheo-sau-gop`, `ca-chap-chon-cach-ly`, `eval-model-that-dung-luc`.

## Quyết định Cổng Đáng

07/10/2026, chủ kho: «Đưa F9-F12 vào đợt» — `build`, làm trong dãy P4 của đợt `sau-14-10`. Các câu hỏi mở ở trên chuyển sang Cổng Phạm vi của vòng.
