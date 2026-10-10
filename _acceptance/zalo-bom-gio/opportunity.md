---
schema_version: 1
slug: zalo-bom-gio
feature: «Bài kiểm Zalo webhook không còn đỏ theo giờ thật»
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:
decided_by:
decided_at:
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: P6 phát hiện khi đẩy K6d 2026-10-10 ~02:20Z (yeu-cau P6-32); giám sát mở hàng H5, ưu tiên 0, ngoại lệ luật 53 (chặn mọi lệnh đẩy và CI onehub). Anh duyệt «P6 sửa ngay» trong phiên P6.

## Vấn đề & ai gặp

`apps/agent/test/zalo-qua-webhook.integration.spec.ts` ghim `GOC = 2026-10-10T02:00:00Z` và gieo mã liên kết Zalo tại mốc đó; mã sống 15 phút (`ZALO_LIEN_KET.ma.songMs`). Hai bài «giao-khi-mo: vong tay bat duoc tin den o giay 30» và «kenh-route» đổi mã bằng giờ thật, nên từ 02:15Z hôm nay chúng đỏ tất định. `pre-push` chạy `bun run test`, nên mọi làn của đợt không đẩy được, và CI onehub đỏ. Sản phẩm không hỏng — chỉ bài kiểm dùng hai đồng hồ khác nhau.

## Ngưỡng chết / ngưỡng UAT

- Không đo được bằng người dùng — đây là bài kiểm. Phép thử là: bài kiểm xanh ở giờ thật hôm nay và ở mọi mốc GOC, và lệnh đẩy của làn khác qua được `pre-push`.

## Out of scope từ khám phá

- Đổi mã sản phẩm (`zalo-poll.ts`, route webhook, `zalo-lien-ket.ts`).
- Các tệp kiểm khác ghim ngày cố định (vd mốc tháng 11 của Trợ lý OKR) — hôm nay xanh; soát riêng nếu cần.
