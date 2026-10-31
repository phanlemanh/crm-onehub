---
schema_version: 1
slug: thu-paths-e15-giai-doan
feature: "Đổi một tệp chữ khác không kéo hồ sơ giai-doan-thoa-thuan vào ghim lại: E15 chỉ theo dõi tệp chữ của màn giai đoạn"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-16T04:38:49Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F31
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Chủ kho gõ ở phiên giám sát đợt r2 lúc 2026-10-16T04:38:49Z: «Cổng Đáng thu-paths-e15-giai-doan: build»; giám sát chuyển hàng cho dãy P1.

Mở từ hàng F31 của «OKR» (`docs/plan/lo-trinh-okr.json`): Đổi một tệp chữ khác không kéo hồ sơ giai-doan-thoa-thuan vào ghim lại: E15 chỉ theo dõi tệp chữ của màn giai đoạn.

Phạm vi chủ kho thấy trước khi ký (giám sát chuyển lời 16/10):
1. E15 (ui-check) của `giai-doan-thoa-thuan`: `paths` `apps/app/lib/messages/**` thu về đúng tệp chữ của màn giai đoạn.
2. Gốc chung, do P0 tìm ra: `lib/evidence-core.cjs` `staleByPaths` (dòng 527–530). Một eval judgment không khai `paths` (chỉ có `inputs`) làm cả hồ sơ rơi về luật cũ (`eval-ngoai-may-thieu-paths`), nên tệp nào đổi cũng làm hồ sơ hoá cũ. Quét mọi `_acceptance/*/evals.yaml`, mỗi eval judgment thiếu `paths` thì thêm `paths` = đúng `inputs` của nó, không đổi thứ được đo. Hai hồ sơ đã biết: `thu-haiku-tro-ly-okr` E8, `ghim-thuoc-soi-xem-okr` E3. Đếm trước/sau bằng `scripts/pre-merge-check.sh` không `--base` (M5 đo trước: 242).
3. `paths` của `gioi-han-duyet-cay-okr`: rộng cả khu OKR của `apps/app`, thu về đúng tệp các thước của nó đọc.

Luật: hồ sơ đã ký bị chạm thì `cham-tep` trên #375 trước khi sửa, rồi ghim lại trong cùng PR. Không sửa `lib/evidence-core.cjs` (tệp của kit — báo kit riêng). Chạm hồ sơ MH1/F29 chỉ sau khi P0 gộp #436 và PR thu-haiku.

Người gặp: mọi phiên gộp vào `onehub` — đo 16/10 trên `onehub 34d31a8bf`, `pre-merge-check` không `--base` báo 245 hồ sơ hoá cũ, 49 trong đó vì bộ lọc paths không áp do `eval-ngoai-may-thieu-paths`. Mỗi PR chạm một hồ sơ như vậy (kể cả chỉ đổi một tệp chữ không liên quan) bị đòi ghim lại.

## Ngưỡng chết / ngưỡng UAT

- Không đo được — thước, CI hay công cụ nội bộ của kho (tooling); không có người dùng cuối để mở phiên nghiệm thu, phép thử là bài kiểm và lượt CI của chính hồ sơ.
