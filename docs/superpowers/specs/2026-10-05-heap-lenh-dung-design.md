# heap-lenh-dung — nới heap cho bước dựng của acceptance.yml

Ngày: 2026-10-05 · Hồ sơ: `_acceptance/heap-lenh-dung/` · Hạng T2 · Mặt: ci

## Vấn đề

Job «lệnh dựng» (`build`) của `.github/workflows/acceptance.yml` chạy `bun run build` trên runner Ubuntu
với heap V8 mặc định. Run 37263692533 (onehub e9f8ed2f) đổ ở bước type-check của `next build` cho
`apps/app`: Mark-Compact 2023 MB trên trần 2048, «Ineffective mark-compacts near heap limit». Cùng job
xanh ở PR #268 trước đó ít phút, nên lượt dựng đang nằm sát trần và lắc theo lượt.

## Cách làm

Thêm `env: NODE_OPTIONS: --max-old-space-size=6144` cho đúng bước `bun run build` của job `build`. Cùng
giá trị với bước `check-types` của `ci.yml` (#268) — một con số cho cùng gốc lỗi trên cùng loại runner
(16 GB RAM). Không đổi bước nào khác.

`NODE_OPTIONS` phải đi qua `turbo`: kho chạy `turbo` 2.10.8 với `globalPassThroughEnv` liệt kê đích danh,
và `NODE_OPTIONS` không có trong danh sách. CI của #268 xanh sau khi nới (gợi ý biến có đi qua), nhưng đó
là suy từ một lượt xanh trên một job vốn lắc. Phép đo của hồ sơ chứng thẳng: dựng với heap 1024 phải đổ
vì hết heap — nếu `turbo` lọc biến, Next chạy heap mặc định của máy và không đổ.

## Phép đo

Một thước `_acceptance/heap-lenh-dung/rang/build-heap.mjs` (E1): đọc YAML bằng `Bun.YAML`, kiểm bước
và ngưỡng, rồi dựng `--filter=app --force` dưới giá trị đọc được. Ba chiều đỏ trên bản sao của chính
tệp workflow: bỏ biến, khai 2048, khai 1024 (bỏ ngưỡng, chỉ dựng).

## Bỏ

- Đặc tả UX: không chạm màn.
- Quét độ phủ: một chiều.
