# Kế hoạch — ha-tran-thang-hoi-zalo

Hợp đồng: `_acceptance/ha-tran-thang-hoi-zalo/contract.md`. Thiết kế:
`docs/superpowers/specs/2026-09-27-ha-tran-thang-hoi-zalo-design.md`. Làm tuần tự; không
task nào `independent`.

## Task 1 — Test ghim 300, viết trước (phục vụ E1–E4)

- Files: `apps/agent/test/tran-thang-hoi-zalo.integration.spec.ts` (mới).
- Bốn ca: `gia-tri`, `bien-300`, `thang-vn`, `khong-tinh`, qua `hoiTacTu` với giờ cố định
  trong tháng 10/2026, số viết tay (299, 300, 301), dùng `support/hoi-gieo.ts` và
  `support/nhac-gieo.ts`.
- Verify: chạy trên hằng cũ (1.500) — `gia-tri`, `bien-300`, `thang-vn`, `khong-tinh` (vế gửi
  hỏng) phải đỏ với thông điệp ghim. `independent: false`.

## Task 2 — Đổi hằng (phục vụ E1–E4, E6)

- Files: `apps/agent/agent/lib/zalo-config.ts` (`tran.thang: 300`).
- Verify: `config:executors.test.tthz_*` và `config:executors.test.hcz_tran` xanh; phá-thử
  từng ca (đặt lại 1.500; đếm tháng theo UTC; đếm cả hàng `loi`) → đỏ đúng thông điệp.
  `independent: false`.

## Task 3 — Tài liệu và thước tài liệu (phục vụ E5)

- Files: `docs/agent.md` (mục Zalo), `docs/plan/lo-trinh-zalo.md` (dòng `4c`),
  `_acceptance/ha-tran-thang-hoi-zalo/rang/tai-lieu.mjs` (mới).
- Verify: `config:executors.script.tthz_tai_lieu` exit 0; bản sao có «1.500 câu mỗi tháng»
  → exit 1 đúng thông điệp. `independent: false`.

## Task 4 — Thước không chạm hồ sơ đã ký (phục vụ E7)

- Files: `_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs` (mới).
- Verify: exit 0 trên cây; thêm một dòng vào `_acceptance/hoi-crm-qua-zalo/contract.md` →
  exit 1 đúng thông điệp, rồi hoàn lại. `independent: false`.
