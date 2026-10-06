---
schema_version: 1
slug: heap-lenh-dung
feature: "Job «lệnh dựng» của acceptance.yml không đổ vì hết heap ở next build"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-05T05:06:46Z           # ISO UTC
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Run Acceptance 37263692533 trên `onehub` e9f8ed2f đỏ ở job «lệnh dựng»: `bun run build` của `apps/app`,
type-check của Next, «Ineffective mark-compacts near heap limit» ở khoảng 2 GB. Job này chạy trên mọi PR
vào `onehub`. Đỏ ở đây làm mọi phiên trong làn «lên trước 14/10» phải đọc lại log mới biết PR của mình có
hỏng thật hay không, và luật merge «CI xanh» của điều phối không đi được. Cùng gốc với `check-types` của
`ci.yml`, đã nới ở PR #268.

Ai gặp: mọi phiên P1–P6 và phiên điều phối khi merge; chủ kho khi đọc CI.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi gộp, job «lệnh dựng» trên `onehub` và trên các PR có còn đổ vì hết heap không?
- Kết quả nào là SỐNG: 0 lượt «lệnh dựng» đổ vì heap trên `onehub` và các PR mở sau khi gộp, tới 14/10.
- Kết quả nào là CHẾT: còn một lượt «lệnh dựng» đổ với «heap out of memory» sau khi gộp — nới trần chưa đủ, phải chia job hoặc giảm bộ nhớ type-check.
- Timebox: trong ngày 05/10; một giờ máy, không tính chờ khoá s4.
