# Kế hoạch — dich-ten-nganh-bang-bang (VN1, T2)

Hợp đồng: `_acceptance/dich-ten-nganh-bang-bang/contract.md` (duyệt 17/10) · thiết kế:
`docs/superpowers/specs/2026-10-17-dich-ten-nganh-bang-bang-design.md`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Bảng tên Việt luôn phủ đủ danh sách ngành của nhà cung cấp | `apps/app/lib/ten-nganh.ts`, `apps/app/lib/ten-nganh.test.ts` | AC-1 (phủ bảng), AC-5 (giá trị lạ) |
| Đầu ngăn công ty hiện ngành tiếng Việt | `company-sheet.tsx` | AC-2 (đầu ngăn) |
| Cột «Ngành» hiện tiếng Việt, rê chuột đọc đủ | `companies-table.tsx` | AC-3 (cột bảng) |
| Bộ lọc «Ngành» mang nhãn tiếng Việt, lọc theo chữ gốc | `companies-table.tsx` | AC-4 (bộ lọc) |
| Ảnh chụp 24 ngành hai ngôn ngữ hai khổ | `_acceptance/dich-ten-nganh-bang-bang/rang/chup.mjs` | AC-7 (ảnh) |

## Task 1 — bảng + hàm + bài kiểm phủ bảng (TDD)

- Files: `apps/app/lib/ten-nganh.ts`, `apps/app/lib/ten-nganh.test.ts`
- Thứ tự: viết test trước (khối `phu-bang`, `ten-nganh`), chạy đỏ (mô-đun chưa có), rồi viết mô-đun.
- Verify: `cd apps/app && bun test ./lib/ten-nganh.test.ts` — xanh; phá thử: bỏ một khoá khỏi bảng trong
  bản sao → ca đỏ với thông điệp ghim (nằm sẵn trong test, chiều đỏ trên cùng danh sách rút được).
- Phục vụ E1, E2 · independent: false (task 2 dùng mô-đun)

## Task 2 — ba chỗ hiển thị + bài kiểm màn (TDD)

- Files: `apps/app/components/crm/record-sheet/company-sheet.tsx`,
  `apps/app/app/(app)/[slug]/companies/companies-table.tsx`, `apps/app/test/dich-ten-nganh-bang-bang.dom.tsx`
- Thứ tự: test DOM trước (khối `ac2`…`ac5`), chạy đỏ trên mã cũ, rồi sửa ba chỗ.
- Verify: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx`;
  `bun run check-types --filter=app`; bài kiểm cũ `tra-cuu-thuong-hieu-viet-nam.dom.tsx` vẫn xanh.
- Phục vụ E3, E4, E5, E6 · independent: false

## Task 3 — bàn chụp

- Files: `_acceptance/dich-ten-nganh-bang-bang/rang/chup.mjs` (theo khuôn `tra-cuu-thuong-hieu-viet-nam/rang/chup.mjs`;
  dựng công ty mẫu qua API của bàn đo nếu có đường, không thì ghi rõ giới hạn)
- Verify: `node --check`; chạy thật ở S4 qua `executors.script.dtn_chup`.
- Phục vụ E8 · independent: true (với task 2 về tệp, nhưng cần mã task 2 để ảnh đúng) → chạy tuần tự.
