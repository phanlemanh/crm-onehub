---
schema_version: 1
slug: ngoai-le-telemetry-giai-doan
feature: Ngoại lệ telemetry của bảy mã giai đoạn gốc được khai và có thước canh
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-08T17:12:06Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Người sửa mã sau này. `docs/api.md` mục «Deal stages are rows» ghi `GIAI_DOAN_GOC` chỉ dành cho
seed và kiểm thử, và mọi mã sản phẩm rẽ nhánh theo một trong bảy mã gốc bị thước
`khong-re-theo-ten` của `giai-doan-thoa-thuan` bắt. Từ #321 (`deal-va`), `permittedDealStage` và
`DEAL_STAGE_KEYS` trong `packages/telemetry/src/allowlist.ts` dùng đúng hằng đó để giữ bảy khoá
gốc của số liệu ẩn danh `deals_by_stage` — thiết kế anh đã duyệt. Nhưng thước không quét
`packages/telemetry`, nên tài liệu nói một đằng, mã làm một nẻo, và một lần rẽ nhánh mới theo mã
gốc ở gói đó sẽ lọt qua không ai báo. Việc nội bộ, không có người dùng cuối.

Nguồn: Ngoài-7 của `deal-va`, S4 round 1–2 (2026-10-08); anh chọn «mở hợp đồng mới» ở Cổng Bằng
chứng 2026-10-08 — luật 26 của đợt sau-14-10 tính là Cổng Đáng `build` (dòng sổ d-20261008T171206Z-14).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Telemetry là ngoại lệ duy nhất cần dùng bảy mã gốc trong mã sản phẩm | thước sẽ cần một danh sách cho phép dài dần | thước hiện tại xanh trên mọi thư mục khác | Chấp nhận |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: một lần rẽ nhánh mới theo mã giai đoạn gốc ở gói telemetry, ngoài ngoại lệ đã khai, có bị thước bắt trước khi gộp không?
- Kết quả nào là SỐNG: thước `khong-re-theo-ten` đỏ khi bản sao chèn một mã gốc vào tệp telemetry bất kỳ (kể cả `allowlist.ts`), xanh trên cây thật; `docs/api.md` nêu đúng ngoại lệ này.
- Kết quả nào là CHẾT: thước vẫn xanh khi bản sao chèn `"CLOSED_WON"` vào một tệp dưới `packages/telemetry/src`.
- Timebox: lượt CI đầu tiên sau khi gộp; không cần phiên nghiệm thu (không có người dùng cuối).
