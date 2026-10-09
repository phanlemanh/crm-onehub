# Kế hoạch thi công — ca-chap-chon-con-lai

Design: `docs/superpowers/specs/2026-10-08-ca-chap-chon-con-lai-design.md`. Cổng 1 duyệt 2026-10-08T23:56:23Z, giữ AC-7; mở lại và duyệt lại 2026-10-09T07:52:08Z với AC-7 là phép canh hồi quy, không đổi `goi-soan.ts`.

1. **Khối tasks (AC-1, AC-2, AC-3 — E1, E3).** `apps/agent/test/tasks.integration.spec.ts`: `beforeAll` đọc
   `pg_class.reloptions` của `agentTask`, lưu, `ALTER TABLE … SET (autovacuum_enabled = false)`; `afterAll` đặt lại
   đúng giá trị đã lưu (`RESET` chỉ khi không có). Ca «autovacuum tat trong khoi»; khối «tra lai sau khoi»; khối «da tat
   tu truoc». Hai ca đối chứng: số hàng khác `rows` → ném «ke hoach doi» kèm EXPLAIN và thống kê đọc sau probe. Verify:
   `ccl_khoi_tasks`, `ccl_ca_that`. independent: true.
2. **`ma()` chỉ chữ cái (AC-4, AC-5 — E4, E5).** `apps/agent-okr/test/support/gieo.ts`: mã hoá cơ số 26 a–z cho giờ và bộ
   đếm. `rang/ma.ts`, `rang/dong-ho-26.ts`. Verify: `ccl_ma`, `ccl_goi_dong_ho`. independent: true.
3. **Canh việc gỡ id (AC-7 — E8).** Không đổi `goi-soan.ts`. Ca «id-trong-goi» trong `goi-soan.integration.spec.ts`: bản
   sao gói thật đổi id của mục tiêu cấp trên đầu tiên và ứng viên Căn chỉnh đầu tiên thành chuỗi mang dãy số, gói gốc
   phải chưa có các số đó. Verify: `ccl_id_trong_goi` và cả tệp `goi-soan.integration.spec.ts`. independent: true.
4. **Thước (E2, E6, E7).** `rang/pham-vi.mjs`, `rang/dot-bien.mjs` (6 cặp), `rang/lap.mjs`. independent: false (sau 1–3).
5. Năm lệnh của kho, `status: implemented`, xin khoá s4.
