---
schema_version: 1
slug: kiem-cheo-sau-gop
feature: Kiểm «có làm hỏng hồ sơ đã ký khác không» chạy một lần sau mỗi lần gộp vào onehub (và mỗi đêm), không còn nằm trong lượt ghim lại của một hồ sơ
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

Gốc: điều phối làn «lên trước 14/10», đêm 05–06/10/2026 (`.acceptance-runs/dieu-phoi-1410/LUAT.md`, các dòng 05/10 21:50 → 06/10 07:xx). Chủ kho xếp giá theo ba trục: thời gian, token, số lượt xuất hiện; cả ba đều lớn mà giá trị thu về thấp.

## Vấn đề & ai gặp

E11 của `tra-loi-tin-nhac` (AC-9, script `rang/ho-so-cham.mjs`) dò mọi hồ sơ đã ký có `paths` chạm diff của nhánh, chạy lại toàn bộ eval máy của chúng (khoảng 30 hồ sơ, ~378 eval) cộng bốn suite, rồi chạy lại từng ca đỏ trên worktree ở merge-base. `paths` của E11 là `apps/**`, `packages/**`, `docs/**`, `CONTEXT.md`, nên **mọi** lần ghim lại `tra-loi-tin-nhac` đều trả trọn lượt này, dù chỉ đổi bốn dòng test.

Số đo (R1g `zalo-va`, ký Cổng 2 05/10 15:11):

| Trục | Số |
| --- | --- |
| Thời gian | Mỗi lượt E11 ~3 giờ 25 phút; R1g trả 1 lượt bị ngắt + 4 lượt dài ≈ **14 giờ máy**, trong ~17 giờ từ ký tới merge. Không có E11, mỗi lượt ghim R1g ~25 phút |
| Lượt xuất hiện | 5 lượt trong 05–06/10 cho một PR; khoá `s4` bị giữ gần trọn đêm, mọi phiên khác xếp hàng |
| Token | Lượt con chạy lại cả eval gọi model thật; số dư AI Gateway giảm 43,91 → 32,51 USD trong 05/10 17:20 → 06/10 07:10, phần lớn do các lượt dài R1g |
| Giá trị thu về | 0 hồi quy sản phẩm bắt được. Các lần đỏ: 3 thước sai, 1 ca chập chờn hạ tầng. Lỗi thật duy nhất của R1g do CI bắt trong 22 phút, lượt dài để lọt vì chạy với `.env` có khoá Zalo |

**Người gặp:** mọi phiên chạy tính năng chạm vùng Zalo/agent và người điều phối giữ hàng `s4`; gián tiếp là chủ kho, chờ tính năng lên production.

## Giả định chốt sinh tử

- Bắt hồi quy chéo **sau khi gộp** (rồi dò ngược commit gây lỗi) đủ an toàn cho kho này, vì production tự triển khai khi gộp nhưng một hồi quy giữa hai hồ sơ đã ký hiếm và sửa được bằng PR kế.
- Tách E11 khỏi hợp đồng `tra-loi-tin-nhac` là sửa hợp đồng đã ký: chủ kho duyệt AC-9 mới (lời hứa chuyển sang job chung), không coi là hạ chuẩn.
- Job chung chạy được trên CI (Acceptance trên onehub) hoặc trên máy ban đêm khi `s4` trống, không chặn PR nào.

## Câu hỏi mở cho Cổng Đáng

- Chạy ở đâu: workflow Acceptance sau mỗi lần gộp (CI, không tốn máy Mac) hay lượt đêm trên máy (đủ khoá, đủ model thật)?
- Khi job đỏ: tự mở PR revert, tự mở chip sửa, hay chỉ báo điều phối?
- Có giữ lại một bản rút gọn trong lượt ghim lại (chỉ hồ sơ có `paths` chạm **tệp mã sản phẩm** của diff, bỏ tệp test và `_acceptance/**`) không?

## Hạng mục cùng lớp

`ca-chap-chon-cach-ly`, `eval-model-that-dung-luc`, `thuoc-khong-tu-het-han` (hồ sơ cơ hội cùng đợt); phần sửa ở bộ kit đi chip riêng sang `~/dev/acceptance-gate-kit`.
