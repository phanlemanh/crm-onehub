# Kế hoạch: heap-lenh-dung

Hồ sơ: `_acceptance/heap-lenh-dung/` · Thiết kế: `docs/superpowers/specs/2026-10-05-heap-lenh-dung-design.md`

## Task 1 — nới heap cho bước dựng (đã có, 288a94e6)

- Files: `.github/workflows/acceptance.yml`
- Việc: `env: NODE_OPTIONS: --max-old-space-size=6144` cho bước `bun run build` của job `build`.
- Verify: `Bun.YAML.parse` đọc lại bước và in `env`.
- Phục vụ: E1 · independent: false

## Task 2 — thước E1 hai chiều

- Files: `_acceptance/heap-lenh-dung/rang/build-heap.mjs`, `_acceptance/config.yaml` (thêm khoá `executors.script.hld_build_heap`)
- Việc: đọc hai workflow bằng `Bun.YAML`, kiểm bước + ngưỡng + khớp `ci.yml`, xoá cache `.next`, dựng `app` bằng chính lệnh của bước.
- Verify (phá-thử, dưới khoá `s4` vì dựng nặng): bản sao `acceptance.yml` ở `.acceptance-runs/heap-lenh-dung/sao/` — (a) bỏ biến → mã 1 «khong khai NODE_OPTIONS»; (b) 2048 → mã 1 «khong vuot 2048»; (c) 3072 → mã 1 «khong khop ci.yml 6144»; (d) 1024 + `--bo-nguong` → mã 1 «het heap o 1024 MB»; tệp thật → mã 0 «XANH: heap 6144 MB».
- Phục vụ: E1 · independent: false (phụ thuộc Task 1)
