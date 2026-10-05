---
schema_version: 1
feature: "Job «lệnh dựng» của acceptance.yml nới heap Node cho bước bun run build, để next build không đổ ở trần 2 GB mặc định"
slug: heap-lenh-dung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-05
design_doc: docs/superpowers/specs/2026-10-05-heap-lenh-dung-design.md
---

# Acceptance Contract: heap-lenh-dung

## Context

Run Acceptance 37263692533 trên `onehub` e9f8ed2f đỏ ở job «lệnh dựng»: `bun run build` của `apps/app`,
bước type-check của Next, «Ineffective mark-compacts near heap limit», Mark-Compact dừng ở 2023 MB trên
trần 2048. Cùng job ấy xanh ở PR #268 vài chục phút trước — lượt dựng đang lắc sát trần, không phải hỏng
cố định. Cùng gốc với `check-types` của `ci.yml`, đã nới bằng `NODE_OPTIONS --max-old-space-size=6144` ở
#268 (308b3e28). `acceptance.yml` không thuộc `t1_skip_globs` («chính cổng nghiệm thu nên vẫn phải qua hồ
sơ»), và chủ kho chọn hồ sơ tối thiểu mới (05/10) thay vì vượt cổng hay mở lại `lenh-dung-do-khong-ai-thay`.

Source input: `opportunity.md` · run 37263692533 · PR #268 · `_acceptance/config.yaml` (chú thích `t1_skip_globs`)

## Criteria

- AC-1: Given job `build` («lệnh dựng») của `.github/workflows/acceptance.yml`, When đọc bước `run: bun run build` của nó và dựng `app` bằng chính lệnh của bước ấy dưới đúng `NODE_OPTIONS` khai ở bước ấy, trên cây không có cache `.next`, Then bước ấy là bước duy nhất trong job chạy `bun run build` và khai `NODE_OPTIONS` với `--max-old-space-size` lớn hơn 2048 MB (trần lượt đỏ của run 37263692533) và bằng đúng giá trị của bước `check-types` trong `ci.yml` (#268); lệnh dựng `app` dưới giá trị ấy thoát 0; còn cùng lệnh với `--max-old-space-size=1024` đổ vì `app:build` hết heap — chứng giá trị khai đi qua `turbo` tới tiến trình Next chứ không bị lọc.

## Coverage

Bỏ quét `morphological-scan`: bài toán một chiều — một bước, một biến, một lời hứa (dựng không hết heap) —
không có trục liệt kê. Trỏ entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`.

## Đường đo

- Ngưỡng «0 lượt lệnh dựng đổ vì heap tới 14/10»: số từ GitHub Actions — mọi run workflow `Acceptance`
  có job «lệnh dựng» từ lúc gộp tới hết 14/10 (`gh run list --workflow acceptance.yml`), lượt đỏ của job
  được đọc log và đếm dòng «heap out of memory» / «Ineffective mark-compacts». Không cần mã mới: công cụ
  có sẵn. Bảo đảm bởi AC-1 (giá trị khai tới được Next và đủ để dựng xong).
- Timebox trong ngày 05/10: ngày mở PR của lượt này, đọc từ GitHub.

## Out of scope

- Mọi bước và job khác của `acceptance.yml`, và `ci.yml` (đã nới ở #268).
- Giảm bộ nhớ type-check của `apps/app` hay đổi cách Next type-check — nới trần là chữa triệu chứng có chủ đích.
- Đổi runner GitHub lớn hơn, hay chia `turbo run build` thành nhiều job.

## Notes

- Phép đo chạy `--filter=app` chứ không cả `bun run build` của kho: lượt đỏ nằm ở `apps/app`, và dựng cả kho
  dưới hai heap tốn gấp đôi giờ máy mà không thêm điều gì cho lời hứa này.
- Máy Mac có heap mặc định khác runner Ubuntu, nên phép đo tại chỗ không tái hiện được lượt đỏ ở 2048; nó
  chứng hai điều tái hiện được — giá trị khai tới được Next, và đủ để dựng xong. Bằng chứng trên chính runner
  là job «lệnh dựng» của PR mang hồ sơ này, đọc ở PR.
