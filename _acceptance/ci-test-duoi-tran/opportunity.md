---
schema_version: 1
slug: ci-test-duoi-tran
feature: Job «check-types, lint, test» của CI xong xa dưới trần 30 phút — bộ kiểm các gói chạy song song, mỗi nhóm một cơ sở dữ liệu riêng
owner: manh.phan@onemount.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T21:17:52Z
prototype:
  base_commit: b9e51ffa0
  disposition: archive
---

## Vấn đề & ai gặp

Job «check-types, lint, test» của `ci.yml` (trần `timeout-minutes: 30`, dòng 24) chạy 26.9–29.0 phút ở 7 trên 10
lượt xanh gần nhất (đo 07/10 bằng `gh run view`); bước `bun run test` chiếm 16.0–24.8 phút. Lần đầu CI của #301 bị
huỷ vì chạm trần. Người gặp: mọi PR vào `onehub` — một lượt bị huỷ là một lượt chạy lại và một lần trễ gộp.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bước test chậm vì các gói chạy nối tiếp (`--concurrency=1`, một CSDL chung), không vì một gói | Phải làm nhanh từng gói | Cộng thời gian «Ran …» theo gói từ log CI: tổng ≈ thời gian bước | Đã thử 07/10 — đúng (≈ 18 phút nối tiếp; api 7.1 dài nhất) |
| 3 | Máy CI của kho private có 2 vCPU, 7 GB (bảng máy chuẩn GitHub; log không in số nhân) — song song tối đa 2 nhóm vẫn rút đường găng từ ≈ 18 xuống ≈ 10.4 phút | Thu được ít hơn; cần làm nhanh api | Lượt CI của PR (E3) | Chưa thử |
| 2 | Bốn nhóm suite chạy song song an toàn khi mỗi nhóm có CSDL riêng | Đỏ chéo giữa nhóm | Làn ghim lại của kit đã chạy bốn nhóm này song song (`repin_parallel_suites: true`) | Có tiền lệ |

## Ngưỡng chết / ngưỡng UAT

Không đo được — việc nội bộ của CI, không có người dùng cuối; thước là thời gian job trên CI của chính PR (dưới 22 phút, so với 26.9–29.0).
