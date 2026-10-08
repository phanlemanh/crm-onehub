---
schema_version: 1
slug: zalo-va-cach-ly
feature: Bài kiểm Zalo của apps/agent thôi nhập mã apps/app — luật cách ly hai agent của kho xanh trở lại
owner: manh.phan@onemount.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T20:49:30Z
prototype:
  base_commit: 0426cc9d0bebd747b1e75eacb3bcd4069ef161e1
  disposition: archive
---

## Vấn đề & ai gặp

`node scripts/luat-kho/do-cay.mjs --du-luat` đỏ trên `onehub` 0426cc9d0. Luật `cach-ly-hai-agent` bắt
`apps/agent/test/zalo-va.integration.spec.ts:7-8`, nơi test của `apps/agent` nhập `apps/app/lib/messages/*`
(từ R1g `zalo-va`, gộp 06/10). Lệnh đó là E27 của hồ sơ đã ký `soan-okr-cung-tro-ly`, nên làn ghim lại của
hồ sơ đó đỏ. Hệ quả: F13 (07/10, P4) và K2 (P1) không ghim lại được `soan-okr-cung-tro-ly` sau khi chạm spec
của nó. Người gặp: các phiên thợ của đợt `sau-14-10` và người ký Cổng Bằng chứng.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Dời ba bài «câu chào» xuyên ứng dụng sang test của `apps/app` giữ nguyên phép kiểm mà không phạm luật nào khác của `luat-kho` | Phải chọn giữa nới phép kiểm và dời nhãn sang một gói dùng chung | Đọc luật `cach-ly-hai-agent`: chỉ soi tệp trong app agent; `zalo-config.ts` không nhập gì | Đã thử 07/10 — đúng |

## Ngưỡng chết / ngưỡng UAT

Không đo được — việc nội bộ của bộ đo của kho, không có người dùng cuối; thước là `do-cay --du-luat` thoát 0 và làn ghim lại `soan-okr-cung-tro-ly` xanh.
