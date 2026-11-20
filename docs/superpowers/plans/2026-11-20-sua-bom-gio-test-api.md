# Kế hoạch — sua-bom-gio-test-api

Hồ sơ: `_acceptance/sua-bom-gio-test-api/` · T2 · Cổng Phạm vi duyệt 20/11/2026 (Phan Le Manh).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Bài soạn OKR gốc thấy cấu hình AI đã bật dù đồng hồ ghim về 10/11 | `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts` | AC-1 (suite 0 fail), AC-2 (chịu được giờ trôi) |
| Bài đếm chip góp ý không bị cấu hình giờ thật của bài khác che mất | `apps/api/test/gop-y-dung-cho.spec.ts` | AC-1, AC-2, AC-5 (trả lại cấu hình) |

## Task 1 — cmst-goc ghi lại chương trình dưới đồng hồ ghim

- Files: `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
- Việc: ở đầu `gieoCuocSoan`, gọi `okr.setProgram` với `{...CHUONG_TRINH_RONG, aiOn: true, aiSoanPhamVi: "toan-cong-ty"}`.
- Verify: `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/chu-may-sinh-ten-moi-goc.spec.ts"` → 0 fail.
- Phục vụ: E1, E2, E5, E6.
- independent: true

## Task 2 — gop-y-dung-cho chụp, tạm gỡ và trả lại cấu hình sau MOC_MAU

- Files: `apps/api/test/gop-y-dung-cho.spec.ts`
- Việc: nhập `MOC_MAU`; sau `batDauMau()` chụp `to_jsonb` các hàng `okrProgramConfig` có `createdAt > MOC_MAU` rồi
  xoá; ở `afterAll` sau `ketThucMau` chèn lại bằng `jsonb_populate_record`.
- Verify: `bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs` (lượt có hàng sót) → «XANH bom-gio».
- Phục vụ: E1, E2, E5, E6.
- independent: true

## Task 3 — đo trọn

- Verify: `bun run test -- --filter=api` → 0 fail · `bun run check-types` · `bun run lint` · `bun run lint:slop` · năm
  thước của hồ sơ (`bom_gio`, `bom_gio_doi_chung`, `bom_gio_pham_vi`, `bom_gio_khong_ha`, `vvc_ca_goi_api`).
- Phục vụ: E1–E6.
- independent: false

Hai task đầu độc lập nhưng mỗi task ba đến tám dòng — chạy tuần tự trong vòng chính, không tách worktree song song.
